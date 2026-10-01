# Q-004 revision (round 2): the revised memo is below, after the six-part contract

**Main result:** the four failed entries have been narrowed or re-sourced. Two still depend on a second check from the Source checker: the Mergify event types and an independent second latency source. The round-1 memo is not in this pack, so I rebuilt the memo from the question, the source-check report and today's fetches.

## 1. What I changed
- **F-Q004-8 (GraphQL limits):** re-fetched the page and re-proposed the entry with the page's own wording, including the per-user and Actions limits and the two-step cost method.
- **F-Q004-4 (incidents):** dropped W5 (the June 11 incident). The 2026-02-03 incident (W4) is now re-proposed against GitHub's own incident thread. W6 is carried over as round 1 confirmed it.
- **F-Q004-5 (Mergify):** downgraded to a single-vendor estimate (grade C). It is no longer offered as a fact the decision can rest on. I removed the event list I had added myself, changed "average" to the page's p50/p95, and added the caveat that slow external CI systems explain many late check-run arrivals.
- **F-Q004-3 (delivery time):** split in two. The "can take a few minutes" quote stays as a fact. The "no delivery-time guarantee" part is now an opinion, limited to the pages I read.
- **G2 (GraphQL ETags):** taken out of the facts. It is now an opinion with no grade, and nothing depends on it.
- **PAT-Q004-1 (the pattern):** rebuilt so that it rests only on facts that were filed or are re-proposed.
- **W12 (redelivery ID):** settled by quoting the page.
- **W7:** now names its four pages.

## 2. Why
Each change answers one point in `research/Q-004-source-check.md`:
- I can't prove a claim that something is absent, so those claims become opinions.
- A single vendor doesn't meet the two-source rule.
- Sources that couldn't be opened (x.com, the Magee blog) are removed.

## 3. What I verified (fetches made today, 2026-10-01)
- **GraphQL limits page:** gives 5,000 points/h per user (10,000 on Enterprise Cloud), 5,000 per app installation scaling up to 12,500 (10,000 on Enterprise Cloud), and 1,000/h per repo for GITHUB_TOKEN in Actions (15,000 for enterprise). The cost method is: "Add up the number of requests needed to fulfill each unique connection… Divide the number by 100 and round the result to the nearest whole number". It also gives a minimum cost of 1, 2,000 points/min, 500,000 nodes, and `first`/`last` of 1–100. The page says nothing about conditional requests.
- **Webhooks best-practices page:** "If you request a redelivery, the `X-GitHub-Delivery` header will be the same as in the original delivery." It gives no guidance on delivery order.
- **Redelivering-webhooks page:** past 3 days only. Who may redeliver: repo admin, org owner, or app owner/manager.
- **Incident thread 2026-02-03** (github.com/orgs/community/discussions/186279, posted by github-actions[bot]): "Webhook deliveries for push events were delayed by up to 40 minutes, with an average delay of 10 minutes", 14:00–17:40 UTC.
- **June 11 incident (W5):** it is not in GitHub's June 2026 availability report. Vantaj gives "~160 min", which conflicts with the 98 minutes in the x.com snippet (19:28–21:06). I could not open x.com, so W5 is dropped.
- **Mergify page:** p50 28.44 s and p95 37.15 s at 11 events/s. My fetch says it names "nine event types… pull requests, reviews, check-runs, workflows, status updates, and push events". **This conflicts with round 1, which found no event types named**, so it needs a second look. The figures measure time from GitHub's timestamp to Mergify receiving the event, so slowness on Mergify's own side counts in them. On 2026-04-27 it rose to about 40 min during a check-run incident.
- **Second latency source:** none first-party found.
  - devactivity.com cites "~5 s baseline, ~160 s peak" for a 2026-03-18 incident, but links no source. That incident is not in GitHub's March 2026 report. Not proposed.
  - Community discussion #173189 reports one user's delays of up to 7.5 h after months with no pushes. Unanswered by GitHub staff, and it is a single user's report. Listed as a lead only.
- **GraphQL ETag:** I found only third-party GitHub issues, no GitHub source.
- **Files I did not open:** the `.env*` files, lockfiles and package manager config in this pack. They have nothing to do with the question.

## 4. What is undone
- W6 and the round-1 W1/W8–W16/P1–P4/O1–O2 rows are carried over without being re-fetched. The checker already confirmed them, and the round-1 memo's URLs aren't in this pack.
- There is still no independent second measurement of normal (non-incident) webhook latency.
- No SLA page has been checked.

## 5. What is needed outside my lane
- **Source checker:** check F-Q004-8, F-Q004-4 (W4 only, plus W6) and F-Q004-3a again. Re-open the Mergify page to settle the event-type conflict.
- **Orchestrator:** record this memo in `research/`.
- **Chief of Staff:** if the owner needs a contractual figure, the next step is a question to GitHub Support / Enterprise sales or a review of the Enterprise Cloud SLA. That is a decision card for the owner.

