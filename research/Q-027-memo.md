Brief update: I've read the source check. Two wording fixes are needed: A3's "no fine-grained token box" and the "notifications" string note. My fetch tool doesn't show the token boxes, so I'm going with the checker's raw-HTML reading. Next I'll write revision 3.

# Memo — Q-027 (revision 3): what access a cross-repository GitHub view needs, and what acting from it would add

*researcher · 2026-11-12 · depth 2 · topics: github, authentication, attribution, security, notifications, web-push, cloudflare, hosting, agents*

**How I read the pages.** My only fetch tool returns summaries. For each page I asked it to quote exact sentences or to say outright when a string is missing. It does **not** show the per-endpoint "Fine-grained access tokens for …" boxes on GitHub's REST pages. I checked again today: it reported no box on `rest/checks/runs` or on `rest/actions/workflow-runs`. The Source checker read the raw HTML and found boxes on both. My earlier claim that the check-run pages have no such box came from this tool gap, and it was wrong. The checker's raw-HTML reading wins wherever we disagree.

**Grades.** One page earns B. Two pages from the same vendor earn A, but only for how the product behaves. Claims about cost, risk or quality get no grade above C unless an independent source backs them. "Lib" means an existing library entry.

## Summary
- **Reading.**
  - A read-only fine-grained token can read workflow runs, commit statuses, pull requests, file contents, deployments, environments and pending deployments.
  - It **cannot** read check runs. GitHub says fine-grained tokens cannot call the Checks API. No check-run endpoint is on the list of endpoints those tokens accept. Each check-run endpoint's token box lists only GitHub App user and installation tokens.
  - A GitHub App can read check runs.
  - Neither option can read GitHub's notifications inbox, which accepts only a classic token. A classic token that can read private repositories can also write to them.
- **Retention.** GitHub announced that from 1 October 2026, checks, workflow runs and commit statuses would follow the Actions retention setting.
  - The default is 90 days. Public repositories can be set to 1–90 days, private ones to 1–400 days.
  - Before that date these records were kept for 400+ days.
  - I have not confirmed that the change took effect.
  - Records kept as files in the repositories are not affected.
- **Deploy approvals.** On Free, Pro and Team plans, required reviewers are available for public repositories only. Approving a pending deployment through the API needs a token with Deployments write, and the person using it must be a required reviewer.
- **Showing an action is the owner's.** Of the options GitHub documents, only a GitHub App user token both marks an action as the owner's and shows it was made through the app. A personal access token has the owner's own capabilities, and I found no documented marker that tells its actions apart.
- **Alerts from every repository.** A personal account cannot have an account-wide webhook. Each GitHub App has one webhook, which receives events from the repositories it has been granted access to.

## Revision log
| Item | Round 2 | Now | Basis |
|---|---|---|---|
| A3 | "the check-run endpoint pages have no fine-grained token box" | **Corrected.** Every endpoint on `rest/checks/runs` has a box. Each lists only "GitHub App user access tokens" and "GitHub App installation access tokens", with "Checks" permission. The conclusion (fine-grained tokens cannot use the Checks API) is unchanged and is now better supported. | checker's raw-HTML reading; my tool does not render these boxes |
| A2 | "no `notifications` string on that page" | **Corrected.** The word appears once, as a sidebar menu label. The page lists **no notifications endpoint**. | checker's raw-HTML reading |
| A17 | Check-run "1000" sentences disputed | **Settled.** The checker confirms all three sentences, written "1000" with no comma. | checker |
| B2 | Possible conflict: "read access" vs "Deployments" write | **Settled, no conflict.** The endpoint's own token box says Deployments (write), which is the token permission. "Read access" describes the reviewer's role. Research question 5 is closed (answered, not dropped). | checker's raw-HTML reading of the endpoint box; fine-grained table |
| Patterns | Rested on B14 (no independent source) and on an uncovered point | **Rewritten** to rest only on filed facts and library entries. B14 and the owner-presence point are moved out as open items (see Proposed library entries). | checker's reasons for not filing |
| Round-2 log row A3 | "The check-runs page has no fine-grained token box at all." | Withdrawn, as above. | — |

