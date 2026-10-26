Verdict: PASS

The Design reviewer's verdict on QW2 (PR #245), verbatim: round 1 at 8e530a5 (PASS). After round 1 only tests (2b1d664) and the spec's wording changed; no source or CSS. Recorded by the orchestrator.

## Round 1
Verdict: PASS

QW2 does what the picture shows. Every card waiting on the owner starts with "<k> of <N> waiting" on its own line, in the picture's type and colour (11 px Plex Mono, ink), always on one line and aligned with its kind line. That includes "10 of 12 waiting" at 360 px. A held question says "Being asked in your session" in grey. Each project numbers its own cards. The Kicked back strip now goes project by project, with the portfolio last. A card's sheet ends its small line with its place. While a sheet is open the places stay still, and they move once it closes. Home, a project page and Plan render the same as before QW2. Nothing scrolls sideways. All 1419 desk tests pass.

**How I checked.** Everything was read-only at 8e530a5, with the base at 1a145c9 (QW1 merged). My own scripts and captures are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw2-design/.
- I re-rendered all 20 `qw2-` captures with tests/desk/tools/glance-shots.mjs. They match the Builder's pixel for pixel, except for live ages that are a minute apart (for example "6 h 41 m" against "6 h 40 m").
- A Playwright probe (tools/probe.mjs, results in probe/probe.json) dumped the words, computed styles, positions and contrast. It covered 13 states, at 360×740 and 414×896, light and dark.
- `cd src && node --test ../tests/desk/*.test.mjs` (the `npm test` script): 1419 of 1419 pass.
- The CSS diff from 1a145c9 is 0 lines, and src/lib/board.js is byte-identical to src/public/lib/board.js.

## Evidence by checklist item

**Item 26, frames (part B), against the picture's frames 1 and 3**
- The picture's own measure log (scratchpad/m3g-picture/shots/measure.log:6-15) sets the target:
  - place line: 11px, weight 400, "IBM Plex Mono", rgb(24,25,28) (light `--ink`), 15 px tall, one line;
  - held line: rgb(92,95,102) (`--ink2`).
- The build gives exactly that in every state (probe.json):
  - font-family "IBM Plex Mono", 11px, 400, line-height 15.4px, letter-spacing normal;
  - light: rgb(24,25,28) on cards, held line rgb(92,95,102);
  - dark: rgb(236,237,239), held line rgb(162,165,172).
- Words: "4 of 12 waiting" (visible). The accessible text is "Place 4 of 12 waiting on you in Alpha", and "… in Portfolio" for the portfolio's cards.
- Position: the line is the card's first child in every one of the 34 place lines on the busiest board, with its left edge equal to the kind line's (difference 0 px). The gap to the kind line is 4 px on lane and section cards.
- Element captures that match the picture's cards: el/el-busiest-360-light-gate.png, el/el-busiest-360-dark-a10.png ("10 of 12 waiting · Hold") and el/el-busiest-360-light-held.png.

**Two-digit places at 360 px (AC95, "Where the place shows")**
- The widest line, "10 of 12 waiting", is 106 px wide in a 145 px box at 360 px and 106 of 172 px at 414 px.
- Every line is one line (counted from its text boxes), with no cut (scrollWidth ≤ clientWidth).
- The tool's own QW2 check printed "34 place lines, each on one line on its kind line's left edge" for all four busiest captures.

**The held question's line (AC95, "A held question"; reading (n))**
- Beta's held question reads "Being asked in your session", in `--ink2` Plex Mono 11px, at the head of Beta's group until QW3, with no number.
- Contrast is 6.18:1 light and 7.2:1 dark. It matches the picture's frame 1 card.

**The strip's new order (reading (p))**
- Busiest board: Alpha "8 of 12" → Gamma "6 of 6" → Portfolio "1 of 2".
- `stripState`: Alpha 1 of 6 → Alpha 3 of 6 → Bravo 1 of 6 → Bravo 5 of 6 → Portfolio 1 of 1. That is J7's order, the portfolio last, then by place, and not newest first.
- The kind line still names the project ("Kicked back · Alpha").
- Captures: el/el-strip-360-light-strip0.png through strip3.png, with the row scrolled one card at a time.

**Sheet's small line (AC95, "Settled from QW2's build", 2 and 5)**
- Pull request: "Alpha · pull request · #81 · waiting 3 d 0 h · 3 of 12 waiting".
- Gate: "Alpha · gate · P-002 · waiting 4 h 32 m · 6 of 12 waiting".
- Kicked-back card: "… #82 · waiting 2 h 2 m · 8 of 12 waiting".
- Portfolio card: "portfolio · decision · PF-002-explore-1.md · PM1 · wait not recorded · 2 of 2 waiting".
- Held question: "Beta · question · Beta-plan-units · M3B · waiting 2 h 2 m · being asked in your session".
- All are Plex Mono 11px `--ink2`, 6.4:1 light and 7.72:1 dark, with no cut.
- A gate sheet opened over Plan (`#/work/card/…`) says the same "· 6 of 12 waiting". The Plan screen itself is unchanged (see "Home, a page and Plan unchanged" below).

