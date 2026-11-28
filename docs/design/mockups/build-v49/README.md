# Mockup v49 build layer

v49 is v48 plus this layer. It carries out the owner's round 9, answer 5 (decisions/questions/P-005-design-round-9.md): "I approve all of your recommendations", read as option A of each on docs/design/mockups/options-r9-gate/: the open gate a sheet, its row "Yours · open" on the timeline's list and row 1 on home with its four choices as buttons; the reader one plain page for any record, opened from every sheet's Records rows. Records are read inside the desk with GitHub one tap away, which sets aside P-001-design-lab-open answer 9 ("Linked") for the timeline design.

    python3 v49.py ../timeline-v48-craft.html ../timeline-v49-craft.html

The code is `source/gate.js` and `source/gate.css`: option A of `../options-r9-gate/source/` gr.js and gr.css, with reader B, gate pages B and C, the hash switching and the theme-by-hash script removed. Elements are found by data attributes, not words: `v49.py` gives each map gate mark `data-kngate` (its name) and the At-work sheet `data-ppk="work"`; home's counts are read from its rows. The library's cards are GateOpen and RecordReader, with notes on GateRow, KindSheet, PriorityList and NeedsTab.

## What it does
- **The open gate** (an example, and marked so: today no gate is open): the timeline's real Design gate as it stood on 13 November, after case 2. Its sheet: Gate · open for your ruling; "May the timeline work go into Design?"; Waiting on you, Yours; the ask; The case opens (three lines fading, Read the whole case); What the Critic says (Recommends proceed; Its six points left); What the user representative says (Not needed: the owner is the user); Your ruling (Proceed recommended in the one blue, Hold, Recycle, Kill marked "Can't be undone"), each saying what follows, a tap saying the mockup sends nothing; Records as rows.
- **On the list** the Design gate row reads "Yours · open", its ring and row in the wait colour; it opens the sheet. Its map mark is no longer the passed one.
- **On home** the gate is row 1 (it holds up a whole phase): its number in the wait colour, Proceed, Hold, Recycle, Kill as buttons (each adds what follows and "The mockup sends nothing"; Kill's says it can't be undone), Read the case and rule (the sheet), Show on timeline (the list, scrolled to the gate).
- **The counts agree**: home "3 things need you", its list heading 3; the Needs-you badge 3, "Needs you, 3 waiting", Waiting on you 3, "3 things wait on you", its rows in home's order (gate first; v48's needs.js caches home's rows, re-read once the gate row is in); the timeline's own count 2 (its stop card and the gate) on the project pill, its chip and menu, and home's project row; the widget's 1.
- **The reader**: a page from the right over what opened it: kind, plain title, file and author in grey, the opening paragraph first in larger text, the rest in sections with citations in grey, Open on GitHub at the foot, "‹ <where it came from>" back (or Escape). Records it holds: the gate case, the Chief of Staff's notes on it, the project document's target user, the stop card's notes, memo Q-028, the widths ruling, handover part 11, L-0008 and Phase gates; any other record opens a short reader saying the mockup holds only its name.
- **Every sheet's Records line** is one row per record: plain title, file in grey, chevron; each opens the reader. The At-work sheet's Records add the last handover before that session (part 11).

## Checks
Runs: 393×852 and 360×740, light and dark; 393 with reduced motion; simulated top insets 0, 59 and 200 (copies with `env(safe-area-inset-top…)` replaced; every run above at 59). Script: Playwright, chromium. Every row below held in all 7 runs.

| Check | Result |
|---|---|
| Console errors, sideways scroll (home, gate sheet, reader, Needs you, every sheet and its reader, list, project) | none |
| Home's row 1 | the gate, number 1, buttons Proceed/Hold/Recycle/Kill, "Read the case and rule", marked example; each button adds "The mockup sends nothing" (Kill's also "Kill can't be undone") |
| Read the case and rule | sheet A: headings The case opens, What the Critic says, What the user representative says, Your ruling, Records; choices Proceed (recommended), Hold, Recycle, Kill (Can't be undone); Critic "Recommends proceed"; user representative "Not needed"; 4 record rows; Kill's tap says what follows and that the mockup sends nothing |
| Read the whole case, back | reader "The case for the Design gate, written a second time", opening first, Open on GitHub (its tap: "The mockup sends nothing"); back reads "Design gate" and returns to the sheet |
| Records rows open the reader, back returns to the sheet | gate (4 rows), stop card 5 (3; its notes), widget's readiness card (2), decision "New spec S-011, rounds reset" (2), research Q-028 (5; the memo), At work now (3; the handover row reads part 11, back "At work now"), the four ask sheets (2, 6, 1, 2), the checks' review record (2), an answered ruling (1) |
| Counts | home "3 things need you", heading 3, rows 1 (gate), 2, 3; badge 3, "Needs you, 3 waiting", Waiting on you 3, "3 things wait on you", rows in home's order; the timeline's project pill 2, its chip 2, home's project row 2; the widget's pill 1 |
| The gate row on the list | "Yours · open", in view after Show on timeline from home's row 1; opens sheet A; map mark not passed |
| The gate from the Needs-you tab | its row listed first; its buttons answer; Read the case and rule opens sheet A |
| "Can't be undone" contrast | 4.70 light, 5.02 dark (the lifted colour, measured on its wash over the sheet) |
| Smallest contrast, sheet and reader | 4.86 (dark, record row's file line); reader's grey lines 6.25 light, 7.33 dark |
| v48 still works | the Needs-you tab's sections in order; the four ask sheets; the pull request's checks ("3 of 4 passed, 1 running", the rules Passed), run and review record with back; Merge carries the owner's say; Desk returns home with the list (3 rows); Back from a project, Desk from a project, the tab from a project then Desk: 3 rows each; Decide what's next opens the stop's choices (5); summary line opens "The timeline"; session tag "Plan checks 14 Nov"; map filter "Your decisions" 13 → 3 events |
| Insets 0 / 59 / 200 (home title; project's Back) | 42/6, 102/65, 143/106 (as v42 to v48) |
| Library check.js | errors [] in light and dark; GateOpen and RecordReader within their heights |

## Short
- On home at 393 the gate row's two buttons ("Read the case and rule", "Show on timeline") take two lines; the other rows' buttons keep one line.
- The timeline's summary line still reads "the records plan stopped · your call"; it does not name the open gate (the open gate is an example on top of the mockup's 14 November records).
