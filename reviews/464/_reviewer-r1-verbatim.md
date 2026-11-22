# PR #464 — the Reviewer's round 1 (FAIL, on the body's form only), verbatim

*reviewer-3, a fresh Reviewer, read-only, at the branch head 7e947fae on 2026-11-22 from about 18:04Z to 18:09Z, with the draft body. Recorded by the orchestrator. B1 and B2 were fixed in the body before the pull request was opened (the paragraph cut to 150 words, `governance_checks.py pr-body` OK on the new body; this verdict recorded before the last task was ticked); the handoff's N2 to N4 were fixed in the same commits. The re-read is reviews/464/reviewer.md.*

---

Verdict: FAIL

The fail is about the draft pull-request body only. The record, the adapter and the commits held up against everything I tried in items 1 to 4 and 6. Two things are wrong with the body. Its opening paragraph is too long, so CI's body check will go red. And it ticks a task that is not done yet. Both are text fixes to /tmp/claude-0/-home-user/028f812b-7869-5d72-8074-7ec28ff624c8/scratchpad/pr-body.md and need no change to the branch.

Checklist used: docs/archive/OPERATING_MODEL_v2.5.1.md and L-0112 are not in Service-Desk (there is no docs/archive/). Earlier reviews (reviews/341, /346, /429) hit the same gap. I used /home/user/Personal-Org-Operating-Model/docs/archive/OPERATING_MODEL_v2.5.1.md "Reviewer brief" items 1-7, plus AGENTS.md §1 and §4, CLAUDE.md and your brief.

## Blockers

**B1. The body's opening paragraph is 187 words, and CI allows 15 to 150.**
- `governance_checks.py pr-body`, run on a synthetic event made from the draft body, returns: `FAIL: pr-body: the 'What this means for you' paragraph has 187 words; it needs 15 to 150`. The limit is `PR_LEAD_WORDS = (15, 150)` in governance_checks.py at line 562.
- I then cut only the paragraph to 140 words in a /tmp copy, and the same check printed `OK: pr-body check passed`. So the heading, the `Milestone: M4` line, Context, Why and Tasks are all in form, and length is the only problem.
- Fix: shorten the paragraph by about 40 words.

**B2. The task "The Reviewer's verdict on this pull request, recorded" (body line 22) is ticked, but it is not done.**
- reviews/464/ does not exist at 7e947fae (`ls: cannot access 'reviews/464'`).
- AGENTS.md §4 says "Tick a task only when it is done", and the Reviewer checks this.
- Fix: commit reviews/464/reviewer.md before the pull request is opened, or leave the task unticked.

## Evidence per item

**1. The record is made as line 23 and J7 line 158 say: PASS.**
- I unpacked `git archive fca41700` into a /tmp folder, added the adapter from 26001c27 and the cases from origin/main (d84c607), and ran `node tests/desk/baseline/adapter.mjs <case> <out>` on all 12 cases from that folder's root on Node v22.23.5. All 12 exited 0.
- Every `results` entry is a string identical to that case's output file, and the entries are in case-id order.
- `base_commit` is fca41700eb6dbedb6a4f00ab74c28112b16fb83f and `node` is v22.23.5. All 18 `hashes` match the files in the scratch tree. The adapter's hash, 26de5d46…a657, is the one at 26001c27.
- `hashes` covers every file under tests/ the adapter reads. I traced runs of four cases with strace (desk-queue-call, open-link-log, sender-leave-return, desk-ok). The adapter opens only adapter.mjs, fake-desk.mjs, helpers.mjs, notify-helpers.mjs, sandbox-helpers.mjs, tests/desk/fixtures/config/projects.json and the case file, and all of these are hashed.
- `sha256sum` of record.json is da8ca961ff659e36a8ff6c96c32a88288ead796d911b68d366c8a0f3b6f62bfd, which is the note's `sha256:` line.
- The adapter spot-check agrees with reviewer-2:
  - The clock is fixed by `FixedDate` (adapter.mjs:135-139).
  - `lands` is `app.loc.hash` and `shows` is the sheet's text, or "" when no sheet is drawn (:325-335).

**2. `node --test tests/acceptance/` in the checkout: PASS.**
- Totals: 66 tests, 26 pass, 40 fail, 0 skipped.
- In the locked check (s009-j7-baseline.test.mjs), these subtests pass:
  - 1: the record and note
  - 2: the hashes
  - 3: coverage
  - 4: the poison run
  - 6: the AC14 sender comparison
  - 7: AC15 for an id not in queue/
- Two subtests fail, both from the missing fix:
  - 5: "S009-B-desk-notes-path: built result … differs from the record's S009-B-desk-log-path"
  - 8: "held P-106-stop-1 via notice differs from the record's S009-B-open-notice-ok"
- The other 38 failures are assertions about holding, notes and the mark, plus AC18's missing handover package (docs/handover/P-003/), which is not this pull request's work.
- No failure comes from a broken harness: there is no ERR_MODULE, TypeError, ReferenceError or SyntaxError, and every failure is a testCodeFailure or subtestsFailed.

**3. Protected paths and commit identities: PASS.**
- `git diff --name-only origin/main..HEAD -- src tests/acceptance governance` is empty.
- The builder commit 26001c27 is `builder <builder@agents.invalid>` with `Agent-Session: session_01QBwHGJWF4ev8Y9sdGjavWE/builder-7` and `Spec: S-014`. It touches one file. `surface_guard.py diff --range d84c607..26001c27 --branch build/builder/p003-adapter-r2` printed OK.
- Every other commit is `orchestrator` (4) or `chief-of-staff` (3), each with `Agent-Session: session_01QBwHGJWF4ev8Y9sdGjavWE`.
- No commit message or added line names a model. The only "claude" match is the scratch path /tmp/claude-0/… in the reviewer return.

