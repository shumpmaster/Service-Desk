Verdict: FAIL

**What this means for the owner.** The plan covers everything that waits on you: every kind of item has a clear moment when it starts waiting, and every repository check passes. It can't go ahead as written, for three reasons.
- **Things that would leak or could be faked.** Because Service-Desk is public, some private detail from the operating-model project would leak out: through the sender's saved memory, through a GitHub issue, and through test files. A stranger could also plant fake saved memory and silence your notifications.
- **Rules that work against you.** The planned "make it fail" test can't work and could make your iPhone turn notifications off. One of the sender's rules would notify you about the automatic job's small pull requests anyway, against your ruling A. The desk would also start showing the build as broken because of the sender's own runs.
- **One question that misstates a risk.** The first open question describes its extra token as only able to start the sender. In fact that token could change Service-Desk.

Each fix is small and specific; they are listed below.

**Checks run (all on 0b7c33c unless noted)**
- spec_check.py status: OK, rc 0.
- v3_checks.py trace: OK, rc 0. v3_checks.py joins: OK, rc 0 ("no joins in 0 frozen spec(s)").
  - Both only look at frozen specs, and S-001 is a draft, so neither tested S-001.
  - I checked by hand instead: AC73–AC77 each name an `ac-test`, and J7 and J16–J19 each name a `join-test`.
- v3_checks.py scope --base origin/main: OK, rc 0 (2 spec-scoped commits; 3 Definer-lane paths bounded by the surface map).
- surface_guard.py diff --range origin/main..0b7c33c --branch build/definer/s001-notifications: OK, 2 commits, rc 0.
- check_all.sh: all 25 steps PASS, rc 0.
  - Scratch clone at /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/nr1.
  - Merge commit 3d26722 = `git merge --no-ff` of 0b7c33c into ef8daf4, committed as shumpmaster <furchken@gmail.com>.
  - Run as `GOV_DEFAULT_BRANCH=main check_all.sh . ef8daf4`. Log: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/nr1-checkall.log
- Extra: I wrote both draft open questions as files in the scratch clone only. `governance_checks.py questions` passes them.

**What I verified as true**
- **AC77's line is allowed.** An `Asked in session:` line passes the model's question checks:
  - `QUESTION_LABELS` at governance_checks.py:104-105, `check_questions` at :276-296 and `v3_question_problems` at about :337.
  - The desk's `parseQuestion` (src/lib/records.js:290) is not disturbed by it.
  - asks-merge's closing rule reads only the first column-0 `Milestone:` line.
- **The asks-merge mirror matches the job's code.** The four kinds by path match `classify` and the regexes at asks_merge.py:81-83. `ORCH_WORKFLOW` and `EXEMPT_STATUS` are at :74-75, `check_state` at :226, `find_grant` at :334 and `COMPARE_FILE_CAP` = 300. Fork pull requests are never candidates.
- **The workflow names are right.** Each name the `workflow_run` trigger lists matches a real workflow's `name:` (governance, orchestrator, asks-merge, pr-body, desk-build, desk-deploy).
- **Pushes with the workflow's own token start no run.**
  - The Orchestrator's commit job pushes with `github.token` and then starts governance (orchestrator.yml:422-480).
  - asks-merge merges through the API, then starts governance (asks_merge.py:647-650).
  - GitHub creates no run for events made with that token, except dispatches (L-F8).
  - Chain depth is fine: pull_request → governance → asks-merge → desk-notify is three levels.
- **Other citations hold.** desk-deploy.yml:5-7 (the owner is the required reviewer) and owner_signal.py:1-30 (two commit statuses) say what the spec says.
- **The cron line is valid.** `2-59/5` is accepted syntax.
- **The concurrency claim is right.** One run at a time, one pending, a newer pending run replacing the older, matches GitHub's documented behaviour.
- **The key-pair command in N1 works.** It prints the last 65 bytes of the 91-byte public key, which come out as 87 characters of base64url.
- **The Web Push details match the standards.**
  - VAPID: `vapid t=,k=` header, `aud` = the endpoint's origin, `exp` at most 24 hours ahead (RFC 8292).
  - Encryption: aes128gcm (RFC 8291).
  - Headers: 4,096-byte limit, TTL, Urgency, and a Topic of at most 32 base64url characters (RFC 8030).
  - Declarative payload: `web_push: 8030` with `title` and `navigate` (Q-011 D1).
- **Every kind is covered.** Terms' four flagged things, AC46's hold cards, AC47's merge cards, the missing-card status file, questions in both models and waiting deploys each have a start moment. The only exception is the job-candidate rule (B2).
- **The new numbers are free.** AC73–AC77, J16–J19 and CS15–CS17 are not used elsewhere in the spec.

**Findings**

*BLOCKING*

