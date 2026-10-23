# M3D stages 3, 4 and 5 (S-001 after MD3): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 as one hand-back of three reviews: stage 3 at 7f01fd5 against a57ad0e; stage 4 at c4b66e9 against 7f01fd5; stage 5 at db1474e against 657b85e.

---

One of the three stages fails, on one small point. Stage 4 (the Team screen and the lanes) fails: on a Chief of Staff log with several pieces of work under way at once, each row now names its piece, but on a phone 360 px wide that name is cut to one line, and tapping the row opens the sheet of a different piece. So the whole name is not one tap away, as the plan promises. Stage 3 (each "not yet" reason said once per group) and stage 5 (a Copy inside each choice, plus the answering fixes) pass. Two spec wordings pull against each other. They need the plan's author or the owner, not a fix: they are under stage 3, N2, and stage 5, N1. Nothing here is irreversible. I fixed nothing.

All crops are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-m3d-b/crops/ (called CROPS below). The compare and check logs are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-m3d-b/s3/log/, …/s4/log/ and …/s5/log/ (cmp2-*.txt are the diffs, qa-*.txt the overflow, contrast and target checks).

**How I checked.** I made detached worktrees of a57ad0e, 7f01fd5, c4b66e9, 657b85e and db1474e, and removed them when done. Chromium rendered at 360×740 and 414×896, light and dark. Fixtures came from tests/desk/fake-desk.mjs, always taken from the head, so only the page differed between base and head. The setups were main, md-extremes, sdq, unread25, letters, long, pick, the lanes-fixtures (cosLanes, ownerStubs), and copy setups with `contentPrefill: false` or `linkCap: 60`. "Nothing else moved" was checked by diffing, capture by capture, the visible elements' computed styles, their sizes and the rendered text. PNGs were deleted after cropping.

Locked page tests (ac80-board, ac81-bar-type, ac48-62-63-look), ac88-dark and each stage's new tests:
- 7f01fd5: 57 of 57 pass.
- c4b66e9: 69 of 69 pass.
- db1474e: 101 of 101 pass.

---

## Stage 3: build/builder/m3d-3 at 7f01fd5, against a57ad0e

Verdict: PASS

**Evidence**
- **Plan (AC90 Plan part; ruling P-001-audit-repeat A; part A items 1 and 2).**
  - Each group's head says the shared reason once: "6 milestones · no estimates yet" and "6 rough finishes not available: MD1 has no estimate yet". Other projects read "… Service-Desk's MD1 has no estimate yet"; Alpha reads "9 milestones · …". md-extremes reads "9 milestones · estimate not available".
  - The rows drop those lines. Plan at 360 px shrinks from 2966 to 2041 px.
  - A row's own sheet is unchanged: 24 of 24 Plan sheet captures have identical sheet text.
  - Crops: CROPS/s3-plan-groups-360-light.png and CROPS/s3-plan-groups-414-dark.png.
- **Timeline (AC90 Timeline part; frame 7b).**
  - Each band has one "Why not recorded yet for <k> of <n> milestones · for the agents to add" line, and its milestones drop their own Why line.
  - A milestone alone in its run keeps its own line (M3C under Launch).
  - Crop: CROPS/crop-s3-tl-top-dark.png.
