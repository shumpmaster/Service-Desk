Verdict: FAIL

Reviewed: 56f95fe (specs/S-001.md, draft 2), against draft 1 cfc35d0 and base 93ee86e. I read it alongside decisions/questions/P-001-design-lab-answers-followup.md (fd78485), decisions/questions/P-001-design-lab-open.md and my round-1 verdict.

Draft 2 fixes all three round-1 blocking findings and handles the notes well. Both follow-up answers are quoted exactly. The surface guard passes, and the merge clone passes check_all. One new blocking finding remains, in the clip text itself: the spec requires a bubble that its own test fixture cannot fit. It is a small text fix.

## Round-1 findings
- **B1, fixed.** The amendment now names the AC51 + AC48 stacking test (lines 174-193: drop `.sb-band`, keep `.sb-dock`) and the band clearance in `placeBubble`. It does so under "Where the build stands" and in the brief. The false "Nothing else leaned on the band" is gone.
- **B2, fixed.** Line 1 is quoted as it starts, "Ruling: 11 Ruling: 1 I see no need…". I checked it against the record, curly apostrophe included. The stray "11 Ruling: " and the run-on question block are both named, and so is the way the line is read (eleven answers joined by ", ").
- **B3, fixed.**
  - Only answers 2, 3, 4, 7, 8, 9 and 11 are now said to match the build.
  - Answers 5 and 6 each name their model change and the reason: no record the desk reads holds the fact.
  - AC52's Deploys line is marked with the owner's "Yes" and the follow-up "After the model change (Recommended)". Both quotes match the record exactly.
  - The open question on 6 is closed by the owner's confirmation.
- **N2:** dropping the band is now marked (C). Fine.
- **N4:** the paragraph on the malformed line and the AC53 rule line is accurate.
- **N5:** the absence check now reads "nothing fixed to the bottom of Home's screen".
- **N6:** "Home's neutral look" is reworded. The README is left as an open item, with the reason that it is outside the Definer's lane. That is acceptable.

## Blocking finding

**B1. The whole-line bubble cannot sit "wholly inside the viewport" for the spec's own fixture, and the spec does not say what a too-tall bubble does.**
- **What the spec requires:**
  - AC55 (about specs/S-001.md:1898-1901): the bubble holds "the whole line, word for word and never cut, wholly inside the viewport at every width down to 360 px".
  - The AC55 and AC52 tests (about :1519-1524 and :1936-1942) use the owner's real record, decisions/questions/P-001-design-lab-open.md, at 360 px.
  - The words in that bubble are about 1,833 characters (`rulingWords`, measured in round 1).
- **Why it cannot fit:**
  - The bubble's CSS has no height cap and no scrolling (src/public/sandbox.css:134-140: font .9rem, line-height 1.4, padding 6px 12px 12px).
  - At 360 px the text is about 300 px wide, so roughly 41 characters a line. That makes about 45 lines at about 20 px each, roughly 900 px tall.
  - A phone 360 px wide is commonly 640 to 800 px tall.
  - This is my estimate from the CSS. No browser is installed here, so I could not render it.
- **It fails whatever the exact height:** the follow-up ruling covers "any future long ruling", which can be any length. A bubble of unbounded length can never be "wholly inside" a fixed viewport unless the spec says how.
- **What the Builder faces:** AC54's bubble rules forbid only sideways scrolling. They are silent on scrolling up and down, and they were written for a README summary of a few lines. As drafted, the Builder must either fail the test or invent a rule.
- **Fix:** add one rule, for example: "a bubble taller than the viewport is held to the viewport's height, less a margin, and scrolls up and down inside itself, never sideways; its Close control stays in view". Mark it (C). Also name the viewport height the tests use at 360 px and 414 px.

