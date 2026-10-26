# M3B plan: the Design reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at 31ff26d (the plan, draft 1).

---

Verdict: FAIL

In plain English: the plan puts the targets in the right place. Option A, the one row on the project page and its sheet, fits mockup v2's frame 5 and the owner's tab and Home rulings. Its "never counted, never coral, never notified" rules for the weekly line are right. But four of the words and states it specifies would show the owner something the records don't support, or show it in a form the rulings forbid:
- V4 can read "Met" after its date has passed.
- The 14 days end on 24 Nov, right under the owner's quoted "2026-11-25".
- Weeks are labelled by an ISO code, set in UTC.
- "Not due yet" uses the "not recorded yet" icon.

Each needs fixing, or putting to the owner, before a picture is drawn. A picture first (question 5) should be asked, and I recommend A.

How I judged it: the diff 3bfe663..31ff26d changes only specs/S-001.md (`git diff --stat`: 1 file, +661 −2). Nothing renders differently, so I took no screenshots. I judged the plan's specified words, icons and placement against the pack (governance/domains/design/README.md), mockup v2 (docs/design/mockups/desk-v2.html:610, :740, :812-823; desk-v2/README.md) and the code at 3bfe663. tests/desk/ac83-page.test.mjs passes (23/23), and the locked cases the plan names exist at ac83-page.test.mjs:466 and ac82-home.test.mjs:115.

**Blocking**

B1. V4 can read "Met" after its date is missed (part A item 5; the plan's reading (e); PROJECT.md §6 stop rule).
- Evidence: AC97, specs/S-001.md:12843-12937, V4: "state: "Met" with the green check once both parts are there". V4's line is "…and the old repository is archived, by 2026-11-11". The stop rule (docs/PROJECT.md:191) says "a miss is V4 not met by its date".
- As written, a launch on, say, 20 Nov plus an archive line shows a green "Met" that the record contradicts. This is the one state the desk judges itself, and it ignores the date in the line it quotes.
- Question 6 (e) does not tell the owner this.

B2. The weekly offer's labels lead with a code, and its week is not the owner's week (items 19 and 20; P-001-s001-owner-questions.md).
- Evidence: AC25 as changed (S-001.md:12763-12794) gives "Save <YYYY>-W<ww> ↗" per week in "Your weekly figures". The line appears "from Monday 00:00 UTC".
- Item 19 wants plain words first, with codes after in small mono. "2026-W46" is a code, used as the button's only label.
- Monday 00:00 UTC is Sunday 18:00 in Chicago, so "Last week's desk figures are ready" appears on Sunday evening, before the owner's week has ended.
- The file's own UTC form (J5) is a record and not judged here. What the screen says is judged.

B3. "Measured from launch", and the first week's "No figure recorded yet", carry the "not recorded yet" icon (part B item 30; frame 5; README "The three states told apart").
- Evidence: AC97 gives "in the planning project before launch, "Measured from launch" with the dashed "?"".
- Frame 5 draws that same phrase with the planned ring (desk-v2.html:610, `ST('planned')`).
- The dashed "?" means a record that should exist and doesn't. Before launch nothing is due.
- The same applies after launch day, until the first weekly check (about 18 Nov): V1 to V3 would read "No figure recorded yet ?", which looks late when it isn't.
- The plan names no not-yet-due state for that week.

B4. The 14 days shown don't match the owner's ruled end date, and question 6 (c) hides the gap (item 5; escalation rule).
- Evidence: reading (c) and AC97 make the window "that day and the 13 after it", so 11–24 Nov. The sheet would show "First 14 days after launch, 11 Nov – 24 Nov".
- Directly above that, the quoted V1 to V3 and V5 lines say "2026-11-25". The owner's ruling says the checks run "to 2026-11-25" (decisions/questions/P-001-move-to-build-values.md:6).
- The two readings (inclusive end on 24 Nov, or 25 Nov 00:00 as an exclusive end) differ, and that difference is visible on one sheet. I don't pick a reading. Question 6 (c) must name it for the owner (see Q1 below).

**Non-blocking**

N1. The row's small line departs from frame 5 (item 26).
- Frame 5 reads "Measured from launch · V4, replacing the old page, by 11 Nov (proposed)" (desk-v2.html:610). The plan's line is "5 targets · none measured yet". It drops the one dated target, and it says "none measured" while the sheet shows a V5 figure (the plan's own exception, AC97).
- Frame 5's "(proposed)" is out of date now that the date is confirmed. Either way, the difference should be said or drawn.

N2. "After the 14 days" doesn't read differently from "during" (item 13; three states).
- The row's icon stays AC59's half circle, meaning in progress (sandbox.js:644), forever once anything is measured.
- "5 measured · 1 missed" carries no word that the window has closed. The final state needs its own icon and words.

