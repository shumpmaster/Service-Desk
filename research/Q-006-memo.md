# Q-006: limits on a single Cloudflare Workers invocation, Free vs Paid (researcher memo, 2026-10-02)

Fifteen GitHub requests from one invocation fit inside the Free plan's limit of 50 outbound requests. The part that could fail is the 10 ms CPU limit, and that limit cannot be raised on Free. Waiting on the network does not count toward it, but the code's own work does, including reading the 15 replies. Whether 15 replies fit in 10 ms is not documented, and I did not test it.

## 1. What I changed
Nothing on disk. I have no write tool. This memo is my output, for the Orchestrator to record in research/ and pass to the Source checker.

## 2. Why
Q-006 asks for a depth-3 graded memo. It serves the Service Desk decision (O3): can about 15 GitHub requests per incoming request run in one Workers Free invocation?

### Findings
The vendor-doc grade follows the library's convention: Cloudflare's own pages are primary sources, but no independent source confirms them.

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 1 | Free: CPU time is "10 ms" per HTTP request and "10 ms" per Cron Trigger. | fact | A (vendor doc) | [Limits](https://developers.cloudflare.com/workers/platform/limits/) (updated 2026-09-05); [Pricing](https://developers.cloudflare.com/workers/platform/pricing/) (2026-08-28): "10 milliseconds of CPU time per invocation" |
| 2 | "Waiting on network requests (such as `fetch()` calls, KV reads, or database queries) does **not** count toward CPU time." | fact | A | Limits; Pricing says the same |
| 3 | Paid: CPU time per HTTP request is "5 min (default: 30 seconds)", set with `limits.cpu_ms` (maximum 300000). Cron Trigger: "30 seconds (< 1 hour interval) / 15 min (>= 1 hour interval)". | fact | A | Limits |
| 3a | **Conflict:** the Pricing page says Paid gives 15 min of CPU for Cron Triggers and Queue consumers, with no interval condition. | fact (conflict) | B | Pricing vs Limits |
| 4 | Going over the CPU limit: occasional overages are tolerated. "If your Worker starts hitting the limit consistently, its execution will be terminated according to the limit configured." The client gets Error 1102 ("Worker exceeded resource limits"). The Errors page says resource-limit breaches end the whole request with an error page. | fact | A | Limits; [Errors](https://developers.cloudflare.com/workers/observability/errors/) (2026-09-30) |
| 5 | Subrequests per invocation: Free 50, plus 1,000 to Cloudflare's own services. Paid 10,000 by default, settable up to 10M with `[limits] subrequests`. "Each subrequest in a redirect chain counts against this limit." | fact | A | Limits; [Changelog 2026-02-11](https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/): "Workers on the free plan remain limited to 50 external subrequests and 1000 subrequests to Cloudflare services per invocation." |
| 6 | Going over the subrequest limit: the docs say "Error: Too many subrequests." (shown as `exceededResources` in metrics and `exception` in `wrangler tail`). This is said **only on the Workflows limits page**. For plain Workers it is **not documented**. | fact (scope-limited) | B | [Workflows limits](https://developers.cloudflare.com/workflows/reference/limits/) (2026-09-21) |
| 7 | Each invocation can have at most 6 connections waiting for response headers at the same time, on both plans. A connection stops counting once its headers arrive. What happens to a 7th call (it waits or it fails) is **not documented** in what I read. | fact / not documented | A / – | Limits |
| 8 | Wall-clock time: an HTTP request has "No limit" as long as the client stays connected. Cron Trigger, Durable Object alarm and Queue consumer: 15 min each. `ctx.waitUntil()` can extend work by up to 30 s after the response is sent. The page gives no plan split, so this reads as both plans. | fact | A | Limits |
| 9 | Durable Objects (SQLite): "CPU per request: 30 seconds (default) / configurable to 5 minutes". "Each incoming HTTP request or WebSocket message resets the remaining available CPU time." The row does not separate Free from Paid. **Not documented:** whether Free-plan DO alarm handlers get 10 ms or 30 s, and whether an alarm gets a fresh subrequest count. | fact / not documented | A / – | [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/) (2026-06-01) |
| 10 | Over the Free daily request limit (100,000/day, resets 00:00 UTC): Error 1027. | fact | A | Errors; Pricing |
| 11 | Subrequests are not billed. | fact | A | Pricing |
| 12 | Differences between trigger types: the HTTP and Cron CPU limits are the same on Free (10 ms) and differ on Paid (#3). Wall time differs (#8). No per-trigger subrequest difference is documented. | fact / not documented | A | Limits |
| 13 | For O3: 15 GitHub requests use 30% of the Free limit of 50. That leaves room for redirects (for example, a renamed repo returning 301 adds one subrequest per hop). Answers that come back "not modified" (304) still count as subrequests. | estimate | B | from #5 |
| 14 | The 10 ms CPU limit is the binding risk. Network waits are free (#2), but reading and processing 15 replies, plus routing and checking the sign-in token (JWT) per P-auth-01, all use CPU. Cloudflare quotes an average of about 2.2 ms per request, which is a fleet average and not a bound. Whether this workload fits in 10 ms is **not documented**. | estimate / opinion | C | Limits ("approximately 2.2 ms per request") |
| 15 | With 6 connections at a time (#7), 15 parallel requests run in at least 3 waves. That adds wall time, which is unlimited for HTTP, and no CPU. | estimate | B | from #7, #8 |

### Proposed library entries (for the Source checker)
- **F-cf-workers-01** (fact, A, shelf life 6 mo, topics: cloudflare, hosting, cost): items 1, 2 and 4. Source: Limits, Pricing, Errors.
- **F-cf-workers-02** (fact, A, 6 mo, cloudflare/hosting/cost): items 3 and 5, with the 2026-02-11 changelog. Add a note on the 3a conflict about Paid Cron CPU (grade B).
- **F-cf-workers-03** (fact, A, 6 mo, cloudflare/hosting): items 7 and 8.
- **F-cf-workers-04** (fact, B, 6 mo, cloudflare): item 6, with its Workflows-only scope stated.
- **F-cf-do-01** (fact, A, 6 mo, cloudflare/hosting): item 9, with its "not documented" parts kept.
- **P-cf-fanout-01** (pattern, opinion, C, topics: cloudflare/hosting/cost): "On Workers Free, the subrequest count is rarely the limit for small API fan-out (≤50). Measure CPU per request before relying on 10 ms; if it is consistently close, move to Paid (30 s default) rather than splitting the work."
- Existing F-hosting-01 agrees with item 1. No change is needed.

## 3. What I verified
- I read research/Q-006.md, BRIEF.md and the library entries that share a topic (F-hosting-*, F-auth-*, P-auth-01, F-gh-01/03/04).
- I fetched the Workers Limits page three times, once as `index.md`, to get the wording exact. I also fetched Pricing, Errors, DO limits, Cron Triggers (it gives no limits and points to the Limits page), Workflows limits and the 2026-02-11 changelog.
- I ran two web searches.
- Quotes came through a page summarizer. The Source checker should compare them with the raw pages.

## 4. What is undone
- The behaviour of a 7th connection at once on Workers (does it wait or fail?).
- The subrequest-limit error for plain Workers.
- The CPU limit and subrequest count for Durable Object alarms on Free.

These are all "not documented" in what I read. I did not test them, as the question requires.

## 5. What is needed outside my lane
- The Source checker should check against the raw pages, especially the 3a conflict and the Workflows-only scope of item 6.
- If the CPU question (#14) decides O3, only a measurement can answer it. That would need a separate task with an experiment, which my role cannot run.

## 6. Open questions
- Does the Free 10 ms CPU limit apply to Durable Object alarm handlers, or does the 30 s DO limit apply?
- Does the "50 external" count reset for each Durable Object request or alarm?
- Is Pricing ("15 min for Cron") or Limits ("30 s if interval < 1 h") correct for Paid Cron CPU?
