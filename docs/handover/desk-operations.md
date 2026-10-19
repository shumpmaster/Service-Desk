# Running the desk: operating notes

## What this means for you

These notes are for you and your Chief of Staff, for the jobs that keep the desk working. This first
part covers the phone notifications and the GitHub Actions line on the desk: how to turn
notifications on again when they stop, how to update the phone's subscription in both projects,
how to stop and restart each project's sender with its switch, and how to renew the usage token
when it expires. Each job takes under 10 minutes. None of them can lose anything you have to do:
the desk always shows everything that waits on you when you open it, and a sender that was stopped
picks up again on its next run. The rest of the operating notes (renewing the read token, checking
the Access applications, adding a project, switching a project's model, rolling back, approving a
deploy) are written with M3's launch work (spec S-001, AC27).

The step numbers in brackets (N1 to N12) are the spec's one-time setup steps, which these jobs
repeat in part.

## Notifications

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

### Turning notifications on again (about 8 minutes; 9 if the phone must first drop a dead subscription)

Do this when the issue says the subscription is gone or invalid, when the phone shows "Desk
notifications need turning on again: open the desk", after a new phone or after removing the desk
from the Home Screen, and once at launch, when the desk's address changes (N10).

1. On the iPhone, open the desk from its Home Screen icon (at launch: add the `needs-you` desk to
   the Home Screen first, and remove the preview's icon afterwards).
2. More detail, "Turn on notifications", then Allow (N5). If it already says "On for this phone",
   tap "Show the value again".
   - **If the issue says the subscription is gone, but the phone still says "On for this phone"**,
     the phone is still holding the dead subscription, and "Show the value again" would show that
     same dead value. Drop it first. Press and hold the desk's Home Screen icon, choose to remove
     it, and confirm. Then, in Safari, open the desk, Share, Add to Home Screen, and open it from the
     new icon. Removing the desk from the Home Screen ends its subscription (spec J19). Now
     "Turn on notifications", then Allow, gives a new value. Carry on with step 3.
3. Tap "Copy", then update the subscription in both projects (below).
4. Tap "I've added it to GitHub" on the desk.
5. Send a test in each project (below). The issue closes on the next good send.

### Updating the subscription in both projects (about 3 minutes)

One phone receives both projects' notifications, so the same value goes in both (N6, N9).

1. GitHub, **Service-Desk**, Settings, Environments, `notify`, Environment secrets,
   `DESK_PUSH_SUBSCRIPTION`, Update, paste the value, Update secret.
2. The same in **Personal-Org-Operating-Model**: Settings, Environments, `notify`,
   `DESK_PUSH_SUBSCRIPTION`, Update, paste the same value.
3. Never paste the value into a chat, a file or a commit: the endpoint in it is a secret (anyone
   holding it with the keys could send to your phone).

Each sender reads the new value on its next run. If it had stopped because the old subscription
was gone, it then sends "Notifications are back on", closes the issue, and sends anything that
started waiting meanwhile, once each.

### Sending a test (about 2 minutes)

In each project: Actions, desk-notify, Run workflow, `test` = `true`, Run workflow (N8). When the
run has finished, the iPhone shows "Test from your desk: notifications work"; tap it and the desk
opens. If no run appears within a minute, run it again (a pending run can be replaced).

### The switch: stopping and starting a sender (1 minute)

Each project has its own switch, the repository variable `DESK_NOTIFY_ON` (N7).

- **To stop** a project's sender: GitHub, that project, Settings, Secrets and variables, Actions,
  Variables, `DESK_NOTIFY_ON`, delete it (or set it to anything but `true`). Its runs then do
  nothing. Do it in both projects to stop all notifications.
- **To start it again**: add `DESK_NOTIFY_ON` = `true` again. The next run reads the records as
  they stand: what started waiting while it was off is sent once; if it was off for more than
  7 days, its memory has expired and it sends one summary, "Notifications are on: <n> things wait
  on you now", instead of one notification each.
- To silence the phone without touching GitHub: iPhone Settings, Notifications, Service Desk.

### If the notification keys may have leaked (with your Chief of Staff)

The spec's rollback, for a key pair or subscription that may have been copied out. It is three
short jobs, each under 10 minutes, with a wait between the first two while the new key is deployed.
Nothing that waits on you is lost meanwhile: the desk shows it all when you open it.

1. **Now (about 5 minutes).** Turn the switch off in both projects (above). Make a new key pair
   on your computer (N1) and send the new public key to your Chief of Staff. The Builder changes
   `push.vapidPublicKey` in `src/config/projects.json`, and the operating-model project's pin moves
   to that commit (CS16).
2. **Once that change is deployed (about 4 minutes).** In both projects, update
   `DESK_VAPID_PRIVATE_KEY` with the new private key's text (N4, N9).
3. **Then (about 9 minutes).** Turn notifications on again on the phone and update the
   subscription in both projects (above); the new subscription ends the old one. Turn the
   switches back on, and send a test in each project.

## GitHub Actions use on the desk

More detail shows "GitHub Actions this month": your account's Actions minutes as a share of the
plan's included minutes, the estimated cost once past them, and when it was read. Service-Desk's
sender also sends one notification each time the estimate passes another $50. Both read GitHub
with the usage token you made (N12); no agent holds it.

### Renewing the usage token at its expiry (about 5 minutes)

GitHub e-mails you before the token expires; after it expires the desk's line reads "can't be
read: the usage token was refused…", and the issue "Desk notifications have stopped" says "GitHub
Actions use can't be read".

1. GitHub, Settings, Developer settings: make a new token **of the kind that worked** (recorded in
   EXP-006's result). For a fine-grained token: name "Desk: Actions use", resource owner your
   account, an expiry you choose, Repository access "Public repositories (read-only)", Account
   permissions, Plan: Read-only, and nothing else. For a classic token, the scope recorded there
   and nothing more.
2. Put it in **both** places, with the same value:
   - Service-Desk, Settings, Environments, `notify`, Environment secrets, `DESK_BILLING_TOKEN`,
     Update;
   - the Cloudflare Pages project the desk runs on (`service-desk-preview` before launch,
     `needs-you` from launch), Settings, Variables and secrets, **Production**, the secret
     `GITHUB_BILLING_TOKEN`, edit, paste, save.
3. **Approve a deploy**, so the desk picks up the new Pages secret: Cloudflare Pages uses a new
   secret only from the next deployment. Your Chief of Staff starts desk-deploy by hand on main's
   current commit; approve its `preview` job before launch, its `production` job after (only for a
   SHA already accepted on the preview, as for any deploy).
4. Test it: Service-Desk, Actions, desk-notify, Run workflow, `test` = `usage`; then open the
   desk's More detail: the line shows a figure again, "as of" the time it read it.
5. Delete the old token in GitHub's token settings.

Never paste the token into a chat, a file or a commit. If it may have leaked, delete it in GitHub
at once and make a new one as above.

### When GitHub doesn't report the use

If the line reads "GitHub doesn't report Actions use to the desk for this account…", GitHub gives
the desk no Actions figures for your account (EXP-006 case 11). There is no bar and no $50
notification; turn on GitHub's own e-mails instead: Settings, Billing and licensing, "Receive
alerts when my included usage reaches 90% and 100%" (N11).
