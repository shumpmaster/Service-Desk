# M3B stage VT3: the Reviewer's round 2 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/builder/vt3 at fc5607c (VT3 round 2, with draft 13 merged).

---

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
