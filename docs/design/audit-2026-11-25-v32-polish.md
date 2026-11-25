*By the Design reviewer, on the model the owner named, at the owner's request (decisions/questions/P-005-design-round-8.md, answer 2): a second advisory review of mockup v32 (docs/design/mockups/timeline-v32-craft.html), for polish and a modern look and feel, the style and the motion. No verdict was asked for. Recorded verbatim by the orchestrator, session session_01QBwHGLabYiZK6jrjfzcfBm; its screenshots and logs stayed outside the repository.*

ADVISORY REVIEW 2: polish, modern look and motion of timeline mockup v32
(/home/user/Service-Desk/docs/design/mockups/timeline-v32-craft.html). No verdict asked, none given. Nothing in the repository was changed. Findings of the first review (docs/design/audit-2026-11-25-v32-review.md) are not repeated.

## 1. How v32 looks and moves today

v32 looks like a modern iOS app when it is still and less like one when it is touched. The still picture is close to the Craft references: the floating tab bar and round button match reference 11 almost to the pixel, the bottom sheet matches reference 17, and the neutral greys, pills and soft status colours are calm in light and dark. Three things hold it back.

- **Nothing answers a finger.** There is no pressed state on any control (0 `:active` rules; 15 controls tested, none changed).
- **The motion is fades and snaps, not movement.** Opening a project is two separate 40 px fades with a blank gap. Folds snap shut instantly. The branch map is torn down and redrawn, with a blink, each time the events in view change.
- **Small inconsistencies add up.** Four different blues where the ruling says one, 13 text sizes, about 13 corner radii, two shadow recipes in one row, and four tag styles on one line.

The five changes that would lift it most:
1. Give every control a press state.
2. Make the map move instead of rebuild.
3. Animate folds, and closing as well as opening.
4. Make the project open one continuous push.
5. Tidy to one blue, one radius scale and one type ramp.

**How it was checked.** Playwright and Chromium at 393×852 (360×740 for home and project open), light and dark, at 2x and 3x for close-ups. Every `Element.animate` call was logged, and computed styles were sampled each frame through each transition. Linux rendered the system font stack as Inter, so letter shapes and exact text widths are not San Francisco's.

## 2. Findings

### Look (ranked)

**L1. Text passes under the map band unblurred.**
- Saw: the band is `rgba(242,242,246,.86)` with `blur(20px) saturate(1.8)`. In Chromium the blur has no measurable effect there: removing the filter changed the band's pixels by at most 2 of 255, against 51 for the tab bar. Rows scrolling under it stay sharp and ghost through at about 14% ("MILESTONE 2.2 M6 The records can" behind the PR labels; "Show 4 unused milestones" behind the pills). Files: `g-band-bottom-light.png`, `s11-proj-toprow-393-light.png`, `g-mapcorner-dark.png`.
- Not established: the cause, and whether Safari shows the same.
- Why: Craft references 15 and 17 and Apple's bar materials fully diffuse what is beneath; sharp ghost text behind map labels reads as a rendering fault.
- Suggest: make the map part of the band opaque (`var(--ground)` at 1.0) and keep glass for the 44 px top row only. Add a 16 px gradient from ground to transparent under the band's bottom edge in place of the 1 px `#e7e9ed` rule, so rows fade out rather than being cut mid-letter ("Stopped · 0 of 38 criteria met" is sliced at y 331).

