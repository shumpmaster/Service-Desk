# BranchMap

Every sprint of the current phase at once, floating at the top of a project's timeline. It replaces the lanes down the left (LaneGraph) on the timeline. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-3.md: answers 1 to 3, the branch map on top; 4 to 6, "A: whole phase, panning"; 10 to 13, icons where you are, with colour).

- Floats: it sits at the top of the project's timeline, under the page's header and chips, and stays there however far the page scrolls (sticky, glass: `surface-floating` blurred, a `separator` hairline below).
- Shows the whole current phase: every sprint, oldest on the left, time running left to right. Main runs along the bottom, 7 wide in `groove-main`, darker than the sprints' 5-wide `groove`. Each sprint is a lane above main, curving out where it starts and back down at each merge; a merged sprint frees its lane for the next. Each lane is labelled with the sprint's number and name.
- Merges sit on main, on dark `main-mark` discs.
- A soft blue window (`map-window`) marks the events in view in the list below. As the page scrolls, the window moves and the map slides sideways to keep it centred (it moves with the timeline: the owner, round 3, answer 4).
- Events in view show their kind's icon on a 21 disc; the rest of the phase is 8-point dots.
- Status colour on both icons and dots, the same soft tones as the rows: red (`status-bad-dot`, an icon in `status-bad` on `status-bad-track`) for failed or blocked, yellow (`status-wait-dot`, `status-wait-tag` on `status-wait-tag-bg`) for waiting on you. Done stays grey. Now stays blue (`accent-select` in a `now-block` ring).
- Below it, in the same floating band, sits the PhaseRow.
- Motion: the window and the pan ease over about 0.45 s; reduced motion moves them at once.
