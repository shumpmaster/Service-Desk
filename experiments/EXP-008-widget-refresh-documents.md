# Experiment registration — EXP-008

*Pre-registered before any run (D-047). Frozen once the line below is set.*

*Draft 1 (2026-11-07), by the Definer, for the Critic's round 1 (at most three rounds, D-044). It is
the second widget test the owner chose, "Second test, data kept in Documents (Recommended)"
(decisions/questions/P-004-widget-next-step.md, ruling A). It reuses EXP-007's frozen registration
(experiments/EXP-007-widget-refresh.md, frozen at ad2709e) wherever its rules still hold, and changes
four things: where the widget keeps its data (Documents, not Caches); new fields in the log (what the
widget sees of the kept copy, `alive` marks, an exact form for branch reads); an explicit outcome for
every way a run can end with no counted later refresh, the case EXP-007's rules left undecided
(reviews/EXP-007/_reviewer-result.md, finding 4); and the carry-overs from the Reviewer's findings 6
to 8 and open question on PR #316 (reviews/316/_reviewer-verbatim.md). The widget is being rebuilt in
parallel; field names marked "(provisional)" are a guess that a later draft matches to the
Builder's widget.*

spec: P-004 (no spec yet; its short plan is docs/PROJECT.md Part 2, "Later work: the home-screen
widget (P-004)", "Its Discovery, scaled to its size")   milestone: none yet (M5 is proposed for
P-004, docs/PROJECT.md Part 2); run once this file is frozen
runner:
- **The owner,** on their iPhone: about 15 minutes to set up (switch Scriptable off in iCloud
  Backup, make the read key, install the test widget, do the first read in the app if needed); a
  quick daily check of the iCloud Backup switch; at least a day of normal use (see Sample); then
  about 10 minutes at the end: make the send key, send the test data, and clean up. No agent holds
  either key.
- **The Builder** makes the throwaway test widget and its judge on the local branch
  build/builder/p004-exp008-widget, never merged and never under src/public/, at
  `<widget commit, named once the Reviewer passes it>`; and files the result file from the
  Reviewer's verdict.
- **The Reviewer,** who did not make the test widget, checks the widget before this file is frozen
  and judges the log against the pass mark.

result: docs/handover/experiments/EXP-008-result.md, filed by the Builder from the Reviewer's
verdict, in a commit with no `Spec:` trailer, exempted with its own ledger entry
(decisions/questions/P-004-result-spec.md, ruling A)
rulings: decisions/questions/P-004-widget-next-step.md, ruling A, "Second test, data kept in
Documents (Recommended)", whose option text the owner approved sets this test's storage, its iCloud
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
14620-14621

## Why this is a new test, not a re-run of EXP-007
EXP-007 stays **not judged** (docs/handover/experiments/EXP-007-result.md); nothing in this test
changes that result, and none of EXP-007's refreshes is counted here. EXP-007's frozen method puts
the kept copy and the snapshots in Scriptable's Caches folder (its Method 3 and 6), and the evidence
from its run is that the home-screen widget does not see that folder while it does share Documents
(reviews/EXP-007/_reviewer-result.md, finding 5: "Strong but indirect; nobody listed the folders").
Moving the storage changes the method, so a widget built this way is not EXP-007's: as the owner's
option D put it, "If the rebuilt widget differs from the frozen plan in any way, it is a new test
instead." It also needs new log fields, new keys and the rule for a run with no counted later
refresh, none of which a frozen registration can take.

## Hypothesis
A Scriptable home-screen widget, run as the widget and not inside the Scriptable app, can make the
desk's reads for all three projects and the portfolio and run the desk's card-making code on them
within a widget refresh's time and memory, when what it keeps is in Scriptable's local Documents
folder.
- The widget sees a complete kept copy that a refresh in the app (or in the widget) saved there.
- A later refresh, with a complete kept copy, finishes and shows a correct summary.
- A first refresh, with nothing kept, may or may not finish in the widget. (In EXP-007 the widget's
  first refreshes were all stopped within seconds, and the app's first read took 1,033 requests in
  about two minutes, so the first read is expected to be done in the app.)

