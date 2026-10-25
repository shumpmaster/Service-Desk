# M3G plan: the Critic's round 5 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at db5f432 (the plan, draft 5).

---

Verdict: PASS

I checked draft 5 of the M3G plan (db5f432) and it passes. Round 4's blocking finding and both of its notes are settled, and nothing new is broken badly enough to block. Six non-blocking notes follow. I have no shell, so I read the checked-out working tree and took it to be db5f432. Line numbers below are from that tree.

**Round 4, checked**
- **Finding 1 ("its choices" and "a tap opens GitHub" untrue for readings (g) and (h)): settled.**
  - AC94 (h) (:9853-9862) now shows a numbered question's parts and a can't-split question's `OPTIONS:` lines as text in the section, with one "Answer in its sheet ›" button under them. It is marked C, (h), and it is tested (:9906-9908, QW1's row).
  - AC94's headline (:9768-9775) now says how each kind is answered: a lettered v3 question by a GitHub link; a numbered or can't-split question by one button that opens its sheet; a v2.5 question by copy buttons. The plain paragraph (:2744-2750) says the same.
  - The line's explanation (:2870-2881) now covers "its choices" for each kind.
  - With that, the line "each showing its words and its choices and answered from there…" holds for every kind the spec draws, apart from the edge case in note 1.
- **Note 1 (the portfolio last): settled** in AC80's note (:7164), QW2's row in both columns (:2909), CS31 (:15574), reading (p) (:17492-17493) and the brief (:18197). AC91 (f) (:9117) and AC95 (:9968) already said it. One place is still missing it (note 4).
- **Note 2 (the plain paragraph out of date): settled.** The heading says draft 5 (:2730), and the paragraph's account of the four failed rounds (:2732-2736) is accurate.
- **Code citations:** each one I checked matches the tree, for example sandbox.js:2744-2751 and :2758, board.js:98, :149 and :867-868, model.js:545-551, sheets.js:137 and sandbox.css:676 and :683. The "What the desk does today" bullet still says it was checked "at 3aad56e" (:2807), though its lines match the current code.
- **Still in line with the owner's words and answers:** answers 1 to 4 and the four request answers are quoted as the record has them. "One tap, then commit" is kept for lettered questions, and the one extra tap for (h) is said and put to the owner as reading (h). The line still reads as an achievement within Build, not a task, and its ` · why:` says in plain words why the project needs it.

**Non-blocking notes**
1. **A question with no `OPTIONS:` block is an exception to "its choices".**
   - The section shows only "Its choices are in its sheet" for such a question (:9858-9859). The code treats a file with no `OPTIONS:` line as one that can't be split (src/lib/sandbox.js:740).
   - So the explanation's "holds for every kind of question" (:2871) has an exception that the line does not cover. Such a file breaks questions/_TEMPLATE.md, which is why I do not rate this blocking.
   - Route: Definer. Name the exception in the explanation.
2. **"Where each part has its own box" is untrue for a can't-split question.**
   - A can't-split question's sheet shows the file whole with AC53's one-box fallback (:4960; sandbox.js:2760-2763).
   - The words appear in AC94's headline (:9773), the plain paragraph (:2748-2749) and reading (h) as put to the owner (:17473-17474).
   - Route: Definer.
3. **"So no answer to question 5 makes the line untrue" (:2879-2880) now overclaims.**
   - The explanation itself says "its choices" rests on reading (h) as drafted in draft 5 (:2873-2874).
   - Option B of question 5 would let the owner change (h), for example to a button with no text.
   - The route back to the owner (:2880-2881) covers this, so the line stays safe. The sentence is still untrue as written.
   - Route: Definer.
4. **Smaller summaries that lag AC94 and AC95**, which govern, so a Builder will not guess wrong:
   - QW1's "What the owner sees" (:2908) describes only lettered questions ("its choices as boxes… a tap opens GitHub with the answer written").
   - The brief's QW1 item (:18187) says "numbered and can't-split questions opening their sheet", with no mention of their text in the section.
   - AC95's test (:10023-10024) says "the strip's order across projects (J7's, then place)", without the portfolio last.
   - Route: Definer.
5. **"So you only press Commit" has two exceptions that the headline (:9772) and the plain paragraph (:2747) don't mention.**
   - Past `linkCap`, or where `contentPrefill` is false (AC17), the button opens only the file name and the owner pastes the copied text. Where `webCommitsToDefault` is false, AC18's message comes first.
   - AC94's body says this (:9884-9889), and the sheet does the same today. The M3G line's general wording still holds.
   - Route: Definer, wording only.
6. **The "at 3aad56e" label (:2807) is stale**, as noted under Round 4; its cited lines still match the code. Route: Definer, wording only.

**Self-implication (D-050): yes, for notes 2, 4 (QW1's row and AC95's test) and 5.** These words probably stood in draft 4. I did not flag them in round 4, and I listed AC95's test as already stating the strip order. I cannot diff, so I have not confirmed this. Whoever runs Triage should weigh it.

Files:
- /home/user/sd-qdef/specs/S-001.md
- /home/user/sd-qdef/docs/design/references/owner-request-2026-10-25-questions-and-order.md
- /home/user/sd-qdef/src/lib/sandbox.js
- /home/user/sd-qdef/src/public/sandbox.js
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/reviews-m3g/r4-critic.md
