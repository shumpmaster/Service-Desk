# M3B plan: the Design reviewer's round 2 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at 617ec2e (the plan, draft 2).

---

Verdict: FAIL

In plain English: draft 2 fixes most of round 1.
- The desk no longer calls V4 met.
- Weeks are now the owner's own, Monday to Sunday in Chicago, shown as "the week of 9 Nov".
- The icon before launch is the planned ring, as frame 5 draws it.
- The weekly check is off the Timeline, and the weekly line is a plain row.

Three points still fail:
- The "Didn't need me" fix places the control above a "Done ✓ · Close" row. Question and gate sheets don't have that row, and those are the sheets where a mis-tap matters most.
- After the 14 days, the row's new final icon shows a green check whenever no target is missed, even if most were never checked. That is the desk judging, which the plan says it never does.
- Question 1's recommended answer (end on 25 Nov) makes the sheet read "day 15 of 14". The question also leaves out the most literal reading of the targets' wording.

The six questions are nearly ready for chat; notes on wording are at the end.

How I judged it: the diff 31ff26d..617ec2e changes specs/S-001.md and one new reference file, and nothing under src/ or tests/. Nothing renders differently, so I took no screenshots. I checked the plan's words against the design pack, against mockup v2 (frame 5 at desk-v2.html:610, frame 9 at :740), and against the sheet code at 3bfe663 (unchanged at 617ec2e).

