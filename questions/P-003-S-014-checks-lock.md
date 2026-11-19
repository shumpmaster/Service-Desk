# Ruling needed: do you approve locking the card fix's rewritten checks for its notices, so the adapter can be built again?

Milestone: M4

WHY: The card fix stopped before its build because today's notification sender could not show which cards it notified (decisions/questions/P-003-S-009-adapter-stop.md, "My answer is A"). The new spec, now frozen, records each notification as the sender really sends it: its words and where it opens. The Check author has rewritten only the checks that spec names. Three fresh Critic rounds and a fresh Reviewer have passed them. The Reviewer also ran the real sender and showed that the checks read its real notifications correctly. One gap the Reviewer found was closed before this question: a check could never recognise a notification about one of your questions. Locking makes these checks the test the card fix is built against. A locked check can then change only through a new spec, so this is irreversible in practice. Once you approve, the Builder writes the adapter again, with the same warning about the sender and with two parts of the desk probed first. Nothing under src/ changes until the baseline record exists.
OPTIONS:
  A. Approve the lock as written. The checks are locked, and the Builder's adapter is dispatched again.
  B. Approve with changes you name. The Check author makes them, a fresh Critic checks only those lines, then the lock.
  C. Not now: the card fix waits.
RECOMMENDATION: A. Every reviewer passed it, the real sender's notifications pass it, and the known limits below are narrow and written down.
RISK CLASS: R3 (tests/acceptance/**)   REVERSIBILITY: irreversible (computed from R3)   BLAST RADIUS: the card fix's checks and build; no other project, no change to the sender or anything under src/
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- S-014 is frozen on main's tip fca41700, and src/ and tests/desk/ are unchanged since the reading of today's code (source: specs/S-014.md:3, :23)
- The Check author changed only tests/acceptance/S-009/ and no baseline case, and updated the base commit the checks name to the spec's (source: build/check-author/S-014-r2, 0870a470..b5e06577; tests/acceptance/S-009/s009-lib.mjs:26)
- Every join test file gained a `join-test: S-014/J<n>` comment beside its kept S-009 mark, which the governance join check needs for a frozen S-014; in five files outside the spec's list that comment is the only change (source: reviews/S-014/_critic-checks.md, round 2; reviews/S-014/_reviewer-checks.md, N2)
- The Critic passed the rewrite in rounds 1 to 3 (source: reviews/S-014/_critic-checks.md)
- The Reviewer passed it and, running the real sender, showed a first run's summary, a card's own notice and a group read as the spec says, and the zero summary counting 0 (source: reviews/S-014/_reviewer-checks.md)
- The Reviewer's N1, that a question's notice could never be matched, was closed before the lock, with a new check that catches a question named after it leaves the list (source: reviews/S-014/_reviewer-checks.md; build/check-author/S-014-r2 b5e06577)
- Known limits carried as risks: the checks are not told the desk's real address, so each case's notices must share one address and anything opening Home is read as Home (Reviewer N3); a card whose content changed is not counted as new, so a run with one new card and two changed ones could send a group and fail one check, though no case has that shape (Critic round 1 N4); a summary's count is read only from the notification's body (Critic round 1 N2) (source: tests/acceptance/S-009/README.md, open point 7)
- Two small points left at the last Critic round: a comment above the notice reader still names only cards' file form, and a question whose name looked like a card's would also match that card; no case has such a name (source: reviews/S-014/_critic-checks.md, round 3)
- The suite, without the adapter or the record yet, runs 66 checks: 10 pass, 49 fail only because those do not exist yet, 7 are skipped (source: reviews/S-014/_reviewer-checks.md, review 2)
