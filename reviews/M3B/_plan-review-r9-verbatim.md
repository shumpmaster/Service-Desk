# M3B plan: the Reviewer's round 9 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at f83bb30 (the plan, draft 9).

---

Verdict: PASS

This is round 9 of the plan review: draft 9 of the M3B plan, at f83bb30 on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only. The diff from 3892352 touches only that file, and every round-8 finding is settled with nothing regressed.

**Round 8's findings: each is settled**
- **My B1 (a recorded "not measured"):** fixed. AC97's verdict table has a row of its own for a target whose latest window line says `not measured`, with a null value and no figure. It shows the planned ring with "Not measured · your Chief of Staff's check, <its date>", never the dashed "?".
  - The note under the table says such a target "is never a check late" and is counted "not measured yet" on the row. This settles which wins over the "no figure" row, so the case can't read as late any more.
  - VT1 locks it.
- **My N1 (J25's wording):** fixed. J25's `state` now says the target's *latest* window line sets the mark, matching AC97.
- **My N2 (V5 with no figure):** fixed. In the window, with AC21's "no weekday cards" or projects not read yet, V5 takes the planned ring with "Not measured yet · goal: under 4h", counted "not measured yet". VT1 locks it.
- **The Design reviewer's B1 (stale phrases):** fixed. VT1's stale phrases are replaced by the verdict table's words.
- **The Design reviewer's N1 (V4's word):** fixed. V4 half done reads "Under way · goal: both at launch", the same word as the row's "under way" part.
  - The figure stays "1 of 2" "steps done" (the figure table).
  - The only "1 of 2 done" left is in the history note for draft 8 (:3555).

**The row still partitions and adds up.** States 0 to 8 are unchanged, so each day still falls in exactly one. In states 5 and 7 every target carries exactly one of the five marks, each with its own part:
- ✓ or ✕ from the desk's verdict or the check;
- the half circle for V4 under way;
- the planned ring for not measured yet, which now also covers a recorded `not measured` and V5 with no figure;
- the dashed "?" only for a check that is due and has no line.

So the parts add up to the number of targets. The left icon's rule is unaffected.

**Checks run.** `surface_guard diff --range 3892352..f83bb30` is OK. v3_checks trace, joins and ready, and spec_check status, are all OK.

**Non-blocking findings (risks)**
None.

**Open questions**
None.
