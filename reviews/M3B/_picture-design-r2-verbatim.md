# M3B picture: the Design reviewer's drawing, round 2, the owner's changes, report verbatim

Dispatched by the orchestrator on 2026-10-26 to draw the picture from specs/S-001.md on the push branch (with the owner's records at c727982 and 3df44f7). The images are in docs/design/builds/m3b-picture/round-2/ (made up, not real).

---

I've redrawn the picture to the owner's changes, and nothing in the repository was changed. Each target now leads with its figure in the biggest type on the sheet, with a small bar chart under it and a green ✓ or red ✕ verdict in words. The full target line is one tap away, and the row on the project page shows five small marks, one per target. Nothing failed or was skipped. Nothing here is irreversible: the owner approves it or asks for more changes before the first step is built. "Didn't need me" and Home's weekly line haven't changed, so I didn't redraw them. Only the sheet's "Your weekly figures" block changed, because the trial weeks are now grouped.

## The PNGs (6 per theme)
All are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/. Each is labelled "Made up — NOT real", and the made-up launch day L is still Wed 2 Dec 2026.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-1-row-states-360-light.png — the row in every state, with five marks (V1 ✓ V2 ✕ …), its words and captions; also Alpha, another project.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-1-row-states-360-dark.png — the same, dark.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-2-sheet-before-launch-360-light.png — the whole sheet before launch: V1 to V3 say "Not measured yet" with their goal, V4 shows its two steps not done, and V5 has its bar against the 4-hour line.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-2-sheet-before-launch-360-dark.png — the same, dark.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-3-sheet-day5-one-outside-360-light.png — day 5, first weekly check in. V2 is outside with 2 false alarms (red bar, ✕ "Outside target so far"), and its full target line is opened. V5 shows two bars, "Live so far" and "Weekly check".
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-3-sheet-day5-one-outside-360-dark.png — the same, dark.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-3b-sheet-day5-first-screen-360-light.png — the same sheet's first screen, as it opens on a phone.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-3b-sheet-day5-first-screen-360-dark.png — the same, dark.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-4-sheet-after-14-days-one-missed-414-light.png — after the 14 days: V2 missed, its three weekly bars showing the one red week; the others within and met.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-4-sheet-after-14-days-one-missed-414-dark.png — the same, dark.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-5-weekly-figures-trial-weeks-360-light.png — "Your weekly figures", with the five trial weeks under one "Before launch: a trial, not counted" line.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture-r2/m3b-r2-5-weekly-figures-trial-weeks-360-dark.png — the same, dark.

The full set (360×740 and 414×896, light and dark, first screen and full length, with measure.log) is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/shots-r2/. The pages are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/src/ (row2-*.html, sheet2-*.html, m3b2.css). The scripts are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/tools/ (data2.mjs, lib2.js, build2.mjs, shoot2.mjs, composite2.mjs).

## Walk-through for the owner
- **Before launch:** each target says "Not measured yet" and gives its goal. V4 shows its two steps, both not done. V5 already has a figure (today's answer time) on a bar against the 4-hour line. It is marked green, but labelled "before launch, not counted".
- **On launch day:** V4's first step turns green ("Serving the Operations-Hub address since 2 Dec"). The row shows V4 as a half circle until the old repository is archived.
- **During the 14 days:** once your Chief of Staff's first weekly check is in, every target gets a big figure, a bar filled to it against a marked goal line, and a verdict. The verdict is green ✓ "Within target so far" or red ✕ "Outside target so far", with the Chief of Staff's own word ("on track" or "missed") just under it. The row shows the five marks at a glance, for example "1 outside target · 4 within, so far".
- **After the 14 days:** each weekly target shows one bar per week, so a bad week stands out in red. The Chief of Staff's final "met" or "missed" appears under each verdict, and the row reads "first 14 days checked · 4 met · 1 missed".

## My review of my own picture
I checked all 72 captures:
- **Fonts:** IBM Plex loaded everywhere.
- **Width:** nothing scrolls sideways at 360 or 414.
- **Sizes:** only the scale's 24, 13, 12 and 11 px are used; the 24 px is the figures. Weights are only 400, 500 and 600.
- **Contrast:** text is at least 6.40:1. The green and red marks and bar fills are 5.9 to 8.2:1.
- **Colour:** no vermilion and no gold. Green and red always sit beside a ✓ or ✕ and words.

What reads well:
- At a glance, the bar against the goal line answers "good or bad".
- The red week on V2 explains the miss without reading anything.
- The five marks make the row scannable.
- No chart is drawn for something not measured, so an empty bar can't be read as zero.

What reads less well:
- A single-week bar repeats the big figure in its value column.
- V4's step connector is faint.
- Before launch, V5's green mark could look as if measuring has started, even though its words say it hasn't.

One problem already in the desk is still there (a follow-up, not new): sandbox.css:1144 outweighs the clip padding at :743, so a quote exactly three lines long gets cut inside a sheet. The picture overrides it.

## Notes for the Definer (what AC97 must now say)
1. **The desk judges, and reading (g) is replaced.**
   - Each figure is judged against its goal:
     - green ✓ "Within target" (--ok)
     - red ✕ "Outside target" (--bad)
     - no figure: the grey ring with "Not measured yet", or the dashed "?" when a check is late
   - From W1 to WN it adds "so far".
   - A figure from before launch or on launch day is judged too, but says "before launch, not counted" or "launch day, not counted".
   - Under the verdict, one line gives the Chief of Staff's word: "Your Chief of Staff's check, <date>: <state>".
2. **The desk needs numbers and goals it can read.**
   - J25's `figure` is free text, so it needs a numeric value key (count or minutes).
   - The goals must be fixed for each target:
     - V1: 0 in total
     - V2: at most 1 per week
     - V3: at most 30 minutes per week
     - V5: a median under 4 hours
     - V4: two steps
   - Other projects' section 6 lines are prose, so a rule is needed for what the desk shows there (see question 3).
3. **Weekly targets (V2, V3).**
   - The desk judges each weekly line and draws one bar per week. A target is outside if any week is outside.
   - The big figure is the most in any week, which is the week the goal is about.
   - I didn't follow "the latest weekly figure": with that rule, a bad first week followed by a good last week would read "within" while the Chief of Staff says "missed".
   - V1 is judged on its total so far.
4. **The charts.**
   - Bars run from 0 to twice the goal (V1 from 0 to 3).
   - The goal is a 2 px ink line labelled "goal …". The fill is --ok or --bad on a --line track.
   - A measured zero shows as a 4 px stub.
   - No chart is drawn when nothing is measured, so AC97's "never an empty bar" stays.
   - AC97 needs a rule for a value past the end of the scale.
   - V4 is a two-step list. Its "n of 2 steps done" figure appears only once launch has happened. The desk could also read the old repository's archived flag itself, rather than waiting on the Chief of Staff.
5. **The sheet's layout.**
   - Each target block runs: its id and short name, then the big figure (--t-title, 24 px 600), then the chart, then the verdict.
   - Then "The whole target ›" opens the quote, and "<k> earlier checks ›" stays.
   - V5's bars are labelled "Live so far" and "Weekly check", then "First 14 days" after the window, and "Before launch" or "Launch day" earlier.
6. **The row.**
   - It shows five marks, each with its id.
   - During the window its words count the desk's verdicts ("1 outside target · 4 within, so far"). The final words keep the Chief of Staff's met and missed.
   - The left icon is red ✕ if any target is outside or missed. It is green ✓ only when the record is final and everything is met. Otherwise it is the half circle once anything is within.
   - When the checks file can't be read, V1 to V3 have no mark.
7. **The four small fixes.**
   - The stop rule's name shows once. The quote then starts "A miss is …" with a capital, which needs an exception to AC97's "word for word".
   - The trial weeks sit under one line.
   - State 8 keeps the half circle.
   - A same-day range shows one date (V4's "2 Dec").

## Questions for the owner (asked, not picked)
1. Before launch, V5 already shows green "Within target, before launch, not counted", and the row shows a green V5 mark. Keep that, or leave V5 grey until launch day?
2. If one week of false alarms (or upkeep) goes over target and later weeks are fine, should the target stay red for the rest of the 14 days, as the target's "every week" wording implies? Or should the mark follow only the latest week?
3. For other projects, whose targets the desk can't read a goal from, should it show their figures without a good or bad mark? Or should each project's targets be written so the desk can read the goal?
4. If the desk and your Chief of Staff ever disagree (the desk says within, the check says missed), which mark should show?
5. Do these chart forms work for you: bars against a goal line, one bar per week for the weekly targets, and two steps for V4?
