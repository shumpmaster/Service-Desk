# Ruling needed: may the card fix be built outside the pipeline by this plan?

Milestone: M4

WHY: The pipeline's attempt at the card fix failed: its spec failed review three times, and you closed the work there and chose to build it outside the pipeline. Your answer's record says nothing is built outside until you approve a plan, so nothing starts until you rule. The plan writes a new spec from the pipeline's last one and freezes it. It fixes the two faults that stopped it, records how today's desk behaves before any code changes, and checks the fix against that record. It takes about three working sessions and asks you four more times: the new spec's criteria (which also serve as the Build gate), the pull request's review, the deploy and the launch. (The plan: docs/handoff/2026-11-13-P-003-outside-build-plan.md.)
OPTIONS:
  A. Approve the plan as written — the next session records your approval, has today's code read, then writes and reviews the new spec and brings you its criteria; nothing is built before you approve them.
  B. Build it as the desk itself was built, from the pipeline's last spec as a draft, with no locked checks and no record of today's desk — about one session faster, but then nothing but the Builder's own tests and the reviews shows that cards other than decision cards behave as they do today, which was the point of the record.
  C. Not now — nothing is built, and the card fix waits.
RECOMMENDATION: A — the record of today's desk is what lets anyone check the fix changed only decision cards, and the outside build is what makes that record possible.
RISK CLASS: R3   REVERSIBILITY: owner approval, logged; never defaults (R3, A4)   BLAST RADIUS: the desk's queue, Home, board, card sheet and the cards it notifies; no other project
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The owner chose to build the card fix outside the pipeline, in a working session, as the desk itself was first built (source: decisions/questions/P-003-baseline-runner.md, "C")
- That answer's record says nothing is built outside the pipeline until the Chief of Staff has planned the build and the owner has approved the plan (source: decisions/questions/P-003-baseline-runner.md, "How it is carried out")
- The owner answered stop card 16 `re-scope`, and the loop closed the item (source: decisions/P-003/stop-16.md; status/P-003.toml)
- The pipeline's last spec failed its third plan review on two findings. Its claim that the Reviewer may run code and commit under reviews/ was unsupported, and a project-plan line says the Orchestrator records reviews. It also did not say what failed reads mean on today's code (source: reviews/S-008/plan.md on item/P-003, findings 1 and 2, as quoted in decisions/P-003/stop-16-notes.md)
- Recording a reviewer's return word for word is the orchestrator's lane, and reviewer-class roles never commit (source: governance/SURFACES.md)
- The desk was built outside the pipeline from a draft spec. The Builder's own tests, the Reviewer and the owner's merge stood in for locked checks (source: docs/LEDGER.md, L-0003)
- Locked checks under tests/acceptance/ are R3 and need the owner's review (source: governance/risk-paths.toml)
