# Ruling needed: Where should the plan for the pull-request briefing page live?

Milestone: Discovery-7
Asked in session: session_01QBwHGJtoNqbcm5CHZ4r84S

WHY: You ruled that where this work's plan lives comes back to you before the plan is written. The plan is the brief that the Design gate rules on: what is in and out, who owns what, the limits and spend, how success is measured and when to stop, and the milestones. Each repository holds one project document, and the desk's own plan fills it; that plan was approved and settled when the desk was. The operating model already expects later work on a graduated product to share that document for its milestones, each marked as belonging to the new work, but it says nothing about where the new work's scope, owners, limits and value targets go. Until you rule, the project request that opens this Discovery on the desk is not filed, and the brief cannot be written. Research already under way carries on either way.
OPTIONS:
  A. The desk's own project document, as later work.
     What happens: the new work's milestones go in the plan's milestone section, each marked as belonging to the new work, as the model already provides. Its scope, owners, limits and value targets go in the same sections as new lines, each marked the same way, beside the desk's settled lines, which stay word for word as approved. The desk's screens show them with the desk's own.
     Cost: the automatic check of a ready plan only looks for each section being filled, and the desk's lines already fill them, so it cannot catch a missing piece of the new brief; the Critic's check of the brief and the reviewers have to catch that instead. The Critic is sent to read the whole document, so its brief is told which lines are new. Adding lines to a settled plan is a reading the model does not state; it would be logged as a lesson for the model to settle. Rules out: nothing; the work can move to its own document later.
  B. A second project document in the same repository, after a change to the model's tools to allow it.
     What happens: the model and its checks are changed, under that repository's own rules (a frozen spec, its builder, its reviews), so a repository can hold one document per project; then this plan is written in its own document. The same change answers the open lesson in Model-Lab about its second idea, which hits the same limit.
     Cost: the brief waits for that change's plan, build and review, whose size is not known; more questions reach you, from that change as well as this work. Rules out: nothing.
  C. A new repository for the briefing work.
     What happens: the plan gets a project document to itself in a new repository.
     Cost: the page would be part of the desk's own screens, whose code lives in the desk's repository, so the build would still change the desk's repository from outside its project; a new repository also needs its own setup, checks and access. Rules out: nothing, but it would likely be undone.
RECOMMENDATION: A — it is the route the model already provides for later work, it lets the brief be written now, and the gaps it leaves are covered by the Critic and logged for the model to settle. Medium confidence. It would change if you want each project's plan kept wholly apart from the desk's settled one (then B, which also answers the Model-Lab lesson). The portfolio was also considered and is not offered: it holds ideas and the shared library, not project plans.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the desk's records, its project document and the screens that read it; nothing built changes
DEFAULT: none (where new work on a graduated product is planned is the owner's ruling)   TIMEOUT: none

## Context
- The owner ruled to start a small Discovery now, and that where the work's plan lives comes back as its own question before the plan is written; the project request is filed only after that ruling (source: decisions/questions/P-002-route.md)
- Add-on work on a graduated product starts a new Discovery as a new project item; the Chief of Staff proposes the route and the owner approves (source: Personal-Org-Operating-Model OPERATING_MODEL.md §3 "Graduation and re-entry")
- Part 1 of the project document, the brief, is "settled at approval"; its milestones then change only as the model's milestone rules say (source: Personal-Org-Operating-Model OPERATING_MODEL.md §4 "Definition of ready: leaving Discovery (D-052)")
- The milestone section's form gives a milestone added for later work on the product ` · for: P-<n>`, at least one per such item (source: docs/PROJECT.md section 3, instruction line); the checks note later work that has none, and the timeline lists a second project item as "Later work 1: P-002 into <phase>" (source: governance/checks/v3_checks.py, `timeline` and the `for_item` notes near line 1705)
- A project request without `enters` starts at the Critic's brief check (source: governance/checks/orchestrator.py, `requests`, near line 1236), whose brief reads "Check docs/PROJECT.md Part 1 against the definition of ready (D-052)" for the whole document (source: governance/BRIEFS.toml, `dor-dispatch`)
- The automatic definition-of-ready check reads one document per repository and checks only that each of sections 1 to 8 exists and holds content beyond its instruction line (source: governance/checks/v3_checks.py, `_check_ready_1_to_8` and line 204)
- Section 6 holds the desk's value targets V1 onward as `V<n>:` lines, and the desk's project page shows every such line (source: docs/PROJECT.md section 6; src/lib/projectpage.js, `restRows`); section 9 reads "The owner is the user." (source: docs/PROJECT.md section 9)
- The desk's page code lives in this repository (source: governance/SURFACES.md, the `src/**` surface; src/public/)
- Model-Lab logged the one-document limit as open, with options for the owner due before its second idea starts (source: Model-Lab docs/LESSONS.md LL-16)
- The portfolio repository holds ideas and the shared library (source: portfolio, top-level folders `ideas` and `library`)
