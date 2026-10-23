Verdict: PASS

Stage 1 of the after-MD3 plan (M3D), commit e19ae0a on 433c612, reviewed over 433c612..e19ae0a. There are no blocking findings. A project the desk can't read now says so, with the right time for each cause. Nothing unread reads as read. The page says so when the desk's code fails to load. Every on-screen word I checked comes from the spec. Every other screen is unchanged. The guard's new exception is as narrow as the change. All 26 mutations I tried were caught.

## Blocking findings
None.

## What I checked
1. **AC89 (a), the five-state table.**
   - **Which state applies:** `oneProjectView` (src/lib/board.js:74-90) takes the state from main's `readState` (src/lib/universe.js:13-31).
   - **Whether a read has succeeded in this opening:** this comes from the scheduler's `lastSuccessAt`. That starts as null and is set only on a success in this desk object (scheduler.js:126, 256, 1301), and `openedAt` is the desk's creation time (:243). So it means "a read succeeded in this opening".
   - **Routine polls:** `checking` is set only when a cycle's reads are still arriving (:1303-1310), so a routine poll leaves a project fresh, and its counts never blink.
   - **Words:** each is the table's, and "Not read in this opening" and "Nothing here when last read" are marked C in the spec.
   - **"HH:MM":** it is readState's `since`, in `ownerTimeZone`. For a failure that is `failure.since`; for the 3-minute cause it is the last success, or the opening's start.
   - **Unread states:** states 1 and 2 hide the lane counts and the small line.
   - **A count of 0** is plain words, not a button (sandbox.js:2085).
2. **(b), the deploy sheet.** Its words are AC89 (b)'s, word for word. "The run on GitHub" opens `f.link`, which is the run's URL (model.js:514).
3. **(c), the waits row.**
   - `shortName` gives the spec's names for every card kind, ids in Plex Mono.
   - The row is cut at two lines, and measured by `measureClips` through `data-clip`.
   - The fade ends in `--bg`, which is right: the row has no ground of its own.
4. **(h), nothing unread reads as read.**
   - "Phases: not available" for a project that can't be read.
   - "not read" when no tree has been read.
   - An unread v2.5 project's last action is "not available".
   - The cap and versions rows say "can't be read since HH:MM" alike, with the time already in `ownerTimeZone` (sandbox.js:963).
   - The held-question fold's record is in AC81's roles.
   - **Load failure:** `startDesk` shows "The desk couldn't load. Reload to try again." in the view and the state line, hides the footer, and never shows "Quiet". `boot()` is the last thing `startSandbox` does, so no poll can start before a throw.
5. **Other screens are unchanged.** I drew all 315 screens from four fixtures at 433c612 and at e19ae0a, and only 30 differ:
   - filtered Waiting (a count of 0 as words);
   - the project pages and their Details views (the waits row's short names).

   No other words, layout, fonts or colours moved.
6. **Rewritten tests.** I judged each against its cited line, and each still asserts its criterion, with at least as much as before. "AC72's cases kept" holds.
   - ac80-board:300 and :913-966 (AC89 (a), states 1 and 2, and a 0 as words);
   - ac83-page:186-189 (AC89 (c));
   - notify-ac77-desk:515-538 (state 5).
7. **Mutations, 26 of 26 caught.**

   On the state logic:
   - state 5 drawn as state 2;
   - "HH:MM" taken from the last success;
   - state 4's counts shown as read;
   - state 5's empty-lane words;
   - a 0 back as a button;
   - a start error escaping `startDesk`;
   - state 2 saying "Checking…";
   - state 4 hiding its last read's cards;
   - the reason dropped from the can't-read line.

   On the words and names:
   - record notes always "not found";
   - the v2.5 last action;
   - "Phases: reading…" kept;
   - the deploy link and its "why";
   - a question named by its title;
   - a gate named without its phase;
   - ids not in Plex Mono;
   - the cap and versions rows dropping "can't be read".

   On the stylesheet and the guard exception:
   - the fold's heading role removed;
   - the waits row cut at three lines instead of two;
   - other page rows' small lines changed;
   - a padding or a colour added to the waits row;
   - the waits row's rule removed, which fails the guard's "exception was met" check;
   - its fade ending in `--card`.

## Commands run
- Full suite: 1074 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 433c612`: "OK: all governance checks passed."
- `surface_guard.py diff --range 433c612..e19ae0a --branch build/builder/m3d-1`: "OK: 1 commit(s) … checked".
- `review_check.py pr 999 --base 433c612`: risk class R1; needs design-reviewer and reviewer. Its only violations are the two missing verdict files, and there is no test-weakening flag.
- e19ae0a is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **`startDesk` hides the error's details.** It catches errors and drops them without logging (src/lib/page.js:84-91). The owner still sees that something failed, so nothing reads as fine. But a real bug thrown while the desk starts now leaves no trace in the console, where before it did, and it is reported as "couldn't load". Adding `console.error(err)` in the catch would keep the cause.
2. **The guard can't see the held-question fold change.** Its record only exists once the fold is opened, so the stage-8 guard never sees it. AC89's own case checks those rules directly (ac89:454-482). Item 37's walk of more states, in stage 8, would close this gap.
3. **Two can't-read lines differ.** The one-project line reads "Can't read <project> since HH:MM: <reason>", as AC89 (a) asks. The full board's line (sandbox.js:2110) still gives no reason. The table says "as Home's briefing and the full board say it", so the two now differ slightly.
4. **A fallback with no spec words.** If a card ever lacks its data, the waits row falls back to its kind word (sandbox.js:1155), which the spec doesn't give. Every card kind the board builds has its name, so I found no way to reach it.

## Open questions
None.

The worktree and copies are removed. Two things outside the review:
- Other checkouts sit in the scratchpad that I didn't make: m3d-base (433c612), m3d1-wt (e19ae0a), m3d1, m3d-h and m3d-1-shots. I left them as they were. I did read m3d-base, read-only, as my 433c612 baseline, after confirming it was a clean checkout of that commit.
- One clean-up command was blocked by a safety check before it ran. I re-ran it with guarded paths, and the copies were rebuilt clean.

My scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/ (mutate8.py, sandbox-dump2.mjs).
(Recorded verbatim by the orchestrator from reviews/M3D/_stage-1-review-r1-verbatim.md.)
