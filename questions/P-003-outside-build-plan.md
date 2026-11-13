# Ruling needed: may the card fix be built outside the pipeline by this plan?

Milestone: M4

WHY: You closed the card fix in the pipeline and chose to build it outside, in working sessions, and asked to approve the plan before anything is built. Until you rule, nothing starts. The plan (docs/handoff/2026-11-13-P-003-outside-build-plan.md) writes a new frozen spec from the pipeline's last one, fixes the two faults that stopped it, records how today's desk behaves before any code changes, and checks the fix against that record. It takes about three working sessions and asks you four more times: the new spec's criteria, the pull request's review, the deploy and the launch.
OPTIONS:
  A. Approve the plan as written — the next session writes and reviews the new spec and brings you its criteria; nothing is built before you approve them.
  B. Build it as the desk itself was built, from the pipeline's last spec as a draft, with no locked checks and no record of today's desk — about one session faster, but nothing then shows that cards other than decision cards behave as they do today, which was the point of the record.
  C. Not now — nothing is built, and the card fix waits.
RECOMMENDATION: A — the record of today's desk is what lets anyone check the fix changed only decision cards, and the outside build is what makes that record possible.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the desk's queue, Home, board, card sheet and the cards it notifies; no other project
DEFAULT: none — you said no build starts until you approve the plan   TIMEOUT: none

## Context
- The owner chose to build the card fix outside the pipeline, in a working session, as the desk itself was first built (source: decisions/questions/P-003-baseline-runner.md, "C")
- The owner answered stop card 16 `re-scope`, and the loop closed the item (source: decisions/P-003/stop-16.md; status/P-003.toml)
- The pipeline's last spec failed its plan review because no role may run today's code and keep the record, and because it did not say what failed reads mean on today's code (source: reviews/S-008/plan.md on item/P-003, findings 1 and 2)
- Recording a reviewer's return word for word is the orchestrator's lane, and reviewer-class roles never commit (source: governance/SURFACES.md)
- The desk was built outside the pipeline from a draft spec, with the Reviewer and the owner's merge standing in for locked checks (source: docs/LEDGER.md, L-0003)
- Locked checks under tests/acceptance/ are R3 and need the owner's review (source: governance/risk-paths.toml)
