# Q-004 research memo: detecting changes in private GitHub repositories

**Date:** 2026-10-01 · **Depth:** 3 (graded memo) · **Topics:** github, webhooks, polling, latency

**Grades:**
- **A**: GitHub's own documentation, fetched today.
- **B**: a named, dated outside measurement or a GitHub incident report.
- **C**: a search snippet or secondary blog that I could not fetch in full.

**Labels:** each statement is marked **F** (fact), **E** (estimate) or **O** (opinion).

---

## 1. What I changed
I changed no files; I have no write tool. This memo, with the proposed library entries in §R, is my output. The Orchestrator records it in research/, and the Source checker files the entries that pass.

## 2. Why
Q-004 asks how fast and how reliably a web app can detect changes across 5 private repositories, comparing webhooks, polling and any other documented route. The answer feeds the Service Desk freshness target and its change-detection design. The folder held no existing library entries on these topics, so everything below comes from a fresh field scan.

## 3. What I verified (fetches and results)

### R1. Webhooks (repository, organisation, GitHub App)

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| W1 | GitHub calls webhooks "near real-time". | F | A | [About webhooks](https://docs.github.com/en/webhooks/about-webhooks) |
| W2 | "Webhook deliveries can take a few minutes to be delivered and to appear in the recent deliveries log." | F | A | [Troubleshooting webhooks](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/troubleshooting-webhooks) |
| W3 | In normal running, one vendor measured delivery delay at p50 28.44 s and p95 37.15 s across PR, review, check-run, status and push events. During incidents, check-run deliveries reached about 40 min, and pull_request opened/synchronize hit a 5-minute p95 for hours. Their method (payload timestamp vs. arrival time) may add a few seconds. | F (one vendor's data) | B | [Mergify, 2026-04-29](https://mergify.com/blog/what-github-webhook-latency-actually-looks-like/) |
| W4 | On 2026-02-03, push webhooks were delayed by up to 40 min, averaging 10 min. | F | B | [GitHub incident thread #186279](https://github.com/orgs/community/discussions/186279) |
| W5 | On 2026-06-11, average delivery delay peaked at about 3.4 min, with p99 up to 62 min, and "no events were lost". I saw this only in a search snippet; the page itself returned HTTP 402. | F | C | [githubstatus on X](https://x.com/githubstatus/status/2070576653814616292) |
| W6 | On 2026-08-26, an Actions incident built up a queue of webhook events that was not fully cleared until 17:40 UTC. | F | B | [githubstatus history feed](https://www.githubstatus.com/history.atom) |
| W7 | GitHub publishes no delivery-time guarantee (SLA) for webhooks. I found none in the docs I fetched. | F (absence) | B | the four docs pages above |
| W8 | "GitHub does not automatically redeliver failed deliveries." | F | A | [Handling failed deliveries](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries) |
| W9 | Failed deliveries can be redelivered by hand or by REST API, but only within the past 3 days. Repository webhooks need repo admin rights to do this; GitHub App webhooks need the app owner or an app manager. | F | A | [Redelivering webhooks](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/redelivering-webhooks) |
| W10 | The API can list a hook's deliveries and redeliver one, so a job can find and replay failures. | F | A | [REST: repository webhooks](https://docs.github.com/en/rest/repos/webhooks) |
| W11 | The receiver must answer with a 2xx within 10 s, otherwise the delivery counts as failed. GitHub advises queueing the payload and processing it later. | F | A | [Best practices](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks) |
| W12 | X-GitHub-Delivery identifies each event, and a redelivery keeps the same ID, so it can be used to drop duplicates. | F | A | same |
| W13 | The docs I read say nothing about delivery order. | F (absence) | B | same |
| W14 | Payloads are capped at 25 MB; above that, nothing is delivered. No push event is created when more than 5,000 branches, or more than 3 tags, are pushed at once. A push payload lists at most 2,048 commits. | F | A | [Webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads) |
| W15 | Repository and organisation webhooks receive only the check_run `created` and `completed` actions. GitHub Apps also receive `rerequested` and `requested_action`. | F | A | same |
| W16 | The receiving URL cannot be localhost. Self-signed certificates and incomplete certificate chains cause failures. | F | A | Troubleshooting webhooks |
| W17 | I could not confirm from the docs that each commit in a push payload lists its added, modified and removed files. Until checked, assume a follow-up API call is needed to see which folders changed. | F (gap) | — | Payload docs |

### R2. Polling the REST API

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| P1 | Hourly limits: personal token 5,000. GitHub App installation 5,000 base, rising by 50 per repo above 20 repos and per user above 20 users, up to 12,500 (15,000 on Enterprise Cloud). GITHUB_TOKEN in Actions 1,000 per repo. Unauthenticated 60. | F | A | [REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) |
| P2 | Secondary limits: at most 100 concurrent requests (shared with GraphQL), 900 points per minute, 90 s of CPU per 60 s. | F | A | same |
| P3 | A conditional request that returns 304 does not count against the hourly limit, but only if it carries an `Authorization` header. GitHub says to prefer webhooks and to poll only on a fixed schedule. | F | A | [REST best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api) |
| P4 | `GET /commits` accepts `sha`, `path` ("only commits containing this file path") and `since` filters. A single commit lists at most 300 files per page and 3,000 in total. | F | A | [REST commits](https://docs.github.com/en/rest/commits/commits) |
| P5 | Worst-case polling delay is the poll interval plus request and processing time. Typical delay is about half the interval. | E | — | follows from P1–P4 |

**P6. Rate-limit arithmetic for 5 repos (E).**

Assumptions per repo per poll:
- 1 request for the default-branch head.
- 1 request for the pull request list (sorted by `updated`).
- 1 request for check runs per open PR head; assume 5 open PRs.

That gives 8 requests per repo, so 40 per poll in the worst case where nothing returns 304. A follow-up comparison call (or `?path=` calls) is needed only when the head has changed.

| Interval | Polls per hour | Requests per hour, nothing cached | % of 5,000 | Minimal design (head + PR list only) |
|---|---|---|---|---|
| 1 min | 60 | 2,400 | 48% | 600 (12%) |
| 5 min | 12 | 480 | 9.6% | 120 (2.4%) |
| 15 min | 4 | 160 | 3.2% | 40 (0.8%) |

- With conditional requests, unchanged resources cost 0, so real usage would be well below these figures.
- A 40-request burst per minute is far under the 900-points-per-minute secondary limit. I am assuming a GET costs 1 point; I did not verify that.
- If one token is shared with other features, the 1-minute unconditional case is the only one that comes near the limit.

### R3. Polling the GraphQL API

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| G1 | Hourly points: 5,000 per user (10,000 on Enterprise Cloud). App installations get 5,000 scaling to 12,500 (10,000 on Enterprise Cloud). Actions gets 1,000 per repo. Every call costs at least 1 point; cost is the sum of connection requests ÷ 100. Secondary limit is 2,000 points per minute; `first`/`last` max 100; at most 500,000 nodes per query. | F | A | [GraphQL limits](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api) |
| G2 | GraphQL does not support ETag conditional requests, so every poll costs points even when nothing changed. GitHub's limits page does not mention conditional requests. The secondary claim comes from a blog I could not open (HTTP 403). | F | C | search result citing [Jamie Magee](https://jamiemagee.co.uk/blog/making-the-most-of-github-rate-limits/) |

**G3. GraphQL cost for 5 repos (E).** One query can cover all 5 repos.

- **Light query** (head commit, 20 PRs, and each PR's overall check status via `statusCheckRollup`): about 1 point.
  - 1 min: about 60 points/h. 5 min: about 12. 15 min: about 4.
- **Heavy query** (every check run listed per PR, about 12 points):
  - 1 min: 720 points/h (14%). 5 min: 144. 15 min: 48.

### R4. Other documented routes

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| O1 | The repository Events API is polled with ETag (304s are free) at the rate given in the `X-Poll-Interval` header (example: 60 s, longer under load). GitHub states it "is not built to serve real-time use cases… event latency can be anywhere from 30s to 6h." It returns at most 300 events and only from the last 30 days. | F | A | [REST events](https://docs.github.com/en/rest/activity/events) |
| O2 | A GitHub Actions workflow in each repo can run on push (with `paths` filters) or pull_request and call the app. It is subject to the same event-creation limits as push webhooks, and it is delayed by Actions incidents (see W6). | F | A | [Workflow triggers](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) |
| O3 | The Actions route also needs a workflow file and a secret in every repo, and uses Actions minutes on private repos. It adds nothing that an organisation webhook or GitHub App webhook doesn't already give. | O | — | — |

### R5. What must be hosted

- **E/O: Webhooks** need a public HTTPS endpoint that is always on, has a valid certificate chain and answers in under 10 s (W11, W16). Behind it you need a queue or worker and duplicate removal by delivery ID.
  - A GitHub App uses one URL for all installations.
  - Repository webhooks need one hook per repo; an organisation webhook needs one per org.
  - I did not check signature verification of payloads, so I can't cite it here (see §6).
- **E: Polling** needs no inbound endpoint: a scheduled worker, safe token storage and a store for ETags and last-seen SHAs.

### R6. Synthesis (O, my judgement for the Source checker and the decision owner)

- **Webhooks alone** give typical freshness of seconds to under a minute. In incidents, delay reaches tens of minutes, about an hour at the tail. Deliveries the receiver misses are never retried, and replay is possible only for 3 days.
- **Polling alone** gives a freshness bound you control (the interval) as long as the GitHub API itself is healthy. Rate limits do not constrain 5 repos at any of the three intervals, especially with conditional REST requests or one GraphQL query.
- **Recommended pattern: webhooks (GitHub App) plus a reconciliation poll** at 5–15 min. A 1-minute conditional REST poll is also affordable.
  - Worst-case freshness becomes roughly the poll interval, typical freshness stays under a minute, and missed deliveries heal on their own.
  - A freshness target of "≤ 1 min typical, ≤ poll interval worst case" is defensible. A hard target under 1 minute is not guaranteed by any route.
- **Do not use the Events API** for freshness: its stated latency is 30 s to 6 h.

---

## Proposed library entries

**Fact entries:**

| ID | Fact | Grade | Shelf life | Topics |
|---|---|---|---|---|
| F-Q004-1 | GitHub does not automatically retry failed webhook deliveries; replay by UI or API only within 3 days (W8, W9). | A | 12 mo | github, webhooks |
| F-Q004-2 | Webhook receivers must return 2xx within 10 s (W11). | A | 12 mo | webhooks |
| F-Q004-3 | GitHub docs: webhook deliveries "can take a few minutes"; no delivery-time guarantee found (W2, W7). | A/B | 6 mo | webhooks, latency |
| F-Q004-4 | 2026 incidents delayed webhooks by tens of minutes, up to a reported 62 min at p99 (W4–W6). | B/C | 3 mo | webhooks, latency |
| F-Q004-5 | Measured normal-running webhook delay: p50 about 28 s, p95 about 37 s (Mergify, April 2026) (W3). | B | 6 mo | webhooks, latency |
| F-Q004-6 | REST hourly limits and secondary limits (P1, P2). | A | 6 mo | github, polling |
| F-Q004-7 | Authorised 304 responses are free against the REST hourly limit (P3). | A | 12 mo | polling |
| F-Q004-8 | GraphQL point limits and cost formula (G1). | A | 6 mo | polling |
| F-Q004-9 | Events API latency is 30 s to 6 h; not for real-time use (O1). | A | 12 mo | polling, latency |
| F-Q004-10 | Push events are not created above 5,000 branches or 3 tags at once; push payload commits capped at 2,048; payloads over 25 MB are not delivered (W14). | A | 12 mo | webhooks |
| F-Q004-11 | Repository and organisation webhooks get only the check_run `created`/`completed` actions; GitHub Apps get all (W15). | A | 12 mo | webhooks |

**Pattern entry:**

| ID | Pattern | Grade | Shelf life | Topics |
|---|---|---|---|---|
| PAT-Q004-1 | "Webhook plus reconciliation poll": take events through a GitHub App webhook (answer fast, queue the work, drop duplicates by delivery ID), and run a conditional REST poll or a single GraphQL query every N minutes to catch missed or delayed events. Worst-case freshness is about N while GitHub's API is up. | O, built on A facts | 12 mo | github, webhooks, polling, latency |

## 4. What is undone
- I did not check from the docs that push payload commits list added/modified/removed files (W17).
- I did not verify that REST GET requests cost 1 point under the secondary limit.
- I did not confirm the signature header and its verification for payloads.
- Delivery order is undocumented.
- I could not fetch the 2026-06-11 incident text (W5, HTTP 402) or the GraphQL ETag blog (G2, HTTP 403).
- I did not measure latency myself; running experiments is outside my role.

## 5. Needed outside my lane
- **Orchestrator:** record this memo in research/.
- **Source checker:** re-check the A-graded facts, and try to upgrade W5 and G2 to first-party sources.
- **Orchestrator / pack owner:** this pack also contains `.env*` files, npm/yarn/pnpm/bun config and lockfiles, and `.gitmodules`. None of these belong to a research pack. I did not open them; please remove them from the pack (D-006).
- No library entries sharing these topics were given to me. If any exist, please send them so this memo can be checked against them.

## 6. Open questions (added; none closed)
1. Do push payload commits include per-file lists, so folder changes can be detected without an extra API call?
2. Does GitHub guarantee or document delivery order? If not, should the design order events by timestamp or SHA?
3. Are all 5 repos in one organisation? That decides whether an organisation webhook is enough or a GitHub App is needed for full check_run actions.
4. Is a measured latency trial (webhook arrival vs. commit time over a few weeks) worth commissioning? It would be an experiment for another role.
