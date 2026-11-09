# Ruling needed: let the Check author's tests pass the scope check, so the card fix's build can start

Milestone: M4

WHY: The Check author wrote the card fix's locked tests twice, and both times the record step refused to push them, because the scope check judges its files against the spec's list of areas the build may touch, and that list names only where the build's code goes. The Definer was given its own lane for the same reason (model S-019); the Check author never was, and this is the first time a Check author has run on this desk. Until this is fixed, every retry ends the same way, and the build cannot start.
OPTIONS:
  A. Approve a small fix to the scope check: the Check author's commits are bounded by its own surface (tests/acceptance/** and checks/**), as the Definer's are, with a ledger entry and the change raised in the operating model too. Then answer the failure card `retry`. No spec change and no new criteria card. About 15 lines in one file; the model's 14 Definer-lane tests pass with it, and it turns the replayed refusal into a pass.
  B. Answer the failure card `re-specify`: the Definer writes a new spec that adds the two test folders to the areas touched. Fixes this project only, adds another round of spec, plan review and likely a new criteria card, and leaves the gap for every later project.
  C. A one-off ledger ruling that widens S-005's areas to the two test folders, then `retry`. It has to be written on the item branch, which only the Orchestrator writes, so it needs an Orchestrator session; fixes this project only.
RECOMMENDATION: A — it fixes the cause where it lives, costs one small reviewed change, and needs no spec or card rework.
RISK CLASS: R3 (governance/**)   REVERSIBILITY: reversible (one revert)   BLAST RADIUS: the scope check for every spec-scoped Check author commit on this desk; nothing in the desk's pages or notices
DEFAULT: none (R3 needs your approval)   TIMEOUT: none

## Context
- The second Check author run finished its session, then the record step refused it: "v3_checks.py scope on 75b9f32ce40f..a1dbba69bf0e (build/check-author/S-005) failed", 18 paths under checks/S-005/ and tests/acceptance/S-005/ "outside the Areas touched of S-005", "nothing of it is pushed, its outcomes are errors" (source: orchestrator run 42550532232, commit job log)
- Both Check author runs ended as errors, at 01:41Z and 02:34Z (source: status/outcomes.jsonl)
- S-005's areas touched are src/lib/**, src/public/**, tests/desk/**, docs/handover/** (source: specs/S-005.md:166 on item/P-003)
- The Check author's surface is tests/acceptance/** and checks/** (source: governance/SURFACES.md:62-65)
- The scope check bounds only the Definer by its surface; every other builder is held to the spec's areas touched (source: governance/checks/v3_checks.py:219 and :1770-1820, model S-019 AC1)
- No Check author commit has landed on this desk before; there is no checks/ folder on main (source: the main branch's tree)
- An earlier scope refusal was settled by an owner ruling and a ledger entry (source: docs/LEDGER.md, L-0014)
- With the fix, a replayed Check author commit on item/P-003 passes the scope check, and the model's Definer-lane tests pass (source: the Chief of Staff's notes for this card, decisions/P-003/failure-10-notes.md)
