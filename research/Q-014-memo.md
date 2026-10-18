*Researcher memo for Q-014, recorded verbatim by the Orchestrator on 2026-10-18. Not yet source-checked.*

MEMO: how `workflow_run`-started runs (desk-notify.yml) meet a main-only Environment, and what they can reach
Researcher memo, dated 2026-10-18. Depth: level 2 (official docs, changelog, staff answers, plus direct observation of public pages). Blind: no PROJECT.md, decision cards or leanings seen.

**Bottom line.** A `workflow_run`-started run is a run on the default branch. Its `github.ref` is refs/heads/main, the code is main's workflow file at main's tip, and the REST runs list files it under main. Every desk-notify job is therefore admitted by the `notify` environment's "main only" rule, including jobs triggered by fork pull-request runs. The branch rule gives no protection against untrusted triggers; it is not a gate on where the trigger came from. That gate has to be an explicit `if:` on the triggering run's payload.

### Retrieval note (read first)
- docs.github.com, github.blog and securitylab.github.com did not resolve from this environment. api.github.com returned 403.
- Official docs text was therefore read from the docs' own source files in the github/docs repository (main branch, read 2026-10-18), which docs.github.com is built from. Raw URLs are listed with each source; the published URL is given as well.
- Changelog wording was obtained only through search-index snippets, not by fetching the post. Those items are B, with the exact wording NOT verified.
- The fetch tool limits verbatim quotes to under 125 characters, so long passages are quoted in fragments.
- Two observations (O-1, O-2) are readings of public github.com Actions pages, graded C. Nothing was run.

