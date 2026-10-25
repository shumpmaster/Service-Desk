Verdict: PASS

The Design reviewer's verdict on G8b (PR #235), verbatim: round 1 at d670832 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: PASS

**Plain summary for the owner.** After G8b, the row you just moved on Plan carries a small grey word, "moved", on its own line under the row's code line, next to the light-grey edge G7 drew. Before, the edge alone was hard to see: 1.45:1 in light and 1.58:1 in dark. The word is readable (6.40:1 in light, 7.72:1 in dark) but quiet: 12 px regular, in the same grey as the code line, with no colour, icon or box. Gold still appears only on the next-to-reach row. Nothing else on Plan changes position or width; the rows below the moved one move down by that one line. A screen reader still says "moved" once. Nothing scrolls sideways at 360 or 414 px. The "now" arrow and the word don't crowd each other when the moved row is also the next one to reach: the arrow is in the left margin, level with the icon, and the word is about 50 px lower, at the bottom of the text column. One thing to look at yourself: when every row also carries small grey "Estimate: not made yet" lines, the word is one more grey line among them and stands out less (pair 04).

**Evidence by checklist item** (tree-before 73a207d, tree-after d670832; captures in `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8b-design/`)
- **Diff:** `src/public/sandbox.css:1272` adds `.v2-plmoved { font: var(--t-small); color: var(--ink2); }`. `src/public/sandbox.js:3778` adds the span on the moved row only, with `aria-hidden="true"`. No other source changes.
- **1 (rulings) and 2 (spec, AC24's note as amended):** matches P-001-glance-moved-word.md B and AC24's note:
  - the word is inside `a.v2-plrow > .v2-prt`, 2 px under `.v2-plm`, 0 px from the name's left edge, on 1 line;
  - it shows on the moved row only (`moved li` is one row in every capture);
  - it is gone at the next move: after M3A up then MD1 down, only MD1 carries the edge and the word.
- **Nothing else moved (geometry):** I compared the position of every element, before against after, in 40 states (both sizes, both themes). No element changed its left edge or width, so the name keeps its full column (225, 279, 153 and 207 px, as before). Heights changed only on the moved row and the elements containing it; in ⇅ the row's two move buttons grow with it. Everything below the row shifts down 18–19 px.
- **10 and 25 (contrast):**
  - Word, light: rgb(92,95,102) on #fff = 6.40:1.
  - Word, dark: rgb(162,165,172) on rgb(15,16,18) = 7.72:1.
  - The edge is unchanged at 1.45:1 and 1.58:1; it is drawing, not text, and now carries a word, so it isn't the only signal.
- **12 (width):** no sideways scroll in any of the 24 g8b- captures or my 40 extra captures, at 360×740 and 414×896, light and dark.
- **13 and 14 (colour alone, one meaning per colour):** the word is `--ink2`, never `--gold` or `--you`. The gold ring and arrow appear on exactly one row (the next to reach) in every capture.
- **Screen reader:** the moved row's link is read as "4th of 6, moved The chosen design running on the real back end MD3 · Design · about 3–5 days : No work filed yet · next to reach 25–30 Oct", with "moved" once. The visible word is aria-hidden.
- **8, 23 and 27 (type):** 400 12px/16.8px IBM Plex Sans (fonts confirmed loaded), on mockup v2's scale. The code line stays 11 px Plex Mono. Mockup v2 doesn't draw a moved row, so part B goes no further than sizes.
- **Arrow and word together** (my own states, with MD3, the next-to-reach row, moved up and down, ⇅ open and closed): at 360 px closed, the arrow is 6×8 at x=4, y=428 and the word is at x=50, y=477. With ⇅ open the word is at x=78, y=609. They never touch.
- **Long made-up name (NOT real):** 360 px closed, the name takes 5 lines and the word 1; ⇅ open, 8 lines and 1; 414 px, 4 and 6 lines. The name is never cut.
- **Tests:** the full suite on tree-after (`node --test 'tests/**/*.test.mjs'`) passed 1269 of 1269, including the new `ac24-g8b-moved-word`, `ac24-work-ahead`, `ac88-dark` and `ac92-glance-palette`.
- **6 (every project):** captured with `text` (Service-Desk), the long-name state and `gates` (the made-up project, two projects in one list). `poom` has no Plan rows to move ("It runs on the older pipeline…"), so the word can't appear there.

**Blocking findings:** none.

**Non-blocking notes** (problems that were there before G8b, to file as follow-ups):
1. Item 1 and AC24's placement: on a moved row with under-lines ("Estimate: not made yet", "Rough finish: not available…"), the under-lines start at x=60 while the name and the word start at x=78. G7's 8 px edge padding indents only the link, not `.v2-plunder`. This dates from G7; G8b makes it a bit more visible because the word now sits right above those lines (pair 04).
2. Item 16 / long text: at 360 px with ⇅ open, code lines break inside the range, e.g. "about 3–" / "5 days". The before tree does the same.

**Questions for the owner** (asked, not picked):
- Q1: When the rows around the moved one also carry small grey estimate lines, the word reads as one more grey line (pair 04). Is that enough for you, or do you want it to stand out more in that case? This would be a new ruling; the build matches B as written.

**Owner pairs** (in `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8b-design/owner-pairs-final/`, before on the left, after on the right, one phone screen with the moved row in view):
- `01-moved-row-360-light.png`: M3A moved up, ⇅ closed; the word under the code line. Made-up estimates and move, NOT real.
- `02-long-name-in-ordering-360-dark.png`: the long made-up name moved up, ⇅ open; the name is whole and the word is on its own line. NOT real.
- `03-moved-row-is-next-to-reach-414-light.png`: the gold, arrowed row is the moved one; the arrow and the word sit apart. Made-up estimates and move, NOT real.
- `04-word-among-grey-lines-414-dark.png`: the made-up project's MD3 moved, with rows that have no estimate; the word among the grey lines (Q1, note 1). NOT real.
