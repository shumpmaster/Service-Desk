Verdict: PASS

The Plan tab still passes. Both fix commits do what they say, and nothing else on the desk changed. A launch or other gate waiting on you now gets its own row at the top of its project's list. It has the red-orange diamond, the gate's question cut at three lines, "Launch gate · waits on you" and "after your ruling", and one tap opens that gate's card on Waiting. Every milestone row under it keeps its own icon and finish date. A milestone whose newer estimate can't be read now says so on its row. When the reason a finish can't be worked out is another project's milestone, the line names that project ("Example's MD1"), and "Current plan · recorded …" has its "·". Nothing failed and nothing was skipped. I found two small new points and one note, none of them blocking:
- The gate's cut-off question has no fade at the cut. It is cut the same way as on the Waiting board.
- The project's count beside its heading leaves the gate out, but the mockup counts it.
- After you close the gate's card you land on Waiting, not back on Plan.

**What was reviewed:** build/builder/desk-v2-5 at 84c1224 against my round-1 captures of cd6134f. I worked in detached worktrees, now removed. Captures were at 360×740 and 414×896, light and dark, with Playwright Chromium and Plex loaded. The harness is my cap5.mjs plus 10 new states, in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr5c/cap5c.mjs. That gives 136 captures with zero script errors, saved in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr5c/shots/ with m-all.json. Crops are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr5c/crops/. Frame 11's gate row was measured by /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr5c/mock11g.mjs, with output in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr5c/mock/.

## 1. Gate row against frame 11's gate row (desk-v2.html:840)
Captures: shots/gate-*.png, gatenm-*.png (a card with no Milestone: line), s3main-*.png and s3ext-*.png. Crops: crops/gate-360-dark.png and main-plan-gate-360-light.png.

| Part | Built (all 4 width/theme pairs) | Frame 11 |
|---|---|---|
| Row (link) | 382 / 328 px wide, padding 9/0 | 382 / 328, padding 9/0 |
| ◆ | 16×16 at x16, fill #C9380C light / #FF6A3D dark | 16×16 at x16, same fills |
| Name | 13px/17.55 500 at x42, 261 / 207 px wide | 13px/17.55 500 at x42, 261 / 207 |
| Mono line | "Launch gate · waits on you", 11px/15.4 400 Plex Mono, grey | same |
| Right value | "after your ruling", 12px/16.8 400 grey at x313 / x259, 85 px wide | same |

- **Position:** the gate row is index 0 of its group. The ◆ sits 10 px below the row's top, against frame 11's 9 px. Milestone rows sit at 10 px in both, so I don't count this as a difference.
- **Three-line cut:** `max-height: 52.65px` (3 × 17.55) with overflow clipped. The rendered name is exactly 3.00 lines. Its full height is 105 px at 414 and 123 px at 360, so the cut is clean.
- **Target:** the row is 88 px tall with the long AC85 title and 70.5 px with a two-line title, well over 44. No target is undersized.
- **Opening the card:** a tap goes to `#/waiting/card/Service-Desk%7Cgate%7Cqueue%2FP-003-launch-1.md`, with Waiting behind it, and opens the gate sheet with its four choices (crops/gate-tap-360-light.png).
  - Focus lands on its 44×44 close button.
  - Escape, the close button and a tap outside each close it.
  - A reload keeps it open.
- **In the ordering:** the gate row is absent (gate-ordering-*).
- **Vermilion:** in the icon paint dump it appears only on the gate row's ◆ (`v2-s st-you`), the "N waiting on you in your Queue" ◆s on MD3 and M3C, the tab badge, and Waiting's own kind icons (gate-tap, gate-waiting). "after your ruling" and the mono line are grey, 6.4:1 light and 7.72:1 dark.
- **Milestone rows under the gate:** they keep their own icons (st-half MD1/MD2, st-next MD3, st-planned M3A–M3C) and finishes. M3C reads "29 Oct – 6 Nov", where round 1 showed "after your ruling".

## 2. New row warning (J14)
States newer-*, sheet-newer-* (crops/newer-360-light.png).
- "a newer estimate line could not be read" is set at 12px/16.8 400 Plex Sans, grey, at x42, under MD3's mono line "about 3–5 days".
- It fits on one line at both widths (302 / 356 px wide, 16.8 px tall).
- Contrast is 6.4:1 light and 7.72:1 dark.
- It appears on that row only, and again in the sheet (x24, one line).

