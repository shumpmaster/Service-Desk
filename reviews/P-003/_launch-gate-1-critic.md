*The gate Critic's independent view of the Launch gate's case 1 (P-003), round 3 of 3, 2026-11-22, verbatim. A fresh Critic (role critic-gate), read-only, dispatched by the Chief of Staff, session_01QBwHGLJhqD3tRfLqA4zdvm, on the case inside questions/P-003-launch-gate.md as it stood at that round. Recorded as `orchestrator` (L-0051). The case was left unchanged after this round; this view is also below the case in the question file.*

## The Critic's independent view

**The Critic's recommendation:** proceed. Nothing blocks going live. Both reviews passed with nothing blocking (reviews/S-009/_reviewer-build.md:7, reviews/S-009/reviewer.md:3). You accepted M4 on the preview (decisions/questions/P-003-preview-acceptance.md:1). The fix can be rolled back (docs/handover/P-003/operating-notes.md:135-143). Before you rule, you should know four things the case leaves weaker than its records:
- **The weekly check sees only half of target V6.** It can catch a card held too long. It cannot catch a card shown with no mark, which only the tests guard (operating-notes.md:131-133). Section 4 line 53 suggests it checks both.
- **"Both should be fixed first" is unclear.** In section 5 line 61, "first" should mean before the first weekly count, not before going live. The review asks the first point as a question and says the second matters only if the script is reused unchanged (reviewer.md:91, :103).
- **The lessons for the operating model are late.** The plan says they are recorded at handover (docs/projects/P-003.md:76, :85). The handover has passed and they are not filed. The record the case cites for filing them later does not say that.
- **Several open differences between views are not in the risks.** Details are below.

**Citation check:**
- **§1 line 30:** "Skipped, as ruled" fits hidden tests (decisions/questions/P-003-hidden-tests.md:1). For experiments it cites only the plan's own Build-4 line (docs/projects/P-003.md:70), not a ruling. The ruling that settled Build's lines is the Build gate answer, decisions/questions/P-003-S-009-criteria.md:11, which the case does not cite.
- **§1 line 31:** "miss reports" has no cited line. The handover's line for them is :100, not :94, :107 or :114.
- **§1, plain words:** the section does lead with what was skipped and what has not run. It never says outright that you are asked to approve the go-live and the graduation together; line 35 only implies it.
- **§3, form:** at the Launch gate the form puts the lessons for the operating model in this section. The case puts them only in the appendix (line 92).
- **§4 line 53:** "(no card unmarked or held over a day)" overstates the weekly check. The count cannot find a card shown with neither mark (docs/handover/P-003/operating-notes.md:131-133; handover.md:92-93). The case's own §1 line 34 says this.
- **§5 line 59 (N1):** carried, with what to do. It does not say where the risk stands.
- **§5 line 60 (N2):** roughly carried. "a broken copy did report them" is unclear to a non-expert; the record means a deliberately altered scratch copy, the negative control (reviewer.md:47). It gives no consequence or action.
- **§5 line 61 (N3, N5):** "both should be fixed first" is not what the records say. reviewer.md:103 is an open question about N3 alone, before the first weekly run. For N5, reviewer.md:91 says only that it matters if count.mjs is reused unchanged. The line names no owner and no timing. N5's wording point ("has left queue/", operating-notes.md:120) is not carried.
- **§5 line 62 (N6):** carried, but "against its rule" means nothing to the owner. It gives no consequence, action or status.
- **§5, form:** most lines lack what would happen, what we would do, and where it stands now.
- **§5, join-up differences not fixed and not carried:**
  - Build review N5: during a first read still arriving, decision cards are hidden with no line saying so (reviews/S-009/_reviewer-build.md:84). This is close to the plan's "a card silently missing from the queue" (docs/projects/P-003.md:151).
  - Build review N4: the portfolio card sheet still shows a section-5 "Recommended" line (_reviewer-build.md:83).
  - The sheet's "Recommended The Chief of Staff recommends <word>" wording (_reviewer-build.md:89; reviews/465/design-reviewer.md:67).
  - The live desk running different code from the main branch, which the weekly count reads (handover.md:61-62).
  - Launch review N4 (handover.md:149, reviewer.md:85-87) and N7 (reviewer.md:93) are also unfixed. They are package defects, not join-ups.
  - Open question 1 is answered in §1 line 32 and the appendix (line 90), which is enough.
