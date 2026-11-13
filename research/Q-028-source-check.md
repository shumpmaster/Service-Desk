Verdict: FAIL

I opened the sources over the network, but only through summarising fetches, not raw HTML. I filed no library entries, because the memo has load-bearing claims that I could not confirm and it has no second source for several proposed entries. The memo (`research/Q-028-memo.md`) is not a groundwork map, so the full check applied.

## Confirmed
These claims match their sources.

- **Event triggers** (events page):
  - `workflow_run` types, glob filter, default-branch requirement and the three-level chain limit.
  - The `workflow_run` quote about secrets and write tokens.
  - The `check_run` / `check_suite` recursion-guard text.
  - The `status` default-branch requirement.
  - Schedule: 5-minute minimum, delay under load, 60-day disabling, default branch.
- **Workflow token**:
  - `GITHUB_TOKEN` page: limited to its own repository, expires at job end, no new runs except `workflow_dispatch` and `repository_dispatch`.
  - Rate-limits page and Actions limits page: 1,000 requests per hour per repository. Secondary limits: 100 concurrent, 900 points per minute, 80 per minute and 500 per hour for content-creating requests.
  - Workflow syntax page: permission keys, and unspecified permissions become `none`.
- **Listing APIs**:
  - Workflow-runs REST: 1,000 results per search, 100 per page, attempts endpoint, 1-minute log link.
  - Statuses REST: newest first, 100 per page, 1,000 per SHA and context.
  - Check-runs REST: 1,000-same-name limit and the response fields.
  - Contents REST: 1 MB / 100 MB tiers, 1,000 files per directory, `ref`, parallel-write conflict.
  - Trees: 100,000 entries / 7 MB.
  - Refs: formats, matching-refs with no ref, and "at least two slashes".
- **Retention changelog** (2026-10-01): "Changing the setting won't restore data."
- **Billing and limits**:
  - Billing page: $12 Free and $18 Pro, 500 MB storage, logs not counted, usage blocked without a payment method, free public-repository runners.
  - Runner pricing page: $0.006 for 2-core, $0.002 for 1-core.
  - Hosted-runners page and changelog: `ubuntu-slim` is 1 vCPU, runs in a container, has a 15-minute limit, and went generally available 2026-01-22.
  - Large-files page: 1 GB / 5 GB advice, 50 MiB warning, 100 MiB block.
  - Repo-limits page: 10 GB, 2 GB push, 3,000 entries, depth 50, 5,000 branches, 6 pushes per minute.
- **Rulesets**: the bypass list includes admins, maintain/write roles, teams, GitHub Apps and Dependabot.
- **actions-attic repository**: MIT, 22 commits, 0 stars, schedule plus dispatch, `refs/attic/archive`, monthly JSONL, 800 requests per hour, one writer, no logs, window halving.
- **actions-attic author's post**: run IDs in attestations can no longer be resolved after expiry.
- **Other C sources**: Willison's `|| exit 0` pattern; the upptime post on late scheduled runs.

## Not confirmed or misattributed
1. **Minute rounding.**
   - The memo quotes "GitHub rounds the minutes and partial minutes…" and cites the Actions billing page and the runner pricing page.
   - The billing page has no such sentence.
   - The runner pricing page does contain the quote, so the claim holds there only.
   - Grade A needs a second page. The view-job-execution-time page says "rounded up to the next minute", which would do, but the memo does not cite it.
   - F-gh-actions-billing-2026-01 should list those pages correctly.
2. **Check suites: "only the 1,000 most recent suites per ref".** The suites REST page, as fetched, did not show this. The `app_id` filter is confirmed. The 1,000-suite limit is unconfirmed, so it stays out of every entry.
3. **Fine-grained "Commit statuses read" permission.** The FG PAT permissions page lists a "Commit statuses" category with read endpoints `commits/{ref}/status` and `commits/{ref}/statuses`. That is a different page from the statuses REST page the memo cites, which only mentions the `repo:status` scope. F-gh-status-list-01 is therefore single-page for that part.
4. **Contents vs Metadata endpoints.**
   - The memo says its fetch put `/commits`, `/compare` and the tarball and zipball endpoints under Metadata, and calls that doubtful.
   - My fetch of the same page put them under Contents.
   - The memo's flag is resolved only in the sense that Contents is the likelier reading. I cannot call it confirmed from a summarised fetch.
5. **Security Lab claim is wrong.**
   - The memo says Security Lab treats `workflow_run` after fork PRs as a known risk that a `branches` filter or an `event_name` check can limit.
   - The page presents `workflow_run` as the recommended safe pattern.
   - Its only mitigation is an `if` on `workflow_run.event == 'pull_request'` and a success conclusion.
   - It does not discuss branch filters.
   - The memo's C-grade claim is misattributed.
6. **Community reliability reports.**
   - Discussion 124010 is about delayed status updates, not `workflow_run` failing to fire.
   - The lightrun page had no relevant content.
   - So the claims that `workflow_run` does not fire after API-started runs and that re-running all jobs does not emit `workflow_run.requested` have no source I could open. They must be dropped or sourced again.
7. **Annotation limits.** Community #68471 gives only "10 per step, 50 per job". The memo's "10 per type per step" and "50 per run" are not in it.
8. **Token lifetime.** The GITHUB_TOKEN page says 6 hours maximum on GitHub-hosted runners and 24 hours on self-hosted. The memo says "refreshed for up to 24 hours on self-hosted" and omits the 6-hour cap.
9. **Budget claim ($0 until a budget is set).** It rests on a search summary of an enterprise page and was not opened by me. It is unconfirmed, so it stays out.
10. **IDs I could not locate as memo sources.** The memo's L-F8 and L-F6 do exist in the library (`library/facts/L-F8.md`, `L-F6.md`); I did not re-open their sources. The same goes for the cited F-gh-* and F-rec-* entries.

## Proposed entries
No entry was filed.
- **Could be filed once re-sourced:** F-gh-trigger-scope-01, F-gh-token-limits-02, F-gh-ubuntu-slim-01, F-gh-repo-size-01 and F-gh-ruleset-bypass-01.
- **F-gh-ruleset-bypass-01** has only one page, so it would carry the "single page" mark and is not load-bearing.
- **F-gh-contents-read-01** is supported by its three REST pages.
- **F-gh-actions-billing-2026-01** needs the rounding source fixed.
- **F-gh-status-list-01** needs the permission wording settled.
- **P-ci-copy-sweep-01** is opinion and rests on those facts.
- **F-field-actions-attic-01** (graded C): confirmed from the repository and the post.

## Open questions
- Should the Researcher fix items 1–9 and resubmit, or should I file the confirmed subset now with those claims removed?
- Does the owner want the fetch limitation accepted for grade A, or should raw pages be pulled?