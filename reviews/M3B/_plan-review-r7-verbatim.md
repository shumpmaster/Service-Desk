# M3B plan: the Reviewer's round 7 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at f6256a7 (the plan, draft 7).

---

Verdict: FAIL

This is round 7 of the plan review: draft 7 of the M3B plan, at f6256a7 on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only. Draft 7 writes in the approved picture and its answers faithfully, but the row's words in states 5 and 7 leave one kind of mark uncounted, so their parts can't add up as VT1 locks them.

**1. Each answer is written in, and the "Answered: from the M3B picture" block is word for word.**
- I checked the block with the same script as round 6 (/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/cmp.py) against all nine records in decisions/questions/. For each record it compared the question, every option, the whole "How it was answered" paragraph and its ruling. All match, including stand-out's free-text ruling, which only wraps across lines.
- The owner's request (docs/design/references/owner-request-2026-10-26-m3b-picture-changes.md) is quoted exactly.
- The cited commits all exist: c727982, 3df44f7, 327ce70, 896af81, 2a20e36, cbb2794 and 7b69b2b.
- Each answer is in AC97:
  - **sheet-order B:** the measure comes first (:13213-13251).
  - **good-bad A:** the desk judges live, replacing reading (g) (:13193-13204).
  - **stand-out:** a small chart per target (:13225-13244).
  - **v5-two A:** V5's two bars are labelled "Live so far" and "Weekly check".
  - **weekly-red A:** a bad week keeps V2 or V3 red, and the big figure is the worst week.
  - **disagree A:** the check's met or missed wins (:13205-13212).
  - **other-goals A:** other projects show figures only (:13265-13271).
  - **picture-approve A:** V5 is grey before W1.
  - **picture-small A:** all four fixes, (a) to (d), are in.

**3. J25's `value` is sound, with the edge noted in N3.** It is a whole number from 0 to 100,000. A null value with a state other than `not measured` on a planning-project V1, V2, V3 or V5 line is malformed. VT1 locks the cases.

**4. The goal check is real.** The goals match section 6 as CS36 left it at 7b69b2b: V1 "0", V2 "at most 1 a week", V3 "at most 30 minutes a week", V4 "at launch", V5 "under 4 hours". A test checks each goal against its line in the new `j11-7b69b2b/` fixture.

**The quoted stop rule matches section 6.** At 7b69b2b the rule still ends "… where the owner rules continue, re-aim or stop.", so the quote's end point holds, with only its first letter capitalised.

**5. Round 6's N1 to N3 are settled.**
- The "Stop rule, rollback, cost" line now reads "PROJECT.md §6's miss rule, as it stands, still applies" (:19183).
- AC97's test uses `j11-7b69b2b/`, and its no-date checks cover the desk's own words only (:13360-13364).
- AC25 names only the portfolio's tree (J23's) as the tree that shows a file landed (:13072).

**Checks run.** `surface_guard diff --range 327ce70..f6256a7` is OK. v3_checks trace, joins and ready, and spec_check status, are all OK.

**Blocking finding**

B1. In states 5 and 7, the row's words have no part for a target whose check is late, so they can't add up.
- AC97's row has five marks: ✓, ✕, the half circle, the planned ring and the dashed "?" ("a check late", :13279-13283).
- But the words for states 5 and 7 count only four kinds: "<x> outside target", "<y> within", "<u> under way" and "<z> not measured yet" (:13288-13294).
- A dashed "?" target is counted in none of them. That happens in state 5 when one target's check is overdue while another target has a window line. It also happens in state 7 for V5's log-gone case, "Weekly check not recorded yet" with the dashed "?" (:13258-13261).
- So "adding up to the number of targets" fails, and VT1's locked case "its parts adding up to the number of targets" (:3355) can't pass. A "<w> check late" part would close it.

**Non-blocking findings (risks)**

N1. The "check wins" rule says "a window line" in one place and "the latest line" in another.
- AC97 (:13207-13210) and J25's `state` say: once *a* window line says `met` or `missed`, it sets the mark. But the row's state 8 and the left icon read each target's *latest* line.
- If a later line says `on track` after an earlier `missed`, it is unclear which mark shows.
- It is also unsaid whether a check of `on track` against the desk's "outside" counts as a difference that shows "The desk's own count" line (:13210-13212).

N2. V4 can be judged on launch day, and its check can't win.
- AC28 has the owner archive on launch day, so V4's archive line (`from` = `to` = the archive day) can fall on launch day. That is before W1, so it is not a window line.
- Then the Chief of Staff's V4 `met` or `missed` never sets V4's mark.
- Meanwhile V4 is "within once both steps are done", which can be on launch day. That contradicts "Before W1 nothing is judged" (:13200-13201).
- Either exempt V4's archive line from the window-line test, or say that V4's within holds from launch day.

N3. The "line from before draft 7" exception is dead, and it opens a loophole.
- No `intake/value-checks.jsonl` exists on any branch (checked in Service-Desk at bbedc38 and at f6256a7). So no pre-draft-7 lines exist.
- The rule "with no `value` key: read, value null, not judged" therefore only lets a new line leave out `value`. That dodges the null-is-malformed rule, and it contradicts the malformed case "a key missing".
- It is also unsaid how V1's "sum of its window lines' values" treats a window line whose value is null.

N4. Another project's left icon can never be green. The icon is green "only in state 8 with every target's latest line `met`", and only the planning project has states 1 to 8. So another project with every target met shows the half circle. If that is intended, say so.

**Open questions**
None.