### Sources (all read 2026-10-18 unless dated otherwise)
- **S1** Events that trigger workflows. https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows (source: https://raw.githubusercontent.com/github/docs/main/content/actions/reference/workflows-and-actions/events-that-trigger-workflows.md)
- **S2** Reusable `branch-requirement`. https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/branch-requirement.md
- **S3** Reusable `workflow-run-permissions-warning`. https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/workflow-run-permissions-warning.md
- **S4** Deployments and environments. https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments (source: https://raw.githubusercontent.com/github/docs/main/content/actions/reference/workflows-and-actions/deployments-and-environments.md)
- **S5** Variables reference, plus reusables `ref-description` and `ref_name-description`. https://raw.githubusercontent.com/github/docs/main/content/actions/reference/workflows-and-actions/variables.md, https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/ref-description.md, https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/ref_name-description.md
- **S6** Secure use reference. https://docs.github.com/en/actions/reference/security/secure-use (source: https://raw.githubusercontent.com/github/docs/main/content/actions/reference/security/secure-use.md)
- **S7** Securely using pull_request_target. https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target (source: https://raw.githubusercontent.com/github/docs/main/content/actions/reference/security/securely-using-pull_request_target.md)
- **S8** Reusable `forked-secrets`. https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/forked-secrets.md
- **S9** Reusable `actions-do-not-trigger-workflows`. https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/actions-do-not-trigger-workflows.md
- **S10** Script injections. https://raw.githubusercontent.com/github/docs/main/content/actions/concepts/security/script-injections.md
- **S11** Changelog, 2025-11-07: "Actions pull_request_target and environment branch protections changes", effective 2025-12-08. https://github.blog/changelog/2025-11-07-actions-pull_request_target-and-environment-branch-protections-changes/ (search snippets only)
- **S12** Community discussion #179107, "Towards a secure by default GitHub Actions". https://github.com/orgs/community/discussions/179107
  - Steve-Glass, 2025-11-07: signs as Senior Product Manager, Actions; Collaborator badge.
  - AllanGuigou, 2025-12-10 and 2025-12-12: his profile shows "GitHub Staff".
- **S13** Changelog, 2026-06-18: "Safer pull_request_target defaults for GitHub Actions checkout". https://github.blog/changelog/2026-06-18-safer-pull_request_target-defaults-for-github-actions-checkout (search snippets only)
- **S14** actions/checkout README (main). https://raw.githubusercontent.com/actions/checkout/main/README.md
- **S15** Community #141195, 2024-10-11, unanswered. https://github.com/orgs/community/discussions/141195
- **S16** Community #66784, 2023-09-11 and 2024-08-19. https://github.com/orgs/community/discussions/66784
- **S17** REST "List workflow runs for a repository", description of the `branch` parameter. Seen via search snippet of https://docs.github.com/en/enterprise-server@3.3/rest/actions/workflow-runs (an old GHES version; not re-read on the current page).
- **O-1** react/react Actions pages, read 2026-10-18:
  - https://github.com/react/react/actions?query=event%3Aworkflow_run+branch%3Amain
  - run https://github.com/react/react/actions/runs/39124227548 (workflow_run)
  - run https://github.com/react/react/actions/runs/39124225328 (pull_request)
  - https://github.com/react/react/commits/main
- **O-2** shumpmaster/Service-Desk Actions pages, read 2026-10-18:
  - https://github.com/shumpmaster/Service-Desk/actions?query=event%3Aworkflow_run, also with `+branch%3Amain` and `+branch%3Acos%2Fnotify-deploys-answer`
  - runs https://github.com/shumpmaster/Service-Desk/actions/runs/39133048850 and https://github.com/shumpmaster/Service-Desk/actions/runs/39133038961
  - commit https://github.com/shumpmaster/Service-Desk/commit/8dd7a7d02d1fd76c4606f14e900ad1269926d6d7

---

### Q1. `github.ref`, `github.ref_name`, the run's `head_branch`, and which code runs
**Direct answer.** All three are the default branch, not the triggering branch. The default branch's workflow file runs, at main's latest commit.

- **F1.1 — fact, A (S1).** In the workflow_run table, `GITHUB_REF` is "Default branch" and `GITHUB_SHA` is "Last commit on default branch". S5 says branch refs take the form `refs/heads/<branch_name>`. So `github.ref` = `refs/heads/main`.
- **F1.2 — fact, A (S5, one-step deduction from F1.1).** `GITHUB_REF_NAME` is "The short ref name of the branch or tag that triggered the workflow run." So `github.ref_name` = `main`.
  - C corroboration (S16, jwerre, 2023-09-11): `github.ref_name` "seems to always be `main` even when I push to the `beta` branch."
- **F1.3 — fact, A (S2, S1).** "This event will only trigger a workflow run if the workflow file exists on the default branch." Together with the `GITHUB_SHA` row, the default branch's YAML runs at main's tip.
  - C corroboration (S16, MAHDTech, 2024-08-19): "workflow_run runs the workflow yaml from the default branch not in the PR".
- **F1.4 — observation, C (O-1, O-2).** The run's own `head_branch`/`head_sha` are main and main's tip. The docs do not say this; it is observed only.
  - O-2: all 89 `workflow_run` runs in Service-Desk appear under the `branch:main` filter. `branch:cos/notify-deploys-answer` gives "0 workflow run results", although the triggering pull_request runs are on `cos/notify-deploys-answer` (run 39133038961, commit b00a23b, PR #103).
  - O-2: asks-merge run 39133048850 shows commit 8dd7a7d, the main merge commit of PR #102.
  - O-1, a fork case: workflow_run run 39124227548 (requested by Shramkoweb) shows commit 098d2e8, which is main's tip (Oct 15). The pull_request run from the same contributor seconds earlier (39124225328) is on `Shramkoweb:fix/rsc-preload-duplicate-35889` at commit f65beeb.
  - A filter on a nonexistent branch returned 0 results, so the `branch:` filter is really applied.
- **F1.5 — fact, A / C.** The triggering run's branch is available only in the event payload.
  - A (S1): "You can access the `workflow_run` event payload that corresponds to the workflow that triggered your workflow."
  - C (S16): the field is `github.event.workflow_run.head_branch`.
- **F1.6 — fact, A (S1).** An `on.workflow_run.branches` filter is matched against the triggering workflow's branch: it says "what branches the triggering workflow must run on".

**Design consequence.** desk-notify must read the origin from `github.event.workflow_run.*` and never from `github.ref`. It can also narrow its triggers at the `on:` level with `branches`/`branches-ignore`.

### Q2. Does a "main only" environment rule admit these jobs? Against which ref? Has it changed?
**Direct answer.** Yes, they are admitted, whatever the triggering run's branch and whether or not it came from a fork. The rule is matched against `GITHUB_REF`, which for `workflow_run` is the default branch.

- **F2.1 — fact, A (S4), verbatim.** "The deployment branch or tag rule is matched against the `GITHUB_REF` of the workflow run." The next sentence points to the per-trigger `GITHUB_REF` values in S1.
- **F2.2 — fact, A (deduction from F2.1 + F1.1, two plain doc statements).** A selected-branches rule of `main` admits every `workflow_run`-started job.
  - The environments page itself never names `workflow_run`. The admission is deduced, not stated.
  - C corroboration (S15, 2024-10-11): a `workflow_run` job triggered from `development`, with an environment limited to `development`, failed with: Branch "main" is not allowed to deploy to development due to environment protection rules. This is the mirror case, and it shows evaluation against main.
- **F2.3 — fact, A (S4), protected-branches mode.**
  - "Only branches with branch protection rules enabled can deploy to the environment."
  - "If no branch protection rules are defined for any branch in the repository, then all branches can deploy."
  - So the job is admitted if main has a protection rule. If no branch has one, every branch is admitted.
  - UNKNOWN: whether a ruleset, as opposed to a classic branch protection rule, counts as "protected" for this mode. S4 says "branch protection rules". `GITHUB_REF_PROTECTED` counts rulesets, but no page ties that to environments.
- **F2.4 — fact, B (S11 via snippets; exact wording not retrieved).** The 2025-11-07 changelog, effective 2025-12-08, says:
  - `pull_request_target` now always takes the workflow file and checkout commit from the default branch.
  - `GITHUB_REF` for `pull_request_target` resolves to the default branch, and `GITHUB_SHA` to its latest commit.
  - Environment branch protection rules for pull-request events are evaluated against the executing ref.
- **F2.5 — fact, B (S12, staff).**
  - Steve-Glass (2025-11-07) describes the goal as "aligning environment policy evaluation with the workflow code that is executed".
  - AllanGuigou (GitHub Staff), 2025-12-12: "Previously with `pull_request` events it was possible to manipulate the HEAD_REF". On 2025-12-10 he said such runs "should now be evaluated against the merge ref as mentioned in the announcement."
  - So pull_request jobs now match `refs/pull/<n>/merge` and no longer the head branch name.
- **F2.6 — UNKNOWN / estimate, C.** No retrieved text says the 2025 change altered `workflow_run`. Two things suggest it did not:
  - S15 (Oct 2024, before the change) already shows evaluation against main.
  - The docs table gives "Default branch".

**Design consequence.** The `notify` environment's main-only rule admits desk-notify on every trigger: `workflow_run`, `push`, `schedule` and `workflow_dispatch` on main. It therefore gives no protection against untrusted triggers. It protects only against the workflow being run from another branch, for example a dispatch on `build/**`.

### Q3. Runs list with `branch=main`: where do `workflow_run`-started runs appear?
**Direct answer.** Under main, at least in the web UI's `branch:` filter (C, observed). The REST equivalence is inferred, not verified.

- **F3.1 — observation, C (O-1, O-2).** See F1.4. Both the repository-wide view and the per-workflow listing (asks-merge in O-2) file `workflow_run` runs under main and under no triggering branch.
- **F3.2 — fact, A (S17; GHES 3.3 page, wording not re-read on the current page).** The REST `branch` parameter: "Returns workflow runs associated with a branch. Use the name of the branch of the `push`."
- **F3.3 — UNKNOWN.** That REST `?branch=main&event=workflow_run` gives the same result as the UI filter is my inference. The API was not reachable.
  - A one-line check for the Orchestrator: compare `gh api 'repos/shumpmaster/Service-Desk/actions/runs?event=workflow_run&branch=main' --jq .total_count` with the same call without `branch`. Then read `.workflow_runs[0].head_branch`.

**Design consequence.** `branch=main` cannot tell main-originated activity from PR-originated activity for `workflow_run` runs. To find runs for a PR branch, query the triggering workflows' runs, which keep the PR branch (O-2, run 39133038961), or use the payload's `head_branch`/`head_sha`.

### Q4. Fork PRs in a public repo: secrets, and GitHub's stated risk
**Direct answer.** Yes. A `workflow_run`-started run has repository secrets and a write-capable token even when the triggering run was a fork PR. By F2.2 it also passes the main-only environment, so it gets the `notify` Environment's secrets.

- **F4.1 — fact, A (S1), verbatim fragments.** "The workflow started by the `workflow_run` event is able to access secrets and write tokens," / "even if the previous workflow was not."
- **F4.2 — fact, A (S8).** In contrast, for runs "triggered from a forked repository", secrets "are not passed to the runner". The exception is `GITHUB_TOKEN`.
- **F4.3 — fact, A (deduction F2.2 + S4: "Secrets stored in an environment are only available to workflow jobs that reference the environment").**
  - A fork-triggered desk-notify job that references `notify` receives its secrets, unless required reviewers are set: "If the environment requires approval, a job cannot access environment secrets until one of the required reviewers approves it."
  - No page states the fork-plus-environment case outright.
- **F4.4 — fact, A (S6), GitHub's statements of the risk, verbatim:**
  - "Avoid using the `pull_request_target` and `workflow_run` workflow triggers with untrusted pull requests or code content."
  - "Workflows that use these triggers must not explicitly check out untrusted code, including from pull request forks"
  - "These workflows are privileged, which means they share the same cache of the main branch"
  - "Workflows triggered on `workflow_run` should treat artifacts uploaded from other workflows with caution."
  - S3 (paraphrase): running untrusted code on `workflow_run` can lead to cache poisoning and unintended write access or exposure of secrets. It links to Security Lab's "Preventing pwn requests".
- **F4.5 — fact, A (S10).** "Less obvious sources of potentially untrusted input, such as branch names". The fields that "typically end with ... `head_ref` ... `name` ... `ref`, and `title`" are listed as untrusted.
  - Opinion, C: `github.event.workflow_run.head_branch`, `display_title` and the PR title in a fork-triggered payload are chosen by the attacker.
- **F4.6 — fact, B (S13 snippets; S14 README read directly).**
  - actions/checkout v7 "refuses to check out fork pull request code by default when the workflow is triggered by `pull_request_target` or `workflow_run`". Per S13, for `workflow_run` this applies when the triggering event is a pull_request* event.
  - The opt-out is the input `allow-unsafe-pr-checkout: true`.
  - S13 says the change is backported on 2026-07-16 to supported major versions, but not to SHA, minor or patch pins.
  - Same-repository PRs are not affected.
- **F4.7 — UNKNOWN.** Not found: whether GitHub's "approve workflows to run" gate for first-time or fork contributors holds back the `workflow_run` `requested` event while the triggering run waits for approval. A (S1): "The `requested` activity type does not occur when a workflow is re-run."

**Design consequence.** Any fork PR author can make desk-notify run with `notify` secrets, on main's code. The code itself is safe, because the YAML comes from main. The exposure is payload injection into `run:`, plus anything desk-notify does with artifacts or checkouts from the triggering run.

### Q5. `schedule` and `workflow_dispatch` on main
**Direct answer.** Yes, confirmed. Both runs carry `GITHUB_REF` = refs/heads/main, so the main-only rule admits them.

- **F5.1 — fact, A (S1).**
  - `schedule`: `GITHUB_REF` is "Default branch"; "Scheduled workflows will only run on the default branch." This agrees with library F-gh-12.
  - `workflow_dispatch`: `GITHUB_REF` is "Branch or tag that received dispatch".
  - `push`: `GITHUB_REF` is "Updated ref".
  - Combined with F2.1, each is admitted when the ref is main (A, one-step deduction).
  - A dispatch on any other branch is refused by the rule (same deduction).
- **F5.2 — fact, A (S9).** "events triggered by the `GITHUB_TOKEN`" / "will not create a new workflow run". The exceptions: "`workflow_dispatch` and `repository_dispatch` events always create workflow runs."
  - Estimate, C (O-2): merge commit 8dd7a7d is authored by github-actions[bot], which suggests asks-merge merges with `GITHUB_TOKEN`.
  - If so, those merges do NOT fire desk-notify's `push` trigger. Only the asks-merge `workflow_run` trigger covers them.
- **F5.3 — fact, A (S1).** "You can't use `workflow_run` to chain together more than three levels of workflows." In S1's six-workflow example, A→B→C→D runs and E and F do not.
  - The governance → asks-merge → desk-notify chain is within this limit.
  - Anything triggered on `workflow_run` of desk-notify would be the next level. If any of the six listed workflows is itself `workflow_run`-triggered at depth, check its depth (UNKNOWN for orchestrator, pr-body, desk-build and desk-deploy, whose triggers I did not see).

### Q6. Can a `workflow_run` job be reliably admitted? Recommended pattern
**Direct answer.** Admission is reliable and documented by deduction: F2.1 with F1.1, graded A, but never stated in one sentence. The problem is the reverse one: admission is unconditional.

GitHub's documented pattern is privilege separation:
- an unprivileged `pull_request` workflow does the untrusted work;
- a privileged `workflow_run` workflow runs only trusted main code and treats every input from the triggering run as untrusted.

- **F6.1 — fact, A (S6).** "For privilege separation between workflows, `workflow_run` is a better trigger." See also F4.4.
- **F6.2 — UNKNOWN / C.** No GitHub doc found prescribes an `if:` on `github.event.workflow_run.head_repository`. Its field name and its meaning for forks are community knowledge (S16, search results). The REST/webhook schema was not readable this session.
- **F6.3 — fact, A (S9, S1).** A `workflow_run` job can start a `workflow_dispatch` on main with `GITHUB_TOKEN`, which "always create[s] workflow runs". That run's `GITHUB_REF` is the dispatch ref.
  - UNKNOWN: the required token permission (expected `actions: write`; not verified this session).
- **Opinion, C (mine, not GitHub's), for desk-notify.**
  - (a) Keep the `notify` environment. Its main-only rule is still useful, because it stops dispatches on `build/**`, `cos/**` and `orch/**` from reaching the secret.
  - (b) Add a job-level `if:` that admits only same-repository triggers, for example `github.event_name != 'workflow_run' || github.event.workflow_run.head_repository.full_name == github.repository`. Optionally add `on.workflow_run.branches` (F1.6) or a branch check if only some origins should notify.
  - (c) Never check out, download or execute anything from the triggering run. If artifacts must be used, treat them as data only.
  - (d) Pass payload fields through `env:`, never as `${{ }}` inside `run:` (S6: "set the value of the expression" into an intermediate environment variable).
  - (e) Do not add required reviewers. They would hold every notification.
  - The dispatch-relay pattern adds no security here: `workflow_run` already runs main's code with secrets. It costs a second run and a token permission. Its only gain is cleaner run listings: `event=workflow_dispatch`, ref main. Use it only if reporting needs that.

---

### Proposed library entries (for the Source checker)

**PROPOSED fact.** Title: workflow_run runs as the default branch, so a branch-limited environment matches main.
- **claim:** "For a run started by on: workflow_run, GITHUB_REF is the default branch and GITHUB_SHA the default branch's last commit. The workflow file must exist on the default branch, and that file runs. An environment's deployment-branch rule is matched against GITHUB_REF, so a 'main only' environment admits workflow_run jobs whatever branch or fork the triggering run came from. The triggering branch is only in github.event.workflow_run. on.workflow_run.branches filters on the triggering workflow's branch."
- **grade:** A (the admission is a one-step deduction from two doc statements; the environments page does not name workflow_run)
- **topics:** [github, automation, security, notifications]
- **shelf_life:** 6 months (GitHub changed adjacent environment and pull_request_target behaviour 2025-12-08 and checkout defaults 2026-06/07)
- **sources:** S1, S2, S4, S5; corroboration S15 (C)

**PROPOSED fact.** Title: workflow_run-started runs are listed under the default branch.
- **claim:** "In the Actions run list, runs started by workflow_run are filed under the default branch (branch:main) at the default branch's tip commit, not under the triggering run's branch. Observed for same-repository and fork triggers. REST ?branch= equivalence not verified."
- **grade:** C (observation)
- **topics:** [github, automation]
- **shelf_life:** 3 months
- **sources:** O-1, O-2, S17
- **note:** Promote to A or B only if a doc or REST check confirms it (F3.3).

**PROPOSED fact.** Title: fork-triggered workflow_run runs get secrets; checkout v7 refuses fork PR code.
- **claim:** "A workflow_run-started workflow can access secrets and write tokens even if the triggering workflow (e.g. a fork pull_request) could not. Environment secrets reach any job that references the environment and passes its rules. GitHub advises not to use workflow_run with untrusted PR code or content, not to check out fork code, and to treat artifacts with caution. actions/checkout v7 refuses fork PR checkout under pull_request_target/workflow_run unless allow-unsafe-pr-checkout: true (backported 2026-07-16 to supported majors, not SHA/minor/patch pins)."
- **grade:** A for the docs parts (S1, S4, S6, S8); B for checkout v7 (S13, S14)
- **topics:** [github, security]
- **shelf_life:** 6 months
- **sources:** S1, S4, S6, S8, S13, S14

**PROPOSED fact.** Title: GITHUB_TOKEN events do not start workflows, except dispatch.
- **claim:** "Events caused by the repository GITHUB_TOKEN (e.g. a push or merge) do not create workflow runs. workflow_dispatch and repository_dispatch always do. Some pull_request types create approval-required runs."
- **grade:** A
- **topics:** [github, automation]
- **shelf_life:** 6 months
- **sources:** S9

**PROPOSED pattern.** Title: privileged notifier on workflow_run.
- **claim:** "Put the credential in an environment limited to main (blocks non-main dispatch), and gate workflow_run jobs with an explicit origin check on github.event.workflow_run (same repository; optionally branch). Never check out or execute triggering-run content. Pass payload fields via env:, not inline ${{ }}."
- **grade:** C (pattern composed from A facts; the origin-check field is community knowledge)
- **topics:** [github, security, notifications]
- **shelf_life:** 6 months
- **sources:** S1, S4, S6, S10; S16 (C)

### Open questions added (not closed)
- **OQ-1.** Does REST `GET /actions/runs?branch=main` return `workflow_run`-started runs, and what is their `head_branch` in JSON? (F3.3; a one-call check.)
- **OQ-2.** Does the fork-contributor approval gate delay or suppress the `workflow_run` `requested`/`completed` event for an unapproved triggering run? (F4.7)
- **OQ-3.** Does the environments "protected branches only" mode count rulesets as protection? (F2.3)
- **OQ-4.** The exact wording of the 2025-11-07 changelog on environment rules, and whether it touched `workflow_run`. (F2.4, F2.6; needs a github.blog fetch.)
- **OQ-5.** Does asks-merge merge with `GITHUB_TOKEN`? If so, desk-notify's `push` trigger never fires for those merges. (F5.2)

No level-5 expert or paid source is needed.
