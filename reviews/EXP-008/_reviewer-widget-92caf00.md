# EXP-008's test widget — the Reviewer's check at 92caf00, verbatim

Read: build/builder/p004-exp008-widget at 92caf00 (src/widget-test/), against the registration's
Draft 2 (cd98e5f). The check the registration requires before freezing. Recorded by the
orchestrator, session session_01QBwHGJ3CcwMQ1i8bkydhLN, 2026-11-07.

---

Verdict: PASS

I tried to refute build/builder/p004-exp008-widget at 92caf00 and found no blocking defect. I checked it against the registration as it now stands: Draft 2, commit cd98e5f on build/definer/p004-exp008, which is the file on disk (sha256 dd1870ac…). Draft 1 was replaced while I was reviewing, and Draft 2 already takes up most of what I would have reported against Draft 1. I also checked it against EXP-007's frozen Method 1–8 and Measure, the four earlier widget checks, and the owner's three rulings. One disagreement with Draft 2 is left (finding 1); it must be settled before the freeze. Every other finding is non-blocking. The worktree stayed clean throughout (`git status --porcelain` printed 0 lines). I changed no file in any repository; probes and the export are in the scratchpad.

**Findings**

1. **Non-blocking, but settle before the freeze: Draft 2 and the judge disagree on a 200 whose body is no branch.** Draft 2 line 307 says `{status: 200, error: "body"}` is not judged (`missing-answer`). The judge instead serves the recorded answer at that place, after checking that its status agrees with the log (judge.mjs:158-161); entry.js:168-177 saves that body whole. Probe: a widget refresh whose first Model-Lab branch read answered 200 with `{"message":"not a branch"}` was logged as `{"status":200,"error":"body"}`, and the judge printed `ML MATCH [ok]` (/tmp/claude-0/-home-user/2cab7625-2add-5776-84d3-aba440250a8f/scratchpad/reviewer/probe/gen.mjs, refresh 4). The judge's behaviour is the exact replay and is the better one, so the simplest fix is to change line 307. Either way the two must say the same thing.

2. **glue.js, audited in full (G1–G8). Non-blocking. I found no behaviour that would change a summary.** This glue.js is much smaller than EXP-007's: it holds no copied body checks, no Access skip and no summary code. Those now belong to each side separately (entry.js:184-233 for the widget, judge.mjs:184-224 for the judge).
   - **G1, the desk's options.** These match the page's own `createDesk` call (src/public/sandbox.js:5397) except for three things:
     - `isVisible` is always true.
     - `onChange` draws nothing.
     - `lastLooked` is always null, which switches J24's commits read off. That cannot change a summary: J24's commits are exposed only as `desk.commits` (scheduler.js:1587), which nothing in src/lib or the page reads, so no box field depends on them.
     - The page also asks for its "kick" reads after Done marks (sandbox.js:5401). The phone has no marks, so nothing is lost.
   - **G2, the virtual clock.** Both sides start it at `start.at` and it never follows real time. src/lib reads no real clock on this path: every `Date.now` / `new Date()` takes `nowMs`, and the one fallback, feed.js:64, applies only when `nowMs` is not finite. Side effect, the same on both sides: time words such as "since HH:MM" can run ahead of the phone's real clock by the skipped time (in my cold probe `skipMs` was 540000).
   - **G3, quiet.** Each side's own macrotask yield is used (`setTimeout 0` on the phone, `setImmediate` in the judge). Not a fault.
   - **G4, stepping.** Timers that fall due at the same moment fire back to back, in creation order, with no microtask turn between them, unlike a browser. That changes only the order of calls, never the records read. Same on both sides.
   - **G5, the stop rule.** It is sound against the desk's code. The desk sets only three kinds of timer: each project's 60 s poll (scheduler.js:1412), the portfolio's 5-minute read (:318) and its deadline (:376). So "quiet and done" cannot fall while a desk call is already due. A project in failure stops at once and shows its "Can't read" words, which is what the desk shows at that moment.
   - **G6, the limits.** The 30-virtual-minute cap can cost about 30 polls per project in real requests, a time risk (F2) rather than a summary fault. In my probes every refresh stopped `quiet` (steps 9, 2, 1, 2).
   - **G7, counting.** It only counts, for G5 and the log. `body.target === 'portfolio'` matches `PORTFOLIO_TARGET` (github.js:388).
   - **G8, desk.stop().** It runs before the summary is read, but `readState` reads only `lastSuccessAt`, `openedAt` and `visibleSince`, never `running`.
   - **bodyHash** (sha256.js:114) is a function of the content alone. It is a non-cryptographic 128-bit hash, and the byte length is added to each body's name. A collision could only make the judge serve a wrong body, which gives a false mismatch, never a false match.

