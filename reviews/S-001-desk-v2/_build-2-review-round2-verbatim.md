# S-001 desk v2, stage 2 (Home): the Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/desk-v2-2 at 5764229.

---

Verdict: PASS

**What this means for you.** All three blocking problems from round 1 are fixed, and each fix has a test that fails if the fix is undone. A tile now says "no estimate yet" only when no estimate was filed. Otherwise it gives Plan's own reason. The commits read no longer makes GitHub calls of its own. The fork case is now really tested. The five rules that had no test now have one, and both test-weakening notes are dealt with. The full suite passes (908 of 908), and the build and governance checks pass. Nothing new breaks the spec. What is left is three small missing tests, one wrong line that shows only if the code crashes, and some wording questions for Define. None of these blocks the merge.

## Checks run (scratch worktree at 5764229, now removed)
- Full suite (`cd src && node --test ../tests/desk/*.test.mjs`): 908 tests, 908 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 32 page modules in step)".
- `bash governance/checks/check_all.sh . 5a7e55a`: "OK: all governance checks passed."
- `python3 governance/checks/surface_guard.py diff --range 5a7e55a..5764229 --branch build/builder/desk-v2-2`: "OK: 7 commit(s) … checked".
- `python3 governance/checks/review_check.py pr 999 --base 5a7e55a`: fails only on the three missing verdict files (design-reviewer, owner, reviewer). The owner's file is needed because of the flag "ac54-home … 186 to 174". This is expected before review.
- The branch tip is still 5764229.

## Round-1 findings
**B1 (tile "no estimate yet"): fixed.**
- `src/lib/home.js:558-571`: "no estimate yet" is used only when `row.estimate.kind === 'missing'`. When AC24 marks the finish "not available" for some other reason, the tile shows "rough finish: <AC24's words>". When there is no finish at all, it shows "rough finish: not available".
- Probe p4-past, at 30 days: the tile reads "Next: MD1 · rough finish: not available: MD1 is past its estimate", and Plan says the same. On the same day it reads "rough finish 20 Oct – 21 Oct".
- New tests in ac82-home cover each case: past its estimate, estimates read failing, an earlier milestone with no estimate, and no estimates file at all.
- Mutations B1a, B1b and B1c (old words back, the "missing" check dropped, the reason dropped) are each caught.

**B2 (commits read making a call of its own): fixed.**
- `src/lib/scheduler.js:418-425` adds a `wait` list. This is a first read with no J20 read of the same head to ride, either due now or asked in this cycle. At line 1077 the wait list goes only into the room left in a call that is made anyway, as retries do.
- Probe p1-alone: no blob call after the comment, and `alone` = 0.
- The new J24 test at j24-since:300 checks both halves: no call while nothing else is due, then the read rides the next call that is made anyway.
- Mutations B2a (wait treated as first) and B2b (wait never asked) are caught. M10 and M16 are still caught.
- My reading of the spec: J24 says the read "rides in the blob call that makes J20's read of the same head", and "a cycle with nothing else to read makes no call for it". The fix follows both. Waiting loses nothing here, because the head did not change, so there are no new commits.

**B3 (fork case): fixed.**
- New reader test at j24-since:330. Fork pull request #82 has commits available to read and is updated after "last looked". No commits are asked for it, while #81 beside it is read.
- Mutation M1 (drop `canRecord`) is now caught.

**N2 (rules with no test): fixed.**
- Mutations A4 to A8 are all caught now: quoted reason, dated "went back", several workers joined by ", ", "checked" taken from the stalest read, and "1 waits on you". The tests are at ac82-home:493-540.

**Test-weakening notes: both fixed.**
- ac57-58-65:422 checks the whole sheet again. Mutation T2 (a 400 px width inside a media query) is caught.
- ac54:541 asserts the second group's count, "2 projects". The comment there explains why it is Closed's count now, not Done's. Mutation T1 is caught.

**Not a regression:** mutation M18 survives at both 2d3eeec and 5764229. I re-ran it at 2d3eeec to check. It was never on my round-1 caught list. Verdict calls go by their own path, so it cannot reach them.

