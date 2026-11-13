Verdict: PASS

I re-opened the sources behind the round-3 changes and they say what the memo claims. I did not re-open the entries filed in earlier rounds. I checked only that they exist, apart from the attic entry I read. They are the facts F-gh-token-limits-02, F-gh-status-list-01, F-gh-actions-price-01, F-gh-trigger-scope-01, F-gh-token-life-01, F-gh-actions-included-01, F-gh-ubuntu-slim-01, F-gh-contents-read-01, F-gh-ruleset-bypass-01, F-gh-annotation-limits-01, F-gh-repo-size-01 and F-field-actions-attic-01, plus the pattern P-ci-copy-sweep-01.

**Confirmed**
- **2,500+ cap (changelog, 2026-09-25):** The raw HTML says that for searches "by workflow, event, status, branch, or actor" GitHub will "continue to return paginated results of up to 1,000 items". If more than 2,500 records are found, it reports "2,500+". The page advises narrowing with "a date range". The memo matches.
- **1,000-result search limit (workflow-runs REST page):** The page says "up to 1,000 results for each search when using the following parameters: actor, branch, check_suite_id, created, event, head_sha, status". The memo matches.
- **Attic 2,500 versus 1,000 (README of the actions-attic project):**
  - Line 439 halves a backfill window that reports "1,000 or more", for the `GET /actions/runs` search cap.
  - Lines 217–218 say GitHub caps `total_count` at 2,500 since 2026-09-25, and the preflight count halves a window that reads 2,500.
  - Lines 486–487 treat 2,500 as the cap on `total_count`.
  - So there are two different caps for two jobs, and the memo's resolution is correct.
- **Attic request limit:** Line 425 says the 800-request default sits under the workflow token's 1,000 requests an hour per repository. This matches the filed entry.
- **Round-2 fixes:** The library holds the revised entries with the grades the memo cites. The duplicate F-gh-checkruns-list-01 is not filed, and F-gh-checks-runs-01 stands.

**Filed**
- `library/facts/F-gh-runs-count-cap-01.md`: grade B, shelf life 6 months. Its note records that the changelog's filter list omits `created`. I did not confirm whether the 2,500+ cap applies to `created` searches.
- `library/facts/F-field-actions-attic-02.md`: grade C, supersedes F-field-actions-attic-01. I did not edit the old entry, so this is the supersession for the memo's proposed note.

**Open questions**
- **Not confirmed, and the memo doesn't claim them:**
  - the $0 budget default with a payment method on file;
  - "metadata is always read";
  - whether `completed` fires on every re-run;
  - statuses posted with a workflow token not starting `status` workflows;
  - the workflow token pushing to a ref outside `refs/heads/`, and rulesets not applying to it;
  - whether all jobs share the token's 1,000-requests-an-hour limit;
  - the annotations-endpoint permission.
- **Memo wording:** "fewer than 1,000 results can be returned per search" is odd, but it is marked as opinion. The sweep advice stands either way.
- **Commit:** This directory is not a git repository, so I made no commit.