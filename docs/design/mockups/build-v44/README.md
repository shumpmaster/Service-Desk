# Mockup v44 build layer

v44 is v43 plus this layer. It carries out the owner's round 8, answers 27 and 28 (decisions/questions/P-005-design-round-8.md): "This is perfect, I approve. Now start the plain words test", and on the plain-words options (../options-r8-plain/), "All recommended. The only thing I want to add is a branch toggle in the filters. And I want to add an automated session naming and handover required flags."

    python3 v44.py ../timeline-v43-craft.html ../timeline-v44-craft.html

The code is `source/`: `plain.js` and `plain.css` (from ../options-r8-plain/source/pw.js and pw.css, made to cover every row and fixed on), `faults.js`, `times.js`, `branches.js`, `sessions.js` and `extra.css`. The test behind it: docs/design/audit-2026-11-27-v43-plain-words.md.

## What it does
- **Plain words (A + B + E + D, the five questions as recommended).** Every event, sprint, research and home row: a plain title first, its number and codes after it in grey; a plan's actions with their number after them. A "what this is" line under each project (home and its page), phase (operating-model copy) and sprint; the project's and sprint's lines are marked "example". Stop and gate choices as plain actions with the key beneath; decisions read "You chose: …" with "The option you tapped: …" beneath. Plain role names on the rows (the scheduler, the plan reviewer, the readiness reviewer). "Answered" for a stop or decision that is done; "Your decision" for "Yours". The filter's cuts read Your decisions, Big moments, Only what was merged. A "?" on home's capsule and dotted first-use words open the glossary and cast sheet, which says the workers are AI sessions. Why stays a tag. A standard milestone's id (Discovery-8) stays hidden; M6 and its kin follow the name in grey.
- **The test's four faults.** (1) Each project has its own gates: the widget's Design gate reads "Not reached · Your decision to make", its sheet speaks of the widget, its menu line says "yours"; the timeline's stay v35's. (2) The widget's count opens "1 thing waits on you in Home-screen widget". (3) Home's "Decide what's next" (was Answer) opens the same choices sheet as the project page (stop card 5's five choices; the widget's Readiness card's two). (4) The widget's waiting item is the Readiness card (1.8.1.3) everywhere: home's event line, its row (kind "Card", with "Choose what happens next"), its sheet and the wait sheet.
- **One clock.** The remaining UTC and 24-hour times (the widget's rows, sheets, bubbles, banners) read in Chicago with am or pm and a date when not today; v34's converter keeps the list's own clock times.
- **Branch toggle.** In the filter's panel, below the cuts: "Branches", main and each lane in the phase (plain name, number and code after), each with a switch; off blanks its stations and strikes its name on the map and hides its rows in the list (headings keep v41's hidden count); "Show all"; the button says "1 branch hidden". The cross and "Everything" clear branches too. The switches act on the press (v40's listener takes the panel's clicks at the window). Names are examples.
- **Session names and the handover flag (examples).** Sessions c0, c1 and c2 named from their "doing" lines; the tag reads the short name and the day ("Plan checks · 14 Nov"); the link bubble, the at-work row and sheet, home's project line and the Context view name the session; the session at work (c2) carries "Handover needed: ending with work open: the second plan waits on your stop-card answer". Home's priority list takes a handover only once a flagged session has ended with its handover written ("Start the next session"); c2 is still at work, so the list is unchanged.

## Checks
Runs: 393×852 and 360×740, light and dark; 393 with reduced motion; 393 with reduced transparency (CDP); simulated top insets 0, 59 and 200 points.

| Check | Result |
|---|---|
| Console errors, sideways scroll | none in any run |
| Insets 0 / 59 / 200 (capsule, label, title) | 12/23/42, 71/83/102, 112/124/143 (as v42 and v43) |
| Home | 2 rows, plain titles, codes after in grey; "The work is done by AI assistants; you make the calls."; "?" on the capsule |
| Home's "Decide what's next" | opens stop card 5's sheet (row 2) and the Readiness card's (row 1), each with its choices |
| "Show on the timeline" | lands Stop card 5 at the pointer (393 light: row 460 to 678) |
| Why tap | page moves 0 |
| Needs bubble | opens; Escape closes it |
| Filter "Your decisions" | 3 events, button "Your decisions"; the cross brings back 13 |
| Branch toggle | "Second plan" off: its 13 rows hidden, the headings say "13 hidden", button "1 branch hidden"; "Show all": 13 back, button cleared |
| Card fold | 382 to 117 and back |
| Top row | 38 on all four |
| Title condensing on home | `--tt-p` 1.000 at 80 points |
| Widget page | its own Design gate (Not reached); its count opens its own wait sheet; its card row "Card · 4 Nov, 2:53 pm · 1.8.1.3" with the choices button |
| Session names | tags "Plan checks · 14 Nov", "Stop card 4 work · 13 Nov"; bubble and at-work row name the session; "Handover needed" shown |
| Library `check.js` | no errors, light and dark |

**Contrast** (the page's worst 2% behind each text, inset 59): home's "what this is" 5.85 light / 4.90 dark (393), 6.02 / 4.96 (360); codes in grey 6.16 / 5.54 on home, 5.69 / 6.50 in the list (360); "example" 6.13 / 5.34; the AI line 5.00 / 6.21; session tag 6.58 / 8.02; session day 5.43 / 5.87; plain event title 14.9 / 18.1. The handover tag measured 3.87 in light on the at-work row's grey and was darkened to #6e4806 (dark: 9.2 to 10.1). The list's codes at 393 measured 1.0 by this method because the clip took in the row's own dot; the same codes read 5.7 to 6.5 at 360. Planned rows stay faint as before.

**Plain-words self-check** (lines on home and the project page, all folds open, that start with a code): home none; project page only the level labels' position numbers on their own small line (MILESTONE 1.8, SPRINT 2.2.2, the plan's 2.2.2.7), kept by R7 answer 14 and R8 answer 6 item 10. Map lanes read "2.2.2 Second plan" (the number first, which the filter uses to find a lane).

## Short
- The plain titles, purposes and answer labels are written from words already on the page; for the real desk each needs a record that carries plain text (../../requests/2026-11-26-timeline-records.md, items 11 to 14).
- On home at 393 the two buttons wrap to two lines ("Decide what's next", "Show on the timeline").
- Main's labels on the map keep their pull request numbers (PR #443 to #446); the widget's map keeps its own short words.
- The "9 hidden" count still repeats on each heading level (v41).
