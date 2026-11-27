# Mockup v46 build layer

v46 is v45 plus this layer. It carries out the owner's round 8, answers 31 and 32 (decisions/questions/P-005-design-round-8.md): "Is there any room to put a quick summary of what the project is about, and a kind of snapshot text summary of the bigger picture we are working on", then "Option C please".

    python3 v46.py ../timeline-v45-craft.html ../timeline-v46-craft.html

The code is `source/summary.js` and `source/summary.css`, option C of `../options-r8-summary/source/` (sm.js, sm.css), here per project. The library's card is ProjectSummary.

## What it does
- **One line at the head of the map card.** The first row inside the card's inner box, 36 high with a hairline under it: a dot in the project's state colour, the line in ink, a chevron. The timeline: "Design · the records plan stopped · your call" (red dot). The widget: "Discovery · the brief failed · your call" (yellow dot). Below 380 points wide the short form ("Design · plan stopped · your call", "Discovery · brief failed · your call"), never cut. The gate lines, their captions and the filter button start below it; it folds away with the map.
- **"About this project".** A tap opens a sheet: the project's name and purpose; "Where it stands" in four sentences; "Its phases" at a glance; "What waits on you" with "Choose what happens next", which opens the same choices sheet as the stop (timeline: 5 choices) or the Readiness card (widget: 2 choices).
- **The words are examples**, written from the page and the records at the mockup's moment (14 November): no record holds a project's purpose or a snapshot yet (records request item 17). The real records have moved on (status/P-005.toml names spec S-012 and stop card 6).

## Checks
Runs: 393×852 and 360×740, light and dark; 393 with reduced motion; 393 with reduced transparency (CDP); simulated top insets 0, 59 and 200 points.

| Check | Result |
|---|---|
| Console errors, sideways scroll (home, project, widget, sheets) | none in any run |
| The line inside the card's inner box | yes, every run; top 70, bottom 106 (inset 0) |
| Gate captions and filter button below the line | gate tops 116 and 302, filter 110 (line ends 106) |
| The line cut | never: full form at 393 (both projects), short form at 360 |
| Line contrast (worst 2% of its background, inset 59) | 14.92 light, 13.51 dark |
| Sheet | "The timeline": Where it stands, Its phases (4), What waits on you; no sideways scroll |
| Choose what happens next | timeline: the stop's sheet, 5 choices; widget: the Readiness card's sheet, 2 choices |
| Card fold | 433 → 117 → 433; the line folds away with the map |
| Insets 0 / 59 / 200 (project Back; line top) | 6/70, 65/129, 106/170; home title 42, 102, 143 (as v42 to v45) |
| Landing | Stop card 5 ("Work stopped…") at the pointer |
| Home | 2 priority rows; series "Phase 1 of 4, Discovery, waiting on you" and "Phase 2 of 4, Design, stopped, your call"; no line on home |
| Search | opens |
| Filter "Your decisions" | 3 events; the cross brings back 13 |
| Branch toggle (pointer press) | "Second plan" off: "1 branch hidden"; Show all brings back 13 |
| Session tag | "Plan checks 14 Nov" |
| Glossary words | 9 dotted words in the list |
| Library check.js | no errors, light and dark |

The band is 40 points taller while the card is open (393 → 433 at 393 wide), as the options page said; folding gives it back.

## Short
- On the widget's small map, the filter button sits over the last station ("Readiness card"). It does the same in v45; not this layer's change.
