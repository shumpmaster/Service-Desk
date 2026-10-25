Verdict: PASS

The Reviewer's verdicts on G9 (PR #240), verbatim: round 1 at f9b5d9a (PASS), round 2 at b616b32 (FAIL), round 3 at 162169d (PASS). Main, with G8d landed (#239), was merged into G9's branch after round 3 by the orchestrator, keeping both sides of each conflict, with the Definer's figures from the merged run (71878ec); the full suite passes on it, 1322 of 1322. Recorded by the orchestrator.

## Round 1
Verdict: PASS

G9 at f9b5d9a passes against specs/S-001.md as it stands. I judged G9's row (:2598), its build-plan line (:17497), AC92 (e) (:9446–9493 and the (e) test line :9525) and AC83's changed note (:7838–7843), using the starting per-screen list in the table as the list. The PASS holds only for that list. The spec's precondition is still open: the Design reviewer's list is not yet written into AC92 (e)'s table, and their run-head call (AC92 (d)) is not yet written either. The items under "Depends on the Design reviewer's call" below need re-review if that call changes the list.

**Blocking findings:** none.

**What I ran** (scratch worktree at f9b5d9a, since removed; /home/user/sd-g9 is clean on build/builder/g9):
- Build: PASS, 36 page modules in step, so src/public/lib/projectpage.js matches src/lib.
- surface_guard on d968b1e..f9b5d9a: OK, 8 commits, all `builder`, each with `Agent-Session:` and `Spec: S-001` trailers.
- Test files:
  - ac92-glance-boxes plus ac83-page: 27/27 pass.
  - ac88-dark: 6/6 pass, so G9_ONCE was met in both themes.
  - Full `npm test` (one process): 1313/1313 pass.
- Seeded defects in a throwaway copy, every one caught:
  - A display-key-only block lookup in `pageSprints`: the made-up project's tally became "1 sprint · none merged yet" where 5 sprints are expected.
  - Summing per run, or per phase, instead of counting each sprint once: caught by the pure test.
  - "0 of 0" when T is 0.
  - A border on `.v2-anchor`: failed three AC88 walks and the AC92 test.
  - A wrong `gap` on `.v2-anchor`.
- The base (d968b1e) ac83-page.test.mjs, run against G9's code: 23/23 pass.
- `g9-` Chromium captures: all 44 made. Nothing scrolls sideways and nothing is cut.

**The checks you asked for**
- **Locked tests.**
  - ac92-glance-boxes.test.mjs:1 and :4 carry `ac-test: S-001/AC92` and `S-001/AC83`.
  - It covers every clause of (e)'s test line: a box only where the table names one; never in a card, tile or sheet; never around an agents' gap; no box beside the Done lane; Home's five lines; the why line with no ground.
  - AC83's two cases are rewritten in their own commits, 30ed8d7 and 7fa6dd7, and named in their titles.
- **AC83 rewrites.**
  - Neither old case failed on the new code, so the rewrites were not forced by a failing check. The row names them, though, and they lock the new look.
  - The diffs are additions only. Every old assertion survives, so nothing is weakened.
- **G9_ONCE** (ac88-dark.test.mjs:1401–1418): exact and set-equal (:1749).
  - It pins exactly the CSS diff: `.v2-anchor`'s six declarations, `.v2-tally b`'s weight and colour, and the three declarations taken off `.v2-callout`.
  - The border mutation proves nothing outside it gets through.
- **The tally** (projectpage.js:507–526):
  - R and T come from `mv.sum`, the same sums as the head.
  - Sprints are deduplicated by id across every run on the page.
  - Each run's block is found by the run itself through `blockOf`. Only `mix`'s Alpha, with two runs both keyed "Build-i1", tells that apart from a display-key lookup, and the page test catches it.
  - When T is 0 it reads "no milestones tracked yet · no sprints filed yet", with nothing bold.
  - When the Timeline isn't drawn it reads "sprints not available".
- **v2.5 and never-read pages:** the box holds the sentence alone, and both are tested. A page that couldn't be drawn at all (sandbox.js:4791) has no box.
- **Fixtures:** `fiveLinesState`, `G9_OPENS` and the pure case's sprint views are all labelled NOT real in glance-fixtures.mjs and in fixtures/README.md.

**Notes (non-blocking)**
- **N1. The memory fix (f9b5d9a) does weaken one assertion, despite its message saying "with no assertion weakened".**
  - The every-screen walk's minimum at ac92-glance-boxes.test.mjs:212 dropped from `> 150` to `> 100`. I measured the walk: 229 screens now, 320 before. So `> 150`, or better `> 200`, still passes, and the drop bought nothing.
  - Coverage was cut, compared with the Builder's own earlier commits (nothing landed or locked before G9 lost anything):
    - `quiet`'s every-screen walk is gone; only its page is still checked.
    - `text`'s walk is gone, but `mix` contains it, so that one is fair.
    - G9_OPENS no longer goes through AC88's okBadCheck or the stage-8 guard's sameLook. G9_ONCE's set-equality still proves the guard reaches every pinned element, and pageBox and doneOnly cover the colour checks on G9's own screens.
  - Fix in any fix round: put the minimum back.
- **N2.** fixtures/README.md:949 still says G9's walks in ac88-dark.test.mjs open these made-up parts. Since f9b5d9a they don't.
- **N3.** sandbox.js:1433: `milestonesNode`'s old doc comment now sits on top of `pageMilestones`'s, two stacked, so `milestonesNode` has none.
- **N4.** `tallyAgrees` (ac92:291) only checks that the page's sprint count is at most the sum of the phases' counts. "Each sprint once" is locked by the pure test (ac92:80–92) and by the exact tally strings, so this is adequate, just loose.