**4. `check_all.sh . origin/main 464`: PASS. Only the two expected failures, and both are explained.**
- (a) `review_check pr 464` fails because reviews/464/owner.md and reviews/464/reviewer.md are missing.
  - The owner's verdict is required only by the skip-marker flag, and that flag is a false match.
  - The marker `"xit("` (govlib.py:971) is matched as a plain substring of added lines (review_check.py:196). In the adapter it hits `process.exit(0)` and `process.exit(1)` at lines 506 and 508. The adapter has no `xit`, `.skip` or `.only` call.
- (b) `record_checks merges` flags 7e67e51, 9063c7d, 52216e4 and 7e947fa. This is the artifact described in part 58's lessons.
  - I tested it: in a /tmp clone I made a `--no-ff` merge of 7e947fae onto d84c607, which is what the pull request's merge ref looks like.
  - `record_checks.py merges --base d84c607` there printed "1 first-parent commit(s) … OK".
- Every other check passes. The working tree was unchanged after the run.

**5. The PR body: FAIL (B1, B2). Otherwise in form and accurate.**
- The body opens with `## What this means for you`. The paragraph leads with the gap and has no paths or ids. It has `Milestone: M4` (M4 is in docs/projects/P-003.md:46), five sourced Context bullets, and a Why that quotes the rulings.
- I checked the quotes: "My answer is A" is at P-003-S-009-adapter-stop.md:14, the dispatch wording at :20, and "A: Approve the lock (Recommended)" in P-003-S-014-checks-lock.md:14. The `git diff --stat fca41700 d84c607 -- src/ tests/desk/` the body cites is empty.
- Tasks 17 to 21 are done. Task 22 is not (B2).
- The handoff's figures match what I see: 26/40/0, the record's SHA, the hashes, the steps that pass and fail, and the two check failures. One count is off (N2).

**6. Recording the direct-link cases as `#/waiting` and "": consistent with line 23.**
- Line 23 stops the build only if the Reviewer cannot confirm that every field comes from src/. reviewer-2 confirmed it, and I reproduced the bytes.
- J7 line 156 defines `lands` in general as "the desk's address once it has followed the notice or link". Its later clause "For a direct link, `lands` is the link's address" states the reading's expected value. It could only be met by the adapter writing its own input, which line 148 forbids.
- AC15 says the baseline run "records what the desk shows".
- No locked check hard-codes the "No longer waiting" sheet. A search of tests/acceptance/S-009 finds none. The checks compare built against record (s009-j7-baseline.test.mjs) or held against absent (s009-j4-views.test.mjs:58-73).
- Line 169 exempts link cases from rule (c). With both twins at `#/waiting` and "", coverage passes.
- So the build is not stuck. Putting reviewer-2's N1 to the owner as information rather than a stop is the right reading.

## Non-blocking notes

- **N1.** "Nothing failed" opens both paragraphs. It is true of the work, but the review check is red until the verdicts are in, and the pr-body check would fail as drafted (B1). A wording like "nothing in the work failed" would be more exact.
- **N2.** Handoff line 78 says record_checks merges fails on "three" orchestrator commits. At 7e947fae it flags four, because the handoff's own commit is the fourth.
- **N3.** The handoff's "What this means" paragraph (line 6) contains code (`process.exit(`), which AGENTS.md §4 keeps out of owner-facing lead paragraphs. Its heading is also not `What this means for you`. Part 58 uses the same heading, and docs/handoff/ is not the handover package (docs/handover/), so this is not a CI failure.
- **N4.** The session lines file says the session started at 17:35:00Z, but builder-7 has `started` 17:34:00Z, a minute before the session's start.
- **N5.** The adapter writes `shows: ""` when no sheet is drawn rather than failing the run. That matches "the sheet's visible text" (none), but the build should know an absent sheet and an empty sheet compare equal.

## Open questions

1. Should the owner be told in the body that B1-type form checks run only in CI, so the session runs `governance_checks.py pr-body` locally before opening? Part 59's checklist does not include it.
2. reviewer-2's N6, how `lines` is selected, is locked by the record. Does the owner or the Orchestrator want that stated in the body as a known limit?
3. The skip-marker false match on `process.exit(` should be raised as an improvement-register item, as the handoff's lessons suggest. Where should it be filed?

## Six-part contract

- **Changed:** nothing in /home/user/Service-Desk (git status unchanged). My scratch files are only in /tmp/claude-0/-home-user/028f812b-7869-5d72-8074-7ec28ff624c8/scratchpad/r3: the base tree, outputs, strace logs, acc.txt, ca.txt, event.json and event2.json, and the merge-ref clone.
- **Why:** to review pull request #464 (P-003, S-014) against line 23 and J7.
- **Verified:** the commands and outputs are listed under each item above.
- **Undone:** I did not run the desk's full unit suite. I did not repeat reviewer-2's full reading; I spot-checked it as asked.
- **Needed outside my surface:** shorten the body's paragraph (B1); record reviews/464/reviewer.md before opening, or untick task 22 (B2); the owner's verdict at reviews/464/owner.md.
- **Open questions:** listed above.

Files:
- /home/user/Service-Desk/reviews/S-009/baseline/record.json
- /home/user/Service-Desk/reviews/S-009/baseline/note.md
- /home/user/Service-Desk/tests/desk/baseline/adapter.mjs
- /home/user/Service-Desk/docs/handoff/2026-11-22-chief-of-staff-p002-59.md
- /tmp/claude-0/-home-user/028f812b-7869-5d72-8074-7ec28ff624c8/scratchpad/pr-body.md