Verdict: PASS

All four load-bearing claims (F1.1, F2.1, F4.1, F5.2) pass. Each one's quote matches its source word for word, and each has a second, independent source. Nothing the memo grades A failed. One row fails on a citation: F6.2 cites S16 for the field `head_repository`, but S16 never mentions it. That row is graded UNKNOWN/C and is not load-bearing. Three B items rest only on changelog snippets that I could not open (S11, S13). They stay out of the library.

Source check of `research/Q-014-memo.md` (branch orch/s001-notifications), by source-checker, 2026-10-18. Nothing was committed and nothing was filed: under this brief the result goes only to this file.

## How the sources were opened
- **github/docs:** all twelve source files the memo names were fetched again with curl from raw.githubusercontent.com/github/docs/main on 2026-10-18. All returned HTTP 200. I compared the quotes against the raw text, not a summary. Liquid tags (`{% data reusables… %}`) were expanded by also fetching each reusable. I checked the `{% ifversion %}` feature files that apply (`actions-github-token-pull-request-approval`, `actions-ref-protected-ruleset`): both are on for fpt, which is github.com.
- **actions/checkout README** (S14): fetched raw from main.
- **REST description** (S17): taken from github/rest-api-description main, `descriptions/api.github.com/api.github.com.json`, which is the current api.github.com spec.
- **Unreachable:** docs.github.com and github.blog did not resolve (proxy 403 / ENOTFOUND). S11 and S13 could not be opened.
- **github.com pages** (S12, S15, S16, O-1): curl was refused (403). I read them through a summarising fetch, so these matches are that fetch's word-for-word report, as in Q-013.
- **api.github.com:** it worked for shumpmaster/Service-Desk, although the memo found it returned 403. I used it to re-check O-2. It refused react/react ("not enabled for this session"), so O-1 was read through the page fetch instead.

Load-bearing claims are marked **[LB]**.

## Per claim

### Q1
- **F1.1 [LB] — PASS, A.**
  - **S1, workflow_run table:** `GITHUB_SHA` is "Last commit on default branch" and `GITHUB_REF` is "Default branch". Exact.
  - **S5 (ref-description):** "for branches the format is `refs/heads/<branch_name>`". Exact.
  - **Second source, C:** S15's error message, `Branch "main" is not allowed to deploy to development due to environment protection rules.`, comes from a workflow_run job whose trigger was filtered to `development`.
  - **Also C:** my REST re-check of O-2. All 97 `event=workflow_run` runs in Service-Desk have `head_branch: main`.
  - Two independent sources: yes.
- **F1.2 — PASS, A.**
  - **S5 (ref_name-description):** "The short ref name of the branch or tag that triggered the workflow run." Exact.
  - **S16 corroboration, C:** the quote is correct ("it seems to always be `main` even when I push to the `beta` branch.", jwerre, 2023-09-11). The expression jwerre used, though, was `${{ github.head_ref || github.ref_name }}`, not `github.ref_name` alone. It still supports the claim, because `head_ref` is empty for workflow_run, but the memo's wording is a little loose.
- **F1.3 — PASS, A.**
  - **S2:** "This event will only trigger a workflow run if the workflow file exists on the default branch." Exact, and S1 includes it in the workflow_run note.
  - **S16, MAHDTech, 2024-08-19:** "`workflow_run` runs the workflow yaml from the default branch not in the PR". Exact.
- **F1.4 — PASS, C (observation).**
  - **O-2, REST re-check:**
    - Run 39133048850: event workflow_run, head_branch main, head_sha 8dd7a7d0….
    - Run 39133038961: event pull_request, head_branch `cos/notify-deploys-answer`, head_sha b00a23b….
    - `?event=workflow_run&branch=cos/notify-deploys-answer` returns 0.
    - The memo counted 89 runs; there are now 97, all on main. More runs have happened since, which does not affect the claim.
  - **O-1, page fetch:**
    - Run 39124227548 is workflow_run, requested by Shramkoweb, at commit 098d2e8.
    - On react/react `commits/main`, 098d2e8 is the top commit, dated Oct 15.
    - Run 39124225328 is pull_request, on `Shramkoweb:fix/rsc-preload-duplicate-35889`.
    - The page's details did not confirm f65beeb as that run's commit; it appears only in the browser title. This is minor.
