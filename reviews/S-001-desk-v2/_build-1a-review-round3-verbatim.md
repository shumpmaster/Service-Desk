# S-001 desk v2, stage 1a: the Reviewer's round-3 build review, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/orch/desk-v2 at f535529, by a fresh Reviewer. A FAIL at round 3 goes to the owner under the stop rule.

---

Verdict: FAIL

**What this means for you:** I checked all three round-2 problems and each is fixed. Filtered to a project the desk hasn't read, or can't read, the line under the lanes now says "not read yet" or "can't read" instead of 0. The busy-day budget test now runs each worst case in full, and both stay under 10,000 calls (7,982 and 6,286). Storage that reads but refuses writes now makes no waited reads. One new problem comes from this round's own fix, so stage 1a can't land yet. When the board shows one project and that project can't be read, the "Being asked in your session: 1" line disappears. The full board still shows it, and before this round the filtered view did too. The fix is small and local. Nothing else regressed. No secrets, no new outside sites, no wider access.

Reviewed: origin/orch/desk-v2 at f535529 (it merges d79d9d1). Round-3 change: `git diff 97c55c5 d79d9d1` (src/lib/scheduler.js and its public copy, src/public/sandbox.js, 3 test files). The spec is as e671cbd has it. I did not see the Builder's summary. Both scratch worktrees are removed and I committed nothing.

## Commands run
- `npm --prefix src run build`: `build: PASS (2 connected projects; 31 page modules in step)`. The working tree was clean afterwards.
- `npm --prefix src test`: 834 tests, 834 pass, 0 fail, 0 skipped. AC14 diagnostics:
  - `AC80 worst case: 7982 calls, 1562 waited-read calls (reader) over 313 heads, 1802 single-file calls in the log, 288 head changes, 100 ledger changes`
  - `mockup v2 worst case: 6286 calls, 838 verdict calls over 538 heads an opening, 0 waited-read calls, the most blob calls in a cycle 10, 288 head changes`
  - `AC80 worst case, storage throwing: 6460 calls, 0 waited-read calls`
  - AC79: 6561 calls.
- `GOV_BRANCH=orch/desk-v2 GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main`: exit 1. Every check passes except `record_checks merges`. Its 16 violations are orchestrator commits with no Item: trailer (13 in round 2; the 3 new ones are 4eb2904, 08a0dd3 and f535529). That is the expected orch/ failure.
- `python3 governance/checks/review_check.py pr 999 --base origin/main --files-from <(git diff --name-only origin/main...HEAD)`: R1. Required reviews: design-reviewer, owner and reviewer; 3 verdicts missing, as expected. Its only flag is unchanged from round 2: `tests/desk/ac53-answer-boxes.test.mjs: assertion count fell from 103 to 92 — needs the owner's verdict`.
- `python3 governance/checks/surface_guard.py diff --range 97c55c5..d79d9d1 --branch build/builder/desk-v2-1a`: OK, 1 commit. It is by builder@agents.invalid, with Agent-Session and Spec: S-001 trailers.
- Assertion counts, 97c55c5 → d79d9d1: ac14-budget 47 → 57, ac80-board 221 → 229, j22-desk-reads 46 → 48. No test skipped. The two removed ac14 tests ("one combined day" and its storage-throwing run) are replaced by the three per-worst-case tests.
- Each new test against the round-2 code: I copied it into my scratchpad with its imports pointed at a 97c55c5 worktree. Both fail there:
  - N1: expected "…not read yet…", got "With the agents: 0 · …: 0";
  - N3: expected 0 waited reads, got 3.
  So each test catches the defect it was written for.

