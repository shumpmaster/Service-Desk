# Ruling needed: let the Critic read the spec a new spec replaces, so it can check "carried forward unchanged"

Milestone: M4

WHY: You ruled that S-006 carries S-005 forward unchanged. The Critic failed S-006's plan review three times, and every round found the same thing: it could not see S-005, so it could not check the claim that nothing else changed, and it fails a claim it cannot check. The Definer reads every spec; the Critic is given only the spec under review. Until this changes, any spec that carries an earlier one forward meets the same wall, and the next card on P-003 would end the same way. The third FAIL sends P-003 to Triage and a stop card.
OPTIONS:
  A. Approve a one-line fix to the list of what each role may read: the Critic may also read specs/** (the superseded specs and the template), as the Definer already does. Includes a ledger entry, and the change raised in the operating model. Its plan review can then compare the two specs line by line. Nothing it must not see (the writers' reports and briefs) is added.
  B. No fix: answer the coming stop card and ask the Definer to drop the "unchanged" claim from the next spec. This breaks the link to your ruling that the criteria were already approved, so the next review may ask for the criteria card's approval again.
  C. Have the Orchestrator attach a diff of the two specs to the Critic's pack. That needs a change to the pack builder's code, not one line, and an Orchestrator session to make it.
RECOMMENDATION: A — it fixes the cause in one reviewed line, and the Critic's third review raised only two other points, both small wording fixes in AC13.
RISK CLASS: R3 (governance/**)   REVERSIBILITY: reversible (one revert)   BLAST RADIUS: what the Critic is shown in every session on this desk; nothing in the desk's pages or notices
DEFAULT: none (R3 needs your approval)   TIMEOUT: none

## Context
- Your ruling on stop card 11 was "checks-wrong", with "Carry S-005 forward unchanged in the new spec" (source: decisions/P-003/stop-11.md)
- The Critic failed S-006's plan review at 20:41Z, 21:16Z and 03:28Z. Each review says specs/S-005.md is not in its pack, so the "unchanged" claim cannot be verified (source: reviews/S-006/plan.md on item/P-003, at 95a631c2, 965e7f6d and the current tip)
- The third review's other two findings are in AC13's wording: its sample is said to hold two cards but a third is tested, and case (a) says "a day later than that" with no "that" (source: reviews/S-006/plan.md on item/P-003)
- S-006 differs from S-005 in 14 lines (14 changed, none added), which hold its id, its supersedes line, the marks that name it and one Risks item (source: git diff of specs/S-005.md and specs/S-006.md on item/P-003)
- The Critic's pack must read specs/{spec}.md and may read no other spec; the Definer may read specs/** (source: governance/PACKS.toml, roles critic and definer)
- Rebuilding the Critic's plan-review pack for S-006 gives specs/S-006.md only before the fix, and specs S-002 to S-006 with the template after; no other file changes (source: session_runner.py pack, run by the Chief of Staff in this session)
- After the third FAIL, the item goes to Critic-triage and then a stop card (source: governance/ROUTING.toml, routes third-fail and triage-return)
