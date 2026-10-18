# Experiment registration — EXP-006

*Pre-registered before any run (D-047). Frozen once the line below is set.*

spec: S-001 (AC74, AC75, AC76, J17, J19; Workflow 3)   milestone: none (notifications are not yet
a milestone); run on the preview once the notifications pull request is merged and deployed there,
and Setup N1 to N4 and Workflow 3 (CS15) are done
runner:
- **The owner,** on the iPhone, on the preview (about 15 minutes in all).
- **The Chief of Staff** makes the no-op draft pull request for case 5, reads each run's log for
  its send time and the triggering event's GitHub time, and records the result.
- **The Builder** builds nothing for it, beyond the notifications pull request itself; it records
  the result file from the Chief of Staff's hand-over.

result: docs/handover/experiments/EXP-006-result.md, recorded by the Builder from the Chief of
Staff's hand-over (or committed by the owner)
rulings: decisions/questions/P-001-notifications.md (Web Push to the desk on the iPhone's Home
Screen, sent from GitHub; its follow-up names this experiment: "an experiment registration for the
Access question (service worker, manifest and click-through behind Access, Q-011 Q-f)");
decisions/questions/P-001-notify-job-merges.md (the owner's request of 2026-10-18 and ruling A)
basis: research/Q-011-memo.md, revision 6 (source check PASS): X1, X2, X7, X9 and X10 say how
Cloudflare Access treats the service worker, the manifest and the tap is not documented; D1
(Declarative Web Push on iOS 18.4 and later); G5 (whether a workflow's issue assignment pushes to
GitHub Mobile is not documented)

## Hypothesis
Behind the preview's Cloudflare Access application, on the owner's iPhone:
1. the desk added to the Home Screen opens as a web app (no Safari bar), so its manifest was read;
2. "Turn on notifications" subscribes, through Declarative Web Push on iOS 18.4 and later, or
   through the service worker `/sw.js` otherwise;
3. a test push from Workflow 3 (`test: true`) shows, and a tap on it opens the desk at its address;
4. with the Access session ended, a push still shows, and its tap leads through Access's sign-in
   to the same address;
5. the events reach the sender: a pull request marked ready, a question filed through the
   asks-merge job, and a deploy requested each notify within 5 minutes of their GitHub time;
6. the payload's extra top-level `desk` member does not stop a Declarative push from showing;
7. AC76's issue, opened by `test: fail`, reaches the owner through GitHub Mobile.

## Method
1. The owner does S-001 Setup N5 to N7 on the iPhone and records its iOS version. Steps 1 to 3
   of the hypothesis are read from that: whether the icon opens with no Safari bar, whether "Turn
   on notifications" ends with the value shown (and by which path, which the control names), and
   whether the test push shows and its tap opens the desk.
2. The owner ends the Access session (`/cdn-cgi/access/logout` on the preview), locks the phone,
   and runs `test: true` again; then taps the notification, and notes where it leads.
3. The Chief of Staff opens a draft pull request with a no-op change and marks it ready, then
   closes it; the next question it files in the course of its work, through the asks-merge job,
   and the next deploy requested, are the other two events of case 5. Nothing is staged beyond the
   no-op pull request.
4. The owner runs `test: fail`, and notes whether GitHub Mobile notifies the issue's assignment.
5. For each push, the Chief of Staff takes from the run's log the time of the push service's
   `201`, and from GitHub the record's time (the pull request's ready time, the job's merge time,
   the deploy run's creation time); the owner notes when each notification showed.

## Measure
- Pass or fail for cases 1 to 4, 6 and 7, with the path used in case 2.
- For case 5, for each event: the minutes from the record's GitHub time to the push's `201`, and
  to its showing on the phone.

## Sample
One iPhone, the owner's; each case once, and case 5 once for each of its three events, over at
most two days. The small sample is by design: there is one owner and one phone.

## Exclusions
- A run GitHub delayed by more than 15 minutes is recorded and run again once.
- A case interrupted by something outside it (the phone offline, Access down) is recorded and run
  again once.

## Deciding threshold
- **Pass:** cases 1 to 4 pass, and case 5 is under 5 minutes for each event. Cases 6 and 7
  decide only their own choice.
- **Fallbacks:**
  - cases 1 or 2, or the service worker, failing because Access answers its fetch with a sign-in
    page: the owner adds an Access Bypass policy for exactly `/manifest.webmanifest`, `/sw.js` and
    `/icons/*`, which hold no records (S-001 Setup N8), and the case is run again;
  - case 3 or 4 failing: the tap opens the desk's root, and the owner opens the item from there,
    recorded as a known limit in AC74;
  - case 5 over 5 minutes for an event: the sweep's interval stays, and AC74 states the delay as
    measured;
  - case 6 failing: J17 drops the `desk` member, and the service worker takes its tag from the
    `navigate` address;
  - case 7 failing: AC76's issue stays, and its limit is stated in AC76.

## Holdout use
none

frozen: the last commit that changes this file on build/definer/s001-notifications, before any run
