# Ruling needed: The plan for the new desk failed its third check. How should it go on?

Milestone: MD3
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: The stop rule sends a third failed check to you. Rounds 1 and 2 found real gaps, all now fixed. Round 3 found two things. First, the "With the agents" rule mostly misses the pull requests it was written for: ones that need your verdict and are still waiting on the agents' fixes, so they would still show as cards and still notify your phone. Second, the plan says the phone's new GitHub reads never pause notifications; in a busy hour they can bring a pause up to an hour sooner, though nothing is lost and the board still shows everything. Left unruled, no building starts.
OPTIONS:
  A. Fix and confirm — The Definer fixes both (so those pull requests really move to "With the agents"; the phone makes its new reads last, and skips them when its allowance runs low; the wording says plainly what can still pause), plus the small notes. A fresh reviewer checks only those fixes, then building starts.
  B. One more full round — The same fixes, then both checks again from the start before building.
  C. Build without "With the agents" for now — Stage 1 leaves the rule out, so those pull requests show as cards and notify as they do today; the rule comes later as its own piece of work.
RECOMMENDATION: A — both fixes are narrow, everything else passed three rounds, and a short check keeps it honest.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: when building the new desk starts, and what the first stage includes
DEFAULT: B   TIMEOUT: 48

## Context
- The Critic's round-3 report (source: reviews/S-001-desk-v2/_critic-round3-verbatim.md on orch/desk-v2)
- The plan review's round-3 report (source: reviews/S-001-desk-v2/_plan-review-round3-verbatim.md on orch/desk-v2)
- The owner's ruling the first finding is about (source: decisions/questions/P-001-board-after-agents.md)
- The plan (source: specs/S-001.md on build/definer/s001-desk-v2)
