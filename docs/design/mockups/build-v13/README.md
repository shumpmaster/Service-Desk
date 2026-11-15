# Mockup v13 build layer

v13 is v12 plus this layer. It carries out the owner's third round on v12 (decisions/questions/P-005-design-round-3.md); everything else behaves as in v12.

    python3 v13.py ../timeline-v12-craft.html ../timeline-v13-craft.html <phosphor assets>

`<phosphor assets>` is the `package/assets` folder of `npm pack @phosphor-icons/core@2.1.1` (MIT).

Inside a project with a plan (the timeline, and the widget's); projects without a plan show their events as in v12:

- **The branch map floats at the top** (the library's BranchMap), sticky under the page's header and chips. It shows every sprint of the current phase from the plan's real records (for Design: M6's S-010 and S-011, Design-5's PR #445 and Mockups v2 to v4), oldest on the left, main along the bottom. A soft blue window marks the events in view in the list; as the page scrolls, the window moves and the map pans to keep it centred, and each lane's name follows into view. Events in view wear their icons, the rest are dots; failed or blocked soft red, waiting on you soft yellow, done grey, Now blue. Design-3's planned research is left off the map.
- **The phase row** (PhaseRow) sits under the map in the same band: one gauge per phase, oldest left, the current one raised. Tapping another phase opens its milestones above the current phase and scrolls them under the band; tapping it again folds them. Tapping the current phase goes back to the current step.
- **The list shows only the current phase** and opens on the current step with everything in it open: the milestone in progress (M6), its open sprint (S-011) and the worked step (2.7.2.5) with its actions; Now sits just under the band. The Now button returns there.
- **No lanes:** the project line, main's groove and the branch-off curve are gone; events run full width with their icon at the left edge. A merge keeps its dark disc and says "main".
- **Gauges** (Gauge) on phases, milestones and sprints; tapping one opens or folds its section. A phase counts its milestones reached out of the milestones in it. Milestone and sprint percentages are plain examples, marked "example", because what a gauge counts is not yet ruled. Colours: Design yellow, M6 and S-011 red, S-010, PR #445 and Design-1 green, milestones not started uncoloured.
- **Marks and tags** (StatusMark) on events and steps: Stop "Waiting on you" yellow, Review "Failed" red, Commit "Done" grey, the step "1 blocked" red, Merge PR #446 "Awaiting your answers" yellow. Tapping a step's row folds its actions.
- Kept: the numbers from phase to action, the agent's plan (ActionPlan, still an example), the Now card (its bar, which sat on the trunk, is gone), the push from the left (v11), the sheets, menus and chips.

Not yet published.
