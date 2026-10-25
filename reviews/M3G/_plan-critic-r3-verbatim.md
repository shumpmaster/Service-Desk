# M3G plan: the Critic's round 3 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at 8a64ab1 (the plan, draft 3).

---

Verdict: FAIL

Draft 3 (8a64ab1) settles both of my round-2 blocking findings and notes 1 to 4. The owner's four answers are quoted word for word. It fails on three new blocking findings: two come from the answers being written in, and one is in the M3G line, which I missed in rounds 1 and 2. I have no shell, so I read the working tree in /home/user/sd-qdef as checked out and took it to be 8a64ab1.

**Round 2, checked**
- **Finding 1 (question 1's default): settled.** The owner answered question 1. Only question 5 is still open: reversible (R1), default A (:17382-17384, :17423). CS30 now says `DEFAULT: A` (:15495-15496).
- **Finding 2 (the line under option C): settled for answer 1.** The line (:2849-2857), AC95's headline (:9871-9875) and its numbering (:9916-9923) are written per project. But see blocking finding 3 for question 5.
- **Note 1: settled.**
  - asks_merge.py:117-136 does say "is not a change the asks-merge delegation covers" (:135).
  - OPERATING_MODEL.md:100 holds "wait for the owner's merge". The model version is 3.6.0.
  - The cost of a correction is stated (:2752-2754, :10006-10007, :16445-16447).
- **Note 2: moot.**
- **Note 3: settled.** owner-answers-2026-10-25-g8c-review.md is on the branch.
- **Note 4: settled.** Discovery answers 4 and 6 are quoted correctly with what they answered (P-001-design-discovery.md:7, :9; spec :2790-2794).

**The answers against the record:** :17360-17380 match lines 25-28 of the request record word for word, including "(Recommended)" and the options offered. The quotes in AC95 (:9880-9882, :9946-9948) and AC96 (:9992-9994) also match. :2784 uses short labels, which is acceptable.

**Blocking findings**
1. **The Kicked back strip's order across projects is now undefined.**
   - AC95 says the strip draws its cards "in place order within their project groups" (:9919-9920). It also says the strip has "no project groups" (:9926-9927).
   - Under answer 1, places are per project. So "2 of 12" in Service-Desk and "1 of 3" in another project cannot be ordered by place alone.
   - The same gap is in AC80's note (:7126-7127), AC91 (f)'s note (:9079-9080), QW2's row ("the strip … in place order"; its AC91 (f) strip-order case), and the brief (:18123).
   - A Builder would have to guess, and the strip-order test cannot be written to one answer.
   - Route: Definer. Give the strip's order across projects (for example, J7's project order, then place). Mark it C if it is a reading of the owner's words.

2. **The picture brief (CS31) draws an order that AC95 can never produce.**
   - It asks for "one counted blocker in "1 of 12"" and a card reading "Waits on questions 11 and 12" (:15505-15508).
   - By AC95 (:9892-9898), any question that a placed card waits on is a blocker, and blockers take the first places. So questions 11 and 12 cannot be blockers at 11 and 12, and with one blocker no card can wait on two.
   - The owner approves this picture before QW1 opens (:2886, :15514-15515). The owner would be approving a screen that contradicts the rule they chose ("Questions that hold other cards up come first", answer 1's prompt; "Blockers first").
   - Route: Definer. Make the example possible, for example several blockers at 1 to 3 and "Waits on questions 2 and 3", keeping a line that wraps.

3. **The M3G line is approved before question 5, yet holds readings question 5 can change, and one it already gets wrong.**
   - CS29 (the line's approval) comes before CS30 and CS31 (question 5 asked with the picture) (:15485-15486, :2885-2887). Yet :2863-2865 says the line "needs no rewording after".
   - The line holds reading (g): "or, for a project that records its rulings in its ledger, copy it for the owner's session". If the owner answers question 5 with B on (g), the line is wrong after it was approved. This is the same structural fault as round 2's finding 2.
   - The line is also already untrue for reading (h). It says each question shows "its choices as buttons that open GitHub with the answer already written" (:2851-2852). AC94 gives a numbered or can't-split question one "Answer in its sheet ›" button, and "no link opens from the section" (:9813-9816).
   - Route: Definer, then the Chief of Staff before CS29. Two options:
     - word the line so it holds under any answer to question 5, and make it true for (h);
     - or say the line comes back to the owner if question 5 changes a reading the line holds, and drop "needs no rewording after".

**Non-blocking notes**
1. :2820 still calls AC95 "every waiting card's place in one order". That reads like the option the owner turned down ("one order across Waiting"). Say "in its project's order".
2. :2786 makes "answer 3" mean "In the section" from that point on. But the draft-2 record below it (:2924) says "draft 1's question 5 settled by answer 3 and AC40", meaning "Blockers first". Name it by its words, as :9959 does.
3. **CS30 cites AGENTS.md §5 for a recording route §5 does not offer** (:15492-15494).
   - §5 (model S-033, AGENTS.md:80) says every ruling put to the owner, including one asked in a session, "is filed first as `questions/<name>.md`". The answer then goes in a pull request "that also deletes the question file".
   - Questions 1 to 4 were asked with no question file. No questions/ or decisions/ file on this branch names M3G.
   - Route: Chief of Staff. Say how the four answers are recorded, with the gap stated. Triage: asking before filing is a slip in the Chief of Staff's own process, not the Definer's.
4. **Question 5 has no TIMEOUT, which the template requires** (questions/_TEMPLATE.md:11). If its clock starts when CS30 files it, it could default before the picture (CS31) is ready, although it is meant to be asked with the picture. QW1 opens on "answered with it or defaulted" (:2887).
   - Route: Definer and Chief of Staff. Set the timeout and say its clock starts when the picture is put to the owner, or file the question when the picture is ready.

**Older criteria against the answers:** the changed notes agree with answers 1 to 4: AC52 (:4797-4800), AC77 (:10435-10439), AC80 (:7121-7128), J2 (:12012-12018), the Risks (:16888-16907) and the brief (:18105-18131). The one exception is the strip, blocking finding 1.

**Self-implication (D-050):** yes, for blocking finding 3. The line's mismatch with reading (h) was in drafts 1 and 2, and my rounds 1 and 2 passed over it. Whoever runs Triage should weigh that.

Files:
- /home/user/sd-qdef/specs/S-001.md
- /home/user/sd-qdef/docs/design/references/owner-request-2026-10-25-questions-and-order.md
- /home/user/sd-qdef/AGENTS.md
- /home/user/sd-qdef/questions/_TEMPLATE.md
- /home/user/sd-qdef/governance/checks/asks_merge.py
- /home/user/Personal-Org-Operating-Model/OPERATING_MODEL.md
- /home/user/sd-qdef/decisions/questions/P-001-design-discovery.md
- /home/user/sd-qdef/docs/design/references/owner-answers-2026-10-25-g8c-review.md
