# The timeline mockup: current version

**Current: v17**, 16 November 2026. `timeline-v17-craft.html`, https://claude.ai/artifact/DXv1eSvFKZnoe5rZpHsf9V. The element library it is built from: https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W (version 13, with round 5's card NeedsList), source in `../library/`. v16 stays published at https://claude.ai/artifact/KRyUwfASR4pqLR2MRRpGgY, v15 at https://claude.ai/artifact/1G6hoK39NJnG5trBz3Gpwx, v14 at https://claude.ai/artifact/BMDDwgTKZBFo48q3Wc2VZz, v13 at https://claude.ai/artifact/FP8rED64DKBpujpinhLZpN and v12 at https://claude.ai/artifact/MNfUA3g4RB6TrvzmtqX8bE (private to the owner).

Each version is a layer over the one before, so behaviour stays fixed unless the owner asks for a change:

| Version | Layer | What it adds |
|---|---|---|
| v8 | (whole page) | The Craft-style restyle of v5's behaviour |
| v9 | build-v9/ | The library's second pass: Phosphor icons, glass, legible blues |
| v10 | build-v10/ | Named project chips, raised a little |
| v11 | build-v11/ (with options-motion-lines/source/) | Opening a project is a push from the left; the track is a groove |
| v12 | build-v12/ | Milestones open in place as lanes; the agent's plan between events; numbers from phase to action |
| v13 | build-v13/ | The floating branch map and phase row; opens on the current step, fully open; no lanes; soft red, yellow and green gauges that open and fold; marks and tags on events and steps |
| v14 | build-v14/ | Home becomes the desk map: one lane per project, opening large and folding slim and pinned; what waits on you pops up on its lane and lights its row in Needs you; no project cards (tried, then replaced in v15) |
| v15 | build-v15/ (with options-home-suggest/source/) | Home grouped by what waits: a sentence, a group per project with a slim strip and its waiting rows, each saying what it holds up, the longest wait first; quiet projects folded; the desk map leaves home |
| v16 | build-v16/ (with options-pills-header/source/) | One floating header on a project's page: a slim bar with title and status, the slim pills, the branch map and the phase row, together; the large title leaves a project's page |
| v17 | build-v17/ (with options-needs/source/) | What an event needs: an event that still needs something shows a checklist of small event rows hung from it, then what it unlocks; a plan's action that an event needs says so (requirements are examples) |

## What v17 adds on a project's page, and the owner's word for each
Round 5 is verbatim in `decisions/questions/P-005-design-round-5.md` (cited as R5 and the answer number).

- **What an event needs.** An event that still needs something shows, hung from it by a thin line, "Needs first" with how many are done, then each requirement as a small row: the plan's check column, the kind's icon, the tag that event wears, its title; then "Then unlocks" the same way. Tapping a row goes to it. Done events show nothing extra ("some events ultimately are requirements for other events. I want to see that somehow.", R4 answer 17; "option C is close, we just need to show it in a slightly different more consistent and easily graspable manner", R5 answer 1; "I like the look of c1, I like the checklist feel of c2", R5 answer 2; "Yes, take the mix", R5 answer 3).
- **The plan crosses over.** A requirement that is an action of a plan reads as that action (Action 2.7.2.5.5), and the action in the plan says "Needed by Spec revised, round 4" ("The plan should naturally have crossover with what we are working on here right?", R5 answer 2).
- **Examples.** Every requirement, and three planned events at the top of S-011 (Spec revised, round 4; Plan review, round 4; S-011 frozen): no record says yet which event needs which. Real dependency records would be a request for the building session.

## What v16 adds on a project's page, and the owner's word for each
- **One floating header.** The project pills float with the branch map ("The project pills need to be part of the floating header as well.", R4 answer 13), slimmer ("Option B", R4 answer 14), and the title and status shrink into one slim bar right above them, with no gap ("get rid of that gap of space between the title and pills ... shrink the title and update status and just convert it into a sleek header that stays with the pills and branch chart", R4 answer 14; option 1, "I like this option.", R4 answer 16).

## What v15 shows on the home page, and the owner's word for each
Round 4 is verbatim in `decisions/questions/P-005-design-round-4.md` (cited as R4 and the answer number). v14 tried a desk map on home (R4 answers 6 to 8); the owner then asked "Does the home page really work? ... Does it add anything?" (R4 answer 9), and the Chief of Staff answered: not yet.

