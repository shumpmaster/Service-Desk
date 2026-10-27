# M3B plan: the Design reviewer's round 7 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at f6256a7 (the plan, draft 7).

---

Verdict: FAIL

In plain English: draft 7 gets most of the approved picture right.
- Each target leads with its figure at 24 px, then a small chart against its goal, then a green ✓ or red ✕ verdict in words.
- The row shows five marks.
- The owner's three changes are written in: V5 stays grey before launch, the Chief of Staff's check wins over the desk's verdict, and other projects show figures only.
- The one phrase for a missing check, the four small fixes and "Your weekly figures" match the picture.

As written, AC97 would still build something different from the picture in four places:
1. The false-alarms chart would be drawn on a different scale.
2. The words under the figures after the 14 days, and before launch, differ from the picture.
3. Two states have no words: the replacement target (V4) half done, and a late check counted on the row.
4. V5's grey bar before launch would be almost invisible, so it would read as an empty bar, which AC97 itself forbids.

All four are small to fix, but VT1's tests would lock in the first two as written.

How I judged it: the diff 327ce70..f6256a7 changes only specs/S-001.md, and nothing under src/ or tests/. I checked AC97 (S-001.md:13123-13368) and the VT1 row (:3355) against:
- the approved round-2 images (docs/design/builds/m3b-picture/round-2/, read at 360 and 414 px, light);
- the drawer's report, and the picture's own data and CSS under /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/tools/ and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/src/m3b2.css;
- the owner's nine answers, the design pack and the M3E palette ruling;
- token values in src/public/sandbox.css:466-498.

**What holds**
- **Measure-first block** (:13213-13251): the order is id in Plex Mono with the short name, then the figure in `--t-title` (600 24px, sandbox.css:474) with its words in `--t-small`, then the chart, then the verdict line in `--t-small` 600, then the check's line in `--ink2`, then "The whole target ›" and "<k> earlier checks ›". That matches the picture (m3b2.css:5-29). The sizes are all on the scale, at weights 400 and 600 only (part B item 27).
- **Charts:**
  - the goal is a 2 px `--ink` line labelled "goal 0", "goal ≤ 1", "goal ≤ 30m" or "goal < 4h";
  - fills are `--ok` or `--bad` on a `--line` track;
  - a measured zero shows as a 4 px stub;
  - V2 and V3 get one bar per week, newest last, each filled by its own week's verdict;
  - V5 gets "Live so far" and "Weekly check" (the v5-two answer, A), then "First 14 days" after the window;
  - V4 is a two-step list;
  - nothing is drawn for a target with no figure.
  
  These all match the picture. The exception is V2's scale (B1).
- **Verdicts:** "Within target"/"Outside target" plus "so far" in the window. V2 and V3 stay red after any bad week, with the worst week as the big figure (the weekly-red answer, A). A `met` or `missed` from the Chief of Staff sets the mark and the words (the disagree answer, A); `on track` leaves the desk's verdict. V5 is grey with no mark before the window (the picture-approve answer, "V5 left grey").
- **Other projects** (:13265-13271): figure and dates, no chart, no live verdict, and the Chief of Staff's met or missed as the mark (the other-goals answer, A).
- **Row:** five marks in the sheet's marks, with ids in Plex Mono 11 px. The words follow the picture: "5 targets · 1 outside target · 4 within, so far", "5 within target so far", "first 14 days checked · 4 met · 1 missed".
  - The left icon is green only when the record is final and every target is met. It is "?" in states 4 and 6 and absent in state 0. The half circle stays in state 8 (the picture-small answer, (c)).
  - Colour always sits beside ✓ or ✕ and words (item 13), with no vermilion and no new hue (item 14).
