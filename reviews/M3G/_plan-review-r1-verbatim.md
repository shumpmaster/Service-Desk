# M3G plan: the Reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at a9a0d36 (the plan, draft 1).

---

Verdict: FAIL

**Plain summary.** Draft 1 does what the owner asked in broad terms, and the repo checks and all 1269 tests pass. But four points in it either don't match how the desk works today or can't be pinned down by a test:
- **The section's buttons can drop the owner's words.** If the owner typed words in a question's sheet, the section's buttons leave them out of the answer.
- **Some cards are always last.** Five kinds of card, portfolio decisions among them, have no "raised" time, so they always sit at the end, however long they have waited. The owner is told "oldest first" and not told this.
- **The case behind the request has no place.** A question that other cards wait on, while it is held as being asked in the session, gets no place at all. That is the very case the owner raised.
- **One ordering rule has more than one right answer.** The rule for questions that wait on each other allows several orders, so no locked test can pin one down.

Each is a small fix to the text. Nothing in the plan needs new access.

**Checks run (/home/user/sd-qdef at a9a0d36; clean worktree before and after)**
- `python3 governance/checks/surface_guard.py diff --range 3aad56e..a9a0d36 --branch build/definer/questions-order`: "OK: 1 commit(s) … checked", exit 0. The commit is by `definer <definer@agents.invalid>`, with `Agent-Session:` and `Spec: S-001` trailers. Only specs/S-001.md changed.
- `bash governance/checks/check_all.sh . 3aad56e`: "OK: all governance checks passed."
- `bash governance/checks/check_all.sh . aa0b6f5`: FAILS in surface_guard diff. Commits 7a38eb9 and 3aad56e are by `orchestrator` on branch build/definer/questions-order ("only 'definer' or a human may commit there"). This is not the Definer's plan (see note N1).
- `cd src && npm test`: 1269 tests, 1269 pass, 0 fail.

**Blocking findings**

- **B1. A section button's link differs from its sheet's whenever the owner has typed words.**
  - **What the plan says:** AC94 (S-001:9494-9501), J3's note (:11692-11696) and QW1's brief (:17614-17616) build the section's buttons "with the box empty, so each link is the sheet's".
  - **What the code does:** the sheet builds its links from the saved words, `answerButtons(project, card.flag, CONFIG.linkCap, draftOf(card.id))` (src/public/sandbox.js:2736; numbered :2725-2729; v2.5 `v25Ruling(l, draftOf(card.id))` :2765). Those words are kept on the device for 7 days and survive a reload (src/lib/board.js:146-162, DRAFTS_KEY).
  - **There is a precedent:** AC89 (j) item 13 (S-001:2206) and `gateButtons` (sandbox.js:2275-2277) make the board's gate buttons carry the sheet's typed reason, "as in the sheet".
  - **Reproducing case:** on a lettered v3 question, type "only if cheap" in its sheet's box, close the sheet, then tap "Answer A ↗" in the section. The record holds `Ruling: A` without the owner's words, while the sheet's "Answer A ↗" holds them.
  - **Why it passes the test anyway:** AC94's test compares against "the sheet's button with the box empty", so a build passes it and still loses the owner's words.
  - **Fix:** make the section's links equal to the sheet's in every state, saved words included, or say on the section that words are saved and send the tap to the sheet. Test it with a saved draft, for the lettered, numbered, can't-split and v2.5 forms.

- **B2. "Oldest first" silently puts whole kinds of card last, for good.**
  - **What the code does:** these cards are built with `raisedAt: null`:
    - deploys (src/lib/model.js:518);
    - missing (status) cards (:685, :695);
    - hold cards (:742);
    - merge cards (:777);
    - every portfolio card (src/lib/portfolio.js:451).
  - **What the plan does with that:** AC95 (:9569-9571) sends "one with no raised time last", then sorts by id.
  - **Reproducing case:** a governance hold that has been red for three days, plus a portfolio decision filed last week, read beside two pull requests opened today. The two pull requests read "1 of 4" and "2 of 4"; the hold and the portfolio card read "3 of 4" and "4 of 4" for as long as they wait.
  - **Who is told:** the owner chose "the rest, oldest first". Neither the plain paragraph (:2719 "oldest first"), reading (c)/(d) nor question 7 says this.
  - **Why it passes the test anyway:** the "no raised time last" test passes this, though the owner never chose it.
  - **Fix:** name the kinds and put this to the owner as a reading (or an option), or give those kinds a raised time from a read already made. Hold paths already get a history read when there is more than one (model.js:252); anything else would be a new read, A3.

- **B3. A blocker that is held as being asked in the session has no defined place.**
  - **What the plan says:**
    - AC95 says a held question "has no place while held, since it is not counted" (:9562-9563).
    - Rule 1 defines blockers by "at least one other card with a place waits on" (:9565), but never says the blocker must itself have a place.
    - "after <k>" (:9583) has no k to show when the blocker is held.
  - **What the code does:** held questions are not cards at all. They go to `askingRows`, not `flagged` (model.js:545-551), so they are not in `projectCards`.
  - **So the plan's brief is wrong here:** "drawn … from the question cards src/lib/board.js already makes" (:17614) is false for them.
  - **Reproducing case:** the Chief of Staff files Q with `Blocks: #12, #13` and `Asked in session: <id>` while asking it in the session. Under question 2's A, B or C, Q gets no "1 of N" and no "Answer first". #12 and #13 say "after ?" or nothing.
  - **Why it matters:** that is exactly the owner's complaint (a question asked in the session, not plainly answerable, holding work up). The owner's "the question NEEDS to be answered first" is then unmet in the commonest case.
  - **Fix:** define a held blocker for each of question 2's options: its place, or "Answer first" with no number, and what the cards it holds say. Add a case to AC95's and AC96's tests.

