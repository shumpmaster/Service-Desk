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

## Update: the plan merged, and P-004's Discovery starts (later the same day)
Session: session_01QBwHGNFKViyibzxHx5qTtm

Merged on main:
- #289 filed questions/P-004-widget-why-and-data.md, carrying both answers word for word, with
  P-004's request and draft plan.
- #290 recorded the answers in decisions/questions/P-004-widget-why-and-data.md ("Phone only
  (Recommended)"; "See what's waiting at a glance") and deleted the question file.
- #291 is not a pull request in this repository (GitHub answers not found); nothing to record.
- #292 merged P-004's finished plan (docs/PROJECT.md, "Later work: the home-screen widget (P-004)",
  with M5 proposed; intake/requests/P-004.toml). The Critic passed it at the confirmation review
  (reviews/P-004-brief/critic.md).

No question has been put to the owner in this session.

## Next (P-004's Discovery, as the plan's "Its Discovery, scaled to its size")
1. Register the test as EXP-007 (experiments/_REGISTRATION.md), written by the Definer, checked by
   the Critic (at most three rounds, D-044), with the plan's pass mark copied unchanged and frozen
   before any run.
2. The Builder makes the throwaway test widget on a local build/builder/ branch, never merged and
   never under src/public/: a rough copy of the desk's card-making code in one Scriptable file
   that, on each refresh, reads the three projects in src/config/projects.json (Service-Desk,
   Personal-Org-Operating-Model, Model-Lab) and the portfolio repo, and logs time, memory, request
   count and summary to a file on the phone. If the code cannot run outside a browser without
   changing the desk's code, that goes back to the owner (as a question file first) before more work.
3. The owner gets short install steps (a fine-grained read-only key, kept in the keychain, nothing
   in iCloud) and is asked for the log a day later. These are steps, not a ruling.
4. The Reviewer, not the Builder, judges the log against the pass mark; the Builder files the
   result in docs/handover/experiments/EXP-007-result.md. On a fail, the route goes back to the
   owner with the fallbacks the question named: the sender's summary or the counts-only widget.
5. Then size the work and prepare the Design gate, where the owner rules on three open points: the
   phone's own iCloud backup; whether widget time counts toward V3; and whether the plan may follow
   P-003's form without Discovery or Design standard lines. Each is filed as a question, with a
   Critic check and a pull request, before it is put.

## Update: the test widget and its checks (later the same day)
Session: session_01QBwHGNFKViyibzxHx5qTtm

- **The test widget is built** on the local branch build/builder/p004-test-widget (never pushed or
  merged; worktree /home/user/sd-wt-builder; last reviewed commit b2b1711, later commits in
  progress). The desk's card-making code (src/lib) runs packed in one Scriptable file with no change
  to the desk: the desk's 1569 tests pass, and its build check passes. Offline, on the local clones,
  a cold refresh made 866 GitHub requests (Service-Desk 708, above the plan's "up to about 400" for
  one project), and a later refresh made 29 to 39. The Home tile's own count is not what the widget
  shows: the tile adds page-code numbers (src/public/sandbox.js) to src/lib's board. That is a point
  for the Design gate, and the Critic agreed it does not block the test (reviews/EXP-007/_critic-r1-verbatim.md,
  finding 4).
- **The Builder was asked** to add a "Delete test data" app-menu item, which removes the stored copy,
  the log and the kept data, together with the fixes from the Critic's round 2 on EXP-007.
- **EXP-007's registration** (build/definer/p004-widget-exp, Draft 3) failed the Critic's rounds 1
  and 2 (reviews/EXP-007/). Round 3 is the last (D-044). The Reviewer passed the widget's data
  handling at b2b1711 (reviews/EXP-007/_reviewer-widget-b2b1711.md): the log holds no project
  content, nothing goes to iCloud, and it talks only to GitHub.
- **Service-Desk and Model-Lab are public repositories**; Personal-Org-Operating-Model and portfolio
  are private. The first draft's route for the test data, an upload to Service-Desk, would have
  published private records. It is withdrawn.
- **The question** questions/P-004-test-data-route.md passed the Critic at round 3
  (reviews/P-004-test-data-route/critic.md). It is put to the owner once its pull request is open.

