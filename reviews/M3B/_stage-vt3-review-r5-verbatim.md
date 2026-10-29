# M3B stage VT3: the Reviewer's round 5 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/builder/vt3 at 0ea99e1 (VT3 round 5).

---

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
