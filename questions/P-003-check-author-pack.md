# Ruling needed: let the Check author read its own tests when the Critic sends them back

Milestone: M4

WHY: The Critic failed the card fix's tests and sent them back for revision, but the pipeline gave the Check author a folder without the tests in it. It could not read what it was asked to fix, so it changed nothing and wrote down the fixes it would make. The run still counted that as done. Until this is fixed, every revision round ends the same way: the unchanged tests go back to the Critic, it fails them again, and after the third fail you get a stop card. The build cannot start. The list of what each role may read lets the Critic read the tests, but not the Check author that wrote them.
OPTIONS:
  A. Approve a two-path fix to that list: the Check author may also read tests/acceptance/** and checks/** (the same two paths the Critic and the Builder read; sealed holdouts are always left out). Includes a ledger entry, and the change raised in the operating model, whose template has the same gap. The Check author's next round then sees its tests and the Critic's findings together. The desk's code stays hidden from it.
  B. Make no fix now: let the rounds run out and answer the stop card when it comes. This costs two or three wasted rounds and fixes nothing, so the next revision on any project hits the same wall.
  C. Fix it in the operating model first and bring it here with the next model sync. That is the cleanest path, but slower, and P-003 waits until then.
RECOMMENDATION: A — it fixes the cause where it lives, in one reviewed line, and needs no spec or card rework.
RISK CLASS: R3 (governance/**)   REVERSIBILITY: reversible (one revert)   BLAST RADIUS: what the Check author is shown in every session on this desk; nothing in the desk's pages or notices
DEFAULT: none (R3 needs your approval)   TIMEOUT: none

## Context
- The Critic failed the locked checks with four findings, and the route sent them back to the Check author to revise (source: reviews/S-005/_critic-checks.md on item/P-003; governance/ROUTING.toml, route checks-fail)
- The Check author's round-2 session reported "I made no changes ... None of the files I'm asked to revise are in this folder. Nothing exists under `tests/acceptance/` or `checks/`" (source: docs/reports/P-003-check-author.md on item/P-003, run 42640235485)
- Its outcome was recorded as `ok` (source: status/outcomes.jsonl, session P-003:checks-fail:2026-11-09T15:00:35Z)
- The Check author may read only the spec, its ruling, the library and the playbooks, plus the Critic's findings. The Critic, Builder and Reviewer may read tests/acceptance/** and checks/** (source: governance/PACKS.toml:36-78)
- Rebuilding the Check author's pack from item/P-003 gives 4 files before the fix. With the two paths added, it gives 22, including all 15 scripts in tests/acceptance/S-005, both READMEs and checks/S-005's mutants and rubric, and still no src/ (source: session_runner.py pack, run by the Chief of Staff in this session)
- A pack is built from the default branch's tip plus the item branch's own changes, so a fix on main applies to the next pack (source: governance/checks/orchestrator_git.py build_tree)
- After a third FAIL, the item goes to Critic-triage and then to a stop card (source: governance/ROUTING.toml, routes third-fail and triage-return)
