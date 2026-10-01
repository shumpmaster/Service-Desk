# Library entries from Q-004 (filed by source-checker, 2026-10-01)
Checked-on: 2026-10-01. Sources opened by: source-checker (fetched today). Single first-party source each (GitHub docs).

| ID | Kind | Fact | Grade | Shelf life | Topics | Source opened |
|---|---|---|---|---|---|---|
| F-Q004-1 | fact | GitHub does not automatically redeliver failed webhook deliveries; manual/API redelivery only for deliveries in the past 3 days. | A | 12 mo | github, webhooks | docs.github.com handling-failed-webhook-deliveries; redelivering-webhooks |
| F-Q004-2 | fact | Webhook receivers should answer 2XX within 10 seconds. | A | 12 mo | webhooks | docs.github.com best-practices-for-using-webhooks |
| F-Q004-6 | fact | REST hourly limits (PAT 5,000; App 5,000 base up to 12,500, 15,000 Enterprise Cloud; Actions 1,000/repo; unauth 60) and secondary limits (100 concurrent shared with GraphQL, 900 points/min, 90 s CPU/60 s). | A | 6 mo | github, polling | docs.github.com rate-limits-for-the-rest-api |
| F-Q004-7 | fact | A conditional request returning 304 does not count against the primary limit if sent with an Authorization header. | A | 12 mo | polling | docs.github.com best-practices-for-using-the-rest-api |
| F-Q004-9 | fact | Events API: "not built to serve real-time use cases... event latency can be anywhere from 30s to 6h". | A | 12 mo | polling, latency | docs.github.com rest/activity/events |
| F-Q004-10 | fact | Push events not created for >5,000 branches or >3 tags at once; push commits array max 2,048; payloads over 25 MB not delivered. | A | 12 mo | webhooks | docs.github.com webhook-events-and-payloads |
| F-Q004-11 | fact | Repo/org webhooks receive only check_run created and completed; GitHub Apps also get requested_action and rerequested. | A | 12 mo | webhooks | docs.github.com webhook-events-and-payloads |
| F-Q004-8 | fact | GraphQL primary limits: 5,000 pts/h per user (10,000 Enterprise Cloud); 5,000 per app installation scaling to 12,500 (10,000 Enterprise Cloud); 1,000/h per repo for GITHUB_TOKEN in Actions (15,000 enterprise). Cost = requests needed per unique connection (first/last at max) ÷ 100, rounded; min 1. Secondary 2,000 pts/min; max 500,000 nodes; first/last 1–100. The page does not mention conditional requests/ETags. | A | 6 mo | github, polling | docs.github.com rate-limits-and-query-limits-for-the-graphql-api (opened 2026-10-01) |
| F-Q004-4 | fact | GitHub incident thread: on 2026-02-03, 14:00–17:40 UTC, push webhook deliveries were delayed by up to 40 minutes, average 10 minutes. (Single incident; the 2026-08-26 claim is NOT filed, see check result.) | B | 12 mo | github, webhooks, latency | github.com/orgs/community/discussions/186279 (opened 2026-10-01) |
