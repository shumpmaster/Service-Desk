# M3G plan: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at 2ca5255 (the plan, draft 2).

---

Verdict: PASS

In plain English: draft 2 fixes all five things I raised in round 1. How the numbers line up with what you see is now a question for you with no default. The new number sits on its own line and fits a 360 px phone. The lanes now say plainly that your questions are above. The answer choices use the roomier form from the sheet. Each number now says what it counts. What remains are small points for the build review and the five questions the plan already puts to you.

I checked this read-only against `git diff a9a0d36 2ca5255` on build/definer/questions-order. I re-measured F2 with the scratchpad scripts, using the real sandbox.css with IBM Plex Sans 400 and 500 and Plex Mono 400 loaded, in Chromium at 360 and 414 px, light and dark.

## Round-1 findings

**F1: fixed.**
- Question 1 is now "How should the numbers meet the screen?" with options A, B and C, and states "No default: this is your call" (S-001.md at 2ca5255, Open, question 1; AC95 "The numbering").
- It names both sides of the clash: your answers "Top of Waiting" and "Blockers first", discovery answer 6 and P-001-board-scope.md. I checked the quotes against the ruling files and they match word for word.
- The section is now grouped by project, as P-001-board-scope.md, C has it.
- Note 15 (P-001-trial-view-notes-1.md) is met: the section has a box for your own words, folded behind "Add your own words", and it shares its saved words with the sheet.

**F2: fixed, measured.**
- "<k> of <N> waiting" now sits on a line of its own above the kind line.
- "12 of 12 waiting" is one line, 15 px tall, in a 145 px lane card at 360 px and a 172 px card at 414 px, in both themes.
- The kind line with "Pull request" + new or "Gate · Discovery" + new stays one line, 15 px.
- The text is ink: rgb(24,25,28) on the light card rgb(251,251,251), and rgb(236,237,239) on the dark card rgb(23,24,27).
- No sideways scroll. The QW2 tests lock this on md-extremes at both widths.

**F3: fixed.**
- The lane's count and each group's count count only the cards left in the lane.
- An empty lane reads "Nothing here; your questions are above".
- "Nothing waiting: <project>" shows only when the section, the strip and the lanes all have nothing for that project.
- The badge is the sum of all three. Each of these has a test in QW1.

**F4: fixed.**
- The choices use the sheet's form: `.v2-opt` boxes (10 by 12 px inside, 8 px apart), the letter set apart, the description split out by `splitChoice`, "Recommended" on one box, and 36 px `.v2-abtn` buttons (sandbox.css:676, 683).
- This meets P-001-answer-choice-spacing.md and checklist item 17. The tests check the boxes' measures.

**F5: fixed.**
- The new wording is "<k> of <N> waiting", "Answer first · cards 3 and 5 wait on it" and "Waits on question 1".
- "Unblocks" now means only the milestone line.
- The project chip keeps "<k> of <n> projects", so the word after the number tells the two counts apart.

**Round-1 notes**, all addressed:
- A held question: question 3 A gives it the line "Being asked in your session" and no number, and B now names the "tiny little line" reading.
- The section's length: reading (d), and the picture in question 4 covers the busiest case.
- The empty line: reading (i).
- A kicked-back question: shows "Kicked back · Question" with its reason.
- Drag: questions in the section are not dragged; "Done ✓" instead, reading (a).
- Every project: AC96 "Every project" and question 2 now name the cost.
- The one-project view: the section goes under the chip.
- The kind icons' left edge stays where it is.

Colour is unchanged and right: no gold, vermilion only on the kind icon, no soft box on Waiting.

## Notes for the build review (not blocking)

1. **The "Waits on …" line.** Its type role and its tap size are not set. I drew it in the cards' 11 px text style. It wraps to two lines (34 px) at 360 px for "Waits on questions 11 and 12", and at both widths for "Waits on a question being asked in your session". It is a tap sitting inside a card that is itself a link, so it needs a target of at least 24 px (item 11) and must sit above the card's full-card link (`.v2-t::after`), as `.v2-step` does.
2. **Other new targets.** The section's "Add your own words", "More about it ›" and "Done ✓" have no size set. The build review should check them against item 11.
3. **Losing drag for questions.** Reading (a) replaces the "drag and drop" you described on 2026-10-19 with "Done ✓" for questions. It is disclosed in question 5. Your rulings don't fix drag, so this is not a finding.
4. **Group count against N under option B.** A lane group's count can be smaller than the N on its cards. The plan says so, and the picture should show it.

## Questions for you (asked, not picked)

All five are already in the plan's "Open" list:
1. How should the numbers meet the screen: A, B or C? No default.
2. How does the desk learn which cards wait on a question: the question names them, the waiting item names the question, or the operating model adds a field first?
3. Should a question being asked in your session show in the section, or stay in its quiet line? This also asks which "tiny little line drop down" you meant.
4. Do you want a picture first?
5. Do the fifteen readings stand?

The repository is unchanged. The measuring scripts are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/m/ (m2.mjs this round, with page.html), and draft 2's spec is copied to /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/s2.md.
