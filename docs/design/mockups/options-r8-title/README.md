# Options: an accent reserved for home's title (round 8, answer 18)

Built over mockup v39 (`../timeline-v39-craft.html`) with title A and search A from `../options-r8-filter-home/source/` (fh.css, fh.js). `source/build.py` writes `phone.html`, adding `source/tt.css` and `source/tt.js`; the hash token `a=P|H|M|W` picks the accent, `y=<px>` scrolls, `light` or `dark` sets the theme. `source/page.py` writes `index.html`.

- In title A: Title A puts a large "Timeline" at 34 on the ground, with the live line under it, and condenses into the slim glass bar as you scroll. Nothing sets it apart from the groups below it but its size.
- Touches: All four keep title A and search A (round 8, answer 16, as drawn) and the slim floating bar once you scroll (round 6, answers 1 and 4). B and D use the ground's field colours (round 8, answers 15 and 16) more strongly at the top; C's mark and D's wordmark bring the ground's blue and lavender into type, beside the one blue that round 8, answer 14 (option 2A) keeps for now or selected, which P-005-rebrand-style's one blue does not foresee. A adds no colour.
- Recommended: A, the glass plate: it gives the title a surface that is its own, in the same glass as the map card and the bar, and it condenses by handing its glass to the bar, without adding a colour.

## Title A as it is

The large "Timeline" and its live line sit straight on the ground; once they go under the bar, the bar takes its glass and a small title.

## A: a glass plate for the title

The title and its live line on a glass panel of their own, the same glass as the map card. As you scroll, the plate lifts and fades as the bar takes the same glass, so the title moves from one glass to the other.

## B: the colour gathered behind the title

The ground's blue and lavender gather more strongly behind the title, fading down into the page. As you scroll the glow fades, and a faint blue-to-lavender tint stays on the bar.

## C: an eyebrow and a mark

The live line becomes a small-caps line above a heavier title, with a short blue-to-lavender mark under it. Scrolled, the mark sits at the left of the bar's small title.

## D: a two-tone wordmark

The large title is drawn in a deep blue-to-violet from the ground's colours, light blue to lilac in dark. The bar keeps a plain ink title.

## How it condenses

`--tt-p` runs from 0 to 1 over the first 64 points of scroll; the title lifts 10 points, shrinks 6% and fades as the bar takes its small title. With reduced motion it snaps at 32 points. With reduced transparency or more contrast, A's plate is solid and B's glow and tint are off.
