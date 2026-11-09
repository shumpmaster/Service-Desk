# P-003 failure-10 — the Chief of Staff's notes

*Chief of Staff, 2026-11-09 (session_01QBwHGLyWwT6VLiL5hC3LpG). Advice for the owner's decision on queue/P-003-failure-10.md; not a decision. Written before the card was raised: the next Orchestrator run raises it, because the Check author's second attempt ended in an error and the card number follows card 9 (governance/checks/orchestrator.py:440, :542-545).*

**Recommendation: `retry`, once the scope-check fix in questions/P-003-check-author-scope.md (option A) has landed on main. Do not answer before that: a retry now fails the same way.**

## What happened
Your `proceed` on card 9 worked as it should. The Definer froze S-005 on item/P-003 at 01:20Z (commit 09813031, `status: frozen`, criteria marked owner-approved), and CI's record step accepted and pushed it (run 42544751607); the facts and freeze checks both pass on item/P-003 when I run them (`spec_check.py facts` and `v3_checks.py freeze`, base origin/main). The Check author was then dispatched twice, at 01:30Z and 02:22Z. Both sessions finished and wrote their tests, about 18 files under checks/S-005/ and tests/acceptance/S-005/. Both times the record step refused to push them: the scope check found every file "outside the Areas touched of S-005", and "nothing of it is pushed, its outcomes are errors" (run 42550532232, commit job). The work is not lost in any way that matters: a retry writes it again from the frozen spec in about ten minutes.

## Why
The scope check holds each spec-scoped commit to the spec's areas touched, which list where the build's code goes (src/lib/**, src/public/**, tests/desk/**, docs/handover/**). The Check author's files go to its own surface, tests/acceptance/** and checks/**, which no spec lists. The Definer had the same problem and was given a lane bounded by its surface (model S-019 AC1); the Check author was not. No Check author commit had ever landed on this desk, so nothing showed the gap before. It is not the Check author's fault, and not the spec's.

## The choices
- **`retry` after the fix (recommended).** A fix of about 15 lines gives the Check author the same lane as the Definer. I tested it: a replayed Check author commit on item/P-003 fails the scope check today with the same two kinds of path, and passes with the fix; the operating model's 14 Definer-lane tests pass with it. A Builder writing into tests/acceptance/** is still refused, by this check and by the surface guard. The fix needs your approval (R3), which is the question filed with these notes.
- **`re-specify`.** The Definer writes a new spec adding the two test folders to the areas touched. It works for this project only, costs another spec, plan review and probably a criteria card, and the next project hits the same wall.
- **`drop`.** Ends the card fix. Nothing points that way.
- `rebuild` is not offered at this stage (governance/ROUTING.toml, stage limit 5).

## The pipeline
It has stalled. The Orchestrator is scheduled every 30 minutes, but no run has started since 02:22Z; the last run's "start the next run" step was skipped, as it is after an error. The second error is recorded but not yet counted, so the card has not been raised. Starting the Orchestrator by hand (Actions, orchestrator, Run workflow) raises it. That is your call; there is no hurry to start it before the fix is approved, since the card waits on you either way.

What would change this: a refusal on the retry that is not about scope, which would mean the tests themselves need a look.
