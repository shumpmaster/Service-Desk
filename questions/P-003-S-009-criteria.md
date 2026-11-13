# Ruling needed: do you approve the card fix's criteria, so the build can start?

Milestone: M4, Design-5, Design-6

WHY: The card fix's new spec passed its fourth and last review, so it now comes to you for its criteria. Your answer also serves as the Build gate. Nothing has been built, and no code has changed. Nothing is built before you approve.

In plain words, the fix makes the desk wait for the Chief of Staff's notes on each decision card before showing it. A card with notes shows the recommended answer, and only that answer's button is marked Recommended. A card without notes after a day shows with the mark "No Chief of Staff recommendation yet". A card's own text never marks a button. Gate cards, questions and pull-request cards behave exactly as today. The queue, Home's count, the board, the card sheet and the notifications all give each card the same state from the same records. When a record cannot be read, the queue and Home say which decision cards are not shown and why.

Four things change from what you have seen before, and you rule them here:
- First, if one notes file cannot be read, no card gets a notification on that run, gate cards included, until a later run reads it (question 10).
- Second, while the sender cannot read the dispatch log, it sends nothing at all, even for cards the desk is showing. The plan said those would still be notified (question 11).
- Third, the record of how today's desk behaves must itself show today's failed-read behaviour. If today's code behaves otherwise, the build stops and comes back to you (question 13).
- Fourth, a desk that is offline or signed out now hides every decision card until it reads again, where today it keeps showing them. Gate cards stay shown, with today's "Can't read" line.

Two smaller points:
- A held card's notification, if opened, says "That no longer waits on you", though the card will show again (question 12).
- The record of today's desk is now kept with the spec's reviews, not with the locked tests, as the earlier ruling said.

The last review found no blocker. It found six small gaps in the comparison's wording. None of them can let a wrong build pass. Each could stop a correct build, which would then come back to you. The worst is the Home count. Its comparison assumes today's Home counts each listed decision card once, which the code reading does not show. If that is wrong, the build would spend its three rounds before it stopped.

Approval is irreversible in practice: the spec is frozen and the locked tests are written from it.

OPTIONS:
  A. Approve the criteria as written, with A on questions 10, 11 and 13. The round-4 gaps are carried into the build as risks. The Definer freezes the spec and the Check author writes the locked tests. Any false stop comes back to you. This rules out changing the criteria before the build.
  B. Approve as A, but first let the Definer close the six round-4 gaps. This changes only the comparison's wording, the known limits and question 13's options; no criterion changes. A fresh Critic checks only those lines, and if that check fails, the build comes back to you. Then the spec is frozen as in A. It adds about an hour, and it lowers the chance of a wasted build.
  C. Approve with changes. Name them: for example B on question 10 or 11, which needs a change to the sender and stops this build (a new spec), or a criterion you want worded differently. The Definer revises, and the criteria come back to you.
  D. Not now. The spec stays a draft and nothing is built.
RECOMMENDATION: B. The gaps are small and their fixes are stated, and the Home-count gap could waste all three build rounds. A two-line check is cheaper than a stopped build.
RISK CLASS: R3 (the build's locked checks are under tests/acceptance/**)   REVERSIBILITY: irreversible (computed from R3)   BLAST RADIUS: the desk's decision cards on every view and in notifications; gate cards, questions and pull-request cards are unchanged
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The plan you approved makes this question the fix's Build gate. It holds the spec's criteria, its join-up review, and Build's and Launch's standard lines, and your answer here lets the Definer freeze the spec (source: docs/handoff/2026-11-13-P-003-outside-build-plan.md, step 4; decisions/questions/P-003-outside-build-plan.md)
- The spec passed its fourth review with no blocking finding, and with six non-blocking gaps, N1 to N6, each a possible false stop (source: reviews/S-009/plan.md, round 4)
- The criteria are AC1 to AC19. AC1 to AC8 cover holding and showing; AC9 and AC10 what does not change; AC11 that every view agrees; AC12 and AC13 running and the V6 count; AC14 and AC15 notifications; AC16 and AC17 failed reads; AC18 and AC19 operating notes, feedback and the value review (source: specs/S-009.md:18-72)
- The join-up review passes, with two non-blocking differences. First, the board and notifications say nothing while a record cannot be read (open question 5). Second, a held card's notice reuses "That no longer waits on you" (open question 12). It also sets type and spacing for the Builder (source: specs/S-009.md:183-199)
- Build's and Launch's standard lines: Build-1 and Build-3 skipped (no hidden tests, by your earlier ruling), Build-4 skipped (no experiments), Build-2 and Build-5 taken on, Launch-1 to Launch-5 taken on (source: docs/projects/P-003.md, section 3)
- Questions 10, 11 and 13 are worded for this ruling, each with options A and B except 13. Questions 1 to 9 and 12 are for later changes and need no ruling before freeze (source: specs/S-009.md:274-290)
- An offline or signed-out desk hides every decision card, by the plan's words, and the operating notes must say so (source: reviews/S-009/plan.md, round 2, N7; specs/S-009.md:65-71)
- The record of today's desk is no longer kept with the locked tests, as the earlier ruling said; the approved plan and the ledger ruling L-0051 allow that (source: reviews/S-009/plan.md, round 3, N5; decisions/P-003/failure-15.md:4)
- Nothing under src/ or tests/ has changed (source: git history of the session branch claude/chief-of-staff-discovery-lhu0fu)
