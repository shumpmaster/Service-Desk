# P-003: a dry run of the Design gate's Critic on case 1 (draft 1), the Critic's return verbatim

*Run by the Chief of Staff on 2026-11-05 (session session_01QBwHGKAZuqWeeC6Mst4w88): a fresh read-only Critic session (role critic-gate), told to read only a pack assembled by hand from governance/PACKS.toml's critic-gate paths on the committed tree at 9e6fbf1, with the item branch's own records (reviews/P-003/) overlaid as the session runner does, and the Chief of Staff's notes left out. Not the session runner's pack and not a pipeline verdict. Its return follows, unchanged.*

---

Verdict: FAIL

This was a dry run. I read only inside the pack. The case under review is docs/gates/P-003/design-gate-1-case.md.

There are two blocking findings: a claim its citations do not support (B1), and a phase record that leaves out one of the owner's rulings (B2). The word count, section 1 and the way the milestones are handled all pass.

**Blocking findings**

B1. §1, line 6: "…checked before anything is built; nothing is irreversible [docs/projects/P-003.md:56] [docs/projects/P-003.md:61]."
- Line 56 (Design-1, scenarios) and line 61 (Design-6, built only from a plan the Critic passed and the owner approved) support the first half.
- Neither line says anything about reversibility. A search of docs/projects, decisions/, reviews/P-003 and docs/gates finds "irreversible" only in the case itself.
- This is an uncited reassurance in the section the owner reads first.

B2. Appendix, line 55: "Your rulings in the phase: the plan's place and the standard lines […]". The list is incomplete.
- decisions/questions/P-003-critic-pack-cap.md is also the owner's ruling in this phase. It is dated 2026-11-04, marked "Milestone: Discovery-8", and records "B: raise the limit", which raised the pipeline's total limit to 128 MiB so the Critic's pack fits.
- The form's appendix must hold "the owner's rulings in the phase". As written, the line tells the owner those two were all of them.
- That ruling also explains the run that line 54 leaves out (N1).

**Notes**

N1. Appendix, line 54 says "three readiness checks, the first two failed […] the third passed [dispatch-log/2026-11.jsonl]".
- The cited log shows four readiness dispatches: line 114 at 16:38:43Z ended `"result":"error"` with no verdict (line 115), then FAIL (line 118), FAIL (line 123) and PASS (line 129).
- The milestone block below it shows four "critic stage 2" steps, so the owner sees four steps against "three checks".
- Line 54 also says "each answered resubmit". The second was answered by proxy, at the owner's request (decisions/P-003/dor-fail-2.md:2). True, but unsaid.

N2. §1, line 5 cites decisions/P-003/dor-fail-1.md and dor-fail-2.md for "failed twice". Those records hold only "Decision: resubmit". The FAIL verdicts themselves are in dispatch-log/2026-11.jsonl lines 118 and 123, which §1 does not cite. reviews/P-003/_critic-dor.md now holds only the PASS. The claim is supported only indirectly.

N3. §3, line 19: "The plan's place mattered: it passed only once it had a plan of its own".
- The cited records (the plan-place ruling and the PASS) show the order of events, not the cause.
- reviews/P-003-dor-dry-run/_critic-dry-run-1-verbatim.md, findings 1, 2, 4 and 5, would support the cause better.
- The pipeline's own FAIL texts are not in the pack.

N4. §5, line 33 (Discovery-1 and Discovery-6 read "not recorded"). This is honest: it claims neither milestone reached, and lines 48 and 53 do take both on. Two weaknesses:
- It sits under risks without what would happen, what we would do, or where it stands, which the §5 form asks for.
- "the plan holds both" could be read by a non-expert as "both are done". The plan holds the decision to take them on, and the risks list in §7; it holds no milestone record.

N5. Reading it as a non-expert:
- §§4, 7 and 8 use M4, V6 and T1 as bare codes. V6 is used at line 43 before line 47 explains it.
- "five standard steps" (line 23) are not named.
- "plan review" (line 42) is a narrowing of the plan's "a third readiness or plan-review round fails" (P-003.md:92). Harmless now that readiness has passed, but different.

N6. Gaps against the form:
- §4 has no "who does what" (P-003.md §4, lines 66–72, holds it) and no estimate or "not recorded" for dates.
- §6 has no "usage so far" or "not recorded".
- §8 does not say that approval settles Part 1 and confirms the Part 2 intent (P-003.md lines 3 and 124–126).
- There are no standard visuals (the form lists them; it is not clear they are required).

N7. Word count: by my count, §§1–8 hold about 325 counted words, within 350 but close. §1 opens in plain English, leads with what failed, and has no paths or ids in its words: pass. The milestones block is in §9: pass. I cannot check that the block is exactly what `v3_checks gates` printed, since there is no tool in my pack. Its events match dispatch-log lines 114–130.

N8. No self-implication flag (D-050): nothing here implicates the earlier readiness PASS in reviews/P-003/_critic-dor.md.

## The Critic's independent view

**The Critic's recommendation:** proceed. The brief passed its readiness check on its own plan (reviews/P-003/_critic-dor.md). Its one load-bearing unknown, the size and place of the change, is answered by research/P-003-sizing-findings.md (60–90 lines, 8–12 tests, one list feeding every view). Spend is $0 and the tier is T1 (docs/projects/P-003.md:79–81). Its stop rule is concrete (line 92). Design is where its remaining open behaviour gets pinned down. The case itself needs B1 and B2 corrected before the owner rules on it.

**Citation check:**
- §1, line 6: "nothing is irreversible" is cited to docs/projects/P-003.md:56 and :61, and neither says it.
- §1, line 5: "failed twice" cites decisions/P-003/dor-fail-1.md and dor-fail-2.md, which record only the answer "resubmit". The FAIL verdicts are in dispatch-log/2026-11.jsonl:118 and :123, which are not cited there.
- §3, line 19: "The plan's place mattered" cites records that show the order of events but not the cause.
- Appendix, line 54: "three readiness checks" leaves out the errored first run that the cited log holds (line 115).
- Appendix, line 55: the list of the owner's rulings in the phase leaves out decisions/questions/P-003-critic-pack-cap.md.
- Every other claim cites a record that supports it.

**Milestones:**
- Discovery-1 and Discovery-6 are taken on (P-003.md:48, :53) and read "not recorded". That is not a finding, and the case does not claim them reached. Its wording "the plan holds both" (§5, line 33) should not be read as reached.
- Discovery-3 is "not reached" and was skipped by the owner's ruling (decisions/questions/P-003-standard-lines.md). The case says why (appendix, line 56), so it is not a finding.
- Discovery-4 reads "not recorded" and is skipped: not a finding.
- Discovery-2, 5, 7 and 8 read reached.
- The project's own milestone M4 is in Build and no sprint could exist before this gate: not a finding. Its name and "done when" read as an achievement, not a task.

I can't measure my token use exactly; my estimate is about 70k.
