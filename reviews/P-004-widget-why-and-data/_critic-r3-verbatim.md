# Critic, round 3, verbatim — questions/P-004-widget-why-and-data.md (2026-11-04)

**Verdict: PASS.** No blocking findings. There is 1 non-blocking finding, and it should be fixed before merge: the fix is to move one line.

I checked every quote character by character against /home/user/Service-Desk/docs/handoff/2026-11-04-chief-of-staff-widget.md, and each one matches:
- **Line 8 (A) and line 9 (B):** the labels and descriptions match handoff:45 and :79-82.
- **Line 17:** the question matches handoff:43-45, and the answer matches :46.
- **Line 18:** the question matches :41-42. The three labels match :42-43 and their descriptions match :76-78. The answer matches :43.
- **Line 19:** the question matches :58-61. The first option and its description match :61-65. "Drop the quotes, one check" and "Pause P-004" and their descriptions match :83-86. The answer matches :65-66.

**The rest of the standard:**
- **Template form and AGENTS.md §5:** the `Milestone:` line, `## Context` and every header field are present.
- **Options carried as put:** they now go first and are recorded exactly. This answers round 2's finding 2 and mirrors P-001, whose record keeps "Options, as put" (decisions/questions/P-001-card-recommendation.md:6-9).
- **D-019, all seven parts:**
  - The recommendation (line 11) now carries the backup point, which resolves round 2's finding 4.
  - What happens if the owner doesn't decide is on line 13, plus line 6, which tells the owner not to answer again. That resolves round 2's finding 7.
  - The checker is on line 14.
- **Plain English (AGENTS.md §4):** WHY opens with the failure. It now explains "the Critic" and "Design gate", which resolves round 2's finding 6.
- **Other lines:**
  - The backup point on line 23 is marked as not ruled, and its citation is right (reviews/P-004-brief/_critic-r3-verbatim.md:53-57; handoff:69-70).
  - All four Context bullets check out. PROJECT.md:165-166 says what bullet 2 claims, the three handoff headings in bullet 3 exist, and P-001:16 has the heading bullet 4 cites.
  - The claims on line 6 hold: three FAILs, and the one blocker was the Chief of Staff's own (r3:3, :25), with 7 non-blocking points (r3, findings 2-8).
- **Reader:** src/lib/sandbox.js:745-772 splits the options as lettered A and B, with recLetter "A".

**Round 2 resolved:** findings 1-7. Finding 1 is fixed by the handoff's correction section. Findings 2, 3 and 5 are fixed by carrying the options and the third question as put, and dropping the glosses.

## Blocking
None.

## Non-blocking
1. **Line 10: "     Both options are as put to you, word for word (the keychain is the iPhone's built-in password store). Nothing is added to them; the one point raised since is set apart below."**
   - **What is wrong:** the line is indented 5 spaces, so it sits inside the OPTIONS block. optionsBlock (sandbox.js:717) takes every line that starts with two spaces. questionQuestions (:752-754) then treats any line indented 3 or more spaces as a continuation of the item above.
   - **The effect:** on Waiting, option B's choice text gets both sentences added to its end, keychain gloss included. So the desk's own reader shows B with words that were never put, right next to the claim "Nothing is added to them". The lines that will be copied into the answer record's "Options, as put" also hold the gloss.
   - **Why it is not blocking:** the quoted text of A and B is exact, and no ruling is misrecorded.
   - **The fix:** move the line out of the block, for example to start in column 0 after line 9, or into WHY. The Chief of Staff must also not copy it into "Options, as put" in the answer record.
   - **Stage:** card drafting (Chief of Staff; questions/_TEMPLATE.md OPTIONS form).

This is not a finding: the options as put give no cost or reversibility for each option, which D-019 asks for. They cannot be added without breaking "as put". The card gives reversibility on line 12 and sets the one later point apart on line 23, which is the right way to handle it.

**Self-implication flag (D-050):** none. Line 10 is new in this draft. Round 2's reader check covered a draft without it.
