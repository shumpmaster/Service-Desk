# S-001 desk v2, stage 1a: the Reviewer's round-2 build review, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/orch/desk-v2 at 1c4d4f8, by a fresh Reviewer.

---

Verdict: FAIL

**What this means for you:** almost every round-1 finding is now fixed. Two things still stop stage 1a from landing. First, if you filter the board to a project the desk hasn't read yet, or can't read, the line under the lanes says "With the agents: 0 · Being recorded by the automatic job: 0". That is a zero standing for something unknown. Second, the busy-day budget test was combined into one day, but that day runs a lighter load than the spec names: only 3 of every 5 pull requests have their file read failing. So the test doesn't show the budget holds in the spec's own worst case. I ran the full worst cases separately: the desk stays well under 10,000 calls (7,982 and 8,117). So the second fix is to the test only. No secrets, no new outside sites, no wider access. The old screens look exactly as before.

Reviewed: origin/orch/desk-v2 at 1c4d4f8. The round-2 change is `git diff f7b3184 97c55c5`, and the spec is as e671cbd reads. I did not see the Builder's summary. The scratch worktree has been removed.

## Commands run
- `npm --prefix src run build`: `build: PASS (2 connected projects; 31 page modules in step)`.
- `npm --prefix src test`: 831 tests, 831 pass, 0 fail, 0 skipped. AC14 diagnostics:
  - `combined day: 7797 calls, 937 waited-read calls over 188 waited heads, 515 verdict calls, most blob calls in a cycle 7, 288 head changes, 100 ledger changes`
  - `storage throwing: 7073 calls, 0 waited-read calls`
- `GOV_BRANCH=orch/desk-v2 GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main`: exit 1. Every check passes except `record_checks merges`: 13 orchestrator commits have no Item: trailer. That is the known orch/ failure you expected.
- `python3 governance/checks/review_check.py pr 999 --base origin/main --files-from <(git diff --name-only origin/main...HEAD)`: R1; required reviews design-reviewer, owner and reviewer; 3 verdicts missing, as expected. Its only flag: `tests/desk/ac53-answer-boxes.test.mjs: assertion count fell from 103 to 92 — needs the owner's verdict`. Round 1 had 91; one assertion was restored.
- `python3 governance/checks/surface_guard.py diff --range f790dc9..97c55c5 --branch build/builder/desk-v2-1a`: OK, 1 commit. The commit is the builder's, with Agent-Session and Spec trailers.
- No test was skipped or deleted. Assertion counts in the round-2 test files, f7b3184 → 97c55c5:
  - ac14: 48 → 47 (see finding N2)
  - ac53: 89 → 90
  - ac80: 181 → 221
  - ac81: 54 → 71
  - j22-board-rules: 79 → 85
  - j22-desk-reads: 32 → 46
  - the others unchanged

## Round-1 findings: Reviewer
1. **Rule 7 losing the owner's verdict across heads: FIXED.**
   - src/lib/j22.js:540-542: `own` falls back to `last.own` while the new head's list is unread, and is kept only when it is on the branch.
   - Tested in tests/desk/j22-board-rules.test.mjs, the last test. It uses the real 304144d risk-paths file and an R3 `.claude/agents/x.md` change. With the owner's PASS, head B (unread, or with a list from the old head) gives `merge`, twoStep 2 and the step 2 note. Head C is kept too. FAIL stays "Open ↗".
   - By reading: GitHub's owner check at B saying "Owner verdict needed" (rule 3) can't override the kept PASS, because rule 1's branch verdict comes first. That matches what a fresh read gives.
2. **"✕ <n> check failing": SETTLED and FIXED as settled.**
   - `failing` is gone from src/lib/board.js:194/212, and so is the card line (src/public/sandbox.js:1629).
   - The sheet has "Its own checks: not read by the desk; its GitHub page shows them" under "What was checked" (sandbox.js:1882-1885). There is a test (ac80-board.test.mjs, finding-2 test).
3. **AC14's budget: PARTLY FIXED; see N2 and N4.**
   - Fixed: the 5 polls a head are kept under `desk-board-waits-v1` (src/lib/scheduler.js:155-176, 837-858). Entries are pruned after a successful open-list read (:1034). With storage throwing there are no waited reads (:917).
   - Per-head bound verified: with every J20 read failing, the reader's count peaks at 5 a head and 1,562 waited calls ≤ 5 × 313 heads.
   - Not fixed: the combined day doesn't run the spec's worst cases (N2).
