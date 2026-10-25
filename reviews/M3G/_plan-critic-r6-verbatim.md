# M3G plan: the Critic's round 6 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at 9d695bb (the plan, draft 6).

---

Verdict: FAIL

Draft 6 of the plan (9d695bb) would pass on its own, with notes. The M3G line fails, and the line is what goes to the owner under CS29. In the busiest case, the line says the opposite of the owner's new answer on length. That answer is cheap to reflect in the line now, while it is still unapproved. I read the checked-out tree; the worktree log confirms it is at 9d695bb. Line numbers below are from specs/S-001.md.

**Blocking finding: the M3G line (:2861-2869)**
1. **"each showing its words and its choices" is the option the owner turned down.**
   - The length question asked: "should every question show all its choices…?" Option A, "As drawn — every question shows all its choices", was declined.
   - The owner chose B, "Choices on the first three". AC94 now builds it that way (:9882-9887): from the fourth question on, the choices sit behind "Show choices ›", a fold that starts closed.
   - So in the busiest case, the case the picture was drawn for, questions 4 and later do not show their choices when Waiting opens. The line says they do.
   - The explanation (:2881-2882) lists this as an exception the line does not name. Round 5 accepted one unnamed exception (a file with no `OPTIONS:` block), because such a file breaks questions/_TEMPLATE.md. This exception is the normal busy-week case, set by the owner's own ruling.
   - In round 4 I rated an untrue "its choices" as blocking (finding 1). The same rating applies here.
   - Route: Definer. The line's "done when" must say that only the first three show their choices and the rest show theirs one tap away, in place. The explanation must then be brought into line, and the Critic checks the line again before CS29.
   - The rest of the line meets the standard:
     - The name and the "done when" read as an achievement, not a task.
     - The "done when" is a state on the preview, with tests.
     - The phase is Build.
     - The ` · why:` says in plain words why the project needs it.
     - It sits after M3E's line and before M3C's.
     - The held question sitting "after the blockers" does not touch the line's order clause, because a held question has no place.

**The answers against the question files**
- Each answer is the file's RECOMMENDATION: picture A, length B, held-place B, age-double A, readings A.
- The options are quoted under "Answered: the picture and its four details" (:17525-17551) exactly as the files have them.
- Two of the owner's quoted answers match the option names exactly: "Choices on the first three" and "After the blockers".
- Two do not, and are not the files' words:
  - "Show age, keep both (Recommended)" against age-double's option A, "Age shown, both lines kept".
  - "Approve; all readings stand (Recommended)" against picture's A ("Approve — …") and readings' A ("All stand."). It is one prompt answer covering two files.
- The spec rightly quotes the owner's exact words (AGENTS.md §5). But the Answered section never names the letter each answer chose. Only some of the citations do: age-double A at :9866, length B at :9886, held-place B at :10058. Picture and readings are never given a letter. Nor does the section say that the chat prompt's wording differed from the file's.
- Non-blocking, because each answer maps to one option without doubt.
- Route:
  - Definer: name each answer's letter in the Answered section, and say where the prompt's words differed from the file's.
  - Chief of Staff: the decision records need the letter as well as the exact words. The prompt-versus-file gap should be stated, as CS30 states the earlier one.

**Earlier rulings:** none contradicted.
- These still hold: board-scope's grouping, no soft box on Waiting, the answer-choice spacing, answers 1 to 4 and the request's four answers.
- Two changes come from the owner's later rulings and are said where they apply: answer 3's "with its answer buttons" now sits behind "Show choices ›" when a held question is fourth or later, and the D2-a head-of-group placement is replaced.

**Round-5 notes**
1. Settled (:2879-2881).
2. Partly settled. The headline, the plain paragraph and reading (h) are fixed. AC94's body still says the button "opens its sheet, where each part has its own box" for both numbered and can't-split questions (:9912-9913).
3. The last sentence is settled (:2887-2889). A stale clause remains at :2885: "stays true whichever way the owner answers question 5".
4. Settled: QW1's row, the brief's QW1 item (:18283-18284) and AC95's test (:10084-10085).
5. Settled in the headline (:9801-9803). The plain paragraph (:2750-2751) gives the Copy route but still leaves out AC18's message. Minor.
6. Settled. 7234f05 is a real commit (the G8d answers record).

**Non-blocking notes (Definer)**
- **Picture wording left over from before approval.** These now contradict each other:
  - AC94's intro still says "No picture of these screens exists yet… until then the looks below are mine" (:9788-9790), and "Its look (C, (o), until the picture is approved, CS31)" (:9952).
  - Reading (o) now makes the approved picture govern the look.
  - CS31 (:15633) still has the held question "at the head of its group" without noting that "After the blockers" replaces it.
  - The spec should say that the picture governs the look, except where the answers change it.
- **"All sixteen stand as written" (:17551) sits beside a (d) that the length answer changes (:17561).** Say "(d) as the length answer changes it".
- **AC94's own test sentence (:9960-9972) leaves out the first-three rule and the age line.** QW1's row has both. Neither row, nor AC95's test, checks that a held question has no "Done ✓" or that it sits after its project's blockers. QW3 tests only "a held blocker in the section".

**Self-implication (D-050): yes, for note 2's leftover at :9912-9913.** It was there in draft 5, and my round-5 note 2 listed three places but not this one.

Files:
- /home/user/sd-qdef/specs/S-001.md
- /home/user/sd-qdef/questions/P-001-m3g-picture.md
- /home/user/sd-qdef/questions/P-001-m3g-length.md
- /home/user/sd-qdef/questions/P-001-m3g-held-place.md
- /home/user/sd-qdef/questions/P-001-m3g-age-double.md
- /home/user/sd-qdef/questions/P-001-m3g-readings.md
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/reviews-m3g/r5-critic.md
