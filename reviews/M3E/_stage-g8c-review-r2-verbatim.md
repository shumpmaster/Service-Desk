# M3E stage G8c: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8c at 633c33e (fix commit 633c33e, test-only, on 366ad4e) (G8c's work over 210a421).

---

Verdict: PASS

Round 2 for G8c (M3E): I checked `git diff 366ad4e 633c33e` on build/builder/g8c, read-only, in a scratch worktree at 633c33e. That worktree and my scratch files are now removed.

## B1 (round 1): fixed
The fix in 633c33e touches tests only (commit author builder@agents.invalid):
- **The new case is at the right place:** tests/desk/ac91-g8c-home.test.mjs:250-282, on the blob-failure path. It uses `unread` with the made-up project's `blobFail` set to every file's blob, then to one file's. tests/desk/fixtures/README.md:896-899 labels the failing blobs NOT real.
- **It asserts what B1 asked for:**
  - no `lastSuccessAt`;
  - the corner reads "<n> wait on you", with class `you` and not `bad`;
  - the red foot reads exactly "Can't read in this opening: <AC5's reason>", with no time;
  - the foot has its ✕ and is `--bad` in light and dark;
  - there is no grey "Reason:" line;
  - the briefing's line and the grey line agree with it.
- **The false title and comment are corrected** (:216 and :237-239). They now say that a read failing outright, with no tree held, holds no cards.
- **`G8C_ONCE`'s docstring** now says `span.v2-rw`, as its key checks (ac88-dark.test.mjs:1318). No assertion in `G8C_ONCE` changed.

## Checks I ran
- **Regression check, my own run:** I dropped `opening` from the `tileFoot` call (src/public/sandbox.js:915) in memory only, through a Node loader hook, so no file changed. Across ac91-g8c-home, ac91-glance-home, ac82-home, ac87-portfolio, ac89-after-md3 and ac91-g7b-since-missing, 100 tests passed and 1 failed: the new B1 case, and only that case.
- **Targeted tests at 633c33e, unmodified:** 144/144 pass (ac91-g8c-home, ac91-g7b-since-missing, ac82-home, ac87-portfolio, ac89-after-md3, ac91-glance-home, ac92-glance-palette, md-sandbox, ac88-dark).
- **`tools/build.mjs`:** PASS, so the src/lib and src/public/lib copies still match.
- **`surface_guard.py diff --range 210a421..633c33e --branch build/builder/g8c`:** OK, 11 commits.

## Still standing from round 1 (non-blocking)
- **No time held:** `briefingView` saying "Can't show" for a failing read with no time is older than G8c and can't be reached. `readState` always gives a failing read a `since`.
- **The rest of round 1 holds:** the seven rewritten locked cases are each forced by a ruling, named in their commit and not weakened. `G8C_ONCE` is exact and set-equal. "Never read" uses the existing `succeeded`, with no read added. Places off Home are unchanged.

## Open question
The open question goes to the Definer, as you said: Home shows cards from a project no read of which has fully succeeded, while AC89 (a)'s state 2 on Waiting says "no cards". This is older than G8c.
