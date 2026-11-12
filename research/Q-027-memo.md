# Memo — Q-027 (revision 2): what access a cross-repository GitHub view needs, and what acting from it would add

*researcher · 2026-11-12 · depth 2 · topics: github, authentication, attribution, security, notifications, web-push, cloudflare, hosting, agents*

**How I read the pages.** Every page cited below I opened again today. My only fetch tool summarises pages. For each page I asked it to quote exact sentences or to say outright that a string is missing. Wording in quotation marks is what it returned. For the GitHub REST pages I also opened the docs' article-body endpoint (`docs.github.com/api/article/body?pathname=…`). That endpoint does **not** include the per-endpoint "fine-grained access tokens" boxes, which explains one of the round-1 errors (C5). I still have not read any page verbatim. The Source checker's raw-HTML reading wins where we disagree, except for one point I flag in A17.

**Grades.** One page is B. Two pages from the same vendor are A, but only for product behaviour. Claims about cost, risk or quality get no grade above C unless an independent source backs them, and I have none. "Lib" means an existing library entry.

## Summary
- **Reading.** A read-only fine-grained token can read workflow runs, commit statuses, pull requests, file contents, deployments, environments and pending deployments. It **cannot** read check runs: GitHub says fine-grained tokens cannot call the Checks API, and none of the check-run endpoints are on the list of endpoints those tokens accept. A GitHub App can read check runs. Neither option can read GitHub's notifications inbox, which accepts only a classic token, and a classic token that can read private repositories can also write to all of them.
- **Retention.** GitHub announced that from 1 October 2026 checks, workflow runs and commit statuses would follow the Actions retention setting. The default is 90 days. Public repositories can be set to 1–90 days and private ones to 1–400 days. Until that date these records were kept for 400+ days. I have not confirmed that the change took effect. Records kept as files in the repositories are not affected.
- **Deploy approvals.** On Free, Pro and Team plans, required reviewers are available for public repositories only.
- **Showing an action is the owner's.** Of the options GitHub documents, only a GitHub App user token both marks an action as the owner's and shows it was made through the app. A personal access token has the owner's own capabilities, and I found no documented marker that tells its actions apart.
- **Alerts from every repository.** A personal account cannot have an account-wide webhook. Each GitHub App has a single webhook, which receives events from the repositories it has been granted access to.

## Revision log (what changed since round 1)
| Item | Round 1 | Now | Basis |
|---|---|---|---|
| A2 | Said the fine-grained endpoint list includes check-run reads | **Wrong; corrected.** No `check-runs`, `check-suites` or `notifications` string on that page. It lists commit status and statuses, environments and pending_deployments. | endpoints page, checked string by string |
| A3 | Claimed a conflict between two pages | **Withdrawn.** No conflict: both pages agree that fine-grained tokens cannot use the Checks API. The check-runs page has no fine-grained token box at all. | token-management page; checks/runs page |
| A17 | Check-run limits cited to checks/runs | **Kept, disputed.** My tool returns the sentences, written "1000" with no comma (quotes below). The checker may have searched for "1,000". | checks/runs page, as HTML and as article body |
| C5 | "Fine-grained permission not confirmed" | **Corrected:** Contents: write, for fine-grained tokens, App user tokens and App installation tokens. Research question 3 dropped. | fine-grained permissions table; App permissions table |
| A13 | "One webhook address for all repositories it is installed on" | Reworded to GitHub's exact words | types-of-webhooks |
| A14 | Included workflow_run and others | Cut to the events I checked; the rest marked unchecked | webhook-events-and-payloads |
| B4 | 30-day failure cited to three pages | Now cited to control-deployments, which has the sentence. Note: "30 days" on deployments-and-environments is the wait-timer maximum, not the failure rule. | control-deployments |
| B9 | Named GitHub's key "web-flow" | Name dropped (not confirmed). Signing of API commits is still open. | about-commit-signature-verification |
| Grades | Several cost/risk items graded A/B | Estimates and opinions ungraded or C | sources standard, as quoted by the checker |
| F-gh-fgpat-limits-01 | Contained the false conflict | Rewritten | — |

