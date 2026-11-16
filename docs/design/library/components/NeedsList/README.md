# NeedsList

What an event still needs before it can happen, and what it then unlocks, hung from the event as a short checklist. Chosen by the owner on 16 November 2026 (decisions/questions/P-005-design-round-5.md: answer 1, "option C is close, we just need to show it in a slightly different more consistent and easily graspable manner"; answer 2, "I think we mix c1 and c2. I like the look of c1, I like the checklist feel of c2"; answer 3, "Yes, take the mix").

- **Only where something is unmet.** An event whose requirements are all done shows nothing extra; why done things happened is a separate question.
- **Hung from the event**: indented to the event's icon, a 1.5 `text-3` line down the left.
- **"Needs first"** in 12 semibold caps `text-2`, with "0 of 3 done" at the right in plain 12.
- **Each requirement is a row**, as the event it points to looks, smaller: the ActionPlan's check column on the left (a check done, a yellow hourglass waiting on you, a red warning blocked, an open ring planned), the kind's icon on a 22 `fill` disc with no corner mark (the check column carries the state), the kind in 14 semibold with the same StatusMark tag that event wears, then its title in 14 `text-2`. Rows are split by the `separator-surface` hairline. Tapping one goes to that event, opening what holds it, and lights it for a moment.
- **"Then unlocks"**: the events that need this one, the same rows with an elbow arrow in place of the check.
- **The crossover with the plan**: a requirement that is an action of an agent's plan reads as that action ("Action 2.7.2.5.5", the list-checks icon), and that action in the ActionPlan carries "Needed by" and the event, in a small `fill` chip that goes to it.
- The records do not yet say which event needs which; until they do, a mockup's requirements are examples, marked so.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
