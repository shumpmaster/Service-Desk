# M3B plan: the Design reviewer's round 4 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at c809483 (the plan, draft 4).

---

Verdict: FAIL

In plain English: draft 4 fixes the launch-day row and gives the row one clear sequence of states.
- The row now shows the window's first day, not the launch date.
- It never shows a due date that has passed.
- Every target is accounted for in words.
- Option C reads "first 15 days" throughout the row.
- The final state now says "checked".

One gap is left on the day round 3 was about. Under question 1's recommended A, nothing says what the response-time target (V5) shows on launch day, 11 Nov. Each other target has one line for that day; V5 has none, so a builder would have to guess. It's one line to add. Two smaller wording mismatches remain, and the questions still read plainly for chat.

How I judged it: the diff cc2d826..c809483 changes only specs/S-001.md, and nothing under src/ or tests/ has changed since 3bfe663. Nothing renders differently, so I took no screenshots. I checked each of the row's eight states and each target's lines, for each of question 1's three readings, against the design pack and mockup v2's frame 5.

**Round 3 fixes, one by one**
- B1 (launch day under A): holds for the row and for V1 to V3, but not for V5 (see B1 below).
  - The row's state 2 (S-001.md:13113-13114) reads "Measured from <W1> · first weekly check due <D1>", that is "Measured from 12 Nov · first weekly check due 18 Nov".
  - V1 to V3 have one line that day, "Measured from <W1>" with the planned ring (:13196-13197). The rule for the days from W1 until D1 now starts at W1 (:13198), so the two no longer collide.
  - Nothing says "since 11 Nov" under A (:13081).
- Strict sequence (:13106-13130): holds.
  - The first state whose condition holds wins, and each state has bounds, so exactly one applies on any day.
  - A due date that has passed is never shown: state 4 reads "first weekly check not recorded yet", and state 7 reads "· last checks not recorded yet" once the last checks' due date has passed.
  - State 2 can only occur under A, since under B and C the window starts on launch day.
- C's own words: holds for the row ("first 15 days over" and "first 15 days checked"). One sheet line conflicts; see N1.
- My round-3 N1: holds. V5's line before launch reads "the 15 days" under C (:13170-13172).
- My round-3 N2: holds as a question for the owner. State 8 reads "5 targets · first 14 days checked · 3 met · 2 not measured" with the half circle, and CS32 draws it "for the owner to judge" (:17431-17434).
- My round-3 N3: holds. Draft 2's placement note is marked replaced (:3413).
- Question 1's option A now says what launch day reads (:19624-19626).

**Blocking**

B1. Under A, V5 has no line for launch day (item 5; an unverifiable claim is a FAIL).
- V5's lines are defined for three periods (:13169-13181):
  - "before launch", which applies while M3C is not reached ("Before M3C is reached, nothing is "after launch"", :13091);
  - "in the window", from W1;
  - "after the window".
- Under A, launch day (11 Nov) comes after M3C is reached but before W1 (12 Nov). None of the three applies.
- The rule for targets with nothing measured yet, which now covers launch day, applies only to "any other target" (:13194). The V4 and V5 rules say "V4 and V5 never show "First check due"" (:13164).
- A's own bullet says "the row and the measures say "Measured from 12 Nov"" on launch day (:13081). It doesn't say whether that replaces V5's last-14-days figure or sits under it.
- So the builder would guess one of three things: keep "Before launch, weekday cards, last 14 days: …" (false on launch day), start "day 0 of 14", or show nothing. CS32's frame list doesn't draw V5 on launch day either.

**Non-blocking**

N1. Under C, the sheet's words after the window are given two ways.
- C's bullet (:13087-13089) says the sheet after the window reads "Launch day and the 14 days after it, 11 Nov – 25 Nov".
- V5's after-window pattern, "<window words> after launch, <from> – <to>" (:13176), with C's window words "first 15 days", gives "First 15 days after launch, 11 Nov – 25 Nov".
- That is two strings for one line. The second also says "after launch" of a window that includes launch day.

N2. The row's mark and the sheet's marks disagree in states 4 and 6 (part B item 30; the three states told apart).
- The row's icon rule reads only the Chief of Staff's states, so in state 4 ("first weekly check not recorded yet") and state 6 ("no weekly check recorded yet", after the window) the row shows the planned ring, which means not started. CS32 draws state 4 that way (:17424-17425).
- In the same state, each of V1 to V3 on the sheet shows "Weekly check not recorded yet" with the dashed "?", which means a record is missing (:13199-13200).
- That is one fact with two marks. A check that is late is not "not started".

N3. Final state 8 pairs "checked" with the half circle, which means work under way, as I asked in round 3. This is left for the owner to judge in the picture, which is the right route. I note it only so the picture's caption names the pairing.

**Questions for the owner**

None new.

**Do the questions still read plainly for chat?**

Yes.
- Question 1's options each say what counts on launch day and what the sheet and row say. Option A now covers launch day. Once B1 is fixed, it should also say what the response-time line shows that day.
- Questions 2 to 6 are unchanged from draft 3 and still read plainly.

No regressions found:
- "Didn't need me" is still the last line on every kind of sheet.
- The weekly line's rules, the stop-rule quote and the B2 icon rule are unchanged.
- Question 3's WHY now states that the weekly figures are public under every answer, in plain words.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: AC97's window and row states at :13073-13140, V5's lines at :13167-13184, the nothing-measured rules at :13194-13203, CS32 at :17415-17445, question 1 at :19611-19645
