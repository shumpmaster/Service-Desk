I've revised the memo. Five items and the pattern needed changes. The biggest correction: the documentation does say what happens to a 7th connection, and I wrongly said it didn't. Separately, none of the entries can be filed until the owner rules on whether Cloudflare's own pages count as sources.

---

# Q-006: limits on a single Cloudflare Workers invocation, Free vs Paid (researcher memo, revision 2, 2026-10-02)

**Short answer.** One invocation's 15 GitHub requests fit within the Free plan's limit of 50 outbound requests. The CPU limit is the real risk: 10 ms on Free, and it can't be raised. Waiting on the network doesn't count toward CPU time, but the code's own work does. Cloudflare's Limits page says workloads that "handle authentication, server-side rendering, or parse large payloads typically use 10-20 ms". This app checks a sign-in token (JWT) and reads 15 replies on every request, which puts it in that heavier group. So it would typically be at or over the Free limit. That is an estimate from the vendor's typical figure; I did not measure it.

## 1. What I changed
- **Item 7 corrected.** It no longer says the 7th connection is "not documented". The Limits page says it "is queued until one of the existing connections receives its response headers." The question is removed from the undone list and the open questions.
- **Item 2:** I removed the claim that Pricing "says the same". The source is now the Limits page only.
- **Item 4:** I removed the claim that the Errors page says resource-limit breaches end the request with an error page. The Errors page is now cited only for its 1102 row, "Worker exceeded CPU time limit". The two pages use different wording for 1102, and the memo now says so.
- **Item 10:** the reset time ("resetting at midnight UTC") is now sourced to the Limits page. Error 1027 is sourced to the Errors page. Pricing is cited only for "100,000 per day".
- **Item 14:** I added the 10–20 ms sentence from the Limits page. "Not documented" became "vendor says typically 10–20 ms for this kind of work". The pattern P-cf-fanout-01 is rewritten to match.
- **Proposed entries:** F-cf-workers-03 has the corrected item 7. F-cf-workers-01 keeps only what the sources support. Every entry is marked single-publisher, pending the owner ruling (part 5).

## 2. Why
The source check (research/Q-006-source-check.md) failed the memo for these reasons:
- item 7 was false;
- items 2, 4 and 10 cited pages that don't say what was claimed;
- item 14 left out text from the Limits page that bears directly on the decision.

