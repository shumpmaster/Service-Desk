# S-001 desk v2, stage 5 (Plan): the Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-5 at 84c1224.

---

Verdict: PASS

Stage 5, round 2: the Plan tab, build/builder/desk-v2-5 at 84c1224, reviewed against 0be0d16.

Both blocking findings from round 1 are fixed and tested. Both Design findings are fixed. No test was weakened, and every run passes. Five points are left. None blocks, and they go to the gate's case as risks: three need Define to confirm, one is a Define point the orchestrator already raised, and one is a small join-up note.

**What was run** (in a detached worktree at 84c1224, now removed)
- **Full suite** (`cd src && node --test ../tests/desk/*.test.mjs`): 1001 tests, 1001 pass, 0 fail.
- **Build** (`node src/tools/build.mjs`): "build: PASS (2 connected projects; 35 page modules in step)". The tree was clean afterwards.
- **`check_all.sh . 0be0d16`**: "OK: all governance checks passed."
- **`surface_guard.py diff --range 0be0d16..84c1224 --branch build/builder/desk-v2-5`**: "OK: 4 commit(s) … checked".
- **`review_check.py pr 999 --base 0be0d16`**: "Risk class: R1", every file R1. Its only failures are the two verdicts still to record: reviews/999/design-reviewer.md and reviews/999/reviewer.md.
- **Commits**: all four are by `builder <builder@agents.invalid>`, with `Agent-Session:` and `Spec: S-001` trailers. No model names and no co-author lines.
- **Library copies**: src/lib and src/public/lib are identical for workview.js and workahead.js.

## Round-1 findings

**B1, the gate card: FIXED.**
- I re-ran my probe with a real-form card: `Milestone: M1, M2, M2B, MD1, MD2, MD3, M3A, M3B, M3C`, as specs/S-001.md:15 and orchestrator.py:892 write it.
- Plan shows one gate row at the top of the Service-Desk group: `st-you`, "Launch gate · waits on you", "after your ruling".
- Every milestone row keeps its own icon and finish:
  - MD1 and MD2: st-half, "your acceptance";
  - MD3: st-next, "21–23 Oct";
  - M3A to M3C: st-planned, "25–30 Oct", "27 Oct – 3 Nov", "29 Oct – 6 Nov".
- **Home and Plan agree.** Both use one helper, `gateCardOf` (src/public/sandbox.js:801-809). I checked three cases:
  - with the real-form card, Home says "Next: the Launch gate, after your ruling" and Plan shows the gate row;
  - with a card that has no `Milestone:` line, the same;
  - with no card, Home says "Next: MD1 · rough finish once you accept it" and Plan has no gate row.
  - The new test also checks that a card marked done leaves both screens.
- **The gate row stays out of the order, the plan and the finish.** It is not shown in ⇅'s ordering, and the "Record plan" body does not mention it (test). The group count stays 6.
- `lastBoard` is set in `draw()` (:3735) before anything calls `workView`. All callers are in render code after the board is built, and the memo is cleared on every draw.
- **My judgement:** the reading is sound.
  - It matches frame 11, which draws the gate as its own row (desk-v2.html:840).
  - It keeps "every rule of AC24 holds" (S-001.md:7041-7046), because no row loses its state or finish.
  - It still gives AC86's ◆ and "after your ruling".
  - AC86's wording ("each row the milestone's icon … the vermilion ◆ where a gate card waits") reads more literally as a milestone row's icon, so Define should confirm the reading.
- **The leftover (every row says "1 waiting on you in your Queue"): a Define point, not a blocker.**
  - It is AC24's own rule applied as written (S-001.md:8362-8364), and AC86 keeps that rule.
  - The same `waitingOn` count was already in 0be0d16, so this is not a regression.
  - The cause is the model writing the spec's whole milestone list on the card (S-033 AC5).
  - The cost: one real gate card shows 7 vermilion ◆ on Plan, one on the gate row and six on "1 waiting" lines. Carry it as a risk. Define should say whether a gate card counts on milestone rows, or whether the card's line should name only the milestone the gate closes.

