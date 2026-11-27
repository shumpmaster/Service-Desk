# Mockup v42 build layer

v42 is v41 plus this layer. It carries out the owner's round 8, answer 25 (decisions/questions/P-005-design-round-8.md), sent with a screenshot of v41's home on the phone inside the Claude app (docs/design/references/2026-11-27-v41-home-on-phone.jpg): "1 - empty space is definitely not gone 2- can we please increase the glass look as well?"

    python3 v42.py ../timeline-v41-craft.html ../timeline-v42-craft.html

The code: `source/sat.css`, `source/sat.js` (the top of the screen) and `source/glass.css` (the glass).

## 1. The empty strip at the top

Three things stacked above home's title:
- the page took the class `sg`, and an old rule `.sg { margin: 18px 0 0 }`, meant for an element, gave the whole page an 18-point top margin (home only);
- the page's own 4 of top padding sat above the band;
- the band added `env(safe-area-inset-top)` in full. Inside the Claude app the reported inset is far larger than a phone's own: simulating 200 reproduces the owner's screenshot (v41's capsule at 234; on the phone about 237, under the app's toolbar, which ends about 95 down).

Now the top inset is counted once, in `--sat: min(env(safe-area-inset-top, 0px), 100px)`, and nothing else adds top space. A phone's own inset is never more than 59, so it is used as it is; in the Claude app the page starts just under the app's own toolbar. A cap at 59 was tried first: it would put home's capsule (search, bell, More) at 71 to 109, under the app's own close, chat, share and more buttons (about 55 to 95), so the cap is 100. The notes at the foot of the page show the inset the browser reports and the one the page uses (`data-sat` on the page), so the next screenshot from the app says what it reports.

Measured at 393, with the inset simulated (each copy has `env(safe-area-inset-top…)` replaced by the value):

| Inset | v41 capsule / label / title / first card | v42 capsule / label / title / first card | Project page Back / map card, v41 → v42 |
|---|---|---|---|
| 0 | 34 / 46 / 65 / 199 | 12 / 23 / 42 / 176 | 6 / 58 → 6 / 58 |
| 47 | 81 / 93 / 112 / 246 | 59 / 71 / 90 / 224 | 53 / 105 → 53 / 105 |
| 59 | 93 / 105 / 124 / 258 | 71 / 83 / 102 / 236 | 65 / 117 → 65 / 117 |
| 120 | 154 / 166 / 185 / 319 | 112 / 124 / 143 / 277 | 126 / 178 → 106 / 158 |
| 200 | 234 / 245 / 264 / 398 | 112 / 124 / 143 / 277 | 206 / 258 → 106 / 158 |

The live label's centre sits on the capsule's (90.5 against 90 at inset 59). Home's band no longer starts 22 down; it starts at the top of the screen.

## 2. Clearer glass

| Surface | v41 | v42 (light / dark) |
|---|---|---|
| Home's cards | 56% / 58%, blur 28, saturate 2.2 | 40% white / 44% grey, blur 34, saturate 2.6 |
| Map card | 46% / 58%, blur 28, saturate 2.2 | 34% / 42%, blur 34, saturate 2.6 |
| Top row, tab bar, round button, menus | 60% / 66%, blur 24, saturate 1.9 | 38% / 44%, blur 30, saturate 2.4 |
| Sheets | 80% / 84%, blur 30 | 66% / 70%, blur 40, saturate 2.2 |
| Home's title band | 30% to 46% | 14% to 30%, blur 30, saturate 2.4 |
| Ground fields (light) | blue 14%, lavender 13%, mint 10% | 22%, 21%, 15% (dark 24%, 21%, 14%) |

Every glass surface takes the rim: a bright top edge, a fainter left edge, a soft glow inside the top, and the hairline; and a light-to-clear sheen. The map's words step one shade further from the glass (#46484d light, #bdbdc3 dark). The filter button keeps its own glass. Reduced transparency or more contrast: every surface solid, the ground's fields off.

Words on the glass, the worst 2% of the background behind each (the words hidden, the background measured), inset 59:

| Words | 393 light | 360 light | 393 dark | 360 dark |
|---|---|---|---|---|
| Home's live label | 5.07 | 5.12 | 5.69 | 5.73 |
| Home's title | 11.17 | 11.27 | 12.45 | 12.61 |
| Cards' secondary words | 5.79 | 5.79 | 5.94 | 5.84 |
| Event line on a waiting row | 5.82 | 6.01 | 6.37 | 7.49 |
| "Longest wait" tag | 5.13 | 5.13 | 6.68 | 6.68 |
| Project line | 6.12 | 6.19 | 5.05 | 6.10 |
| Top row's pill | 12.02 | 12.14 | 18.25 | 18.41 |
| Map words (lane names, PR labels) | 4.80 | 4.97 | 3.98 | 4.13 |

The map's words in dark measure under 4.5 by this method because their boxes take in the light lines and icons beside them; each word carries a 2-point halo in the card's colour (#1d1d23), so the word itself reads against the halo (#e5e5ea on #1d1d23, about 13:1). The same method gives v41 3.78 there.

## Checks

393×852 and 360×740, light and dark; 393 light with reduced motion and with reduced transparency (the inset simulated at 59):

| Check | Result |
|---|---|
| Console errors, sideways scroll | none, in all six runs; none at insets 0, 47, 120 and 200 either |
| Home: capsule 71, label on the capsule's row, title 102 | yes, everywhere |
| Search opens over the bar; Cancel closes it | yes |
| The title condenses into the bar on scroll | yes |
| Each waiting row names its event | 5 rows |
| Project page lands on Stop card 5 at the pointer | yes (393: row 508, pointer 599; 360: 452, 543) |
| Filter "Yours": only matches; Stop card 5 still at the pointer; cleared | 4 events; yes; 13 events back |
| Map card fold | 441 → 173 → 441 (the band now includes the top row's inset) |
| Why tap moves nothing | 2482 → 2482 (360: 2647 → 2647) |
| Glass blur in place; none with reduced transparency | blur(34px) saturate(2.6) on cards and map card; none under reduced transparency |
| Library `check.js` | no errors, light and dark |

Not checked here: a real phone. The inset the Claude app reports is inferred from the owner's screenshot; the page's foot now shows it.
