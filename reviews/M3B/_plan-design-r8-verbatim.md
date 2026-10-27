# M3B plan: the Design reviewer's round 8 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at 3892352 (the plan, draft 8).

---

Verdict: FAIL

In plain English: every round-7 point is fixed in AC97.
- The four charts now use the scales and goal ticks the approved images draw.
- Each target's figure words and verdict line are set out per phase in two tables that match the images, with the owner's three changes applied on top.
- V4 half-done has words and a mark, and V5's grey bar before launch now shows.
- The new wordings read plainly: "The desk's own reading" and "6, past the scale".
- The launch-day icon note is in, and the green and red bar fills now cite the owner's approval.

One thing still fails. VT1's list of tests keeps one stale item: five phrases from draft 7 that the new tables replaced. A builder writing tests from VT1's row would be told to expect both the old and the new words for targets with nothing measured yet. That is a one-line fix.

How I judged it: the diff f6256a7..3892352 changes only specs/S-001.md, and nothing under src/ or tests/. I checked AC97 (S-001.md:13148-13439) and VT1's row (:3358) against:
- the approved images r2-2, r2-3, r2-4 and r2-5 in docs/design/builds/m3b-picture/round-2/;
- the picture's data, /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m3b-picture/tools/data2.mjs, lines 9-12;
- the design pack, and the tokens in src/public/sandbox.css:466-498.

**Round-7 fixes, one by one**
- **B1, scales and goal ticks (:13279-13283): holds.**
  - V1 runs 0 to 3 with its tick at 0; V2 runs 0 to 3 with its tick a third of the way along; V3 runs 0 to 60 minutes and V5 0 to 8 hours, each with its tick half way.
  - These match data2.mjs:9-12 (goal at 0, 33.3, 50 and 50) and the tick positions measured in r2-3 and r2-4.
  - VT1 tests each scale and tick position.
- **B2, figure and verdict words per phase: holds in AC97.**
  - The figure table (:13261-13267) reproduces r2-3 ("0" "missed so far, 3 – 6 Dec"; "2" "false alarms, 3 – 6 Dec"; "20 min" "your estimate, 3 – 6 Dec"; "2h 05m" "median, live so far, 6 weekday cards").
  - It reproduces r2-4 ("0" "missed, 3 – 16 Dec"; "2" "false alarms in a week, the most (3 – 6 Dec)"; "25 min" "a week at most, your estimate (7 – 13 Dec)"; "2h 20m" "median, 3 – 16 Dec, 21 weekday cards").
  - It reproduces r2-2 ("1h 12m" "median, last 14 days, 9 weekday cards").
  - The verdict table (:13308-13313) reproduces r2-2's lines for V1 to V3 ("Not measured yet · measured from launch", then "Goal: …"), for V4 ("Not measured yet · goal: both at launch"), and V5's "Measured over the first 14 days after launch".
  - Where the owner's answers change the images, the table follows the answers:
    - V5 is grey with the planned ring before launch (picture-approve, A);
    - "Met" or "Missed" replaces the desk's verdict once the Chief of Staff's latest line says so (disagree, A).
  - Bar labels match r2-4: V1 "<W1> – <to>" after the window; V5 "First 14 days" and "Weekly check".
- **B3, V4 half-done: holds.** From launch day with one step done, the figure reads "1 of 2" "steps done" and the verdict "1 of 2 done · goal: both at launch" with the half circle. The row counts it "under way" (:13230-13235, :13266, :13312). The row's parts now include "<w> check late" for the dashed "?", so they add up (:13352-13355).
- **B4, the grey bar: holds.**
  - V5's fill before W1 is now `--ink3`. It already exists, so this adds no new colour.
  - I measured #6a6d75 on #e7e7ea at 4.19:1 in light and #9a9da5 on #26282c at 5.44:1 in dark.
  - `--line2` is ruled out (:13283-13285), and VT1 tests the contrast.
- **N1, green and red on the bar fills: holds.** AC97 names P-001-glance2-palette.md and cites the picture approval and the good-or-bad answer as the later ruling, for these charts only (:13246-13252). This matches the Orchestrator's reading.
- **N2, "The desk's own reading": holds.** It shows only where the latest line's `met` or `missed` sets the mark and the desk's verdict differs. It never shows with `on track` or `not measured` (:13236-13245), so it never repeats the verdict.
- **N3, "6, past the scale": holds.** Plain words, no chevron (:13288-13290).
- **N4, the launch-day icon: holds.** The rule gives the half circle, and round 2's frame is marked superseded (:13393-13395).
- **N5, tests: partly holds; see B1 below.** VT1 now tests:
  - tick positions;
  - the `--ink3` contrast;
  - each phase's words "as AC97's two tables give them and the approved images draw them", with r2-2's and r2-4's strings quoted.

**Regressions**

None found. The only removed line touching "Didn't need me", the weekly line or the 8 weeks is the lineage header (S-001.md:4). States 0 to 8, the left icon's rule, the stop-rule quote and "Your weekly figures" are as in draft 7. Other projects now get the green check when every latest line is `met` (:13395-13399), which follows from their having no final state.

**Blocking**

B1. One item in VT1's tests still holds draft 7's phrases, contradicting AC97's table and the item before it (an unverifiable claim is a FAIL).
- The stale item, in VT1's row (:3358), lists as test expectations:
  - "Not measured yet · goal: …";
  - "Measured from launch" before launch;
  - "Measured from <the day after launch>" on launch day;
  - "First check due <date>";
  - "Weekly check not recorded yet".
- AC97's verdict table (:13310) now gives, for V1 to V3 with no figure:
  - "Not measured yet · measured from launch" (before launch);
  - "Not measured yet · measured from <W1>" (launch day);
  - "Not measured yet · first check due <D1>" (in the window, until D1);
  - "Not measured yet · weekly check not recorded yet" (once late);
  - each followed by "Goal: …".
  
  The item before it in VT1's row quotes the new forms.
- "Not measured yet · goal: …" is now V4's form only. The capitalised standalone "First check due" and "Weekly check not recorded yet" appear nowhere in AC97's tables.
- A test written from the stale item would fail a build that matches the picture, or push the builder towards words that drift from it. This is exactly what N5 asked the tests to prevent.

**Non-blocking**

N1. V4 half-done says its state three ways (item 19). On one sheet the figure reads "1 of 2" "steps done" and the verdict line repeats "1 of 2 done", while the row calls the same state "under way" (:13266, :13312, :13353). Using the row's word, for example "Under way · goal: both at launch", would stop the verdict repeating the figure and match the row. The picture doesn't draw this state, so it is the Definer's choice.

**Questions for the owner**

None.

Files:
- /home/user/sd-m3bdef/specs/S-001.md:
  - VT1's row at :3358;
  - AC97 at :13167-13439: the figure table at :13261-13267, the chart at :13277-13303, the verdict table at :13308-13318, the check and difference lines at :13236-13245, and the palette citation at :13246-13252
- /home/user/sd-m3bdef/docs/design/builds/m3b-picture/round-2/m3b-r2-2-sheet-before-launch-360-light.png, m3b-r2-3-sheet-day5-one-outside-360-light.png and m3b-r2-4-sheet-after-14-days-one-missed-414-light.png
