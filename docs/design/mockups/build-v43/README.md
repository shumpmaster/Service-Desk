# Mockup v43 build layer

v43 is v42 plus this layer. It carries out the owner's round 8, answers 24 and 26 (decisions/questions/P-005-design-round-8.md):
"I need the structure to be aimed at events that I’m needed on. Like a priority list for my actions" and, on the options,
"This option A is the one, however. I don’t like that pr446 has effectively 3 things associated with it, unless those are all 3 independent questions?"

    python3 v43.py ../timeline-v42-craft.html ../timeline-v43-craft.html

The code is `source/`: `priority.css` and `priority.js` are option A of `../options-r8-priority/source/` (pr.css, pr.js) with option A fixed on (the B and C branches stay in the file and never run); `answered.js` makes Go to it open the project with the row's event at the pointer; `answered.css` is a placeholder. `v43.py` applies checked text patches (each asserts its target appears once).

## What changed
- **Home is option A.** "2 things need you, in 2 projects. Start at the top." then "Your actions, most important first · 2": 1, the widget's readiness check (holds up the Discovery phase, waiting 9 days); 2, Stop card 5 (holds up 3 milestones, M6, M7, M8, waiting 1 h 43 min). Each row: its number, the project chip, the event line, the question, the reason and the wait, Answer (the card's sheet, as a home tap) and Go to it (opens the project and puts that event at the pointer). The projects follow under "Projects" with their strips and lines, without their waiting rows. v42's glass, the ground, the title band and the safe-top rule are unchanged.
- **PR #446's three questions no longer wait anywhere.** They were three independent questions, each with its own ruling (decisions/questions/P-005-s011-widths.md, P-005-s011-m8-reading.md, P-005-definer-pack.md), answered on 14 November at about 14:47 UTC (8:47 am CT), before the mockup's as-of time (17:25 UTC). Every place that showed them as waiting:
  - `NEEDS` (the three entries removed): home's list and sentence (5 → 2), the home group badges (The timeline 4 → 1), the project pill's count (4 → 1), the bell, the project heading's "1 thing waits on you", and the Context view all count from it.
  - The widget's plan pointed at NEEDS by position (`need: 4`); now `need: 1`. Without this the widget's page threw an error.
  - The merge row (2.2.2.5): its tag "Awaiting your answers" → "Answered"; its wait "waiting 2 h 39 min" → "answered at 8:47 am"; its note "they wait on you" / "they still wait on you" → "one question each: the phone widths, M8’s reading and the spec writer’s files".
  - The Needs bubble of "Spec revised, round 4": "Your answers to PR #446’s three questions" is now done, so its tag reads "Needs 2" (was 3): Stop card 5's answer and the experiments moving to S-011.
  - The wait sheet (v36): the three rows removed; its heading counts from its list ("1 thing waits on you in The timeline"); its Records line names the three records and says they were answered.
  - S-011's sprint line: "waiting on you 2 h 39 min so far" → "1 h 43 min so far" (Stop card 5 alone).
  - The filter's Yours cut: 4 → 3 (decision 2.2.2.1, Stop card 5, planned decision 2.2.2.13), with the gates kept as context.
- A question that waits would still be its own row, named by its own subject (the list is built from NEEDS, one row each).

## Checks
Playwright and Chromium; the page with the top inset set by text substitution (0, 47, 59, 120, 200). Scripts and screenshots in the session's scratchpad (`v43/`).

| Check | 393 light | 393 light, reduced motion | 393 light, reduced transparency | 393 dark | 360 light | 360 dark |
|---|---|---|---|---|---|---|
| Console errors | none | none | none | none | none | none |
| Sideways scroll | none | none | none | none | none | none |
| Home sentence | 2 things need you, in 2 projects | same | same | same | same | same |
| List rows / waiting rows left in project groups | 2 / 0 | 2 / 0 | 2 / 0 | 2 / 0 | 2 / 0 | 2 / 0 |
| List card glass | blur | blur | solid | blur | blur | blur |
| Search opens, Cancel closes | yes | yes | yes | yes | yes | yes |
| Title condenses on scroll | yes | yes | yes | yes | yes | yes |
| Project opens with Stop card 5 at the pointer | yes (row 508, pointer 599) | yes | yes | yes | yes (452, 543) | yes |
| Filter Yours: events shown, Stop card 5 at the pointer; cleared | 3, yes; 13 | same | same | same | same | same |
| Card fold | 441 → 173 → 441 | same | same | same | same | same |
| Why tap moves the page | no | no | no | no | no | no |

- **Go to it** (393 light and 360 dark): row 1 opens Home-screen widget with "1.8.1.2 · Review · Readiness check failed" at the pointer; row 2 opens The timeline with "2.2.2.10 · Stop · Stop card 5" at the pointer.
- **Answer** opens the stop card's sheet (Stop · The timeline, its choices, Open on GitHub).
- **Counts agree**: home 2; group badges 1 and 1; project pill 1; wait sheet "1 thing waits on you in The timeline", 1 row; project heading "1 thing waits on you"; Yours 3; Context view shows the merge row with no waiting mark.
- **Contrast** on the list card, worst 2% of the background behind each text, at inset 59: list header 8.8 (light) / 14.2 (dark); project chip 10.9 / 11.1; event line 5.8 / 6.1; question 14.5 / 16.0; reason 10.2 / 13.6. The Answer and Go to it labels cannot be measured this way (hiding the label hides its own button fill); they are v37's ink button (white on near-black) and the grey button with ink text.

Simulated insets (393 light, positions in points from the top):

| Inset | v42 capsule / label / title / first card | v43 capsule / label / title / first card | Project Back / pill / map card (both) |
|---|---|---|---|
| 0 | 12 / 23 / 42 / 176 | 12 / 23 / 42 / 212 | 6 / 6 / 58 |
| 47 | 59 / 71 / 90 / 224 | 59 / 71 / 90 / 260 | 53 / 53 / 105 |
| 59 | 71 / 83 / 102 / 236 | 71 / 83 / 102 / 272 | 65 / 65 / 117 |
| 120 | 112 / 124 / 143 / 277 | 112 / 124 / 143 / 313 | 106 / 106 / 158 |
| 200 | 112 / 124 / 143 / 277 | 112 / 124 / 143 / 313 | 106 / 106 / 158 |

The first card sits 36 lower in v43: the list's heading ("Your actions, most important first") sits above it. The cap holds: 120 and 200 give the same as each other.

## Short
- Not tried on a real phone.
- Answer is still an example: the desk cannot record an answer yet (docs/design/requests/2026-11-26-timeline-records.md).
- Older UTC times remain inside some sheets and the widget's rows ("15:36 plan review round 3 failed", "4 Nov 20:52"); this layer does not touch them.
