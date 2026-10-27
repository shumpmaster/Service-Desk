# M3B plan: the Design reviewer's round 9 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at f83bb30 (the plan, draft 9).

---

Verdict: FAIL

In plain English: all four of this round's changes read right, and nothing regressed.
- V4 half done now says "Under way", the same word the row uses.
- A check recorded as not measured no longer looks like a late one.
- V5 with no figure gets the dashed ring that means not started, like every other unmeasured target.
- VT1's item for unmeasured targets now quotes AC97's table word for word.

But VT1's tests still quote one draft-7 phrase. They expect V5 before launch and on launch day to show "no mark" and lower-case "before launch, not counted". AC97 now gives the planned ring and "Before launch, not counted" (capital B). The same item also says "nothing judged before the window's first day" without AC97's exception for V4. A test written from that item would fail a build that matches AC97.

How I judged it: the diff 3892352..f83bb30 changes only specs/S-001.md, and nothing under src/ or tests/. I read VT1's row (S-001.md:3359) and AC97's verdict table (:13321-13336) and V5 rule (:13236-13248). I checked them against the approved round-2 images (docs/design/builds/m3b-picture/round-2/), the design pack and my earlier findings.

**This round's changes, one by one**
- My round-8 B1, VT1's stale phrases: holds for the unmeasured-target item. It now reads "V1 to V3 with no figure in each phase in AC97's verdict-table words, "Not measured yet · measured from launch", "· measured from <W1>", "· first check due <D1>" and "· weekly check not recorded yet", each over "Goal: …", the dashed "?" only once a check is due". That matches AC97's table (:13322).
  - The capitalised standalone "First check due" and "Weekly check not recorded yet" are gone from VT1, and so is "1 of 2 done".
  - One older phrase remains (B1 below).
- My round-8 N1, V4 half done: holds. AC97 (:13243-13244) and its table (:13325) read "Under way · goal: both at launch" with the half circle. That matches the row's part "<u> under way", so one state now has one word. The figure "1 of 2" "steps done" stays as the figure, which no longer repeats the verdict.
- The Reviewer's B1, a recorded `not measured`: holds.
  - The new table row (:13323) reads "Not measured · your Chief of Staff's check, <its date>", then "Goal: …", with the planned ring and never the dashed "?". It counts as "not measured yet" on the row, not "check late" (:13331-13335).
  - This keeps the three states told apart (part B item 30): a record that exists is never marked as missing.
  - It is locked in VT1.
- The Reviewer's N2, V5 with no figure in the window: holds. It reads "Not measured yet · goal: under 4h" with the planned ring, under AC21's own words ("no weekday cards", or the projects not read yet). It counts as "not measured yet" (:13326, :13334-13335). No figure is shown as 0 (item 5).
- J25's `state` note now says the latest window line sets the mark (:16515-16517), consistent with AC97.

**Regressions**

None found. Apart from those, the diff changes only:
- the draft number and lineage;
- the plain paragraph's round-8 sentence;
- the draft-9 change record (:3568-3578).

The scales, ticks, `--ink3`, "The desk's own reading", "6, past the scale", the row's states and icon rule, the stop-rule quote, "Your weekly figures", "Didn't need me" and the weekly line are as in draft 8.

**Blocking**

B1. VT1's tests still quote draft 7's V5-before-the-window phrase, against AC97 (an unverifiable claim is a FAIL; the coordinator's check that VT1 quotes only current words).
- VT1's row (:3359) tests "nothing judged before the window's first day, V5 grey there with "before launch, not counted" and "launch day, not counted" and no mark".
- AC97 (:13238-13240), and its verdict table (:13326), give:
  - "V5's figure before launch and on launch day shows in grey with the planned ring, "Before launch, not counted" or "Launch day, not counted"";
  - "**Before W1 nothing is judged, with one exception, V4**".
  
  The row's mark list also gives V5 before W1 the planned ring (AC97, "five marks").
- So the test expects no mark where AC97 draws the planned ring, and lower-case words where AC97 capitalises them. It also says nothing is judged before the window, while the same row tests "V4 judged from launch day".
- These are the words "no mark", "before launch, not counted", "launch day, not counted" and "nothing judged". They need AC97's current forms; the fix is one item.

**Non-blocking**

N1. A recorded `not measured` may say its check twice. Its verdict line reads "Not measured · your Chief of Staff's check, <its date>" (:13323). AC97 also puts, under every verdict, "Your Chief of Staff's check, <its date>: <state>" from the latest window line (:13248-13250), which here would read "…: not measured". AC97 should say whether the table row replaces the check line, so the sheet doesn't show both (item 19). Neither the picture nor VT1 settles it.

**Questions for the owner**

None.

Files:
- /home/user/sd-m3bdef/specs/S-001.md:
  - VT1's row at :3359 (the stale item: "nothing judged before the window's first day, V5 grey there with … and no mark");
  - AC97's V5 rule at :13236-13248;
  - AC97's verdict table at :13321-13336;
  - the draft-9 record at :3568-3578
