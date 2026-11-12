# Memo — Q-027: what access a cross-repository GitHub view needs, and what acting from it would add

*researcher · 2026-11-12 · depth 2 · topics: github, authentication, attribution, security, notifications, web-push, cloudflare, hosting, agents*

Every statement below is labelled with its type, its grade and its source. Grades follow library practice: two pages from the same vendor count as A for product behaviour, and one page is B. "Lib" means an existing library entry. "Not documented" means I opened the pages and they say nothing on the point. I opened every source named here myself today, through a tool that summarises each page. None of it was read verbatim, so the Source checker should re-read quoted wording.

## Summary
- **Reading.** A read-only fine-grained token or a GitHub App can read every record type the desk shows, except GitHub's own notifications inbox. That inbox only accepts a classic token, and a classic token that can read private repositories can also write to all of them.
- **Retention.** Since 1 October 2026, GitHub has been scheduled to delete checks, workflow runs and statuses after the repository's Actions retention period: 90 days by default, at most 400 days in private repositories. Before that they were kept for 400+ days. Older timeline links to GitHub runs may stop working. Records kept as files in the repositories are not affected.
- **Deploy approvals.** GitHub's "required reviewers" are available on private repositories only on Enterprise plans. On Free, Pro and Team plans they are limited to public repositories, so "approve a deploy" may not exist natively for these projects.
- **Showing an action is the owner's.** Of the options GitHub documents, only a GitHub App user token marks an action as the owner's and also visibly made through the app. A fine-grained token with write access acts with all of the owner's rights and shows no app marker.
- **Alerts from every repository.** A personal GitHub account cannot have an account-wide webhook. To receive events from every repository there are four ways: a GitHub App (one webhook address for all repositories it is installed on), one webhook per repository, a central poller, or GitHub Mobile's own push notifications.