## A. Reading across repositories

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| A1 | Fine-grained token permissions: listing workflow runs needs "Actions" read; listing pull requests needs "Pull requests" read; reading file contents needs "Contents" read; listing deployments needs "Deployments" read; repository events need "Metadata" read. | fact | B | docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens |
| A2 | The list of endpoints that accept fine-grained tokens includes `GET …/commits/{ref}/status`, `GET …/commits/{ref}/statuses`, the `…/environments…` endpoints and `GET/POST …/actions/runs/{run_id}/pending_deployments`. It includes **no** `check-runs` or `check-suites` endpoint and **no notifications endpoint**. The word "notifications" appears only as a sidebar menu label. | fact | B | docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens |
| A3 | GitHub's list of unsupported uses includes "Using fine-grained personal access token to call the Checks API." On `rest/checks/runs`, each endpoint's "Fine-grained access tokens for …" box (for example, for "Get a check run") lists only "GitHub App user access tokens" and "GitHub App installation access tokens", with "Checks" permission. That agrees with A2. **Consequence (estimate):** with a fine-grained token, the desk sees CI state through workflow runs (Actions: read) and commit statuses, not through check runs. | fact; estimate (consequence) | A (two GitHub pages, plus A2) | docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens ; docs.github.com/en/rest/checks/runs ; A2 page |
| A3a | A GitHub App can read check runs. `GET …/commits/{ref}/check-runs` and `GET …/check-runs/{check_run_id}` need "Checks" read, with either user or installation tokens. | fact | B | docs.github.com/en/rest/authentication/permissions-required-for-github-apps |
| A4 | Notifications endpoints "only support authentication using a personal access token (classic)". They support Last-Modified/If-Modified-Since, a 304 reply and an X-Poll-Interval header. | fact | B | docs.github.com/en/rest/activity/notifications |
| A5 | A classic token covering private-repository code needs the `repo` scope, which gives full read and write. So reading notifications needs a credential that can also write. | fact (Lib) + estimate (conclusion) | B | Lib L-F12 |
| A6 | A fine-grained token covers one resource owner and can be limited to chosen repositories. It "has the same capabilities to access resources and perform actions on those resources that the owner of the token has, and is further limited by any scopes or permissions granted to the token." | fact | A | Lib L-F5 ; managing-your-personal-access-tokens |
| A7 | "The installation access token will expire after 1 hour." "You can list up to 500 repositories." It "cannot be granted permissions that the app was not granted," and the `permissions` parameter can narrow it further. A private App "can only be installed on the account that owns the app", which can be a personal account. | fact | B | …/generating-an-installation-access-token-for-a-github-app ; …/making-a-github-app-public-or-private ; Lib F-gh-02 |
| A8 | Rate limits: a fine-grained token and an App installation each get 5,000 requests/hour, and an App can grow to 12,500. GITHUB_TOKEN gets 1,000/hour per repository. A conditional 304 reply costs nothing. | fact | A | Lib F-gh-01, F-Q004-6, F-Q004-7 |
| A9 | Polling cost: about 3 calls × 6 repositories every 5 minutes ≈ 216 requests/hour, under 5% of 5,000. | estimate | — | arithmetic on A8; the repository count is assumed |
| A10 | The Events API holds at most 300 events from the past 30 days, with latency of "30s to 6h". | fact | B / A (latency, Lib) | docs.github.com/en/rest/activity/events ; Lib F-Q004-9 |
| A11 | Webhooks are "near real-time" but can take minutes. Order is not guaranteed. There are no automatic retries; manual redelivery is possible for 3 days. Receivers should answer within 10 s. One incident delayed deliveries by up to 40 minutes. | fact | A/B | Lib F-Q004-1, -2, -3a, -4, -12 |
| A12 | "You cannot create webhooks for individual user accounts, or for events that are specific to user resources, like personal notifications or mentions." "You can only create up to 20 webhooks that subscribe to each individual event type." | fact | B | docs.github.com/en/webhooks/types-of-webhooks |
| A13 | "Each GitHub App has a single webhook that is automatically created by GitHub." It receives events "in a repository or organization that the app has been granted access to". "The specific webhook events that you can select for your GitHub App registration are determined by the type of permissions you selected for your app." | fact | B | types-of-webhooks ; …/using-webhooks-with-github-apps |
| A14 | Availability by webhook type: `deployment_review` and `deployment_protection_rule` are App only, each needing "Deployments" read. `check_suite` reaches repository, organization and App webhooks and needs "Checks" read. `deployment_status` reaches repository, organization and App webhooks and needs "Deployments" read. **Not checked:** workflow_run, workflow_job, pull_request, pull_request_review, push, issues, issue_comment. | fact | B | docs.github.com/en/webhooks/webhook-events-and-payloads |
| A15 | The signature is in `X-Hub-Signature-256`, "always starts with `sha256=`", and uses HMAC-SHA256. "Never use a plain `==` operator"; use a "constant time" comparison. | fact | B | …/validating-webhook-deliveries |
| A16 | "By default, checks, workflow runs, commit statuses, and the artifacts and log files … are retained for 90 days." Public repositories: "between 1 day or 90 days". Private: "between 1 day or 400 days". "Starting October 1, 2026, these policies will apply to checks, workflow runs, and commit statuses…" "Until then … retained for 400+ days regardless of your configured retention period." **Not confirmed:** that the change took effect. | fact | A (docs page + changelog) | org retention docs page ; github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses |
| A17 | Workflow runs: "This endpoint will return up to 1,000 results for each search when using the following parameters: actor, branch, check_suite_id, created, event, head_sha, status." Check runs: "In a check suite, GitHub limits the number of check runs with the same name to 1000. Once these check runs exceed 1000, GitHub will start to automatically delete older check runs." And: "If there are more than 1000 check suites on a single git reference, this endpoint will limit check runs to the 1000 most recent check suites." | fact | B | docs.github.com/en/rest/actions/workflow-runs ; docs.github.com/en/rest/checks/runs |
| A18 | "The security log lists all actions performed within the last 90 days." | fact | B | …/reviewing-your-security-log |
| A19 | Trade-off. A read-only fine-grained token means one secret, no webhooks, freshness set by polling and no check runs (A3). A GitHub App gives one webhook, 1-hour tokens, readable check runs, the App-only deployment events and a larger request budget. In exchange there is a long-lived private key to guard and a receiver to run. Neither option reads the notifications inbox. | opinion | C | A1–A15 ; Lib L-F6, L-P1 |

