Verdict: PASS

The Reviewer's verdicts on VT3 (PR #251), verbatim: round 1 at 99154a5 (PASS), round 2 at fc5607c (FAIL), round 3 at b590ad3 (PASS), round 4 at 4f509ed (FAIL), round 5 at 0ea99e1 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: PASS

VT3 is built and tested against its row. I found nothing that fails it. The gaps below are untested branches, cases the spec makes unreachable, and spec ambiguities. They go to the gate as risks or questions.

**Runs (branch build/builder/vt3 in /home/user/sd-vt3, 6 commits over 55a2484)**
- `npm --prefix src test`: 1542 tests, 1542 pass, 0 fail.
- `node src/tools/build.mjs`: PASS (2 connected projects; 39 page modules in step).
- `surface_guard.py diff --range 55a2484..build/builder/vt3 --branch build/builder/vt3`: OK, 6 commits, exit 0.
- The worktree is clean (`git status` empty). The bugs I planted and my probe tests exist only in the scratch copy at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt3copy.

**Blocking findings:** none.

**Planted bugs (one at a time; ran ac25-weekly, ac25-weekly-page, ac82-home and ac87-portfolio)**
Caught (16):
- times rounded instead of cut, in two places
- the week still running offered
- launch week marked as a trial
- "Last week's…" never used
- "Records from" always written
- no split at midnight UTC
- items not filtered to their week
- `off` ignored
- the tree ignored
- an open card counted to now instead of to the week's end
- the week's lower edge moved
- trial weeks drawn before counted weeks
- a soft-box class on Home's line
- no scroll to the block
- the "kept 8 weeks" words dropped

Survived (7):
- B3: AC18's warning not drawn (sandbox.js:1683).
- B8: a card answered after the week counted to its answer, not cut at the week's end (values.js:265).
- B23: the dispatch-log months guard removed (values.js:258).
- B24: the "not read" guard removed (values.js:256).
- B26: the copy-to-clipboard on tap removed (sandbox.js:1673).
- B27: "Your weekly figures" put on every project's targets sheet (sandbox.js:1702). This has no visible effect today, because only Service-Desk has a targets sheet.
- B30: a truncated tree treated as unread (control plant; no test either way).

**Locked cases**
- 9090ae8 (AC82, tests/desk/ac82-home.test.mjs:115) and 6b4a4bd (AC87, tests/desk/ac87-portfolio.test.mjs:75) are real.
- Each keeps every old assertion, the old order included, and adds a second page load with a week to save.
- With that week, each asserts the order `…'portfolio','home-weekly','home-more-detail'`, and AC82's also checks that "More detail" stays last. Both commits are named and marked forced.
- Small error: 6b4a4bd's message says the AC87 fixture "names no portfolio", but it does draw the portfolio block. It is wording only.

**Join-up review, through the loaded page (Reviewer, end of Build)**
- **Notes to file.** I added a made-up v3 project, Alpha, to `vt3State` and loaded the page with an empty store at Tue 10 Nov 17:58:00.777 Chicago. I ticked it for 3 minutes and marked `Alpha|pr|80` "Didn't need me" through its sheet, then reloaded at Mon 16 Nov.
- **Home.** It showed "Last week's desk figures are ready to save".
- **The targets' sheet.** It opened at "Your weekly figures" with the trial line and "Save the week of 9 Nov ↗".
- **The file.** Path `metrics/service-desk/2026-W46-<device>.md`. The body, in J5's form:
  - the trial line
  - V5 "2h 10m over 7 cards"
  - "Records from: 2026-11-10"
  - windows `2026-11-10: 23:58:00-24:00:00` and `2026-11-11: 00:00:00-00:02:03` (cut from .776)
  - all 7 first-shown keys, including Service-Desk's real card
  - the mark at 23:59:02Z
- **Screens.** I ran tests/desk/tools/vt3-shots.mjs in Chromium. The sheet scrolls sideways 0 px at 360 and 414, light and dark. Home's line sits between the portfolio block and "More detail".
- **Differences, all non-blocking:** N2, N3 and N5 below.

