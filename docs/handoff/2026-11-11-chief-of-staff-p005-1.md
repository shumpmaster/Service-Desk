# Handoff — the desk's timeline work (P-005), 11 November 2026, part 1

*Written by the Chief of Staff (session_01QBwHGMeiscLbX8ZWj6MH1K). The first session of the timeline work: the "Waiting on you" side of the desk redrawn as one timeline of everything the agent team does, read like a CI. Starting brief: shumpmaster/portfolio ideas/KICKOFF-timeline.md and ideas/basis/ (the basis, locked by the owner on 2026-11-09).*

## Done
- **The route, ruled.** questions/P-005-route.md, read cold by the Critic three times (round 1 FAIL: the default contradicted "nothing starts until you choose", and option A had no cost; round 2 FAIL: a default cannot stand in for the owner's approval, so the default became C, the hold; round 3 PASS, two non-blocking notes applied). Filed in PR #351 (merged by the asks-merge workflow). The owner chose "A: Discovery, own plan (Recommended)": a new Discovery as project item P-005, with a plan of its own, docs/projects/P-005.md. Recorded in decisions/questions/P-005-route.md, PR #352.
- **The groundwork request, drafted.** intake/requests/Q-022.toml, tagged Discovery-3. The Critic's neutrality check: round 1 FAIL (a sentence carried the owner's preference for a fixed key, and the title assumed "one place"; facts on Triage, local branches, `Spec:` trailers and deploy approval corrected; nine gaps added). Round 2 FAIL: a citation pointed into the owner's idea log, which holds the owner's leanings; the path was dropped. Round 3 PASS.

## Why the project request is not filed yet
Filing intake/requests/P-005.toml starts the item at stage 2 with the Critic's readiness check of its plan (governance/checks/orchestrator.py, `new_status("project", 2, "critic")`). The plan cannot pass until the groundwork map is answered, so, as with the briefing work (decisions/questions/P-002-route.md), the groundwork request goes first and the project request follows with the drafted brief.

## Next, in order
1. Land the groundwork request (Q-022) on main; the Orchestrator copies its question to research/Q-022.md and dispatches the Researcher, then the Source checker.
2. When the map is in (research/Q-022-memo.md), put its owner shortlist to the owner, filed as a question first. Check that it carries the owner's four open questions from the kickoff (a second "Model" key row; milestones as a filter; one timeline or one per project; replace or sit beside the Waiting screen) and the related-work choice (the check-status icon; the pull-request briefing page; the seven desk follow-ups, Model-Lab decisions/questions/P-001-desk-follow-ups.md; later work W1 to W3). Any the map leaves off are added to the shortlist by the Chief of Staff, labelled as the owner's own carried questions.
3. Turn the research shortlist into research requests, each checked for neutral phrasing.
4. Draft docs/projects/P-005.md from the basis and the answers: value target and stop rule, scope (records only, never guessing: unknown shows as "not recorded"; waiting is never stalled; the owner's buttons act only as the owner; production deploys stay the owner's), milestones with their whys, the standard-milestone lines, and "The owner is the user." Then file intake/requests/P-005.toml with it.
5. Only if Discovery shows the timeline needs them: the two record rules (every merge commit names its branch; every review file names its reviewer) go to Personal-Org-Operating-Model as their own change.
6. The basis changes only on the owner's word; record any change at the bottom of ideas/basis/TIMELINE-BASIS.md in the portfolio.

## Critic returns
- Route question: rounds 1 to 3 as above.
- Q-022: round 1 FAIL, round 2 FAIL, round 3 PASS, as above. Non-blocking note kept: the request's comment names the timeline, but the Orchestrator copies only `question`, so the Researcher never sees it.

## Token checkpoint
Helper runs this session: the Critic, for the route question (three rounds) and the groundwork question. This session's own use was not read.
