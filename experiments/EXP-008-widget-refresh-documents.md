# Experiment registration — EXP-008

*Pre-registered before any run (D-047). Frozen once the line below is set.*

*Draft 3 (2026-11-07), by the Definer, final: the last draft before the Critic's round 3, the
limit (D-044), and the version to freeze if round 3 passes. It answers the Critic's round 2, FAIL
(reviews/EXP-008/, round 2), and the Reviewer's PASS of the test widget at 92caf00
(reviews/EXP-008/_reviewer-widget-92caf00.md). The widget is unchanged; only the rules change:
- every line after the last `send-start` in the sent log is ignored, so a refresh that starts while
  the send is under way can never count (Critic round 2, finding 1);
- F6 needs a first read in the app that was really tried: one that reached its `end` with an
  error, or one the owner reports was not interrupted; Method 6 tells the owner to keep Scriptable
  open until the read shows its result (finding 2);
- N1 and N3 name the case this test exists to find, a widget that does not share the app's
  Documents, and the owner reports what the widget showed (finding 3);
- N0 reads the sent log, and trimming overrides F6 (finding 4);
- merge commits that belong to no pull request count as merges too, and the pull request list must
  cover the whole run (finding 5);
- a second send and a failed confirmation are covered (finding 6);
- Pass (b) loses its untestable clause (finding 7);
- the two edges at the ends of the run are made rules and disclosed (finding 8);
- a 200 whose body is no branch is replayed exactly as recorded, as the judge does (Reviewer,
  finding 1);
- a log that will not parse has its own not-judged code, and the judge is not run on it (Reviewer,
  finding 5a); the judge's other limits are disclosed (5b, 5c);
- the Reviewer's three small points on Draft 2 (finding 9), and that `Timer` inside a home-screen
  widget is unverified, so a missing `alive` mark is not itself evidence of when a refresh died.
Draft 2 answered the Critic's round 1 and matched every log name to the widget at 92caf00; Draft 1
followed the owner's ruling and EXP-007's frozen registration.*

spec: P-004 (no spec yet; its short plan is docs/PROJECT.md Part 2, "Later work: the home-screen
widget (P-004)", "Its Discovery, scaled to its size")   milestone: none yet (M5 is proposed for
P-004, docs/PROJECT.md Part 2); run once this file is frozen
runner:
- **The owner,** on their iPhone: about 15 minutes to set up (switch Scriptable off in iCloud
  Backup, make the read key, install the test widget, do the first read in the app if needed); a
  quick daily check of the iCloud Backup switch until the phone's test data is deleted; at least a
  day of normal use (see Sample); then about 10 minutes at the end: make the send key, send the test
  data, and, once the Reviewer confirms the sent copy, delete the phone's test data and forget the
  keys. No agent holds either key.
- **The Builder** made the throwaway test widget and its judge on the local branch
  build/builder/p004-exp008-widget, never merged and never under src/public/, at 92caf00
  (92caf00b9e5f98bd4cd0687fbe6ea87e8606cf7d), which the Reviewer passed
  (reviews/EXP-008/_reviewer-widget-92caf00.md). The file the owner
  installs is src/widget-test/needs-you-test.js at that commit (351,274 bytes, SHA-256
  4c88f8150e6980a12cee46e7640a9e5c85438e2ae161a6497f4b1c42c9494b79). The Builder files the result
  file from the Reviewer's verdict.
- **The Reviewer,** who did not make the test widget, checked the widget before this file was frozen
  and judges the log against the pass mark.

result: docs/handover/experiments/EXP-008-result.md, filed by the Builder from the Reviewer's
verdict, in a commit with no `Spec:` trailer, exempted with its own ledger entry
(decisions/questions/P-004-result-spec.md, ruling A)
rulings: decisions/questions/P-004-widget-next-step.md, ruling A, "Second test, data kept in
Documents (Recommended)": the option text the owner approved sets this test's storage, its iCloud
Backup step and what follows a fail or another not-judged result; decisions/questions/P-004-result-spec.md,
ruling A, "Exempt each such commit (Recommended)", for this file's commits and the result's;
decisions/questions/P-004-test-data-route.md, ruling A, "Widget sends it to portfolio
(Recommended)", which ruling A of P-004-widget-next-step extends to this test ("The test data comes
back by the route you allowed last time, which this extends to the second test");
decisions/questions/P-004-widget-why-and-data.md, ruling A, "Phone only (Recommended)", and its
"Not ruled" point, the phone's own iCloud backup, which stays for P-004's Design gate;
decisions/questions/P-001-home-screen-widget.md ("A: widget runs desk code (Recommended)")
basis: docs/PROJECT.md Part 2, P-004's "Data on the phone", "Done when, and how it is checked" and
"Its Discovery, scaled to its size"; experiments/EXP-007-widget-refresh.md (frozen at ad2709e);
docs/handover/experiments/EXP-007-result.md; reviews/EXP-007/_reviewer-result.md;
reviews/316/_reviewer-verbatim.md; src/config/projects.json (three projects, Service-Desk,
Personal-Org-Operating-Model and Model-Lab, plus the portfolio, shumpmaster/portfolio: four
repositories); the request counts the plan cites, specs/S-001.md lines 4954-4955, 14611 and
14620-14621; the Builder's test widget, src/widget-test/ on build/builder/p004-exp008-widget at
92caf00 (README.md; entry.js, phone.js, send.js, glue.js, sha256.js, judge.mjs, fakes.mjs); the
Reviewer's check of it, reviews/EXP-008/_reviewer-widget-92caf00.md

## Why this is a new test, not a re-run of EXP-007
EXP-007 stays **not judged** (docs/handover/experiments/EXP-007-result.md). Nothing in this test
changes that result, and none of EXP-007's refreshes is counted here. The owner's ruling says so in
its own words: "The second test is written down as a new test" and "The first test's result stays
not judged" (decisions/questions/P-004-widget-next-step.md, option A).

The reason is that the method changes. EXP-007's frozen method puts the kept copy and the snapshots
in Scriptable's Caches folder (its Method 3 and 6). The evidence from its run is that the home-screen
widget does not see that folder, while it does share Documents (reviews/EXP-007/_reviewer-result.md,
finding 5: "Strong but indirect; nobody listed the folders"). This test moves the storage, adds new
log fields, uses new keys, and has a rule for a run with no counted later refresh. A frozen
registration can take none of these.

## Hypothesis
A Scriptable home-screen widget, run as the widget and not inside the Scriptable app, can make the
desk's reads for all three projects and the portfolio and run the desk's card-making code on them
within a widget refresh's time and memory, when what it keeps is in Scriptable's local Documents
folder.
- The widget sees a complete kept copy that a refresh in the app (or in the widget) saved there.
- A later refresh, with a complete kept copy, finishes and shows a correct summary.
- A first refresh, with nothing kept, may or may not finish in the widget. In EXP-007 the widget's
  first refreshes were all stopped within seconds, and the app's first read took 1,033 requests in
  about two minutes, so the first read is expected to be done in the app.

