# M3B picture: the Design reviewer's drawing, round 1, Setup CS32, report verbatim

Dispatched by the orchestrator on 2026-10-26 to draw the picture from specs/S-001.md on the push branch (with the owner's records at ce53f48). The images are in docs/design/builds/m3b-picture/ (made up, not real).

---

The picture of the value targets is drawn and ready for the owner. Nothing failed or was skipped, and nothing in the repository was changed (git status is clean). On a phone, the owner will see the "Value targets" row on Service-Desk's page in every state it can be in, the targets' sheet at each stage from before launch to after the 14 days, the "Didn't need me" line at the foot of every kind of sheet, and the weekly line at the foot of Home. All of it is drawn on made-up records, with a made-up launch day. One thing reads badly and is already in the desk today: a quoted passage exactly three lines long gets cut and faded inside a sheet. Nothing here is irreversible. The owner approves the picture or asks for changes before the first step is built.

Setup CS32 says the files go in docs/design/builds/m3b-picture/. I am read-only, so they are in my scratchpad, and the Orchestrator copies them across. CS32 also gives the drawing to the Design reviewer. I drew only what AC97 and AC25 say, and every choice of my own is listed below.

## The PNGs (the five-minute set)
Each image is labelled "Made up — NOT real". The made-up launch day L is Wed 2 Dec 2026, which is not a plan. So the 14 days are 3 to 16 Dec, the first check is due 9 Dec and the last checks are due 23 Dec.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/picture/m3b-overview-1-row-states-360-light.png — the row: where it sits on the page, all of states 0 to 8 with captions, Alpha with no check, Alpha when the file can't be read, and Bravo with no row.
- …/picture/m3b-overview-1-row-states-360-dark.png — the same, dark.
- …/picture/m3b-overview-2-sheet-lines-360-light.png — the sheet's top, one target's whole block, then what each measure says over time: V1 to V3 (eight moments, including V2 missed with "2 earlier checks" open, "not read yet", "not available" and Alpha), V4's four states, and V5's six.
- …/picture/m3b-overview-2-sheet-lines-360-dark.png — the same, dark.
- …/picture/m3b-overview-3-didnt-need-me-360-light.png — "Didn't need me" as the last line of each sheet: question, gate and card, each unmarked and marked or in its other state (card confirming, card kicked back), and "No longer waiting".
- …/picture/m3b-overview-3-didnt-need-me-360-dark.png — the same, dark.
- …/picture/m3b-overview-4-home-weekly-360-dark.png — Home's foot with one week to save, then with eight (five of them trial weeks from before launch), then the sheet opened at "Your weekly figures" for eight weeks and for one.
- …/picture/m3b-overview-4-home-weekly-360-light.png — the same, light.
- …/picture/m3b-5-sheet-before-launch-360-light.png — the whole sheet before launch, with no date anywhere.
- …/picture/m3b-5-sheet-before-launch-360-dark.png — the same, dark.
- …/picture/m3b-6-sheet-launch-day-first-screen-360-light.png — launch day, the first screen as it opens.
- …/picture/m3b-7-sheet-day5-one-check-414-light.png — day 5 with the first weekly check in, and V5's long line opened.
- …/picture/m3b-7-sheet-day5-one-check-414-dark.png — the same, dark.
- …/picture/m3b-8-sheet-after-14-days-one-missed-360-light.png — after the 14 days, the record complete, V2 missed, the stop rule opened.
- …/picture/m3b-8-sheet-after-14-days-one-missed-360-dark.png — the same, dark.

The full set, every frame at 360×740 and 414×896, light and dark, first screen and full length (329 files with measure.log), is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/shots/. The static pages are in …/m3b-picture/src/ (the desk's real sandbox.css, style.css and Plex fonts, plus a small m3b.css), and the scripts in …/m3b-picture/tools/.

## Walk-through for the owner
- **Before launch:** at the foot of Service-Desk's page, the row reads "Measured from launch · V4, replacing the old page, at launch", with the dashed ring for not started. The sheet quotes each target and shows "Measured from launch" under it. V5 shows today's answer time, the same figure as Home's line. The miss and stop rule closes the sheet. No date appears anywhere.
- **Launch day:** the row now gives dates worked out from launch day: "Measured from 3 Dec · first weekly check due 9 Dec". V4 reads "Serving the Operations-Hub address since 2 Dec".
- **During the 14 days:** before the first check, the row says the check is due. If the check is late, it says "not recorded yet" with a dashed question mark. Once your Chief of Staff's check is in, each target shows its figure and dates, then "On track", "Met" (green check) or "Missed" (red cross). The row counts them, for example "5 targets · 1 met · 4 on track". V5 also shows the desk's own live figure.
- **After the 14 days:** the row reads "first 14 days over", with the last checks' due date. Once every target's last check covers the 14 days, it reads "first 14 days checked" with the counts. A target's older checks are one tap away.
- **On any sheet that waited on you:** a quiet "Didn't need me" is the last line, far from the answer buttons. After a tap it reads "Marked as not needing you · Unmark".
- **On Home:** after a week ends, one plain line above "More detail" says the desk's figures are ready to save. It opens the sheet at "Your weekly figures", with one save link per week.

## My review of my own picture
Measured on all 164 captures:
- **Fonts:** IBM Plex Sans 400, 500 and 600 and Plex Mono all loaded.
- **Width:** nothing scrolls sideways at 360 or 414.
- **Sizes:** the new parts use only 11, 12 and 13 px, at weights 400 and 500.
- **Contrast:** the lowest for text is 6.40:1, in both themes.
- **Tap targets:** "Didn't need me" is 81×24, "Unmark" 43×24, the folds are 28 tall and the weekly line 44 tall.
- **Colour:** none of the vermilion "needs you" colour in the row, the sheet, the weekly line or "Didn't need me". Gold is not used. Green and red appear only on the met check and the missed cross, each with its word. No key is added.

Reads well:
- The row says where things stand in one line, and the icon always matches its words.
- Before launch nothing looks like a deadline.
- "Didn't need me" sits in the same place on every sheet and looks nothing like an answer button.
- The weekly line on Home is quiet and never counted as waiting.

Reads badly (each against AC97 or AC25 as written):
1. **Three-line quotes are cut, in today's desk too.** sandbox.css:1144 (`.v2-sheet .v2-quote`, padding 2px top and bottom) overrides the clip padding at :743. So inside a sheet, a quote of exactly three lines is cut by 4 px and shows "Read it all" for a few faded words. The gate's case does this today. This is a non-blocking follow-up to file. I drew the intended look: m3b.css overrides it and says so.
2. **The sheet is long and heavy at the top.** Five three-line quotes, each with "Read it all", come before the measures. The measure, which is the answer the owner wants, is in smaller text under the quote. At a glance the quotes win (P-001-design-discovery.md).
3. **V5 shows two medians during the 14 days.** The desk's live one ("2h 05m over 6 cards") sits right above your Chief of Staff's weekly one ("1h 50m over 4 cards"). Both are right, but side by side they read as a contradiction.
4. **The stop rule's name appears twice.** The heading "Miss and stop rule" is followed by a quote that starts "Miss and stop rule: …", because AC97 quotes it word for word from that label.
5. **V4 shows a one-day range.** Its line reads "Operations-Hub archived at launch · 2 Dec – 2 Dec", because J25's from and to are the same day.
6. **"before launch: a trial, not counted" repeats.** With eight weeks waiting it appears under five links in a row.
7. **The state-8 half circle beside "checked".** CS32 asks the owner to judge it: the record is complete, but the mark still looks partial.

My own choices, for the Definer (the spec doesn't fix them):
- Dates and durations are kept on one line, such as "3 Dec" and "1h 12m".
- A plain line (a figure or fact) is indented to line up with the words of an icon line.
- The per-target words for state 0 are "Weekly check: not read yet" and "not available", with no icon.
- "Your weekly figures" is placed last, after the stop rule.
- Weeks are listed newest first.
- Each trial week has its own note under its link.
- Alpha's sheet has no stop rule quote.
- The weekly line has no rule above it.

Spec gaps, for the Definer:
- Another project's row with no check shows the dashed ring (by AC97's icon rule, states 4 and 6 belong to Service-Desk only), while its sheet shows a dashed question mark on every target.
- "Weekly check not recorded yet" and "No weekly check recorded" are both used for nearly the same thing.
- AC25 doesn't say where in the sheet "Your weekly figures" sits, what order the weeks come in, or whether the sheet opens over Service-Desk's page when tapped from Home.

## Questions for the owner (asked, not picked)
1. On the targets' sheet, should each target lead with its full quoted line (three lines) and the measure under it, as now? Or should the measure come first, with the target's line one tap away?
2. During the 14 days, V5 shows two answer times: the desk's live one and your Chief of Staff's weekly one. Keep both, or show only one? If one, which?
3. The stop rule's heading is repeated by its own first words. Keep it word for word under the heading, or drop one of the two?
4. When figures from weeks before launch are waiting, should each say "before launch: a trial, not counted", or should they sit together under one such line?
5. After the 14 days, "first 14 days checked · 3 met · 2 not measured" keeps the half circle. Is that clear to you, or should a complete record get a different mark?
6. V4's line reads "archived at launch · 2 Dec – 2 Dec". Keep it, or show a single date when the two are the same day?