**B2, J14's warning: FIXED.**
- Probe: the WORKED fixture plus a later MD3 line with `low_days: 9.5`. The MD3 row reads "MD3 · Design · about 3–5 days" and has "a newer estimate line could not be read" under it (sandbox.js:2944). No other row has it.
- **M21 (removing the sheet's warning) is now caught** by the new AC86/J14 test. So is M21b, which removes the row's warning.

## The Design findings
1. **Another project's milestone named ("Example's MD1"): fixed, and within the spec.**
   - The project is named only when the milestone belongs to another project (workview.js `otherWords`). Within one project, the words stay exactly AC24's "not available: <code> has no estimate yet".
   - The card names the project only when more than one v3 project is connected (`many`). With one project, the card reads "not available: MD3 has no estimate yet" (test; mutation D4 caught).
   - Against AC24's fixed words (S-001.md:8411): this is a qualifier AC24 itself supports. AC24 says a row "names its project only when more than one v3 project is connected" (:8307-8308), and grouping took away the row's own project name. It cannot happen today, since there is one v3 project. Define should confirm.
2. **"Current plan · recorded": fixed, and the accepted view is untouched.**
   - The text is now `Current plan · recorded 18 Oct, 06:30`, exactly AC24's words (:8444).
   - Only sandbox.js imports workview.js. No accepted-view file is in the 0be0d16..84c1224 diff.

## Test weakening: none
- **AC24's 31 cases** are kept, with the same names as 0be0d16 (one name changed in round 1, already accepted).
- **The four "·" edits** in ac24-work-ahead.test.mjs are the same exact or anchored matches with the "·" added. The fifth "+" line is a comment.
- **ac82-home.test.mjs:351** is rewritten:
  - it is still an exact equality, now "not available: Twin's MD1 has no estimate yet";
  - a new assertion keeps AC24's words within Twin;
  - so it is not weaker. But it changes what a stage-2 locked test expects (its old message said Plan's words stay "unchanged"), so it should rest on Define's confirmation of Design finding 1.
- **The round-1 AC86 gate case** was replaced by three stricter cases. That case was the Builder's own stage-5 test, not a locked one.
- **Mutations:** I ran 14 on a copy outside git, against ac86, ac24, j4-j14-j15, ac82 and ac80. 13 were caught: M21, M21b, gate row not drawn, gate row at the foot, gate marking rows again, "waits on you" dropped, gate value emptied, gate counted in the header, project named always, never on rows, never on the card, on the card with one project, and the "·" dropped. The 14th, G5 (Plan reading the Done lane for gates), survived. It is an equivalent mutation: the Done lane holds wrapper rows, not gate cards, so it changes nothing.

## New findings (none blocking; risks for the gate's case)
- **N5. Closing a gate sheet opened from Plan lands on Waiting, not Plan.** Route: Build/Design.
  - The gate row links to `#/waiting/card/<id>`, and the sheet's Close goes to `#/waiting`, which I reproduced.
  - A milestone sheet closes back to `#/work` with focus on its row. The gate row's `nav.opener = 'wa-gate:…'` has no effect there.
  - AC85's sheet does belong to Waiting, so this is a join-up difference, not a spec break.
- **N6. The gate row is not in the group's count.** Route: Define/Design to confirm.
  - Frame 11 counts it: "Members Letter … 2" holds a gate row and ML4.
  - The build shows "6" over 7 rows. Leaving it out fits AC24's "milestones to go".
- **N7. The gate row's name is the card's whole question,** about 200 characters, clipped to three lines by CSS (sandbox.css:1333). Route: Design reviewer.
  - Frame 11 draws a short name, "Ready to go live", and Home's tile says "the Launch gate".
- **Round 1's N1 to N4 still stand** as Define points. N1 and N2 (the icons for rules 3 and 4) are unchanged.

## Join-up review (Build: the parts working together)
| Path | Result |
|---|---|
| Waiting gate card: Home tile vs Plan | **Agree** (one helper), with a real-form card, with no `Milestone:` line, and with none |
| Gate marked done on the device | Leaves Home and Plan together (test) |
| Plan gate row → its card on Waiting | Opens the right sheet; Close lands on Waiting (N5) |
| Plan row "1 waiting on you" → board | Works (unchanged) |
| Plan's ⇅ ordering and "Record plan" | Gate left out (test) |
| Home "Next:" finish vs Plan's | Same (ac82 tests pass) |

## Open questions
1. **For Define (B1 reading):** confirm the gate as a row of its own, and that it is left out of the group's count (N6).
2. **For Define (leftover):** should a gate card's `Milestone:` line count on milestone rows as "<n> waiting on you"? Or should the model write only the milestone the gate closes?
3. **For Define (Design 1):** confirm "<project>'s <code>" when another project's milestone is meant. ac82:351's new expectation rests on this.
4. **For the Design reviewer:** N5 (where Close lands) and N7 (the long gate title on Plan).

The scratch worktree, mutation copy and probes are removed. Nothing in either repository was changed, and build/builder/desk-v2-5 is still at 84c1224.