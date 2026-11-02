# Handoff — the desk's new Discovery (the pull-request briefing work), 2 November 2026

*Written by the Chief of Staff (session_01QBwHGLrbUaowxNjhF5oC3A) at a natural stopping point, so a fresh session can carry on without this conversation.*

## Where it stands
- **Route:** the owner approved a small new Discovery for the desk, starting now (decisions/questions/P-002-route.md), and folded in only the portfolio's pull requests from the seven desk follow-ups; the other six and the library-patterns count stay as ruled for after the prompt engine's Design gate (decisions/questions/P-002-follow-ups.md).
- **Groundwork map (Discovery-3):** research/Q-016-memo.md, checked: question passed the Critic at round 2 (reviews/Q-016/critic.md); map failed its first source check on the pull-request count and passed at round 2 (research/Q-016-source-check.md, -2.md).
- **Owner shortlist:** all eight answered (decisions/questions/P-002-groundwork-shortlist.md, on branch cos/p002-shortlist-answers, not yet pushed: it waits for PR #265 to merge, since an answer's pull request opens only once its question is on main). The owner's main point: pull requests read as separate items, not as steps toward the project's objective; each should say what is done, its implications, why, and how it fits the whole, with the thread from earlier merges to now. Keep today's channels and add the pull-request visual report. Seen counts as dealt with, remembered across devices; unchecked summaries are fine with a visible "not checked" label; any project's text may go to an outside AI service for summaries.
- **No project request yet:** the desk's tools hold one project document per repository (docs/PROJECT.md, the graduated desk's). By the owner's route ruling, where the new work's plan lives comes back to the owner as its own question before the plan is written; the project request is filed only after that ruling. Research is tagged to standard milestones meanwhile (the milestones check requires a tag).

## Open on GitHub
- Service-Desk PR #265 (rulings, the map, its checks, the shortlist question): all checks green, waits for the owner's merge (the asks-merge workflow skipped it: it holds research records).
- Model-Lab: lessons log LL-36 pushed on branch claude/pr-briefing-visual-update-2zbuth, no pull request yet.

## Next, in order
1. After #265 merges: push cos/p002-shortlist-answers onto the push branch (it holds the answer record, which deletes the question file) and open its pull request.
2. **The research list.** From the map's research shortlist and the owner's answers, draft research questions, each Critic-checked for neutral phrasing before dispatch, each tagged to a standard Discovery milestone. Proposed: (a) how accurate and complete recent pull-request descriptions are against what the change did (map R1); (b) volume of changes of each kind across every connected project and the portfolio (R2); (c) what the desk already shows and reads for pull requests, and what records already link a pull request to its milestone, sprint and objective (R3, widened by answers 2 and 4); (d) outside evidence on briefing one decision-maker on many changes, and on errors in machine-written summaries (R5). R4 (GitHub's built-in options) looks low value after answer 5; say so if dropping it.
3. **The question of where the plan lives** (filed first, Critic-checked), before the brief is drafted; also brings the owner options for LL-16 in Model-Lab.
4. Then the brief: value target and stop rule, scope (including the data boundary change of answer 8 for the owner's approval), limits and spend, milestones; Critic against the definition of ready; Design gate case.

## Working rules carried forward
- Run the governance checks, read the result, and push only as a separate step (Model-Lab LL-29, LL-36). Locally, `record_checks merges` fails falsely on the orchestrator's record commits, and `v3_checks trace` needs full history (`git fetch --unshallow`); CI passes both.
- A research request's milestone tag must be in the commit that first files it.
- Record every helper's return verbatim before acting on it; for a resumed helper, log only the increase in tokens (Model-Lab LL-34).
- Keep the Researcher blind: its brief names only research/Q-nnn.md, the groundwork form, the library and the repositories, never decisions/, questions/, the portfolio or Model-Lab.

## Token checkpoint
Helpers this session used about 315,000 tokens in all (the session lines). This session's own tokens and the plan's remaining allowance cannot be read.
