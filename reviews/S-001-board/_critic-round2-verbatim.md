# Critic, round 2, on the board amendment draft 2 (97e1d25) (verbatim)

Verdict: PASS with notes

**For the owner:** Draft 2 fixes everything I raised last round. It no longer offers a merge after you ask for changes. A gate card's details again show the case summary, its links, the Critic's view and what happens after each answer. The words on the card no longer claim more than the desk knows. Your two open questions are written so either answer changes only one bullet or sentence. The build waits for those answers and for the design audit.

One thing you should know before you rule: most pull requests that change the desk's own code will not show "Merge". They will show "Open", with GitHub's words "CI code changed · check the PR". The reason is that GitHub's verdict check can't judge changes to that code. This is the safe side, but it isn't the board you approved for those cards, and those words don't tell you what to do. Separately, two places in the plan and the two questions disagree about what happens if you don't answer. That needs tidying before the questions time out.

How I checked: I have no shell, so I couldn't diff 0670766..97e1d25. I read specs/S-001.md as it is in /home/user/sd-def-board, plus the two new question files there, and the plan review's round-1 verbatim.

**Self-implication (D-050):** two of my round-1 checks were wrong.
- In finding E I proposed the hedged "By its files, …" but missed that the owner check is masked on every desk-code pull request. The plan review caught it (its A).
- I listed "one board per project" as a choice within the Definer's lane. It changed the approved mockup and has now been put to you as questions/P-001-board-scope.md.

Weigh my round-1 calls on J22 and on scope with that in mind.

**Round-1 findings, A to K**

| Finding | Status | Where in draft 2 |
|---|---|---|
| A. A "requested changes" verdict makes the card the merge | Closed | J22 rule 1 (9368–9376), the step table (5354), 5365–5368 and 5521–5523; tested at 5563–5565 |
| B. The sheet drops the gate, hold and merge card contents | Closed | 5397–5419; AC52's cases that stand (3150–3151); tested at 5569–5571 |
| C. The lane's name was never confirmed | Closed | 5289–5292, (C) |
| D. Move first, act second | Closed | Filed as questions/P-001-board-done-button.md; 5447–5450 |
| E. The why line claims more than the desk knows | Closed | 5420–5435; J22 rules 4 and 6 (9402–9414). New point L below |
| F. The text box and the wait time go silently | Closed | The text box goes by ruling C (5393–5396) and the owner summary says so (1446–1448); the wait moves into the sheet (5399–5401, 3144) |
| G. The "unchanged" claims are wrong | Closed | 1579–1584; notes in AC48 (2510), AC49 (2633) and AC54 (3477); the summary at 1449–1450 |
| H. One top line can't be tested | Closed | 5316–5318 gives every form |
| I. Gaps in what the card and board show | Closed | Card contents 5342–5346; the "Your answer is being recorded" quiet line 5338–5340; AC77's re-read 5388–5389 |
| J. One test lacks its fixture | Closed | 5552–5553 |
| K. Cosmetic wraps | Mostly closed | Two lines are still mis-indented (M below) |

**New in draft 2 (all non-blocking)**

L. **Most desk-code pull requests show "Open ↗" with words that don't tell the owner what to do** (J22 rule 4, 9402–9409; table row 5355; summary 1430–1431).
- The owner-signal job posts `error` "CI code changed · check the PR" for any change under the default signal-code paths, `src/**` and `tests/**` among them (govlib.py:981; owner_signal.py:212-213). Service-Desk's risk-paths.toml doesn't override them.
- So almost every builder pull request of class R1 or R2 now gets "Open ↗" with that raw text. That includes the kind the owner approved as "Merge ↗" in version 5 (#127 and #128).
- This is the safe side, from the Orchestrator's ruling on plan review A. But:
  - it changes what the owner approved;
  - the summary doesn't say how common it will be;
  - "CI code changed · check the PR" isn't plain and doesn't say what to check, or whether a verdict or a merge is next.
- It also treats like cases unlike. When the check isn't read (rule 6, the private project), the card offers "Merge ↗" with "By its files, …", although it is just as uncertain.
- Fix: put the tripwire case in plain words (for example, what the owner should look for on GitHub), say in the summary that this will be most of the desk's own code changes, and make rules 4 and 6 consistent or say why they differ. Whether this needs the owner's ruling is the Orchestrator's call.

Route: Definer for the words and the summary; Orchestrator for whether to put it to the owner.

N. **The spec and the open questions disagree on what happens if the owner doesn't answer.**
- **Scope.** questions/P-001-board-scope.md line 6 says "Left unruled, the plan follows the mockup: one board" (DEFAULT A, TIMEOUT 48). The spec at 5304–5306 says "Until the owner rules, the board replaces AC52's groups … and nothing else on the Queue screen", which reads as the board sitting in each project's Queue.
- **Done button.** questions/P-001-board-done-button.md line 6 says "Left unruled, the button stays" (DEFAULT A). The spec at 5449 says "As version 5 draws it, it does not; if the owner rules A, it does".

The build is on hold until both are answered (11816–11819), so nothing is built wrong. But after 48 hours a default ruling would contradict the spec's interim text. Align the interim sentences with the defaults, or drop them. Route: Definer.

O. **The scope question's Context is stale and leaves out the owner's earlier ruling** (questions/P-001-board-scope.md).
- Line 17 still says "The plan's draft puts one board in each project's Queue, marked as the Definer's choice". Draft 2 leaves it open.
- The WHY mentions "your earlier rule of keeping projects apart", but no Context line cites that ruling: AC52's ruling 6, "I don't like to "cross boundaries" when I work", which also stands behind Terms' "There is no queue across projects" (spec 3108–3111). Without that citation, the facts put to the owner lean toward A.

If A is ruled, Terms' "Queue" and AC52's ruling-6 text will need a note. Route: Chief of Staff.

M. **Two lines are mis-indented.**
- 9377: "2. **(a) …" has 8 leading spaces where 1., 3. and 4. have 4. In Markdown this nests (a) inside rule 1 and renumbers the rest, which confuses "the first that applies".
- 5430: the "You asked for changes." bullet is nested under the class line.

Line 4 of the header still says "Setup G4 (optional) … changed in place" in its draft-1 part, though G4 has been dropped. Route: Definer.

**Checked and holding:**
- The notes in AC24, AC48, AC49, AC52, AC53, AC54, AC56, AC62, AC66, AC69, AC72, AC74, AC77 and AC79 each name what changes. The new "unchanged" list matches them.
- The Board term (1870–1875) agrees with AC80. Marks leave the counts on the device but never change "Quiet" or what is notified.
- AC73 and the notifications are untouched.
- J1's limit of 30 requests per poll call holds by its order, and the owner check is read only in a public v3 project.
- "The item wins" (5517–5520) and "A mark is judged against the step it was made on" (5481–5485) don't conflict with Done's 24 hours or AC77's holds.
- I didn't judge sizes, places or layout: they are pending the design audit.

Files: /home/user/sd-def-board/specs/S-001.md; /home/user/sd-def-board/questions/P-001-board-scope.md; /home/user/sd-def-board/questions/P-001-board-done-button.md; /home/user/sd-def-board/governance/checks/govlib.py; /home/user/sd-def-board/governance/checks/owner_signal.py; /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/board-reviews/_plan-review-round1-verbatim.md
