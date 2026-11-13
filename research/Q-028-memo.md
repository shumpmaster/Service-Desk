I've answered Q-028 in the memo below. I wrote no files because my role has no write tool. The memo is for the Orchestrator to record verbatim as `research/Q-028-memo.md`, and then it goes to the Source checker.

---

# Research memo: Q-028

**Dated 2026-11-13. Researcher. Depth 3. Topics: github, actions, retention, records, ci, billing.**

**How to read the marks.** Each statement is marked **[fact]**, **[estimate]** or **[opinion]**. Grades:
- **A**: two GitHub pages agree.
- **B**: one GitHub page.
- **C**: a secondary or community source.
- **D**: a single unvetted report.

"Summarising fetch" means I read the page through a summarising tool, not its raw HTML. Library entries I build on are cited by ID. None of these facts has been checked by the Source checker yet.

## Summary

1. **One job can copy all three kinds of result.** A job using the repository's own workflow token can read workflow runs, check runs (including those made by apps outside Actions) and commit statuses in its own repository, and can write the copies there. It needs `actions: read`, `checks: read`, `statuses: read` and `contents: write`.
   - No single event trigger sees all three kinds.
   - A **scheduled sweep through the API** sees all three.
   - Event triggers can only reduce the delay before a copy is made; they cannot replace the sweep.
2. **No other credential is needed.** The read-only fine-grained token the desk uses cannot call the Checks API (F-gh-fgpat-limits-01). That does not matter here, because the job uses the workflow token.
3. **The default branch is the worst place for the copies.** It collides with rulesets, required checks and the Orchestrator's own pushes. The two practical choices are:
   - **a dedicated branch**: one API call per file for the desk; or
   - **a ref outside `refs/heads/`**: hidden from branch lists; at least two calls for the desk; rests partly on undocumented behaviour.
4. **Cost:**
   - Public repositories: $0 on standard runners.
   - Private repositories: the cost is minutes, and every job is billed at a minimum of one minute. The account's $12 of included usage a month (GitHub Free) is shared with all other private-repository Actions use, so whether the job fits $0 depends mostly on how often it runs.
5. **Results already past retention cannot be recovered.** A gap is recoverable only while it is shorter than the repository's retention setting.

## 1. Triggers and what they see

### What each trigger fires on