### Findings
All sources are from Cloudflare (developers.cloudflare.com), because the question allows only Cloudflare's own documentation. Grade A means the statement is quoted from that documentation; no independent source confirms any of it.

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 1 | Free: "CPU time per HTTP request \| 10 ms"; "CPU time per Cron Trigger \| 10 ms". Pricing: "10 milliseconds of CPU time per invocation". | fact | A | [Limits](https://developers.cloudflare.com/workers/platform/limits/); [Pricing](https://developers.cloudflare.com/workers/platform/pricing/) |
| 2 | "Waiting on network requests (such as `fetch()` calls, KV reads, or database queries) does **not** count toward CPU time." Pricing has no such sentence. | fact | A | Limits only |
| 3 | Paid: "CPU time per HTTP request \| 5 min (default: 30 seconds)". "CPU time per Cron Trigger \| 30 seconds (< 1 hour interval) / 15 min (>= 1 hour interval)". The default is changed with `limits.cpu_ms`. | fact | A | Limits |
| 3a | **Conflict:** Pricing says "Max of 15 minutes of CPU time per Cron Trigger or Queue Consumer invocation", with no interval condition. | fact (conflict) | B | Pricing vs Limits |
| 4 | Going over the CPU limit: Limits says each isolate has some flexibility for occasional overages, and "If your Worker starts hitting the limit consistently, its execution will be terminated according to the limit configured." It also says "Cloudflare returns Error 1102 to the client with the message `Worker exceeded resource limits`." The Errors page lists 1102 as "Worker exceeded CPU time limit". The two pages word the same error differently. | fact | A | Limits; [Errors](https://developers.cloudflare.com/workers/observability/errors/) (1102 row only) |
| 5 | Subrequests per invocation: Free 50, plus 1,000 to Cloudflare services. Paid 10,000 by default, settable up to 10M. "Each subrequest in a redirect chain counts against this limit." | fact | A | Limits; [Changelog 2026-02-11](https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/) |
| 6 | Going over the subrequest limit: "Error: Too many subrequests." appears only on the Workflows limits page. The Workers Limits and Errors pages don't state it. For plain Workers this is **not documented**. | fact (scope-limited) | B | [Workflows limits](https://developers.cloudflare.com/workflows/reference/limits/) |
| 7 | At most 6 connections per invocation may wait for response headers at once. "Once response headers arrive for a connection, it no longer counts toward the six-connection limit." A 7th "is queued until one of the existing connections receives its response headers". It waits; it does not fail. | fact | A | Limits |
| 8 | Wall-clock time: HTTP requests have no limit. Cron Triggers, Queue consumers and Durable Object alarms get 15 min each. "`ctx.waitUntil()` can extend execution for up to 30 seconds after the response is sent or the client disconnects." | fact | A | Limits |
| 9 | Durable Objects (SQLite): "CPU per request: 30 seconds (default) / configurable to 5 minutes". Each incoming request or WebSocket message resets the CPU time left. The page doesn't split Free from Paid. **Not documented:** the CPU limit for Durable Object alarms on Free, and whether an alarm gets a fresh subrequest count. The Workers Limits table covers only HTTP requests and Cron Triggers. | fact / not documented | A / – | [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/); Limits |
| 10 | Free daily requests: "100,000 requests, resetting at midnight UTC" (Limits). Going over returns Error 1027, "Worker exceeded free tier daily request limit" (Errors). Pricing says "100,000 per day" but gives no reset time and doesn't mention 1027. | fact | A | Limits; Errors; Pricing (limit only) |
| 11 | "Cloudflare does not bill for subrequests you make from your Worker." | fact | A | Pricing |
| 12 | Differences between trigger types: CPU is the same for HTTP and Cron on Free and differs on Paid (#3). Wall time differs (#8). No per-trigger difference in subrequests is documented. | fact / not documented | A | Limits |
| 13 | For O3: 15 requests use 30% of the Free limit of 50. Redirects add one subrequest per hop. A 304 "not modified" reply is still a subrequest. | estimate | B | from #5 |
| 14 | 10 ms of CPU is the binding risk. Limits: "The average Worker uses approximately 2.2 ms per request. Heavier workloads that handle authentication, server-side rendering, or parse large payloads typically use 10-20 ms." Checking a JWT and parsing 15 JSON replies per request is that kind of heavier work, so it would typically sit at or above 10 ms. Overages are tolerated only when occasional (#4). The exact cost of this workload is **not documented** and needs measuring. | estimate | B | Limits |
| 15 | Because a 7th connection queues (#7), 15 parallel requests run in at least 3 waves. That adds wall time, which is unlimited for HTTP, and no CPU. | estimate | B | from #7, #8 |

### Proposed library entries (for the Source checker)
All are single-publisher (Cloudflare only) and depend on the sourcing ruling in part 5.
- **F-cf-workers-01** (fact, A, 6 mo, cloudflare/hosting/cost): items 1, 2 and 4. Item 2 is sourced to Limits only. Item 4 cites Errors only for the 1102 row, with the wording difference noted.
- **F-cf-workers-02** (fact, A, 6 mo, cloudflare/hosting/cost): items 3, 5 and 11, plus the 3a conflict (B).
- **F-cf-workers-03** (fact, A, 6 mo, cloudflare/hosting): items 7 (corrected: it queues) and 8.
- **F-cf-workers-04** (fact, B, 6 mo, cloudflare): item 6, stated as Workflows-only.
- **F-cf-workers-05** (fact, A, 6 mo, cloudflare/cost): item 10.
- **F-cf-do-01** (fact, A, 6 mo, cloudflare/hosting): item 9, with its "not documented" parts kept.
- **P-cf-fanout-01** (pattern, opinion, B, cloudflare/hosting/cost), rewritten: "On Workers Free, small API fan-out (≤50 outbound calls, redirects included) fits the subrequest limit, and connections beyond 6 queue rather than fail. The 10 ms CPU limit is the constraint. Cloudflare says authentication and payload parsing typically use 10–20 ms, so a Worker that verifies tokens and parses many replies should expect to need Paid (30 s default CPU). Measure before relying on Free."
- F-hosting-01 agrees with item 1 and needs no change.

## 3. What I verified
- I re-read research/Q-006.md, my previous memo and the source check.
- I fetched the Limits page twice as `index.md`. I confirmed:
  - the network-wait sentence;
  - the 1102 text and the occasional-overage wording;
  - the 2.2 ms and 10–20 ms sentences;
  - the 7th-connection queuing sentence;
  - the subrequest numbers and the redirect sentence;
  - "resetting at midnight UTC";
  - the wall-time rows and the `waitUntil` sentence;
  - the CPU table rows for both plans.

  The page states no subrequest-overage error and no CPU limit for Durable Object alarms on Free.
- I fetched Pricing as `index.md`. It has no network-wait sentence, no reset time and no mention of 1027. It does have "100,000 per day", the 15-minute Cron/Queue line, "does not bill for subrequests" and "10 milliseconds of CPU time per invocation".
- I fetched Errors as `index.md`:
  - The 1102 and 1027 rows are as quoted.
  - No reset time is given.
  - "Too many subrequests" doesn't appear.
  - The summarizer paraphrased a general line about error pages, which the Source checker could not find in the raw file. I have dropped it.
- I ran one web search. It found only third-party pages repeating Cloudflare's figures. I didn't use them: the question allows only Cloudflare sources, and they aren't independent anyway.
- All of this came through a page summarizer. I didn't re-fetch the DO limits, Workflows limits or changelog pages, so they rest on round 1 and the checker's summarizer reading.

## 4. What is undone
- The subrequest-overage error for plain Workers is not documented.
- The CPU limit and subrequest count for Durable Object alarms on Free are not documented.
- The real CPU cost of the O3 workload is unknown. Only a measurement can answer it, and the question rules out testing.

## 5. What is needed outside my lane
- **Sourcing ruling (Chief of Staff → owner decision card):** the question allows only Cloudflare sources, but governance/standards/sources.md asks for an independent source for cost and risk claims. As written, no fact here can meet both. The owner needs to rule whether Cloudflare's own documentation can count for Cloudflare product behaviour, or whether these entries are filed single-source with the grade stated.
- **Source checker:** re-check items 2, 4, 7, 10, 14 and the pattern against the raw pages. Grep "does not bill for subrequests" in the raw Pricing page; last round only the summarizer saw it.
- **If O3 depends on #14:** a separate task to measure CPU per request on a Free Worker.

## 6. Open questions
- For Paid Cron CPU, which page is right: Pricing (15 min, no condition) or Limits (30 s under a 1-hour interval)?
- On Free, does a Durable Object alarm get 10 ms or 30 s of CPU, and does it get a fresh count of 50 subrequests?
- Does the 1102 error wording differ because one code covers both CPU and other resource limits? Neither page says.

Sources:
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/observability/errors/
- https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/
- https://developers.cloudflare.com/workflows/reference/limits/
- https://developers.cloudflare.com/durable-objects/platform/limits/
- Search results seen but not used (third-party): https://eastondev.com/blog/en/posts/dev/20251201-cloudflare-pricing-compare/, https://markaicode.com/benchmarks/cloudflare-workers-scalability-benchmark/
