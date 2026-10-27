# M3B stage VT1: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/builder/vt1 at a092039 (VT1 round 2, over 5935908 with draft 11 merged).

---

Verdict: PASS

**For the owner.** Nothing failed and nothing was skipped. Your answer is built. When your Chief of Staff's final check says "not measured" for a target, it now shows a grey ring, and its bars turn grey. The desk's own number still shows. This matches the picture you approved. The other round-1 points are fixed:
- one false alarm now reads "1 false alarm", not "1 false alarms";
- "earlier checks" now comes before "The whole target", as your picture draws it;
- an old repository your Chief of Staff marks as not archived now shows a red ✕ with those words.

Nothing that already worked has broken. One small look point remains: the bars of different targets don't start at the same place across the sheet. I don't think it should hold the work up.

**Blocking findings:** none.

**Round 2, checked on a092039**
- **The owner's ruling, applied.** Ruling: P-001-m3b-not-measured-mark.md, B; it is AC97 :13258-13270 and the "not measured" row of the verdict table as draft 11 has them.
  - Row 8c reads "5 targets · first 14 days checked · 3 met · 2 not measured", with marks ✓ ✓ ◌ ✓ ◌ and the half-circle icon. That is exactly the picture's r8c (/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots-r2/vt1-row-8c-final-not-measured-360x740-dark.png).
  - On the sheet, V3 and V5 keep their figures ("25 min", "2h 15m"), with every bar `--ink3`. That is 4.19:1 against the track in light and 5.44:1 in dark.
  - Their verdict reads "Not measured · your Chief of Staff's check, 21 Dec", then "Goal: …". There is no extra check line and no difference line (values.js `finalNotMeasured` and `notMeasured`).
- **Draft 10's rule still holds in the window.** I made up a case of my own: day 5, with V3's only week recorded `not measured`. V3 shows the planned ring with "Not measured · your Chief of Staff's check, 7 Dec" and "Goal: at most 30 minutes a week", as the table's no-figure case says.
- **"1 false alarm":** the multi-week form reads "1" "false alarm in a week, the most (3 – 6 Dec)" (values.js:478). The one-week form is singular too.
- **Order:** "2 earlier checks ›" now comes before "The whole target ›" on every block, as picture r2-4 draws it.
- **V4 `missed`:** my made-up case gives:
  - "1 of 2" "steps done";
  - ✓ "Serving the Operations-Hub address since 2 Dec";
  - ✕ "Old repository not archived";
  - ✕ "Missed · goal: both at launch";
  - "Your Chief of Staff's check, 7 Dec: missed".
  
  That is as AC97 now says. The red appears only with ✕ and words.
- **Another project:**
  - Alpha's all-met row shows a green ✓ icon with "3 targets · 3 met".
  - A mixed case reads "<k> not recorded yet", so the parts add up.
- **"Done today":** the new words "not on the Timeline: a weekly value check" use the same element and class as the existing estimate row (sandbox.js:1944). I did not capture them in a browser.

**Regression sweep:** 100 Chromium captures of my own, at 360×740 and 414×896, light and dark, every row state and sheet from round 1 plus the new cases.
- Sizes are only 11, 12, 13, 18 and 24 px; weights only 400, 500 and 600. Plex Sans 400/500/600 and Plex Mono 400 loaded.
- No text is under 4.5:1. Close is 44×44, and every other target is at least 24 px. Nothing scrolls sideways.
- Every row state's words, icon and marks are the same as round 1, except 8c, as ruled.
- All 1499 tests pass, and the build check passes.

**N3 (bar tracks not aligned across targets): should not block.**
- AC97 lists how each chart must match the picture: its scale, the tick's position, the goal label, the fill by verdict, the 4 px stub and the past-the-scale words. It does not ask for one label column across targets.
- Within each target, the bars do line up. That is the comparison the chart is for, and each target has its own scale. So no value is misread, and no checklist item fails.
- It remains a small departure from the approved picture's look: at 414 px the tracks start at x = 61, 78 and 100. I'd file it as a follow-up, or put it to the owner as a choice.

**Non-blocking:** N3 above. Nothing else.

**Questions for the owner:** none.

**Best captures to show on a phone**
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots-r2/vt1-row-5b-day5-one-outside-360x740-light.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots-r2/vt1-sheet-day5-one-outside-360x740-light.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots-r2/vt1-sheet-after-14-days-two-not-measured-360x740-light-full.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1/shots-r2/vt1-sheet-before-launch-360x740-dark-full.png

My captures and style dumps are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr-vt1/ (shots-r2/, dump-r2.jsonl, crop-v4-missed.png). Nothing in the repository was changed.
