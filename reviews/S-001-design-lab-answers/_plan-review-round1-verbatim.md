Verdict: FAIL

Reviewed: cfc35d0 (specs/S-001.md only), against base 93ee86e. Sources: /home/user/sd-ac/decisions/questions/P-001-design-lab-open.md (e34574d, committed by the owner) and /home/user/sd-ac/questions/P-001-design-lab-open.md.

The amendment reads answers 1 and 10 correctly. The governance checks and the surface guard pass. It fails on three points, each a small text fix: it says nothing else depends on the bottom band when the build does, it misquotes the owner's line 1, and it handles answer 6 in a way that contradicts itself.

## Blocking findings

**B1. "Nothing else leaned on the band" is false. The build depends on the band in two places the amendment does not name.**
- tests/desk/ac51-timeline-line.test.mjs:174-193 is an AC51 test (file marker `ac-test: S-001/AC51`, line 4), titled "AC51 + AC48 (build review B2)".
  - Line 183, `z('.sb-band')`, asserts that `.sb-band` exists in sandbox.css with its own z-index.
  - Removing the band, as the brief at spec lines 3737-3739 directs, makes this test fail.
  - The brief only allows "change AC48's test". So the Builder would have to either break an AC51 test or edit it with no spec permission.
- src/public/sandbox.js:1485-1491 (`placeBubble`, the AC54 bubble placement) measures `.sb-band` and scrolls each bubble "clear of Home's band at the bottom".
  - reviews/75/reviewer.md:40 recorded that check ("lands wholly in view and clear of the band").
  - The code survives with the band gone (it reads a null band as zero height). But the spec's claim that no AC54 or AC56 rule leans on the band is not true of the build.
- Fix: name the AC51 and AC48 stacking test, which drops `.sb-band` and keeps `.sb-dock`, plus the band clearance in the bubble placement, in "Where the build stands" and in the brief. Then delete or reword "Nothing else leaned on the band".

**B2. Line 1 is quoted "in the owner's words", but the quote is not the owner's line 1.**
- At spec line 143 onward, the quote begins "Ruling: 1 I see no need…".
- The record's line 1 begins "Ruling: 11 Ruling: 1 I see no need…" (checked with od).
- That line is also 1,845 characters long: the "Question:" and "Questions, as put:" block runs onto it, because the record's own line breaks were lost.
- The spec silently drops the stray "11 Ruling: " and says nothing about the rest. Calling an edited line the owner's words is not faithful.
- Fix: quote the line as it starts, say plainly that it has a stray "11 Ruling: " and the question block run onto it, and say it is read as eleven answers joined by ", ".

**B3. The amendment contradicts itself on answer 6, and AC52 still reads as if the owner had not answered.**
- Spec line 151 says "Questions 2 to 11 match the recommendations the build already carries, so nothing the sandbox does changes for them".
- For 6, the recommendation was "yes" (count waiting deploys as needing the owner). The build does the opposite: AC52's Deploys line (about spec line 1355) still says waiting deploys are "shown but not counted in what needs the owner, and it never stops 'Quiet'". The same goes for 5: the build never shows "reached".
- On whether 5, 6 and 10 are model changes:
  - 5 and 10 clearly are. Question 5 asks whether "the model" should record it, and 10 asks which model change goes first.
  - 6 is defensible as a model change only through the question file's BLAST RADIUS line ("for 5, 6 and 10, a later operating-model change you approve separately").
  - Note that "needs the owner" is this spec's own term (spec line 290). Calling 6 a model change therefore rests on one fact: the desk cannot tell who must approve a waiting deploy. That maps to the listed model change "deploy approvals tied to the owner" (spec line 206).
- The amendment states neither that reason nor which model change answer 6 waits on. It does not mark the owner's "Yes" at AC52. And the Definer's own open question 2 on this does not appear in the spec's Open questions.
- Fix:
  - Reword line 151 so that only 2, 3, 4, 7, 8, 9 and 11 "match what the build carries".
  - For 5 and 6, say the owner answered yes, the desk stays as it is until the named model change lands, and why.
  - Mark AC52's Deploys line with the owner's answer.
  - Carry the open question on 6 into "Open questions for the owner", or get the owner's confirmation. The owner's plain "Yes" read on its own asks for the desk to count these deploys, and the desk will not.

## Non-blocking notes (carry as risks)

