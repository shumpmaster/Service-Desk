# Mockup v34 build layer

v34 is v33 plus this layer. It carries out the owner's round 8, answer 6, "I approve all as recommended" (decisions/questions/P-005-design-round-8.md): the recommended option of each of the 12 held changes drawn on options-r8-top/, options-r8-map/ and options-r8-list/.

    python3 v34.py ../timeline-v33-craft.html ../timeline-v34-craft.html

The code is the options' own (`../options-r8/source/r8.css` and `r8.js`), fixed to the chosen options: `source/r8v34.css` and `source/r8v34.js`. Two additions to it: a row with only a clock time takes the date of the event before it, and home's times and live line read in Chicago too.

| # | Held change | Built |
|---|---|---|
| 1 | Top row height (L4) | Back, both pills and the bell capsule 38 high |
| 2 | Why's outline (L6) | a quiet grey fill like the link tag; a thin blue edge while its bubble is open |
| 3 | Push direction (M4) | a project pushes in from the right; Back goes to the left |
| 4 | Where the page opens (F2) | on open and on the round button's tap, Stop card 5 at the pointer, its arrow on the map |
| 5 | The map while scrolling (F4) | one scale per phase |
| 6 | Build and Launch (F5) | planned milestones as dashed rings on a dotted line; names cut to about nine letters |
| 7 | Milestone tap (F6) | a second tap on the selected milestone clears it; a third selects again |
| 8 | Room for the list (U3) | a handle at the band's foot folds the map to one line and back |
| 9 | Link labels (U5) | tags name their session ("CoS 14 Nov"); the Context view numbers event rows and names each link |
| 10 | Milestone names (R1) | MILESTONE and its number on a small line above; the name full width, up to two lines |
| 11 | Empty rings (R2) | a dashed ring with no number where criteria are not on record |
| 12 | Dates and time zone (O3) | times in America/Chicago; a date on anything older than today, on the list and home |

Short: **U8** (the project pill's name) is still cut at 393 and 360 for Home-screen widget. With the 38 row, letting the phase pill give way first squeezed it to "1 D"; that was reverted. A full fix needs the phase pill to drop its name, which is a ruling for the owner. The planned milestones' names on the F5 map are cut to about nine letters, as drawn.

## Checks
Playwright and Chromium, 393×852 and 360×740, light and dark, and reduced motion at 393. No console errors and no sideways scroll in any.

| Check | 393 light | 393 dark | 393 reduced | 360 light | 360 dark |
|---|---|---|---|---|---|
| Push: the project starts to the right (x after 60 ms) | +243 | +243 | none (no motion) | +222 | +222 |
| Opens with Stop card 5 at the pointer | yes | yes | yes | yes | yes |
| Round button tap lands Stop card 5 at the pointer | yes | yes | yes | yes | yes |
| Map arrow shown on open | yes (x 275) | | | | yes (x 251, 360 dark) |
| Arrow x scrolling down Design, 200 at a time | 156, 203, 227 … 239, 275, 346 (never back) | | | | 121, 164, 207 … 218, 251, 305 |
| Top row heights | 38 ×4 | 38 ×4 | 38 ×4 | 38 ×4 | 38 ×4 |
| Tags | CoS 13 Nov, CoS 14 Nov | same | same | same | same |
| Why: fill, no border; tap moves nothing; blue edge open | yes; 425→425 | yes | yes | yes | yes; 457→457 |
| M7's name width, lines (full row, ≤2) | 333, 2 | 333, 2 | 333, 2 | 300, 2 | 300, 2 |
| Dashed empty rings | 11 | 11 | 11 | 11 | 11 |
| Build: dashed planned rings | 9 | 9 | 9 | 9 | 9 |
| Handle: band open → folded → open | 334 → 76 → 334 | same | same | same | same |
| M6: selected, after 2nd tap, after 3rd | yes, no, yes | same | same | same | same |
| Open in Claude on screen (y) | 423–453 | same | same | 346–376 | 346–376 |
| Needs: opens; Escape closes | yes; yes | | | | yes; yes |
| Context view: event rows numbered; links | 2.2.1.1 …; PR #428, CoS 13 Nov, CoS 14 Nov | same | same | same | same |
| Times | 6:07 am; S-010's "13 Nov, 3:32 pm"; home "9:42 am", "13 Nov, 10:56 pm", live line "11:25 am CT" | | | | |

v33's fixes still hold: a Why tap leaves the tag and page where they were, the Needs bubble closes on Escape, Open in Claude is on screen.
