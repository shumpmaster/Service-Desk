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
- **v33 (round 8):** as the events in view change, the map moves instead of being rebuilt: each event slides from where it was on the spring, the window from its old place, the lanes and words cross-fade; nothing dips (M2). Words on main keep a clear gap; a lane's name stays inside the frame (R4). The band behind the map is solid, with a soft fade where rows slide under it (L1); in dark it is a step lighter than the ground, done merges recede and Now stays the brightest mark (D1, D3).
- **v34 (round 8, answer 6):** one scale for the whole phase: the map no longer re-fits to the events in view, so as you read down the arrow only moves right (item 5; it sets aside R5 answers 4 and 7's fit to what is in view). A phase with no events yet draws its planned milestones as dashed rings on a dotted line, numbered, names cut to about nine letters (item 6).
- **v35 (round 8, answers 8 and 9):** the gate into the phase and the gate out mark the band's edges (GateRow); a research lane reads "Research Q-028".
