# Handoff — the desk's new Discovery (the pull-request briefing work), 2 November 2026, second part

*Written by the Chief of Staff (session_01QBwHGLTq16QWmY6X4bJYoG) at a natural stopping point. It follows docs/handoff/2026-11-02-chief-of-staff-p002.md.*

## Done in this session
- **Step 1** of the earlier handoff was already done: the owner's shortlist answers merged in PR #266.
- **Step 2, the research list.** Five research requests filed, each checked by the Critic for gaps and neutral wording before any Researcher saw it, every round recorded verbatim (reviews/Q-017/ to reviews/Q-021/):
  - Q-017 (Discovery-5): how accurate and complete Service-Desk's pull-request descriptions are against the changes; a fixed sample of 20 plus the open ones. Service-Desk only: Personal-Org-Operating-Model and the portfolio are private, and the Researcher has no shell.
  - Q-018 (Discovery-5): changes of each kind per day and week in each repository the desk reads; metadata only for Model-Lab and the portfolio; counts the Researcher cannot make go to a role with a shell.
  - Q-019 (Discovery-5): what the desk shows and reads for pull requests and other changes, and which records tie a pull request to its milestone, sprint, spec or plan.
  - Q-020 (Discovery-4): outside evidence on keeping one decision-maker informed about many changes.
  - Q-021 (Discovery-5): errors in machine-written summaries, how they are caught, and how readers rely on them. Split from Q-020 on the Critic's advice.
  - The map's item on GitHub's built-in options was not filed (answers 5 and 8 settle what it served).
- Model-Lab PR #30: the briefing session's lessons entry, filed as LL-36, lands as **LL-42**, since main already held a different LL-36 and the open Design-gate PR #29 holds LL-38 to LL-41 (its LL-39 asked for this renumbering). The earlier handoff's "LL-36" for the push rule means LL-42.

## Open on GitHub
- Service-Desk PR #267 (the research list). On merge, the desk's pipeline dispatches each question to a Researcher and then the Source checker on its own. It keeps the Critic-checked research/Q-0nn.md, since it writes that file only when it does not exist (governance/checks/orchestrator.py, header). **Do not dispatch Researchers from a session as well**: Q-016 ran twice that way.
- Model-Lab PR #30 (LL-42). If PR #29 merges first, the two log endings need putting side by side again.

## Next, in order
1. After #267 merges, watch the pipeline's research runs; read each memo and source check as they land.
2. **Step 3: the question of where the plan lives**, filed first and Critic-checked before it is put to the owner; it also brings options for Model-Lab's LL-16. Found so far, not yet checked against the definition of ready or the desk's page:
   - The model already supports later work on a graduated product in the same repository: a project request without `enters` starts at stage 2, the Critic's brief check (governance/checks/orchestrator.py, the request branch near "later work"); the timeline lists it as "Later work 1: P-002 into Discovery" (v3_checks.py, `timeline`); its milestones go in the same docs/PROJECT.md section 3 with ` · for: P-002` (template-v3/docs/PROJECT.md section 3; v3_checks.py warns when later work has none).
   - Unknown: whether sections 1, 4, 5 and 6 (scope, owners, limits, value) can carry a second item's lines beside the desk's frozen plan, what the definition-of-ready check and the desk's project page do with them, and whether the brief check reads the whole document as P-002's brief.
   - Options to weigh: the same document as later work; a new repository; a model change for several project documents (LL-16); the portfolio.
3. Then the brief, as in the earlier handoff's step 4.

## Working rules carried forward
- As in the earlier handoff, plus: run the PR-body check locally before opening a pull request (`governance_checks.py pr-body --event <file>` with a JSON event holding the body); the "What this means for you" paragraph must be 15 to 150 words.
- Critic returns that write "Verdict" in bold or mid-line go in `_critic-r<n>-verbatim.md` files, with a plain `critic.md` naming them, or the review lint fails.
- When main moves under an unpushed branch, rebase before checking: the sessions check compares against main.
- Run the governance checks on a merge of the branch into main, as CI does, to read a real result; on the branch alone `record_checks merges` fails falsely on orchestrator record commits.

## Token checkpoint
The Critic used about 111,000 tokens in this session (sessions/chief-of-staff/session_01QBwHGLTq16QWmY6X4bJYoG.jsonl). The session's own status, read at 12:30 UTC, showed about 195,000 of 1,000,000 context tokens in use and an estimated cost of about $4.45 (as Model-Lab LL-37 allows). The plan's remaining allowance cannot be read.
