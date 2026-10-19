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

*Draft 4 (2026-10-18), after round 3 of both checks (reviews/S-001-notifications/_critic-round3-verbatim.md
and _plan-review-round3-verbatim.md) and the owner's cost instruction of 2026-10-18
(docs/design/references/owner-github-plan-2026-10-18.md, 762e93f): case 5h measures a job candidate
the asks-merge job leaves, now that its `workflow_run`-started runs reach the sender (review N2);
case 9's threshold is set for Workflow 4's cut triggers, checks that a ready workflow whose only job
is skipped still starts Workflow 4, and its fallback restates the cost as information, with no
approval step (the owner's instruction); case 10 adds the REST read of the triggering run as a
second signal, with a stated wait if neither signal carries the field (Critic note 6), asks-merge's
runs admitted by `path`, and the runs list's `status=success` filter (review N5); case 11 registers
research Q-015's unknowns for AC78 (U-1, U-2, the form of `repositoryName`, U-3).*

*Draft 5 (2026-10-18), after round 4 (reviews/S-001-notifications/_critic-round4-verbatim.md and
_plan-review-round4-verbatim.md; the owner's ruling "Fix, then build (Recommended)",
decisions/questions/P-001-notify-round4.md) and the source checks of Q-014 (PASS) and Q-015 (FAIL on
F1.5): case 11's first call now also settles U-11, whether GitHub reports Actions use for this
account at all (its REST usage page says user endpoints "are only applicable if the user has
purchased their own Copilot plan"), tries the classic token on a 404 too (review N7), and compares
the estimate in dollars by percent as well as the minutes (review N8); case 10 checks the job-level
concurrency claim (review N4); case 9's second part matches each Workflow 4 run to its ready run by
`event` and id (review N10).*

*Draft 6 (2026-10-19), after the owner's ruling "A. Go live now, switch later (Recommended)"
(decisions/questions/P-001-notify-which-view.md, pull request #119): case 12 registers what moving
the Home Screen icon and the taps to the sandbox view does to an icon added before the change and
to its subscription (S-001 AC74, AC75, Setup N13). It is added before its own run and changes no
other case, whether or not cases 1 to 3 have been read.*

spec: S-001 (AC74 to AC78, J16 to J21; Workflows 3 and 4)   milestone: none (notifications are
not yet a milestone); run on the preview once the notifications pull requests are merged and
deployed there and Workflow 3 is on (Setup N1 to N8); cases 5g and 9 also after Workflow 4 is on
(N9); case 11 once Setup N12 is done; case 12 once the change of 2026-10-19 (S-001 AC75's
`start_url` "/?sandbox") is deployed to the preview
runner:
- **The owner,** on the iPhone, on the preview (about 20 minutes over two days), and the usage
  token's one test run (Setup N12, within its 5 minutes); no agent holds the token.
- **The Chief of Staff** makes the no-op pull requests for cases 5a, 5f and 5g, files case 5b's
  question with no `Asked in session:` line, reads each run's log for its send time and each
  record's GitHub time, reads the runs for case 10, reads the minutes for case 9, reads case 11's
  `test: usage` log (statuses and field names only, no figure), and records the result.
- **The Builder** builds nothing for it beyond the notifications pull requests; it records the
  result file from the Chief of Staff's hand-over.

result: docs/handover/experiments/EXP-006-result.md, recorded by the Builder from the Chief of
Staff's hand-over (or committed by the owner)
rulings: decisions/questions/P-001-notifications.md (Web Push to the desk on the iPhone's Home
Screen, sent from GitHub; its follow-up names this experiment: "an experiment registration for the
Access question (service worker, manifest and click-through behind Access, Q-011 Q-f)");
decisions/questions/P-001-notify-job-merges.md (the owner's request of 2026-10-18 and ruling A);
decisions/questions/P-001-notify-poom-fast-path.md (B: the fast path, "about as fast as
Service-Desk's", its cost stated); the owner's cost instruction of 2026-10-18 (no approval step; a
percent bar, an estimate past the included minutes, a notification each $50; AC78)
basis: research/Q-011-memo.md, revision 6 (source check PASS): X1, X2, X7, X9 and X10 say how
Cloudflare Access treats the service worker, the manifest and the tap is not documented; D1
(Declarative Web Push on iOS 18.4 and later; its payload single-page); G5 (whether a workflow's
issue assignment pushes to GitHub Mobile is not documented). Apple's page "Sending web push
notifications in web apps and browsers" (403 with a `reason`; "Don't refresh your JWT more
frequently than once per hour"). GitHub's billing documentation (Pro: 3,000 Actions minutes a month
for the account; each job rounded up to a whole minute). research/Q-014-memo.md (not yet
source-checked: PASS, research/Q-014-source-check.md): F3.3 and F6.2, UNKNOWN or C, F6.2's
`head_repository` with no cited source (S16 does not name it). research/Q-015-memo.md
(source-checked: FAIL on F1.5, research/Q-015-source-check.md): U-1 (a fine-grained token with Plan:
read, a documented conflict between the REST data and the tutorial), U-2 (no documented classic
scope), U-3 (the usage data's lag), U-11 (the REST usage page: user endpoints "are only applicable
if the user has purchased their own Copilot plan", github/docs 9c32d33), the form of
`repositoryName` (F1.1, optional, not described), and whether `/usage` pages its results. library/facts/L-F8.md (a workflow's own token starts no run, except dispatches).

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
   Personal-Org-Operating-Model, a pull request opened and one marked ready; (5h) a job candidate
   the asks-merge job leaves, notified from an asks-merge run that `workflow_run` started;
6. a Declarative push whose `notification` holds a `tag` replaces an earlier one with the same tag,
   rather than adding to it;
7. `test: fail` makes exactly one request, signed with a throwaway VAPID key, which the push
   service refuses; nothing shows on the phone; AC76's issue opens; and GitHub Mobile notifies its
   assignment;
8. a JWT reused within its hour is accepted by Apple's push service;
9. the account's Actions minutes over a week, all private repositories together, and Workflow 4's
   share, project to no more than 600 minutes a month for Workflow 4; and a run of the
   operating-model project's ready workflow, whose only job is skipped, still starts Workflow 4;
10. on a real `workflow_run` run of Workflow 3, `github.event.workflow_run.head_repository.full_name`
    is `shumpmaster/Service-Desk` for a same-repository trigger (so the origin gate passes); the
    REST read of the triggering run, `actions/runs/<id>`, gives the same `head_repository`; an
    asks-merge run started by `workflow_run` has `event` `workflow_run` and `path`
    `.github/workflows/asks-merge.yml` and passes the gate; REST
    `actions/workflows/desk-notify.yml/runs` lists that run with `head_branch` `main`; and its
    `status=success` filter lists only runs that concluded `success` (Q-014 F6.2 and F3.3); and
    no pending `notify` job was replaced by a run whose job the gate skipped (the job-level
    concurrency claim, C);
11. GitHub reports this account's Actions use through
    `/users/shumpmaster/settings/billing/usage/summary` and `/usage` with `year` and `month` (200,
    with Actions items and the fields AC78 uses), although the account has no Copilot plan of its
    own (Q-015 U-11); a fine-grained token of the account with only Plan: Read-only reads them
    (U-1); the desk's private-repository minutes for the month are within 5% of what GitHub's
    billing page shows for private repositories; and the desk's estimate is within 5% of the
    metered amount that page shows for Actions, both read the same hour (U-3);
12. once the manifest's `start_url` is "/?sandbox": an icon added before the change keeps opening
    "/" (the older view), since iOS keeps the start address it saved (not documented, C); a tap's
    `/?sandbox&open=<key>` opens the sandbox view at the item from either icon; and the icon added
    again from `/?sandbox` opens the sandbox view, and starts with no subscription, so "Turn on
    notifications" is offered again and the old subscription later answers gone (C).

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
   marks ready (5g). (5h) is taken as it comes, if the asks-merge job leaves a pull request in
   the window. The no-op pull requests are then closed. Nothing else is staged.
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
   through, its triggering run through REST, one run that an asks-merge `workflow_run` run started,
   and the REST listing of the workflow's runs with and without `status=success`, and records the
   fields. For the concurrency claim, the Chief of Staff lists, over case 5's two days, every
   desk-notify run whose `notify` job was cancelled, and for each reads whether the run that took
   its place in the group had a job that ran or one the gate skipped. Case 9's second part: the
   Chief of Staff lists, after case 5g, each run of the operating-model project's ready workflow,
   and for each looks for a Workflow 4 run with `event` `workflow_run` whose triggering run
   (`workflow_run.id` in its payload, read through REST) is that ready run's id.
9. Case 11: after Setup N12 (its preview deploy included), the owner runs desk-notify with
   `test: usage`; the Chief of Staff reads the log's statuses and field names (no figure is
   logged): first whether any Actions item came back at all (U-11), then the token's answer; if
   refused or not found (401, 403 or 404), the owner follows N12 step 5 and the kind and scope
   that worked, or that none did, is recorded; where the use is reported, the owner then compares
   the desk's line with GitHub's billing page (Settings, Billing and licensing, Usage, Actions,
   private repositories): its minutes and its metered amount, noting both figures and times on
   the phone, not in a public file, and tells the Chief of Staff only the two differences in
   percent and the lag; the Chief of Staff also records the form of
   `repositoryName` from the `test: usage` log's line naming it (with or without the owner, never a
   name).
10. For each push, the Chief of Staff takes from the run's log the time of the push service's
   answer, and from GitHub the record's time; the owner notes when each notification showed.
11. Case 12: after the change is deployed, the owner opens the desk from the old icon and notes
   which view opens; runs `test: true` and taps it, noting which view opens and at what; then, if
   the old icon opened the older view, does Setup N13 and notes which view the new icon opens and
   whether the desk offered "Turn on notifications" again; the Chief of Staff reads from the
   sender's logs whether a push to the old subscription answered 410 or 404 (no value is ever
   recorded), and records the answers.

## Measure
- Pass or fail for cases 1 to 4, 6, 7 (each of its parts), 8, 10 (each of its parts) and 11, with
  the path used in case 2 and, for case 11, the token kind and scope that worked.
- For case 5, for each route: the minutes from the record's GitHub time to the push's `201`, and to
  its showing on the phone. A run GitHub delayed is counted as measured, with the delay noted.
- For case 9: the account's minutes in the week and Workflow 4's, the month projected from
  them, and whether the skipped ready job started Workflow 4.
- For case 11: whether Actions use is reported at all; the token kind and scope that worked;
  the differences in percent between the desk's minutes and estimate and GitHub's page; and the
  lag in minutes. No billing figure is recorded in the result, which is public.
- For case 12: which view the old icon opens; which view and item a tap opens; and, if N13 was
  needed, which view the new icon opens, whether "Turn on notifications" was offered again, and
  whether the old subscription answered gone.

## Sample
One iPhone, the owner's; each case once, and case 5 once for each of its routes, over at most two
days (case 9 over a week). The small sample is by design: there is one owner and one phone.

## Exclusions
- A case interrupted by something outside it (the phone offline, Access down, GitHub's status page
  showing an Actions incident) is recorded and run again once. A run GitHub merely delayed is not
  excluded: it is part of what case 5 measures.

## Deciding threshold
- **Pass:** cases 1 to 4 pass, and (5a) to (5e) and (5g) are each under 5 minutes. (5f), (5h) and
  cases 6 to 12 decide only their own choices.
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
  - (5h) over 5 minutes: AC74's line for a job candidate the job leaves states the delay
    measured;
  - case 9 over 600 minutes a month for Workflow 4: the cost is restated to the owner as
    information (no approval step, the owner's instruction), the causes named, and no cut below
    the 3-hourly check is made; a skipped ready job starting nothing: that job runs one step,
    `true`, and the cost is restated with it;
  - case 10 failing on the payload's field: the program reads the triggering run through REST and
    tests its `head_repository` before any secret's value is read; failing on that too: Workflow 3
    admits no `workflow_run` run, and AC74 states the 5-minute check's wait; failing on asks-merge's
    `path`: asks-merge's runs are admitted by `name` and `event` instead; failing on
    `status=success`: J18's lookup uses `status=completed`, its page bounded as before, and J18
    relies on its other checks and the HMAC; skipped runs found to conclude `success`: J18's lookup
    starts from the artifacts listed by name; a pending job replaced by a skipped one: the
    concurrency is reviewed, and AC74 states the delay as up to the next 5-minute check;
  - case 11 finding no Actions items, or a refusal or 404 with every token kind: GitHub does not
    report Actions use to the desk for this account; the Builder sets J7's
    `actionsUsage.reported` to `false` in the fix-forward pull request, AC78's line reads "Not
    reported" with no bar and no $50 notifications, the owner is told, and Setup N11's e-mails
    become recommended; the unused tokens are deleted;
  - case 11 failing with a fine-grained token only: the classic token of Setup N12 step 5, its
    scope recorded;
  - the desk's estimate more than 5% from GitHub's metered amount: AC78's estimate rule (the
    summary against `/usage`, prices assumed) is reviewed and fixed forward; the desk's minutes more than 5% from GitHub's page: AC78's counting rule
    (public repositories, items without `repositoryName`) is reviewed and fixed forward; the lag is
    stated beside "as of";
  - case 12 finding a tap opening the older view: the sandbox's address handling is fixed forward;
    the new icon opening the older view: S-001 Setup N13 is restated and the owner told; the
    subscription kept after re-adding: N13's update step is recorded as not needed next time.

## Holdout use
none

frozen: the last commit that changes this file on build/definer/s001-notifications, before any run;
for case 12, the last commit that changes it on build/definer/s001-notify-sandbox, before case 12's
run
