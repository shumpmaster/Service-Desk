# Mockup v39 build layer

v39 is v38 plus this layer. It carries out the owner's round 8, answer 17, a comment on v38 (decisions/questions/P-005-design-round-8.md): "The branch map needs more space to breath away from the other elements. And I want the map to entirely fit within its own space within the outline here if that makes sense? And I want it to have the glass look as well not just flat white".

    python3 v39.py ../timeline-v38-craft.html ../timeline-v39-craft.html

- **Room** (`source/card.css`): the card sits 16 from the screen's sides (10 in v38), 14 under the top row (4) and 20 above the list (12). The band is 382 high open (346 in v38) and 114 folded (100); the list gives up 36 points open and 14 folded.
- **The whole map inside the outline**: 12 of padding all round. The map is drawn to the card's inner box: v38 read the card's `clientWidth`, which now includes the padding, so `source/inner.js` gives `__vpIn()`, the inner width, and `v39.py` uses it in the three places v38 read the width (the map's width, the pan, and where lane names are kept inside the frame). Main's lane starts and ends inside the card; main's label, the gate lines with their captions and flags, the selected milestone's dashed edge, the chip and the fold handle all sit inside the inner box; the inner box clips (`overflow: hidden`, radius 10) as a backstop. Lane names keep 30 clear of the right edge where a gate line stands, so "2.3.2 Mockups v2 to v4" no longer runs into "Build gate · yours".
- **Glass**: 46% white (58% grey in dark) with `blur(28px) saturate(2.2)` over the band's field, a sheen from the top (a white gradient, 62% at the top-left corner, fading by 40%, with a faint return at the foot), a hairline edge, a light top edge and the soft shadow. The band paints the ground's field (v38), so the card's blur takes the field's colours. The slim folded card is the same glass.
- **Words on the glass**: the gate captions were 85% of the label grey (2.4:1 in light); they now take the secondary word colour at full strength, and in dark the card's secondary words are one step lighter (`#a7a7ad`).
- **Reduced transparency or more contrast**: a solid card with no blur and no sheen.

## Contrast on the glass

Measured on the rendered card (393 and 360, light and dark) with everything on the map hidden, at every second point of each word's box, the lowest ratio found:

| | Light | Dark |
|---|---|---|
| Lowest word on the card | 5.97:1 ("2.2 M6", the chip) | 5.29:1 ("Design gate · passed") |
| Lane names | 6.1:1 | 5.66:1 |
| Gate captions | 6.02:1 | 5.29:1 |

## Checks

Playwright and Chromium at 393×852 and 360×740, light and dark, plus 393 light with reduced motion and with reduced transparency (the v38 suite run on v39, plus the inner box).

| Check | Result |
|---|---|
| Console errors, sideways scroll | none in all six runs (an early build drew the map at -24 wide for a moment while the card was not laid out; `__vpIn()` now gives 0 there so the old fallback holds) |
| The card | 16 from the screen on each side, 14 under the top row, 20 above the list, radius 20, padding 12; the map 337 wide in a 337 inner box (304 in 304 at 360) |
| Nothing crosses the inner box | no element of the map, its label, gate lines and captions, flags or chip crosses it, at 393 and 360, light and dark, reduced motion and reduced transparency |
| Glass | `blur(28px) saturate(2.2)` on 46% white (58% grey in dark); none and solid with reduced transparency |
| Opens with Stop card 5 at the pointer; round button lands there | yes, everywhere |
| Map arrow scrolling down Design | only moves right (393: 162 → 299; 360: 132 → 279), always inside the inner box, hidden past the last event |
| Card fold | 382 → 114 → 382; the slim card is glass, 16 from the sides, with the handle inside it |
| Milestone taps | a second tap clears the selection everywhere; the third tap's reselect is as unsteady in this test as in v37 and v38 |
| Top row | 38 on all four controls |
| Push | in from the right (none with reduced motion) |
| Why tap | the page does not move (scroll 2475 → 2475; 2640 → 2640 at 360) |
| Needs bubble | opens with a close mark, clear of the tab bar (bottom 727 against 770; 654 against 658 at 360), Escape closes it, the page does not move |
| Open in Claude | on screen (393: 393–423; 360: 435–465) |
| Wait sheet from the count | 4 rows; Go to it lands that row at the pointer |
| Gate, decision, research and stop sheets | open and close; the stop's five choices |
| At work sheet | opens ("The Chief of Staff, on S-011") once the row is scrolled clear of the taller band |
| Context view | 49 rows, numbered event rows (2.2.1.1 …) |
| Times | Chicago, every clock time with am or pm |
| Ink Answer | yes (`rgb(28, 29, 33)`; light on dark) |
| Build phase | 9 planned rings |

Short: the band is taller (382 open, 114 folded against 346 and 100), so at 360×740 the list shows 262 points between the band and the tab bar.
