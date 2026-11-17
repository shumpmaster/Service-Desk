# Gauge

How far a phase, milestone or sprint has got, and whether it is all right: a tinted ring filled by percent, with its icon inside. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-3.md, answers 4, 6 to 8: "A - but let's make the color gauge softer", "I like the tinted ring. Do a slightly thinner line.").

- 34 round, line 3.5. The arc starts at the top and runs clockwise; it is filled by percent with round ends. The inside of the ring takes an 8% wash of the status colour, the track 16% and the arc 55% (`status-*-wash`, `status-*-track`, `status-*-arc`), so the colour stays soft.
- Only phases, milestones and sprints wear it (the owner: "only phases, milestones and sprints get the gauges"). Events and steps use StatusMark.
- Inside: a phase's number; a small filled circle for a standard milestone, a small square for one of the project's own; the git-branch icon for a sprint.
- Colour: green (`status-ok`) on track or done; yellow (`status-wait`) waiting on you or at risk; red (`status-bad`) stopped or blocked; no colour (the neutral `groove` track on `surface`) when not started.
- A phase counts its milestones reached out of the milestones in the phase. What a milestone's or a sprint's percentage counts is not yet ruled; until it is, a mockup marks its values "example".
- Tapping the gauge opens or folds its section (the owner, round 3: "the icons on the timeline should expand or collapse sections"). The whole row is the button, with the gauge as its mark; it carries aria-expanded.
- Milestone and sprint shapes are still on hold (round 2): the circle and square inside are placeholders.
