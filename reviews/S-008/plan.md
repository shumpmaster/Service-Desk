Verdict: FAIL

I could not check the spec's key evidence: no src/ is in the pack. I read specs/S-008.md in full, compared it line by line with specs/S-007.md, and read decisions/P-003/failure-15.md, criteria-13.md and the plan's section 3. The change list in line 11 is accurate. The header `milestones: M4` is in the right form. I have two findings, plus one point that needs the owner.

**Blocking findings**

1. **The spec does not say who makes the baseline record.**
   - The owner's ruling (decisions/P-003/failure-15.md:4) says "the new spec says who runs the Builder's adapter against the unchanged code and how the record is guarded."
   - S-008 only proposes the Reviewer. Line 23 says "proposed: the Reviewer; open question 7, ruled before freeze". Line 216 says "the runner is proposed, not shown". Line 251 says "No role's written duties include running the code and committing the record."
   - The brief (line 256) tells the Builder to wait for "the role ruled in open question 7", which is not a role yet.
   - The Reviewer has no stated duty or lane to do this. S-008 also admits (line 216) that no pack file gives any role the lane. A frozen spec cannot depend on a role that does not exist, so the ruling's instruction is not met.

2. **The baseline guard can be passed without ever running src/.**
   - The Builder writes the adapter (line 23, J7). The Check author may not see src/. The runner's run is "mechanical".
   - Nothing in J7's checks makes the adapter call src/ at all. The checks cover the hashes, whether the record covers every case, and the "gate card on_list" and "sender sends a notice" sanity checks (line 168).
   - An adapter that returns canned or re-implemented outputs would pass every check. It would produce the same bytes on the base commit and on the built code, so AC9 and AC14 to AC17 would pass whatever the build does.
   - Line 234 concedes "No check can show that the run used the base commit's src/." It leaves that to "anyone allowed to read src/", with no named party or step. That falls short of the ruling's "a run the Builder cannot change", because the Builder authors the code that does the run.
   - A fix would add a check that the adapter reaches the code under src/, or a named second party who must confirm it.

**Needs the owner**

3. **Which spec's criteria did the owner approve?** Line 18 admits that decisions/P-003/criteria-13.md ("Decision: proceed") names no spec, and that "to be confirmed". I could not confirm it from the pack either. This does not block the plan review, but it is not settled. The criteria still go to the scenario card.

**Checked and found sound**

- Carry-over claim: apart from the lines listed in line 11, S-008 is the same as S-007. That covers the criteria, the join sheets J1 to J6, the facts, the risks, the stop rule and open questions 1 to 6. Line counts match (231 and 258).
- J7 sits at lines 146 to 171, as line 11 says.
- Dropping the git-history test is consistent with the ruling: line 23 says "no check reads the branch's history".

**Open questions**

- Which role runs the adapter, and does it have a written lane? This must be settled before freeze.
- Who confirms the adapter really exercises src/ at the base commit?
- The spec's stop rule (24 tests) leaves almost no room for J7's checks. They cover hashes, coverage and per-AC comparisons, and line 208 treats them as one test.