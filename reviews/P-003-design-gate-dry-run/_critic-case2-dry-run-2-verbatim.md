# P-003: a dry run of the Design gate's Critic on case 2 (draft 2), the Critic's return verbatim

*Run by the Chief of Staff on 2026-11-06 (session session_01QBwHGMavRvwjEf9y3DrDd6) in the same Critic session as round 1 (_critic-case2-dry-run-1-verbatim.md), resumed, so not cold; the same pack, with the revised case, and a message listing what changed. Not a pipeline verdict. After this return the case changed only as the return suggests: the phase picture draws all six phases and cites docs/design/references/comments-2026-10.md:31-32, the end date gives its year, and the stop rule says "a third readiness or plan-review round". Its return follows, unchanged.*

---

## The Critic's independent view

Case 2, as revised, now gives the owner what the hold asked for (decisions/P-003/dor-3.md:3).
- **M4:** the appendix (line 96) quotes M4 whole. I checked it word for word against docs/projects/P-003.md:44, and it matches, including the name, the full "done when", the phase and the why. Section 8 points to it.
- **Design steps:** section 4 says what each Design step does. Section 8 says the standard lines are ruled again at this gate, with eleven taken on and three skipped, and names the three.

The substance holds:
- The brief passed its readiness check (reviews/P-003/_critic-dor.md; dispatch log line 129).
- The fix adds $0 of spend at tier T1 (:79-81).
- Each of the four risks is answered by a rule in the plan (:101-105).
- The case says plainly that the sizing is not independent of the plan (:97).
- The stop rule and the miss are stated (:90, :92).

**Word count.** I used the rule in docs/gates/_GATE.md section 1, leaving out citations, visuals, captions, headings and instruction lines, and leaving out text alternatives as part of the visuals. Sections 1 to 8 come to about 322 words, within the 350 limit:

| Section | Words |
| --- | --- |
| 1 | 50 |
| 2 | 24 |
| 3 | 30 |
| 4 | 34 |
| 5 | 57 |
| 6 | 39 |
| 7 | 31 |
| 8 | 57 |

One fault is left, and it does not block. The phase picture (lines 8-12) shows four phases, but the form's standard visual is "the six phases, with this gate marked (S-024)". Your note says no desk record names the other two. The pack does hold one: docs/design/references/comments-2026-10.md:31-34 reads "the model has six phases; the desk shows the four it runs, then Done. Operate and Review belong to the product after the Launch gate". That record also shows the owner accepting the desk's four ("No thats okay i wasnt thinking about it."). Two fixes would work:
- Draw all six phases, with Operate and Review after Launch, and cite that record.
- Keep the four and cite the same record as the owner's accepted view.

**The Critic's recommendation:** proceed. The brief passed its readiness check, the fix adds no new spend, data or service at tier T1, and each risk has an answer. The case now shows M4 whole and the standard lines the owner is asked to rule. Nothing remaining in the case would change that ruling.

**Citation check:**
- **Section 1, lines 12-13 (phase visual).** The four phase names are supported by :3 and :71. Its departure from the form's six phases is explained above; a record that names the other two, comments-2026-10.md:31-34, exists but is not cited.
- **Section 8, line 84.** "To 31 December" leaves out the year that :86 gives (2026-12-31). This is minor.
- **Section 7, line 79.** "A third review round" stands for :92's "a third readiness or plan-review round". This is acceptable, but loose.
- Every other claim cites a record that supports it. I checked these in particular:
  - **Section 1:** line 6 (:3, :61, :71) and the recommendation (:102-105).
  - **Section 5:** line 58 (:56, :101) and lines 59-62 (:102-105).
  - **Section 6:**
    - Line 67 (:71 names the three gates and the acceptance of M4; :90 says "none to run it" and that each miss is reported).
    - Line 68 (sizing findings, line 3: 91,414 tokens).
  - **Section 8:**
    - Line 83 and the appendix quote (:44, verbatim).
    - Line 85 (standard-lines.md:19, "ruled again with P-003's Design gate"; _critic-dor.md, "11 are taken on and 3 skipped"; :50, :51, :58).
  - **Appendix:**
    - Lines 92-93 match dispatch log lines 114-129, dor-fail-2.md:2 and _design-gate-1-critic.md.
    - Line 98 matches the four ruling records.
  - **The other visuals:** each drawing matches its text alternative and adds no number its cited records lack. No value is unknown, so nothing needed hatching.
- **The case's form:** it otherwise keeps its form. The instruction lines are deleted, "Nothing needed in Build" is removed, and the case ends with </details>.

**Milestones:**
- **Discovery-2, 5, 7 and 8 read "reached".** The records support it:
  - Discovery-2: V6 at :86.
  - Discovery-5: the sizing findings.
  - Discovery-7: plan sections 1, 4 and 5.
  - Discovery-8: the readiness PASS.

  Discovery-8's steps match the dispatch log. Its missing dor-3 decision line is known and I did not judge it.
- **Discovery-1 and Discovery-6 read "not recorded".** Both are taken on, and the case says so at line 99. This is not a finding, and the case does not claim either reached.
- **Discovery-3 "not reached" and Discovery-4 "not recorded".** Both are skipped by the owner's ruling. The case says so at line 100, citing the whys at :50-51. Not a finding.
- **M4 is not in the block.** That is right for a Build milestone: no reviewed and merged pull request could exist for it before this gate. Not a finding.
- **M4's line.** The name and "done when" read as achievements, not tasks, and its why says in plain words why the project needs it.
- **The Design standard lines (:56-61).** All six are present, and Design-3's why says why the project can do without it. They are not in the block, which is right before Design starts.

Tokens used: not known.
