# M3B plan: the Reviewer's round 8 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at 3892352 (the plan, draft 8).

---

Verdict: FAIL

This is round 8 of the plan review: draft 8 of the M3B plan, at 3892352 on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only. Every round-7 finding is settled, but draft 8 brings back an old fault: a check that says "not measured" is shown as if no check had been recorded.

**Round 7's findings: each is settled**
- **My B1 (late checks on the row):** the row's parts now have one part per mark, including ✕, ✓, the half circle, the dashed "?" as "<w> check late", and the planned ring (:13351-13359). In states 5 and 7 every target carries exactly one mark, so the parts add up. VT1 locks "check late".
- **My N1 (which check line wins):** fixed in AC97. The target's *latest* window line sets the mark (:13236-13245). The difference line shows only when that line's `met` or `missed` disagrees with the desk. VT1 locks the case of an earlier `missed` followed by a later `on track`. One stale sentence remains in J25 (N1 below).
- **My N2 (V4):** fixed. V4 is the one target judged from launch day: "1 of 2 done" with the half circle, never outside, and its archive line counts whatever its dates (:13226-13235; window line "for V4, any of its lines", :13348).
- **My N3 (missing `value`):** fixed. A line without `value` is now malformed, and V1's sum skips null lines.
- **My N4 (other projects' icon):** fixed. Another project's left icon has its own rule and can be green (:13395-13399).
- **The Design reviewer's B1 to B4:**
  - **B1, the scales:** each scale now follows the picture: V2 runs 0 to 3 with its goal tick at a third. VT1 locks each tick.
  - **B2, the figure words:** the words before launch, on launch day, in the window and after it are now in two tables (:13261-13267, :13308-13313). They match the approved images' examples ("0" "missed, 3 – 16 Dec" and so on).
  - **B3, words for two states:** V4 half done and the late check now have words.
  - **B4, the grey bar:** V5's fill before W1 is `--ink3`.
- **The Design reviewer's N1 to N5:**
  - **N1, the palette:** the later ruling for the bars' green and red fills is cited, scoped to these charts.
  - **N2, the difference line:** it now reads "The desk's own reading".
  - **N3, past the scale:** a value past the end now reads "6, past the scale".
  - **N4, launch-day icon:** the rule's half circle governs, and the picture's planned-ring frame is marked superseded.
  - **N5, VT1 against the picture:** VT1 now checks the scales, ticks, figure words and grey contrast against the approved images.
- **The row's partition:** states 0 to 8 are unchanged, so each day still falls in exactly one.
- **Checks run:** `surface_guard diff --range f6256a7..3892352` is OK. v3_checks trace, joins and ready, and spec_check status, are all OK.

**Blocking finding**

B1. A recorded "not measured" check is now shown as "weekly check not recorded yet", with the dashed "?", and counted on the row as a check late. Earlier drafts settled this the other way.
- J25 makes a `not measured` line carry `value: null` (J25, `value`). AC97 gives V1 "no figure while every window line it has is `null`" (:13221-13222). The same follows for V2 or V3 when every week's line is `not measured`.
- AC97 then sends such a target to the verdict table's "V1–V3, no figure" row (:13310). After D1 that row shows the dashed "?" with "Not measured yet · weekly check not recorded yet".
- The mark rule says that with a `not measured` line "the desk's live verdict is the mark" (:13240-13242). Here there is no live verdict, so the table's dashed "?" is what shows. The row's marks then count it as "<w> check late" (:13344, :13353-13354).
- So the sheet would show "weekly check not recorded yet" directly above "Your Chief of Staff's check, <date>: not measured". This is a plausible week, for example one where no weekly files were saved.
- Drafts 3 to 6 settled this case as "'Not measured' with the planned ring (a record that exists, so never the dashed '?')". Draft 8 drops that rule. VT1 locks the "no figure" row but has no case for a `not measured` line with a null value.
- Fix: give such a target its own entry, "Not measured · your Chief of Staff's check, <date>", with the planned ring, counted as "not measured yet". VT1 should lock it.

**Non-blocking findings (risks)**

N1. J25's `state` still says "once a window line says `met` or `missed`, it sets the target's mark". AC97 now says the *latest* window line does. Align J25's wording with AC97.

N2. V5 in the window with no figure has no stated mark. AC21's "no weekday cards", or the projects not read yet, leave no median to judge. The verdict table's V5 row assumes a figure. Say which mark applies, presumably the planned ring counted as "not measured yet", and lock it in VT1.

**Open questions**
None.
