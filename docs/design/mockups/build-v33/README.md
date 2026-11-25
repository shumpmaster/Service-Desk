# Mockup v33 build layer

v33 is v32 plus this layer. It carries out the owner's round 8, answers 1 to 3 (decisions/questions/P-005-design-round-8.md): the fixes from the design reviewer's first review (docs/design/audit-2026-11-25-v32-review.md), and the polish and motion from its second (docs/design/audit-2026-11-25-v32-polish.md), within the owner's rulings. Home is as in v32 apart from R5, the press states and the push.

    python3 v33.py ../timeline-v32-craft.html ../timeline-v33-craft.html

The code is `source/`: `tokens.css` (one blue, the separator, dark elevation, the motion tokens and springs), `polish.css` (look, press states, tags, radii, the band, dark mode), `fixes.js` (the first review's fixes, L11, C2), `motion.js` (M1 to M8). `v33.py` also applies a few text patches, each asserting its target appears once: the first click hook (F1), the NaN guard (O1), the map's dip, the fold's pulse and fade, the Context view's scroll, the old sheet drag, the gap between words on main, and the type ramp and weights (321 sizes and 42 weights rewritten).

## Each finding

### First review (fixes)
- **F1, done.** A hook that runs before every other click handler pins what was tapped (a tag, or the row) before any handler redraws or scrolls; the redraw settles in the next frame, before it is painted. "Needed by" and the other jumps land the named row at the fixed centre once the list has settled.
- **F3, done.** The session bubble leads with Open in Claude and the run or pull request, then what the session did.
- **U1, done.** Every bubble has a close mark; a tap outside closes the Needs bubble too (Why and session already did); Escape closes all three. The Needs tag stays on its row's line while open (a bubble now sits after the first line).
- **U2, done.** With too little room below, a bubble opens above its row if that is roomier, and keeps to the room there is, scrolling inside, if neither side fits.
- **U4, done.** Invisible hit areas reach 42 to 44 points on the tags, the pills, Back, the bell and More, and the phase strip's segments, with no change to the look.
- **U7, done.** The phase menu's gate lines wrap.
- **U8, partly.** The project's name takes the spare width and the phase pill keeps its own (the slimmer chevron and padding give back about 5 points), but "Home-screen widget" still loses letters at 393. A full name needs a ruling on the top row (R7 answers 21 and 22).
- **R3, done.** The badge is white on the one fill blue (4.6:1); "main" and the Now card's second line are darker; the blue wash and the Now card are lighter, so every word on them passes 4.5:1 (audit: no failures in light or dark at 393 or 360).
- **R4, partly.** Words on main keep a 9-point gap (was 2 to 4) and lane names stay inside the frame. Not done: drawing squeezed runs as a count ("+6"), and "New spec S-011, rounds reset" still crosses the lane below.
- **R5, done.** Home's strip fits its card at 360; the wait time sits under the question, which keeps up to three lines.
- **O1, guarded.** The likely source (a row whose event is not on this map feeding the window a NaN) is guarded. The errors did not reproduce in this run on v32 or v33.
- **O2, done.** A plan's fold says the number its row shows (Step 2.2.2.7).

### Second review (polish and motion, within the rulings)
- **L1, done.** The band is solid, with a 16-point fade under it in place of the rule; the top row's controls stay glass. Rows also fade before the tab bar (D4).
- **L2, done.** One blue in three roles: fill #0a6cff in both themes, text #0759bd light and #6cb4ff dark, washes; the bell in ink. The page now carries only these (measured: two solid blues, the fill and the text, and their washes).
- **L3, done.** The ramp 11, 12, 13, 15, 17, 20, 22, 28 (measured on the project page: 7.5, 11, 12, 13, 15, 17, 22); weights 400 and 600, 700 only for the phase's name; tabular figures on numbers that stack. Tags are 12, not 13: at 13 the time fell onto its own line at 360.
- **L4, as ruled.** Back, both pills and the bell capsule share one glass material and shadow at one height, 34. The 38 or 44 height is the owner's question.
- **L5, done.** Radii 6, 12, 20, 28 and full; both menus 28.
- **L6, as ruled.** One tag: 20 high, radius 6, 12 text, one baseline; Claude a quiet grey fill; Why keeps its outline (R5 answer 10).
- **L7, done.** A soft shadow raises the current segment of the phase strip; a washed heading hides its rule.
- **L8, partly.** Routine rows' words sit on the same column as other events'. The full 4-point re-grid of indents was not done.
- **L9, done.** One separator colour, a half-point hairline on retina for the phase rule and bubbles; the pointer 4 in from the edge with a rounded tip.
- **L10, done.** Halos 2 points, dark ones tinted to the band; the selected milestone's dashed outline 1 point, 3 on 3 off, at 60%.
- **L11, done.** The mockup's notes fold behind "About this mockup".
- **M1, done.** Controls dip to .96 and spring back; rows take a grey fill; tags dim; no tap flash.
- **M2, done.** The map is no longer dimmed or regrown: events slide from where they were on the spring, the window from its old place, lanes and words cross-fade. The scale rule is unchanged (F4 is the owner's question).
- **M3, done.** Folds grow and shrink (open 320 on the spring, close 240); the gauge no longer pulses; the tapped row stays put.
- **M4, within the ruling.** One continuous push from the left (v11's direction kept): the project is drawn first, then both layers move together; no blank gap; Back or a second tap finishes the running push and starts its own. The direction is the owner's question.
- **M5 and C1, done.** Bubbles open from their tag and close as the reverse; both menus open from their control on the spring and close back into it; the sheet opens in 450 and closes in 280.
- **M6, done.** The pointer's wash fades (in 120, out 200) with the map's arrow; the Now jump takes 450 to 600 ms whatever the distance (a very long one fades, lands and settles) and ends with one pulse on the Now card.
- **M7, done.** The sheet's drag follows the finger with its speed: a flick or a third of its height puts it away; dragging up gives a little; the scrim fades with the drag.
- **M8, done.** Holding the round button fills a ring around it; the Context view lands first, then the first eight rows settle.
- **D1 to D5, done.** In dark: the band a step lighter than the ground and the glass lighter; washes at 14% and the window at 12%; done merges #636366 with white glyphs; the tab bar's glass thicker, with the fade behind it; status washes keep their hue.
- **C2, done.** The pills' chevron and More are Phosphor.
- **C3, partly.** Round caps on every ring. The stroke still differs by size.
- **C4, done.** One card recipe: radius 20, the same soft shadow in light, none in dark.
- **C5, partly.** The time column keeps a width for a clock time, so the tags beside it stay put; a date ("13 Nov 21:44") is still wider.

## Measured (Playwright, Chromium, 393 by 852 unless noted)

| Finding | v32 (the reviews) | v33 |
|---|---|---|
| F1 Tap Why, 4 rows | page moved 640→2131 and alike, 6 of 6 | tag and page did not move, 4 of 4 (393 and 360) |
| F1 Needed by | pointer on 2.2.2.5 | pointer on 2.2.2.11, the named row, arrow shown |
| F3 Open in Claude, row at the pointer | y 810, under the tab bar (770) | y 576 to 606 (393); y 520 to 550 at 360 (bar 658) |
| U1 Needs bubble | no close; Escape and outside taps did nothing | close mark, Escape and outside tap each close it; tag stays at y 533 |
| U2 Needs bubble at 360 | 522 to 737 under the bar (658) | 511 to 654, inside |
| U4 hit height | Why and Claude 18 | 44 |
| U7 gate lines | cut at 270 | wrap; no row wider than the menu |
| R3 contrast failures | badge 3.52; main 2.92; Now line 4.27 | none, light and dark |
| R4 gap between words on main | 2 to 4 | 9 |
| L2 blues on the project page | four, plus a navy | the fill and the text, and their washes |
| L3 sizes on the project page | 13 | 7 (7.5, 11, 12, 13, 15, 17, 22) |
| M1 press | no change on 15 controls | scale .96 on pills, Back, bell, tab, round button; rows rgba(120,120,128,.12) |
| M2 map while scrolling 1,000 points | 7 rebuilds, each dipping to 55% and the window regrowing from 0 | 7 rebuilds, opacity never below 1, window never below its width |
| M3 folding S-011 | 1,807 to 52 in one frame | 1,758 to 0 over about 250 ms; open 0 to 1,761 over about 300; tapped row fixed at y 400 |
| M4 opening a project | fade out, about 90 ms blank, fade in | home slides out as the project slides in; never blank |
| Now jump | browser smooth scroll, about 0.8 s | 500 ms, then one pulse |
| Console errors, sideways scroll | 4 NaN errors (not reproduced here) | none at 393 and 360, light and dark; reduced motion: no animations but the chevron's turn |

Screenshots stayed outside the repository.