**N1. Answer 1 as "drop the bar" is a fair reading.**
- The options were keep, leave deferred, or drop. "I see no need for it if it's not doing anything right now" turns down the deferred, do-nothing version.
- The "right now" is covered by "Bringing it back would need the owner's say".

**N2. Dropping the whole band is a fair consequence, not something added.**
- In the build, the band holds only the bar (src/public/sandbox.js:510-512).
- In the lab it held only the compose bar and its mic (docs/design/screens/01-home.html:286).
- It is still the Definer's inference rather than the owner's words. The spec's own habit for such rules is to mark them (C).
- The owner's only band comment was about its colour, which the amendment keeps for the project bar.

**N3. Answer 10 is read correctly.** "Go with the recommendation." against the RECOMMENDATION line "10 your Chief of Staff's sessions recorded first" is exact.

**N4. The malformed line 1 trips no check, but it will look poor on the desk.**
- The checks accept it:
  - `record_checks decisions` passes.
  - v3_checks `RULING_FIRST_RE` (governance/checks/v3_checks.py:359, `Ruling: \S.*`) matches.
  - orchestrator.py:1233 and session_runner.py:857 only test that the line starts with "Ruling: ".
  - The desk's `isOwnerRuling` (src/public/lib/model.js:39) accepts it.
- The desk's own outputs:
  - `rulingWords` returns 1,833 characters starting "11 Ruling: 1 I see…". AC55's "Your last action" and AC52's "Done today" show a ruling's line 1 "whole", so this will be very long and odd on the Status and Queue screens.
  - The desk's numbered-ruling rule line (`numberedRuleLine`, src/public/lib/sandbox.js:735) reads this line as one answer, numbered 11, and reports "No answer yet for 1, 2, … and 10". It splits on "; ", while the owner used ", ", and AC53's form (spec line 1565) is "; ".
  - That rule line only checks text in the answer box, not saved records. So nothing breaks, but the desk's own reading of this record disagrees with the spec's.
- Worth one sentence in the amendment, and a decision on whether to clip a long line 1 on display, or to ask whether the record should be re-filed in form. Re-filing is the owner's call; agents must not edit it.

**N5. The new AC48 check is testable on two of its three parts.**
- "No 'Tell your Chief of Staff…' bar" and "no 'Deferred: waiting on your ruling' words" can be checked as text. The current check in tests/desk/md-sandbox.test.mjs:46-48 flips cleanly to an absence check.
- "No bottom band" should be put in terms a test can see, for example "nothing fixed to the bottom of Home's screen".
- `DEFERRED_WORDS` (src/public/lib/sandbox.js:23) also becomes unused.

**N6. Two leftover references to the band.**
- Spec line ~980 still says the project bottom bar has "Home's neutral look", which names a thing that no longer exists. Reword it to "neutral grey with a hairline above it".
- docs/design/README.md:35 still says Home "keeps its 'Tell your Chief of Staff…' bar". The spec governs where they differ, but the README now disagrees with it.

**N7. Plain English is fine.** There is no gendered pronoun for the owner in the added lines. No made-up numbers: every number added is a question number, a date or an AC number.

## What I ran
- `git diff 93ee86e..cfc35d0`, `git log`, and `git show e34574d` (authored by shumpmaster <furchken@gmail.com>).
- `python3 governance/checks/surface_guard.py diff --range 93ee86e..cfc35d0 --branch orch/answer-spacing`: OK, 1 commit checked, exit 0.
- `bash governance/checks/check_all.sh . 93ee86e`: all 24 checks PASS ("OK: all governance checks passed."), exit 0.
- `wc` and `od -c` on the record: 16 lines, line 1 is 1,845 characters and starts "Ruling: 11 Ruling: 1".
- A Node script in my scratchpad (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/p.mjs) ran the desk's `numberedRuleLine` and `rulingWords` on the record. Result: "with 1 answer. No answer yet for 1, 2, 3, 4, 5, 6, 7, 8, 9 and 10", and words of 1,833 characters.
- Grep across src/, tests/, reviews/ and docs/design/ for the band, the bar and the deferred words.
- No repository files were changed.

## Open questions
1. Answer 6: should the desk count waiting deploys now, at least for Service-Desk, where every deploy environment's required reviewer is the owner (spec line 2975)? Or wait for the "deploy approvals tied to the owner" model change? This is the owner's call. The spec should put it to the owner rather than settle it by reading the BLAST RADIUS line.
2. Should the owner be asked to re-file decisions/questions/P-001-design-lab-open.md in form, or should the desk clip a very long ruling line on display?
