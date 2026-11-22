*The gate Critic's independent view of the Launch gate's case 1 (P-003), round 1 of 3, 2026-11-22, verbatim. A fresh Critic (role critic-gate), read-only, dispatched by the Chief of Staff, session_01QBwHGLJhqD3tRfLqA4zdvm, on the case inside questions/P-003-launch-gate.md as it stood at that round. Recorded as `orchestrator` (L-0051). The case was corrected after this round and read cold again.*

## The Critic's independent view

**The Critic's recommendation:** proceed — The build review and the launch review both passed with nothing blocking (reviews/S-009/_reviewer-build.md:7, reviews/S-009/reviewer.md:3-5). The owner accepted M4 on the preview by a record whose first line has the right form and names M4 (decisions/questions/P-003-preview-acceptance.md:1-3). The past-records count was reproduced byte for byte and passed a negative control (reviewer.md:38, :47). Nothing found changes the picture. Before the case goes to the owner, though, it needs these corrections:
- Section 3 claims everything is joined up, but one join is not.
- One risk misstates the negative control.
- Several citations point at the wrong line.
- Section 1 leaves out two of the three things the handover package leads with.
- Section 3 has nothing showing that Launch-5's lessons were recorded.

**Citation check:**
- **Section 1, line 30:**
  - [docs/handover/P-003/handover.md:100] supports only (b), the report of each miss. The feedback route is :107 and the year-end review is :114, and neither is cited.
  - "as you ruled" cites a plan line, docs/projects/P-003.md:75, not the owner's ruling record. The form says "for later work, cite the owner's ruling record". Here that is decisions/questions/P-003-launch-lines.md (A) and decisions/P-003/stop-5.md, with the Build gate's answer in decisions/questions/P-003-S-009-criteria.md:11.
  - The line does answer the launch review's open question 1 (reviewer.md:101): it names Launch-4's "set out beside it for after launch".
- **Section 1, what has not run:** the section leads with what has not run, but it leaves out two of the three things the handover package leads with (handover.md:5):
  - The hidden tests were skipped by the owner's ruling. That is mentioned only in the appendix.
  - The weekly count cannot see a card shown with neither mark, so that half of V6 has no check after launch (docs/handover/P-003/operating-notes.md:131-133). This is not in section 1 or in section 5.
- **Section 3, line 42, "The parts work together":** [reviews/S-009/_reviewer-build.md:9] does not say this. It says there are no blockers and the build matches its record; the one-list join is at :37-38. The claim also contradicts the launch review's join-up note: "The count's record to the desk's value-check reader (J25): not joined (N1)" (reviewer.md:98). Section 5 carries N1, but section 3 states the opposite without qualification.
- **Section 3, line 43:** [reviews/S-009/reviewer.md:79] says "Only 5 were ever judged". The case's words, "5 still open at their due time; none held", are at :81, and "none held" is supported by :38.
- **Section 3, line 44:** the `process.exit(` lesson cites reviews/M3E/_stage-g1-review-r1-verbatim.md:96. That is an earlier item's review, not a record of this phase. It supports the fact, but nothing cited shows it was learned in P-003. Nor does the section cite any record that the lessons were recorded in the operating model's lessons file (see Milestones).
- **Section 4, line 49:**
  - The form requires section 4 to cite the handover package's "Its own monitoring and feedback" section (handover.md:67-114). It cites :146 instead, the "Who does what once live" table.
  - "from launch" is supported by :94, not by :146 or reviewer.md:29.
  - Section 4 does not say how the fix takes feedback or reviews its own value; those appear only in section 1.
