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

## The owner's answers to the two next-step questions
PR #312 filed both questions. The owner was then asked both together, by the session's question
tool, with the options and descriptions recorded verbatim above ("The ask, as it will be put").
The owner's answers, verbatim:
- "The widget test couldn't reach what it was meant to check. What next?": "Second test, data kept in
  Documents (Recommended)"
- "How should the widget test's result be filed, so it passes the desk's scope check?": "Exempt each
  such commit (Recommended)"

## Next
1. Once #312 is on the default branch: one pull request recording both answers in
   decisions/questions/P-004-widget-next-step.md and decisions/questions/P-004-result-spec.md, with
   the owner's exact words, deleting both question files (AGENTS.md section 5, model S-033).
2. The Builder files docs/handover/experiments/EXP-007-result.md from the Reviewer's verdict, in a
   commit with no Spec: trailer, on purpose; the Chief of Staff adds that commit's full sha to
   governance/SURFACES.md's exempt block with one ledger entry (check main's latest ledger ID first);
   the Reviewer checks it; the owner's merge approves it. The result records the deviation that the
   run used 553bcc6, not 491baa7 (the Reviewer's finding 1).
3. The Definer registers the second test as EXP-008 (Critic, at most three rounds, D-044), each
   commit with no Spec: trailer and exempted the same way. The Builder rebuilds the test widget and
   its judge with the kept copy and the per-refresh snapshots in Documents; the Reviewer checks the
   widget before freezing. The install steps tell the owner to switch Scriptable off in the phone's
   iCloud Backup settings first and check it daily.
4. The owner may delete both EXP-007 keys on GitHub now. The portfolio branch exp-007-test-data and
   the phone's test data are deleted after the result is filed.

## Update: EXP-007's result filed (2026-11-07)
- The owner recorded both next-step answers on main themselves ("Ruling: A" in each of
  decisions/questions/P-004-widget-next-step.md and P-004-result-spec.md); #315 then only removed the
  leftover question files.
- PR #316: the Builder's c7086cd files docs/handover/experiments/EXP-007-result.md (not judged), with
  no Spec: trailer, exempted as L-0033. The Reviewer passed it (reviews/316/reviewer.md). It needs the
  owner's reviews/316/owner.md and merge.
- Carry into EXP-008's registration from the Reviewer's non-blocking findings 6 to 8 and its open
  question: the facts the result left out (glue.js not audited in depth; the busy stretch did happen;
  the run was about 9¾ hours); widget lifetimes are upper bounds; whether the second test makes new
  keys is for its registration to say; and whether the token page offered Checks for the read key
  (registration line 80) is unconfirmed: ask the owner by question file if it matters.

## Next
1. After #316 merges: the owner deletes portfolio's exp-007-test-data and the phone's test data.
2. The Definer registers EXP-008 (Critic, at most three rounds), each commit without Spec: and exempted
   with its own ledger entry; the Builder rebuilds the widget and its judge with the kept copy and
   snapshots in Documents; the Reviewer checks the widget before the freeze.

## Update: EXP-007 cleaned up (2026-11-07)
- #316 merged with the owner's verdict; EXP-007's result is on main (docs/handover/experiments/EXP-007-result.md).
- The owner deleted portfolio's branch exp-007-test-data (`git ls-remote origin exp-007-test-data` in
  the portfolio clone prints nothing, 2026-11-07) and the phone's test data, as the owner reported
  ("all good on my end").
- The two keys would not delete on GitHub; the owner chose to let them expire (both made with a
  7-day expiry: the read key about 12 November, the send key about 13 November), after removing them
  from the phone with "Forget keys". A departure from Method 7's clean-up in method only; a deleted
  branch's commits can still be fetched for a while.

## Next
1. The Definer registers EXP-008, the second test (decisions/questions/P-004-widget-next-step.md,
   Ruling A), with the carry-overs in "Update: EXP-007's result filed". Each Definer and Builder
   commit carries no Spec: trailer and is exempted with its own ledger entry
   (decisions/questions/P-004-result-spec.md, Ruling A).
2. The Builder rebuilds the test widget and its judge with the kept copy and snapshots in Documents;
   the Reviewer checks the widget; the Critic checks the registration (at most three rounds); frozen
   before the owner gets the install steps, which include switching Scriptable off in iCloud Backup.

## Update: EXP-008 registered, frozen, and its widget rebuilt (2026-11-07)
Session: session_01QBwHGJ3CcwMQ1i8bkydhLN

