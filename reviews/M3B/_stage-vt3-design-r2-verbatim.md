# M3B stage VT3: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/builder/vt3 at fc5607c (VT3 round 2, with draft 13 merged).

---

Verdict: PASS

**Summary for the owner.** Round 1's one failure is fixed. When you tap "Last week's desk figures are ready to save" on Home, the targets' sheet now opens with the whole "Your weekly figures" block on screen, including its last line, "Notes are kept on this device for 8 weeks, then dropped." That holds on both phone widths, in light and dark, with one week to save and with eight. It stays put while the page finishes drawing, and lets go as soon as you scroll yourself. The line's arrow on Home is now the same quiet grey as the other rows there, as the approved picture draws it. On a phone with no Escape key you can still close the sheet: a band about the height of a thumb stays visible across the top of the screen, and tapping it closes the sheet. Nothing else on Home or the sheet changed. Nothing here is permanent.

**Round 1's findings**
- **B1, fixed.** At every width, case and theme, the sheet now lands at its full scroll (scrollTop equals scrollHeight − clientHeight), with the block's bottom inside the visible sheet:

  | Case | 360 px (sheet bottom 732) | 414 px (sheet bottom 888) |
  |---|---|---|
  | One week | block 621–714 | block 777–870 |
  | Eight weeks | block 292–714 | block 448–870 |
  | All weeks before launch | block 290–714 | block 446–870 |
  | Copy past linkCap | block 265–714 | block 468–870 |

  The "Notes are kept…" line is visible in all 16 of these captures.
- **The hold doesn't fight you:** when I scrolled the sheet myself inside the 1000 ms hold window, it stayed where I left it (120). A refresh keeps that scroll (120 → 120, AC56). Going back to Home and tapping the line again lands at full scroll again.
- **N1, fixed.** The chevron is rgb(92,95,102) in light and rgb(162,165,172) in dark, which is `--ink2`, the same as "More detail" and the portfolio rows. This matches the picture and draft 13's "Home's chevron in `--ink2`".

**The plan Reviewer's tap-outside condition: met**
- I tested with touch emulation, with one week and with eight, at 360 × 740 and 414 × 896. The sheet's top is at y 48, so a 48 px band runs across the full width above it.
- Hit tests at three points in that band (centre, right edge, top-left corner) all land on the scrim (`A.v2-scrim`), outside the sheet.
- A touch tap at y 20 closes the sheet, back to `#/p/Service-Desk`, in all four cases. Escape closes it too.

**Checked again, no regressions**
- **Place:** portfolio → home-weekly → home-more-detail, with "More detail" last.
- **Words:** exact. Home shows "Last week's …", "8 weeks of …" and "2 weeks of …".
- **Quietness:** no `--you` (coral) in the line or the block, and no background box.
- **Type sizes:** line 13/400 IBM Plex Sans; block head 11/500; buttons 12/500; small lines 12/400.
- **Contrast, light / dark:** line 17.58 / 16.25; head and small lines 6.40 / 7.72; buttons 15.58 / 13.57.
- **Tap sizes:** line 44 px tall; buttons at least 162 × 36.
- **Width:** no sideways scroll on the page or the sheet in any capture.
- **Storage throwing:** no line and no block.
- **Against the base commit:** with nothing to save, Home, Home without a portfolio, and the sheet are pixel-identical to base 55a2484 at 360 and 414, light and dark. With an offer, Home's text is the base's plus the one line.
- **Tests:** the full desk suite passes, 1551 of 1551, and the worktree was left clean.

**Open questions:** none. You ruled on both of round 1's questions.

**3 best captures** (my own, Playwright and Chromium)
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/r2/sheet-eight-360-dark.png`: eight weeks with the trial weeks grouped, the whole block and its last line in view, and the band above the sheet visible.
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/r2/sheet-one-360-light.png`: one week, landing as the approved one-week frame draws it.
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/r2/home-one-360-light.png`: Home's foot with the line and its grey chevron.

The measurements are in `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/r2/report.json`. The touch-tap captures are `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/r2/r2-touch-one-360.png`, `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/r2/r2-touch-one-414.png`, `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/r2/r2-touch-eight-360.png` and `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/dr/r2/r2-touch-eight-414.png`.