Already known: the desk's card-making code (src/lib) runs packed into one Scriptable file with no
change to the desk (EXP-007). The widget shows, for each project, the number waiting as src/lib's box
gives it (`box.flaggedCount`), with the desk's state line and headline from src/lib. The Home tile's
count is different code (`bd.counts`, src/lib/board.js, added to in src/public/sandbox.js), so the
two may differ. This test checks the src/lib summary against src/lib, not against the tile; whether
the widget should match the tile is a point for P-004's Design gate.

The size to expect, from the plan: a first read of one project can take up to about 400 GitHub
requests (specs/S-001.md lines 4954-4955 and 14611); a later one, one call of up to 30 requests (23
when nothing changed, lines 14620-14621), plus up to 25 for each record-reading call the changes need
(line 14611). Measured in EXP-007, for information only: 1,033 requests on the first read in the app
(Service-Desk 796, about twice the plan's "about 400"), 85 and 46 on later reads in the app.

## Method
1. **Before installing: iCloud Backup off for Scriptable** (ruling A of P-004-widget-next-step).
   Everything the widget keeps is in Documents, which the phone's iCloud backup copies; whether that
   backup is allowed is not ruled and stays for the Design gate. For this test only:
   - Before installing the widget, the owner switches Scriptable off in the phone's iCloud Backup
     settings (Settings, the owner's name, iCloud, iCloud Backup, the list of apps). People report
     that this deletes the app's backed-up data, and that the switch can turn itself back on.
   - The owner checks the switch once a day while the test runs.
   - If it is back on, the owner's records may already be in a backup: the owner switches it off
     again (reported to delete them) and says so to the Chief of Staff, with the day it was found.
     The test carries on; a report does not exclude any refresh.
   - The result records each such report, or that there was none.
2. **The read key, new for this test.** EXP-007's keys are not reused. At install the owner makes a
   new fine-grained GitHub key on only the four repositories in src/config/projects.json
   (shumpmaster/Service-Desk, shumpmaster/Personal-Org-Operating-Model, shumpmaster/Model-Lab,
   shumpmaster/portfolio), with a 7-day expiry. Its permissions are all read-only: Contents, Pull
   requests, Actions, Commit statuses, and Checks if the token page offers it; GitHub adds Metadata.
   Nothing else. If Checks is not offered, the key is made without it (a job candidate then reads as
   an ordinary waiting pull request). **The owner notes whether the token page offered Checks** and
   says so with the install report; the Reviewer's verdict states it and the result records it
   (EXP-007 never confirmed this: reviews/316/_reviewer-verbatim.md, open question). Besides the
   refreshes, the send (Method 8) uses it for its reads on portfolio.
3. The owner installs the test widget and runs it once in the Scriptable app, where it asks for the
   read key and keeps it in the iPhone keychain (`needs-you-widget-github-key`). The widget makes
   requests only to api.github.com (docs/PROJECT.md Part 2, "Data on the phone").
4. **Storage.** Everything the widget writes is in Scriptable's **local Documents folder** on the
   phone (the local file manager's documents folder): the kept copy, the per-refresh snapshots and
   the log. Never Scriptable's iCloud folder, never the Caches folder, never temporary files. The
   keys are only in the keychain. Sizes to expect: the kept copy about 1 MB (EXP-007: 1.05 to
   1.08 MB); the snapshots several MB (EXP-007's last was 7.4 MB); the snapshots bounded to 20 MB
   (Method 7). The Reviewer confirms, when checking the widget, that no path the widget writes is
   outside the local Documents folder.
5. **Kinds of refresh.** The kept copy is marked complete exactly when a refresh ends with no
   error, and the copy records the id and time of the refresh that marked it. The judge sorts each
   refresh by its `start` line:
   - **`later`:** `context` is `widget` (run on the home screen; nothing else logs `widget`) and
     `cacheComplete` is true. Only these count toward the pass (Sample), unless excluded.
   - **`later (in the app)`** (`context: app`) and **`later (run another way)`** (`context: other`:
     Shortcuts, Siri) with a complete kept copy: reported, not counted.
   - **`first`:** every other refresh (no kept copy, or one not marked complete). A first refresh
     that is killed does not fail the test.
6. **The first read, and a day of use.**
   - If no first refresh finishes in the widget, the owner does it once in the Scriptable app, as the
     plan allows, and the later refreshes then run in the widget. The owner does it again in the app
     if the kept copy is lost.
   - Then the owner lets the widget refresh normally for at least a day (24 hours of counted later
     refreshes; see Sample), and sends the test data after that (Method 8). The busy stretch is not
     arranged; whether it happened is recorded (Deciding threshold, "The day and the busy stretch").
7. **Snapshots.** In the local Documents folder only (Method 4), each refresh saves the exact kept
   copy it started from, and every GitHub answer a clone cannot rebuild (all but branches, git trees
   and git blobs), each address's answers in order, a 304 as a 304. It is saved at the start, before
   any read; at most every 5 seconds while it reads; and at the end. So a killed refresh still leaves
   what it started from and what it read. Bodies are stored once each, by content hash. The whole is
   bounded to 20 MB, counting the bodies and each refresh's list of answers, the oldest refresh
   dropped first; every dropped refresh, its own included, is logged (`snapshot-dropped`) and not
   judged. The log keeps at most its last 5,000 lines (provisional; EXP-007 kept 2,000, and the
   `alive` marks add up to four lines a refresh); if it ever drops a line it logs `log-trimmed`
   (provisional) once, with the number dropped. "Delete test data" clears the log, the kept copy and
   the snapshots before any repeat run.
8. **The route for the test data** (ruling A of P-004-test-data-route, extended to this test by
   ruling A of P-004-widget-next-step: a one-off exception to "Phone only"). As EXP-007 Method 7,
   with this test's branch and file names:
   - At the end, in the Scriptable app, the owner taps "Send the test data". The widget asks for the
     second key, the **send key**, and keeps it in the iPhone keychain
     (`needs-you-widget-portfolio-send-key`). The owner makes it just before, **new for this test:**
     fine-grained, on portfolio only, Contents read and write and nothing else (GitHub adds
     Metadata), 7-day expiry.
   - The widget builds the test data (the snapshots as one JSON) and the log in memory only, and
     sends both through GitHub's Git Data API to a new branch, `exp-008-test-data`, of the
     **private** repository shumpmaster/portfolio, as `exp-008/test-data.json` and
     `exp-008/log.jsonl`. Nothing goes through Files or the share sheet. **Service-Desk is a public
     repository and never receives the test data or the log.**
   - **Its reads on portfolio,** in this order, all with the read key (only its writes use the send
     key): the test branch's ref (`git/ref/heads/exp-008-test-data`); main's ref
     (`git/ref/heads/main`) only when the branch's read answers 404; then the parent commit
     (`git/commits/<parent>`), for its tree. The parent is the branch's head when the branch exists,
     else main's head; its tree is the base. When the branch exists, main is not read, and no commit
     is made from main.
   - **Its writes,** each once and in order: two blobs, a tree, a commit, and the ref write (a new
     branch, or a non-force move of the existing one; a 422 is logged as "it changed during the
     send"). The send stops at the first failure.
   - GitHub cannot narrow a key to one branch: the send key could also change portfolio's main,
     which the desk reads. The widget's request guard is the only limit. It is one per send and
     stateful, and refuses, before sending, any request but the next one above: `base_tree` must be
     the parent's tree this send read; the tree exactly the two distinct paths, each entry with only
     `path`, `mode`, `type` and `sha`, naming one of this send's two blobs; the commit that tree with
     the one parent this send read; and the ref write naming this send's commit, as a create only
     when the branch was absent and as a move only when it existed, and only for
     `refs/heads/exp-008-test-data`. A branch protection rule on portfolio's main is an optional
     second limit the owner may add.
   - Portfolio has no workflows, and the desk reads only its main branch, so the branch starts
     nothing and shows nowhere. Do not open a pull request.
   - The Reviewer fetches the branch into its working session (its portfolio clone) and runs the
     judge there (Method 9).
   - **Clean-up, after the result is filed** (as EXP-007 Method 7): the owner runs "Delete test data
     (after sending it)" (it removes the snapshots, the kept copy and the log from the phone) and
     "Forget keys", deletes both keys on GitHub (if GitHub will not delete them, they are left to
     their 7-day expiry, as with EXP-007's, and the owner says so), and deletes the branch
     `exp-008-test-data`. A deleted branch's commits can still be fetched for a while, by the owner
     and anything they have given read access to portfolio, including the GitHub access these
     sessions use.
9. **Judging.** The Reviewer takes the two files from the branch, makes sure each clone holds the
   logged commits (fetching them), and, from a checkout of build/builder/p004-exp008-widget at
   `<widget commit, named once the Reviewer passes it>`, runs the Builder's judge (its file and
   command line named in a later draft, from the Builder's return) on the log, the test data and the
   four clones. For each `end`, it runs the desk's own code on what that refresh read and compares
   the four fields of each project's summary. It has no fallbacks:
   - **Start:** the kept copy from that refresh's snapshot. A start copy the judge can't rebuild is
     not judged (`chain-not-reproducible`), never replaced by a copy the judge carries itself.
   - **Answers:** each branch read served exactly as `end.heads` logged it (Measure), in order: a 200
     from the clone at its commit, a 304 as a 304, any other status as that status, a network failure
     as a network failure. A repository whose every branch read failed is judged against those
     failures, not skipped. Trees and blobs come from the clone at the commit read. Everything else
     comes only from that refresh's own saved answers, each address's in order, served exactly as
     recorded: a recorded 200 is never turned into a 304, nor a 304 into a 200. Not judged
     (`missing-answer`): a request the saved answers don't hold; a branch, tree or blob read no clone
     can serve; `{status: 200, error: "body"}`; a read past the logged list. A miss on the project's
     own repository leaves that project not judged; a miss on the portfolio, which is no project's,
     leaves every project not judged.
   - **Clock:** the replay runs at the refresh's start time. A project that differs is replayed again
     at the end time and each whole minute between, since some state words hold a time ("Can't read
     since HH:MM"). It matches only when all four fields match in one replay, at one clock time.
   - **How independent it is, and the shared adapter.** The judge runs the desk's own src/lib,
     unpacked, under Node. So it tests the packed copy running in the phone's JavaScriptCore inside a
     home-screen widget, and the Scriptable request wrapper (not shared), against the desk's code on
     the same records. It does not test the small adapter both sides share (in EXP-007, glue.js; here
     whatever file of the Builder's widget holds it, named in a later draft): its copies of the desk
     function's body checks, the skipped Access check, the clock-skipping driver and its stop rule,
     and the summary built from `box.flaggedCount`. A fault there is the same on both sides and still
     matches. So **the Reviewer audits that adapter in full twice:** when checking the widget before
     this file is frozen, and again when judging, and says in each verdict that it did, and what it
     found (in EXP-007 it was "not audited in depth": reviews/316/_reviewer-verbatim.md, finding 6). A
     fault found there that would change a summary makes the result not judged (Deciding threshold).
   - **Outcomes:** each project is `match`, `mismatch` or `not judged`, with one of the judge's codes:
     `no-snapshot`, `unknown-sha`, `missing-answer`, `chain-not-reproducible`, `no-summary-logged`.
     A crash of the desk's code during the replay is a `mismatch`. There is no hand check. This is the
     plan's comparison, "the desk's own code run on the records as they stood then", and its Success
     line, "a test that runs both on the same sample records".
   - **The run's facts** the Reviewer works out and states in its verdict, from the log and the
     clones: each kind of refresh (Method 5) with counts started, finished and unfinished; each
     project's outcome; the run's length and whether "a day" was met; whether a busy stretch
     happened, with its merges' times by repository, and whether it was covered (Deciding threshold);
     the widget lifetimes as bounds (Measure); the outcome of the "no counted later refresh" rules
     when they apply, by their code; the owner's iCloud Backup reports; whether Checks was offered;
     and any deviation from this file.
10. **The result file** records only what the Reviewer's verdict says, in the verdict's terms, with
   the facts of the line above. The Builder adds no fact, advice or step of its own (on PR #316 it
   added two: reviews/316/_reviewer-verbatim.md, finding 8); where the result needs a fact the
   verdict does not give, it says "not in the verdict" and the Builder asks the orchestrator.

## Measure
The log: one JSON line per event, in Scriptable's local Documents folder. That folder is copied by
the phone's iCloud backup, an unruled point (decisions/questions/P-004-widget-why-and-data.md, "Not
ruled"), so the log holds no project content; for this test Scriptable is also switched off in iCloud
Backup (Method 1). Every event carries `ev` and `id` (the refresh's id). The fields EXP-007 logged
are kept; the new ones are marked **new**, and names marked (provisional) may change to the Builder's.
- **`start`,** before any read: `at`, `context` (`widget` | `app` | `other`), `cache`,
  `cacheComplete`; and **new**, what this run sees of the kept copy, as `kept` (provisional):
  `{exists, bytes, completeId, completeAt}`: whether the kept-copy file exists as this run sees it;
  its size in bytes (0 when absent); and the refresh id and the saved-at time of the refresh that
  last marked it complete (null when it was never marked, or the file is absent).
- **`alive`** (**new**; provisional): `ms` since this refresh's start and `requests` so far, logged
  once at each fixed mark the refresh reaches, at about 1, 3, 10 and 30 seconds (marks provisional),
  so at most four a refresh.
- **`snapshot-dropped`:** `id` only, for each refresh whose snapshot the bound dropped.
- **`log-trimmed`** (**new**; provisional): `dropped`, if the log's line bound ever drops a line.
- **`detail`,** before `end`: `statuses`, `perRepo`, `blocked` (hosts only), `polls` (record-reading
  calls per cycle), `steps`, `calls`, `skipMs`, `portfolio`, `shape`, `snapshotBytes`, `shimmed`. Each
  project's `shape` is `{read, kinds, openPulls}`, with `read` one of `ok`, `cant-read` or `checking`
  (stopped before done).
- **`end`:** `at`, `ms`, `requests`, `bytes`, `cacheBytes`; `shas` (each repository's default-branch
  commit); `heads`; `summary`; `error`; and `snapshot` (true or false).
  - **`heads`, new exact form:** every branch read of each repository, in order, each one object: a
    200 whose body is a branch as `{status: 200, sha}`; a 304 as `{status: 304, sha}`, with `sha` the
    commit the desk's code then used (from the kept copy or this refresh's earlier read), or
    `{status: 304}` when it had none; a 200 whose body is no branch as `{status: 200, error: "body"}`;
    any other answer as `{status}`; a network failure as `{error: "network"}`. (Form provisional; what
    matters is that a 304 and a repeated 200 can be told apart, which EXP-007's form could not:
    reviews/EXP-007/_critic-r3-verbatim.md, finding 1.)
  - Each project in `summary` is `{waiting, state, stateHash, firstHash, headlineHash}`, with `state`
    in plain words only when it is one of the desk's fixed state forms, else null with `stateHash`
    (present only then). An error is in fixed wording, or the unexpected-error wording with
    `errorKind` and `errorHash`.
- **`sent`:** `at`, `commit`, `bytes`, `created`, `requests`.
- **`send-failed`:** `at`, `error` (fixed words), `step`, `status`, `requests`, `errorKind`,
  `errorHash`.
- Each hash is the lowercase hex SHA-256 of the exact UTF-8 string. The hashes are not secret: anyone
  who can read the repositories could guess a short title or headline and check its hash.
- A `start` with no matching `end` is a refresh that did not finish (killed for time or memory).
- **Widget lifetimes are bounds, never measurements.** For a refresh that did not finish: the
  **lower bound** is the `ms` of its last `alive` mark (0 if it logged none; it lived at least that
  long); the **upper bound** is the gap from its `start` to the next `start` of any context, given
  only when that gap is under 60 seconds (a longer gap is idle time, as in EXP-007, and gives no
  bound). The result states them as "at least" and "at most", never as how long a refresh lived
  (reviews/316/_reviewer-verbatim.md, finding 7).
- **Memory, measured only indirectly.** Scriptable gives a script no reading of its memory, so memory
  is judged by whether the refresh finished, with the response bytes and the kept copy's size as
  proxies. A kill for memory and a kill for time cannot be told apart.
- **Correct:** for a project, its `shape.read` is `ok` and it is a `match` on all four fields at one
  clock time (Method 9).

## Sample
One phone, by design: there is one owner and one phone. Every refresh is logged; the later
refreshes judged are those run as the widget, since the plan tests the widget, not the app: "measure
whether it can work at all, as a home-screen widget, not inside the Scriptable app" (docs/PROJECT.md
Part 2, "Its Discovery, scaled to its size").
- **"A day" means 24 hours** of counted later refreshes: from the `start` of the first counted later
  refresh to the `start` of the last is at least 24 hours. Where this came from: the plan's "a day of
  normal refreshes" and its alternative, "a refresh after a whole day's changes"; a whole day's
  changes are a calendar day's, 24 hours, and a shorter span does not reach them. EXP-007's run was
  about 9¾ hours, which its Reviewer called "not a full day" (reviews/EXP-007/_reviewer-result.md,
  finding 8). The span is measured over the counted refreshes because they are what the pass mark
  judges; the hours before the widget first sees a complete kept copy do not count toward it.
- The owner sends the test data once the widget has been on the home screen, with the first read
  done, for more than 24 hours; about 30 hours leaves margin.

## Exclusions
A refresh interrupted by something outside it (the phone offline, or a GitHub API incident at that
time) is recorded and not counted. No other refresh is thrown out.
- The Reviewer decides an exclusion from three things only: the log's fixed words (a project's
  "Can't read" reason, or `end`'s `errorKind`), GitHub's status history for that time, and the
  owner's word. No other reason excludes a refresh. The owner's iCloud Backup reports (Method 1)
  exclude nothing.
- **Cut off by the send:** a `start` with no `end` that begins within the last 120 seconds before the
  log's last line is not counted, since its end, if any, came after the log was built. (New, a
  choice: EXP-007 had no such rule. The 120 seconds is about the longest later refresh EXP-007
  measured, 137.5 s in the app, rounded down, since a widget refresh is given less time.)
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

Everything below only says how those words apply to this test's log. It adds no condition that
could make a run pass that the words would not, and every outcome other than a pass is a fail or not
judged. The Reviewer applies these rules, not the judge's printed label, and checks them in the order
given: the fail rules first, then the pass, then the not-judged codes.

**Counted later refresh:** kind `later` (Method 5), not excluded.

### Fail: any one of these
- **F1.** A `mismatch` on any project of a counted later refresh (a replay crash included).
- **F2.** A counted later refresh that did not finish (a `start` with no `end`). This includes the
  case where the widget saw a complete kept copy but every such refresh was killed.
- **F3.** A project of a counted later refresh at `checking` (stopped before done): not a correct
  summary.
- **F4.** A project of a counted later refresh at `cant-read` with no exclusion explaining it: not a
  correct summary.
- **F5.** A counted later refresh whose `end` has an error, whatever label the judge prints: it did
  not show a correct summary.
- **F6.** No refresh, in the widget or the app, ever ends with no error, though at least one first
  read in the app was made and not excluded: no copy is ever kept, so no later refresh can run.
- **F7** (**new**). **The widget cannot see the kept copy** (`kept-copy-not-seen`). There is no
  counted later refresh, and at least one *blind widget start*: a `start` with `context: widget`
  such that
  - some refresh E (any context) ended with no error before it, so E marked the kept copy complete
    (Method 5), and E is the last refresh to end with no error before this start;
  - this start is the first `start` of any context after E's `end`;
  - no other refresh started in the 60 seconds before E's `end` without an `end` of its own before
    E's (so nothing still running could have changed the copy after E saved it); and
  - this start's `kept` does not show E's save: `exists` is false, or `cacheComplete` is false, or
    `completeId` is not E's id.

### Pass
Every one of these, and no fail rule fires:
- at least one counted later refresh, and every counted later refresh finishes, with every project
  read `ok` and a `match`;
- no project of a counted later refresh is not judged, and no adapter fault was found (below);
- "a day" is met (Sample): 24 hours from the first counted later refresh's start to the last's;
- the day and the busy stretch, as below; and
- no `log-trimmed` line, and no `snapshot-dropped` line for a counted later refresh.

### The day and the busy stretch
- **A merge** is a merge into one of the three projects' default branches, counted from the clones:
  each commit on the default branch's first-parent line whose committer time falls in the run and
  that either has two or more parents or is the merge commit GitHub records for a merged pull request
  (so local merges, merge commits and squash merges each count once). The portfolio's merges are not
  counted (the plan's busy stretch is the projects' work).
- **A busy stretch** is at least three merges, across the three projects, within any 60 minutes.
  ("Several", read as three or more; a choice. EXP-007's had about six in an hour.)
- **It is covered** when at least one counted later refresh starts after the stretch's first merge
  and no later than 60 minutes after its last.
- The pass mark's condition is met when the counted later refreshes span 24 hours and either a busy
  stretch is covered, or none is. Read so: "if no such stretch happens" covers both a day with no
  busy stretch and one whose stretch no counted refresh saw, since then the widget's later refresh
  never met one; and with 24 hours spanned, the last counted refresh comes after a whole day's
  changes. So, with "a day" read as 24 hours, the busy stretch does not change the outcome; it is
  recorded either way, with its merges, and whether a counted refresh covered it.

### Not judged: when no fail rule fires and the run does not pass
The Reviewer gives the first code that applies. Each is a code of this registration, not of the
judge.
- **N1. `no-widget-start`.** No `start` with `context: widget`: the widget never ran on the home
  screen, so the condition the pass mark tests never happened.
- **N2. `app-first-read-not-made`.** No refresh ever ended with no error, and no first read in the app
  was made (or every one made was excluded): Method 6 was not followed, so F6 cannot apply.
- **N3. `no-widget-start-after-kept`.** A refresh ended with no error, but no widget `start` came
  after any such refresh: the widget never had the chance to use the kept copy (the run too short,
  or the widget not refreshed after the first read).
- **N4. `all-later-excluded`.** Widget starts with a complete kept copy happened, but every one was
  excluded or cut off by the send.
- **N5. `no-counted-later-undecided`.** Any other run with no counted later refresh (for example,
  every widget start after a kept copy was preceded by another refresh that may have changed the
  copy, so F7's conditions are not all met). The Reviewer states the facts.
- **N6. `project-not-judged`.** A project of a counted later refresh is not judged by the judge's
  codes (Method 9), or its snapshot was dropped.
- **N7. `adapter-fault`.** A fault the Reviewer finds in the shared adapter that would change a
  summary, whatever the judge prints: a rerun would share the fault.
- **N8. `run-too-short`.** Counted later refreshes span less than 24 hours, and nothing above fails.
- **N9. `log-trimmed`.** The log dropped lines, so "every time" cannot be checked.

### What follows each outcome
- **Pass:** P-004's Discovery goes on to sizing (the plan's next step), and the result goes to the
  owner with P-004's Design gate.
- **Fail:** the route comes back to the owner, with the sender's summary or the counts-only widget as
  the fallbacks the question named, before any more work (the pass mark's own words).
- **Not judged, any code:** the route also comes back to the owner, with the same two fallbacks,
  before any more work; the owner may also choose to run the test again. This follows the option the
  owner approved: "a fail or another not-judged result comes back to you, with the two fallbacks
  below" (decisions/questions/P-004-widget-next-step.md, option A). EXP-007's result was the first
  not-judged, so any not-judged result here is "another". (A change from EXP-007, whose rules ran the
  test once more before asking.)

### How each reading follows from the pass mark, and where it is a choice
- **F1 to F5** are EXP-007's rules, which the Critic found "add only failures" and "nothing in it
  loosens the mark" (reviews/EXP-007/_critic-r3-verbatim.md, section 2): each is a counted later
  refresh that did not finish or did not show a correct summary, so "finishes and shows a correct
  summary every time" is broken.
- **F6** is EXP-007's rule, narrowed to a run where the first read in the app was tried: then the
  allowance "may still pass if it can be done once inside the Scriptable app and kept" was used and
  failed, and no later refresh can exist. Where it was not tried, the allowance was never tested, so
  that run is N2, not a fail. *A choice:* the narrowing.
- **F7** is new. The pass mark tests a later refresh "with what the first kept" (the plan's "a later
  one with what the first kept") and allows the first to be "done once inside the Scriptable app and
  kept". A blind widget start shows that a copy was kept and complete, nothing could have changed it
  since, and the widget did not see it: "kept" was not met for the widget, so the later refresh the
  pass mark requires cannot happen as a home-screen widget. That is the later refresh failing, not
  failing to be tested. *A choice:* EXP-007's Reviewer chose not judged for the same pattern, because
  no rule said otherwise (D-047); this registration says it before the run. With the kept copy now in
  Documents, which the widget is known to share with the app (the log), a blind start would be new
  evidence about the widget, not about the test's storage. The 60-second guard is also a choice:
  EXP-007's widget refreshes lived at most seconds, and the `alive` marks show any that lived longer.
  The owner may rule F7 a not-judged instead (open question for the Critic and the owner).
- **N1 to N5** cover every other way a run can end with no counted later refresh. In each, the
  condition the pass mark tests (a later refresh in the widget, with a complete kept copy) never
  happened and nothing shows that it cannot: "every time" is not met by none, so it is not a pass,
  and there is no failed later refresh, so it is not a fail.
- **N6 and N7** are EXP-007's not-judged rule and glue.js clause: the comparison could not be made, or
  could not be trusted.
- **N8.** "Over a day" is part of the pass mark: a shorter run cannot pass. It is not a fail, since no
  refresh failed. A fail inside a short run is still a fail (F1 to F5), since "every time" is already
  broken. *A choice:* "a day" as 24 hours (Sample).
- **N9.** With lines dropped, a refresh could be missing, so "every time" cannot be shown.
- **The busy stretch** reading (three or more merges in 60 minutes; covered within 60 minutes; an
  uncovered stretch read as "no such stretch") is a choice of how "several merges in an hour" and "if
  no such stretch happens" apply; with "a day" as 24 hours it does not change the outcome.

### Every way a run can have no counted later refresh
| What the log shows | Rule | Outcome |
|---|---|---|
| The widget never started on the home screen | N1 | not judged |
| No refresh ever ended with no error; a first read in the app was made | F6 | fail |
| No refresh ever ended with no error; no first read in the app was made | N2 | not judged |
| A copy was kept complete, but no widget start came after it | N3 | not judged |
| The widget started right after a complete save, with nothing in between, and did not see the copy | F7 | fail |
| The widget saw a complete copy, but every such refresh was killed | F2 (these are counted later refreshes) | fail |
| The widget saw a complete copy, but every such refresh was excluded or cut off by the send | N4 | not judged |
| Anything else with no counted later refresh | N5 | not judged |

## Holdout use
none.

Before freezing: the Reviewer passes the test widget at `<widget commit, named once the Reviewer
passes it>`, having audited its shared adapter in full and confirmed that it writes only to the local
Documents folder, and the Critic passes this registration (at most three rounds, D-044). The commit
that freezes this file sets the line below; until then it is unset.

frozen: unset in Draft 1; set by the commit that freezes this file on build/definer/p004-exp008, before any run
