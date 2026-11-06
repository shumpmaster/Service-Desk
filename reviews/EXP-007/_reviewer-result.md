# EXP-007 — the Reviewer's judgment of the owner's run, verbatim

Run: the owner's iPhone, 2026-11-05 04:39Z to 14:20Z, the widget packed at 553bcc6; the test data
and log sent to shumpmaster/portfolio, branch exp-007-test-data, commit 620e2f4. Judged against
experiments/EXP-007-widget-refresh.md, frozen at ad2709e. No project content is quoted. Recorded by
the orchestrator, session session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-06.

---

Verdict: NOT JUDGED

My answer is NOT JUDGED. This is not a pass. The pass mark could not be met because the run produced no counted `later` refresh (a widget run on the home screen that started from a complete kept cache). None of the registration's Fail rules fires as written. Its Not-judged rule, as written, also needs a counted later refresh to exist, so this case is one the frozen registration does not cleanly decide (see finding 4).

1. **Inputs check out.** The branch head is `620e2f42`, shumpmaster, 2026-11-06 10:06 −0600, holding `log.jsonl` (12,044 B, 34 lines) and `test-data.json` (7,847,906 B). The packed widget at 553bcc6 hashes to `eb53c5b7…2f4f748da`, which matches. Every logged sha is in its clone: SD ec9e1f5 and 179ec4f; POOM bbe010f and 76df4df; ML c8ca442 and 37f8246; portfolio 8dfb58f. A deviation the result must record: Method 8 names 491baa7, but the run used 553bcc6; `git diff --quiet 491baa7 553bcc6 -- judge.mjs glue.js snapshot.js entry.js fakes.mjs src/lib` reports no change; 553bcc6 only touches the pack (ASCII escapes) and `pack.mjs` / `test.mjs`. `node src/widget-test/test.mjs` did not finish within 300 s, so I have no result from it.

2. **Judge output.** `node src/widget-test/judge.mjs <log> --snapshot <test-data.json> <SD> <POOM> <ML> <portfolio>`, exit 0:
```
04:39:49Z mw3240b6-4hlazl app, first: 119862 ms, 1033 req, 8370530 B, kept 1053877 B → SD/POOM/ML MATCH [read]
12:58:43Z mw3jxlpf-6v8ds6 app, later (in the app): 30099 ms, 85 req, 3350505 B, kept 1064815 B → 3× MATCH [read]
13:17:16Z mw3klgfj-69ojzv app, later (in the app): 137478 ms, 46 req, 2247774 B, kept 1081159 B
  → SD NOT JUDGED [can't read] (missing-answer: 2), POOM (missing-answer: 1), ML (missing-answer: 1)
25 × "widget, first: no end line — killed for time or memory"
total: 6 match, 25 killed, 3 not judged
```

3. **How each refresh is classed.** 28 starts: 3 in the app, 25 in the widget; 3 finished, 25 did not.

| Kind | Started | Finished | Unfinished | Outcomes |
|---|---|---|---|---|
| first (app) | 1 | 1 | 0 | 3 match |
| later (in the app) | 2 | 2 | 0 | 3 match at 12:58; 3 not judged at 13:17 |
| first (widget) | 25 | 0 | 25 | none |
| **later (widget, counted)** | **0** | – | – | – |

App refreshes: 04:39 `cache:false`; 12:58 and 13:17 `cache:true`, `cacheComplete:true`; none logged an `error`. At 13:17 every project's `shape.read` was `cant-read`, the state the desk's fixed "Can't read since 07:18: GitHub error…" form; its `statuses` add up to 42 of 46 requests, which fits 4 failed reads with no status, matching the 4 missing answers. Widget refreshes: 13:13:08 to 13:13:55, 11 starts, all `cache:false`, `cacheComplete:false`; 13:13:58 to 14:20:09, 14 starts, all `cache:true`, `cacheComplete:false`. No `snapshot-dropped` lines and no `sent` line.

