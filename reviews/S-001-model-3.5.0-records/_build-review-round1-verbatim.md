Verdict: FAIL

**What this means for the owner:** the build does what you asked, with one exception. The automatic job's merged pull requests are off the Timeline unless the plan lists one, and while open they still show as waiting on you. Each question and card shows its milestone and its facts. The Chief of Staff's work shows on the Team screen. A milestone marked reached shows as reached, with its date. Every check passes. I found one real defect, and it is small to fix. If a Chief of Staff session file ever holds a line whose event is one of a few special words, such as "constructor", the trial view shows the whole project as "Can't read", on every refresh. The plan says that line should just be named and skipped. Such a line is very unlikely in practice, but the plan names this exact case. The fix is one line plus a test. Nothing in the views you accepted changes.

## Checks run (each result)
- **npm, in a scratch clone of b00447d:** `npm --prefix src ci` exit 0; `npm --prefix src run build` exit 0 ("build: PASS (2 connected projects; 19 page modules in step)"); `npm --prefix src test` exit 0, 464 tests, 464 pass, 0 fail. Clone: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/br1
- **Surface guard:** `python3 governance/checks/surface_guard.py diff --range 9f5fa73..b00447d --branch build/builder/s001-model-3.5.0-records` gave "OK: 5 commit(s) in 9f5fa73..b00447d checked (0 merge(s) skipped, 0 exempt, 0 human)", exit 0.
- **check_all.sh on a scratch merge:**
  - I fetched GitHub's main into a separate scratch clone, so the repo's own refs were not touched: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/mg. Its main is b873590368d2e8dfb65e1419e53f0a23cc81e62c, the same main 9f5fa73 merged.
  - I made `git -c user.name=shumpmaster -c user.email=furchken@gmail.com merge --no-ff b00447d` there (scratch commit 8eb1fbf).
  - `bash governance/checks/check_all.sh . b873590…` passed all 25 steps, sessions, merges, trace and joins included ("OK: all governance checks passed."), exit 0.
- The worktree and the repo are unchanged (`git status` is clean).

## What I verified
- **parseTrailers (src/lib/pulls.js) against govlib.parse_trailers:**
  - Differential fuzz: 100,000 random messages from ASCII parts (trailers, continuations, `#` comments, Signed-off-by and cherry-pick lines, CRLF, lone CR, `\v`, `\f`, NBSP and the other Unicode spaces) gave 0 differences.
  - The only differences come from U+001C–U+001F and U+0085, which Python counts as white space and JS does not, and U+FEFF, which is the other way round. See N1.
- **isJobMerge needs both conditions:**
  - Probes: the trailer with another author gives false; no author gives false; `GitHub-Actions[bot]` gives false; two `Merged-By` give false; the line mid-text gives false; a title-only message gives false. The key in any case gives true. A `null` merge commit gives false. A merge commit with no message gives null.
  - Mutations: dropping the author check failed 5 tests in j12-asks-merge.test.mjs; accepting two `Merged-By` also failed 5.
- **Nothing you must act on is hidden:** `job` is used only for merged J12 entries (feed.js:345, :429, :749). The Queue's open-PR path (J1, classifyPull, queueView) is not in the diff. The AC66 test checks that #84 while open is "in the Queue as any pull request" (j12-asks-merge.test.mjs:193).
- **The request count is unchanged (A3, AC14):** there is still one `pullRequests(` connection, and one J12 read per cold load (test :110). The AC14 budget test passes.
- **The J13 reader against `v3_checks sessions`:**
  - 40,000 random lines, leaving out the cases the spec says are not mirrored: the desk and the model agree on every line except two groups. One is the throw (B1). The other is 93 lines with years 0001–0099 (N3).
  - Running `j13-fixtures.py` into a scratch directory gives files and check.txt identical to tests/desk/fixtures/j13.
- **The J11 reached reader against `milestone_lines`:** 12,365 of 12,365 lines with ASCII dates agree. The only differences are dates in Unicode digits (N2). `milestone-verdicts.py` reproduces model-verdicts.json exactly.
- **The keys:** `BLOB_CACHE_KEY = 'desk-blobs-v6'` with v5 among the old keys (scheduler.js). `PULLS_KEY = 'desk-pulls-v2'`, and v1 is removed on load. createStore has `remove`, and the sandbox wires it (src/public/sandbox.js:2173).
- **Fixtures:**
  - I recomputed parse_trailers, the author and the job's yes or no for all 10 asks-merge messages and all 71 built ones: 0 mismatches.
  - #84's message is byte-equal to `git log -1 --format=%B 21bc250`, and its author is github-actions[bot].
  - `s033-fixtures.py` regenerates tests/desk/fixtures/s033 identically.
