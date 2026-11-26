# Mockup v37 build layer

v37 is v36 plus this layer. It carries out the owner's round 8, answers 14 and 15 (decisions/questions/P-005-design-round-8.md): "Draw all 4"; "I like all of them, however when I was saying glass. I more meant how the background was styled. ..." Option A of each look-and-feel item drawn on `../options-r8-look/`. The owner's further ask, slight colour in the background, is drawn as options on `../options-r8-ground/` and is not in v37.

    python3 v37.py ../timeline-v36-craft.html ../timeline-v37-craft.html

The code is the options' own (`../options-r8-look/source/lk.css` and `lk.js`), fixed to A: `source/look.css`, `source/look.js`.

- **1A, a calmer map.** Lanes 3 wide (main 4) in a lighter grey; rings 1.5 thick; a routine commit outside the window is its own disc drawn as a 3.5 dot with no icon (not the separate dot circle, which sits at the squeezed position and made the map's arrow flick to it as a row reached the pointer); the window a faint tint with a hairline edge; the dashed outline lighter; gate captions in small capitals with no slab.
- **2A, blue only for now or selected.** The count, the bell's dot, the new-since dots and the session dots in ink; the at-work dot the soft green of moving; Answer an ink button. Blue stays on the pointer, the map's window and arrow, the selection, NOW and the selected tab.
- **3A, fewer tags.** The kind, a grey state and the time on the number line ("2.2.2.10 · Stop · 9:42 am"); only tinted states (NOW, Yours · waiting, Failed) before the title; Why and the session tag at the row's foot. 3A's rough edge on the options page is fixed: a stop's Answer takes a line of its own under Why and the session tag.
- **4A, glass on what floats.** The top row, the tab bar, the round button and both menus 60% white (66% grey in dark), a 24-point blur, a light top edge and a shine; sheets 80% with a 30-point blur; solid with prefers-reduced-transparency.

Two patches to earlier layers, each asserting its target once: the map's arrow (v29, FixedCentre) aims at a station's visible circle rather than the whole group; and the stray 4B declaration of the options' stylesheet is left out (it broke the parsing of the reduced-transparency rule after it).

## Checks
Playwright and Chromium: 393×852 and 360×740, light and dark; 393 light with reduced motion; 393 light with prefers-reduced-transparency (emulated). Screenshots outside the repository.

| Check | Result |
|---|---|
| Console errors, sideways scroll | none in all six runs |
| 1A lanes, main | 3 and 4 wide; 12 of 13 routine commits drawn as dots, the one in the window as its icon |
| 1A map arrow scrolling down Design | settles moving right only (393: 132 → 180 → 227 → 263 → 275 → 334; 360 dark: 121 → 153 → 186 → 207 → 251 → 315); no flick (v37 before the patch flicked to 364 for 300 ms) |
| 2A | count ink (#1c1d21; #f2f2f7 in dark), Answer ink, at-work dot green (#34a853; #30d158 in dark) |
| 3A | Stop card 5 reads "2.2.2.10 · Stop · 9:42 am"; before its title only NOW and Yours · waiting; Answer on its own line below Why and CoS 14 Nov |
| 4A | tab bar rgba(255,255,255,.6) with blur(24px) saturate(1.9); dark rgba(44,44,48,.66); with reduced transparency solid #fff (#1c1c1e dark), no blur |
| Opens with Stop card 5 at the pointer; the round button's tap lands there | yes, everywhere |
| Band fold | 334 → 76 → 334 |
| Milestone taps | second tap clears the selection, the third selects again |
| Top row | 38 on all four controls |
| What waits (the count's sheet) | 4 rows; Go to it puts its row at the pointer |
| Why tap | the page does not move (scroll 2451 → 2451) |
| Needs bubble | opens; Escape closes it |
| Open in Claude | on screen (393: y 369–399; 360: y 411–441) |
| Gate, decision, research, stop sheets | open and close; the stop's five choices |
| Context view | numbered event rows (2.2.1.1); links PR #428, CoS 13 Nov, CoS 14 Nov |
| Clock times without am or pm in the list | none |
| Library check.js | no errors, light and dark |
