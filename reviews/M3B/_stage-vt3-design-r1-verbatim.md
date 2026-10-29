# M3B stage VT3: the Design reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/builder/vt3 at 99154a5 (VT3's work over 55a2484).

---

Verdict: FAIL

**Summary for the owner.** One thing fails. When you tap the new line on Home, the targets' sheet opens just short of the end of its weekly block. The block's last line, "Notes are kept on this device for 8 weeks, then dropped.", sits just below the bottom of the screen. It's hidden in every capture, at both phone widths and in both themes, and the Builder's own captures show it too. The approved picture shows the whole block with that line visible. The cause is a timing slip. The sheet scrolls to the block before the stop rule's "Read it all" row has been added, and that row then pushes the block down 34 px. This is a small fix and nothing is permanent. Everything else holds:
- The new line sits quietly between the portfolio block and "More detail". It's never counted, never coral, never notified, and has no box.
- The sheet's weekly block reads as the spec words it, newest week first, with trial weeks grouped under one line.
- Contrast, tap sizes, widths and dark mode all pass.
- With nothing to save, Home and the sheet are pixel-identical to before.

There are two smaller points, and two questions for you below. One is whether "never changes it", printed right above an offer to save into that same repository, reads as a contradiction.

**Blocking**

**B1. The tap doesn't land on the whole block** (checklist items 1 and 2; the spec's "scrolled to its block 'Your weekly figures'", AC25 and VT3's row; the approved frames: round 2's weekly-figures frame and the Home frame's "With one week to save").
- In every sheet capture, the sheet stops 34 px short of its end (scrollTop + clientHeight = scrollHeight − 34). At 360 px with one week: the block runs from 655 to 748, the sheet's visible bottom is 732, and the notes line is at 731–748. With eight weeks the block starts at 326 and the notes line is again hidden. The same happens at 414 and in dark.
- Cause, measured: at the moment of the scroll the sheet's scrollHeight is 1080 and the stop rule's section is 90 px tall. About 40 ms later the section is 124 px and scrollHeight is 1114. The "Read it all ›" row is added after the scroll was clamped. The code is at `src/public/sandbox.js` (the `nav.scrollWeekly` block in `startSandbox`), and it intends to put the block at the sheet's top.
- At full scroll the sheet shows exactly what the frame draws (see the second capture below).

**Non-blocking**

**N1. The line's chevron is heavier than the picture's** (approved Home frame, m3b-overview-4; "quiet").
- The picture draws a small grey chevron (`--ink2`, rgb 92,95,102), like the portfolio rows above it.
- The build draws a 14 px chevron in `--ink` (rgb 24,25,28), via `vi('chev', 'v2-k')` in `weeklyLineNode`. That makes it the darkest chevron at Home's foot; "More detail" and the portfolio rows use `--ink2`.

**N2. The sheet opens with its close control scrolled out of view** (item 15; P-001-trial-view-notes-1: "Every sheet has a visible close control").
- On landing, the close sits at y −329 (one week, 360 px), because the sheet's head scrolls with its content. This was already so whenever the sheet was scrolled.
- Escape and a tap outside both close the sheet (verified). Both approved frames draw the sheet opened at the block with no close showing, so I'm asking rather than failing it (question 2).

**Checked and holding**
- **Place and order:** Home's foot runs hgroups → portfolio → home-weekly → home-more-detail; "More detail" stays last and closed.
- **Words, exact:**
  - Home: "Last week's desk figures are ready to save", "8 weeks of …" and "2 weeks of …" (two older weeks). "A week of desk figures is ready to save" is covered by the Builder's tests (`ac25-weekly-page.test.mjs:210`; I didn't render that case).
  - Sheet: "Your weekly figures", "Save the week of 9 Nov ↗", "Before launch: a trial, not counted" (once, above the trial weeks; first in the all-trial case), "Notes are kept on this device for 8 weeks, then dropped.", and Copy with "Copy the week" past linkCap.
- **Quietness (items 3 and 14):** the line has a transparent background, no border and no icon of its own. No element in the line or the block uses the coral `--you` colour. The badge and briefing are unchanged.
- **Type scale (items 8, 23 and 27):**
  - Home line: 13 px / 400, IBM Plex Sans (`--t-body`).
  - Block head: 11 px / 500.
  - Week buttons and Copy: 12 px / 500.
  - Small lines: 12 px / 400.
  - Copy text: 11 px Plex Mono.
  - All sizes and weights are on the scale, and the Plex fonts were confirmed loaded.
- **Contrast (items 10 and 25), light / dark:** line 17.58 / 16.25; head and small lines 6.40 / 7.72; buttons 15.58 / 13.57; Copy text 16.42 / 15.60.
- **Tap targets (item 11):** line 328×44 (382×44 at 414); week buttons at least 162×36; Copy 105×36; close 44×44.
- **Width (item 12):** no sideways scroll on the page or the sheet in any capture, at 360 and 414, light and dark.
- **Storage throwing:** no line and no block.
- **Nothing else changes:** I rendered the base commit 55a2484 with the same fixtures. Home and the sheet with no offer are pixel-identical to the base in all four sizes and themes. With an offer, Home's text equals the base's plus the one line (other than the "checked N s ago" clock).
- **Item 6 fixtures:** with no portfolio configured, Home is identical to the base. The line needs Service-Desk's plan and the portfolio, so the poom and md-extremes fixtures draw no line.
- **Refresh and close (AC56):** a refresh at the weekly address keeps the owner's own sheet scroll (100 before and after), and a tap outside closes the sheet.
- **Tests:** the full desk suite passes, 1542 of 1542 (`node --test ../tests/desk/*.test.mjs`). The worktree was left clean.

**Questions for the owner (asked, not picked)**
1. Home's line "The desk reads your portfolio repository and never changes it" now sits directly above "Last week's desk figures are ready to save ›", which saves a file into that same repository. Technically the desk still writes nothing: you save the file on GitHub, as with answer links. The approved picture draws the two lines together. Does it read as a contradiction to you? Options: (a) keep it as drawn; (b) reword one of the two lines; (c) separate them. Which do you want?
2. Your ruling says every sheet has a visible close control. The approved picture opens the targets' sheet at "Your weekly figures" with the close scrolled away; Escape and a tap outside still close it. Is that acceptable for this one entry? Or should the close stay in view when the sheet opens part-way down?

**3 best captures** (my own, made with Playwright and Chromium)
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/shots/sheet-eight-360-dark.png`: the landing after the tap, with trial weeks grouped and the notes line hidden (B1).
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/shots/probe-maxscroll.png`: the same sheet scrolled the last 34 px, showing the whole block as the frame draws it.
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/shots/home-one-360-light.png`: Home's foot with the line, the "never changes it" line above it, and the darker chevron (N1).

All measurements are in `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/shots/report.json`. The base-commit renders are in `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/base-shots/` and `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/base-shots-sheet/`.
