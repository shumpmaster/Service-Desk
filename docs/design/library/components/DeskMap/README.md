# DeskMap

Every project on the desk as one lane of a small branch map, at the top of the home page. It takes the place of the project cards. Chosen by the owner on 15 and 16 November 2026 (decisions/questions/P-005-design-round-4.md: answer 6, "show what you have pinned at the top, the maps - but things that need me will popup in their usually color and format"; answer 7, option 1, with "the map needs more space" and no "old cards"; answer 8, "B: opens large, folds slim").

- One lane per project, in the desk's order, on one shared time axis: two weeks ago on the left, now on the right, the time stretched toward now (square root) so today's events have room. Axis words in 10 `text-3`: 2 Nov, 9 Nov, yesterday, now; a dotted `accent-select` line at now.
- Each lane is the project's main in `groove-main`, 5 wide, its branches as 4-wide `groove` loops above, its events as 6-point dots, done green (`status-ok-arc`) where a release landed, and a Now dot at the right end.
- **Open** (as the page opens): 62 per lane. The project's name in 13 semibold `text-1`, its waiting count in the blue badge, and its one line in 12 `text-2` under the name.
- **Folded** (once scrolled to Needs you): 34 per lane, the name and badge only, pinned at the top in the glass band (`surface-floating`, blurred, a `separator` hairline below). Scrolling back to the top opens it again. Lanes, names and pop-ups slide between the two over about 0.4 s; reduced motion swaps at once.
- **Pop-ups**: each thing waiting on the owner sits on its project's lane as a capsule, its icon on a `surface` disc and its tag in the StatusMark tint: red (`status-bad-tag` on `status-bad-tag-bg`) for stopped or failed, yellow (`status-wait-tag` on `status-wait-tag-bg`) for questions. The newest sits at its place in time and the others flow left from it; one with no room to its left grows rightward from its icon. They pop in on load.
- Tapping a pop-up scrolls to its own row in Needs you and lights it in `map-window` for about 1.5 s; several rows (the three questions) light together. Needs you stays one list, in order of waiting.
- Tapping a lane opens its project.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
