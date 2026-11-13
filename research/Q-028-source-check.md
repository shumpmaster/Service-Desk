Verdict: FAIL

I fetched the raw HTML of every cited page with curl and searched it for the quoted strings. Most claims are confirmed. The memo (`research/Q-028-memo.md`, revision 2) still overstates some grades and misreads one page, so the memo fails as submitted. I filed the claims that pass, with the corrected grades.

The memo is not a groundwork map, so the full check applied. The directory is not a git repository, so I made no commit.

## Confirmed
- **Round-1 fixes:**
  - 1,000-suites sentence: on the check-runs page, next to the 1,000 same-name limit.
  - Minute rounding: on the runner-pricing page and the view-job-execution-time page.
  - Token lifetime: 6 hours on hosted runners, refreshed up to 24 hours on self-hosted.
  - Budget: "always enforce a hard stop" on the set-up-budgets page.
  - Annotation limits: in `problem-matchers.md`.
  - Security Lab: the `if` guard and the "artifacts … themselves untrusted" line.
  - actions/runner #726: opened 2020-09-29, closed 2023-02-28; the comment lists `check_run:created`, `workflow_run:completed`, `check_run:completed` and no `requested`.
- **Fine-grained permissions page (raw HTML):**
  - Contents (read) covers `/commits`, `/compare`, `/tarball`, `/zipball`, trees, blobs, `git/ref`, `matching-refs` and `contents`.
  - `commits/{ref}/statuses` is under Commit statuses (read).
  - No check-runs entry appears, which is only absence from the page.
- **Other pages:**
  - Rate limits: the rate-limits and Actions-limits pages both give 1,000 per hour per repository.
  - Secondary limits: the rate-limits page gives 100 concurrent, 900 points per minute, and 80 per minute and 500 per hour for content creation.
  - Listing and size limits: workflow-runs, statuses, contents, trees and refs match.
  - Billing: $12/$18, 500 MB, logs not counted, payment-method block, and $0.002/$0.006 per minute match.
  - Schedule: the events page gives the 5-minute minimum, high-load delay and 60-day disabling.
  - Willison's `|| exit 0`: confirmed.
  - Upptime: confirms scheduled runs starting late.
  - Rulesets bypass list: matches.
  - Attic repository: README and post match the memo, apart from the cap noted below.

## Findings that fail the memo
1. **Grade A for F-gh-trigger-scope-01 is unsupported.** The workflow-syntax page has only the glob and `branches` filter. These are on the events page alone:
   - the three-level limit;
   - "requested does not occur on re-run";
   - secrets and write tokens;
   - the `check_run`/`check_suite` exclusion;
   - the default-branch rule.

   The memo's own section marks "requested" as B, then proposes A for the bundle. I filed it as B, single page.
2. **F-gh-token-limits-02 was graded A as a bundle.** Only the 1,000-per-hour figure is on two pages. Lifetime and own-repository scope are on the token page only. The permission keys and "unspecified become none" are on workflow-syntax only. I split it: F-gh-token-limits-02 (A) and F-gh-token-life-01 (B).
3. **Repository limits are misread.**
   - The page says "we recommend staying within the following maximum limits" for 10 GB, 3,000 entries, depth 50, 5,000 branches and 6 pushes per minute.
   - Only push size (2 GB) and single object (100 MB) are "enforced".
   - The memo calls them limits and its own note reads 10 GB as a limit.
   - I filed the corrected wording.
4. **F-gh-ubuntu-slim-01 was graded A as a bundle.** The 15-minute limit and "unprivileged" are on the hosted-runners page only. The general-availability date is on the changelog only. I filed it as B.
5. **F-gh-actions-billing-2026-01 was graded A as a bundle.** The $12/$18 allowance, storage, payment-method block and budget hard stop are each on one page. I split it: F-gh-actions-price-01 (A) and F-gh-actions-included-01 (B).
6. **F-gh-checkruns-list-01 duplicates an existing entry.** The 1,000-suites and 1,000-same-name text is already filed as `library/facts/F-gh-checks-runs-01.md` (Q-027). I did not file it again.
7. **Smaller points:**
   - actions-attic's README gives 2,500 as the cap that triggers window halving. The post and GitHub's docs say 1,000, and the memo says "1,000 or more". The filed note records the discrepancy.
   - Community #68471 says "10 warnings or errors per step, 50 per job" and does not mention notices.
   - The 50-per-run system-annotation line is on the toolkit page, so the memo's "unconfirmed" means unconfirmed in behaviour, not absent from the page. I put it in the entry note only.

## Not confirmed, not filed
- The "$0 budget default" with a payment method on file.
- "Metadata is always read."
- "`completed` fires on every re-run": only the 2020 community report supports it.
- Statuses posted with a workflow token not starting `status` workflows.
- A ref outside `refs/heads/` being pushable with the workflow token and untouched by rulesets.
- Whether jobs share the 1,000-per-hour token limit.
- The annotations-endpoint permission, which the memo says it did not re-check.
- The worked cost table and formula: estimates, not filed.

## Filed (library/)
- **Facts (`library/facts/`):**
  - Grade A: F-gh-token-limits-02, F-gh-status-list-01, F-gh-actions-price-01.
  - Grade B: F-gh-trigger-scope-01, F-gh-token-life-01, F-gh-actions-included-01, F-gh-ubuntu-slim-01, F-gh-contents-read-01, F-gh-ruleset-bypass-01, F-gh-annotation-limits-01.
  - Grade A, with the A holding only for the 100 MiB block: F-gh-repo-size-01.
  - Grade C: F-field-actions-attic-01.
- **Pattern (`library/patterns/`):** P-ci-copy-sweep-01 (C, opinion).

Parts resting on one page carry the single-page, not-load-bearing note in the entry. Each entry's `opened_by` says the raw HTML was fetched.

## Open questions
- Should the Researcher resubmit with the items above corrected? The filed entries already carry the corrected grades.
- Is the 2020–2023 issue #726 enough to keep any re-run-`completed` claim, or should it wait for a GitHub page?
- Can the 2,500-versus-1,000 search-cap discrepancy in actions-attic be resolved from GitHub's own docs?