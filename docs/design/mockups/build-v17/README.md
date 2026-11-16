# Mockup v17 build layer

v17 is v16 plus this layer. It carries out the owner's round 5 on what an event needs (decisions/questions/P-005-design-round-5.md, answers 1 to 3). Home and the header are as in v16.

    python3 v17.py ../timeline-v16-craft.html ../timeline-v17-craft.html

The drawing is the live option's own code, `../options-needs/source/` (`needs.css`, `needs2.css`, `needs3.css` and `needs.js`, `needs2.js`, `needs3.js` with `NEEDS_OPT = 'M'`), so the option the owner chose and the mockup stay one. The library's card is NeedsList.

- An event that still needs something shows, hung from it by a thin line, "Needs first" with how many are done, then each requirement as a small row: the plan's check column, the kind's icon, the tag its own event wears, its title. "Then unlocks" follows with an elbow arrow. Tapping a row goes to that event, opening what holds it, and lights it.
- Events whose requirements are all done show nothing extra.
- The crossover with the plan: the blocked action 5.5 of step 2.7.2.5 is one requirement of Spec revised, round 4, reads "Action 2.7.2.5.5", and carries "Needed by Spec revised, round 4" in the plan.
- Examples: every requirement, and three planned events added to the top of S-011 (Spec revised, round 4; Plan review, round 4; S-011 frozen), since no record says yet which event needs which. Design-3's runs of E1 and E2 need S-011 frozen.
