I've written revision 4 of the Q-027 memo, below in full for the record. It fixes the one thing that failed the source check and partly answers research question 1.

# Memo — Q-027 (revision 4): what access a cross-repository GitHub view needs, and what acting from it would add

*researcher · 2026-11-12 · depth 2 · topics: github, authentication, attribution, security, notifications, web-push, cloudflare, hosting, agents*

**How I read the pages.** My only fetch tool returns summaries. For each page I asked it to quote exact sentences or to say outright when a string is missing. It does **not** show the "Fine-grained access tokens for …" boxes on GitHub's REST endpoint pages. Where the memo depends on those boxes (A3, B2), I rely on the Source checker's raw-HTML reading and say so.

**Grades.** One page earns B. Two pages from the same publisher earn A, but only for how the product behaves. Claims about cost, risk or quality get no grade above C unless an independent source backs them. "Lib" means an existing library entry.

## Summary
- **Reading.**
  - A read-only fine-grained token can read:
    - workflow runs
    - commit statuses
    - pull requests
    - file contents
    - deployments, environments and pending deployments
  - It **cannot** read check runs: GitHub says fine-grained tokens cannot call the Checks API.
  - A GitHub App can read check runs.
  - Neither can read GitHub's notifications inbox, which accepts only a classic token. A classic token that can read private repositories can also write to them.
- **Retention.** GitHub's changelog of 1 October 2026 says the change has taken effect: checks, workflow runs and commit statuses now follow the Actions retention setting.
  - The default is 90 days.
  - Public repositories can be set to at most 90 days; private ones to 1–400 days.
  - Records kept as files in the repositories are not affected.
  - The docs pages still describe the change in the future tense, and no source says what happened to records already past the setting on that date.
- **Deploy approvals.** On Free, Pro and Team plans, required reviewers are available for public repositories only. To approve through the API, the token needs Deployments write and the person must be a required reviewer.
- **Showing an action is the owner's.** Of the options GitHub documents, only a GitHub App user token both marks an action as the owner's and shows it was made through the app. A personal access token has the owner's capabilities, and I found no documented marker that tells its actions apart from the owner's own.
- **Alerts from every repository.** A personal account cannot have an account-wide webhook. Each GitHub App has one webhook, which receives events from every repository it has been granted access to.

## Revision log (round 3 → 4)
| Item | Round 3 | Now | Basis |
|---|---|---|---|
| P-gh-cross-repo-alerts-01 | Said "because webhooks are not retried" but cited F-Q004-3a, which is about delay | Now cites **F-Q004-1** for "no automatic redelivery". F-Q004-3a, F-Q004-4 and F-Q004-12 are cited only for delay and ordering. "Keys in one place" is now marked as my estimate, resting on C1. Before, it implied F-gh-12 supported it, but F-gh-12 is only about schedule timing. | Q-004-facts.md re-read |
| P-gh-owner-action-01 | Cited L-F1 without saying what for; cited F-cf-05 as if it covered any view | L-F10 is added for "acts as the user and the app; the security log records it as a user-to-server token". L-F1 is used only as the contrast: installation tokens act as name[bot]. L-F2 is cited only for the badge, which rests on a single page. F-cf-05 is limited to a view run as a Worker, since that entry says it is "not documented for Pages projects". A Pages view falls back to P-auth-01. | library entries re-read |
| A16 / research Q1 | "Not confirmed that the change took effect" | **Took effect per the changelog dated 2026-10-01** (new A16a). The docs pages still use the future tense. What happened to records that were already older than the setting remains open. | changelog 2026-10-01; repository and organization settings docs pages |
| Top of file | A stray status line ("Brief update: …") sat above the title | Removed | — |

