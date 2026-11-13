I've made revision 3 of the memo. It fixes the seven findings in the source check and lines up with the entries the Source checker already filed in library/. I have no write tool, so the Orchestrator needs to record the memo below as it stands.

---

# Research memo: Q-028 (revision 3)

**Dated 2026-11-13. Researcher. Depth 3. Topics: github, actions, retention, records, ci, billing.**

**How to read the marks.** Each statement is marked **[fact]**, **[estimate]** or **[opinion]**. Grades:
- **A**: two GitHub pages state *this specific part*.
- **B**: one GitHub page, or a GitHub-owned file outside the docs site.
- **C**: a secondary or community source.
- **D**: a single unvetted report.

In this revision, a group of facts gets grade A only if every part of it is on two pages. Otherwise it is graded part by part. I read pages through a summarising fetch. The Source checker re-read the round-2 claims from raw HTML (research/Q-028-source-check.md). Where an entry has already been filed in library/, I cite its ID and follow its wording.

## Changes from revision 2 (answering the round-2 source check)

| # | Checker's finding | What I did |
|---|---|---|
| 1 | Grade A for the trigger facts not supported | Only the glob and `branches` filters are on the workflow-syntax page. Everything else is on the events page alone. Section 1 is now graded part by part, and the entry is proposed at **B**, matching filed F-gh-trigger-scope-01. |
| 2 | Token facts graded A as one group | Split, matching the filed entries. The 1,000 requests an hour per repository is **A** (F-gh-token-limits-02). Lifetime and own-repository scope are **B**, from the token page. Permission keys are **B**, from workflow syntax (F-gh-token-life-01). I added "per REST endpoint" to the 900-points limit. |
| 3 | Repository limits misread | The repository-limits page *recommends* staying within 10 GB, 3,000 entries per directory, depth 50, 5,000 branches and 6 pushes a minute. Only push size (2 GB) and single objects (100 MB) are *enforced*. I corrected the text and the size reasoning. |
| 4 | ubuntu-slim graded A | Now **B** part by part (F-gh-ubuntu-slim-01). |
| 5 | Billing graded A as one group | Split. Prices, rounding and free public use are **A** (F-gh-actions-price-01). The included $12/$18, storage, the block without a payment method and the budget hard stop are **B** (F-gh-actions-included-01). I also fixed my storage wording: caches have their own 10 GB allowance and are not part of the 500 MB. |
| 6 | Proposed check-runs entry duplicates F-gh-checks-runs-01 | Withdrawn. I now cite F-gh-checks-runs-01. |
| 7a | actions-attic's 2,500 versus 1,000 | Settled from GitHub's own pages (new, below). The 1,000 is the cap on *results returned* per filtered search (workflow-runs REST). The 2,500 is the cap on the reported *`total_count`*, which shows as "2,500+" (changelog 2026-09-25). The README uses the two for different jobs: it halves a time window at 1,000, and it treats 2,500 as a lower bound on counts. So there is no contradiction. |
| 7b | Community #68471 does not mention notices | Now quoted as "10 warnings or errors per step, and 50 per job". The notice limit rests on the toolkit file alone. |
| 7c | 50-per-run system-annotation line | It is on the toolkit page. I record it as page text, unconfirmed in behaviour, and leave it out of every claim. |

## Summary

1. **One job can copy all three kinds of result.** A job using the repository's own workflow token can read workflow runs, check runs (including those from apps outside Actions) and commit statuses in its own repository, and write the copies there. It needs `actions: read`, `checks: read`, `statuses: read` and `contents: write`. **[opinion, built on the B facts below]**
   - No single event trigger sees all three kinds.
   - A scheduled sweep through the API sees all three.
   - Event triggers can only shorten the delay before a copy is made.
2. **No other credential is needed** unless the copies go to a place protected by a ruleset. The desk's fine-grained read-only token cannot call the Checks API (F-gh-fgpat-limits-01), but the copier does not use it.
3. **The default branch is the worst place for the copies.** The two practical choices are:
   - a **dedicated branch**: the desk needs one call per file; or
   - a **ref outside `refs/heads/`**: hidden from branch lists; at least two calls for the desk; whether the workflow token can push there and whether rulesets apply are not documented.
