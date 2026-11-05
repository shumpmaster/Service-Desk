# questions/P-003-standard-lines.md: the Critic's cold reading, round 2, verbatim

*Run by the Chief of Staff (session_01QBwHGKpfNMbQeEnVRHpmEe) on 2026-11-05, after round 1's findings were answered (Design-5 taken on, citations corrected, "you asked" removed, DEFAULT A with a 72-hour timeout). Its note 7 was then applied to the Design-3 line word for word. Recorded by the orchestrator.*

Verdict: PASS

**Summary.** Round 2 fixes the three blocking findings, and the question is now fit to go to the owner. The WHY opens with the earlier failure and what a third failure would mean. It has no paths or ids, and it no longer says the owner asked for these lines: it says the readiness check's notes call for the owner's ruling. Option A now skips three steps, and each reason holds against the records. The design join-up review, which the Build gate needs, is now taken on, and the count is "eleven" everywhere. Default A with a 72-hour timeout fits the rule for reversible questions. One small wording point remains in the plan.

**Findings**

1. **Fixed (was blocking): Design-5 is now taken on.**
   - The plan line (docs/projects/P-003.md:60) names the five views the fix changes and says the Build gate carries the review. That matches docs/design/JOIN_UP_REVIEW.md:3-7, Personal-Org-Operating-Model/OPERATING_MODEL.md:201 and P-003.md:39.
   - Option A is recounted to eleven taken on and three skipped (questions/P-003-standard-lines.md:5, 7-9).
   - Option A's cost line, "no check or gate needs them", is now true:
     - Discovery-3 needs only a reason why no map was needed, and section 7 gives one (P-003.md:97).
     - Discovery-4 and Design-3 show as "not recorded" in the model's table (OPERATING_MODEL.md:156, 163).

2. **Fixed (was blocking): the citations are now right.**
   - "No unknown left open" now cites the plan's section 7 (question:20; P-003.md:107).
   - 60 to 90 lines in five files now cites the sizing's section 7 (question:21; research/P-003-sizing-findings.md:59).

3. **Fixed (was blocking): "you asked" is gone.**
   - The WHY (question:5) and Context bullet 2 (question:18) say the readiness check's notes call for the owner's ruling. That is true (decisions/P-003/dor-fail-2-notes.md:17-19).
   - Context bullet 1's "a third failure leads to Triage and a stop card" is true (dor-fail-2-notes.md:6-7).

4. **Fixed: the WHY now opens with the failure** (question:5).

5. **Fixed: "days of work" is cut** (question:10).

6. **Consistent with AGENTS.md §5: RISK CLASS, REVERSIBILITY, DEFAULT and TIMEOUT.**
   - R0, reversible, DEFAULT A, TIMEOUT 72 hours (question:13-14), in line with AGENTS.md:76-77.
   - The stated reason is true: the lines are ruled with the Design gate, and until then a change needs only the Critic's check (OPERATING_MODEL.md:122).

7. **Non-blocking: Design-3's why in the plan still credits the sizing with "no unknown".**
   - It reads "the sizing left no unknown that needs an experiment (section 7)" (P-003.md:58).
   - The sizing itself left open points (sizing:66-71). The plan closed them with rules in section 1, and it is the plan that says no unknown is left (P-003.md:107).
   - Suggested wording: "the sizing's open points are settled by the rules in section 1, and no unknown is left that needs an experiment (section 7)". Changing a why is a rewording, so the new line needs the Critic's check.
   - The question's own wording of this skip is already right (question:7).

8. **Checked and true:**
   - The three skips match their places in the model's table and the plan's `skipped` lines:
     - Discovery-3 (OPERATING_MODEL.md:155; P-003.md:50);
     - Discovery-4 (OPERATING_MODEL.md:156; P-003.md:51);
     - Design-3 (OPERATING_MODEL.md:163; P-003.md:58).
   - Every standard line is in the model's form (P-003.md:48-61).
   - Context bullets 3, 6 and 7 are true against their sources:
     - Bullet 3: P-003.md:46-61.
     - Bullet 6: OPERATING_MODEL.md:122, 149.
     - Bullet 7: JOIN_UP_REVIEW.md:3.
   - M4's reworded why (P-003.md:44) is supported by the sizing:
     - section 2, sizing:19-21;
     - the two `re-specify` answers, decisions/Q-017/stop-2.md:1 and decisions/Q-019/stop-1.md:1.

## The Design-3 line after note 7 was applied: the Critic's line check, verbatim

Verdict: PASS

The reworded line is in the model's form and has a plain why, with no ` · ` inside the reason: "- Design-3 (standard) · skipped · why: the sizing's open points are settled by the rules in section 1, and no unknown is left that needs an experiment (section 7)" (docs/projects/P-003.md:58).

Its facts hold. Four of the sizing's five open points (research/P-003-sizing-findings.md:66-71) are settled by rules in section 1 (P-003.md:15, 18-21): the notifications, a card with no raise time, the different forms of notes, and the lost section-5 mark. The fifth, the second file to change, is not a rule and not an unknown; it is covered as a place to build in section 3 (P-003.md:39) and section 7 (P-003.md:97). Section 7 says no unknown is left open (P-003.md:107).
