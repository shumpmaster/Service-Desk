# M3G plan: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at 2ca5255 (the plan, draft 2).

---

Verdict: PASS

**Plain summary.** Draft 2 fixes all four of round 1's blocking points, and the repo checks pass.
- **The section's buttons** now give exactly what the sheet's buttons give, including words the owner has saved.
- **Cards with no raised time** are named and put to the owner as reading (e).
- **A question being asked in the session that holds up other cards** is now defined under each of question 3's options.
- **The order of questions that wait on each other** is now one procedure with five worked cases.

I checked the procedure by hand on every case and it gives the stated order each time. The carried risks and notes from round 1 that you listed are each dealt with. I found a few small new gaps; none of them blocks, and they are listed below.

**Checks run (/home/user/sd-qdef at 2ca5255; clean worktree before and after)**
- `git diff --stat a9a0d36 2ca5255`: only specs/S-001.md changed (675+, 435−).
- `python3 governance/checks/surface_guard.py diff --range 3aad56e..2ca5255 --branch build/definer/questions-order`: "OK: 2 commit(s) … checked", exit 0. Both commits are the Definer's.
- `bash governance/checks/check_all.sh . 3aad56e`: "OK: all governance checks passed."
- `npm test`: not run again. No file under src/ or tests/ changed since round 1's run at a9a0d36 (1269 pass, 0 fail).

**Blocking findings**
None.

**Round 1's points, checked against draft 2**
- **B1 (section link vs sheet link), fixed.**
  - AC94's "Each link is the sheet's, in every state" (S-001:9617-9629), J3's note (:11874-11878) and QW1's brief (:17848-17851) build the links from `draftOf(card.id)`, which is what the sheet uses (sandbox.js:2736, :2765).
  - The test (:9654-9657) checks with and without saved words, for lettered (with and without a `Milestone:` line) and v2.5 (with and without letters), and checks the words both ways between section and sheet.
  - Numbered and can't-split questions open their sheet (:9609-9612), so no link with a blank `Ruling: ` is offered.
- **B2 (no raised time), fixed.** Every kind is named with its code reference: model.js:518, :685, :695, :742, :777 and portfolio.js:451; I re-checked each one. It is put to the owner as reading (e) (:17163-17165), with "however long they have waited", and listed in the Facts.
- **B3 (a held question that holds up other cards), fixed.**
  - A held question is an `askingRows` row and never in the order (:9739-9754).
  - Under question 3's A and B it says "Answer first · cards <k> and <j> wait on it", and the cards it holds up say "Waits on a question being asked in your session".
  - Those cards take their places by age. AC96 lists a held question named in another's line as "being asked in your session" (:9808), which also settles round 1's N6.
- **B4 (blocker order), fixed.** The procedure at :9686-9690 is deterministic. I traced all five worked cases by hand, and each gives the stated order:
  - Z, X, Y;
  - B, C, A (my round-1 case);
  - A, B, C (the loop plus a chain);
  - D, A, B, C;
  - U, V, W.

  Ties now go by J7's project order, then the AC73 key (:9702-9704). Within one project this matches today's id sort, since card ids are AC73 keys (waiting.js:27-28, :58-70).
- **R1 and R2:** in AC96 (:9794-9797), CS28 (:15300-15302), question 2's A (its cost stated) and Known limits (:16227-16234). The asks_merge.py:117-136 claim is true.
- **R3:** QW1's row now names the AC91 (f) strip case (ac91-glance-waiting.test.mjs:244-254), `isNewCard` (board.js:98-102), and AC80's lane-count and "Nothing waiting" cases.
- **R4:** reading (a) now covers the strip and quotes P-001-glance-lanes.md; reading (c) covers the one-project view; "every C reading listed" (fifteen, (a) to (o)).
- **R5:** cards read "<k> of <N> waiting", apart from the chip's "<k> of <n> projects".
- **N2:** the v2.5 labels "Copy answer <letter>" and "Copy the answer" are the sheet's (sandbox.js:2766-2771).
- **N3:** numbered and can't-split questions get "Answer in its sheet ›" (reading (h)).
- **N4:** QW1 orders the section as AC80's lane order, by project group, until QW2 (:17855-17857).
- **N5:** the section's head shows "· <q>" (counted questions) and, under question 3's A, "· <h> being asked in your session" (:9572-9574).
- **N6:** fixed, as under B3.

**Carried risks (non-blocking)**
- **D2-a. Numbering C clashes with question 3's A.** Numbering C promises "1 is always the top card" (:9718-9723). But with A, a held question sits at the head of its project's group with no number (:9744-9745), so the top card may carry none. Question 1's C should say "the top counted card", or question 3's A should say where a held question sits under C.
- **D2-b. "Not read now" is undefined for the section's grey line.** That line (:9580-9584) shows "for each project not read now". If that includes AC89 (a)'s state 4 (not fresh during a check), the line could flash every minute. Name the states it shows in: can't read (2, 5), and perhaps not read yet (1).
- **D2-c. A question with no raised time.** A question whose history gives no oldest commit has no raised time, and the procedure's "earliest raised" doesn't say where it goes. Say "no raised time last, then the tie rule", as part 2 does.

**Notes**
- **D2-d. Question 2's option B quietly widens what the page keeps.**
  - **What the page keeps today:** the body is already fetched, but `prBodyParts` keeps only the `Milestone:` line, Context and Why (records.js:807-810; pulls.js:118). So option B is still no new read (A3 holds).
  - **What B needs:** J12's "What the page keeps" widened, and a line about outside authors. A body is external text, and B would let an outside pull request move a question to the front, though only within the same project and only for items that are waiting. A is recommended, so this matters only if the owner picks B.
- **D2-e. Questions with no default are an established form here.** Question 1 has no default. That is consistent with this project's earlier questions: three past filings carry "DEFAULT: none — …", and CS30 says to file `DEFAULT: none`. QW2 then waits on the owner's answer with no timeout. That is the intended consequence, already stated.
- **D2-f. A small wording point.** "AC73 key as text" (:9703) would read better as "compared character by character (code-unit order)", so that no test author uses a locale-aware comparison. Portfolio cards' ids are not AC73 keys (portfolio.js:449), so name what they are compared by: their id.
