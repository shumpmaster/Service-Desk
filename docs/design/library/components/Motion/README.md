# Motion

One set of timings for the whole desk (v33; decisions/questions/P-005-design-round-8.md, answers 2 and 3; docs/design/audit-2026-11-25-v32-polish.md, section 3).

- **Curves:** `ease` cubic-bezier(.2,.8,.2,1) for anything that enters or moves; `ease-exit` cubic-bezier(.4,0,1,1) for anything that leaves; `spring` (stiffness 300, damping 30, mass 1: about 0.35 s, no visible overshoot) for folds, menus, sheets, the page push and the map; `spring-bouncy` (380, 24) only for a press releasing and a gauge landing.
- **Durations:** 100 press, 200 small (bubbles, the pointer's wash with the map's arrow), 320 standard (folds open, the map's events slide; folds close in 240), 450 page (sheets; the push 420; the Now jump 450 to 600 whatever the distance, a very long one fades, lands and settles).
- **Press (M1):** every control dips to scale .96 and brightness .96 in 80 ms and springs back; a row takes `press-fill` at radius 12; a tag dims to 60%. No grey tap flash.
- **The map (M2):** never rebuilt in sight: each event slides from where it was, the window from its old place, lanes and words cross-fade in 150; nothing dips.
- **Folds (M3):** the body grows or shrinks; the tapped row stays where it was (R7 answer 12). The gauge no longer pulses.
- **The push (M4):** opening a project is one movement from the left (v11's direction), both layers together on the spring; Back or a second tap reverses at once.
- **Overlays (M5):** bubbles open from their tag and close as the reverse; both menus open from the control that opened them and close back into it; a sheet closes in 280.
- **The fixed centre (M6):** the row's wash fades in 120 and out 200, with the map's arrow. After the Now jump, one 400 ms pulse on the Now card.
- **The sheet (M7):** follows the finger; a flick or a third of its height puts it away; dragging up gives a little; the scrim fades with the drag.
- **The Context view (M8):** holding the round button fills a ring around it in 450 ms; the view lands first, then the first eight rows settle, 14 ms apart.
- **Reduced motion:** no transforms or scroll animation; a 120 ms fade instead; a press stays as colour.
- **v34 (round 8, answer 6):** the push now comes in from the right and goes back to the left, as other iPhone apps do, so Back's arrow points the way you came (item 3; it sets aside v11's push from the left).