## 3. "Example's MD1" and the "·"
States two-*, two-ordering-*, current-* (crops/two-360-light.png and current-360-light.png).
- Rows MD3 to M3C in the Service-Desk group read "Rough finish: not available: Example's MD1 has no estimate yet". The ordering card reads "not available: Example's MD1 has no estimate yet".
- At 360 the line wraps once, between words ("…Example's MD1 has no / estimate yet"), and "Example's MD1" stays on one line. The text is 12 px, 6.4:1.
- Within one project the words are still AC24's ("MD1 has no estimate yet").
- The state line reads "Current plan · recorded 18 Oct, 06:30", in one line at both widths.

## 4. Nothing else changed
- **Other screens:** I recaptured 180 screens (Home, Waiting, project pages, Timeline, Team, extremes) and 220 sheets, and diffed them against round 1's head captures (dr5c/imgdiff-cmp.txt, imgdiff-sh.txt).
  - All 220 sheets are identical.
  - On the screens, the only pixel differences are the "checked N s ago" text, and the rendered text is identical except on Plan.
  - In that fixture's Plan, the only text changes are Alpha's Build gate row and "Service-Desk's MD1" on Alpha's rows.
- **Plan's own states:** 64 of 96 captures are pixel-identical. The 32 that differ are only current, two, two-ordering, gate, gate-full, sheet-gate (the Plan behind it), s3main and s3ext. Their text diffs show only the gate rows, "<project>'s MD1" and the "·".
- **Whole set:** no sideways scroll, and the lowest contrast is 5.18:1 light and 6.69:1 dark. Sizes are only 11, 12, 13, 15, 18 and 24 px; weights only 400, 500 and 600; Plex Sans and Plex Mono throughout.
- **Home agrees with Plan:** with the gate card, and with a card that has no Milestone: line, Home reads "Next: the Launch gate, after your ruling" (gate-home-*, gatenm-home-*; crops/gate-home-360-light.png) and Plan shows the gate row. In the main fixture Home reads "Next: the Build gate, after your ruling" and Plan shows Alpha's Build gate row.

## 5. Locked page tests (84c1224)
- ac80-board passes 28/28, ac81-bar-type 11/11 and ac48-62-63-look 9/9.
- These three files are unchanged from cd6134f to 84c1224.
- I also ran ac86-plan (19/19), ac24-work-ahead (31/31), ac82-home (26/26) and the full desk suite (1001/1001 pass, 0 fail).

## New findings (none blocking)
1. **The gate row's cut has no fade** (item 16). Not blocking.
   - Capture: crops/gate-360-dark.png. The third line simply stops ("…graduating the product,").
   - Item 16's form is three lines, faded, with the whole one tap away. The tap holds, but the fade is missing.
   - It matches the board's own titles (`.v2-t`, sandbox.css:821-822, AC80: "never given an ellipsis", no fade), and I rated stage 2's matching "Since you last looked" case (N3) non-blocking.
2. **The group count leaves out the gate row** (item 26). Not blocking.
   - Frame 11 draws Members Letter's group with "2": the gate row plus ML4.
   - The build shows "6" over the gate row plus 6 milestones (gate-414-light). The new ac86 test asserts this on purpose ("the gate not among them").
   - AC86 says only "with its count", under "milestones ahead", so this is a reading for the Definer, not a defect.

## Notes (not findings)
- Closing the gate's sheet lands on `#/waiting`, not on Plan, and focus is not returned to the Plan row. This follows from the sheet living on Waiting, as the brief specifies, and matches Plan's existing "1 waiting on you in your Queue" link, which also goes to Waiting.
- In full-page Home captures at 360, the "Personal-Org-Operating-Model" link (185×17) fails the spacing check. The result is identical at cd6134f (base/ against shots/, pixel-same), so it predates these commits and looks like the fixed tab bar overlapping in a full-page capture.

## Open questions
1. **For the Definer:** should a project group's count on Plan include its gate row, as frame 11 draws ("2"), or only milestones, as built and tested?
2. **For the Orchestrator:** should Plan's gate row, and the board's titles it copies, get item 16's fade at the three-line cut, as Home's lines got at stage 2?
(Recorded verbatim by the orchestrator from reviews/S-001-desk-v2/_build-5-design-confirmation-verbatim.md.)
