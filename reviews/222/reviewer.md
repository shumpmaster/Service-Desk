Verdict: PASS

The Reviewer's verdicts on the model 3.6.0 sync (PR #222), verbatim: round 1 at 730f5b6 (FAIL on the body only), then the confirmation after the body edit, at the same head. Recorded by the orchestrator.

## Round 1
Verdict: FAIL

**Summary.** The sync is correct and safe. Both checks are byte-identical to the model at d069e10. The workflow, the charter paragraph and the Reviewer card paragraph match word for word and sit where AC2 says. OPERATING_MODEL_VERSION reads 3.6.0 and nothing else changed. Nothing here breaks: every governance check passes on a simulated merge, trace prints the new step lines, and the desk suite passes 1,181 of 1,181. The FAIL is about the PR body only, and an edit to the body fixes it; no file change is needed. The owner-facing paragraph does not say that one adoption step was skipped (the Chief of Staff's card in the portfolio repository) or what the owner has to do about it. The not-done task says "the owner is asked", but I find that ask in no record.

## Blocking findings

**B1. The owner paragraph leaves out the skipped step, and "the owner is asked" can't be checked.**
- **Evidence:**
  - PR #222 body, line 21: `- [ ] The Chief of Staff's card in the portfolio repository gains its Tasks bullet (S-034 adoption 3) (not done: this session has no access to shumpmaster/portfolio; the owner is asked to grant it or apply the one bullet there)`.
  - The no-access part is true. `gh api repos/shumpmaster/portfolio` returns 403: "GitHub access to this repository is not enabled for this session".
  - The "owner is asked" part has no record behind it. Line 2, the plain paragraph, never mentions the skip or the request. No questions/ file asks it. The only PR comment covers the governance check, not this.
  - AGENTS.md:68 requires the owner paragraph to start "with anything that failed or was skipped". The handoff contract counts an unverifiable claim as a FAIL.
- **Why it matters:** until the card gets its bullet, a Chief of Staff working from its card may file asks PRs without a Tasks section. Those PRs fail pr-body, and asks-merge stalls (see N1).
- **Route:** Orchestrator / Chief of Staff, as an edit to the PR body.
  - Open the "What this means for you" paragraph with the skipped step and the owner's choice: grant this session the portfolio repository, or add the one bullet there themselves (the bullet text is in portfolio-template/CLAUDE.md at d069e10).
  - If that choice counts as a ruling, file it under AGENTS.md:80 as questions/<name>.md. Otherwise keep the ask in the body.
  - Then the not-done reason is true where it says where the work went.

## Non-blocking notes

**N1. asks-merge (adoption step 4).**
- governance/checks/asks_merge.py needs no change. It has no draft test of its own: GitHub's merge API refuses a draft, and the script would log "waits: GitHub refused the merge". It counts every check run on the head, pr-body included (check_state, :226-262). So an asks PR without a valid Tasks section fails safe: it waits and is never merged wrongly.
- No tool or desk code here opens pull requests. The desk only reads GitHub, and its answer link goes through GitHub's new-file page (src/lib/links.js:19). Asks bodies are written by the Chief of Staff session.
- **What must change for asks filings to keep passing pr-body:** every asks or records-only PR body needs a `## Tasks` section after Why with exactly one ticked task, such as `- [x] File the question`, and must be opened ready, not as a draft.
  - The rule is already in AGENTS.md:72, which every session reads.
  - The Chief of Staff's card bullet (portfolio-template/CLAUDE.md, adoption 3) is still missing in the portfolio repository. Until it lands, asks PRs depend on the charter alone.
- Evidence: #214's real asks body, run through the new checker as ready, fails with "there is no '## Tasks' section after the Why section". With `- [x] File the question (AC1)` inserted before its footer, it passes. A stalled asks PR recovers when its body is edited: the edited event re-runs pr-body, and that run triggers asks-merge.

**N2. A file path in the owner paragraph.** Line 2 of the body contains "(reviews/<this PR>/owner.md)". AGENTS.md:68 says no file paths in that paragraph. Moving it below the paragraph would fix this.

**N3. CI can't exercise this PR's own Tasks check.** pr-body.yml checks out the base sha (:21-23), so on #222 CI runs the old 3.5.0 checker, which ignores Tasks. That is why pr-body is green on CI. My local runs with the new checker are the real evidence for item 3. The new event types do apply already, because GitHub takes the workflow file from the merge ref.

**N4. CI's red on #222 is expected.** governance fails only at `review_check pr 222`: the change is R3, and reviews/222/owner.md and reviewer.md are missing. I reproduced this with GOV_BRANCH, GOV_DEFAULT_BRANCH and PR=222 on the simulated merge; every other step passes. The body's task list has no task for the owner's verdict. That is fine, since the owner's verdict is the owner's.

**N5. Adoption step 2 holds.** #222 is the only open PR. The first sync commit (00:10:27Z) is older than the PR (00:11:41Z), so "none was open" is true. There is also an unopened local builder branch, `build/builder/g3-gate-titles` (one commit, da491c2, worktree /home/user/sd-g3). When its PR opens it needs `## Tasks`, and since the repository is public and the branch already holds its first commit, it should open as a draft (AGENTS.md:72).

**N6. Ticked tasks 1 to 5 are all done.** I verified each one; see checks 1 to 5 below.

## Checks run
1. **sha256 comparison** of governance/checks/governance_checks.py and v3_checks.py against the model's tools/ at d069e10: identical (38af9530… and 04473ff8…).
   - The pre-sync copies equalled the model's d069e10~1 copies, so nothing specific to Service-Desk was overwritten.
   - The model's diff since the 3.5.0 sync point (90f53e3) touches exactly these files, plus portfolio-template/CLAUDE.md.
   - govlib.py and check_all.sh are byte-identical to the model as well; Service-Desk has no desk-specific steps in check_all.sh.
2. **pr-body.yml** against template-v3's: identical. The only change is the types line.
3. **AGENTS.md "Tasks (model S-034)" paragraph:** identical to template/AGENTS.md. It sits at :72, after the S-032 paragraph at :70 with one blank line between.
4. **.claude/agents/reviewer.md:** the whole file is identical to template-v3's, and its pre-sync copy equalled the model's previous one. The paragraph closes Duties (:16).
5. **OPERATING_MODEL_VERSION:** `3.6.0\n`.
6. **`check_all.sh . origin/main` on the PR head:** all steps pass except `record_checks merges`, which flags 730f5b6 by orchestrator (no Item: trailer). That is the known local-only artifact.
7. **Simulated merge** (`merge --no-ff … -m "sim (#999)"` as shumpmaster, on origin/main) then `check_all.sh . origin/main`: "OK: all governance checks passed", merges included.
8. **`v3_checks.py trace --root .`:** rc 0, 87 step lines, no "steps not" lines. #74 prints chief-of-staff (6 commits), orchestrator (13), definer (4) and builder (10), all under session_012RJPVKAoLga2RkqLYRDcBY, then reviews/74/reviewer.md and four S-001-trial-view-1 review records. That matches S-034's prototype exactly. Diffed against origin/main's v3_checks output, the only differences are added `step`/`review` lines.
9. **`cd src && npm ci --ignore-scripts && npm test`:** tests 1181, pass 1181, fail 0.
10. **`governance_checks.py pr-body --event` on #222's real body:**
    - draft true: OK.
    - draft false: FAIL only on "- [ ] The Reviewer's verdict recorded in reviews/<this PR>/reviewer.md".
    - no draft field: the same single failure.
11. **Remote state:** `gh api` lists only #222 open (draft, public repo). CI on 730f5b6 shows pr-body, desk-build and owner-signal green and governance red; the cause is in N4.

I created the scratch worktrees under /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/sync36/ and removed them afterwards. The Service-Desk working tree is untouched at 730f5b6.

## Open questions
- Is "grant access to the portfolio repository, or apply the bullet yourself" a ruling that AGENTS.md:80 requires to be filed as a questions/ file, or an action request that can live in the PR body?

## Confirmation (round 2)
Verdict: PASS

**Summary (round 1 plus your fix).** The model 3.6.0 sync in #222 is correct and safe, and the body edit fixes round 1's one blocking finding.
- The two checks are byte-identical to the model at d069e10. The workflow, the charter paragraph and the Reviewer card paragraph match word for word and sit where AC2 says. OPERATING_MODEL_VERSION reads 3.6.0, and nothing else changed.
- Nothing in this repository breaks. Every governance check passes on a simulated merge, trace prints the new step lines, and the desk suite passes 1,181 of 1,181.
- The edited body now opens with the skipped portfolio step and the owner's two choices. It no longer has a file path in that paragraph. Context names where the bullet's text is. The not-done reason now points to an ask that is actually there.
- Under the new checker, the body passes as a draft. As ready, it fails only on the Reviewer task, which is still unticked.
- The head is still 730f5b6, so round 1's checks still apply.

## Blocking findings
None.
- **Round 1's B1 is resolved.** The paragraph now starts "One step was skipped: the Chief of Staff's instructions in your private portfolio repository still need their one new bullet… Either grant this session access to it, or paste the bullet in yourself; its text is under Context." That meets AGENTS.md:68's rule that the paragraph starts with anything skipped.
  - The not-done reason now reads "the owner is asked, in this pull request's opening paragraph and in the session, to grant it or add the one bullet there". The pull-request half is verified. The session half I can't see, but the recorded ask alone is enough.
  - "No access" is still true: `gh api repos/shumpmaster/portfolio` returns 403.
  - The new Context bullet's source is accurate. portfolio-template/CLAUDE.md at d069e10 has the bullet at :20, directly after the session-lines bullet at :19, as AC2 places it.
- **No questions/ file is needed.** I agree with treating this as an action request rather than a ruling: there is nothing to decide beyond doing it.

## Non-blocking notes
- **N1. asks-merge.** governance/checks/asks_merge.py needs no change.
  - It has no draft test of its own; GitHub refuses to merge a draft. It counts every check run on the head, pr-body included (check_state, :226-262), so a bad asks body fails safe: the PR waits and is never merged wrongly.
  - No tool or desk code here opens pull requests. The answer link goes through GitHub's new-file page (src/lib/links.js:19).
  - **What must change for asks filings to keep passing pr-body:** every asks or records-only PR body needs `## Tasks` after Why, with one ticked task, and must be opened ready.
  - AGENTS.md:72 already says this. The Chief of Staff's card bullet is still pending in the portfolio repository.
  - Evidence: #214's real asks body, read as ready, fails with "there is no '## Tasks' section after the Why section". With `- [x] File the question (AC1)` added before its footer, it passes. An edit to the body re-runs pr-body, and that run triggers asks-merge.
- **N2. Round 1's N2 is resolved:** the file path is gone from the paragraph. One small point: the paragraph calls the portfolio repository "private". I can't confirm that, because the 403 hides its visibility. It is harmless.
- **N3. CI can't exercise this PR's own Tasks check.** pr-body.yml checks out the base sha, so CI runs the old 3.5.0 checker on #222. That is why pr-body is green there, including the 00:28:27Z run after the edit. My local runs with the new checker are the evidence.
- **N4. CI's governance red is expected.** It fails only at `review_check pr 222`: the change is R3, and reviews/222/reviewer.md and reviews/222/owner.md are missing. I reproduced this with PR=222, GOV_BRANCH and GOV_DEFAULT_BRANCH on the simulated merge; every other step passes.
- **N5. Adoption step 2 holds.** #222 is the only open PR, and the first sync commit predates it. The local builder branch `build/builder/g3-gate-titles` (da491c2, worktree /home/user/sd-g3) has no PR yet. When its PR opens it needs `## Tasks`, and since the repository is public and the branch already has its first commit, it should open as a draft (AGENTS.md:72).
- **N6. All five ticked tasks are done.** Checks 1 to 5 below show it.
- **N7. Ready-for-review.** When this verdict is filed, tick the Reviewer task before marking the PR ready. The new check will then pass, because the portfolio task's not-done mark explains it.

## Checks run
1. **sha256 against the model's tools/ at d069e10:** governance_checks.py and v3_checks.py are identical (38af9530…, 04473ff8…).
   - The copies before the sync equalled the model's previous ones, so nothing specific to Service-Desk was lost.
   - govlib.py and check_all.sh are identical to the model too.
   - The model's diff since 90f53e3 touches exactly these files, plus portfolio-template/CLAUDE.md.
2. **Word-for-word comparisons:**
   - pr-body.yml is identical to template-v3's.
   - The AGENTS.md paragraph is identical and sits at :72, after the S-032 paragraph at :70.
   - reviewer.md is identical as a whole file, and its paragraph closes Duties (:16).
   - OPERATING_MODEL_VERSION is `3.6.0\n`.
3. **`check_all.sh . origin/main` on the head:** everything passes except `record_checks merges`, which flags 730f5b6 by orchestrator (no Item: trailer). That failure only happens locally, as expected.
4. **Simulated `merge --no-ff` as shumpmaster, then check_all:** "OK: all governance checks passed".
5. **`v3_checks.py trace`:** rc 0, 87 step lines.
   - #74 prints chief-of-staff (6 commits), orchestrator (13), definer (4) and builder (10), all under session_012RJPVKAoLga2RkqLYRDcBY, then five review records. That matches S-034's prototype.
   - Diffed against the old trace, the only changes are added step and review lines.
6. **`npm ci --ignore-scripts && npm test`** in src: 1181 pass, 0 fail.
7. **pr-body, round 1 body:** draft OK; as ready, it fails only on the Reviewer task.
8. **pr-body, edited body (this confirmation), with the head's new checker:**
   - draft true: `OK: pr-body check passed` (rc 0).
   - draft false: `FAIL: pr-body: the pull request is not a draft, but a task is neither ticked nor says why it was not done: "- [ ] The Reviewer's verdict recorded in reviews/<this PR>/reviewer.md"` (rc 1). That is the only finding.
9. **CI on 730f5b6:** pr-body green (both runs), desk-build green, governance red for the reason in N4.

I created the scratch worktrees under /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/sync36/ and removed them afterwards. The Service-Desk working tree is untouched at 730f5b6.

## Open questions
None.
