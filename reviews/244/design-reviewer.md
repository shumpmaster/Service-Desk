Verdict: PASS

The Design reviewer's verdicts on QW1 (PR #244), verbatim: round 1 at a765ea5 (PASS), round 2 at 7ae05da (PASS). After round 2 the source changed only in the re-read words' per-project order (dcad3b4, the Reviewer's round-2 N1), and the capture tool (0c52972) at this reviewer's N1. Recorded by the orchestrator.

## Round 1
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

## Round 2
Verdict: PASS

Round 2 of QW1 (build/builder/qw1 at 7ae05da) carries out your answer on the reload fold (P-001-m3g-reload-fold.md, A) as you chose it, and nothing else on the screen changed since round 1. I found no blocking failure. One of the Builder's 28 refreshed captures no longer shows what its description says (N1), so don't show that one to you. The full suite passes, 1401 of 1401. I wrote nothing to the repository.

**Blocking findings**
None.

**Evidence**

*Your reload-fold answer (item 15).* I typed words in the section's own "Add your own words" box, then fully reloaded the page. Measured at 360 and 414 px, light and dark, each run several times:
- **The fold opens again with the words.** Before the reload: scroll 471 px, box top 300 px, words "Made-up words typed in the section". After the reload: the same three. The fold is open in the first drawing and the scroll lands where it was.
- **"Show choices ›" isn't opened.** A "Show choices" fold opened before the reload comes back closed; the words fold still reopens and the scroll still lands at 471.
- **A fold with no kept words stays closed.** It was opened but left empty before the reload.
- **A fold you close stays closed.** After the reopened fold was closed, it stayed closed through two minutes of the desk's polling.
- **One expected side effect.** An empty fold that was open above the scroll point closes, so the page shifts up by that box's height (1645 → 1527 px in my round-1 test). That is what the "stays closed" reading means, not a fault.
- In 1 of 15 runs my script measured before the page had drawn (section not drawn yet), so that run says nothing either way.
- The page with the reopened words: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1rev/rev2/g-reload-words-360x740-light-viewport.png

*The Epsilon capture (round 1's N2).* qw1-epsilon-choices shows all four sizes.
- Six long choices, including an 80-character unbroken word, wrap inside their boxes.
- The buttons are 36 px tall, the title is cut at three lines, and nothing scrolls sideways.
- It is a full-page capture, so the fixed tab bar covers one choice: D at 360 light, F at 414 dark. My r-one-epsilon renders show every choice.

*Nothing else changed since round 1.*
- **Source diff (a765ea5..7ae05da).** Only three things in src/public/sandbox.js: which "Add your own words" folds start open (`keptAtLoad`), which re-read words stay under the head (only "Already answered" and "being recorded", B1), and the dropping of the other re-read words. No CSS change.
- **Every capture state re-rendered.** All 145 states at both widths and themes, 584 renders, compared pixel by pixel with round 1. The only differences are:
  - one-digit clock differences between runs;
  - Epsilon's 4 new captures;
  - qw1-busiest-folds (N1).
- **My own 36 review renders.** Busiest with every fold open, Epsilon alone, both state-5 cases, every kind of question, the mixed fixtures with Service-Desk and Personal-Org-Operating-Model, md-extremes, and the held question's sheet. Same computed styles and section text as round 1, apart from clock digits.
- **Item by item.** Round 1's checks all still hold:
  - sizes only 11, 12 and 13 px; weights 400, 500 and 600;
  - IBM Plex loaded; words box 16 px;
  - contrast at least 6.18:1 in light and 7.20:1 in dark;
  - nothing scrolls sideways anywhere;
  - order: section, quiet lines, strip, lanes;
  - the grey line in the section, the red line below it;
  - age shown; choices never cut; titles cut at three lines;
  - "none when last read" in state 5;
  - Home, project pages and Plan as before.
- **Tests.** The full suite passes on the 7ae05da tree, 1401 of 1401, including the round-2 cases for B1 and the reload fold.

**Non-blocking**
- **N1. qw1-busiest-folds no longer shows saved words.** The capture tool still clicks Alpha's "Add your own words" (tests/desk/tools/glance-shots.mjs, qw1-busiest-folds `click` list). Since round 2 that fold opens by itself, because the capture's setup keeps words for it, so the click now closes it.
  - The capture is 118 CSS px shorter than in round 1 and shows the fold closed with no words.
  - Its description still says "opened over words the device keeps".
  - The desk is behaving as you ruled; only the capture is out of date. Drop the click or change the description, and don't pick this capture for you.

**Questions for the owner**
None.

**Captures for the owner** (the Builder's are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1/shots/)
1. **qw1-busiest-360x740-light.png** — the section at the top of Waiting: the grey line, each question's age, and the first question's choices.
2. **qw1-one-beta-360x740-light.png** — one project shown: the question also asked in your session ("Also asked in your session: answer in one place", no "Done ✓"), and a kicked-back question with its reason.
3. **qw1-empty-360x740-light.png** — "Questions for you · none" above "Kicked back · none", as frame 4 draws it.
4. **qw1-epsilon-choices-414x896-dark.png** — the longest names, title and choices, in dark, nothing cut. The tab bar covers choice F in this full-page capture.
5. **/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1rev/rev2/g-reload-words-360x740-light-viewport.png** (mine) — your reload answer on screen: after a full reload, the fold is open with your words, where you left them.

**Beside the picture:** yes, one pair. Put /home/user/sd-qw1/docs/design/builds/m3g-picture/m3g-f1-board-360-light-first-screen.png beside qw1-busiest-360x740-light.png. Caption it so the differences read as planned:
- the "1 of 12 waiting" and "Answer first" lines come in QW2 and QW3;
- the age line and "Show choices ›" are your own answers.

Everything I made is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1rev/:
- rev2/ — my round-2 renders and style dumps;
- all-head/ and all-head2/ — the full capture sets for round 1 and round 2;
- suite2.log — the full test run.

