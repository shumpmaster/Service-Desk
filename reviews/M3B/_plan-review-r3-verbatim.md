# M3B plan: the Reviewer's round 3 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at cc2d826 (the plan, draft 3).

---

Verdict: FAIL

This is round 3 of the plan review: draft 3 of the M3B plan, at cc2d826 on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only. Round 2's fixes all hold, but the row's small line now has overlapping and open-ended states, so its locked case can't be written unambiguously.

**Round 2's findings: each fix is real**
- **B1 (row icon):** fixed. There is one icon rule (:13090-13095): red with any `missed`, green only when every target's latest line is `met`, the half circle with any `on track` or `met`, else the planned ring. VT1 locks the 3-met-2-on-track case and the case after the window with no checks (:3346). The plan no longer shows a success mark that no check gave.
- **N1 (locked cases):** fixed. j12-asks-merge.test.mjs:124-126, j12-pulls.test.mjs:138 and j12-ac60-ac66-estimates.test.mjs:72 are named in VT1 (:3346).
- **N2 (offer condition):** fixed. There is one offer condition (:12951-12956), and the case with last week saved and an older week deleted is locked (:3348).
- **N3 (file forms):** fixed. The forms under question 3's A and B are written (:13875-13887). A count line holds a project's name and numbers only.
- **N4 (question 2):** fixed. Question 2 is R1, reversible, with `DEFAULT: A` and `TIMEOUT: 168`. Its basis checks out: docs/PROJECT.md:69 says "a rewording needs no owner ruling".
- **N5 ("Didn't need me"):** fixed. It is the sheet's last line on every kind of sheet (:12934-12945). `sheetFoot` exists (sandbox.js:3083), and no test asserts what comes after it. ac96:611-613 checks only inside the foot.
- **N6 to N8:** settled. Reading (a) is now put to the owner, the plain paragraph has no ids, and V4 and V5 never show "First check due" (:13118-13121).
- **Open question 1:** CS34 now checks the portfolio's own rules first.
- **Checks run:** `surface_guard diff --range aaf63fd..cc2d826` is OK (2 commits). v3_checks trace, joins and ready, and spec_check status, are all OK. Question 1's new source, docs/PROJECT.md:188-189 ("V1 to V3 run for the 14 days after launch, so their date is V4's date plus 14 days"), checks out.

**Blocking finding**

B1. The row's small line has states that overlap or have no end (:13080-13087). Two cases are left without a rule, and VT1's "the row's small line in each of its states" (:3346) can't be locked.
- **State 2,** "from launch while no target has a J25 line in the window: 'Measured since <launch date> · first weekly check due <date>'", has no end bound.
  - After the window with no line at all, state 2 and "after the window's last day" both apply. Nothing says which wins.
  - Inside the window after the first due date with still no line, the row keeps saying "first weekly check due 18 Nov" with the date gone by. Meanwhile the sheet shows "Weekly check not recorded yet" with the dashed "?" (:13151-13152).
- **State 3** runs "to the window's end and until every target's last check is in". After the window and before the last checks, it overlaps state 4, "after the window's last day". The example at :13085-13087 suggests state 4 wins, but the text doesn't say so.
- **The launch date's words disagree under question 1's recommended A.** The row says "Measured since <launch date>" ("since 11 Nov"). On the same day the sheet says "Measured from 12 Nov" (:13055-13056), and V5 says "Measured over the 14 days from <the window's first day>" (:13125-13126).

**Non-blocking findings (risks)**

N1. Under question 1's A, the first week's dates are a day off.
- "The first check (the week of 9 Nov, from launch day)" (:13070-13071) and J25's sample `"from": "2026-11-11"` (:16134-16135) both start on launch day.
- Under A the window starts 12 Nov, and launch-day cards are outside it.
- The check's `from` date for that week should say which reading applies.

N2. CS34 says the portfolio confirmations come "before VT3 opens". "When each opens" (:3336-3338) says "before VT3 lands". Pick one.

N3. The plain paragraph now says the weekly check's lines are public under every answer, "the counts and your upkeep estimate, in minutes" (:3159-3162), which is honest. Two things are left unsaid:
- **Irreversibility:** the paragraph still says "Nothing else here is irreversible", yet this publication is lasting as well. It is mitigated because the owner merges each pull request, but the paragraph should say so.
- **Question 3 doesn't cover it:** question 3 asks only where the weekly file goes, so what the check's lines publish is never itself put to the owner.

**Open questions**
None new.
