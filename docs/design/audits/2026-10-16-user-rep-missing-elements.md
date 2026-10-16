User representative (simulation, not real users). Audit of the desk as it will look after batch 2, played as the owner of Service-Desk (P-001).

**Before you use this:** this brief had me read the project document, the owner's rulings and S-001. My role card says I must not see those. That is fine for an audit of what's missing, but this is not an independent gate verdict and shouldn't be filed as one. Nothing was edited.

**What I read and viewed:**
- docs/PROJECT.md: §1 to §6, §9 and Part 2
- decisions/questions/P-001-trial-view-notes-2.md (all of it)
- docs/design/README.md
- All four mockups. I read the full text of the status-and-timeline and other-screens mockups, but only the headings and notes of phase-branches and colour-swatches.
- The three tab screenshots
- In specs/S-001.md: "What this spec does not cover", "Open questions for the owner", AC24 to AC28, AC45, AC51, AC52
- I couldn't find a section headed "Open: trial-view notes 2" in S-001, so I couldn't check that list.

**The user I'm playing** (note 21 and Part 2):
- A generalist, not a coding expert, who often works in fields new to them.
- Thinks in process flow and business impact.
- Thinks top-down: goal, then phases, then milestones, then sprints, then tasks.
- Runs several projects from a phone and keeps each one inside its own tile.
- Would hate false alarms, missed decisions and upkeep.
- Wants never to ask "wait, why are we doing that?"

## A. X factors (most important first)

1. **A "while you were away" summary on each Home tile.** For example: "Since Mon: 2 milestones moved, 3 rulings, went back to Design (why), 1 failed check fixed, oldest wait 3 d."
   - Why it matters: after a week away, with five projects, this user needs to know what happened without scrolling five Timelines. Requests getting buried is the reason the desk exists (Part 2, "requests get buried").
   - Planned? Only partly. "New since you last looked" covers agent results only, on one device (S-001, about line 874). Plain-English summaries for each event are a model change not yet made (S-001 "does not cover"). No summary like this is planned.

2. **A target date on each milestone, and how far it has slipped.** The desk would show "on track" or "3 days late, moves launch to X", using dates the agents write into the plan.
   - Why it matters: the boss's questions are "What are we delivering… via which milestones… in chronological order" (note 21). The owner also asked for "a route to timeline compression" and "the date can move" (Part 2, Preferences). Right now nothing says whether a project is on time.
   - Planned? No. S-001 says "the desk never writes a forecast of its own". M3B shows only V1 to V5 against their measures, not milestone dates.

3. **A "what we're not sure of yet" panel for each project.** It would list the open unknowns, risks and assumptions, how solid the evidence for each is, and which milestone settles each one.
   - Why it matters: this is the owner's "I don't know what I don't know", and it matters most in a field they don't know (note 21). The records already hold this: PROJECT.md §7 "Open at this exit", S-001 "Risks and mitigations", and its graded "Facts relied on". On the approved Status screen, the standard milestone "The risks are known" shows "not recorded".
   - Planned? No.

4. **Saying why the project went back at each branch point.** On Status and the Timeline, where run 2 starts, show the ruling that sent it back. Also show plan changes: a milestone added, dropped or moved, with the ruling behind it.
   - Why it matters: the branch drawing shows *that* Design ran again, but not *why*. That is exactly the "wait, why are we doing that?" moment (note 21), and PROJECT.md §3 already requires a ruling for every such change.
   - Planned? No. Neither mockup labels why a run started.

5. **A plain-English glossary for each project.** Terms on cards and the Timeline could be tapped to show what they mean and why they matter here. The agents would write it, since the desk never writes its own words.
   - Why it matters: the owner said "I am not a coding expert, i might play around on project ideas that i have no prior experience in" (note 21). Decisions in a new field come full of its jargon.
   - Planned? No.

6. **How solid each recommendation is.** On a question or card, show whether the recommended option rests on a checked fact or an estimate, and what the Critic said.
   - Why it matters: a non-expert relies on the recommendation. This owner has often answered "Go with your recommendations" (S-001, closed questions of 7 Oct), so the evidence behind it is what makes that safe.
   - Planned? No. Context facts name their source, but not how solid it is.

7. **What waiting costs, on each item in the Queue.** For example: "holds 2 agents idle; blocks MD2; launch date at risk if unanswered by Fri."
   - Why it matters: the owner thinks in business impact (note 21), and V5 measures how fast they answer. "Unblocks MD2" says what, but not how much it costs to wait.
   - Planned? Partly. The "Unblocks" line comes in with note 29, and links between waiting items are a model change not yet made (S-001 "does not cover").

