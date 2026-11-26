# Mockup v38 build layer

v38 is v37 plus this layer. It carries out the owner's round 8, answer 16 (decisions/questions/P-005-design-round-8.md): "I like option a" (the ground drawn on `../options-r8-ground/`) and "For the branch chart can you put an outline around it and step it out a bit that way it has some depth and doesn't inherently blend in with the timeline below". The quick filter for the map and the home page were asked as options, not built: `../options-r8-filter-home/`.

    python3 v38.py ../timeline-v37-craft.html ../timeline-v38-craft.html

- **The ground, option A** (`source/ground.css`, from `../options-r8-ground/source/gr.css` fixed to A): three pale fields (blue from the top left, lavender from the right, a touch of mint from the bottom) over the plain ground, fixed behind everything; faint deep glows in dark. On the tint the two secondary greys step one shade darker in light (`#5a5c60`, `#555559`), so words keep 4.5:1. Reduced transparency or more contrast: the plain ground.
- **iPhone Safari** does not keep a fixed background on an element. The field is a fixed layer (`body::before`, which Safari does keep fixed), and the floating band paints the same field from its own place on the screen: `source/ground.js` writes the band's left and top to `--gr-x` and `--gr-y` as the page scrolls or redraws, so home's band, which floats 22 below the top, lines up with no seam.
- **The map as a raised card** (`source/card.css`): inset 10 from the screen's edges, radius 20, 74% white (78% grey in dark) over the field, a hairline edge and a light top edge, a soft shadow that falls onto the list, and a 12-point gap under it. The map's width is the card's (381 at 393), so it fits inside; label halos take the card's colour; the selected milestone's dashed edge is rounded and kept clear of the card's edge. The fold (MapFold) folds it to a slim card with the same edge and shadow, the handle inside its foot. Solid with reduced transparency; a darker edge with more contrast.

## Checks

Playwright and Chromium at 393×852 and 360×740, light and dark, plus 393 light with reduced motion and with reduced transparency (the v37 suite run on v38, plus the card).

| Check | Result |
|---|---|
| Console errors, sideways scroll | none in all six runs |
| The card | inset 6 from the band's edge (10 from the screen), radius 20, shadow on, 12 gap below; map 381 wide in a 381 card (348 in 348 at 360) |
| The ground | the fixed field on; none with reduced transparency (and the tab bar solid) |
| Home's band | the field lines up with the screen, no seam (it floats 22 below the top) |
| Opens with Stop card 5 at the pointer; round button lands there | yes, everywhere |
| Arrow scrolling down Design | only moves right (393: 135 → 326; 360: 124 → 307), and stays inside the card |
| Card fold | 346 → 100 → 346 (v37's band: 334 → 76 → 334; the card adds its margins and gap); the handle inside the slim card |
| Milestone taps | a second tap clears the selection everywhere; the third tap's reselect is as unsteady in this test as in v37's (the same on v37) |
| Top row | 38 on all four controls |
| Why tap | the page does not move |
| Needs bubble | opens with a close mark; Escape closes it; the page does not move |
| Open in Claude | on screen (y 375–405 at 393, 417–447 at 360) |
| Waiting sheet from the count | "4 things wait on you in The timeline", 4 rows; Go to it lands the row at the pointer |
| Gate, decision, research and stop sheets | open and close; the stop's five choices |
| Context view | numbered event rows; links name sessions |
| Times | Chicago, with am/pm; no bare clock times |
| Ink Answer, ink count, glass tab bar | as v37 |

## Short
- The card and its gap cost the list 12 open and 24 folded (the band is 346 open, 100 folded).
- The selected milestone's dashed edge, for a milestone spanning the whole phase, runs close inside the card's edge; it is rounded and inset, not removed (R7 answer 19).
