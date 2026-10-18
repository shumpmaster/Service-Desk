# Experiment registration — EXP-006

*Pre-registered before any run (D-047). Frozen once the line below is set.*

*Draft 2 (2026-10-18), after the Critic's check and plan review round 1 of S-001's notifications
amendment (reviews/S-001-notifications/, on the branch orch/s001-notifications): case 7 now uses a
throwaway VAPID key the push service can refuse (Critic 7, B1); case 5 measures each trigger route,
including a run started by a workflow's own token, an owner's push and a pull request marked ready
(Critic N1, review N13); cases 8 and 9 are added (Critic 8, review N3; the fast-path cost); the
run comes before AC77's session hold is built (Critic N2); and cases 1 and 2 have a fallback for
any cause (Critic N2).*

spec: S-001 (AC74, AC75, AC76, J17, J19; Workflows 3 and 4)   milestone: none (notifications are
not yet a milestone); run on the preview once the notifications pull request is merged and deployed
there, Workflow 3 is merged and switched on (Setup N1 to N8), and before AC77's session hold is
built; cases 8 and 9 also after Workflow 4 is on (N9)
runner:
- **The owner,** on the iPhone, on the preview (about 20 minutes over two days).
- **The Chief of Staff** makes the no-op pull request for cases 5a and 5f, reads each run's log for
  its send time and each record's GitHub time, reads the Actions minutes for case 9, and records
  the result.
- **The Builder** builds nothing for it beyond the notifications pull requests; it records the
  result file from the Chief of Staff's hand-over.

