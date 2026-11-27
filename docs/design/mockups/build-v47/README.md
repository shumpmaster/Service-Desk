# Mockup v47 build layer

v47 is v46 plus this layer. It carries out the owner's round 9, answers 1 and 2 (decisions/questions/P-005-design-round-9.md): "It looks great so far, maybe just lighten the background up a tad?", then "C".

    python3 v47.py ../timeline-v46-craft.html ../timeline-v47-craft.html

The code is `source/ground.css`, option C of `../options-r9-lighter/source/lt.css`, set for light only. The library's card is Ground (tokens `ground`, `ground-field-a` to `-c`), library version 62.

## What it does
- In light, the plain ground half a step lighter: `#f6f7fa` (was `#f2f3f7`).
- The three colour fields a little softer: blue 18%, lavender 17%, mint 12% (were 22, 21 and 15, from v42).
- Dark, cards, rows, words, status colours and the one blue are unchanged. A lighter ground only raises the contrast of words on it.

## Checks
| Check | Result |
|---|---|
| Computed values, light, 393 and 360 | ground #f6f7fa; fields .18, .17, .12 |
| Computed values, dark, 393 and 360 | unchanged: ground #000000; fields .24, .21, .14 |
| Console errors, sideways scroll (home, project) | none, light and dark, 393 and 360 |
| Reduced motion | loads; same ground |