## A. Reading across repositories

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| A1 | Fine-grained token permissions needed: listing workflow runs needs "Actions" read. Listing pull requests needs "Pull requests" read. Reading file contents needs "Contents" read. Listing deployments needs "Deployments" read. Repository events need "Metadata" read. | fact | B | docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens |
| A2 | The list of endpoints that accept fine-grained tokens contains `GET …/commits/{ref}/status`, `GET …/commits/{ref}/statuses`, the `…/environments…` endpoints and `GET/POST …/actions/runs/{run_id}/pending_deployments`. It contains **no** endpoint with `check-runs`, `check-suites` or `notifications`. | fact | B | docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens |
| A3 | Among the unsupported uses, GitHub lists "Using fine-grained personal access token to call the Checks API." That agrees with A2, and the check-run endpoint pages have no fine-grained token box. **Consequence (estimate):** with a fine-grained token, the desk sees CI state through workflow runs (Actions: read) and commit statuses, not through check runs. | fact; estimate (consequence) | A (two GitHub pages) | docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens ; A2 page ; docs.github.com/en/rest/checks/runs |
| A3a | A GitHub App can read check runs. `GET …/commits/{ref}/check-runs` and `GET …/check-runs/{check_run_id}` need "Checks" read, with both user and installation tokens. | fact | B | docs.github.com/en/rest/authentication/permissions-required-for-github-apps |
| A4 | Notifications endpoints "only support authentication using a personal access token (classic)". They support Last-Modified/If-Modified-Since, a 304 reply, and an X-Poll-Interval header. | fact | B (the checker confirmed it) | docs.github.com/en/rest/activity/notifications |
| A5 | A classic token covering private-repository code needs the `repo` scope, which gives full read and write. So reading notifications needs a credential that can also write. | fact (Lib) + estimate (conclusion) | B | Lib L-F12 |
| A6 | A fine-grained token covers one resource owner and can be limited to chosen repositories. It "has the same capabilities to access resources and perform actions on those resources that the owner of the token has, and is further limited by any scopes or permissions granted to the token." | fact | A | Lib L-F5 ; managing-your-personal-access-tokens |
| A7 | "The installation access token will expire after 1 hour." "You can list up to 500 repositories." It "cannot be granted permissions that the app was not granted," and the `permissions` parameter can narrow it further. A private App "can only be installed on the account that owns the app", and that account can be a personal one. | fact | B (each point on one page) | docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app ; …/registering-a-github-app/making-a-github-app-public-or-private ; Lib F-gh-02 |
| A8 | Rate limits: a fine-grained token and an App installation each get 5,000 requests/hour; an App can grow to 12,500. GITHUB_TOKEN gets 1,000/hour per repository. A conditional 304 reply costs nothing. | fact | A | Lib F-gh-01, F-Q004-6, F-Q004-7 |
| A9 | Polling cost: about 3 calls × 6 repositories every 5 minutes ≈ 216 requests/hour, under 5% of 5,000. | estimate | — | arithmetic on A8; the number of repositories is assumed |
| A10 | The Events API holds at most 300 events from the past 30 days, with latency of "30s to 6h". | fact | B / A (latency, Lib) | docs.github.com/en/rest/activity/events (the checker confirmed it) ; Lib F-Q004-9 |
| A11 | Webhooks are "near real-time" but can take minutes. Order is not guaranteed. There are no automatic retries (manual redelivery for 3 days). Receivers should answer within 10 s. One incident delayed deliveries by up to 40 minutes. | fact | A/B | Lib F-Q004-1, -2, -3a, -4, -12 |
| A12 | "You cannot create webhooks for individual user accounts, or for events that are specific to user resources, like personal notifications or mentions." "You can only create up to 20 webhooks that subscribe to each individual event type." | fact | B | docs.github.com/en/webhooks/types-of-webhooks |
| A13 | "Each GitHub App has a single webhook that is automatically created by GitHub." It receives events "in a repository or organization that the app has been granted access to". "The specific webhook events that you can select for your GitHub App registration are determined by the type of permissions you selected for your app." | fact | B | types-of-webhooks ; docs.github.com/en/apps/creating-github-apps/registering-a-github-app/using-webhooks-with-github-apps |
| A14 | Availability: `deployment_review` and `deployment_protection_rule` are App only, each needing "Deployments" read. `check_suite` reaches repository, organization and App webhooks and needs "Checks" read. `deployment_status` reaches repository, organization and App webhooks and needs "Deployments" read. **Not checked this round:** workflow_run, workflow_job, pull_request, pull_request_review, push, issues, issue_comment. | fact | B | docs.github.com/en/webhooks/webhook-events-and-payloads |
| A15 | The signature is in `X-Hub-Signature-256`, "always starts with `sha256=`", and uses HMAC-SHA256. "Never use a plain `==` operator"; use a "constant time" comparison. | fact | B | docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries |
| A16 | "By default, checks, workflow runs, commit statuses, and the artifacts and log files … are retained for 90 days." Public repositories: "between 1 day or 90 days". Private: "between 1 day or 400 days". "Starting October 1, 2026, these policies will apply to checks, workflow runs, and commit statuses…" "Until then … retained for 400+ days regardless of your configured retention period." **Not confirmed:** that the change took effect. | fact | A (docs page + changelog, product behaviour) | docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization ; github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses |
| A17 | Workflow runs: "This endpoint will return up to 1,000 results for each search when using the following parameters: actor, branch, check_suite_id, created, event, head_sha, status." Check runs: "In a check suite, GitHub limits the number of check runs with the same name to 1000. Once these check runs exceed 1000, GitHub will start to automatically delete older check runs." Also: "If there are more than 1000 check suites on a single git reference, this endpoint will limit check runs to the 1000 most recent check suites." **Disputed by the checker.** These were returned from both the HTML page and the article body. Please search the raw page for "1000" without a comma. | fact | B (workflow-runs part confirmed by the checker) / B pending (check-runs part) | docs.github.com/en/rest/actions/workflow-runs ; docs.github.com/en/rest/checks/runs |
| A18 | "The security log lists all actions performed within the last 90 days." | fact | B | docs.github.com/en/authentication/keeping-your-account-and-data-secure/reviewing-your-security-log |
| A19 | Trade-off. A read-only fine-grained token: one secret, no webhooks, freshness set by polling, no check runs (A3). A GitHub App: a single webhook, 1-hour tokens, check runs readable, the App-only deployment events, and a larger budget. In exchange there is a long-lived private key to guard and a receiver to run. Neither option reads the notifications inbox. | opinion | C | A1–A15 ; Lib L-F6, L-P1 |

