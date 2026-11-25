# Mockup v32 build layer

v32 is v31 plus this layer. It carries out the owner's round 7, answers 24 to 26 (decisions/questions/P-005-design-round-7.md). Home is as in v31.

    python3 v32.py ../timeline-v31-craft.html ../timeline-v32-craft.html

The code is `../options-gauges2/source/` (gauge.css, gauge.js); the options were shown on `../options-gauges2/`. The library's card is Gauge.

- A phase counts its milestones reached; a milestone its criteria met (M6: 0 of S-011's 38 acceptance criteria; Design-5, Design-3 and Design-6 name the checks that define them); a sprint its events done of those it plans (S-011: 9 of 12).
- Red: stopped, or a review failed the third time. Yellow: waiting on you, or a review failed. Green: moving, or done. No colour: not started. A milestone and a phase take the worst of what they hold. A ring's track takes the soft status colour, so a gauge at 0 still shows it. No figure is marked "example" any more; the criteria counts other than M6's say what they would count.