## B. Acting from the view

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| B1 | Fine-grained permissions: `POST …/actions/runs/{run_id}/pending_deployments` needs "Deployments" write. `PUT …/pulls/{n}/merge` needs "Contents" write. `POST …/pulls/{n}/reviews` needs "Pull requests" write. `PUT …/contents/{path}` needs "Contents" write plus "Workflows" write. For a GitHub App, the pending_deployments row accepts both user and installation tokens. | fact | B | fine-grained and App permission tables |
| B2 | Approving a pending deployment needs two things. The token needs "Deployments" write: the endpoint's fine-grained box and the permissions table agree. The person needs the reviewer role: "Required reviewers with read access to the repository contents and deployments can use this endpoint." The two statements are about different things and do not conflict. | fact | B | docs.github.com/en/rest/actions/workflow-runs (endpoint box per the checker's raw-HTML reading; my tool does not show it) ; fine-grained permissions table |
| B3 | "If you are on a GitHub Free, GitHub Pro, or GitHub Team plan, required reviewers are only available for public repositories." The same applies to custom deployment protection rules. "Organizations with GitHub Team and users with GitHub Pro can configure environments for private repositories"; on Free, environments are limited to public repositories. | fact | A | …/deployments-and-environments ; …/manage-environments |
| B4 | "You can list up to six users or teams as reviewers." "Only one of the required reviewers needs to approve the job." With Prevent self-review on, "users who initiate a deployment cannot approve the deployment job, even if they are a required reviewer". "If a job is not approved within 30 days, it will automatically fail." | fact | A (self-review) / B (others; 30 days on control-deployments only) | deployments-and-environments ; …/review-deployments ; …/control-deployments |
| B5 | If the Orchestrator's runs are started with the owner's identity and Prevent self-review is on, the owner could not approve those runs. | estimate | — | B4 |
| B6 | A personal access token has the owner's capabilities (A6). I found no documented marker that tells its actions apart from the owner's own. | fact / not documented | B | managing-your-personal-access-tokens |
| B7 | An installation token acts as name[bot]. A user token acts as the user, shown with the App's badge, and is logged as a user-to-server token. User tokens last 8 hours and their refresh tokens 6 months. | fact | A | Lib L-F1, L-F2, L-F10, L-F11 ; B8 page |
| B8 | "A GitHub App user access token only has permissions that both the user and the app have." The `repository_id` parameter can narrow it to one repository. Browser apps use the web application flow. | fact | B | …/generating-a-user-access-token-for-a-github-app |
| B9 | "GitHub will automatically use GPG to sign commits you make using the web interface. Commits signed by GitHub will have a verified status." A verifiable bot signature is marked verified. **Open:** whether commits made through the REST API with an App user token are signed. | fact / open | B | …/about-commit-signature-verification |
| B10 | Attribution separates the owner from agents only if agents never act with the owner's identity. | opinion | C | B6, B7 |
| B11 | To keep the acting credential out of agents' reach, something outside the agent attaches it. | fact (Lib) | A | Lib LIB-P-a |
| B12 | "Secret values are not visible within Wrangler or Cloudflare dashboard after you define them." Secrets Store, which the page describes as beta in the Worker context, provides account-level secrets. | fact | B | developers.cloudflare.com/workers/configuration/secrets/ |
| B13 | A GitHub App private key opens every installation and does not expire. Keep it sign-only, in a vault. | fact (Lib) | A/B | Lib L-F6, L-P1 |
| B14 | A credential held as an Actions secret in a repository where agents can edit workflows is within their reach. Holding it at Cloudflare puts it in an account agents are not given. | estimate (risk) | — (no independent source) | Lib L-F9, L-F12 ; B12 |
| B15 | Pattern, if actions are wanted: a separate GitHub App with the B1 minimum; act only with the owner's user token (B7, B8); attach the credential outside the agents (B11); gate the view with Access (P-auth-01, F-cf-05). **Not covered by any source I opened:** proving the owner was present for each action rather than once at sign-in. | opinion | C | B1, B7, B8, B11 ; Lib P-auth-01, F-cf-05 |

