# M3B plan: the Reviewer's round 4 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at c809483 (the plan, draft 4).

---

Verdict: FAIL

This is round 4 of the plan review: draft 4 of the M3B plan, at c809483 on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only. The row's small line now holds: with M3C's reached date on or before today, every day falls in exactly one of its eight states under every reading of question 1. But V5's own measure still has two gaps.

**Round 3's fixes: each is real**
- **B1 (the row's states):** fixed for normal dates (:13100-13130).
  - Before launch, state 1 holds. Under A, launch day is state 2, because a reached date on or before today makes "today before W1" mean launch day exactly. Under B and C, W1 is launch day, so state 2 can't hold.
  - From W1 to WN: no window line and today ≤ D1 gives state 3; after D1 it gives state 4; a window line gives state 5.
  - After WN: no window line gives state 6. "Final" needs every target's latest `to` on or after WN, so it implies a window line, and state 6 can never shadow state 8. States 7 and 8 split on "final", read from each state's title.
  - The due date shown never passes: state 4 replaces it, and state 7 switches to "not recorded yet" after DN.
  - Under A nothing says "since 11 Nov" (:13081, :13116). C's "first 15 days" is defined (:13089).
  - VT1 locks each state's bounds on a fake clock under each reading (:3350).
- **N1 (first week's dates):** fixed. J25's sample now has `"from": "2026-11-12"` under A, and the dates are given by reading.
- **N2 (CS34 timing):** fixed. CS34's portfolio confirmations come before VT3 opens, and "When each opens" matches.
- **N3 (public weekly figures):** fixed. The plain paragraph and question 3's WHY say the weekly check's lines are public for good, each week's published only when the owner merges it.
- **Unchanged and still holding:** the icon rule, the offer condition, the A and B file forms, "Didn't need me" as the last line, and question 2.
- **Checks run:** `surface_guard diff --range aaf63fd..c809483` is OK (3 commits). v3_checks trace, joins and ready, and spec_check status, are all OK.

**Blocking finding**

B1. V5's own measure is undefined on two kinds of day, so VT1's V5 case can't be locked.
- **Before launch:** the line reads "Measured over the 14 days from <W1>" (:13169-13172; VT1's row, :3350, "Measured over the 14 days from <date>").
  - W1 is worked out from M3C's ` · reached:` date (:13073-13077), and before launch that date doesn't exist. So this line has no date to show on the preview, where VT1 is tried before launch.
  - The row's state 1 instead takes V4's date from V4's line (:13109-13110). V5 needs a rule like it, for example W1 as V4's date plus or minus a day by question 1's answer, or no date.
- **Launch day under A:** V5's three cases are before launch, in the window and after the window (:13169-13181).
  - On launch day M3C is reached, so "before launch" no longer holds ("Before M3C is reached, nothing is 'after launch'", :13091). Today is also before W1, so "in the window" doesn't hold.
  - So no V5 rule applies that day. V1 to V3 got their own launch-day line (:13196-13197), and the row got state 2, but V5 did not.

**Non-blocking findings (risks)**

N1. A reached date later than today breaks the partition. J11 accepts any valid date (src/lib/j11.js:213, :276, with no future check). Suppose the line is written ahead of the day, or with a typo:
- Under B or C, every day before that date falls in no state. State 1 needs "M3C not reached", state 2 is A-only, and states 3 to 8 need today ≥ W1.
- Under A, every such day shows state 2's "launch day" words.
- Reading "before launch" as "M3C not reached, or today before its reached date" closes both gaps.

N2. If J25's read fails, the row has no rule. In states 3, 4 and 6 it would assert "first weekly check due…", "first weekly check not recorded yet" or "no weekly check recorded yet". The sheet says "Weekly checks: not available" (:13204-13206). The row should say "not available" too, and VT1 should lock it.

**Open questions**
None.
