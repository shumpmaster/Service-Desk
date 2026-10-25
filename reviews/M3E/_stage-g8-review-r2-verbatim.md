# M3E stage G8: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8 at 3c4bb80 (round-2 commits 23e634d and 75bee71, with the merges e5a19b4, e975d3f and 3c4bb80, on 16e05bd) (G8's work over 1382866).

---

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