## A. Reading across repositories

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| A1 | Fine-grained token permissions needed: list workflow runs and their logs need Actions: read. List or read pull requests need Pull requests: read. Reading file contents needs Contents: read. Listing deployments needs Deployments: read. Repository events need Metadata: read. | fact | B (one generated table; the GitHub App table matches) | docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens ; …/permissions-required-for-github-apps |
| A2 | The list of endpoints that accept fine-grained tokens includes reading check runs (for a commit or by id), environments and pending deployments. It has **no** /notifications endpoint. | fact | B | docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens |
| A3 | **Conflict.** GitHub's token-management page lists "accessing … the Checks API" as something fine-grained tokens cannot do, but A2 lists the check-run read endpoints as supported. Not resolved. | fact (the conflict itself) | B | docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens ; A2 page |
| A4 | Notifications endpoints "only support authentication using a personal access token (classic)". They support polling with Last-Modified/If-Modified-Since (a 304 reply costs nothing) and send an X-Poll-Interval header that must be respected. | fact | B | docs.github.com/en/rest/activity/notifications |
| A5 | A classic token that covers code in private repositories needs the `repo` scope, which gives full read and write. So reading notifications needs a credential that can also write. | fact (Lib L-F12) + estimate (the conclusion) | B | Lib L-F12 |
| A6 | A fine-grained token covers a single user or organization ("resource owner") and can be limited to chosen repositories. | fact | A | Lib L-F5 ; managing-your-personal-access-tokens |
| A7 | GitHub App: installation tokens expire after 1 hour and can be narrowed per request to chosen repositories (up to 500) and chosen permissions. A private App can only be installed on the account that owns it, which may be a personal account. | fact | B (each point on one page) | docs.github.com/…/generating-an-installation-access-token-for-a-github-app ; …/making-a-github-app-public-or-private ; Lib F-gh-02 |
| A8 | Rate limits: fine-grained token and App installation each get 5,000 requests/hour, and an App's limit can grow to 12,500. GITHUB_TOKEN inside Actions gets 1,000/hour per repository. A 304 reply to an authenticated conditional request costs nothing. | fact | A | Lib F-gh-01, F-Q004-6, F-Q004-7 |
| A9 | Polling cost: about 3 calls × 6 repositories every 5 minutes is about 216 requests/hour, under 5% of a 5,000/hour budget, and less when replies are 304. | estimate | — | arithmetic on A8 (number of repositories assumed) |
| A10 | The Events API only covers events from the last 30 days, at most 300 per timeline. Its latency is "30s to 6h", so it is unfit for freshness. | fact | B (window) / A (latency, Lib) | docs.github.com/en/rest/activity/events ; Lib F-Q004-9 |
| A11 | Webhooks are "near real-time" but "can take a few minutes". Order is not guaranteed. Failed deliveries are not retried automatically (manual redelivery for 3 days). Receivers should answer within 10 seconds. One incident delayed push webhooks by up to 40 minutes. | fact | A/B | Lib F-Q004-1, -2, -3a, -4, -12 |
| A12 | Webhook types are repository, organization, App, Marketplace and Sponsors. "You cannot create webhooks for individual user accounts." At most 20 webhooks per event type per repository or organization. | fact | B | docs.github.com/en/webhooks/types-of-webhooks |
| A13 | A GitHub App has one webhook address and receives its subscribed events from every repository it is installed on. Which events it can subscribe to depends on the permissions it holds. | fact | B | docs.github.com/…/using-webhooks-with-github-apps |
| A14 | The `deployment_review` and `deployment_protection_rule` events are available to Apps only. `workflow_run`, `workflow_job`, `check_suite`, `pull_request`, `pull_request_review`, `push`, `issues`, `issue_comment` and `deployment_status` are available to repository, organization and App webhooks, each needing read on the matching permission. | fact | B | docs.github.com/en/webhooks/webhook-events-and-payloads |
| A15 | Webhook deliveries carry an HMAC SHA-256 signature in X-Hub-Signature-256. GitHub advises comparing it in constant time. | fact | B | docs.github.com/…/validating-webhook-deliveries |
| A16 | **Retention.** From 2026-10-01, checks, workflow runs and commit statuses follow the Actions retention setting: 90 days by default, 1–90 days in public repositories, up to 400 days in private ones. Before that they were kept 400+ days whatever the setting. Not confirmed: that the change did take effect on that date. | fact | A (docs page + changelog, same publisher) | docs.github.com/en/organizations/…/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization ; github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses |
| A17 | Listing workflow runs returns at most 1,000 results when filtered (by actor, branch, created, event, status and so on). Check runs for one commit are limited to the 1,000 most recent check suites. Beyond 1,000 check runs with the same name in one suite, older ones are deleted. | fact | B | docs.github.com/en/rest/actions/workflow-runs ; docs.github.com/en/rest/checks/runs |
| A18 | A personal account's security log covers the last 90 days. | fact | B | docs.github.com/…/reviewing-your-security-log |
| A19 | What each option changes. A read-only fine-grained token keeps today's setup: one secret, no webhooks, freshness set by how often it polls. A GitHub App adds one webhook address for all repositories, 1-hour tokens, a 5,000→12,500 budget and the App-only deployment events. In exchange there is a long-lived private key to guard (Lib L-F6, L-P1) and a server must receive the webhooks. Neither option can read GitHub's notifications inbox. | opinion | C | A1–A15 |

