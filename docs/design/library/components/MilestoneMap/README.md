# MilestoneMap

The BranchMap fitted to one milestone. Chosen by the owner on 16 November 2026 (decisions/questions/P-005-design-round-5.md: answer 1, "can we make it so whenever a milestone is selected, the branch map fits to the events in that milestone and expands the dots to our icons with descriptions if we can fit them?"; answer 4, "C: fit, spread what's in view").

- **Selecting**: tapping a milestone's row selects it (and opens it). The page opens with the milestone in progress selected. Folding the selected milestone, or the chip's cross, brings back the whole phase (BranchMap).
- **Fitted**: only the selected milestone's sprints, across the full width with nothing to pan; lanes 50 apart, so words fit under the icons. Every event wears its icon on a disc; planned events sit at the right as open rings (`text-3` ring on `ground`).
- **Spread what is in view**: the events shown in the list below take about six times the room of the others, sit under the soft window and carry two lines in 9.5: the kind in semibold `text-1`, then a short title in `text-2`, cut with an ellipsis to the room it has. The rest squeeze to the sides; an icon closer than 20 to its neighbour shrinks to 72%. As the list scrolls, the spread follows.
- **The chip**: the milestone's number and id in 11.5 semibold on `fill`, bottom right of the map, with a cross.
- Colour as in BranchMap and StatusMark: red failed, yellow waiting on you, Now blue, main dark.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
