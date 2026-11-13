# Handoff — the desk's timeline work (P-005), 13 November 2026, part 7: the readiness check passed, Q-028 filed, and the Design gate case filed

*Written by the Chief of Staff (session_01QBwHGJaKPAWHLvefBrVkKb). Follows part 6 (docs/handoff/2026-11-13-chief-of-staff-p005-6.md). Covers about 04:23 to 05:20 UTC on 13 November, under the owner's proxy L-0049. Times are UTC and approximate to a few minutes.*

## What this means for the owner
The timeline's plan failed its first readiness check, was fixed, and passed the second. Its Design gate case is now filed: the gate Critic reads it next, then the case comes to the owner to rule. That ruling is the owner's alone and, under L-0049, is where this proxy stops in practice. Research on the job that would keep lasting copies of GitHub's run and check results (Q-028) is filed and its memo has returned; its source check is running. Until the owner approves that job, results older than 90 days are still being lost day by day.

## Done
- **The readiness check's first FAIL** (reviews/P-005/_critic-dor.md on item/P-005, run gha-43360877990-1): the experiments ruling was stale in the plan, and citations of records outside the check's pack could not be verified. Draft 6 of the plan (docs/projects/P-005.md) cites the ruling, marks every record outside the check's files and cites an in-pack record beside it where one exists, places the lasting-copies job against M6 and M7, and adds fallbacks for the alert route and the stopped-feed check. Notes: decisions/P-005/dor-fail-1-notes.md.
- **Two dry runs** of the readiness check on the real pack built by `session_runner.py pack` (dummy MODEL_* variables, Sonnet, as the real check runs): PASS, PASS (reviews/P-005-dor-dry-run/). #413, merged by proxy with every check green.
- **The card answered `resubmit`** by the Chief of Staff (decisions/P-005/dor-fail-1.md, with a Proxy line, which `record_checks decisions` requires of a chief-of-staff answer), with **research request Q-028** (intake/requests/Q-028.toml) after the Critic's two reads (FAIL: a leading sentence and four gaps; PASS, optional notes applied). #414, merged by proxy with every check green; the merge started the Orchestrator itself (its push trigger on decisions/** and intake/**), so no run was started by hand.
- **The readiness check passed** (run gha-43367481045-1, 05:00:53). Its one note: M7's reach back through the whole life of the work depends on the lasting-copies job. status/P-005.toml: role critic-gate, next_gate "dor", gate_n 1.
- **The Design gate case** (docs/gates/P-005/design-gate-1-case.md), after three cold reads by fresh Critic helpers as the gate Critic: hold (section 8 hid what the owner agrees to; three risks understated; a stale claim about Q-028; jargon), hold (Discovery drawn as done against the milestone block; kill criteria shorter than the stop rule; section 8 incomplete), proceed (one misstatement of who resubmitted, fixed). Filed in this pull request.

## Proxy actions this session
Merged #413 and this session's records pull requests; answered dor-fail-1 `resubmit`; filed Q-028. No gate ruling, target, or code.

## What waits on the owner
1. **The Design gate**, once the gate Critic's record and the gate card are up: the case lists everything the ruling carries, with docs/projects/P-005.md line 190 in full.
2. **The lasting-copies job**, as its own question once Q-028's memo passes its source check.
3. When the build needs them: adding Commit statuses and Deployments read to the desk's read key.

## Next, in order
1. Read the gate Critic's record (reviews/P-005/_design-gate-1-critic.md on item/P-005) and the gate card in queue/; write the card's notes. If the Critic holds, write case 2 (`design-gate-2-case.md`); never edit case 1 after the Critic is dispatched on it (`v3_checks gates` refuses).
2. Read Q-028's source check; on PASS, draft the records-change question (what the job writes, where, how often, with what credential, at what cost against $0), have the Critic read it cold, file it. The change itself is made in Personal-Org-Operating-Model by the owner's ruling.
3. The Design gate is the owner's; this proxy ends there in practice.

## Faults seen, for the Orchestrator's owner
- The gate case's milestone block, from `v3_checks gates`, reads Discovery-3 and Discovery-5 "not reached" though the groundwork map and the research memos are filed and source-checked; the block also ends at the second readiness dispatch, before its PASS. Worth checking how the timeline marks a research-backed standard milestone reached for a later item with its own plan.
- `v3_checks gates` computes the milestone block from the local tree: run it on a branch rebased on the latest main, or it prints a block from stale dispatch lines.
- `record_checks merges` fails on a branch checked alone (its commits read as first-parent on main); simulate the merge with a plain message before reading it, as part 6 noted.

## Critic returns this session
- Readiness dry runs: PASS, PASS. Real readiness check: PASS.
- Q-028: FAIL, PASS.
- Design gate case, cold reads as the gate Critic: hold, hold, proceed.

## Token checkpoint
Helper runs, with their reported figures, are in sessions/chief-of-staff/session_01QBwHGJaKPAWHLvefBrVkKb.jsonl: seven Critic runs. This session's own use was not read.