## B. Acting from the view

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| B1 | Write permissions per action: approve or reject a pending deployment needs Deployments: write. Merge needs Contents: write. Submit a review needs Pull requests: write. Create or update a file needs Contents: write (plus Workflows for workflow files). For a GitHub App, both user tokens and installation tokens are accepted for all of these. | fact | B | the two tables in A1 ; Lib L-F9 |
| B2 | **Conflict.** The deployment-review endpoint page says "Required reviewers with read access to the repository contents and deployments can use this endpoint", but the permission tables say write. | fact (the conflict) | B | docs.github.com/en/rest/actions/workflow-runs |
| B3 | Required reviewers, wait timers, custom deployment protection rules and admin bypass are "only available for public repositories" on GitHub Free, Pro and Team. Environments themselves are available in private repositories on Pro and Team. | fact | B (one page for the reviewer limit; the environments page agrees on Pro/Team) | docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments ; …/manage-environments |
| B4 | Up to six users or teams can be required reviewers, and one approval is enough. The documentation names only people and teams as reviewers. Self-approval can be blocked: "you will not be able to approve a deployment from a workflow run you initiated". An unapproved job "will automatically fail" after 30 days. | fact | B | deployments-and-environments ; …/review-deployments ; …/control-deployments |
| B5 | Consequence of B4: if the Orchestrator's workflow runs are started as the owner (for example with the owner's token), the self-approval block would stop the owner from approving those runs. | estimate | — | B4 |
| B6 | **Attribution.** A personal access token "has the same capabilities … that the owner of the token has". I found no documented marker that tells a token's actions apart from the owner's own actions in the GitHub interface. | fact (capabilities) / not documented (marker) | B | managing-your-personal-access-tokens |
| B7 | An App installation token acts as the App's bot account (name[bot]). An App user token acts as the user, shown with the App's badge, and the security log records it as "GitHub App user-to-server token". User tokens last 8 hours and their refresh tokens 6 months. | fact | A | Lib L-F1, L-F2, L-F10, L-F11 |
| B8 | A user token is obtained by the owner signing in through GitHub's web flow. It has only the permissions that both the user and the App hold, and can be limited to a single repository with `repository_id`. | fact | B | docs.github.com/…/generating-a-user-access-token-for-a-github-app |
| B9 | GitHub signs commits made in its web interface with its own key ("web-flow") and shows them as Verified. Bot signatures that verify also show as Verified. Not established: whether commits made through the API with a user token are signed. | fact / open | B | docs.github.com/…/about-commit-signature-verification |
| B10 | Attribution separates the owner from agents only if agents never act with the owner's identity. If agent work is pushed with the owner's credentials, GitHub shows owner and agent the same way, and only the record's content (the session name) tells them apart. | opinion | C | B6, B7 |
| B11 | Keeping an acting credential out of agents' reach: the agent never holds the secret, and something outside it attaches the credential. Anthropic's cloud sessions keep GitHub credentials outside the VM. | fact | A | Lib LIB-P-a |
| B12 | Cloudflare Worker secrets are encrypted and "not visible within Wrangler or Cloudflare dashboard after you define them". Secrets Store offers account-level secrets. | fact | B | developers.cloudflare.com/workers/configuration/secrets/ |
| B13 | A GitHub App private key opens every account the App is installed on and never expires. Keep it sign-only, in a key vault. | fact | A/B | Lib L-F6, L-P1 |
| B14 | A credential stored as a GitHub Actions secret in a repository where agents can change workflow files is within agents' reach, because changing workflow files needs only the Workflows permission. Holding the acting credential at Cloudflare puts it in a separate account that agents are never given. | estimate | — | Lib L-F9, L-F12 ; B12 |
| B15 | Pattern for actions, if they are wanted. Use a separate GitHub App limited to the minimum write permissions in B1. Act only with the owner's user token, obtained by the owner signing in, held at Cloudflare and never in GitHub. Gate the view with an Access policy on the owner's email covering every hostname (Lib P-auth-01, F-cf-04, F-cf-05). Agents keep distinct identities. Proving the owner was present for each action (rather than once at sign-in) is not covered by any source opened. | opinion | C | B1–B14 |

## C. Phone alerts from every repository

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| C1 | Option 1, a sender copied into each repository: each copy needs the sending key and the subscription list. It runs at most every 5 minutes on a schedule, may be delayed (and some queued jobs dropped) under load, and has 1,000 requests/hour per repository. | fact (limits) | A | Lib F-gh-12, F-gh-12b, F-Q004-6 |
| C2 | Option 2, one central poller using the read credential: cost as in A9. Cron needs a Cloudflare Worker, because Pages has no Cron Triggers. Alternatively a schedule in one repository. | fact + estimate | A | Lib F-cf-cron-01 ; A9 |
| C3 | Option 3, a GitHub App webhook to a Worker: one address covers all repositories. Because of A11 it needs a backup poll, following the existing webhooks-plus-polling pattern. A personal account has no account-wide webhook, so without an App each repository needs its own (A12). | fact + opinion | B/C | A11–A13 ; Lib PAT-Q004-1 |
| C4 | Option 4, GitHub Mobile push: covers review requests, deployment approvals, assignments and mentions, with no infrastructure. It does not cover the file records (cards in queue/, questions). | fact (scope) + estimate (gap) | A | Lib F-gh-11 |
| C5 | Option 5, `repository_dispatch` from each repository to the sender's repository: this puts a credential that can trigger the sender into every repository. The fine-grained permission needed was not confirmed: the endpoint page names only classic `repo`. | fact | B | docs.github.com/en/rest/repos/repos ; Lib F-gh-13 |
| C6 | Web Push requirements are unchanged by the choice of option: a VAPID key pair, payloads encrypted separately for each subscription, at most 4 KB, every push must be shown on iOS, and subscriptions can expire. | fact | A | Lib F-webpush-02, -04, -05, -03 |

