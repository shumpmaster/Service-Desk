# M3E stage G8b: the Reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8b at d670832 (G8b's work over 73a207d).

---

Verdict: PASS

The work is G8b of M3E: `git diff 73a207d d670832` on build/builder/g8b, six commits. I checked it against specs/S-001.md: G8b's row in the stage table (line 2595), AC24's note as amended (around 10456–10483), AC92 (a)'s added clause (8965–8966) and the G8b build-plan bullet (17071–17081). I could not refute it. I did not read the Builder's summary.

**What I ran** (in a scratch worktree at d670832, now removed):
- `node --test` on ac24-g8b-moved-word, ac24-work-ahead and ac92-glance-palette: 45/45 pass.
- `node --test tests/desk/ac88-dark.test.mjs` (the AC88 cascade and the stage-8 guard): 6/6 pass.
- `surface_guard.py diff --range 73a207d..d670832 --branch build/builder/g8b`: OK, 6 commits.
- `glance-shots.mjs … g8b-` in Chromium: all 24 captures (3 states × ordering open/closed × 360×740, 414×896 × light/dark) report:
  - the word on 1 line, 2 px under the code line, 0 px from the name's left;
  - the name "whole" in every capture, the long made-up name included (5–8 lines at 360 px);
  - no "CUT", "NOT hidden" or "NOT on the moved row" flags.
- I viewed two of the captures; both match the spec.

## Blocking findings
None.

## The points you asked about
- **Every test G8b's row lists is there:**
  - AC24's moving case and G7's Plan case extended in place;
  - the word's place and "said once": tests/desk/ac24-g8b-moved-word.test.mjs:89-127;
  - its look in light and dark from the cascade: :132-165;
  - its own line at 360 px in and out of the ordering, the name not cut, the long made-up name: :170-218;
  - absent on rows not moved, gate cards' rows and the sheet, gone at the next move and when a newer plan sets the draft aside: :223-273;
  - the AC88 want-list entry: ac88-dark.test.mjs:629-640 and :787;
  - `G8B_ONCE`: :1276-1300 and :1587-1590;
  - the `g8b-` captures: glance-shots.mjs:176-183.
- **Nothing dropped or weakened:** the diffs of ac24-work-ahead.test.mjs and ac92-glance-palette.test.mjs are additions only, apart from the case titles. AC24's locked `['3', '3rd of 6, moved']` (ac24-work-ahead.test.mjs:470) is unchanged and passes. The word is aria-hidden, and "moved" is read once in the link and once in the whole row (ac24-g8b-moved-word.test.mjs:120-122). M3B's "4th of 6, moved" was added after the Enter move.
- **`G8B_ONCE`:** exact (font, colour, and computed size, line height and colour), per theme, on `li.v2-plli.moved > a.v2-plrow > span.v2-prt > span.v2-plmoved`. It has a set-equal check (:1587-1589), and only after that check does the final "nothing else excepted" regex admit `G8B ` (:1590). `G[12345678] ` cannot match `G8B`.
- **Made-up fixtures labelled NOT real:** `G8B_LONG` carries "NOT real" in the text itself. `longNameState`, `G8B_OPENS` and the newer plan are labelled in tests/desk/fixtures/README.md:855-870 and in the code comments. `longNameState` throws if Service-Desk's M3B line changes.
- **Rows keyed by identity:** the code keys `moved` by `r.key` (sandbox.js:3757), and the word uses that same flag as the edge. The next-move case finds rows by "<project>|<id>" (ac24-g8b-moved-word.test.mjs:247-255). See N1 for one gap.
- **54c2cf0 (`PRE_G7_ONCE`): exact, correctly attributed, and the right call.**
  - Attribution: `git log -S'.v2-plli.ord:not(:has(.v2-plunder))'` gives only 22eca92 (2026-10-23) and 00446a5 (2026-10-24). `-S'minmax(24px, 1fr)'` gives only 00446a5, and so does the buttons' `height: auto`. All are "Stage 6a after MD3" commits, and bd4097d is an ancestor of 22eca92, as the comment says.
  - Exact: the before-values match the bd4097d copy (tests/desk/fixtures/stage8/sandbox-bd4097d.css:1372-1373, `grid-row: 1 / span 2`, `grid-auto-rows: 32px`, `padding: 6px 0`, `.v2-plmv height: 32px`). The after-values are 00446a5's rules. Each is pinned to its own element: the bare ordering row's `div.v2-plmove`, and `button.v2-plmv` inside one. The PRE-G7 set-equal check is unchanged, so every new pin must actually be met and nothing else is admitted.
  - New coverage, not a loosening: at 73a207d no guard walk opened the ordering. The only `plan-order` taps were in glance-fixtures' G7 open, which closes it again.
  - Right call: it follows G8's round-2 precedent (stage 6a's `sb-mkw`). The commit is on its own, and its message gives the reason. Under the house rule ("the locked cases G<n> changed outside its row, each forced and named") it is forced once the guard walks the ordering, and it adds coverage instead of leaving the ordering unwalked (G7b's alternative).
  - It is not yet named in G8b's row (see N2).

## Non-blocking notes
- **N1 (test strength, rows by identity):** in `gates` with the ordering open, both Service-Desk and Alpha have an MD3 row. ac24-g8b-moved-word.test.mjs:97 and :114 identify the moved row only by `data-row === 'MD3'` and the code line starting `MD3 · `, and the group check at :98 is skipped when the ordering is open. So in that view the first test does not confirm the word is on Alpha's MD3 rather than Service-Desk's. Reproduce: open "Plan with a gate card, Alpha's MD3 moved, the ordering open"; both MD3 rows' code lines match `/^MD3 · /`. Nothing in the code is wrong (keyed by `r.key`), and a defect that marks both rows is caught by `moved.length === 1`. Suggested tightening: assert `movedRows(app)[0] === up(keyed(app, \`wa-down:${project}|${id}\`), li)`.
- **N2 (record):** the PRE-G7 addition is a locked case changed outside G8b's row. It is named in its commit (54c2cf0) but not in the spec's G8b row. As with G7b and G8, the pull request body should name it, and the Definer may want to write it into the row.
- **N3:** the "the same in each theme" claim for the PRE-G7 pins is not checked per theme (the keys carry no theme). That matches the existing `sb-mkw` entry, and these declarations do not depend on the theme.

## Open questions
None.

Files: /home/user/sd-g8b/tests/desk/ac24-g8b-moved-word.test.mjs, /home/user/sd-g8b/tests/desk/ac88-dark.test.mjs, /home/user/sd-g8b/src/public/sandbox.js, /home/user/sd-g8b/src/public/sandbox.css. The captures are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots/.