4. **Owner-check retry after `false`: FIXED.**
   - src/lib/scheduler.js:799-804: the head keeps its place, because the filter runs after `ownerCheckHeads` slices to 3.
   - Asked again at the first poll ≥ `FILES_RETRY_MS` later (:822). A 304 or a 200 ends the wait (:820, :827). Entries for heads no longer open are pruned (:816).
   - Tested in j22-desk-reads.test.mjs: no fourth head takes the place, not asked sooner, no call of its own.
5. **ac53 assertion drop: non-blocking as before.** 103 → 92 with the accessible-name assertion restored (ac53:220). The estimate-merge `includes()` is back to an anchored regex (j12-ac60-ac66:217).
6. **Page-level AC80 cases: FIXED.** New page tests in ac80-board.test.mjs cover:
   - FAIL, "Owner: after agents" and unread, each with the badge, lane, Home and tile counts;
   - rule 0 not kept across heads;
   - a marked "Merge ↗" card going to the agents and back.
7. **Critic line: SETTLED as stage 1a's wording.** Tested with the Critic's file in the tree and without.

## Round-1 findings: Design reviewer
- **F1 (resets out-ranking v2 classes): FIXED.**
  - sandbox.css:819-823 now uses `:where(.v2) …`.
  - Measured in Chromium at 360 px:
    - `button.v2-grp` 500 11px;
    - `.v2-step` 500 11px, per settled point 5;
    - gate buttons 500 11px, 26 px tall;
    - "Done ✓" 67×36 on --chip, padding 0 12px, radius 18;
    - "Close" 55×36 with padding;
    - `.v2-x44` 44×44 on the --chip circle.
  - Frame 2's filtered line is now one `<p>` with two `.v2-qs` buttons and " · " (sandbox.js:1711-1722).
- **F2 (19.5 px heading): FIXED.**
  - `.v2-sheet .sb-record :is(h1…h6) { font: var(--t-row) }` (css:951).
  - With every fold open, no text in the question sheet is off the scale.
  - The sandbox marker is now 500 11px (css:954), per settled point 6.
- **F3 (zero for an unknown): PARTLY FIXED; see N1.** The lanes now say "Not read yet" / "Can't read" with no count (sandbox.js:1444-1447, 1676-1680), but the filtered quiet line still shows 0.
- **Design open question 1:** settled as 500 11px and built that way.

## The `:where()` lowering of the old resets
I rendered every old screen in Chromium with the round-1 sandbox.css and with the round-2 one, and compared 12 computed properties on every element outside `.v2`. The screens: Home, Service-Desk's Status, Timeline, Team and Asked, Alpha's Status and Timeline, and Plan.
- Result: 0 differences on all of them (for example, Status: 330 elements, 0 differ).
- `html.sb a:where(:not(.v2 *))` keeps the old specificity (0,1,2).
- Only elements inside `.v2` changed. The bar's and top row's non-current tabs went from --ink to --ink2. Round 1 had them wrong (the old `html.sb a` reset beat `.v2-tab`); --ink2 now matches desk-v2.html:187 and :229.

## New findings

**N1. BLOCKING: filtered to an unread project, the quiet line still shows "0" for an unknown (Part A item 5; the rest of F3).**
- Where: src/public/sandbox.js:1719-1720 draws `${q.agents.length}` and `${q.recording.length}` whatever the read state; `bd.unread` is only consulted in `laneNode` (:1676).
- Reproduced with `loadSandbox`, projects Alpha and Beta, `#/waiting/Alpha`:
  - before the first read: lanes "Not read yet", quiet line `With the agents: 0 · Being recorded by the automatic job: 0`;
  - with Alpha's reads failing (`fail: network`): lanes "Can't read", the same zeros.
- The F3 test (ac80-board.test.mjs, last test) checks only `.v2-lanes`, so it can't catch this.

**N2. BLOCKING: AC14's combined day runs neither of the worst cases AC14 names, so its "< 10,000" doesn't bound the day A3 counts. The round-1 cases were reduced to make it.**
- What AC14 says (specs/S-001.md:2488-2499, 2509-2517):
  - "a mark on each of the 288 pull request heads with its J20 read failing all day";
  - "5 open pull requests a project, each with verdict files on its branch".
  - Each is to run in AC79's day.
