# M3G plan: the Critic's round 4 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at c27aaff (the plan, draft 4).

---

Verdict: FAIL

Draft 4 (c27aaff) settles round 3's findings 1 and 2 and notes 1 to 4. Finding 3 is only partly settled: the M3G line still says something that is untrue for reading (h), and the same untrue claim sits in AC94's headline and in the plain paragraph the owner reads. I have no shell, so I read the working tree in /home/user/sd-qdef as checked out and took it to be c27aaff.

**Round 3, checked**
- **Finding 1 (the strip's order across projects): settled.**
  - AC95 now gives the order: by project in J7's order, the portfolio last, then by place within each project (:9940-9943). It is marked C, (p).
  - The same order is in AC91 (f)'s note (:9098-9101), AC80's note (:7146-7147), QW2's row and its strip-order case (:2900), AC95's test (:9995-9997), the brief (:18166-18167) and reading (p) (:17463-17464).
  - A Builder can now write the strip-order test to one answer.
- **Finding 2 (the picture's example): settled.**
  - CS31 (:15540-15545) asks for three free blockers at 1, 2 and 3 of 12, in raised order, with card 6 "Waits on question 1" and card 8 "Waits on questions 2 and 3". Each "Answer first" line is consistent with that.
  - All of this is something AC95's procedure (:9912-9930) can produce, given made-up raised times that put the held-up cards at places 6 and 8.
  - The held question's two cards take their places by age (:9978-9981), as AC95 says.
- **Finding 3 (the line and question 5): partly settled.**
  - "needs no rewording after" is gone.
  - The GitHub part is now general ("answered from there with its answer already written as the desk's question sheets write it").
  - There is a route back to the owner if an answer to question 5 ever makes the line untrue (:2864-2872).
  - What is left is blocking finding 1 below.
- **Note 1: settled** (:2820, "in its project's order").
- **Note 2: settled** (:2931, "settled by "Blockers first" and AC40").
- **Note 3: settled.** CS30 now states the gap plainly (:15520-15524) and agrees with AGENTS.md:80. It names the record that holds the four answers (the request record, de01257). The four answers match the record word for word (:17401-17421 against the request record's lines 25-28).
- **Note 4: settled.**
  - Question 5 has `DEFAULT: A` and `TIMEOUT: 168` (:15526, :17425).
  - It is filed in a pull request opened when the picture is put to the owner (:15527-15530). That agrees with AGENTS.md:80 ("the ask may be put once its pull request i[s open]") and with AC12's raised time + TIMEOUT (:3399-3400).
  - Reading (p) has been added, and "sixteen" is used throughout. Only the draft-3 history entry in line 4 keeps "fifteen", which is correct for its time.

**Blocking finding**
1. **"Its choices" and "a tap opens GitHub … you only press Commit" are still untrue for reading (h), and the second is also untrue for (g).**
   - **The M3G line:** it says each question in the section is shown "with its words and its choices" (:2851-2852). By AC94 (h), a numbered or can't-split question shows only one button, "Answer in its sheet ›", and "no link opens from the section". Its choices are in its sheet, not in the section (:9833-9836).
   - The Definer's explanation (:2865-2868) argues that "answered from there … as the desk's question sheets write it" holds for (h). It does not cover "its choices".
   - The line goes to the owner for approval (CS29) before question 5 is asked, so the owner would be approving a line that is untrue for a reading already drafted. This is the remainder of round 3's finding 3.
   - **AC94's headline** (:9751-9755) says each question shows "its choices as buttons, and a tap on a choice opens GitHub's new-file page with that answer record already written … so the owner only presses Commit". AC94's own body contradicts this for (h) (:9833-9836) and for (g): a v2.5 question gets "Copy answer <letter>", "no link opens" (:9837-9840).
     - The headline is the criterion a Reviewer checks QW1 against, and it cannot be met as written for two of its four kinds of question.
   - **The plain paragraph for the owner** (:2741-2744) says the same: "a tap on a choice opens GitHub with your answer already written … so you only press Commit".
   - Route: Definer. One possible fix:
     - word the line, AC94's headline and the plain paragraph in general terms, as the line's answering clause now is (for example, "its words and how to answer it");
     - or have AC94 (h) show a numbered or can't-split question's choices as text in the section, with the one button under them, and mark that C, (h).
   - Either way, the explanation at :2865-2868 should also cover "its choices".

**Non-blocking notes**
1. **"The portfolio last" is missing from some places that state the strip's order.**
   - AC95 (:9941), AC91 (f) (:9099) and QW2's test case (:2900) say it.
   - Reading (p) as put to the owner (:17463-17464) does not ("the board's fixed project order").
   - Nor do AC80's note (:7147), QW2's "What the owner sees" column (:2900), CS31 (:15547) and the brief (:18167).
   - J7 has a `portfolio` entry (:17943), so "J7's order" alone may not put the portfolio last.
   - AC95 governs, so a Builder will not guess wrong. But the owner should rule on (p) as AC95 writes it. Route: Definer.
2. **The plain paragraph for the owner is out of date.**
   - Its heading still says "draft 3" (:2730).
   - It says "Two rounds of checks failed earlier drafts …; the last failure was about the question on how the numbers line up with the screen" (:2732-2733). Three rounds have now failed, and round 3 failed on the strip, the picture and the line.
   - Route: Definer.

**Checked against the owner's words and answers, nothing new broken:**
- AC95's headline and "One order per project" (:9891-9902, :9936-9946) still follow answer 1.
- AC96 still follows answer 2.
- The held question (:9966-9981) still follows answer 3.
- CS31 and "When each opens" (:2891-2895) still follow answer 4.
- The strip's new order does not mix projects' numbers. It replaces "newest first" only from QW2, with AC91 (f)'s locked case named as forced.
- The M3G line reads as an achievement within Build, not a task, and its `· why:` says in plain words why the project needs it.

**Self-implication (D-050): yes, for blocking finding 1.**
- I checked round 3's finding 3 against the M3G line only. AC94's headline and the plain paragraph made the same untrue claim, and I did not flag them. I cannot diff, so I have not confirmed they read the same in draft 3.
- "Its choices" in the line was also present when I wrote finding 3, and I did not name it.
- Whoever runs Triage should weigh this.

Files:
- /home/user/sd-qdef/specs/S-001.md
- /home/user/sd-qdef/docs/design/references/owner-request-2026-10-25-questions-and-order.md
- /home/user/sd-qdef/AGENTS.md
- /home/user/sd-qdef/questions/_TEMPLATE.md
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/reviews-m3g/r3-critic.md
