# M3B plan: the Design reviewer's round 5 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at f36ca26 (the plan, draft 5).

---

Verdict: PASS

In plain English: each of round 4's points now reads right in words and marks.
- On launch day the response-time line says "Launch day" and dates the 14 days from 12 Nov.
- Option C has one label for its window.
- A late check shows the "record missing" mark on the row as well as on the sheet.
- The final state's picture caption explains its mark.
- The new "weekly checks not available" state is in words alone.

One small point is left. It is not blocking: on a project other than Service-Desk, a failed read of the weekly checks would show "no weekly check recorded" on the row. The questions still read plainly for chat.

How I judged it: the diff c809483..f36ca26 changes only specs/S-001.md, and nothing under src/ or tests/ has changed since cc2d826. Nothing renders differently, so I took no screenshots. I checked only the round-4 points and the new state 0, against the design pack and mockup v2's frame 5.

**Round 4 fixes, one by one**
- B1 (V5 on launch day under A): holds.
  - On launch day, V5's before-launch line is replaced by "Launch day, weekday cards, last 14 days: <AC21's figure and count>", as plain text, then "Measured over the 14 days from 12 Nov" with the planned ring (S-001.md:13202-13206). Every target now has a line for every day.
  - Before launch, V5 now says "Measured over the first 14 days after launch", with no date (:13197-13201). That is right, because the window's first day comes from M3C's reached date, which doesn't exist yet. Under C it says "over launch day and the 14 days after it".
  - Question 1's option A (:19664-19667) says: "the response-time line shows the last 14 days' figure labelled "Launch day", and from then "day 1 of 14"". This is plain and matches AC97.
  - The VT1 row and CS32 (:17470-17472) carry the same lines.
- N1 (C's label after the window): holds.
  - The sheet now uses one label for the window after it: "First 14 days after launch" under A and B, and "Launch day and the 14 days after it" under C (:13109-13111).
  - V5's line after the window uses that label (:13210), and the old "<window words> after launch" pattern is gone everywhere.
- N2 (row mark in states 4 and 6): holds.
  - The icon rule's new step (:13162-13165) gives the dashed "?" in state 4 ("first weekly check not recorded yet") and state 6 ("no weekly check recorded yet"). It comes after red, green and the half circle, and before the planned ring.
  - So the row and V1 to V3 on the sheet show the same mark for the same missing record (part B item 30).
  - CS32 draws both with "?" (:17460-17466).
- N3 (CS32's caption for state 8): holds. The caption reads "Checked, with the half circle: the record is complete, but not every target is met or missed", for the owner to judge (:17466-17469).
- New state 0: reads right.
  - The row reads "<n> targets · weekly checks not available", in words only, with no icon. It applies after launch whenever the read of the weekly checks fails, in place of states 2 to 8 (:13132-13134).
  - It never applies before launch. The sheet's line, "Weekly checks: not available", matches it (:13238-13240).
  - A row with no icon already has precedent: frame 5's "Details" row has none (desk-v2.html:612). No colour carries meaning in this state (item 13), and the unknown is said in words rather than as a value (item 5).

**Blocking**

None.

**Non-blocking**

N1. On a project other than Service-Desk, a failed read shows as "none recorded" (items 4 and 5). This was already in draft 4; I missed it in earlier rounds.
- State 0 is defined only within the planning project's sequence. Another v3 project's row reads "<n> targets · <the parts>", or "<n> targets · no weekly check recorded" when it has none (:13158-13159).
- If the read fails, that row would say "no weekly check recorded", while its sheet says "Weekly checks: not available" (:13238).
- Using state 0's words on every project's row would make the two agree. A builder could fix this in VT1 without a new ruling.

**Questions for the owner**

None new.

**Do the questions still read plainly for chat?**

Yes. Question 1's option A now states, in plain words, what both the row and the response-time line show on launch day. Questions 2 to 6 are unchanged from draft 4.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: the window and the sheet's label at :13091-13116, the row's states and icon rule at :13123-13168, V5's lines at :13195-13218, the failed-read line at :13238-13240, CS32 at :17450-17485, question 1 at :19650-19680