**L2. Four blues, plus a navy.**
- Saw (light): `#0388ff` (count badges, Now disc, bell dot), `#2f6fd6` (active tab icon, "Open on GitHub"), `#0868bc` (blue text, pointer, chip, dashed outline, held round button), `#214269` (bell fill); washes `#e7f1f9`, `#d6ecff`, `#eff7fe`. Dark: `#0a84ff`, `#64b0ff`, `#9fd0ff`.
- Why: TIMELINE-CURRENT "Look": "neutral greys and one blue for selected or now" (P-005-rebrand-style). The badge and the "Open on GitHub" button on one sheet are visibly different blues (`s05-home-sheet-393-light.png`).
- Suggest: one hue with three roles: fill `#0A6CFF` light / `#0A84FF` dark for badges, buttons, active tab, Now disc and pointer (white text passes 4.5:1 on the light one, which also settles the first review's R3 badge); text `#0860C8` light / `#6CB4FF` dark; wash at 10% light / 20% dark of the fill. Bell in ink, not navy.

**L3. Thirteen text sizes, with half-pixels, and four weights.**
- Saw: 7.5, 10, 10.5, 11, 12, 12.5, 13, 13.5, 14, 15, 15.5, 17, 22 px; weights 400, 500, 600, 700. The pairs 12/12.5/13/13.5 and 15/15.5 do not read as different levels.
- Why: checklist item 8; Apple's ramp (11, 12, 13, 15, 16, 17, 20, 22, 28, 34); the owner's "font, text size" in the Craft references.
- Suggest: 11 caption / 13 footnote / 15 subhead / 17 body and headline / 22 title; level labels 11 px 600 with +0.06em. Fold 12.5 into 13, 13.5 into 13, 15.5 into 15, 14 into 15, 10 and 10.5 into 11. Weights 400 and 600 only, 700 for the phase title.
- The 7.5 px ring number is the owner's own request (R7 answer 11), so it is left alone.
- `.no4` (fourth numbers) and `.l3` lack `tabular-nums` while `.no`, `.tm` and `.pc` have it.

**L4. The top row mixes two materials and is smaller than Craft's.**
- Saw: Back and the bell capsule are glass (`rgba(252,251,255,.78)`, shadow `0 6px 20px /.07`). The two pills are opaque white with a different bevelled, blue-tinted shadow (`inset 0 1px 0 #fff, inset 0 -1px 0 rgba(125,147,168,.15), 0 2px 6px rgba(28,58,90,.12)`). Heights are 32, 34, 34, 34 with tops at 7, 6, 6, 6. Craft's circles and capsule are 44 px (reference 11 and 17).
- Suggest: one recipe for all four (v10's "raised a little" can stay as the shared shadow) and one height.
- Raising them to 44 px conflicts with R7 answers 21 and 22 (get space back, slim top row). Question for the owner: is 38 px, which home's capsule already uses, an acceptable middle?

**L5. About 13 corner radii and no visible scale.**
- Saw: 2, 3, 6, 7, 8, 9, 10, 12, 14, 18, 20, 22, 28 px plus full pills. The phase menu is 20 px, the More menu 28 px, the sheet 28, the home card 18, the plan card 14, bubbles 12, problem boxes 10, row wash 8.
- Why: Craft uses few, generous radii (sheet and menu about 36, cards about 20, inner cells about 12).
- Suggest: 6 (tags) / 12 (inner boxes, row wash, bubbles) / 20 (cards, plan card) / 28 (sheets and both menus) / full (pills). Nested rule: inner radius = outer minus padding.

**L6. Four tag treatments on one event line, 1 px out of line.**
- Saw: "Done" is plain grey text; "Failed" and "Awaiting your answers" are tinted fills with 600 weight at 13 px; "Why" and "Claude" are 1 px outlined at 12 px. Why sits at y 480 and Claude at y 481. File: `g-rows-light.png`.
- Suggest: one 20 px tag height, 6 px radius, 13 px text, one baseline. Status tags keep their tint (R3 answer 9). Why and Claude become the quiet neutral fill `rgba(120,120,128,.12)` with no outline, which drops 19 hairline boxes per screen. "Done" takes the same fill, or stays plain but on the same baseline.
- Why's outline is the owner's word ("small outlined Why", R5 answer 10): removing it conflicts with R5 answer 10, so that part is a question.

**L7. The phase strip's current segment wears the heaviest mark on the page.**
- Saw: `box-shadow: 0 0 0 2px ground, 0 0 0 3.5px #1c1d21`, a near-black 1.5 px ring. File: `s15-proj-phasehead-393-light.png`.
- Suggest: keep it raised and numbered (R7 answer 10) but swap the black ring for `0 1px 3px rgba(0,0,0,.18)`, or a 1.5 px ring in the segment's own status colour.
- Related: when the pointer sits on a phase heading, the blue wash is cut by that heading's own 1 px grey bottom rule (`s17-proj-scroll-3300-393-light.png`). Hide the rule while the row is washed.

**L8. Routine rows sit 3 px off the text column.**
- Saw: turning-point and check rows start text at x 77; routine rows ("First draft", "Spec revised") at x 80, with icons at x 47 in both.
- Rails and text columns fall at 10, 34, 48, 77/80, 95, 104, with steps of 24, 14, 29, 18 and 9. Row paddings are 9/8, 7/7 and 3/3.
- Why: P-001-trial-view-notes-2 note 3 (one spacing scale).
- Suggest: a 4 px grid, with level indents 12, 32, 52, 80 and every event's text at 80; row padding 8 (quiet rows 4).

**L9. Hairlines and the pointer.**
- Saw: all rules are 1 CSS px (3 device px on an iPhone); rails and the phase rule are `#c7c7cc`, the band rule `#e7e9ed`. The blue pointer is a 9×14 triangle flush at x 0, clipped by the screen edge.
- Suggest: 0.5 px rules on retina, in one separator colour (`rgba(60,60,67,.18)` light, `rgba(84,84,88,.6)` dark). Pointer inset 4 px, with a 1.5 px rounded tip.

**L10. Map label halos.**
- Saw: labels carry a 3 px stroke in the ground colour (`paint-order: stroke`) and discs a 2.5 px ring. Fine in light. In dark the halo is pure black over the blue window, so each word looks outlined (`g-mapcorner-dark.png`).
- Suggest: halo 2 px, coloured as what is behind it (the window tint inside the window).
- The dashed blue outline is ruled (R7 answer 19) and stays. A lighter 1 px, 3/3 dash at 60% opacity would sit more quietly, as a suggestion within that ruling.

**L11. The page ends in the mockup's own notes.**
- Saw: about 2,600 px of 13 px build notes follow the list (`d-proj-bottom-light.png`; scroll height 7,077, list ends at 4,475).
- Suggest: fold them behind one "About this mockup" line so the page's end can be judged.

**Verified fine (keep):** tab bar 218×62 at 20 px from the edges and the 56 px round button, against Craft's 62 and 56; sheet 28 px radius with grabber, grouped white lists and paired buttons; search field 44 px; `viewport-fit=cover` and safe-area insets in use; `prefers-reduced-transparency` handled; sprint squares 7 px with 2 px radius, matching the owner's segmented picture.

### Motion (ranked)

**M1. No press feedback anywhere.**
- Saw: 0 `:active` rules, 5 `:hover` rules. On mouse-down, 15 controls (home project row, waiting row, bell, tab, round button, search, Back, both pills, milestone row, sprint row, event row, chip) showed no change in transform, opacity, background, filter or shadow. Tap highlight is the browser default `rgba(0,0,0,.18)`, a grey flash on iOS.
- Why: the largest gap from an Apple-quality app; the owner asked for "the motion".
- Suggest: `-webkit-tap-highlight-color: transparent`. Glass buttons, pills and tabs: scale 0.96 and brightness 0.96 on press (80 ms ease-out in; spring out). List rows: background `rgba(120,120,128,.12)` with 12 px radius on press, no scale. Tags: opacity 0.6.

**M2. The map is rebuilt, not moved.**
- Saw: each time the events in view change, the SVG is replaced. Icons jump to new places with no travel, the whole map dips to 55% opacity for 220 ms, and the blue window regrows from x 0 and width 0 (measured 14/92, 33/224, 39/265 … 46/307 over 450 ms, though its target had not changed). This happened 7 times in 1,000 px of steady scrolling and 17 times in 460 ms during the Now jump. Files: `c-win-regrow2.png` (frame 1 has the window 226 px wide instead of 309).
- Why: the owner asked for the map to "have motion and move with the timeline" (R3 answer 4). A blink and a regrow are neither.
- Suggest: keep one SVG. Key each event node and animate its `transform` to the new x (320 ms spring), keep the window rect alive so its transition runs from the old place, drop the opacity dip, and cross-fade labels over 150 ms.
- This is separate from the first review's F4, which asks whether the scale should change at all.

**M3. Folds snap.**
- Saw: closing a sprint went from 1,807 px to 52 px in one frame, with no animation other than the gauge's 280 ms pulse to scale 1.18. Opening snaps the full height in at once, then fades the body in over 260 ms from −6 px, so everything below jumps 1,755 px in a frame.
- Why: iOS disclosure groups animate height and rotate a chevron; the tapped row already stays put (R7 answer 12), so only what is below needs to move.
- Suggest: animate the body with `grid-template-rows: 0fr → 1fr` or a clip, 320 ms spring to open and 240 ms to close, content fading over the first 150 ms. Drop the 1.18 gauge pulse in favour of M1's press state.

**M4. Opening a project is two fades with a hole.**
- Saw: home fades out moving +40 px right (180 ms, ease-in). Then about 90 ms with nothing on screen while the page renders (t 240 to 333). Then band and list fade in from −40 px (300 ms, `cubic-bezier(.2,.7,.2,1)`), with the map scaling from 0.97 on a separate curve. About 610 ms in all, with the tab bar static through it. Back is the mirror. File: `c-open-strip.png`.
- Interruptibility: taps during it are dropped by a `busy` flag. A Back tap 150 ms in did nothing (Back is not yet in the page).
- Why: a modern push is one continuous, interruptible movement of both pages, usually with a shared element.
- Suggest, keeping the owner's direction (v11, "a push from the left"): render the project first, then move both layers together for 420 ms on one spring. Home goes to +30% width while fading to 0; the project comes from −100% to 0 with no fade. The tapped row's title flies to the project pill (matched geometry). Let a second tap reverse the running animation.
- Question for the owner, since it conflicts with v11's "push from the left": iOS pushes a deeper page in from the right and returns to the left, so Back's chevron and an edge-swipe would agree with the motion. Keep left, or flip?

**M5. Things appear with motion and vanish without, on mixed curves.**
- Saw: bubbles open with 180 to 200 ms animations (Why on the default curve, the session bubble on `ease-out`) and close with none. Menus close by scaling to 0.92 from the centre although they opened from a corner. The More menu opens in 260 ms from 0.9 at top right; the phase menu in 200 ms from 0.97 with −6 px at top left. The sheet opens in 460 ms and closes in 300 ms `ease-in`.
- Suggest: every overlay closes as the reverse of its opening at about 70% of the duration, from the same origin, which should be the control that opened it.

**M6. The centre pointer's wash and the Now landing snap.**
- Saw: the row wash has `transition: all 0s` and jumps row to row, while the map arrow glides (`left`/`top` 200 ms ease).
- Suggest: fade the wash (120 ms in, 200 ms out), or slide one wash element between rows with the same 200 ms curve as the arrow, so the two markers move as a pair. After a Now jump, replace the 1.8 s background flash with one soft pulse of the Now card (scale 1 → 1.02 → 1, 400 ms).

**M7. The sheet's drag is not physical.**
- Saw: it follows the finger 1:1 (60 px gave `translateY(60)`), closes past a fixed 90 px, and returns in 300 ms. Velocity is ignored and the scrim does not change during the drag.
- Suggest: close on a flick (over 0.5 px/ms) or past 33% of height, rubber-band upward drags at 0.3, and fade the scrim with the drag.

**M8. Context view.**
- Saw: zoom from 1.06 with fade (320 ms), then rows rise 8 px with a 14 ms stagger capped at 30 rows (about 780 ms in all), over a simultaneous smooth scroll. The hold shows nothing until about 515 ms, when the button turns blue; `navigator.vibrate(10)` is called.
- Suggest: fill a ring around the button during the hold (0 to 100% over 500 ms) so the press visibly charges. Cap the stagger at 8 rows (about 110 ms). Finish the scroll before the rows settle.

**Verified fine:** reduced motion. 0 animations on open, the Now jump is immediate (at its target within 60 ms), and map transitions are 0 s. Only the pill chevron keeps a 0.2 s rotation.

Animations in use on v32's screens, as logged:

| Interaction | What moves | Duration | Easing |
|---|---|---|---|
| Open project: out | home, opacity and +40 px | 180 ms | ease-in |
| Open project: gap | nothing on screen | ~90 ms | n/a |
| Open project: in | band, list, −40 px and fade | 300 ms | cubic-bezier(.2,.7,.2,1) |
| Open project: map | scale .97 → 1; SVG .55 → 1 | 300; 220 ms | same |
| Back | mirror of the above | 180 + 300 ms | ease-in, then the same curve |
| Fold close | none (snap); gauge pulse 1.18 | 280 ms | cubic-bezier(.2,.7,.2,1) |
| Fold open | body fade and −6 px (height snaps) | 260 ms | same |
| Map window | x and width | 450 ms | cubic-bezier(.2,.8,.2,1) |
| Map rebuild | SVG opacity .55 → 1 | 220 ms | cubic-bezier(.2,.7,.2,1) |
| Map arrow | left, top | 200 ms | ease |
| Pointer row wash | none | 0 | n/a |
| Phase menu open / close | scale .97 and −6 px / scale .92 | 200 / 160 ms | cubic-bezier(.2,.7,.2,1) |
| More menu open | scale .9, top right | 260 ms | same |
| Scrim in / out | opacity, blur 3 px | 220 / 240 ms | same |
| Sheet open / close / drag return | translateY | 460 / 300 / 300 ms | curve / ease-in / curve |
| Why bubble open / close | scale .98 and −4 px / none | 200 / 0 ms | cubic-bezier(.2,.7,.2,1) |
| Session bubble open / close | scale .96 and −4 px / none | 180 / 0 ms | ease-out |
| Context view | zoom 1.06 → 1; rows 8 px, 14 ms stagger | 320; 360 ms | cubic-bezier(.2,.8,.2,1) |
| Now jump | browser smooth scroll (2,600 px in ~0.8 s) | engine-set | engine-set |
| Now flash | background | 1.8 s | ease-out |
| Pill chevron | rotate | 200 ms | ease |
| Press, any control | none | n/a | n/a |

That is 13 durations and 5 curves, with two near-identical ones: `(.2,.7,.2,1)` in script and `(.2,.8,.2,1)` in CSS.

### Dark mode (ranked)

**D1. No elevation on black.**
- Saw: ground `#000`, band `rgba(0,0,0,.82)`. The band, the map and the list are one black plane split by a 1 px `#2c2c2e` line, and floating glass relies on a `rgba(0,0,0,.4)` shadow that cannot show on black. Files: `s10-proj-393-dark.png`, `g-tabbar-dark.png`.
- Suggest: lift by lightness, not shadow: band and map `#0f0f11`, glass controls `rgba(58,58,60,.72)` with the existing 1 px inner white edge at 12%, cards `#1c1c1e` as now.

**D2. Blue states are much heavier than in light.**
- Saw: the pointer's row wash is `#0f2a44` on black (about 1.4:1 against the ground) where light's `#e7f1f9` is about 1.04:1. The map window is 18% blue against 10% in light and reads as a solid navy slab; the Now card is `#0f2f52` inside a `#0a1d33` halo.
- Suggest: wash `rgba(10,132,255,.14)`, window `.12`, so "where I am" stays a tint in both themes.

**D3. Done merges are the brightest thing on the map.**
- Saw: discs on main flip to `#d1d1d6` in dark (`#3a3b40` in light) and outshine the blue Now disc (`s17-proj-scroll-1500-393-dark.png`).
- Suggest: `#636366` with a white glyph.

**D4. Text is legible through the dark tab bar.**
- Saw: at 78% of `#2c2c2e` with a 20 px blur, white titles behind stay readable ("they still wait on you", `g-tabbar-dark.png`); in light the same glass hides them.
- Suggest: dark glass at 86% or a 30 px blur, and in both themes a 48 px ground-colour gradient behind the bar so rows fade before they reach it.

**D5. Status washes go brown.**
- Saw: Failed `#332424`, waiting `#3c3325`, problem box `rgba(255,107,90,.12)`. Readable, but muddy beside the clean greys.
- Suggest: status colour at 18% over the surface (about `#3a1f1c` and `#3a2f14`), which keeps the hue.

### Consistency (ranked)

- **C1.** Two menu shapes: phase and project menus 270 wide, 20 px radius, top-left origin, 200 ms; More menu 249 wide, 28 px radius, top-right, 260 ms. One component.
- **C2.** Icon families: Phosphor in rows, tabs and the map, but the pill chevrons (16-unit box, stroke 2) and the More ring (24-unit box, stroke 2) are hand-drawn. Tab icons are bold, bell and round button filled, event icons thin. Suggest regular for rows, bold for controls and fill for selected, which is what the file's own note states, with chevrons and More from Phosphor.
- **C3.** Ring strokes: 3.5 in the pill (18 px), 3.5 on home (34 px), 2.5 in the list (30 px); the arc cap is round, the track butt. Suggest stroke at 9% of diameter everywhere, round caps, and a 600 ms spring on the arc when a value changes.
- **C4.** Home's card (18 px radius, no shadow, white on `#f2f3f7`) and the project page's plan card (14 px, 1 px shadow, dashed left rule) are different card recipes. The plan card's shadow is a light-theme colour reused in dark.
- **C5.** Times in one column appear as "12:07" and "13 Nov 21:44" at different widths, so the tags to their left shift from row to row. Reserve the column width (builds on the first review's O3).

## 3. Proposed motion spec

One standard curve, one spring, four durations.

Tokens:
- `--ease: cubic-bezier(.2,.8,.2,1)` for everything that enters or moves.
- `--ease-out-quick: cubic-bezier(.4,0,1,1)` for exits.
- Spring: stiffness 300, damping 30, mass 1 (about 0.35 s response, no visible overshoot). A bouncier one, stiffness 380 and damping 24, only for a press releasing and for a gauge landing.
- Durations: 100 (press), 200 (small), 320 (standard), 450 (page).

| Interaction | Behaviour |
|---|---|
| Tap feedback | Down: 80 ms `--ease`, to scale .96 (controls) or a grey row fill. Up: bouncy spring back. |
| Fold | Open: height 320 ms spring, content fades 150 ms, chevron 90° in 200 ms. Close: 240 ms. Tapped row fixed. |
| Bubble | Open: 200 ms `--ease`, scale .96 and fade, origin at the tag. Close: 140 ms, reversed. |
| Dropdown | Open: 240 ms spring, scale .9 and fade from the pill's corner. Close: 160 ms, same origin. Scrim 200 ms. |
| Sheet | Open: 450 ms spring from the bottom. Close: 280 ms. Drag follows the finger with velocity; scrim tracks the drag. |
| Page push | 420 ms spring, both pages moving together, title to pill as a shared element, interruptible and reversible. |
| Scroll-linked band | Map nodes and window: 320 ms spring to new positions, retargeted mid-flight, never rebuilt. Arrow and row wash: 200 ms `--ease`, together. Nothing fades to signal a change. |
| Now jump | Scroll 450 to 600 ms regardless of distance (very long jumps: cross-fade 120 ms, land, settle 200 ms), then one 400 ms pulse on the Now card. |
| Context view | 320 ms zoom from 1.04 with fade; first 8 rows staggered 14 ms; scroll first, settle after. |
| Reduced motion | No transforms or scroll animation. Replace each with a 120 ms opacity cross-fade (0 ms for scroll jumps). Press states stay as colour only. Gauges set without animating. |

## 4. Screenshots

All in /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-polish/. Raw logs: `motion.txt` and `metrics.txt` in the same folder.

Most telling:
1. /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-polish/c-open-strip.png (M4: six frames of opening a project, with the fade and the gap)
2. /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-polish/c-win-regrow2.png (M2: the map window regrowing after a rebuild)
3. /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-polish/g-band-bottom-light.png (L1: sharp ghost text under the band, 3x)
4. /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-polish/g-rows-light.png (L6, L8: tag styles and the 3 px offset, 3x)
5. /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-polish/s17-proj-scroll-1500-393-dark.png (D1 to D3: dark elevation, navy wash, bright merge discs)
6. /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-polish/s15-proj-phasehead-393-light.png (L7: the black ring on the phase strip)

Others by pattern in the same folder:
- `s01` to `s07`: home, light and dark, 393 and 360, sheet and menu.
- `s10` to `s25`: project page, pills, bubbles, Now, Context view.
- `m-*`: motion frame sequences. `p-press-*`: each control held down. `g-*` and `g2-*`: 3x close-ups and the blur test. `d-*`: page end.

## Not checked

- A real iPhone or Safari: San Francisco type, the band's blur there, momentum scrolling, frame rate, real touch and haptics.
- 414 px.
- The Needs bubble's motion: my selector did not find its tag in this run.
- The fold of quiet projects on home.
- One capture set (`c-winscroll-grid.png`) was taken after my press test had changed the page's state and is not evidence for anything above.