## B. Acting from the view

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| B1 | Fine-grained permissions table. `POST …/actions/runs/{run_id}/pending_deployments` needs "Deployments" write. `PUT …/pulls/{n}/merge` needs "Contents" write. `POST …/pulls/{n}/reviews` needs "Pull requests" write. `PUT …/contents/{path}` needs "Contents" write, plus "Workflows" write (the table marks both). For a GitHub App, the pending_deployments row accepts both user and installation tokens. I did not re-check the other App rows this round. | fact | B | the fine-grained and App permission tables (A1, A3a) |
| B2 | **Conflict, quoted exactly.** The endpoint page says "Required reviewers with read access to the repository contents and deployments can use this endpoint." The permission table says "Deployments" write. The likely reading is that the role needed is read and the token permission needed is write, but that is unconfirmed. | fact (the conflict) | B | docs.github.com/en/rest/actions/workflow-runs ; the fine-grained permissions table |
| B3 | "If you are on a GitHub Free, GitHub Pro, or GitHub Team plan, required reviewers are only available for public repositories." The same applies to custom deployment protection rules. "Organizations with GitHub Team and users with GitHub Pro can configure environments for private repositories"; Free plans are limited to public repositories. | fact | A (two GitHub pages) | docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments ; docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments |
| B4 | "You can list up to six users or teams as reviewers." "Only one of the required reviewers needs to approve the job." With Prevent self-review, "users who initiate a deployment cannot approve the deployment job, even if they are a required reviewer"; the review-deployments page agrees. "If a job is not approved within 30 days, it will automatically fail." | fact | A (self-review, two pages) / B (others) | deployments-and-environments ; …/review-deployments ; …/control-deployments |
| B5 | If the Orchestrator's runs are started with the owner's identity and Prevent self-review is on, the owner could not approve those runs. | estimate | — | B4 |
| B6 | A personal access token has the owner's capabilities (A6). I found no documented marker in the interface that tells its actions apart from the owner's own. | fact / not documented | B | managing-your-personal-access-tokens |
| B7 | An installation token acts as name[bot]. A user token acts as the user, shown with the App's badge, and is logged as a user-to-server token. User tokens last 8 hours and their refresh tokens 6 months (also confirmed on the user-token page). | fact | A | Lib L-F1, L-F2, L-F10, L-F11 ; B8 page |
| B8 | "A GitHub App user access token only has permissions that both the user and the app have." The `repository_id` parameter can narrow it to one repository. The web application flow is the route for browser apps. | fact | B | docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app |
| B9 | "GitHub will automatically use GPG to sign commits you make using the web interface. Commits signed by GitHub will have a verified status." A verifiable bot signature is marked verified. **Open:** whether commits made through the REST API with an App user token are signed. | fact / open | B | docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification |
| B10 | Attribution separates owner from agents only if agents never act with the owner's identity. | opinion | C | B6, B7 |
| B11 | Keep the acting credential out of agents' reach: something outside the agent attaches it. | fact (Lib) | A | Lib LIB-P-a |
| B12 | "Secret values are not visible within Wrangler or Cloudflare dashboard after you define them." Secrets Store, which the page describes as beta in the Worker context, provides account-level secrets. | fact | B | developers.cloudflare.com/workers/configuration/secrets/ |
| B13 | A GitHub App private key opens every installation and does not expire. Keep it sign-only, in a vault. | fact (Lib) | A/B | Lib L-F6, L-P1 |
| B14 | A credential held as an Actions secret in a repository where agents can edit workflows is within their reach. Holding it at Cloudflare puts it in an account agents are not given. | estimate (risk) | — (no independent source) | Lib L-F9, L-F12 ; B12 |
| B15 | Pattern, if actions are wanted: a separate GitHub App with the B1 minimum. Act only with the owner's user token, obtained at sign-in and held at Cloudflare. Gate the view with an Access policy on the owner's email. Agents keep distinct identities. Proving the owner was present for each action is not covered by any source I opened. | opinion | C | B1–B14 ; Lib P-auth-01, F-cf-04, F-cf-05 |