- **What waits, grouped by project.** One sentence says how many things wait and where; each project with something waiting is one group with its waiting rows under it, so each thing shows once; the quiet projects fold into one row ("C is where I’m leaning", R4 answer 11).
- **What each answer holds up**, under each waiting row, and the longest wait first with a red "Longest wait" tag ("C2: what each answer holds up", R4 answer 12).
- **A slim strip of what mattered** under each project: the last two weeks, merges, stops, gates and questions only, from the desk's real events ("C3: a slim strip of what mattered", R4 answer 12).
- No project cards ("I don’t like the existing old cards sticking around there", R4 answer 7), and no desk map on home. Inside a project, v15 is v13.

## What v13 holds, and the owner's word for each
Round 3 is verbatim in `decisions/questions/P-005-design-round-3.md` (cited by answer number); earlier rulings in `decisions/questions/P-005-rebrand-style.md` and `decisions/questions/P-005-design-round-2.md`.

- **Look:** the Craft references, neutral greys and one blue for selected or now. Colour is lifted for status only: soft green, yellow and red on gauges, marks, tags and the map ("I want the circle icons but with percent gauges. RYG coloring.", answer 4; "A - but let’s make the color gauge softer", answer 7). Red still means a problem.
- **Several branches at once:** a branch map floating at the top of the project, not lanes ("I feel the branch design on the left is taking up too much real estate left to right", answer 1; "1: Branch map on top", answer 3). It stays as the page scrolls and moves with the timeline ("floating so that no matter how much you scroll down the page it wi stay there. I also want it to have motion and move with the timeline", answer 4). It shows every sprint of the current phase, oldest on the left, main along the bottom, and pans to keep a soft window over the events in view ("A: whole phase, panning", answer 6).
- **Icons on the map:** the events in view below wear their icons, the rest are dots ("B is the one", answer 12), in the rows' soft colour: red failed or blocked, yellow waiting on you, done grey, Now blue ("B with colour", answer 13).
- **Gauges:** phases, milestones and sprints wear the tinted ring, 3.5 thick ("I like the tinted ring. Do a slightly thinner line. And only phases, milestones and sprints get the gauges.", answer 8). Green on track, yellow waiting on you or at risk, red stopped or blocked, no colour when not started. A phase counts its milestones reached; milestone and sprint percentages are examples, marked so. Here: Design yellow (1 of 7), M6 and S-011 red, S-010 and Design-1 green, milestones not started uncoloured.
- **Open and fold:** tapping a gauge opens or folds its section ("I think the icons on the timeline should expand or collapse sections.", answer 1).
- **Events and steps:** each keeps its kind's icon, with a small check, hourglass or cross on its corner and its state as a tag, tinted yellow or red, grey when done ("I like option 2 with the text tags as shown in option 1. To indicate things like awaiting merge, check status etc..", answer 9). Here: Stop "Waiting on you", Review "Failed", Commit "Done", the step 2.7.2.5 "1 blocked", Merge PR #446 "Awaiting your answers".
- **How it opens:** on the current step with everything in it open (M6, S-011 and the spec writer's step with its actions), Now just under the floating band. Only the current phase is listed; the phases sit in a row of gauges under the map, the current one raised; tapping another opens its milestones above the current phase, and only then does the page scroll ("the page to always open the full set of tasks, sprints, etc… per the step we are on", answer 4; "should only scroll when a phase gets expanded", answer 5; "Phase gauges row", answer 10).
- **Kept from v12 and before:** the numbers from phase to action (2, 2.7, 2.7.2, 2.7.2.5, 5.3), the agent's plan between events (ActionPlan), the Now card, and the push from the left when a project opens (v11). The seven kinds stay the constants.

## Not settled
- The owner's view of v13 as a whole, asked at the start of round 4 and answered with the home-page idea instead.
- The "slightly visual rework" of the cards (R4 answer 6) is taken as done by v15's grouped rows; the owner has not said so.
- What a gauge counts for a milestone or a sprint, and exactly when a phase, milestone or sprint turns red, yellow or green beyond the examples shown.
- The owner's third point on v12: "there is information across the timeline that serves no purpose to be visualized, and some that isn’t but should" (answer 1). What to drop and what to add goes to the next session (answer 13).
- How gate, decision, research and stop show (the model's own steps). v13 leaves their own icons in place, leaves gates out of the phase row, and leaves Design-3's planned research off the map.
- The milestone and sprint shapes (the circle and square inside the gauges are placeholders); how planned work is drawn.
- Real action records: a change to the operating model, written up for the building session in `../requests/2026-11-15-agent-action-records.md`. The step's actions in v13 are still an example.
