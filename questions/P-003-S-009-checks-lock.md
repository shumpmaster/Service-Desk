# Ruling needed: before the card fix's checks are locked, should two small points from their review be fixed?

Milestone: M4

WHY: The card fix's spec is frozen, and its checks passed their second review, with no blocker. Nothing has been built and no code has changed. The review raised two small points, and fixing them needs the third and last review round. First, one narrow case is untested: a design-gate card with notes but no gate case, on a normal read. A build that wrongly used notes for that one kind of card would pass. It is unlikely. Second, a few tests assume how today's desk treats gate cards, questions and pull-request cards: shown on the board, with buttons, and notified. The spec does not say that, and only the record of today's desk will show it. If today's desk differs, a correct build would stop there and come back to you, after the adapter and the record are made. Locking the checks is irreversible in practice: they are not changed once locked.
OPTIONS:
  A. Fix both first. The Check author adds the missing case and makes those tests compare with the record of today's desk instead of assuming it. A fresh Critic reviews them as round 3, the last. If that fails, it comes back to you. About half an hour.
  B. Lock as they stand. Both are carried as risks, and the possible false stop comes back to you after the adapter and the record are made.
RECOMMENDATION: A. The second point could stop a correct build at a costly moment, and both fixes are small.
RISK CLASS: R3 (the checks are under tests/acceptance/**)   REVERSIBILITY: irreversible (computed from R3; neither option changes code)   BLAST RADIUS: the card fix's checks and its build; no other project
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The checks' review round 2 passed with no blocking finding. Its N1 is a dor card with notes and no gate case that is never read on a no-failure read; its N2 is built-only tests that assert today's board, buttons and notices for gate cards, questions and pull-request cards, which the spec does not fix (source: reviews/S-009/_critic-checks.md, round 2)
- Round 1 failed on one blocking finding, which round 2 found closed. A third failed round comes back to you (source: reviews/S-009/_critic-checks.md, round 1; docs/handoff/2026-11-13-P-003-outside-build-plan.md, step 5)
- One gap the checks cannot close stays a risk: the list the rule hands to the held-too-long count has no entry point the cases can reach, so a review rubric stands in for it (source: reviews/S-009/_critic-checks.md, round 1, N2)
- The spec was frozen after your answers B and "Fix both first", and its last review passed (source: decisions/questions/P-003-S-009-criteria.md; decisions/questions/P-003-S-009-pre-freeze.md; reviews/S-009/plan.md)
