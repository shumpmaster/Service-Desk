Verdict: FAIL

Reviewed: 0da17cc on build/builder/lab-answers (/home/user/sd-la-bld): the merge dff6f0a plus the fixes. Also the spec change d84a3cf, as a plan check.

The round-1 B1 is fixed, and so are N1 to N4. I reproduced every number the Builder reported. It still fails on one point: "Done today"'s whole-line bubble closes on its own when the owner's day turns at midnight. That is the Builder's open point 2, and I rate it blocking. Open point 1 (where focus goes) I rate non-blocking.

## Blocking finding

**R2-B1. At midnight, an open "Done today" bubble closes by itself and focus is lost.**
- **What happens:**
  1. On the Queue, the owner opens a ruling row's whole-line bubble in "Done today".
  2. When the day turns in the owner's time zone, the next poll drops the row from the fold.
  3. The bubble disappears with it, and focus falls to the page body.
- **Why it breaks the spec:**
  - Draft 4's hold rule in AC55 says: "while the bubble is open, a refresh leaves it as it is … closes only by the owner's own ways". The next sentence, specs/S-001.md about line 1950, says "The same holds for each ruling row in AC52's 'Done today'".
  - AC56 says "Only the owner closes what the owner opened". When a sheet's subject leaves, the sheet stays and says so.
  - The hold was built for "Your last action" only: `heldLast` in `lastActionNode`, src/public/sandbox.js:660-685. The "Done today" rows (src/public/sandbox.js:888-895) are rebuilt from `doneToday` with no hold.
- **Reproducing case:**
  - Script: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la2/br/mid.mjs.
  - It runs against a fresh extremes server on port 8877 (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la2/br/restart.sh 8877 0), with the owner's time zone set to Pacific/Kiritimati. The browser clock starts at 09:58:30Z, 90 seconds before midnight there.
  - Result: at 10:00:13Z the fold shows "Done today (2)" with the bubble open and focus on its control. At 10:00:45Z it shows "Done today (0)", no bubble, focus on BODY.
- **Is it reachable?** Yes. It needs the Queue open with a bubble open across the owner's midnight. The owner filed records between 22:23 and 22:58 Chicago time on 15 Oct, so late-evening use really happens.
- **The fix is small:** hold the row's line and bubble while it is open, the same way `heldLast` does. Or the Definer narrows "The same holds" to the clip rules only and says what happens when a row leaves.

## Non-blocking notes (carried as risks)

