# Ruling needed: Where in the card fix's plan should the checks you moved out of its spec go, and who does each?

Milestone: Design-6

WHY: When you answered the card fix's stop card "re-specify", you moved three things out of its spec to the plan and the Launch gate: your weekly value check, the reports to you, and the end-of-year card. The Definer, rewriting the spec, also moved out two more that hang on them: the route for your feedback on the fix, and the notes on how the fix runs and how to undo it. The spec now covers only the desk's code, so unless the plan names these and who does each, nobody is asked to do them once the fix is live. The plan's sections on owners and on value were settled when you approved it, so adding to them needs your ruling; I put the additions to you before writing them in. Separately, before the Build gate the plan must list the model's ten checklist milestones for building and going live; those are ruled with the Build gate itself, not by this answer, and I show them below so you can see them alongside. One of them is proposed as skipped (answering experiments, since the plan registers none), and two of them may have to become skipped (see the note under them). Nothing is built or changed until you answer.
OPTIONS:
  A. Add them to the plan as proposed below — two rows in the owners' table and one paragraph in the value section: the Chief of Staff counts the target each week from the records, reports each miss to you, turns your feedback into questions, files the review card after 31 December and records the lessons at handover; the Builder writes the operating notes in the handover package. Before the Launch gate, the Chief of Staff runs the weekly count once on past records to show it works.
     Cost: the Chief of Staff's weekly count until 31 December and one review card; a page of operating notes for the Builder. Rules out: nothing. Reversible: yes.
  B. Leave the plan as it is and put them only in the Launch gate's case — the same work, but written down only when the fix is ready to go live.
     Cost: the Build gate is ruled without them in the plan, and the plan's monitoring milestone then has nothing in the plan to point to until the Launch gate. Rules out: nothing. Reversible: yes.
  C. Change any part — say which; I write your wording in and the Critic checks it.
RECOMMENDATION: A — it puts what your ruling moved out into the plan, as you said, with an owner and a record for each, and it is in place before the Build gate is ruled. Confidence: high; it would change if you want the plan kept as approved until the Launch gate (then B).
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the card fix's plan only; the desk's first plan, its code and every other project are unchanged
CHECKED: read cold by the Critic before it goes to the owner; reviews/P-003-launch-lines/critic.md
DEFAULT: A   TIMEOUT: 72 hours

## Context
- The owner's ruling on card stop-5 names three things to move out of the spec: "Keep the spec to the desk's code: move my weekly value check, my reports and the end-of-year card out to the plan and the Launch gate" (source: decisions/P-003/stop-5.md)
- The Definer's list of what the plan must now carry adds two to the owner's three: the feedback route through decisions/questions/, and the operating notes on what the hold and the mark mean and on rollback (source: docs/reports/P-003-definer.md, section 5, on the item/P-003 branch, not yet on main)
- Part 1 of the plan, which holds its owners (section 4) and its value (section 6), is settled when the owner approves the move out of Discovery, and the Design gate was ruled proceed (source: docs/projects/P-003.md, opening note; decisions/P-003/dor-4.md)
- Build's and Launch's checklist lines are written before the Build gate and ruled with it; until then a line is added with the Critic's check alone (source: docs/projects/P-003.md, section 3, the note under its heading)
- V6 runs from the day M4 is live to 2026-12-31, each miss is reported to the owner by the Chief of Staff, and a held card's raise time is its entry in the dispatch log (source: docs/projects/P-003.md, sections 1 and 6)
- The going-live monitoring milestone must be confirmed running at, or just before, the Launch gate, which comes before V6 starts (source: Personal-Org-Operating-Model OPERATING_MODEL.md §4, "Standard milestones", Launch-4; docs/projects/P-003.md, section 6)
- The new spec has a criterion that lets the rule be rerun on past records so V6 can be counted from the records alone (source: specs/S-003.md, AC13, on the item/P-003 branch)
- The plan registers no experiments (source: docs/projects/P-003.md, section 3, Design-3 skipped, and section 7)
- No hidden test set is registered for the desk (source: governance/HOLDOUTS.md, which lists none)
- The fix is later work with a plan of its own, by the owner's ruling (source: docs/projects/P-003.md, opening note; decisions/questions/P-003-plan-place.md)

## What option A adds to the plan

In section 4, after the Builder's row:

| The weekly V6 count, the report of each miss, the questions that carry the owner's feedback on the fix, the review card after 2026-12-31, and the lessons for the operating model at handover | the Chief of Staff |
| The operating notes on what the hold and the "No Chief of Staff recommendation yet" mark mean, and on rolling the fix back, in the handover package | the Builder |

In section 6, after the paragraph on misses:

> How V6 is checked. Each week from the day M4 is live, the Chief of Staff counts V6 by rerunning the fix's rule on that week's cards in queue/, their notes files and the dispatch log that records when each card was raised (the spec's monitoring criterion), records the count and each miss in the weekly value check, intake/value-checks.jsonl, and reports each miss to the owner in plain words the same week. Before the Launch gate, the Chief of Staff runs the same count once on past records, so the check is shown working before it is needed. The owner's feedback on the fix goes to the Chief of Staff, who files it as a question, and its answer is recorded in decisions/questions/. After 2026-12-31, the Chief of Staff files a review card putting V6's result to the owner.

## Shown alongside: the checklist lines for the Build gate (ruled with that gate, not by this answer)

To go in section 3 after the Design lines, with the Critic's check, once the spec has passed its review:

- Build-1 (standard) · taken on · why: the fix is built in the pipeline from a frozen spec, so the Check author locks its tests before any work exists
- Build-2 (standard) · taken on · why: the fix must be built to the frozen spec with its checks passing, within the stop rule's size (section 6)
- Build-3 (standard) · taken on · why: the Builder is never the judge, so the Reviewer, and the design reviewer for the page's code, must try to break the fix before it is accepted (section 4)
- Build-4 (standard) · skipped · why: the plan registers no experiments (Design-3, section 7), so there is none to answer
- Build-5 (standard) · taken on · why: one rule feeds the queue, Home's count, the board, the card sheet and the notification sender, so they must be checked together before Build is done (Design-2, Design-5)
- Launch-1 (standard) · taken on · why: V6 is measured on the live desk from the day M4 goes live (section 6), so the fix must go live, by the owner's ruling at the Launch gate
- Launch-2 (standard) · taken on · why: once live, the hold waits on the Chief of Staff's notes for every decision card, and the Chief of Staff runs the weekly V6 count and reports each miss (sections 4 and 6), so who does what must be set before launch
- Launch-3 (standard) · taken on · why: a decision card may now wait up to a day before the owner sees it, so the handover package's operating notes must say what the hold and the mark mean, and how to roll the fix back, before the owner approves the launch
- Launch-4 (standard) · taken on · why: the owner's ruling moved the weekly value check, the reports and the end-of-year card out of the spec to the plan and the Launch gate (decisions/P-003/stop-5.md), so they, with the feedback route, must be shown working at or just before the Launch gate, by the count's run on past records (section 6)
- Launch-5 (standard) · taken on · why: the fix has a plan of its own by the owner's ruling, and its Launch gate approves both its going live and its graduation, as the desk's own did

Note on two of them: Build-1 and Build-3, as the model defines them, include hidden tests, and none are registered for the desk today. If the fix's checks are locked without hidden tests, I will change both lines to skipped with that reason, which then needs your ruling with the Build gate.