- **Every marker the spec names exists:** J2, J3, J6, J11, J12 and J13; AC3, AC14, AC19, AC49, AC50, AC53, AC57, AC59, AC60, AC62, AC65, AC66, AC67 and AC68. AC19's test and links.js are not in the diff. The session reads happen only under `ctx.j11` (model.js neededReads). The J11 work is the first commit (77252fa), as the brief asks.
- **Mutations in the scratch clone (9 of 9 caught):**
  - J6 key back to v5: 1 test fails.
  - J12 key back to v1: 1 fails.
  - J13's 8-hour limit set to 9 hours: 2 fail.
  - Job merges let back onto the Timeline: 2 fail.
  - No reached-date check: 4 fail.
  - The answer box without its `Milestone:` line: 4 fail.
  - doneTarget checking "is it the job's?" before "is it listed?" (round 6's note 2 case): the AC66 test fails.
  - The two isJobMerge mutations above.

## Findings
- **B1 (BLOCKING): an `event` that names a built-in object property crashes the J13 reader, and the whole project reads "Can't read".**
  - Where: src/lib/cos.js:64-66. `const keys = KEYS[obj.event]` reads a plain object, so `"constructor"`, `"toString"`, `"__proto__"`, `"valueOf"` or `"hasOwnProperty"` returns an inherited value. Then `keys.filter` throws `TypeError: keys.filter is not a function`.
  - The model handles it: `session_line_problems` gives "unknown event 'constructor' (start, helper or end)".
  - Reproduced: a sandbox with tests/desk/fixtures/j13/good/…/s-ended.jsonl plus the line `{"event": "constructor"}` shows "Can't read since 07:00: the desk page hit an error reading this project's records (keys.filter is not a function)" and loses "All clear". With `{"event": "nope"}`, the line is named, skipped, and "All clear" stays.
  - The parse is never cached, so it fails again on every poll.
  - This breaks the spec in three places:
    - J13's mirrored finding (specs/S-001.md:5545-5549): such a line is named and skipped, the rest of the file used.
    - J13: "A failed or missing read shows only on the Chief of Staff's tile, log and sheet".
    - J11/Terms: an optional read never makes a project "Can't read".
  - Fix: `Object.hasOwn(KEYS, obj.event)`, or a Map. Add such a line, with the model's verdict beside it, to tests/desk/fixtures/j13/bad.
- **N1 (NOTE): the port's notion of white space differs from Python's.**
  - The message `File a question (#90)\n\nbody text\n\nMerged-By: orchestrator\x1c\nDelegation: L-0017\nMerged-Head: abc`, with author github-actions[bot]: the model reads the value as `orchestrator`, so it is the job's. The desk keeps `orchestrator\x1c`, so it is not.
  - With U+FEFF in place of U+001C it is the other way round: the desk says the job's, and the model's merges check fails it.
  - Where: pulls.js:151-152, :206 and :210 (`trim()` and `\s`). The same applies to cos.js:54 `filled`: a `doing` of "﻿" is skipped by the desk and passed by the model, and "\x1c" the reverse.
  - Unreachable in practice, but J12 says "the desk follows the function". Fix: a Python-isspace character class.
- **N2 (NOTE, a model-side issue): Python's `\d` matches non-ASCII digits.** So `milestone_lines` accepts ` · reached: ٢٠٢٦-10-07`, and `utc_time` accepts such times. The desk skips both. Pass back to the model (`re.ASCII`); nothing to change in the desk.
- **N3 (NOTE): utcTime has two small gaps against the model.**
  - It rejects years 0001–0099 at cos.js:48, before the rebuild at :49-50, which is therefore dead code. The model accepts those years.
  - It keeps milliseconds only. So a helper with `started …:00.0005Z` and `ended …:00.0001Z` passes on the desk but fails the model's "the helper started after it ended".
- **Draft 7 (scope item 1): settled, nothing broken.** `git diff 7b5b2a7 6914113` touches only:
  - the lineage;
  - the lead (:463 and :476, "unless the plan lists one"), which is round 6's note 3;
  - the Draft 7 note;
  - AC60 at :3340-3341 and AC66 at :3800-3801, "shown as J12's awkward cases show a listed pull request it lacks", which is note 1;
  - AC66's test sentence at :3840-3843, which is note 2.

  The code matches (feed.js:345 and :749), and the AC66 mutation above shows note 2's case is really tested.

## The Builder's open questions
- **(a) J11's fixture: the Builder's reading is sound, and the spec needs a wording fix.**
  - I reran trace on 3117150 with 9f5fa73's checks. With j11-reached/docs/PROJECT.md the `NOTE:` lines are identical; only violation lines are added for MX1–MX4. With both/ the trace adds exactly `MX5 … (dropped)`, `MX6 …` and `sprint PR #54`.
  - So no single file can hold a well-formed line both reached and dropped and still leave the `NOTE:` lines unchanged.
  - Fix J11's test sentence (:5310-5316) to name the second file.
- **(b) AC62 against AC49: sound, and the spec needs a fix.**
  - AC62's "every word kept" list (:3616-3620) leaves out the Chief of Staff's page, which AC49 now rebuilds from J13.
  - The test still compares that page's header, headings and bottom bar, and the v2.5 page whole.
  - Fix: add "a v3 project's Chief of Staff page's status line, Responsible-for groups and running log (AC49, J13)" to AC62's list.
- **(c) The (C) choices: all within the spec's room.**
  - **The card's "last:" date** (the end date, or the start date while under way or ended unrecorded): fits AC67 and AC49's Idle wording.
  - **Keeping "Sessions":** fine, because there are 5 groups, within AC49's "three to five". The fixed group list must be in the pull request body.
  - **Lane labels:** these are visible text. src/public/sandbox.js:1641 shows `e.lane` as each row's chip, so you would see "session_012RJPVKAoLga2RkqLYRDcBY line 1" (sandbox.js:1354). That is long at 360 px. Acceptable as a (C), but worth a lab tweak.
  - **Two pieces under way open the latest:** consistent with the tile ("started last").
  - **Reached with no "now" run filled:** consistent with rule 5 and the reached part being your ruling.
  - **The start-of-day order:** fine.
  - **J13's read in model.js:** right. The J11 blob list actually lives in model.js `neededReads`. Areas touched (:5849) wrongly names page.js, which is a pointer to fix; the areas are what binds.
- **(d) A merge commit with no message: sound, no spec fix needed.** GraphQL's `Commit.message` can never be null, so a missing message means a malformed or partial answer. Treating it as unread matches J12's "lacks the field" reading: it is placed only under a plan line that lists it.

## Open questions
None for the owner. B1 goes back to the Builder. N1 and N3 can ride the same fix. N2 belongs to the model. The spec fixes for (a), (b) and the page.js pointer are the Definer's, before the freeze.
