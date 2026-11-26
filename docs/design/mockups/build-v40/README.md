# Mockup v40 build layer

v40 is v39 plus this layer. It carries out the owner's round 8, answers 18 and 19 (decisions/questions/P-005-design-round-8.md):
"I like option a here, but I want a better visual segregation of the title. Effectively some accenting or something that is reserved for the title and just condenses when scrolled as shown" (18, a comment on the home title's option A); "On the titles could we combine A, b and c somehow, my current concern is how the title looks identical to the cards / Go with the recommendations on the others" (19).

    python3 v40.py ../timeline-v39-craft.html ../timeline-v40-craft.html

The code is `source/`:
- `filter-home.css`, `filter-home.js`: the map filter A, home's search A and more on home B, from `../options-r8-filter-home/source/` (fh.css, fh.js) with options B and C left out and the hash switches fixed on. Changes on the way: the filter button sits inside the card's inner box (`--mc-pad` from the corner, v39's rule); lane names beside the button step left to keep clear of it; the right gate's caption steps down with `translate`, so it keeps its own turn (fh.css's `transform` had turned it the other way); the panel refills only when its contents change (fh.js refilled it on every change of the page, so a tap on a chip found its button gone and the panel never closed); a chip's tap closes the panel; the bar takes over once the title has condensed (64 points). The project lines say they are examples, and home says so under its groups.
- `title.css`, `title.js`: home's title combining the accents A, B and C of `../options-r8-title/` so it no longer looks like the cards. Not a card: a glass band the full width of the screen, from the top of the screen to a hairline under the title, no rounded sides, no shadow (A's glass); the ground's blue and lavender gathered behind it under the glass (B); the live line as a small-caps label above a heavier title (34, weight 800) and a short blue-to-lavender mark under it (C). Over the first 64 points of scroll (`--tt-p`) the title lifts and fades, the band and glow fade, and the slim bar takes over with a faint tint and the mark beside its small title. Reduced motion: it snaps. Reduced transparency or more contrast: a solid band with its hairline, no glow, no tint. The cards keep their own shape: white, rounded 20, with a soft lift the band does not have (none in dark).

## Checks
Playwright and Chromium, 393×852 and 360×740 in light and dark, and 393 light with reduced motion and with reduced transparency (six runs).

| Check | Result |
|---|---|
| Console errors, sideways scroll (home and project) | none in all six runs |
| Home title band | full width (0 to 393; 0 to 360), radius 0, an inset hairline only, glass `blur(26px) saturate(1.9)`, glow on; solid, no glow, with reduced transparency |
| Label, title, mark | small caps, weight 800, mark present |
| Contrast at the most tinted point (label / title) | light 5.79 / 12.53 (360: 5.84 / 12.55); dark 6.23 / 13.26 (360: 6.30 / 13.45); reduced transparency 7.88 / 16.84 |
| Cards below | white (#1c1c1e in dark), radius 20, 16 from the screen |
| Condensing | `--tt-p` 0, 0.5, 1 at 0, 32, 64 points (0, 0, 1 with reduced motion); the bar's title shows once scrolled |
| Search | no full-width row; the magnifier opens the field with Cancel and focus; Cancel closes it |
| Project lines | one per project: "Chief of Staff at work since 7:52 am · 9 new", "Nothing at work · it waits on you · nothing new"; the examples note under the groups |
| Filter button | inside the card's inner box, 30 high |
| Filter panel | Everything, Yours 4, Turning points 9, Reviews and checks 7, Research 2, Main only 4 |
| Pick Yours | panel closes; button reads "Yours" with a cross; 27 stations faint, 10 rows quiet; Stop card 5 kept and still at the pointer; no lane name under the button |
| Cross | everything back (0 faint, 0 quiet) |
| Opens with Stop card 5 at the pointer; round button lands there | yes, everywhere |
| Arrow scrolling down Design | only moves right (393: 162 → 299; 360: 132 → 279), inside the card, hidden past the last event |
| Card fold | 382 → 114 → 382 |
| Second milestone tap | clears the selection; the third tap's reselect is unsteady in this test, as in v37 to v39 |
| Top row | 38 on all four controls |
| Why tap | page does not move (2475 → 2475; 360: 2640 → 2640) |
| Needs bubble | opens clear of the tab bar (393: bottom 727, bar 770; 360: 654, bar 658), close mark, Escape closes it, page does not move |
| Open in Claude | on screen (393: 393 to 423; 360: 435 to 465) |
| Wait sheet from the count | "4 things wait on you in The timeline", 4 rows; Go to it lands at the pointer |
| Gate, decision, research, stop sheets; Context view; Chicago times; ink Answer | as in v39 |

Short: the Why tag measures y=0 while its bubble is open, as in v36 to v39 (the page does not move).