Already known: the desk's card-making code (src/lib) runs packed into one Scriptable file with no
change to the desk (EXP-007). The widget shows, for each project, the number waiting as src/lib's box
gives it (`box.flaggedCount`), with the desk's state line and headline from src/lib. The Home tile's
count is different code (`bd.counts`, src/lib/board.js, added to in src/public/sandbox.js), so the
two may differ. This test checks the src/lib summary against src/lib, not against the tile; whether
the widget should match the tile is a point for P-004's Design gate.

The size to expect, from the plan:
- a first read of one project can take up to about 400 GitHub requests (specs/S-001.md lines
  4954-4955 and 14611);
- a later one, one call of up to 30 requests (23 when nothing changed, lines 14620-14621), plus up
  to 25 for each record-reading call the changes need (line 14611).

Measured in EXP-007, for information only: 1,033 requests on the first read in the app
(Service-Desk 796, about twice the plan's "about 400"), and 85 and 46 on later reads in the app.

## Method
1. **iCloud Backup off for Scriptable, from before install until the phone's test data is deleted**
   (ruling A of P-004-widget-next-step). Everything the widget keeps is in Documents, which the
   phone's iCloud backup copies. Whether that backup is allowed is not ruled and stays for the
   Design gate. For this test only:
   - **Before installing** the widget, the owner switches Scriptable off in the phone's iCloud Backup
     settings (Settings, the owner's name, iCloud, iCloud Backup, the list of apps). People report
     that this deletes the app's backed-up data, and that the switch can turn itself back on.
   - **Once a day,** from install until "Delete test data (after sending it)" has run on the phone
     (Method 8), the owner checks the switch. This covers the time after the send, while the data is
     still on the phone.
   - **If it is back on,** the owner's records may already be in a backup. The owner switches it off
     again (reported to delete them) and reports it, with the day it was found (Method 11). The test
     carries on. A report does not exclude any refresh.
   - **Switching it back on.** The owner may switch Scriptable back on only after "Delete test data
     (after sending it)" has run. That leaves one small log file holding the reset line (Method 8),
     which has no project content.
   - The result records each report, or that there was none.
2. **The read key, new for this test.** EXP-007's keys are not reused; they are left to expire, and
   the widget uses keychain names of its own (Method 3).
   - At install the owner makes a new fine-grained GitHub key on only the four repositories in
     src/config/projects.json (shumpmaster/Service-Desk, shumpmaster/Personal-Org-Operating-Model,
     shumpmaster/Model-Lab, shumpmaster/portfolio), with a 7-day expiry.
   - Its permissions are all read-only: Contents, Pull requests, Actions, Commit statuses, and Checks
     if the token page offers it. GitHub adds Metadata. Nothing else.
   - If Checks is not offered, the key is made without it. A job candidate then reads as an ordinary
     waiting pull request.
   - **The owner notes whether the token page offered Checks** and reports it with the install
     (Method 11). The Reviewer's verdict states it and the result records it. EXP-007 never confirmed
     this (reviews/316/_reviewer-verbatim.md, open question).
   - Besides the refreshes, the send (Method 8) uses this key for its reads on portfolio.
   - The key expires 7 days after it is made, so the run and the send fit in that time.
3. **A clean start, and the install.**
   - The widget's files, keys and log are its own. It works only in the folder
     Documents/needs-you-exp008/ and the keychain names `needs-you-exp008-read-key` and
     `needs-you-exp008-send-key`. It never reads, lists or removes EXP-007's files or keys
     (src/widget-test/phone.js:4).
   - EXP-007's phone data was already deleted and its keys forgotten. The owner reported it, "all
     good on my end" (docs/handoff/2026-11-04-chief-of-staff-widget.md, "Update: EXP-007 cleaned
     up").
   - The owner installs the file needs-you-test.js (runner, above) in Scriptable.
   - The owner runs it once in the Scriptable app, where it asks for the read key and keeps it in the
     iPhone keychain, then makes a first read in the app at once (entry.js:472-478). That first
     refresh finds no needs-you-exp008 folder and logs `install`.
   - The widget makes requests only to api.github.com (docs/PROJECT.md Part 2, "Data on the
     phone").
4. **Storage.** Everything the widget writes is in Scriptable's **local Documents folder** on the
   phone (`FileManager.local().documentsDirectory()`), under needs-you-exp008/. It never writes to
   Scriptable's iCloud folder, the Caches folder or temporary files. The keys are only in the
   keychain.

   | File | What it holds |
   |---|---|
   | `kept-store.txt` | the kept copy |
   | `kept-meta.json` | about the kept copy: complete or not, which refresh saved it and when, its length |
   | `log/l-<id>.jsonl` | the log: one file per refresh or menu action, the newest 600 kept |
   | `snap/r-<id>.json` | one refresh's snapshot list |
   | `snap/b-<bodyHash>-<bytes>.txt` | one stored body |

   - Sizes to expect: the kept copy about 1 MB (EXP-007: 1.05 to 1.08 MB), and the snapshots several
     MB (EXP-007's last was 7.4 MB). The snapshots are bounded to 20 MB (Method 7).
   - The Reviewer confirms, when checking the widget, that no path the widget writes is outside this
     folder.
5. **The kept copy, and kinds of refresh.**
   - **When the copy changes.** A refresh saves the kept copy only at its end, after the desk's code
     has run. It is saved and closed before `end` is logged.
     - A refresh with no error saves the copy marked complete; its `end` has `kept: "complete"` and
       `error: null`.
     - If that save fails, `end` has `kept: "failed"` and `error: "kept copy not saved"`.
     - A refresh with an error, which started from a copy not marked complete, holds a read key and
       read something, saves what it read, marked not complete (`kept: "incomplete"`;
       entry.js:311).
     - Any other refresh with an error leaves the copy as it was (`kept: "unchanged"`): one that
       started from a complete copy, one with no read key, or one that read nothing.
     - A refresh killed before its end saves nothing.
     - So an `end` with `error: null` always means a complete copy was saved, and any save is followed
       by its `end` line unless the refresh is killed between the two.
     - `kept-meta.json` records the id and time of the refresh that last saved the copy, and whether
       that save was complete. Every `start` logs them as `kept` (Measure).
     - Only "Delete test data" removes the copy.
     - (src/widget-test/entry.js:299-320.)
   - **Kinds,** from each refresh's `start` line, as the judge sorts them (judge.mjs `kindOf`):
     - **`later`:** `context` is `widget` (run on the home screen; nothing else logs `widget`) and
       `cacheComplete` is true. Only these count toward the pass (Sample), unless excluded.
     - **`later (in the app)`** (`context: app`) and **`later (run another way)`** (`context: other`:
       Shortcuts, Siri), each with `cacheComplete` true: reported, not counted.
     - **`first`:** every other refresh (no kept copy, or one not marked complete). A first refresh
       that is killed does not fail the test.
   - **A first read in the app** is a `start` with `context: app` of kind `first`. The app refreshes
     only when the read key is first entered (entry.js:472-478) and when the owner taps "Refresh now"
     in its menu.
   - **A first read in the app that was tried** (for F6) is one that reached its `end` with an error
     and is not excluded, or one with no `end` that the owner reports kept Scriptable open, with the
     phone unlocked, until it stopped (Method 11). One the owner left or locked the phone during, or
     one the owner says nothing about, was not tried.
   - **The start copy's snapshot name** comes from `kept-meta.json` without being worked out again
     (phone.js:122, 219-224). If an app refresh and a widget refresh ever saved the kept copy at the
     same moment, the judge could start from an older copy. That gives a false mismatch or a not
     judged, never a false match (reviews/EXP-008/_reviewer-widget-92caf00.md, finding 9).
6. **The first read, and a day of use.**
   - If no first refresh finishes in the widget, the owner makes a first read in the app ("Refresh
     now"), as the plan allows, and the later refreshes then run in the widget. The read that runs
     when the read key is first entered is one too.
   - **For every first read in the app,** the owner keeps Scriptable open, with the phone unlocked,
     until the read shows its result (a summary or an error); in EXP-007 it took about two minutes.
     If it did not finish (the owner left Scriptable, the phone locked, or it stopped with no result),
     the owner taps "Refresh now" again and waits. The owner reports each first read in the app:
     whether it showed a result, and whether Scriptable stayed open until it did (Method 11).
   - The owner does it again in the app if the kept copy is lost.
   - The owner also reports, at least once a day, what the widget on the home screen shows (a
     summary, an error, a blank, or "nothing yet"), in their own words (Method 11).
   - Then the owner lets the widget refresh normally for at least a day: 24 hours of counted later
     refreshes (see Sample). The owner sends the test data after that (Method 8).
   - The busy stretch is not arranged. Whether it happened, and whether a counted refresh covered it,
     is worked out afterwards (Deciding threshold).
7. **Snapshots and the log's bound.**
   - **What a snapshot holds.** In the folder above only, each refresh saves the exact kept copy it
     started from. It also saves every GitHub answer a clone cannot rebuild (all but branches, git
     trees and git blobs), each address's answers in order, a 304 as a 304.
   - **When it is saved:** at the start, before any read; at most every 5 seconds while it reads; and
     at the end. So a killed refresh still leaves what it started from and what it read.
   - **Size.** Bodies are stored once each, by content hash. The whole store is bounded to 20 MB,
     counting the bodies and each refresh's list of answers, with the oldest refresh dropped first.
     Every dropped refresh, its own included, is logged (`snapshot-dropped`) and not judged.
   - **The log's bound.** The log keeps its newest 600 files, one per refresh or menu action
     (phone.js `LOG_KEEP_FILES`). It drops the oldest whole files without logging it.
     - A refresh's `start`, `alive`, `detail` and `end` lines are all in its own file, so trimming
       removes whole refreshes. It never leaves a `start` without its `end`.
     - The `install` line is in the oldest file. So a sent log whose first line is neither `install`
       nor `reset` has been trimmed (or has lost its first file).
     - Each log file is rewritten whole at every line (phone.js:146-160). Whether Scriptable's file
       write is atomic is not known; if it is not, a refresh killed mid-write could leave its file cut
       off, or lose that file's earlier lines (reviews/EXP-008/_reviewer-widget-92caf00.md, finding
       5a). What follows is N0b.
     - At most six `alive` marks and four other lines a refresh, so 600 files are expected to cover
       well over a day of widget refreshes. EXP-007's widget started 25 times in its busiest hour
       and about once an hour after.
8. **The route for the test data** (ruling A of P-004-test-data-route, extended to this test by
   ruling A of P-004-widget-next-step: a one-off exception to "Phone only"). As EXP-007 Method 7,
   with this test's branch and file names:
   - **The send key, new for this test.** At the end, in the Scriptable app, the owner taps "Send the
     test data". The widget asks for the second key, the send key, and keeps it in the iPhone
     keychain (`needs-you-exp008-send-key`). The owner makes it just before: fine-grained, on
     portfolio only, Contents read and write and nothing else (GitHub adds Metadata), 7-day expiry.
   - **What it sends.**
     - The widget first logs `send-start`. Then, if the send key is not yet in the keychain, it asks
       for it, which waits on the owner. Only then does it build, in memory only, the test data (every
       snapshot list and the bodies they name, as one JSON) and the log (every log file present,
       oldest first; entry.js:408-420).
     - So the sent log can hold lines written after its `send-start`: for example a widget refresh
       that started while the owner was pasting the key. **Every line after the sent log's last
       `send-start` is ignored** (Sample, "The run"). The last `send-start` is this send's, since a
       send's log is built after its own `send-start` is written.
     - It sends both through GitHub's Git Data API to a new branch, `exp-008-test-data`, of the
       **private** repository shumpmaster/portfolio, as `exp-008/test-data.json` and
       `exp-008/log.jsonl`.
     - Nothing goes through Files or the share sheet. **Service-Desk is a public repository and never
       receives the test data or the log.**
   - **The guard.** GitHub cannot narrow a key to one branch: the send key could also change
     portfolio's main, which the desk reads. The widget's request guard (send.js) is the only limit.
     It is one per send and stateful. It allows only the next request of this sequence, compared as
     whole addresses:
     1. read the test branch's ref (`git/ref/heads/exp-008-test-data`);
     2. read main's ref (`git/ref/heads/main`), only if the first read answered 404;
     3. read the parent commit, for its tree: the branch's head when the branch exists, else main's
        head;
     4. write the test data's blob;
     5. write the log's blob;
     6. write a tree on the parent's tree, of exactly the test data's path with the blob from step 4
        and the log's path with the blob from step 5, each entry exactly `path`, mode `100644`,
        type `blob`, `sha`;
     7. write a commit of that tree with the one parent read;
     8. write the ref, only `refs/heads/exp-008-test-data`: a create only when the branch was absent,
        a non-force move only when it existed.

     Steps 1 to 3 use the read key; steps 4 to 8 use the send key. Each step is allowed once: a
     request is counted when it is checked, whatever its answer, and any failed answer ends the send.
     So, unlike EXP-007's guard, a failed blob is never sent again, and each blob is tied to its path.
     When the branch exists, main is not read and no commit is made from main. A branch protection
     rule on portfolio's main is an optional second limit the owner may add.
   - **Nothing reacts to it.** Portfolio has no workflows, and the desk reads only its main branch, so
     the branch starts nothing and shows nowhere. Do not open a pull request.
   - **The sent copy confirmed.** The Reviewer fetches the branch into its working session (its
     portfolio clone). It confirms within a day of the send, and says so in its verdict, that:
     - the branch head holds both files;
     - `log.jsonl` holds at least one `send-start` line, and every line up to its last `send-start`
       parses (Method 9, first step);
     - `test-data.json` parses; and
     - the judge reads both (Method 9).

     The Chief of Staff tells the owner when this is done.
   - **If the Reviewer cannot confirm the sent copy** (the send failed, the branch is missing a file,
     or a file will not parse), the Chief of Staff tells the owner. The test data stays on the
     phone, the daily iCloud Backup check goes on, and the owner sends again with "Send the test
     data". A second send moves the same branch (the guard's step 8) and its log holds both
     `send-start` lines. The run then ends at the later one, so refreshes between the two sends are
     part of the run. If a log line before the last `send-start` will not parse, sending again does
     not help, since the same file is sent; that run is N0b.
   - **Then, on the phone, at once:**
     - The owner runs "Delete test data (after sending it)". It removes the kept copy, the snapshots
       and every log file, then writes one small log file holding a single `reset` line (its id, time
       and the number of files removed). That file has no project content, which is acceptable.
     - The owner runs "Forget keys".
     - The daily iCloud Backup check then ends (Method 1).
   - **After the result is filed:**
     - The owner deletes both keys on GitHub. If GitHub will not delete them, they are left to their
       7-day expiry, as with EXP-007's, and the owner says so.
     - The owner deletes the branch `exp-008-test-data`.
     - A deleted branch's commits can still be fetched for a while, by the owner and by anything they
       have given read access to portfolio, including the GitHub access these sessions use.
9. **Judging.** The Reviewer takes the two files from the branch and makes sure each clone holds the
   logged commits (fetching them). Then, from a checkout of build/builder/p004-exp008-widget at
   92caf00:
   - **First, cut the log at its last `send-start`** (Sample, "The run"):

     ```
     n=$(grep -n '"ev":"send-start"' log.jsonl | tail -n 1 | cut -d: -f1)
     head -n "$n" log.jsonl > run.jsonl
     ```

     (JSON.stringify writes `"ev":"send-start"` with no spaces, as the widget logs it.)
   - **Second, check that every line of run.jsonl parses**:

     ```
     node -e 'require("fs").readFileSync(process.argv[1],"utf8").split("\n").forEach((l,i)=>{if(l)try{JSON.parse(l)}catch{console.log(i+1)}})' run.jsonl
     ```

     It prints the number of each line that does not parse. If it prints any, the result is N0b
     (`log-unreadable`). The judge is not run, since it stops with no verdict on such a line
     (judge.mjs:242), and the Reviewer applies no other rule by hand. Its verdict gives the line
     numbers and how many lines there are.
   - **Third, run the judge on run.jsonl:**

     ```
     node src/widget-test/judge.mjs run.jsonl --snapshot test-data.json <Service-Desk clone> <Personal-Org-Operating-Model clone> <Model-Lab clone> <portfolio clone> --json
     ```

     and the same command without `--json`, for the printed table.

   The judge reads only the lines after the last `install` or `reset` line. For each `end`, it runs
   the desk's own code on what that refresh read and compares the four fields of each project's
   summary. It has no fallbacks:
   - **Start:** the kept copy rebuilt from that refresh's snapshot, checked against its key and
     length. A start copy the judge can't rebuild is not judged (`chain-not-reproducible`), never
     replaced by a copy the judge carries itself.
   - **Answers:**
     - Each branch read is served exactly as `end.heads` logged it, in order: a 200 from the clone at
       its commit, a 304 as a 304, any other status as that status, and a network failure as a
       network failure. A repository whose every branch read failed is judged against those failures,
       not skipped.
     - Trees and blobs come from the clone at the commit read.
     - Everything else comes only from that refresh's own saved answers, each address's in order,
       served exactly as recorded. A recorded 200 is never turned into a 304, nor a 304 into a 200.
     - A branch read logged as `{status: 200, error: "body"}` (a 200 whose body is no branch) is
       served as the answer the snapshot recorded at that place, after the judge checks that its
       status agrees with the log (judge.mjs:158-161). The widget saves that body whole
       (entry.js:168-177), so the replay is exact.
     - Not judged (`missing-answer`): a request the saved answers don't hold; a branch, tree or blob
       read no clone can serve; a logged status the snapshot does not agree with; or a read past the
       logged list.
     - A miss on the project's own repository leaves that project not judged. A miss on the
       portfolio, which is no project's, leaves every project not judged.
   - **Clock:** the replay runs at the refresh's start time. A project that differs is replayed again
     at the end time and at each whole minute between, since some state words hold a time ("Can't
     read since HH:MM"). It matches only when all four fields match in one replay, at one clock time.
   - **How independent it is, and the shared adapter.**
     - The judge runs the desk's own src/lib, unpacked, under Node. So it tests the packed copy, which
       runs in the phone's JavaScriptCore inside a home-screen widget, against the desk's code on the
       same records. The test also covers the Scriptable request wrapper (entry.js, not shared).
     - The judge shares only two pieces with the widget: glue.js, the adapter, and `bodyHash`
       (sha256.js), which names snapshot bodies. The summary, the store and the other hashes are each
       side's own.
     - glue.js's header lists every behaviour it holds, G1 to G8:
       - the desk's options;
       - a virtual clock;
       - the quiet test;
       - the clock's stepping;
       - the stop rule (`stop: "quiet"`);
       - the limits (`stop: "stuck"` and `stop: "cap"` at 30 virtual minutes);
       - counting the calls;
       - stopping the desk.

       A fault there is the same on both sides and still matches.
     - So **the Reviewer audits glue.js in full, against G1 to G8 and against the desk's code it
       stands in for,** twice: when checking the widget before this file was frozen, and again when
       judging. Each verdict says that it did, and what it found. In EXP-007 it was "not audited in
       depth" (reviews/316/_reviewer-verbatim.md, finding 6). The first audit is done: "I found no
       behaviour that would change a summary" (reviews/EXP-008/_reviewer-widget-92caf00.md, finding
       2). The second checks the same commit again, against the run.
     - The Reviewer also checks that `bodyHash` names each body by its content alone.
     - A fault found in either that would change a summary makes the result not judged (Deciding
       threshold).
   - **What the judge does not check** (reviews/EXP-008/_reviewer-widget-92caf00.md, finding 5):
     - It does not check that the replay used every logged branch read. An extra or missing branch
       read can go unnoticed when the summary still matches. The summary, which is what this test
       compares, is still compared in full.
     - When the log has no `install` or `reset` line, it prints only "judged from log line 1". The
       Reviewer decides N0 from run.jsonl itself, not from the judge's words.
     - It does not parse a broken line; that is why the second step above comes first.
   - **Outcomes:** each project is `match`, `mismatch` or not judged, with one of the judge's codes:
     `no-snapshot`, `unknown-sha`, `chain-not-reproducible`, `missing-answer`, `no-summary-logged`. A
     crash of the desk's code during the replay is a `mismatch`. There is no hand check. This is the
     plan's comparison, "the desk's own code run on the records as they stood then", and its Success
     line, "a test that runs both on the same sample records".
   - **The run's facts.** The Reviewer works these out from the log, the test data, the clones and
     GitHub's pull request records, and states them in its verdict:
     - each kind of refresh (Method 5), with counts started, finished and unfinished, and each
       project's outcome;
     - **the plan's measures, by kind of refresh:** for each finished refresh, `ms`, `requests` and
       `bytes` (from `end`), and the kept copy's size (`cacheBytes`); for each kind, the least and
       the most. Memory is not measured (Measure);
     - **sizing,** from each finished refresh's `detail`: `calls`, `steps`, `stop`, `statuses`,
       `perRepo` and `snapshotEntries`;
     - from the test data: its size, the number of snapshot refreshes, and the number of bodies;
     - from the log: the largest `snapshotBytes`;
     - the widget lifetimes, as bounds (Measure);
     - the run's span and whether "a day" was met (Sample);
     - whether a busy stretch happened, with its merges' times by repository, and whether a counted
       refresh covered it (Deciding threshold);
     - which rule decided the outcome, by its code;
     - the owner's reports (Method 11): whether Checks was offered, each iCloud Backup report, each
       first read in the app, and what the widget showed;
     - how many lines of the sent log come after its last `send-start` and were ignored, and how many
       sends it holds;
     - the confirmation of the sent copy (Method 8); and
     - any deviation from this file.
10. **The result file** records only what the Reviewer's verdict says, in the verdict's terms. It
    includes the facts listed above. The Builder adds no fact, advice or step of its own. On PR #316
    it added two (reviews/316/_reviewer-verbatim.md, finding 8). Where the result needs a fact the
    verdict does not give, it says "not in the verdict" and the Builder asks the orchestrator.
11. **How the owner's reports reach the Reviewer.**
    - The owner gives each report to the Chief of Staff, in a session or through the desk. There are
      five kinds:
      - whether Checks was offered, given with the install;
      - each iCloud Backup report (Method 1);
      - each first read in the app: whether it showed a result, and whether Scriptable stayed open,
        with the phone unlocked, until it did (Method 6);
      - what the widget on the home screen showed, at least once a day (Method 6);
      - that the phone's data was deleted and the keys forgotten (Method 8).
    - The Chief of Staff records each one in the widget handoff (docs/handoff/), with the owner's
      words and the day.
    - The orchestrator's brief for the judging cites those entries.
    - The Reviewer states them in its verdict. A report the owner did not give is stated as "none
      reported".

## Measure
The log: one JSON line per event, in the log files of Method 4, sent as one file, oldest first.
- Documents is copied by the phone's iCloud backup, an unruled point
  (decisions/questions/P-004-widget-why-and-data.md, "Not ruled"). So the log holds no project
  content, and for this test Scriptable is switched off in iCloud Backup (Method 1).
- Every line carries `ev` and `id`. The `id` is the refresh's or menu action's: its start time in
  base 36, a dash, then 4 random characters.
- Times are ISO 8601 UTC with milliseconds.
- The names below are the widget's at 92caf00 (src/widget-test/README.md, "The log's events";
  entry.js).

**The events:**
- **`install`:** `at`, `build`. Logged by the first run that finds no needs-you-exp008 folder.
- **`reset`:** `at`, `removed` (files removed). Logged by "Delete test data" after it removes
  everything.
- **`start`,** before any GitHub read: `at`, `context` (`widget` | `app` | `other`), `build`, `cache`
  (the run starts from a kept copy), `cacheComplete` (that copy is marked complete), `kept`, and
  `snapshotStore` (`found`, `refreshes`, `bodies`).
  - `kept` is what this run sees of the kept copy: `{store, meta, state, fileBytes, chars, bytes,
    complete, savedAt, savedId, completeAt, completeId}`.
  - `store` and `meta` say whether each of the two files exists.
  - `state` is `ok`, `missing`, `no-meta`, `mismatch` or `unreadable`.
  - `savedAt` and `savedId` are the time and id of the refresh that last saved the copy, complete or
    not.
  - `completeAt` and `completeId` are the same, but only when that save was complete; otherwise they
    are null.
- **`alive`:** `at`, `mark` (1, 3, 10, 30, 60 or 120: seconds after the start), `ms` (actual),
  `requests` and `bytes` so far. At most six a refresh, none after its end.
- **`snapshot-dropped`:** `id` (the dropped refresh's), `by` (the refresh that dropped it), `at`.
- **`detail`,** before `end`: `statuses` (count by HTTP status, `network` for failures), `perRepo`,
  `blocked` (refused requests by host), `polls`, `steps`, `calls`, `skipMs`, `stop` (`quiet` | `cap` |
  `stuck`), `portfolio` (`read`, `polls`, `blobCalls`), `shape`, `snapshotBytes`,
  `snapshotEntries`, `shimmed`.
  - Each project's `shape` is `{read, kinds, openPulls}`, with `read` one of `ok`, `cant-read` or
    `checking` (stopped before done).
- **`end`:** `at`, `ms`, `requests`, `bytes`, `cacheBytes`, `kept` (`complete` | `incomplete` |
  `unchanged` | `failed`, Method 5), `shas` (each repository's head, or null), `heads`, `summary`,
  `error`, and `snapshot` (true or false).
  - **`heads`:** every branch read of each repository, in order:
    - a 200 whose body is a branch, as its sha (a bare string);
    - a 304, as `{status: 304, sha}`, with `sha` the commit read before it in this refresh, or null;
    - a 200 whose body is no branch, as `{status: 200, error: "body"}`;
    - any other answer, as `{status}`;
    - a network failure, as `{error: "network"}`.

    So a 304 and a repeated 200 can always be told apart, which EXP-007's form could not
    (reviews/EXP-007/_critic-r3-verbatim.md, finding 1).
  - **`summary`:** each project is `{waiting, state, stateHash, firstHash, headlineHash}`, with
    `state` in plain words only when it is one of the desk's fixed state forms; otherwise it is null
    and `stateHash` is present.
  - **`error`:** null, `no read key`, `kept copy not saved` or `unexpected error`. `errorKind` and
    `errorHash` are present only with `unexpected error`.
- **`send-start`:** `at`, before any send request.
- **`sent`:** `at`, `ms`, `commit`, `bytes`, `created`, `requests`.
- **`send-failed`:** `at`, `error` (fixed words), `step`, `status`, `requests`; `errorKind` and
  `errorHash` only with `unexpected error`.

The log is built for the send after that send's `send-start` is written, and before its `sent` or
`send-failed`. So it never holds this send's `sent` or `send-failed`, but it may hold lines that
other refreshes wrote after the `send-start`; those are ignored (Sample, "The run"). An earlier send
that failed leaves its own `send-start` and `send-failed` in the log. The Reviewer reads this send's
outcome from the branch itself (Method 8).

**Reading the events:**
- **Hashes.** Each hash is the lowercase hex SHA-256 of the exact UTF-8 string. The hashes are not
  secret: anyone who can read the repositories could guess a short title or headline and check its
  hash.
- **Unfinished.** A `start` with no matching `end` is a refresh that did not finish (killed for time
  or memory).
- **Widget lifetimes are bounds, never measurements.** For a widget refresh that did not finish:
  - **Lower bound:** the `ms` of its last `alive` line. It lived at least that long; the bound is 0 if
    it logged none.
  - **`Timer` in a widget is unverified.** The marks are written by Scriptable's `Timer`, which the
    Reviewer could not check inside a home-screen widget (reviews/EXP-008/_reviewer-widget-92caf00.md,
    open questions). So a missing `alive` mark is not itself evidence of when a refresh died. A
    widget refresh's marks are read as evidence only when the run shows `Timer` working in the widget:
    at least one `alive` line from a refresh with `context: widget`. Without that, the lower bound is
    given as "not known", and the cut-off rule uses its no-`Timer` branch (Exclusions).
  - **Upper bound:** the gap from its `start` to the next `start` with `context: widget`. It is given
    only when that gap is under 130 seconds and the refresh logged no line after that next start.
    - Only a widget start bounds a widget refresh, since a widget refresh can run while the app runs.
    - A gap of 130 seconds or more is past the last `alive` mark and is idle time, as in EXP-007, so
      it gives no bound.
  - The result states lifetimes as "at least" and "at most", never as how long a refresh lived
    (reviews/316/_reviewer-verbatim.md, finding 7).
- **Memory, measured only indirectly.** Scriptable gives a script no reading of its memory, so memory
  is judged by whether the refresh finished, with the response bytes and the kept copy's size as
  proxies. A kill for memory and a kill for time cannot be told apart.
- **Correct:** for a project, its `shape.read` is `ok` and it is a `match` on all four fields at one
  clock time (Method 9).

## Sample
One phone, by design: there is one owner and one phone. Every refresh is logged. The later
refreshes judged are those run as the widget, since the plan tests the widget, not the app: "measure
whether it can work at all, as a home-screen widget, not inside the Scriptable app" (docs/PROJECT.md
Part 2, "Its Discovery, scaled to its size").
- **The run** is the sent log's lines after its last `install` or `reset` line, up to and
  including its last `send-start` line. Every line after the last `send-start` is ignored: whatever
  it says, it was written while the send was under way (Method 8). This is run.jsonl (Method 9),
  and the judge reads it from its last `install` or `reset` line. "The run's `send-start`" means
  that last `send-start`.
- **"A day" means 24 hours** of counted later refreshes: from the `start` of the first counted later
  refresh to the `start` of the last is at least 24 hours.
  - It reads the plan's "a day of normal refreshes" and its alternative, "a refresh after a whole
    day's changes". A whole day's changes are a calendar day's, 24 hours, and a shorter span does
    not reach them.
  - EXP-007's run was about 9¾ hours, which its Reviewer called "not a full day"
    (reviews/EXP-007/_reviewer-result.md, finding 8).
  - The span is measured over the counted refreshes because they are what the pass mark judges. The
    hours before the widget first sees a complete kept copy do not count toward it.
- The owner sends the test data once the widget has been on the home screen, with the first read
  done, for more than 24 hours. About 30 hours leaves margin, and the read key's 7 days leave room.

## Exclusions
A refresh interrupted by something outside it is recorded and not counted. No other refresh is
thrown out. There are two kinds:
- **The phone offline, or a GitHub API incident at that time.** The Reviewer decides these from
  three things only:
  - the log's fixed words: a project's "Can't read" reason, or `end`'s `errorKind`;
  - GitHub's status history for that time;
  - the owner's word.

  The owner's iCloud Backup reports (Method 1) exclude nothing.
- **Cut off by the send.** This one is decided from the log's times and `alive` marks alone. It
  concerns a counted later refresh R with no `end` that started before the run's `send-start` (one
  that started after it is outside the run). R may still have been running when the log was built.
  - **(i) R started more than 120 seconds before the `send-start`:** not excluded. R is a refresh that
    did not finish (F2), whatever marks it logged.
  - **(ii) R started within the 120 seconds before the `send-start`, and the run shows `Timer`
    working in the widget (Measure):**
    - if R logged every `alive` mark due before the `send-start` (a mark of N seconds is due when R
      started more than N seconds before the `send-start`), R is cut off by the send: excluded;
    - if R missed a mark due before then, it was killed before the send: not excluded, F2.
  - **(iii) R started within the 120 seconds before the `send-start`, and the run does not show
    `Timer` working in the widget:** R cannot be told from a kill. It is neither excluded nor a
    fail. It stops the run from passing, and if nothing else fails, the run is N11.
  - *Choices,* disclosed:
    - In (i), R may still have been running. It is read as not finished, because a counted widget
      refresh had not ended two minutes after it started, and the owner then chose to send. That is longer
      than the widget's last `alive` mark, and EXP-007's widget refreshes lived seconds. This can
      only turn a pass into a fail.
    - The 120 seconds is the widget's last mark.
    - (iii) can only turn a pass or a fail into a not-judged.
- An excluded refresh is run again by the next normal refresh; nothing extra is needed.

## Deciding threshold
The plan's pass mark, copied unchanged from docs/PROJECT.md Part 2, "Its Discovery, scaled to its
size":

> It passes if the later refresh finishes and shows a correct summary every time, over a day of
> normal refreshes that includes at least one busy stretch (several merges in an hour), or, if no
> such stretch happens, a refresh after a whole day's changes. A first refresh that cannot finish
> inside the widget may still pass if it can be done once inside the Scriptable app and kept; the
> owner then does that step at install and again if what the widget kept is lost, and the guide and
> the owner's time below include it. If the later refresh fails, the route comes back to the owner,
> with the sender's summary or the counts-only widget as the fallbacks the question named, before
> any more work.

Everything below only says how those words apply to this test's log.
- It adds no condition that could make a run pass that the words would not.
- Every outcome other than a pass is a fail or not judged.
- A fail is given only where a later refresh, or the in-app allowance, was tried and did not work.
- The Reviewer applies these rules, not the judge's printed label or exit code.

**Counted later refresh:** kind `later` (Method 5), not excluded.

**The order.**
1. The Reviewer checks first whether the log can be read (N0b) and is whole (N0).
2. Then the fail rules.
3. Then the pass.
4. Then the other not-judged codes.

- A log that will not parse (N0b) stops there: no other rule is applied.
- A trimmed log (N0) can still fail by F1 to F5, because trimming removes whole refreshes and never
  leaves a counted later refresh's `start` without its `end`, or changes what it shows (Method 7).
- A trimmed log cannot fail by F6, because trimming could have dropped the very `end` with
  `error: null` that F6 needs to be absent.
- A trimmed log can never pass, because a dropped refresh could have failed.

### Can the log be read, and is it whole
- **N0b. `log-unreadable`.** A line of run.jsonl does not parse (Method 9, second step). The judge
  is not run and no other rule is applied, since there is no hand check.
  - *A choice,* disclosed: even a line cut off at the end of one refresh's own file makes the run
    not judged. The widget's log files are rewritten whole at each line, and whether the phone's
    write is atomic is not known. So a cut-off file may also have lost that refresh's earlier lines,
    its `start` included, and the log cannot be shown whole.
  - This can only turn a pass or a fail into a not-judged. Sending again does not help (Method 8).
- **N0. `log-trimmed`.** The sent log, read as run.jsonl, does not begin with an `install` or `reset`
  line, or holds more than one such line. "Delete test data" removes every log file before it writes
  its `reset`, so a whole log holds at most one.
  - Then a refresh may be missing, so "every time" cannot be shown.
  - The run is not judged, unless one of F1 to F5 fires on the refreshes that remain; F6 is not
    applied.

### Fail: any one of these
- **F1.** A `mismatch` on any project of a counted later refresh (a replay crash included).
- **F2.** A counted later refresh that did not finish: a `start` with no `end`, unless it is cut off
  by the send or undecided (Exclusions, (ii) and (iii)). This includes the case where the widget saw
  a complete kept copy but every such refresh was killed.
- **F3.** A project of a counted later refresh at `checking` (stopped before done): not a correct
  summary.
- **F4.** A project of a counted later refresh at `cant-read` with no exclusion explaining it: not a
  correct summary.
- **F5.** A counted later refresh whose `end` has an `error` that is not null (`no read key`, `kept
  copy not saved` or `unexpected error`), whatever label the judge prints (it prints
  `no-summary-logged`). It did not show a correct summary.
- **F6.** No refresh, in the widget or the app, ever ends with `error: null`, though at least one
  first read in the app was tried (Method 5): it reached its `end` with an error and is not
  excluded, or the owner reports it was not interrupted. The in-app allowance was tried and no copy
  was ever kept, so no later refresh can run. Not applied to a trimmed log (N0).

### Pass
Every one of these, and no fail rule fires:
- the log can be read and is whole (not N0b or N0), and no `snapshot-dropped` line names a counted
  later refresh;
- there is at least one counted later refresh, and every counted later refresh finishes, with every
  project read `ok` and a `match`;
- no project of a counted later refresh is not judged, and no fault was found in glue.js or
  `bodyHash` (Method 9);
- "a day" is met (Sample): 24 hours from the first counted later refresh's start to the last's;
- and one of these two:
  - **(a)** a busy stretch happened in the run and at least one busy stretch was covered; or
  - **(b)** no busy stretch happened in the run. Then the 24 hours of counted later refreshes are
    the plan's "a refresh after a whole day's changes": the last counted later refresh starts at
    least 24 hours after the first;
- and no counted later refresh is undecided (Exclusions, (iii)).

### The busy stretch
- **The span** for merges is from 60 minutes before the first counted later refresh's `start` to the
  last counted later refresh's `start`, so a stretch that starts before the counted refreshes is
  seen too.
- **A merge** is either of these, on the default branch of one of the three projects in
  src/config/projects.json:
  - **a merged pull request:** a pull request merged into that branch, at its `merged_at` time in
    GitHub's pull request records. Each counts once, whatever its merge method: a merge commit, a
    squash, or a rebase that adds several commits. The Reviewer reads them with its GitHub access,
    for each repository:

    ```
    gh pr list --repo <repository> --state merged --base main --search "merged:<span start>..<span end>" --json number,mergedAt,mergeCommit --limit 1000
    ```

    It checks that each list is shorter than the limit, so it covers every pull request merged in
    the span, and lists the merges in its verdict.
  - **a merge commit that belongs to no pull request:** a commit with two or more parents on the
    branch's first-parent line, in the Reviewer's up-to-date clone, at its committer time, that is
    not the `mergeCommit` of any listed pull request. For example, a branch merged locally with
    `git merge --no-ff` and pushed, as this desk's own mechanics allow. The Reviewer finds them
    with:

    ```
    git log --first-parent --merges --format='%H %cI' --since=<span start> --until=<span end> origin/main
    ```

  - Not merges: commits pushed with no merge, and the portfolio's merges (it is no project's).
- **A busy stretch** is at least three merges, across the three projects, whose times all fall
  within 60 minutes of each other. It happened in the run when at least one of its merges falls in
  the span.
- **It is covered** when at least one counted later refresh starts after the stretch's first merge
  and no later than 60 minutes after its last. That refresh read what the stretch changed.
- *Choices,* disclosed:
  - "several merges in an hour" is read as three or more within 60 minutes (EXP-007's had about six
    in an hour);
  - a local merge is timed by its committer time, which is when it was made, not when it was pushed;
  - a stretch counts as having happened if any of its merges falls in the span. That makes N10 more
    likely and (b) less likely, so it can only make a pass harder.

### Not judged: when no fail rule fires and the run does not pass
After N0, the Reviewer gives the first code below that applies. Each is a code of this registration,
not of the judge.
- **N1. `no-widget-start`.** No `start` with `context: widget` in the sent log. There are two
  possible causes:
  - the widget never ran on the home screen; or
  - it ran, but does not share the app's Documents folder, so its log files were never in what the
    app sent. That is the question this test exists to answer (Hypothesis).

  The log cannot tell these apart. The Reviewer states the owner's reports of what the widget showed
  (Method 11) beside the code, and names both causes.
- **N2. `app-first-read-not-tried`.** No refresh ever ended with `error: null`, and no first read in
  the app was tried (Method 5): none was made, or every one made was excluded, or every one stopped
  with no `end` and no report from the owner that it was not interrupted. The in-app allowance was
  not tested, so F6 cannot apply.
- **N3. `no-widget-start-after-kept`.** A refresh ended with `error: null`, but no widget `start` in
  the sent log came after any such `end`. There are three possible causes:
  - the run was too short;
  - the widget did not refresh after the first read; or
  - the widget's later refreshes wrote to a folder the app does not share.

  As for N1, the Reviewer states the owner's reports of what the widget showed, and names the
  causes.
- **N4. `kept-copy-not-seen`.** No widget `start` in the run ever logged `cacheComplete: true`, and
  at least one widget `start` S is *blind*. S is blind when there is a refresh E that ended with
  `error: null` before S started, and either:
  - **(a)** S's `kept` shows neither file (`store` and `meta` false); or
  - **(b)** S's `kept.savedAt` is earlier than E's `start`. Then the copy S saw was saved before E
    even began, so it cannot be E's save, or any save made after E's.

  In both cases there must also be no `reset` line between E's `end` and S's `start`.

  Why the conditions need no time window: only a save changes the copy, and every save records its
  own time in `kept-meta.json` (Method 5).
  - A refresh still running when E ended, however long it had run, could only have saved after E.
    Its save would show a `savedAt` later than E's start, which is not (b).
  - Only "Delete test data", which logs `reset`, removes the copy, and that is ruled out above.

  So a blind start shows that a complete copy was kept and the widget read an older copy, or none.
  A start whose `kept` is `mismatch`, `unreadable` or `no-meta`, or whose copy was saved while E was
  running, is not blind; that run falls to N6.
- **N5. `all-later-excluded`.** Widget starts with `cacheComplete: true` happened, but every one was
  excluded or cut off by the send.
- **N6. `no-counted-later-undecided`.** Any other run with no counted later refresh. The Reviewer
  states the facts.
- **N7. `project-not-judged`.** A project of a counted later refresh is not judged by one of the
  judge's codes (Method 9), or a `snapshot-dropped` line names a counted later refresh.
- **N8. `adapter-fault`.** A fault the Reviewer finds in glue.js or `bodyHash` that would change a
  summary, whatever the judge prints. A rerun would share the fault.
- **N9. `run-too-short`.** Counted later refreshes span less than 24 hours.
- **N10. `busy-stretch-not-covered`.** At least one busy stretch happened in the run, and no counted
  later refresh covered any of them.
- **N11. `send-cut-undecided`.** A counted later refresh is undecided (Exclusions, (iii)): it started
  within the last 120 seconds before the send, has no `end`, and the run does not show `Timer`
  working in the widget.

### What follows each outcome
- **Pass:** P-004's Discovery goes on to sizing (the plan's next step), and the result goes to the
  owner with P-004's Design gate.
- **Fail:** the route comes back to the owner, with the sender's summary or the counts-only widget as
  the fallbacks the question named, before any more work (the pass mark's own words).
- **Not judged, any code:** the route also comes back to the owner, with the same two fallbacks,
  before any more work. The owner may also choose to run the test again.
  - This follows the option the owner approved: "a fail or another not-judged result comes back to
    you, with the two fallbacks below" (decisions/questions/P-004-widget-next-step.md, option A).
  - EXP-007's result was the first not-judged, so any not-judged result here is "another".
  - This is a change from EXP-007, whose rules ran the test once more before asking.

### How each reading follows from the pass mark, and where it is a choice
- **F1 to F5** are EXP-007's rules, of which the Critic wrote that the note "adds only failures" and
  "Nothing in it loosens the mark" (reviews/EXP-007/_critic-r3-verbatim.md, section 2). Each is a
  counted later refresh that did not finish or did not show a correct summary, so "finishes and shows
  a correct summary every time" is broken. F5 now names the widget's error words.
- **F6** is EXP-007's rule, narrowed to a run where the first read in the app was really tried: it
  reached its `end` with an error, or the owner reports that it ran with Scriptable open until it
  stopped. Then the allowance "may still pass if it can be done once inside the Scriptable app and
  kept" was used and failed, and no later refresh can exist. One interrupted attempt does not show
  that it "cannot" be done, so that run is N2, not a fail. *A choice:* the narrowing, which can only
  turn a fail into a not-judged. The owner's report is one of this registration's three sources for
  facts the log cannot hold, as for exclusions.
- **N4, the widget that never sees the kept copy, is not judged, not a fail.** Under N4 no later
  refresh exists, and the pass mark's fail clause is "If the later refresh fails". So the words give
  no fail. The owner's options B and C on the last card were worded "though the test didn't fail it"
  for the same pattern, and calling it a fail here would tell the owner the widget route failed. The
  next step is the same either way (What follows each outcome). The verdict names the code, so the
  owner sees that the widget did not see the kept copy. Nothing is left for the owner to rule before
  the freeze.
- **N1 to N6** cover every way a run can end with no counted later refresh. In each, the condition
  the pass mark tests (a later refresh in the widget, with a complete kept copy) never happened.
  "Every time" is not met by none, so it is not a pass. No later refresh failed, so it is not a fail.
- **N0b, N0, N7, N8 and N11** are cases where the comparison could not be made in full, or could not
  be trusted: EXP-007's not-judged rule and glue.js clause, plus the log's parse, its bound and a
  refresh the send cut off that no `Timer` mark can place.
- **Ignoring the lines after the last `send-start`** changes nothing the pass mark tests: those
  lines were written while the send was being made, and a refresh that starts then cannot finish in
  the sent log. Counting it would make a fail of a refresh the send cut off, which the words do not
  support.
- **N9.** "Over a day" is part of the pass mark, so a shorter run cannot pass. It is not a fail,
  since no refresh failed. A fail inside a short run is still a fail (F1 to F5), since "every time"
  is already broken. *A choice:* "a day" as 24 hours (Sample).
- **The busy stretch: Pass (a) and (b), and N10.** The words ask for a day "that includes at least
  one busy stretch ... or, if no such stretch happens, a refresh after a whole day's changes".
  - A stretch that happened and that a counted refresh covered meets the first branch. That is (a).
  - A run with no stretch meets the second branch, read as 24 hours of counted later refreshes. That
    is (b).
  - A stretch that happened but that no counted refresh covered meets neither: the stretch happened,
    so the second branch does not apply, and the widget's later refresh never met it. So it cannot
    pass, and since no refresh failed, it is not judged (N10).

  *Choices:* "several" as three or more; "in an hour" as within 60 minutes; covered as a counted
  start within 60 minutes after the last merge; merges as merged pull requests plus merge commits
  that belong to no pull request; a stretch counted as happening if any of its merges falls in the
  span. Each says how the words apply. None makes a pass easier than the words do.

### Every way a run can have no counted later refresh
| What the log shows | Rule | Outcome |
|---|---|---|
| A line of the log, up to its last `send-start`, does not parse | N0b | not judged |
| The log was trimmed (no `install` or `reset` first) | N0 | not judged |
| No widget start in the sent log (never ran, or does not share the app's Documents) | N1 | not judged |
| No refresh ever ended with no error; a first read in the app was tried | F6 | fail |
| No refresh ever ended with no error; no first read in the app was tried | N2 | not judged |
| A copy was kept complete, but no widget start in the sent log came after it | N3 | not judged |
| The widget never saw a complete copy, and a widget start read an older copy, or none, after a complete save | N4 | not judged |
| The widget saw a complete copy, but every such refresh was killed | F2 (these are counted later refreshes) | fail |
| The widget saw a complete copy, but every such refresh was excluded or cut off by the send | N5 | not judged |
| Anything else with no counted later refresh | N6 | not judged |

## Holdout use
none.

Before freezing: the Reviewer passed the test widget at 92caf00
(reviews/EXP-008/_reviewer-widget-92caf00.md), having audited glue.js in full against G1 to G8,
checked `bodyHash`, confirmed that the widget writes only to Documents/needs-you-exp008/ and its two
keychain names, and confirmed the packed file's size and SHA-256 in the runner line. This draft is
the last before the Critic's round 3 (D-044); if the Critic passes it at round 3
(reviews/EXP-008/critic.md), this commit is the frozen one, with no further change.

frozen: the last commit that changes this file on build/definer/p004-exp008, before any run
