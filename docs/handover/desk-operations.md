# Running the desk: operating notes

## What this means for you

These notes are for you and your Chief of Staff. Every job the desk needs is written here: renewing
the read token, checking the Access applications, adding a project, switching a project from v2.5
to v3, rolling back, questions answered from the desk, checking the deploy gate, approving a
deploy, the launch (once), the phone notifications and the GitHub Actions line. Each job takes
under 10 minutes, or is done in parts that each take under 10; the launch is a one-time job whose
every step takes under 10. None of them can lose anything you have to do: the desk always shows
everything that waits on you when you open it, and a sender that was stopped picks up again on its
next run. Regenerating a token can't be undone (the old value stops at once); going live, archiving
the old page and every rollback here can be undone in minutes.

The step numbers in brackets (C2, G1, N1 to N12 and so on) are the spec's one-time setup steps,
which these jobs repeat in part. The launch's own steps (O8, L0 to L11) are the launch plan's; the
plan is the source, and these notes are your copy of it (spec S-001, "The desk live at the needs-you
address: M3C, through the Launch gate"). A difference between the two is fixed here.

### How the minutes are counted

Each job's heading gives its steps' minutes added up. A job too long for one go is done in parts,
each headed with its own minutes added up and each under 10; the job's heading then gives its
longest part. Every job counts a deploy the same way: **a deploy approval is about 2 minutes**
(open the run, match its SHA, approve); 1 more where you wait while your Chief of Staff starts the
run; 1 more to check what it deployed. The launch's steps keep the plan's minutes, which count the
same way.

### The screen names in these steps

The Cloudflare and GitHub screen names below are the spec's. They were **not re-checked against
today's screens**: you deferred that check, ruling that a name is corrected if one ever differs
(decisions/questions/P-001-m3c-screen-names-defer.md). If a screen, button or menu is named
differently when you get there, use the one that plainly matches, carry on, and tell your Chief of
Staff what it is called now; your Chief of Staff corrects these notes.

### Who does what

- **You:** approve every deploy, renew the tokens, answer what the desk asks, and do the steps
  these notes give.
- **Your Chief of Staff:** the weekly value check from launch's first week, deleting answered
  questions, starting the deploys you approve, and writing your steps out.
- **The Builder:** the four settings jobs below, each as a pull request.
- **The Reviewer and the Design reviewer:** their reviews of each settings job.
- **The Orchestrator:** recording the reviews and your verdicts.

### The four settings jobs, as running the desk

By your answer A (decisions/questions/P-001-graduated-changes.md), four small changes to the desk's
settings file stay as running the desk after it graduates:

1. adding a project;
2. moving a project from v2.5 to v3;
3. changing the notification key after a leak;
4. taking the tap's address back in a rollback.

Each is the Builder's pull request, reviewed by the Reviewer and the Design reviewer (the settings
file is copied into the page), with your verdict. The ruling estimated about 5 minutes of yours and
about an hour of the agents' work each; the jobs below count your minutes step by step, deploys
included. The Orchestrator records the ledger entry that extends the build's
exception past launch for these four only. **Anything else is new work:** a defect fix goes through
a short Design of its own, and an addition through a small Discovery.

## Renewing the read token (about 7 minutes, then 4 more straight after from launch; in two parts)

The desk reads every project with one GitHub read token, the same value in both Cloudflare Pages
projects: `service-desk-preview` (the preview) and, from launch, `needs-you` (your address). GitHub
e-mails you before it expires. Once it has expired, Home shows "Can't read" for every project.

**When to do it.** A regenerated token stops both projects at once, until each has deployed again,
and the production deploy takes only main's current deployable commit, the one the preview deployed
last. So renew only:
- when production already runs main's deployable code (your Chief of Staff tells you; in Actions,
  desk-deploy, the newest successful `production` run has the same SHA as the newest successful
  `preview` run); or
- right after you accept main's newer commit on the preview, so that one preview deploy and one
  production deploy of that commit follow.

Before you start, your Chief of Staff starts desk-deploy by hand, job `preview`, on main's current
commit, so the run is waiting for you when you need it. Before launch there is only the preview:
do the first part alone, with the preview's secret only.

### The token and the preview (about 7 minutes)