- **B1. The push service's answers are misread, and the `test: fail` design can't work.** S-001.md:4449-4451, :6155-6158, :6159-6162; EXP-006:37, :50.
  - Under RFC 8291 the push service never sees the subscription's `p256dh` or `auth`. A push encrypted with a wrong `auth` gets 201, then fails to decrypt on the phone.
  - So `test: fail` opens no issue, and EXP-006 case 7 cannot test what it claims.
  - Worse, a push that shows nothing is what Safari punishes by revoking permission (W8).
  - 400, 401 and 403 mean the request or VAPID is bad (Apple: 403 = bad or expired JWT), not "keys that don't match". Mapping 403 to "stop until `DESK_PUSH_SUBSCRIPTION` changes" halts all notifications on a JWT, clock or key-pair fault. Re-subscribing won't fix a stored private key that doesn't match J7's public key.
  - Fix:
    - make `test: fail` sign with a throwaway VAPID key;
    - treat 403 apart from 404 and 410;
    - check at the first step that the stored private key's public half equals J7's `vapidPublicKey`.

- **B2. J16's rule (b), "the job has left it", fires on skipped and cancelled asks-merge runs.** S-001.md:6097-6100.
  - asks-merge.yml:14-16 starts a run on every completed governance or desk-build run.
  - Its job `if:` (:37) skips every run not caused by a pull request. That means every push to main, and every governance run asks-merge itself starts (asks_merge.py:647).
  - Those skipped runs share the `asks-merge` concurrency group (:30-32). So they also replace a pending run that would have merged.
  - Such a run "started after the last check finished" and "has completed". The sender would then notify a job pull request that the job merges a minute or fifteen later, against ruling A.
  - This is likely when the Chief of Staff files a question and its session lines back to back.
  - Fix: count only asks-merge runs whose `merge` job actually ran and concluded `success` (read the jobs), and test the skipped and cancelled cases.
  - Separately for the model: skipped runs can displace a pending real run in that group.

- **B3. The sender's saved memory (J18) can be forged.** S-001.md:6174-6177.
  - The sender takes "the newest artifact named `desk-notify-state`" from the repository-wide artifact list.
  - In this public repository, `pull_request` runs from forks run the pull request's own workflow files (desk-build, governance, pr-body). Their artifacts land in Service-Desk's store, so any of them can upload one with that name.
  - The sender, holding all four secrets, would then parse attacker-supplied zip and JSON. That can silence notifications, since Service-Desk's keys can be computed from public records, or attack the parser.
  - "the newest is the last run's" is false.
  - Fix:
    - take the state only from desk-notify.yml's own runs on main, checking the artifact's `workflow_run` repository and branch;
    - sign the state with a secret (HMAC);
    - parse it with limits.

- **B4. Hashed keys don't hide anything.** S-001.md:4462-4465, :6178-6181.
  - The key is a plain SHA-256 of `<project>|<kind>|<id>`. The project name is known and the ids have little variety: pull request numbers, run ids, guessable question names.
  - Anyone can work back from the public artifact to which operating-model pull request numbers and deploy runs wait, and when. That contradicts "never a title, path or number".
  - J18's test (state "holding no clear text") would pass while it leaks.
  - Fix: HMAC-SHA-256 with a secret, plus a test that a key can't be recovered without it.

- **B5. AC76's issue can publish private items.** S-001.md:4448.
  - "One unsent for 6 hours is given up, and named in the issue" — the issue is in public Service-Desk.
  - The "Nothing private" rule (:4462-4465) and AC76's test (:4467-4472) cover only logs and state, not the issue.
  - Fix: name items by project and count only, and test the issue body.

- **B6. AC73's test copies private records into the public repository.** S-001.md:4334-4335.
  - It says to use "real records" of Personal-Org-Operating-Model at 90f53e3.
  - tests/desk/fixtures/README.md (poom/) says that project's files are NOT copied here.
  - Fix: use poom/'s placeholder form.

- **B7. The sender's own runs would turn the desk's CI line red.**
  - J1's CI rule (S-001.md:4700-4729) counts every push and manual run on main's head, except desk-deploy and orchestrator (:4707-4722).
  - Workflow 3 runs on `push` to main (:6416) and on manual start (`test`).
  - CS15 says its first runs fail until N4 and N6 (:6635-6636), so the desk would show main as "failing" CI. Its 2-minute deploy wait would show "running".
  - AC75 says "No other change to the desk" (:4435).
  - Fix: add desk-notify.yml to J1's activity-only list, with a test, and state the sender's exit codes.

- **B8. Open question 1, option B, misstates its token.** S-001.md:7439, :7449.
  - Starting Service-Desk's workflow from the other project needs write power on Service-Desk:
    - `repository_dispatch` needs Contents write, per Q-011 T10b, the question's own source;
    - `workflow_dispatch` needs Actions write.
  - Neither "may only start Service-Desk's sender". Contents write on a public repository can push code.
  - BLAST RADIUS is understated too. Not ready to file until this is fixed.

*NOTE*

- **N1. J16's list of GitHub reads is incomplete.** S-001.md:6065-6070.
  - It omits reads J2's rules need: the latest governance.yml run on the head, for whether a hold card is open (:4792-4794); and, for each open merge card, whether its tip is merged (:4827-4831), which `git merge-base --is-ancestor` on the full checkout can answer.
  - "About 10 a run" leaves these out.