result: docs/handover/experiments/EXP-006-result.md, recorded by the Builder from the Chief of
Staff's hand-over (or committed by the owner)
rulings: decisions/questions/P-001-notifications.md (Web Push to the desk on the iPhone's Home
Screen, sent from GitHub; its follow-up names this experiment: "an experiment registration for the
Access question (service worker, manifest and click-through behind Access, Q-011 Q-f)");
decisions/questions/P-001-notify-job-merges.md (the owner's request of 2026-10-18 and ruling A);
decisions/questions/P-001-notify-poom-fast-path.md (B: the fast path, its cost stated)
basis: research/Q-011-memo.md, revision 6 (source check PASS): X1, X2, X7, X9 and X10 say how
Cloudflare Access treats the service worker, the manifest and the tap is not documented; D1
(Declarative Web Push on iOS 18.4 and later; its payload single-page); V7 (the push service's
answers; Apple's 403 for a bad or expired JWT); V8 (refresh the JWT at most hourly, single-page);
G5 (whether a workflow's issue assignment pushes to GitHub Mobile is not documented); T11 (2,000
free private Actions minutes a month on GitHub Free); library/facts/L-F8.md (a workflow's own
token starts no run, except dispatches)

## Hypothesis
Behind the preview's Cloudflare Access application, on the owner's iPhone:
1. the desk added to the Home Screen opens as a web app (no Safari bar), so its manifest was read;
2. "Turn on notifications" subscribes, through Declarative Web Push on iOS 18.4 and later, or
   through the service worker `/sw.js` otherwise;
3. a test push from Workflow 3 (`test: true`) shows, and a tap on it opens the desk at its address;
4. with the Access session ended, a push still shows, and its tap leads through Access's sign-in
   to the same address;
5. each trigger route reaches the sender and notifies within 5 minutes of the record's GitHub time:
   (5a) a pull request opened; (5b) a question filed through the asks-merge job; (5c) a run started
   by a workflow's own token (a card raised by the Orchestrator if one occurs in the window, else
   the governance run the asks-merge job starts after (5b)); (5d) a deploy requested; (5e) an
   owner's own push to main. And (5f), a pull request marked ready, is found by the 5-minute check;
6. a Declarative push whose `notification` holds a `tag` replaces an earlier one with the same tag,
   rather than adding to it;
7. `test: fail`, signed with a throwaway VAPID key, is refused by the push service, nothing shows
   on the phone, AC76's issue opens, and GitHub Mobile notifies its assignment;
8. a JWT reused within its hour is accepted by Apple's push service;
9. Workflow 4 uses no more than 900 minutes a month of Personal-Org-Operating-Model's Actions
   allowance, read from a week's use.

## Method
1. The owner does S-001 Setup N5 to N8 on the iPhone and records its iOS version. Cases 1 to 3 are
   read from that: whether the icon opens with no Safari bar, whether "Turn on notifications" ends
   with the value shown (and by which path, which the control names), and whether the test push
   shows and its tap opens the desk.
2. The owner ends the Access session (`/cdn-cgi/access/logout` on the preview), locks the phone,
   and runs `test: true` again; then taps the notification, and notes where it leads (case 4).
3. Case 5: the Chief of Staff opens a no-op pull request (5a), files its next question in the
   course of its work (5b, then 5c from the governance run that follows, or an Orchestrator card if
   one occurs), the next deploy requested is taken as it comes (5d), the owner makes one commit of
   their own to main from the web, such as an answer (5e), and the Chief of Staff opens a second
   no-op pull request as a draft and marks it ready (5f); both no-op pull requests are then
   closed. Nothing else is staged.
4. Case 6: the owner runs `test: true` twice, a minute apart, and notes whether one or two test
   notifications are on the lock screen.
5. Case 7: the owner runs `test: fail`, and notes whether anything shows on the phone and whether
   GitHub Mobile notifies the issue's assignment.
6. Case 8: from the run logs, the Chief of Staff notes a send made with a JWT minted earlier in its
   hour, and its answer.
7. Case 9: a week after Workflow 4 is on, the Chief of Staff reads its runs' billed minutes (the
   runs' timing in the Actions API), and the owner reads the account's Actions usage in GitHub's
   billing settings.
8. For each push, the Chief of Staff takes from the run's log the time of the push service's
   answer, and from GitHub the record's time; the owner notes when each notification showed.

## Measure
- Pass or fail for cases 1 to 4, 6, 7 (with each of its three parts) and 8, with the path used in
  case 2.
- For case 5, for each route: the minutes from the record's GitHub time to the push's `201`, and to
  its showing on the phone.
- For case 9: minutes in the week, and the month projected from it.

## Sample
One iPhone, the owner's; each case once, and case 5 once for each of its routes, over at most two
days (case 9 over a week). The small sample is by design: there is one owner and one phone.

## Exclusions
- A run GitHub delayed by more than 15 minutes is recorded and run again once.
- A case interrupted by something outside it (the phone offline, Access down) is recorded and run
  again once.

## Deciding threshold
- **Pass:** cases 1 to 4 pass, and (5a) to (5e) are each under 5 minutes. (5f) and cases 6 to 9
  decide only their own choices.
- **Fallbacks:**
  - cases 1 or 2, or the service worker, failing because Access answers a fetch with a sign-in
    page: the owner adds S-001 Setup N10's Access exception (one self-hosted application with a
    Bypass policy for each of `/manifest.webmanifest`, `/sw.js` and `/icons/*`), and the case is
    run again;
  - cases 1 or 2 failing for any other reason: the reason is recorded, the Builder fixes forward,
    and the case is run again once; if it fails again, the owner rules;
  - case 3 or 4 failing: the tap opens the desk's root, and the owner opens the item from there,
    recorded as a known limit in AC74;
  - (5a) to (5e) over 5 minutes: AC74 states the delay as measured, and the route's trigger is
    reviewed;
  - case 6 failing: a repeated push may add a notification, recorded as a known limit in J17;
  - case 7 failing in its last part: AC76's issue stays, and its limit is stated in AC76; in its
    first parts: the `test: fail` design is fixed forward before the owner relies on it;
  - case 8 failing: the sender mints a JWT on every run, and the reading of V8 is recorded;
  - case 9 over 900 minutes a month: Workflow 4's 3-hourly check is lengthened, and the cost
    restated to the owner.

## Holdout use
none

frozen: the last commit that changes this file on build/definer/s001-notifications, before any run
