Verdict: FAIL

**For the owner:** The sender keeps its secrets safe. In my probes no log line, saved state or GitHub issue held a key, the phone's address, the signature, your e-mail address, a title, a path, a number or a cost figure. The phone-message encryption matches RFC 8291's worked example byte for byte. The check of where a run came from happens before any secret is read, and the $50 cost message leaves no trace in the public log. Two things fail. First, when an answer's pull request is merged in the few seconds between the sender's two reads, your phone gets "Waits on you: a question" for a question that is already answered. That is the stale-ask problem this work exists to fix, and it is likely to happen often, because the automatic merge job and the sender are started by the same check finishing. Second, an item held back while your phone's subscription was gone can be dropped after one passing "try later" answer, when the spec says such items are never dropped. Both are small fixes.

What I ran (in /home/user/sd-orch-notify at dae0e76, which I left unchanged): `npm --prefix src ci && npm --prefix src run build && npm --prefix src test` passes all 634 tests; the log is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev1-suite.log. I also ran `governance/checks/check_all.sh . origin/main` and four probes in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/ (race.mjs, giveup.mjs, logscan.mjs, buildsrc/).

## Findings

1. **BLOCKING: an answered question is notified when its pull request merges mid-run** (against AC74 "never for something that stops waiting", AC77 "when the pull request merges, the question is answered", and AC76 "nothing … sent twice").
   - **Where:** src/notify/collect.mjs:81 reads the checkout; :89 reads the open pull requests later; :135–137 sets "recorded before"; src/lib/asking.js:73 then returns `open` whenever `recordedBefore` is set.
   - **What is wrong:** the sender reads "seen recording before, no longer in the open list" as "closed unmerged". It never checks for a merge.
   - **How it happens:** asks-merge.yml and desk-notify are both started by the completion of governance, pr-body or desk-build. So the answer often merges after desk-notify's checkout and before its pull-request read. That run has the question with no answer in its tree, no open pull request recording it, and `recorded` set. The question returns to the set as new and is pushed.
   - **Reproduce:** `node /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/race.mjs`. Run 3 sends "Waits on you: a question: A made-up question", both with and without an `Asked in session:` line. Without the line, the question is notified a second time.
   - **This is the Builder's own open item 7. I judge it a defect, not a limit.** The spec's promise to the sender is "when that pull request closes unmerged" (J18), and the page is already told to read the pull request "rather than inferring" (AC77, 2b).
   - **Possible fixes, for the Definer:** read `GET pulls/<n>` (which needs the number kept in `recorded`), or check after the pull-request read that the default branch's head still equals the checkout's head and count the run "not read" if it doesn't.

