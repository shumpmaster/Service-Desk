# The timeline mockup: current version

**Current: v25**, 17 November 2026. `timeline-v25-craft.html`, https://claude.ai/artifact/3w8kRCDDa7SauhJZyKHuG7. The element library it is built from: https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W (version 21: MilestoneMap's words on main; EventWeight; MilestoneMap's words wrapped, ProjectHeader with home's bar; round 5's cards MilestoneMap and EventBubble; NeedsList and WhyLine kept for the record), source in `../library/`. v24 stays published at https://claude.ai/artifact/3BpztpWcFsYrLULCjT5nse, v23 at https://claude.ai/artifact/4vRgmS5kZR9tVNHNhYt2vm, v22 at https://claude.ai/artifact/LfZ6v5WPV7YhxaXvGnTJtg, v21 at https://claude.ai/artifact/LQopLKr9MHfN8vd35oNmeu, v20 stays published at https://claude.ai/artifact/1EbyNZHbAnCVmGybqFgU8o, v19 at https://claude.ai/artifact/YG9Y11Cw9R3nJm6Qfv67sY, v18 at https://claude.ai/artifact/ETsiyg9ogQL3BwWA2VN7s4, v17 stays published at https://claude.ai/artifact/DXv1eSvFKZnoe5rZpHsf9V, v16 stays published at https://claude.ai/artifact/KRyUwfASR4pqLR2MRRpGgY, v15 at https://claude.ai/artifact/1G6hoK39NJnG5trBz3Gpwx, v14 at https://claude.ai/artifact/BMDDwgTKZBFo48q3Wc2VZz, v13 at https://claude.ai/artifact/FP8rED64DKBpujpinhLZpN and v12 at https://claude.ai/artifact/MNfUA3g4RB6TrvzmtqX8bE (private to the owner).

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
| v18 | build-v18/ (with options-map-fit/source/) | The branch map fits the selected milestone: every event an icon, the events in view spread apart with their kind and a short title; a chip's cross brings back the phase |
| v19 | build-v19/ (with options-why/source/) | Why things happen: one plain sentence under each event that happened, on a dotted line down to the event before; the plan stays as the detail (reasons are examples) |
| v20 | build-v20/ (with options-map-centre/source/) | The fitted map's window stays in the centre, before on the left and after on the right, sliding to an edge only at either end of the milestone |
| v21 | build-v21/ (with options-hierarchy, options-why2, options-needs2, options-bubble and options-chain, each source/) | The list as a tree whose ringed icons fold; Needs and Why tags on the event open a bubble; the Needs bubble a plain checklist opening the next layer in place; its chain ringed and joined on the map and in the list |
| v22 | build-v22/ (with options-home-header/source/) | Home's header floats as the same slim bar a project's page uses, without Back |
| v23 | build-v23/ (with options-map-wrap/source/) | In the fitted map's window, the short title alone, wrapped onto up to three lines; no kind word |
| v24 | build-v24/ (with options-weight/source/) | Each event as heavy as it is: turning points larger, checks as they are, routine one quiet line |
| v25 | build-v25/ (with options-main-labels/source/) | Every event on main carries its words on the fitted map, spread in a strip under main and joined by thin lines |

## What v25 adds on a project's page, and the owner's word for it
- **Words on main.** On the fitted map, every event on main carries its short title wherever it sits, in one row under main, each as near its icon as it can without touching the one before and joined to it by a thin line; a sprint's events keep words only inside the window ("Any situation where something touches main branch should get a label. Anything not on main should only get labels if it is inside the blue box.", R6 answer 6; "option 2 please", R6 answer 7).

## What v24 adds on a project's page, and the owner's word for it
- **Each event as heavy as it is.** Turning points (a stop, a decision, a gate, a merge to main, anything waiting on you) take a 34 icon and a 17 semibold title; checks (reviews) keep their row; routine (commits) is one quiet grey line ("every single event has the same weight and means nothing unique, can we change that", R6 answer 3, a comment on v21; "I want to go with Option A", R6 answer 6). The weight is a rule by kind, not a choice per event.