3. **Data handling: holds.**
   - **Where it writes.** The packed file has one `FileManager.local()` and one `documentsDirectory()` (packed lines 8590-8598). It has no iCloud, `cacheDirectory`, `temporaryDirectory`, `libraryDirectory`, ShareSheet, DocumentPicker, QuickLook, Pasteboard, Safari or `console.` (grep count 0 for each). Every write and removal goes through paths under Documents/needs-you-exp008/ (phone.js:29-32). The only `localStorage` is createStore's default, and the widget always passes its own backing (packed 8834-8836).
   - **Where it sends.** Refresh requests are only `GET https://api.github.com/...` or the GraphQL POST (entry.js:85, 114), and redirects are refused (entry.js:125). The send uses fixed whole addresses through the guard.
   - **Keys.**
     - They are kept only in the keychain (packed 8606, 8959, 9068).
     - Refreshes use only the read key (entry.js:275; test.mjs:348).
     - Any key that might reach a log line is blanked (entry.js:73-80).
   - **Probe (gen.mjs above).**
     - The fake phone holds 76 files, 0 of them outside Documents/needs-you-exp008/, and 0 files hold either key.
     - Every log field is a fixed word, a count, a repository or project name, one of the desk's literal kind values, a hash, a sha or an id.
     - The synthetic pull request's title does not appear in the log (grep count 0).
   - **EXP-007's files** are never read or removed (test.mjs:452-453, 470).

4. **The send guard: holds.**
   - **Cases run.** I ran 56 refused and allowed cases against both the packed file's guard (packed lines 8387-8575, evaluated in a vm) and send.js, with identical results and 0 unexpected (/tmp/claude-0/-home-user/2cab7625-2add-5776-84d3-aba440250a8f/scratchpad/reviewer/guard-probe2.mjs). They cover EXP-007's 9eeae80 and 491baa7 lists renamed for EXP-008, plus the new ones:
     - blob-to-path tying: swapped paths are refused, and so is the same blob at both paths;
     - a blob with other content, with the log's content first, or base64-encoded;
     - no second try after a blob answers 500 or the network fails;
     - no main read after the branch read answers 500;
     - nothing after a successful send.
   - **No main.** Only `refs/heads/exp-008-test-data` can be written. When the branch exists, main is never read (send.js:53-63, 91-95).
   - **EXP-007's leftover gaps are closed.** 491baa7's (i), that blobs were not tied to paths, is closed at send.js:75-79. 491baa7's (ii), repeated blob writes, is closed at send.js:19-20 and 103-154.

