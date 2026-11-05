# Experiment registration — EXP-007

*Pre-registered before any run (D-047). Frozen once the line below is set.*

*Draft 6 (2026-11-05), final: the Critic's round 3 notes (reviews/EXP-007/_critic-r3-verbatim.md).
Draft 5 (2026-11-05), from the Builder's test widget at 491baa7, which answers the Reviewer's FAIL at
9eeae80 (reviews/EXP-007/_reviewer-widget-9eeae80.md). Changed: `end.heads` logs every branch read,
failed ones included, and the replay serves the same failures (Measure; Method 8); the replay serves
exactly what was recorded, except a branch read logged as the same sha as the read before it, replayed
as a 304; the desk's code treats both alike (src/lib/github.js:292-295, 352; scheduler.js:916); a read no clone can serve is `missing-answer`, a miss on the portfolio
leaves every project not judged, and a start copy that can't be rebuilt has no fallback (Method 8);
the send reads the test branch first, and its guard is one per send and stateful (Method 7).
Draft 4 (2026-11-04), after the Critic's round 2, FAIL (reviews/EXP-007/_critic-r2-verbatim.md), and the
owner's ruling on the route for the test data. Changed: the widget sends the test data and the log to a branch of the private portfolio repository,
and the first draft's routes are withdrawn (finding 7); each refresh's snapshot holds the kept data it
started from, its 304 answers and every branch read, and the judge replays only that refresh's own
answers (findings 1, 2 and 6); the read states, and which of them a correct summary needs (3); what the
shared adapter covers, and what a fault found in it decides (4); one clock time for all four fields
(5); the run context (8); the judge's not-judged codes and the Reviewer's notes
(reviews/EXP-007/_reviewer-widget-b2b1711.md, 9a to 9d). Draft 3 answered the Critic's round 1;
Drafts 1 and 2 followed P-004's short plan and the Builder's first test widget.*

spec: P-004 (no spec yet; its short plan is docs/PROJECT.md Part 2, "Later work: the home-screen
widget (P-004)", "Its Discovery, scaled to its size")   milestone: none yet (M5 is proposed for
P-004, docs/PROJECT.md Part 2); run once this file is frozen
runner:
- **The owner,** on their iPhone: about 15 minutes to install (make the read key, install the test
  widget); a day of normal use; then about 10 minutes at the end: make the send key, send the test
  data, and clean up (delete the test data, both keys and the branch). If the run must be repeated
  (see Deciding threshold), one more day and about 10 minutes more. No agent holds either key.
- **The Builder** made the throwaway test widget on a local build/builder/ branch, never merged and
  never under src/public/, and records the result file from the Reviewer's verdict.
- **The Reviewer,** who did not make the test widget, judges the log against the pass mark.

