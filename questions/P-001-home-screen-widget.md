# Ruling needed: How should a home-screen widget get the desk's summary?

Milestone: none (no milestone exists for the widget yet; this question decides how it is built)
Asked in session: session_01QBwHGKYRJzkU6QvrF8X1wc

WHY: You want an iPhone home-screen widget, made with the Scriptable app, that shows the desk's own summary: what waits on you, and each project's state and headline, worded as on the desk (your choice quoted under "Your answer already given", below). Tapping it opens the desk.

The widget can't simply load the desk. An iPhone widget only draws text and numbers that its script fetches. The desk turns its records into cards inside your browser, and its server lets nothing in without your Cloudflare Access sign-in, which a widget script cannot do. So the widget needs a new way to get the desk's summary, and each way changes something you have kept closed so far. That choice is yours.

Whichever you choose, the widget is new behaviour, so it starts as its own small piece of work (its item number is given when it is filed) with a short Discovery and your three gates: Design (approve its plan), Build (approve building it) and Launch (it goes live). Until you rule, nothing is built.
OPTIONS:
  A. Let the widget in through Cloudflare Access with a service token of its own.
     What happens: you create a service token in Cloudflare (an ID and a secret, which a script can send instead of a sign-in) and save it in Scriptable on your phone. The desk's server accepts that one token as well as your sign-in, for reading only. The widget then fetches what the page fetches and works out the summary with the desk's own code, or the server works it out in a new call; Discovery picks whichever fits the widget's and the server's limits.
     Gain: the summary matches the desk exactly, and Access stays the only door; you can revoke the token in Cloudflare at any time, for example if the phone is lost.
     Cost: it changes the desk's sign-in rule, which today accepts no service tokens, so it needs a new spec, the Reviewer's verdict and your approval of the deploy; a secret lives on your phone. Rules out: nothing. Reversible: yes, delete the token and the rule change.
  B. Have the notification sender also save a summary for the widget.
     What happens: the sender, which already works out what waits on you every five minutes with the desk's own code, also saves a short summary that the widget reads with a read-only GitHub token.
     Gain: the desk's sign-in is not touched.
     Cost: the summary can be several minutes old; the sender runs with the notification secrets, so changing it is the highest risk class here and needs your approval; it works out only what waits on you, not each project's state and headline; and where it could save a summary a widget can read is unsolved, since today it keeps its memory only as a zipped, scrambled file. Rules out: nothing. Reversible: yes.
  C. Don't change the desk; build the simpler widget instead.
     What happens: the widget reads the records on GitHub itself with a read-only token and shows counts only (the first option you were shown).
     Gain: no desk change, no gates; quickest.
     Cost: counts only, and they can drift from the desk if the records change form. Rules out: the desk's wording on the widget, until a later ruling. Reversible: yes.
RECOMMENDATION: A, because it is the only option that gives the desk's own wording, and it keeps Access as the single door, with a token you can revoke. My confidence is medium: whether the widget can do the desk's work within its limits is not yet measured. It would change if Discovery shows neither the widget nor the server can work out the summary within their limits (then B, or C).
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: this ruling changes only the desk's records; option A later changes the sign-in check (ordinary code with tests, class R1, with the Reviewer's verdict), option B the notification sender (class R3, your approval), option C nothing in the desk
DEFAULT: none (new work on a graduated product, and a change to the desk's sign-in, are the owner's ruling)   TIMEOUT: none

## Your answer already given, verbatim
- Asked in session session_01QBwHGKYRJzkU6QvrF8X1wc on 2026-11-04, after seeing mockups of three widgets (counts read from GitHub, the desk's own summary, a one-tap launcher), you answered: "Option 2". Option 2 was "the desk's own summary", which "needs a desk change". It was given in the session without a question file, which the model asks for first; this file carries it, and it is recorded word for word with this question's answer.

## Context
- The desk's server checks every call for the owner's Cloudflare Access sign-in, with "no test-only exception, no service tokens" (source: src/lib/access.js, lines 1-4)
- The desk's spec says an Access service token carries no email, so it could never pass the sign-in check (source: specs/S-001.md, J8, line 20141)
- The server's calls return the records' raw text, and the page turns them into cards in the browser (source: src/lib/api.js; src/lib/model.js)
- The server limits itself to 30 GitHub requests per call (source: specs/S-001.md, J1, line 14612)
- The notification sender runs every five minutes and builds the set of what waits on the owner with the desk's own readers (source: .github/workflows/desk-notify.yml, line 31; src/notify/collect.mjs, lines 1-4)
- The sender keeps its memory as one workflow file of keyed hashes, with no title in clear, kept for seven days (source: src/notify/state.mjs, lines 1-5; .github/workflows/desk-notify.yml, line 106)
- The notification sender's code is class R3; the page's code is R1 (source: governance/risk-paths.toml)
- A graduated product comes back only as new work, starting with a Discovery scaled to its size, and the owner approves every production deploy (source: Personal-Org-Operating-Model OPERATING_MODEL.md §3 "Graduation and re-entry")
