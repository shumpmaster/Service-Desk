# M3B stage VT2: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-28 against build/builder/vt2 at 2bb72ab (VT2 round 2).

---

Verdict: PASS

VT2 round 2 at 2bb72ab holds: each new test fails for its bug, the `pageshow` handler is sound, and nothing regressed. I found no blocking findings. The worktree is clean; every bug was planted in a fresh `git archive` of 2bb72ab at `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt2copy`.

**Runs at 2bb72ab**
- **Full suite** (`npm --prefix src test`): 1527 run, 1527 pass, 0 fail. That is round 1's 1523 plus the 4 new tests, and none was removed.
- **`node src/tools/build.mjs`:** PASS (2 connected projects; 38 page modules in step).
- **surface_guard** (e1ba0c6..build/builder/vt2): OK, 7 commits. a17ca63 and 2bb72ab are both `builder <builder@agents.invalid>` with `Spec: S-001` and `Agent-Session:` trailers.
- **The two VT2 test files** on the clean copy: 24 pass, 0 fail.

**Each new test against its bug**
- **N1, M17** (the page's notes given `tz: 'UTC'`): now fails, in "a window open across Monday 00:00 in Chicago … not at Monday 00:00 UTC".
- **N1, M22** (`metrics.open()` called even when the page loads hidden): now fails, in "a page loaded hidden opens no window and notes nothing …".
- **N3** (a gate's and a question's sheet losing the control when kicked back, or when not in the waiting lane): fails, in the new "gate's confirming and kicked-back sheets and a question's kicked-back sheet" test. The lane variant also fails the older confirming/kicked-back test.
- **N4, the `pageshow` handler** (src/public/sandbox.js:5530-5534):
  - With the handler removed, the new back-forward-cache test fails.
  - With the "is it visible" check removed, the same test fails at "restored hidden: no window", so nothing is opened while hidden.
  - With `open()`'s guard against a second window removed (src/lib/metrics.js:122), both the new test and the round-1 window test fail.

**Why the `pageshow` handler is sound**
- **No double windows:** `open()` does nothing while a window is open, whichever of `visibilitychange` and `pageshow` comes first.
- **Nothing noted while hidden:** the handler opens a window only when the page is visible.
- **No note from data read before the restore:** `noteShown` needs a read finished at or after the window opened (`readNow`), so a restore notes nothing until a fresh read.

**Non-blocking**
- **The `persisted` check is redundant.** Dropping it from the handler survives every test, and it is harmless. A first load's `pageshow` comes either while a window is already open (so nothing happens) or while the page is hidden (so nothing opens). It changes no behaviour, so no test is missing.
- **A restore with no visible event opens a window but does not restart polling.** The scheduler restarts only on `visibilitychange`, which predates VT2. In such a browser the window is recorded correctly, but nothing is first shown until the next visible event.

**Nothing regressed.** The changes to the shared test helpers are additive: `loadSandbox`'s `visibility` defaults to `'visible'`, and `winEvent` only adds extra properties to the event. ac88-dark.test.mjs is unchanged. The new `vt2-` capture entries (gate confirming and kicked back, question kicked back, each marked) cover N3 for the captures; the PNGs themselves are still yours to make with the pull request.

N2 is closed on your terms: it goes to the Definer before VT3, and VT2 stays as built.
