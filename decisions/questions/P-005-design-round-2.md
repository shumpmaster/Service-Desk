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

## The constants and the branches (same session, 15 November 2026)
The owner raised it unasked, in chat: "Something I feel like you have missed is the multiple branches and the linkage back to our constants that were defined early on."

Carried out: a check of mockups v5 and v11 against the timeline basis (portfolio ideas/basis/TIMELINE-BASIS.md, locked 9 November 2026), with pictures: docs/design/audits/constants-2026-11-15/ (https://claude.ai/artifact/TVywWD8pKD9azk5W4RVMWH). It finds the key, the branch pills, the state colours, the branch line in the plan and any showing of several branches at once lost or hidden, none of them by a change put to the owner as a change to the basis.

Questions and options, as put by the question tool:
9. "Constants check (https://claude.ai/artifact/TVywWD8pKD9azk5W4RVMWH): the mockups drifted from the timeline basis. The key, the branch pills, the state colours, the branch line in the plan and any view of several branches at once are lost or hidden. How much of the basis should the next mockup bring back?" Options: "All of it (Recommended)"; "Lines and kinds first"; "Show me options first".
10. "The basis makes colour a constant (green done, amber running, red failed, blue waiting on you, grey not started), but you put colour on hold. Which should win for the states?" Options: "The basis's five colours (Recommended)"; "Keep neutral for now"; "Show me both".

The owner's words, verbatim:
9. "The only thing I really want to keep is the different 7 constants."
10. "Keep neutral for now"

Carried out: the Chief of Staff reads answer 9 as the seven GitHub kinds (branch, commit, pull request, check, review, merge, deploy), shown on the lines as the icon's shape and the kind's name, and answer 10 as states staying neutral words. The owner's earlier words still ask for several branches. Pictures of three ways to draw several branches at once with the seven kinds on the lines: docs/design/mockups/options-branches/ (https://claude.ai/artifact/1DfWTc1HZiMFwubm2pY52U). The timeline basis file (portfolio) is not edited by this design session; these answers change what the basis asks for (the key, the branch pills and state colour), and the basis's own change log is for the building session or the owner to update.

The next question (which branch drawing; how the model's own steps show) was dismissed. The owner then said: "Pause and I will ask you to resubmit your questions shortly", and next, unasked: "Okay so how would the lane graph visualize multiple parallel branches simultaneously? Just focus on the icons and branch structure. Also note I want to visually separate main branch. Just make it stand out somehow it doesn’t have to be significant"

Carried out: docs/design/mockups/options-lanes/ (https://claude.ai/artifact/MtotUKqgeB5yqsYcGag8d4), the lane graph with four lines at once, icons and lines only, with three small ways to set main apart.

The owner's words, verbatim, on the lane page's three ways to set main apart (A: a darker, wider groove; B: dark icons on main; C: both):
11. "Option C is my choice"

Carried out: the library gains a LaneGraph card (main's groove 8 wide in groove-main, main's icons on main-mark discs; each open branch in the next free lane). Still to be put again when the owner asks: which of the three branch drawings (lanes, one branch lane, grouped), and how gate, decision, research and stop show now that only the seven kinds are kept.

The owner's words, verbatim, in chat:
12. On which branch drawing: "Option C was what I chose for Q1." The Chief of Staff reads it as the lanes, with main set apart as in option C, and has said so to the owner, asking to be told if option 3 (grouped by branch) was meant.
13. On how gate, decision, research and stop show: "And for Q2 - this is something we need to discuss.

The original structure was always that all of the constants, phases and milestones are linked together in a workflow"
14. After the Chief of Staff's summary of that chain (phase, gate, milestone, sprint, event, and the routing that links each event to the next): "I think you got the summary nailed, except for one thing - and the operating model might miss this I’m not sure.

Events would be the constants - the things GitHub and the different agents enable - however there should be actions, steps, plans of some sort in between events.

For example if I am going to bake a cake my event might be taking it out of the oven, but I had to crack eggs, MIs the ingriedients, and all of that stuff.

My goal for this timeline is that we can see all of that. Ultimately down to the task / actions level that feed events but all in plain English so I can understand"
15. On the Chief of Staff's three questions about actions (what counts as one; planned or done; who writes them): "Let’s take them 1 x 1 - don’t lose track.

Start with one, provide an example of something within a currently active project and show the 2 options for what counts as an action"

Carried out: docs/design/mockups/options-actions/ (https://claude.ai/artifact/MMqjRnpba6aqZ9VUt59ssa), the Definer's rework of S-011 on 14 November 2026 (15:14 to 15:18, commit 98c717a1 on build/definer/S-011) drawn with every action, and with what the owner would want explained. The actions are pieced together from the spec's revision note and its diff, since no agent records actions today. Still to come, one at a time: planned or done; who writes them.
16. On what counts as an action (option 1, every action; option 2, what the owner would want explained): "I want option 2 - but I would want to see the actual problem described In a situation like this."

Carried out: the same page gains the chosen form at its top. Each action says the problem first, in plain words, then what the agent did or could not do. The problems are the plan reviewer's six findings in reviews/S-011/plan.md as of the run at 12:40 on 14 November (commit a8e92740), rewritten plainly.
17. On the problem-then-action list: "I think that’s probably good, is there anyway to keep it concise and my comment about the problems was more about just working the problem into the steps. Not just listing each problem and solution?"

Carried out: each action is now one short line that says what the agent did and, in the same sentence, the problem that made it necessary (for example "Made every waiting step send an alert, because a step that showed up late could have been missed").
18. After the concise actions and the Chief of Staff's description of question 2 (planned, then ticked off; or done only): "I can’t really tell the difference honestly."

Carried out: read as being about question 2. The page gains, at its top, the same step frozen halfway through (15:16), drawn both ways: planned actions shown ahead as empty boxes and ticked off, against only what is done so far.
19. On question 2 (planned, then ticked off; or done only): "Planned and ticked off, but tick off with checkmarks? And introduce a color and different symbol for the problem"

Carried out: on the actions page, a done action has a check, the one under way a dashed ring in bold, a planned one an empty ring, and a problem (an action the agent could not do) a filled warning sign in red, with its note in red. Red (#c4321f light, 5.3:1 on white; #ff6b5a dark) is the first colour beyond the neutrals and the blue, used only for problems; the rest of colour stays on hold.
20. "Okay slight misunderstanding here, but ultimately it is okay. Originally when I referred to problem, I actually meant reason why, or purpose.

I don’t know if this is becoming circular or not but when I review something I want to know what the plan was, why we were doing it, and any problems that arise - then how we solve it.

So in this concept I’m thinking that the plan step is the title it’s what the agent was doing. There’s a reason why that is clearly defined and within the context of what is happennning, then if any problems that popup and then what we are doing about them."

Carried out: the actions page opens with the concept. Each planned action has a title (what the agent planned to do), a why in grey (in the context of what is happening), and, if a problem came up, the problem in red with what was done about it. Marks as in answer 19: a check when done, a red warning when an action could not be finished.
21. "Yes I like that.

Three things - make the text more concise, add in indicator for current step and future steps should have open dots, also I want to introduce a number structure for working down to tasks from phases"

Carried out: the concept shown at 15:16 (under way) and 15:18 (finished), with shorter lines; the action under way marked with a blue dot in a soft ring and the word Now; actions still to come with open dots. A proposed numbering, each level counted inside the one above in the order things start and never reused: phase 2 (Design), milestone 2.7 (M6, the 7th in Design after the six standard ones), sprint 2.7.2 (S-011, after S-010), step 2.7.2.5 (the 5th agent session of S-011 on 14 November, from status/outcomes.jsonl), action 2.7.2.5.3, shown as 5.3 inside its step.
22. "Can the orientation of the tasks go the same orientation as the phases / milestones etc, from bottom to top?

Also what is your recommendation for who writes them?"

Carried out: the actions now run newest at the top, the first at the bottom next to the review that started the step. The Chief of Staff's recommendation on who writes them was given in chat (each agent writes its own, in a fixed short form, with a check on form and plain English); not yet ruled.
23. On the recommendation that each agent writes its own lines, in a fixed short form, with a check on the form rather than a rewrite: "Yes I do"

Carried out: the ruling and what it needs are written for the building session in docs/design/requests/2026-11-15-agent-action-records.md; the design session does not change the operating model, the charters or the pipeline.