- **One phrase for a missing check:** "Weekly check not recorded yet" on every target, V5's no-log case included (:13258-13264). That settles my round-6 N1.
- **The four small fixes:** (a) the stop rule's name once, with the quote starting "A miss is …"; (b) trial weeks under one "Before launch: a trial, not counted" line; (c) the half circle in state 8; (d) a same-day range shown as one date. All are in AC97 (:13224, :13332-13343) and match images r2-2 to r2-5.
- **"Your weekly figures":** last on the sheet, weeks newest first, trial weeks grouped. It matches r2-5.
- **No regressions:** AC25 ("Didn't need me" as the sheet's last line, the weekly line, the 8 weeks) is untouched by this diff. States 0 to 8 and their bounds are as in draft 6.

**Blocking**

B1. V2's chart scale doesn't match the picture, and VT1's test would lock in the mismatch (part B item 26; the picture-approve answer: "VT1 is built to round 2's picture").
- AC97 (:13227-13228) says the track runs "from 0 to twice the goal (V1, which has a goal of 0, from 0 to 3)". For V2 (goal ≤ 1) that gives 0 to 2: the goal tick at 50%, and 2 false alarms filling the whole track.
- The approved picture draws V2 from 0 to 3. The data has `C2 = { goal: 33.3 }` (tools/data2.mjs:10). In r2-3 and r2-4 the goal tick sits a third of the way along and "2" fills two thirds.
- The drawer's note 4 ("0 to twice the goal") didn't describe its own picture, and AC97 copied the note.
- VT1's row (:3355) tests "the track from 0 to twice the goal (V1 0 to 3)", so a build matching the approved picture would fail and one drifting from it would pass.
- V3 (0 to 60m) and V5 (0 to 8h) do match, at 50%.

B2. The figure words after the 14 days, and before launch, differ from the picture (part B item 26; item 5).
- AC97 gives one wording per target (:13216-13223). The approved r2-4 (after the 14 days) reads differently:
  - V1: AC97 gives "missed so far, <from> – <to>", but the picture has "0 missed, 3 – 16 Dec". Keeping "so far" after the window closes is untrue.
  - V2: the picture has "2 false alarms in a week, the most (3 – 6 Dec)", against AC97's "false alarms, <that week's dates>".
  - V3: the picture has "25 min a week at most, your estimate (7 – 13 Dec)", against AC97's "your estimate, <that week's dates>".
  - V5: the picture has "median, 3 – 16 Dec, 21 weekday cards", but AC97's rule gives "median, First 14 days after launch, 21 weekday cards".
- Before launch (r2-2):
  - V1 to V3: the picture reads "Not measured yet · measured from launch" over "Goal: none missed in the 14 days". AC97 instead gives "Not measured yet · goal: …" plus a sheet-level "Measured from launch" line (:13254-13255).
  - V5: the picture's "Measured over the first 14 days after launch" line is not in AC97 at all.

B3. Two states have no words, so a builder would guess (item 5; an unverifiable claim is a FAIL).
- **V4 half done:** from launch day until the archive is recorded, V4 has one step done. The row gives it the half circle and counts it "under way" (:13281, :13290). But the sheet's verdict words are only "Within target so far", "Outside target so far", "Met", "Missed" and "Not measured yet" (:13246). AC97 says V4 is "within once both steps are done; it is never outside" (:13200), so no word or mark is given for one step.
- **A late check on the row:** the row's parts count by mark as "outside target", "within", "under way" and "not measured yet" (:13289-13290), and are required to add up to the number of targets. A target whose check is late carries the dashed "?" (:13282, :13258). In state 5 or 7 (for example V3's estimate late while the others are in), that target falls in no part, so the parts can't add up.

B4. V5's grey bar before the window is all but invisible, so it reads as the empty bar AC97 forbids (item 5; AC97's own "no empty bar is ever shown", :13226).
- AC97 fills it `--line2` on the `--line` track (:13228). Measured: #d6d6db on #e7e7ea is 1.17:1 in light, and #34363c on #26282c is 1.22:1 in dark.
- The owner approved "V5 left grey", and this grey form was never drawn. Because the fill vanishes, the bar looks empty beside the value "1h 12m".
- A grey that already exists and can be seen would keep "no new colour". For example `--ink3` measures 4.19:1 in light and 5.44:1 in dark on the track. The choice is the Definer's.

**Non-blocking**

N1. Colour on the bar fills is wider than the M3E palette ruling allows, and AC97 doesn't say so (part A item 1).
- P-001-glance2-palette.md, A, puts green and red "on the 14–16 px mark only, never on words, rows or borders". The bars are not marks.
- The later approval of the round-2 picture, which drew those fills, reads as settling this for these charts. But AC97 (:13134, :13347-13349) never names the palette ruling, so VT1's Design reviewer has no stated basis.
- AC97 should cite the approval as the later ruling for this chart. If the Orchestrator doesn't read the approval as covering the bars, it goes to the owner (Q1).

N2. "The desk's own count: <its verdict>" (:13211) uses the wrong word for V3 (minutes), V4 (steps) and V5 (a median); "The desk's own reading" would fit all five (item 19). Also, where the check says `on track`, the desk's verdict is already the mark, so a difference line would repeat the verdict above it. AC97 should say whether `on track` versus "outside" counts as a difference.

N3. "6 › scale" for a value past the end (:13232) borrows "›", which elsewhere on this sheet means "tap to open" ("The whole target ›", "Read it all ›"). Plain words, such as "6, past the scale", would avoid the double meaning (item 19). The picture doesn't draw this case.

N4. On launch day, the picture's row shows the planned ring as its left icon. AC97's single rule gives the half circle, because V4's mark is half that day (:13324-13325). The rule is the consistent one. The difference should be noted for the owner, or the picture's frame marked as superseded.

N5. VT1's tests check the rules, not the picture, so they inherit B1 and B2. Once those are fixed, VT1's tests should check, against the approved images:
- each target's goal-tick position;
- each state's figure words;
- the V5 grey fill's contrast against the track.

VT1's captures are judged against round 2 by a fresh Design reviewer, which catches layout drift but not rules that the tests lock in.

**Questions for the owner**

Q1 (only if the Orchestrator reads the picture approval as not covering N1): "The approved picture colours each bar green or red, but your 24 October ruling kept green and red to the small ✓/✕ mark only. Keep the coloured bars on the targets' sheet?"

Files:
- /home/user/sd-m3bdef/specs/S-001.md: AC97 at :13123-13368 (chart at :13225-13244, figure words at :13216-13224, verdict words at :13245-13248, row at :13278-13328); VT1's row at :3355
- /home/user/sd-m3bdef/docs/design/builds/m3b-picture/round-2/m3b-r2-2-sheet-before-launch-360-light.png, m3b-r2-3-sheet-day5-one-outside-360-light.png and m3b-r2-4-sheet-after-14-days-one-missed-414-light.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/tools/data2.mjs (line 10, V2's goal at 33.3%)
- /home/user/sd-m3bdef/decisions/questions/P-001-glance2-palette.md
