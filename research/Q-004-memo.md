# Q-004 revision (round 3): six-part contract, then the full revised memo

**Main result:** the checker's three open items are now settled. The "a few minutes" quote is on GitHub's troubleshooting-webhooks page, and that page also says delivery order is **not** guaranteed. The W6 phrase does exist, on GitHub's status page, but it describes event processing for Actions runs, not deliveries to customer webhooks, so it no longer supports F-Q004-4. The webhook-events-and-payloads URL works when opened without the `/using-webhooks/` path segment. Mergify is still the only latency source.

## 1. What I changed
- **F-Q004-3a:** re-sourced to `docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/troubleshooting-webhooks` with the exact quote. W1 ("near real-time", already confirmed by the checker) is added to the same entry with its page named.
- **W7:** was the opinion "no promised order found". It is now **fact F-Q004-12**: the troubleshooting page says "GitHub may deliver webhooks in a different order than the order in which the events took place." The "no promised delivery time" part stays an opinion.
- **W6:** now has a URL, `githubstatus.com/incidents/y1t7p9fzrlj2`, but its scope is narrowed. The incident is titled "Incident with Actions", and the throttles restored "full webhook processing for Actions runs". It is proposed separately as **F-Q004-13**, scoped to Actions. It is no longer part of F-Q004-4, which stays as filed with W4 only.
- **PAT-Q004-1:** rebuilt so that it no longer depends on F-5 (Mergify, not filed) or W6. It now rests on F-1, F-3a, F-4, F-6, F-7, F-9 and F-12, plus E1 (arithmetic). Mergify is mentioned only as an illustration.
- **F-Q004-5 (Mergify):** still not proposed for filing. The checker confirmed the figures and the nine event types, but it is still one vendor.
- **W14/F-Q004-10 URL:** I give the URL that works (the path segment above made the difference).

## 2. Why
Each change answers one point in `research/Q-004-source-check.md`:
- open question 2 (W2 page);
- open question 1 (W6 URL);
- open question 3 (the 404);
- the PAT failing because it rested on unfiled entries.

Narrowing W6 follows its source: the status page talks only about Actions-run processing, and I can't prove that customer deliveries were delayed.

## 3. What I verified (web fetches, 2026-10-01; no shell)
- **troubleshooting-webhooks:** "Webhook deliveries can take a few minutes to be delivered and to appear in the recent deliveries log." (section "Webhook deliveries are not immediate"). Also: "GitHub may deliver webhooks in a different order than the order in which the events took place… use the timestamps that are included in the delivery payload." (section "Webhooks deliveries are out of order").
- **githubstatus.com/incidents/y1t7p9fzrlj2:** title "Incident with Actions", 2026-08-26. It contains "The queue of webhook events was fully burned down at 17:40 UTC." and "throttles were gradually raised between 15:54 and 17:22 to restore full webhook processing for Actions runs."
  - I found the URL through surfingcomplexity.blog (2026-08-29), which links to it.
  - The August 2026 availability report (github.blog) gives 15:11 UTC and 2 h 50 min, and says more than one in five Actions run starts failed or were badly delayed at the peak. It does not contain the phrase, which matches what the checker found.
- **docs.github.com/en/webhooks/webhook-events-and-payloads:** the page loads. The push section says: "Events will not be created if more than 5000 branches are pushed at once. Events will not be created for tags when more than three tags are pushed at once." It gives a maximum of 2,048 commits and a 25 MB cap. Repo/org webhooks get only `created` and `completed` for check_run. This confirms the filed F-Q004-10 and F-Q004-11.
  - The page doesn't say whether push commits list added, modified and removed files, so W17 stays a gap.
- **Search for a second latency measurement** ("measured GitHub webhook delivery latency p50 p99"): it returned only Mergify and generic webhook articles. None found.
- **Not opened:** the `.env*` files, lockfiles and package configs in this pack. They are not relevant.

## 4. What is undone
- There is no independent second source for normal webhook latency, so F-Q004-5 stays unfiled.
- No SLA page has been checked.
- W17 (whether push payloads list changed files) is unresolved. The fallback is the REST compare/commit endpoints, which I have not researched.

