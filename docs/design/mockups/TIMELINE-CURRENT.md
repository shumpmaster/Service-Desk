# The timeline mockup: current version

**Current: v13**, 15 November 2026. `timeline-v13-craft.html`, https://claude.ai/artifact/FP8rED64DKBpujpinhLZpN. The element library it is built from: https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W (version 8, with round 3's cards Gauge, StatusMark, BranchMap and PhaseRow), source in `../library/`. v12 stays published at https://claude.ai/artifact/MNfUA3g4RB6TrvzmtqX8bE (private to the owner).

Each version is a layer over the one before, so behaviour stays fixed unless the owner asks for a change:

| Version | Layer | What it adds |
|---|---|---|
| v8 | (whole page) | The Craft-style restyle of v5's behaviour |
| v9 | build-v9/ | The library's second pass: Phosphor icons, glass, legible blues |
| v10 | build-v10/ | Named project chips, raised a little |
| v11 | build-v11/ (with options-motion-lines/source/) | Opening a project is a push from the left; the track is a groove |
| v12 | build-v12/ | Milestones open in place as lanes; the agent's plan between events; numbers from phase to action |
| v13 | build-v13/ | The floating branch map and phase row; opens on the current step, fully open; no lanes; soft red, yellow and green gauges that open and fold; marks and tags on events and steps |

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
- What a gauge counts for a milestone or a sprint, and exactly when a phase, milestone or sprint turns red, yellow or green beyond the examples shown.
- The owner's third point on v12: "there is information across the timeline that serves no purpose to be visualized, and some that isn’t but should" (answer 1). What to drop and what to add goes to the next session (answer 13).
- How gate, decision, research and stop show (the model's own steps). v13 leaves their own icons in place, leaves gates out of the phase row, and leaves Design-3's planned research off the map.
- The milestone and sprint shapes (the circle and square inside the gauges are placeholders); how planned work is drawn.
- Real action records: a change to the operating model, written up for the building session in `../requests/2026-11-15-agent-action-records.md`. The step's actions in v13 are still an example.
