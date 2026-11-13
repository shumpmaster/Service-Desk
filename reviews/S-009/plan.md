# S-009 — plan review (the outside-build plan, step 3): the latest round

*Recorded by the Chief of Staff's session (session_01QBwHGMmHGgB3fLufS5ELH2) as `orchestrator`, under L-0051. This file holds the latest plan-review round only, as the pipeline keeps reviews/<spec>/plan.md, because the freeze check (governance/checks/v3_checks.py freeze) reads this file's first verdict. Rounds 1 to 5, each verbatim under its heading, were moved unchanged to reviews/S-009/_plan-rounds-1-5.md in this session; until then they were in this file. Round 4 was the last full cold read (PASS); rounds 5 and 6 checked only changed lines.*

## Round 6 — the pre-freeze lines only (round 5's N-A, N-B, N-C), spec at build/definer/S-009 84b3891 (session branch a0d8ab6); dispatched 2026-11-13T14:47:10Z, returned 14:48:40Z

*Under the owner's pre-freeze answer "Fix both first (Recommended)" (decisions/questions/P-003-S-009-pre-freeze.md). A fresh Critic, checking only the changed lines; recorded by session_01QBwHGMmHGgB3fLufS5ELH2 as `orchestrator`.*

Verdict: PASS

**Scope and one limit.** This is plan review round 6 of S-009. I checked only specs/S-009.md:11, :156, :169 and :288, against:
- the owner's ruling, decisions/questions/P-003-S-009-pre-freeze.md:1 and :17;
- round 5's N-A, N-B and N-C, reviews/S-009/plan.md:584-599;
- the reading, reviews/S-009/_src-reading.md:66, :70, :74-75, :288, :290.

I could not run `git diff f39133e 84b3891`. I have no shell, and Read cannot open the compressed objects in /home/user/Service-Desk/.git. So for check 4 I compared the current text with the old wording that round 5 quotes (plan.md:564, :594, :599). I read AC1 to AC19 (:26-72) in full and found nothing that mentions round 6's changes. I could not prove byte by byte that those lines are untouched (open question 1).

**1. Line 169, rule (c): met.**
- Rule (c) now reads: "each `open` case with `via: "notice"` and `log` failing has `shows` or `lands` differing from its no-failure twin". Direct links are left out explicitly. This matches the ruling (P-003-S-009-pre-freeze.md:17) and N-A's suggested fix (plan.md:591).
- The reason given for leaving links out is supported:
  - For a link, `lands` is defined as the link's address (:156), so it is the same on both reads.
  - _src-reading.md:290 shows only one sheet for a link to a card not on the board, "No longer waiting".
- The kept notice rule is still backed. :288 gives the can't-read words on a cant-read project, and :70 and :75 show that a failed log read makes the project read can't-read.
- No new way for a wrong build to pass:
  - Rule (c) only checks that the baseline record shows the failure taking effect. It never compared built output. The built output is still judged by :167.
  - Notice cases still go through rule (c). They load the page through the same `loadSandbox` and fake-server failure (:148, J8), so the adapter's log failure is still shown to work on the opening route.
  - The twin rule still covers link cases.
  - A built desk whose log failure does not take effect would show the not-shown card's sheet, with buttons, by link. That differs from the record's "No longer waiting" result, so :167 catches it.
  - Before this change, rule (c) on links could only cause a false stop, never a false pass.

**2. Line 288, question 13: met.**
- It now names rules (a), (b) and (c), the twin rule and the open-card rule. Each matches :169:
  - (a): a new line and empty `notices` when `queue` or `log` fails.
  - (b): non-empty `notices` and no can't-read line when every read succeeds.
  - (c): notice only; direct links not held to it.
  - The twin rule: same records, moment and opening. "Same kind" is left out but implied.
  - The open-card rule.
- The options' meaning is unchanged. A accepts. B still drops only rules (a) and (b) (compare plan.md:595), so (c) and the two case-set rules stay under B.
- This closes N-B.

**3. Line 156: met.**
- "the title the desk falls back to when the file is unread, `card <gate>-<n>` (:66)" is supported by _src-reading.md:66 and by the `blobNull-card` run at :74 ("card dor-2").
- "a title drawn from a card file that was read, "Pick one" in "P-001 dor-2: Pick one" (:74-75)" is supported by the `blobNull-log` run at :75, where the card file was read and the log was not.
- This closes N-C.

**4. Line 11, the round-6 entry: met, as far as the content shows.**
- The entry names the note itself, :156, :169 and :288, and gives the reason for each change. Each matches what the current lines hold, set against round 5's quotes of the old wording.
- The first list's closing sentence now reads "Counting every round to round 6 below".
- The entry says "no criterion changed". Nothing in :26-72 refers to the round-6 changes. The diff check is open question 1.

## Blocking findings
None.

## Non-blocking findings
- **N1. Line 169 says a little more than the reading.** It says the link sheet is the same "whatever the read state (:290)". _src-reading.md:290 shows one sheet branch but says nothing about read state. It names no variant for a failed read; it does not show the sheet is unaffected by one. This does no harm, because the clause only allows a link case to equal its twin ("may equal its twin"). A truer wording would be "and names no other for a failed read".
- **N2. Question 13 leaves out one coverage rule that is also about failed reads.**
  - It says the check works "by five rules" (:288). But :169 also fails the record when a `notes`-failing result differs from the no-failure result, which stops the build (:270, "if the record shows the base commit reading notes").
  - :169 also has case-set rules that are not about failed reads: a result for every case, a `cards` entry for every entry, an `on_list` gate card or question in no-failure cases, a notice in every `sender` case, and the `dor` mark taken from its gate case. These are fairly outside a question framed as being about failed reads.
  - The ruling's headline (P-003-S-009-pre-freeze.md:1) says "name every coverage rule". Its carrying-out line (:17) names only (c), the twin rule and the open-card rule. The line meets the carrying-out line, not the literal headline.
  - Options A and B are unaffected, and the notes rule is shown to the owner at :270 and in Risks :260.

## Open questions
1. Before freeze, can the Orchestrator run `git -C /home/user/Service-Desk diff -U0 f39133e 84b3891 -- specs/S-009.md` and confirm the changed hunks are only at lines 11, 156, 169 and 288? I could not run it, so check 4's statement that no AC1 to AC19 line changed rests on reading the content, not on the diff.
2. The owner's A on question 13, listed at :275 as "to be recorded", was given before this rewording. When decisions/questions/P-003-S-009-criteria.md records it, should it name the question-13 text as of this commit? The pre-freeze ruling ordered the rewording, so this is a recording point, not a conflict.

**Self-implication (D-050):** none. This role's earlier checks (plan.md:481, :584-599) raised these issues; this round checks how they were fixed.

*The session's note after the return, not part of it: open question 1 is answered: `git diff -U0 f39133e 84b3891 -- specs/S-009.md` shows exactly four hunks, at lines 11, 156, 169 and 288, so no line of AC1 to AC19 changed. On open question 2, the criteria record (decisions/questions/P-003-S-009-criteria.md) already notes that the A on question 13 was given before rule (c) existed and that the pre-freeze ruling rewords the question; the question-13 text the owner's A is held to is that at 84b3891. N2 is carried as a risk: the notes-failing rule is shown to the owner at :270 and :260 but not named in question 13. By the owner's answers, the PASS lets the Definer freeze S-009.*