1. **The token and both secrets (4 minutes).** GitHub, Settings, Developer settings, Fine-grained
   tokens, the desk's read token. Check it still has only these: repository access to Service-Desk,
   Personal-Org-Operating-Model, the portfolio and any project you added; permissions Contents:
   read, Metadata: read, Pull requests: read and Actions: read; nothing that writes (G1, G3, P1).
   Then Regenerate token, choose an expiry, and copy the new value. Paste it in Cloudflare,
   Workers & Pages, `service-desk-preview`, Settings, Variables and Secrets, **Production**, the
   secret `GITHUB_READ_TOKEN` (edit, paste, save), then the same in `needs-you`. The old value has
   already stopped.
2. **The preview's deploy (2 minutes).** Cloudflare uses a new secret only from the next
   deployment. Approve the waiting `preview` job (see "Approving a deploy").
3. **Check the preview (1 minute).** Once it has finished, open the preview: Home shows every
   project read, with no "Can't read".

### Production, straight after (about 4 minutes)

A desk-deploy run deploys only the one job it was started for, so production is a second run.

1. **Wait for the second run (1 minute).** Once the preview's run has finished, your Chief of Staff
   starts desk-deploy again by hand: job `production`, the same SHA.
2. **Approve it (2 minutes)**, when its SHA is the one the preview just deployed.
3. **Check needs-you (1 minute).** Once it has finished, open the desk: every project read.

Never paste the token into a chat, a file or a commit. If it may have leaked, regenerate it at once
as above.

## Checking the Access applications (about 6 minutes; 5 more only if you remake an application)

Cloudflare Access is what makes the desk ask you to sign in. Each Pages project has **two**
applications: one for its address and one for its preview deployments (C2, C3; for `needs-you`,
C6, done as the launch's step O8). Do this check with each read-token renewal, and whenever sign-in
behaves in a way you don't expect.

### The check (about 6 minutes)

1. **The applications (3 minutes).** Cloudflare, Zero Trust, Access, Applications. You should see:
   - `service-desk-preview.pages.dev` and `*.service-desk-preview.pages.dev`;
   - from launch, `needs-you.pages.dev` and `*.needs-you.pages.dev`.

   Open each one's policy: Include, Emails, your address, and nothing wider (not "Everyone", and
   not a one-time PIN alone, which lets anyone in).
2. **Any bypass applications (2 minutes).** The only bypass applications allowed are the
   notification exception (N10; the launch's step O8 (d)): one each for `/sw.js`,
   `/manifest.webmanifest` and `/icons/*` on a desk address, each with the action Bypass for
   Everyone. These three files hold no records. Delete any other application that bypasses sign-in
   for a desk address, and tell your Chief of Staff.
3. **Check (1 minute).** In a private window, open each desk address: each asks you to sign in.

### Only if you remake an application (about 5 minutes)

A remade application has a new audience tag, and the desk refuses you until it knows it.

1. **The tag (2 minutes).** That project, Settings, Variables and Secrets, Production, `ACCESS_AUD`:
   its two applications' tags, comma-separated, edit, save.
2. **A deploy of that project (3 minutes).** Your Chief of Staff starts desk-deploy by hand on
   main's current commit (job `preview` or `production`, for the project you changed); approve it.

## Adding a project (about 9 minutes at most; in two parts, with the Builder's work between)

The desk reads up to 5 projects. Adding one is one entry in the desk's settings file and one
repository added to the read token; nothing else changes (spec AC26). A 6th entry fails the build
with a message saying 5 is the limit. It is a settings job: the Builder's pull request, reviewed.

### Asking for it (about 3 minutes)

1. **Tell your Chief of Staff (1 minute)** the repository, and whether it runs the v3 or the v2.5
   model. The Builder adds its entry to `src/config/projects.json`.
2. **The read token (2 minutes).** GitHub, Settings, Developer settings, Fine-grained tokens, the
   desk's read token, Repository access, add the repository, save. Keep the permissions exactly as
   they are. The token's value doesn't change, so the Pages secrets stay as they are. If GitHub
   won't let you change it, renew it instead ("Renewing the read token"), with the new repository
   included.

### The change, live (about 9 minutes)

Once the Reviewer and the Design reviewer have passed the Builder's pull request:

1. **Your verdict and the merge (2 minutes).**
2. **The preview's deploy (2 minutes).** The merge starts a `preview` run; approve it (see
   "Approving a deploy").
