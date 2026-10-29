# M3B stage VT3: the Reviewer's round 4 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/builder/vt3 at 4f509ed (VT3 round 4).

---

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
