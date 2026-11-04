# Experiment registration — EXP-007

*Pre-registered before any run (D-047). Frozen once the line below is set.*

*Draft 3 (2026-11-04), after the Critic's round 1, FAIL (reviews/EXP-007/_critic-r1-verbatim.md).
The "inconclusive" outcome and the Reviewer's hand check are gone (blockers 1 and 2). Each refresh
now saves the GitHub responses a clone cannot rebuild, and the judge replays them, so every project
is `match`, `mismatch` or `not judged`, with "not judged" deciding nothing by itself. A later refresh
is now defined by a complete kept cache (blocker 3). Also: the tile line is corrected (note 4); what
happens to excluded refreshes and who decides an exclusion (note 6); the owner's added time (note 7);
the owner's steps (note 8); the hashes are not secret, and freezing waits for the Builder's change
and the Reviewer's check (note 9). Within Draft 3, from the Builder's changed test widget at
4a2684e: the log's new fields, the judge's command, the three refresh kinds, the owner's "Share the
test data" step, the judge's clock, how independent the judge is, and the snapshot's expected
size.*

*Draft 2 (2026-11-04) followed the Builder's finished test widget (src/widget-test/ on the local
branch build/builder/p004-test-widget, never merged). Draft 1 (2026-11-04) was written from P-004's
short plan, "Its Discovery, scaled to its size" (docs/PROJECT.md Part 2, "Later work: the
home-screen widget (P-004)").*

spec: P-004 (no spec yet; its short plan is docs/PROJECT.md Part 2, "Later work: the home-screen
widget (P-004)", "Its Discovery, scaled to its size")   milestone: none yet (M5 is proposed for
P-004, docs/PROJECT.md Part 2); run once the Builder's changed test widget is ready and this file is
frozen
runner:
- **The owner,** on their iPhone: about 15 minutes to make the key and install the test widget, then
  a day of normal refreshes, then about 5 minutes to return two files through GitHub, and deleting
  the key. If the run must be repeated (see Deciding threshold), one more day and about 10 minutes
  more. No agent holds the key.
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
basis: docs/PROJECT.md Part 2, P-004's "Data on the phone", "Done when, and how it is checked" and
"Its Discovery, scaled to its size"; intake/requests/P-004.toml; src/config/projects.json (three
projects, Service-Desk, Personal-Org-Operating-Model and Model-Lab, plus the portfolio,
shumpmaster/portfolio: four repositories); the request counts the plan cites, specs/S-001.md lines
4954-4955, 14611 and 14620-14621; src/lib/model.js:1-3 (the read model needs no network); the
Builder's test widget, src/widget-test/ (entry.js, glue.js, judge.mjs) on
build/builder/p004-test-widget at 4a2684e; the Critic's round 1, reviews/EXP-007/_critic-r1-verbatim.md

## Hypothesis
A Scriptable home-screen widget, run as the widget and not inside the Scriptable app, can make the
desk's reads for all three projects and the portfolio and run the desk's card-making code on them
within a widget refresh's time and memory.
- A later refresh, with a complete kept cache, finishes and shows a correct summary.
- A first refresh, with nothing kept, may or may not finish in the widget.

Already known from making the test widget: the desk's card-making code (src/lib) ran packed into one
Scriptable file with no change to the desk. The widget shows, for each project, the number waiting
as src/lib's box gives it (`box.flaggedCount`), with the desk's state line and headline from
src/lib. The Home tile's count is different code: `bd.counts`, built in src/lib/board.js and added to
in src/public/sandbox.js. So the widget's "waiting" number may differ from the Home tile's, and this
test checks the src/lib summary against src/lib, not against the tile. Whether the widget should
match the tile is a point for P-004's Design gate, not part of this test.

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
2. The owner installs the test widget and runs it once in the Scriptable app, where it asks for the
   key and stores it in the iPhone keychain. The widget uses only the phone's local storage, never
   Scriptable's iCloud folder, and sends nothing anywhere but GitHub (docs/PROJECT.md Part 2, "Data
   on the phone").
3. The owner adds it to the home screen. What it keeps is in Scriptable's local Caches folder, which
   the phone's backup leaves out but iOS may empty. The kept data is marked complete only when a
   refresh ends with no error.
   The judge sorts each refresh into one of three kinds:
   - **`later`:** run as the widget, with `start` logging `cacheComplete: true`. Only these count
     toward the pass, as the widget-only reading in Sample says.
   - **`later (in the app)`:** run in the Scriptable app with a complete kept cache. Reported, not
     counted.
   - **`first`:** every other refresh (no kept data, or kept data not marked complete). A first
     refresh that is killed does not fail the test.
4. If no first refresh finishes in the widget, the owner does it once in the Scriptable app, as the
   plan allows, and the later refreshes then run in the widget. If no refresh, in the widget or the
   app, ever ends with no error, no later refresh can run: that is a fail (see Deciding threshold).
5. The owner lets it refresh normally for a day that includes at least one busy stretch (several
   merges in an hour), or, if no such stretch happens, a refresh after a whole day's changes.
6. **Snapshots.** On each refresh the widget also saves, in Scriptable's local Caches folder only,
   every GitHub response a clone cannot rebuild: everything except branches, trees and blobs. They
   are stored by content hash, bounded to about 20 MB, the oldest dropped first. This file holds
   project content, which is why it stays out of the backed-up Documents folder. A first refresh's
   snapshot is expected to be hundreds of KB to a few MB, under the bound. When a refresh's
   snapshot is dropped, the log says so (`snapshot-dropped`), and that refresh is not judged.
7. The owner makes the second file with the app menu's "Share the test data" (the first is "Share
   the log"). The owner returns the two files, the log and the test data, through GitHub only, never through
   a chat, so project content goes only to GitHub, as Part 1 section 5 allows: from the Scriptable
   app's share sheet, Save to Files (On My iPhone); then on github.com, in Service-Desk, Add file →
   Upload files, committing directly to a new branch `exp-007-log`. Do not open a pull request (it
   would start the desk's workflows and show on the desk). The Reviewer reads both files from that
   branch. After the result is filed, the owner deletes the branch; the result records the counts
   and outcomes. A deleted branch's commits can still be fetched by their sha for a while.
8. The Reviewer, from build/builder/p004-test-widget, runs
   `node src/widget-test/judge.mjs <log> --snapshot <test-data.json> <four clones>`. For each `end`,
   it runs the desk's own code on each repository at the logged sha, replaying the exact GitHub
   responses that refresh saved, and compares the four fields of each project's summary.
   - **Clock:** it replays at the refresh's start time. For a state mismatch, it also tries the end
     time and each minute in between, and a match at any of those is a match, since some state
     words hold a time (such as "Can't read since HH:MM").
   - **How independent it is:** the judge runs the desk's own src/lib, unpacked, under Node, fed the
     same GitHub answers through the same small adapter (glue.js) the widget uses. So it tests
     whether the packed copy, running in the phone's JavaScriptCore inside a home-screen widget,
     gives the desk's result for the same records. The adapter itself is cross-checked in the
     Builder's harness against the sender's own path (readRecords and buildModel) for projects with
     no pull requests, and the Reviewer reads glue.js as part of the judging.
   - Each project is `match`, `mismatch` or `not judged` (no snapshot or a dropped one, a sha the
     clone does not have, or a needed response not in the snapshot). There is no hand check. This is the plan's comparison: "the desk's own code run on
   the records as they stood then", and its Success line, "a test that runs both on the same sample
   records".

## Measure
The log: one JSON line per event, in Scriptable's on-phone Documents folder. That folder is copied
by the phone's iCloud backup, an unruled point (decisions/questions/P-004-widget-why-and-data.md,
"Not ruled"), so the log holds no project content.
- **`start`,** written before any read: the time, the run context (widget or app), whether kept
  data was present (`cache`, true or false), and whether it was marked complete (`cacheComplete`,
  true or false).
- **`detail`,** written before `end`: response status counts, requests per repository, any blocked
  hosts (the host only), record-reading calls per cycle, `skipMs`, the list of shims, the snapshot's
  size (`snapshotBytes`), and for each project its `shape`: `{read, kinds, openPulls}`.
- **`snapshot-dropped`:** `{"ev":"snapshot-dropped","id"}`, when a refresh's snapshot is dropped.
- **`end`:** elapsed milliseconds; the GitHub request count; the response bytes read; the kept
  cache's size in bytes; whether a snapshot was saved (`snapshot`, true or false); for each of the
  four repositories, the default-branch commit sha it read; for each project, the summary as
  `{waiting, state, firstHash, headlineHash}`; and any error.
  - `state` is in plain words only when it is one of the desk's fixed state forms (its standard
    phrases); otherwise it is `state: null` with a `stateHash`.
  - Each hash is the lowercase hex SHA-256 of the exact UTF-8 string. The hashes are not secret:
    anyone who can read the repositories could guess a short title or headline and check its hash.
  - An error is in fixed wording, or as `errorKind` with an `errorHash`.
