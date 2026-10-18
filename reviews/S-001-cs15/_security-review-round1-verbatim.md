Verdict: PASS with notes

**For the owner:** The notification workflow is set up as the spec says. Its secrets reach only the one step that sends. Only this repository's own runs are let in, and the sender runs only from main's code with no login token left on disk. Every outside action is locked to the exact commit its version tag names (I checked each against GitHub). The workflow has no pull-request trigger, and no `run:` line uses a `${{ }}` expression. The one weakness is in the guard that re-checks these workflow files on every pull request. A later edit that let a stranger's copy of the repository start the workflow would still pass that guard. That would not leak anything today, because the sender itself re-checks where the run came from before it reads any secret, and it runs only main's code. Still, the guard should be tightened before it is relied on. The rest are small notes.

What I ran (in /home/user/sd-cs15 at c5fc09c, which I left unchanged):
- `python3 .github/scripts/test_desk_notify_check.py`: 19 tests, OK.
- `python3 .github/scripts/desk_notify_check.py`: PASS.
- actionlint 1.7.12 (installed in a scratch venv) on desk-notify.yml, desk-notify-ready.yml and desk-build.yml: clean.
- `git ls-remote` for each pin: checkout v4.4.0 = 11d5960a…, setup-node v6.5.0 = 24997072…, upload-artifact v4.6.2 = ea165f8d…, all matching their comments. setup-node v6.5.0's action.yml has the `package-manager-cache` input, and Node 22.22.0 exists.
- surface_guard on `origin/main..c5fc09c`: OK. The author is `chief-of-staff@agents.invalid` with an `Agent-Session:` trailer and no `Spec:` trailer, as CS15 asks.
- My probes are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/cs15/probe/ (gate.py, yaml.py) and on a modified copy in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/cs15/copy/.

## Checked against Workflow 3 word for word, and found sound
- **Triggers:** the seven workflows with `completed` and `requested`, `push` to main, the cron `2-59/5 * * * *`, and `workflow_dispatch` with a `test` input. There is no `pull_request` and no `pull_request_target`.
- **Permissions:** exactly the six.
- **The job:** `environment: notify`; concurrency on the job (`desk-notify`, `cancel-in-progress: false`) and none at workflow level; `timeout-minutes: 10`.
- **The gate** (.github/workflows/desk-notify.yml:53–63): the same clauses as the spec, with the switch first.
- **Checkout:** the default branch, `fetch-depth: 0`, `persist-credentials: false`.
- **Setup and the Send step:** one exact Node version and no install step. Secrets appear only in the Send step's `env:` (:88–96). The step runs `node src/notify/run.mjs --project Service-Desk`, which matches run.mjs's arguments and its defaults for `--root` and `--out`.
- **Env names:** they equal secrets.mjs's. `GITHUB_REPOSITORY_ID`, `GITHUB_EVENT_NAME` and `GITHUB_API_URL` are runner defaults, so they reach the program without being mapped.
- **The upload** (:101): `hashFiles('desk-notify-state/state.json') != ''`, with `success()` implied, so a run that exits 1 or 2 uploads nothing. The `path: desk-notify-state/` puts exactly state.json and state.sig at the artifact's root, which is what the sender's zip reader expects. Retention is 7 days.
- **The ready workflow:** `permissions: {}`, no checkout, no secret, no Environment, and one step that runs `true`.
- **desk-build:** it runs the check and its test on every pull request, before the build.
- **The check's YAML reader:** it fails closed on duplicate keys, merge keys, anchors, tags, tabs, unsupported escapes (`\x24` cannot hide a `${{`) and a second document. Its evaluator refuses function calls, indexes and contexts it does not model.
- **The fixtures:** they are exactly the spec's list of 16, and each fails with its own reason only.

## Findings
1. **Note (fix recommended): the gate check can be passed by a gate that admits a fork.**
   - **Where:** .github/scripts/desk_notify_check.py:600–666 (`gate_contexts` and `check_gate`).
   - **What is wrong:** the check claims to evaluate the gate, but it tries only a fixed set of values: one fork (`someone/Service-Desk`), the branches `main` and `feature`, the conclusion `success`, and the owners `owner` and `someone`. Any extra clause comparing against some other literal is never exercised. Against the check's own text ("fails when … the gate admits a triggering event beyond those above"), that is a miss.
   - **How it shows:** I added `|| github.event.workflow_run.head_repository.full_name == 'mallory/Service-Desk'` to the gate in a copy. The check prints PASS, its 19 tests pass, and actionlint is clean. The same holds for `conclusion == 'failure'`, `head_branch == 'release'` and `owner.login == 'mallory'` (gate.py).
   - **Why it is not blocking:** the shipped gate is correct by reading. Even with such a gate, the admitted run executes main's file and main's sender, which rejects a foreign triggering run through REST before reading any secret (src/notify/sender.mjs:44–58). Nothing from the fork runs.
   - **Fix:** add every literal in the parsed expression, plus a fresh value, to each path's set of tried values. Or require the gate's text, with spaces normalised, to equal Workflow 3's.
2. **Note: the check runs the pull request's own copy of itself.** desk-build runs `.github/scripts/desk_notify_check.py` from the PR's head, so a PR that edits the check and the workflow together passes. `.github/**` is R3 and in the Chief of Staff's lane, so the owner's review is the control. Running the base branch's copy as well would close it.
3. **Note: things outside the spec's check list that the check does not hold.** In a copy, each of these still passes (yaml.py):
   - removing the upload step's `if:` (the spec's Steps say "upload … only if the program wrote it");
   - a job `container:`;
   - a step `shell:` override;
   - extra commands chained after the sender in the Send step's `run:` (for example `; env | curl …`);
   - job-level `env:` holding event values.

   None is in the spec's "fails when" list, and each needs a reviewed change on main (the stated limit in Risks). Pinning the upload condition and the Send step's exact `run:` would be cheap additions.
4. **Note: same-name workflows on branches start extra runs.** `workflow_run.workflows` matches by name, so a same-repository branch that defines a workflow named like one of the seven (on `push`, say) starts admitted desk-notify runs. They run main's code, use nothing from the triggering run, and are queued one at a time, so the only cost is runs (free in a public repository). Fork look-alikes are gated out. This matches the author's own reading.
5. **Note: `workflow_run.path` equality.** If GitHub ever puts an `@ref` suffix on the payload's `path`, asks-merge's own `workflow_run` runs are not admitted. That fails safe, into the 5-minute check. EXP-006 case 10 should record the field.
6. **Note: the checkout's `ref` on schedule runs.** `${{ github.event.repository.default_branch }}` (:75) may be empty on `schedule` runs, if that event's payload has no `repository` object (I did not confirm whether it does). actions/checkout would then fall back to the event's own ref and commit, which for a schedule is the default branch, so it is still main. The same pattern is already in asks-merge.yml.
7. **Note: Node is a few patch releases behind.** 22.22.0 is several releases behind the current 22 line (22.23.3 on nodejs.org). The spec asks only for one exact version; moving the pin is a later reviewed change.

## Open questions
- `head_repository.full_name` in the payload still rests on observation, not a cited source. EXP-006 case 10, and the sender's REST second signal, cover it.