## The ask, as it will be put (recorded before it is quoted anywhere)
By the session's question tool, the question "May a copy of the widget test's data leave your phone,
and by which route?", with the options and descriptions below, verbatim from the card:
- "Widget sends it to portfolio (Recommended)" — "One exception to Phone only: at the end of the
  test you tap "Send the test data", and the widget sends its copy straight to a new branch of your
  private portfolio repository on GitHub. It needs a second key, kept in the iPhone keychain like the
  first, that can write files only in portfolio (7-day expiry, deleted after); a key that can write
  portfolio's files could also change its main branch, which the desk reads, so a fault in the widget
  could change what the desk shows from portfolio. The copy never goes into your phone's Files, so
  your phone's iCloud backup doesn't pick it up. The Reviewer then downloads it into its working
  session to check it, as it already does with your repositories. Its own extra costs: the send step
  in the widget, the second key, and about 5 more minutes of your time."
- "You upload it to portfolio" — "One exception to Phone only, and to the desk's rule: you save the
  copy in Files (On My iPhone), upload it to a new branch of portfolio on github.com, then delete it
  and empty Files' Recently Deleted, which otherwise keeps it for 30 days. While the file is in
  Files, an iCloud backup may copy it, and that copy stays in Apple's iCloud until the backup is
  replaced, usually for days. You can avoid that by turning iCloud Backup off until the file is
  deleted. About 10 minutes."
- "Check timing only" — "No exception: the copy never leaves the phone. Only the log comes back, and
  it holds counts, project names and scrambled stand-ins for titles, no records. The test still
  checks that later refreshes finish and how long they take, but not whether each summary was
  right; that is checked later only by the desk's own test on sample records. This changes the pass
  mark the plan sets."
- "Pause the test" — "Stop here. The test widget exists only in this session's working copy, so it
  would have to be rebuilt in a later session."

## The owner's answer to the data-route question
PR #300 filed questions/P-004-test-data-route.md. The owner was then asked, by the session's
question tool, "May a copy of the widget test's data leave your phone, and by which route?", with
the four options and descriptions recorded verbatim above ("The ask, as it will be put"). The
owner's answer, verbatim: "Widget sends it to portfolio (Recommended)".

## Next
1. Once #300 is on the default branch: a pull request that records the answer in
   decisions/questions/P-004-test-data-route.md, with the owner's exact words, and deletes the
   question file (AGENTS.md section 5, model S-033).
2. The Builder adds "Send the test data" to the test widget (a second, portfolio-only write key in
   the keychain; a new branch of portfolio, never its main), and removes the share items; the
   Reviewer checks the widget again at that commit.
3. The Definer writes EXP-007's Draft 4 (this route, and the Critic's round 2 findings); the
   Critic's round 3 is the last (D-044). Then the registration is frozen and the owner gets the
   install steps.

## Update: EXP-007 frozen, the test given to the owner (2026-11-05)
- The test widget's final commit is 491baa7 on the local branch build/builder/p004-test-widget
  (never pushed or merged). Its packed file, src/widget-test/needs-you-test.js, is 362,709 bytes,
  sha256 2259de93853df4349024a47a3721c203237d2308d41db1d575fb3d688e39d0fe. The Reviewer passed it
  (reviews/EXP-007/_reviewer-widget-491baa7.md). If this session's working copy is lost, a later
  Builder rebuilds it from the frozen registration; the result must name the sha the owner ran.
- EXP-007's registration is frozen at ad2709e (Draft 6), after the Critic's PASS at round 3
  (reviews/EXP-007/critic.md).
- The owner was given the packed file and short install steps: a read-only key at install, a
  portfolio-only send key at the end, nothing through Files or iCloud. The steps are not a ruling.

## Next
1. Once #300 is on the default branch: record the answer in
   decisions/questions/P-004-test-data-route.md, with the owner's exact words, "Widget sends it to
   portfolio (Recommended)", and delete the question file (AGENTS.md section 5, model S-033).
2. When the owner says "sent": fetch portfolio's branch exp-007-test-data into the portfolio clone;
   the Reviewer runs `node src/widget-test/judge.mjs exp-007/log.jsonl --snapshot
   exp-007/test-data.json <four clones>` from the widget's branch, fetched to the logged shas, and
   judges against the frozen pass mark; the Builder files docs/handover/experiments/EXP-007-result.md
   from the Reviewer's verdict. Then the branch is deleted. On a fail or a second "not judged", the
   route goes back to the owner, with the sender's summary or the counts-only widget as fallbacks.
3. Then size the work and prepare P-004's Design gate. Points for the owner there, each filed as a
   question first: the phone's own iCloud backup; whether widget time counts toward V3; whether the
   plan may follow P-003's form without Discovery or Design standard lines; and the widget's waiting
   number, which is src/lib's count and may differ from the Home tile's. The gate case must also
   say: memory could not be measured; the judge shares the widget's adapter (glue.js), cross-checked
   independently only for projects with no pull requests; Service-Desk's cold read was 708 requests
   offline, above the plan's "up to about 400".