8. **Jotting down a new idea from the phone.** One tap would write an idea file through the same prefilled-link route, and it would appear as an "Ideas" tile at the standard milestone "An idea worth exploring".
   - Why it matters: the owner "might play around on project ideas" (note 21) and pictured a "real time interactive planning, scheduling and interactive workbench" (Purpose).
   - Planned? No. The owner dropped the "Tell your Chief of Staff" bar because it did nothing, and the New project card as "maybe in the future" (S-001 lines 302 to 312). So this would need the owner's say.

## B. Massive hindrances (most important first)

1. **The approved screens depend on records nobody writes yet.** On Service-Desk today:
   - every "why" reads "not recorded";
   - 31 Discovery pull requests and 18 Design run 2 pull requests are "not tied to a milestone";
   - no project milestone can ever say "reached";
   - the Chief of Staff and the Builder show "not recorded" on Team.
   Other projects will show even less. Personal-Org-Operating-Model still runs the older model version (v2.5), which the desk doesn't take through phases.
   - Why it matters: a screen full of "not recorded" fails the owner's main test (note 21) and wears down trust (Part 2, "what the owner would hate").
   - Planned? Only as model changes, not desk work: S-032's "Milestone:" line; why and Context lines "as its own spec"; "reached" (open question 5); Chief of Staff sessions. Nothing plans filling in old records, there are no dates, and MD3's "done when" doesn't need any of them.

2. **"Quiet" can hide a project that has stopped.** If nothing waits on the owner, no agent is working and nothing is planned, the desk looks calm. A stall shows as activity with no length, and nothing flags it.
   - Why it matters: "Missed decisions: something waits on the owner while the desk says quiet", and the owner must "trust quiet" (Part 2; Strategy step 4). A project nobody is moving is the silent version of that.
   - Planned? Partly. A recorded "who has the ball" is a model change not yet made. There is no "nothing has moved for N days" signal.

3. **Nothing reaches the phone while the desk is closed**, except Service-Desk cards, through GitHub issues. Owner questions, pull requests waiting on the owner, and anything in another project don't reach them.
   - Why it matters: the owner checks the phone in the morning, across several projects. This is V1's missed-decision case.
   - Planned? Only as a decision due at MD (AC45, from research Q-011). Nothing is built.

4. **Planning works at the wrong level for this user.** "Work ahead" (AC24) lists pipeline items by their states (`ready`, `dispatched`, `waiting-owner`) to reorder and give "not before" dates. The owner plans by milestones: "I dont need to see your specific action plans… Our plan will be built by the chronological order of delivering those milestones" (note 21).
   - Planned? M3A is planned, but at item level only.

5. **Coral, the "needs you" colour, is used for the agents' unfinished paperwork.** Every missing why and every "needs filing" flag shows in coral, which could mean dozens on each project. It isn't clear whether the owner or an agent is meant to fix them.
   - Why it matters: "False alarms… trust erodes", and "only flag what needs a human" (Part 2). The palette says coral means "you" (design README).
   - Planned? No. The mockup does it on purpose.

6. **A jump in usage or spend can't be seen.** There are no totals by project or week, no limit, and no alert. Hitting the subscription's limit would stall every project at once, with no warning.
   - Why it matters: "It's important for me to see timelines and context windows to be able to drive things", and "spend follows value" (Part 2).
   - Planned? Spend is out of the first version (S-001). There are only per-session cost estimates, behind a drill-down (M2B, AC23).

7. **Adding a project is hand upkeep, with a cap of 5.** It takes a config edit, a token change and a deploy (AC26). A project still at the idea stage has nothing on its tile, because the Timeline needs PROJECT.md.
   - Why it matters: the owner hates "upkeep on the owner… adding repositories" (Part 2; V3), and plans to try out ideas often (note 21).
   - Planned? Only as manual steps written to take under 10 minutes. The cap of 5 is by design (§1), and the New project card was deferred.

**What I couldn't judge:** whether the seven-part decision cards already explain the consequences of each option in business terms, because I didn't read a real card. If they do, A7 and A6 matter less.

Key files:
- /home/user/sd-tv2/decisions/questions/P-001-trial-view-notes-2.md
- /home/user/sd-tv2/docs/PROJECT.md
- /home/user/sd-tv2/specs/S-001.md
- /home/user/sd-tv2/docs/design/mockups/status-and-timeline.html
- /home/user/sd-tv2/docs/design/mockups/other-screens.html
