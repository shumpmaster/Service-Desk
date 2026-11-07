# EXP-007 result — the home-screen widget's refresh

registration: experiments/EXP-007-widget-refresh.md (frozen at ad2709e)   spec: none (P-004 has no
spec before its Design gate; decisions/questions/P-004-result-spec.md, ruling A)
run: the owner's iPhone, 2026-11-05 04:39Z to 14:20Z, with the test widget packed at 553bcc6
(sha256 `eb53c5b7…2f4f748da`, as the Reviewer gives it); the test data and the log sent to the
private repository shumpmaster/portfolio, branch exp-007-test-data, commit 620e2f4
recorded by: the Builder, 2026-11-07, from the Reviewer's verdict
(reviews/EXP-007/_reviewer-result.md); the Builder ran nothing and judged nothing. No project
content is recorded here: only repository names and counts.

## What this means for you

The test is **not judged**: not a pass and not a fail. It could not reach the thing it was meant to
check. On the home screen, the phone ran the widget's refresh 25 times, and stopped every attempt
within seconds, usually 2 to 4. None of them started from a complete kept copy. In the Scriptable
app, the first full read finished (1,033 GitHub requests in about two minutes), and a later
refresh in the app matched the desk's own code exactly. But the evidence strongly suggests the
home-screen widget cannot see what the app keeps in its Caches folder, while the log, kept in
Documents, is shared. So doing the first read in the app never helped the widget, and no counted
later refresh ever ran.

What comes next is your ruling, A: a second test, with the widget's kept copy and its snapshots
kept in Documents, the folder the widget is known to share with the app. It is written down as a
new test and checked by the Critic and the Reviewer before it runs; this result stays not judged
(decisions/questions/P-004-widget-next-step.md).

## The verdict

**NOT JUDGED**, in the Reviewer's words (finding 4, summarised as the Reviewer put it):

- **Pass cannot apply:** there were zero counted later refreshes, and "every time" is not met by
  none.
- **No Fail rule fires as written:** no mismatch; no counted later refresh left unfinished; no
  counted refresh at `checking` or `cant-read`; none ending in an error; and "no refresh, in the
  widget or the app, ever ending with no error" is false, since 3 app refreshes ended with no
  error.
- **The Not-judged rule, as written,** needs a counted later refresh with a project not judged;
  there is none.
- **The first-refresh-in-the-app allowance** ("done once inside the Scriptable app and kept") was
  done in the app, but the widget never got the kept data, so its "and kept" was not met for the
  widget, and Method 4's "the later refreshes then run in the widget" never happened.
- **Exclusions are moot:** no widget refresh has an `end` or an `errorKind`, and the owner said
  nothing; the 13:17 `cant-read` is in an app refresh, which isn't counted.
- **So no rule decides the case cleanly.** What happened matches the reason the Fail rule gives
  ("so no later refresh can run") for the widget, but not its wording, which includes the app. The
  Reviewer invented no Fail rule after the freeze (D-047) and chose the nearest outcome, NOT
  JUDGED: the condition the pass mark tests never happened.

## Counts and outcomes (Method 7)

