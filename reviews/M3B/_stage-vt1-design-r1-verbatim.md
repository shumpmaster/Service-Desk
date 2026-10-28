# M3B stage VT1: the Design reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/builder/vt1 at 1a2f444 (VT1's work over 5935908).

---

Verdict: PASS

**For the owner.** Nothing failed and nothing was skipped. On Service-Desk's page, the "Value targets V1 to V5" row now shows five small marks, one per target: a green ✓ for a target that is inside its goal and a red ✕ for one outside it, plus grey rings for targets not measured yet. Tapping the row opens a sheet that leads each target with a big number, then a small bar against its goal line, then a verdict in words. Before launch, response time (V5) stays grey and is labelled "not counted". It matches the picture you approved, except where the written spec deliberately changed it. I have one question for you. When your Chief of Staff's final check says "not measured" for a target the desk could still measure, should that target show the desk's green ✓ or a grey ring? The build shows the ✓; your approved picture drew the ring. It is a small, easily undone choice, and I haven't picked for you. There are also three small wording and alignment follow-ups.

**Blocking findings:** none.

**Evidence, by checklist item**
- **Sizes (item 27, plus the 24 px figure):** these come from 92 Chromium captures (both widths, both themes) with computed styles dumped.
  - Sizes used: only 11, 12, 13, 18 and 24 px. Weights used: only 400, 500 and 600.
  - Every figure is 24 px at weight 600 (`--t-title`), for example "0", "2", "20 min", "2 of 2" and "2h 30m". The row's ids are Plex Mono at 11 px.
  - Fonts loaded: Plex Sans 400/500/600 and Plex Mono 400.
- **Contrast (items 10 and 25):** no text falls below 4.5:1 in either theme. The lowest is `--ink2` at 6.40:1 light and 7.72:1 dark.
  - V5's grey `--ink3` fill against the track measures 4.19:1 light and 5.44:1 dark, exactly AC97's figures. Against the card it is 5.18 and 7.02.
  - Green and red fills against the track: 4.81 and 5.55 light, 6.37 and 5.36 dark.
  - Marks against the card: 5.93 and 6.85 light, 8.21 and 6.91 dark.
- **Colour (items 13, 14 and 29):** green and red appear only on the ✓ and ✕ marks and the bar fills, always beside ✓ or ✕ and words. The row also carries a hidden word per mark for screen readers.
  - The new CSS (src/public/sandbox.css:1408-1451) uses only existing tokens. There is no new colour and no coral.
- **Tap targets (item 11):** Close is 44×44. "The whole target", "<k> earlier checks" and "Read it all" are each 28 px tall. Nothing is under 24 px.
- **Width (item 12):** no sideways scroll at 360 or 414 in any capture, including a stress project of mine. It had ids out of order, a 300-character target line and a 60-character figure with no spaces.
- **Sheet behaviour (item 15):**
  - Escape and a tap outside each close the sheet.
  - The opened target quote, the earlier checks and the opened stop rule all survive 75 s of the desk's own refreshes.
  - The stop-rule clip is exact: the third line ends at 1535.2 px inside a clip ending at 1537.06, and the fourth line starts at 1537.05. That is the fix AC97 asked for (sandbox.css:1451).
- **Words (AC97's tables):** checked in every state.
  - All row states match AC97's words: 0, 1, 2, 3, 4, 5a, 5b, 6, 7, 8a, 8b and 8c, plus Alpha.
  - The row's left icon follows AC97's one rule in every state.
  - The sheets match AC97's two tables:
    - before launch: no dates; V5 "Before launch, not counted", grey, with the ring;
    - launch day: "Launch day, not counted"; "Old repository archived: your Chief of Staff checks it after launch";
    - day 5: "Missed" over "Outside", because the check wins;
    - after the window: "Met" and "Missed"; "2h 15m" "median, 3 – 16 Dec, 21 weekday cards";
    - checks unreadable: "Not available", with V4 and V5's own facts kept;
    - Alpha: figures and the check's word only.
- **The three known departures from the picture are built as the spec says:** V5 grey with the ring before launch; the half circle on launch day; and "The desk's own reading" (values.js:312).
- **Suite:** all 1490 tests pass, and the build check passes.

**The four flagged points**
1. **"The whole target ›" before "<k> earlier checks ›":** accepted. AC97 item 5 and VT1's locked order both put it first, and the spec governs.
2. **"1 false alarms":** non-blocking, see N2.
3. **Only the bar values in Plex Mono:** accepted. Round 2's picture draws the bar labels in Sans and the values in Mono, which matches AC97 :13306.
4. **State 8, `not measured` with a figure keeps ✓:** this is the owner question below. It is not blocking.

**Non-blocking findings**
- **N1 (state 8c):** V3 and V5 show green ✓ "Within target" with "Your Chief of Staff's check, 21 Dec: not measured". The row shows five ✓ above "3 met · 2 not measured".
  - The picture's r8c draws a ring on V3 and V5 (marks `check, check, planned, check, planned`).
  - AC97 points both ways:
    - :13258-13261 says that with `not measured` "the desk's live verdict is the mark";
    - :13339-13341 says a target "whose latest window line says `not measured` … its mark is the planned ring".
  - Unlike the launch-day icon, AC97 does not name this frame as superseded.
  - The code gives the ring only when there is no figure (values.js:427-435).
  - Captures: the Builder's /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots/vt1-row-8c-final-not-measured-360x740-light.png and my /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr-vt1/shots/dr-sheet-8c-not-measured-360x740-light-full.png.
- **N2 (item 19):** a single week with 1 false alarm reads "1" "false alarms, …" (values.js:461), following AC97 :13283's words literally. Yet V5 does change "weekday cards" to "1 weekday card" (values.js:502), so the build is inconsistent with itself. This is a spec wording fix for the Definer: "1 false alarm".
- **N3 (the picture governs the look):** bar tracks don't line up across targets. The chart grid is per target (sandbox.css:1424-1425), so at 414 px the tracks start at x = 61 (V1), 78 (V2, V3) and 100 (V5), and their lengths vary from 243 to 315 px. Round 2's picture draws one shared label column with equal tracks. Each target has its own scale, so no value is misread.
- **N4:** another project's row adds a part, "<k> not recorded yet", so the parts add up ("4 targets · 1 met · 1 on track · 2 not recorded yet"). That phrase is not in AC97's words; the Definer should write it in. A wordy figure set at 24 px can run to three lines. That follows AC97, so it is a note, not a finding.

**Question for the owner (asked, not picked)**
- When your Chief of Staff's final check on a target says "not measured", but the desk still has its own figure for it, should the mark be:
  - **A.** the desk's own ✓ or ✕, as built; or
  - **B.** a grey ring meaning "not measured", as your approved picture drew it?

**Best captures to show on a phone**
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots/vt1-row-5b-day5-one-outside-360x740-light.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots/vt1-sheet-day5-one-outside-360x740-light.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots/vt1-sheet-before-launch-360x740-light-full.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots/vt1-sheet-after-14-days-one-missed-414x896-dark-full.png

My probe scripts, captures and style dumps are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr-vt1/ (dump.json, dump-stress.json, shots/, shots-stress/). Nothing in the repository was changed.
