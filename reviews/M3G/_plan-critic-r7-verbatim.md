# M3G plan: the Critic's round 7 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at 7c97167 (the plan, draft 7).

---

Verdict: PASS. Both the plan (draft 7, 7c97167) and the M3G line pass, with three non-blocking notes for the Definer.

I read the tree checked out at 7c97167; the worktree's log confirms it, with de894bb merged before it. Line numbers below are from /home/user/sd-qdef/specs/S-001.md.

**The M3G line (:2865-2874): PASS**
- The line quoted in the spec matches the proposed line word for word.
- The round-6 finding is settled. "each showing its words, the first three with their choices showing and the rest with theirs one tap away in place" is what length option B says ("the first three questions (in order) show their choices; the rest show their title and "Show choices ›", which opens them in place"). It matches AC94's body (:9901-9906): the section's order, and with one project shown, that project's first three.
- The rest of the line meets the standard:
  - The name and the "done when" read as an achievement, a state on the preview with tests, not a task.
  - The phase is Build.
  - The ` · why:` says in plain words why the project needs it.
  - It goes after M3E's line (docs/PROJECT.md:115) and before M3C's (:116), in the same form as M3E's.
  - The held question sitting "after the blockers" still does not touch the order clause, because a held question has no place.
- The explanation beside the line (:2880-2896) is now in line with it:
  - The stale clause "whichever way the owner answers question 5" is gone.
  - The one exception it does not name is still the file with no `OPTIONS:` block, which breaks questions/_TEMPLATE.md.

**The answers, checked against the records**
- All five records are on the branch: decisions/questions/P-001-m3g-picture, -length, -held-place, -age-double and -readings.md. Their line-1 letters are A, B, B, A, A.
- The spec cites the records' commit as 5aef01b, which is real: "Name, in each M3G answer record, the option…".
- The "Answered: the picture and its four details" section (:17546-17585) now:
  - names each letter;
  - quotes the owner's words exactly as the records do, "(Recommended)" included;
  - says where the prompt's words differed from the file's: picture and readings were one combined answer; age-double's prompt label differs from the file's "Age shown, both lines kept"; length and held-place used the file's own option names.
- None of these contradicts a record.
- Earlier rulings are all kept: board-scope's grouping, no soft box on Waiting, the answer-choice spacing, answers 1 to 4 and the request's four answers.

**My round-6 notes, and the round-5 leftovers**
- The picture's wording from before approval is settled. AC94's intro (:9806-9808) and its look (:9973) now say the approved picture governs except where the answers change it, and CS31 (:15659-15660) says the held question is built "after its project's blockers".
- "(d) as the length answer changes it" is settled (:17584 and in (d) itself, :17594-17595).
- The tests are settled:
  - AC94's test now has the first-three rule and the age line, and a held question after its project's blockers with no "Done ✓" (:9992-9995).
  - AC95's test (:10117-10118) and QW3's row now check that a held question has no "Done ✓" and sits after the blockers.
- Round-5 note 2's leftover is settled. AC94's body (:9932-9934) and reading (h) (:17602-17605) now give a can't-split question the sheet's one box, which matches AC53 (:5006) and :8300.
- Round-5 note 5 is settled. The plain paragraph (:2754-2755) now gives AC18's message in plain words.

**Non-blocking notes (Definer)**
1. **AC94's headline still says what the old line said.** At :9817-9818 the section "shows each such question, grouped by project, with its words and its choices". Its own body (:9901-9906) says only the first three show their choices. The body is exact, and the tests follow the body, so this is not blocking. It should be brought into line before QW1 opens.
   - Self-implication (D-050): yes. This sentence was there in draft 6, and my round-6 check said that draft would pass on its own without naming it.
2. **The owner-facing plain paragraph has the same wording.** At :2749-2751 it says "each question with its words and its choices, … the first three with their choices showing", which leaves out that the rest are one tap away. Its earlier sentence (:2744-2745) does say it.
   - In the same paragraph, "all nine of your answers of today" (:2740) counts only the plan's four answers and the five on the picture. The request's four answers were also given today.
3. **AC77's change note (:10573-10576) gives the held question "live buttons" with no qualifier.** By the length answer, if a held question is fourth or later, its buttons sit behind "Show choices ›". Minor.

**For the Chief of Staff (not the Definer's):** the parenthesis in the age-double record reads oddly: "("Show age, keep both" for option A, "Age shown, both lines kept")". The letter and the mapping are right.

Files:
- /home/user/sd-qdef/specs/S-001.md
- /home/user/sd-qdef/docs/PROJECT.md
- /home/user/sd-qdef/docs/design/references/owner-request-2026-10-25-questions-and-order.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-picture.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-length.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-held-place.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-age-double.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-readings.md
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/reviews-m3g/r6-critic.md
