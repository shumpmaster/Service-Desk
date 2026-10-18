Verdict: PASS with notes

**For the owner:** Both problems I found in round 1 are fixed, and I re-ran my probes to confirm it. An answer merged in the seconds between the sender's two reads no longer sends a notification for an answered question. An item held back while your phone's subscription was gone is no longer dropped after one "try later". The other code fixes are in place:
- the cost message is tried once;
- only Service-Desk's sender reads your GitHub usage;
- a deploy run from someone else's copy of the repository shows no title on your lock screen;
- the build's import check now has a test.

The secrets checks still hold, and the full test suite passes. Two things remain that need someone other than the Builder, both in the notes below: one governance check on this branch still fails, although the merge message says the checks are clean; and notifications cannot start until your public key is added to the settings file.

What I ran (in /home/user/sd-orch-notify at 6b2b227, which I left unchanged): `npm --prefix src ci && npm --prefix src run build && npm --prefix src test` passes all 652 tests; the log is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev2-suite.log. I re-ran race.mjs and giveup.mjs, and added race2.mjs and recorded.mjs, all in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/. I also ran `governance/checks/check_all.sh . origin/main`.

## Round-1 findings
1. **Merge race: fixed.**
   - src/notify/collect.mjs:118–176: the sender reads `GET pulls/<n>` with the number kept in J18 whenever a recorded answer's pull request has left the open list. It never infers the result from the pull request's absence.
   - race.mjs now gives 0 pushes in the race run, with and without an `Asked in session:` line.
   - race2.mjs, for each outcome of that read:
     - merged: 0 pushes, and the question stays "being recorded";
     - closed unmerged: exactly 1 push, then none;
     - the read failing: the project is "not read" and the last set is kept (AC76);
     - still open but turned into a draft: 1 push.
   - All of these match draft 9's AC77 and J18 text (specs/S-001.md:5085–5091).
2. **The 6-hour give-up after a gone period: fixed.** src/notify/sender.mjs:229 and :240–252 add `retrySince`, which starts only at a try-later or unnamed failure. giveup.mjs now shows the item kept with `retrySince` at the resume, then sent with a 201 at the next run, with nothing given up. The state's form check (src/notify/state.mjs:117–120) accepts the new 3-field entry only for `later` and `other`.
3. **The cost push's 413 re-send: fixed.** src/notify/sender.mjs:176 has `!quiet`, and its test checks that exactly one request is made.
4. **projects.json has no `push`: a dependency, as ruled.** It is still absent, so every run stops at its first step with exit 1 until your public key lands (N1/CS18) in an R3 change.
5. **Usage read for any project with the token set: fixed.**
   - `actionsUsage` now sits in Service-Desk's entry. src/lib/usage.js `usageEntry` and src/notify/costs.mjs `usageConfig(config, project)` gate the read on the project, so Workflow 4's sender reads nothing even with the token set (tested).
   - configcheck.js fails the build when `actionsUsage` is at the top level or in two entries. src/lib/api.js passes only that entry's settings, and readUsage still checks the account name.
6. **Issue lines while the state is unreadable: stated in draft 9 as a known limit.** Accepted.
7. **J18 lookup cost and key rotation: stated in draft 9.** Accepted.
8. **A fork's deploy title: fixed.** src/notify/collect.mjs:295–298 uses the title only when `head_repository` is this repository. Otherwise the message reads "Waits on you: a deploy to approve" (src/notify/words.mjs:29). Tested for a fork and for a missing `head_repository`.
9. **No test for the build's import check: fixed.** tests/desk/notify-build-check.test.mjs runs on a scratch copy and covers a bare import, an import from `../functions/` and a dynamic import.
10. **Merge identity: recorded as a process note** (reviews/S-001-notifications/_orchestrator-merge-identity-note.md). 6b2b227 and eea5739 are authored as `orchestrator <orchestrator@agents.invalid>`. Whether to accept the six older commits is not my call.

## The new things the fixes brought in
- **The sealed number in `recorded`** (src/notify/state.mjs:80–91): it is AES-GCM under its own derived key (label `recorded-pr`), padded and with a random IV. recorded.mjs shows that pull request #4711 does not appear in the state in clear, and that a wrong key cannot open it. A number that cannot be opened is read as "an end found", which is safe because the state is HMAC-checked.
- **The `GET pulls/<n>` read:** it uses a fixed path with an integer number, checks the answer's `number` and `state`, caches one read per run, and a failure counts as `ReadFailed`, so the project is "not read". Drafts are in `model.pulls`, so a pull request turned into a draft takes the "still open" branch, as the code comment says.
- **`actionsUsage` moved:** checked under finding 5 above.
- **`retrySince`:** checked under finding 2 above.

## Notes (none blocking)
- **N1, for the Orchestrator:** `bash governance/checks/check_all.sh . origin/main` still fails `record_checks merges`, now with 25 violations: Orchestrator commits with no `Item:` trailer touching reviews/, research/ and specs/. 6b2b227's message says "guard and governance checks clean". Please confirm what the PR's CI will show.
- **N2:** a recorded answer's pull request that merged while its question stays in the tree (the merge didn't answer it, or a later commit restored the question) keeps the question "being recorded" with no end. It also costs one `GET pulls/<n>` each run. This matches the page's rule in AC77 ("until the tree shows the answer"). It is rare, and stated here only so it is known.
- **N3:** the branch's governance/risk-paths.toml does not yet have main's R3 lines for `src/notify/**` and `src/config/projects.json` (from #108). The branch does not change that file, so the PR's merge result keeps main's R3 rule. No action is needed unless CI is run on the branch alone.

## Open questions
- Workflow 3's file (CS15) is still not in the range, so its `if:` gate and its "no `${{ }}` in `run:`" rule remain checked on the program side only.
