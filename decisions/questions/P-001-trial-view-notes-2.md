Ruling: trial-view notes, batch 2 (open): wherever the desk shows phases in order, a phase that runs again branches to the right, so the list reads in order and shows where each run branched and which milestones followed
Proxy: done at the owner's request (the owner wrote in the session on 2026-10-16 with a screenshot of the preview's Status screen, docs/design/references/trial-view/2026-10-16-status-phases-0649.png, 06:49 on the owner's phone, and answered two follow-up questions; each is quoted verbatim below)

1. The owner's note, verbatim:
"All of your suggested changes and such have landed well, I am noticing one thing here though - the app shows us back in a design iteration but also implies build is done? Chronologically that can’t be true"

Follow-up questions and answers:
1. "That screen is reading the records correctly, but the way it shows them is misleading. Build's first run did finish: those were M1 and M2, the working desk. Then the project went back into Design for a second run (\"i2\") for the new look, and Build will run again after it. How should the phase list show that?" The owner answered in their own words: "Little bit of a conceptual leap her so we might need to mock this up. But I think anywhere we have chronological phases like this, we should incorporate a branch style visual. By expanded out a second, third, fourth (however many are applicable) dot set to the right of the original milestone dot. Therefore this could read in a chronological order but also show where the iteration branched and what milestones followed suit". The options offered: "Mark the earlier run (Recommended)", "Show the runs in order", "Reset later phases".
2. "Is this one change on its own, or the start of a new batch of notes?" Answer: "Start a batch" (option text: "I log this as note 1 and wait until you say the batch is done."). The other option offered: "Just this one".

How it is read:
- The phase list keeps its four phases (and Done) in order, top to bottom, with one dot per phase.
- When a phase runs again, its new run starts a second column of dots to the right, beside the phase it went back to. The phases that follow it in that run carry on down the new column. A third or fourth run adds a third or fourth column. So the first column shows the first run (here Discovery, Design i1, Build i1), and the second shows the run now under way (Design i2, then Build i2, Launch and Done still to come).
- "Anywhere we have chronological phases like this" covers the Status screen's phase list and Home's phase checklist; the Timeline already draws runs and is checked against this.
- A mockup comes first, for the owner to judge, before any spec change.
- The batch stays open until the owner says it is done.

The owner's answers on the mockup (docs/design/mockups/phase-branches.html, published privately as "Phase Branch Mockup"), verbatim, 2026-10-16:
"This is the exact picture I had in mind. Every box list it’s runs as well, but in smaller de emphasized text, yes to point 3."
The mockup's three questions, as put: 1. "Is this the picture you had in mind: one column of dots per run, branching right?" 2. "On the Status screen, should each phase box list every run (as here), or only the latest run with the earlier ones one tap away?" 3. "Should the Timeline screen use the same branch drawing, or keep its strip of runs?"

How it is read:
- 1: yes, one column of dots per run, branching right.
- 2: every phase box lists all its runs; the earlier runs are in smaller, de-emphasized text, and the latest run reads at full size.
- 3: the Timeline screen uses the same branch drawing.

2. The owner's note, verbatim (same message):
"Additionally, when a phase was completed but branched off, make the dot fill lighter than a fully completed phase"

How it is read: a phase that finished in a run the work later branched away from (here Design i1 and Build i1, which run 2 went back over) has a lighter-filled dot than a phase that finished and stands (here Discovery). The difference is also said in words, never by colour alone.

Notes 3 to 9, the owner's message verbatim (2026-10-16, headed "Trial-View Notes", numbered 1 to 7 by the owner; with a screenshot, docs/design/references/trial-view/2026-10-16-release-changelog-example.png, and a code snippet kept whole, byte for byte, at docs/design/references/trial-view/2026-10-16-release-changelog-snippet.html, which the owner's point 7 is):
"Trial-View Notes

1. Unsure how to describe it, but the general spacing of things. I dont hate it, but there are spots that seem too spaced, and then some spots that seem too tight. 
2. Is there a way to "fix" the window so that i cant zoom in to a page? 
3. General polish of text. There is a lot of text throughout the service desk - which i want specifically - however if all of the text is formatted almost identically it all kind of blurs together. 
4. When i look at the status page, i see two things that i want to address. The milestone groupings are great, but what is missing on this page is the "holistic phase & milestone look" what i mean by that is that when we show the standard milestones that we DONT do for a particular project, it doesnt easily translate to what we DO take on - in chronologgical order. The other thing is that every milestone within the phases should have a short snippet of "why this phase was included or not included"
5. Right now on the timeline page the phases seem discrete. I want them to be complete, from start to finish. 
6. I have a code snippet for a tyoe of list component i want to take place of the timeline - please see point 7 below. The screenshot attached shows the general look. Its a dynamic release timeline that i want to adapt. I want the title of each "release" point to be a plain english description of the specific task. Then a technical sub bullet. Then a "context/what" bullet. Then a why bullet. I do still like the checkmarks and such on the right side of the screen. 
7. [the code snippet, kept whole at the path above]"

