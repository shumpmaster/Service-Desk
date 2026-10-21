# S-001 desk v2, stage 1a: the Reviewer's confirmation of the last fix, verbatim

Dispatched by the orchestrator on 2026-10-21 against origin/orch/desk-v2 at 48a49e3, by a fresh Reviewer, under the owner's answer A to P-001-desk-v2-1a-stop.

---

Verdict: PASS

**What this means for you:** The owner's ruling asked for one fix, and it is in and holds. If the board is showing a single project and that project's reads start failing, the "Being asked in your session" and "Your answer is being recorded" lines still show. Their folds still open, and "Answer it here instead" is still there. Only the two counts change, to "can't read". A project that was read earlier and is being checked again now says "checking…", not "not read yet". A project not read yet still says "not read yet". The new tests fail on the old code and pass on the new. Nothing else changed, and the build and full test suite pass. From my side, stage 1a can go to the owner as a pull request with a preview.

I checked origin/orch/desk-v2 at 48a49e3, which merges the Builder's 0b8bdb9. The change is `git diff d79d9d1 0b8bdb9`. I did not see the Builder's summary. I committed nothing and removed both of my worktrees. The `dconf-1a` worktree in the scratchpad belongs to another session, so I left it.

## The four scope items
1. **The two lines stay on the filtered view, with words for the counts: PASS.**
   - The early `return` inside `if (bd.unread)` is gone from `quietLines` in src/public/sandbox.js (now about lines 1719-1731). The unread branch adds only the small words line. The count buttons and their folds moved into the `else` branch.
   - Execution now always reaches the shared `q.asking` and `q.answerRecording` quiet lines (about lines 1739-1740), which use the same `askFold` and `ansFold` as before.
   - The new test in notify-ac77-desk.test.mjs runs each case: read, then the project goes down (`fail: network`), then two polls. Each time it asserts:
     - the small line is exactly "With the agents: can't read · Being recorded by the automatic job: can't read";
     - the line keeps its words ("Being asked in your session: 1" or "Your answer is being recorded: 1");
     - tapping the held line opens a fold containing HELD_WORDS and an "Answer it here instead" button;
     - tapping the recorded-answer line opens a fold containing RECORDING_WORDS.
2. **"checking…" only for a project read earlier in this opening: PASS.**
   - The word is picked by `DESK.states.get(only).lastSuccessAt != null`.
   - In src/lib/scheduler.js, `newProjectState` starts `lastSuccessAt: null` on every opening (line 111). It is set only on a successful read (line 1062). `states` is keyed by project name (line 154), the same name as `only`.
   - So before the first read, or before the reader exists (`DESK` null), the words stay "not read yet". "can't read" wins whenever `bd.unread === 'cant'`.
   - The round-2 test for "before the first read, every project down, only that project down" (ac80 ok 323) still passes.
   - The new ac80 test (ok 324) goes read "0 · 0", then hidden 10 minutes, then visible: "checking…", then one poll later "0 · 0".
3. **The new tests catch the defects: PASS.**
   - I copied both test files from 0b8bdb9 into my scratchpad, with their imports pointed at a d79d9d1 worktree, and ran them there:
     - finding-2 test: expected "With the agents: checking… · …", got "With the agents: not read yet · Being recorded by the automatic job: not read yet";
     - finding-1 test, held-question case: fails with "ql:asking: the line stays while the project can't be read";
     - finding-1 test, recorded-answer case (cases reversed so it runs first): fails with "ql:answerRecording: the line stays while the project can't be read".
   - The same copies pointed at the 0b8bdb9 tree: 2 of 2 pass.
4. **Nothing else changed: PASS.**
   - `git diff --stat d79d9d1 48a49e3 -- src tests governance` lists only src/public/sandbox.js (+9/−7) and the two test files, which only gain a test each at their end.
   - The merge's other 13 files are reviews/S-001-desk-v2/*-verbatim.md records.
   - The full-board branch of `quietLines` is unchanged. The filtered view with a readable project still shows the same count buttons and folds.
   - `surface_guard.py diff --range d79d9d1..0b8bdb9 --branch build/builder/desk-v2-1a`: OK, 1 commit by builder@agents.invalid with `Agent-Session:` and `Spec: S-001` trailers.

## Check output
- `npm --prefix src run build`: `build: PASS (2 connected projects; 31 page modules in step)`. The working tree was clean afterwards.
- `npm --prefix src test`: exit 0. 836 tests, 836 pass, 0 fail, 0 skipped, 0 cancelled. That is round 3's 834 plus the 2 new ones. AC14 numbers are unchanged from round 3:
  - AC80 worst case: 7982 calls, 1562 waited-read calls over 313 heads, 1802 single-file calls in the log;
  - mockup v2 worst case: 6286 calls, 0 waited-read calls;
  - AC79: 6561 calls.
- `GOV_BRANCH=orch/desk-v2 GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main`: exit 1.
  - Every check passes except `FAIL record_checks merges --base origin/main`, which has 19 violations.
  - All 19 are orchestrator commits with no Item: trailer: round 3's 16, plus 0412a26, 48a49e3 and one more from that 3-commit range. That is the expected failure on an orch/ branch before merge.

## Open questions
None within this scope.
