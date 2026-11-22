Verdict: PASS

The design reviewer's verdict on PR #465 (src/public/**: the card fix's build, S-014), at branch build/builder/p003-fix 9633e9a, verbatim below. It ran read-only in a fresh session on 2026-11-22 from about 18:55Z to 19:05Z and rendered the real page in Chromium, light and dark, at phone and desktop widths. Recorded by the orchestrator.

## The design reviewer's return

Verdict: PASS

The new card-sheet line and the three "not shown" lines from AC16 and AC17 all render legibly, at phone and desktop widths, in light and dark. Their wording matches S-014 exactly, and they appear only where the spec puts them. The recommendation is labelled, never picked, and only the notes' word is marked. A card shown after a day carries "No Chief of Staff recommendation yet" and no marked button. None of these breaks a standing ruling or part A of the checklist. Nothing blocks. I have three things to raise:
- On Home the line is plain grey with no ✕, while the queue shows the same words in red with the ✕. S-001 says "every can't-read line carries the ✕", which points one way; the Builder says AC92 (a)'s palette check points the other. The spec doesn't settle this, so it goes up as a question (Q1), not a FAIL.
- On Home with several projects the line doesn't say which project it means.
- One harness detail is worth knowing (N5).

**1. Method**
- I rendered the real page in Chromium (Playwright 1.63, deviceScaleFactor 1), not the fake DOM: index.html, app.js and the worktree's src/public, unchanged.
- A small server under /tmp/dr-p003/ answered /api/* with the tests' `fakeServer`. The projects were the committed config (Service-Desk, Model-Lab, POOM v2.5). The Service-Desk and Model-Lab repositories were `fullRepo()` from tests/desk/sandbox-fixtures.mjs, and the page clock was fixed at the fixtures' NOW.
- Scenarios:
  - notes with `drop` ("rec");
  - no notes, raised 30 h ago ("none");
  - failed reads of queue/, the notes, both, and the log. I tried them both ways: `blobFail` (the whole call fails) and `blobNull` (one file unread).
  - two projects failing at once, and Model-Lab alone failing.
- Captures were at 360×740, 414×896 and 1280×900, light and dark: 60 PNGs in /tmp/dr-p003/shots/. The key ones:
  - /tmp/dr-p003/shots/rec-recline-light-360.png
  - /tmp/dr-p003/shots/rec-recline-dark-1280.png
  - /tmp/dr-p003/shots/none-sheet-dark-414.png
  - /tmp/dr-p003/shots/home-notes-light-360.png
  - /tmp/dr-p003/shots/queue-both-dark-360.png
- Fonts were confirmed loaded: IBM Plex Sans 400/500/600 and Plex Mono 400. There were no page errors in any capture.
- Tests: `node --test` on s014-decision-cards, s014-ac13-count, ac92-glance-palette, ac85-sheets, ac17-18-sheets, ac91-glance-home, ac88-dark and ac48-62-63-look gave 94 pass, 0 fail. The worktree is untouched (`git status --porcelain` is empty).

**2. Evidence per checklist item**
- **AC2 and A17 (answering).** The sheet's line reads "[Recommended] The Chief of Staff recommends drop". The rule puts `.v2-rec` on that line and on the `drop` option only, so exactly 2 `.v2-rec` sit inside `.v2-sheet`. Nothing is pre-selected. Code: src/public/lib/sandbox.js:955-957 and src/public/lib/board.js:454-455.
  - Before the change, this line printed section 5's "The Chief of Staff's part: `decisions/…-notes.md`". The new line is clearer.
  - The "Recommended The Chief of Staff recommends…" wording repeats itself (N1), but it is plain, and the pill-then-text pattern is the one already built.
- **AC4 and AC3.** After a day with no notes, the line reads "No Chief of Staff recommendation yet". It is set as before (`.v2-body`, 13px/400, ink: rgb(24,25,28) light, rgb(236,237,239) dark), and there are 0 `.v2-rec` in the sheet. Section 5 marks nothing. Code: src/public/sandbox.js:3714. The sheet header shows the real age ("waiting 1 d 6 h").
- **AC16 and AC17 lines (A3, A4, A19).** The exact spec words render in every case:
  - "Decision cards not shown: queue/ could not be read"
  - "Decision cards not shown: the Chief of Staff's notes could not be read"
  - "Decision cards without Chief of Staff notes not shown: the dispatch log could not be read"

  With both reads failing, both lines show. Placement:
  - **Queue (#/waiting/Service-Desk):** under the "Can't read Service-Desk in this opening: …" line, as `p.v2-ql.still.bad`, with a 14×14 ✕. Code: sandbox.js:3162-3164.
  - **Home's brief:** as `span.v2-bt3`, 12px/400, rgb(92,95,102) light and rgb(162,165,172) dark, with no ✕. Code: sandbox.js:776-783.
  - **Board (#/waiting):** none of these lines (checked: only "Nothing waiting…", "Can't read Service-Desk…" and the portfolio line).
  - **Repeats:** each line shows once. With notes failing in two projects, Home shows one deduplicated line.
  - **Counts and quiet:** Home never says quiet. The project reads "Can't read Service-Desk in this opening", and the count drops by the hidden card (13 → 12). That is honest under A3 and A4.
- **A10 and A25 (contrast).**

  | Text | Light | Dark |
  |---|---|---|
  | Home grey line | 5.97:1 on #f7f7f8 | 7.41:1 on #141517 |
  | Queue red line | 6.85:1 | 6.91:1 |
  | Sheet mark | 17.58:1 | 16.25:1 |
  | Recommended pill | 15.58:1 | 13.57:1 |

  All pass 4.5:1.
- **A12 (width).** scrollWidth equals the viewport at 360, 414 and 1280 in every capture, light and dark. The long lines wrap to two lines at 360 (home-notes-light-360.png, queue-both-dark-360.png).
- **A13 and A14 (colour).** The queue line copies the existing can't-read look: words and ✕ both in --bad (#b3162a / #ff6b78), the same as "Can't read Service-Desk…". S-001's AC92 (a) notes keep "error and can't-read lines… red", so this is not a new use of red. The Home line uses no colour that means anything, and no vermilion was added.
- **A8, A23 and B27 (type).** The sizes used are 13, 12 and 11 px and the weights 400 and 500, all within the v2 scale. All text is IBM Plex Sans.
- **A6 (every project).** POOM (v2.5) and Model-Lab rendered beside Service-Desk without error. I did not render md-extremes in the browser; its fake-DOM tests are in the suite the Orchestrator runs.
- **A9, A11, A15, A21 and A22.** Untouched by the diff. The sheet's close control measured 44×44, and the text box is 16px.

**3. Blockers**
None.

**4. Non-blocking notes**
- **N1 (A19, plain words).** "Recommended The Chief of Staff recommends drop" says "recommend" twice. "Recommended · Chief of Staff" or the pill alone beside the word would be tighter. This is not a rule breach.
- **N2 (A19).** On Home with several projects, the AC16/AC17 line names no project. It sits under every "Can't read <project>" line, and in the build the portfolio line comes between them. So with Service-Desk and Model-Lab both failing in different ways, the owner can't tell which project's decision cards are hidden without opening each project's queue, where the line does sit under its project. The spec fixes the words but not whether a project prefix may be added. That is worth a Definer question.
- **N3 (A19).** "queue/" is a path shown as plain prose, not in small monospace. The spec gives the exact words, so this is a note only.
- **N4 (consistency).** The queue line has the ✕ and red; Home's has neither. This is the same issue as Q1.
- **N5 (harness).** With identical notes text in two repositories, the page reuses a blob read by sha from the other project. So a `blobNull` on one project's notes showed no line and the card as recommended. That is correct in that the content was got, but test fixtures should keep per-project texts unique.
- **Watch-for list.** Nothing new in this diff.

**5. Already there before the change (follow-ups)**
- Home's and the queue's existing can't-read lines colour their words in --bad. P-001-glance2-palette.md's line 1 says "on the 14–16 px mark only, never on words". S-001 AC92 (a) and AC91 (c) read it as keeping can't-read lines red, words and ✕. I am not ruling between them; I note it only.

**6. Open questions**
- **Q1 (to the Definer or owner, not picked here).** Should Home's AC16/AC17 lines carry the ✕ in --bad and red words, like the other can't-read lines?
  - For: S-001 settles that "every can't-read line carries the ✕ (AC91 (c))" and puts "Can't read" in one treatment across screens.
  - Against: per the Builder, AC92 (a)'s palette test fails a new --bad use in the brief. I did not verify that claim, because I may not change files to try it.
  - The spec text and its check point different ways, so it is a question, not a FAIL.
- **Q2.** Should a multi-project Home line name its project (N2)?