Verdict: PASS

The Reviewer's verdict on PR #465 (R1: the card fix's build, S-014), copied from reviews/S-009/_reviewer-build.md, where it is recorded verbatim. reviewer-4, a fresh Reviewer, read-only, on 2026-11-22 from about 18:55Z to 19:04Z, on branch build/builder/p003-fix at 9633e9a (three builder commits on cd0a438). Its brief held the record, its note and the commit list. It re-ran the adapter at the base commit fca41700 in the session's scratch copy and found every case's output byte-equal to the record. Recorded by the orchestrator.

## The Reviewer's return

Verdict: PASS

I found no blockers. The build matches the record byte for byte at the base commit, both suites pass on the built code, the locked check s009-j7-baseline passes with every hashed file unchanged, and nothing under src/notify/** changed. All 12 changed existing tests trace to S-014's criteria.

**Checklist caveat.** docs/archive/OPERATING_MODEL_v2.5.1.md is not in this repository (there is no docs/archive/), and L-0112 does not exist here. Earlier reviews hit the same gap: reviews/341/_reviewer-verbatim.md:11 and reviews/356/_reviewer-verbatim.md:72. I reviewed against AGENTS.md, the CLAUDE.md landing steps, S-014 and your brief. There is no PR body for this branch yet, so the "What this means for you" rule has nothing to judge. The operating notes do open with that paragraph (docs/handover/P-003/operating-notes.md:6-13). Whoever opens the PR must start its body the same way.

## Evidence per item

**1. Line 23's build-review re-run: PASS.**
- From the root of the session's scratch copy (/tmp/claude-0/-home-user/028f812b-7869-5d72-8074-7ec28ff624c8/scratchpad/build-review-base), I ran `node tests/desk/baseline/adapter.mjs <case> <out>` on all 12 cases on Node v22.23.5. Every run exited 0.
- Each output file is byte-equal to its string entry in the record's `results` (12/12). The record names base_commit fca41700… and node v22.23.5.
- The scratch tree equals `git archive fca41700` except for the added tests/desk/baseline/.
- All 18 `hashes` entries match in the scratch copy, the worktree and main.
- The record's SHA-256 (da8ca961…) equals note.md's line.
- The adapter commit 26001c2 is an ancestor of the record commit 52216e4 / cd0a438 and touches only adapter.mjs.

**2. Suites on the built code: PASS.** I ran both on a git-archive copy of 9633e9a at /tmp/rv4-built.
- `npm --prefix src test`: 1583 tests, 1583 pass, 0 fail.
- `node --test tests/acceptance/`: 66 tests, 66 pass. That includes "S-009 line 23 locked check" and all 8 of its subtests (note and hash, every hashed file, coverage, poison run, desk/sender/AC15 comparisons, J7 line 167).
- `git diff --stat cd0a438..HEAD -- tests/acceptance tests/desk/baseline src/notify reviews` is empty.
- `node src/tools/build.mjs` gives "build: PASS … 39 page modules in step". src/public/lib/{board,model,sandbox,scheduler}.js are byte-identical to src/lib/.

**3. The fix against the criteria: PASS.**
- **The rule never reads a clock.** `decisionStates({tree, records, now, queueRead})` (src/lib/model.js:171-203) uses only the `now` it is handed. Its callers hand the moment in: scheduler.js:1470 `new Date(clock.now())`, and collect.mjs passes its `now`. There is no memory of earlier reads and nothing stored.
- **Held / shown with the word / shown after a day with the mark.** These are at model.js:196-198. The notes' word wins over the day (J3). The earliest `card` entry is picked (J1), at :193-194. A missing entry in a log that was got shows at once (AC7). A negative age is held.
- **J2 parsing** is at :160-164, including `dor-fail` versus `dor` through the exact gate list at :151.
- **Section 5 never marks a decision card.**
  - board.js:455 is `c.cos ? c.cos.word : …`, so a decision card's button comes from its notes' word alone.
  - sandbox.js:956 replaces the section-5 line with "The Chief of Staff recommends <word>", or with null plus `cosNone`. Section 5 stays visible in the whole record (src/public/sandbox.js:3746).
- **AC9.** Gate cards have no `cos` and keep the case-word / section-5 path unchanged. `neededReads` adds notes only for DECISION_GATES (model.js:292-295).
- **AC11 / AC14: one list.**
  - buildModel drops held and undecided decision cards from the one card loop (:782-784). Queue, Home, the board, the sheet and the sender (through collect.mjs → buildModel) all take that list.
  - No file under src/notify/** changed. None of the three risk-path shared files (jobcand.js, ledgergrant.js, j22.js) is touched, so the change is R1 only.
- **Failed reads (AC16, AC17, J8).**
  - "queue/ not got" means the tree was not got or any open card file is unread (:177). The notes are "not got" when a decision card's notes file is in the tree but unread (:178). The log is "not got" when a month file is in the tree but unread, and then only cards with a word are shown and `withoutNotes` is set (:186, :195-197).
  - On the desk, a failed poll or an unread moved tree clears `st.treeGot` (scheduler.js:916-935, :1336).
  - The lines use the exact words (:154-156). They are drawn on the one-project Waiting view (the adapter's "queue", `#/p/<project>/queue`) and in Home's brief, not on `#/waiting` (the board), and only while the project reads cant-read (src/public/sandbox.js:776-782, :3162-3164).
  - On the sender, a notes blob failure throws in `blobs`, so the read is false and nothing is sent, as on a failed log read.
- **AC15.** The record's link result is `{"buttons":false,"lands":"#/waiting","shows":""}` in both read states. The build matches it with no sheet brought back, and the locked AC15 subtests pass. The notice case lands `#/p/Service-Desk` with "That no longer waits on you".
- **AC4 / AC5 (rubric R2).** `desk.model(name)` rebuilds from `clock.now()` on every render and read, so the card shows at its day on the next 60-second read. The schedule is unchanged.
- **Rubric R3 / R4 (AC8, AC10).** Notes are read only from the main tree, through `neededReads` (desk blob call) and checkout `blobs` (sender). No new repository, credential, write or service is added. The blob cache key is `kind:sha`, and 'notes' is a new kind, so no stale entry of another shape can be served.
- **AC18: PASS on all 7 items of AC18-rubric.md** (operating-notes.md:15-36, :38-43, :45-64, :66-95, :97-124, :126-133, :135-143). The AC13 recipe uses the same calls as tests/desk/s014-ac13-count.test.mjs:26-27. I checked the `config` default import in a probe.

**4. Existing-test churn (cb807a2): all forced by S-014; none weakens a test of behaviour S-014 leaves alone.**
- **Notes fixtures added:**
  - Which tests: ac-desk ×2, ac17-18-sheets, ac85-sheets, m2-review-fixes ×2, the first j2-records test, j9-pipeline, and sandbox-fixtures' Q-020.
  - Why they are forced: each decision card is raised under 24 hours before the test's moment with no notes, so AC1 holds it. Examples: stop-6 raised 2026-10-06T18:51:54Z, read at 19:00Z or at 2026-10-07T12:00Z.
  - Each notes file recommends the word the card's section 5 points to ("The Chief of Staff's part: `decisions/…-notes.md`"; fixtures queue/P-001-stop-6.md:25-26 and md-extremes/long-card.md:17-18). Every original assertion is unchanged and still passes.
- **ac30-34-robustness, hand-built record gaining the card file:** forced by J8 (spec :177): queue/ is got only when every card file's text is got. The test's assertion is unchanged.
- **ac53-answer-boxes:** "Recommended The Chief of Staff's part" becomes "No Chief of Staff recommendation yet" plus a `doesNotMatch` on the section-5 line. This is forced by AC3, AC4 and AC7 (the card has no log entry, so it shows at once with the mark). The change is stricter, not weaker.
- **ac89-after-md3, AC89 (a) state 5 "no card ever hides":** now "no other card ever hides", with the wait count reduced by the decision cards. Forced by S-014 J8 :177 ("A read whose poll fails … has not got queue/, whatever tree the desk keeps … hides every decision card (AC16), while other cards stay shown") and AC18's third bullet. The test first asserts the fixture holds a decision card, so it cannot pass vacuously.
- **ac91-glance-home:** the corner count after a failed poll is one smaller. Forced by the same J8 :177 and AC16.
- **j2-records "unread card still flagged":** forced by J8 :177 and AC16. The old property, an unread card flagged by its path, is kept for a gate card (P-001-dor-2). The decision card is now asserted unflagged with the queue/ line, which is stronger.
- **Older frozen spec contradicted?** Yes in wording, not in authority: see N1.

**5. Budget and stop conditions: within budget, nothing fired.**
- Hand-written code lines added: model.js 65, board.js 2, sandbox.js 3, scheduler.js 5, src/public/sandbox.js 12, so about 87 (71 that are not comments). That is at the low end of 90-130 and well under about 180.
- New tests: 14 (13 in s014-decision-cards, 1 in s014-ac13-count). That is under the 15-23 estimate and under 24.
- Stop conditions:
  - No src/notify/** change, and AC14's baseline used the adapter's stand-in.
  - The blob path does not stop the notes reads. Needed reads are batched at 25 per call, up to 6 calls per cycle, and past that the project reads "Checking…" and carries on next cycle (scheduler.js:1251-1272).
  - Coverage passes, the Home-count and `notices` comparisons pass, gate cards on a failed notes read equal the base on a failed log read (the locked check passes), and the adapter runs unchanged.

**6. Identities, trailers and guard: PASS.**
- All 3 commits are authored and committed by `builder <builder@agents.invalid>`.
- Each ends with `Agent-Session: session_01QBwHGJWF4ev8Y9sdGjavWE/builder-8` and `Spec: S-014`. A grep for claude, co-authored, opus or anthropic in the messages gives 0.
- In /home/user/Service-Desk, `python3 governance/checks/surface_guard.py diff --range cd0a438..build/builder/p003-fix --branch build/builder/p003-fix` gives "OK: 3 commit(s) … checked" and exits 0. The branch tip is 9633e9a.
- Added lines containing `xit(`: 0.

## Blockers
None.

## Non-blocking notes
- **N1.** S-001's frozen wording is now narrower for decision cards. AC89 (a) state 5 says "its last read's cards, so no card ever hides" (specs/S-001.md:10081), and AC91 (c) says "counted from the last read's cards" (:10111). S-014 changes this for decision cards on a failed read (J8 :177, AC16, AC18). S-014's lineage includes S-001, so under AGENTS.md:34-35 it extends S-001, but it formally supersedes only S-009 (line 11). The definer should record a superseding note so the two specs do not read as conflicting.
- **N2.** S-014 line 11 says "No change under src/, and none to the sender (src/notify/**), is planned or allowed by this spec". Read literally, that contradicts Areas touched (:202), line 23 ("The Builder's second dispatch, the one that changes src/") and the Brief. In context it describes only the record-form change from S-009. Worth a wording fix in a later spec.
- **N3.** The operating notes' J6 check moments name only src/lib/model.js as "the rule's code" (operating-notes.md:108). J6 says "the rule's code in src/lib/" (spec :129), and the rule also depends on parsers outside model.js, for example the log and card readers. Suggest widening it to `src/lib/`.
- **N4.** The portfolio card sheet (src/public/sandbox.js:3767-3788) still shows a section-5 "Recommended" line for portfolio queue cards. These are a separate kind (`kind: 'portfolio'`, not in `<item>-<gate>-<n>` form, with no answer buttons), so J1 does not reach them. I am noting it, not finding against it.
- **N5.** The lines show only while the project reads cant-read (src/public/sandbox.js:782). During a first read still arriving, decision cards are hidden with no line. This is transient and stated in operating-notes.md:63. It is also what lets a model test see `decisionLines` that the page does not draw (j2-records).

## Open questions
1. **Builder (a):** a whole-call queue failure shows both the queue/ line and the notes line. In the `call` form the notes blobs do come back unread, so "both lines if both reads failed" (AC16) is literally true. This happens only when a notes file is in the tree. I find it acceptable. It is the owner's or design reviewer's call whether one line is preferred.
2. **Builder (b):** notes reads share the cycle's blob budget (25 per call, 6 calls). This is not a limit that stops the reads, so the Known-limits stop at :241 did not fire. At worst a very large queue spills into "Checking…" for a cycle.
3. **Builder (c):** the sheet reads "Recommended The Chief of Staff recommends <word>". That meets AC2 / R11 but reads awkwardly, and the design reviewer should judge it (join-up :192). "No Chief of Staff recommendation yet" replaces "No recommendation given" on decision cards only (src/public/sandbox.js:3714); gate cards keep "No recommendation given".
4. Should OPERATING_MODEL v2.5.1 and L-0112 be restored here, or the reviewer instructions corrected?

Probe outputs are under /tmp: /tmp/rv4-base-out/*.json (the base re-run), /tmp/rv4-built (the built copy), and /tmp/rv4-desk.log and /tmp/rv4-acc.log. I wrote no repository files.