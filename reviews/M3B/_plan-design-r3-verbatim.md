# M3B plan: the Design reviewer's round 3 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at cc2d826 (the plan, draft 3).

---

Verdict: FAIL

In plain English: draft 3 settles all three of round 2's blocking points.
- "Didn't need me" now sits in the same place on every kind of sheet, as far as it can be from the answer buttons.
- The row's mark can no longer show success the Chief of Staff's checks don't give.
- Question 1 now offers all three readings, with the sheet's words for each.

One new point fails, under question 1's recommended answer A (12 to 25 Nov):
- On launch day the row says "Measured since 11 Nov", although under A nothing is measured on 11 Nov.
- On the same day, AC97 gives V1 to V3 two different lines.
- It's a small fix, but it would show the owner a false date on the reading the plan recommends.

The six questions now read plainly enough for chat.

How I judged it: the diff 617ec2e..cc2d826 changes only specs/S-001.md, and nothing under src/ or tests/. Nothing renders differently, so I took no screenshots. I checked the plan's words against the design pack, against mockup v2's frames 5 and 9, and against the sheet code at 3bfe663 (src/public/sandbox.js:3044-3245 and :3418-3464).

**Round 2 fixes, one by one**
- B1 ("Didn't need me" placement): holds.
  - AC25 (S-001.md, around :12934-12948) makes it the sheet's last line on every kind of sheet, with a hairline above.
  - On question and gate sheets it sits below `sheetFoot`, which is where they end in the code (sandbox.js:3167, :3245). On other sheets it sits below the closing row ("Done ✓ · Close", "Undo · Close" or "Close").
  - It also covers the "No longer waiting" and being-recorded sheets.
  - It is neutral, never `--you`, at least 24 px tall, and says "Unmark", not "Undo".
  - Reading (k) and CS32 match it.
- B2 (row icon): holds.
  - One rule (:13090-13095): the red cross if any target is missed; the green check only if every target is met; otherwise the half circle if any is on track or met; otherwise the planned ring.
  - The row's parts add up to the number of targets.
  - Launch week no longer reads "0 checked".
- B3 (question 1): holds as a question.
  - It offers 12–25, 11–24 and 11–25 Nov, with the sheet's words for each (:13053-13064; question 1 at :19557-19592). "day <d> of 15" and "Launch day and the 14 days" are used under C.
  - I don't pick a reading.
- N1 ("0 checked"): holds, but see B1 below.
- N2 (icons): holds.
  - Figure and fact lines are plain text (:13103-13106).
  - "Not measured" gets the planned ring, never the dashed "?".
  - V4's archive line is "your Chief of Staff checks it after launch" with the ring until a check is due, then "?".
- N3 (weekly line before launch): holds. Before launch, weeks are offered only under question 3's C, marked "before launch: a trial, not counted"; under A or B the sheet says "Offered from launch week".
- N4 (stop-rule quote): holds. The heading is "Miss and stop rule", and the quote runs from "Miss and stop rule:" to "re-aim or stop." (docs/PROJECT.md:191-194). The measuring design is left out.
- N5 (CS32's frame list): holds. CS32 (:17373-17389) now lists every row state with its icon, and "Didn't need me" as the last line on each kind of sheet.

**Blocking**

B1. Under question 1's A, launch day shows a false date, and AC97 gives V1 to V3 two lines for that day (item 5; an unverifiable claim is a FAIL).
- The row rule (:13080-13081) says "from launch while no target has a J25 line in the window: "Measured since <launch date> · first weekly check due <date>"". Under A the window starts the day after launch. So on 11 Nov the row says "Measured since 11 Nov" when nothing is measured that day, and V5 counts no launch-day card.
- CS32 (:17373-17374) draws that same line, "Measured since 11 Nov · first weekly check due 18 Nov".
- For V1 to V3 on launch day under A, AC97 gives two rules:
  - :13055-13056 says "on launch day the measures read "Measured from 12 Nov"";
  - :13150 says "from launch until its first check is due: "First check due <date>"".
  
  A builder can't satisfy both, and the VT1 row (:3346) lists only the second.
- Question 1's option A (:19570-19572) says only "the sheet says "day 1 of 14" from 12 November". The owner isn't told what the row and sheet say on launch day itself.

**Non-blocking**

N1. V5's before-launch line says "Measured over the 14 days from <the window's first day>" (:13126). Under question 1's C the window is 15 days, so this line contradicts C's own "day <d> of 15" (item 5).

N2. Once the window is over, "work under way" can stick for good (item 13; reading (h)).
- After every last check is in, a set such as "3 met · 2 not measured" keeps the half circle, meaning in progress, indefinitely.
- A "Not measured" line written after the window carries the ring that means "not started".
- Both are honest about the Chief of Staff's lines, but neither reads as finished. The picture (CS32) should include this state so the owner can judge it.

N3. The draft 2 change record (:3409) still says "above "Done ✓ · Close"". It is history, but a builder reading the amendment top to bottom meets the old placement first; it could be marked as replaced in draft 3.

N4. With question 4's A, the quoted stop rule keeps "(proposed 2026-11-11)" word for word (:13163), while the row deliberately drops "(proposed)". Quoting the record as written is correct (item 5). The owner may notice the two on one sheet; this is a note, not a fix.

**Questions for the owner**

None new. Question 1 already puts the window to the owner; B1 only needs its option A to say what launch day itself reads.

**Do the six questions read plainly for chat?**
- Question 1: plain. The three readings are fairly put, each with what counts on launch day and the sheet's words. Option A needs B1's launch-day words.
- Question 2: plain. A and B now differ in words ("the line adds that the desk notes on each device…"), and the full lines are in Context.
- Question 3: plain and honest. It states what can't be undone, and that the weekly check's lines are public under every option.
- Question 4: plain.
- Question 5: plain.
- Question 6: long, but each reading is in plain words. (e), (f) and (h) now describe the marks ("the dashed ring that means not started", "a green tick only if every one is met"), and (k) matches AC25.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: AC97 at :13037-13181 (launch day at :13053-13056, :13080-13081 and :13148-13153); AC25 at :12914-12975; the VT rows at :3346-3348; CS32 at :17366-17389; the questions at :19547-19810
- /home/user/sd-m3bdef/src/public/sandbox.js: the sheets' foot rows at :3083-3088, :3167, :3245, :3418-3424 and :3459-3464