- **Home (AC90 Home part).**
  - main reads "3 projects · why their run went back: not recorded"; md-extremes reads "6 of 7 projects · …" (the seventh can't be read).
  - Each tile's Now line becomes "Now: Design, run 2". No fixture record gives a went-back date, so there is no date to keep.
  - Crops: CROPS/s3-home-grouphead-360-light.png and CROPS/s3-home-grouphead-extremes-414-dark.png.
- **New lines (items 8, 10, 14, 27).** 12 px, weight 400, IBM Plex Sans. Contrast 6.4:1 in light and 7.72:1 in dark. Grey only; no vermilion added. Sizes on screen are 11, 12, 13, 15 and 24 px.
- **Width (items 6, 12, 25).** No sideways scroll in any capture, on any fixture, in either theme.
- **Nothing else moved.**
  - main: 692 captures, 616 identical. Every difference is on Plan, the Timeline, Home, or Plan behind its sheets.
  - md-extremes: 1104 of 1204 identical, with the same pattern.
  - sdq and unread25: only the same three screens. letters: 176 of 176 identical. long: 187 of 188 (one clock tick).
- **Part B.** Matches frame 6's "one line, not one on each row" pattern, and frames 7b, 11 and H5 as far as they draw it. No key added (item 35).

**Non-blocking findings**
- **N1 (item 32 "opened at Now"; AC90 "under its band").** The current run's shared line sits right under its band, above the planned rows and the Now line. When the Timeline opens at Now, MD2 and MD1 show no Why line, and the line that explains why is off screen above. It follows the spec's words. Crop: CROPS/s3-timeline-at-now-360-light.png.
- **N2 (AC90's rule against its own Timeline bullet).** When the line covers every milestone, the Timeline says "for 2 of 2", "3 of 3" or "6 of 6 milestones". Plan, Home and Team say "<n> milestones" as AC90's rule asks. But AC90's Timeline bullet itself writes "<k> of <n>". This is a tension inside the spec.

**Follow-ups (already there before the change)**
- Home tile names are 17 px tall targets in the full-page captures. The audit already closed this.
- One base capture (unread25, 414 light) had a failed fake pull-request read. That was a capture flake, not the page.

**Open questions**
- N1: should the current run's shared line be visible when the Timeline opens at Now?
- N2: should the Timeline say "<n> milestones" when the line covers them all?

---

## Stage 4: build/builder/m3d-4 at c4b66e9, against 7f01fd5

Verdict: FAIL

**Blocking**
- **B1 (item 2; AC49 as changed: each helper and end row adds " · <the piece's doing>", "cut at one line with the fade, the whole one tap away in the row's summary sheet").**
  - **Where:** the stage's own fixture with four pieces open together (`cosLanes()`, Lanes-four), at 360 px, light and dark.
  - **What renders:** all four helper rows are ringed "now". Each piece line is cut: 16 px box against a 34 px scroll height, class `over`, fading to `--surf`.
  - **What a tap does:** a row ringed "now" links to …/chief-of-staff/now, not to a summary sheet. That sheet names only the newest piece: "Chief of Staff: Made-up piece D, open with three others".
  - **The result:** on the rows for pieces A, B and C the name is cut, its whole is not one tap away, and the tap opens another piece's sheet.
  - **Scope:** at 414 px the names fit. Rows that are not ringed "now" pass: an end row's sheet reads "Handed back · 10 min 0 s · 04:00 · Made-up piece D". The four "now" rows were already there at 7f01fd5. What is new is the cut name.
  - Crop: CROPS/s4-cos-four-open-360-light.png.

**Evidence that passes**
- **AC67 (ruling P-001-audit-team B).**
  - The key is gone: its five words and `span.sb-keye` are missing from every Team capture.
  - Idle members fold into one line: "10 idle ›" (Service-Desk), "9 idle ›" (Alpha), "2 idle ›" (Letters), and "1 idle ›" in the singular (Zeta).
  - The fold is closed by default; opened, its cards show as built. The line is a 44 px control, 12 px, weight 400, in ink (16.99:1 light, 15.15:1 dark).
  - The owner's tile, the Chief of Staff (not idle) and the working Builder stay as cards, in AC49's order.
  - Crops: CROPS/s4-team-folded-360-dark.png and CROPS/s4-team-opened-360-light.png.
- **AC90 Team part.** "5 of 10 members · last work not recorded in what the desk reads" sits once at the head of the opened idle list, and the cards it covers drop that line. Contrast 6.4:1 light, 7.72:1 dark.
- **AC49 lane looks (rulings P-001-desk-v2-lanes A and P-001-lanes-alike A).** Read from the page:
  - Four open together take four looks (shades 0 to 3).
  - When a fifth lane on the log opens while the first is open, E takes look 2, not A's look 0. C also has look 2, but C and E are never open together.
  - With five open together, E shares look 0 with A, as ruled.
  - On the owner's log, Q-901 to Q-903 take looks 0, 1 and 2, with stubs on the dashed and dotted lanes.
  - Every helper and end row names its piece; each "Started:" row already names it.
  - Descenders are not clipped: the box is 16.2 px against a 16.8 px line. Crop: CROPS/crop-s4-cos-fifth-360-dark.png.
- **Pipeline logs.** Only the lane looks changed. No text changed on any member log in main or md-extremes.
- **Nothing else moved.**
  - main: 516 of 692 captures identical. Every difference is on Team screens and member logs.
  - md-extremes: 1060 of 1204 identical. sdq, unread25 and letters: only their Team screens.
- **Part A items 10, 11, 12 and 25 pass.** Part B: mockup v2 draws no Team screen (conflict 8 is still open), so part A applies. Item 35: the key is removed.

**Non-blocking findings**
- **N1 (item 1, the screens as built).** "10 idle ›" keeps its "›" when open. Home's group heads switch chevrons to show open or closed. `aria-expanded` is correct.
- **N2.** One sheet capture read 2.65:1. It was caught during the sheet's fade-in; it is the same colour that measures 6.4:1 everywhere else. Not a finding.

**Follow-up (already there before the change)**
- A "From the record" link on a member's summary sheet is 87×15 at 414 dark. It is the same at 7f01fd5; possibly the inline exception.

**Open question**
- On a log with several pieces under way, which sheet should a "now" row for an older piece open?

---

## Stage 5: build/builder/m3d-5 at db1474e, against 657b85e

Verdict: PASS

**Evidence**
- **AC17 (ruling P-001-audit-copy A; item 17).** Checked with `contentPrefill: false` and with `linkCap: 60` on:
  - Letters: the lettered, numbered, gate, mixed, unlettered, no-default, overdue and long-title sheets;
  - Alpha's decision card and gate;
  - Service-Desk's questions.

  On every one of them:
  - each choice's box holds one "Copy" (aria-label "Copy: Answer A" and so on);
  - nothing sits above the choices: no Copy, and no visible answer text;
  - the cause's words sit under the choices;
  - every answer link holds the file name only (no `value=`);
  - the numbered question has one Copy beside its one "Answer ↗";
  - each Copy's text equals its file in the fold, character for character, with and without the owner's words typed (probe pressed each Copy);
  - Copy buttons are 36 px tall, 12 px, weight 500.

  Crops: CROPS/s5-copy-in-choice-360-light.png, CROPS/s5-copy-gate-414-dark.png and CROPS/s5-decision-fold-360-light.png.
- **AC89 (j), past settle times.**
  - Sheet: "Was due to settle itself as B on 19 Oct, 10:00 (per the question file: 24 hours); not settled yet".
  - Card: "Was due to settle as B · 19 Oct, 10:00".
  - Briefing: "one question was due to settle itself 19 Oct, 10:00 · 3 questions settle themselves, the first Tue 14:59".
  - The older fixtures change the same way (15 Oct, 8 Oct, 16 Oct). The base read "Settles as B · Mon 10:00", a weekday for a past time.
  - The 1 Nov clock change was checked by the passing test only; I did not render it.
  - Crop: CROPS/s5-board-cut-due-360-dark.png.
- **AC89 (j), the default line.** It reads "Default, per the question file:", then the file's own words set apart as quoted record text (13 px, `v2-quote`). "Default: not given" shows where the file has none. Crop: CROPS/crop-s5-default-360-dark.png.
- **AC89 (j), other answering points.**
  - Split messages are true: "a line between its options is neither lettered nor numbered". The real design-pick file reads "one of its lines …", and its last line is in fact the unlettered one.
  - A v2.5 question's copy text is now AC19's form, "Ruling: A" (Delta-1 in md-extremes).
- **AC89 (j), three-line cuts.**
  - Board card titles: 47.88 px = 3 × 15.96 px.
  - Plan's gate row: 3 × 17.55 px.
  - The gate sheet's title: 3 × 23.4 px, with "Read it all" under it.
  - The fade is a mask, drawn only when the text is cut: across 7,602 faded titles, none fades without a cut and no cut lacks a fade.
  - Crop: CROPS/crop-s5-gate-title-360-light.png.
- **Nothing else moved.** In board-and-sheets mode, every difference is one of the points above: main 48 of 136 captures identical; md-extremes 48 of 440, plus letters, long, pick and sdq.
- **Part A items 9 to 12, 25, 27 and 34 pass.**
  - No sideways scroll, no contrast failures.
  - Sizes on screen are 11, 12, 13, 15, 18 and 24 px.
  - "Was due" keeps the clock icon and its words, so it stays told apart from the lock.

**Non-blocking findings**
- **N1 (AC89 (j) "the whole one tap away"; item 16).** For a gate card on the board, and for Plan's gate row, a tap opens a gate sheet whose title is cut again. The whole title is a second tap away. This is a spec tension: the spec also asks for the sheet's title to be cut.
- **N2 (item 19).** The decision card's fold is still labelled "The whole record". The question and gate folds say "· and the file each answer writes". The Copy-failed text points to "the fold below".
- **N3 (follow-up, already there before the change).** A choice's "Copied" label stays after the owner types new words, though pressing it again would copy different text.

**Coverage notes**
- Stage 5 was rendered in board-and-sheets mode: Team and member pages were not re-rendered, since stage 5 changes none of their code.
- For stages 3 and 4, I stopped the pf-x-cards runs (md-extremes plus the portfolio). md-extremes itself was fully covered.

**Open questions**
- N1: should a gate's title be cut on both the board and its sheet, given that this puts the whole title two taps away?
- N2: should the decision card's fold say it holds the answer files?