3. **Check the preview (1 minute):** the new project's tile is on Home, with no "Can't read".
4. **Wait for the production run (1 minute)**, which your Chief of Staff starts by hand, job
   `production`, the same SHA (from launch).
5. **Approve it (2 minutes).**
6. **Check needs-you (1 minute):** the new tile is there.

The new project's waiting items show on the desk at once. Phone notifications from it need a sender
in that project too, which is separate work: ask your Chief of Staff.

## Switching a project from v2.5 to v3 (about 9 minutes; 2 more only if it has a sender)

When a project adopts the v3 operating model, the desk should read it as one: its phases, its plan
lines and its v3 records. It is a settings job: the Builder's pull request changes that project's
`model` from `v2.5` to `v3` in the settings file, and nothing else (only one project plans, so its
`planning` stays as it is).

### The change, live (about 9 minutes)

Once the Reviewer and the Design reviewer have passed the Builder's pull request:

1. **Your verdict and the merge (2 minutes).**
2. **The preview's deploy (2 minutes).** Approve the `preview` run the merge starts.
3. **Check the preview (1 minute):** that project's page now reads as a v3 project.
4. **Wait for the production run (1 minute)**, which your Chief of Staff starts by hand, job
   `production`, the same SHA (from launch).
5. **Approve it (2 minutes).**
6. **Check needs-you (1 minute):** the same page, as on the preview.

### Its sender's pin, only if it has one (about 2 minutes)

1. **Merge the pin move (2 minutes).** If the project runs a sender pinned to the desk's code, your
   Chief of Staff moves the pin in a reviewed pull request there, and you merge it. Today no other
   project has one (see "Notifications").

## Rolling back (about 9 minutes at most; in four parts, each done on its own)

There are four parts: an earlier desk back; the old page back; then, after the old page, the tap's
address back and the phone back.

### An earlier desk back (about 4 minutes)

For a deploy that broke the desk.

1. **Roll back (2 minutes).** Cloudflare, Workers & Pages, the project (`needs-you`, or
   `service-desk-preview`), Deployments, All deployments. On the last production deployment that
   worked, "…", **"Rollback to this deployment"**. It is instant. Only production deployments can be
   rolled back to.
2. **Check (1 minute).** Open the desk. Whether a rollback brings back a deployment's own secrets is
   not known. If the desk can't read after a rollback (for example after a token renewal), the fix
   is forward: the earlier deployment can't be used, and the fixed commit's deploys are the way back.
3. **Tell your Chief of Staff (1 minute)**, who files the fix. Until it lands, approve no deploy of
   the faulty commit.

### The old page back (about 6 minutes)

