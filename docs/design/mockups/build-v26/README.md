# Mockup v26 build layer

v26 is v25 plus this layer. It carries out the owner's round 6, answers 8 to 14 (decisions/questions/P-005-design-round-6.md). Home is as in v25.

    python3 v26.py ../timeline-v25-craft.html ../timeline-v26-craft.html

The drawing is the live options' own code: `../options-order/source/` (`ORD = 'A'`) and `../options-due/source/` (`DUE_OPT = 'N'`), as shown on `../options-sequence/`. The library's card is ReadingOrder.

- A project's list reads top down at every level: the phase, its milestones (by when their work began or is meant to begin, Now at the clock), a sprint's events from the first to the planned last, a plan's actions from the first to the last.
- The numbers follow that order (M6 is 2.2, its sprints 2.2.1 and 2.2.2), on the list, the map and the map's chip. A standard milestone's own id (Design-5) is hidden in its row; M6 keeps its name.
- The start times are examples (14 Nov 17:25 is the mockup's clock); no record carries them yet.
