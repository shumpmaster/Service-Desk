# Experiment registration — EXP-006

*Pre-registered before any run (D-047). Frozen once the line below is set.*

*Draft 3 (2026-10-18), after round 2 of the Critic's check and plan review of S-001's notifications
amendment (reviews/S-001-notifications/, on the branch orch/s001-notifications): the precondition
"before AC77's session hold is built" is gone, since the brief builds the hold first; case 5b now
uses a question with no `Asked in session:` line, so the hold cannot touch it (Critic B4, review
B4). Case 5g measures the operating-model project's own delays (Critic B2). Case 7 makes exactly one
request (review B2). Case 9 reads the account's minutes, which every private repository shares
(Critic B2, review N2). Case 10 registers research Q-014's unknowns (Critic B3). A run GitHub delays
is counted in the result, not thrown out (Critic note 9). Case 8's fallback no longer mints a JWT
every run (review N10).*

spec: S-001 (AC74 to AC77, J16 to J19; Workflows 3 and 4)   milestone: none (notifications are
not yet a milestone); run on the preview once the notifications pull requests are merged and
deployed there and Workflow 3 is on (Setup N1 to N8); cases 5g and 9 also after Workflow 4 is on
(N9)
runner:
- **The owner,** on the iPhone, on the preview (about 20 minutes over two days).
- **The Chief of Staff** makes the no-op pull requests for cases 5a, 5f and 5g, files case 5b's
  question with no `Asked in session:` line, reads each run's log for its send time and each
  record's GitHub time, reads the runs for case 10, reads the minutes for case 9, and records the
  result.
- **The Builder** builds nothing for it beyond the notifications pull requests; it records the
  result file from the Chief of Staff's hand-over.

