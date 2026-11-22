# Ruling needed: do you approve putting the card fix on the live desk, and passing it to the desk's own running?

Milestone: Launch-1, M4

WHY: The card fix works on the preview and you accepted it there. Going live is the last step before the weekly check of its value target starts; until you rule, decision cards on the live desk still show no recommendation from the notes. Three parts have not run and cannot before launch: the report of each miss, your feedback route and the year-end review. The Reviewer passed the handover package with seven minor points, four of them risks below. Approving leads to one more ask: approving the live deploy itself. Going live can be undone: the previous deployment is redeployed, then the merge reverted. A fresh Critic read the case cold three times; each time it recommended proceeding. Its third view is below the case, word for word, and the case is left exactly as it read it. That view says four things are weaker than their records: the weekly check sees only cards held too long, not cards shown with no mark; the case's "both should be fixed first" means before the first weekly count, not before going live; the lessons for the operating model were due at handover and are not yet filed; and a few smaller gaps between the views are not listed as risks. The lessons will be filed in the operating model's repository straight after your ruling, for you to merge.
OPTIONS:
  A. Proceed: the fix goes live on your approval of the deploy, and passes to the desk's own running with the Chief of Staff's weekly check. The four risks are carried as written: you expect the desk's "no target V6" note, the count's watched code and script are fixed before its first weekly run, and the lessons are filed straight after your ruling.
  B. Proceed as A, and also file the design reviewer's two optional points (Home's new lines' red cross, and naming their project) as later work.
  C. Hold: name what must change first; the case is rewritten as the gate's second case.
  D. Kill: the fix stays on the preview only and is rolled back there.
RECOMMENDATION: A. Both reviews passed with nothing blocking, and none of the risks needs a change before launch; the two design points are minor and can be filed any time.
RISK CLASS: R1 (a deploy of page code already reviewed and merged; no change to the sender, checks or governance)   REVERSIBILITY: reversible (rollback: redeploy the previous deployment, then revert the merge)   BLAST RADIUS: the live desk's decision cards and their notices, for every project the desk shows; no other repository
DEFAULT: none — only the owner rules a gate (Launch-1)   TIMEOUT: none

## Context
- The owner accepted the card fix on the preview, and M4 is marked reached (source: decisions/questions/P-003-preview-acceptance.md; docs/projects/P-003.md:46)
- The build review passed, nothing blocking (source: reviews/S-009/_reviewer-build.md)
- The launch review of the handover package passed with seven non-blocking findings, N1 to N7, and five open questions (source: reviews/S-009/reviewer.md)
- The outside-build plan files the Launch gate as a question with its case inside it, read cold by the Critic first, in a pull request holding only the question (source: docs/handoff/2026-11-13-P-003-outside-build-plan.md, step 16 and the pull-request table, row 7)
- The case below passes `v3_checks gates`, tried as docs/gates/P-003/launch-gate-1-case.md, except one rule: it expects the launch review at reviews/S-008/reviewer.md, because the loop closed P-003 at S-008 and its status file still names S-008, while the fix was built outside the loop from S-009 and S-014, whose reviews sit under reviews/S-009/ (source: status/P-003.toml; governance/checks/v3_checks.py:3120; decisions/questions/P-003-outside-build-plan.md)
- The timeline holds no Launch gate run for P-003, so the case's milestone block is empty, as the check expects (source: governance/checks/v3_checks.py:3056-3063)
- A fresh gate Critic read the case cold three times, in rounds 1 to 3; each recommended proceed. The case was corrected after rounds 1 and 2 and left unchanged after round 3, whose view is below the case, verbatim. All three views go to reviews/P-003/ with the answer (source: .claude/agents/critic.md, Write lane)
- Launch-5's line puts the lessons for the operating model "at handover"; the launch review found them not yet filed, and the outside-build plan files them in its step 18, after this ruling (source: docs/projects/P-003.md:76; reviews/S-009/reviewer.md:104; docs/handoff/2026-11-13-P-003-outside-build-plan.md, step 18)

## The case

### P-003 — the Launch gate

## 1. The ask

Skipped, as ruled: hidden tests and experiments [decisions/questions/P-003-hidden-tests.md:1] [docs/projects/P-003.md:70].
Not run yet: weekly counts, miss reports and feedback start at launch; the year-end card after 31 December [docs/handover/P-003/handover.md:94] [docs/handover/P-003/handover.md:107] [docs/handover/P-003/handover.md:114].
The plan allows this [docs/projects/P-003.md:75].
The operating model's lessons are not yet filed (appendix) [reviews/S-009/reviewer.md:104].
A screen dropping a card's mark is guarded by tests only [docs/handover/P-003/operating-notes.md:133].
Proceeding puts the fix live, run by the desk [docs/projects/P-003.md:76].

**The proposer's recommendation:** proceed — both reviews passed, nothing blocking; you accepted the preview [reviews/S-009/_reviewer-build.md:7] [reviews/S-009/reviewer.md:3] [decisions/questions/P-003-preview-acceptance.md:1]

## 2. The vision