- **N2. The tag never reaches the phone on iOS 18.4 and later.** S-001.md:6146-6151.
  - The tag sits in a non-standard `desk` member, and the Declarative path has no service worker to read it.
  - So AC74's "replaced, not added" (:4379-4381) fails on that path.
  - Put `tag` inside `notification`, and have EXP-006 case 6 test it.
- **N3. The VAPID refresh sentence contradicts itself.** S-001.md:6142-6143.
  - "A new JWT each run, so never refreshed more than once in an hour" — at about 25 runs an hour, the JWT is renewed about 25 times an hour.
  - Q-011 V8 (B) says Apple wants it refreshed at most hourly. State a reading, or test it in EXP-006.
- **N4. Rule (c) starts its 30 minutes at the wrong moment.** S-001.md:6101. It counts from the head commit's time, so a commit made long before the pull request opens fires at once. Count from the later of the commit time and the open or new-head event.
- **N5. Rule (a) should name the latest run per check.** S-001.md:6092-6095. It should count only the latest run per key, as `check_state` does (asks_merge.py:236-247). Otherwise a cancelled check that is then re-run fires a notification.
- **N6. A pull request can return unnoticed.** S-001.md:6405-6406 against :4325-4327.
  - `converted_to_draft` and `closed` are not triggers.
  - Draft-and-back or close-and-reopen with no run in between keeps the key in the saved set, so the return is not "new". That contradicts "waiting anew".
- **N7. The first run and a failed read are undefined.** S-001.md:6186-6188, :6664-6666.
  - Undefined: what a run that fails at its first step (missing secret) uploads with `if: always()`. An empty upload would skip the first-run summary and send every waiting item as new.
  - A failed artifact list or download must not be treated as "no artifact", or it would trigger a fresh summary.
- **N8. The setup order is circular.**
  - The Builder's step 2 needs N1's public key via CS17 (S-001.md:7760-7762).
  - But the brief puts N1–N7 after the Builder's pull requests (:7767-7769), and N5 needs that pull request deployed.
  - Move N1 and the CS17 hand-over before step 2.
- **N9. N8's Bypass step isn't exact.** S-001.md:6674-6676 and EXP-006's fallback.
  - Access policies have no path selector. Bypassing paths takes a separate self-hosted Access application for those paths, with a Bypass policy.
  - I couldn't reach Cloudflare's docs from here; treat this as C.
- **N10. Pull requests from strangers.**
  - `pull_request_target` runs with the `notify` secrets on any stranger's pull request. Its title goes verbatim to your lock screen: chosen text, and possible spam.
  - Suggestions:
    - no title for outside authors;
    - `branches: [main]` on the trigger;
    - forbid `${{ github.event.* }}` in `run:` lines.
  - No pull request code runs, so no secret is exposed.
- **N11. Nothing tests the workflow's security claims.**
  - Workflow 3's claims (triggers, permissions, Environment, no pull-request checkout, `persist-credentials: false`, pinned actions) have no test that can fail.
  - CS15 doesn't name the Reviewer's security review, which Risks promises (S-001.md:7284-7290).
  - Add a test that reads desk-notify.yml.
- **N12. The Environment rule for `pull_request_target` is unsourced.**
  - The claim that an Environment limited to main admits `pull_request_target` runs has no source; I couldn't reach GitHub's docs.
  - EXP-006 case 5 would show it, but no fallback is named.
  - Note that `workflow_run` of governance and pr-body already catches opened, reopened and synchronize. Only ready_for_review needs `pull_request_target`.
- **N13. EXP-006 case 5 skips the original trigger.** It measures no Orchestrator card, and no push of your own. AC74's card delay (S-001.md:4359-4360) stays unmeasured.
- **N14. AC77's re-read is underspecified.** S-001.md:4504-4511.
  - "one poll call" can't fetch the answer's line 1 for "Already answered: …".
  - A failed re-read is not handled.
  - It can't catch your actual report (answer given in the session, record not yet landed). The lead is accurate only for an answer already on main.
- **N15. Open question 2's first Context bullet has no record.** S-001.md:7472.
  - It cites "this session, as relayed". The check passes on the text, but S-033 asks for a record, so record your report first.
  - Optional: there is no option to mark a question "your answer is being recorded" while an automatic-job pull request that closes it is open. That fixes the reported window without a session line.
- **N16. Two small gaps.**
  - Known limits don't name the 60-day schedule shut-off for public repositories (F-gh-12b).
  - Each run makes a deployment record in `notify`, about 300 a day.
- **N17. "No agent holds a secret" holds only as far as the model's existing accepted risk.** Agents push under your account (Terms). A push to main can read the `notify` secrets, now including a read token for a private repository.

**Open questions**
- Should the model's asks-merge workflow keep skipped runs out of its concurrency group, so a skipped run never replaces a pending merge run? This is outside this spec, and it bears on B2.
- I need a source on how GitHub applies an Environment's branch rule to `pull_request_target` runs after late 2025 (N12). I couldn't reach GitHub's docs from here.
