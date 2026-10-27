# M3B plan: the Design reviewer's round 11 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at a7c8e1d (the plan, draft 11).

---

Verdict: FAIL

In plain English: the owner's grey-ring answer is written in correctly, and it reads plainly.
- **The grey-ring case:** after the 14 days, a target the Chief of Staff's final check records as "not measured" shows the planned ring. Its figure and a grey bar still show, the words say "Not measured · your Chief of Staff's check, <date>", and the check is said once.
- **The other changes read right:** V4's "Old repository not archived" with ✕, another project's "<k> not recorded yet" part, "1 false alarm", AC66's "not on the Timeline: a weekly value check", and AC83's measure-first sentence.
- **Regressions:** none found.

One point fails, and it is my own earlier mistake. Draft 11 now writes down that "The whole target ›" comes before "<k> earlier checks ›" because "the spec's order governs". The approved picture draws them the other way round. An approved picture is an owner ruling, and a ruling ranks above the spec, so a reading the Definer settled alone ("C, mine") can't overturn it. In VT1's design review I accepted this order on the same wrong reasoning. The impact is tiny, but by the pack's order of authority it has to match the picture or go to the owner.

How I judged it: the diff 67172ff..a7c8e1d changes only specs/S-001.md, and nothing under src/ or tests/. I read:
- the owner's record, decisions/questions/P-001-m3b-not-measured-mark.md (B);
- VT1's design review, /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/reviews-vt1/r1-design.md;
- AC97 as changed (S-001.md:13199-13497) and VT1's row (:3359).

I checked them against the approved round-2 images and the design pack. Every phrase VT1 quotes is found in AC97, or in AC66 for "Done today" and "not on the Timeline: a weekly value check".

**What holds**
- **Grey ring after the window** (:13290-13300, :13381, :13387-13401, :13427-13429).
  - After the window, a latest `not measured` on V1 to V3 or V5 sets the planned ring, with or without the desk's figure (B).
  - The figure stays in `--t-title`, and its chart's bar is filled `--ink3`, the same grey that already means "not counted" for V5 before launch. So grey keeps one meaning: not judged (item 14).
  - The verdict line "Not measured · your Chief of Staff's check, <its date>" replaces the check line, and no difference line shows.
  - The row counts it "not measured yet" in state 7 and "not measured" in state 8.
  - With 3 met and 2 not measured, the left icon's rule gives the half circle, as the picture's final frame draws. Naming the check in the words keeps a big figure beside "Not measured" readable: it is the check's word, not a claim that nothing was counted (item 19).
  - In the window, draft 10's rule stands, as the Orchestrator scoped the answer.
- **V4's archive** (:13367-13372): `met` reads "Old repository archived <date>" with ✓; `missed` reads "Old repository not archived" with ✕ red beside the check's "Missed". Colour always sits beside ✕ and words (item 13). With `on track` or `not measured` the step is not done, and V4 reads "Under way".
- **Another project's parts** (:13467-13475): "<a> met · <b> missed · <c> on track · <d> not measured · <k> not recorded yet" now add up. When the planning project itself can't be read, the row says "weekly checks not available", never "not recorded yet" (items 4 and 5).
- **"1 false alarm"** (:13321): singular.
- **AC66** (:7335-7340): a weekly check's merge gets a "Done today" row reading "not on the Timeline: a weekly value check", the same form as the estimates' "not on the Timeline: a rough estimate".
- **AC83's note** (:8792-8797) now says measure first, with the whole line one tap away, matching sheet-order B.
- **Plex Mono** (:13351-13353): only the bar values are mono, and the labels are `--t-label` at 400, as the picture's CSS has it (m3b2.css:12-13). The weight is on the scale.
- **Regressions:** none found. The other changes are the "same days twice" rule, V5 after the window with its log gone, `desk-blobs-v8`, J25's `state` note and the record of the owner's answer. States 0 to 8, the icon rule, the scales, `--ink3`, "Didn't need me" and the weekly line are as in draft 10.

**Blocking**

B1. The order of the two links under each target departs from the approved picture on the strength of a reading the Definer settled alone (part A item 1; the pack's order of authority: the owner's rulings, then the spec).
- Draft 11 writes (:13403-13405): "in that order, as built, where the approved image draws earlier checks first; the spec's order governs (C, mine; the Builder's point 2 of VT1)". VT1 locks "The whole target ›" before "<k> earlier checks ›" (:3359, "each block's order").
- The approved r2-4 draws "2 earlier checks ›" above "The whole target ›" (docs/design/builds/m3b-picture/round-2/m3b-r2-4-sheet-after-14-days-one-missed-414-light.png).
- P-001-m3b-picture-approve.md, A, rules "VT1 is built to round 2's picture, with your answers". AC97's own preamble (:13207-13213) says the picture "governs the look … except where those answers change it", and none of the owner's answers changes this order.
- A "C, mine" reading in the spec can't override an owner ruling. Either AC97 and VT1 follow the picture (earlier checks first), or the Chief of Staff asks the owner.
- My VT1 design review (round 1, point 1) accepted this order as "the spec governs". That was wrong under the pack and I withdraw it.

**Non-blocking**

N1. V5's "Weekly check: <k> cards, <from> – <to>" (:13383) has no singular, so a check of one card would read "1 cards". The build already handles "1 weekday card" and the spec now has "1 false alarm" (item 19). The same fix applies here.

**Questions for the owner**

None needed if B1 is settled by following the picture. If the Definer prefers the spec's order, it goes to the owner: "Under each target, should "<k> earlier checks ›" come before "The whole target ›", as your approved picture drew, or after it?"

Files:
- /home/user/sd-m3bdef/specs/S-001.md:
  - the link order and its "C, mine" at :13403-13405;
  - VT1's row at :3359;
  - the grey-ring rules at :13290-13300 and :13387-13401;
  - V4's archive at :13367-13372;
  - V5's weekly-check words at :13383
- /home/user/sd-m3bdef/docs/design/builds/m3b-picture/round-2/m3b-r2-4-sheet-after-14-days-one-missed-414-light.png
- /home/user/sd-m3bdef/decisions/questions/P-001-m3b-picture-approve.md