4. **Cost:**
   - Public repositories: $0 on standard runners (A).
   - Private repositories: each job is rounded up to a whole minute (A). The $12 of included usage a month on GitHub Free (B) is shared with every other private-repository Actions job on the account. So fitting $0 depends mostly on how often the copier runs.
5. **Results already past retention cannot be recovered** (A). Catching up works only for gaps shorter than the repository's retention setting.

## 1. Triggers and what they see

### What each trigger fires on

- **[fact, B: events page]** [events page](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows):
  - `workflow_run` fires on `requested`, `in_progress` or `completed` of the named workflows;
  - it fires only if the workflow file is on the default branch;
  - it "can't … chain together more than three levels of workflows";
  - the workflow it starts "is able to access secrets and write tokens, even if the previous workflow was not";
  - "The `requested` activity type does not occur when a workflow is re-run."
- **[fact, B: workflow syntax]** The `workflows` filter accepts glob patterns (`*`, `**`, `+`, `?`, `!`), and the event can be filtered by `branches` ([workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)).
- **[fact, C]** actions/runner [#726](https://github.com/actions/runner/issues/726) (opened 2020-09-29, closed 2023-02-28): one "Re-run all jobs" produced `check_run:created`, `workflow_run:completed` and `check_run:completed`, and no `requested`.
  - This is one report. It is **not** a basis for saying `completed` fires on every re-run (open question 1).
- **[fact, C]** GitHub Security Lab recommends `workflow_run` for acting with write access after an untrusted `pull_request` run. Its example guards the job with `if: github.event.workflow_run.event == 'pull_request' && github.event.workflow_run.conclusion == 'success'`. It warns that "Artifacts resulting from untrusted PR data are themselves untrusted" ([Security Lab](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests)).
  - **[opinion]** A copier that only reads metadata through the API, and never downloads artifacts or checks out pull-request code, stays clear of that risk.
- **[fact, B: events page]** `check_run` and `check_suite` do not start workflows if the suite was created by GitHub Actions, or if its head SHA is associated with Actions. Both need the workflow file on the default branch. `status` fires "when the status of a Git commit changes" and also needs the default branch.
  - **[opinion]** So `check_run` sees only checks from apps outside Actions, and `workflow_run` sees only Actions runs.
- **[fact, A]** Events caused by the workflow token do not start workflow runs, apart from `workflow_dispatch` and `repository_dispatch` (L-F8; [GITHUB_TOKEN page](https://docs.github.com/en/actions/concepts/security/github_token)).
  - **[opinion, inference]** So the copier's own commits start nothing.
  - **[opinion, inference]** Statuses posted with a workflow token probably do not fire `status`. No page says so directly (open question 5).
- **[fact, A]** `schedule` (F-gh-12, F-gh-12b):
  - runs at most every 5 minutes, on the default branch;
  - can be delayed under high load;
  - queued jobs can be dropped;
  - in public repositories it is disabled after 60 days with no activity.

### How reliably they fire

- **[fact, C]** Scheduled runs that start late or not at all are reported in practice ([upptime](https://upptime.js.org/blog/2021/01/22/github-actions-schedule-not-working/)).
- **[opinion]** I found no GitHub statement that event delivery is guaranteed.
  - Correctness should rest on a sweep that runs on a schedule and on demand (`workflow_dispatch`); event triggers only copy sooner.
  - A `workflows: ["*"]` filter would match the copier itself. Exclude it with `!copier-name`, or by checking the name in an `if`.

### How far back results can be listed

- **[fact, B]** Workflow runs: `GET /actions/runs` returns "up to 1,000 results for each search when using the following parameters: actor, branch, check_suite_id, created, event, head_sha, status", at up to 100 per page (F-gh-checks-runs-01; [workflow-runs REST](https://docs.github.com/en/rest/actions/workflow-runs)).
- **[fact, B]** **New.** From 2026-09-25, "if the number of found records exceeds 2,500, we will report '2,500+'" for searches by "workflow, event, status, branch, or actor". The changelog adds: "We will continue to return paginated results of up to 1,000 items", and it advises narrowing searches with a date range ([changelog 2026-09-25](https://github.blog/changelog/2026-09-25-changes-to-query-results-in-the-github-actions-api-and-ui)).
  - **[opinion]** So `total_count` cannot be trusted above 2,500, and fewer than 1,000 results can be returned per search. A sweep should split time windows (with `created`) until each returns fewer than 1,000 results.
- **[fact, C]** The actions-attic README says its backfill "halves any window that reports 1,000 or more, recursively". It treats 2,500 as GitHub's cap on `total_count` ("More than 2,500 runs inside a single second count as 2,500, with a warning that the number is a lower bound").
- **[fact, B]** Check runs are listed per commit or per check suite. GitHub keeps at most 1,000 check runs with the same name in a suite. Per ref, it lists check runs from the 1,000 most recent check suites only (F-gh-checks-runs-01; [check runs REST](https://docs.github.com/en/rest/checks/runs)).
  - Check suites can be filtered by `app_id` ([check suites](https://docs.github.com/en/rest/checks/suites)).
- **[fact, A]** Commit statuses are listed per ref only, newest first, 100 per page, with "a limit of 1000 statuses per sha and context" (F-gh-status-list-01).
- **[opinion]** There is no repository-wide list of check runs or statuses. A sweep must list commits from git history and from pull-request heads (`refs/pull/N/head`, F-rec-host-refs-01), then query each SHA.
- **[fact, A]** Data past retention is gone, and "changing the setting won't restore data" (F-gh-retention-02, F-gh-retention-checks-01; [changelog 2026-10-01](https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses/)). I found no later change to this or to the 1–90 and 1–400 day ranges.

### Avoiding duplicate or lost copies

- **[fact, A]** `run_id` stays the same on a re-run, and `run_attempt` goes up by one (F-rec-actions-actor-attempt-01). `GET …/runs/{id}/attempts/{n}` returns a single attempt.
- **[opinion]** Use these keys:
  - workflow runs: (`run_id`, `run_attempt`);
  - check runs: the check-run `id`;
  - statuses: the status `id`.
- **[opinion]** Write a copy only when the result is final. Merge writes so they are sorted and de-duplicated, and keep a progress marker (the last swept window and SHA). A repeated trigger then changes nothing, and the next sweep catches a missed one.

## 2. Credentials

- **[fact, B: workflow syntax]** The permission keys include `actions`, `checks`, `contents` and `statuses`, each `read`, `write` or `none`. If any permission is set, every unlisted one becomes `none` (F-gh-token-life-01).
  - That metadata is always readable rests on a search summary only and is not claimed.
- **[fact, B: token page]** The workflow token (F-gh-token-life-01):
  - reaches only the repository that holds the workflow;
  - "expires when the job finishes or after its effective maximum lifetime": 6 hours on GitHub-hosted runners;
  - on self-hosted runners it "can only be refreshed for up to 24 hours".
- **[fact, A]** Rate limits (F-gh-token-limits-02; [rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), [Actions limits](https://docs.github.com/en/actions/reference/limits)):
  - the workflow token is limited to 1,000 requests an hour per repository.
  - **[fact, B: rate-limits page]** Secondary limits:
    - 100 concurrent requests;
    - 900 points a minute per REST endpoint;
    - 80 content-creating requests a minute and 500 an hour.
- **[estimate]** If the limit is shared within the repository, the copier competes with the Orchestrator for it (open question 4). actions-attic caps itself at 800 requests by default.
- **[opinion]** Another credential is needed only to push to a place protected by a ruleset.
  - **[fact, B, single page]** Rulesets can grant bypass to repository roles, teams, GitHub Apps and Dependabot (F-gh-ruleset-bypass-01).
  - Whether Actions can be on that list in a personal-account repository is open question 3.
- **[fact, B]** A GitHub App installation token can read check runs, lasts 1 hour, and allows 5,000 requests an hour (F-gh-app-checks-01, F-gh-app-tokens-02).
  - Holding one means keeping the app's private key as a repository secret. The key works for every installation, never expires, and must be revoked by hand (L-F6).
- **[fact, B]** A fine-grained personal token cannot call the Checks API (F-gh-fgpat-limits-01). The fine-grained permissions page has no entry for `check-runs`, but that is only absence from the page.

## 3. Where the copies go, and cost

### The places compared

| Place | Collisions | Branch protection and required checks | Desk reads with Contents read |
|---|---|---|---|
| File on default branch | Races the Orchestrator's commits | Blocked by a "require pull request" rule unless the copier can bypass it | 1 call per file |
| Dedicated branch | One writer, kept serial with `concurrency` | Untouched unless a ruleset pattern matches it | 1 call per file with `ref=`; listing a directory is 1 call |
| Ref outside `refs/heads/` (e.g. `refs/attic/archive`) | As for a branch | Probably untouched (opinion; open question 2) | Find the ref's SHA with matching-refs, then Contents with `ref=SHA`: at least 2 calls |
| git notes | Awkward to merge | — | As for a ref |
| Wiki / releases | The wiki is a separate git repository with no REST API. Release assets are public and notify watchers. | — | Wiki: none. Releases: yes. |

- **[fact, B]** The fine-grained permissions page lists `/commits`, `/compare`, tarball, zipball, trees, blobs, `git/ref`, `git/matching-refs` and `/contents` under Contents (read). It lists `commits/{ref}/statuses` under Commit statuses (read) (F-gh-contents-read-01).
- **[fact, B]** Contents and Git APIs (F-gh-contents-read-01):
  - Contents API: full JSON up to 1 MB; 1–100 MB only with the raw or object media types; at most 1,000 files per directory;
  - writes to the Contents API conflict if made in parallel;
  - recursive trees: up to 100,000 entries and 7 MB;
  - `Create a reference` needs a name that starts with `refs` and has at least two slashes.

### Size as copies pile up over years

- **[fact, A for the 100 MiB block only; the rest B]** (F-gh-repo-size-01):
  - Files over 100 MiB are blocked; this is on two pages. The large-files page warns from 50 MiB, and the repository-limits page says single objects are "enforced at 100 MB".
  - The large-files page advises repositories "ideally less than 1 GB, and less than 5 GB is strongly recommended".
  - The repository-limits page "recommend[s] staying within" these maximums, which are **not enforced**: 10 GB on disk, 3,000 entries per directory, depth 50, 5,000 branches and 6 pushes a minute per repository.
  - It **enforces** push size at 2 GB.
- **[estimate]** Each record is about 0.5–1.5 KB of JSON.
  - Raw growth per year ≈ 365 × (R·b_run + C·b_check + S·b_status), where R, C and S are runs, checks and statuses per day.
  - Example: 50 runs, 150 checks and 20 statuses a day at 1 KB each ≈ 80 MB a year raw, probably 10–20 MB after git compression.
  - Either way this is far below the 1 GB advisory level for decades. The binding limits are per-file and per-directory.
- **[opinion]** Shard files by month to stay under the 1,000-file listing limit and the recommended 3,000 entries per directory. Monthly files are rewritten on each append, while one file per record makes larger trees. One copy commit per sweep keeps well under 6 pushes a minute.

### Running cost (personal account)

- **[fact, A]** Prices and rounding (F-gh-actions-price-01):
  - standard GitHub-hosted runners are free and unlimited on public repositories;
  - Linux 2-core costs $0.006 a minute and Linux 1-core (`ubuntu-slim`) $0.002 a minute;
  - each job is rounded up to a whole minute ([runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing); [view job execution time](https://docs.github.com/en/actions/how-tos/monitor-workflows/view-job-execution-time)).
- **[fact, B]** Included usage and limits (F-gh-actions-included-01; [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [set up budgets](https://docs.github.com/en/billing/how-tos/set-up-budgets)):
  - included compute is $12 a month on GitHub Free and $18 on Pro;
  - artifact storage is 500 MB on Free and 1 GB on Pro;
  - caches have their own 10 GB allowance;
  - logs and job summaries do not count towards storage;
  - "If your account does not have a valid payment method on file, usage is blocked once you consume the included compute usage";
  - user-level budgets "always enforce a hard stop".
  - Whether spending defaults to $0 when a payment method is on file is **not confirmed**, and I make no claim about it.
- **[fact, B]** `ubuntu-slim` (F-gh-ubuntu-slim-01):
  - 1 CPU, running in a container (two pages);
  - unprivileged, 15-minute job limit (hosted-runners page);
  - generally available since 2026-01-22 (changelog).

**Cost formula (private repository, per month)** **[opinion, from the facts above]**:

- Minutes per month: M = 30 × (J_event + J_sched) × ⌈t⌉
  - J_event = jobs started by events per day;
  - J_sched = scheduled sweeps per day;
  - t = minutes per job.
- Dollars: $ = M × p, where p = $0.006 (2-core) or $0.002 (`ubuntu-slim`).
- The total must fit inside $12 together with every other private-repository Actions job on the account.
- Requests per sweep ≈ ⌈R/100⌉ + 2 × (distinct SHAs) + writes, which must stay under 1,000 an hour.

**Worked examples** **[estimate]** (t ≤ 1 minute):

| Setup, per private repository | Minutes / month | 2-core | `ubuntu-slim` |
|---|---|---|---|
| Daily sweep | 30 | $0.18 | $0.06 |
| Hourly sweep | 720 | $4.32 | $1.44 |
| One job per run, 40 runs a day | 1,200 | $7.20 | $2.40 |

What happens at the limit:
- **[fact, B]** Without a payment method, all private-repository Actions usage is blocked, including CI and the Orchestrator.
- **[opinion]** The copies then fall behind. They can catch up only if the gap ends within the retention window.

## Lower-priority points

### What a copy keeps and loses

- **[fact, B]** The fields each record has:
  - **Workflow run:** `id`, `name`, `run_number`, `run_attempt`, `event`, `status`, `conclusion`, `head_sha`, `head_branch`, `actor`, `triggering_actor`, `created_at`, `updated_at`, `run_started_at`, `html_url` (workflow-runs REST).
    - **[opinion]** It has no end-time field; use `updated_at` or the job records.
  - **Check run:** `name`, `status`, `conclusion`, `started_at`, `completed_at`, `head_sha`, `details_url`, `html_url`, `app`, `output.annotations_count`. It has no actor field.
  - **Status:** `id`, `state`, `context`, `description`, `target_url`, `creator`, `created_at`, `updated_at`. It has no start time and no attempt number.
- **What is lost:**
  - logs, annotations and artifacts;
  - working links: `html_url` and `details_url` stop working once the original expires (P-rec-self-contained-durable-01).

### Logs and annotations

- **[fact, B]** The download link for a run's logs expires after 1 minute (workflow-runs REST).
- **[fact, B]** The actions/toolkit `problem-matchers.md` (a GitHub-owned file) gives "10 warning annotations, 10 error annotations, and 10 notice annotations per step" and "50 annotations per job" (F-gh-annotation-limits-01).
  - **[fact, C]** Community #68471 agrees on "10 warnings or errors per step, and 50 per job" but does not mention notices.
  - The same toolkit file lists 50 system annotations per run. That is page text only, not confirmed in behaviour, and not relied on.
  - Whether `checks: read` covers the annotations endpoint was not re-checked.
- **[opinion]** Copying logs into a public repository makes any private detail in them public permanently. Keep logs as a separate decision, with its own cost and the 100 MiB file block.

### How others do it, and what went wrong

- **[fact, C]** actions-attic (F-field-actions-attic-01):
  - a nightly schedule plus `workflow_dispatch`, using the workflow token;
  - writes monthly JSONL files to `refs/attic/archive`, "deliberately not a branch";
  - stops at 800 requests and keeps no log text;
  - "One writer at a time": writers that run at once race and fail after one retry.
  - It is a single project, and the post is by the same author. The author notes that run IDs cited in npm provenance and SLSA attestations can no longer be checked once the runs expire.
- **[fact, C]** In "git scraping", scheduled Actions commit only when the data has changed (`|| exit 0`) ([Willison](https://simonwillison.net/2020/Oct/9/git-scraping/)).
- **[fact, C]** Known failure modes:
  - late or missed scheduled runs (upptime);
  - no `requested` event on re-runs (#726; the events page states this at B).

### Which way copies which kinds

| Kind | Default-branch trigger | API sweep with the workflow token |
|---|---|---|
| Actions workflow runs | `workflow_run` | yes |
| Actions check runs | none | yes |
| Third-party check runs | `check_run` / `check_suite` | yes |
| Commit statuses | `status` (probably not those made with a workflow token) | yes |

## Proposed library entries

These are all filed already in the Source checker's wording. I propose no changes except the one new entry and one note.

- **Filed; I agree with the grades:**
  - F-gh-trigger-scope-01 (B)
  - F-gh-token-limits-02 (A)
  - F-gh-token-life-01 (B)
  - F-gh-status-list-01 (A)
  - F-gh-actions-price-01 (A)
  - F-gh-actions-included-01 (B)
  - F-gh-ubuntu-slim-01 (B)
  - F-gh-contents-read-01 (B)
  - F-gh-ruleset-bypass-01 (B)
  - F-gh-annotation-limits-01 (B)
  - F-gh-repo-size-01 (A for the 100 MiB block only)
  - F-field-actions-attic-01 (C)
  - P-ci-copy-sweep-01 (C, opinion)
- **Withdrawn:** F-gh-checkruns-list-01, which duplicates F-gh-checks-runs-01.
- **New: F-gh-runs-count-cap-01** (B, 6 months; github, actions, ci):
  - from the 2026-09-25 changelog: searches of workflow runs by workflow, event, status, branch or actor report "2,500+" once more than 2,500 records match;
  - "We will continue to return paginated results of up to 1,000 items";
  - date ranges are advised to narrow results.
  - Source: [changelog](https://github.blog/changelog/2026-09-25-changes-to-query-results-in-the-github-actions-api-and-ui). Single page.
- **Proposed note for F-field-actions-attic-01:** the discrepancy is resolved. The README halves windows at 1,000 results, matching the workflow-runs page, and uses 2,500 as the `total_count` cap, matching the 2026-09-25 changelog.

## Questions added (research/_QUESTION.md form, neutral)

1. Does `workflow_run` with type `completed` fire for every re-run attempt, including "re-run failed jobs", and when does it not?
2. Can the workflow token push to a ref outside `refs/heads/` and `refs/tags/`? Do rulesets, or the 60-day activity rule for scheduled workflows, take account of such pushes?
3. In a personal-account repository, can GitHub Actions be added to a ruleset bypass list, and with what effect on required checks?
4. Is the workflow token's 1,000 requests an hour shared by all jobs in a repository?
5. Are commit statuses posted with a workflow token excluded from starting `status`-triggered workflows?

---

**Six-part contract**

1. **What I changed:** The memo is now revision 3.
   - I regraded the trigger facts, the `ubuntu-slim` facts and the included-usage facts to B, part by part.
   - I split the token facts and the billing facts the same way the checker filed them.
   - I corrected the repository limits: most are recommended maximums, and only the 2 GB push and the 100 MB object are enforced.
   - I fixed the storage wording (caches have their own 10 GB) and added "per REST endpoint" to the secondary limit.
   - I withdrew the duplicate check-runs entry and fixed the wording of community #68471.
   - I settled the 2,500 versus 1,000 question and proposed one new entry, F-gh-runs-count-cap-01.
2. **Why:** The round-2 source check failed the memo for grading groups of facts as A when parts were on one page only, for misreading the repository limits, and for a duplicate entry. Each grade now matches the pages that actually state the part.
3. **What I verified:** I ran no commands; my role has no shell. All checks were summarising fetches:
   - the actions-attic README: it halves at "1,000 or more" and calls 2,500 "GitHub's 2,500 cap on `total_count`";
   - the workflow-runs REST page: "up to 1,000 results for each search", including with `created`;
   - the 2026-09-25 changelog: the "2,500+" sentence, the 1,000-item results, and the advice to use date ranges;
   - the filed library entries, which I read to match their wording.
4. **What is undone:**
   - I did not read anything from raw HTML myself.
   - The new changelog fact still needs the Source checker's check.
   - The changelog does not list `created` among the filters it covers; I did not look into that.
   - Still unconfirmed: the $0 default with a payment method on file, "metadata is always read", the annotations-endpoint permission, and the five open questions.
5. **Needed outside my lane:**
   - The Orchestrator records this memo.
   - The Source checker checks F-gh-runs-count-cap-01 and the proposed note for F-field-actions-attic-01.
   - The cost formula needs the volumes for each repository: runs, checks and statuses per day, and the current private-repository minutes.
6. **Open questions:**
   - The five research questions above.
   - Whether issue #726 alone may support any claim about `completed` on re-runs; I have kept it at C and not relied on it.

Sources:
- [actions-attic repository](https://github.com/Booyaka101/actions-attic)
- [Workflow runs REST](https://docs.github.com/en/rest/actions/workflow-runs)
- [Changes to query results in the GitHub Actions API and UI (2026-09-25)](https://github.blog/changelog/2026-09-25-changes-to-query-results-in-the-github-actions-api-and-ui)
- [devopsboys: GitHub Actions API returns 2,500+](https://devopsboys.com/blog/github-actions-api-2500-workflow-runs-query-change) (search result only; not relied on)
- Revision-2 sources as cited inline above, re-checked from raw HTML by the Source checker.