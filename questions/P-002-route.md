# Ruling needed: How should the pull-request briefing page start on the desk?

Milestone: none (the new Discovery has not started; this question decides how it starts)
Asked in session: session_01QBwHGLrbUaowxNjhF5oC3A

WHY: You asked for a page on the desk that sums up every pull request like a slide in a briefing deck. The desk has gone live and left the pipeline, so new work on it starts only on a route you approve. For an addition, the model allows one route: a new Discovery, sized to the work. Choosing A or B approves that route; choosing C approves nothing yet. One thing stands in the way: each repository holds one project plan, which the desk's checks and screens read, and the desk's own finished plan already fills that place. Nothing is built and nothing changes on the live desk until a later gate you rule. If you do not rule, nothing starts and the idea waits in your idea log.
OPTIONS:
  A. Start a small Discovery now.
     What happens: the first steps are a map of what an expert would ask, your short list of questions, and research only where the desk's earlier work does not answer it. These are kept as research requests, research files and answer records, which do not touch the plan. The project request that opens the Discovery on the desk is filed only after you rule where the plan lives. Where the plan itself lives comes back to you as its own question before it is written. If Discovery finds that pull requests must be written differently, that is a separate change to the operating model, under its own rules, raised with you then.
     Cost: the plan's place is settled later, not now; the plan cannot be written until you rule it. Rules out: nothing.
  B. Fix the one-plan-per-repository limit first, then start.
     What happens: a change to the operating model's tools lets any repository hold more than one project. It also unblocks the second idea in Model-Lab, which hits the same limit.
     Cost: the briefing work waits for that change's own plan, build and review, whose size is not yet known; more questions reach you at once, from that change and two Discoveries. Rules out: nothing; the briefing work follows.
  C. Hold the briefing work until the prompt engine's Design gate, and start it then with the seven desk follow-ups already ruled for that point.
     Cost: the page you asked for waits until after that gate, which has no date; you keep reading pull requests one by one until then. Rules out: nothing.
RECOMMENDATION: A — it starts what you asked for today, puts the plan's place to you once Discovery knows what the page needs, and keeps any model change separate until it is shown to be needed. Medium confidence. It would change if you want the one-plan limit fixed before any new project starts anywhere (then B).
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the desk's records; nothing on the live desk changes
DEFAULT: none (where new work on a graduated product starts is the owner's ruling)   TIMEOUT: none

## Context
- The owner asked for "a visual update page with every pull request summarized almost like a briefing ppt", as a decently sized improvement to the desk and maybe to the operating model, to run in its own session (source: portfolio ideas/IDEAS.md, 2026-11-01 entry; ideas/KICKOFF-pr-briefing.md)
- The desk passed its Launch gate and graduated on 2026-11-01 (source: decisions/questions/P-001-graduation.md)
- A graduated product comes back only when the owner raises new work; add-on work starts a new Discovery, scaled to its size; the Chief of Staff proposes the route and the owner approves (source: Personal-Org-Operating-Model OPERATING_MODEL.md §3 "Graduation and re-entry")
- After launch, only four settings jobs count as running the desk; "Anything else is new work" (source: docs/handover/desk-operations.md, line 60; decisions/questions/P-001-graduated-changes.md)
- The governance checks and the desk's page read one project document per repository, at docs/PROJECT.md, which holds the desk's own graduated plan (source: governance/checks/v3_checks.py line 204; src/public/lib/feed.js lines 653 to 749)
- Research requests are filed as their own records, and need no milestone tag before a project is approved (source: intake/requests/README.md); the groundwork map is a research file (source: Personal-Org-Operating-Model OPERATING_MODEL.md §4 "Groundwork research"); owner answers are recorded under decisions/questions/ (source: AGENTS.md §5)
- The same one-document limit was logged in Model-Lab as open, with options for the owner due before its second idea starts (source: Model-Lab docs/LESSONS.md LL-16)
- Every pull request body in a v3 project already opens with a plain paragraph, then the milestone it serves, its facts with their sources, its reason, and its tasks (source: Personal-Org-Operating-Model OPERATING_MODEL.md §3 "Why and context" and "Tasks and steps")
- The desk already reads the projects' pull requests (source: src/lib/github.js; src/public/lib/pulls.js; src/public/lib/waiting.js)
- The prompt engine's Discovery is running in Model-Lab at the same time, its Design gate not yet ruled (source: Model-Lab docs/handoff/2026-11-01-chief-of-staff-2.md)