**Heap note**
- **How close:** the peak used heap during the full run was 2004 MB against a 2096 MB limit (default on 16 GB). That leaves about 92 MB, roughly 33 more page loads.
  - I measured about 2.8 MB kept for good per `loadSandbox`, because each load imports sandbox.js under a new URL and it is never freed.
  - The run took 19 minutes, with GC slowing it near the limit.
  - The repo is public, so CI's ubuntu-24.04 runner has 16 GB and the same limit. CI has the same headroom.
- **Is a bigger heap in src/package.json safe?** For example `node --max-old-space-size=4096 --test ../tests/desk/`.
  - Mechanically yes: src/** is the Builder's surface, both CI workflows call `npm --prefix src test`, and 16 GB holds it easily.
  - But it only postpones the problem: growth stays linear, so 4 GB buys about 700 more loads, and runs stay slow.
  - It also departs from the command the spec quotes word for word (S-001:14061: "`npm --prefix src test`, which runs `node --test ../tests/desk/`"), so it needs the Definer's note.
  - The root fixes are to stop the per-load leak in sandbox-helpers.mjs:183–186, or to run each test file in its own process. Each of those also changes :14061 or index.js's design.
  - Recommendation: do it as its own small change with a spec note, not inside G9. Carry it as a risk now, because the next stage that adds about 35 loads will run out of memory.

**Depends on the Design reviewer's call**
- **D1. The list itself.** The Builder built the starting list: Home's briefing; on a project's page the sentence plus the tally; nothing elsewhere. The waits row is left out of the box, citing round 2's reason. The comments in sandbox.js and ac92:8 say "as the Design reviewer's list names". That is true of round 2's list (docs/design/audit-2026-10-24-round-2.md §2, the Design reviewer's), but not yet of the list the spec asks for in G9's plan. The merge waits on that list being written into the table and matching what is built.
- **D2. Run head vs group heads** (AC92 (d), build-plan :17497): nothing is built. It waits on the call.
- **D3. The look at 360 px:**
  - On the real records the "one-line tally" wraps to two lines mid-phrase ("9 merged, 8 / not read"); it fits on one line at 414.
  - The strip's now-arrow sits 3 px under the box.
  - The capture that shows both: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots/g9-page-text-360x740-light.png
- **D4. Boxing a sentence with no tally:** the v2.5 page's "Sprint … is open. Nothing waits on you." and a never-read page's "Where it's heading: not available until the project's records are read." Both are a fair reading of "a project's page", but the Design reviewer should confirm a box around an unknown.

**Join-up (end of Build, parts together):**
- The page's box reuses the briefing's look exactly, in both themes: `--bg2` ground, 12 px radius and padding, `4px 10px` gap, no edge.
- The tally's R and T equal the head's sums and the phases' lines (checked on two pages).
- The why line now matches the agents'-gap grey used elsewhere.
- Waiting's only filled ground is still the Done lane.
- No blocking difference.

**Open questions**
- D1 to D4 are for the Design reviewer.
- The heap fix is for the Definer and Orchestrator.

Captures for the Design reviewer: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots/ (44 PNGs). Their per-capture readings are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots.txt

## Round 2
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

## Round 3
Verdict: PASS

B1 is settled. At 162169d the spec matches what is built. I compared the spec only (`git diff b616b32 162169d -- specs/`, one file, +43/−19), read-only, with no suite rerun, as you asked.

**What c901fe5 changes, checked against the build**
- **Toolchain "Test command"** (specs/S-001.md:14104–14110):
  - It now says `npm --prefix src test` runs `node --test ../tests/desk/*.test.mjs`, one process per file, and that AC15's case pins it at tests/desk/j7-config.test.mjs:80.
  - That matches the build: src/package.json has that script, and line 80 of j7-config.test.mjs at 162169d is `assert.equal(pkg.scripts.test, 'node --test ../tests/desk/*.test.mjs');`.
  - It also says npm runs the script from src/ and the shell expands the glob there. That matches what I found in round 2: the same 103 files as index.js's list, and 1314 tests, all passing.
- **Known limits, after the glance audit, 1** (:15761–15785) is now marked resolved by ae48d55, with the one-file limit that remains.
  - Its figures fit my measurements: 2004/2096 MB before, the one-process form dying at the heap limit, 1314 tests in 103 files.
  - Its ac88-dark peak (about 1165 MB, the Builder's figure) is above my 968 MB. My monitor only sampled every 2 s, so the spec's figure is the safer one to keep.
- **G9's row** (:2598) now ends with an "as built in round 2" list naming all eight commits and what each did, including ae48d55 and the AC15 pin.
  - "The one-process suite's heap is not part of G9" is gone from the row and from the build plan (:17605–17610).
  - The phrase survives only in the lineage header (:4), as the history of the earlier draft, which is right.

**Notes (non-blocking)**
- **N1. One sentence is inaccurate.** The Toolchain line (:14110) says "`node --test ../tests/desk/` still runs every file, in one process, through tests/desk/index.js". It doesn't finish.
  - At b616b32 that form died with "Reached heap limit" after 1157 of 1314 tests, reported as `not ok 1 - ../tests/desk`. Known limits 1 says so itself.
  - The same claim appears in tests/desk/index.js:7 ("so the directory form still runs") and in tests/desk/package.json's description.
  - Suggested wording: "still loads every file in one process, but runs out of heap before it finishes; use the per-file command". The Definer would fix the spec line; the Builder owns the two files in tests/desk.

The output of that one-process run is at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/r2-dir.txt (the heap error is at line 6980).

