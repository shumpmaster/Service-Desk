# Setup — what the owner does once per project (S-015 AC13, S-016)

The Orchestrator runs in GitHub Actions (`.github/workflows/orchestrator.yml`). Before its first
run, set up the following in the project repository's Settings.

1. **Where the token lives (S-016 AC5, D-078).** Choose the mode with the repository variable
   `TOKEN_ENVIRONMENT` (Settings → Secrets and variables → Actions → Variables). Until it is set,
   every run refuses.
   - **Environment mode** (recommended; needs GitHub Pro, Team or Enterprise for a private
     repository): create the Environment `sessions` (Settings → Environments → New environment),
     set its deployment branches to the default branch only, add the secret
     `CLAUDE_CODE_OAUTH_TOKEN` to that Environment, delete any repository-level secret of the same
     name, and set `TOKEN_ENVIRONMENT` to `sessions`. A run refuses while a repository-level
     secret of that name still exists.
   - **Repository mode** (an accepted risk): keep the token as a repository secret and set
     `TOKEN_ENVIRONMENT` to the word `repository`. Anyone with write access could run a branch
     copy of the workflow and read the token, and nothing detects a later change of mode.

   Paste the token only into GitHub's secret field: never into a chat, a file, an issue or a log.
2. **The models (S-016 AC1, L-0097).** Create eight repository variables, each holding a full
   model id (not an alias): `MODEL_DEFINER`, `MODEL_CHECK_AUTHOR`, `MODEL_BUILDER`,
   `MODEL_SOURCE_CHECKER`, `MODEL_REVIEWER`, `MODEL_CRITIC`, `MODEL_RESEARCHER`,
   `MODEL_INPUT_READER`. A checker must run on a different model from the role it checks
   (D-056): critic from definer and check-author, check-author from builder, reviewer from builder,
   source-checker from researcher. If no alternative exists, record the exception in
   `decisions/model-waivers.md`, one line per pair, exactly `<checker role> <doer role>: <reason>`
   (for example `reviewer builder: only one model available this month`); a waiver for `critic`
   also covers Triage.
3. **Pushes and merges to the default branch (S-013, D-079).** The loop commits status, the
   dispatch log, the queue and outcomes to the default branch, and merges finished items into it
   through its merge gate, with the repository's own token. Leave any branch rule that requires
   pull requests off for the default branch: the gate runs every check before merging, a
   governance run re-checks every push, and while that run is red, missing or still running the
   loop starts no new sessions (your stop and drop decisions still apply). The workflow's own
   token cannot push `.github/**`, so an item that changes workflow files is merged by you by hand;
   the gate raises a card saying so. If the project gains collaborators, revisit a GitHub App.
   `.github/workflows/governance.yml` runs the governance checks on every push and pull request,
   and when the Orchestrator starts it after a push. It uses the runner's own Python (3.11 or newer
   is needed; GitHub's Ubuntu 24 runners carry 3.12), since no pinned setup action is recorded.
4. **Sessions run commands (D-077, S-016 AC2).** `session_commands` is `"on"` in
   `governance/RUNNER.toml`, but commands run only while the pinned Claude Code version and the
   runner image match the last passing proof (`proven_version`, `proven_image_os`,
   `proven_image_version`, matched by the image version's month). Run
   `.github/workflows/scrub-proof.yml` by hand from the Actions tab each month and before any
   Claude Code update; when it passes, record the runner values its summary prints in
   `RUNNER.toml` by a rule change. Until then sessions simply run without commands. The session
   jobs install `bubblewrap` and `socat`. Leave `pass_env_cleared = false` unless a proof run that
   searched those variables' values passed.

## What the proof does
The proof runs from the default branch only (in environment mode). Its first job, the guard,
refuses on an unset `TOKEN_ENVIRONMENT` or a leftover repository secret. Its sandbox part runs
before any step that holds the token: as positive controls it writes a line `S016_PROBE=1` to
`$GITHUB_ENV`, the home folder, `$RUNNER_TEMP/boot` and the end of the checked-out
`tools/session_runner.py` (a harmless, valid line), and connects to the Docker socket (the path
`DOCKER_HOST` names when it is a `unix://` address, else `/var/run/docker.sock`); then it checks
that a builder's test code, inside the check-run sandbox, can do none of those. It needs a runner
with Docker and the runner user in the docker group, as GitHub-hosted runners are; elsewhere it
fails, which is safe.

## Accepted limits (S-016, S-013)
- A token piece shorter than 12 characters, split across file names, is not caught by the name
  leak checks.
- Builder code in the check run can read, but not write, the runner's files.
- The bootstrap `tar -xf` runs before the member cap; it is gated by the plan's hash.
- Git author names and commit dates can be set by anyone holding a push credential; the record
  checks trust them.

## Pinned actions
Every `uses:` in the workflows names a commit (the pins are recorded in the operating-model
repository, docs/trials/action-pins.md): actions/checkout v4.4.0
`11d5960a326750d5838078e36cf38b85af677262`, actions/upload-artifact v4.6.2
`ea165f8d65b6e75b540449e92b4886f43607fa02`, actions/download-artifact v4.3.0
`d3f86a106a0bac45b974a628896c90dbdf5c8093`. The `apt-get` packages and the `npm` install are
pinned by name and version only.

Nothing else is needed: the workflow starts on its schedule, on pushes that change `decisions/`
or `intake/`, or by hand.
