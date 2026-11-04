# Ruling needed: How should a home-screen widget get the desk's summary?

Milestone: none (no milestone exists for the widget yet; this question decides how it is built)
Asked in session: session_01QBwHGKYRJzkU6QvrF8X1wc

WHY: You want an iPhone home-screen widget, made with the Scriptable app, that shows the desk's own summary: what waits on you, and each project's state and headline, worded as on the desk (your choice quoted under "Your answer already given", below). Tapping it opens the desk.

The widget can't simply load the desk. An iPhone widget only draws text and numbers that its script fetches. The desk turns its records into cards inside your browser, and its server lets nothing in without your Cloudflare Access sign-in, which a widget script cannot do. So the desk's summary can reach a widget only if the desk changes (options A and B). Option C is the fallback that leaves the desk alone.

If you choose A or B, the widget is new behaviour for the desk, so it starts as its own small piece of work (its item number is given when it is filed) with a short Discovery and your three gates: Design (approve its plan), Build (approve building it) and Launch (it goes live). Until you rule, nothing is built.

Every option puts a key on your phone, saved inside Scriptable. Each key below says what it can read.

The one-tap launcher you were also shown is left out: it shows no summary, so it does not meet your choice.
OPTIONS:
  A. Let the widget in through Cloudflare Access with a service token of its own.
     What happens: you create a service token in Cloudflare. It is an ID and a secret that a script sends instead of a sign-in. The desk's server accepts that one token as well as your sign-in, for reading only. Discovery then picks one of two ways to work out the summary:
       - the server works it out in a new call, with the desk's own code; or
       - the widget fetches what the page fetches and works it out with a copy of the desk's code.
     Gain: Access stays the only door into the desk. You can revoke the token in Cloudflare at any time, for example if the phone is lost. If the server works out the summary, it matches the desk exactly.
     Cost:
       - It changes the desk's sign-in rule, which today accepts no service tokens. That needs a new spec, the Reviewer's verdict and your approval of the deploy.
       - The key on your phone can read everything the desk reads.
       - The server limits itself to 30 GitHub requests per call, and the desk's busiest call already uses up to 29. A new summary call may not fit, which is why my confidence is only medium.
       - If the widget runs a copy of the desk's code instead, that copy has to be rebuilt each time the desk changes, or the widget drifts from the desk.
     Rules out: nothing. Reversible: yes, delete the token and undo the rule change.
  B. Have the notification senders also save a summary for the widget.
     What happens: each project has its own notification sender, which already works out what waits on you every five minutes with the desk's own code. Today there are two, one for this desk's repository and one for the operating-model repository. Each would also save a short summary, and the widget would read both with a read-only GitHub token. That is a key that can read your repositories on GitHub but not change them.
     Gain: the desk's sign-in is not touched.
     Cost:
       - Two senders in two repositories change. The senders run with the notification secrets, so each change is the highest risk class and needs your approval in its own repository.
       - The senders work out only what waits on you, not each project's state and headline.
       - The summary can be several minutes old.
       - Where a sender could save a summary that a widget can read is unsolved. Today a sender keeps its memory only as a zipped, scrambled file inside GitHub's workflow storage.
       - The GitHub key on your phone can read every record in those repositories.
     Rules out: nothing. Reversible: yes.
  C. Don't change the desk; build the simpler widget instead.
     What happens: the widget reads the records on GitHub itself with a read-only GitHub token and shows counts only (the first mockup you were shown). It is a script on your phone, not part of the desk, so it needs no Discovery and no gates.
     Gain: no desk change; quickest.
     Cost:
       - Counts only, not the desk's wording.
       - The counts can drift from the desk if the records change form.
       - The GitHub key on your phone can read every record in your repositories.
     Rules out: the desk's wording on the widget, until a later ruling. Reversible: yes.
RECOMMENDATION: A, because it is the only option that can give the desk's whole summary, and it keeps Access as the single door, with a token you can revoke. My confidence is medium: whether the server, or the widget, can work out the summary within its limits is not yet measured. It would change if Discovery shows neither can (then B, or C).
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: this ruling changes only the desk's records. Option A later changes the desk's sign-in check and server (ordinary code with tests, class R1, with the Reviewer's verdict). Option B changes two notification senders (class R3, your approval in each repository). Option C changes nothing in the desk.
DEFAULT: none (where new work on a graduated product starts is the owner's ruling)   TIMEOUT: none

## Your answer already given, verbatim
- Asked in session session_01QBwHGKYRJzkU6QvrF8X1wc on 2026-11-04, after seeing mockups of three widgets (counts read from GitHub, the desk's own summary, a one-tap launcher), you answered: "Option 2". Option 2 was "the desk's own summary", which "needs a desk change". It was given in the session without a question file, which the model asks for first; this file carries it, and it is recorded word for word with this question's answer.

## Context
- The desk's server checks every call for the owner's Cloudflare Access sign-in, with "no test-only exception, no service tokens" (source: src/lib/access.js, lines 1-4)
- The desk's spec says an Access service token carries no email, so it could never pass the sign-in check, and no exception is made for it (source: specs/S-001.md, J8, lines 15510-15512)
- The server checks the sign-in before any GitHub call, and the page's read model works out what each view shows with no network (source: src/lib/api.js, lines 1-4; src/lib/model.js, lines 1-3)
- The server limits itself to 30 GitHub requests per call, and the poll call fits with 1 to spare (source: specs/S-001.md, J1, lines 14612-14614)
- Each project's notification sender runs in that project's own workflow, for that project alone: one for Service-Desk, one for Personal-Org-Operating-Model (source: specs/S-001.md, J16, lines 16479-16486; .github/workflows/desk-notify.yml, line 97)
- The sender runs every five minutes and builds the set of what waits on the owner with the desk's own readers (source: .github/workflows/desk-notify.yml, line 31; src/notify/collect.mjs, lines 1-4)
- The sender keeps its memory as one workflow artifact holding a signed state file, kept for seven days; its item keys are keyed hashes and its JWT and usage parts are encrypted (source: src/notify/state.mjs, lines 1-5; .github/workflows/desk-notify.yml, lines 99-106)
- The notification sender's code is class R3; the desk's other source, the sign-in check and the server included, is R1 (source: governance/risk-paths.toml, lines 20 and 27)
- A graduated product comes back only as new work, starting with a Discovery scaled to its size, and the owner approves every production deploy (source: Personal-Org-Operating-Model OPERATING_MODEL.md §3 "Graduation and re-entry")
