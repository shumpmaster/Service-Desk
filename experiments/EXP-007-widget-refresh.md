# Experiment registration — EXP-007

*Pre-registered before any run (D-047). Frozen once the line below is set.*

*Draft 2 (2026-11-04), from the Builder's finished test widget (src/widget-test/ on the local branch
build/builder/p004-test-widget, never merged): the key's permissions are set by what the widget reads;
the log holds no project content, since the phone's iCloud backup copies Scriptable's Documents
folder (an unruled point); the Reviewer judges with src/widget-test/judge.mjs, and how its outcomes
count is registered; the Builder's offline sizes are recorded; the earlier open points are settled
in the text. Within Draft 2, at the coordinator's confirmation: the threshold note also registers a
project "not read", a later refresh that ends with an error and no summary, and a repeat run that is
again "not judged". Draft 1 (2026-11-04) was written from P-004's short plan, "Its Discovery, scaled to its
size" (docs/PROJECT.md Part 2, "Later work: the home-screen widget (P-004)").*

spec: P-004 (no spec yet; its short plan is docs/PROJECT.md Part 2, "Later work: the home-screen
widget (P-004)", "Its Discovery, scaled to its size")   milestone: none yet (M5 is proposed for
P-004, docs/PROJECT.md Part 2); run once the Builder's test widget is ready
runner:
- **The owner,** on their iPhone: about 15 minutes to make the key and install the test widget, then
  a day of normal refreshes, then returning the log through GitHub and deleting the key. No agent
  holds the key.
- **The Builder** makes the throwaway test widget on a local build/builder/ branch, never merged and
  never under src/public/, and records the result file from the Reviewer's verdict.
- **The Reviewer,** who did not make the test widget, judges the log against the pass mark.

