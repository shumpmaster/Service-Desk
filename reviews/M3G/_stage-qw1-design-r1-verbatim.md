# M3G stage QW1: the Design reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/builder/qw1 at a765ea5 (QW1's work over c2f6f94).

---

Verdict: PASS

QW1 at a765ea5 matches the approved picture, minus the parts the spec leaves to QW2 and QW3: the "<k> of <N> waiting" place lines, "Answer first" and the blocker order. It also carries all four of the owner's detail answers. I found no blocking failure. I took my own renders as well as reading the Builder's 24 captures, because the Builder's captures miss one case (N2). Home, a project's page and Plan render the same before and after the change. The full suite passes: 1393 of 1393.

**Blocking findings**
None.

**Evidence, item by item** (every render was made with Playwright and Chromium, from a scratch copy of the tree. Nothing was written to the repository.)
- **The section against the picture (P-001-m3g-picture, A; part B item 26).**
  - The busiest case matches frame 1. The head reads "Questions for you · 5 · 1 being asked in your session" over a hairline. The grey line sits under the head. Each project's group has its folder icon and count.
  - Each question has, in order: its kind line, its title, its meta line with the age, its lock or clock line, its choice boxes, "Add your own words ›", then "More about it ›" and "Done ✓".
  - Beta alone matches frame 3: the chip, then the section, with no group head.
  - The empty case matches frame 4: "Questions for you · none" sits above the quiet line and "Kicked back · none".
  - The only differences are the QW2 and QW3 parts and the owner's answers: the age line, choices on the first three, "Show choices ›", and a held question with no "Done ✓".
- **Type, colour, spacing and the 36 px buttons (items 8, 9, 10, 23, 25, 27).** Computed in the section, at both widths and in both themes:
  - Sizes are only 11, 12 and 13 px. Weights are only 400, 500 and 600.
  - IBM Plex Sans and Plex Mono load: 400, 500, 600 and Mono 400.
  - The head is 12 px 600 in `--ink`, with its count and " · " in Plex Mono 11 px `--ink2`.
  - Titles are 13/500 (`--t-row`). The held line is 13/400 in ink. The meta line is Plex Mono 11 px.
  - Each choice box has 10 px by 12 px padding, a 12 px corner and 8 px between boxes. Every answer and copy button is 36 px tall. The words box is 16 px.
  - The lowest contrast is 6.18:1 in light and 7.20:1 in dark.
  - The CSS diff adds no colour, size or weight (src/public/sandbox.css:618-628).
- **Choices never cut (AC94).**
  - Every element in each card's body stays inside its card, and none is clipped, in every state. That includes Epsilon's six long choices, among them an unbroken 80-character word, which wrap inside their box.
  - Renders: r-busiest-all-*.png and r-one-epsilon-*.png.
  - The kinds case was also checked: numbered as text over "Answer in its sheet ›", can't-split lines, "Its choices are in its sheet", and v2.5 "Copy answer <letter>" and "Copy the answer".
- **Titles cut at three lines (item 16).** The busiest case measures 2, 1, 1, 1, 1 and "3 cut". All five of md-extremes' titles measure "3 cut", with the fade, and the whole title is in the sheet.
- **The age is shown (P-001-m3g-age-double, A).** Examples: "M3G · 1 d 6 h", "20 h 4 m" on the kicked-back question, "2 d 2 h".
- **Grey line beside the red quiet line (age-double, A).**
  - The grey line "Delta not read since 10:02, its new questions may be missing" is `--ink2`, rgb(92,95,102) in light and rgb(162,165,172) in dark, under the head.
  - The red "✕ Can't read Delta since 10:02" sits below the section.
  - The same holds under the "none" line: r-every-state5-none.
- **Order on Waiting.** Measured: title, section, quiet lines, strip, lanes.
  - G9c's lines are kept below the section (g9c-waiting-*, re-rendered on QW1):
    - failed-held shows "· none" with Alpha's grey line, and "Still reading Service-Desk…" below;
    - first paint shows "· not read yet" above the four "Still reading…" lines;
    - signed out shows three grey lines, one per project, then the one "✕ Signed out — reload to sign in".
- **One project shown.**
  - Delta and Beta: chip, section, strip, lanes.
  - The held question reads "Also asked in your session: answer in one place", with no "Done ✓". Its sheet has no "Move to Done".
  - The kicked-back question shows "Kicked back · Question" with its reason.
  - Epsilon's long name in the chip: no sideways scroll.