N3. Where "Didn't need me" sits is not drawn (items 11, 17 and 21; P-001-board-done-button.md; the plan's own risk "read as dismissing").
- Every card sheet already ends "Done ✓ · Close", or "Undo · Close" while confirming (sandbox.js:3418-3424, :3459-3464). The plan puts the control "after its other controls", which is after Close. Its marked form, "Marked: didn't need me · Undo", adds a second "Undo" with a different meaning.
- The plan doesn't say how the control shows on a confirming, kicked-back or "No longer waiting" sheet. An item marked and then answered loses its visible mark and its Undo.
- An inline "Undo" needs to meet the 24 px target or one of WCAG's exceptions.
- It is also not stated that the control is neutral, never `--you` (item 14).

N4. The weekly line at Home's foot may never be seen (PROJECT.md intent, "Missed decisions", which applies to the measure itself).
- It sits below every tile and the portfolio (sandbox.js:1094-1101).
- Its type role and icon are unstated. It must not be a soft box (AC92 (e)) or look like an ask.
- After 8 weeks the oldest week is dropped with no word on screen. "Your weekly figures" should say that notes are kept on this device for up to 8 weeks.

N5. Plain words (item 19).
- V4's measure says "the needs-you address", while the V4 line quoted just above it says "the Operations-Hub address": two names for one thing on one sheet.
- "not available: its log is no longer read" is jargon.
- The during and after V5 lines drop AC21's "weekday" (asked.js:17, :35).
- "Before launch, last 14 days: <AC21's figure>", tested as "equal to AC21's line", would repeat "last 14 days" if the whole line is used.
- The sheet's small line, "… · checks: intake/value-checks.jsonl", puts a path where plain words should come first. On another project's sheet it names Service-Desk's file as if it were that project's.

N6. Every project (pack, "Every project"; item 6; frame 9).
- CS34 writes J25 lines for Service-Desk only, and no writer is named for any other project. So another v3 project's row reads "none measured yet" and its sheet "No figure recorded yet ?" permanently.
- Frame 9 draws an example project's target with a figure taken from its own records ("41% in EXP-1", desk-v2.html:740).
- A v3 project whose section 6 isn't in `V<n>:` form gets no row at all (`valueTargetLines`, src/lib/j11.js:181-194; projectpage.js:567). Its "No value targets…" text (sandbox.js:1578) can't be reached. This was already true before the change, so it is a follow-up.
- md-extremes has no V lines. The fixture list should add a project whose section 6 is not in V-form, ids that don't run in order, and a long target on another project.

N7. The miss and stop rule are not shown, and reading (l) hides the one thing measured before launch.
- Frame 9 puts "stop rule: …" beside its target.
- Section 6's miss rule, including "more than about 2 hours a week … before launch", is the only rule that can trip now. The sheet could quote it.
- Question 1's own recommendation, "a missed target goes to the evidence review", would read better if the sheet said so.

N8. Reading (n): putting the weekly check under "Not tied to a milestone" flags an agent-owned gap every week (item 14; README: the grey diamond is for "agent-owned gaps").
- A weekly check is not a gap. AC60 keeps estimates off for the same reason.
- I recommend keeping it off.

N9. CS32 has the Design reviewer draw the picture. My card says "never redesign the page yourself".
- There is precedent: M3G's picture was drawn this way (commit 8b9b86b; P-001-m3g-picture.md, A).
- If that route is kept, VT1's review should be done by a fresh session, which it is by design.

Already present before the change, as follow-ups: the `--soft` contrast noted in the pack, and the non-V-form row gap in N6.

**Questions for the owner**

Q1 (from B4). Your 14-day checks run "to 2026-11-25". Should the desk show the window as 11–24 Nov (launch day plus 13), or as ending on 25 Nov?

Q2 (from N7). Should the targets' sheet quote section 6's miss and stop rule under the targets, as frame 9 does?

**Recommendations on the plan's questions**
- Question 1: A.
  - It is frame 5's row, and AC83 is already built that way.
  - D would add a tab that P-001-home-tab.md (A: "the bar is Home · Waiting · Plan") excludes. P-001-portfolio-tab.md (A) allows a fourth tab only "when it holds more". A cross-project Value screen also crosses the boundaries the owner keeps ("I don't like to "cross boundaries"", P-001-design-lab-1.md).
  - C would flag on Home something the stage-8 evidence review already brings as its own card. That is a double flag ("not get hit in the face", P-001-design-discovery.md; PROJECT.md "False alarms").
  - B is frame 9's form. It fits a project with one or two targets, but five long ones crowd the page (P-001-redesign-conflicts.md item 1).
- Question 2: A, from design. The control and the line should be tried on the preview before counting starts.
- Question 3: no design view; it is for the Reviewer and security.
- Question 4: A. The reworded line matches what the screens will show.
- Question 5: ask it; recommend A. The picture should hold:
  - everything CS32 lists (S-001.md:17067-17099);
  - "Didn't need me" on a question sheet (under its answer buttons and text box), on a gate sheet (beside Kill's "Can't be undone") and on a card sheet, each unmarked, marked, confirming and kicked back, at 360 px in light and dark;
  - the sheet in launch week before the first check (B3's state);
  - the row and the sheet after the 14 days, final (N2);
  - "Weekly checks: not available";
  - each of V4's four states;
  - a long target line cut at three lines, and opened;
  - another project with targets and no check, and a v3 project whose section 6 isn't in V-form;
  - Home's whole foot (portfolio, weekly line, "More detail" closed) at 360 px, dark, with one week and with eight weeks waiting.
- Question 6:
  - (a), (b), (f), (h), (j), (k), (m): stand.
  - (c): put Q1 to the owner first.
  - (d): stands, with the planned ring rather than the "?" (B3).
  - (e): change, so that V4's "Met" respects its date or is left to the Chief of Staff's check (B1).
  - (g): stands, once its place is drawn (N3).
  - (i): stands, with N4's additions.
  - (l): show the stop rule instead (N7).
  - (n): change; keep the check off "Not tied to a milestone" (N8).

The plan is in /home/user/sd-m3bdef/specs/S-001.md:3134-3309 and :19175-19276, with AC97 at :12843 and J25 at :15935. The mockup is /home/user/sd-m3bdef/docs/design/mockups/desk-v2.html (frames 5 and 9 at :596-614 and :727-745).
