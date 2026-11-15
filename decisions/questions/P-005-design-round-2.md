Ruling: the desk's colour, and the timeline's milestone and sprint shapes and how "planned" is drawn, are on hold while the design is ironed out; projects are switched with named chips, raised a little so they look 3D; any proposed change is shown first as images of the element now and then of each option

Question: none filed. Put to the owner in the Chief of Staff's design session (session_01QBwHGKPGQ67CUeSK7BY28C) on 15 November 2026 by the question tool: the open questions of the design handoff (docs/handoff/2026-11-15-chief-of-staff-p005-12.md, "Open, for the owner", 1 to 3), asked one at a time in the order the owner set. Design-mockup answers, given in the session reserved for the mockups; this record says so rather than file a question after its answers.
Milestone: Design-5 (the design fits together), M7, M8

Questions and options, as put:
1. "Colour for the desk (P-005): today the library is neutral greys plus one blue, which means "selected / now". Which colour should join the neutrals, and what should it mean?" Options: "States, icons only (Recommended)"; "States + project hues"; "Red only, for alarms"; "Show me swatches first".
2. "Shapes on the timeline trunk (P-005): v9 now draws a milestone as a small circle (your own milestones as a diamond) and a sprint as a small rounded square on the branch. Which key shapes should milestones and sprints have?" Options: "Circle / rounded square (Recommended)"; "Diamond / circle"; "Circle / capsule bar"; "Icons, not shapes".
3. "Project switching (P-005): Craft's chips are icon only, but that needs an icon for each project, so v9 keeps named chips (only the selected one shows its full name). How should projects be switched?" Options: "Keep named chips (Recommended)"; "Icon + name"; "Icon only, name when selected"; "Hold for now". (The question misdescribed v9: there every chip shows its name. The owner then asked for pictures, and question 4 was put with them.)
4. "Project chips: the page https://claude.ai/artifact/JjkA6cqwDLNic8ihsdmLL9 shows v9's named chips first, then each option drawn on the real v9 screen, light and dark. Which one?" Options: "A: keep named chips (Recommended)"; "B: icon and name"; "C: icon only, name when selected"; "Hold for now".

## The owner's words, verbatim
1. "Hold tight on the colors for now, the design needs to be ironed out"
2. "I think that will get changed around a bit as well"
3. "I need to see images of the elements you are proposing a change on, then images of the proposed options."
4. "Option A but they are missing that slight element of shadow or whatever that makes them look 3d"

## How it is carried out
- Answer 1: no colour is added; the library's Open list says colour is on hold, with the owner's words.
- Answer 2: v9's shapes and the dashed ring for "planned" stay as placeholders, with the owner's words in the library's Open list. Question 2 was taken to cover how "planned" is drawn as well, so that was not asked on its own.
- Answer 3: from now on, a design question that proposes a change comes with a picture of the element as it is, then a picture of each option (docs/design/mockups/options-project-chips/ is the first). Written into the design handoff's "How the design work is done".
- Answer 4: the library's FilterChip gains a named form for switching projects, and every chip is raised by two new shadow tokens, `shadow-chip` and `shadow-chip-selected`, read from Craft's selected chip in reference 12: a light top edge, a rim darker at the bottom and a soft drop. Mockup v10 (docs/design/mockups/timeline-v10-craft.html) is v9 with that layer.

## Motion and branch lines (same session, 15 November 2026)
The owner raised it unasked, in chat: "My next area of focus is the motion and the branching. I don’t want the branching to come from the top down. I’m kind of thinking a quick subtle fade in from the left? 

Also the line for the branches looks very rudimentary and ugly."

The pictures: docs/design/mockups/options-motion-lines/ (https://claude.ai/artifact/SVHh5HRkNJNDny1V1C6rci, live at https://claude.ai/artifact/MkkJfg5bkfSoNSvrMFevEe).

Questions and options, as put by the question tool:
5. "Opening a project: the page https://claude.ai/artifact/SVHh5HRkNJNDny1V1C6rci shows how it opens now (a pen drawing the plan top-down, about 2.5 s), then three fade-from-the-left options as frame strips. You can try them at https://claude.ai/artifact/MkkJfg5bkfSoNSvrMFevEe. Which motion?" Options: "1: all at once (Recommended)"; "2: ripple from Now"; "3: lines first".
6. "Branch lines: the same page shows today's dashed, square-cornered elbows, then three styles drawn on v10 (desk, project top, around Now, and dark). Which style?" Options: "1: hairline curves (Recommended)"; "2: soft rail"; "3: no connectors".

The owner's words, verbatim:
5. "I’m not sure, are their any other options?"
6. "Soft rail is the closest but it still doesn’t seem quite right"

Carried out: a second round on the same pages, with motions 4 to 7 (soft focus, push, the branch reaches out, settle) and four variations on the soft rail (groove, thin rail, fading rail, line in the rail).

Round 2, put by the question tool:
7. "Motion, round 2: the options page (https://claude.ai/artifact/SVHh5HRkNJNDny1V1C6rci, 'Round 2') now adds four more ways to open a project. All of them are also in the live switcher (https://claude.ai/artifact/MkkJfg5bkfSoNSvrMFevEe). Which motion, from either round?" Options: "4: soft focus"; "5: push"; "6: branch reaches out"; "7: settle".
8. "Branch lines, round 2: four variations on the soft rail, on the same page. Which is right, or which is closest?" Options: "4: groove"; "5: thin rail"; "6: fading rail"; "7: line in the rail".

The owner's words, verbatim:
7. "5: push"
8. "4: groove"

Carried out: the library's TimelineTrunk becomes a groove (tokens groove, groove-fill, groove-edge and shadow-groove), with a grooved branch, and the README says opening a project is a push and nothing draws from the top down. Mockup v11 (docs/design/mockups/timeline-v11-craft.html) is v10 with the push and the groove.