- **F1.5 — PASS, A/C.**
  - **S1:** "You can access the `workflow_run` event payload that corresponds to the workflow that triggered your workflow." Exact.
  - **S16:** names `github.event.workflow_run.head_branch` (ChristopherHX, 2023-09-11; MAHDTech, 2024-08-19).
- **F1.6 — PASS, A.**
  - **S1:** "…specify what branches the triggering workflow must run on in order to trigger your workflow." Exact.

### Q2
- **F2.1 [LB] — PASS, A.**
  - **S4:** "The deployment branch or tag rule is matched against the `GITHUB_REF` of the workflow run." Exact. The next sentence links to events-that-trigger-workflows for the `GITHUB_REF` values, as the memo says.
  - **Scope note:** the sentence sits under the "Selected branches and tags" option. That is the option a "main only" rule uses, so the claim holds as applied.
  - **Second sources:**
    - S15 (C): evaluation against "main" for a workflow_run job.
    - S12 (B, staff): Steve-Glass, 2025-11-07, writes "aligning environment policy evaluation with the workflow code that is executed". AllanGuigou, 2025-12-10, writes "evaluated against the merge ref as mentioned in the announcement".
  - Two independent sources: yes.
- **F2.2 — PASS, A (deduction).** Of the two premises, F1.1 passes and F2.1 passes. The S15 error string matches exactly, and S15 is dated 2024-10-11 and unanswered, as the memo says. The memo is right that S4 never names workflow_run.
- **F2.3 — PASS, A.**
  - **S4:** "Only branches with branch protection rules enabled can deploy to the environment." and "If no branch protection rules are defined for any branch in the repository, then all branches can deploy." Both exact.
  - **Ruleset aside:** the `ref_protected` reusable does count rulesets ("`true` if branch protections or rulesets are configured…", feature on for fpt). As the memo says, no page links this to environments, so the item stays UNKNOWN.
- **F2.4 — UNVERIFIABLE, B.** github.blog did not resolve, so S11 could not be opened, and the memo already says its wording is unverified. S12 is the companion discussion, posted by Steve-Glass the same day, 2025-11-07. It supports only the general aim. It does not confirm the three specific changes.
- **F2.5 — PASS, B.**
  - **Steve-Glass:** the clause "aligning environment policy evaluation with the workflow code that is executed" matches. He signs as "Senior Product Manager - Actions", on 2025-11-07.
  - **AllanGuigou, 2025-12-12:** "Previously with `pull_request` events it was possible to manipulate the HEAD_REF" matches; the sentence goes on "and gain unintended access to environment secrets."
  - **AllanGuigou, 2025-12-10:** "should now be evaluated against the merge ref as mentioned in the announcement." matches.
  - **Staff status:** the discussion page shows no Staff badge, but his profile shows "GitHub Staff". That matches the memo's wording ("his profile shows").
  - I did not check the Collaborator badge.
- **F2.6 — PASS as an UNKNOWN/C.** The memo's two supports are confirmed: S15 is dated before the change (Oct 2024), and the S1 table says "Default branch".

### Q3
- **F3.1 — PASS, C.** See F1.4. REST gives the same result as the UI filter.
- **F3.2 — PASS, A.** The current OpenAPI description of `workflow-run-branch` reads: "Returns workflow runs associated with a branch. Use the name of the branch of the `push`." That is exactly the old GHES 3.3 snippet, so the memo's caveat ("not re-read on the current page") is now settled.
- **F3.3 — UNKNOWN in the memo; checked here by observation, C.**
  - `actions/runs?event=workflow_run&branch=main` gives total_count 97.
  - The same query without `branch` also gives 97.
  - The first run's `head_branch` is `main`.
  - For Service-Desk, REST and the UI agree. This answers OQ-1 for this repository, by observation only.