- **Section 5, line 55, "a test copy caught one":** [reviews/S-009/reviewer.md:47] says something different. A scratch copy, with the second figure's due time set to one minute after arrival, "reports 39 of 39 held".
- **Section 5, line 56, "widen it before the first weekly run":** :82 does not say this. It is the launch review's open question 3 (reviewer.md:103), put as a question and not decided. The finding's detail is at :83.
- **Section 5, lines 57-59:** these risks give no "what would happen" or "what we would do", as the form asks. Line 57 (N6) gives neither.
- **Section 5, carried items:** N1 (with the join-up note's J25 gap), N2, N3, N6, and the design review's Q1 and Q2 are all carried. Apart from the line 55 and 56 problems above, each is supported.
- **Section 6, line 65:** [docs/projects/P-003.md:89] is the row on the notification sender's files. The owner's gates, the acceptance of M4 and the live deploy are at :88.
- **Section 7:** the form asks for "the project's stop rule and value targets". The stop rule (docs/projects/P-003.md:113) is missing.
- **Section 8:**
  - Line 73: "on your approval of the deploy" is not in :72, which says "by the owner's ruling at the Launch gate". The deploy approval is :88.
  - Line 75: "at $0" is supported by neither :103 nor :98; it is :96.
- **Appendix, line 82:** [docs/projects/P-003.md:66] is a blank line. The Build and Launch standard lines are at :67-76. The content is right.
- **Appendix, line 83:** "the closed S-008" cites no record that says it. Neither the outside-build plan's ruling nor _reviewer-build.md:1 names S-008; status/P-003.toml does.
- **Form:** the case carries none of the standard visuals the form names (for example the six phases with this gate marked, S-024). Sections 1 to 8 come to about 345 counted words, within the 350 limit. The case does not report anything the user representative said. P-003's user is the owner, so the proposal check does not apply.

**Milestones:**
- **The block:** the milestone block is empty. That matches what `v3_checks gates` prints when the timeline holds no Launch gate run for P-003, so it is not a finding. No standard milestone is claimed reached.
- **M4:** handled correctly:
  - It is shown reached on 2026-11-22, in its own phase (Build), with ` · sprints: PR #465` (docs/projects/P-003.md:46).
  - The acceptance record's first line is "Ruling: accept M4 (A)" and its third is "Milestone: M4".
  - Its name and "done when" read as an achievement, not a task, and its why is plain.
  - P-003 has no project milestone of its own in Launch, so there is nothing else to find.
- **Launch-1 to Launch-5:**
  - Launch-1 (the go-live) and Launch-5 (the graduation) are what this ruling decides.
  - Launch-2 and Launch-3 are met by the handover package and operating notes, which the launch review passed (reviewer.md:11-26).
  - Launch-4 is only partly met: the count is shown working, while the report of each miss, the feedback route and the year-end review are set out for after launch. Section 1 says why the owner is asked to proceed on that basis, so this is not a finding.
- **Finding, Launch-5:** its why requires "the lessons for the operating model are recorded at handover" in the operating model's lessons file (docs/projects/P-003.md:76, :85; handover.md:146). The launch review says they are not on the branch (reviewer.md:104, open question 4). Section 3 lists three lessons but cites no record that they were recorded, and the case does not say why the owner is asked to proceed without that.

---

I wrote no files. The case is in /home/user/Service-Desk/questions/P-003-launch-gate.md, lines 26 to 89. The records I checked it against are:
- /home/user/Service-Desk/docs/projects/P-003.md
- /home/user/Service-Desk/reviews/S-009/reviewer.md
- /home/user/Service-Desk/reviews/S-009/_reviewer-build.md
- /home/user/Service-Desk/reviews/465/design-reviewer.md
- /home/user/Service-Desk/reviews/M3E/_stage-g1-review-r1-verbatim.md
- /home/user/Service-Desk/docs/handover/P-003/handover.md
- /home/user/Service-Desk/docs/handover/P-003/operating-notes.md
- /home/user/Service-Desk/decisions/questions/P-003-preview-acceptance.md
- /home/user/Service-Desk/decisions/questions/P-003-outside-build-plan.md
- /home/user/Service-Desk/decisions/questions/P-003-launch-lines.md
- /home/user/Service-Desk/decisions/questions/P-003-build-lines-critic.md
- /home/user/Service-Desk/decisions/questions/P-003-S-009-criteria.md
- /home/user/Service-Desk/decisions/P-003/stop-5.md
- /home/user/Service-Desk/status/P-003.toml