**Round 1 fixes, one by one**
- B1 (V4 "Met" past its date): holds. AC97 (S-001.md:12981, :13033-13035, :13055-13060): "the desk calls no target met or missed itself, V4 included". The address part is a fact with its date, and the state comes only from the Chief of Staff's line.
- B2 (week code, UTC): holds. J5 (:13731-13734): the week runs Monday 00:00 to Sunday 24:00 in `ownerTimeZone`. The screen says "Save the week of <Monday> ↗" (AC25, :12903-12904), and the code stays in the file name only. The line starts Monday 00:00 Chicago (:12898).
- B3 (dashed "?" before a check is due): holds. "Measured from launch" and "First check due <date>" use the planned ring. "Weekly check not recorded yet ?" appears only once a check is due (:13061-13066). A check is due by the end of the Wednesday after its week (:12997-13000).
- B4 (24 or 25 Nov): moved to question 1, but the question is flawed. See B3 below.
- N1: holds. Before launch the row uses frame 5's words without "(proposed)" (:13004-13007).
- N2: does not hold. The final icon judges; see B2 below.
- N3: holds for card, pull request, deploy and portfolio sheets: neutral, `--t-small`, `--ink2` (#5c5f66 light and #a2a5ac dark, the same grey as `.v2-small`), at least 24 px tall, "Unmark" rather than "Undo", and kept on confirming, kicked-back and "No longer waiting" sheets. It does not hold for question and gate sheets; see B1 below.
- N4: holds. The weekly line is a `--t-body` row with a chevron, no soft box and no icon. The sheet says "Notes are kept on this device for 8 weeks, then dropped." (:12901-12907; AC82's note at :8410).
- N5: holds. "Serving the Operations-Hub address" is now used, "weekday cards" is kept in every V5 line, the sheet's small line has no path, and the old-log wording is gone.
- N6: holds. New fixtures are listed (:3311-3314). Frame 9's figure from a project's own records, and a section 6 not in `V<n>:` form, are listed as follow-ups (:13082-13085).
- N7 and my round-1 owner question 2: now question 4. Holds, but see N4 below.
- N8: holds. AC60 and J12 keep a weekly check's pull request off the Timeline by the same rule estimates use (:6570-6577, :14511-14516).
- N9: holds. CS32 has my frame list and a fresh review session for VT1 (:17262-17280).

**Blocking**

B1. "Didn't need me" is anchored to a row that question and gate sheets don't have (items 11 and 17; frames 3 and 4; P-001-gate-buttons.md; an unverifiable claim is a FAIL).
- AC25 as changed (:12889-12892) and reading (k) (:19621) put the control "directly above the sheet's "Done ✓ · Close" (or "Undo · Close") row".
- That row exists only on the card sheet (src/public/sandbox.js:3418-3424) and the portfolio card sheet (:3459-3464).
- A question's sheet ends with its answer buttons, then "✓ Move to Done · then answer on GitHub", then `sheetFoot` (why, what was checked, links) (:3092-3168, :3044-3048, :3083-3088). A gate's sheet ends with Proceed, Hold, Recycle and Kill (Kill marked "Can't be undone"), then a reason box, then `sheetFoot` (:3205-3245). Neither has a "Done ✓ · Close" row.
- So for the two kinds where a quiet control beside the answer choices matters most, the builder has nowhere stated to put it. The owner is also told, in (k), a place that doesn't exist.
- CS32 draws these sheets only if question 5 is A. The criterion has to say where the control goes regardless of that answer.

B2. The row's final icon makes a judgement the plan says the desk never makes (item 5; AC97's own rule; item 13).
- AC97 (:13013-13016): "after the 14 days, the green check when none is missed and the red cross when any is".
- With 3 met, 2 left "on track" or "not measured", and 0 missed, the row shows a green check: "5 targets · first 14 days over · 3 met · 0 missed". Green reads as "all met" (AC92 (a)), yet two targets were never judged.
- With no checks at all after the 14 days, the order of the icon rules ("planned ring until a target is checked" against "after the 14 days") is ambiguous, and the row could show green on nothing.
- The words also leave targets unaccounted for: "<k> met · <m> missed" says nothing of the rest.

B3. Question 1's recommended answer contradicts AC97's own words, and the question leaves out a reading (item 5; escalation rule: put the conflict to the owner whole).
- AC97 fixes the words "Since launch, day <d> of 14" (:13043), "First 14 days after launch, <from> – <to>" (:13046) and the row's "first 14 days over" (:13010).
- Under the recommended option A, 11–25 Nov, the window is 15 days. The sheet would read "day 15 of 14", and "First 14 days" would sit over a 15-day range. Neither the question nor AC97 says how the words change.
- The question offers only 11–24 (14 days) or 11–25 (15 days). Section 6 says "over the first 14 days after launch, 2026-11-25 (14 days after V4's date)". Read literally, that is 12–25 Nov: the 14 days after launch day, ending on the date the lines carry. It could equally be 11 Nov 00:00 to 25 Nov 00:00.
- I don't pick a reading. The question must offer each reading truthfully, and say how the sheet's day count and labels read under each.

**Non-blocking**

N1. The row during the 14 days can read "5 targets · 0 checked" (item 5; plain words).
- In launch week the rule "<n> targets · <k> checked" gives k = 0 (:13008). It is a true count, but a bare 0 is the look P-001-design-lab-1.md steers away from.
- The sheet already says "First check due 18 Nov". The row could say it in words too.

N2. Several measure lines have no icon specified, though AC97 requires "each with its state's icon" (:13024-13025; part B item 30):
- V5 during and after the 14 days;
- V4 "Serving … since <date>";
- V4 "Old repository archived: no weekly check recorded yet", which isn't due before the archive.

Also, a Chief of Staff line whose state is "not measured" gets the dashed "?" (:13032). The plan itself defines that icon as "a record that should exist and doesn't" (:13065), but that line is a record.

N3. The weekly line runs before launch (AC97's 14 days; PROJECT.md intent, "never flag what doesn't need the owner").
- Nothing limits the offer to weeks from launch. Once VT3 lands, the owner is asked each Monday to save weeks no check counts, and under question 3's A their open times are published.
- The plan should say whether pre-launch weeks are offered (useful as a trial) or held back.

N4. Question 4's quote is the wrong size and under the wrong heading.
- AC97 (:13072-13075) quotes "the paragraph of section 6 that starts "Miss and stop rule:"". That paragraph runs from docs/PROJECT.md:191 to :205 and includes the whole measuring design, so the quote is far longer than question 4's Context suggests (:191-194).
- It also says "(proposed 2026-11-11)", which the row now deliberately drops.
- The heading "If a target is missed" doesn't fit the pre-launch two-hours clause, which isn't a target. "Miss and stop rule", quoting only the rule's sentences, would be truer.

N5. CS32's picture list doesn't include the after-14-days row icons (B2) or the launch-week row (N1). If question 5 is A, it should.

**Questions for the owner**

Q1 (replaces the plan's question 1; see B3). Your targets run "over the first 14 days after launch, 2026-11-25". Should the window be:
- 11–24 Nov (launch day plus 13);
- 12–25 Nov (the 14 days after launch day); or
- 11–25 Nov (15 days, with the sheet's "of 14" changed to match)?

**Are the six questions plain enough for chat?**
- Question 1: not as written (B3). Otherwise plain.
- Question 2: in chat, the A and B lines look almost the same. Say the difference in words: A adds "and the desk notes on each device … and offers each week's figures". Quote the full lines in the file only.
- Question 3: plain, and honest about what can't be undone. Fit for chat.
- Question 4: plain once N4's heading and extent are fixed.
- Question 5: plain; fit for chat.
- Question 6:
  - eighteen readings is heavy for chat but readable;
  - (e) and (f) say "the planned ring", which is the desk's own term; "the dashed ring that means not started" would be plainer;
  - (k) states the B1 placement and needs to change with it;
  - (h) needs B2's fix.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: the amendment at :3134-3403, AC25 at :12869-12916, AC97 at :12977-13091, J5 at :13724-13790, CS32 to CS36 at :17259-17314, the questions at :19412-19642
- /home/user/sd-m3bdef/src/public/sandbox.js: the sheet foot rows at :3044-3048, :3083-3088, :3092-3245, :3418-3424 and :3459-3464