4. **Measured against the Deciding threshold.** Pass cannot apply: zero counted later refreshes, and "every time" is not met by none. Fail rules, as written, none fire: no mismatch; no counted later refresh left unfinished; no counted refresh at `checking` or `cant-read`; no counted refresh ending in an error; and "no refresh, in the widget or the app, ever ending with no error" is false, since 3 app refreshes ended with no error. Not judged, as written, needs a counted later refresh with a project not judged; there is none. The first-refresh-in-the-app allowance ("done once inside the Scriptable app and kept") was done in the app, but the widget never got the kept data (finding 5), so its "and kept" was not met for the widget, and Method 4's "the later refreshes then run in the widget" never happened. Exclusions are moot: no widget refresh has an `end` or an `errorKind`, and the owner has said nothing; the 13:17 `cant-read` is in an app refresh, which isn't counted. Which rule applies: none decides the case cleanly. What happened matches the reason given in the Fail rule ("so no later refresh can run") for the widget, but not its wording, which includes the app. I did not invent a Fail rule after the freeze (D-047); I chose the nearest outcome, NOT JUDGED: the condition the pass mark tests never happened. Open question for the owner: whether to repeat the run, or treat it like the glue.js clause; the registration's step after a Not judged is to run the test once more, but a repeat with the same widget should hit the same storage split (finding 5). glue.js: not audited in depth, because no counted refresh exists for a fault there to change.

5. **Diagnosis (observations only).** The evidence supports the idea that the home-screen widget does not see the app's Caches folder, while Documents is shared. `entry.js:42` puts the log in `documentsDirectory()`; `entry.js:48` and `snapshot.js:90/144/164` put kept data and snapshots in `cacheDirectory()`. (a) The app had complete refreshes at 04:41 and 12:59, yet the widget's 11 starts from 13:13:08 log `cache:false`. (b) From 13:13:58 the widget logs `cache:true, cacheComplete:false`, which fits its own partial save (`saveKept(k,false)`, `entry.js:81-84`); yet the app's start at 13:17:16 logs `cacheComplete:true`; a shared file would have read `false`. (c) After the app's complete save at 13:19:34.261, the eight widget starts from 13:19:36 onward still log `cacheComplete:false`. (d) Each widget start writes a snapshot before any read (`entry.js:330`); the test data, sent from the app, holds only the 3 app refreshes, and the log has no `snapshot-dropped` lines. (e) Widget and app lines are interleaved in one log, so Documents is shared. Strong but indirect; nobody listed the folders.

6. **How long each widget attempt lived** (start-to-start gaps, an upper bound): 19 gaps 2.1–4.1 s; others 9.0 s, 9.8 s and 21.3 s; the 193.7 s, 125.3 s and 3609.6 s gaps are idle time. The starts came in bursts at 13:13, 13:17 and 13:19, which fits iOS re-running the widget during home-screen setup; then one start at 14:20 and none for the remaining ~1¾ h before the send.

7. **Was any widget refresh `later`?** No. All 25 widget starts are `first`, so none was counted.

8. **Context.** Busy stretch: it did happen, merges on main at 13:05–13:09Z (SD 2, POOM 1, ML 1) and 13:25Z (ML 2), about 6 in an hour. Not a full day: the log runs 04:39–14:20Z (about 9¾ h), with the widget on the home screen from 13:13Z.

9. **For P-004's sizing.** First (cold) app read: 1033 requests (200: 869, 304: 164), 128 calls, 12 steps, 119.9 s, 8.37 MB received, kept data 1.05 MB; perRepo SD 796, POOM 59, ML 169, portfolio 5, graphql 4 — above the offline 866, and SD about 2× the plan's "about 400". Later: 85 requests in 30.1 s (3.35 MB); later: 46 requests in 137.5 s (2.25 MB, with read failures). Test data 7,847,906 B; last snapshot 7,388,734 B against the 20 MB limit; 301 bodies; 3 refreshes with 613, 60 and 21 entries. Kept cache about 1.05–1.08 MB. Memory not measured, as expected; the 25 kills can't be split into time and memory.

**For the result file.** The test could not reach the condition it was meant to check. The phone ran the widget's refresh 25 times on the home screen, and every attempt was stopped within seconds, usually 2 to 4. None started from a complete kept copy. In the Scriptable app, the first full read finished: 1,033 GitHub requests in about two minutes. A later app refresh also matched the desk's own code exactly. But the evidence strongly suggests the home-screen widget cannot see what the app keeps in its Caches folder, while the log (in Documents) is shared. So the plan's fallback, doing the first read in the app, never reached the widget, and no counted later refresh ever ran. Nothing failed the pass mark as written, and nothing passed it. The result is "not judged", and the owner should decide the next step before the same widget is run again.