5. **The judge: its replay rules hold, and the faults I seeded are reported.** Scripts: /tmp/claude-0/-home-user/2cab7625-2add-5776-84d3-aba440250a8f/scratchpad/reviewer/probe/seed2.mjs, seed3.mjs and serve.mjs.
   - Branch heads are served exactly as logged. With heads logged as 4×200 and 3×304, the judge served 4×200 and 3×304. With the 304s rewritten as shas, it served 7×200. A 304 and a repeated 200 are now told apart (EXP-007's 5a is closed); the desk's summary is the same either way.
   - A saved 200 is never served as a 304. Turning one into a 304 in the snapshot gives a Model-Lab MISMATCH.
   - Seeded faults and what the judge printed:
     - a changed answer body: ML MISMATCH, in that refresh only;
     - a changed `firstHash`: MISMATCH;
     - a changed fixed state: MISMATCH;
     - a moved head logged as the earlier sha: NJ missing-answer;
     - a logged 502 or network failure that disagrees with the snapshot: NJ missing-answer;
     - a start copy swapped for another refresh's: NJ missing-answer;
     - a killed refresh: `killed`.
   - The Builder's tests cover the rest: unknown-sha, no-snapshot, no-summary-logged, chain-not-reproducible, a missing portfolio answer making every project not judged, and only lines after the last install/reset counting.
   - The clock rule is at judge.mjs:295-298. Outcome codes match Draft 2's list; a replay crash is a mismatch (judge.mjs:306, 327).
   - Non-blocking gaps:
     - (a) A log line that will not parse, such as one cut off when a refresh is killed mid-write, crashes the judge with no verdict ("Unterminated string in JSON") (judge.mjs:242). Each log file is rewritten whole at every line (phone.js:146-160). If Scriptable's `writeString` is not atomic, a kill mid-write could also lose that refresh's earlier lines, its `start` included. Draft 2 Method 8 requires a log that parses but does not say what follows if it doesn't.
     - (b) The judge does not check that the replay used every logged branch read. One extra logged 304 went unnoticed and every project still matched.
     - (c) When the log has no install or reset line, the judge prints only "judged from log line 1". That is how N0 is detected, but the judge does not state it in words.
     - (d) test.mjs:441's comment says it tests "a 304 logged where a 200 came", but the test only shortens the heads list. My serve.mjs probe covers the real case.

6. **The packed file: holds.**
   - **Bytes.** It is 351,274 bytes, sha256 4c88f8150e6980a12cee46e7640a9e5c85438e2ae161a6497f4b1c42c9494b79 (the same in the worktree and at 92caf00). Every byte is 0x0A or 0x20-0x7E, and the file ends with a newline.
   - **Rebuilt from sources.** `node src/widget-test/pack.mjs --out <scratch>` gave the same sha256, and `cmp` reported the files IDENTICAL. Its header names src/lib 88b9cf0, which equals `git log -1 -- src/lib` on origin/main.
   - **src/lib.** `git diff --stat origin/main 92caf00 -- src/lib src/config` is empty.
   - **JavaScriptCore, as far as I can tell.**
     - Wrapped as Scriptable runs it, the file parses with acorn at ES2020. It fails at ES2019.
     - src/lib has no diff between 3b3a9b4 (EXP-007's packed lib, which parsed and ran on the phone) and 92caf00.
     - I found no newer runtime API (`.at(`, `findLast`, `Object.hasOwn`, `structuredClone`, `replaceAll`, `toSorted`, `groupBy`, the `v` regex flag: 0 each).
     - `AbortController` is guarded with `typeof` (packed 6519). `new URL` runs only when an `Origin` header is present (packed 7647), and the widget never sends one.

7. **Commands.**
   - `node --test src/widget-test/test.mjs`, run on a `git archive 92caf00` export: 14/14 pass, rc 0, about 32 s.
   - `npm --prefix src test`: 1569/1569, rc 0.
   - `surface_guard.py diff --range origin/main..build/builder/p004-exp008-widget --branch build/builder/p004-exp008-widget`: "OK: 2 commit(s) … checked (0 merge(s) skipped, 0 exempt, 0 human)", rc 0.
   - **Non-blocking: the scope command as you wrote it prints 8 files.** `git diff --name-only origin/main..92caf00 | grep -v '^src/widget-test/'` lists decisions/P-003/stop-5*.md, dispatch-log/2026-11.jsonl, a docs/handoff file and four status/ files. These all came in on origin/main after the branch was cut (base 2fa711c, origin/main now cf2cdaa). The three-dot form `origin/main...92caf00` and `2fa711c..92caf00` both print nothing: the branch touches only src/widget-test/ (16 files).

8. **Commits: hold.** 1d130fd and 92caf00 are each authored and committed by `builder <builder@agents.invalid>`. Each has the trailer `Agent-Session: session_01QBwHGJ3CcwMQ1i8bkydhLN` (checked with `git interpret-trailers --parse`). Neither has a `Spec:` trailer, and grepping for model or vendor names or co-author lines finds nothing.

9. **Non-blocking: small points in Draft 2.**
   - Method 5 says an errored refresh starting from an incomplete copy saves `incomplete`. The code saves only when a read key is present and something was read (entry.js:311); otherwise it logs `unchanged`.
   - Method 3 cites entry.js:472-476 for the first read in the app, but that refresh is at entry.js:478.
   - The start copy's snapshot name comes from `kept-meta.json`'s key without recomputing it (phone.js:122, 219-224). If an app refresh and a widget refresh ever write the kept copy at the same moment, the judge could start from an older copy. That gives a false mismatch or not judged, never a false match.

**Open questions**
- Can't be checked offline: whether Scriptable's `FileManager.writeString` is atomic (finding 5a), what `onRedirect` returning null does inside a home-screen widget, and whether `Timer` works there (the `alive` marks; if it doesn't, they are simply missing).
- Which way should finding 1 be settled: change Draft 2 line 307 to the judge's exact replay, or change the judge?
- Should the registration say what happens when `log.jsonl` will not parse (finding 5a), since the judge then gives no verdict and there is no hand check?

Files: /home/user/sd-wt-builder/src/widget-test/glue.js, /home/user/sd-wt-builder/src/widget-test/judge.mjs, /home/user/sd-wt-builder/src/widget-test/entry.js, /home/user/sd-wt-builder/src/widget-test/phone.js, /home/user/sd-wt-builder/src/widget-test/send.js, /home/user/sd-wt-definer/experiments/EXP-008-widget-refresh-documents.md