- What the test does: tests/desk/ac14-budget.test.mjs:412 sets `WAITED = [31, 33, 35]`. Only 3 of 5 pull requests a project have J20 failing (188 of 313 heads). Only the other 2 have their verdict files read. One verdict blob fails (#34).
- What round 1 had: case 1 with every head's J20 failing, and case 2 with all 5 read.
- The day-wide check is now the reader's own count (`j.headPolls`) plus a total, `d.waited <= 5 × heads`. Round 1 also counted waited calls independently from the call log, per opening.
- On A3's wording: the Builder's "one head change moves one PR's head, 288 heads" matches A3. A3 has "three open pull requests changing heads every 10 minutes … 3 × 6 × 16 = 288 head changes" and "AC79's heads: 288 × 3 = 864" (S-001.md:12976-12979, 13019-13025).
  - But the existing AC79 test moves all 5 heads of a project at each change (`gens[p.name] += 1`, ac14:258/327). So the combined day is lighter than "AC79's case itself" as that test runs it.
  - A3's 9,355 and 9,817 add worst cases that can't happen together: a head whose J20 read fails has no verdict read. So no single run reaches A3's sum. The test can only run each worst case at full, and it now runs neither.
- Measured with a scratch copy of the test (`/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/var/ac14-var.mjs`):

| Variant | Calls | Waited calls | Verdict calls |
|---|---|---|---|
| All 5 failing J20 | 7,982 | 1,562 (max 5 a head) | 0 |
| All verdicts failing | 8,117 | 937 | 835 (max 7 a head for the day) |

- So the code holds the budget. Fix: in the test, run the combined day once per worst case.

**N3. Non-blocking: storage that reads but refuses writes (quota full, some private modes) still makes waited reads at every opening.**
- Where: src/lib/scheduler.js:162 sets `waitsKept` from `usable` after a read. `usePoll` (:841-848) turns it off only when the first write fails, after the call is decided. The `waitedPhase` loop (:918-930) doesn't check it again.
- Probe (`/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/var/writefail.test.mjs`): `getItem` → null, `setItem` throws, 3 waited heads, 3 openings → 3 waited-read calls in each opening.
- AC80 says "When local storage can't be read or written, no waited read is made at all". The cost is small (at most one a head an opening), but it's against the letter. The storage-throwing test uses a store that refuses reads too, so it can't see this.
- Also by reading: two windows open at once on one device each write their whole `waits` object, so one window's counts can overwrite the other's.

**N4. Non-blocking, for the Definer: A3's arithmetic.**
- (a) A3's 1,440 counts 288 heads. AC14's day also has the 25 heads open at its start (5 a project). Measured: 1,562 waited calls with every J20 read failing, about 125 over A3's line, which uses 125 of the 183 to spare. Still under 10,000.
- (b) With storage throwing, verdict-call retries are bounded per opening only. AC80 keeps only the waited reads out. Measured: up to 12 verdict calls a head for the day against A3's "share the head's 5 … however many openings". The day was 7,534 calls.

**N5. Non-blocking: a partly read board still shows a lane's 0 / "Nothing here" with an unread project in it.**
- Reproduced: Alpha can't be read, Beta is read → "Kicked back 0 · Nothing here", with "Can't read Alpha since 10:00" above the lanes.
- AC80 allows this (its "Can't read" line, C), so it's not counted as a defect. Open question for the design reviewer: does item 5 accept it?

## Security
- The round-2 src diff adds no URL, fetch, token, `innerHTML` or eval.
- No change to index.html, src/functions or src/config.
- The new storage key holds only pull request numbers, head shas and counts.

## Open questions
1. N2: is "one combined day" meant as one run per worst case, each in AC79's day (my reading of "Each of these"), or a single mixed run? If the latter, the Definer should say which mix bounds A3's sum.
2. N4(a)/(b): should A3 count the heads open at the day's start, and the verdict retries without storage?
3. The Chromium checks at 360 × 740 and 414 × 896, light and dark, belong to the design reviewer's round 2. I checked only the computed styles quoted above.
