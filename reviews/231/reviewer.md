Verdict: PASS

The Reviewer's verdicts on G8 (PR #231), verbatim: round 1 at 16e05bd (PASS), then round 2 at 3c4bb80 (PASS). Recorded by the orchestrator.

## Round 1
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

## Round 2
Verdict: PASS

Round 2 of G8 at 3c4bb80 passes: the round-2 commits do what G8's row asks, and no merge resolution drops either side or weakens a check. I judged the Builder's commits 23e634d and 75bee71 and the merge resolutions in e975d3f and 3c4bb80, against G8's row (specs/S-001.md:2594) and AC92 (b) (:8942 on) as the Definer's notes f7781f3 now leave them.

**What I ran,** in the scratch worktree /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g8r2 at 3c4bb80:
- **Targeted test files, all pass:**

  | File | Result |
  |---|---|
  | ac92-glance-arrow | 8/8 |
  | ac88-dark | 6/6 |
  | ac57-58-65-phases | 19/19 |
  | ac82 | 27/27 |
  | ac83 | 23/23 |
  | ac84 | 16/16 |
  | ac86 | 19/19 |
  | ac92-glance-palette | 10/10 |
  | ac91-g7b-since-missing | 11/11 |

- **`node tools/build.mjs`:** PASS.
- **G8's source is untouched since round 1.** The only src/ changes since 16e05bd are G7b's: `.v2-smiss`, `sinceReads` and `sinceMissingLines`.
- I did not run the full suite; the Builder reports 1265/1265.

**23e634d: the stage-8 guard walks the Timeline with every sprint opened. It matches G8's row.**
- The walk no longer leaves out the "Timeline, every sprint opened" screen. On that screen it asserts that a sprint's ✓ and ✕ are drawn and that G8's single arrow sits on the Now line.
- **G7_ONCE gains two entries,** each pinned per theme to its own element:
  - a sprint's ✓ (`span.v2-okm`): declared and computed colour and weight, from --ink2 at 400 to --ok at 600;
  - a sprint's ✕ (`svg.v2-k.v2-smk`): `color: inherit → --bad`.
  
  The key requires the mark to sit inside an `sb-mkw` word inside `.v2-stats`.
- **PRE_G7_ONCE** holds one declaration on one element: `span.sb-mkw` in a Timeline's `.v2-stats`, `min-height: (none) → 24px`.
  - I confirmed where it comes from: `git log -S` traces sandbox.css:1335 to dc6325c ("Stage 6a after MD3"), and it is absent from the stage-8 baseline sandbox-bd4097d.css.
  - It has its own exact set check (`^PRE-G7 `), and the closing regex admits only that prefix.
- sameLook's order is G7 → PRE-G7 → G7B → G8. No key overlaps another, so the order changes nothing.

**75bee71: the two test gaps from my round-1 N4 are closed.**
- **AC57 case:** "↑ start at the foot" is now asserted exactly once on the page. The one innermost element holding it is in `ms-h`, in words of its own, and the opened phase holds none.
  - `El0` is imported (ac57-58-65-phases.test.mjs:11).
  - This makes the assertion stricter; nothing is weakened.
- **Tile case:** `sprintsState(0)` is added, and both v2.5 "none" cases now also assert that the drawing is drawn, so "none" can't pass on a tile that has no drawing.

**e975d3f: the merge of G7b keeps both sides whole.**
- I read the remerge-diff of all four conflicted files. Then I checked mechanically against the merge base ba948fb: every line either side added is in the merge result, except lines that the merge deliberately combined (the import, the comments, the closing regex, `made.push`), and no line either side removed comes back.
- **ac88-dark.test.mjs:**
  - G7B_ONCE, G7B_KEY and G7B_EXCEPT come before G8's three, all whole.
  - sameLook tries G7b's exception, then G8's.
  - Both exact set checks are kept.
  - The final "nothing else excepted" regex is `G[12345678] |G7B ` (and, after 23e634d, `|PRE-G7 `). `G7B ` doesn't match `G[1-8] `, so G7's and G7b's sets stay apart.
  - The G7 want-list keeps `'ink: Plan\'s ideas'` and G7b's grey missing line.
  - The import carries both `G7_OPENS` and `G7B_OPENS`.
- **glance-fixtures.mjs:** keeps `nowShared` and `sprintsState` whole and still labelled NOT real.
- **fixtures/README.md:** has the G7b section, then the G8 section.
- **glance-shots.mjs:** imports `nowShared`, `sprintsState` and `EXT_LONG`; the g7b- and g8- captures are both present, and the printed line carries both the missing-line and arrow notes.

**3c4bb80** merged G7b's fix 9fcc448 with no conflict.

**AC92 (b) as it now stands:** the Definer confirmed my round-1 N1, N2 and N3 as built and tightened the strip's 9 px wording to what was built. No build change was needed, and the code matches.

**Blocking findings:** none.

**Non-blocking notes for the Orchestrator at landing**
- **R2-N1: the surface guard fails over this round's range unless the Definer's notes land first.**
  - `surface_guard.py diff --range 16e05bd..3c4bb80` fails with 14 violations. All of them are non-builder commits that came in through the orchestrator's merge e5a19b4, mostly main's own history.
  - From main's tip (`c907c96..3c4bb80`), one is left: the Definer's f7781f3, which is only on build/definer/g8-notes and this branch.
  - Land the Definer's G8 notes on the push branch first, as was done for G7 (6094fb6). Then the guard over main..build/builder/g8 should be clean.
  - The builder-only commits pass: `e5a19b4..3c4bb80` gives OK, 10 commits.
- **R2-N2: G8 now contains G7b's unreviewed work.** G7b is under its own review, so G8 should land only after G7b passes. If G7b changes in its review, G8 needs that change merged in again before it lands.

**Open questions:** none.

I left two scratch worktrees in place. Remove them with:
- `git -C /home/user/sd-g8 worktree remove --force /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g8`
- `git -C /home/user/sd-g8 worktree remove --force /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g8r2`
