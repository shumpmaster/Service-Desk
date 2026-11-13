Ruling: A — fix that line, then lock: the Check author changes the AC15 "once the card shows again" check so that, for a notice, it no longer asks for the mark among the arrival words, keeping the mark check for a direct link; a fresh Critic checks only that line and a fresh Reviewer reads the pull request again; a failure comes back to the owner
Proxy: done at the owner's request (the owner answered the Chief of Staff in session session_01QBwHGM9A8Rm6ghUgprr5tF on 2026-11-13, verbatim: "A: fix that line (Recommended)")

Question: questions/P-003-S-009-reviewer-fail.md (filed in #429, removed here)
Milestone: M4

Question, as put: The card fix's checks failed their Reviewer on one line; may that line be fixed, past the last review round?
Options, as put: A: fix that line, then lock (for a notice, check only the answer buttons and the sheet it lands on; keep the mark check for a direct link; a fresh Critic on that line and a fresh Reviewer re-read); B: lock as they stand, and tell the Builder that a notice's arrival words are the sheet's text; C: stop the card fix here.
Recommendation, as put: A.

How it was answered: in the Chief of Staff's session (session_01QBwHGM9A8Rm6ghUgprr5tF), on 2026-11-13 at about 17:05 UTC, when the question was put in session while its pull request (#429) was open. The owner named option A. An R3 question never defaults, so this is an answer. It is recorded here, after #429 brought the question file onto main (merged 2026-11-13T23:26:05Z), by the next Chief of Staff session (session_01QBwHGMPz793eyNKDB5hVfm).

## The owner's words, verbatim
"A: fix that line (Recommended)"

## How it was carried out
- The Check author, in a fresh sparse worktree holding only specs/S-009.md, tests/acceptance/** and checks/**, changed the one line on build/check-author/S-009-r4 (ad5cede, trailer `Agent-Session: session_01QBwHGM9A8Rm6ghUgprr5tF/check-author-r4`). Merged into the session branch with a merge commit (7c1385c) after the surface guard passed.
  - For a notice, the AC15 shown-again test (tests/acceptance/S-009/s009-j4-views.test.mjs) now asserts the answer buttons only. For a direct link it keeps the mark assertion.
  - **Narrower than option A's words.** Option A also named "the sheet it lands on". The Check author judged that specs/S-009.md:156 names the landing view but does not fix its address form tightly enough for an exact check, so that part was not asserted. The owner was told this before giving the verdict on #429.
- A fresh Critic checked that line only, as round 4, past the last: PASS, recorded verbatim in reviews/S-009/_critic-checks.md (46668de). Its non-blocking N1: a notice that opens a sheet drawn differently from the link's would pass; a limit of the spec's output form, carried as a risk for the Build case.
- A fresh Reviewer re-read the pull request, round 2: PASS, recorded verbatim in reviews/429/_reviewer-verbatim.md and reviews/429/reviewer.md (6742d43); round 1's FAIL kept in reviews/429/_reviewer-round1-verbatim.md.
- The owner's verdict on #429: "Approve", recorded in reviews/429/owner.md (7c5bf9b). The owner merged #429 at 2026-11-13T23:26:05Z, and the checks are locked.
