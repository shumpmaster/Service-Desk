#!/usr/bin/env bash
# check_all.sh [ROOT] [BASE_REF] [PR]
# check_all.sh --list-checks
# Runs every governance check (docs/archive/OPERATING_MODEL_v2.5.1.md section 9) against ROOT
# (default: the current directory). Every step runs even when an earlier one
# fails; the script exits non-zero if any step failed.
#   BASE_REF  adds the commit-range walk (BASE_REF..HEAD), the ledger's
#             append-only comparison, the frozen-spec, spec-predates and facts
#             checks, and the sprint-scope check.
#   PR        with BASE_REF, checks that PR's required review verdicts
#             (reviews/PR/) instead of only linting them.
#   GOV_BRANCH (environment) is passed to the range walk as --branch.
#   GOV_DEFAULT_BRANCH (environment) is passed to the scope check as
#             --default-branch (model S-005 AC3).
#   governance/v3.toml (model S-009), when present under ROOT, switches on the v3
#             checks: v3_checks ready, trace and joins, and with BASE_REF
#             v3_checks scope, freeze and holdouts. Sprints are retired there,
#             so the sprint-based scope step does not run (v3_checks scope
#             replaces it). Without the file the steps are as before. There the
#             Orchestrator's record checks run too (model S-013 AC1): with BASE_REF
#             record_checks decisions and merges (merges with --branch GOV_BRANCH),
#             and always record_checks routing, build-cap and grants.
#   GOV_SUMMARY_DIR (environment, model S-004 AC2), when set, makes this script
#             write DIR/steps.json (each step's name and exit code) and pass
#             --summary-json DIR/review.json to `review_check pr`. The output
#             is unchanged.
# A check set to warn-only in governance/enforcement.toml (model S-003) still
# runs and prints WARN: lines; its step is summarised as WARN and doesn't fail.
# --list-checks prints the check names that file may use.
# The Python tools are found next to this script, so it works both in the
# operating-model repo (tools/) and in a generated project (governance/checks/).

set -u

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY="${PYTHON:-python3}"

if [ "${1:-}" = "--list-checks" ]; then
  exec "$PY" "$HERE/govlib.py" list-checks
fi
ROOT_ARG="${1:-.}"
BASE="${2:-}"
PR="${3:-}"
GOV_BRANCH="${GOV_BRANCH:-}"
GOV_DEFAULT_BRANCH="${GOV_DEFAULT_BRANCH:-}"
GOV_SUMMARY_DIR="${GOV_SUMMARY_DIR:-}"

if ! ROOT="$(cd "$ROOT_ARG" 2>/dev/null && pwd)"; then
  echo "ERROR: root directory '$ROOT_ARG' does not exist" >&2
  exit 2
fi

# model S-009 AC1: the switch file's presence turns on the v3 steps; its content is not read.
V3=0
if [ -f "$ROOT/governance/v3.toml" ]; then
  V3=1
fi

if [ -n "$GOV_SUMMARY_DIR" ]; then
  mkdir -p "$GOV_SUMMARY_DIR"
  rm -f "$GOV_SUMMARY_DIR/steps.json" "$GOV_SUMMARY_DIR/review.json"
fi

failed=0
summary=()
step_record=()  # name, exit code, name, exit code, ... for steps.json
STEP_OUT="$(mktemp)"
trap 'rm -f "$STEP_OUT"' EXIT

run_step() {
  local label="$1"
  shift
  echo "== $label"
  "$@" | tee "$STEP_OUT"
  local rc=${PIPESTATUS[0]}
  step_record+=("$label" "$rc")
  local warn
  warn="$(grep '^WARN-ONLY: ' "$STEP_OUT" | tail -n 1)"
  if [ "$rc" -eq 0 ] && [ -n "$warn" ]; then
    # "WARN-ONLY: n finding(s), warn-only per L-nnnn"
    summary+=("WARN  $label (${warn#WARN-ONLY: })")
  elif [ "$rc" -eq 0 ]; then
    summary+=("PASS  $label")
  else
    summary+=("FAIL  $label (exit $rc)")
    failed=1
  fi
}

run_step "surface_guard check" "$PY" "$HERE/surface_guard.py" check --root "$ROOT"
if [ -n "$BASE" ]; then
  range_args=(diff --range "$BASE..HEAD" --root "$ROOT")
  if [ -n "$GOV_BRANCH" ]; then
    range_args+=(--branch "$GOV_BRANCH")
  fi
  run_step "surface_guard diff --range $BASE..HEAD" "$PY" "$HERE/surface_guard.py" "${range_args[@]}"
fi
if [ -n "$BASE" ]; then
  run_step "ledger_check check (append-only against the base ref)" \
    "$PY" "$HERE/ledger_check.py" check --root "$ROOT" --base "$BASE"