## What v23 adds on a project's page, and the owner's word for it
- **The words in the map's window wrap.** Each event in view under the window loses its kind word, since its icon says it, and its short title wraps by whole words onto up to three lines in that place; the map keeps its height ("Can we wrap text within the blue box?", R6 answer 2, a comment on v21; "B: only the title, wrapped (Recommended)", R6 answer 5).

## What v22 adds on home, and the owner's word for it
Round 6 is verbatim in `decisions/questions/P-005-design-round-6.md` (cited as R6 and the answer number).

- **A floating header on home.** Home's large title, live line and bell scrolled away; now they float in the glass band as one slim bar, the same as a project's page without Back: "Timeline" in 17, "Live · as of 17:25 UTC" under it, the bell and More. The search and the groups scroll under it ("Floating Header here too", R6 answer 1, a comment on v21's home; "A: the slim bar only (Recommended)", R6 answer 4).

## What v21 adds on a project's page, and the owner's word for each
- **A tree, every ringed icon folding.** The list under a milestone is drawn as a tree: a line down from an event's icon with an elbow into each row under it; a ringed icon folds or opens what sits under it ("this hierarchy needs to be slightly more defined. And every icon should be able to collapse/exoand", R5 answer 8; "I like the tree", R5 answer 10).
- **Why, on the event.** A small outlined "Why" on the event's first line opens its sentence in a bubble; the why blocks of v19 leave the list ("I don’t like the format of the whys being embedded into everything like a step", R5 answer 10; "I like what you did with the whhy", R5 answer 11).
- **Needs, on the event.** A "Needs" tag, tinted by the worst state, opens a bubble with a plain checklist; a chevron opens the next layer inside it, with a trail back; nothing moves the page ("originally i was asking about the needs first and such. I dont want clicking on this type of card to move the flow back", R5 answer 11; "I love the bubble as a way to link to the next layer", R5 answer 12; "I love 1", R5 answer 13).
- **The chain, connected.** While the bubble is open, the chain is ringed and joined by dotted lines on the map and in the list's margin; the rest fades ("show the visual connection as the chain is selected on the branch list", R5 answer 13; "C: both", R5 answer 14).

## What v20 adds on a project's page, and the owner's word for each
- **The map's window in the centre.** On the map fitted to a milestone, the window over the events in view sits in the middle, what came before spread over the left and what comes after over the right; at either end of the milestone it slides to that edge ("What are your thoughts on always pulling the highlighted section to the center of the slider so you can see the before and after?", R5 answer 6, a comment on v19; "2: centred, except at ends", R5 answer 7). Where the window sits no longer says how far along the milestone you are.

## What v19 adds on a project's page, and the owner's word for each
- **Why each event happened.** Under each event that happened, "Why:" and one plain sentence, on a dotted line down toward the event before it, so the plan reads as a story while you scroll; the agent's plan stays as the detail of how, and planned events keep their NeedsList ("when I’m perusing the plan I will want to see the context behind how or why things are happening the way they are", R4 answer 17; "C: the story between events", R5 answer 5). The reasons are examples, on S-011 only: no record says yet why an event happened.

## What v18 adds on a project's page, and the owner's word for each
- **The map fits the milestone you select.** Tapping a milestone's row selects it; the branch map shows only its sprints across the width, every event as its icon, planned ones as open rings; the events in view spread apart under the window with their kind and a short title, the rest squeeze to the sides; a chip names the milestone and its cross brings back the whole phase. The page opens with M6 selected ("whenever a milestone is selected, the branch map fits to the events in that milestone and expands the dots to our icons with descriptions if we can fit them", R5 answer 1; "C: fit, spread what's in view", R5 answer 4).

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
