# Handoff — the home-screen widget question (2026-11-04)

Session: session_01QBwHGKYRJzkU6QvrF8X1wc

## What happened
The owner asked whether the desk could become an iPhone widget through the Scriptable app. Three
widgets were mocked up and shown to the owner on a private page: (1) "Counts read straight from
GitHub", marked "Recommended"; (2) "The desk's own summary", marked "Needs a desk change"; (3) "A
one-tap launcher", marked "Lightest". The owner's reply, verbatim: "Option 2".

The route for option 2 was filed as questions/P-001-home-screen-widget.md. The Critic failed it at
five readings (reviews/P-001-home-screen-widget/), past the model's limit of three (D-044). The
owner was asked, by the session's question tool: "The widget question failed the Critic 5 times,
which passes the desk's 3-round limit, so the rules say you decide how to continue. …How should I
continue?", with the options "One final check (Recommended)", "Simpler widget only" and "Drop it".
The owner's answer, verbatim: "One final check (Recommended)".

## Model-Lab's workflows
`git ls-tree --name-only origin/main .github/workflows/` in a clone of shumpmaster/Model-Lab, at
01e9be6, 2026-11-04: asks-merge.yml, governance.yml, orchestrator.yml, pr-body.yml,
scrub-proof.yml. There is no notification sender.

## The owner's answer
The confirmation review passed (reviews/P-001-home-screen-widget/critic.md) and the question's pull
request was opened (#283). The owner was then asked, by the session's question tool, "How should the
iPhone widget get the desk's summary?", with the options "A: widget runs desk code (Recommended)",
"B: sender saves a summary" and "C: counts-only widget". The owner's answer, verbatim: "A: widget
runs desk code (Recommended)".

## Next
1. Once #283 is on the default branch: a pull request that records the answer in
   decisions/questions/P-001-home-screen-widget.md, with the owner's exact words, and deletes the
   question file (AGENTS.md §5, model S-033).
2. Then file the widget as its own project item (the next free P-number) with its short brief and
   milestone, and start its Discovery. Discovery measures first whether a Scriptable widget can make
   the GitHub reads and run the desk's read model within its time and memory.

## Update: P-004's plan (later the same session)
#284 merged. P-004's request and short plan were drafted; the Critic failed round 1
(reviews/P-004-brief/_critic-r1-verbatim.md). Two of its findings needed the owner. Asked by the
session's question tool, "The widget's plan has to say in your own words why you want it. Which is
closest?", with "See what's waiting at a glance", "Open the desk less often" and "Don't miss
anything", the owner answered, verbatim: "See what's waiting at a glance". Asked "Where may the
widget keep your records and the GitHub key? The desk's rules allow your project content to go
only to GitHub and Cloudflare.", with "Phone only (Recommended)" and "Allow iCloud", the owner
answered, verbatim: "Phone only (Recommended)".

The two answers above were asked in the session without a question file first. Neither is treated
as a ruling: the reason is a note of the owner's for the milestone's why, and keeping the widget's
data on the phone is part of P-004's plan within Part 1 section 5's rule as it stands, approved with
the plan at the Design gate. Letting Scriptable use iCloud would have needed a ruling, and was not
chosen. The Critic's round 2 (reviews/P-004-brief/_critic-r2-verbatim.md) raised the point.

## Update: the plan's round limit (later the same session)
The paragraph above is superseded: the Critic's round 3 of P-004's plan
(reviews/P-004-brief/_critic-r3-verbatim.md, finding 1) found that both answers were rulings put to
the owner and must be filed as a question and recorded, not treated as notes. That was round 3, the
plan's limit (D-044). The owner was asked, by the session's question tool: "The widget's plan
(P-004) hit the Critic's 3-round limit. The one blocker is my process slip: I asked you two
questions in chat (your reason, and phone-only data) without filing them as questions first, and the
rules need them on record. The plan itself is sound. How should I continue?", with the options "File
the answers, then one check (Recommended)" ("I file a question carrying both of your answers word
for word (like the earlier card-fix question did), record them once it merges, fix the 7 smaller
points, then the Critic does one final focused check. Two small extra PRs; nothing on the desk
changes."), "Drop the quotes, one check" and "Pause P-004". The owner's answer, verbatim: "File the
answers, then one check (Recommended)". The question carrying the answers is
questions/P-004-widget-why-and-data.md.

The backup point (round 3's finding 6: the phone's own iCloud backup may copy the widget's storage)
was raised after the owner's "Phone only" answer and has not been put to the owner.

## The descriptions shown with the options (correction)
The session's question tool showed each option with a description. "Update: P-004's plan" above
gave only the labels; the descriptions as shown, verbatim, were:
- For "The widget's plan has to say in your own words why you want it. Which is closest?":
  "See what's waiting at a glance" — "So you know whether anything is waiting on you without opening
  the desk."; "Open the desk less often" — "So you only open the desk when something actually needs
  you."; "Don't miss anything" — "So nothing waits on you unnoticed between notifications."
- For "Where may the widget keep your records and the GitHub key? …": "Phone only (Recommended)" —
  "Key in the iPhone keychain, records cached on the phone only, nothing synced to iCloud. Stays
  within the desk's current rule."; "Allow iCloud" — "Scriptable may keep its files in iCloud, so
  they sync across your devices. Widens the rule to add Apple's iCloud; needs its own ruling."
- For the round-limit question: "Drop the quotes, one check" — "Take both quotes out of the plan;
  the phone-only rule stays as plan content you approve at the Design gate. Faster, but your stated
  reason isn't on record."; "Pause P-004" — "Stop here. The plan stays on the branch, unmerged, until
  you pick it up again."
