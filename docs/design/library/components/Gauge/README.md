# Gauge

How far a phase, milestone or sprint has got, and whether it is all right: a tinted ring filled by percent, with its icon inside. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-3.md, answers 4, 6 to 8: "A - but let's make the color gauge softer", "I like the tinted ring. Do a slightly thinner line.").

- 34 round, line 3.5. The arc starts at the top and runs clockwise; it is filled by percent with round ends. The inside of the ring takes an 8% wash of the status colour, the track 16% and the arc 55% (`status-*-wash`, `status-*-track`, `status-*-arc`), so the colour stays soft.
- Only phases, milestones and sprints wear it (the owner: "only phases, milestones and sprints get the gauges"). Events and steps use StatusMark.
- Inside: a phase's number; a small filled circle for a standard milestone, a small square for one of the project's own; the git-branch icon for a sprint.
- **What it counts** (the owner, 25 November 2026, decisions/questions/P-005-design-round-7.md, answer 25, "C: criteria + work"): a phase, its milestones reached of the milestones in the phase; a milestone, its criteria met (a project milestone, its spec's acceptance criteria passing their locked checks; a standard milestone, the checks that define it); a sprint, its events done of those it plans. Side by side they show work moving against what is truly done.
- **Its colour** (answer 26, "1: what happened"): red (`status-bad`) stopped (a stop card), or a review failed the third time; yellow (`status-wait`) waiting on you, or a review failed; green (`status-ok`) moving, or done; no colour when not started. A milestone and a phase take the worst colour of what they hold. The track takes the soft status colour too, so a gauge at 0 still shows its state. Due dates play no part; no record carries them.
- Tapping the gauge opens or folds its section (the owner, round 3: "the icons on the timeline should expand or collapse sections"). The whole row is the button, with the gauge as its mark; it carries aria-expanded.
- Milestone and sprint shapes are still on hold (round 2): the circle and square inside are placeholders.