In this batch these are notes 3 (owner's 1), 4 (owner's 2), 5 (owner's 3), 6 (owner's 4), 7 (owner's 5), 8 (owner's 6) and 9 (owner's 7, the snippet). How each is read is recorded with the owner's answers to the follow-up questions.

Follow-up questions on notes 3 to 9, and the owner's answers (2026-10-16):
1. "On note 4 (the zoom): when does the page zoom in on you?" Answer: "When I tap a text box (Recommended)" (option text: "The iPhone zooms in when you tap a text box whose text is small, and it stays zoomed. The fix is making those boxes' text large enough that the phone never zooms. Pinch-to-zoom still works if you ever want it."). The other options offered: "By accident, pinching or double-tapping", "Both".
2. "On note 6, each milestone's short \"why this was included or not included\": the desk never writes its own words, so the reason has to come from a record. Where should it come from?" Answer: "A line in the project's plan (Recommended)" (option text: "Each milestone in the project's plan (docs/PROJECT.md) gets a short \"why\" line that the agents write when they plan it, and you can edit it. The standard milestones a project skips get one too. Until a line exists, the desk shows \"why: not recorded\". This is also a small change to the operating model, so every project does it."). The other option offered: "The model's own definitions".
3. "On notes 7 and 8, the Timeline becomes one continuous feed from start to finish, in the style of your snippet. Which way should it run?" Answer: "Newest at the top (Recommended)" (option text: "Like your snippet: what's happening now sits at the top, with the history below it all the way back to the start. You see the latest without scrolling."). The other option offered: "Start at the top".
4. "Is batch 2 complete, or do you have more notes coming?" Answer: "More to come" (option text: "I keep the batch open, and start the mockups in the meantime."). The other option offered: "That's the batch".

How notes 3 to 9 are read:
- 3 (spacing): one spacing scale used across every screen, so related things sit close and separate groups sit further apart; the uneven spots in today's screens are evened out. Judged on a mockup first.
- 4 (zoom): every text box's text is at least 16 px, the size below which an iPhone zooms in on tap. Pinch-to-zoom is not locked.
- 5 (text polish): a clear type scale, with headings, body text, labels, quoted record text and small print each looking different, so long pages don't blur together. Every word of text stays.
- 6 (Status page): (a) the phase list shows, in order, every standard milestone with whether this project takes it on, so the skipped ones read against the ones it does; (b) every milestone, taken on or skipped, shows a short "why" taken from a line in the project's plan (docs/PROJECT.md), written by the agents when they plan and editable by the owner; "why: not recorded" until one exists. The plan line is a change to the operating model, to be raised there as its own spec.
- 7 and 8 (Timeline): the Timeline becomes one continuous feed, from the project's start to now, newest at the top, in the style of the owner's snippet (a thin rail with a dot per entry). Each entry's title is a plain-English description of the task, then three bullets: technical, context or what, and why. The checkmarks and status marks on the right stay. Each line is taken from a record, or reads "not recorded".
- 9: the snippet is a style reference. Its invented copy, its looping animation and its version badges are not carried over; the feed shows only the project's real records.
- The batch stays open; mockups start now.

Notes 10 to 14, on the batch-2 mockup (docs/design/mockups/status-and-timeline.html, first version), the owner's message verbatim (2026-10-16):
"What happened to the visual branching idea I stated previously. 

I like how these are all laid out, I think on the phases and milestones if we incorporate the visual branching, then maybe soften the text color for not utilized milestones and add a simple light directional line that ties the milestones/phases from the bottom to the top to indicate direction - if those changes get made I think I will love it. 

And then, for the timeline rework, I love it. Two things to add phase color indicators so that 1 clean scroll would visually show all phases as you scroll by. Then color coding of the sub bullets for the “why, what…” on the timeline. Just so it’s easily visible"

How it is read:
- 10 (branching): the first version of the mockup dropped the branch drawing from notes 1 and 2; that was the orchestrator's miss. The Status page carries it: one column of dots per run beside the phase boxes, run 2 branching right at Design.
- 11 (soften): milestones the project does not take on, and those no record says it reached, have softer text than those it does.
- 12 (direction line): a light line ties the phases, and the milestones inside each phase, together, with small arrowheads showing which way the work runs. Drawn in the second version running from the start at the top down to Done, the order the phases are listed in; whether the owner meant the list to read from the bottom up is asked in chat.
- 13 (phase colours): each phase has its own colour. On the Timeline, the line down the left takes the colour of the phase each entry belongs to, and the phase's name stays pinned at the top while its stretch scrolls by. The phase boxes on Status carry the same colour. The name is always in words too, never colour alone.
- 14 (bullet colours): Technical, Context and Why each have their own colour, on the label and down the bullet's left edge; each keeps its label.

Notes 15 to 18, on mockup version 2, the owner's message verbatim (2026-10-16), which also answers the question put in chat ("Did you mean the Status list should flip so it reads from the bottom up, with the newest at the top like the Timeline? Or is downward fine?"):
"I was always envisioning phases > milestones > tasks to read bottom up. So discovery would be at the bottom and the final thing done would be at the top. 

But I absolutely love the look right now - only comment the branching timeline should have its own background - it shouldnt just sit on top of grey space.

As for the timeline, context is currently showing what i would consider technical. Context for me is more alligned with what are the elements at play that are driving the why to exist? Almost a conversational recording of what we were discussing that lead to particular rulings?

And the other thing on the timeline - How would planned items show up? In my head scrolling from bottom to top shows you everything that has happened from the begginning all the way to everything that has yet to come to get to the finish line."

How it is read:
- 15 (bottom up): phases, milestones and tasks read from the bottom up everywhere: Discovery at the bottom, Done at the top; inside a phase, the first milestone at the bottom and the last at the top. The direction line's arrows point up. This replaces the reading of note 12 as drawn in version 2.
- 16 (background): the branch drawing on Status sits on its own surface, not on the page's grey.
- 17 (Context): Context is the conversation that led to the change: the question the owner was asked and the answer they chose, quoted from the question file, or a ledger entry's "asked" line and its ruling. "not recorded" where no such record exists. The phase and milestone move into Technical.
- 18 (planned items): the Timeline runs from the project's start at the bottom, through what is done, to Now, then every planned milestone above Now, each with its "done when" line from the plan and its why line, up to the finish line. The desk opens it at Now. Planned stretches have dashed rail and dots.

Notes 19 to 21, on mockup version 3, the owner's message verbatim (2026-10-16):
"Phases and milestones section - reduce the weight on the line connecting things. The branch background doesnt look right - do you have better visual suggestions? Other than that i like it. 

For the timeline section keep the intention in mind, the timeline represents the chronological ledger of ideation > execution of a project > visualized as an " N+2" WBS. 

Remember - I am not a coding expert, i might play around on project ideas that i have no prior experience in, Im a generalist with wide skill set and an ability to learn very quickly - but i undertand process flow & business impact, and i have a very structural system oriented mindset. 

If im the boss - i would ask the following question to my team: "What are we trying to deliver? Where are we starting from? We are going to deliver it via these few phases, what  do we need to generally accomplish in each phase, ie what are our milestones? I dont need to see your specific action plans for delivering each milestone, but i expect to be able to access them if i want and Understand exactly how they will feed achievement of those milestones. Our plan will be built by the chronological order of delivering those milestones. Most importantly - at no point should we look at a milestone and say "wait why are we doing that?""

How it is read:
- 19 (line weight): the lines connecting phases and milestones on Status are thinner and lighter.
- 20 (background): the strip behind the branch drawing in version 3 is replaced. Version 4 offers three options: A, one panel holding the drawing and the phases (suggested, shown in full); B, the dots inside each phase's box; C, tinted rows in each phase's colour. The owner picks one.
- 21 (Timeline as a breakdown): the Timeline is the project's chronological ledger from idea to delivery, drawn as a work breakdown two levels below the project: project, then phases, then milestones, with the tasks that feed each milestone folded underneath, one tap away. It opens with what the project is delivering (top) and where it started (bottom), quoted from docs/PROJECT.md. Each milestone shows what done looks like and why it is being done; a missing why is flagged. Tasks that name no milestone are gathered under a flagged "Not tied to a milestone" line. The milestones are ordered by when they are delivered, read from the bottom up.
- The owner's description of themself (a generalist who understands process flow and business impact, not a coding expert) is a standing guide for how the desk presents every project: in plain terms, structured from goal to phases to milestones to tasks, with technical detail one step down.

Notes 22 to 24, on mockup version 4, the owner's message verbatim (2026-10-16):
"Okay this is all SO much better. 

1. Why do you reccomend A and not B on the branch side. 
2. I love the timeline - In order to avoid Color burnout on the timeline, you can keep the filled diamend icon but for every other icon lets represent the completion or in progress status with an icon within the circle. Like completed can be check mark - i just need proposals for the others statusses. I do like the "next to reach icon though.
3. I apologize on this because i have been blurring context - Phases have Milestones, milestones have sprints - this is what we should show as the " what do we have to do to devlier thee milestones" - Every sprint, should then link to the more technical or granular breakdown of tasks that agents or myself have. It should be the most granular level that we see - but we dont need to see it here, just have a way to get there from here"

How it is read:
- 22: a question about option A against option B for the branch drawing's background; answered in chat. The choice stays open.
- 23 (icons): on the Timeline, milestone and sprint statuses are shown by an icon inside a plain circle, not by colour. Kept as they are: the filled diamond (needs filing) and the "next to reach" ring. Proposed in version 5 for the rest: reached, a check; reached then gone back over, a lighter check; in progress (work filed), a half-filled circle; planned, an empty dashed circle; not reached, a cross; skipped, a dash; not recorded, a question mark in a dashed circle. The owner picks or changes these.
- 24 (sprints): the levels are project, phases, milestones, sprints, tasks. Under each milestone the Timeline shows the sprints that deliver it (in this project a sprint is a pull request or a research run, as docs/PROJECT.md's "sprints:" lines name them). Each sprint links to its own breakdown of tasks, by agents or the owner, which is the most granular level and is not shown on the Timeline itself.

Notes 25 to 27, on mockup version 5, the owner's message verbatim (2026-10-16), after the orchestrator's answer to note 22 (why A over B):
"Lets do B - simply because i like the ability to cleanly collapse and draw distinction between phases. 

Final thing is just drop the weight of the timeline line slightly. 

And then answer this question - context isnt always "my comments", do we agree with that? Context is more specifically about what are the things that are true or exist that lead to the why?"

How it is read:
- 25 (background, ruled): option B. Each phase on Status keeps its own box, with its dots inside it on the left; tapping a phase's name folds the box to one line and back.
- 26 (Timeline line): the coloured line down the Timeline's left is thinner and lighter.
- 27 (Context): agreed. Context is what was true or existed that led to the why: a limit found in testing, a fact about the records, a review finding, a check result, a research result, an earlier ruling, and sometimes a note of the owner's. Each fact names its source. The owner's question-and-answer is not Context; the answer is the ruling the sprint carries out. The agents write the Context facts into each sprint's record when they file it, and the desk only shows them; "not recorded" where none exist. This joins the why lines as a records change for the operating model.

The owner's approval of the mockup, verbatim (2026-10-16), after version 6:
"This is it, approve all of these changes, begin any rework you need to get working on, I will finish out the batch in parallel and respond back with the rest of it"

How it is read: mockup version 6 (docs/design/mockups/status-and-timeline.html) is approved as the design for notes 1 to 27, including the proposed status icons of note 23 as drawn. Spec, plan review, build and build review start now on notes 1 to 27. The batch stays open: the owner's further notes join it as they arrive.

Follow-up question and the owner's answer (2026-10-16), after the owner asked: "Okay one ask though, given the work we just put into this page, are their changes / additions you would make to the other tabs to remain consistent and coherent"
"Which of these changes to the other screens should join batch 2? I'd mock up the ones you pick before anything is built." Answer (all four options picked): "Home tile phases (Recommended), Queue: why it matters, Team: what each is on, One phase marker everywhere". The option texts, as offered:
- "Home tile phases (Recommended)": "The tile still lists phases top-down with green checks and says \"Build finished\", the very mix-up that started batch 2. Make it match Status: bottom up, a small branch drawing, plain circles with icons, a phase-colour stripe, and \"Design, second time through\" instead of \"2 of 4 phases finished\"."
- "Queue: why it matters": "Each item waiting on you names the milestone it unblocks and why that milestone exists, with its Context facts one tap away. The Queue's five coloured icons go neutral; only the coral diamond (needs you) keeps colour."
- "Team: what each is on": "Each agent card names the sprint it's working on and the milestone it feeds, with a link into the Timeline. Status shown with the same circle icons as the Timeline instead of bare dots."
- "One phase marker everywhere": "Every project screen's header carries the current phase band (e.g. \"Design · run 2\" in Design's colour), so Status, Timeline, Team and Queue all say where the project is in the same way. The old Pipeline page under \"More detail\" folds into the Timeline, since they now show the same thing."

How it is read: these are notes 28 to 31 of batch 2 (Home tile, Queue, Team, phase marker), to be mocked up before anything is built and added to the spec once the owner approves the mockup.