result: docs/handover/experiments/EXP-007-result.md, recorded by the Builder from the Reviewer's
verdict
rulings: decisions/questions/P-001-home-screen-widget.md ("A: widget runs desk code (Recommended)";
Discovery measures first, and if it cannot, "the route comes back to the owner, with B or C as the
fallbacks the question named"); decisions/questions/P-004-widget-why-and-data.md ("Phone only
(Recommended)": key in the iPhone keychain, records on the phone only, nothing synced to iCloud;
its "Not ruled" point, the phone's own iCloud backup); decisions/questions/P-004-test-data-route.md,
the owner's answer, verbatim, "Widget sends it to portfolio (Recommended)", the card's option A,
recorded in docs/handoff/2026-11-04-chief-of-staff-widget.md, "The owner's answer to the data-route question"
(it stands there until its record follows PR #300): a one-off exception to "Phone only", for this
test only
basis: docs/PROJECT.md Part 2, P-004's "Data on the phone", "Done when, and how it is checked" and
"Its Discovery, scaled to its size"; intake/requests/P-004.toml; src/config/projects.json (three
projects, Service-Desk, Personal-Org-Operating-Model and Model-Lab, plus the portfolio,
shumpmaster/portfolio: four repositories); the request counts the plan cites, specs/S-001.md lines
4954-4955, 14611 and 14620-14621; the Builder's test widget, src/widget-test/ (entry.js, send.js,
snapshot.js, glue.js, judge.mjs, fakes.mjs) on build/builder/p004-test-widget at 491baa7; the Critic's
rounds 1 and 2 and the Reviewer's checks at b2b1711 and 9eeae80, reviews/EXP-007/

## Hypothesis
A Scriptable home-screen widget, run as the widget and not inside the Scriptable app, can make the
desk's reads for all three projects and the portfolio and run the desk's card-making code on them
within a widget refresh's time and memory.
- A later refresh, with a complete kept cache, finishes and shows a correct summary.
- A first refresh, with nothing kept, may or may not finish in the widget.

Already known from making the test widget: the desk's card-making code (src/lib) runs packed into one
Scriptable file with no change to the desk. The widget shows, for each project, the number waiting
as src/lib's box gives it (`box.flaggedCount`), with the desk's state line and headline from src/lib.
The Home tile's count is different code (`bd.counts`, src/lib/board.js, added to in
src/public/sandbox.js), so the two may differ. This test checks the src/lib summary against src/lib,
not against the tile; whether the widget should match the tile is a point for P-004's Design gate.

