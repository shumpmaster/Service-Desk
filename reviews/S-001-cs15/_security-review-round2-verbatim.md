Verdict: PASS with notes

**For the owner:** The notification workflow passes the security review, for the whole branch build/chief-of-staff/desk-notify-workflow at d5a03a2. In my first review the workflow itself was already right: its secrets reach only the step that sends, and only this repository's own runs are let in. The weakness was the guard that re-checks the workflow files on every pull request, and this commit fixes it. The guard now requires the gate to be the spec's words exactly, so the edit I used last time to let a stranger's copy in is now refused. It also catches every other weakening I tried in round 1. A few minor gaps and setup points remain, listed below as notes. None of them needs fixing before this merges.

What I ran (in /home/user/sd-cs15 at d5a03a2, which I left unchanged; probes in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/cs15/probe/):
- `python3 .github/scripts/test_desk_notify_check.py`: 25 tests, OK. That includes each fixture failing with its own reason only, and the fixture list still being exactly the spec's.
- `python3 .github/scripts/desk_notify_check.py`: PASS, so the real files pass.
- actionlint 1.7.12 on desk-notify.yml, desk-notify-ready.yml and desk-build.yml: clean.
- The new commit d5a03a2 is by `chief-of-staff@agents.invalid` and touches only the check and its test. The workflow files are unchanged since my round-1 review, so its pins and gate findings stand.

## Round-1 findings, rechecked
1. **The gate check could be passed by a gate that admits a fork: fixed.**
   - The check now also requires the gate's text, with spaces normalised, to be Workflow 3's gate or its "if neither carries it" fallback. It still evaluates the gate as before.
   - gate.py now gives `notify-gate-text` for the `mallory/Service-Desk` fork, `conclusion == 'failure'`, `head_branch == 'release'` and `owner.login == 'mallory'`. `issue_comment` is still caught by the evaluator.
   - The fallback gate, and the exact gate inside `${{ }}`, both pass, as they should.
2. **The check runs the PR's own copy: still a note.** A PR can weaken the check along with the workflow. The owner's R3 review of `.github/**` is the control.
3. **Rules the check didn't hold: fixed.** yaml.py now refuses each of these with its own reason: removing the upload's `if:` (`notify-upload-if`), a job `container:` (`notify-container`), a step `shell:` (`notify-shell`), extra commands after the sender (`notify-send-run`), and job-level env holding an event value (`notify-event-env`). A second step running the sender is refused too.
4. **Same-name workflows on branches: still a note.** They only cost runs.
5. **`workflow_run.path` equality: still a note.** It fails safe, into the 5-minute check; EXP-006 case 10 should record the field.
6. **The checkout `ref` on schedule runs: still a note.** The fallback is still main.
7. **Node 22.22.0 behind the 22 line: still a note.**

## New notes (none blocking)
- **N1:** the event-env rule matches only `${{ … github.event … }}` and `${{ … inputs … }}`. In a probe, a job-level `env:` holding `${{ toJSON(github) }}` or `${{ github.head_ref }}` still passes. That is low risk: env values are data, not run, and Workflow 3 already sends event values to the program through `env:`. A wider pattern (`github` other than `github.token`, plus `toJSON`) would close it.
- **N2:** the upload step's `name:` and `path:` are not pinned. In a probe, changing the name, or widening the path to `${{ runner.temp }}`, passes the check. A wrong name would break the sender's state lookup: every run would start afresh and send the "Notifications are on" summary. A wide path would publish runner files in a public artifact. No secrets are written to disk (no token is left after checkout, and env values are not written to files), so this is a hardening note. Pinning `name: desk-notify-state` and `path: desk-notify-state/` exactly would match the other pins.

## Open questions
- `head_repository.full_name` in the event payload still rests on observation, not a cited source. EXP-006 case 10, and the sender's own check through GitHub's REST API, cover it.