## C. Phone alerts from every repository

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| C1 | Sender copied into each repository: each copy needs the key and the subscription list. Schedules run at most every 5 minutes and may be delayed or dropped under load. 1,000 requests/hour per repository. | fact | A | Lib F-gh-12, F-gh-12b, F-Q004-6 |
| C2 | One central poller with the read credential, at the cost in A9. Cron needs a Worker, because Pages has no Cron Triggers. | fact + estimate | A / — | Lib F-cf-cron-01 ; A9 |
| C3 | A GitHub App webhook to a Worker, using the App's single webhook (A13), with a backup poll because of A11. Without an App, each repository needs its own webhook (A12). | fact + opinion | B / C | A11–A13 ; Lib PAT-Q004-1 |
| C4 | GitHub Mobile push covers review requests, deployment approvals, assignments and mentions. It does not cover file records. | fact + estimate | A / — | Lib F-gh-11 |
| C5 | `repository_dispatch` from each repository: `POST /repos/{owner}/{repo}/dispatches` needs "Contents" write for fine-grained tokens and for App user and installation tokens. So every repository would hold a credential with Contents write on the sender's repository. That credential could also change the sender's code, unless the sender lives in a repository used for nothing else (estimate). | fact; estimate (consequence) | A (two GitHub tables; the checker read the same on the repos page) | the fine-grained permissions table ; the App permissions table ; docs.github.com/en/rest/repos/repos |
| C6 | Web Push needs a VAPID key pair and per-subscription encryption. Payloads are at most 4 KB, iOS must show every push, and subscriptions expire. | fact | A | Lib F-webpush-02, -03, -04, -05 |

## D. What data leaves the repositories

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| D1 | "The timing and length of communication cannot be hidden from the push service… the push service will see which application server is talking to which user agent and the subscription that is used." "No HTTP header fields are protected by the content encoding scheme." For iPhones the push service is Apple's. | fact | B | rfc-editor.org/rfc/rfc8291 ; Lib F-webpush-02 |
| D2 | KV "stores data in a small number of centralized data centers, then caches that data in Cloudflare's data centers after access." No jurisdiction is stated. | fact | B | developers.cloudflare.com/kv/concepts/how-kv-works/ |
| D3 | Durable Object jurisdictions are eu, us and fedramp. "Hints are a best effort and not a guarantee." "Durable Objects do not currently change locations after they are created." | fact | B | developers.cloudflare.com/durable-objects/reference/data-location/ |
| D4 | What leaves under each option (same as round 1): pass-through polling stores nothing at Cloudflare; a cache keeps copies (D2/D3); webhooks send full payloads to the receiver; alerts pass through Apple with metadata visible (D1). | opinion | C | D1–D3 |

## Field scan
GitHub's own channel (C4) is in the library. I have **not** surveyed third-party dashboards that span several repositories. That is still undone.

