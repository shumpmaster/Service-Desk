# M3E stage G1: the Reviewer's confirmation (round 2), verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/g1-home at f31c658 (on ae09c2d).

---

Verdict: PASS

**Confirmation review (round 2) of G1:** fix commit f31c658 on build/builder/g1-home, on top of ae09c2d. I judged from `git diff ae09c2d f31c658` in /home/user/sd-g1 and read only the commit's subject and trailers.

Both round-1 notes are fixed, nothing else changed, and no locked test was weakened. The guard exception is still exact. There are no blocking findings.

## Evidence
**Note 1 is fixed.** tests/desk/tools/glance-shots.mjs:127 now says `process.exitCode = 1;`. review_check no longer raises the false skip flag: it requires only design-reviewer and reviewer.

**Note 2 is fixed.**
- **Fixed places.** In src/public/sandbox.js:705-718, while the briefing is `k-you` it always draws three due places, in the order past, coming, undo (clock, clock, lock).
- **Each follows the tick.** Each place's words (`live: dueWords`) and its class (`_liveClass = dueClass`, applied on the tick at sandbox.js:4773) are worked out again every 15 seconds. A place with no line becomes `v2-bdue none`, which is `display: none` (sandbox.css:744, already present).
- **Drawing the places only for `k-you` loses nothing.** Every other briefing form returns `due: []` (src/lib/home.js:167-171).
- **The new test.** It is at tests/desk/ac91-glance-home.test.mjs:180-200. It moves `Date.now` one minute past the coming settle time and calls `app.tick()`, which runs only the 15-second intervals (tests/desk/sandbox-helpers.mjs:191). It then asserts:
  - the same briefing element is still there, not redrawn;
  - the lines now read past, then undo;
  - the icons are the clock, then the lock;
  - every place with no words is drawn as nothing.
- **The test catches the old bug.** Against ae09c2d's code the past line could not appear on the tick, so only "One can't be undone" would show and the test would fail.

**The guard exception is still exact** (tests/desk/ac88-dark.test.mjs):
- G1_KEY (:625) now splits `span.v2-bdue` from `span.v2-bdue.none`.
- The new pin (:613) is the same declaration list as `span.v2-bdue`, except `display: (none) → none`.
- The set-equality assertion at :786-787 is unchanged, so every pin must be used and nothing else is excused.

**Nothing else changed.** Only four files changed: sandbox.js (the one hunk in `briefingNode`), ac88, ac91 and glance-shots.mjs. Nothing changed under tests/acceptance/** or governance/**. src/lib/home.js is untouched, and the build says it is in step.

**No locked test was weakened.** review_check raised no fewer-assertions or skip flag.

## Commands run
- `cd src && npm test`: 1167 pass, 0 fail, 0 skipped. That is round 1's 1166 plus the new test.
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . e1cfa2e`: "OK: all governance checks passed."
- `python3 governance/checks/surface_guard.py diff --range e1cfa2e..f31c658 --branch build/builder/g1-home`: "OK: 2 commit(s) in e1cfa2e..f31c658 checked".
- `python3 governance/checks/review_check.py pr 999 --base e1cfa2e`:
  - Risk class R1.
  - Required reviews: design-reviewer and reviewer only, as expected.
  - It fails only because those two verdict files are missing, as expected before they are recorded.
- f31c658 is by `builder <builder@agents.invalid>`, with the trailers `Agent-Session: session_017seyaGqUxAff6E8dKWHDCR` and `Spec: S-001`.

## Non-blocking finding
**One loosening that wasn't needed.** In ac91-glance-home.test.mjs:163 (the quiet briefing), `byClass(b, 'v2-bdue').length === 0` became `shown(b).length === 0`. The quiet form draws no due places at all, so the stricter old assertion would still pass.

This file is G1's own new test, not a locked test from e1cfa2e, and review_check did not flag it. A later change could put hidden places back into other briefing forms without this test noticing.

Route: optional tightening by the Builder, or carry it forward as a minor risk.

## Open questions
None new. Round-1 notes 3 to 6 stand as they were and are not part of this fix.

I wrote no files and the worktree is clean. (I first ran `node tools/build.mjs` from the repo root, where it doesn't exist; I then ran it correctly from src/.)