### Q4
- **F4.1 [LB] — PASS, A.**
  - **S1:** "The workflow started by the `workflow_run` event is able to access secrets and write tokens, even if the previous workflow was not." Exact, and both of the memo's fragments are in it.
  - **Second sources:**
    - S3: "granting unintended access to write privileges or secrets".
    - S7 (line 52): "Any event that runs with secrets can introduce a pwn request… For example, an `issue_comment` or `workflow_run` workflow that fetches and runs a fork's pull request code is vulnerable in the same way."
    - S14, the actions/checkout README, a separate GitHub publication: "These triggers run with the base repository's `GITHUB_TOKEN`, secrets, and runner access".
  - Two independent sources: yes.
- **F4.2 — PASS, A.**
  - **S8:** "With the exception of `GITHUB_TOKEN`, secrets are not passed to the runner when a workflow is triggered from a forked repository." Exact.
- **F4.3 — PASS, A (deduction).**
  - **S4:** "Secrets stored in an environment are only available to workflow jobs that reference the environment." and "If the environment requires approval, a job cannot access environment secrets until one of the required reviewers approves it." Both exact.
- **F4.4 — PASS, A.**
  - **S6:** all four quotes are exact (lines 111 and 123 of secure-use.md).
  - **S3:** the paraphrase is accurate. The source says "cache poisoning and granting unintended access to write privileges or secrets" and links "Preventing pwn requests".
- **F4.5 — PASS, A.**
  - **S10:** the source reads "…there are other less obvious sources of potentially untrusted input, such as branch names and email addresses". The memo capitalises "Less"; the meaning is unchanged.
  - The list of field endings is exact: `body`, `default_branch`, `email`, `head_ref`, `label`, `message`, `name`, `page_name`, `ref`, `title`.
- **F4.6 — PARTLY PASS, B.**
  - **PASS, from S14 (opened):** under "# Checkout v7": "checkout now refuses to check out fork pull request code by default when the workflow is triggered by `pull_request_target` or `workflow_run`". The opt-out is "`allow-unsafe-pr-checkout: true`", with Default: false. This text is GitHub's own and was read directly. It could be graded A, but B is not wrong.
  - **UNVERIFIABLE, from S13 (not opened):** the 2026-07-16 backport to supported major versions only (not SHA, minor or patch pins); "same-repository PRs are not affected"; and "applies when the triggering event is pull_request*".
  - The README says "fork pull request code", which implies same-repository PRs are unaffected, but it does not say so.
- **F4.7 — PASS as an UNKNOWN.**
  - **S1:** "The `requested` activity type does not occur when a workflow is re-run." Exact.

### Q5
- **F5.1 — PASS, A.**
  - **S1, schedule:** `GITHUB_REF` is "Default branch", and the note says "Scheduled workflows will only run on the default branch."
  - **S1, workflow_dispatch:** "Branch or tag that received dispatch".
  - **S1, push:** "Updated ref".
  - All exact, and consistent with library F-gh-12.
- **F5.2 [LB] — PASS, A.**
  - **S9:** "…events triggered by the `GITHUB_TOKEN` will not create a new workflow run, with the following exceptions:" and "`workflow_dispatch` and `repository_dispatch` events always create workflow runs." Both exact.
  - **Proposed entry's pull_request sentence:** confirmed. The approval-required exception for `opened`, `synchronize` and `reopened` sits inside `ifversion actions-github-token-pull-request-approval`, which is on for fpt.
  - **Same publisher, not independent:** S9 is also used on github_token.md and trigger-a-workflow.md, but it is the same reusable each time.
  - **Independent second source, C (observation, Service-Desk REST):**
    - Commit 8dd7a7d is on main and authored by github-actions[bot].
    - asks-merge.yml merges with `GH_TOKEN: ${{ github.token }}`.
    - governance.yml runs on `push: branches: [main, …]`, with no path filter.
    - Yet the only runs at that commit are three asks-merge `workflow_run` runs and one governance `workflow_dispatch` run. There is no `push` run.
    - This also confirms the memo's estimate under F5.2, and OQ-5: asks-merge does merge with `GITHUB_TOKEN`.
  - Two independent sources: yes.