The size to expect, from the plan: a first read of one project can take up to about 400 GitHub
requests (specs/S-001.md lines 4954-4955 and 14611); a later one, one call of up to 30 requests (23
when nothing changed, lines 14620-14621), plus up to 25 for each record-reading call the changes need
(line 14611). Measured offline, for information only: 866 requests on a first refresh (Service-Desk
708, above the plan's "up to about 400" for one project) and 29 to 39 on later ones.

## Method
1. **The read key.** The owner makes a fine-grained GitHub key on only the four repositories in
   src/config/projects.json (shumpmaster/Service-Desk, shumpmaster/Personal-Org-Operating-Model,
   shumpmaster/Model-Lab, shumpmaster/portfolio), with a 7-day expiry. Its permissions are all
   read-only: Contents, Pull requests, Actions, Commit statuses, and Checks if the token page offers
   it; GitHub adds Metadata. Nothing else. If Checks is not offered, the key is made without it and
   the result notes that (a job candidate then reads as an ordinary waiting pull request). Besides
   the refreshes, the send (Method 7) uses it for its reads on portfolio.
2. The owner installs the test widget and runs it once in the Scriptable app, where it asks for the
   read key and keeps it in the iPhone keychain (`needs-you-widget-github-key`). The widget uses only
   the phone's local storage, never Scriptable's iCloud folder, and makes requests only to
   api.github.com (docs/PROJECT.md Part 2, "Data on the phone").
3. The owner adds it to the home screen. What it keeps is in Scriptable's local Caches folder, which
   the phone's backup leaves out but iOS may empty. The kept data is marked complete only when a
   refresh ends with no error. The judge sorts each refresh by its `start` line:
   - **`later`:** `context` is `widget` (run on the home screen; nothing else logs `widget`) and
     `cacheComplete` is true. Only these count toward the pass (Sample).
   - **`later (in the app)`** (`context: app`) and **`later (run another way)`** (`context: other`:
     Shortcuts, Siri) with a complete kept cache: reported, not counted.
   - **`first`:** every other refresh (no kept data, or kept data not marked complete). A first
     refresh that is killed does not fail the test.
4. If no first refresh finishes in the widget, the owner does it once in the Scriptable app, as the
   plan allows, and the later refreshes then run in the widget. If no refresh, in the widget or the
   app, ever ends with no error, no later refresh can run: that is a fail (see Deciding threshold).
5. The owner lets it refresh normally for a day that includes at least one busy stretch (several
   merges in an hour), or, if no such stretch happens, a refresh after a whole day's changes.
6. **Snapshots.** In the Caches folder only, each refresh saves the exact kept data it started from,
   and every GitHub answer a clone cannot rebuild (all but branches, git trees and git blobs), each
   address's answers in order, a 304 as a 304. It is saved at the start, before any read; at most
   every 5 seconds while it reads; and at the end. So a killed refresh still leaves what it started
   from and what it read. Bodies are stored once each, by content hash. The whole is bounded to
   20 MB, counting the bodies and each refresh's list of answers, the oldest refresh dropped first;
   every dropped refresh, its own included, is logged (`snapshot-dropped`) and not judged. A first
   refresh's snapshot is expected to be hundreds of KB to a few MB. The log keeps its last 2000 lines;
   one day stays far below that, and "Delete test data" clears the log before any repeat run.
7. **The route for the test data** (the owner's ruling, option A: a one-off exception to "Phone only").
   - At the end of the day, in the Scriptable app, the owner taps "Send the test data". The widget asks
     for the second key, the **send key**, and keeps it in the iPhone keychain
     (`needs-you-widget-portfolio-send-key`). The owner makes it just before: fine-grained, on
     portfolio only, Contents read and write and nothing else (GitHub adds Metadata), 7-day expiry.
   - The widget builds the test data (the snapshot as one JSON) and the log in memory only, and sends
     both through GitHub's Git Data API to a new branch, `exp-007-test-data`, of the **private**
     repository shumpmaster/portfolio, as `exp-007/test-data.json` and `exp-007/log.jsonl`. Nothing
     goes through Files or the share sheet.
   - **Its reads on portfolio,** in this order, all with the read key (only its writes use the send
     key): the test branch's ref (`git/ref/heads/exp-007-test-data`); main's ref
     (`git/ref/heads/main`) only when the branch's read answers 404; then the parent commit
     (`git/commits/<parent>`), for its tree. The parent is the branch's head when the branch exists,
     else main's head; its tree is the base. When the branch exists, main is not read, and no commit
     is made from main.
   - **Its writes,** each once and in order: two blobs, a tree, a commit, and the ref write (a new
     branch, or a non-force move of the existing one; a 422 is logged as "it changed during the send").
     A blob write whose answer fails is not counted, and the send stops at the first failure.
   - GitHub cannot narrow a key to one branch: the send key could also change portfolio's main, which
     the desk reads. The widget's request guard (send.js) is the only limit. It is one per send and
     stateful, and refuses, before sending, any request but the next one above: `base_tree` must be the
     parent's tree this send read; the tree exactly the two distinct paths, each entry with only
     `path`, `mode`, `type` and `sha`, naming one of this send's two blobs; the commit that tree with
     the one parent this send read; and the ref write naming this send's commit, as a create only when
     the branch was absent and as a move only when it existed. It does not tie each blob to its path
     (both stay on the test branch). A branch protection rule on portfolio's
     main is an optional second limit the owner may add.
   - Portfolio has no workflows, and the desk reads only its main branch, so the branch starts nothing
     and shows nowhere. Do not open a pull request.
   - The Reviewer fetches the branch into its working session (its portfolio clone) and runs the judge
     there (Method 8).
   - After the result is filed, the owner runs "Delete test data (after sending it)" (it removes the
     snapshot, the kept data and the log from the phone) and "Forget keys", deletes both keys on
     GitHub, and deletes the branch. A deleted branch's commits can still be fetched for a while, by
     the owner and anything they have given read access to portfolio, including the GitHub access
     these sessions use. The result records the counts and outcomes.
   - **Withdrawn:** the first draft's routes, saving to Files and uploading to Service-Desk. Files
     puts the data in the phone's backup and can default to iCloud Drive; and Service-Desk is a
     **public** repository, so uploading there would have published the private projects' records.
8. **Judging.** The Reviewer takes the two files from the branch, makes sure each clone holds the
   logged commits (fetching them), and from a checkout of build/builder/p004-test-widget at 491baa7
   runs `node src/widget-test/judge.mjs log.jsonl --snapshot test-data.json <Service-Desk clone>
   <Personal-Org-Operating-Model clone> <Model-Lab clone> <portfolio clone>`. For each `end`, it runs
   the desk's own code on what that refresh read and compares the four fields of each project's
   summary. It has no fallbacks:
   - **Start:** the kept data from that refresh's snapshot (the widget saves it for every refresh). A
     start copy the judge can't rebuild is not judged (`chain-not-reproducible`), never replaced by the
     judge's own carried copy. (The judge carries its own only for a snapshot holding no start copy,
     which this widget never writes.)
   - **Answers:** each branch read served as `end.heads` logged it, in order: a commit from the clone at
     that commit, a `{status}` (304 included) as that status, `{error: "network"}` as a network failure.
     A repository whose every branch read failed is judged against those failures, not skipped. Trees
     and blobs come from the clone at the commit read. Everything else comes only from that refresh's
     own saved answers, each address's in order, served exactly as recorded: a recorded 200 is never
     turned into a 304. (A branch read logged as the same sha as the read before it is replayed as a
     304; the desk's code treats both alike: src/lib/github.js:292-295, 352; scheduler.js:916.) Not judged (`missing-answer`): a request the saved answers don't hold; a
     branch, tree or blob read no clone can serve, `{status: 200, error: "body"}` and a read past the
     logged list included. A miss on the project's own repository leaves that project not judged; a
     miss on the portfolio, which is no project's, leaves every project not judged.
   - **Clock:** the replay runs at the refresh's start time. A project that differs is replayed again
     at the end time and each whole minute between, since some state words hold a time ("Can't read
     since HH:MM"). It matches only when all four fields match in one replay, at one clock time.
   - **How independent it is.** The judge runs the desk's own src/lib, unpacked, under Node. So it
     tests the packed copy running in the phone's JavaScriptCore inside a home-screen widget, and the
     Scriptable request wrapper (entry.js, not shared), against the desk's code on the same records.
     It does not test the small adapter both sides share, glue.js: its copies of the desk function's
     body checks, the skipped Access check, the clock-skipping driver and its stop rule, and the
     summary built from `box.flaggedCount`. A fault there is the same on both sides and still
     matches. The Builder's harness cross-checks the adapter against the sender's own reader only for
     projects with no pull requests. Job logs, refused as off-GitHub, are hidden on both sides. The
     Reviewer reads glue.js as part of the judging; a fault found there that would change a summary
     makes the result not judged, and the route goes to the owner (Deciding threshold).
   - **Outcomes:** each project is `match`, `mismatch` or `not judged`, with one of the judge's codes:
     `no-snapshot`, `unknown-sha`, `missing-answer`, `chain-not-reproducible`, `no-summary-logged`.
     A crash of the desk's code during the replay is a `mismatch`. There is no hand check. This is the
     plan's comparison, "the desk's own code run on the records as they stood then", and its Success
     line, "a test that runs both on the same sample records".

## Measure
The log: one JSON line per event, in Scriptable's on-phone Documents folder. That folder is copied by
the phone's iCloud backup, an unruled point (decisions/questions/P-004-widget-why-and-data.md, "Not
ruled"), so the log holds no project content. Every event carries `ev` and `id`.
- **`start`,** before any read: `at`, `context` (`widget` | `app` | `other`), `cache`,
  `cacheComplete`.
- **`snapshot-dropped`:** `id` only, for each refresh whose snapshot the bound dropped.
- **`detail`,** before `end`: `statuses`, `perRepo`, `blocked` (hosts only), `polls` (record-reading
  calls per cycle), `steps`, `calls`, `skipMs`, `portfolio`, `shape`, `snapshotBytes`, `shimmed`. Each
  project's `shape` is `{read, kinds, openPulls}`, with `read` one of `ok`, `cant-read` or `checking`
  (stopped before done).
- **`end`:** `at`, `ms`, `requests`, `bytes`, `cacheBytes`; `shas` (each repository's default-branch
  commit); `heads` (every branch read of each repository, in order: a 200 as its commit; a 304 as the
  commit read before it in this refresh, else `{status: 304}`; a 200 whose body is no branch as
  `{status: 200, error: "body"}`; any other answer as `{status}`; a network failure as
  `{error: "network"}`); `summary`; `error`; and `snapshot` (true or false). Each project in `summary` is
  `{waiting, state, stateHash, firstHash, headlineHash}`, with `state` in plain words only when it is
  one of the desk's fixed state forms, else null with `stateHash` (present only then). An error is in
  fixed wording, or the unexpected-error wording with `errorKind` and `errorHash`.
- **`sent`:** `at`, `commit`, `bytes`, `created`, `requests`.
- **`send-failed`:** `at`, `error` (fixed words), `step`, `status`, `requests`, `errorKind`,
  `errorHash`.
- Each hash is the lowercase hex SHA-256 of the exact UTF-8 string. The hashes are not secret: anyone
  who can read the repositories could guess a short title or headline and check its hash.
- A `start` with no matching `end` is a refresh that did not finish (killed for time or memory).
- **Memory, measured only indirectly.** Scriptable gives a script no reading of its memory, so memory
  is judged by whether the refresh finished, with the response bytes and the cache size as proxies.
  A kill for memory and a kill for time cannot be told apart.
- **Correct:** for a project, its `shape.read` is `ok` and it is a `match` on all four fields at one
  clock time (Method 8).

## Sample
One phone, one day, by design: there is one owner and one phone. Every refresh in the day is logged;
the later refreshes judged are those run as the widget, since the plan tests the widget, not the app:
"measure whether it can work at all, as a home-screen widget, not inside the Scriptable app"
(docs/PROJECT.md Part 2, "Its Discovery, scaled to its size").

## Exclusions
A refresh interrupted by something outside it (the phone offline, or a GitHub API incident at that
time) is recorded and not counted. No other refresh is thrown out.
- The Reviewer decides an exclusion from three things only: the log's fixed words (a project's
  "Can't read" reason, or `end`'s `errorKind`), GitHub's status history for that time, and the
  owner's word. No other reason excludes a refresh.
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
  the Scriptable app and kept; the owner then does that step at install and again if what the widget
  kept is lost, and the guide and the owner's time include it.
- If the later refresh fails, the route comes back to the owner, with the sender's summary or the
  counts-only widget as the fallbacks the question named, before any more work.

**How "a correct summary every time" is read** (so the Critic can check it does not change the pass
mark). It applies to the counted later refreshes: kind `later`, not excluded. The Reviewer applies
this, not the judge's printed label.
- **Pass:** every counted later refresh finishes, and every project in it read `ok` and is a `match`.
- **Fail:** any of these:
  - a `mismatch` on any project (a replay crash included);
  - a counted later refresh that did not finish (a `start` with no `end`);
  - a project at `checking` (stopped before done): not a correct summary;
  - a project at `cant-read` with no exclusion explaining it: not a correct summary;
  - a counted later refresh whose `end` has an error, whatever label the judge prints (it prints
    `no-summary-logged`): it did not show a correct summary;
  - no refresh, in the widget or the app, ever ending with no error, so no later refresh can run.
- **Not judged:** if any counted later refresh has a project `not judged`, and nothing above fails the
  test, the whole result is "not judged", not a pass. The test is then run once more. If it is not
  judged again, the route goes back to the owner, as for a fail, before any more work.
- **A fault in glue.js** that the Reviewer finds and that would change a summary makes the result not
  judged, whatever the judge prints, and the route goes straight to the owner: a rerun would share
  the fault.
- A fail sends the route back to the owner, with the fallbacks above, before any more work.

## Holdout use
none.

Before freezing: the Reviewer passed the test widget at 491baa7 (reviews/EXP-007/_reviewer-widget-491baa7.md) and the Critic passed this registration at round 3 (reviews/EXP-007/critic.md), so this commit is the frozen one.

frozen: the last commit that changes this file on build/definer/p004-widget-exp, before any run
