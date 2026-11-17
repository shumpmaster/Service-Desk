# FilterChip

Switches the view, one of many, in a 40-high capsule. From ref 12.

- `size-chip` high, at least 68 wide, 8 apart, `fill`, full radius; an icon only, 22, regular, in `chip-icon`.
- Selected: `accent-tint` with a thin `accent-tint-edge` and a light top edge; the icon switches to its filled form in `accent-select`, and the label appears in 17 semibold `accent-on-tint`.
- Every chip is raised a little: `shadow-chip` gives a light top edge, a darker bottom edge and a small drop; the selected one takes `shadow-chip-selected`, a white top edge, a rim darker at the bottom and a soft drop below, as in ref 12.
- Named, for switching projects (the owner chose this on 15 November 2026: "Option A but they are missing that slight element of shadow or whatever that makes them look 3d"): every chip shows its project's name in 15 regular `text-1`, no icon; the selected one is 17 semibold `accent-on-tint` and adds a count badge, 22 high, white on `accent` (4.8:1). The row scrolls sideways.
