Verdict: PASS

Reviewed: 9345093 on build/builder/lab-answers (/home/user/sd-la-bld), after the merge ca01e99. Also spec drafts 5 and 6 (3fe415b, 666cfa3), as a plan check.

Round 2's blocking finding (the "Done today" bubble closing at midnight) is fixed, and so are the three round-2 notes on focus and test gaps. Every number the Builder reported reproduces. Both of the Builder's open questions point to real behaviour, and I rate both as carried risks, not defects.

## Blocking findings

None.

## Non-blocking notes (carried as risks)

- **R3-N1 (Builder's open question 1): the whole "Done today" fold is held, not just the open row.**
  - While a row's whole-line bubble is open, a poll that brings a new ruling today does not add its row. The fold's count stays the same, and no notice shows, because the open row itself did not change.
  - Reproduced: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la3/br/q2-queue.txt reads "Done today (2)" through t+120s. Round 2 showed (3) by t+60s.
  - Why it is not blocking: AC56 says "New data fills in around them". Draft 5 only says what happens when the open row is removed or changed, and is silent on rows added around it. Holding the whole fold is a fair reading of the hold. Nothing is lost: the new row appears once the owner closes the bubble, and a held bubble covers most of the screen anyway.
  - Suggested: the Definer confirms the reading in a line, or the build lets new rows in and holds only the open row.
- **R3-N2 (Builder's open question 2): `tabindex="-1"` on the "Your last action" block.**
  - **A tap on the block itself:** a tap on its text (for example the time) moves focus onto the block, where before it stayed on the page body. No focus ring is drawn (outline none, :focus-visible false), so nothing changes on screen.
  - **A tap outside the bubble, but on the block:**
    - Case: Gamma's mid-length ruling, whose bubble sits below its line; the tap lands on the block's padding.
    - The bubble closes, but focus goes to the block, not back to its control. AC56 says closing returns focus to the control that opened it.
    - Cause: the outside-tap handler (`inFocusable`) treats any ancestor with a tabindex as something that takes focus itself.
  - It only happens when the tap lands on the block's own edges, and focus stays right next to the control.
  - Script: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la3/br/tabidx.mjs.
  - Suggested: set tabindex only when the fallback focus is needed, or let `inFocusable` ignore tabindex -1.
- **Still carried from the spec:** the control's name "Show the whole of <code>" breaks WCAG 2.5.3 ("Label in Name").

## Plan check of drafts 5 and 6

- Draft 5 writes the hold out for "Done today", with the midnight case named. It gives the focus fallback: the "Your last action" line, or "Done today"'s header. AC56's steps 2b and 3b gain matching checks.
- Draft 6 uses one notice for both holds: "This has changed since you opened it. Close this to see the latest."
- Both drafts are consistent with AC55 and AC56. spec_check passes inside check_all. The Definer's commits have the right identity and trailers.
- The one gap is R3-N1: rows added under a hold are not addressed.

## The Builder's claims, checked

- **317 tests pass and the build passes:** reproduced on a clean clone and on the merge clone.
- **The Chromium check gives 330 PASS:** reproduced; the spacing check still gives 56 PASS.
- **Midnight hold (mid2.mjs):** my stricter version of mid.mjs adds the scroll position, the notice text, closing four ways and the focus target. All four ways (Escape, Close, a tap outside, a second tap) pass:
  - the same bubble stays open past midnight, unchanged and scrolled to 150, with the draft-6 notice;
  - the fold stays at "Done today (2)" until closed;
  - after closing, it shows "Done today (0)" and stays open;
  - focus lands on "Done today"'s header (`SUMMARY[done-today-h]`).
- **q3, with the draft-6 text and a focus check added:** all four ways pass. The bubble is held with the notice, the line under it stays as it was, the page does not scroll, the new ruling shows after closing, and focus goes to the "Your last action" line.
- **q2, add mode:** the bubble stays open, scrolled to 120, for the full 120 s. (Queue mode is the R3-N1 result above.)
- **Mutations:** 10 tried, all caught. This includes the two that survived in round 2.

  | Mutation | Tests that fail |
  |---|---|
  | No "Done today" hold | 5 |
  | Hold, but no notice | 5 |
  | Held "Done today" state never cleared | 1 |
  | Held "Your last action" state never cleared (round 2's M4) | 1 |
  | Card answer loses its " · " (round 2's M7) | 1 |
  | No focus fallback | 7 |
  | "Done today" falls back to the wrong place | 4 |
  | No tabindex on the block | 1 |
  | No refocus after the line is measured | 1 |
  | Notice ignores a row that has gone | 4 |

- **Tests:** the only removed test lines carried the old notice text, and each was replaced.
- **The interrupted session:** the worktree is clean, HEAD is 9345093, and the stash is empty, so nothing uncommitted was left behind.

## What I ran

All in scratch under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la3/: `la` at 9345093, `mut` for mutations, `mc` the merge clone. Scripts and outputs are in br/.

- **surface_guard:**
  - 666cfa3..9345093 with `--branch build/builder/lab-answers`: OK, 5 commits, 2 merges skipped.
  - 93ee86e..9345093 for the whole range: OK, 19 commits, 3 merges skipped.
- **Commit identity and trailers:**
  - 13938cd: orchestrator.
  - 3fe415b and 666cfa3: definer.
  - ca01e99: builder, a true `--no-ff` merge.
  - 9345093: builder.
  - Each has the Agent-Session and Spec: S-001 trailers, and none has model names or co-author lines.
- **check_all against the real main:**
  - Fresh clone of https://github.com/shumpmaster/Service-Desk main at e34574d.
  - Lab-answers merged `--no-ff` into orch/answer-spacing (666cfa3) as orchestrator, then that merged into main `--no-ff` as shumpmaster <furchken@gmail.com>.
  - `GOV_BRANCH=orch/answer-spacing check_all.sh . origin/main` gives "all governance checks passed" (rv-la3/checkall.txt). The merged tree equals 9345093, and 317 tests pass on it.
- **The 360 px crawl:** both themes, new and base (93ee86e), on the real fixtures and H5's extremes. 272 and 172 routes; no sideways scroll, nothing overflowing, no page errors, no requests leaving the page, nothing under the bar.
- **Bubble checks:** 332 PASS on extremes and 218 PASS on real data, with no failures.
- **urlbar.mjs:** the page stays put when the address bar hides. The only movement is at the very end of the page, where the browser itself pulls the scroll back because the page got shorter.
- **Without ?sandbox:** all 6 accepted routes are identical between base and new.
- **The rest:** q2 in both modes, q3 four ways, mid2 four ways, tabidx.mjs, and the 10 mutations.
- I did not read the Builder's summary or use its q3-d6.mjs; I updated my own q3.mjs.
- Nothing was written outside the scratchpad this round. All scratch servers are stopped. `git status` is clean in /home/user/Service-Desk, /home/user/sd-ac and /home/user/sd-la-bld.
