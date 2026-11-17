# PhaseRow

All of a project's phases in one row of gauges, under the BranchMap in the same floating band. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-3.md, answers 4, 5 and 10: "Phase gauges row").

- One Gauge per phase, its number inside, its name below in 12 `text-2`; oldest on the left, like the map. Each phase's percentage is its milestones reached out of the milestones in it.
- The current phase is picked out: raised on `surface` with `shadow-chip-selected`, its name in `text-1` semibold.
- The timeline opens on the current step with everything in it open, and lists only the current phase. Tapping another phase opens its milestones above the current phase (the button turns `fill`, aria-expanded true), and only then does the page scroll, to bring them under the band. Tapping it again folds them away. Tapping the current phase goes back to the current step.
- Gates are not shown in the row; how a gate shows is still to be discussed.
