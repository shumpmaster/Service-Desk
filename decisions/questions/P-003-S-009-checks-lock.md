Ruling: A — fix both first: the Check author adds the missing no-failure dor card with notes and no gate case, and makes the built-only gate-card, question and pull-request-card assertions compare with the record of today's desk; a fresh Critic reviews them as round 3, the last; on a PASS the checks are locked, and a FAIL comes back to the owner
Proxy: done at the owner's request (the owner answered the Chief of Staff in session session_01QBwHGM9A8Rm6ghUgprr5tF on 2026-11-13, verbatim: "Go with your reccomendations for the answer")

Question: questions/P-003-S-009-checks-lock.md (filed in #426, removed here)
Milestone: M4

Question, as put: Before the card fix's checks are locked, should two small points from their review be fixed?
Options, as put: A: fix both first, with round 3, the last; B: lock as they stand.
Recommendation, as put: A.

How it was answered: in the Chief of Staff's session (session_01QBwHGM9A8Rm6ghUgprr5tF), on 2026-11-13 at about 16:01 UTC, in reply to the session's recommendation of A, after the question was on main (#426, merged 15:40:58Z). The owner's words name no option; the only recommendation the session had given was A, so they are read as A. An R3 question never defaults, so this is an answer.

## The owner's words, verbatim
"Go with your reccomendations for the answer"

## How it is carried out
- The Check author, in a fresh sparse worktree from the session branch, adds to hold-show's AC9 test a no-failure built-only `dor` card with notes and no gate case, asserting `marked: null` (round 2, N1). It changes the built-only assertions on gate cards', questions' and pull-request cards' board, buttons and notices (hold-show :127, :144-145; j5 :43) to compare with the record's result (round 2, N2). It may also fix round 2's N6 comment.
- A fresh Critic reviews them as round 3, the last, recorded verbatim in reviews/S-009/_critic-checks.md.
- On a PASS, the checks are locked. On a FAIL, it comes back to the owner.

## What happened
- The Check author made the N1, N2 and N6 fixes on build/check-author/S-009-r3 (20ed529), in a sparse worktree holding only specs/S-009.md, tests/acceptance/** and checks/**. Merged with a merge commit (b6c8fbe) after the surface guard passed.
  - N1: a no-failure `dor` card with notes and no gate case, P-253-dor-1, asserted listed and unmarked (s009-hold-show.test.mjs).
  - N2: no built-only case matches a baseline case, so the `on_board`, `buttons` and notice assertions for gate cards and questions were dropped, left to the J7 comparison with the record; `on_list` and `marked` stay.
  - The tests' counts did not move: 62 tests, 7 pass, 48 fail, 7 skipped, every failure only because the adapter, the record or the notes do not exist yet.
- A fresh Critic reviewed them as round 3, the last: PASS (reviews/S-009/_critic-checks.md, round 3). Its non-blocking N1: no baseline case holds a gate card more than a day old, so a build changing only old gate cards' board or buttons would pass; carried as a risk for the Build case. The checks are locked.
