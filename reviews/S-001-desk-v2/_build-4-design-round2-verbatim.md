# S-001 desk v2, stage 4 (the question and gate sheets): the Design reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-4 at 0be0d16.

---

Verdict: PASS

All four round-1 findings I re-checked are fixed. The numbered lists now show the file's own numbers, so the mixed question shows its "2." again and the sheet shows why the file can't be split. The two rows read as two parts to a screen reader. Closing a sheet opened from a card's "Answer" step puts the focus back on that step. The card's code words are drawn as code. The new default line is honest: a question with no default letter never claims one, and nothing on the board or Home counts it as settling itself. It does read a little awkwardly; that is a non-blocking point for the Definer. Nothing else on the desk changed. I found one new small risk, not blocking: the decision card's whole record now shows list numbers, but they come from the browser's count, not from the file. No real card today has a numbered list, so the owner sees nothing wrong yet. Nothing here is irreversible.

**Evidence base**
- Branch head 0be0d16, in a detached worktree. I compared it against 1862e4d (round 1) and 99a6437 (base).
- Playwright Chromium, at 360×740 and 414×896, light and dark.
- IBM Plex Sans 400/500/600 and Plex Mono 400 were confirmed loaded.
- Harness: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr4r2/ (copies of cap4, setups4, keys2, allsheets and cap3u). New in it: setup `pick`, which uses the real P-001-design-pick file plus a 48-hour variant and a long-DEFAULT variant; and the scripts p-lists.mjs, p-n3n4c.mjs, p-deccard*.mjs, accview.mjs and accshot.mjs.
- Captures are in dr4r2/shots/, dr4r2/ev/, dr4r2/cmp-head/ and dr4r2/acc-*/.
- The worktrees are removed.

## Round-1 findings

**B1: the record's list numbers and bullets. Fixed.**
- Design-lab-open's fold has one `<ol>` with 11 `<li value="1">` to `value="11"`, `list-style-type: decimal`, `padding-left: 20.8px`, 13 px Plex Sans. "1." to "11." render, in all four width and theme combinations.
  - Captures: dr4r2/ev/numbered-fold-{360,414}-{light,dark}.png and numbered-fold-9to11-*.png
- P-003-mixed's fallback renders `<ol><li value="2">`, and the sheet shows "2. A numbered line among lettered ones." under the line saying the lettered and numbered lines are mixed.
  - Captures: dr4r2/ev/mixed-fallback-*.png
- The gate fold's `## Context` and Options bullets are `disc`, at `padding-left: 15.6px`.
  - Captures: dr4r2/ev/gate-fold-lists-*.png
- The accepted views' record output is unchanged: no `value` attributes (see item 4 below).

**N3: the two rows' accessible names. Fixed.**
- The aria snapshot reads `button "Move to Done · then answer on GitHub"` and `button "The whole question · and the file each answer writes"` ("The whole card · …" on the gate). The same holds in all four combinations.
  - Data: dr4r2/ev/n3n4c-*.json
- The " · " is in `.sb-vh`, so it is not drawn. The row captures are pixel-identical to round 1: letters-q-irrev s0 and s1 show "same" in dr4r2/imgdiff-sheets.txt. The rows are still 44 px tall.

**N4a: focus back to the card's step. Fixed.**
- On the send-issue and next-work "Answer" steps, all four ways of closing return focus to `a.v2-step "Answer"` in the same card: Escape, Escape from the words box, a tap outside, and the close button. Opening from a title still returns focus to the title.
  - Log: dr4r2/ev/keys2-head.txt

**N4c: backticks drawn as code. Fixed.**
- There are 0 backticks left in the gate sheet's text.
- Six `code.v2-code` elements: approve, Reason: (twice), Into: <Phase>, Proxy:, launch-gate. Each is 12px/16.8px, weight 400, IBM Plex Mono: the same size and colour as the 12/400 Plex Sans around it, with no chip.
- Contrast is 6.4:1 in light (rgb 92,95,102) and 7.72:1 in dark (rgb 162,165,172).
  - Captures: dr4r2/ev/gate-code-opts-*.png, gate-code-foot-*.png

## 2. The default line (61b9e93)
- **Sheet:** "Reversibility: reversible · Default: per the question file: DEFAULT none — this is your pick and never defaults (AC43)".
  - Set in `.v2-mark` at 12/400 Plex Sans. It runs 3 lines (50 px) at 360 and does not scroll sideways. The 48-hour variant reads the same, with no clock and no time.
  - With a long DEFAULT naming no letter, it runs 5 lines (84 px) and still fits the width.
  - Captures: dr4r2/shots/pick-q-pick-*-s0.png, pick-q-pick48-*, pick-q-pickl-*