## D. What data leaves the repositories, and where it is held

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| D1 | Web Push encryption protects content from the push service. But "the push service will see which application server is talking to which user agent", along with timing and length, and "no HTTP header fields are protected" (this includes Topic and Urgency). For an iPhone the push service is Apple's. | fact | B (one standard) | rfc-editor.org/rfc/rfc8291 ; Lib F-webpush-02 |
| D2 | Workers KV keeps data in "a small number of centralized data centers" and caches it at Cloudflare locations worldwide once read. No jurisdiction is stated. | fact | B | developers.cloudflare.com/kv/concepts/how-kv-works/ |
| D3 | Durable Objects can be pinned to an eu, us or fedramp jurisdiction. Location hints are best-effort, and objects "do not currently change locations after they are created". | fact | B | developers.cloudflare.com/durable-objects/reference/data-location/ |
| D4 | What leaves under each option. Read-only polling with no cache: records pass through Cloudflare to the phone and are not stored (if the desk caches nothing; I could not see its design). Cache or push service: copies are held at Cloudflare (D2/D3). Webhooks: full event payloads go to the receiver. Alerts: encrypted alert text goes through Apple, with metadata visible (D1). Senders in Actions: data stays on GitHub until it is pushed. | opinion | C | D1–D3 |

## Field scan
GitHub's own channel (GitHub Mobile push, C4) is in the library. I did **not** survey third-party dashboards that span several repositories. That is undone.

