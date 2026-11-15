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
