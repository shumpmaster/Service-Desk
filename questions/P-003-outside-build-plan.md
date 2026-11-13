# Ruling needed: may the card fix be built outside the pipeline by this plan?

Milestone: M4

WHY: The pipeline's attempt at the card fix failed: its spec failed review three times, and you closed the work there and chose to build it outside the pipeline. Your answer's record says nothing is built outside the pipeline until you approve a plan, so nothing starts until you rule. The plan keeps the pipeline's frozen spec, locked checks and reviews. It adds a record of how today's desk behaves, made before any code changes, so the fix can be checked against it. My session runs today's code and keeps that record. A reviewer confirms the setup first, and later runs today's code a second time to check the record, which overlaps the job you declined to give the Reviewer in your earlier choice, though it keeps no record. This is not the bare route the desk itself was first built by; option B is. Five roles get records or duties their usual setup does not give them: the Reviewer, the Definer, the Critic, the Builder and my own session. The plan lists each one. It takes about four working sessions. You will then rule the new spec's criteria (also the Build gate), review and merge the build, approve two deploys, accept the fix on the preview, rule the Launch gate, and merge five records pull requests. The build's estimate sits one test under its stop rule. Approving builds nothing by itself. Closing the pipeline's item cannot be undone, and anything pushed to this public repository may already have been copied.
OPTIONS:
  A. Approve the plan as written — about four working sessions. The next one records your approval and the departures in the ledger, has today's code read, then writes and reviews the new spec and brings you its criteria. No code changes before you approve them. It rules out building from a draft spec.
  B. Build it as the desk itself was built, from the pipeline's last spec left as a draft, which needs an exception to the freeze rule like the desk's (L-0003), with no locked checks and no record of today's desk — about two sessions, with the Builder's own tests and the reviews showing that cards other than decision cards behave as they do today, and no departures from the role cards.
  C. Not now — nothing is built, and the card fix waits.
RECOMMENDATION: A — unlike B, it keeps a frozen spec, locked checks and a record of today's desk, so anyone can check that the fix changed only decision cards.
RISK CLASS: R3 (the plan's locked checks are under tests/acceptance/**)   REVERSIBILITY: irreversible (computed from R3; approving builds nothing by itself)   BLAST RADIUS: the desk's queue, Home, board, card sheet and the cards it notifies; no other project
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The plan this asks about (source: docs/handoff/2026-11-13-P-003-outside-build-plan.md)
- The owner chose to build the card fix outside the pipeline, in a working session, as the desk itself was first built (source: decisions/questions/P-003-baseline-runner.md, "C")
- In that choice the owner declined option A, letting the check run make the comparison itself, and option B, giving the Reviewer the job of running today's code (source: decisions/questions/P-003-baseline-runner.md, "Options, as put")
- That answer's record says nothing is built outside the pipeline until the Chief of Staff has planned the build and the owner has approved the plan (source: decisions/questions/P-003-baseline-runner.md, "How it is carried out")
- The owner answered stop card 16 `re-scope`, and the loop closed the item (source: decisions/P-003/stop-16.md; status/P-003.toml)
- The pipeline's last spec failed its third plan review on two findings. First, its claim that the Reviewer may run code and commit under reviews/ was unsupported, and the desk's first plan says the Orchestrator records reviews. Second, it did not say what a failed notes read means on today's code, which never reads notes, or how failed queue and log reads are made (source: reviews/S-008/plan.md on item/P-003, findings 1 and 2)
- Reviewer-class roles never commit, and the Orchestrator records their returns verbatim (source: governance/SURFACES.md)
- The surface guard fails a spec whose locked checks and code were committed in one session (source: governance/checks/surface_guard.py, model S-013 AC8)
- The desk was built outside the pipeline from a draft spec, with the Builder's own tests and the Reviewer standing in for locked checks (source: docs/LEDGER.md, L-0003)
- Locked checks under tests/acceptance/ are R3 and need the owner's review (source: governance/risk-paths.toml)
