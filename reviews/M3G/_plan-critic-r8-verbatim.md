# M3G plan: the Critic's round 8 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at 6f30abd (the plan, draft 8).

---

Verdict: PASS

**The plan, draft 8 (6f30abd), passes, with three non-blocking notes for the Definer.**

**How I checked:** I had no shell, so I could not run `git diff 7821948 6f30abd`. I read the branch's git log, which shows HEAD at 6f30abd with 7821948 just before it. I checked each change the Definer claims against the text at HEAD, and opened every source it cites. Line numbers are /home/user/sd-qdef/specs/S-001.md at 6f30abd. The code was read in the worktree. Its lines are 7821948's only if draft 8 changed no code, and from its log I take it changed only the spec.

**Your round-7 notes are met**
- **Note 1 (AC94's headline):** :10064-10067 now says "the first three with their choices showing and the rest with theirs one tap away in place". This matches its body (:10159-10164) and the line.
- **Note 2 (the plain paragraph):** its first bullet (:2755-2757) says the rest are one tap away. The count is now "thirteen" (:2744-2746): the Chief of Staff's four, the plan's four and the five on the picture. The list matches the records.
- **Note 3 (AC77's change note):** :10836-10839 now says the buttons are live wherever they show, and behind "Show choices ›" when the question is fourth or later (P-001-m3g-length, B).

**The milestone line and the header are right**
- **Header:** :15 reads `milestones: M1, M2, M2B, MD1, MD2, MD3, M3A, M3B, M3D, M3E, M3G, M3C`. That is section 3's order (docs/PROJECT.md:106-117).
- **The line:** docs/PROJECT.md:116 holds it word for word, as my check (P-001-m3g-line-critic.md:5) and the spec's quote (:2877-2886) have it. The milestones heading (PROJECT.md:105) names P-001-m3g-line.md and the critic file.
- **The approval:** P-001-m3g-line.md says "Ruling: A". It quotes option A's words exactly, and the spec quotes them exactly at :2937.
- **The commits:** b1236d8 is real ("Add M3G to the project's milestones…", .git/logs/HEAD:157). 2ab4996, 3daa152, de01257 and 5aef01b also exist.
- **CS29** (:15899-15902) is marked done, matching the records.

**G8d's words are aligned with the code**
- **Words for the unknown:** AC94's red quiet line (:10141-10142), its one-project line (:10083), its empty-lane rule (:10107-10118), its "none" line (:10125-10128), its test (:10245-10250) and QW1's row (:2945) all use G8d's words as built:
  - board.js:166 `cantShowWords`, :172 `quietTroubleWords`, :183/:187 `ONE_WORDS`, :85 `UNREAD_WORDS`;
  - the strip's lower-cased words, `stripEmptyWords` :70-78;
  - `quietCantWords` with "in this opening", :158.
- **State 2 holding cards:** oneProjectView :239 gives state 2 `cards: true`, as AC94 (:10112-10113) now says.
- **Code lines at 7821948:** all were checked and hold:
  - sandbox.css :676 and :683;
  - sandbox.js :2786, :2800, :2829-2835;
  - board.js :133-137, :248, :979-980;
  - model.js :533, :545-551, :518/:685/:695/:742/:777;
  - portfolio.js :464/:466;
  - sheets.js :137;
  - ac91-glance-waiting.test.mjs :244-254;
  - ac88-dark.test.mjs :829/:1699.
- **The heap limit** (:2925-2928, brief :18736-18737) matches Known limits :16691-16697.

**The owner's answers and the merge**
- **The owner's answers are word for word.** Answers 1 to 4 (:17848-17868) match the request record :25-28. The picture answers (:17880-17907) match the length, held-place and age-double records.
- **No ruling is changed.** The quotes of P-001-glance-no-quiet-lanes and P-001-glance-cant-show-last-read are G8d's own, carried over.
- **The merge left nothing inconsistent.** AC80's notes (:7232-7243 beside :7263-7271), AC91 (f) (:9325-9369), Known limits and Risks (:17374-17376) agree with M3G's text.

**Non-blocking notes (all routed to the Definer, the spec stage)**
- **N1. The owner-facing paragraph promises a start that "When each opens" does not.**
  - :2771-2772 says "the steps can start once this plan lands".
  - "When each opens" (:2935-2938), "Where this fits" (:2953) and the draft-8 log (:3072-3073) also wait for "any glance step ruled since G9". The approved option's own words are "M3G's first step opens after the glance work's last step".
  - The plan never says whether any such step exists now. I found no open question file and no G9-or-later glance step named in the spec.
  - Either say that none exists, or give the condition in the plain paragraph too.
- **N2. The count leaves out the line's approval.** :2744-2746 counts "thirteen of your answers of today on this work". The line's approval ("Approve (Recommended)", P-001-m3g-line.md) was also given today on this work, and the same paragraph mentions it at :2771. Either count fourteen, or say the thirteen are the design answers.
- **N3. A citation runs four lines long.** :10108 cites `oneProjectView` as board.js ":225-247 at 7821948". The function ends at :243, and :245-247 are AC56's comment.

Self-implication (D-050): none. N1 and N2 are about text added after my round-7 check.

Files:
- /home/user/sd-qdef/specs/S-001.md
- /home/user/sd-qdef/docs/PROJECT.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-line.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-line-critic.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-length.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-held-place.md
- /home/user/sd-qdef/decisions/questions/P-001-m3g-age-double.md
- /home/user/sd-qdef/docs/design/references/owner-request-2026-10-25-questions-and-order.md
- /home/user/sd-qdef/src/lib/board.js
- /home/user/sd-qdef/src/public/sandbox.js