- **N-R2-1 (Builder's open point 1): focus after a held bubble closes.**
  - AC56 says focus returns to the control that opened the bubble. Once the line shows its new state, that control is often gone.
  - I closed it four ways (Escape, Close, a tap outside, a second tap). Each time the line showed the new short ruling, and focus went to BODY. So this is the usual way a hold ends, not just the "not available yet" case. Outputs: q3-esc.txt, q3-close.txt, q3-outside.txt and q3-second.txt in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la2/br/.
  - The spec is silent here, so it is a spec gap, not a build error. It costs keyboard and screen-reader users their place.
  - Recommendation: the Definer names a fallback, for example focus on the "Your last action" line. The R2-B1 fix should use the same fallback.
- **N-R2-2: a test gap on the hold.** Mutation M4 (never clearing `heldLast` after a close) passes all 309 tests. The code is correct as it stands, but no test reopens the bubble after a hold.
- **N-R2-3: a test gap on the card-answer line.** Mutation M7 (the card-answer form "Your last action: <words> · <time>" losing its " · " and moving the time to its own line) passes all tests. The short-ruling form (N1) is pinned; the card-answer form is not.
- **Re-placing on resize (N2) does not move the page.** I simulated a phone's address bar hiding, which changes only the height by 56 px. The page stayed put, except at the very end of the page, where the browser itself pulls the scroll back because the page got shorter (urlbar.mjs).

## Plan check of d84a3cf (draft 4)

- It settles round 1's B1 in line with AC56: hold the bubble, add the notice "A newer action is arriving. Close this to see it.", close it only the owner's ways, then show the new state. Step 2b's added case matches. N1 and N3 are written in clearly.
- spec_check passes inside check_all. It is a Builder's working brief, not a frozen spec, and the Definer's commit has the right identity and trailers.
- Two gaps, and these are the build's two open points:
  1. Nothing says where focus goes when the opener is gone after a hold (N-R2-1).
  2. "The same holds for each ruling row in AC52's 'Done today'" now pulls the hold rule onto "Done today" rows. But the spec gives no example, and AC56's checks have no case for it, such as a row leaving at midnight (R2-B1).

  The Definer should close both with the fix.

## The Builder's claims, checked

- **309 tests pass and the build passes:** reproduced on a clean clone at 0da17cc and on the merge clone.
- **The Chromium check gives 330 PASS:** reproduced on my clone, with the Builder's server and script copied to /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la2/br/la/.
- **The spacing check still passes:** 56 PASS (rv-la2/br/ac/check.txt).
- **B1, "Your last action":**
  - My q2.mjs in add mode: the bubble stays open, scrolled to 120, for the full 120 s.
  - My stricter q3.mjs:
    - the same bubble element stays open, with the same text and scroll position;
    - the notice shows from t+15s and can be seen;
    - the line under it is unchanged and the page does not scroll;
    - each of the four ways closes it, and the line then shows the new ruling.
- **q2 in queue mode:** the bubble stays open and scrolled while a new row arrives. I set the time zone in my own server copy, which matches the Builder's srv2-tz.mjs.
- **N1:** short rulings are back to "<words> · <time> <code>" on one line.
- **N3:** the bubble holds only line 1, with "(proxy)" outside it.
- **N2:** a turned phone now places the open bubble again. My bubble checks give 332 PASS on extremes and 218 PASS on real data, with no failures; round 1's six turned-phone failures are gone.
- **N4:** the bar is drawn at `--sb-dock-h`, and `--sb-clear` uses the same value.
- **Removed test lines:** only the old " · " and 65 px assertions, each replaced by a stricter one. No loosening.
- **Mutations of the B1 hold:**
  - no hold: 2 tests fail;
  - hold without the notice: 2 tests fail;
  - wrong notice text: 2 tests fail;
  - no re-placing on resize: 1 test fails;
  - "(proxy)" inside the bubble: 1 test fails;
  - hold not cleared after close (M4) and card-answer form changed (M7): both pass (N-R2-2, N-R2-3).

## Answers to the Builder's open points

1. **Focus when the control is gone:** not blocking. The spec has a gap; the Definer should name a fallback (N-R2-1).
2. **No hold for a "Done today" row that leaves the fold:** blocking. The spec's "The same holds for each ruling row" applies the hold rule there, and I reproduced the bubble closing by itself at midnight (R2-B1).

## What I ran

All in scratch under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la2/: `la` at 0da17cc, `mut` for mutations, `mc` the merge clone. Scripts and outputs are in br/.

- **surface_guard:**
  - 7b5b80c..0da17cc with `--branch build/builder/lab-answers`: OK, 3 commits, 1 merge skipped.
  - 93ee86e..0da17cc for the whole range: OK, 14 commits.
  - With `--branch build/builder/lab-answers` over 63391bf..0da17cc it reports 2 violations. Both are the orch branch's own definer and orchestrator commits that came in by the merge, so that range is the wrong one for the flag.
- **Commit identity and trailers:** d84a3cf (definer), 7b5b80c (orchestrator), dff6f0a (builder, a true `--no-ff` merge) and 0da17cc (builder) all carry the right names and both trailers. None has model names or co-author lines.
- **check_all against the real main:**
  - Fresh clone of https://github.com/shumpmaster/Service-Desk main at e34574d.
  - Lab-answers merged `--no-ff` into orch/answer-spacing (7b5b80c) as orchestrator, then that merged into main `--no-ff` as shumpmaster <furchken@gmail.com>.
  - `GOV_BRANCH=orch/answer-spacing check_all.sh . origin/main` gives "all governance checks passed" (rv-la2/checkall.txt). The merged tree equals 0da17cc, and 309 tests pass on it.
- **The 360 px crawl:** both themes, new and base (93ee86e), on the real fixtures and H5's extremes. 272 and 172 routes; no sideways scroll, nothing overflowing, no page errors, no requests leaving the page, nothing under the bar. Outputs: crawl-887x.json and crawl-888x.json.
- **Bubble checks:** bubble cover, a turned phone and "Latest" one-tap, real and extremes (bub-real.txt, bub-ext.txt).
- **Without ?sandbox:** all 6 accepted routes are identical between base and new (plain-new.json, plain-base.json).
- **The rest:** q2 in both modes, q3 four ways, mid.mjs, urlbar.mjs, and the seven mutations above.
- I did not read the Builder's summary.

## Two slips, both put right

Twice a backgrounded `cd` left a command running in the orchestrator's worktree, /home/user/sd-ac:
- in round 1, a redirect created an empty plain-base.json;
- this round, two scratch files (urlbar.mjs, bub-real.txt) landed there.

I moved or deleted each at once. `git status` is clean in /home/user/Service-Desk, /home/user/sd-ac and /home/user/sd-la-bld. All scratch servers are stopped.
