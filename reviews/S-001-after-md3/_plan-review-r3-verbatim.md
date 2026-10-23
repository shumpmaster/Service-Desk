# S-001 after MD3: the plan Reviewer's round 3, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/definer/s001-after-md3 at 201853b.

---

Verdict: PASS

Draft 3 fixes my round-2 blocking point and all six of my notes, and checked against main's code each fix holds. The one-project table for Waiting now follows the desk's real read states, so the counts no longer blink "checking…" during the routine poll every minute. The Critic's point that every row on a lane names its lane is planned for stage 4, and it is buildable. The owner is now told of the two limits. Nothing in this draft blocks it. The only check failure is the trace check, which clears once #202 merges.

**Checks (worktree /home/user/sd-def-md3-after, 201853b, by `definer <definer@agents.invalid>`)**
- `bash governance/checks/check_all.sh . origin/main`: the only FAIL is `v3_checks trace`, "specs/S-001.md names M3D, not in docs/PROJECT.md section 3". This is expected until #202 merges.
- Judged against #202: in a detached scratch worktree I merged 201853b into `cos/after-md3-answers` at b3d751c (clean merge). There, check_all reports "OK: all governance checks passed." The scratch worktree is removed.
- `python3 governance/checks/surface_guard.py diff --range origin/main..201853b --branch build/definer/s001-after-md3`: "OK: 4 commit(s) … checked" (exit 0).

## Each fix, checked against main

**R2-B1 (AC89 (a)'s table): resolved.**
- The three states are now main's own, from `readState` (src/lib/universe.js:13-31):
  - "fresh" is its `ok` branch;
  - "not fresh" is its `checking` branches, including reads still arriving over several cycles (src/lib/scheduler.js:1303-1308);
  - "can't be read" is a failure, or the 3-minute `stale` cause.
- A routine poll in flight leaves `lastSuccessAt` under 3 minutes old, so it stays row 3 and its counts keep their numbers.
- Row 4's "checking…" counts match src/public/sandbox.js:2070-2076. Main tests `lastSuccessAt != null`, which is the same as "in this opening", because `openedAt` is set once at page load (scheduler.js:243).
- "HH:MM" now has a rule for each cause, and both match main:
  - a failed read uses `failure.since`, kept across a run of failures (scheduler.js:821);
  - the 3-minute cause uses the last success in this opening, or the opening's start (universe.js:18-20, :26-28).
- The test list covers the poll-in-flight case, the page back in view after a while, row 1 moving to row 2, and row 5.

**The Critic's point: every row on a lane names its lane. Resolved, and buildable.**
- Pipeline logs already do this: a lane row's lane is `e.item` (src/lib/sandbox.js:1317), and every `entryWords` form begins with the item (src/lib/records.js:586-611).
- The Chief of Staff's log does not today: its helper rows and "Handed back" row carry no piece name (src/lib/sandbox.js:1385-1387), and the lane label is `<session> line <n>` (:1383).
- The planned " · <doing>" suffix, and its test, can be built from data the page already holds (`x.start.doing`).

**My round-2 notes 1 to 6: resolved.**
1. **The cap of 10 a day:**
   - the owner is told about the 11th mark in the opening paragraph and in the case for M3D's gate;
   - with no device storage, no extra read is made;
   - each further device can add 10;
   - "the 48 to spare cover up to four more devices" adds up: 9,952 + 40 = 9,992, under 10,000.
2. **The lane rule** now says "the first look … no lane still open where it starts is using", and a fifth lane open at once takes `--ink` solid. It is the same search `branchLayout` already makes for places across (src/lib/sandbox.js:1434-1450), so it is buildable and testable.
3. **AC69** now cites :128 `.sb-ic.i-you`, drawn at sandbox.js:417 and :2914. "Your last action" has `border: 0` (sandbox.css:901), as the draft now says.
4. **The opening paragraph** is fixed. It states five lanes open at once, and that every row names its lane.
5. **"Draft 1"** is now right in the milestone note.
6. **The four answered questions:** I compared each question as put, each option as put and each ruling's first line with the records on `cos/after-md3-answers`. All four match word for word.

**Five lanes at once (my note 7):** M3D's gate case now says the limit holds "while at most four are open at once", as the owner was told.

**Nothing that needs the owner is decided silently.** Each choice the draft makes itself is marked C:
- "Not read in this opening";
- "Nothing here when last read";
- the suffix cut at one line;
- the fifth lane's look.

The two limits that narrow what the owner was promised (the 11th mark, and five lanes open at once) are now told to the owner.

## Non-blocking notes
1. "Question 4 was put by the Orchestrator": it was also filed first, as questions/P-001-lanes-alike.md in #201, as its record says. "Filed in #201" would be more exact.
2. With five lanes open at once, the fifth (`--ink` solid) sits beside the first in the same look. That is as stated and accepted. The stage 4 review should check that the made-up five-lane log shows exactly that and nothing worse.

## Open questions
- None.