**Non-blocking findings (risks for the gate)**
- **N1: AC18's message and the no-prefill Copy can't be reached on the page.** The row asks for both on the page; they are tested only at the module level (ac25-weekly.test.mjs, last test). The page's drawing of the warning (sandbox.js:1683) has no test, so B3 survives. Setting either key in J7's `portfolio` through the fixture's unused `pfConf` hook (vt3-fixtures.mjs:86) makes the function refuse the portfolio read ("Can't read your portfolio"), so the block never appears. This confirms the Builder's point 1.
- **N2: a file can be offered before V5's figure is ready, and committing it ends the offer for good.** The offer appears once the planning project's doc and the portfolio tree are read. `logLoaded` can still be false while the dispatch-log blob waits for a later blob call (model.js:616-624). The link then carries "V5 median (weekday cards): not available until Service-Desk has been read" (values.js:256). If the owner saves that, the week's file is in the tree and is never offered again, yet J5 says the Chief of Staff's V5 count is "the median line". The fake server answers at once, so I could not reproduce the timing; this is from the code. Suggest withholding the offer, or at least the link, until every v3 project is read.
- **N3: a truncated portfolio tree is used as if whole** (sandbox.js:1636, `tree: snap ? snap.tree : null`). Elsewhere the desk treats a truncated tree as unread (portfolio.js:361; scheduler.js:399 records it as a failed read). A saved week could be offered again, and GitHub would then refuse the duplicate file name. The risk is low today, because the portfolio holds only ideas/IDEAS.md. Suggest `!snap.truncated`, as in B30.
- **N4: `v5Week` has untested branches** (values.js:256, 258, and the cut at 265). B8, B23 and B24 all survive. Weeks older than the two UTC months J2 reads can be offered for up to 8 weeks, and their files say "not available: the dispatch log months the desk reads no longer cover this week".
- **N5: midnight UTC.** A window that crosses midnight UTC is written as two parts, the first ending `24:00:00` (weekly.js:87). For Chicago this happens on any evening use after 18:00 in winter (19:00 in summer), so it is common. It is reasonable, but J5 doesn't define it.