**Nothing moves while a sheet is open (AC95, "When the order changes"; AC40; point 3)**
- Live check in Chromium (tools/hold2.mjs): with #81's sheet open, I added a made-up older pull request #84 to Alpha and let one poll run.
- While the sheet stayed open, the board and the sheet still said "3 of 12" for #81 and "1 of 12" for #83, and the badge went 33 → 34 (live, as point 3 says).
- After Escape, #84 showed "1 of 13" and #81 "4 of 13".
- It behaves the same whether the sheet was opened by a tap or the page opened straight at it.
- The drag hold is covered by the passing ac95 cases; I did not drive a drag by hand.

**Item 12, width**
- The page scrolls sideways by 0 px in all 52 probe renders and all 20 tool captures.
- The strip's row scrolls only inside itself, as G2 built it.

**Item 6, every project**
- md-extremes (`qw2BusiestState`, 5 projects plus the portfolio): each project is numbered on its own, and each N equals that project's count:
  - Alpha 12, Beta 6, Gamma 6, Delta 1, Epsilon 6 and the portfolio 2;
  - those add up to 33, which is the badge.
- service-desk/ and poom/ (`textState`): nothing waits on the owner, so no place lines show. The render is the same as at base apart from "checked N s ago".
- `mix` (with Alpha): places 1–6 of 6.
- No page errors or console errors in any state.
- One project shown (`#/waiting/Alpha`, `#/waiting/Beta`): each card keeps its whole-board place. The chip's "1 of 5 projects" (Plex Sans) reads apart from "4 of 12 waiting" (Plex Mono), as reading (c) asks.

**Home, a page and Plan unchanged (AC95, "Not changed")**
- I exported src/public at 1a145c9 to scratch and rendered it with the same fixtures, then compared it with 8e530a5 (cmp-base/ and cmp-head/).
- Home, `#/p/Alpha` and Plan (`#/work`) are pixel-identical at 360 and 414, light and dark.
- One Home render differs only in "checked 0 s ago" against "checked 44 s ago" (live timing).

**Other items**
- Items 1 and 2 (rulings and spec): kept as listed above.
- Item 3: what counts as waiting is unchanged, and the badge is still the sum.
- Item 5: k and N come only from the records, and a held question gets no number.
- Items 10 and 25: place line 16.99–17.58:1 light and 15.15–16.25:1 dark; held line 6.18 and 7.2; sheet line 6.4 and 7.72.
- Item 11: no new target (the line is a span).
- Items 13 and 14: no new colour meaning, and no coral.
- Item 18: the order is by age (readings (e) and (k), which the owner approved), never by kind alone.
- Item 21: one board, three lanes and the strip are kept.
- Items 23 and 27: Plex Mono, with `document.fonts.check('11px "IBM Plex Mono"')` true in every render; 11 px is one of the board's sizes.
- Item 24: no motion added.
- Item 15: Escape closes the sheet.

## Blocking findings
None.

## Non-blocking findings
**N1. Gap above the kind line in a short strip card.** This was already there before QW2, and the picture draws it the same way. It reads acceptably.
- A strip card shorter than the tallest card in its row is stretched by G2's `.v2-kslot { display: grid }` (src/public/sandbox.css:615). The card's grid spreads the extra height across every row.
- So in those cards the place line sits 7–13 px above the kind line, against 4 px elsewhere:
  - busiest board: Gamma 13 px, Portfolio 7 px;
  - `stripState`: Alpha #80 12 px, Bravo #80 12 px, Bravo hold 10 px.
- The picture's strip card "1 of 2 waiting" measures 184×21 (measure.log:13), the same effect.
- The space grows evenly between every row, so the place line still reads as the top of its card, on its left edge (el/el-strip-360-light-strip0.png, el/el-busiest-360-dark-strip1.png).
- QW2 does not make it worse. If anyone wants it gone, it is a follow-up to G2's strip look, not to QW2.

**N2. Observation; no checklist item fails.** At 360 px the sheet's small line can split the place phrase across lines:
- "· 2 of 2 / waiting" (portfolio sheet);
- "being asked in your / session" (held question's sheet).

This line already wrapped before QW2 (base: 2 lines for the pull request and portfolio sheets, already splitting "PF-002-explore- / 1.md"). AC95 asks for one line only on the board's place line, and the picture does not draw a sheet. Keeping the phrase together would be an optional follow-up.

## Questions for the owner
None. No owner ruling and no checklist item point different ways on QW2.

## Captures for the owner
All are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw2/shots/ unless noted.
1. **qw2-one-alpha-360x740-light.png.** Alpha alone, two-digit places in the section, the strip and the lanes, the same scene as the picture's frame 3. **This one should sit beside docs/design/builds/m3g-picture/m3g-f3-one-alpha-360-light-full.png.**
2. **qw2-busiest-360x740-light.png.** The whole board: each project numbered on its own, the held question's grey line, and the portfolio's "2 of 2". It is a very tall full-page capture (13696 px).
3. **qw2-sheet-360x740-light.png.** The sheet's small line ending "· 3 of 12 waiting", with the board behind it still showing its places.
4. **qw2-held-sheet-360x740-dark.png.** The held question's sheet saying "being asked in your session", in dark.
5. **Optional, to show the strip's new order:** qw2-strip-360x740-light.png shows only the first card and a half, because the row scrolls. My scrolled crops show the order in full: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw2-design/el/el-strip-360-light-strip0.png (Alpha 1 then 3) and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw2-design/el/el-strip-360-light-strip2.png (Bravo 1 then 5).
