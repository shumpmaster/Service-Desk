#!/usr/bin/env bash
# desk_pick_commit — checks out the one commit a desk-deploy job deploys (spec S-001, R4-B1, R5-B1).
#
# A push run deploys PUSH_SHA (github.sha). A workflow_dispatch run deploys INPUT_SHA (inputs.sha,
# passed through env:, never interpolated into the shell). Either way the commit is deployed only
# when all three hold:
#   1. it is 40 lowercase hex characters;
#   2. it is an ancestor of origin/main, so the commit is on main;
#   3. nothing deployable differs between it and origin/main (src, .github/workflows,
#      .github/deploy-tools, .github/scripts), so a superseded run can't put older code back.
# origin/main is fetched fresh first. GH_TOKEN is used for that fetch only, masked, as a header
# passed through GIT_CONFIG_* on the one command, and is never written to .git/config.
# Writes sha=<commit> to GITHUB_OUTPUT.
set -euo pipefail

case "${EVENT_NAME:-}" in
  push) SHA="${PUSH_SHA:-}" ;;
  workflow_dispatch) SHA="${INPUT_SHA:-}" ;;
  *)
    echo "::error::desk-deploy runs only on push and workflow_dispatch (got '${EVENT_NAME:-}')."
    exit 1
    ;;
esac

if ! printf '%s' "$SHA" | grep -Eqx '[0-9a-f]{40}'; then
  echo "::error::The commit to deploy must be a full 40-character lowercase commit id."
  exit 1
fi

AUTH="$(printf 'x-access-token:%s' "${GH_TOKEN:?}" | base64 -w0)"
echo "::add-mask::$AUTH"
GIT_CONFIG_COUNT=1 \
  GIT_CONFIG_KEY_0="http.https://github.com/.extraheader" \
  GIT_CONFIG_VALUE_0="AUTHORIZATION: basic $AUTH" \
  git fetch --no-tags origin +refs/heads/main:refs/remotes/origin/main
unset AUTH

if ! git cat-file -e "$SHA^{commit}" 2>/dev/null; then
  echo "::error::$SHA is not a commit in this repository."
  exit 1
fi
if ! git merge-base --is-ancestor "$SHA" origin/main; then
  echo "::error::$SHA is not on main."
  exit 1
fi
if ! git diff --quiet "$SHA" origin/main -- src .github/workflows .github/deploy-tools .github/scripts; then
  echo "::error::Deployable files changed on main after $SHA; deploy the newer reviewed merge commit instead."
  git diff --stat "$SHA" origin/main -- src .github/workflows .github/deploy-tools .github/scripts
  exit 1
fi

git checkout --quiet --detach "$SHA"
test "$(git rev-parse HEAD)" = "$SHA"
echo "Deploying commit $SHA"
echo "sha=$SHA" >> "$GITHUB_OUTPUT"
