# The card fix's Discovery: a read-only helper's sizing of the change in the desk's code

*Recorded verbatim by the Chief of Staff's session (session_01QBwHGL14SMPK1652qVZprr) on 2026-11-04. This is the return of a read-only search helper (no write tools), sent to do P-003's Discovery as its brief scales it (docs/PROJECT.md Part 2, "Later work: the card fix (P-003)", "Its Discovery, scaled to its size"): read the desk's code for where a card enters the queue, Home's count and the card sheet, and how the notes' recommended word would be found, and size the change. It is a reading of this repository's own code and records, not outside research; nothing in it enters the library. Its run: 91,414 tokens, 20 tool uses, about 2 minutes. Its return follows, unchanged.*

---

**P-003 sizing (read-only, nothing edited)**

**1. How a card gets on the queue, and how gate cards are told apart**
- There is one choke point: `src/lib/model.js:734-739`. It walks `openCards(tree)` (model.js:139-146: `queue/<item>-<gate>-<n>.md` with no answer file) and pushes `{kind:'card', raisedAt, card}` into `flagged`. `raisedAt` is already taken from the dispatch log's `card` entries, through `cardTimes` (model.js:636).
- Everything downstream reads `model.flagged`:
  - `queueView` (src/lib/sandbox.js:469-476), which drives the queue groups and "waiting" counts;
  - `projectCards` (src/lib/board.js:522-590), which drives the board and Home's count (home.js:221, 683);
  - `universe.js:112`;
  - the notify sender's `waitingSet` (src/lib/waiting.js:96, used from src/notify/collect.mjs:329).
- Gate cards are told apart by `GATE_WORDS = ['dor','criteria','launch']` (src/lib/j11.js:24), checked at board.js:573, sandbox.js:431 and 947, and waiting.js:18/62 (as `GATE_RULINGS`). `dor-fail`, `stop` and `failure` cards are decision cards.

**2. Section 5 and the Recommended mark** (the brief's citations are correct)
- sandbox.js:955: `recommendation: cardSection(p.text, 5)`, the card's own section 5 (`cardSection` is at sandbox.js:878).
- board.js:487-499: `recommendedWord(c)` finds a card word in section 5. answerButtons (board.js:448-460) sets `recommended: recWord === w`. For a gate card, the case's word (`caseWord`) comes first.
- records.js:34-36: `parseAnswerPath` returns null for `-notes.md`, and `recordKind` (model.js:51-80) has no kind for notes, so a notes file is never read.
- What the brief leaves out: the sheet's actual rendering is in **src/public/sandbox.js:3701-3717**, a hand-written 5,842-line page that is not mirrored. The "Recommended …" / "No recommendation given" line is at 3702-3704 and the button mark at 3716. The new "No Chief of Staff recommendation yet" text goes there.

**3. How the desk reads GitHub**
- It reads the full tree with `git/trees/<sha>?recursive=1` (src/lib/github.js:104), then blobs by sha (github.js:105). Parsed records are cached by blob sha.
- `neededReads` (model.js:220-330) already reads both dispatch-log months (233), so the card's raise time is already known.
- Whether notes exist is free: `tree.has('decisions/<item>/<gate>-<n>-notes.md')`.
- Getting the word means a **new blob read** per open decision card that has notes: a new `recordKind` (e.g. 'card-notes') plus an `add()` in neededReads. That is a few small blobs, read once per sha. The read path supports it, with no new rate-limit concern. collect.mjs reuses neededReads, recordKind and parseRecord, so notify picks it up too.
- The "day after" check needs only the `now` buildModel already has; the model is rebuilt each read cycle.

**4. Real notes files**
Most carry a `Recommendation:` line, but in four forms:
- `**Recommendation: \`resubmit\`, after the two fix PRs merge.**` (P-001/dor-fail-1, line 3; Q-006/stop-1 has the same form)
- `## Recommendation: \`re-specify\`` (Q-002/stop-1:24; Q-005/stop-1:18 has `confirm`)
- `Recommendation: \`drop\`, and have …` (Q-012, Q-017/stop-2, Q-019/stop-1, all line 3)
- `Recommendation: \`drop\`.` (Q-019/stop-2:3)
- `**Recommendation: \`re-specify\`.**` (Q-006/stop-2:3)

Q-003/failure-1-notes.md has a bare `## Recommendation` heading followed by a numbered list, with no word on the line. Under the brief's rule it counts as no notes. Q-009, Q-010 and Q-011 have no notes file at all. So the parser must strip `**`/`##` and take the first backticked word that is one of the card's words. The notes match the card words (P-001 dor-fail-1 lists `resubmit`/`stop`).

**5. Tests** (in /home/user/Service-Desk/tests/desk/, not under src/)
- Records and reads: j2-records.test.mjs, j9-pipeline.test.mjs, s033-records.test.mjs.
- Queue, board and Home: ac80-board, ac54-home, ac82-home, ac91-glance-home, ac91-glance-waiting.
- Sheet: ac85-sheets, md-sandbox, ac53-answer-boxes.
- Notify: notify-ac73-set, notify-ac74-desk, notify-ac77-desk.
- About 8-12 new cases:
  - the notes parse forms (including the bare heading and a word not on the card);
  - held, then shown with notes and its button marked;
  - shown after a day with the mark, then the mark giving way when notes arrive;
  - held cards out of Home's count;
  - gate, question and pull-request cards unchanged;
  - no raise time, or the log not yet loaded;
  - the notify set.

**6. Code paths**
src/public/lib/ is generated: src/tools/build.mjs (`PAGE_LIB` list) makes byte-identical copies. `npm run sync` (`build.mjs --write`) regenerates them and `npm run build` fails if they are stale. src/public/sandbox.js is separate and hand-written.

**7. Size**
About 60-90 lines across 5 source files, plus the regenerated copies:
- records.js: a notes path and a `Recommendation:` word parser, about 15 lines.
- model.js: the new record kind, the read, and a hold/flag rule at 734-739, about 25 lines.
- board.js: use the notes' word for non-gate cards in `answerButtons`/`recommendedWord`, about 8 lines.
- sandbox.js:955: the recommendation from the notes, or a "no recommendation yet" flag, about 6 lines.
- public/sandbox.js:3702: the line's text, about 4 lines.

It stays a small addition. Things that make it a little bigger:
- **Notifications change too.** Holding a card off `flagged` also keeps it out of the notify sender's set. That is probably intended, but the brief doesn't say so. A notification already sent for a card that is then held would re-check as "gone" (notifyview.js:337).
- **No raise time.** `raisedAt` is null when the card is older than the two log months or the log isn't loaded yet (`logLoaded`, model.js:614-627). A rule is needed, e.g. show it marked, rather than holding it forever or having it flicker while the log loads.
- **A second file to change.** The sheet text lives in the hand-written src/public/sandbox.js, not in the mirrored lib.
- **The notes forms vary**, and Q-003's heading-only form gives no word.
- **Decision cards lose their section-5 mark.** Today's section-5 word-matching would be replaced for decision cards ("only from the notes").
