Verdict: PASS
Reviewed: 3eb87154ecc833942802db0a869516354ab5f439 (build/builder/trial-view-1, base 4f01e61)

All three round-1 blocking findings are fixed. I reproduced each fix in Chromium, and each new test fails on the old code. I found no new blocking defect. Two notes below should be carried into the gate's case as risks.

## Blocking findings
None.

## The round-1 findings, re-checked

**B1 (one tap opens another card's "Latest"): fixed.**
- **Fix:** `src/public/sandbox.js:360-363`. A control's blur now clears only its own pointer mark, and `bubbleTap` clears it once the tap is done (line 1345).
- **Touch, 360 px, on the real fixtures and on H5's extremes:**
  - The round-1 steps now pass: tap A (opens), tap A (closes), tap B once (opens). This holds on both fixture sets.
  - One tap on each card, straight from the open bubble, opens it: Alpha, Beta, Epsilon, Gamma and Delta.
  - A tap after keyboard focus on another control opens the tapped one. So does a tap on another card's control while a bubble is open.
- **Mouse, 1000 px:** the sequence was hover A, click A, click A again, hover B, click B, then move the pointer away. The open bubbles were [Alpha], [Alpha], [], [Beta], [Beta], [Beta]. So a click after hover keeps the bubble open, and a clicked bubble stays when the pointer leaves.
- **On the old code (8f6f0d9) the same scripts fail as in round 1:** cards 2 to 5 open nothing, and so does a tap after keyboard focus.

**B2 (the bottom bar is above the Timeline): fixed.**
- **Fix:** `src/public/sandbox.css:166` and `:174`. `.sb-dock` and `.sb-band` now have z-index 4. That is above every screen element with a z-index (all 2 or less) and below the scrim (5) and the sheet (6).
- **Bottom bar:** I scrolled in 8 px steps and checked what sits under each tab with `elementFromPoint`. Nothing covers any tab on Timeline, Timeline/Build-i1, Status, Alpha's Status or the Team log. On the old code the same script still finds tile 10, capsule 8 and capsule 4 hits, so the check does detect the fault.
- **Home band:** 0 covered points out of 3405 (real) and 0 out of 6990 (extremes). The old code gives 109 and 301, the same numbers as the Builder's.
- **Side effects I checked:**
  - The "Latest" bubble (z-index 8) still draws above the band. I scrolled each open bubble across the band in 2 px steps: no point more than 2 px inside the bubble is covered. The only hits are on the bubble's sub-pixel edge row.
  - An open sheet still covers the bar.
  - My 360 px crawl now also scrolls each screen to its end and checks that every visible control sits wholly above the bar. Nothing is left under it on any route.
- **Is raising Home's band in scope? Yes, under AC48.** AC48 names Home's bottom band "as the lab agreed it", in the same list as the project bottom bar. A band that the cards' pills and "Latest" controls draw over is the same stacking fault, and the fix is one CSS line in sandbox-only CSS.

**B3 (focus goes back after a tap outside): fixed. I accept both of the Builder's readings.**
- **Fix:** `outsideTap` and `outsideTapEnd`, `sandbox.js:1395-1420`. The test skip is gone (`ac56-moving-refresh.test.mjs:117-122`), and the test now uses a real tap order.
- **In Chromium:**
  - A tap on the page background closes the bubble and focus goes back to its control. The control does not reopen, and Enter opens it again.
  - A tap on the scrim closes a queue sheet with focus back on the row that opened it. I checked this on both fixture sets.
- **Reading 1, a tap on something that takes focus itself (a link, a group header, another card's control, the band's composer):** focus stays on what was tapped. I accept this. Forcing focus back would undo the owner's own tap: a link navigates, a group header toggles, and another card's control opens its own bubble. AC56's test bullet exercises "a tap outside" only on the background, so the spec does not settle it. The Definer may want to write this reading into AC56.
- **Reading 2, a tap that becomes a scroll:** this turns out not to matter. With a real touch scroll (CDP touch events), the bubble closes, but Chromium never moves focus on a scroll, so focus stays on the control anyway. `returnTo` is left set until the next pointerdown. I checked whether a click with no pointerdown before it (Enter on a button) could then pull focus back: it is guarded by `inFocusable(activeElement)`, so it cannot.

**N1 (AC55 compares both ways): done.**
- `ac55-status.test.mjs:163-166`. Only the sandbox's own navigation words (`SB_NAV`) are set aside.
- **Mutation test:** in a scratch copy I added a paragraph "Invented 9 cards" to `renderAsked`. Both Time asked tests then fail, naming the extra words.

**N2 (Reason: keeps "; "): done.**
- New `reasonLine` in `src/lib/sandbox.js:683`, and the same copy in `src/public/lib/sandbox.js`.
- It joins line breaks and the spaces around them, and changes nothing else.
- The test asserts that "; " survives, that CRLF is joined, and that inner double spaces are kept.

## Non-blocking notes (risks for the gate's case)

**R1. A stale tap mark can stop keyboard focus from opening a "Latest" bubble (AC54 (b), "opens … on focus").**
- **Cause:** a touch press on a control that turns into a scroll fires `pointerdown` (`sandbox.js:342`), so `pointerFocus` is set to that control's name. But no focus or click follows to clear it.
- **Effect:** when that control later gets keyboard focus, `onfocus` (line 353) takes it as the tap's focus and does not open the bubble.
- **Reproduction (`rv2/br/r4.mjs`, extremes):**
  1. Touch-scroll starting on Beta's control.
  2. Focus Alpha's control, then press Escape.
  3. Focus Alpha's pill, then press Tab to Beta's control.
- **Result:** Beta's bubble does not open on 3eb8715. It does open on 8f6f0d9, because the old blur cleared every mark. So the fix widened this edge case slightly.
- **It was already there:** Tab from any non-"Latest" element after such a scroll fails on both versions.
- **How much it matters:** it needs touch and keyboard on the same device. Enter and Space still open the bubble, and the next focus works. A one-line fix would be to clear the mark on `pointercancel`, or in the document's pointerdown when the press lands elsewhere.

**R2.** A scroll that starts outside an open bubble closes it. This was already the behaviour in round 1. It is the owner's own action, so it does not break AC56's "only the owner closes what the owner opened". I note it only because AC54 names a tap, not a scroll, as what closes the bubble.

**Round-1 notes N3 to N5:** these still stand as before. Round 1 rated N5 (screen 4's run-switch dates) as a risk to carry.

## Join-up review (Reviewer, end of Build)
- **Home:** the bubble, the band and the cards work together.
  - One tap opens any card's bubble.
  - The bubble draws above the band, and the band draws above the cards' controls.
  - Every control can be scrolled clear of the band.
- **Project screens:** nothing on the Timeline, Status or Team covers the bottom bar, and an open sheet covers it as it should.
- **Sheets and bubbles:** all three ways of closing return focus to the opener (control, Escape, and a tap outside on the background).
- **Plain desk (no ?sandbox) after these fixes:** unchanged.
- **Screens side by side:** unchanged from round 1. B2 (the Timeline against screen 4) is resolved, and N5 is still a carried risk.

## Commits
- All 10 commits in 4f01e61..3eb8715 are by `builder <builder@agents.invalid>`, as author and as committer.
- `git interpret-trailers --parse` finds `Agent-Session: session_012RJPVKAoLga2RkqLYRDcBY` and `Spec: S-001` on each.
- Searching the messages for co-author lines or model names (co-authored, claude, opus, sonnet, gpt, anthropic, `model:`) finds nothing.
- The fix commits touch only the four sandbox source files and the sandbox tests.

## What I ran
All of this was in scratch clones under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv2/. Nothing in /home/user/sd-tv1-bld changed, and the branch is still at 3eb8715.

- **Tests:** `npm --prefix src test` in a full clone at 3eb8715 and in a depth-1 clone: 285 tests, 285 pass, 0 fail, 0 skipped.
- **New tests against the old code:** I put the 3eb8715 tests on the 8f6f0d9 source. 5 fail:
  - the AC51 + AC48 z-index test;
  - the AC53 Reason test;
  - both new AC54 B1 tests;
  - the AC56 bubble close test.

  The AC55 reverse check passes on the old code, as expected, because it only strengthens the test.
- **Were any tests weakened?** No.
  - The AC56 close tests now use `app.tap`, a real pointerdown, focus, click order, in place of a bare `.click()`. That is stricter.
  - The fake DOM's `focus()` now blurs the element that had focus first and does nothing if the element already has focus, as a browser does. The "stays closed while focus stays" assertion still dispatches `focus` directly (`ac54-home.test.mjs:183`), so it is not weakened.
- **Build:** "build: PASS (2 connected projects; 16 page modules in step)" in both clones.
- **Surface guard:** `python3 governance/checks/surface_guard.py diff --range 4f01e61..HEAD --branch build/builder/trial-view-1` gives "OK: 10 commit(s) … checked", rc 0.
- **No change without ?sandbox:**
  - `plaincmp.mjs` covers 8 plain-desk routes. Its output is byte-identical between base 4f01e61 and 3eb8715 when both are rendered in the same minute.
  - `app.js` imports `sandbox.js` only when `?sandbox` is set (line 638).
- **Crawl** (`rv2/br/crawl2.mjs`): 360 px, light and dark, reduced motion.
  - Routes: 273 per theme on the real fixtures, 173 per theme on the extremes. The extremes include hostile README and question text.
  - Results: 0 sideways scroll, 0 overflow or clipping, no console errors, no requests to outside origins, no alerts.
  - New check this round: 0 visible controls left under the bottom bar or band at the end of the scroll.
- **Browser scripts:**
  - Round 1's scripts, re-run against 3eb8715 and 8f6f0d9: `rv-tv1/br/bub.mjs`, `bub2.mjs`, `mouse.mjs`, `dock.mjs`.
  - The Builder's `b1b3.mjs`, re-run against both commits.
  - My new scripts: `rv2/br/r2.mjs` (bubble against band, background tap, Enter after return, card-body tap, touch scroll, sheet scrim focus), `r3.mjs`/`r3b.mjs` (bubble against band in 2 px steps), `r4.mjs` (R1) and `dock-old.mjs`.

All of these are under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/.

## Open questions
1. Should the Definer write B3's reading into AC56 as a choice of its own? The reading is that a tap outside landing on something that takes focus leaves focus there.
2. Should R1 be fixed now, or carried as a risk?
