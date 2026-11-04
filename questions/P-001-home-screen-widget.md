# Ruling needed: How should a home-screen widget get the desk's summary?

Milestone: none (no milestone exists for the widget yet; this question decides how it is built)
Asked in session: session_01QBwHGKYRJzkU6QvrF8X1wc

WHY: You want an iPhone home-screen widget, made with the Scriptable app, that shows the desk's own summary: what waits on you, and each project's state and headline, worded as on the desk (your choice quoted under "Your answer already given", below). Tapping it opens the desk. A widget can't load the desk itself, and the desk's server lets nothing in without your Cloudflare Access sign-in. But the desk works out its cards from the records on GitHub with code that needs no server, so the widget could run a copy of that code (A). Options A and B are new work on the desk, each with a short Discovery and your three gates (Design, Build, Launch); C is not. Every option puts a read-only GitHub key on your phone (it can read your repositories but not change them), able to read the desk's three projects (Service-Desk, Personal-Org-Operating-Model, Model-Lab) and the portfolio repository. Until you rule, nothing is built.

I left out two routes. The one-tap launcher shows no summary. Letting the widget in through Cloudflare with a key of its own changes the desk's sign-in rule, which today accepts no service tokens, and gains nothing here: the desk's server cannot work out the summary within its limit of 30 GitHub requests per call, so the widget would still run the desk's code itself, as in A.

OPTIONS:
  A. The widget reads GitHub itself and runs a copy of the desk's own code.
     What happens: a build step in the desk's repository packs the desk's card-making code into one Scriptable file. The widget reads the projects' records from GitHub and works out the summary as the desk does, keeping what it has read on the phone so later refreshes read only what changed.
     Gain: the desk's sign-in, its server and its notification sender are not touched, and nothing the live desk runs changes. The summary is the desk's own, as of the copy's version.
     Cost:
       - The copy must be rebuilt and put back into Scriptable after each desk change that affects the cards, or the widget drifts from the desk.
       - The first refresh is heavy. Unlike the sender, the widget has no copy of the records, so it reads every one over GitHub. The desk itself, per project, makes a list call of up to 30 GitHub requests and up to 16 record-reading calls of up to 25 each, so a first refresh can run to hundreds of requests per project. Later refreshes read only what changed.
       - Whether an iPhone widget can do that, and run the desk's code, in the time and memory it is given is not yet measured. Discovery measures it first.
     Rules out: nothing. Reversible: yes, delete the widget and the key.
  B. Have the notification sender also save a summary for the widget.
     What happens: the desk's notification sender already works out what waits on you every five minutes with the desk's own code, but today only for Service-Desk; the other two projects have no sender yet. The sender would also save a short summary, and the widget would read it.
     Gain: the widget does almost no work, and the desk's sign-in is not touched.
     Cost:
       - The sender runs with the notification secrets, so changing it is the highest risk class and needs your approval.
       - Until senders are set up for the other two projects, each with its own steps and secrets, the widget would show only Service-Desk's items.
       - The sender works out only what waits on you, not each project's state and headline.
       - The summary can be several minutes old.
       - Where the sender could save a summary that a widget can read is unsolved. Today it keeps its memory only as a signed, partly coded file inside GitHub's workflow storage.
     Rules out: nothing. Reversible: yes.
  C. Don't change the desk; build the counts-only widget instead.
     What happens: the widget reads the records on GitHub and shows counts only (the first mockup you were shown). It is a script on your phone and changes nothing the desk runs, so I propose it skips the desk's Discovery and gates; I would write it and the Reviewer would read it before you install it. Say so if you want it to go through the gates anyway.
     Gain: no desk change; quickest.
     Cost:
       - Counts only, not the desk's wording.
       - The counts can drift from the desk if the records change form.
     Rules out: the desk's wording on the widget, until a later ruling. Reversible: yes.
RECOMMENDATION: A, because it is the only option that gives the desk's whole summary without changing the desk's sign-in, server or notification sender. My confidence is low to medium: the first refresh can take hundreds of GitHub requests per project, and whether a widget can do that within its limits is not yet measured. Discovery measures it before anything else is built. If it cannot, C is the fallback, or B if you want what waits on you worded as on the desk and accept its costs.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: this ruling changes only the desk's records. Option A adds a build step to the desk's tools (ordinary code with tests, class R1, with the Reviewer's verdict, if it touches only the desk's source and tools; the design reviewer too if it writes into the page's served files; R3, with your approval, if it changes the package file). Option B changes the notification sender (class R3, your approval), and covering the other two projects needs senders set up. Option C changes nothing in the desk.
DEFAULT: none (where new work on a graduated product starts is the owner's ruling)   TIMEOUT: none
CHECKED: read cold by the Critic, 2026-11-04; reviews/P-001-home-screen-widget/critic.md

## Your answer already given, verbatim
- Asked in session session_01QBwHGKYRJzkU6QvrF8X1wc on 2026-11-04, after seeing mockups of three widgets (counts read from GitHub, the desk's own summary, a one-tap launcher), you answered: "Option 2". Option 2 was "the desk's own summary", which "needs a desk change". It was given in the session without a question file, which the model asks for first; this file carries it, and it is recorded word for word with this question's answer. Option A here gives that summary without changing what the live desk runs.

## Context
- The desk's server checks every call for the owner's Cloudflare Access sign-in, with "no test-only exception, no service tokens" (source: src/lib/access.js, lines 1-4)
- The desk's spec says an Access service token carries no email, so it could never pass the sign-in check, and no exception is made for it (source: specs/S-001.md, J8, lines 15510-15512)
- The server checks the sign-in before any GitHub call, and the page's read model works out what each view shows with no network and no page (source: src/lib/api.js, lines 1-4; src/lib/model.js, lines 1-3)
- The notification sender runs the desk's read model outside the browser, from a checkout of the project's default branch plus GitHub reads (source: src/notify/collect.mjs, lines 1-6)
- The server limits itself to 30 GitHub requests per call; a poll call makes 30 at its heaviest, and a blob call, which reads records' contents, up to 25 (source: specs/S-001.md, J1, lines 14609-14613 and 14618-14621)
- The page makes at most 16 blob calls in one cycle for a project, and keeps each record it has read, by its content hash, between reads (source: specs/S-001.md, lines 4954-4955 and 14606-14607; src/lib/scheduler.js, line 22)
- The desk connects three projects, Service-Desk, Personal-Org-Operating-Model and Model-Lab, and reads a portfolio repository (source: src/config/projects.json, lines 8, 12, 15 and 18)
- The spec designs one sender per project, each in that project's own workflow for that project alone (source: specs/S-001.md, J16, lines 16479-16486); today only Service-Desk's exists, and the operating-model project has no sender yet (source: .github/workflows/desk-notify.yml, line 97; specs/S-001.md, lines 2126-2128; docs/handover/service-desk.md, lines 35-37)
- The sender runs every five minutes (source: .github/workflows/desk-notify.yml, line 31)
- The sender keeps its memory as one workflow artifact holding a signed state file, kept for seven days; its item keys are keyed hashes and its JWT and usage parts are encrypted (source: src/notify/state.mjs, lines 1-5; .github/workflows/desk-notify.yml, lines 99-106)
- The notification sender's code and three shared judgment modules it runs are class R3, as is the package file; the desk's other source and tools are R1; the page's served files also need the design reviewer (source: governance/risk-paths.toml, lines 18, 20-24, 27 and 48-49)
- A graduated product comes back only as new work, starting with a Discovery scaled to its size, and the owner approves every production deploy (source: Personal-Org-Operating-Model OPERATING_MODEL.md §3 "Graduation and re-entry")
