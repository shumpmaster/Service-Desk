# P-003: a dry run of the Design gate's Critic on case 2 (draft 1), the Critic's return verbatim

*Run by the Chief of Staff on 2026-11-06 (session session_01QBwHGMavRvwjEf9y3DrDd6): a fresh read-only Critic session (role critic-gate), told to read only a pack assembled from the manifest of the real gate Critic's run on case 1 (reviews/P-003/_control/0-1878cff4d3db.json on item/P-003), so including docs/gates/_GATE.md, with case 2, the owner's hold record and the case-1 Critic record added, the item branch's records overlaid and the Chief of Staff's notes left out; its brief was that run's brief with the case's number changed and the earlier round named. Not the session runner's pack and not a pipeline verdict. It was told that the milestone block's missing dor-3 decision line is known, and that the desk's form check passes the case. Its return follows, unchanged.*

---

## The Critic's independent view

The fix itself is ready to move into Design. The brief passed its readiness check (reviews/P-003/_critic-dor.md, PASS; dispatch log line 129). It adds $0 of spend at tier T1. Each of the four risks in the plan has a rule that answers it (docs/projects/P-003.md:102-105). Case 2 fixes most of what case 1 got wrong: it is within the word limit, it has the standard visuals, and it drops or corrects case 1's three weak citations.

**Word count.** By the rule in docs/gates/_GATE.md section 1 (citations, visuals, captions, headings and instruction lines left out, and text alternatives left out as you said), sections 1 to 8 come to about 299 words. Section by section: 1: 46, 2: 24, 3: 30, 4: 38, 5: 36, 6: 20, 7: 31, 8: 74. That is within 350. If the text alternatives were counted, it would come to about 425 and break the limit. The form says "visuals", so I took the text alternatives as part of them.

What still stands between this case and the ruling the owner asked for:

1. **M4 is still not shown as the owner would approve it.** The owner held case 1 partly because it "does not show the milestone … I am asked to approve" (decisions/P-003/dor-3.md:3). Section 8, line 81 quotes M4's name exactly, but gives a shortened "done when" and a reworded why.
   - The "done when" leaves out three of the line's conditions (docs/projects/P-003.md:44): "a card shown that way takes the recommendation once the notes arrive", "on the desk's preview" and "with its tests".
   - The why "twice you answered against unmarked notes" is looser than the recorded why, which says the owner answered `re-specify` where the notes said `drop`, and that the desk never reads the notes.
   - So the owner would approve a summary, not the line. Quote the line whole. The appendix is not counted, so it can go there, with section 8 pointing to it.
2. **"Your time: none" (section 6, line 66) overstates.** Line 90 says none *to run it*, and the visual on line 70 says exactly that. But the owner still rules the Design, Build and Launch gates, accepts M4, and approves any change to the notification sender (lines 71-72). Each miss is also reported to the owner (line 90).
3. **The phase visual (lines 8-12) draws four phases.** The form's standard visual is "the six phases, with this gate marked (S-024)". The text alternative's "the desk's four phases" is not said by any record its caption cites (:61, :88, _critic-dor.md). This does not block, but it departs from the form.

**The Critic's recommendation:** hold. The substance supports proceeding. But the owner held case 1 because it did not show the milestone they are asked to approve, and this case still shows only a shortened version of it. Quote M4 whole and correct the owner-time line, and I would expect the case to support proceed. This is not a reason to redo Discovery.

**Citation check:**
- **Section 8, line 81.** M4's "done when" and why are given as summaries that leave out conditions of docs/projects/P-003.md:44 (see item 1 above). The record does not say the shortened version.
- **Section 6, line 66.** "Your time: none" cites :90, which says "none to run it", and the cost of the owner's rulings in line 71 is left out.
- **Section 6, line 66.** "Usage: per helper run, no total" cites research/P-003-sizing-findings.md:3. That line records a number, 91,414 tokens for the one helper run, and the case does not give it. The form asks for usage so far where the records hold it. "Per helper run" will not mean much to a non-expert.
- **Section 1, line 6.** "Proceeding moves it into Design" cites :61, which is Design-6 about the plan approved at the Build gate. Line 61 does not say it; line 3 (moving out of Discovery on the owner's approval) does. The rest of the line is supported by :61 and :71.
- **Section 1, line 15.** "Each risk has an answer" cites only :102, which covers one of the four risks. Lines 102-105 support it.
- **Section 1, lines 12-13.** The visual's "four phases" is not in any cited record, and the form asks for six (see item 3 above).
- **Section 4, line 48.** "No date is recorded" cites :44. That line simply has no date, so it stands for an absence rather than stating one. A record that says no date is set, or "not recorded" with no citation, would be cleaner.
- **Section 5, lines 59-62.** Each risk matches :102-105. The form also asks where each risk stands now, and the lines don't say. "You told twice" (line 61) is not plain English; it means "you are told twice".
- **Section 8, line 83.** "The standard lines you ruled" is in the past tense. decisions/questions/P-003-standard-lines.md:19 says they are "ruled again with P-003's Design gate", so this ruling carries them. "The rest taken on" doesn't name the eleven, though section 4 describes Design's in words.
- **Supported, as cited:**
  - Section 1, line 5.
  - Section 2, line 19 (:32, :44).
  - Section 3, line 36 (:97, :99).
  - Section 3's visual (:92: 60 to 90 lines, 8 to 12 tests, about twice).
  - Section 4, line 47 (:56-61).
  - Section 4's dependency visual (:38-40).
  - Section 6, $0, no new data or service, T1 (:79-81).
  - Section 7 (:90, :92).
  - Section 8, line 82 (:86).
  - The appendix:
    - Four readiness runs (error, FAIL, FAIL, PASS) match the dispatch log, lines 114-129.
    - The second resubmit was a proxy, matching dor-fail-2.md:2.
    - Case 1's findings match reviews/P-003/_design-gate-1-critic.md.
    - The four rulings exist as cited.
- **Each visual against its text alternative:** each one matches, and none adds a number its records do not hold. No value is unknown, so nothing needed hatching.
- **The case's form:** it otherwise keeps its form. The instruction lines are deleted, "Nothing needed in Build" is removed, and the case ends with </details>.

**Milestones:**
- **Discovery-2, 5, 7 and 8 read "reached".** The records support it: V6 at :86, the sizing findings, sections 1, 4 and 5 of the plan, and the readiness PASS. Discovery-8's steps match the dispatch log. Its missing decision line for dor-3 is the known gap in this dry run, so I did not judge it. Separately, dispatch log line 134 records that dor-3.md was refused the first time for lacking a `Reason:` line, and card 3 stayed open. The current file has that line.
- **Discovery-1 and Discovery-6 read "not recorded".** They are taken on, and the case says so (appendix line 93). This is not a finding, and neither is claimed reached.
- **Discovery-3 "not reached" and Discovery-4 "not recorded".** Both are skipped by the owner's ruling. The case says why the owner proceeds without them (line 94, citing whys at :50-51). Not a finding.
- **M4 is not in the block.** That is right: it is a Build milestone, and no reviewed and merged pull request could exist for it before this gate. Not a finding.
- **M4's line (:44).** The name and "done when" read as achievements, not tasks, and its why is plain. The fault is only how section 8 presents it (Citation check, first item).
- **The Design standard lines (:56-61).** All six are present, and Design-3's why says why the project can do without it. They are not in the block, which is right before Design starts.
- **Section 3 of the plan** holds a standard line for every Discovery and Design milestone.

Tokens used: not known.
