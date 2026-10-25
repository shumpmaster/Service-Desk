# M3E stage G9: the Reviewer's round 2 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g9 at b616b32 (G9's work over d968b1e).

---

Verdict: FAIL

G9 round 2 at b616b32 fails on one blocking finding. The test-command change in ae48d55 works, but G9's row excludes it, and it makes the spec's own quoted test command fail. Everything else passes: the run-heading work matches AC92 (d) as written, and my round-1 notes N1 to N3 are repaired with nothing weakened.

**Blocking finding**

B1. ae48d55 changes the test command, which G9's row rules out.
- **What the spec says.**
  - G9's row (specs/S-001.md:2598) ends: "The one-process suite's heap is not part of G9 (Known limits, after the glance audit, 1)".
  - The same row gives the fallback for G9_OPENS: put it back "if the one-process suite's memory allows … and if it does not, the Builder's return says so with the measured peak".
  - Known limits, after the glance audit, 1 (:15755 on) says the change that fixes the heap departs "from the test command this spec quotes word for word … so the draft that plans it rewrites that line too".
  - Toolchain (:14104) still reads: "`npm --prefix src test`, which runs `node --test ../tests/desk/`."
- **What ae48d55 does.**
  - src/package.json:13 becomes `node --test ../tests/desk/*.test.mjs`.
  - The locked AC15 case is rewritten to pin that new string (tests/desk/j7-config.test.mjs:77–80), but the spec never names it and G9's row doesn't name this rewrite.
- **How it fails.** I ran the spec's quoted command at b616b32, `node --test ../tests/desk/` from src/. It runs out of memory: "FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory" after 1157 of 1314 tests, reported as `not ok 1 - ../tests/desk`. So the restored G9_OPENS walks don't fit in one process, which is exactly the case where the row asks for the fallback.
- **Either way clears it:**
  - (a) The Definer writes the per-file command into the spec: Toolchain :14104, Known limits 1, the last sentence of G9's row, and the AC15 pin. The change is sound (below), so I would pass it on re-check.
  - (b) The Builder reverts ae48d55 and follows the row's fallback. G9_OPENS comes back out of AC88's two walks, and the return gives the measured peak.

**Is the change sound? Yes, mechanically.**
- **Every file still runs.**
  - The shell glob from src/ gives the same 103 files as index.js's `readdirSync(...).filter('.test.mjs').sort()`. I diffed the two lists.
  - There are no hidden test files and none in subdirectories that either form would miss.
- **Same tests, nothing skipped.**
  - `npm test` from src/: 1314 tests, 1314 pass, 0 fail, 0 skipped, 0 todo, 0 cancelled, in 9 minutes.
  - Diffing test names against round 1's one-process run (1313): identical, except the new run-heading case and the every-screen test's title, which now mentions `quiet`.
- **CI.** governance.yml and desk-build.yml both run `npm --prefix src test` from the repo root. npm runs the script inside src/, so the relative glob resolves; `npm --prefix src run build` from the root confirms that cwd.
- **Memory headroom.** Each file now gets its own heap. The heaviest, ac88-dark, peaks at 968 MB of 2096 MB alone; ac92-glance-boxes peaks at 111 MB. ac88 is now the file to watch as later stages add walks to it.
- **AC15 is not weakened.** It is still an exact string match, and its other assertions are unchanged. Its only problem is that it pins a command the spec doesn't name (B1).

**AC92 (d), the run-heading call: met as written**
- **The CSS** (sandbox.css:1053–1057): `.v2-runh` is `--ink` at 600, still `var(--t-label)` at 11 px. `.v2-runh ~ .v2-runh` adds `margin-top: 8px; border-top: 1px solid var(--line)`. No new token.
- **Chromium agrees** (g9-runs captures at 360, light and dark):
  - Alpha's Build: Build-i1 run 3, Build-i2 run 2, Build-i1 run 1.
  - gates' Launch: three Launch-i1 runs.
  - text's Build and Design.
  - In all of them the headings are 600 and `--ink`, the first heading has no rule, each later one has a 1 px `--line` rule with 8 px over it, and the group headings stay 500.
- **The case** (ac92-glance-standard.test.mjs:207–256) finds each run by its own key and run number, and holds two or more runs sharing one key. Five seeded CSS defects all fail it:
  - no rule
  - weight 500
  - `--ink2`
  - a rule on every heading, the first included
  - `--line2`

  The guard in ac88-dark also catches a rule on the first heading.
- **G9_ONCE** (ac88-dark.test.mjs:1415–1434) is extended by exactly the changed declarations, split into first heading and later headings, matching the `~` selector. It is still checked set-equal.

**My round-1 notes, all repaired, nothing weakened**
- **N1:**
  - The every-screen walk's minimum is now `> 200` (ac92-glance-boxes.test.mjs:212).
  - `quiet`'s walk is back (:186).
  - G9_OPENS goes through okBadCheck again (ac88:841–849) and through sameLook (ac88:1713–1721).
- **N2:** fixtures/README.md:949 is true again.
- **N3:** each function has its own doc comment again (sandbox.js:1433, :1440).

**What I ran** (scratch worktree at b616b32, since removed; /home/user/sd-g9 is clean at b616b32)
- Build: PASS.
- surface_guard on 5775574..b616b32: OK, 8 commits, all `builder`, each with `Spec: S-001`.
- The full `npm test` and the one-process run, as above.
- Seeded defects and captures, as above.

**Note (non-blocking)**
- G9's row lists the run-heading captures as "light and dark, at 360 × 740 and 414 × 896". 625f24f defines them through the same tool as the other g9- captures. I checked only the 360 px ones.

**Open question, for the Orchestrator and Definer:** clear B1 by (a), a spec note adopting the per-file command, or by (b), revert plus the row's fallback. (a) is less work, since the change already works.

Run-heading captures: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots2/
The one-process run's output: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/r2-dir.txt (the heap error is at line 6980).
