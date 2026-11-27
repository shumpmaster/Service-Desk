# Mockup v45 build layer

v45 is v44 plus this layer. It carries out the owner's round 8, answer 30 (decisions/questions/P-005-design-round-8.md), a comment on v44's home: "Could we maybe concert this single phase indicator to a smaller series of the phases? Or something of the sort. And then put the waiting time on the line". With it, v44's leftovers.

    python3 v45.py ../timeline-v44-craft.html ../timeline-v45-craft.html

The code is `source/`: `series.js` and `series.css` (the series and the wait on the line), `fixes.js` and `fixes.css` (the leftovers), and one assert-once text patch to v41's filter in `v45.py` (the hidden count said once).

## What it does
- **A series of the phases.** On home, in the Projects section and the quiet projects' list, the ring with the phase's number gives way to four small segments under the project's name, Discovery, Design, Build and Launch, with a tick for each gate between them. Done: green (the gate's tick green once passed). The current phase: wider, in its state's colour, yellow waiting on you, red stopped, green moving, and named beside the series with its state ("Discovery · waiting on you", "Design · stopped, your call"). Not started: grey. A project with no plan on record (the quiet three) shows four dashed outlines and "No phases on record". The series is one image with a label ("Phase 2 of 4, Design, stopped, your call").
- **The wait on the line.** The project's strip (31 October to now) carries a stretch in the waiting colour from when the waiting thing began to wait to now, labelled above the line: the widget's readiness card since 4 November, 2:53 pm ("waiting 9 days"); stop card 5 since 9:42 am ("waiting 1 h 43 min"). The times are the records' (NEEDS and the widget's plan). Nothing waiting, no stretch. The strip now starts at the card's left, with 8 points above it so its labels clear the line on what the project is.
- **Home's buttons on one line at 393.** 14 points, 10 of padding, "Show on timeline" (its label for screen readers: "Show it on the timeline"). At 360 they still wrap to two lines.
- **Main's words plain.** On the map, each merge on main reads its plain name with the pull request's number under it in grey: Notes #443, Answer #444, Mockup #445, Questions #446. v25's spread keeps them 9 points apart or more; they are kept left of the right-hand gate's line. The map card is 11 points taller for the second line.
- **The hidden count, once.** With a cut or a branch off, a heading counts only the hidden rows no heading inside it holds; a heading folded away passes its count up. "Your decisions": one count ("10 hidden" on sprint 2.2.2) where v44 showed one on each level.
- **The project pill at 360.** Below 370 points the phase pill shows its ring and number alone, so "The timeline" keeps its name. The owner has not ruled on this (U8); it is noted in TIMELINE-CURRENT.md's Not settled.
- **The gate captions.** Each is kept 8 points clear of every station and word on the map, moved along its line to where there is room, or shortened to the gate's name with the full caption in its title (today both read "Design gate" and "Build gate").
- **The handover tag.** Re-measured: 6.96:1 in light and 7.36:1 in dark on the at-work row, 7.76 and 10.19 on home's project line. Its words now take the waiting tag's colour in dark by rule (v44 fixed #6e4806 for both themes).
- **Home's slim bar.** Once the title condenses, it sits at the left, clear of the four buttons (v44's "?" made the centred title run under them).

## Checks
Runs: 393×852 and 360×740, light and dark; 393 with reduced motion; 393 with reduced transparency (CDP); simulated top insets 0, 59 and 200 points.

| Check | Result |
|---|---|
| Console errors, sideways scroll (home, quiet list open, project) | none in any run |
| Insets 0 / 59 / 200 (capsule, title; project's Back) | 12/42, 71/102, 112/143; Back 6, 65, 106 (as v42 to v44) |
| Home series | widget "Phase 1 of 4, Discovery, waiting on you"; timeline "Phase 2 of 4, Design, stopped, your call"; the three quiet projects "No phases on record"; no ring left |
| Wait on the line | "waiting 9 days", "waiting 1 h 43 min" |
| Home's buttons | one line at 393 (both rows); two at 360 |
| Show on timeline | lands Stop card 5 at the pointer |
| Main's words | Notes #443, Answer #444, Mockup #445, Questions #446; nearest gap 18 (393), 11 (360); none outside the card; none under the chip |
| Gate captions | 84 and 38 points clear of the nearest station or word (393); 73 and 38 (360) |
| Filter "Your decisions" | 3 events; one count, "10 hidden" on sprint 2.2.2; the cross brings back 13 and no counts |
| Branch toggle | "Second plan" off: button "1 branch hidden"; Show all brings back 13 |
| Project pill at 360 | "The timeline", not cut; the phase pill reads "2" |
| Card fold | 393 to 117 and back |
| Library `check.js` | no errors, light and dark |

**Contrast** (the page's worst 2% behind each text, inset 59; light / dark at 393, then 360):

| Text | Light | Dark |
|---|---|---|
| Series label ("· waiting on you") | 5.96, 5.93 | 5.76, 5.75 |
| Series phase name | 15.65, 15.63 | 16.45, 16.59 |
| Wait label on the line | 4.83, 4.83 | 11.73, 11.73 |
| Handover tag (home) | 7.76, 7.76 | 10.19, 10.19 |
| Main's word | 7.21, 7.16 | 5.18, 5.27 |
| Main's number | 7.95, 8.14 | 9.08, 9.07 |

## Short
- At 360 the two buttons still wrap (262 points for two labels of about 140 each).
- Both gate captions are shortened to the gate's name: the full caption has no 8-point-clear stretch of its line on this map.
- The series and the wait are drawn from the mockup's records; a project's phases on the real desk need its plan on record (the quiet three have none here).