## C. Phone alerts from every repository

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| C1 | Copying the sender into each repository: each copy needs the key and the subscription list. Schedules run at most every 5 minutes and may be delayed or dropped under load. The limit is 1,000 requests/hour per repository. | fact | A | Lib F-gh-12, F-gh-12b, F-Q004-6 |
| C2 | One central poller holding the read credential, at the cost in A9. Cron needs a Worker, because Pages has no Cron Triggers. | fact + estimate | A / — | Lib F-cf-cron-01 ; A9 |
| C3 | Send the GitHub App's single webhook (A13) to a Worker, with a backup poll because of A11. Without an App, each repository needs its own webhook (A12). | fact + opinion | B / C | A11–A13 ; Lib PAT-Q004-1 |
| C4 | GitHub Mobile push covers review requests, deployment approvals, assignments and mentions. It does not cover file records. | fact + estimate | A / — | Lib F-gh-11 |
| C5 | `repository_dispatch` (`POST /repos/{owner}/{repo}/dispatches`) needs "Contents" write for fine-grained tokens and for App user and installation tokens. So every repository would hold a credential with Contents write on the sender's repository. That credential could also change the sender's code, unless the sender lives in a repository used for nothing else (estimate). | fact; estimate (consequence) | A | fine-grained and App permission tables ; docs.github.com/en/rest/repos/repos |
| C6 | Web Push needs a VAPID key pair and per-subscription encryption. Payloads are at most 4 KB, iOS must show every push, and subscriptions expire. | fact | A | Lib F-webpush-02, -03, -04, -05 |

## D. What data leaves the repositories

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| D1 | "The timing and length of communication cannot be hidden from the push service… the push service will see which application server is talking to which user agent and the subscription that is used." "No HTTP header fields are protected by the content encoding scheme." On iPhones the push service is Apple's. | fact | B | rfc-editor.org/rfc/rfc8291 ; Lib F-webpush-02 |
| D2 | KV "stores data in a small number of centralized data centers, then caches that data in Cloudflare's data centers after access." No jurisdiction is stated. | fact | B | developers.cloudflare.com/kv/concepts/how-kv-works/ |
| D3 | Durable Object jurisdictions are eu, us and fedramp. "Hints are a best effort and not a guarantee." "Durable Objects do not currently change locations after they are created." | fact | B | developers.cloudflare.com/durable-objects/reference/data-location/ |
| D4 | What leaves under each option: polling that passes data straight through stores nothing at Cloudflare. A cache keeps copies (D2/D3). Webhooks send full payloads to the receiver. Alerts pass through Apple, which sees the metadata in D1. | opinion | C | D1–D3 |

## Field scan
GitHub's own channel (C4) is in the library. I have **not** surveyed third-party dashboards that span several repositories. That is still undone.