- **[fact, A]** `workflow_run`:
  - fires on `requested`, `in_progress` or `completed` of the workflows named in its `workflows` filter;
  - that filter accepts glob patterns, including `*`, `**` and `!`;
  - it can filter on the branch where the triggering run ran;
  - it fires only if the workflow file exists on the default branch;
  - it "can't … chain together more than three levels of workflows".
  - Sources: [events page](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
- **[fact, B]** A workflow started by `workflow_run` "is able to access secrets and write tokens, even if the previous workflow was not". Source: events page.
- **[fact, C]** `workflow_run` also fires after runs from fork pull requests. GitHub Security Lab treats this as a known risk, which the `branches` filter or an `event_name` check can limit ([Security Lab](https://securitylab.github.com/research/github-actions-preventing-pwn-requests)).
  - **[opinion]** A copier that only reads metadata through the API, and never checks out fork code, is not exposed to that risk.
- **[fact, A]** `check_run` (types `created`, `rerequested`, `completed`, `requested_action`) does not fire "if the check run's check suite was created by GitHub Actions". `check_suite` likewise does not fire for suites created by Actions, or whose head SHA is "associated with GitHub Actions". Both need the workflow file on the default branch. Source: events page.
  - **[opinion]** So `check_run` sees **only checks from apps outside Actions**, and `workflow_run` sees **only Actions runs**. The two complement each other.
- **[fact, B]** `status` fires "when the status of a Git commit changes"; the workflow file must be on the default branch. Source: events page.
- **[fact, A]** Events caused by the workflow token do not start workflow runs, apart from `workflow_dispatch` and `repository_dispatch` (L-F8; [GITHUB_TOKEN page](https://docs.github.com/en/actions/concepts/security/github_token)).
  - **[opinion, inference]** So statuses posted with a workflow token will not fire `status`, and the copier's own commits will not start any runs. The copier therefore needs no guard against recursion on push. No page states the first point directly.
- **[fact, A]** `schedule` (library F-gh-12, F-gh-12b):
  - runs at most every 5 minutes, on the default branch;
  - can be delayed under high load, including at the start of every hour;
  - queued jobs can be dropped;
  - in public repositories, scheduled workflows are disabled after 60 days with no repository activity.

### How reliably they fire

- **[fact, C/D]** Community reports describe:
  - `workflow_run` appearing not to fire, and not starting after runs that were themselves started by the API;
  - "re-run all jobs" not emitting `workflow_run.requested`.
  - Sources: [community search results](https://github.com/orgs/community/discussions/124010), [lightrun summary of an actions/runner issue](https://lightrun.com/answers/actions-runner-re-run-all-jobs-button-does-not-generate-worklow_runrequested-event). Not confirmed by GitHub.
- **[opinion]** Treat every event trigger as a way to copy sooner, not as a guarantee. Correctness should rest on a sweep that runs both on a schedule and on demand (`workflow_dispatch`).
- **[opinion]** A `workflows: ["*"]` filter would also match the copier itself. Exclude it with `!copier-name`, or by checking the name in an `if`. Otherwise every copy run triggers another one, up to the three-level chain limit.

### How far back results can be listed

- **[fact, B]** Workflow runs: `GET /actions/runs` with filters (`created`, `head_sha`, `check_suite_id`, `status` and others), up to 100 per page, and "up to 1,000 results for each search" (F-gh-checks-runs-01; [workflow-runs REST](https://docs.github.com/en/rest/actions/workflow-runs)).
  - **[fact, C]** actions-attic gets past the cap by halving any time window that returns 1,000 or more results.
- **[fact, B]** Check runs can only be listed per commit (`commits/{ref}/check-runs`, `filter=all`) or per check suite. Limits:
  - 1,000 check runs with the same name in a suite, with older ones deleted;
  - only the 1,000 most recent suites per ref.
  - Check suites per ref can be filtered by `app_id`.
  - Sources: [checks runs](https://docs.github.com/en/rest/checks/runs), [checks suites](https://docs.github.com/en/rest/checks/suites).
- **[fact, B]** Commit statuses can only be listed per ref, newest first, 100 per page, with "a limit of 1000 statuses per sha and context" ([statuses REST](https://docs.github.com/en/rest/commits/statuses)).
- **[opinion]** There is no repository-wide list of check runs or statuses. A sweep must list the commits itself, from git history (which does not expire) and from pull-request heads (`refs/pull/N/head`, F-rec-host-refs-01), and then query each SHA.
- **[fact, A]** Anything past retention is gone, and "changing the setting won't restore data" (F-gh-retention-02, F-gh-retention-checks-01). I found no announcement after 2026-10-01 that changes this or the 1–90 / 1–400 day ranges ([changelog 2026-10-01](https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses/)). Catch-up therefore works only for gaps shorter than the retention setting.

### Avoiding duplicate or lost copies

- **[fact, A]** `run_id` stays the same on a re-run, and `run_attempt` goes up by one (F-rec-actions-actor-attempt-01). `GET …/runs/{id}/attempts/{n}` returns a single attempt. Source: workflow-runs REST.
- **[opinion]** Use these keys:
  - workflow runs: (`run_id`, `run_attempt`);
  - check runs: the check-run `id` (a re-run creates new check runs);
  - statuses: the status `id`.
- **[opinion]** Write each copy only when its result is final (`completed`, or a non-`pending` state), and make writes idempotent: a merge that is sorted and de-duplicated. Keep a progress marker (the last swept time window and SHA). A repeated trigger then changes nothing, and a missed trigger is caught by the next sweep.

## 2. Credentials

- **[fact, A]** The workflow syntax lists permission keys `actions`, `checks`, `statuses` and `contents` (and others), each `read`, `write` or `none`. Examples given:
  - `statuses: read` lists statuses for a reference;
  - `checks` covers check runs and suites;
  - `contents: write` can create releases.
  - Unlisted permissions become `none`, except metadata, which is always read (the second point is from a search summary only, C).
- **[fact, B]** The workflow token:
  - reaches only the repository that contains the workflow;
  - expires when the job finishes; on self-hosted runners it can be refreshed for up to 24 hours;
  - has a rate limit of **1,000 requests per hour per repository**.
  - Secondary limits: 100 concurrent requests, 900 points per minute, 80 content-creating requests per minute and 500 per hour.
  - Sources: [rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), [Actions limits](https://docs.github.com/en/actions/reference/limits).
- **[estimate]** If the limit is shared by every job in the repository (as "per repository" suggests), the copier competes with the Orchestrator for the same 1,000 requests an hour. actions-attic caps itself at 800 by default.
- **[fact, A]** Commits pushed with the workflow token start no workflows (L-F8).
- **[opinion]** The workflow token can reach all three kinds of result, so another credential is needed only to push to a branch that a ruleset protects.
  - Rulesets can grant bypass to: repository admins, maintain or write roles, teams, "GitHub Apps" and Dependabot ([rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository); fact, B).
  - Whether the Actions app can be added to that bypass list in a personal-account repository is not documented (open question 3).
- **The alternative credential is a GitHub App installation token** (facts, B):
  - can read check runs (F-gh-app-checks-01);
  - lasts 1 hour, at 5,000 requests per hour (F-gh-app-tokens-02, rate-limits page).
  - Holding it means keeping the App's private key as a repository secret. That key works for every account the app is installed on, never expires, and must be revoked by hand (L-F6).
- **A fine-grained personal token cannot do this job**, because it cannot call the Checks API (F-gh-fgpat-limits-01).

## 3. Where the copies go, and cost

### The places compared

| Place | Collisions | Branch protection and required checks | Desk reading with Contents + Metadata read |
|---|---|---|---|
| File on default branch | Pushes race the Orchestrator's commits. Every copy commit moves the default branch on. | Blocked by a "require pull request" rule unless the copier can bypass it. | 1 call per file (Contents API) |
| Dedicated branch (e.g. `records/ci`) | One writer, kept serial with `concurrency` | Untouched unless a ruleset pattern matches it. Copy commits start nothing. | 1 call per file with `ref=branch`; listing a directory is 1 call |
| Ref outside `refs/heads/` (actions-attic uses `refs/attic/archive`) | Same as a branch | Rulesets target branches and tags, so probably untouched (opinion) | Find the ref's SHA (matching-refs), then Contents with `ref=SHA`: at least 2 calls, or trees and blobs |
| git notes | Awkward to merge | — | As for the ref |
| Wiki / releases | The wiki is a separate git repository with no REST API, so the desk's token cannot read it. Release assets are visible to everyone and notify watchers. | — | Wiki: none. Releases: possible. |

- **[fact, B]** Refs API: `Get a reference` takes `heads/<branch>` or `tags/<tag>`. Listing matching refs with no ref returns "all the references … including notes and stashes". `Create a reference` needs a name starting `refs` with at least two slashes ([git refs](https://docs.github.com/en/rest/git/refs)).
  - **[fact, B; summarising fetch]** git trees, blobs, refs, matching-refs, commits and contents are under the **Contents** read permission ([FG PAT permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens)).
  - The same fetch put `/commits`, `/compare` and the tarball and zipball endpoints under Metadata. That looks doubtful and needs checking.
- **[fact, B]** Contents API:
  - full JSON up to 1 MB;
  - from 1 to 100 MB only with the raw or object media types;
  - not supported above 100 MB;
  - at most 1,000 files per directory;
  - `ref` is a "commit/branch/tag";
  - create/update and delete conflict if used in parallel ([contents](https://docs.github.com/en/rest/repos/contents)).
- **[fact, B]** A recursive tree is limited to 100,000 entries and 7 MB ([trees](https://docs.github.com/en/rest/git/trees)).

### Size limits as copies pile up over years

- **[fact, A/B]** Repository size should be "ideally less than 1 GB, and less than 5 GB is strongly recommended". Files over 100 MiB are blocked, with a warning from 50 MiB ([large files](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)).
- **[fact, B; summarising fetch]** The repository-limits page gives:
  - on-disk size 10 GB;
  - push size 2 GB;
  - 3,000 entries per directory and depth 50;
  - 5,000 branches;
  - 6 pushes per minute per repository.
  - Source: [repo limits](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits).
  - The 10 GB figure differs from the 1 GB / 5 GB figures above and should be checked.
- **[estimate]** Each record is about 0.5–1.5 KB of JSON.
  - Raw growth per year ≈ 365 × (R·b_run + C·b_check + S·b_status), where R, C and S are runs, checks and statuses per day.
  - Example: 50 runs, 150 checks and 20 statuses a day at 1 KB each ≈ 80 MB a year raw, probably 10–20 MB once git compresses it. How GitHub packs repositories on the server is not documented.
- **[opinion]** Shard files by month, or by day, to stay under 3,000 entries per directory and the 1,000-file listing limit. Appending to monthly files rewrites the whole file in each commit. Storing one file per record avoids the rewrite but makes larger trees.

### Running cost (personal account)

- **[fact, A]** Public repositories: standard GitHub-hosted runners are "free and unlimited", and `ubuntu-slim` (1 vCPU, runs in a container, 15-minute job limit, generally available since 2026-01-22) is one of them. Sources: [hosted runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners), [changelog](https://github.blog/changelog/2026-01-22-1-vcpu-linux-runner-now-generally-available-in-github-actions/).
- **[fact, A]** Private repositories:
  - included usage is now stated in dollars: **$12 a month on GitHub Free**, $18 on Pro;
  - Linux 2-core costs **$0.006 per minute**; Linux 1-core costs **$0.002 per minute**;
  - "GitHub rounds the minutes and partial minutes each job uses up to the nearest whole minute";
  - Actions storage covers artifacts and caches only (500 MB on Free); logs do not count;
  - "If your account does not have a valid payment method on file, usage is blocked once you consume the included compute usage."
  - Sources: [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing).
- **[fact, C]** With a payment method on file, spending is limited to $0 until a budget is set. User-level budgets always stop hard. Source: search summary of GitHub's budgets pages; the exact wording was found only on an enterprise page.

**Cost formula (private repository, per month)** **[opinion, from the facts above]**:

- Minutes per month: M = 30 × (J_event + J_sched) × ⌈t⌉
  - J_event = triggered jobs per day (about R_completed + C_third-party + S if every event starts a job);
  - J_sched = scheduled sweeps per day;
  - t = minutes per job.
- Dollars: $ = M × p, where p = $0.006 (2-core) or $0.002 (`ubuntu-slim`).
- The total must fit inside $12 **together with every other private-repository Actions job on the account**: CI and the Orchestrator for both private repositories.
- Requests per sweep ≈ ⌈R/100⌉ + 2 × (distinct SHAs) + writes, which must fit inside the workflow token's 1,000 per hour.

**Worked examples** **[estimate]** (t ≤ 1 minute):

| Setup, per private repository | Minutes / month | 2-core | `ubuntu-slim` |
|---|---|---|---|
| Daily sweep | 30 | $0.18 | $0.06 |
| Hourly sweep | 720 | $4.32 | $1.44 |
| One job per run, 40 runs/day | 1,200 | $7.20 | $2.40 |

What happens at the limit:
- Without a payment method, all private-repository Actions stop, including CI and the Orchestrator.
- The copies then fall behind. They can catch up only if the gap ends within the retention window.

## Lower-priority points

### What a copy keeps and loses

- **[fact, B]** The workflow-run object has `id`, `name`, `run_number`, `run_attempt`, `event`, `status`, `conclusion`, `head_sha`, `head_branch`, `actor`, `triggering_actor`, `created_at`, `updated_at`, `run_started_at`, `html_url` and `head_repository`.
  - **[opinion]** It has no separate end-time field; the end time has to be taken from `updated_at` or from the job records.
- **[fact, B]** A check run has `name`, `status`, `conclusion`, `started_at`, `completed_at`, `head_sha`, `external_id`, `details_url`, `html_url`, `app`, `check_suite`, and `output` (including `annotations_count`). It has no actor field.
- **[fact, B]** A status has `id`, `state`, `context`, `description`, `target_url`, `creator`, `created_at` and `updated_at`. It has no start time and no attempt number.
- **What is lost:**
  - logs, annotations and artifacts;
  - working links: `html_url` and `details_url` stop working once the original expires (P-rec-self-contained-durable-01).

### Logs and annotations

- **[fact, B]** The download link for a run's logs expires after 1 minute. In public repositories logs can be read without signing in.
- **[fact, C]** Annotations are limited to 10 per type per step, 50 per job and 50 per run ([community #68471](https://github.com/orgs/community/discussions/68471)). They can be read through the list-annotations endpoint with `checks: read`.
- **[opinion]** Copying logs into a public repository makes any private detail in them public permanently. Today such detail would expire with retention or could be deleted. Keep logs as a separate decision with a separate cost, limited by the 100 MiB per-file block.

### How others do it, and what went wrong

- **[fact, C]** **actions-attic** (MIT, 22 commits, 0 stars):
  - runs as a nightly schedule plus `workflow_dispatch`, using the workflow token with `actions/checks/statuses: read` and `contents: write`;
  - writes JSONL files per month for runs, checks, statuses and SHAs, plus a manifest, to `refs/attic/archive`, "deliberately not a branch";
  - keeps progress markers at month, time-window and page level;
  - stops at 800 requests per hour.
  - Its stated limits: no log text; "one writer at a time" (writers that run at once race and fail after one retry); the backfill reaches only as far as GitHub still holds data.
  - Sources: [repo](https://github.com/Booyaka101/actions-attic), [author's post, 2026-08-28](https://dev.to/booyaka101/github-starts-deleting-your-actions-run-history-on-october-1-there-is-no-export-button-3ck1).
- **[fact, C]** "Git scraping": scheduled Actions commit data to the repository only when it has changed (`git commit … || exit 0`) ([Willison](https://simonwillison.net/2020/Oct/9/git-scraping/)).
- **[fact, C]** Known failure modes are scheduled workflows that do not run on time ([upptime](https://upptime.js.org/blog/2021/01/22/github-actions-schedule-not-working/)) and the `workflow_run` quirks above.
- **[fact, C]** The author of actions-attic notes that once runs expire, the run IDs cited in npm provenance and SLSA attestations can no longer be checked.

### Which way copies which kinds

| Kind | Default-branch trigger | API sweep with the workflow token |
|---|---|---|
| Actions workflow runs | `workflow_run` | yes |
| Actions check runs | none | yes |
| Third-party check runs | `check_run` / `check_suite` | yes |
| Commit statuses | `status` (not those made with a workflow token) | yes |

## Proposed library entries (for the Source checker)

**Facts:**
- **F-gh-trigger-scope-01** (A, 6 months; github, actions, ci):
  - `check_run` and `check_suite` do not fire for suites created by Actions;
  - `workflow_run` accepts glob `workflows` filters, chains at most 3 levels, and gives secrets and write tokens to the triggered workflow;
  - `check_run`, `check_suite`, `status` and `workflow_run` all need the workflow file on the default branch.
  - Sources: events page, workflow syntax.
- **F-gh-token-limits-02** (B, 6 months; github, actions, records): the workflow token reaches only its own repository, expires at job end, and is limited to 1,000 requests per hour per repository; the permission keys `actions`, `checks`, `statuses` and `contents`. Sources: GITHUB_TOKEN page, rate-limits page, Actions limits page, workflow syntax.
- **F-gh-status-list-01** (B, 12 months; github, ci): statuses are listed per ref only, newest first; 1,000 per SHA and context; fine-grained permission "Commit statuses read". Source: statuses REST.
- **F-gh-actions-billing-2026-01** (A, 6 months; billing, actions):
  - included $12 (Free) / $18 (Pro);
  - $0.006 per minute (2-core), $0.002 per minute (1-core);
  - each job rounded up to a whole minute;
  - standard runners, including `ubuntu-slim`, free on public repositories;
  - storage covers artifacts and caches only, not logs;
  - usage blocked without a payment method.
  - Sources: Actions billing, runner pricing, hosted runners.
- **F-gh-ubuntu-slim-01** (A, 12 months; actions, billing): 1 vCPU, runs in an unprivileged container, 15-minute job limit, generally available 2026-01-22. Sources: changelog, hosted-runners page.
- **F-gh-repo-size-01** (B, 12 months; github, records):
  - repositories ideally under 1 GB, strongly under 5 GB;
  - files blocked above 100 MiB;
  - push size 2 GB, 3,000 entries per directory, 6 pushes per minute;
  - the 10 GB on-disk figure to be checked.
  - Sources: large-files page, repo-limits page.
- **F-gh-contents-read-01** (B, 12 months; github, records):
  - Contents API: 1 MB / 100 MB limits, 1,000 files per directory;
  - recursive trees: 100,000 entries / 7 MB;
  - refs API formats; listing matching refs with no ref returns all refs.
  - Sources: contents, trees and refs REST pages.
- **F-gh-ruleset-bypass-01** (B, 12 months; github): bypass actor types are repository roles, teams, GitHub Apps and Dependabot. Source: rulesets page.
- **F-field-actions-attic-01** (C, 6 months; records, retention, ci): design and stated limits as above. Sources: repository and post.

**Pattern:**
- **P-ci-copy-sweep-01** (C, opinion, 12 months; records, ci, actions): copy results with a sweep (schedule plus manual dispatch), with event triggers only to copy sooner.
  - Key runs by (`run_id`, `run_attempt`), check runs and statuses by `id`.
  - List commits from git history to reach check runs and statuses.
  - Write to a single-writer branch or ref that is not the default branch, using the workflow token, one copier at a time (`concurrency`).
  - Basis: the facts above.

## Questions added (research/_QUESTION.md form, neutral)

1. Does `workflow_run` with type `completed` fire for every re-run attempt of a run, and under which conditions does it not fire?
2. Can the workflow token push to a ref outside `refs/heads/` and `refs/tags/`? Do rulesets, or the 60-day "repository activity" rule for scheduled workflows, take account of such pushes?
3. In a repository owned by a personal account, can GitHub Actions (the workflow token) be added to a ruleset bypass list, and with what effect on required checks?
4. Is the workflow token's limit of 1,000 requests per hour shared by all jobs running at once in a repository?
5. Are commit statuses posted with a workflow token excluded from starting `status`-triggered workflows?

---

**Six-part contract**

1. **What I changed:** No files; my role has no write lane. I produced the memo above.
2. **Why:** To answer Q-028 at depth 3, as my role requires: a graded, sourced memo plus proposed library entries.
3. **What I verified:** I read `research/Q-028.md` and 40-odd library entries on the same topics (retention, checks, tokens, triggers, rate limits). I ran web fetches and searches against GitHub's docs and changelog for:
   - triggers, permissions, the workflow token, rate limits;
   - the checks, statuses, contents, trees and refs APIs;
   - rulesets, repository limits, billing, runner pricing and runners;

   plus the community sources listed. All page reads went through summarising fetches, not raw HTML. I ran no commands and checked none of my own facts.
4. **What is undone:**
   - Three items need raw-page confirmation:
     - the $0-budget wording for personal accounts (found only in a search summary of an enterprise page);
     - the 10 GB versus 1 GB / 5 GB repository-size figures;
     - which endpoints sit under Metadata rather than Contents.
   - The annotation limits rest on a community source only.
   - The five open questions above are unanswered.
5. **Needed outside my lane:** The Orchestrator records the memo, and the Source checker checks it and files the entries that pass. Volumes per repository (runs, checks and statuses per day, and current private-repository minute use) are needed to apply the cost formula; nobody has given them.
6. **Open questions:** The five research questions above. Also: whether the desk can be extended to read a ref outside `refs/heads/` (at least two calls) rather than a branch. This is for whoever designs the change; it is not a research question.