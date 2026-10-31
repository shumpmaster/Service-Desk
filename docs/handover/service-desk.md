# Handover package — Service-Desk

*Handed from the pipeline to the project's operating team at launch (D-036).*

## What this means for you

Four things were not done the usual way before launch. You accepted the trial week and its check
as met, so your first weekly figures and their check are first seen after launch. The screen names
in your steps were not re-checked. No usage token was ever made, so the desk shows no Actions
figures. Three of your model's Build checks are recorded as skipped, each with its reason. From
launch, the desk lives at your needs-you address, the old page is archived, and your phone's
notifications come from the new icon. You approve every deploy, renew the tokens and answer what
the desk asks; your Chief of Staff runs the weekly value check. Regenerating the tokens at launch
can't be undone; going live and archiving can be undone in minutes.

## What it does

The desk is one page, made for the phone, that shows everything waiting on you across your
connected projects (today Service-Desk and Personal-Org-Operating-Model, with the portfolio read
for your other work): cards, questions, pull requests to merge or give a verdict on, and deploys to
approve. Each item opens a sheet with its context and an answer link that opens GitHub's new-file
page with your answer filled in; the desk itself writes nothing. It also shows each project's plan
with the agents' estimates, the agents' usage and context figures, each project's phases and
timeline, and Service-Desk's value targets against their measures. A sender sends a phone
notification the moment something starts waiting on you, and a tap opens the desk at it.

It runs on Cloudflare Pages behind Cloudflare Access (your e-mail address only), reading GitHub
with one read-only token:
- **`needs-you`** (`https://needs-you.pages.dev`): the desk you use, from launch;
- **`service-desk-preview`** (`https://service-desk-preview.pages.dev`): the preview, where each
  change is accepted before it reaches production.

The senders are GitHub Actions workflows: Service-Desk's `desk-notify`, and the operating-model
project's own, pinned to the desk's code (CS16); the build and tests are
Service-Desk's `desk-build` workflow; the deploys are its `desk-deploy` workflow, every job held for
your approval.

## How to run it

**The operating team:**
- **the owner:** approves every deploy, renews the tokens, answers asks, and does the jobs the
  operating notes give;
- **Service-Desk's Chief of Staff:** the weekly value check from launch's first week (CS34),
  deleting answered questions (CS7), the operating-model project's pin (CS16), starting the deploys
  the owner approves, and the owner's steps written out;
- **the Builder:** the four settings jobs, as below;
- **the Reviewer and the Design reviewer:** their reviews of each settings job;
- **the Orchestrator:** recording reviews and verdicts.

**Day to day:** open the desk from its Home Screen icon. What waits on you is on Home; answer from
each item's sheet. Approve a deploy only when its SHA matches a merge the Reviewer passed.

**The jobs**, each under 10 minutes, are written out in docs/handover/desk-operations.md: renewing
the read token; checking the Access applications; adding a project; switching a project from v2.5
to v3; rolling back; questions answered from the desk; checking the deploy gate; approving a deploy;
the launch, once; the notifications' jobs; and the usage token's, only if one is made.

**The four settings jobs are running the desk** (the owner's answer A,
decisions/questions/P-001-graduated-changes.md): adding a project, moving a project from v2.5 to
v3, changing the notification key after a leak, and taking the tap's address back in a rollback.
Each is the Builder's pull request, reviewed by the Reviewer and the Design reviewer (the settings
file is copied into the page), with the owner's verdict: about 5 minutes of the owner's time and
about an hour of agents' work each (E). The Orchestrator records a ledger entry, on the owner's
ruling, extending L-0003's exception past launch for these four only. **Anything else is new
work:** a defect fix goes through a short Design of its own (S-001 never froze), and an addition
through a small Discovery, each filed as a new project item. M3F (the sprint pieces counted) is
such work, filed later.

## What to watch

- **"Can't read" on Home** for a project: the read token has expired or lost that repository, or
  Access is refusing. Renew or check the token, then the Access applications.
- **A GitHub issue "Desk notifications have stopped"**, assigned to you: a sender can't send. The
  issue says why; most causes are fixed by turning notifications on again.
- **GitHub's e-mail that the read token expires soon:** renew it at the next good moment (the notes
  say when).
- **A deploy waiting that no merge you know of started,** or whose SHA matches no pull request the
  Reviewer passed: reject it.
- **Any environment change in your security log you didn't make:** it stops the next acceptance
  until you rule.
- **The Actions line reads "not set up yet":** expected, since no usage token was made. GitHub's own
  usage e-mails (90% and 100%) are then your only Actions alert.
- **From Monday 2 November,** Home offers your first weekly figures to save: the first week the desk
  can offer.

## Its own monitoring and feedback

Two parts start only after go-live, by your rulings: the 14 days the targets are measured over
(decisions/questions/P-001-m3b-window.md, A), and the Chief of Staff's weekly value check, from
launch's first week (CS34). Each part is named below in the form it runs before launch. The trial
week and the weekly check's dry run on it could not happen before launch, since no week can be
offered before Monday 2 November; you accepted that condition as met
(decisions/questions/P-001-m3c-weekly-trial-waive.md). "Running" means a record dated after the
reviewed commit R (b7d22fa, deployed to the preview on 2026-10-31); each part below names one. The
tests at R count through the Reviewer's own full-suite run at R, on 2026-10-31.

