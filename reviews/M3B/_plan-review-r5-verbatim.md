# M3B plan: the Reviewer's round 5 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at f36ca26 (the plan, draft 5).

---

Verdict: PASS

This is round 5 of the plan review: draft 5 of the M3B plan, at f36ca26 on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only and checked only round 4's B1, N1 and N2. All three are fixed, the row's partition still holds, and nothing regressed.

**Round 4's findings: each fix is real**
- **B1 (V5's lines):** fixed. V5 now has exactly one line on every day, under every reading of question 1 (:V5 block, AC97).
  - **Before launch:** "Measured over the first 14 days after launch", with no date ("over launch day and the 14 days after it" under C). It no longer depends on a W1 that doesn't exist yet.
  - **Launch day under A:** the launch day is the reached date and the day before W1. One pair of lines, "Launch day, weekday cards, last 14 days: <AC21's figure>" over "Measured over the 14 days from <W1>", replaces the before-launch pair.
  - **Launch day under B and C:** that day is W1, so the in-window line applies.
  - **From W1 to WN:** "Since launch, day <d> of <14 or 15>". **After WN:** the "<sheet label>" line.
  - So the conditions are disjoint and cover every day. CS32 draws the launch-day case, and question 1's option A says what it reads.
- **N1 (future reached date):** fixed. "Before launch" now means M3C's line has no ` · reached:`, or today is before its reached date. A date written ahead keeps the desk in state 1.
  - Once reached ≤ today, state 2 (A only) holds only on the reached date, and under B and C it can't hold.
  - States 3 to 8 split as checked in round 4.
  - State 0 applies only after launch. It is listed first, so a failed J25 read wins over states 2 to 8. The sequence is still a strict partition.
- **N2 (failed J25 read):** fixed. State 0 reads "<n> targets · weekly checks not available", with no icon, whenever J25's read fails after launch. The sheet says the row reads by state 0, and VT1 locks it.
- **Icon:** the dashed "?" in states 4 and 6 is consistent with the sheet's late state for V1 to V3. It sits in the icon rule after the red, green and half-circle cases, so no success mark is added.
- **No regressions:** question 2 is unchanged and its lines stand (CS33). The icon rule, the offer condition, the file forms, "Didn't need me" as the last line, and the plain paragraph all hold. The paragraph now says what round 4 fixed.
- **Checks run:** `surface_guard diff --range aaf63fd..f36ca26` is OK (4 commits). v3_checks trace, joins and ready, and spec_check status, are all OK.

**Non-blocking findings (risks)**

N1. V5 can still be left with no measure line in a late edge case.
- Once J2's two dispatch-log months no longer cover the window (from about January), the desk's after-window line is left out, and "the Chief of Staff's V5 line, if any, stands alone".
- With no J25 V5 line at all, V5 then shows its quote and nothing under it. V4 and V5 never take the "not recorded yet" words.
- This has stood since draft 1, and CS34's weekly V5 lines normally prevent it. A fallback such as "No weekly check recorded" would close it.

N2. While J25's read is still pending on a cold load (not failed), the row and sheet can briefly say "first weekly check not recorded yet" or "no weekly check recorded yet". Treating "not read yet" like state 0, or holding the row back until J25 is read, would avoid a moment of untrue words.

**Open questions**
None.
