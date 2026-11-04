# Ruling needed: How should a home-screen widget get the desk's summary?

Milestone: none (no milestone exists for the widget yet; this question decides how it is built)
Asked in session: session_01QBwHGKYRJzkU6QvrF8X1wc

WHY: You want an iPhone home-screen widget, made with the Scriptable app, that shows the desk's own summary: what waits on you, and each project's state and headline, worded as on the desk (your choice quoted under "Your answer already given", below). Tapping it opens the desk.

The widget can't simply load the desk. An iPhone widget only draws text and numbers that its script fetches, and the desk's server lets nothing in without your Cloudflare Access sign-in, which a widget script cannot do. But the desk works out its cards from the records on GitHub with code that needs no server. So the widget can either run a copy of that code itself (option A), or the desk can change to let the widget in (B) or to save a summary for it (C). Option D is the simple counts-only widget.

Options A to C are new work on the desk, so each starts as its own small piece of work (its item number is given when it is filed) with a short Discovery and your three gates: Design (approve its plan), Build (approve building it) and Launch (it goes live). Until you rule, nothing is built.

Every option puts a key on your phone, saved inside Scriptable. Each option says what its key can read. The desk's two projects today are this desk (Service-Desk) and the operating model (Personal-Org-Operating-Model).

The one-tap launcher you were also shown is left out: it shows no summary, so it does not meet your choice.

