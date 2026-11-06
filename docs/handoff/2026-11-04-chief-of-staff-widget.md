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

## Open: the scope check fails on #300 (found 2026-11-05, after the push)
`v3_checks scope --base origin/main` fails on the nine Definer commits that wrote EXP-007
(57c024b to ad2709e): each carries `Spec: P-004`, and the check accepts only an `S-nnn` spec with a
file in specs/ (govlib.py:822, v3_checks.py:1548). P-004 has no spec yet. My briefs gave the
trailer; the slip is mine. The commits are on the pushed branch and force-push is denied, so they
can't be re-made. CI will mark #300 red on this check. The desk's mechanism for commits the guard
must skip is the `exempt` block of governance/SURFACES.md with a ledger entry each (R3, the owner's
approval, as L-0002). Nothing has been changed for it. Next session: file a question (with the
Critic's check and a pull request) offering (A) exempt the nine commits, with one ledger entry, the
owner approving by merging; (B) the owner merges #300 with this one check red; (C) a check change
letting a Definer commit name a project item (P-nnn) when its every path is in the Definer's lane
(tools change, governance surface). Until then, builder-class commits for P-004 should not carry
`Spec: P-004`. The test widget's own commits carry it too, but that branch is never merged.

## The scope-check question, and the ask as it will be put (2026-11-05)
questions/P-004-registration-commits.md passed the Critic at round 2
(reviews/P-004-registration-commits/critic.md). By the session's question tool, the question
"How should the widget test's plan get past the desk's scope check?", with these options and descriptions, verbatim from the card:
- "Exempt the nine commits (Recommended)" — "The nine commits are added to the desk's list of commits that its scope check and its surface check skip, each with an entry in the decision log saying why. The same list holds the desk's founding commit, a different case. From then on both of those checks skip these nine, not only the scope check; the check that each writer kept to its own files already passed on them, but only that past run shows it. The change goes into #300, the Reviewer checks it, and your merging #300 is your approval. Both checks then pass. The list entries could be removed later, but once #300 is merged that changes nothing, because the checks never walk merged commits again."
- "Merge with the checks red" — "You merge #300 as it is. I close its task with the reason, so only the scope check stays red. No list or log change. The red mark stays in #300's history, and nobody can tell from the checks alone that it was looked at and allowed."
- "Change the check" — "The check is changed so a plan-writer's commit may name a project like P-004 when it touches only the plan-writer's own files. Fixes this for every later project too, but it is a change to the desk's own tools, which needs its own written plan, the Critic's check, the Reviewer's, and your own approval. #300 waits until it's done."

## The owner's answer to the scope-check question
Asked as recorded above. The owner's answer, verbatim: "Exempt the nine commits (Recommended)".
The nine commits are in governance/SURFACES.md's exempt block (L-0023 to L-0031), in PR #300; the
Reviewer checks it there (R3: the Reviewer and the owner), and the owner's merge of #300 is the
approval. Both answers (the data route and this) are recorded in decisions/questions/ once #300
is on the default branch, each deleting its question file.

## Note: the nine ledger entries renumbered (2026-11-06)
Main took L-0023 (model 3.7.2 sync) while #300 was open, so at the merge of main the nine
exemption entries became L-0024 to L-0032 (governance/SURFACES.md, docs/LEDGER.md and the register
row match). Earlier lines here naming L-0023 to L-0031 mean these.

## Update: EXP-007 run and judged — NOT JUDGED (2026-11-06)
The owner ran the test and sent its data (portfolio, branch exp-007-test-data, 620e2f4). The
Reviewer's verdict, verbatim in reviews/EXP-007/_reviewer-result.md: NOT JUDGED. In the app, the
cold read finished (1,033 requests, 2 minutes) and later app refreshes matched the desk's own code;
on the home screen, all 25 widget refreshes were stopped within seconds, and none started from a
complete kept copy, because the widget appears not to see the app's Caches folder (Documents, the
log, is shared). No counted later refresh ran; the frozen registration does not cleanly decide the
case. PR #300 was merged by the owner on 2026-11-06, after the owner added
reviews/300/owner.md.

## Next
1. After #300 merges: restart the claude branch from main (it holds only merged history), push
   these records, and record both answers (P-004-test-data-route, P-004-registration-commits) in
   decisions/questions/, deleting the question files.
2. The result file docs/handover/experiments/EXP-007-result.md is the Builder's lane, and a
   builder-class commit needs a `Spec:` trailer the scope check accepts; P-004 has none. Settle
   this before the Builder files it (it may be part of the next question).
3. File a question (Critic check, pull request) on the next step, with options such as: the route
   comes back as failed and P-004 takes a fallback (the sender's summary, or the counts-only
   widget); a second test with the kept data in Documents, which the phone's iCloud backup copies
   (the unruled backup point, so it needs that ruling too); or a run repeated as registered,
   expected to hit the same storage split. Record the 1,033-request cold read for sizing.
4. The owner can delete the test data branch and the script's data once the result is filed.

## Update: the next-step questions filed (2026-11-06)
Session: session_01QBwHGJ3UVJ6HY4SS92w7UW

