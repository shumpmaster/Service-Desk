## The Critic's independent view

The case is sound in substance. The plan review passed. The spec changes only AC13, and the changed lines match the owner's ruling in stop-12.md:3. I compared S-007 with the review's account of S-006 and found no unlisted change. The three AC13 cases agree with J6's rules and its worked example (S-007:136). The risks the spec itself flags are all in the case: the 23-test estimate sits one below the stop of 24, the baseline is unchecked until Build, and one unreadable notes file hides every decision card.

Three things need correcting. They are errors in the case's wording and citations, not in the plan.

**The Critic's recommendation:** proceed. The case's recommendation to proceed is supported. The corrections below should be made before the owner reads it, and none of them changes the substance. The remaining risk is the one the case already names. Today's sender and desk behaviour (src/) is outside every pack, so AC9 and AC14 to AC17 can only be tested against a baseline run in Build. Build stops if that run needs a change to src/notify/**.

**Citation check:**
- Section 3, line 38: "Two reading gaps, not the criteria, cost this phase its rounds". The owner's ruling at stop-12.md:1 is `criteria-wrong`, and it fixed AC13, which is a criterion. The case's own line 6 and line 102 say so too. The "not the criteria" claim contradicts the record it cites. Only stop-11 says the criteria were not wrong, and that ruling covered the earlier round.
- Section 5, line 64: it cites `reviews/S-007/plan.md:28`. That file has only 26 lines, so the citation points at nothing. The plan review does list the unverifiable src/ behaviour, but at its last bullet (about line 26).
- Section 1, line 17: "the build has a stop" cites `decisions/P-003/stop-12.md:3`. That line says nothing about a stop rule. The supporting record is docs/projects/P-003.md:113, which the line also cites.
- Section 9, line 99: "failed the Critic three times" cites stop-11.md:3, which does not give a count. The question file only anticipates a third failure.
- Section 9, line 101: "AC13 held two slips already in S-005" is not supported. The cited question says only that the third review found two small slips in AC13. It does not say they came from S-005.
- Section 1, line 15: the diagram caption cites docs/projects/P-003.md:3, which is the document's instruction text, not a phase statement.
- Section 4, line 52: the "five views" at docs/projects/P-003.md:71 point to Build-5, which is the right place. I found no problem there.
- All other claims cite a record that supports them. This covers the size and cost figures, the AC13 text, the two minor Design differences, V6 and the kill criteria. The diagrams' text alternatives match their drawings. No number or trend appears that the records do not hold, and unknowns are marked as estimates or "unchecked".
- I did not check the case against docs/gates/_GATE.md. The pack does not hold it.

**Milestones:**
- M4, "Every decision card shows the Chief of Staff's recommendation, or says it has none", reads as an achievement and has a plain why (P-003.md:46). The case names it as the one milestone this phase delivers. No finding.
- Section 9 lists Design-3 (skipped in the plan), Design-5 and Design-6 as "not recorded". "Not recorded" is never a finding, and none is claimed reached.
- Build-1, Build-3 and Build-4 are skipped, and Build-2, Build-5 and Launch-1 to Launch-5 are taken on, each with a why (P-003.md:65–76). No standard milestone is reported "not reached". The case does not claim any Build milestone as reached. No finding.
- No project milestone is missing a sprint in a way that matters before this gate.