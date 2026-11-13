# Chief of Staff's notes — P-005 dor-fail-1

**Recommendation: `resubmit`, once draft 6 of the plan is on main.** This card's `resubmit` may be
given by the Chief of Staff (governance/ROUTING.toml, [gates.dor-fail]), so the owner need not answer
it; the Chief of Staff gives it in a record of its own after the revised plan merges. This is P-005's
first FAIL; a third sends it to Triage and a stop card, so the plan was dry-run twice on the real pack
before resubmitting, and both passed.

## The real check's findings, and where each is answered
The readiness check's return (reviews/P-005/_critic-dor.md, on the item/P-005 branch, run
gha-43360877990-1, 03:50 UTC) is a FAIL. It passed the milestones, the standard lines, section 9 and
the four rulings the plan quotes.
1. **The experiments ruling was stale in the plan.** Draft 5 was written before the owner answered
   "A: Run both (Recommended)" (decisions/questions/P-005-experiments.md), and still called the question
   "to be filed". Draft 6 cites the ruling in its header, in section 7's experiments list, in its open
   list and in the list for the Design gate.
2. **Citations the check could not verify.** Two kinds:
   - Records that were in the pack but the Critic did not open (docs/PROJECT.md, the library entries,
     decisions/questions/P-005-groundwork-shortlist.md): checked against the run's control file, all
     were in the pack. No change needed; the dry runs opened and confirmed them.
   - Records outside the pack (the operating model, AGENTS.md, governance files, the ledger, the
     handovers, the desk's spec, the intake records, the portfolio's basis and kickoff, one Model-Lab
     record). Draft 6 marks each "outside the check's files", cites an in-pack record beside it where
     one exists (answer 11 for the taken-in desk work; the reading ruling for T1 and the key's added
     permissions; the vendor-pages ruling in place of the source standard), drops one that was not
     needed (the ledger's L-0012 beside docs/design/README.md), and says so in a new header note.
- **Open question: where the lasting-copies records change sits among the milestones.** Draft 6 says it
  serves M7's reach back through the whole life of the work, and is not one of M6's record changes;
  without it, M7 shows results past 90 days as no longer kept. Milestones themselves are unchanged
  (they are the owner's at the Design gate).
- **Dry run 1's observation 1** (the alert route and the stopped-feed check had no fallback): each now
  has one, going back to the owner at the Design gate.

## The dry runs (fresh Critic helpers, the real pack built by the session runner)
- Dry run 1, about 04:25 UTC: PASS (reviews/P-005-dor-dry-run/_critic-dry-run-1-verbatim.md).
- Dry run 2, on draft 6 as filed, about 04:29 UTC: PASS
  (reviews/P-005-dor-dry-run/_critic-dry-run-2-verbatim.md).

## Next
1. Draft 6 and these records merge (a records-only pull request, by proxy under L-0049 once its checks
   are green). 2. The Chief of Staff answers `resubmit` in decisions/P-005/dor-fail-1.md. 3. The next
   Orchestrator run sends the check out again; if the loop has stopped, a run is started by hand.
