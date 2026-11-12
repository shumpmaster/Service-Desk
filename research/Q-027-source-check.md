Verdict: FAIL

The memo's page claims all check out. One proposed pattern, `P-gh-cross-repo-alerts-01`, cites the wrong library entry for its reason. I fetched the pages myself and did not rely on the earlier round's report or on the memo's wording. I filed nothing new this round. The 16 facts filed last round remain in `library/facts/`.

**Findings I confirmed in the raw HTML**
- **A3:** every endpoint box on `rest/checks/runs` lists only "GitHub App user access tokens" and "GitHub App installation access tokens", with "Checks" permission. The unsupported-uses line "Using fine-grained personal access token to call the Checks API" is on the token-management page. The memo's corrected wording (`Q-027-memo.md:42`, revision log at `:29`) is right.
- **A2 (`:41`):** the endpoints-available page has no `check-runs` or `check-suites` string. It does list `commits/{ref}/status`, `commits/{ref}/statuses` and `pending_deployments`. "Notifications" appears only in the sidebar, so no notifications endpoint is listed. The wording at `:41` matches.
- **A17 (`:57`):** the three "1000" sentences are on `rest/checks/runs`, and the page has no "1,000". `rest/actions/workflow-runs` has "up to 1,000 results".
- **B2 and B1 (`:65-66`):** the "Review pending deployments for a workflow run" box says "Deployments" (write). The fine-grained permissions table lists that POST under "Deployments", write. The "Required reviewers with read access…" sentence describes the reviewer's role, so the two don't conflict.
- **C5 (`:89`):** the "Create a repository dispatch event" box says Contents (write) for App user tokens, App installation tokens and fine-grained PATs.
- **A3a (`:43`):** the App permissions table shows `commits/{ref}/check-runs` as read for UAT and IAT.
- **Other quoted strings found, with page or location:**
  - **A4, A6, A10, A12, A13, A15, A18, B8, B9:** notifications, token-management, events, types-of-webhooks, validating-deliveries, security-log, user-token and commit-signing pages.
  - **A16:** the org retention page and the changelog.
  - **A7:** the installation-token page. The public/private App page has "can only be installed on the account that owns the app" and "the personal account if the GitHub App is owned…".
  - **B3, B4:** the six reviewers, one approval and self-review quotes are on `actions/reference/deployments-and-environments`. "Organizations with GitHub Team and users with GitHub Pro" is on the manage-environments page. The 30-day failure rule is on `control-deployments`.
  - **B12, D2, D3:** the Cloudflare secrets, KV and Durable Object data-location pages. The KV page has no "jurisdiction" string, which supports "none stated".
  - **D1:** RFC 8291. "No HTTP header fields are protected by the content encoding scheme" is in the RFC text, split across a line break.

**Failure**
- **`P-gh-cross-repo-alerts-01` (`Q-027-memo.md:108`):** it says webhooks are backed by a poll "because webhooks are not retried", but cites `F-Q004-3a` for that. In `library/Q-004-facts.md`, `F-Q004-3a` is about delivery delay. The "no automatic redelivery" fact is `F-Q004-1`. As written, the cited source doesn't support the stated reason.

**Not filed**
- **Both patterns:** they are grade C opinions. I have not re-read the library entries that `P-gh-owner-action-01` cites (`L-F1`, `L-F2`, `LIB-P-a`, `F-gh-app-tokens-02`). The ones I did read, `F-cf-05`, `P-auth-01` and `F-gh-perm-02`, say what the pattern uses them for. I'll file `P-gh-owner-action-01` once I've read the rest.
- **`F-gh-retention-01`:** it is correctly marked as not confirming that the 1 Oct 2026 change took effect.

**Open questions**
1. The Researcher needs to change the `P-gh-cross-repo-alerts-01` rationale to cite `F-Q004-1`, then resubmit both patterns.
2. Several filed facts rest on a single GitHub page (grade B). The memo suggests a second source for `F-gh-retention-01` and `F-gh-perm-02`. Should I ask for one?
3. Research questions 1–5 in the memo are still open. I checked none of them.