# M3E stage G8: the Reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8 at 16e05bd (G8's work over 1382866).

---

Verdict: PASS

I reviewed `git diff 1382866 16e05bd` on build/builder/g8 (commits 37bd04a and 16e05bd) against specs/S-001.md (G8's row at :2593, AC92 (b) at :8902–8920, its test at :9075–9083, and the changed notes for AC82, AC83, AC84 and AC86) and P-001-glance2-arrow.md (Ruling A). I did not read the Builder's summary.

**What I ran,** in the scratch worktree /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g8 at 16e05bd:
- **Full desk suite** (`node --test ../tests/desk/`): 1254 tests, 1254 pass, 0 fail.
- **The files G8 touches,** run on their own: ac92-glance-arrow 8/8, ac88-dark 6/6, ac57-58-65-phases 19/19, ac82 27/27, ac83 23/23, ac84 16/16, ac86 19/19.
- **`node tools/build.mjs`:** PASS. The src/public/lib copies of home.js, projectpage.js and workview.js are byte-identical to src/lib.
- **`governance/checks/check_all.sh`:** all pass. `surface_guard.py diff --range 1382866..16e05bd --branch build/builder/g8`: OK, 2 commits.
- **Chromium captures** (`glance-shots.mjs … g8-`), 56 captures in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots. The measurements match AC92 (b) and the round 2 mock (changes2.js q3):
  - tile: 6×8, 3 px left of the icon, centred on it;
  - strip: 10×6, centred on the bar, 3 px above it;
  - opened phase: 6×8, centred on the line and on the icon;
  - Plan: 6×8 at x 4–10, in the margin, level with the icon;
  - Timeline: 8×10, 0.3 px off the rail's centre.
  
  Every arrow is hidden from assistive technology. The v2.5 page with two open sprints shows no arrow. I looked at g8-page-design-360x740-light.png and the strip arrow sits clear of the sentence.

**Checks you asked for**

1. **Placed by the run itself, never the `<Phase>-i<n>` key: confirmed in all three files and their copies.**
   - home.js:415: `d.run === ctx.now`. The dot carries its run object (feed.js:138).
   - projectpage.js:145: `nowRun === ctx.now`.
   - projectpage.js:484: `r === ctx.now && x.rule === 2`. Rule 2 only ever holds in the now run (feed.js:100).
   - workview.js:271 (Plan): `state.rule === 2`. Plan's `stateOf` (workview.js:37) finds a milestone's run by its id, so I checked it isn't a key-style collision. It is safe:
     - a milestone's sprints and `reached` are the same in every run that holds it (timeline.js:427);
     - the now run is the earliest run holding an unfinished milestone (sandbox.js:173);
     - so the first run holding the next-to-reach milestone is always the now run.
   - The tests use `nowShared('build')` (two Build-i1 runs) and `nowShared('launch')` (three Launch-i1 runs) on the Timeline, strip, tiles, Plan and opened phase.
2. **Locked cases.**
   - The AC82, AC83, AC84 and AC86 cases are named in G8's row; each is rewritten with a comment saying why.
   - The AC57 case is in a file the row doesn't name. It is rewritten in its own commit (16e05bd) with the AC92 (b) quote as the reason, and nothing else in that file changes.
   - Nothing is weakened. The removed assertions pinned the up-arrow and the Now line's `::before` bar, which AC92 (b) removes, and each was replaced by an assertion that it's gone plus a pin on the new arrow. AC84's heavy-rule loop is actually tighter: its exemption narrowed from `::(before|after)` to `::after`.
   - No other test file changed apart from the AC92 test, the ac88 guard and the fixtures.
3. **G8_ONCE** (ac88-dark.test.mjs:1071–1119) is exact and set-equal.
   - Each declaration is pinned to its value per theme and to its own element. The keys check tag, classes and parent: `s-now` for the tile, `.v2-ph.now.here` inside `.v2-strip`, `.own.here` inside `.v2-sml`.
   - :1356–1359 asserts that the G8 exceptions met equal G8_ONCE, and adds `G8 ` to the catch-all filter.
4. **Made-up fixtures:** `nowShared`, `sprintsState` and the graduation ruling are each labelled NOT real, in glance-fixtures.mjs, in fixtures/README.md (new G8 section), and in the m1.5 file's own text.
5. **v2.5, none open or two or more open:** no arrow, on both the tile and the strip (home.js:521 `open.length === 1`). This fits AC92 (b)'s "none where no run or sprint is now", and the page already says "Which sprint is open is unclear." The cases are tested: strip with 0 and 2 open, tile with 2 open.

**Blocking findings:** none.

**Non-blocking notes (risks for the gate's case)**
- **N1.** The spec doesn't say what happens with two or more open sprints. The Builder chose "none" (home.js:519–521), which is a reading, not spec text. Worth one line in AC92 (b) at the next draft.
- **N2.** The Timeline's Now line is also drawn when no run is now (feed.js:614–619, note "which run is now is not recorded"), so the arrow appears there too. The tile and strip show none in that state. That matches AC92 (b)'s unconditional "the Now line's mark becomes…", but it is a different behaviour from the tile and strip "none where no run is now". The Definer should confirm.
- **N3.** In Plan's ordering (⇅) there are no groups, so one flat list carries up to one arrow per project (tested as "the same rows"). AC92 (b) only says "one in each project's group".
- **N4.** Small test gaps:
  - The AC57 case checks "↑ start at the foot" with `>= 1` (ac57-58-65-phases.test.mjs:309), not "once"; AC83's head case pins it in the head.
  - The Home tile with no open sprint (`sprintsState(0)`) isn't exercised; only the strip is. The code makes it trivially true.

**Join-up review (end of Build, the parts working together):** one arrow shape (`hereMark`, `.v2-here`) is used on all five drawings. Its derivations agree: the arrow sits on the run marked now on the strip and tile, and on the next-to-reach row on Plan and in the opened phase. On every screen of `text`, `mix`, `gates` and `ext` there is an arrow exactly where the drawing has a now (test at ac92-glance-arrow.test.mjs:363). No blocking difference.

**Open questions:** N1 and N2, for the Definer or the owner.

I left the scratch worktree in place; remove it with `git -C /home/user/sd-g8 worktree remove --force /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g8`.