## Proposed library entries (fact form; the Source checker files what passes)
```
F-gh-notif-01 | fact | Notifications REST endpoints accept only classic PATs; Last-Modified/If-Modified-Since → 304 free; X-Poll-Interval must be respected. | B | github, notifications, authentication | 6 mo | docs.github.com/en/rest/activity/notifications
F-gh-events-02 | fact | Events API returns only the past 30 days, max 300 events. | B | github, polling | 12 mo | docs.github.com/en/rest/activity/events
F-gh-perm-02 | fact | Fine-grained/App permission per endpoint as in A1 and B1 (Actions read; PR read/write; Contents read/write; Deployments read/write; Metadata read); App UAT+IAT both accepted. Conflict B2 noted. | B | github, authentication | 6 mo | the two permissions-required pages
F-gh-fgpat-limits-01 | fact | A fine-grained PAT has the owner's capabilities, one resource owner; the PAT page lists Checks API as unsupported while the endpoints page lists check-run reads (conflict). | B | github, authentication, attribution | 6 mo | managing-your-personal-access-tokens ; endpoints-available-for-fine-grained-personal-access-tokens
F-gh-env-01 | fact | Required reviewers, wait timers, custom protection rules: public repos only on Free/Pro/Team; ≤6 reviewers, one approval; prevent self-review; unapproved job fails after 30 days. | B | github, deployments | 6 mo | deployments-and-environments ; review-deployments ; control-deployments
F-gh-retention-01 | fact | From 2026-10-01 checks, workflow runs, statuses follow Actions retention (default 90; public ≤90; private ≤400); previously 400+ days. | A | github, retention | 6 mo | org retention docs page ; changelog 2026-08-27
F-gh-webhook-types-01 | fact | No webhooks for personal user accounts; ≤20 webhooks per event per repo/org; an App has one webhook URL receiving from all installations; deployment_review/deployment_protection_rule are App-only. | B | github, webhooks | 12 mo | types-of-webhooks ; using-webhooks-with-github-apps ; webhook-events-and-payloads
F-gh-webhook-validate-01 | fact | X-Hub-Signature-256 HMAC SHA-256; compare in constant time. | B | github, webhooks, security | 12 mo | validating-webhook-deliveries
F-gh-app-tokens-02 | fact | Installation token narrowable to ≤500 repos and chosen permissions; user token = intersection of user and app, narrowable by repository_id; private App only on the owner account. | B | github, authentication | 12 mo | the three App pages in A7/B8
F-gh-checks-runs-01 | fact | Filtered run listing capped at 1,000 results; check runs per ref limited to 1,000 latest suites; >1,000 same-name check runs in a suite are deleted. | B | github, retention | 12 mo | rest/actions/workflow-runs ; rest/checks/runs
F-gh-commit-sign-01 | fact | Web-interface commits signed by GitHub (web-flow) and Verified; verifiable bot signatures Verified; vigilant mode. | B | github, attribution | 12 mo | about-commit-signature-verification
F-webpush-09 | fact | RFC 8291: push service cannot read or alter content but sees parties, timing, length; headers unprotected. | B | web-push, security | 24 mo | rfc-editor.org/rfc/rfc8291
F-cf-loc-01 | fact | KV: central stores plus worldwide edge cache, no jurisdiction stated; DO: eu/us/fedramp jurisdictions, hints best-effort, no relocation. | B | cloudflare, data-location | 6 mo | kv how-kv-works ; durable-objects data-location
F-cf-secrets-01 | fact | Worker secrets encrypted, not viewable after set; Secrets Store for account-level. | B | cloudflare, security | 6 mo | workers/configuration/secrets
P-gh-owner-action-01 | pattern (opinion) | = B15. | C | github, attribution, security, agents | 6 mo | rests on B1–B14
P-gh-cross-repo-alerts-01 | pattern (opinion) | One receiver for all repositories (App webhook to Worker) backed by a conditional poll; GitHub Mobile for GitHub-native events; keep senders' keys in one place. | C | notifications, github, web-push | 6 mo | rests on A8–A13, C1–C6
```

## Questions added
**Research questions (neutral):**
1. Did GitHub's Actions retention change take effect on 2026-10-01, and what happened to runs already older than the setting?
2. Are commits made through the REST contents API with a GitHub App user token signed and shown as Verified?
3. What fine-grained permission does `repository_dispatch` need?
4. Which documented ways (for example a Cloudflare Access re-authentication or a passkey prompt) can prove the owner was present for each action, rather than once at sign-in?
5. Which third-party tools show workflow runs, pull requests and deployments across several repositories, and which credentials do they ask for?

**Owner questions (plain language, for the Chief of Staff to phrase):**
1. Are the project repositories under your personal GitHub account or under an organization?
2. Which GitHub plan are they on?
3. How far back should timeline links to GitHub runs keep working?
4. Is it acceptable for copies of project records to be stored at Cloudflare?

---

**1. What I changed:** Nothing; I have no write lane. This memo is my output for the Orchestrator to record in research/.

**2. Why:** Q-027 (depth 2) asks what access a cross-repository view needs to read, what acting would add, how alerts could cover every repository, and where data goes. Library entries covered rate limits, webhook reliability, attribution and Web Push, but not notifications access, deployment-approval plan limits, retention, webhook types or data location.

**3. What I verified:** I read research/Q-027.md and every library entry sharing its topics. I opened about 30 GitHub, Cloudflare and RFC pages, listed against each statement. Three conflicts are recorded rather than resolved (A3, B2, and whether A16 took effect). I marked nothing as checked myself.

**4. What is undone:** The field scan of third-party cross-repository tools. Research questions 1–4. Whether proving the owner was present for each action can be done. Pages were read through a summarising tool; none was read verbatim.

**5. What is needed outside my lane:** Source check of the 14 proposed facts and 2 patterns. The Chief of Staff to put the four owner questions, because B3 (deploy approvals depend on the plan) and A12 (personal account versus organization) decide which options exist at all.

**6. Open questions:** The four owner questions and five research questions above. No question needs a level-5 expert or a paid source.