For going back to the page Operations-Hub served before launch (the spec's rollback after launch).

1. **Roll back (2 minutes).** Cloudflare, Workers & Pages, `needs-you`, Deployments, All
   deployments. On the last deployment from before launch (Operations-Hub's), "…", **"Rollback to
   this deployment"**.
2. **Unarchive (2 minutes).** GitHub, Operations-Hub, Settings, General, Danger Zone, Unarchive this
   repository.
3. **The old page's workflow (1 minute).** Operations-Hub, Actions, `needs-you-page`, Enable
   workflow, so the old page keeps updating.
4. **Check (1 minute).** Open `https://needs-you.pages.dev`: it shows the old page.

From now on, approve no `production` deploy: one would put the desk back over the old page. Then
take the tap's address and the phone back (below), or taps open the old page.

### The tap's address back (about 4 minutes)

A notification's tap opens the address in the settings file's `push.deskUrl`: from launch,
`https://needs-you.pages.dev`. Taking it back to the preview is a settings job: the Builder's pull
request changes `push.deskUrl` back to `https://service-desk-preview.pages.dev`. Once the Reviewer
and the Design reviewer have passed it:

1. **Your verdict and the merge (2 minutes).** The sender reads the address from main, so taps
   change once it merges.
2. **The preview's deploy (2 minutes).** Approve the `preview` run the merge starts.

### The phone back (about 9 minutes)

1. **The preview's icon (4 minutes).** In Safari, open `https://service-desk-preview.pages.dev`,
   sign in, Share, Add to Home Screen. Open the new icon; More detail, "Turn on notifications",
   Allow, "Copy".
2. **The subscription (5 minutes).** Update `DESK_PUSH_SUBSCRIPTION` in Service-Desk ("Updating the
   subscription", below), tap "I've added it to GitHub", send a test, and remove the needs-you icon.

## Questions answered from the desk (about 2 minutes)

When you answer a question from the desk, its answer link commits your answer record, and the desk
shows the question answered at once. The model's own count of open questions (the owner signal,
`review_check.py questions`) still lists it as open until its `questions/<name>.md` file is deleted
(Setup CS7). Your Chief of Staff deletes it in a pull request of its own, which the automatic
asks-merge job usually merges within minutes of its checks passing.

1. **Look (1 minute).** If the owner signal lists a question the desk has shown as answered for more
   than a day, its deletion is stuck.
2. **Unstick it (1 minute).** Tell your Chief of Staff, or merge the waiting deletion yourself.

**Never** answer the Launch gate's question (questions/P-001-launch-gate-1.md) from the desk's
answer box: answer it in the launch sitting, in your own words to your Chief of Staff (L0).

## Checking the deploy gate (about 3 minutes)

Agents act under your GitHub account, so GitHub would show a change they made as yours. So at each
milestone acceptance, before you accept, and at the launch sitting (L1), you check the deploy gate
yourself (Setup CS9). Your Chief of Staff's summary of the same is a convenience only.

1. **The settings page (2 minutes).** Service-Desk, Settings, Environments:
   - `preview` and `production`: each has you as required reviewer, and deployment branch `main`
     only;
   - `notify`, in Service-Desk: deployment branch `main` only, and its secrets the ones you set
     (their names and update dates; GitHub never shows values). The operating-model project has no
     sender and no `notify` environment yet (see "Notifications").
     Service-Desk's `DESK_BILLING_TOKEN` and the usage token's own entry in your token settings
     exist only if you made a usage token; none has been made.
2. **Your security log (1 minute).** GitHub, Settings, Security log, filtered to Service-Desk's
   environment changes since the last milestone (protection rules, secrets, deployment branches),
   `notify` among them. Your Chief of Staff shows you any change to the
   sender's code or its workflow since then. If no log entries appear, the settings page alone is
   the check.

Any change you didn't make stops the acceptance (or the sitting) until you rule.

## Approving a deploy (about 2 minutes)

Every deploy waits for your approval on GitHub (the GitHub app offers it), in the environment
`preview` or `production`. This is the one count the other jobs use: **a deploy approval is about 2
minutes**; 1 more where you wait while your Chief of Staff starts the run; 1 more to check what it
deployed.

1. **Match the SHA (1 minute).** Open the waiting run. The approval screen shows its full SHA.
2. **Approve or reject (1 minute)**, by the rules below.

- **Preview.** A merge that changes the desk's code starts a `preview` run, which waits for you.
  Approve only when its SHA equals the merge-commit SHA shown on the page of a pull request the
  Reviewer passed (its first 7 characters are the short SHA on the pull request's page). **Match the
  SHA, never the commit message or the dispatch note,** which anyone can write. The desk's Queue
  line ("Matches PR #<n>'s merge · Reviewer PASS") makes the same check from the records; the
  approval itself stays on GitHub.
- **Production.** Your Chief of Staff starts it by hand, in a run of its own, job `production`, with
  the SHA. Approve only a SHA the preview has already deployed and you have accepted there. The job
  itself also refuses any other.
- **`exp-002`:** approve only when you or your Chief of Staff asked for it. It deploys nothing.
- **Reject every other run.** The actor name can't tell your runs from an agent's (both show as
  your account), so the SHA is the only thing to check.

## Launching, once (about 32 minutes in the sitting; every step under 10)

The launch is the Launch gate's sitting: you rule the gate, and on `proceed` the desk goes live at
`https://needs-you.pages.dev`, the old page is archived, your phone moves to the new icon, and you
commit your graduation record. It is done once. Each step gives its minutes.

### Before the sitting, any day (about 25 minutes)

1. **O8 (a), any existing sign-in (4 minutes).** Cloudflare, Zero Trust, Access, Applications: look
   for any application on `needs-you.pages.dev`, `*.needs-you.pages.dev` or a custom domain of
   needs-you (EXP-002 listed none). Delete each, or limit its policy to your address.
2. **O8 (b), sign-in on needs-you (7 minutes).** As C2 and C3:
   1. in the `needs-you` project's settings, turn on "Enable access policy"; the application it
      makes covers the preview deployments;
   2. set its policy to Include, Emails, your address;
   3. edit that application, delete the wildcard in its Subdomain field, and save; it now covers
      `needs-you.pages.dev`;
   4. turn "Enable access policy" on again, which makes a new wildcard application for the preview
      deployments, and set its policy to your address too.

   In a private window, both addresses ask you to sign in.
3. **O8 (c), the settings (4 minutes).** `needs-you`, Settings, Variables and Secrets, Production:
   add `OWNER_EMAIL` and `ACCESS_TEAM_DOMAIN` with the preview's values and of the same kind, and
   `ACCESS_AUD` holding only (b)'s two audience tags, comma-separated. (The read token goes in at
   L2a. The usage token's `GITHUB_BILLING_TOKEN` goes in only if you later make one.)
4. **O8 (d), any Access exception (2 minutes).** It is not known whether a notification exception
   exists (you weren't sure; EXP-006's result). In Zero Trust, Access, Applications, look for any
   application naming `service-desk-preview.pages.dev/sw.js`, `/manifest.webmanifest` or
   `/icons/*`. If there are, add the same three for `needs-you.pages.dev` (Bypass, Everyone). Tell
   your Chief of Staff what you found.
5. **O9, read the case (about 8 minutes)**, any time after the Critic's view is in: the gate's case
   and the Critic's view beside it.

Meanwhile, the agents: once these notes are merged, the address change (LA2) is brought up to date
with main, and desk-build passes on it, before you give its verdict (O10) and merge it (L3).

### The sitting (about 32 minutes; 37 if you make a usage token first)

1. **L0, the ruling (1 minute).** Answer question 3 (questions/P-001-launch-gate-1.md) in your own
   words to your Chief of Staff, not from the desk's answer box.
   - On `hold` or `recycle`, nothing goes live: your Chief of Staff records it at
     decisions/questions/P-001-launch-gate-1.md, and you merge it.
   - On `kill`, nothing goes live: you commit that record yourself, from your Chief of Staff's
     prefilled link, with no proxy line; your Chief of Staff then deletes the question file in a
     pull request of its own, which you merge.
   - On `proceed`, carry on.
2. **L1, the deploy gate (2 minutes).** As "Checking the deploy gate": `preview` and `production`
   still require you and allow `main` only, and your security log shows no environment change you
   didn't make.
3. **L2a, the read token (4 minutes).** GitHub, Settings, Developer settings, Fine-grained tokens,
   the desk's read token, Regenerate token. Paste the new value as `needs-you`'s Production secret
   `GITHUB_READ_TOKEN`, and over the preview's. The old value stops at once: the preview reads
   nothing until L4's deploy.
4. **L2b, the usage token (0 minutes now; 5 minutes only if you later make one).** No usage token was
   ever made, so there is nothing to regenerate: skip this step. Only if you make one before the
   sitting: from where you made it, Regenerate, and paste it into `needs-you`'s
   `GITHUB_BILLING_TOKEN`, over the preview's, and over Service-Desk's `notify` secret
   `DESK_BILLING_TOKEN`.

   Never paste a token into a chat, a file or a commit.
5. **L3, the address change (1 minute).** Before you merge, your Chief of Staff fetches main and
   checks that main's deployable files differ from the reviewed commit R by nothing. If that passes,
   you merge LA2, and your Chief of Staff confirms that LA2's merge commit's first parent is that
   same tip. If its first parent is a different commit, your Chief of Staff runs the check again
   against that parent, and the sitting stops if it differs. If the check fails before the merge,
   LA2 stays unmerged, nothing goes live, your Chief of Staff starts a `preview` deploy of main's
   current commit for you to approve (so the preview reads with L2a's token), and the sitting stops
   (below).
6. **L4, the preview (3 minutes).** Approve desk-deploy's `preview` job, its SHA LA2's merge commit.
   The preview reads every project.
7. **L5, the old page stopped (2 minutes).** Operations-Hub, Actions, `needs-you-page`, "…",
   Disable workflow. If a run is in progress, wait until it ends. Left on, it would overwrite the
   desk within an hour.
8. **L6, production (3 minutes).** Your Chief of Staff starts desk-deploy by hand: job
   `production`, `sha` LA2's merge commit. Approve its `production` job when its SHA is that commit.
9. **L7, the check (3 minutes).** In a private window, `https://needs-you.pages.dev` and the run's
   `<hash>.needs-you.pages.dev` both ask you to sign in. Signed in, the desk opens and reads every
   project: needs-you serves the desk.
10. **L8, the old repository archived (1 minute).** Operations-Hub, Settings, General, Danger Zone,
    Archive this repository.
11. **L9a, the new icon (4 minutes).** In Safari, open needs-you, sign in, Share, Add to Home Screen.
    Open the new icon; in More detail, "Turn on notifications", Allow, "Copy".
12. **L9b, the subscription (5 minutes).** Update `DESK_PUSH_SUBSCRIPTION` in Service-Desk
    ("Updating the subscription", below), then "I've added it to GitHub". Send a test there, and
    remove the preview's icon. The operating-model project has no sender yet, so nothing there
    changes at launch.
13. **L10, your graduation record (2 minutes).** Commit decisions/questions/P-001-graduation.md
    yourself, from your Chief of Staff's prefilled link, adding your own words. The desk then shows
    Service-Desk as Done, still showing anything that waits on you.
14. **L11, accepting M3C (1 minute).** Answer question 4, questions/P-001-m3c-accept.md.

### After the sitting (about 2 minutes)

1. **The reached date (1 minute).** Merge the commit that adds M3C's reached date.
2. **The question's deletion (1 minute).** Merge your Chief of Staff's deletion of
   questions/P-001-launch-gate-1.md.

The operating-model project's pin move (CS16) has nothing to move today: that project has no
sender yet (see "Notifications"). If one is set up later, that work brings its own pin.

### If the sitting stops after L0's `proceed` and before L10

For example, L7 shows the old page, a deploy fails, or something is rolled back.

- Nothing records the `proceed`, and question 3 stays open: a `proceed` is recorded only once the
  desk is really live.
- Your Chief of Staff restores what was done, with you approving each deploy:
  - **after L2a (the tokens):** a `preview` deploy of main's current commit, so the preview reads
    with the new token (3 minutes);
  - **after L3 (LA2 merged):** taps now open needs-you, which isn't the desk. Unless you retry the
    same day, the Builder takes the address back ("The tap's address back", above). That puts main's
    deployable files back as they were at R, so L3's check passes on the retry, where the address
    change is made again. If L3 didn't run, LA2 stays unmerged;
  - **after L5 or L8:** `needs-you-page` enabled again, and Operations-Hub unarchived ("The old page
    back", above);
  - **after L6:** needs-you rolled back to the last Operations-Hub deployment ("The old page back");
  - **after L9:** the phone moved back to the preview's icon ("The phone back", above).
- A retry asks L0 again (1 minute) on the same case if nothing in it has changed. If anything went
  live and was rolled back, or R moved, the case is written again with what happened, and the
  Critic reads it afresh.

## Notifications

**Only Service-Desk has a sender today.** Personal-Org-Operating-Model has no desk-notify workflow
and no `notify` environment (as your Chief of Staff found on 2026-10-30: Setup N9 and CS16 were
never done), so its waiting items show on the desk but don't notify the phone, and nothing there
changes at launch. If its sender is set up later (N9, CS16), that work brings its own steps and its
pin, and these notes gain them.

### What the desk tells you

- **"Notifications aren't set up yet"**: the desk has no public key in `src/config/projects.json`
  yet (its `push` entry, Setup N1). Nothing for you to do on the phone; your Chief of Staff has the
  key added.
- **"To get notifications, add the desk to your Home Screen…"**: you opened the desk in Safari.
  Open it from its Home Screen icon instead.
- **"Notifications are off for the desk…"**: you refused permission once. iPhone Settings,
  Notifications, Service Desk, Allow Notifications.
- **"On for this phone"**: this phone is subscribed. "Show the value again" shows the value to put
  in GitHub; "Send a test from GitHub" has the test's steps.
- **A GitHub issue "Desk notifications have stopped"** (labelled `desk-notify`, assigned to you):
  a sender can no longer send, and the issue says why in plain words. It closes by itself once
  sending works again. A line saying the sender's memory could not be read means it is holding
  everything back until it can read its saved state again; nothing is lost. The line "GitHub
  didn't say for how long" can appear at once after a short GitHub failure, even on the very first
  runs, and goes by itself at the next run that reads the state, or finds none. Only the line
  saying the memory "could not be trusted" needs your Chief of Staff.

### Turning notifications on again (about 7 minutes; 8 if the phone must first drop a dead subscription)

Do this when the issue says the subscription is gone or invalid, when the phone shows "Desk
notifications need turning on again: open the desk", after a new phone or after removing the desk
from the Home Screen. At launch, the desk's address changes, and the launch's steps L9a and L9b do
the same with the new icon (N10).

1. **Open the desk (1 minute)** from its Home Screen icon on the iPhone: before launch the
   preview's, from launch the needs-you one.
2. **Turn them on (2 minutes).** More detail, "Turn on notifications", then Allow (N5). If it
   already says "On for this phone", tap "Show the value again".
   - **If the issue says the subscription is gone, but the phone still says "On for this phone"**
     (1 minute more), the phone is still holding the dead subscription, and "Show the value again"
     would show that same dead value. Drop it first. Press and hold the desk's Home Screen icon,
     choose to remove it, and confirm. Then, in Safari, open the desk, Share, Add to Home Screen,
     and open it from the new icon. Removing the desk from the Home Screen ends its subscription
     (spec J19). Now "Turn on notifications", then Allow, gives a new value.
3. **Copy and update (2 minutes).** Tap "Copy", update the subscription (below), then tap "I've
   added it to GitHub" on the desk.
4. **Send a test (2 minutes)** (below). The issue closes on the next good send.

### Updating the subscription (about 2 minutes)

1. **The secret (2 minutes).** GitHub, **Service-Desk**, Settings, Environments, `notify`,
   Environment secrets, `DESK_PUSH_SUBSCRIPTION`, Update, paste the value, Update secret (N6).

Never paste the value into a chat, a file or a commit: the endpoint in it is a secret (anyone
holding it with the keys could send to your phone).

The sender reads the new value on its next run. If it had stopped because the old subscription
was gone, it then sends "Notifications are back on", closes the issue, and sends anything that
started waiting meanwhile, once each.

### Sending a test (about 2 minutes)

1. **Run it (2 minutes).** In Service-Desk: Actions, desk-notify, Run workflow, `test` = `true`, Run
   workflow (N8). When the run has finished, the iPhone shows "Test from your desk: notifications
   work"; tap it and the desk opens. If no run appears within a minute, run it again (a pending run
   can be replaced).

### The switch: stopping and starting the sender (1 minute)

The sender's switch is Service-Desk's repository variable `DESK_NOTIFY_ON` (N7). Each of these is a
job on its own:

- **To stop it (1 minute):** GitHub, Service-Desk, Settings, Secrets and variables, Actions,
  Variables, `DESK_NOTIFY_ON`, delete it (or set it to anything but `true`). Its runs then do
  nothing, and no notification is sent.
- **To start it again (1 minute):** add `DESK_NOTIFY_ON` = `true` again. The next run reads the
  records as they stand: what started waiting while it was off is sent once; if it was off for more
  than 7 days, its memory has expired and it sends one summary, "Notifications are on: <n> things
  wait on you now", instead of one notification each.

To silence the phone without touching GitHub: iPhone Settings, Notifications, Service Desk.

### If the notification keys may have leaked (about 8 minutes at most; in four parts, with your Chief of Staff)

The spec's rollback, for a key pair or subscription that may have been copied out. It is four
parts, each under 10 minutes, with waits between them while the new key is reviewed and deployed.
Changing the public key is one of the four settings jobs: the Builder's pull request, reviewed by
the Reviewer and the Design reviewer, with your verdict. Nothing that waits on you is lost
meanwhile: the desk shows it all when you open it.

#### Now (about 5 minutes)

1. **The switch off (1 minute)** (above).
2. **A new key pair (4 minutes)** on your computer (N1); send the new public key to your Chief of
   Staff. The Builder changes `push.vapidPublicKey` in `src/config/projects.json`.

#### The change (about 7 minutes)

Once the Reviewer and the Design reviewer have passed it:

1. **Your verdict and the merge (2 minutes).**
2. **The preview's deploy (2 minutes).** Approve the `preview` run the merge starts.
3. **Wait for the production run (1 minute)**, which your Chief of Staff starts by hand, job
   `production`, the same SHA (from launch).
4. **Approve it (2 minutes).**

#### The private key (about 2 minutes)

1. **The secret (2 minutes).** Once that change is deployed: in Service-Desk, update
   `DESK_VAPID_PRIVATE_KEY` with the new private key's text (N4).

#### Notifications on again (about 8 minutes)

1. **The switch on (1 minute)** (above).
2. **Turn notifications on again (7 minutes)** on the phone, as above, with its test; the new
   subscription ends the old one.

## GitHub Actions use on the desk

More detail can show "GitHub Actions this month": your account's Actions minutes as a share of the
plan's included minutes, the estimated cost once past them, and when it was read. Service-Desk's
sender would also send one notification each time the estimate passes another $50. Both read GitHub
with a usage token you make (N12); no agent holds it.

**Today no usage token exists:** you never made one (EXP-006's result), so the line reads "GitHub
Actions use: not set up yet (Setup N12)", and there is no bar and no $50 notification. Until you
make one, GitHub's own e-mails are your only Actions alert: Settings, Billing and licensing,
"Receive alerts when my included usage reaches 90% and 100%" (N11). Every usage-token step in these
notes, the launch's L2b among them, applies only if you later make one.

### The usage token, only if you later make one (about 5 minutes at most; in three parts)

The same three parts make it the first time and renew it at its expiry. GitHub e-mails you before
it expires; after it expires the desk's line reads "can't be read: the usage token was refused…",
and the issue "Desk notifications have stopped" says "GitHub Actions use can't be read". As with
the read token, renew it when production already runs main's deployable code, or right after you
accept main's newer commit on the preview. Before you start, your Chief of Staff starts desk-deploy
by hand, job `preview`, on main's current commit, so the run is waiting when you need it.

#### The token and its three places (about 5 minutes)

1. **The token (2 minutes).** GitHub, Settings, Developer settings. The first time, as Setup N12: a
   fine-grained token named "Desk: Actions use", resource owner your account, an expiry you choose,
   Repository access "Public repositories (read-only)", Account permissions, Plan: Read-only, and
   nothing else. At renewal, a new token **of the kind that worked** (recorded in EXP-006's result);
   for a classic token, the scope recorded there and nothing more.
2. **Three places, with the same value (3 minutes):**
   - Service-Desk, Settings, Environments, `notify`, Environment secrets, `DESK_BILLING_TOKEN`,
     Update;
   - Cloudflare, Workers & Pages, `service-desk-preview`, Settings, Variables and Secrets,
     **Production**, the secret `GITHUB_BILLING_TOKEN`, edit, paste, save;
   - the same in `needs-you`, from launch.

#### The deploys (about 5 minutes)

Cloudflare uses a new secret only from the next deployment.

1. **The preview's deploy (2 minutes).** Approve the waiting `preview` job.
2. **Wait for the production run (1 minute)**, which your Chief of Staff starts by hand once the
   preview's has finished, job `production`, the same SHA (from launch).
3. **Approve it (2 minutes).**

#### The test (about 3 minutes)

1. **Test it (2 minutes).** Service-Desk, Actions, desk-notify, Run workflow, `test` = `usage`; then
   open the desk's More detail: the line shows a figure, "as of" the time it read it.
2. **Tidy up (1 minute).** At renewal, delete the old token in GitHub's token settings. The first
   time, if the test's log says the token was refused or not found, N12 step 5 tries a classic token
   instead; tell your Chief of Staff which kind worked, or that none did, so EXP-006's result records
   it.

Never paste the token into a chat, a file or a commit. If it may have leaked, delete it in GitHub
at once and make a new one as above.

### When GitHub doesn't report the use

If the line reads "GitHub doesn't report Actions use to the desk for this account…", GitHub gives
the desk no Actions figures for your account (EXP-006 case 11). There is no bar and no $50
notification; turn on GitHub's own e-mails instead: Settings, Billing and licensing, "Receive
alerts when my included usage reaches 90% and 100%" (N11).