- **The test widget is rebuilt** on the local branch build/builder/p004-exp008-widget (never pushed
  or merged; worktree /home/user/sd-wt-builder), final commit 92caf00 (work in 1d130fd). Packed file
  src/widget-test/needs-you-test.js, 351,274 bytes, sha256
  4c88f8150e6980a12cee46e7640a9e5c85438e2ae161a6497f4b1c42c9494b79, pure ASCII, packed from src/lib
  at 88b9cf0 unchanged. Everything it keeps is in Documents/needs-you-exp008/; keys
  needs-you-exp008-read-key and needs-you-exp008-send-key; send branch exp-008-test-data on portfolio.
  The Reviewer passed it and audited glue.js in full (reviews/EXP-008/_reviewer-widget-92caf00.md).
  If this container is lost, a later Builder rebuilds it from the frozen registration, and the
  result must name the sha the owner ran.
- **EXP-008's registration** (experiments/EXP-008-widget-refresh-documents.md) failed the Critic's
  rounds 1 and 2 and passed round 3, the last (reviews/EXP-008/critic.md). Frozen at 9328cfc (Draft
  3). Its three Definer commits (712c951, cd98e5f, 9328cfc) carry no Spec: trailer and are exempted,
  L-0034 to L-0036, by ruling A of P-004-result-spec. Measured: `v3_checks scope` went from 3
  violations to pass; surface_guard diff passes.
- **For the judging brief (the Critic's round 3, carried):** the Reviewer's verdict must state, as
  facts, (1) for each exclusion of kind (ii), the refresh's start, its last `alive` mark, the time
  from that mark to `send-start`, that a kill then can't be ruled out, and whether the pass depends
  on it; (2) the count of snapshot lists in test-data.json with no `start` of that id in run.jsonl
  (lost refreshes), and that limit; (3) for each line that does not parse, whether its file's first
  line parses and its time against the first error-free `end`, plus the run's facts from the lines
  that parse; (4) beside any F6 or N2, the owner's report on that read and the reading applied;
  (5) the covering refresh's start against each merge time, the push time of local merges where
  GitHub shows it, and that main is each project's default branch. Items (1) and (2) go to the
  Design gate as risks if they matter. Also the plan's measures and sizing figures by kind of
  refresh (Method 9).
- **The owner's reports during the run** (Method 11) go to the Chief of Staff, who records them here
  for the Reviewer's brief: the iCloud Backup checks; whether the token page offered Checks; each
  first read in the app (did it show a result, did Scriptable stay open); what the widget showed, at
  least once a day; and the send.
- No question has been put to the owner in this session.

## Next
1. The PR with the registration and its three exemptions gets the Reviewer's verdict, then the
   owner's (reviews/<PR>/owner.md) and merge, which approves the exemptions (R3).
2. The owner installs: Scriptable off in iCloud Backup first, a new read key, the packed file; a
   first read in the app; then at least 24 hours of counted later refreshes (allow about 30 hours);
   then a new send key and "Send the test data".
3. When the owner says "sent": the Reviewer confirms the sent copy within a day; the owner then
   deletes the phone's data and forgets the keys; the Reviewer judges per Method 9 with the brief
   above; the Builder files docs/handover/experiments/EXP-008-result.md with no Spec: trailer,
   exempted the same way.

## Update: EXP-008's install, the owner's first reports (2026-11-08)
- PR #320 merged with the owner's verdict (reviews/320/owner.md, PASS).
- The owner's reports (Method 11), as given: "Checks was not offered" (the read key was made
  without Checks). The owner sent a screenshot of the app's preview after the first read in the app:
  it showed a result, with each of the three projects at "Can't read since 20:43" in the desk's
  wording for GitHub or network errors (scheduler.js REASON_WORDS `github`, which a 403 never
  gives: github.js maps that to `token`). Whether Scriptable stayed open until it finished is not
  yet reported. No project content from the screenshot is recorded here.
- Asked of the owner: one more "Refresh now" in the app, kept open until it shows a result (an app
  refresh is reported, not counted), and a screenshot; if all three still read "Can't read", the
  owner pauses and the cause is looked at before the day of use starts.
- 2026-11-08, the owner, as given: after "Refresh now" in the app, "It refreshed, and then the
  widget was just blank". Earlier: "It still won't load on the widget". Whether the app's refresh
  read the three projects normally is asked. The owner was told to leave the widget on the home
  screen and carry on: a widget that shows nothing is what the test measures, and its log records
  each attempt.
- 2026-11-08 (02:50Z), the owner, as given: "They read normally" (the app's "Refresh now" read the
  three projects normally). The day of use started about 2026-11-08 02:45Z. At the owner's request,
  reminders are scheduled into this session: a daily check on 2026-11-09 00:23Z, the send on
  2026-11-09 16:13Z, and a follow-up on 2026-11-11 00:17Z.
- 2026-11-09 (about 00:30Z), the daily check, the owner, as given: "Still blank an yes still off"
  (the widget shows blank; Scriptable is still off in iCloud Backup).