## 6. Open questions
1. Does the GitHub Online Services SLA (Enterprise Cloud) cover webhook delivery time? (Not researched.)
2. Has anyone published an independent measurement of normal webhook latency?
3. Do webhooks really slow down on repos that have been idle for a long time (#173189)?
4. Is `library/` the right place to file? This repeats the source checker's question.

---

# Memo — Q-004 (revised 2026-10-01, round 2)

**Question:** how quickly and how reliably can changes in private GitHub repositories be detected? The answer feeds the freshness target and the design for detecting changes. Depth 3. Topics: github, webhooks, polling, latency.

**Grades:**
- **A** — GitHub docs.
- **B** — a GitHub first-party incident post (one event).
- **C** — a single third party.

**Labels:** F = fact, E = estimate, O = opinion.

## Webhooks
| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| W1 | Docs describe delivery as "near real-time" | F | A | webhooks docs (checked in round 1) |
| W2 | Delivery "can take a few minutes" | F | A | webhooks docs (checked in round 1) |
| W4 | 2026-02-03, 14:00–17:40 UTC: push webhooks delayed up to 40 min, 10 min on average | F | B | github.com/orgs/community/discussions/186279 |
| W6 | 2026-08-26: "queue of webhook events was fully burned down at 17:40 UTC" | F | B | as checked in round 1 |
| W3 | Normal latency at one vendor: p50 28 s, p95 37 s at 11 events/s. Measured from GitHub's timestamp to the vendor receiving it, so the vendor's own delays count. Slow external CI explained many late check-runs. During an incident (2026-04-27) check-run p95 reached about 40 min | E | C | mergify.com/blog/what-github-webhook-latency-actually-looks-like/ (event types disputed, re-check) |
| W7 | Among the pages I read, I found no promised delivery time or delivery order. **The four pages:** best-practices-for-using-webhooks, handling-failed-webhook-deliveries, redelivering-webhooks, webhook-events-and-payloads | O | — | those four pages |
| W8–W10 | No automatic redelivery. Manual or API redelivery for the past 3 days by an admin, org owner or app owner/manager. List-deliveries and redeliver endpoints exist | F | A | handling-failed…, redelivering-webhooks |
| W11 | Answer 2XX within 10 s and queue the payload | F | A | best-practices |
| W12 | "If you request a redelivery, the `X-GitHub-Delivery` header will be the same as in the original delivery." So a redelivery can be matched to the original. Record an ID only after the delivery has been processed successfully, so that a redelivery after a failure is not dropped | F (quote) + O (advice) | A | best-practices |
| W14–W16 | 25 MB, 5,000 branches, 3 tags and 2,048 commits limits. check_run actions by hook type. No localhost; certificate failures | F | A | webhook-events-and-payloads, etc. |
| W17 | The payload page does not say whether push commits list added, modified and removed files | gap | — | — |

**What must be hosted:** a public HTTPS endpoint (W16) that answers within 10 s (W11).

## Polling
| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| P1 | REST limits as in F-Q004-6 | F | A | rate-limits-for-the-rest-api |
| P2 | A 304 sent with an Authorization header doesn't count against the primary limit | F | A | best-practices-for-using-the-rest-api |
| G1 | GraphQL limits as in F-Q004-8 below | F | A | rate-limits-and-query-limits-for-the-graphql-api |
| G2 | GraphQL appears to have no ETag/304 mechanism. GitHub's GraphQL limits page doesn't mention one; only third-party issues say so | O | — | (no first-party source) |
| E1 | **Budget for 5 repos at about 3 REST calls per repo per poll** (commits, pulls, check-runs): 900 requests/h at 1 min, 180/h at 5 min, 60/h at 15 min. All are well under 5,000/h, and 304s are free (P2). The detection delay is about the polling interval plus the call time | E | — | arithmetic on P1/P2 |
| O1 | Events API: "not built to serve real-time use cases", latency 30 s to 6 h | F | A | rest/activity/events |

**What must be hosted:** a scheduled worker. No public inbound endpoint is needed.

**Leads, not proposed:**
- W5 (June 11): only an x.com snippet, and the durations conflict.
- devactivity "~5 s baseline": no source given.
- Community #173189: one user's 7.5 h delay on an idle repo.

## Proposed library entries
- **F-Q004-3a** (fact, A, 12 mo, webhooks/latency): GitHub docs say webhook delivery "can take a few minutes".
- **F-Q004-4** (fact, B, 12 mo, webhooks/latency): GitHub incident posts record webhook delays of up to 40 min (push, 2026-02-03, average 10 min) and a backlog drained by 17:40 UTC on 2026-08-26.
- **F-Q004-5** (estimate, C, 6 mo, webhooks/latency): one vendor (Mergify) measured normal p50 28 s / p95 37 s, from GitHub's timestamp to its own receipt. Single source, not for load-bearing use.
- **F-Q004-8** (fact, A, 6 mo, github/polling): GraphQL primary limits are:
  - 5,000 pts/h per user (10,000 on Enterprise Cloud);
  - 5,000 per app installation, scaling up to 12,500 (10,000 on Enterprise Cloud);
  - 1,000/h per repo for GITHUB_TOKEN (15,000 for enterprise).

  Cost = the number of requests needed for each connection, assuming `first`/`last` at their maximum, ÷ 100, rounded; minimum 1. Secondary limit 2,000 pts/min; at most 500,000 nodes; `first`/`last` 1–100.
- **PAT-Q004-1** (opinion, 6 mo, webhooks/polling):
  - Use webhooks for speed: normally seconds to minutes (F-3a, F-5).
  - Back them with a REST conditional-request reconcile poll, because:
    - GitHub doesn't redeliver failed deliveries (F-1);
    - incidents have delayed webhooks by tens of minutes (F-4);
    - 304s are free (F-7) and the cost fits easily in the rate limits (F-6, E1).
  - Don't use the Events API for freshness (F-9).
  - Rests only on F-1, F-3a, F-4, F-5, F-6, F-7 and F-9.

Sources:
- https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api
- https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks
- https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/redelivering-webhooks
- https://github.com/orgs/community/discussions/186279
- https://mergify.com/blog/what-github-webhook-latency-actually-looks-like/
- https://github.blog/news-insights/company-news/github-availability-report-june-2026/
- https://github.blog/news-insights/company-news/github-availability-report-march-2026/
- https://vantaj.co/blog/github-outages-2026-analysis/
- https://devactivity.com/insights/github-webhook-incident-lessons-in-performance-engineering-software/
- https://github.com/orgs/community/discussions/173189