result: docs/handover/experiments/EXP-006-result.md, recorded by the Builder from the Chief of
Staff's hand-over (or committed by the owner)
rulings: decisions/questions/P-001-notifications.md (Web Push to the desk on the iPhone's Home
Screen, sent from GitHub; its follow-up names this experiment: "an experiment registration for the
Access question (service worker, manifest and click-through behind Access, Q-011 Q-f)");
decisions/questions/P-001-notify-job-merges.md (the owner's request of 2026-10-18 and ruling A);
decisions/questions/P-001-notify-poom-fast-path.md (B: the fast path, "about as fast as
Service-Desk's", its cost stated)
basis: research/Q-011-memo.md, revision 6 (source check PASS): X1, X2, X7, X9 and X10 say how
Cloudflare Access treats the service worker, the manifest and the tap is not documented; D1
(Declarative Web Push on iOS 18.4 and later; its payload single-page); G5 (whether a workflow's
issue assignment pushes to GitHub Mobile is not documented). Apple's page "Sending web push
notifications in web apps and browsers" (403 with a `reason`; "Don't refresh your JWT more
frequently than once per hour"). GitHub's billing documentation (Pro: 3,000 Actions minutes a month
for the account; each job rounded up to a whole minute). research/Q-014-memo.md (not yet
source-checked): F3.3 and F6.2, UNKNOWN or C. library/facts/L-F8.md (a workflow's own token starts
no run, except dispatches).

## Hypothesis
Behind the preview's Cloudflare Access application, on the owner's iPhone:
1. the desk added to the Home Screen opens as a web app (no Safari bar), so its manifest was read;
2. "Turn on notifications" subscribes, through Declarative Web Push on iOS 18.4 and later, or
   through the service worker `/sw.js` otherwise;
3. a test push from Workflow 3 (`test: true`) shows, and a tap on it opens the desk at its address;
4. with the Access session ended, a push still shows, and its tap leads through Access's sign-in
   to the same address;
5. each trigger route reaches its sender and notifies within 5 minutes of the record's GitHub time:
   (5a) a pull request opened in Service-Desk; (5b) a question filed through the asks-merge job,
   with no `Asked in session:` line; (5c) a run started by a workflow's own token (a card raised by
   the Orchestrator if one occurs in the window, else the governance run the asks-merge job starts
   after (5b)); (5d) a deploy requested; (5e) an owner's own push to main; (5f) a pull request
   marked ready in Service-Desk, through the no-secret ready workflow; (5g) in
   Personal-Org-Operating-Model, a pull request opened and one marked ready;
6. a Declarative push whose `notification` holds a `tag` replaces an earlier one with the same tag,
   rather than adding to it;
7. `test: fail` makes exactly one request, signed with a throwaway VAPID key, which the push
   service refuses; nothing shows on the phone; AC76's issue opens; and GitHub Mobile notifies its
   assignment;
8. a JWT reused within its hour is accepted by Apple's push service;
9. the account's Actions minutes over a week, all private repositories together, and Workflow 4's
   share, project to no more than 900 minutes a month for Workflow 4;
10. on a real `workflow_run` run of Workflow 3, `github.event.workflow_run.head_repository.full_name`
    is `shumpmaster/Service-Desk` for a same-repository trigger (so the origin gate passes), and
    REST `actions/workflows/desk-notify.yml/runs` lists that run with `head_branch` `main`
    (Q-014 F6.2 and F3.3).

## Method
1. The owner does S-001 Setup N5 to N8 on the iPhone and records its iOS version. Cases 1 to 3 are
   read from that: whether the icon opens with no Safari bar, whether "Turn on notifications" ends
   with the value shown (and by which path, which the control names), and whether the test push
   shows and its tap opens the desk.
2. The owner ends the Access session (`/cdn-cgi/access/logout` on the preview), locks the phone,
   and runs `test: true` again; then taps the notification, and notes where it leads (case 4).
3. Case 5: the Chief of Staff opens a no-op pull request (5a); files a question with no `Asked in
   session:` line, in the course of its work (5b, then 5c from the governance run that follows, or
   an Orchestrator card if one occurs); the next deploy requested is taken as it comes (5d); the
   owner makes one commit of their own to main from the web, such as an answer (5e); the Chief of
   Staff opens a second no-op pull request as a draft and marks it ready (5f); and, once Workflow 4
   is on, opens a no-op pull request in Personal-Org-Operating-Model and a draft there that it
   marks ready (5g). The no-op pull requests are then closed. Nothing else is staged.
4. Case 6: the owner runs `test: true` twice, a minute apart, and notes whether one or two test
   notifications are on the lock screen.
5. Case 7: the owner runs `test: fail`; the Chief of Staff counts its requests in the run's log;
   the owner notes whether anything shows on the phone and whether GitHub Mobile notifies the
   issue's assignment.
6. Case 8: from the run logs, the Chief of Staff notes a send made with a JWT minted earlier in its
   hour, and its answer.
7. Case 9: a week after Workflow 4 is on, the owner reads the account's Actions use in GitHub's
   billing settings, and the Chief of Staff reads Workflow 4's runs and their jobs' times.
8. Case 10: the Chief of Staff reads one `workflow_run` run of Workflow 3 that its origin gate let
   through, and the REST listing of the workflow's runs, and records the two fields.
9. For each push, the Chief of Staff takes from the run's log the time of the push service's
   answer, and from GitHub the record's time; the owner notes when each notification showed.

## Measure
- Pass or fail for cases 1 to 4, 6, 7 (each of its parts), 8 and 10, with the path used in case 2.
- For case 5, for each route: the minutes from the record's GitHub time to the push's `201`, and to
  its showing on the phone. A run GitHub delayed is counted as measured, with the delay noted.
- For case 9: the account's minutes in the week and Workflow 4's, and the month projected from
  them.

## Sample
One iPhone, the owner's; each case once, and case 5 once for each of its routes, over at most two
days (case 9 over a week). The small sample is by design: there is one owner and one phone.

## Exclusions
- A case interrupted by something outside it (the phone offline, Access down, GitHub's status page
  showing an Actions incident) is recorded and run again once. A run GitHub merely delayed is not
  excluded: it is part of what case 5 measures.

## Deciding threshold
- **Pass:** cases 1 to 4 pass, and (5a) to (5e) and (5g) are each under 5 minutes. (5f) and cases
  6 to 10 decide only their own choices.
- **Fallbacks:**
  - cases 1 or 2, or the service worker, failing because Access answers a fetch with a sign-in
    page: the owner adds S-001 Setup N10's Access exception (one self-hosted application with a
    Bypass policy for each of `/manifest.webmanifest`, `/sw.js` and `/icons/*`), and the case is
    run again;
  - cases 1 or 2 failing for any other reason: the reason is recorded, the Builder fixes forward,
    and the case is run again once; if it fails again, the owner rules;
  - case 3 or 4 failing: the tap opens the desk's root, and the owner opens the item from there,
    recorded as a known limit in AC74;
  - any of case 5 over 5 minutes: AC74 states the delay as measured, and the route's trigger is
    reviewed; for (5g), the delay is restated to the owner against the fast-path ruling's "about as
    fast";
  - case 6 failing: a repeated push may add a notification, recorded as a known limit in J17;
  - case 7 failing in its last part: AC76's issue stays, and its limit is stated in AC76; in its
    first parts: the `test: fail` design is fixed forward before the owner relies on it;
  - case 8 failing: the JWT is still minted at most once an hour, and an item Apple refuses stays
    unsent until a new JWT is due; the reading of Apple's rule is recorded;
  - case 9 over 900 minutes a month for Workflow 4: its 3-hourly check is lengthened, then its `ci`
    trigger limited to `pull_request` runs, and the cost restated to the owner;
  - case 10 failing: the origin gate is made in the program from the payload read through `env:`,
    before any secret's value is read, and J18's lookup relies on its other checks and the HMAC.

## Holdout use
none

frozen: the last commit that changes this file on build/definer/s001-notifications, before any run