## Proposed library entries
```
F-gh-notif-01 | fact | Notifications REST endpoints accept only classic PATs; Last-Modified/If-Modified-Since → 304; X-Poll-Interval header. | B | github, notifications, authentication | 6 mo | docs.github.com/en/rest/activity/notifications
F-gh-events-02 | fact | Events API: up to 300 events from the past 30 days; latency 30s–6h. | B | github, polling | 12 mo | docs.github.com/en/rest/activity/events
F-gh-perm-02 | fact | Fine-grained PAT: list runs = Actions read; list PRs = Pull requests read; read contents = Contents read; list deployments = Deployments read; repo events = Metadata read; review pending deployments = Deployments write; merge = Contents write; submit review = Pull requests write; create/update file = Contents write + Workflows write; repository_dispatch = Contents write. Endpoint page for pending deployments says reviewers with read access can use it (B2). | B | github, authentication | 6 mo | permissions-required-for-fine-grained-personal-access-tokens ; rest/actions/workflow-runs
F-gh-fgpat-limits-01 | fact | Fine-grained PATs cannot call the Checks API (no check-run/check-suite endpoints in the supported list); no notifications endpoints; PAT has owner's capabilities, limited by its permissions. | A | github, authentication, attribution | 6 mo | managing-your-personal-access-tokens ; endpoints-available-for-fine-grained-personal-access-tokens
F-gh-app-checks-01 | fact | GitHub App UAT and IAT can read check runs (for a ref, by id) with Checks read; repository_dispatch needs Contents write; pending_deployments review needs Deployments write. | B | github, authentication | 6 mo | permissions-required-for-github-apps
F-gh-env-01 | fact | Required reviewers and custom protection rules: public repos only on Free/Pro/Team; environments in private repos on Pro/Team; ≤6 users or teams, one approval; Prevent self-review blocks the initiator; unapproved job fails after 30 days. | A (self-review, plan limit) / B (rest) | github, deployments | 6 mo | deployments-and-environments ; manage-environments ; review-deployments ; control-deployments
F-gh-retention-01 | fact | Announced: from 2026-10-01 checks, workflow runs, statuses follow Actions retention (default 90 d; public 1–90; private 1–400); before that 400+ d regardless. Effect not confirmed. | A | github, retention | 6 mo | org retention docs page ; changelog 2026-08-27
F-gh-webhook-types-01 | fact | No webhooks for personal user accounts or user-specific events (notifications, mentions); ≤20 webhooks per event type; each App has a single webhook receiving events from repos/orgs it has access to; App events depend on its permissions; deployment_review and deployment_protection_rule are App-only. | B | github, webhooks | 12 mo | types-of-webhooks ; using-webhooks-with-github-apps ; webhook-events-and-payloads
F-gh-webhook-validate-01 | fact | X-Hub-Signature-256, sha256= prefix, HMAC-SHA256; compare in constant time, never ==. | B | github, webhooks, security | 12 mo | validating-webhook-deliveries
F-gh-app-tokens-02 | fact | Installation token: 1 h, ≤500 repos, permissions ≤ app's, narrowable; user token: intersection of user and app permissions, narrowable by repository_id, 8 h / refresh 6 mo; private App installable only on owning account (may be personal). | B | github, authentication | 12 mo | generating-an-installation-access-token ; generating-a-user-access-token ; making-a-github-app-public-or-private
F-gh-checks-runs-01 | fact | Filtered workflow-run listing returns up to 1,000 results; >1000 same-name check runs in a suite → older deleted; >1000 suites on a ref → check runs from 1000 most recent suites. (Check-run part disputed; re-check for "1000" without comma.) | B | github, retention | 12 mo | rest/actions/workflow-runs ; rest/checks/runs
F-gh-commit-sign-01 | fact | Web-interface commits are GPG-signed by GitHub and verified; verifiable bot signatures verified; vigilant mode off by default. | B | github, attribution | 12 mo | about-commit-signature-verification
F-gh-seclog-01 | fact | Personal security log lists actions from the last 90 days. | B | github, security | 12 mo | reviewing-your-security-log
F-webpush-09 | fact | RFC 8291: push service sees which application server talks to which user agent, the subscription, timing and (unpadded) length; no HTTP header fields protected. | B | web-push, security | 24 mo | rfc-editor.org/rfc/rfc8291
F-cf-loc-01 | fact | KV: few central stores + cache after access, no jurisdiction stated; DO: eu/us/fedramp jurisdictions, hints best effort, no relocation after creation. | B | cloudflare, data-location | 6 mo | kv how-kv-works ; durable-objects data-location
F-cf-secrets-01 | fact | Worker secret values not visible in Wrangler or dashboard after set; Secrets Store (beta in Worker context) for account-level secrets. | B | cloudflare, security | 6 mo | workers/configuration/secrets
P-gh-owner-action-01 | pattern (opinion) | = B15. | C | github, attribution, security, agents | 6 mo | rests on B1–B14
P-gh-cross-repo-alerts-01 | pattern (opinion) | One receiver (App's single webhook to a Worker) backed by a conditional poll; GitHub Mobile for GitHub-native events; senders' keys in one place. | C | notifications, github, web-push | 6 mo | rests on A8–A13, C1–C6
```

