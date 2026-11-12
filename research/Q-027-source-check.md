Verdict: FAIL

I filed no library entries. The memo is not yet fit to file. I fetched raw page HTML for 12 of the roughly 30 cited pages, and three claims failed against it. I did not open the rest: the GitHub App pages, the security log, the commit-signature page, the Cloudflare pages, RFC 8291, `review-deployments` and `control-deployments`. Those claims are unverified. Under the brief an unverifiable claim is a FAIL.

**What the pages say, against the memo**

1. **A2 and A3 are not confirmed, and A3's "conflict" looks wrong.**
   - `memo:19` says the fine-grained-token endpoints page lists check-run read endpoints. In the raw page, the strings `check-runs`, `check-suites` and `/notifications` do not appear.
   - The page lists only `/commits/{ref}/status` and `/statuses`.
   - That agrees with the token-management page, which lists "Using fine-grained personal access token to call the Checks API" among the unsupported cases.
   - So there is probably no conflict, and the memo's reading of the endpoints page is wrong.
   - The proposed entry `F-gh-fgpat-limits-01` (`memo:86`) repeats the false conflict and cannot be filed.
2. **A17 is not confirmed for check runs.**
   - The workflow-runs page does say "up to 1,000 results" for filtered listings, which confirms that part.
   - The checks/runs page contains none of the claims about the 1,000 most recent check suites or the deletion of same-name check runs beyond 1,000.
   - This blocks `F-gh-checks-runs-01` (`memo:92`).
3. **C5 is contradicted.**
   - `memo:66` says the fine-grained permission for `repository_dispatch` was not confirmed.
   - The repos page says: "Contents" repository permissions (write), for fine-grained PATs and for App user and installation tokens.
   - The memo's research question 3 (`memo:105`) is therefore already answered.

**What I confirmed**

- **Notifications (A4):** The page says the endpoints "only support authentication using a personal access token (classic)", and it describes Last-Modified, 304 and X-Poll-Interval. Support for `F-gh-notif-01`.
- **Events (A10):** The timeline holds up to 300 events from the past 30 days, with latency of "30s to 6h". Support for `F-gh-events-02`.
- **Webhook types (A12):** The types-of-webhooks page says "You cannot create webhooks for individual user accounts" and sets a limit of 20 webhooks per event type. Partial support for `F-gh-webhook-types-01`. The App-webhook and App-only-event parts come from other pages I did not open.
- **Token capabilities (B6):** The token-management page says a token has "the same capabilities … that the owner of the token has". It also describes the resource owner.
- **Deploy approvals (B3, B4):** Required reviewers and wait timers are "only available for public repositories" on Free, Pro and Team. The page allows up to six users or teams and says one approval is enough. Support for the first part of `F-gh-env-01`. The self-approval block and the 30-day failure come from pages I did not open.
- **Retention (A16):** The docs page and the 2026-08-27 changelog both say that from October 1, 2026 these policies apply to checks, workflow runs and commit statuses, and that until then they were kept 400+ days. That is two pages from the same publisher, which counts as two sources under `governance/standards/sources.md`. It is a candidate for filing once the rest is settled. I did not confirm the 1–90 and 400-day limits for public and private repositories, or that the change took effect.
- **Fine-grained permission table (A1, B1):** I fetched the fine-grained permissions page but did not run the per-endpoint checks, so `F-gh-perm-02` is unverified. The B2 note on deployment-review wording is also unchecked. The workflow-runs page does say "Anyone with read access to the repository can use this endpoint", but that sentence belongs to the list and get endpoints, not the deployment-review one.

**Open questions**

- Ask the researcher to re-derive A2, A3, A17 and C5 from the raw pages. The memo says its sources were read through a summariser, and these three errors fit that.
- The Cloudflare, RFC 8291, GitHub App and commit-signature entries need a second pass in which I open the pages myself.
- Several proposed entries are graded B with a single page. The standard allows two pages from one vendor only for product-behaviour claims. Claims of cost, risk or quality still need an independent source, and none is listed.