Twice you answered a card against a recommendation the card never showed [docs/projects/P-003.md:34].
Now it waits for the recommendation, or after a day says there is none [docs/handover/P-003/handover.md:20] [docs/handover/P-003/handover.md:22].

## 3. What this phase taught us

All views and notices share one card list; 1,583 tests passed [reviews/S-009/_reviewer-build.md:38] [reviews/S-009/_reviewer-build.md:24].
The desk does not read the weekly count's record (section 5) [reviews/S-009/reviewer.md:98].
Of 39 past cards, 5 were open when their day ran out; none held too long [reviews/S-009/reviewer.md:81] [reviews/S-009/reviewer.md:38].

## 4. The plan for the next phase

Nothing new starts [docs/handover/P-003/handover.md:33].
From launch, a weekly check of target V6 (no card unmarked or held over a day), miss reports and your feedback route [docs/handover/P-003/handover.md:94] [docs/handover/P-003/handover.md:97] [docs/handover/P-003/handover.md:103].
After 31 December a card puts the result to you [docs/handover/P-003/handover.md:110].
The launch review passed it [reviews/S-009/reviewer.md:28].

## 5. The risks

The desk will note weekly that it knows no target V6, ignoring those records: expect it, or file a fix [reviews/S-009/reviewer.md:76].
No past card was held, so holds are untested on real records; a broken copy did report them [reviews/S-009/reviewer.md:78] [reviews/S-009/reviewer.md:47].
The count watches one code file, and its script reused unchanged could miss cards; both should be fixed first [reviews/S-009/reviewer.md:83] [reviews/S-009/reviewer.md:90] [reviews/S-009/reviewer.md:103].
Its first record was filed with other changes, against its rule [reviews/S-009/reviewer.md:92].
One unreadable notes file hides all decision cards, with a line saying so [docs/handover/P-003/handover.md:57].
A late recommendation can notify twice; a fix needs your approval [docs/handover/P-003/handover.md:59] [docs/handover/P-003/handover.md:124].
Optional: should Home's new lines carry the red cross, and name their project [reviews/465/design-reviewer.md:78] [reviews/465/design-reviewer.md:82]?

## 6. Cost and limits

New spend stays $0 a month [docs/projects/P-003.md:96].
Your time: this ruling and the deploy; otherwise not recorded [docs/projects/P-003.md:88].

## 7. Kill criteria

A card shown unmarked, or held over a day, is a V6 miss, reported that week [docs/projects/P-003.md:107] [docs/projects/P-003.md:111].
Oversized work stops and returns to you [docs/projects/P-003.md:113].

## 8. What the owner is agreeing to

The go-live, then your approval of the deploy [docs/projects/P-003.md:72] [docs/projects/P-003.md:88].
The graduation, with the weekly check [docs/projects/P-003.md:76].
V6 at 0 until 31 December, at $0 and tier T1 [docs/projects/P-003.md:103] [docs/projects/P-003.md:96] [docs/projects/P-003.md:98].

## 9. Appendix: the phase record
<details>
<summary>The phase record</summary>

M4 was reached on the preview on 22 November, by your acceptance [docs/projects/P-003.md:46] [decisions/questions/P-003-preview-acceptance.md:1].
Build-1, Build-3 and Build-4 were skipped with their reasons; Build-2, Build-5 and Launch-1 to Launch-5 were taken on [docs/projects/P-003.md:67] [docs/projects/P-003.md:76].
Launch-2 and Launch-3: the handover package and operating notes passed the launch review [reviews/S-009/reviewer.md:11].
Launch-4 stands in part: the count ran once on past records; the miss reports, feedback route and year-end card are set out for after launch, as the plan's Launch-4 line allows ("set out beside it for after launch"), which the launch review asked this case to name [docs/projects/P-003.md:75] [reviews/S-009/reviewer.md:34] [reviews/S-009/reviewer.md:101].
Launch-5 stands in part: the lessons are not yet in the operating model's lessons file; the outside-build plan you approved files them with the launch records after this ruling, and they do not bear on going live [decisions/questions/P-003-outside-build-plan.md:1] [reviews/S-009/reviewer.md:104].
The lessons, from this phase's reviews: the review check misreads a harmless `process.exit(` as a skipped test; the Reviewer's checklist file is not in this repository; and the milestone check accepts an acceptance record only if it starts "Ruling: accept" [reviews/464/reviewer.md:32] [reviews/S-009/reviewer.md:7] [reviews/S-009/reviewer.md:60].
The fix was built outside the pipeline by your approval of the plan, so its records sit under S-009, while the status file names S-008 [decisions/questions/P-003-outside-build-plan.md:1] [status/P-003.toml].
The handover package passed its launch review with seven minor findings [reviews/S-009/reviewer.md:5].
No standard visuals are drawn: the case sits inside a question, read as text, and the model asks for visuals only where they help, as P-001's launch Critic noted [reviews/P-001/_launch-gate-1-critic.md:20].

```milestones
```

</details>

<!-- The Critic section: the gate Critic's record (round 3), never part of the case. -->

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