2. **BLOCKING: an item held back during a gone or refused period is given up after one "try later"** (against AC76's give-up text: "never for an item kept unsent because the subscription is gone or the sender is refused … which waits, unsent, until sending resumes, so nothing is lost").
   - **Where:** src/notify/sender.mjs:239 keeps the first `unsent` time when the failure kind changes; :229 gives up once `fail` is `later`/`other` and that time is 6 hours old.
   - **How it happens:** the subscription is gone (410) for 7 hours, then the owner updates it. "Back on" is sent with a 201. The waiting item gets 429 three times within the run. At the next run it is marked `gaveUp` without another try, although the push service now answers 201. It is counted as given up in the issue.
   - **Reproduce:** `node /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/giveup.mjs` prints `given up: 1 (1 this run)` with 0 pushes. The same applies after a refused (403) period.
   - **Fix:** start the 6-hour clock at the first `later`/`other` failure.

3. **Note: the cost push can make a second request.** src/notify/sender.mjs:176–180 resends after a 413 for the quiet push too. AC78 says it is "tried once a read, with no retry". It is not logged, so there is no privacy leak, but it does not match the text. Excluding `quiet` from the 413 re-send would fix it.

4. **Note: the sender stops at its first step today.** src/config/projects.json has no `push` entry, so `pushConfig` returns null (src/notify/secrets.mjs:30–31) and every run exits 1 with "push … is missing". Notifications cannot work until the owner's public key lands (N1/CS18), as an R3 change. This is a dependency, not a code defect, but it should be in the PR's description.

5. **Note: the "Workflow 4 never reads usage" rule rests only on the secret being absent.** src/notify/costs.mjs:45 and src/notify/sender.mjs:214 read usage in any project whenever `DESK_BILLING_TOKEN` is set. Gating on the project being Service-Desk would enforce J21's "Workflow 3's sender only" in code.

6. **Note: an unreadable-state run rewrites the issue with the memory line alone.** At src/notify/sender.mjs:89–95 the issue is rebuilt from that one line, so "subscription gone" or "refused" lines disappear until the state reads again (the Builder's open item 6). It is acceptable under "any reason the sender can see", but the owner can lose sight of a gone subscription during a GitHub artifact outage.

7. **Note: the J18 lookup's cost.** At src/notify/state.mjs:215–219 the lookup lists artifacts for each of the sender's own successful runs that has none, one request each, up to 100. Unreadable, budget-stop and test runs all add to that, so a long outage costs up to about 100 requests a run. After 100 such runs a forged state turns into "no state" and the sender starts afresh (as J18's one-page rule allows). That is worth stating for the key-rotation case.

8. **Note: a deploy's title is not filtered by where its run came from.** src/notify/collect.mjs:254–257 uses `display_title` for every waiting run. A fork's pull-request run that reached `waiting` would put the fork author's words on the lock screen. Only the main-only rule on the `preview` and `production` environments (Setup N4, checked by CS9) prevents that today. Hardening: require `head_repository` to be this repository, as is done for pull requests.

9. **Note: the build's sender import check has no test.** src/tools/build.mjs:121–142 is not exercised by the test suite. I probed a scratch copy: a bare import, an import from `../functions/` and a dynamic `import('evil')` each fail the build, and the clean tree passes.

10. **Note, process (outside my security scope):**
    - Six orchestrator merge commits, including the head dae0e76 (and efada7e, c72d9c2, f198716, bbf7f0f, a991ea6), are authored and committed as `Claude <noreply@anthropic.com>`. AGENTS.md §1 asks for `orchestrator <orchestrator@agents.invalid>` and no model names in commits. The Builder's commits are correct (`builder@agents.invalid`, with `Agent-Session:` and `Spec: S-001`).
    - `bash governance/checks/check_all.sh . origin/main` fails `record_checks merges` with 21 violations (orchestrator commits with no `Item:` trailer touching reviews/, research/ and docs/). The merge message says "governance checks clean", so the Orchestrator should confirm whether the PR's CI will pass.

## Checked and found sound
- **RFC 8291:** src/notify/webpush.mjs:102–119 follows the key, nonce and record steps exactly, and the test vector matches the Appendix A message.
- **VAPID:** ES256 in ieee-p1363 form, `aud` is the endpoint's origin, `exp` is 2 hours, the header is `vapid t=…, k=…`, and redirects are not followed.
- **The JWT:** stored only sealed under AES-256-GCM with a key derived from the state key. It is minted hourly at most, again only after BadJwtToken once 60 minutes have passed, and again for a new audience.
- **State:**
  - HMAC checked in constant time, with the zip, JSON and key-count limits applied.
  - The lookup takes only the sender's own successful default-branch runs and its own artifact.
  - AC76's dating read passes over a branch's artifact, a fork's and one with no repository id. A page with none that passes, or that read failing, opens the issue at once.
- **The origin check:** the REST read happens before `firstStep`, and the run id is checked to be digits only.
- **Titles and branch names:** used only as data in JSON payloads and never logged; an outside author's pull request gets no title. Git is called with `execFileSync` and no shell.
- **The billing token:** sent only to the three fixed api.github.com usage addresses and never returned by the function (src/lib/github.js:556–567).
- **`test: fail`:** exactly one request, with a key made in that run, sent as `k=`.
- **The rate-limit guard:** decided on the first answer that carries the header; below 300 nothing is sent and nothing is saved.

## Open questions
- Finding 1 needs the Definer to choose the sender's mechanism (the single pull-request read, or the head check), and an owner ruling under the stop rule if the Orchestrator treats it as a spec gap.
- The Workflow 3 file (CS15) is not in this range, so the "no `${{ }}` in `run:`" rule and the job's `if:` gate could only be checked on the program side here.
