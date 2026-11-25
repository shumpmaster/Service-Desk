# Mockup v31 build layer

v31 is v30 plus this layer. It carries out the owner's round 7, answers 20 to 23 (decisions/questions/P-005-design-round-7.md). Home is as in v30.

    python3 v31.py ../timeline-v30-craft.html ../timeline-v31-craft.html

The drawing is the live options' own code: `../options-phases/source/` (phases.py's checked patches, phases.css, phases.js), `../options-slim/source/` (slim.css and slim.js, `HB = 'A'`) and `../options-top/source/` (top.css, top.js), as shown on `../options-top/` (top). The library's card is TopPills.

- Every phase and gate stays in the list, top down, each phase with all its milestones folded unless opened; standard ids are hidden in every phase.
- On the whole-phase map each sprint has a lane of its own (40 apart); a sprint's name steps aside where it would sit on an event's words. The map follows the phase at the fixed centre.
- One row at the top: Back, the project pill (opens the projects), the phase pill (the phase in view; opens the phases and gates), the bell and More. The title bar, the project pills and the phase tiles are gone; the live line is no longer shown.
- The list's titles 15.5 and detail lines 12.5, the map's words 10.5; an event's first line wraps instead of cutting its status.