| Part | What it does | Where it runs | The record that shows it running before launch |
|---|---|---|---|
| The value targets' sheet (AC97) | Shows each target against its measure: before launch, "measured from launch"; from launch, the 14 days' figures and the check's verdict | The desk, Service-Desk's page, its value targets row | Its tests at R (tests/desk/ac97-values.test.mjs, ac97-values-page.test.mjs), in the Reviewer's full-suite run at R on 2026-10-31 (1558 of 1558 pass, reviews/S-001/_reviewer-build.md); the owner's W4, "as said" for the sheet's "measured from launch" words (reviews/S-001/_owner-walkthrough.md, with its correction) |
| The device's notes (V1 and V2's raw times and "didn't need me" marks) | Note, on the phone, when the desk was open and when it first showed each item | The desk, in the phone's own storage | Their tests at R (tests/desk/ac25-weekly.test.mjs), in the same run; the notes began this week, which is why no week is offered yet (the walk-through's correction) |
| The weekly file (AC25) | Once a week, offers a prefilled link that commits the week's figures to your private portfolio repository | The desk's Home line and the targets sheet; the file in the portfolio repository | Before launch, a trial week, not counted: waived by your ruling (decisions/questions/P-001-m3c-weekly-trial-waive.md), with its tests at R (tests/desk/ac25-weekly.test.mjs, ac25-weekly-page.test.mjs). First seen live from Monday 2 November: a risk in the gate's case |
| The weekly value check (CS34, J25) | The Chief of Staff counts V1 and V2 from the weekly file, asks your V3 estimate, and writes one line a week that the targets sheet reads | The Chief of Staff's session; intake/value-checks.jsonl | Before launch, a dry run on the trial week: waived by the same ruling, with its reader's tests at R (tests/desk/j25-value-checks.test.mjs). From launch's first week |
| The senders (AC73 to AC78) | Notify the phone the moment something waits on you; a tap opens the desk at it | GitHub Actions: `desk-notify` in Service-Desk, and the operating-model project's own sender where CS16 sets it up there | desk-notify on Service-Desk's main since 2026-10-24: 2413 runs, none failed (Build's join-up review, reviews/S-001/_reviewer-build.md); test run 41203166648 (2026-10-31T12:54:53Z, after R), and the owner's W3, "as said": the test arrived and its tap opened the desk |
| The "stopped" issue (AC76) | Opens a GitHub issue assigned to you when a sender can't send, and closes it when sending works again | GitHub Actions, `desk-notify`; the issue in its project | Its tests at R (tests/desk/notify-ac76.test.mjs, marked `ac-test: S-001/AC76`), in the Reviewer's run at R. No issue labelled `desk-notify` is open (the only one, #121, closed 2026-10-19), which shows only that it hasn't fired |
| The can't-read lines (AC5, AC89) | Say in words, on Home and the project's page, when a project can't be read and why | The desk | Their tests at R (tests/desk/ac89-after-md3.test.mjs, ac83-page.test.mjs, ac82-home.test.mjs), in the Reviewer's run at R; the owner's W1: every project read, no "Can't read" |
| CI (AC29) | Builds and runs the desk's full suite on every pull request and on each push to main touching `src/**` or `tests/**` | GitHub Actions, `desk-build`; CI's line on the desk | The Reviewer's own full-suite run at R on 2026-10-31 (1558 of 1558 pass, reviews/S-001/_reviewer-build.md); desk-build run 41161002293 on #256, whose `src` and `tests` equal R's; and desk-build's push run on this package's merge, which touches `tests/` |

**How feedback and problems reach the team:**
- what waits on you reaches you on the desk and the phone; a sender that can't send opens its issue,
  assigned to you;
- you raise anything about the desk, a problem or new work, by telling your Chief of Staff in a
  session. Your Chief of Staff files it: a settings job for the Builder, or a new project item for
  anything else;
- a screen name in the operating notes that differs from today's screen: tell your Chief of Staff,
  who corrects the notes.

**Its own review:**
- the weekly value check, from launch's first week, against section 6's targets;
- after the 14 days, a V1 to V3 miss goes to the stage-8 evidence review, where you rule continue,
  re-aim or stop (docs/PROJECT.md section 6).

## When to escalate to the owner

The owner is on the operating team and is also its user, so "escalate" here means: the Chief of
Staff or an agent stops and puts it to the owner, in a session or as a filed question.
- **An environment change, a secret's update or a deploy run the owner didn't make:** it stops the
  next acceptance or deploy until the owner rules.
- **A token or key that may have leaked:** the owner regenerates it at once, and the notifications'
  key-leak job starts.
- **The desk can't read a project, or the sender's issue stays open,** for more than a day, or the
  issue says the sender's memory "could not be trusted".
- **A rollback is needed:** the owner does it (the operating notes' "Rolling back"); the Chief of
  Staff then files the fix.
- **A V1 to V3 miss** in the weekly check: the stage-8 evidence review.
- **Any change beyond the four settings jobs:** it is new work, and the owner rules on filing it.

## Value target

Service-Desk's value targets (docs/PROJECT.md section 6), each measured over the first 14 days after
launch day, whenever it is (decisions/questions/P-001-m3b-window.md, A). Launch day is M3C's reached
date, and the 14 days count from it (AC97):
- **V1, missed decisions:** items waiting on the owner that the desk did not show within 5 minutes:
  0.
- **V2, false alarms:** items the desk flagged that did not need the owner: at most 1 a week.
- **V3, owner upkeep:** the owner's time on the desk itself (tokens, settings, adding repositories):
  at most 30 minutes a week after launch. Every job in the operating notes is under 10 minutes.
- **V4, replacement:** the desk serves the needs-you address and Operations-Hub is archived, at
  launch (steps L6 to L8).
- **V5, owner response time:** the median time from a card appearing to its answer being committed,
  counting 07:00 to 22:00 Monday to Friday (America/Chicago): under 4 hours.

The desk shows each against its measure on Service-Desk's page, and the Chief of Staff's weekly
check records them. A miss of V1 to V3 goes to the stage-8 evidence review.
