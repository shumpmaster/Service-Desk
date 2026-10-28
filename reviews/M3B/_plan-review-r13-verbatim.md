# M3B plan: the Reviewer's round 13 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-28 against build/definer/m3b-plan at 34ce5f5 (the plan, draft 12).

---

Verdict: PASS

This is round 13 of the plan review: draft 12, at 34ce5f5 on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only on the diff from e1ba0c6, and checked it against VT2's code at 2bb72ab on build/builder/vt2 in /home/user/sd-vt2. The 8-week reading is sound, the rows match the build, and nothing regressed.

**The 8-week reading holds against AC25, J5 and V1/V2's counts**
- **The build:** `prune()` (src/lib/metrics.js) drops windows, first-shown notes and marks each by its own time, once it falls before `keptFrom(now)`. `keptFrom` keeps the current week and the 8 before it, with Chicago's week edges. That is J5's "8 weeks from its end" and what draft 12 now says.
- **V1 can't move:** an item noted again after about 9 weeks gets a new first-shown time in the current week's file. But its raised time is about 9 weeks earlier, outside that week's open windows, and V1 counts only items raised inside a counted week's windows. So V1 never counts it.
- **V2 can't move:**
  - A mark made again lands in the week it is made, and V2 counts the rows under "Didn't need me" per week.
  - The 14-day window is far shorter than 8 weeks, so two marks of one item can't both fall inside it.
  - The only way a re-mark lands in the window is when the original mark was pre-launch. That original was a trial, "not counted", so counting the re-mark once is right.
- **No dropped notes:** no note from the window's own weeks is dropped before 8 weeks after those weeks end. Losing an unsaved week after that is the known limit J5 already states.
- **The sheet's words:** "Notes are kept on this device for 8 weeks, then dropped." still covers it, a mark being one of the notes.

**The rows match the build**
- **Page events:**
  - `pageshow` with `persisted` and the page visible opens a window (sandbox.js:5532-5534); a second open while one is open does nothing (`open()` returns early).
  - `pagehide` closes the window.
  - The 15-second `setInterval` calls `metrics.tick()`, so a killed tab's window ends at its last write.
  - These match AC25's added sentences and VT2's new cases.
- **Times:** they are kept to the millisecond (raw `now()` values in the notes). Cutting them to the second belongs to VT3, which writes the file, and VT3's row locks it ("a time at :59.999 written :59").
- **VT2's row** gains the round-2 cases: the Monday split in Chicago through the page, a page loaded hidden noting nothing, `pageshow` from the back-forward cache, and "Didn't need me" on a gate's confirming and kicked-back sheets and on a question's kicked-back sheet.
- **Storage words:** J5 now says "Not noted on this device", matching VT2's `NOT_NOTED` constant (metrics.js:17) and VT2's row. No "metrics not recorded on this device" is left in the spec.
- **The build plan's VT2 line** now puts "Didn't need me" below "Done ✓ · Close", as its last line, matching AC25, reading (k) and the approved picture.

**Nothing regressed.** The diff touches only the draft record and AC25's, J5's and VT2's and VT3's rows. AC97, J25 and the row's states are untouched. Checks run: `surface_guard diff --range e1ba0c6..34ce5f5` is OK. v3_checks trace, joins and ready, and spec_check status, are all OK. The working tree is clean.

**Non-blocking findings (risks)**
None.

**Open questions**
None.
