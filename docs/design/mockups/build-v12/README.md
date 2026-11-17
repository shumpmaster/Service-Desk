# Mockup v12 build layer

v12 is v11 plus this layer. It changes how a milestone opens and adds the work between events; everything else behaves as in v11.

    python3 v12.py ../timeline-v11-craft.html ../timeline-v12-craft.html <phosphor assets>

`<phosphor assets>` is the `package/assets` folder of `npm pack @phosphor-icons/core@2.1.1` (MIT).

- A milestone opens in place, not in a sheet. Its sprints run as lanes beside the project's main line (the library's LaneGraph). Each event's icon sits on its sprint's lane. Merges sit on main, on a dark disc. A branch curves out of main where its sprint starts, and back in at each merge.
- Main stands out: its groove is 8 points wide and a shade darker.
- Between two events, a step shows the agent's plan (the library's ActionPlan): what it planned, why, any problem in red, and what was done about it. Each action is ticked off; one that could not be finished has a red warning. The step folds open and shut.
- Numbers from phase down to action: phase 2, milestone 2.7, sprint 2.7.2, step 2.7.2.5, action 5.3 inside its step. Standard milestones keep their place (Design-5 is 2.5); a project's own milestones follow the standard ones.
- The mockup opens with M6 and its worked step open. The step's actions are an example, pieced together from the spec writer's real rework of S-011 on 14 November 2026, since no agent records actions yet (docs/design/requests/2026-11-15-agent-action-records.md).
- Gate, decision, research and stop keep their own icons for now: how the model's own steps show was left for discussion.

Published at https://claude.ai/artifact/MNfUA3g4RB6TrvzmtqX8bE (private to the owner).