## 5. What is needed outside my lane
- **Source checker:**
  - check F-Q004-3a, F-Q004-12 and F-Q004-13 (the two URLs above);
  - check PAT-Q004-1 against its new list of dependencies;
  - update the source URL on F-Q004-10 and F-Q004-11 if the filed one is the 404 path.
- **Orchestrator:** record this memo in `research/`.
- **Chief of Staff:** a contractual delivery-time figure would need GitHub Support/Sales or the Enterprise Cloud SLA. That is a decision card for the owner.

## 6. Open questions
1. Does the GitHub Enterprise Cloud SLA cover webhook delivery time?
2. Has anyone published an independent measurement of normal webhook latency?
3. Did the 2026-08-26 incident also delay customer webhook deliveries? The status page doesn't say.
4. Do push webhook commits include file lists? If not, a "files changed in folder X" check needs a REST compare call for every push.
5. Do webhooks really slow down on repos idle for a long time (community #173189, a single user's report)?

---

# Memo — Q-004 (revised 2026-10-01, round 3)

**Question:** how quickly and how reliably can changes in private GitHub repos be detected? The answer feeds the freshness target and the change-detection design. Depth 3. Topics: github, webhooks, polling, latency.

**Grades:** A = GitHub docs; B = a GitHub first-party incident record (one event); C = a single third party.
**Labels:** F = fact, E = estimate, O = opinion.

## Webhooks
| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| W1 | Delivery is described as "near real-time" | F | A | docs.github.com about-webhooks (checker confirmed) |
| W2 | "Webhook deliveries can take a few minutes to be delivered and to appear in the recent deliveries log." | F | A | docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/troubleshooting-webhooks |
| W7a | "GitHub may deliver webhooks in a different order than the order in which the events took place"; use the payload timestamps instead | F | A | same troubleshooting page |
| W7b | In the docs pages I read (troubleshooting, best-practices, handling-failed, redelivering, events-and-payloads, about), I found no promised delivery time | O | — | those pages |
| W4 | 2026-02-03, 14:00–17:40 UTC: push webhook deliveries delayed up to 40 min, 10 min on average | F | B | github.com/orgs/community/discussions/186279 (filed as F-Q004-4) |
| W6 | 2026-08-26 "Incident with Actions": "The queue of webhook events was fully burned down at 17:40 UTC"; throttles were raised 15:54–17:22 "to restore full webhook processing for Actions runs". The source shows an effect on Actions runs only, not on deliveries to customer endpoints | F | B | www.githubstatus.com/incidents/y1t7p9fzrlj2 |
| W3 | One vendor's normal latency: p50 28.44 s, p95 37.15 s at 11 events/s. Measured from GitHub's timestamp to the vendor parsing the request, across nine event types. Slow external CI explains many late check-runs. Check-run p95 reached about 40 min on 2026-04-27 | E | C | mergify.com/blog/what-github-webhook-latency-actually-looks-like/ (single source, not load-bearing) |
| W8–W10 | No automatic redelivery. Manual or API redelivery within 3 days by a repo admin, org owner or app owner/manager | F | A | handling-failed-webhook-deliveries; redelivering-webhooks (filed as F-Q004-1) |
| W11 | Answer 2XX within 10 s; queue the work | F | A | best-practices-for-using-webhooks (filed as F-Q004-2) |
| W12 | On a redelivery, `X-GitHub-Delivery` is the same as in the original. **Advice (O):** record the ID only after the delivery has been processed successfully | F + O | A | best-practices-for-using-webhooks |
| W14–W16 | Push: no event if more than 5,000 branches or more than 3 tags are pushed at once; at most 2,048 commits; 25 MB cap. Repo/org hooks get only check_run created/completed | F | A | docs.github.com/en/webhooks/webhook-events-and-payloads (filed as F-Q004-10/11) |
| W17 | The payload docs don't say whether push commits list changed files | gap | — | same page |

**What must be hosted:** a public HTTPS endpoint that answers within 10 s and queues the work. It must put events back in order by payload timestamp (W7a) and remove duplicates by delivery ID (W12).

## Polling
| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| P1 | REST limits | F | A | rate-limits-for-the-rest-api (F-Q004-6) |
| P2 | A 304 sent with Authorization doesn't count against the primary limit | F | A | best-practices-for-using-the-rest-api (F-Q004-7) |
| G1 | GraphQL limits; the page doesn't mention conditional requests | F | A | rate-limits-and-query-limits-for-the-graphql-api (F-Q004-8) |
| G2 | GraphQL appears to have no ETag/304; only third-party issues say so | O | — | no first-party source |
| E1 | About 3 REST calls per repo per poll across 5 repos: 900/h at 1 min, 180/h at 5 min, 60/h at 15 min. All are well under 5,000/h, and 304s are free. Detection delay ≈ the polling interval plus the call time | E | — | arithmetic on P1/P2 |
| O1 | Events API "not built to serve real-time use cases", latency 30 s–6 h | F | A | rest/activity/events (F-Q004-9) |

**What must be hosted:** a scheduled worker; no inbound endpoint.

**Leads, not proposed:**
- W5 (June 11): only an x.com snippet, with conflicting durations.
- devactivity "~5 s baseline": no source given.
- Community #173189: one user's 7.5 h delay.

## Proposed library entries
- **F-Q004-3a** (fact, A, 12 mo; webhooks, latency): GitHub docs describe delivery as "near real-time" (about-webhooks) and say "Webhook deliveries can take a few minutes to be delivered and to appear in the recent deliveries log" (troubleshooting-webhooks).
- **F-Q004-12** (fact, A, 12 mo; webhooks): "GitHub may deliver webhooks in a different order than the order in which the events took place"; GitHub advises using the payload timestamps (troubleshooting-webhooks).
- **F-Q004-13** (fact, B, 12 mo; github, webhooks, latency): on 2026-08-26 ("Incident with Actions", from 15:11 UTC, 2 h 50 min), GitHub throttled event processing. "The queue of webhook events was fully burned down at 17:40 UTC", restoring "full webhook processing for Actions runs". Scope: Actions runs; the source doesn't say customer deliveries were affected (githubstatus.com/incidents/y1t7p9fzrlj2; times from the github.blog August 2026 availability report).
- **F-Q004-5:** withdrawn as a library proposal. It stays in the memo only as estimate W3, grade C.
- **PAT-Q004-1** (opinion, 6 mo; webhooks, polling):
  - **Use webhooks for speed.** GitHub calls delivery near real-time but says it can take a few minutes (F-3a).
  - **Back them with a REST conditional-request reconcile poll.** Reasons:
    - failed deliveries aren't redelivered automatically (F-1);
    - an incident has delayed push webhooks by up to 40 min (F-4);
    - order isn't guaranteed (F-12);
    - 304s are free (F-7) and the cost fits the limits at a 1–15 min interval (F-6, E1).
  - **Don't use the Events API for freshness** (F-9).
  - **Depends on:** F-1, F-3a, F-4, F-6, F-7, F-9 and F-12, plus E1.

## Sources
- [Troubleshooting webhooks – GitHub Docs](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/troubleshooting-webhooks)
- [Webhook events and payloads – GitHub Docs](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
- [GitHub Status – Incident with Actions, 2026-08-26](https://www.githubstatus.com/incidents/y1t7p9fzrlj2)
- [GitHub availability report: August 2026](https://github.blog/news-insights/company-news/github-availability-report-august-2026/)
- [Quick thoughts on GitHub Actions Aug 26 incident (surfingcomplexity.blog)](https://surfingcomplexity.blog/2026/08/29/quick-thoughts-on-github-actions-aug-26-incident/) (used only to find the status-page URL)
- [Incident thread, discussion 186279](https://github.com/orgs/community/discussions/186279)
- [Mergify – What GitHub webhook latency actually looks like](https://mergify.com/blog/what-github-webhook-latency-actually-looks-like/)
- [GraphQL rate and query limits – GitHub Docs](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api)
- [Best practices for using webhooks – GitHub Docs](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)
- [Redelivering webhooks – GitHub Docs](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/redelivering-webhooks)
- [Community discussion 173189](https://github.com/orgs/community/discussions/173189)