The judge's output (`node src/widget-test/judge.mjs <log> --snapshot <test-data.json> <SD> <POOM>
<ML> <portfolio>`, exit 0), as the Reviewer recorded it:

```
04:39:49Z mw3240b6-4hlazl app, first: 119862 ms, 1033 req, 8370530 B, kept 1053877 B → SD/POOM/ML MATCH [read]
12:58:43Z mw3jxlpf-6v8ds6 app, later (in the app): 30099 ms, 85 req, 3350505 B, kept 1064815 B → 3× MATCH [read]
13:17:16Z mw3klgfj-69ojzv app, later (in the app): 137478 ms, 46 req, 2247774 B, kept 1081159 B
  → SD NOT JUDGED [can't read] (missing-answer: 2), POOM (missing-answer: 1), ML (missing-answer: 1)
25 × "widget, first: no end line — killed for time or memory"
total: 6 match, 25 killed, 3 not judged
```

The 28 starts, by kind:

| Kind | Started | Finished | Unfinished | Outcomes |
|---|---|---|---|---|
| first (app) | 1 | 1 | 0 | 3 match |
| later (in the app) | 2 | 2 | 0 | 3 match at 12:58; 3 not judged at 13:17 |
| first (widget) | 25 | 0 | 25 | none |
| **later (widget, counted)** | **0** | – | – | – |

- **Total: 6 match, 25 killed, 3 not judged.** All 25 widget starts are `first`; **no counted
  later refresh** ran.
- The 3 not judged are the app refresh at 13:17, where every project's read was `cant-read`, with
  4 failed reads matching the 4 missing answers. App refreshes aren't counted.
- The widget's starts came in bursts at 13:13, 13:17 and 13:19, then one at 14:20. Each lived at
  most a few seconds (19 start-to-start gaps of 2.1 to 4.1 s; others 9.0, 9.8 and 21.3 s). The 25
  kills can't be split into time and memory.
- No `snapshot-dropped` lines and no `sent` line in the log.

## Deviation from the registration (finding 1)

- **Method 8 names the test widget at 491baa7, but the run used 553bcc6.** The Reviewer checked
  that the judge's files and the desk's code did not change between them: `git diff --quiet
  491baa7 553bcc6 -- judge.mjs glue.js snapshot.js entry.js fakes.mjs src/lib` reports no change;
  553bcc6 only touches the pack (ASCII escapes) and `pack.mjs` / `test.mjs`.
- `node src/widget-test/test.mjs` did not finish within 300 s, so the Reviewer has no result from
  it.
- The inputs otherwise check out: the branch head is 620e2f4, the packed widget's hash matches, and
  every logged commit is in its clone.

## Why, as observations (finding 5)

The evidence supports the idea that **the home-screen widget does not see the app's Caches
folder, while Documents is shared.** The test widget put its log in Documents and its kept data
and snapshots in Caches. The Reviewer observed:

- (a) The app had complete refreshes at 04:41 and 12:59, yet the widget's 11 starts from 13:13:08
  log `cache:false`.
- (b) From 13:13:58 the widget logs `cache:true, cacheComplete:false`, which fits its own partial
  save; yet the app's start at 13:17:16 logs `cacheComplete:true`. A shared file would have read
  `false`.
- (c) After the app's complete save at 13:19:34, the eight widget starts from 13:19:36 onward still
  log `cacheComplete:false`.
- (d) Each widget start writes a snapshot before any read; the test data, sent from the app, holds
  only the 3 app refreshes, and there are no `snapshot-dropped` lines.
- (e) Widget and app lines are interleaved in one log, so Documents is shared.

Strong but indirect: nobody listed the folders.

## For P-004's sizing (finding 9)

- **First (cold) read, in the app:** 1,033 requests (200: 869, 304: 164), 119.9 s, 8.37 MB
  received. By repository: Service-Desk 796, Personal-Org-Operating-Model 59, Model-Lab 169,
  portfolio 5, graphql 4. Service-Desk is about 2× the plan's "about 400".
- **Later reads, in the app:** 85 requests in 30.1 s (3.35 MB); 46 requests in 137.5 s (2.25 MB,
  with read failures).
- **Snapshots:** the last was 7,388,734 B, against the 20 MB limit; the test data was 7,847,906 B.
- **Kept copy:** about 1.05 to 1.08 MB.
- **Memory:** not measured, as expected.

## Clean-up (Method 7)

Once this result is on the default branch, the owner:

- deletes the branch exp-007-test-data on shumpmaster/portfolio;
- in the Scriptable app, runs "Delete test data (after sending it)" and "Forget keys", which
  remove the phone's test data.

Both keys (the read key and the send key) can be deleted on GitHub now: nothing needs them. A
deleted branch's commits can still be fetched for a while by anything with read access to
portfolio. The second test makes its own keys.
