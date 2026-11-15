# For the building session: every agent records its actions in plain English

*Written by the Chief of Staff's design session (session_01QBwHGKPGQ67CUeSK7BY28C) on 15 November 2026, for the session that owns the pipeline and the operating model. The design session does not change the model, the agents' charters or the pipeline. This note carries the owner's ruling to the session that does.*

## What this means for the owner
You ruled that every agent should write down, as it works, what it plans to do, why, any problem it hits and what it did about it, in plain English, so that the timeline can show the work between events. Today no agent keeps such a record, so this needs a change to the operating model and to the agents' instructions before the timeline can show real actions. Until then the timeline designs use actions pieced together from the records, marked as examples.

## The owner's words, verbatim (decisions/questions/P-005-design-round-2.md, answers 14 to 23)
- On what is missing: "Events would be the constants - the things GitHub and the different agents enable - however there should be actions, steps, plans of some sort in between events. … My goal for this timeline is that we can see all of that. Ultimately down to the task / actions level that feed events but all in plain English so I can understand"
- On the form: "when I review something I want to know what the plan was, why we were doing it, and any problems that arise - then how we solve it. … the plan step is the title it’s what the agent was doing. There’s a reason why that is clearly defined and within the context of what is happennning, then if any problems that popup and then what we are doing about them."
- On planned or done: "Planned and ticked off, but tick off with checkmarks?"
- On numbering: "I want to introduce a number structure for working down to tasks from phases"
- On who writes them, after the Chief of Staff recommended each agent writes its own, in a fixed short form, with a check on the form and not a rewrite: "Yes I do"

## What the ruling asks for
1. **Before it starts,** each agent session (a step, S-034) writes its plan: a short list of actions, each with a title (what it will do) and one line of why, in the context of the work.
2. **As it works,** it ticks each action done, and adds any problem it hits with what it did about it. An action it cannot finish stays unticked, with its problem and what happens next.
3. **The form is fixed and short:** a title, one line of why, and, only if one came up, a problem and its fix. Plain English, no codes in the words.
4. **A check, not a rewrite:** CI checks the form (every action ticked or explained); a reviewer that already reads the work flags lines that are not plain, and the agent fixes its own words. No second agent rewrites them.
5. **Numbers:** each level is counted inside the one above, in the order things start, never reused: phase 2, milestone 2.7, sprint 2.7.2, step 2.7.2.5, action 2.7.2.5.3 (shown as 5.3 inside its step). A milestone keeps its code beside its number.

## Open for the building session to settle (and put to the owner where a ruling is needed)
- Where the record lives, so the timeline can read it: for example a file per step beside the dispatch log, or the step's commit message.
- How the six-part return (AGENTS.md §2) and the existing Tasks section (S-034) relate to it: the plan's actions may be the same thing as the return's "changed", seen in advance.
- Whether the numbers are stored or worked out by the timeline from the order of the records.

## The picture
docs/design/mockups/options-actions/ (https://claude.ai/artifact/MMqjRnpba6aqZ9VUt59ssa): the spec writer's rework of S-011 on 14 November, shown under way and finished.