## Round-2 findings
**N1 / F3-r2 (a count for an unknown on the filtered board's small line): FIXED.**
- src/public/sandbox.js:1719-1725: when `bd.unread` is set, the line is "With the agents: not read yet · Being recorded by the automatic job: not read yet", or the same with "can't read". It has no buttons and no fold.
- `bd.unread` comes from the filtered set only (sandbox.js:1444-1447).
- Tested in ac80-board.test.mjs, last test: before the first read, with every project down, and with only that project down. In each, the quiet line and lanes have no digit, no "0" and no "Nothing here". Real counts come back once the project is read, and on switching to the readable project.
- My own probe agrees: before the read, "not read yet"; after a read, "0 · 0"; after a failure, "can't read".

**N2 (AC14's worst cases each at full in AC79's day, with the call log's own count): FIXED.**
- tests/desk/ac14-budget.test.mjs:413 runs `combinedDay({ worst })`:
  - `'waited'`: `WAITED = [31..35]`, every head of all 5 pull requests in each project, J20 failing all day; 313 heads, the test asserts > 250.
  - `'verdicts'`: all 5 with verdict files read, with #34's verdict blob failing in each project. The test asserts `waited === 0`, okV > 200 and badV > 40.
  - The storage-throwing run now uses the full `'waited'` case.
- The call log's count is back:
  - `soloLog` counts single-file blob calls per opening, project and head, taken from the request (ac14:478-484).
  - For each opening and project, the reader's count must be ≤ the log, and the extra calls ≤ J20's own 5-minute retries over the time the head was open.
  - Over the day, each head's single-file calls beyond those retries must be ≤ 5.
- Measured: 1,802 single-file calls in the log against the reader's 1,562. The 240 extra are J20's own retries.
- Note, not a finding: the verdicts case has one failing verdict blob a project. AC14 asks only that "a failing verdict blob" fail only its own head's call. Round 2 measured all verdict blobs failing at 8,117 calls, still under 10,000.

**N3 (storage that reads but refuses writes makes no waited read): FIXED.**
- src/lib/scheduler.js:177: `saveWaits()` writes once at the opening, so a store refusing writes sets `waitsKept = false` before any waited read is decided.
- scheduler.js:930: `if (!waitsKept) return;` after `usePoll`, so a write that fails later in the day also stops the call.
- src/lib/store.js:40-49: `setJSON` returns false when `setItem` throws, so the check does fire.
- src/public/lib/scheduler.js is identical to src/lib/scheduler.js (`diff` shows no difference).
- Tested in j22-desk-reads.test.mjs, last test: 3 openings, `refuseWrites`, 0 waited reads in each, and nothing written.

**Rounds 1 and 2: no regression found** apart from new finding 1 below.
- The full suite passes, including the rule-7 kept-verdict, owner-check retry, page-level AC80, F1/F2 type and old-screen tests.
- ac80-board.test.mjs only gained a test at its end; earlier tests are unchanged.

## New findings

**1. BLOCKING: on the filtered board, the round-3 early return hides the "Being asked in your session" and "Your answer is being recorded" lines while the project can't be read (AC80, "shown only when it has any"; this is a regression from round 2).**
- Where: src/public/sandbox.js:1724, `return h('div', { class: 'v2-quiet under', … }, lines);` inside `if (bd.unread)`. It returns before :1733-1734, which add the `asking` and `answerRecording` quiet lines. The full-board branch has no such return.
- Reproducing case: a scratch probe using the fixtures from tests/desk/notify-ac77-desk.test.mjs ("AC77 + AC80 in the sandbox", the held question P-001-next-work.md with its real session), at `#/waiting/Service-Desk`.
  - After a read: `With the agents: 0 · Being recorded by the automatic job: 0` + `Being asked in your session: 1`.
  - Then Service-Desk's reads fail (`fail: network`), one poll later: `With the agents: can't read · Being recorded by the automatic job: can't read`. The held line is gone.
  - Same state, `#/waiting` (full board): `Nothing waiting: Personal-Org-Operating-Model` + `Can't read Service-Desk since 06:38` + `Being asked in your session: 1`.
  - The same probe on 97c55c5: the filtered view kept `Being asked in your session: 1` after the failure.
- Why it blocks:
  - The held question needs the owner. Its fold carries "Answer it here instead", the only way to make it a card on the desk.
  - It disappears from the view that the project screens' "Waiting" link, the Status screen's queue button and Home's pill open (AC80/AC81, "until stage 3").
  - The lanes in that same state still show the last read's cards (e.g. "Waiting on you 6"), so only these lines are dropped.
- The new N1 test can't catch this: its fixtures have no held question or recorded answer.
- Suggested scope: only the two counts need the unknown words. The `asking` and `answerRecording` lines should still follow.

**2. Non-blocking: just after a read project comes back to view, the filtered line briefly says "not read yet".**
- `readState` (src/lib/universe.js:15-30) returns `'checking'` for a project read earlier in the opening, in two cases:
  - its last success is over 3 minutes old and the tab just became visible;
  - a later cycle ran out of calls (`outcome.pending`, scheduler.js:1065-1069).
- `view.unread` then becomes `'pending'`, and the small line reads "With the agents: not read yet · …" beside lanes full of cards. Per finding 1, the held and recorded-answer lines drop in this state too.
- Probe: one project, read, hidden 10 minutes, made visible. The line said "not read yet" until the next read finished, then "0 · 0". The lanes showed 6 cards throughout.
- "Not read yet" is not true of a project that was read. "Checking…" would be. The pending-outcome case can last more than one poll.

**3. Non-blocking, for the design reviewer or Definer: in the "can't read" state after a read, the filtered view mixes known and unknown figures.**
- The small line refuses counts, while the lanes still show the last read's cards and counts ("Waiting on you 6").
- There is still no "since HH:MM" in the filtered view. This was already noted in round 2's design follow-ups.

## Security
- The round-3 src diff adds no URL, fetch, token, `innerHTML` or eval.
- The new line is plain text from constant words.
- No change to index.html, src/functions or src/config.

## Open questions
1. Finding 2: should a project read earlier in the opening, now re-checking, say "checking…" (AC5's word) rather than "not read yet" in the filtered line? The lanes' own "Not read yet" for an empty lane has the same cause, from round 2.
2. N4 and N5 and the design open questions stay deferred to the Definer, as directed. None of them hides an owner item or makes a record untrue as far as I found.