result: docs/handover/experiments/EXP-007-result.md, recorded by the Builder from the Reviewer's
verdict
rulings: decisions/questions/P-001-home-screen-widget.md ("A: widget runs desk code (Recommended)";
Discovery measures first, and if it cannot, "the route comes back to the owner, with B or C as the
fallbacks the question named"); decisions/questions/P-004-widget-why-and-data.md ("Phone only
(Recommended)": key in the iPhone keychain, records on the phone only, nothing synced to iCloud;
its "Not ruled" point, the phone's own iCloud backup)
basis: docs/PROJECT.md Part 2, P-004's "Data on the phone" and "Its Discovery, scaled to its size";
intake/requests/P-004.toml; src/config/projects.json (three projects, Service-Desk,
Personal-Org-Operating-Model and Model-Lab, plus the portfolio, shumpmaster/portfolio: four
repositories); the request counts the plan cites, specs/S-001.md lines 4954-4955, 14611 and
14620-14621; src/lib/model.js:1-3 (the read model needs no network); the Builder's test widget,
src/widget-test/ (entry.js, judge.mjs) on build/builder/p004-test-widget

## Hypothesis
A Scriptable home-screen widget, run as the widget and not inside the Scriptable app, can make the
desk's reads for all three projects and the portfolio and run the desk's card-making code on them
within a widget refresh's time and memory.
- A later refresh, with what an earlier one kept, finishes and shows a correct summary.
- A first refresh, with nothing kept, may or may not finish in the widget.

Already known from making the test widget: the desk's card-making code (src/lib) ran packed into one
Scriptable file with no change to the desk. The Home tile's own count and its "Now:" line are page
code (src/public/sandbox.js), not in the copy, so the test widget shows the desk's per-project state
line and headline from src/lib. That difference is a point for P-004's Design gate, not part of this
test.

The size to expect, from the plan: a first read of one project can take up to about 400 GitHub
requests (up to 16 record-reading calls of up to 25 requests each, specs/S-001.md lines 4954-4955
and 14611); a later one makes one call listing what changed, of up to 30 requests (23 when nothing
changed, lines 14620-14621), plus up to 25 for each record-reading call the changes need (line
14611). Three projects and the portfolio multiply that.

The size measured, for information only and not part of the pass mark: the Builder's offline run on
local clones made 866 requests on a first refresh (Service-Desk 708, Personal-Org-Operating-Model 46,
Model-Lab 106, portfolio 4, GraphQL 2) and 29 to 39 on later refreshes. Service-Desk's 708 is above
the plan's "up to about 400" for one project.

## Method
1. The owner makes a fine-grained GitHub key on only the four repositories in
   src/config/projects.json (shumpmaster/Service-Desk, shumpmaster/Personal-Org-Operating-Model,
   shumpmaster/Model-Lab, shumpmaster/portfolio), with a 7-day expiry. Its repository permissions
   are all read-only: Contents, Pull requests, Actions, Commit statuses, and Checks if the token page
   offers it (Metadata is added automatically); nothing else. If Checks is not offered, the key is
   made without it and the result notes that; the effect is that a job candidate reads as an
   ordinary waiting pull request. The owner deletes the key after the test.
2. Before installing, the owner turns Scriptable's iCloud Drive off, so nothing it keeps can sync to
   iCloud. The owner then installs the test widget and runs it once in the Scriptable app, where it
   asks for the key and stores it in the iPhone keychain. Nothing is kept in Scriptable's iCloud
   folder, and the widget sends nothing anywhere but GitHub (docs/PROJECT.md Part 2, "Data on the
   phone").
3. The owner adds it to the home screen. Two kinds of refresh are measured: a first with nothing
   kept, and later ones with what the first kept. What it keeps is in Scriptable's local Caches
   folder, which the phone's backup leaves out but iOS may empty; the next refresh then logs
   `cache: false` and counts as a first refresh.
4. If the first refresh cannot finish in the widget, it is done once in the Scriptable app and kept,
   as the plan allows; the later refreshes then run in the widget. If it cannot finish in the app
   either, nothing is kept and no later refresh can run: the later-refresh condition fails, and the
   route goes back to the owner (see Deciding threshold).
5. The owner lets it refresh normally for a day that includes at least one busy stretch (several
   merges in an hour), or, if no such stretch happens, a refresh after a whole day's changes.
6. The owner returns the log through GitHub, never through a chat: from the Scriptable app's share
   sheet, Save to Files (On My iPhone); then on github.com, in Service-Desk, Add file → Upload
   files, onto a new branch `exp-007-log`. The Reviewer reads the log from that branch. After the
   result is filed, the owner deletes the branch; the log is not kept in the repository beyond it,
   and the result records the counts and outcomes.
7. The Reviewer, from build/builder/p004-test-widget, runs
   `node src/widget-test/judge.mjs <log> <four clone paths>`. For each `end`, it runs the desk's own
   code (readRecords, buildModel and the src/lib box) on each repository at the logged sha, at the
   refresh's time, and compares the four fields of each project's summary. Each project comes out
   match, mismatch, inconclusive (no match, and the project had open pull requests or pull-request
   or deploy items at that refresh, which a clone cannot rebuild), or not read. The Reviewer then
   checks each inconclusive one by hand against GitHub's records of those pull requests and deploys
   (their numbers and times, read through the GitHub API), where possible.

## Measure
The log: one JSON line per event, in Scriptable's on-phone Documents folder. That folder is copied
by the phone's iCloud backup, an unruled point (decisions/questions/P-004-widget-why-and-data.md,
"Not ruled"), so the log holds no project content.
- **`start`,** written before any read: the time, the run context (widget or app), and whether a
  kept cache was present (`cache`, true or false).
- **`detail`,** written before `end`: response status counts, requests per repository, any blocked
  hosts (the host only), record-reading calls per cycle, `skipMs`, the list of shims, and for each
  project its `shape`: `{read, kinds, openPulls}`.
- **`end`:** elapsed milliseconds; the GitHub request count; the response bytes read; the kept
  cache's size in bytes; for each of the four repositories, the default-branch commit sha it read;
  for each project, the summary as `{waiting, state, firstHash, headlineHash}`; and any error.
  - `state` is in plain words only when it is one of the desk's fixed state forms; otherwise it is
    `state: null` with a `stateHash`.
  - Each hash is the lowercase hex SHA-256 of the exact UTF-8 string.
  - An error is in fixed wording, or as `errorKind` with an `errorHash`.
- A `start` with no matching `end` counts as a refresh that did not finish (killed for time or
  memory).
- **Memory, measured only indirectly.** Scriptable gives a script no direct reading of its memory.
  So memory is judged by whether the refresh finished (no `end` means it was killed), with the
  response bytes and the cache size as proxies. A kill for memory and a kill for time cannot be told
  apart from the log.
- **Correct:** for a project, a match on all four fields between the logged summary and the desk's
  own code on the records at the logged shas; or, for an inconclusive one, the Reviewer's hand
  check against GitHub's records showing it is the desk's summary.

## Sample
One phone, one day, by design: there is one owner and one phone. Every refresh in the day is
logged; the later refreshes judged are those run as the widget, since the plan tests the widget,
not the app: "measure whether it can work at all, as a home-screen widget, not inside the
Scriptable app" (docs/PROJECT.md Part 2, "Its Discovery, scaled to its size").

## Exclusions
A refresh interrupted by something outside it (the phone offline, or GitHub's status page showing an
API incident at that time) is recorded and not counted. No other refresh is thrown out.

## Deciding threshold
The plan's pass mark, unchanged in substance (docs/PROJECT.md Part 2, "Its Discovery, scaled to its
size"):
- It passes if the later refresh finishes and shows a correct summary every time, over a day of
  normal refreshes that includes at least one busy stretch (several merges in an hour), or, if no
  such stretch happens, a refresh after a whole day's changes.
- A first refresh that cannot finish inside the widget may still pass if it can be done once inside
  the Scriptable app and kept; the owner then does that step at install and again if what the
  widget kept is lost, and the guide and the owner's time include it.
- If the later refresh fails, the route comes back to the owner, with the sender's summary or the
  counts-only widget as the fallbacks the question named, before any more work.

**How "a correct summary every time" is read** (so the Critic can check it does not change the pass
mark). It is applied to the later refreshes run as the widget, not excluded:
- A mismatch is an incorrect summary. An inconclusive one the Reviewer's hand check finds is not the
  desk's summary is also incorrect.
- A later refresh that was killed (a `start` with no `end`) is a refresh that did not finish.
- An inconclusive refresh is neither shown correct nor shown incorrect. The Reviewer checks it by
  hand, as Method 7 says, and lists any it cannot confirm.
- A project "not read", with no exclusion explaining it, is not a correct summary.
- A later refresh whose `end` has an error and no summary did not show a correct summary.
- So the pass needs zero incorrect summaries and zero unfinished later refreshes.
- If every later refresh in the busy stretch (or the end-of-day refresh) is unconfirmable, the
  result is "not judged": the test is run again once, and it is not passed. If that one repeat run
  is also "not judged", the route goes back to the owner, as for a fail, before any more work.
- If the first refresh cannot finish in the app either, no later refresh can run, so the
  later-refresh condition fails and the route goes back to the owner.

## Holdout use
none.

frozen: the last commit that changes this file on build/definer/p004-widget-exp, before any run
