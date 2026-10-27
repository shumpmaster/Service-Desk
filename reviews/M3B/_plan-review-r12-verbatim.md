# M3B plan: the Reviewer's round 12 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at 7c9bfdb (the plan, draft 11).

---

Verdict: PASS

This is round 12 of the plan review: 7c9bfdb on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only on the diff from a7c8e1d, which touches only that file. All three changes are consistent, the row still partitions and adds up, VT1's tests lock each change, and nothing regressed.

**The three changes**
- **My round-11 N1 (the grey ring):** fixed. The ring is now keyed to the final check, a latest window line whose `to` is on or after WN. The rule is the same everywhere it appears: AC97's check-and-mark rule, the verdict table's after-window column, the note under the table, the planned ring's mark list, J25's `state` and the "Answered" entry's summary.
  - An earlier week's `not measured` keeps draft 10's rule, in the window or after it while the final check is not in. The desk's verdict is the mark ("Within target" or "Outside target" after the window), the check line says "not measured", and no difference line shows.
  - This now matches the owner's question as put, "When the final check says…".
- **The Design reviewer's B1 (link order):** fixed. "<k> earlier checks ›" now comes before "The whole target ›", as the approved picture draws it (r2-4). VT1's block-order test was updated to match, and no stale wording of the old order is left in AC97 or VT1.
- **The Design reviewer's N1:** fixed. The words now read "Weekly check: 1 card" when k is 1, in AC97's V5 row and in VT1.

**The row still partitions and adds up.** States 0 to 8 are unchanged.
- In states 5 and 7 the parts go by mark. The final check's ring counts as "not measured yet"; an earlier week's line with a figure counts by the desk's verdict.
- In state 8 the parts go by the Chief of Staff's states, so it counts as "not measured".
- Every target still carries exactly one mark, and the left icon's rule is unaffected.

**VT1's tests lock each change.**
- the final check with and without a figure (the planned ring, the grey `--ink3` bar, the "Not measured" line in place of the check line);
- an earlier week's line in the window and in state 7 (the desk's verdict, the check line "not measured", no difference line);
- the new block order;
- "1 card".

**Checks run.** `surface_guard diff --range a7c8e1d..7c9bfdb` is OK. v3_checks trace, joins and ready, and spec_check status, are all OK. The working tree is clean.

**Non-blocking findings (risks)**

N1. A final check can arrive inside the window on WN itself, if a line is written that day with `to` = WN. The general rule already covers this (the final check sets the ring, and the row counts by mark in state 5). But the verdict table's "In the window" column describes only lines that aren't the final check. A half-line in that column would make the table self-contained.

**Open questions**
None.
