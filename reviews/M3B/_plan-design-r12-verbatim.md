# M3B plan: the Design reviewer's round 12 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at 7c9bfdb (the plan, draft 11).

---

Verdict: PASS

In plain English: all three changes are in, and they match the approved picture and the owner's answers.
- **Link order:** under each target, "<k> earlier checks ›" now comes before "The whole target ›", as the picture draws it.
- **Singular:** one card reads "Weekly check: 1 card".
- **Grey ring:** it now applies only to the Chief of Staff's final check, the one covering the last day of the 14, which is exactly what the owner was asked about.
- **Regressions:** none found.

How I judged it: the diff a7c8e1d..7c9bfdb changes only specs/S-001.md (+36 −27), and nothing under src/ or tests/. I read the changed lines in AC97 (S-001.md:13290-13410) and VT1's row (:3359). I checked them against the approved image r2-4, P-001-m3b-picture-approve.md (A), P-001-m3b-not-measured-mark.md (B) and the design pack.

**One by one**
- **My round-11 B1, the link order: holds.**
  - AC97's block item 5 (:13410) now reads "**"<k> earlier checks ›"** where J25 holds earlier lines (C, mine), then **"The whole target ›"**", citing r2-4 and the picture approval.
  - VT1 locks "each block's order (id and short name, the figure in `--t-title`, the chart, the verdict, the check's line, "<k> earlier checks ›", "The whole target ›")".
  - That matches r2-4, where "2 earlier checks ›" sits above "The whole target ›".
  - The owner's ruling now governs, as the pack's order of authority requires (part A item 1). The "spec's order governs" reading is gone, and the draft record marks it as replaced.
- **My round-11 N1, the singular: holds.** V5's verdict-table row (:13389) adds "("1 card" when k is 1)" (item 19), consistent with "1 false alarm" and the build's "1 weekday card".
- **The Reviewer's N1, the grey ring keyed to the final check: holds.**
  - The rule (:13296-13305) now reads: when the latest line "is **the final check** (a window line whose `to` is on or after WN) and says `not measured`, that sets the mark too, the planned ring, even where the desk has its own figure".
  - Any other latest `not measured` line keeps draft 10's rule: the desk's live verdict is the mark, the check line says "not measured", and no difference line shows. That covers an earlier week's line, in the window or after it while the final check is not in.
  - The table (:13386) and the note under it (:13399-13402) say the same.
  - This matches how the question was put to the owner: "After the 14 days, if your Chief of Staff's final check records a target as "not measured"…". It also avoids a grey ring while the record is still incomplete, in state 7.
  - The meanings stay distinct: the planned ring and the grey `--ink3` bar mean "not judged", and the dashed "?" means a check that is due and missing (part B item 30; item 14).

**Regressions:** none found. Apart from these, the diff changes only the draft-11 history line.

**Blocking:** none.

**Non-blocking:** none.

**Questions for the owner:** none.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: the check-and-mark rule at :13290-13305, the verdict table and its note at :13386-13402, the link order at :13410, VT1's row at :3359