## A. Reading across repositories

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| A1 | Fine-grained token permissions: listing workflow runs needs "Actions" read; listing pull requests needs "Pull requests" read; reading file contents needs "Contents" read; listing deployments needs "Deployments" read; repository events need "Metadata" read. | fact | B | docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens (Lib F-gh-perm-02) |
| A2 | The list of endpoints that accept fine-grained tokens includes `GET …/commits/{ref}/status`, `GET …/commits/{ref}/statuses`, the `…/environments…` endpoints and `GET/POST …/actions/runs/{run_id}/pending_deployments`. It includes **no** `check-runs` or `check-suites` endpoint and **no notifications endpoint**. The word "notifications" appears only as a sidebar menu label. | fact | B | docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens |
| A3 | GitHub's list of unsupported uses includes "Using fine-grained personal access token to call the Checks API." On `rest/checks/runs`, every endpoint's "Fine-grained access tokens for …" box lists only "GitHub App user access tokens" and "GitHub App installation access tokens", with "Checks" permission (checker's raw-HTML reading). **Consequence (estimate):** with a fine-grained token, the desk sees CI state through workflow runs and commit statuses, not through check runs. | fact; estimate (consequence) | A | managing-your-personal-access-tokens ; docs.github.com/en/rest/checks/runs ; A2 page |
| A3a | A GitHub App can read check runs: `GET …/commits/{ref}/check-runs` and `GET …/check-runs/{check_run_id}` need "Checks" read, with user or installation tokens. | fact | B | docs.github.com/en/rest/authentication/permissions-required-for-github-apps |
| A4 | Notifications endpoints "only support authentication using a personal access token (classic)". They support Last-Modified/If-Modified-Since, a 304 reply and an X-Poll-Interval header. | fact | B | docs.github.com/en/rest/activity/notifications |
| A5 | A classic token covering private-repository code needs the `repo` scope, which gives full read and write. So reading notifications needs a credential that can also write. | fact (Lib) + estimate (conclusion) | B | Lib L-F12 |
| A6 | A fine-grained token covers one resource owner and can be limited to chosen repositories. It "has the same capabilities to access resources and perform actions on those resources that the owner of the token has, and is further limited by any scopes or permissions granted to the token." | fact | A | Lib L-F5 ; managing-your-personal-access-tokens |
| A7 | Installation tokens expire after 1 hour, can list up to 500 repositories, cannot be granted permissions the app lacks, and can be narrowed. A private App can only be installed on the account that owns it, which can be a personal account. | fact | B | Lib F-gh-app-tokens-02 |
| A8 | Rate limits: a fine-grained token and an App installation each get 5,000 requests/hour; an App can grow to 12,500. GITHUB_TOKEN gets 1,000/hour per repository. A conditional 304 reply costs nothing. | fact | A | Lib F-gh-01, F-Q004-6, F-Q004-7 |
| A9 | Polling cost: about 3 calls × 6 repositories every 5 minutes ≈ 216 requests/hour, under 5% of 5,000. | estimate | — | arithmetic on A8; the repository count is assumed |
| A10 | The Events API holds at most 300 events from the past 30 days, with latency of "30s to 6h". | fact | B / A (latency, Lib) | docs.github.com/en/rest/activity/events ; Lib F-Q004-9 |
| A11 | Webhooks are "near real-time" but can take minutes (F-Q004-3a). Order is not guaranteed (F-Q004-12). There are no automatic redeliveries; manual redelivery is possible for 3 days (F-Q004-1). Receivers should answer within 10 s (F-Q004-2). One incident delayed deliveries by up to 40 minutes (F-Q004-4). | fact | A/B | Lib as cited |
| A12 | A personal account cannot have its own webhook: GitHub says no webhooks for individual user accounts or user-specific events. At most 20 webhooks can subscribe to each event type. | fact | B | Lib F-gh-webhook-types-01 |
| A13 | Each GitHub App has a single webhook, which receives events from the repositories it has been granted access to. Which events it can select depends on its permissions. | fact | B | Lib F-gh-webhook-types-01 |
| A14 | `deployment_review` and `deployment_protection_rule` are App only, each needing "Deployments" read. `check_suite` and `deployment_status` reach repository, organization and App webhooks. **Not checked:** workflow_run, workflow_job, pull_request, pull_request_review, push, issues, issue_comment. | fact | B | docs.github.com/en/webhooks/webhook-events-and-payloads |
| A15 | The signature is in `X-Hub-Signature-256`, "always starts with `sha256=`", and uses HMAC-SHA256. "Never use a plain `==` operator"; use a "constant time" comparison. | fact | B | …/validating-webhook-deliveries |
| A16 | Repository settings page: "By default, checks, workflow runs, commit statuses, and the artifacts and log files generated by workflows are retained for 90 days before they are automatically deleted." Public repositories: "between 1 day or 90 days"; private: "between 1 day or 400 days". The repository and organization pages still read: "Starting October 1, 2026, these policies will apply…" and "Until then … retained for 400+ days regardless of your configured retention period." | fact | A (repository page + organization page + changelog of 2026-08-27) | docs.github.com/en/repositories/…/managing-github-actions-settings-for-a-repository ; organization retention page ; github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses |
| **A16a (new)** | Changelog of **2026-10-01**: "As previously announced, checks, workflow runs, and statuses are now governed by the same GitHub Actions retention setting that controls how long artifacts and logs are kept." "These records are automatically cleaned up when they exceed the retention period configured for your enterprise, organization, or repository." "This applies to checks and statuses created by GitHub Actions and third-party applications." "…the maximum retention for public repositories is 90 days." "Changing the setting won't restore data that was previously removed." **Not stated:** whether records already past the setting on 1 October were deleted at once or gradually. **Consequence (estimate):** timeline links to GitHub runs older than each repository's setting (90 days unless changed) stop working. Records kept as files do not. | fact; estimate (consequence) | B (one page; the docs pages have not yet been updated to say it took effect) | github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses |
| A17 | Workflow runs: "This endpoint will return up to 1,000 results for each search when using the following parameters: actor, branch, check_suite_id, created, event, head_sha, status." Check runs: "In a check suite, GitHub limits the number of check runs with the same name to 1000. Once these check runs exceed 1000, GitHub will start to automatically delete older check runs." And: "If there are more than 1000 check suites on a single git reference, this endpoint will limit check runs to the 1000 most recent check suites." | fact | B | docs.github.com/en/rest/actions/workflow-runs ; docs.github.com/en/rest/checks/runs |
| A18 | "The security log lists all actions performed within the last 90 days." | fact | B | …/reviewing-your-security-log |
| A19 | The trade-off. **Read-only fine-grained token:** one secret, no webhooks, freshness set by polling, no check runs. **GitHub App:** one webhook, 1-hour tokens, readable check runs, the App-only deployment events and a larger request budget. In exchange there is a long-lived private key to guard and a receiver to run. Neither reads the notifications inbox. | opinion | C | A1–A15 ; Lib L-F6, L-P1 |

## B. Acting from the view

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| B1 | Fine-grained permissions: approving pending deployments needs "Deployments" write. Merging a pull request needs "Contents" write. Creating a review needs "Pull requests" write. `PUT …/contents/{path}` needs "Contents" write plus "Workflows" write. For a GitHub App, the pending_deployments row accepts both user and installation tokens. | fact | B | Lib F-gh-perm-02 ; App permission table |
| B2 | Approving a pending deployment needs two things. The token needs "Deployments" write: the endpoint's box and the permissions table agree. The person needs the reviewer role: "Required reviewers with read access to the repository contents and deployments can use this endpoint." These are about different things and do not conflict. | fact | B | Lib F-gh-perm-02 |
| B3 | "If you are on a GitHub Free, GitHub Pro, or GitHub Team plan, required reviewers are only available for public repositories." The same applies to custom deployment protection rules. "Organizations with GitHub Team and users with GitHub Pro can configure environments for private repositories"; on Free, environments are limited to public repositories. | fact | A | …/deployments-and-environments ; …/manage-environments |
| B4 | Up to six reviewers; one approval is enough. With Prevent self-review on, "users who initiate a deployment cannot approve the deployment job, even if they are a required reviewer". A job not approved within 30 days fails. | fact | A (self-review) / B (others) | deployments-and-environments ; review-deployments ; control-deployments |
| B5 | If the Orchestrator's runs are started with the owner's identity and Prevent self-review is on, the owner could not approve those runs. | estimate | — | B4 |
| B6 | A personal access token has the owner's capabilities (A6). I found no documented marker that tells its actions apart from the owner's own. | fact / not documented | B | managing-your-personal-access-tokens |
| B7 | An installation token acts as name[bot] (L-F1). A user token acts as the user and the app: the user's avatar with the App's badge, and the security log records the user as actor with "GitHub App user-to-server token" (L-F10; badge and log detail rest on one page). User tokens last 8 hours and their refresh tokens 6 months (L-F2, L-F11). | fact | A | Lib L-F1, L-F2, L-F10, L-F11 |
| B8 | "A GitHub App user access token only has permissions that both the user and the app have." It can be narrowed to one repository with `repository_id`. | fact | B | Lib F-gh-app-tokens-02 |
| B9 | GitHub signs commits made in the web interface, and they show as verified. **Open:** whether commits made through the REST API with an App user token are signed. | fact / open | B | …/about-commit-signature-verification |
| B10 | Attribution separates the owner from agents only if agents never act with the owner's identity. | opinion | C | B6, B7 |
| B11 | To keep the acting credential out of agents' reach, something outside the agent attaches it. | fact (Lib) | A | Lib LIB-P-a |
| B12 | "Secret values are not visible within Wrangler or Cloudflare dashboard after you define them." The page describes Secrets Store, which provides account-level secrets, as beta in the Worker context. | fact | B | developers.cloudflare.com/workers/configuration/secrets/ |
| B13 | A GitHub App private key opens every installation and does not expire. Keep it sign-only, in a vault. | fact (Lib) | A/B | Lib L-F6, L-P1 |
| B14 | A credential held as an Actions secret in a repository where agents can edit workflows is within their reach. Holding it at Cloudflare puts it in an account agents are not given. | estimate (risk) | — (no independent source) | Lib L-F9, L-F12 ; B12 |
| B15 | See pattern P-gh-owner-action-01. **Not covered by any source I opened:** proving the owner was present for each action rather than once at sign-in. | opinion | C | as in the pattern |

## C. Phone alerts from every repository

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| C1 | Copying the sender into each repository: schedules run at most every 5 minutes (F-gh-12) and may be delayed or dropped under load (F-gh-12b). The limit is 1,000 requests/hour per repository (F-Q004-6). **Estimate:** each copy also needs the VAPID key and the subscription list, so these would sit in every repository. | fact + estimate | A / — | Lib as cited |
| C2 | One central poller holding the read credential, at the cost in A9. Cron needs a Worker, because Pages has no Cron Triggers. | fact + estimate | A / — | Lib F-cf-cron-01 ; A9 |
| C3 | Send the GitHub App's single webhook (A13) to a Worker, with a backup poll because webhooks are not redelivered automatically (F-Q004-1). Without an App, each repository needs its own webhook (A12). | fact + opinion | B / C | A11–A13 ; Lib PAT-Q004-1 |
| C4 | GitHub Mobile push covers review requests, deployment approvals, assignments and mentions. It does not cover file records. | fact + estimate | A / — | Lib F-gh-11 |
| C5 | `repository_dispatch` needs "Contents" write for every token type. So every repository would hold a credential with Contents write on the sender's repository. That credential could also change the sender's code, unless the sender lives in a repository used for nothing else (estimate). | fact; estimate | A | Lib F-gh-perm-02 ; docs.github.com/en/rest/repos/repos |
| C6 | Web Push needs a VAPID key pair and per-subscription encryption. Payloads are at most 4 KB, iOS must show every push, and subscriptions expire. | fact | A | Lib F-webpush-02, -03, -04, -05 |

## D. What data leaves the repositories

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| D1 | "The timing and length of communication cannot be hidden from the push service… the push service will see which application server is talking to which user agent and the subscription that is used." "No HTTP header fields are protected by the content encoding scheme." On iPhones the push service is Apple's. | fact | B | rfc-editor.org/rfc/rfc8291 ; Lib F-webpush-02 |
| D2 | KV "stores data in a small number of centralized data centers, then caches that data in Cloudflare's data centers after access." No jurisdiction is stated. | fact | B | developers.cloudflare.com/kv/concepts/how-kv-works/ |
| D3 | Durable Object jurisdictions are eu, us and fedramp. "Hints are a best effort and not a guarantee." "Durable Objects do not currently change locations after they are created." | fact | B | developers.cloudflare.com/durable-objects/reference/data-location/ |
| D4 | What leaves under each option:<br>• Polling that passes data straight through stores nothing at Cloudflare.<br>• A cache keeps copies (D2, D3).<br>• Webhooks send full payloads to the receiver.<br>• Alerts pass through Apple, which sees the metadata in D1. | opinion | C | D1–D3 |

## Field scan
GitHub's own channel (C4) is in the library. I have **not** surveyed third-party dashboards that span several repositories. That is still undone (research question 4).

## Proposed library entries
The 16 facts filed on 2026-11-12 are not proposed again. This round proposes one new fact and resubmits the two patterns.
```
F-gh-retention-02 | fact | GitHub changelog dated 2026-10-01: checks, workflow runs and statuses "are now governed by the same GitHub Actions retention setting that controls how long artifacts and logs are kept"; "automatically cleaned up when they exceed the retention period configured for your enterprise, organization, or repository"; applies to checks and statuses from GitHub Actions and third-party applications; public-repository maximum 90 days; "Changing the setting won't restore data that was previously removed." Not stated: treatment of records already past the setting on 1 Oct. Note: the repository and organization docs pages still use the future tense ("will apply", "Until then"). | B | github, retention | 6 mo | https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses ; https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository (default 90 days; 1–90 public, 1–400 private) | complements F-gh-retention-01

P-gh-owner-action-01 | pattern (opinion) | If actions are wanted from the view: a separate GitHub App limited to the minimum permissions (Deployments write to approve; Contents write to merge; Pull requests write to review) [F-gh-perm-02]; act only with the owner's App user token, never the installation token, whose actions show as name[bot] [L-F1]; a user token's actions are attributed to the user and the app, with the App's badge in the UI and "GitHub App user-to-server token" in the security log [L-F10; badge also L-F2; single page]; its permissions are the intersection of user and App, and it can be narrowed by repository_id [F-gh-app-tokens-02]; attach the credential outside any agent session [LIB-P-a]; gate the view with Cloudflare Access, policy Emails = the owner [P-auth-01]; if the view runs as a Worker, Worker-level Access covers all its hostnames [F-cf-05; not documented for Pages]. Limit: does not by itself prove the owner was present for each action. | C | github, attribution, security, agents | 6 mo | rests on F-gh-perm-02, L-F1, L-F2, L-F10, F-gh-app-tokens-02, LIB-P-a, P-auth-01, F-cf-05

P-gh-cross-repo-alerts-01 | pattern (opinion) | For alerts from every repository: one receiver, the GitHub App's single webhook, which covers every repository the App is granted [F-gh-webhook-types-01], delivered to a Worker; backed by a conditional poll on a Worker cron [F-cf-cron-01; Pages has no cron], because GitHub does not redeliver failed webhooks automatically [F-Q004-1], deliveries can take minutes or be delayed [F-Q004-3a, F-Q004-4] and arrive out of order [F-Q004-12]; GitHub Mobile for GitHub-native events such as review requests and deployment approvals [F-gh-11]; per-repository Actions senders are weaker because schedules run at most every 5 minutes and can be delayed or dropped [F-gh-12, F-gh-12b]; keeping the sender's keys in one place rather than in every repository is the researcher's estimate, not a sourced fact. | C | notifications, github, web-push | 6 mo | rests on F-gh-webhook-types-01, F-cf-cron-01, F-Q004-1, F-Q004-3a, F-Q004-4, F-Q004-12, F-gh-11, F-gh-12, F-gh-12b
```

## Questions added
**Research questions (neutral):**
1. *(Narrowed, now that A16a shows the change took effect.)* When the Actions retention change took effect on 1 October 2026, what happened to checks, workflow runs and statuses that were already older than the setting?
2. Are commits made through the REST contents API with a GitHub App user token signed and shown as verified?
3. Which documented ways can prove the owner was present for each action, rather than once at sign-in?
4. Which third-party tools show workflow runs, pull requests and deployments across several repositories, and which credentials do they ask for?
5. Is there an independent source on whether agents that can edit workflows can reach credentials held as Actions secrets (B14)?

**Owner questions (plain language):**
1. Are the project repositories under your personal GitHub account or under an organization?
2. Which GitHub plan are they on?
3. How far back should timeline links to GitHub runs keep working? GitHub now deletes run records after 90 days by default.
4. Is it acceptable for copies of project records to be stored at Cloudflare?

---

**1. What I changed**
- **The failed pattern:** P-gh-cross-repo-alerts-01 now cites F-Q004-1 for "webhooks are not retried". F-Q004-3a, -4 and -12 are cited only for delay and ordering. The "keys in one place" point is now marked as my estimate. I also made the same fix in C1 and C3.
- **The other pattern:** in P-gh-owner-action-01, each citation now sits next to the point it supports. I added L-F10 for the user-and-app attribution and limited F-cf-05 to a view run as a Worker.
- **Retention:** I added A16a and proposed F-gh-retention-02. They say the retention change took effect on 1 October 2026. Research question 1 is narrowed and owner question 3 updated to match.
- **Clean-up:** I removed the stray status line at the top of the memo file.

**2. Why**
- The source check failed the memo on one point: the pattern gave a reason ("not retried") and cited an entry that doesn't support it.
- The checker hadn't yet read L-F1, L-F2, LIB-P-a and F-gh-app-tokens-02. I read them, plus F-cf-05, and found two loose links:
  - L-F1 was cited without saying what for.
  - F-cf-05 is limited to Workers, but the pattern used it for any view.
- Research question 1 had a cheap, first-party answer.

**3. What I verified** (page fetches and file reads; I have no shell)
- **Library entries:** I read `library/Q-004-facts.md`. F-Q004-1 is "no automatic redelivery; manual within 3 days", and F-Q004-3a is about delivery delay. That matches the checker's finding.
- **Entries the patterns cite:** I read L-F1, L-F2, L-F10, L-F11, F-gh-app-tokens-02, F-gh-perm-02, F-gh-webhook-types-01, F-gh-11, F-gh-12, F-gh-12b, F-cf-cron-01, F-cf-05, P-auth-01 and LIB-P-a. Each now carries only the claim it states.
  - LIB-P-a's "webhook-then-fetch" point concerns Anthropic webhooks, so I don't use it for GitHub.
  - P-auth-01 prefers installation tokens for *reading*. That doesn't conflict with using user tokens for *acting*.
- **Web search:** "GitHub Actions retention … October 1 2026" turned up the 2026-10-01 changelog post "Actions retention now covers checks, runs, and statuses".
- **That changelog:** fetched, and the tool quoted five sentences, which appear in A16a. It says nothing about records already older than the setting.
- **Repository settings docs page:** fetched. It has the 90-day default, 1–90 days for public and 1–400 for private, and the change still in the future tense.
- **Organization retention docs page:** fetched. It is also still in the future tense.

**4. What is undone**
- The field scan of third-party tools (research question 4).
- Research questions 1 (narrowed), 2, 3 and 5.
- The A14 events I didn't check.
- The App permission rows for merge, reviews and contents.
- I still have no verbatim, raw-HTML reading of any page. The new A16a quotes come through my summarising tool.

**5. What is needed outside my lane**
- **Source checker:** re-check both patterns, and check F-gh-retention-02 against the changelog's raw HTML.
- **Chief of Staff:** put the four owner questions. The plan (B3) and the account type (A12) decide which options exist at all. The 90-day retention bears on owner question 3.

**6. Open questions**
- Research questions 1–5 and owner questions 1–4 above.
- On the checker's question about second sources for grade-B facts: F-gh-retention-02 now has the changelog plus the docs pages. They agree on the settings, but only the changelog says the change took effect. F-gh-perm-02 would still gain from a second page.
- No question needs a level-5 expert or a paid source.

Sources:
- [GitHub changelog 2026-10-01: Actions retention now covers checks, runs, and statuses](https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses)
- [GitHub changelog 2026-08-27: Actions retention will cover checks, workflow runs, and statuses](https://github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses)
- [GitHub Docs: Managing GitHub Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
- [GitHub Docs: Configuring the retention period in your organization](https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization)