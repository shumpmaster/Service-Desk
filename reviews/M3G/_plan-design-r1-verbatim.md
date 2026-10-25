# M3G plan: the Design reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at a9a0d36 (the plan, draft 1).

---

Verdict: FAIL

In plain English: the plan does give you what you asked for in outline. Questions get their own place at the top of Waiting, each choice is a button that opens GitHub with your answer written, and every waiting card shows a number. Four things stop it as written:
- The numbers will often not match the order you read the screen in. The section that puts questions on top also ranks them above other kinds of ask. That runs against two of your earlier choices: "Blockers first", not "questions first", and decision kinds told apart without ranking. The plan settles this by default, inside a bundle of twelve readings, when it should ask you.
- On a 360 px phone, the new "4 of 6" mark makes some cards' top line wrap. The plan says nothing else on a card moves, and that is not true.
- Nothing says what the "Waiting on you" lane says once the questions leave it. Built as written, it could read "Nothing here" while three questions wait above it.
- The answer buttons are set at the board's small size, and nothing gives each choice the extra room you asked for on 16 Oct. You called the current way "tiny".

Below are what needs fixing before build, then notes, then questions for you. This is a plan review, so nothing was built or drawn. The one measurement uses the real stylesheet and fonts, in Chromium at 360 and 414 px.

## Blocking findings

**F1. Places that don't follow the order you read in, and a section that ranks by kind, are settled by default.** (Part A items 1 and 18; your answers "Top of Waiting" and "Blockers first"; P-001-design-discovery.md answer 6; P-001-board-scope.md, C; the escalation rule.)
- The section holds every question, at the top, at full width, with its buttons showing. Pull requests, deploys, gates and decision cards stay in half-width lanes below.
- So questions are drawn above every other kind of ask because they are questions. Answer 6 rules that kinds are told apart without being ranked, and you turned down "questions first".
- The numbers say the opposite: a question can read "4 of 6" above a card reading "2 of 6" (S-001.md:9590), and places skip between project groups in the lane (reading (e)). You asked for "an order established and published on their card". On screen, the order you read in and the numbers disagree in three places: section against strip against lanes, and group against group.
- This is a clash between your rulings. It sits in question 7 as readings (b) and (e), under "A. All stand", and S-001.md:16863 says "my recommendation is each one's default". So if you don't answer, the clash is settled for you.
- Reading (h) has the same problem: no box for your own words in the section (S-001.md:9489, 16945). Trial-view note 15 rules "Wherever a ruling is asked: … a text box for the owner's words". Checklist item 17's pass for board cards ranks below that ruling.
- These need to be asked as questions of their own, with no default, and shown in question 6's picture.

**F2. "Nothing else on a card moves for it" (S-001.md:9578-9579) is false at 360 px.** (Items 6, 8 and 12; an unverifiable claim is a FAIL.)
- At 360 px each lane is 161 px wide and a card's inner width is 145 px (sandbox.css:595, 624). The kind line packs icon, kind word and "new" together (sandbox.css:627; sandbox.js:2193-2206).
- With the place mark in front, in mono 11 px ink, the kind line goes from 15 to 31 px tall, two lines, for:
  - "4 of 6" + Pull request + new
  - "12 of 12" + Pull request + new
  - "12 of 12" + Gate · Discovery + new
- At 414 px the last of these still wraps.
- The `md-extremes` fixture has 12 waits, so two-digit places are in the test set.
- The criteria need to say where the mark goes and how it wraps, and the QW2 tests need to check it at 360 px on md-extremes.
- Evidence: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m/m.mjs and page.html, run against src/public/sandbox.css with Plex Sans 500 and Plex Mono 400 loaded; no sideways scroll.

**F3. Nothing says what the lanes and quiet lines say once questions leave them.** (Items 3, 4 and 5; PROJECT.md intent "let the owner trust quiet".)
- The lane's head count and each project group's count count the cards in the lane (board.js:866). An empty lane reads "Nothing here" (board.js:42; sandbox.js:2383-2385). "Nothing waiting: <project>" shows when a project has no wait rows (board.js:860; sandbox.js:2470).
- If a project's only waits are questions, a literal build shows "Waiting on you · Nothing here", or "Nothing waiting: Service-Desk", under a section holding its questions, with the badge at 3.
- Otherwise the lane's head says "4" above cards reading "5 of 7".
- AC94 and AC95 need to state each of these counts and empty lines.

**F4. The answer choices are set at the board's tiny size, with no room.** (Item 17; P-001-answer-choice-spacing.md; P-001-board-answer.md, C; the request "more visible".)
- AC94 sets the buttons to "at least 28 px tall (AC80's buttons)" (S-001.md:9491). That is the board's `.v2-step`: 11 px text in a 28 px button (sandbox.css:640).
- The words sit "beside or under" the button, left open. Nothing is said about padding inside each choice or space between choices.
- The form you ruled for is the sheet's: the letter set apart, 10/12 px padding, 8 px gaps, 36 px buttons (`.v2-opt` and `.v2-abtn`, sandbox.css:675-683).
- Two things are unsaid. Does a choice show just its words, or its words plus the description after the dash? The sheet splits them (`splitChoice`). And which button style is used?

**F5. Numbers that don't say what they are.** (Item 19, plain words first.)
- "Answer first · 2 wait on it: 3 and 5" does not say that 3 and 5 are places.
- "after 4" is meant to join the meta line, which already reads like "#235 · 2 h" in the same mono font, and `Blocks:` entries are `#<n>` pull requests.
- In the one-project view, "1 of 3 projects" (sandbox.js:2497) sits above cards reading "3 of 7".
- On top of these there are the badge, the section's count, the strip's count, the lane's count and each group's count.
- The words need to say what each number counts, and the picture should show the busiest case.

## Notes (not blocking)

1. **Colour is right.** No new colour, and no gold: gold means only next to reach (P-001-glance-plan-gold.md, A). Vermilion stays on the kind icon only. Waiting gets no soft box (P-001-glance-plan-readings.md (c)). No green or red beyond the marks (P-001-glance2-palette.md, A). All sizes are on the scale: 11, 12 and 13 px; 400, 500 and 600. Keep this.
2. **The section only looks like the Kicked back strip.** Its head is 600 12 px `--ink`, the same as the strip's head right below it. "More visible" rests on position and full width alone. The picture should test that.
3. **Which "tiny line" you meant.** There are two readings: the request record says the sheet with its small link; the Definer says the "Being asked in your session" quiet line with its fold. Question 2 asks where a held question goes, but not which one you meant.
4. **Question 2 A puts an unnumbered question among numbered ones.** It is also unsaid whether the section's count includes it, and whether it leaves the quiet line.
5. **No limit on the section's length.** Whole titles and whole choices mean five questions with four to six options push the lanes below the first screen at 360×740. Board titles are clipped at three lines today (AC89 (j)). Precedents: P-001-tile-summary-clip.md (tiles that "run on so long"), "shouldn't be overdone", "not get hit in the face" (P-001-design-discovery.md).
6. **Two empty lines stacked at the top.** With nothing waiting, "Questions for you · none" sits over "Kicked back · none".
7. **A kicked-back question moved into the section.** Its kind line (the kick icon, "Kicked back") is unsaid.
8. **Dragging from the section to Done.** The Done lane may be off-screen below a tall section; auto-scroll is unsaid.
9. **Every project.** The `Blocks:` line is a Service-Desk practice (CS28), not in the model's template. In POOM and other projects, "Answer first" never shows unless their Chief of Staff writes the line. Question 1's option A should say so.
10. **The one-project view.** Where the section sits relative to the project chip and "Can't read" is unsaid.
11. **The kind icons lose their line.** The place mark before the kind icon shifts the vermilion icons off the left edge, where they line up today. This is not a part-B finding, because mockup v2 doesn't draw this.

## Questions for you (asked, not picked)

1. When a non-blocking question sits at the top as "4 of 6" above a card reading "2 of 6", and places skip between project groups, is that all right? Or should what you see follow the numbers?
2. Should the questions section have a box for your own words, as your note 15 asks wherever a ruling is asked? Or are buttons enough, with the box one tap away in the sheet?
3. Should a long section show every question and every choice whole, or the first few with the rest one tap away?
4. By "tiny little line drop down", did you mean the "Being asked in your session" line, or the sheet that rises when you tap a card?
5. With no questions, should the section still show "Questions for you · none"?

The repository is unchanged; my only files are in the scratchpad folder above.