## The words B1's fix chose (item 2)
- "rough finish: not available: MD1 is past its estimate" is true. It matches Plan's "Rough finish: not available: MD1 is past its estimate" word for word. Nothing is made up.
- "rough finish: not available" is true. With the estimates read failed, or no planning project set, Plan shows "Estimate: not available" and its card shows "not available". I checked this with a probe on the setup the test uses.
- Neither line disagrees with Plan. The wording gaps go to **Define**:
  - **D-a.** AC82 gives no tile form for these cases, and the line reads clumsily: "MD1 · rough finish: not available: MD1 is past its estimate" names the code twice and has two colons.
  - **D-b.** AC24 step 4 names only the code. Two projects can share a code such as M1 (AC24). So a tile could read "Next: M1 · rough finish: not available: M1 has no estimate yet" when the M1 that lacks an estimate is another project's. The cause is `src/lib/workahead.js:345`. It cannot happen today, because only Service-Desk is v3.
  - **D-c.** This one was already there in round 1. The tile drops J14's "may be out of date" and "a newer estimate line could not be read", which J14 says the row names. It also shows "rough finish once you accept it" for a 0-to-0 estimate, which is not in AC82's "<range>" form. Define should say whether the tile carries these.

## New findings (all non-blocking)
- **N-1 (Build): one new rule in the B2 fix has no test.** This is "asked in this cycle", the overflow of J20's call going into the cycle's next call. Mutation B2c (`asked = false`) survives.
  - A probe with 6 or 7 open pull requests of 3 pages each reads only 4 of 6 (or 4 of 7), even after 5 minutes. The real code reads all of them, using one call of commits alone, which the spec allows.
  - The spec's 5-pull-request test has a README blob in its second call, so it never reaches this case.
  - Probe: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p6-overflow.test.mjs`
- **N-2 (Build): a second branch of the B2 fix has no test.** This is the failed-J20-read branch of `filesDue` (scheduler.js:422). Mutation B2d (ignoring J20's 5-minute wait) survives.
  - Under B2d, a comment arriving inside that wait makes one call holding only `{"commits":[21]}`, and `alone` = 1. The real code makes no call.
  - Probe: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p7-filesfail.test.mjs`
- **N-3 (Build; Design reviewer to judge): one case of the unread-tile rule has no test.** That case is a "Can't read" tile whose records are still held, which should keep its own lines. Mutation D2 (switching that tile to "not available" too) survives.
- **N-4 (Build): one false line, shown only after a crash.** This was already there in round 1, and I missed it then.
  - If `workView` throws, `src/public/sandbox.js:974-978` catches the error and leaves `nextRows` empty.
  - Each v3 tile whose project document was read then reads "Next: no milestone left to reach" (`src/lib/home.js:561`). That is false.
  - The comment at line 977 ("no estimate yet … Plan says why") no longer matches the code.
- **The Design fixes are otherwise sound.**
  - Nothing still uses the old root class `v2-home`. `.v2-home` is now only the section's grid (sandbox.css:960).
  - The fold-heading rule out-ranks `html.sb .sb-h3`.
  - The fade on cut lines uses `--bg`, which is the colour behind both Home and the sheet.
  - Unread tiles read "not available". A v2.5 tile keeps "No dispatch log: not used here".
  - Mutations D1, D3, D4 and D5 are caught. Probes p2-sd and p5-routes are unchanged from round 1: every "since" tap still opens the right place.

## Open questions
1. The Chromium captures (360, 414 and 720 px, light and dark, beside frames H1 to H5) must be in the pull request before merge. I can't check them.
2. Define: D-a to D-c above, and the round-1 items still open (whether AC75's top line stays, and how many summary lines).

Probes and mutation lists, kept for rerun (set `W=<absolute path of a checkout>`):
- `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/mutate3.py` (give it the absolute root), with `m3.json`, `m4.json` and `m0.json` (the no-op check) in the same folder
- `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p6-overflow.test.mjs`
- `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p7-filesfail.test.mjs`
- `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p8-plan-na.test.mjs`
- Full suite log: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r2-suite.txt`