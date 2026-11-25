# Mockup v29 build layer

v29 is v28 plus this layer. It carries out the owner's round 7, answers 8, 16 and 17 (decisions/questions/P-005-design-round-7.md). Home is as in v28.

    python3 v29.py ../timeline-v28-craft.html ../timeline-v29-craft.html

The drawing is the live option's own code, `../options-centre/source/` (ctr.css and ctr.js, `CT = 'A'`), as shown on `../options-centre/` (ct-A). The library's card is FixedCentre.

- A small blue pointer sits fixed in the left margin at the middle of the list's window (between the floating band and the tab bar).
- The smallest row the centre line crosses (a phase heading, milestone, sprint, event, plan or action) is lightly washed in blue.
- On the branch map, a small blue arrow points down at the matching event: the event itself, a sprint's or milestone's first event, or the event a plan follows. It hides when that event is off the map's edge, and both hide in the Context view.