## Proposed library entries
The 16 fact entries were filed by the Source checker on 2026-11-12 and are not proposed again. Only the two patterns are resubmitted, rewritten so they rest only on filed facts and library entries. B14 and the owner-presence gap are taken out of them:
```
P-gh-owner-action-01 | pattern (opinion) | If actions are wanted from the view: a separate GitHub App limited to the minimum permissions (Deployments write to approve; Contents write to merge; Pull requests write to review); act only with the owner's App user token (acts as the user with the App's badge; permissions = intersection of user and App; narrowable by repository_id); attach the credential outside any agent session; gate the view with Cloudflare Access on the owner's email. Does not by itself prove the owner was present for each action. | C | github, attribution, security, agents | 6 mo | rests on F-gh-perm-02, F-gh-app-tokens-02, L-F1, L-F2, LIB-P-a, P-auth-01, F-cf-05
P-gh-cross-repo-alerts-01 | pattern (opinion) | For alerts from every repository: one receiver (the GitHub App's single webhook to a Worker), backed by a conditional poll because webhooks are not retried; GitHub Mobile for GitHub-native events (reviews, deployment approvals); senders' keys held in one place rather than copied per repository. | C | notifications, github, web-push | 6 mo | rests on F-gh-webhook-types-01, F-Q004-3a, F-gh-11, F-cf-cron-01, F-gh-12
```

## Questions added
**Research questions (neutral):**
1. Did GitHub's Actions retention change take effect on 2026-10-01, and what happened to records already older than the setting?
2. Are commits made through the REST contents API with a GitHub App user token signed and shown as verified?
3. Which documented ways can prove the owner was present for each action, rather than once at sign-in?
4. Which third-party tools show workflow runs, pull requests and deployments across several repositories, and which credentials do they ask for?
5. Is there an independent source on whether credentials held as Actions secrets are reachable by agents that can edit workflows (B14)?

(Round 2's research question 5 on B2 is answered; see B2.)

**Owner questions (plain language):**
1. Are the project repositories under your personal GitHub account or under an organization?
2. Which GitHub plan are they on?
3. How far back should timeline links to GitHub runs keep working?
4. Is it acceptable for copies of project records to be stored at Cloudflare?

---

**1. What I changed**
- **A3:** corrected. The `rest/checks/runs` page *does* have a fine-grained token box on every endpoint. Each box lists only App user and installation tokens, with Checks permission. The conclusion is unchanged. The round-2 log row with the wrong wording is withdrawn.
- **A2:** "notifications" appears once, as a sidebar label. I now say that no notifications endpoint is listed, not that the string is absent.
- **A17 and B2:** marked settled, using the checker's raw-HTML reading. Round 2's research question 5 is closed as answered. A new question 5 asks for an independent source for B14.
- **The two patterns:** rewritten to rest only on filed facts and library entries. The "owner present" gap is stated as a limit inside the pattern, not as support for it. B15 is trimmed to match.
- **Proposed library entries:** the 16 facts already filed are no longer re-proposed.

**2. Why:** The source check failed the memo on one statement a cited page contradicts (A3 and the round-2 log), plus the minor slip in A2. The two patterns were not filed because they leaned on B14 and on an admitted gap.

**3. What I verified:** These were page fetches; I have no shell.
- I fetched `docs.github.com/en/rest/checks/runs` and asked for the "Fine-grained access tokens for …" boxes. The tool said it found none, only the classic-token `repo` scope note.
- I fetched `docs.github.com/en/rest/actions/workflow-runs` and asked for the box on "Review pending deployments". The tool again found no box and returned only the "Required reviewers with read access…" sentence.
- So my tool does not show these boxes, which explains the round-2 error. For the box contents I rely on the checker's raw-HTML reading and mark them that way (A3, B2).
- I read library entries P-auth-01, F-cf-04, F-cf-05, F-gh-perm-02 and F-gh-fgpat-limits-01 to make sure the rewritten patterns rest on what they actually say. The pattern now cites F-cf-05 (Worker-level Access covers every hostname) and P-auth-01 (Access policy with Emails = the owner). F-cf-04 is dropped because it concerns Pages preview protection, which the pattern doesn't need.

**4. What is undone:**
- The field scan of third-party cross-repository tools.
- Research questions 1–5.
- Availability of the A14 events I cut.
- The App permission rows for merge, reviews and contents.
- I still have no verbatim reading of any page.

**5. What is needed outside my lane:**
- The Source checker should re-check A2, A3, B2 and the two rewritten patterns.
- The Chief of Staff should put the four owner questions. The plan (B3) and the account type (A12) decide which options exist at all.

**6. Open questions:**
- Research questions 1–5 and owner questions 1–4 above.
- On the checker's question of a second page for single-page B entries, I have no preference. A second source would matter most for F-gh-retention-01 (whether the change took effect) and F-gh-perm-02.
- No question needs a level-5 expert or a paid source.