- **Appendix line 91:** the claim that "the outside-build plan you approved files them with the launch records after this ruling" is not in decisions/questions/P-003-outside-build-plan.md:1, which says only that the plan is approved as written. "They do not bear on going live" cites nothing. Both P-003.md:76 and :85 put the lessons "at handover".
- **Appendix line 92:** the third lesson cites reviewer.md:60, which holds only the old and new first lines. The rule that a record must start "Ruling: accept" is at :61.
- **Appendix line 95:** the cited P-001 Critic line (reviews/P-001/_launch-gate-1-critic.md:20) supports "only where they help". It does not support "the case sits inside a question, read as text", which cites nothing. _GATE.md names a standard visual for sections 1 to 4, 6 and the appendix, so leaving them all out is a departure from the form. The case gives its reason for it.
- Every other claim cites a record that supports it.

**Milestones:**
- **The empty milestone block:** consistent with the brief's statement that the timeline holds no Launch gate run for P-003. I could not run `v3_checks gates` to confirm it.
- **M4:** its reached date of 2026-11-22 and its sprint, PR #465, match docs/projects/P-003.md:46 and decisions/questions/P-003-preview-acceptance.md:1. The name and "done when" read as an achievement. Not a finding.
- **Build-1, Build-3, Build-4:** skipped by the owner's ruling, through the hidden-tests answer and the Build gate answer (P-003-S-009-criteria.md:11). Not a finding. As noted above, the case cites only the plan line for Build-4.
- **Build-2 and Build-5:** the case says only "taken on". It never says whether they were reached, and cites no evidence for them. The records show both met: built to the frozen spec with its checks passing (_reviewer-build.md:7-9, :24-27), and the views checked as one list (:37-38). This is a gap in the case, not in the work.
- **Launch-1:** comes with this ruling. Not a finding.
- **Launch-2 and Launch-3:** backed by the launch review's pass of the handover package (reviewer.md:11). The "Who does what" table's Reviewer row is still unsupported (N4, handover.md:149).
- **Launch-4:** stands in part, by the plan's own line (P-003.md:75, "set out beside it for after launch"), as the launch review asked (reviewer.md:34, :101). It is not claimed reached. Not a finding.
- **Launch-5: finding.** It is not reached: the lessons, due "at handover" (P-003.md:76, :85), are not filed. The case gives a reason to proceed without them, but that reason rests on a citation that does not say it (appendix line 91). The graduation itself comes with this ruling.

Files relied on:
- /home/user/Service-Desk/questions/P-003-launch-gate.md (the case only)
- /home/user/Service-Desk/docs/gates/_GATE.md
- /home/user/Service-Desk/docs/projects/P-003.md
- /home/user/Service-Desk/docs/handover/P-003/handover.md
- /home/user/Service-Desk/docs/handover/P-003/operating-notes.md
- /home/user/Service-Desk/reviews/S-009/reviewer.md
- /home/user/Service-Desk/reviews/S-009/_reviewer-build.md
- /home/user/Service-Desk/reviews/465/design-reviewer.md
- /home/user/Service-Desk/reviews/464/reviewer.md
- /home/user/Service-Desk/reviews/P-001/_launch-gate-1-critic.md
- /home/user/Service-Desk/decisions/questions/P-003-hidden-tests.md
- /home/user/Service-Desk/decisions/questions/P-003-preview-acceptance.md
- /home/user/Service-Desk/decisions/questions/P-003-outside-build-plan.md
- /home/user/Service-Desk/decisions/questions/P-003-S-009-criteria.md
- /home/user/Service-Desk/decisions/questions/P-003-S-014-criteria.md
- /home/user/Service-Desk/decisions/questions/P-003-launch-lines.md
- /home/user/Service-Desk/status/P-003.toml