## Questions added
**Research questions (neutral):**
1. Did GitHub's Actions retention change take effect on 2026-10-01, and what happened to records already older than the setting?
2. Are commits made through the REST contents API with a GitHub App user token signed and shown as verified?
3. Which documented ways can prove the owner was present for each action, rather than once at sign-in?
4. Which third-party tools show workflow runs, pull requests and deployments across several repositories, and which credentials do they ask for?
5. On the review-pending-deployments endpoint, which applies: the "read access" wording on the endpoint page or the "Deployments" write in the permissions table?

**Owner questions (plain language):**
1. Are the project repositories under your personal GitHub account or under an organization?
2. Which GitHub plan are they on?
3. How far back should timeline links to GitHub runs keep working?
4. Is it acceptable for copies of project records to be stored at Cloudflare?

---

**1. What I changed**
- A2 was wrong and is corrected: fine-grained tokens cannot read check runs. A3's "conflict" is withdrawn.
- C5 is corrected to Contents: write. Research question 3 is dropped and a new one about B2 is added.
- I added A3a (a GitHub App can read check runs) and two new entries: F-gh-app-checks-01 and F-gh-seclog-01.
- I reworded A13, cut A14 to the events I checked, re-sourced B4's 30-day rule, and dropped the unconfirmed "web-flow" name from B9.
- The summary now says what a fine-grained token cannot read. F-gh-fgpat-limits-01 is rewritten without the false conflict.
- Estimates and opinions about risk or cost now carry no grade above C.
- Exact quotations now back most facts.

**2. Why:** The source check found three claims the pages did not support (A2/A3, A17, C5), plus about a dozen pages it could not open. Under the brief, an unverifiable claim is a fail. I re-derived each disputed claim and opened every page the checker did not reach.

**3. What I verified:** These were page fetches, not commands; I have no shell. Results:
- **Endpoints page:** asked for each string in turn. Answer: "NONE" for check-runs, check-suites and notifications. It lists status and statuses, environments and pending_deployments.
- **Token-management page:** the "Checks API" unsupported line, quoted.
- **Checks/runs page,** as HTML and as article body: the three "1000" sentences returned both times, and no fine-grained token box.
- **Fine-grained and App permission tables:** dispatches = Contents write; pending_deployments = Deployments write; App check-run reads = Checks read for user and installation tokens; the A1/B1 rows.
- **Workflow-runs page:** the 1,000-results sentence and the "Required reviewers with read access" wording, quoted.
- **Pages the checker did not open:** review-deployments, control-deployments ("If a job is not approved within 30 days, it will automatically fail."), manage-environments, the three App pages, using-webhooks-with-github-apps, types-of-webhooks, webhook-events-and-payloads, validating-webhook-deliveries, commit signature verification, the security log, the retention docs, RFC 8291, and the three Cloudflare pages. All quoted in the tables.
- **Found but not resolved:**
  - My fetch of the repos page did not show the fine-grained box the checker read. I relied on the permission tables instead.
  - My fetch of using-webhooks-with-github-apps did not show the "single webhook" wording. I took it from types-of-webhooks instead.

**4. What is undone:**
- The field scan of third-party cross-repository tools.
- Research questions 1–5.
- Availability of the A14 events I cut (workflow_run, pull_request and others).
- The App permission rows for merge, reviews and contents.
- The library entries I cite but did not re-open (L-F*, F-Q004-*, F-gh-11/12).
- Still no verbatim reading: everything above came through a summarising tool.

**5. What is needed outside my lane:**
- The Source checker re-reads the raw pages, especially the A17 check-runs page (search for "1000" with no comma) and the newly quoted pages.
- The Chief of Staff puts the four owner questions. Plan (B3) and account type (A12) decide which options exist at all.

**6. Open questions:**
- **A17:** the checker and I disagree about the check-runs page. Their raw-HTML search should settle it.
- **B2:** the endpoint page says reviewers with read access can approve, but the permission table says Deployments write. Still unresolved.
- The four owner questions and five research questions above.
- No question needs a level-5 expert or a paid source.