- **F5.3 — PASS, A.**
  - **S1:** "You can't use `workflow_run` to chain together more than three levels of workflows." The example is A → B → C → D → E → F, in which E and F do not run. Exact.

### Q6
- **F6.1 — PASS, A.**
  - **S6:** "For privilege separation between workflows, `workflow_run` is a better trigger." Exact.
- **F6.2 — FAIL (citation only; not load-bearing; the claim is UNKNOWN/C).** The memo credits the field name `head_repository` partly to S16. S16 never uses `head_repository`; it names only `github.event.workflow_run.head_branch` and `pull_requests[0].head.ref`. The field therefore rests only on unnamed "search results". The memo's UNKNOWN grade is right, but the S16 citation is wrong.
- **F6.3 — PASS, A.** The S9 quote is exact. The S1 workflow_dispatch `GITHUB_REF` row is exact. The token permission is left UNKNOWN, as the memo says.
- **Opinion (d) — PASS.**
  - **S6:** "…the preferred approach to handling untrusted input is to set the value of the expression to an intermediate environment variable." Exact.

### Sources listed but not cited by any claim
- S7 is listed, but no finding cites it. I opened it, and it supports F4.1 and F4.4 (line 52).

## Proposed library entries
Under this brief nothing is written to `library/`. The rulings below say how each entry should be filed.

1. **workflow_run runs as the default branch, so a branch-limited environment matches main.**
   - Ruling: **file as proposed, grade A.**
   - Sources: S1, S2, S4, S5; S15 (C) and O-2 REST (C) as corroboration. checked_on 2026-10-18, shelf life 6 months.
   - opened_by: source-checker. github/docs raw files were read directly; S15 was read through a summarising fetch.
2. **workflow_run-started runs are listed under the default branch.**
   - Ruling: **file, grade C.**
   - Add a note that a REST check on 2026-10-18 matched the UI: Service-Desk, 97 of 97 runs, `branch=main`, `head_branch: main`. That covers one repository; the claim's own sentence "REST equivalence not verified" can be narrowed to "verified in one repository".
   - S17 is now confirmed against the current OpenAPI spec. Shelf life 3 months.
3. **Fork-triggered workflow_run runs get secrets; checkout v7 refuses fork PR code.**
   - Ruling: **file without the backport clause**, which is "(backported 2026-07-16 to supported majors, not SHA/minor/patch pins)" and rests only on S13, which I could not open.
   - Docs parts: grade A (S1, S4, S6, S8, with S3 and S7 as well).
   - Checkout v7 refusal and `allow-unsafe-pr-checkout`: grade B as proposed, from S14, read directly.
   - Note the backport as not confirmed.
4. **GITHUB_TOKEN events do not start workflows, except dispatch.**
   - Ruling: **file as proposed, grade A.**
   - Source: S9 (fpt). The O-2 observation (C) is corroboration. Shelf life 6 months.
5. **Pattern: privileged notifier on workflow_run.**
   - Ruling: **file, grade C.**
   - Each step rests on a confirmed A fact:
     - an environment limited to main blocks non-main dispatch (S4 with S1);
     - the trigger's origin is read from the payload (S1);
     - never check out triggering-run content (S6);
     - pass values through `env:` (S6).
   - Remove S16 from its sources as support for the same-repository check: S16 does not name `head_repository` (see F6.2). Note that the field name has no source.

## Open questions after this check
- **OQ-1:** settled for Service-Desk by observation (F3.3). It is still open in general.
- **OQ-5:** answered. asks-merge merges with `github.token`, and no `push` run followed commit 8dd7a7d (F5.2).
- **OQ-4:** still open. S11 needs github.blog.
- **OQ-2 and OQ-3:** still open. I did not research them.

Overall: PASS. Every load-bearing claim matched its source exactly and has two independent sources. The one FAIL is a citation slip in the non-load-bearing UNKNOWN row F6.2. Facts resting only on S11 or S13 stay out of the library.