**Questions (the Builder's flagged points, judged as a spec reader)**
1. **J7's check refuses the two keys the row asks to test.** This is a real conflict inside the spec. The module tests are the most that can be done; the spec owner should drop those two page cases or allow the keys in J7.
2. **The V5 line for an unread project or an old week.** J5 is silent. The Builder's words are clear, but see N2: the spec should say whether the offer waits for the reads.
3. **"One line a day".** It doesn't cover a window crossing midnight UTC or one of zero length. The Builder splits at midnight with `24:00:00` and leaves zero-length windows out; sub-second windows that cut to the same second are kept. Both are acceptable readings, but J5 should state them, since the Chief of Staff parses the file.
4. **Once every week is saved, the block is gone, the "8 weeks" sentence with it.** This matches the build plan ("Home's line and the sheet's 'Your weekly figures', gone once that repository's tree holds the file"). Acceptable.
5. **A truncated tree.** See N3. The spec doesn't say; the desk's own rule elsewhere says treat it as unread.

**The Home sentence.** "The desk reads your portfolio repository and never changes it (your ruling, P-001-portfolio-read)" is still literally true. The ruling (decisions/questions/P-001-portfolio-read.md) is "nothing on the desk can change it": the desk makes no write and adds no call, and the owner commits on GitHub's own page under their own account. The owner's later answer C put the file there knowingly. In the capture, though, the sentence sits directly above "Last week's desk figures are ready to save ›", which saves into that same repository. A reader may see a contradiction. The words are fixed in the spec (S-001.md:9138), so this is for the Chief of Staff or the Design reviewer (for example "…never changes it; the weekly files you save there yourself"), not a VT3 defect.

Captures are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots/ (vt3-*.png).

## Round 2
Verdict: FAIL

All six checks you asked for pass. It fails on one case: draft 13's VT3 row now lists a sub-second window being kept, and no test covers it. The fix is one assertion. Separately, the guard fails over the branch's whole range because of the draft 13 merge, which needs your attention before landing.

**Runs (build/builder/vt3 at fc5607c)**
- `npm --prefix src test`: 1551 tests, 1551 pass, 0 fail (round 1 had 1542), so nothing regressed.
- `node src/tools/build.mjs`: PASS (2 connected projects; 39 page modules in step).
- surface_guard over the Builder's commits (`--range 99154a5..b40e744`): OK, 4 commits, exit 0.
- surface_guard over the whole branch (`--range 55a2484..build/builder/vt3`): FAIL, see process finding P1.
- The worktree is clean. The plants and probes are only in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt3copy2.

**Blocking finding**
- **F1: draft 13's row case "a sub-second one kept" has no test.**
  - The row asks for "a window across midnight UTC as two parts, the first ending `24:00:00`, a zero-length window left out and a sub-second one kept".
  - I planted SUBSEC in weekly.js:79, changing `!(b0 > a0)` to `!(b0 - a0 >= 1000)`, which drops windows under a second. Every test passes.
  - No fixture has a window shorter than a second: J5_WEEK's shortest is about 6 minutes, and round 1's case `12:00:00.999-12:00:59.999` is 59 s long.
  - The code is right; the case is just untested. A window such as `[z('…T13:02:11.200Z'), z('…T13:02:11.900Z')]` written as `13:02:11-13:02:11` in ac25-weekly.test.mjs's second test would lock it.
  - The zero-length half is already locked: my ZEROLEN plant is caught.

**Process finding (for you, not the Builder)**
- **P1: the guard over the branch's whole range fails.** The command CLAUDE.md gives for accepting a branch (`diff --range 55a2484..build/builder/vt3 --branch build/builder/vt3`) reports: `17746e949f41: commit by 'definer' on branch build/builder/vt3 — only 'builder' or a human may commit there`. Your merge fc5607c brought in 17746e9, draft 13, which is on build/definer/m3b-plan and not on main. Land draft 13 on main first and run the guard from that new base, or settle in some other way how this range is checked, before VT3 is accepted.

**Your six checks**
1. **Each new test fails for its planted bug: yes.**
   - B3 (AC18 warning not drawn), B8, B23, B24, B26 and B27 are each caught by their new test.
   - B26b, the copy firing even when the link holds the whole file, is caught.
   - N2 is caught with the guard removed, and with only the `logLoaded` part removed (N2b).
   - N3 (truncated tree used) and N1 (chevron CSS removed) are caught.
   - B1 is caught three ways: hold removed, the 50/250/1000 ms re-checks removed, and never letting go.
   - A block kept when every week is saved is caught by 4 tests.
   - One survivor, B1d: not clearing `nav.scrollWeekly`/`nav.weeklyHold` when the route leaves. It is harmless, because `nav.go` sets `scrollWeekly` afresh on each arrival (sandbox.js:4902) and the first landing replaces the hold.
2. **The B1 hold logic is sound.** `landWeekly` (sandbox.js:1662-1684):
   - It never calls `render()`, and nothing in sandbox.js listens for sheet scrolls (the only `onscroll` handlers belong to summary clips). So nothing loops.
   - Timers are set only on a first landing, three per arrival.
   - It lets go when the sheet's scroll differs from where the landing left it; the test checks this both at a re-check and at a redraw.
   - In Chromium, the capture tool's new check finds the whole block in view after the tap: one and eight weeks, at 360 and 414, light and dark, exit 0.
3. **The `serverConfig` seam is test-only.** It lives in tests/desk/sandbox-helpers.mjs and vt3-fixtures.mjs. Nothing under src/ changed for it, and with the default `serverConfig = null` the fake server is given `config` as before.
4. **The build matches draft 13's AC25, J5 and VT3 row in behaviour:**
   - the offer waits for every v3 project's read, the dispatch log included (sandbox.js:1638);
   - a truncated tree counts as unread (sandbox.js:1640);
   - the chevron is `--ink2`;
   - the block goes once every week is saved;
   - the midnight-UTC and zero-length forms are as built;
   - the two J7-refused keys are tested at module level and also on the page through the seam.

   The only gap is the untested case in F1.
5. **Suite, build and guard for the Builder's commits all pass.** See the runs above.
6. **Nothing regressed.** Every earlier test still passes. b40e744 is an empty commit (no tree change) that corrects 6b4a4bd's message, as asked.

**Non-blocking findings**
- **N6: the hold also re-lands after the owner's own taps inside the sheet, not only after layout.** It ends only on a scroll or a route change.
  - In Chromium I landed, then tapped the stop rule's "Read it all", which `clipNode` opens in place and redraws (sandbox.js:3266-3269). The sheet re-landed at its new bottom: scroll went from 430 to 505 at 360 px, and 274 to 330 at 414.
  - The opened quote stayed fully in view, but it grew upward rather than downward. That is harmless as built, but it is a small oddity for the Design reviewer.
  - My Chromium script: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/tools/readall-probe.mjs
- **N7: VT3's own tests never tap the "Copy the week" button.** B26's test taps the week's link. My COPYTEXT plant, which copies the wrong text inside the shared `copyButton`, passes VT3's tests but is caught by ac16-19, ac17-18, ac85 and ac94. VT3 also passes the same text to the `<pre>` and the button, and asserts that text equals J5_FILE character for character. So the row's "a tap on Copy putting the file on the clipboard" is covered, but only indirectly.
- **N8: the B1 page test runs with one week only, on fake layout.** The row's "with one and eight weeks" is shown only by the hand-run capture tool (tests/desk/tools/vt3-shots.mjs), which passes. That is reasonable, since the fake DOM lays nothing out.

**Questions:** none beyond P1.

## Round 3
Verdict: PASS

VT3 at b590ad3 (Builder commits 8e1c65f and b590ad3) passes everything you asked me to confirm. One thing is still open and non-blocking: the keyboard path through the new listeners, below as N9.

**Runs**
- `npm --prefix src test`: 1553 tests, 1553 pass, 0 fail (round 2 had 1551, plus the two new tests), so nothing regressed.
- `node src/tools/build.mjs`: PASS (2 connected projects; 39 page modules in step).
- surface_guard over the Builder's commits:
  - `--range fc5607c..b590ad3`: OK, 2 commits.
  - Earlier rounds: 55a2484..99154a5 and 99154a5..b40e744 were both OK.
- The whole-branch range still flags only 17746e9, the definer's plan commit brought in by your merge. I accept your ruling that the Builder's-commits check is the one that applies.
- The worktree is clean. Plants and probes are only in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt3copy3.

**Each new test fails for its planted bug: yes**
- **F1 (SUBSEC, a sub-second window dropped):** now caught by the new test in ac25-weekly.test.mjs.
- **N7 (COPYTEXT, wrong text on the clipboard):** now caught by VT3's own test, which taps "Copy the week" and checks "Copied".
- **N6 listeners:**
  - removing the listeners: caught;
  - `click` only: caught;
  - releasing the hold on a tap anywhere: caught;
  - `inSheet` never true: caught.
- **Rechecked from round 2, all still caught:** B3, B27, N2, N3, and the three B1 hold plants.

**The listeners are sound**
- They are added once, in `startSandbox`, not once per landing (sandbox.js:5644), so nothing piles up as the owner moves around.
- They only clear `nav.weeklyHold` and never draw. After leaving the route, `landWeekly` resets the hold anyway, so the listeners then do nothing.
- A tap outside the sheet keeps the hold: the test's `tapOutside` case shows it, and the release-anywhere plant is caught.
- In Chromium, a mouse press on the stop rule's "Read it all" now leaves the sheet where it was: scroll stays at 430 at 360 px and 274 at 414. The rule opens downward, fully in view.

**Non-blocking finding**
- **N9: a keyboard press of "Read it all" still re-lands the sheet once.** The new comment at sandbox.js:5644 says "a key's included", but that is not so.
  - Enter or Space fires `click` with no `pointerdown`.
  - The button's own `onclick` redraws synchronously (`clipNode`, sandbox.js:3266-3269; `guardRender` calls `draw()` directly, page.js:39-42). That runs `landWeekly` while the hold is still set.
  - Only then does the document's bubbling `click` listener clear the hold.
  - In Chromium, focusing "Read it all" and pressing Enter moves the sheet 430→505 at 360 px and 274→330 at 414. That is round 2's N6 behaviour exactly. The quote stays in view but grows upward. Later redraws no longer re-land.
  - The plant that drops the `click` listener survives, so nothing tests the keyboard half.
  - It is harmless, as N6 was. A fix would be to register the listeners in the capture phase (`addEventListener(t, fn, true)`), or to add a `keydown` listener.
  - My Chromium script: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/tools/readall-probe3.mjs (`MODE=mouse` or `MODE=key`).

**Questions:** none.

## Round 4
Verdict: FAIL

The production fix for N9 works and the full suite passes. It fails on your second confirmation item: the fake-DOM change weakens the outside-tap case from round 3, which no longer protects anything.

**Runs (build/builder/vt3 at 4f509ed)**
- `npm --prefix src test`: 1553 tests, 1553 pass, 0 fail.
- `node src/tools/build.mjs`: PASS (2 connected projects; 39 page modules in step).
- surface_guard `diff --range b590ad3..4f509ed --branch build/builder/vt3`: OK, 1 commit.
- The worktree is clean. Plants and probes are only in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt3copy4.

**The fix works in Chromium**
- Keyboard: focus "Read it all" and press Enter. The sheet now stays put (scroll 430 at 360 px, 274 at 414) and the rule opens downward, the same as a mouse press.
- My Chromium script: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/tools/readall-probe4.mjs (`MODE=key` or `MODE=mouse`).

**The plants you named are caught**
- Listeners back in the bubbling phase (`, true` removed): caught by the new keyboard case.
- Listeners removed entirely: caught.
- `pointerdown` only, dropping `click`: caught.
- SUBSEC and COPYTEXT from earlier rounds: still caught.
- One survivor is harmless: `click` only, dropping `pointerdown`. A capture-phase `click` already runs before any control's own handler, so this plant behaves the same as the real code.

**Blocking finding**
- **F2: the fake-DOM change makes the round-3 outside-tap case vacuous, so it no longer protects the `inSheet` guard.**
  - tests/desk/sandbox-helpers.mjs:155 now files capture listeners under `docCapture`.
  - Only `tap` and the new `press` (lines 216, 226, 239) run `docCapture`.
  - `tapOutside` (line 207) and `docEvent` (line 202) still walk only `docListeners`.
  - So the case "a tap outside the sheet is no such tap", which uses `b.tapOutside(...)` in ac25-weekly-page.test.mjs, never reaches the hold listener at all.
  - My plant R4-anywhere, which releases the hold on any tap anywhere (`if (nav.weeklyHold) nav.weeklyHold = null;` at sandbox.js:5648), now passes every test. The same plant (L-anywhere) was caught at b590ad3.
  - This is also not how a browser behaves: a real tap outside the sheet does reach the document's capture listeners first.
  - Fix: make `tapOutside` (and `docEvent`, for consistency) run `docCapture[t]` before `docListeners[t]`, as `tap` now does.
  - The production code is correct: `inSheet` still guards the release. The test that should hold it there just doesn't.

**Otherwise, the fake DOM is faithful**
- `tap` now runs the document's capture listeners, then the target's handler, then the document's bubbling listeners, for both `pointerdown` and `click`. That is a browser's order.
- `press` is a click with no `pointerdown` before it, the focus already on the control, as Enter or Space gives.
- No other test is weakened. In production the only capture-phase document listeners are the two new hold listeners (sandbox.js:5648). The other document listeners are registered without capture; the one at 5675 passes `{ passive: true }`. So `key`, `visibility`, `tapOutside` and `docEvent` run exactly what they ran before, apart from the hold listener in F2.

**Questions:** none.

## Round 5
Verdict: PASS

VT3 at 0ea99e1 passes all four checks: F2 is fixed, and every plant from rounds 2 to 5 is caught.

**Runs (build/builder/vt3 at 0ea99e1)**
- `npm --prefix src test`: 1553 tests, 1553 pass, 0 fail.
- `node src/tools/build.mjs`: PASS (2 connected projects; 39 page modules in step).
- surface_guard `diff --range 4f509ed..0ea99e1 --branch build/builder/vt3`: OK, 1 commit.
- The worktree is clean. Plants are only in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt3copy5.

**Your release-anywhere plant is caught again**
- R4-anywhere (`if (nav.weeklyHold) nav.weeklyHold = null;` at sandbox.js:5648) now fails the N6 test through its outside-tap case.
- Also caught:
  - the hold listeners moved to the bubbling phase;
  - `pointerdown` only;
  - the hold listeners removed;
  - SUBSEC;
  - COPYTEXT.

**The helper order matches a browser**
- `tapOutside`, `docEvent` and `key` (tests/desk/sandbox-helpers.mjs:197, 202, 207) now run the document's capture-phase listeners, then its bubbling ones.
- That is a browser's order at the document for an event whose target has no handler of its own: a background tap, a drag event on the view, or a key on the focused element.
- `tap` and `press` were already in order: document capture, then the target's handler, then document bubbling.

**No other test is weakened**
- In production, the only document listeners registered in the capture phase are the two hold listeners at sandbox.js:5648. Every other document listener is in the bubbling phase.
- So the change only adds events that reach those two hold listeners. Every other listener sees exactly what it saw before.
- With a target outside the sheet, the hold listener does nothing (the `inSheet` guard), so no other screen's behaviour changes.
- `visibilitychange` (helpers line 272) still walks only `docListeners`. That costs nothing, since no capture listener exists for it.

**Questions:** none.
