# Experiment registration — EXP-007

*Pre-registered before any run (D-047). Frozen once the line below is set.*

*Draft 1 (2026-11-04), from P-004's short plan, "Its Discovery, scaled to its size" (docs/PROJECT.md
Part 2, "Later work: the home-screen widget (P-004)"). A small test: can a home-screen widget do the
desk's reads and make its cards within a refresh's time and memory.*

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
(Recommended)": key in the iPhone keychain, records on the phone only, nothing synced to iCloud)
basis: docs/PROJECT.md Part 2, P-004's "Data on the phone" and "Its Discovery, scaled to its size";
intake/requests/P-004.toml; src/config/projects.json (three projects, Service-Desk,
Personal-Org-Operating-Model and Model-Lab, plus the portfolio, shumpmaster/portfolio: four
repositories); the request counts the plan cites, specs/S-001.md lines 4954-4955, 14611 and
14620-14621; src/lib/model.js:1-3 (the read model needs no network)

## Hypothesis
A Scriptable home-screen widget, run as the widget and not inside the Scriptable app, can make the
desk's reads for all three projects and the portfolio and run the desk's card-making code on them
within a widget refresh's time and memory.
- A later refresh, with what an earlier one kept, finishes and shows a correct summary.
- A first refresh, with nothing kept, may or may not finish in the widget.

The size to expect, from the plan: a first read of one project can take up to about 400 GitHub
requests (up to 16 record-reading calls of up to 25 requests each, specs/S-001.md lines 4954-4955
and 14611); a later one makes one call listing what changed, of up to 30 requests (23 when nothing
changed, lines 14620-14621), plus up to 25 for each record-reading call the changes need (line
14611). Three projects and the portfolio multiply that.

## Method
1. The owner makes a fine-grained, read-only GitHub key with Contents: read, Pull requests: read and
   Metadata: read, on only the four repositories in src/config/projects.json (shumpmaster/Service-Desk,
   shumpmaster/Personal-Org-Operating-Model, shumpmaster/Model-Lab, shumpmaster/portfolio), with a
   7-day expiry. The owner deletes it after the test.
2. Before installing, the owner turns Scriptable's iCloud Drive off, so nothing it keeps can sync to
   iCloud. The owner then installs the test widget and runs it once in the Scriptable app, where it asks for the
   key and stores it in the iPhone keychain. Nothing is kept in Scriptable's iCloud folder, and the
   widget sends nothing anywhere but GitHub (docs/PROJECT.md Part 2, "Data on the phone").
3. The owner adds it to the home screen. Two kinds of refresh are measured: a first with nothing
   kept, and later ones with what the first kept.
4. If the first refresh cannot finish in the widget, it is done once in the Scriptable app and kept,
   as the plan allows; the later refreshes then run in the widget. If it cannot finish in the app
   either, nothing is kept and no later refresh can run.
5. The owner lets it refresh normally for a day that includes at least one busy stretch (several
   merges in an hour), or, if no such stretch happens, a refresh after a whole day's changes.
6. The log holds project content, which Part 1 section 5 lets go only to GitHub and Cloudflare, so
   the owner returns it through GitHub, never through a chat: from the Scriptable app's share sheet,
   Save to Files (On My iPhone); then on github.com, in Service-Desk, Add file → Upload files, onto
   a new branch `exp-007-log`. The Reviewer reads the log from that branch. For each logged `end`,
   the Reviewer runs the desk's own code on the records at the four logged shas and compares its summary
   with the logged one.

## Measure
The log: one JSON line per event, kept in Scriptable's on-phone local storage.
- **`start`,** written before any read: the time, the run context (widget or app), and whether a
  kept cache was present (yes or no).
- **`end`:** elapsed milliseconds; the GitHub request count; the response bytes read; the kept
  cache's size in bytes; for each of the four repositories, the default-branch commit sha it read;
  the summary it showed (for each project: what waits on the owner, the project's state and its
  headline); and any error.
- A `start` with no matching `end` counts as a refresh that did not finish (killed for time or
  memory).
- **Memory, measured only indirectly.** Scriptable gives a script no direct reading of its memory.
  So memory is judged by whether the refresh finished (no `end` means it was killed), with the
  response bytes and the cache size as proxies. A kill for memory and a kill for time cannot be told
  apart from the log.
- **Correct:** the Reviewer's summary from the desk's code on the records at the logged shas matches
  the logged summary exactly on what waits, state and headline.

## Sample
One phone, one day, by design: there is one owner and one phone. Every refresh in the day is
logged; the later refreshes judged are those run as the widget, since the test is of the widget, not
the app (docs/PROJECT.md Part 2, "Then measure whether it can work at all, as a home-screen widget").

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

## Holdout use
none.

frozen: the last commit that changes this file on build/definer/p004-widget-exp, before any run