else
  run_step "ledger_check check" "$PY" "$HERE/ledger_check.py" check --root "$ROOT"
fi
run_step "digest check" "$PY" "$HERE/digest.py" check --root "$ROOT"
run_step "governance_checks all" "$PY" "$HERE/governance_checks.py" all --root "$ROOT"
if [ -n "$BASE" ] && [ -n "$PR" ]; then
  review_args=(pr "$PR" --base "$BASE" --root "$ROOT")
  if [ -n "$GOV_SUMMARY_DIR" ]; then
    review_args+=(--summary-json "$GOV_SUMMARY_DIR/review.json")
  fi
  run_step "review_check pr $PR" "$PY" "$HERE/review_check.py" "${review_args[@]}"
else
  run_step "review_check lint" "$PY" "$HERE/review_check.py" lint --root "$ROOT"
fi
run_step "spec_check status" "$PY" "$HERE/spec_check.py" status --root "$ROOT"
if [ -n "$BASE" ]; then
  run_step "spec_check frozen --base $BASE" "$PY" "$HERE/spec_check.py" frozen --base "$BASE" --root "$ROOT"
  run_step "spec_check predates --base $BASE" "$PY" "$HERE/spec_check.py" predates --base "$BASE" --root "$ROOT"
  run_step "spec_check facts --base $BASE" "$PY" "$HERE/spec_check.py" facts --base "$BASE" --root "$ROOT"
  if [ "$V3" -eq 1 ]; then
    v3_scope_args=(scope --base "$BASE" --root "$ROOT")
    if [ -n "$GOV_DEFAULT_BRANCH" ]; then
      v3_scope_args+=(--default-branch "$GOV_DEFAULT_BRANCH")
    fi
    run_step "v3_checks scope --base $BASE" "$PY" "$HERE/v3_checks.py" "${v3_scope_args[@]}"
    run_step "v3_checks freeze --base $BASE" "$PY" "$HERE/v3_checks.py" freeze --base "$BASE" --root "$ROOT"
    run_step "v3_checks holdouts --base $BASE" "$PY" "$HERE/v3_checks.py" holdouts --base "$BASE" --root "$ROOT"
    run_step "record_checks decisions --base $BASE" "$PY" "$HERE/record_checks.py" decisions --base "$BASE" --root "$ROOT"
    merges_args=(merges --base "$BASE" --root "$ROOT")
    if [ -n "$GOV_BRANCH" ]; then
      merges_args+=(--branch "$GOV_BRANCH")
    fi
    run_step "record_checks merges --base $BASE" "$PY" "$HERE/record_checks.py" "${merges_args[@]}"
  else
    scope_args=(scope --base "$BASE" --root "$ROOT")
    if [ -n "$GOV_DEFAULT_BRANCH" ]; then
      scope_args+=(--default-branch "$GOV_DEFAULT_BRANCH")
    fi
    run_step "governance_checks scope --base $BASE" "$PY" "$HERE/governance_checks.py" "${scope_args[@]}"
  fi
fi
if [ "$V3" -eq 1 ]; then
  run_step "v3_checks ready" "$PY" "$HERE/v3_checks.py" ready --root "$ROOT"
  run_step "v3_checks trace" "$PY" "$HERE/v3_checks.py" trace --root "$ROOT"
  run_step "v3_checks joins" "$PY" "$HERE/v3_checks.py" joins --root "$ROOT"
  run_step "record_checks routing" "$PY" "$HERE/record_checks.py" routing --root "$ROOT"
  run_step "record_checks build-cap" "$PY" "$HERE/record_checks.py" build-cap --root "$ROOT"
  run_step "record_checks grants" "$PY" "$HERE/record_checks.py" grants --root "$ROOT"
fi
run_step "surface_guard charters --check" "$PY" "$HERE/surface_guard.py" charters --check --root "$ROOT"

if [ -n "$GOV_SUMMARY_DIR" ]; then
  # [{"name": ..., "exit": ...}, ...] on one line. A failure here leaves no steps.json,
  # which the owner-signal job reads as "no summary".
  "$PY" -c '
import json, sys
a = sys.argv[2:]
steps = [{"name": a[i], "exit": int(a[i + 1])} for i in range(0, len(a), 2)]
with open(sys.argv[1], "w", encoding="utf-8") as fh:
    fh.write(json.dumps(steps, separators=(",", ":")) + "\n")
' "$GOV_SUMMARY_DIR/steps.json" "${step_record[@]}" || rm -f "$GOV_SUMMARY_DIR/steps.json"
fi

echo "== Summary"
for line in "${summary[@]}"; do
  echo "$line"
done
if [ "$failed" -ne 0 ]; then
  echo "Governance checks FAILED."
  exit 1
fi
echo "OK: all governance checks passed."
