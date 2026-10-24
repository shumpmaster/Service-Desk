# The owner's request of 2026-10-24: visual emphasis for what matters at a glance

Said by the owner in the Chief of Staff's session (session_017seyaGqUxAff6E8dKWHDCR) on 2026-10-24, word for word, after checkpoint CP-01:

> Additionally, I wanted to add one more ui thing that I didn't see before, and I want it first on the list.
>
> I love the UI, the only challenge I'm having is catching the important information immediately at a glance.
>
> I roughly know where to look for everything, but I think certain locations, elements and what not need a little bit of visual emphasis throughout the desk

After the Chief of Staff proposed a Design reviewer audit of each screen ("what does the owner need to see first here, and does it stand out?"):

> Start that review, I want the design reviewer to provide their rationale as to why each change they propose was proposed

## What it starts
- A whole-desk audit by the Design reviewer, focused on emphasis at a glance, each proposal with its rationale. Recorded verbatim at docs/design/audit-2026-10-24.md when it returns.
- Ordered first among the remaining work, ahead of the three threads in docs/CHECKPOINT.md.
- It restates the owner's discovery answer 3 (P-001-design-discovery.md): "I want to glance for a few seconds, but pick up enough information from that glance to know where to press into more details."

## Comment on item 4, word for word

Left by the owner on the mockup page (docs/design/mockups/glance-emphasis/), on item 4's "after" shot, 2026-10-24:

> Is it possible scrap the middle column, and rather opt for a collapsible section that shows kicked back cards left to right in a line? Almost like a kicked back queue that is minimized when nothing exists but pops open when something is there?

Mocked as item 4b of the mockup, and added as options C and D to questions/P-001-glance-lanes.md.

## The owner's answers and round 2, word for word

Said by the owner in the same session, after the six questions were filed (pull request #217):

> Okay so I like all of your proposals, and for the kicked back idea, I like the option with the two state columns equally sized.
>
> Then going back to your proposals, I like them, they are solid. However a few things I want the reviewer to consider.
>
> I'm not against slight color, I know we have some strict enforcement around color in the spec. I am willing to adjust that, for a limited palette that enforces consistent indication of things that are going well, and things that aren't.
>
> Additionally I want to propose the occasional usage of outlined boxes or subtle callouts that an assist as visual anchors on pages for the most important information on it.
>
> My two final ideas are more targeted. On any timeline element or plan element, can we are add a subtle but noticeable visual arrow indicator for where we are?
>
> And then finally when I look at the milestones page I am consistently met with a 0 out of X milestones. Even on phases we've fully completed. My understanding is that is referring to the standard milestones. I want to expand that to all milestones, in some way that highlights the fact we didn't use the x standard ones but we still have y number of milestones and this is what we've completed so far. I want that same logic applied to sprints and actions. So I can see the volume progress for each.
>
> And in hand with that - please visual segregate the standard milestones a little bit more than they currently are. The lighter color just kind of gets skipped by me and I get confused on what's in or out

What it starts: the six answers are recorded in decisions/questions/P-001-glance-*.md. The five further ideas (a limited status palette, occasional callouts, a where-we-are arrow, counts of all milestones, sprints and actions, and standard milestones set apart) go to the Design reviewer as round 2 of the glance audit, recorded at docs/design/audit-2026-10-24-round-2.md when it returns, then mocked up as before.

Asked what "actions" meant (the pieces of work inside a milestone, the steps agents record in their running logs, or GitHub Actions runs), the owner said, word for word:

> I meant the pieces of work within a sprint in a milestone, but I wouldn't be against the last two being visible somewhere as well if it's a simple ask

## Comment on item 4b, word for word

Left by the owner on the mockup page, on 4b's third shot (the strip with an empty Done shrunk), 2026-10-24:

> FYI, maybe shade the done section.
>
> When it gets shrunk to a 3rd of the screen like this it kinda hides the intent of the done section which is to move them over

Mocked as item 4c on the chosen layout (P-001-glance-lanes: C, two equal lanes): the Done lane on the briefing's --bg2 ground, rounded, full height. For the build brief with the lanes ruling; the Design reviewer to check it against round 2's R2 (a filled box means the screen's one anchor).

## The owner's round-2 answers and the operating-model go-ahead, word for word

Said by the owner in the same session, after reviewing round 2's mockups (and the explanation of what counting a sprint's pieces of work would take):

> Okay love it, all. Only changes I would propose is the outlined box isn't ONLY for the single most important thing on the page.
>
> It should be for the set of most important things on a page. It definitely shouldn't be overdone but only accepting one thing omits other elements that might be close to or as important.
>
> Then finally, you can proceed with the changes proposed for the operating model and the steps link back toward milestone. Honestly I had already assumed that existed and finding out it didn't represents that we caught a big gap. It makes no sense to consider the two things as unrelated, it's all a hierarchy of work. You can't progress phases without successfully delivering upon the milestones, the milestones are accomplished by delivering sprints and ultimately the agents should be either following clear tasks or should be recording them for us to see what it took to get there

Read as: all five round-2 choices as recommended (decisions/questions/P-001-glance2-*.md), with the anchor rule widened to "the set of most important things on a page, never overdone"; item 4c (Done shaded) accepted with "all", for the Design reviewer to fit to the widened anchor rule; and a go-ahead for the operating-model change in Personal-Org-Operating-Model: each sprint carries its planned pieces of work (tasks), and every step (agent session) is recorded against its sprint, so the chain phase → milestone → sprint → task/step is whole and the desk can show it.
