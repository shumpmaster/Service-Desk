# Mockup v48 build layer

v48 is v47 plus this layer. It carries out the owner's round 9, answers 3 and 4 (decisions/questions/P-005-design-round-9.md): "I like the earlier option you recommended. For this one, can you find a way to incorporate the actual checks instead of just “checks passed”", then "A and no".

    python3 v48.py ../timeline-v47-craft.html ../timeline-v48-craft.html

The code is `source/needs.js` and `source/needs.css` (option A of `../options-r9-needs/source/` ny.js and ny.css, the option switching removed), `source/checks.js` and `source/checks.css` (option A of `../options-r9-pr-checks/source/` pc.js and pc.css, with the owner's own say folded into Merge), and `source/keep.js` (home's list kept on coming back). The library's cards are NeedsTab, AskSheets and CheckList, with notes on TabBar, PriorityList and KindSheet.

## What it does
- **The Needs-you tab** opens a view of its own: its icon lit, Plan off, its badge the waiting count, the same as home's (2). One list: Waiting on you (home's priority rows as they stand, and only those; "2 things wait on you. You answered 6 in the last 24 hours."), Other kinds of ask · examples just below it (a question, a pull request, a deploy and a session to start, each marked example, a grey disc in place of a rank number, each opening its sheet, counted nowhere), Sent, being recorded (example), Kicked back with Try again (example), With the AI team: 1 (folded), Answered (the owner’s real rulings of 12 to 14 November, the last 24 hours open; 3 older ones under Earlier). Desk returns home with the priority list; from a project's page the tab closes the project first.
- **The sheets for each kind of ask**, as drawn on options-r9-needs/: a question (its choices, your own words), a pull request, a deploy (Approve or Hold), Start the next session. Each choice says what follows; a tap says the mockup sends nothing.
- **The pull request's checks**, option A: Automatic checks ("3 of 4 passed, 1 running": the form check re-running first, then the rules, the build and tests, the signal to the desk) and AI reviews ("2 of 2 passed"), each named with its state, one line, its time and code; each taps through to the run on GitHub or the review's record, with "‹ The pull request" to come back.
- **The owner's own say is not a check** (answer 4, "no"): the rules row reads Passed, "All 47 rules passed."; no row, heading or reader says Yours or "not passed"; the Merge answer reads "… It changes the rules, so merging also gives your own say that the rules ask for."
- **Home's list kept on coming back.** Since v45, Back (or Desk) from a project re-drew home with the older grouped cards. The cause: v44 renamed the widget's waiting row ("Your call: resubmit the widget’s brief, or stop?"); on a re-draw v41 found no event line for that title, and v43's `prBuild`, which waits for every row's event line, gave up and only re-ran when #view's own children changed. `v48.py` adds the renamed title to v41's event lines, and `keep.js` runs `prBuild` again whenever home shows without its list.

## Checks
Runs: 393×852 and 360×740, light and dark; 393 with reduced motion; simulated top insets 0, 59 and 200 (copies with `env(safe-area-inset-top…)` replaced; every run above at 59). Script: Playwright, chromium.

| Check | Result |
|---|---|
| Console errors, sideways scroll (home, Needs you, each sheet, run, record, project) | none in any of the 7 runs |
| Needs-you tab | view opens, icon lit (aria-current true), badge 2, label "Needs you, 2 waiting"; "2 things wait on you. You answered 6 in the last 24 hours."; headings in order Waiting on you 2, Other kinds of ask · examples, Sent being recorded 1, Kicked back 1, Answered last 24 hours · 6; With the AI team and Earlier folds present |
| The example kinds | their own section under Waiting on you: 4 rows, each marked example, no rank number, counted nowhere (Waiting on you holds home's 2 rows only) |
| Each kind's sheet from its row | question, pull request, deploy, start the next session: each opens, every run |
| Pull request's checks | "Automatic checks 3 of 4 passed, 1 running" (form check Running, first); "AI reviews 2 of 2 passed"; the rules "Passed · All 47 rules passed."; no "yours" in the checks or their heading |
| Merge carries the owner's say | its text ends "merging also gives your own say that the rules ask for"; its tap: "…your merge is also your own say on the change to the rules. The mockup sends nothing." |
| Run reader, review record | the rules' run opens (Passed, no "not passed" section) and Back returns to the checks; the reviewer's record opens ("The reviewer: PASS") and Back returns |
| Smallest contrast on the sheet | 4.67 light (Running tag), 4.86 dark (time and code line) |
| Answered row | opens its reader ("You chose “360 and 414”: …") |
| Desk from the tab | home, 2 priority rows, Desk lit |
| Back from a project (second "Show on timeline") | "Decide what's next" count 2 again (v47: 0) |
| Desk from a project; the tab from a project, then Desk | 2; the tab's Waiting on you lists 2 rows, then home 2 |
| Home | 2 priority rows; Decide what's next opens the choices sheet (5 choices) |
| Project | summary line "Design · the records plan stopped · your call" opens "The timeline"; session tag "Plan checks 14 Nov"; map filter "Your decisions" 13 → 3 events |
| Insets 0 / 59 / 200 (home title; project's Back) | 42/6, 102/65, 143/106 (as v42 to v47) |
| Library check.js | errors [] in light and dark; NeedsTab, AskSheets and CheckList within their heights |

## Short
- Truthfulness of "All 47 rules passed": today `review_check.owner` fails until reviews/<PR>/owner.md exists, which is written after the merge, so the governance run itself would report 46 of 47. The desk would have to read that rule as met by the merge; no record says it does yet.