- A `start` with no matching `end` counts as a refresh that did not finish (killed for time or
  memory).
- **Memory, measured only indirectly.** Scriptable gives a script no direct reading of its memory.
  So memory is judged by whether the refresh finished (no `end` means it was killed), with the
  response bytes and the cache size as proxies. A kill for memory and a kill for time cannot be told
  apart from the log.
- **Correct:** for a project, a `match` on all four fields between the logged summary and the
  judge's replay, with the state compared over the clock window in Method 8.

## Sample
One phone, one day, by design: there is one owner and one phone. Every refresh in the day is
logged; the later refreshes judged are those run as the widget, since the plan tests the widget,
not the app: "measure whether it can work at all, as a home-screen widget, not inside the
Scriptable app" (docs/PROJECT.md Part 2, "Its Discovery, scaled to its size").

## Exclusions
A refresh interrupted by something outside it (the phone offline, or a GitHub API incident at that
time) is recorded and not counted. No other refresh is thrown out.
- The Reviewer decides an exclusion from three things only: the log's `errorKind` (a network
  error), GitHub's status history for that time, and the owner's word. No other reason excludes a
  refresh.
- An excluded refresh is run again by the next normal refresh; nothing extra is needed.
- If every refresh in the busy stretch is excluded, the end-of-day refresh (after a whole day's
  changes) is the condition instead.

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
mark). It applies to the counted later refreshes: those of kind `later` (run as the widget with
`cacheComplete: true`) and not excluded.
- **Pass:** every counted later refresh finishes and is `match` on every project.
- **Fail:** any of these:
  - a `mismatch` on any project;
  - a counted later refresh that did not finish (a `start` with no `end`);
  - a project "not read", with no exclusion explaining it (not a correct summary);
  - a counted later refresh whose `end` has an error and no summary (it did not show a correct
    summary);
  - no refresh, in the widget or the app, ever ending with no error, so no later refresh can run.
- **Not judged:** if any counted later refresh has a project `not judged`, and nothing above fails
  the test, the whole result is "not judged", not a pass. The test is then run once more. If it is
  not judged again, the route goes back to the owner, as for a fail, before any more work.
- A fail sends the route back to the owner, with the fallbacks above, before any more work.

## Holdout use
none.

Before freezing: this file is frozen only after the Builder's change to the test widget lands and
the Reviewer confirms that no raw state, error text or other project content reaches the Documents
folder.

frozen: the last commit that changes this file on build/definer/p004-widget-exp, before any run
