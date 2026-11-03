# Handoff — the desk's new Discovery (the pull-request briefing work), 3 November 2026

*Written by the Chief of Staff (session_01QBwHGJtoNqbcm5CHZ4r84S) at a natural stopping point. It follows docs/handoff/2026-11-02-chief-of-staff-p002-2.md.*

## Done in this session
- **Research list (#267) merged; the pipeline took it in.** Orchestrator run 611 created status/Q-017.toml to Q-021.toml (stage 2, researcher, ready); run 612 was dispatching at 00:47 UTC on 3 November. No memo had landed at this handoff. No Researcher was sent from the session.
- **The question of where the plan lives** (questions/P-002-plan-place.md, PR #268): Critic FAIL at round 1 (option A hid that the checks would mark the new item's "Success defined" and "Scope, limits and owners agreed" reached from the desk's own lines; the Critic's brief text is fixed, R3), FAIL at round 2 (option C shares those early marks), PASS at round 3 with three wording notes, applied. All rounds verbatim in reviews/P-002-plan-place/.
- **The owner answered B** in the session on 2026-11-03, once PR #268 was open: "B: own plan, tools first (Recommended)". The answer record is written and committed on the **local** branch `cos/p002-plan-place-answer` (commit "Your answer on where the briefing work's plan lives, recorded: B…"), which deletes the question file. Its text is copied below in case the branch is lost with the container.

## Open on GitHub
- Service-Desk PR #268: the question, its Critic rounds, the session lines and this handoff. It holds review records and a handoff, so asks-merge skips it: **it needs the owner's merge.**

## Next, in order
1. After #268 merges: open the answer's pull request (decisions/questions/P-002-plan-place.md added, questions/P-002-plan-place.md deleted, plus session lines only, so asks-merge can merge it). If the local branch is gone, rebuild it from the text below.
2. Watch the research runs Q-017 to Q-021; read each memo and source check as they land. Q-018's private-repository counts go to a role with a shell.
3. **The tools change (ruling B)** in Personal-Org-Operating-Model, under its own AGENTS.md: a new frozen spec (next free id after S-034), written to the spec template and plan-reviewed there (plan stop rule, D-044/S-030), built by `tools-builder`. Scope to settle in the spec: a repository holds one plan document per project item (where the files live, how docs/PROJECT.md stays the first item's); the definition-of-ready check, the timeline's standard-milestone marks (`file_part`, `_state`, Discovery-2 and Discovery-7), the milestones and trace checks, and the Critic's `dor-dispatch` brief each read the item's own document; the model text (§4, D-052 "One project document"); the template; the desk's project page (src/lib/projectpage.js) reading each document. Model-Lab's LL-16 needs the same.
4. Then the desk's adoption (R3 here, owner approval), then the project request for the briefing work and its brief in its own document.
5. Model-Lab: update LL-16 with the ruling (options brought; owner chose B on 2026-11-03, Service-Desk decisions/questions/P-002-plan-place.md). Every Model-Lab pull request needs the owner's merge (LL-33).

## Working rules carried forward
- As before, plus: **question and session files are the Chief of Staff's surface (commit as `chief-of-staff`); review records are the Orchestrator's (commit as `orchestrator`).** Mixing them in one commit fails `surface_guard diff`.
- Locally, `record_checks merges` fails on a test merge commit made in the session; CI does not see it.
- Session lines for a resumed helper log only the increase in tokens, with no extra fields.

## The answer record's text (for step 1)
See decisions/questions/P-002-plan-place.md on branch cos/p002-plan-place-answer. First line: `Ruling: B — the briefing work's plan gets a plan document of its own in this repository, after a change to the model's tools lets a repository hold one plan per project`; then `Question: questions/P-002-plan-place.md`, the Milestone line, the three options as put, how it was answered (filed in PR #268 after the Critic's three checks; put in session session_01QBwHGJtoNqbcm5CHZ4r84S on 2026-11-03 by the question tool once #268 was open; the owner chose "B: own plan, tools first (Recommended)", which maps to option B; reversible), `## The owner's words, verbatim` with "B: own plan, tools first (Recommended)", and `## How it is carried out` (steps 3 to 5 above).

## Token checkpoint
The Critic used about 96,000 tokens across its three rounds in this session (sessions/chief-of-staff/session_01QBwHGJtoNqbcm5CHZ4r84S.jsonl). This session's own use and the plan's remaining allowance were not read at this handoff.