- **Board and Home:** the design-pick cards show no "Settles" line. Home still says "2 questions settle themselves" (next-work and mixed); the 48-hour variant is not counted.
  - Captures: dr4r2/shots/pick-board-*.png, pick-home-*.png
- **Design-lab-open** now reads "…DEFAULT none — these are yours and never default". Before, it read "defaults to none … (TIMEOUT not given)".

## 3. The decision card
- Stage 1a's "The whole record" on Alpha's Q-020 card now shows disc bullets on its Options list (`padding-left: 15.6px`). At r1 it showed `none` at 0 px. It looks right, with no sideways scroll.
  - Captures: dr4r2/ev/deccard-card-wt-dr4r2-360-{light,dark}.png against …-wt-r1-…
- See new finding R2-N1 below.

## 4. Other screens
- **Home, Waiting, Plan, project pages, Timeline and Team:** 124 captures, compared with round 1's cmp-new (1862e4d) and cmp-base (99a6437). Every pixel difference is the "checked N s ago" box. Once that age is masked, the text and computed-style dumps are identical: 0 of 124 differ against either commit.
  - Files: dr4r2/imgdiff-r1.txt, dr4r2/imgdiff-base.txt
- **Accepted (non-sandbox) views:** I crawled 34 views of the main fixture and 26 of `pick`, light and dark, on all three commits.
  - Main: 0 text differences.
  - Pick: only the DEFAULT `dd` of the four questions whose DEFAULT names no letter changed (design-lab-open, design-pick, pick48, pickl). For example, r1's wrong "defaults to A at Oct 21 14:30" now reads "per the question file: DEFAULT none — this is your pick and never defaults (AC43)".
  - Pixels: 52 of 60 views are identical; the other 8 are exactly those four questions, light and dark.
  - Files: dr4r2/imgdiff-acc.txt; capture dr4r2/ev/acc-default-_p_Letters_q_P_001_design_pick-light.png
- **Every sheet, every fixture:** 156 sheet opens (main 6, md-extremes 31, sdq 2; at 360 and 414, light and dark).
  - 0 page errors and 0 sideways scroll.
  - Sizes are only 11/400, 11/500, 12/400, 12/500, 12/600, 13/400, 13/500, 13/600, 15/400 and 18/600. Every text box is 16 px. The lowest sheet text contrast is 6.4:1.

## 5. Tests
- `node --test` on ac80-board, ac81-bar-type and ac48-62-63-look: 48 pass, 0 fail.
- I also ran ac85-sheets and ac11-12-views: 29 pass, 0 fail.

## New findings
- **R2-N1 (not blocking; item 2 through AC12 "the file rendered whole", and item 5).**
  - The decision card's whole record (sandbox.js:2309) still calls `renderMarkdown(v.fullText)` without `{ numbers: true }`. The new `.v2-sheet .sb-record ol { list-style: decimal }` (sandbox.css:977) therefore draws the browser's count, not the file's numbers.
  - Reproduction: a loose list (`1. …`, blank line, `2. …`, blank line, `3. …`) renders as three `<ol>`s that show "1. 1. 1.".
    - Capture: dr4r2/ev/deccard-loose-list-360-light.png
  - Not blocking because none of the 17 real cards in queue/ on origin/main has a numbered list.
  - Fix size: one argument.
- **R2-N2 (not blocking; items 8 and 19).** The default line stutters: "Default: per the question file: DEFAULT none — …". The accepted view does the same: the label "DEFAULT", then "…: DEFAULT none". The file's own words, "(AC43)" included, sit in the desk's body style, so the owner can't see where the desk's words end and the quote begins. It is honest and follows AC12's "per the question file" form, so the wording is for the Definer.
- **R2-N3 (already on 99a6437; follow-up; item 19).** The real P-001-design-pick has options A, B and C plus one unlettered "Font, with A or B:" line. Its sheet says the file "couldn't be split … (its lines are neither lettered nor numbered)", which is untrue. The text comes from src/lib/sandbox.js:760, unchanged since base.
  - Capture: dr4r2/shots/pick-q-pick-360-light-s0.png
- **Note, not a finding:** the "other" default line still has an empty icon gutter, as it did in round 1 (dr4r/shots/letters-q-nodefault-360-light-s0.png).

## Follow-ups
1. For the Orchestrator and Reviewer: round 1's open question about the locked test still stands. 574a728 edits tests/desk/ac80-board.test.mjs again (lines 97–100, the row string now with " · "); 99a6437..0be0d16 adds 11 lines and removes 3 in that file.
2. For the Builder, through the Orchestrator: R2-N1, i.e. pass `{ numbers: true }` at sandbox.js:2309.
3. For the Definer: R2-N2's wording; R2-N3; and N1, N2, N4b and N5 from round 1.
4. Left alone: the leftover scratchpad worktree "mainchk" (5326d07) is not mine.