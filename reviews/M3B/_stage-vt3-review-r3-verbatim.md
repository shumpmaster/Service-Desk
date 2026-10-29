# M3B stage VT3: the Reviewer's round 3 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/builder/vt3 at b590ad3 (VT3 round 3).

---

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