## The four (C) choices
1. **Time and code still show after a clipped line: accept.** This keeps AC55's existing form, "<words> · <time>, then code". The ruling did not touch the form, and dropping either would remove facts the owner already sees. It might also say plainly that the time and code sit outside the button.
2. **A short line keeps its own height: accept.** "Every tile the same height" was the owner's rule for Home's tiles only. Saying it does not carry over adds nothing new and prevents a wrong reading.
3. **Accessible name "Show the whole of <record's code>": accept as a carried risk, not a failure.**
   - This repeats the risk I flagged last time for AC54(a) (reviews/S-001-tile-clip/_plan-review-round2-verbatim.md, R2). The button's visible text is the owner's own words, but its name does not contain them, which is against WCAG 2.5.3 ("Label in Name").
   - A voice-control user saying the words they see will not reach the control.
   - S-001 sets no WCAG standard, and the name is consistent with AC54(a), so it breaks no criterion.
   - Suggested change, for both controls: start the name with the visible opening words and end it with "show the whole line".
4. **The clip also covers a profile approval's words: harmless, but not needed, and inconsistent.**
   - A profile approval's line 1 is `Decision: approve`, one word, so it never reaches three lines.
   - The owner's answer speaks of "any long ruling".
   - AC55 includes profile approvals, but AC52 and its last sentence say "each ruling row". Either drop "(or a profile approval's)" or say the same in AC52. The first is simpler.

## Non-blocking notes (carry as risks)
- **N1. The bottom bar can cover the new bubbles.**
  - The new bubbles open on the Status and Queue screens, which have the fixed bottom bar `.sb-dock` (sandbox.css:193, z-index 4).
  - `placeBubble` clears only `.sb-band`, which is going. Its own comment (sandbox.js:1491) says it scrolls each bubble "clear of Home's band at the bottom".
  - "Your last action" sits just above the waiting bar, so a bubble placed below it can land under the bottom bar while still "inside the viewport".
  - Suggest one sentence: each bubble also sits clear of the project screens' bottom bar.
- **N2. Test coverage of the "Done today" bubble is thin.** AC52's new test checks its text, but not the AC56 close rules (Escape, a tap outside, "Close", a second tap, focus back on the control). AC56's step list adds 2b only for "Your last action". Add the "Done today" bubble to one of them.
- **N3. Sheets also sit at the bottom of the screen.** "Nothing fixed to the bottom of Home's screen" is untrue whenever a sheet is open on Home, because sheets are fixed to the bottom (`.sb-sheet`, sandbox.css:255). Suggest "with no sheet or bubble open".
- **N4. Faithfulness.**
  - The clip text adds nothing beyond the ruling and AC54(a)'s existing rules, apart from the four (C) choices and the profile-approval point.
  - "The record is never edited" matches "Your file stays exactly as you wrote it."
  - The plain English is fine, with no gendered pronoun for the owner.

## What I ran
- `git log`, `git diff cfc35d0..56f95fe -- specs/S-001.md` and `git diff --stat`.
- I read the follow-up record, my round-1 verdict and the round-2 tile-clip verdict.
- I read the line-1 bytes of decisions/questions/P-001-design-lab-open.md.
- I read AC54(a) and (b), AC55 and AC52 in specs/S-001.md, plus src/public/sandbox.js (`placeBubble`, the aria-labels) and src/public/sandbox.css (bubble, band, dock and sheet).
- `python3 governance/checks/surface_guard.py diff --range 93ee86e..56f95fe --branch orch/answer-spacing`: OK, 4 commits checked, exit 0.
- **Merge clone** (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/mc2):
  - I cloned /home/user/sd-ac, fetched https://github.com/shumpmaster/Service-Desk main (e34574d) and checked it out.
  - I ran `git merge --no-ff orch/answer-spacing` and then `bash governance/checks/check_all.sh . HEAD^1`.
  - First try, with the merge commit made as orchestrator and no `Item:` trailer: `record_checks merges` FAILED, flagging the merge commit itself.
  - Second try, with the merge made as the owner, the way the real GitHub pull-request merge lands ("Merge pull request #77 …"): all checks PASS ("OK: all governance checks passed.", exit 0).
  - So the merge clone passes in the form the real landing takes.
- I did not repeat the run on the branch base alone, where `record_checks merges` flags the orchestrator's review commit (the known push-run quirk).
- No repository files were changed. The clone is in the scratchpad only.

## Open questions
None for the owner. The fix for B1 is the Definer's call, marked (C).