OPTIONS:
  A. The widget reads GitHub itself and runs a copy of the desk's own code.
     What happens: a build step in the desk's repository packs the desk's card-making code into one Scriptable file. The widget reads the two projects' records from GitHub with a read-only GitHub token (a key that can read your repositories but not change them) and works out the summary as the desk does.
     Gain: the desk's sign-in, its server and its notification sender are not touched, and nothing the live desk runs changes. The summary is the desk's own, as of the copy's version.
     Cost:
       - The copy must be rebuilt and put back into Scriptable after each desk change that affects the cards, or the widget drifts from the desk.
       - The GitHub key on your phone can read every record in both projects' repositories.
       - Each refresh makes many GitHub reads (the desk's own two calls make up to about 55 per project). Whether an iPhone widget can do that, and run the desk's code, in the time and memory it is given is not yet measured. That is why my confidence is medium.
     Rules out: nothing. Reversible: yes, delete the widget and the key.
  B. Let the widget in through Cloudflare Access with a service token of its own.
     What happens: you create a service token in Cloudflare, and allow it in the desk's Access settings. It is an ID and a secret that a script sends instead of a sign-in. The desk's server accepts that one token as well as your sign-in, for reading only. Then either the server works out the summary in a new call, or the widget fetches what the page fetches and runs a copy of the desk's code, as in A.
     Gain: Access stays the only door; you can revoke the token in Cloudflare at any time, for example if the phone is lost. If the server works it out, the summary matches the desk exactly.
     Cost:
       - It changes the desk's sign-in rule, which today accepts no service tokens. That needs a new spec, the Reviewer's verdict and your approval of the deploy.
       - The server limits itself to 30 GitHub requests per call. Reading the lists alone can take all 30, and reading the records' contents takes up to 25 more, so a single summary call is unlikely to fit. That leaves the widget-side copy, with A's drift cost and its unmeasured limits.
       - The Cloudflare key on your phone can read everything the desk reads.
     Rules out: nothing. Reversible: yes, delete the token and undo the rule change.
  C. Have the notification sender also save a summary for the widget.
     What happens: the desk's notification sender already works out what waits on you every five minutes with the desk's own code, but today only for Service-Desk; the operating-model project has no sender yet. The sender would also save a short summary, and the widget would read it with a read-only GitHub token.
     Gain: the desk's sign-in is not touched.
     Cost:
       - The sender runs with the notification secrets, so changing it is the highest risk class and needs your approval.
       - Until a second sender is set up for the operating-model project, with its own steps and secrets, the widget would show only this desk's items.
       - The sender works out only what waits on you, not each project's state and headline.
       - The summary can be several minutes old.
       - Where the sender could save a summary that a widget can read is unsolved. Today it keeps its memory only as a zipped, scrambled file inside GitHub's workflow storage.
       - The GitHub key on your phone can read every record in both projects' repositories.
     Rules out: nothing. Reversible: yes.
  D. Don't change the desk; build the counts-only widget instead.
     What happens: the widget reads the records on GitHub with a read-only GitHub token and shows counts only (the first mockup you were shown). It is a script on your phone and changes nothing the desk runs, so I propose it skips the desk's Discovery and gates; I would write it and the Reviewer would read it before you install it. Say so if you want it to go through the gates anyway.
     Gain: no desk change; quickest.
     Cost:
       - Counts only, not the desk's wording.
       - The counts can drift from the desk if the records change form.
       - The GitHub key on your phone can read every record in both projects' repositories.
     Rules out: the desk's wording on the widget, until a later ruling. Reversible: yes.
RECOMMENDATION: A, because it gives the desk's whole summary without touching the desk's sign-in, its server or its notification sender. My confidence is medium: whether a widget can make the reads and run the desk's code within its limits is not yet measured, and Discovery measures it first. If it cannot, B's server way does not fit either, and C or D is the fallback.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: this ruling changes only the desk's records. Option A adds a build step to the desk's tools (ordinary code with tests, class R1, with the Reviewer's verdict). Option B changes the desk's sign-in check and server (class R1, with the Reviewer's verdict; R3, with your approval, if the sender's three R3 shared modules change; the design reviewer too if a page module changes). Option C changes the notification sender (class R3, your approval), and covering the operating-model project needs a second sender set up. Option D changes nothing in the desk.
DEFAULT: none (where new work on a graduated product starts is the owner's ruling)   TIMEOUT: none
CHECKED: read cold by the Critic, 2026-11-04; reviews/P-001-home-screen-widget/critic.md

## Your answer already given, verbatim
- Asked in session session_01QBwHGKYRJzkU6QvrF8X1wc on 2026-11-04, after seeing mockups of three widgets (counts read from GitHub, the desk's own summary, a one-tap launcher), you answered: "Option 2". Option 2 was "the desk's own summary", which "needs a desk change". It was given in the session without a question file, which the model asks for first; this file carries it, and it is recorded word for word with this question's answer. Option A here gives that summary without changing what the live desk runs.

## Context
- The desk's server checks every call for the owner's Cloudflare Access sign-in, with "no test-only exception, no service tokens" (source: src/lib/access.js, lines 1-4)
- The desk's spec says an Access service token carries no email, so it could never pass the sign-in check, and no exception is made for it (source: specs/S-001.md, J8, lines 15510-15512)
- The server checks the sign-in before any GitHub call, and the page's read model works out what each view shows with no network and no page (source: src/lib/api.js, lines 1-4; src/lib/model.js, lines 1-3)
- The notification sender already runs the desk's read model outside the browser, from its own GitHub reads (source: src/notify/collect.mjs, lines 1-6)
- The server limits itself to 30 GitHub requests per call; a poll call makes 30 at its heaviest, and a blob call, which reads the records' contents, up to 25 (source: specs/S-001.md, J1, lines 14609-14613 and 14618-14621)
- The desk connects two projects, Service-Desk and Personal-Org-Operating-Model (source: src/config/projects.json, "projects")
- The spec designs one sender per project, each in that project's own workflow for that project alone (source: specs/S-001.md, J16, lines 16479-16486); today only Service-Desk's exists, and the operating-model project has no sender yet (source: .github/workflows/desk-notify.yml, line 97; specs/S-001.md, lines 2126-2128; docs/handover/service-desk.md, lines 35-37)
- The sender runs every five minutes (source: .github/workflows/desk-notify.yml, line 31)
- The sender keeps its memory as one workflow artifact holding a signed state file, kept for seven days; its item keys are keyed hashes and its JWT and usage parts are encrypted (source: src/notify/state.mjs, lines 1-5; .github/workflows/desk-notify.yml, lines 99-106)
- The notification sender's code and three shared judgment modules it runs are class R3; the desk's other source, the sign-in check, the server and the desk's tools included, is R1; the page's served files also need the design reviewer (source: governance/risk-paths.toml, lines 20-24, 27 and 48-49)
- A graduated product comes back only as new work, starting with a Discovery scaled to its size, and the owner approves every production deploy (source: Personal-Org-Operating-Model OPERATING_MODEL.md §3 "Graduation and re-entry")