- The test widget's local branch (build/builder/p004-test-widget) is gone with the earlier container; any rerun rebuilds the widget and its judge from the frozen registration.
- Two questions were filed: questions/P-004-widget-next-step.md (what P-004 does next) and questions/P-004-result-spec.md (how the result file passes the scope check; a spec is not possible before P-004's Design gate). Both failed the Critic at rounds 1 and 2 and passed at round 3, the last (reviews/P-004-widget-next-step/critic.md, reviews/P-004-result-spec/critic.md); round 3's non-blocking notes were applied at 6e371c8.
- No question has been put to the owner in this session before this entry.

## The ask, as it will be put (recorded before it is quoted anywhere)
By the session's question tool, both questions together, once their pull request is open, with the options and descriptions below, verbatim from the cards:
- The question "The widget test couldn't reach what it was meant to check. What next?":
  - "Second test, data kept in Documents (Recommended)" — "The Builder rebuilds the test widget and its judge (this session's copies are gone) so that both the kept copy and the widget's per-refresh snapshots, which the judge needs, are in Documents, the folder the widget is known to share with the app. The second test is written down as a new test and checked by the Critic and the Reviewer before it runs. Its written plan and its result hit the same desk check as the result of this test, so they need your answer to the other question too. With its recommendation, each of their commits is exempted, with your approval when you merge; last time's plan took nine commits. Likely a week before your test day. Documents is copied by your phone's iCloud backup, and your Phone only ruling didn't settle whether the backup is allowed; that stays for the Design gate. The data there is larger than before: the kept copy is about 1 MB and the snapshots several MB (the last was 7.4 MB). To keep it out of iCloud for this test, you switch Scriptable off in your phone's iCloud Backup settings. People report this deletes the app's backed-up data and that the switch can turn itself back on, so you check it daily; if it is back on, your records may already be in a backup: switch it off again, which is reported to delete them, tell me, and the test carries on. The test data comes back by the route you allowed last time, which this extends to the second test. Your time: about 15 minutes to set up, a day of normal use, about 10 minutes at the end. The first test's result stays not judged. The widget may still be stopped for time or memory; a fail or another not-judged result comes back to you, with the two fallbacks below."
  - "Sender saves a summary" — "You treat the widget route as failed, though the test didn't fail it. P-004 takes the first fallback you were offered: the desk's notification sender also saves a summary, and the widget only reads that. It changes the sender, which needs your approval, and where the summary is saved has to keep your private projects out of the desk's public repository. Not sized yet."
  - "Counts-only widget" — "You treat the widget route as failed, though the test didn't fail it. P-004 takes the other fallback: a widget that reads a few counts straight from GitHub and doesn't show the desk's own summary. No desk change; the lightest to build. You lose what you chose the widget for: the desk's summary at a glance."
  - "Repeat the test as it is" — "The Builder rebuilds the same test widget and its judge from the test's frozen plan (this session's copies are gone), the Reviewer checks them again, and you run it once more, the step the test's rules give after a not-judged result, though they don't cleanly cover this case. If the rebuilt widget differs from the frozen plan in any way, it is a new test instead. A few days of the desk's work before your test day. Its result needs your answer to the other question too. Another day of your phone and about 25 minutes of your time: 15 to install the rebuilt widget and a new read key, and 10 at the end. Expect the same result, because the widget still can't see the kept copy; if it is not judged again, this question comes back."
- The question "How should the widget test's result be filed, so it passes the desk's scope check?":
  - "Exempt each such commit (Recommended)" — "The Builder files the result where the test's plan says, in a commit with no spec label, on purpose, since P-004 can't have a spec before its Design gate. That commit is then added to the desk's list of commits its scope and surface checks skip, with an entry in the decision log saying why. If you choose a second test, its written plan's commits and its result's are handled the same way, and a repeat's result too; last time's plan took nine commits. The list so far holds the desk's founding commit and last time's nine, which were a mistake already on GitHub; these would be its first planned entries, each shown to you first and checked by the Reviewer. Your merging each pull request is your approval. Quick."
  - "Keep the Reviewer's record as the result" — "No result file is written. The Reviewer's verdict, already on the desk word for word with a plain summary written for the result, stands as the result, and the desk's notes record that the test's plan named a file that was not written. No exemption and no check change, and the test data can be deleted as soon as you rule. The folder of the desk's test results has a gap where this one would be, and it covers only this result: a second test's plan would still need A or D."
  - "Wait for P-004's spec" — "The result is filed once P-004 has a spec, after its Design gate. Any widget P-004 goes on to build, a fallback included, gets one there. No exemption, but the test data and the phone's copy wait, perhaps for weeks, and if P-004 is dropped the result is never filed. A second test's plan or a repeat's result would wait for the gate too."
  - "Change the check" — "The check is changed so a Builder commit may name a project like P-004 when it changes only a test result file. Fixes this for every later project, but the desk's checks come from its operating model, so a change made only here could be undone at the next update: the lasting fix is a change to the model, with its own written plan, the Critic's check, the Reviewer's and your approval. Days to weeks; the result waits."
