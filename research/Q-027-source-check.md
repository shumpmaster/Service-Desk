Verdict: FAIL

I opened all the cited pages as raw HTML and searched them for the quoted strings. I filed 16 of the 18 proposed entries. Both proposed patterns stay out. The memo also contains one statement that a cited page contradicts, so the verdict is FAIL. A3 and the revision-log row for A3 say the check-run endpoint pages have no fine-grained token box.

**The contradicted statement**
- `memo:20` and `memo:36` say the check-run endpoint pages have no fine-grained token box.
- `rest/checks/runs` has such a box on every endpoint, for example "Fine-grained access tokens for 'Get a check run'".
- Each box lists only "GitHub App user access tokens" and "GitHub App installation access tokens", with "Checks" permission. That supports the A3 conclusion that PATs can't use the Checks API, but the memo's wording is wrong.
- `F-gh-fgpat-limits-01` doesn't repeat the wrong statement, so I filed it.
- Minor wording slip: `memo:19` says the endpoints page has no `notifications` string. The word appears once, as a sidebar menu label. No notifications endpoint is listed.

**Earlier-round failures, now resolved**
- **A2/A3:** confirmed. The endpoints-available page has no `check-runs` or `check-suites`. It does list `/commits/{ref}/status`, `/statuses`, `environments` and `pending_deployments`. The token-management page lists "Using fine-grained personal access token to call the Checks API" as unsupported.
- **A17:** confirmed. The `rest/checks/runs` page has the three sentences with "1000" and no comma, and the string "1,000" is absent from it. The workflow-runs page has "up to 1,000 results". The earlier search for "1,000" was the cause.
- **C5:** confirmed. The `rest/repos/repos` box for "Create a repository dispatch event" says Contents (write) for App user tokens, App installation tokens and fine-grained PATs. The permissions tables agree.

**Confirmed against the pages**
- **Permissions (A1, A3a, B1):** all rows match the fine-grained and App tables. That covers list runs, list PRs, contents, deployments, Metadata for events, pending_deployments write, merge as Contents write, reviews as Pull requests write, and PUT contents with Workflows. Check-run reads are `UAT IAT` with Checks read.
- **Notifications, events, webhooks (A4, A10, A12–A15):** all match the quoted wording. The `deployment_review` and `deployment_protection_rule` entries show GitHub Apps availability only.
- **Retention (A16):** the docs page and the changelog agree on every figure quoted.
- **Environments (B3, B4):** plan limits, six reviewers, one approval, self-review block and the 30-day failure all match. The 30-day failure rule is only on `control-deployments`.
- **Tokens, signing, logs (A7, B6, B8, B9, A18):** matched. A private App can be owned by a personal account (`pubpriv`, "the personal account if the GitHub App is owned by an individual account").
- **RFC 8291 and Cloudflare (D1–D3, B12):** matched. DO jurisdictions are eu, us and fedramp. The KV page has no "jurisdiction" string, which supports the "none stated" claim.
- **Library citations:** `L-F1`, `L-F2`, `L-F5`, `L-F6`, `L-F9`–`L-F12`, `L-P1`, `F-gh-01`, `F-gh-02`, `F-Q004-*`, `F-gh-11`, `F-gh-12`, `F-gh-12b`, `F-cf-cron-01`, `F-webpush-02`–`05` and `LIB-P-a` all exist. They say what the memo uses them for. I did not re-open their sources.

**B2 can be settled.** The "Review pending deployments" box on `rest/actions/workflow-runs` says Deployments (write). The "read access" sentence describes the reviewer's role. The two don't conflict, so memo research question 5 is answered. `F-gh-perm-02` records this.

**Filed** in `library/facts/`, checked on 2026-11-12:
- GitHub: `F-gh-notif-01`, `F-gh-events-02`, `F-gh-perm-02`, `F-gh-fgpat-limits-01`, `F-gh-app-checks-01`, `F-gh-env-01`, `F-gh-retention-01`, `F-gh-webhook-types-01`, `F-gh-webhook-validate-01`, `F-gh-app-tokens-02`, `F-gh-checks-runs-01`, `F-gh-commit-sign-01`, `F-gh-seclog-01`
- Push and Cloudflare: `F-webpush-09`, `F-cf-loc-01`, `F-cf-secrets-01`

**Not filed**
- `P-gh-owner-action-01` and `P-gh-cross-repo-alerts-01` are opinions (grade C).
  - They rest on B14, which the memo admits has no independent source.
  - They also rest on the point at `memo:73` that "proving the owner was present … is not covered by any source I opened".
  - I did not re-open `F-cf-04`, `F-cf-05` or `P-auth-01`, which they cite.
  - They fail the "confirm it says what is claimed" test.

**Open questions**
1. Correct the A3 and revision-log wording (`memo:20`, `memo:36`) and the `notifications` string note in A2. Then the memo can go forward.
2. Several filed entries are single-page B grade. That follows the memo's grading and the library precedent (`L-F5`, `L-F6`). Say if you want a second page for any of them.
3. Open from the memo: whether the 1 Oct 2026 retention change took effect, whether App-token REST commits are signed, and the third-party tool scan (research questions 1–4). I checked none of these.