- **B4. The blocker order is not total, so a locked test can't pin it.**
  - **The rule:** rule 1 (:9565-9568) says "a blocker that waits on another blocker comes after it, and otherwise the earliest raised first; … in a loop, by raised time alone".
  - **Case:** blockers A (oldest, waits on C), B (middle) and C (newest).
  - **Orders the rule allows:** B, C, A (pick the oldest ready blocker each time) and C, A, B (sort by age, then pull C forward). Both satisfy it.
  - **Loops the rule doesn't settle:** a loop joined to a chain (A↔B, C waits on A), and a loop together with a blocker outside it.
  - **Two things fail with it:**
    - AC95's promise that "the order is total" (:9571-9572) can't be checked from the spec.
    - The QW3 test row ("a chain", "a loop broken by age", :2832) would lock whatever the test author picks.
  - **Fix:** write down one procedure (for example: repeatedly take the earliest-raised blocker that waits on no blocker still unplaced; where every one left is in a loop, take the earliest-raised), and give the expected order for these cases.

**Carried risks (non-blocking)**

- **R1. Changing a `Blocks:` line later isn't covered by the asks-merge delegation.** governance/checks/asks_merge.py:29-38 and :117-136 classify only a question added (a), an answer closing it (b), session lines (c) and tidying (d). A pull request that modifies questions/<name>.md is none of these, so it needs the Orchestrator's merge (R0, risk-paths.toml:28). Work that queues behind a question after it is filed is the usual case, so lines will lag. Question 1's option A ("Ready as soon as QW3 is built", :16868-16869) and CS28 (:15104-15112) should say so before the owner rules.

- **R2. Places are per device.** Done marks, kicks and "Answer it here instead" live on one device (board.js:795-809; model.js:547). A pending Done mark on the phone lowers N there but not on the laptop. "Two devices reading the same records agree" (:9571) is true only of the records. Question 2's option A makes a tap end the hold on that device, so N and every place shift there at that moment.

- **R3. QW1's list of locked cases it will force is incomplete.**
  - AC91 (f)'s strip test holds a kicked-back question card (tests/desk/ac91-glance-waiting.test.mjs:244-254, `CARD.question(MIX_PROJECT2)`). QW1 moves it to the section, but QW1's row names only AC80's, AC77's and AC81's cases.
  - `isNewCard` gives "new" only in the 'wait' lane (board.js:98-102), so the section's "new" (:9481) needs that rule changed too.
  - The stage note's "outside its row" covers this, but QW1's row should name them.

- **R4. A reading of the owner's ruling isn't in question 7's list.** P-001-glance-lanes.md (C) puts kicked-back cards, "each with its reason", in the strip. AC94 moves kicked-back questions out of it (:9468, "(C)"). That "(C)" is not among question 7's twelve readings ((a) mentions only "Waiting on you"), and the plan says "no owner ruling is changed". Add it to (a). The C on "with one project shown" (:9464-9465) is likewise not listed.

- **R5. One project shown puts two "k of n" forms on the screen.** The chip's "<k> of <n> projects" sits beside cards reading "3 of 7". Over to the Design reviewer and question 6's picture.

**Notes**

- **N1. Branch hygiene, not the plan's content.**
  - The Orchestrator's two record commits (7a38eb9, 3aad56e) sit on build/definer/questions-order, so a pull request from this branch fails CI's surface_guard diff.
  - **Fix:** land the records from an `orch/` branch first, or rebase the Definer's commit onto them once they are merged.

- **N2. v2.5 labels differ.** AC94 calls the section's v2.5 buttons "Copy ruling <letter>"; the sheet's are "Copy answer <l>" (sandbox.js:2766, :2771). A v2.5 question with no letters (the sheet's "Copy the answer") has no section form.

- **N3. Numbered and can't-split questions break "one tap, then commit".**
  - **The problem:** they open a record with a blank `Ruling: ` for the owner to complete on GitHub.
  - **Options:**
    - say so in AC94;
    - or make the section's tap open the sheet, where the numbered boxes are.

- **N4. QW1's section order is undefined.** AC94 says "in the order of AC95", but AC95 lands in QW2. Say QW1's order (presumably age, as the lanes today).

- **N5. The section's head count is ambiguous.** Its "count in `--t-mono`" (:9528) could disagree with N once held questions show (question 2, A). Say what it counts.

- **N6. A held question named in `Blocks:` gets the wrong words.** It would read "<entry>: not waiting on you now" (:9634-9635), which is not true: it waits, but is held. It needs words of its own.

- **N7. Raised time is safe from edits.** A question's raised time is its file's oldest commit (S-001:3423; model.js:533), and the history read is required (model.js:~318). So editing a question to add a `Blocks:` line moves neither its place nor its settle time. No finding.

- **N8. Claims checked and true:**
  - `answerButtons` lettered and numbered forms (board.js:258-290);
  - badge = "Waiting on you" + Kicked back across all projects and the portfolio, whatever project is shown (board.js:846, :867-868); Home's count is `bd.badge` (home.js:134), so N, the badge and Home agree;
  - questions and the model's checks accept a `Blocks:` line (governance_checks.py:295-320, :356-386);
  - `queue/<file>.md` is flat (records.js classifyQueuePath);
  - portfolio cards have no answer link (portfolio.js:437-452);
  - V25_RULING_NOTE's words (links.js:98).

**Open questions**
- For B1: should the section carry the sheet's saved words, or send the tap to the sheet when words are saved? This is the owner's to choose if the two would look different.
- For B2: is a raised time for hold, merge, deploy and portfolio cards wanted, given that some of them would need a new read?
