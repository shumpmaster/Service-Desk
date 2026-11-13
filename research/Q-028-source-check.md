Verdict: PASS

I re-opened the three sources behind the new and changed items myself (curl, raw text) instead of relying on the earlier round's notes. All three say what the memo claims.

**Confirmed**
- **Changelog 2026-09-25** (raw HTML of github.blog):
  - It says "more accurate count of records when you search by workflow, event, status, branch, or actor. We will continue to return paginated results of up to 1,000 items."
  - It also says "if the number of found records exceeds 2,500, we will report '2,500+'".
  - It advises "narrow your filters (e.g., by adding a date range)".
  - The memo's section 1 and the new entry F-gh-runs-count-cap-01 match.
- **Workflow-runs REST page** (raw HTML of docs.github.com): "up to 1,000 results for each search when using the following parameters: actor, branch, check_suite_id, created, event, head_sha, status". This matches the memo and F-gh-checks-runs-01.
- **actions-attic README** (raw text of README.md):
  - Line 439 says `GET /actions/runs` returns at most 1,000 results per search when filtered by `created`, and the backfill halves a window that reports "1,000 or more".
  - Lines 217–218 say GitHub caps `total_count` at 2,500, and the preflight count halves any window that still reads 2,500.
  - Line 487 gives 2,500 as GitHub's cap on `total_count`.
  - Line 425 says the 800 default leaves headroom under the workflow token's 1,000 requests/hour/repository.
  - So the two caps do different jobs, and the memo's resolution of the apparent contradiction (item 7a) is correct.
- **Filed entries:**
  - `library/facts/F-gh-runs-count-cap-01.md`: grade B, shelf life 6 months, single page for the 2,500+ cap. This fits sources.md: a vendor changelog counts as a documentation page, and a one-page fact is filed "single page" and is not load-bearing. Its note records that the changelog's filter list omits `created`.
  - `library/facts/F-field-actions-attic-02.md`: grade C, supersedes F-field-actions-attic-01, and the old entry was not edited.
  - The other entries the memo cites exist: F-gh-token-limits-02, F-gh-status-list-01, F-gh-actions-price-01, F-gh-actions-included-01, F-gh-trigger-scope-01, F-gh-token-life-01, F-gh-ubuntu-slim-01, F-gh-contents-read-01, F-gh-ruleset-bypass-01, F-gh-annotation-limits-01, F-gh-repo-size-01, F-gh-checks-runs-01 and P-ci-copy-sweep-01.
  - The duplicate F-gh-checkruns-list-01 is not filed.

**Not re-opened this round**
- The earlier-round entries listed above: I checked only that they exist and did not re-open their sources. Their confirmation rests on the earlier round's source check (`research/Q-028-source-check.md`).

**Filed this round**
- Nothing new. Both entries had already been filed with the wording I confirmed, and filing them again would create duplicates.

**Open questions**
- **Memo claims the memo itself marks unconfirmed:**
  - whether the 2,500+ cap applies to `created` searches;
  - the $0 budget default when a payment method is on file;
  - "metadata is always readable";
  - whether `completed` fires on every re-run;
  - whether statuses posted with a workflow token start `status` workflows;
  - whether the workflow token can push to a ref outside `refs/heads/`;
  - whether rulesets apply to such a push;
  - whether the 1,000 requests an hour is shared by all jobs;
  - the annotations-endpoint permission.
- **Wording:** "fewer than 1,000 results can be returned per search" in the memo is awkward, but it is marked as opinion and doesn't change the sweep advice.
- **Commit:** this directory is not a git repository, so I made no commit.