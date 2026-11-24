# Mockup v28 build layer

v28 is v27 plus this layer. It carries out the owner's round 7, answers 8 to 15 (decisions/questions/P-005-design-round-7.md). Home is as in v27.

    python3 v28.py ../timeline-v27-craft.html ../timeline-v28-craft.html

The drawing is the live options' own code, `../options-rails/source/`: rail.css and rail.js (`RL = '1'`), ph.css and ph.js, fin.css and fin.js, sg.css and sg.js (`SG = 'R'`), as shown on `../options-rails/` (rl-sgR). The library's card is LevelRails.

- The list stays top down (the bottom-up drawing, options-bottomup/, was set aside by answer 8).
- Each level steps in on its own rail and is labelled (PHASE, MILESTONE, SPRINT), one size per level; events use thin line icons with no disc.
- The phase heading starts at the left with no ring; under it, a strip of its milestones in their status colours, a blue tick at Now, the current one raised with its number; tap a box to go to it.
- Milestone rings show their percent inside, with no % sign. A sprint has a thin accent bar in its status colour and ten small squares to the right of its title; the rail down its rows is neutral.
- Every row under a sprint begins with its fourth number on a line of its own (2.2.2.1); a plan's actions follow it (2.2.2.7.1).
- Folding or opening a row keeps the tapped row where it was on the screen.