- **Empty, and state 5.** One project in state 5 reads "Questions for you · none when last read", above "Kicked back · none when last read", with the grey line under it. With every project shown it reads "· none" (r-one-alpha-state5-none, r-every-state5-none).
- **Width (items 6, 12).** Nothing scrolls sideways at 360 or 414 px in my 60 renders or in the 580 renders of the whole capture tool on QW1. The renders cover service-desk/ and poom/ (textState and mixState), md-extremes/ (extState and busiest), and kinds.
- **Other items.**
  - Item 3: the badge reads 25 before and after; lane 20 plus section 5.
  - Item 4: "not read yet" while reading, never "none".
  - Item 13: "Recommended" is a word.
  - Item 14: vermilion only on the question and kick icons.
  - Item 15, the minute's refresh: open folds, words and scroll are kept (checked after 130 s).
  - Item 17: one box per option, recommendation labelled and not picked.
  - Item 20: times in Chicago.
  - Item 24: no motion added.
  - Tests: ac94, ac88, ac81, ac91 waiting and ac80 pass, 86 of 86; the full suite passes, 1393 of 1393.

**Anything else changed?** None found. I rendered all 139 capture states at both widths and in both themes, 556 renders, on 870a74c and on a765ea5, and compared them pixel by pixel.
- Home, page, Plan, Timeline and member renders are identical, apart from one-digit clock differences between runs (diff boxes about 12 px wide on "checked N s ago" and "since 10:01/10:02"). My text dumps of Home, Beta's page and Plan on the busiest state confirm the same.
- Only Waiting and sheets over Waiting differ, which is expected.

**Non-blocking**
- **N1. A full reload closes the section's folds.**
  - Words typed under "Add your own words" are kept on the device: they show in the sheet, and again when the fold is reopened. But the fold comes back closed and gives no sign that it holds words.
  - The kept scroll (1645) comes back at 1409 or 1449, because the page is shorter with the folds closed.
  - P-001-audit-reload.md, A ("typed words and scroll come back after a full reload") is kept to the letter, but the owner doesn't see their half-written answer. The minute's refresh is fine.
  - Renders: f-refresh-*.png. See Q1.
- **N2. The Builder's captures have a gap.** qw1-busiest-folds opens only Gamma's and Delta's "Show choices". Epsilon's long choices, the hardest "never cut" and width case, appear in none of the 24 captures. My r-busiest-all-*.png and r-one-epsilon-*.png fill the gap; the tool could add the case.
- **N3. Fixture note.** The real Service-Desk fixtures (j11-77bfeae, service-desk/) hold no open question, so Service-Desk's own section is only seen through made-up projects. poom's v2.5 form is covered by Delta and Ledger.

**Questions for the owner**
- **Q1.** After the phone fully reloads the desk, should an "Add your own words" fold that holds kept words open again, or at least show that it holds them? The reload ruling covers typed words and scroll. AC94 says the fold is "closed to start" and settles nothing about a reload, so I am not choosing between them.

**Captures for the owner** (the Builder's, in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1/shots/)
1. qw1-busiest-360x740-light.png — the section at the top of Waiting with the grey line, the age, and the first question's choices; show it beside the picture's frame 1.
2. qw1-busiest-folds-360x740-light.png — "Show choices ›" opened in place (numbered as text over "Answer in its sheet ›", v2.5 copy boxes), saved words in the fold, then the red quiet line, the strip and the lanes.
3. qw1-one-beta-360x740-light.png — one project: the held question ("Also asked in your session…", no "Done ✓") and the kicked-back question with its reason.
4. qw1-empty-360x740-light.png — "Questions for you · none" above "Kicked back · none", as frame 4.
5. qw1-kinds-360x740-dark.png — every kind of question, in dark.

Optional: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1rev/rev-out/r-one-epsilon-414x896-dark.png, for the long names and choices.

**Beside the picture?** Yes, one pair. Put /home/user/sd-qw1/docs/design/builds/m3g-picture/m3g-f1-board-360-light-first-screen.png next to qw1-busiest-360x740-light.png. Say in the caption that the missing "1 of 12 waiting" and "Answer first" lines come in QW2 and QW3. The age line and "Show choices ›" are the owner's own answers.

Everything I made is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1rev/:
- my renders and style dumps: rev-out/ (report-*.json);
- the before and after renders: all-base/ and all-head/, x-base/ and x-head/;
- the suite log: suite.log;
- my capture script: tools/rev.mjs.
