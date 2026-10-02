I've rewritten item 9 because the source check showed it was wrong. The Durable Objects limits page does document alarm CPU time: 30 seconds by default. I've also re-graded item 15. One thing still blocks filing: the owner hasn't ruled on whether Cloudflare's own pages are enough as sources. The full revision 3 memo is below for the Orchestrator to record.

---

# Q-006: limits on a single Cloudflare Workers invocation, Free vs Paid (researcher memo, revision 3, 2026-10-02)

**Short answer.** Making 15 GitHub requests in one invocation is within the Free plan's limit of 50 outbound requests. The real risk is CPU time: Free allows 10 ms, and that can't be raised.

Time spent waiting on the network doesn't count toward CPU time, but the app's own processing does. Cloudflare's Limits page says workloads that "handle authentication, server-side rendering, or parse large payloads typically use 10-20 ms". This app checks a sign-in token (JWT) and parses 15 replies on every request, so it would typically be at or over the Free limit. That is my estimate, based on the vendor's typical figure; I did not measure it.

Since the last round, item 9 has changed. The Durable Objects page does give alarms 30 s of CPU by default. It also says Durable Objects have "the same per invocation CPU limits… as any Workers do", and Free Workers get 10 ms. It never says which of these applies to a Durable Object on the Free plan.

## 1. What I changed
- **Item 9, rewritten.** I removed "not documented: the CPU limit for Durable Object alarms". The DO limits page says: "By default, the maximum CPU time per Durable Objects invocation (HTTP request, WebSocket message, or Alarm) is set to 30 seconds, but can be increased … by setting `limits.cpu_ms`" (DO limits:101). The same page says: "Durable Objects are Worker scripts, and have the same per invocation CPU limits as any Workers do" (DO limits:99).
  - The item now reports alarm CPU as documented: 30 s by default, configurable to 5 min.
  - It reports a new conflict as **9a**: how the 30 s default fits with the Free plan's 10 ms.
  - Two points stay "not documented": the plan-specific CPU for a Durable Object on Free, and the subrequest count for an alarm.
- **Item 12:** now cites item 9 for alarms, so alarm CPU (30 s by default) is listed as a documented difference between trigger types.
- **Item 15:** reworded and lowered from B to C. A 7th connection waits only until one open connection *receives its response headers*, not until that request finishes, so "at least 3 waves" assumed too much. It now says only that requests beyond 6 wait for a header slot.
- **F-cf-do-01:** rewritten to match item 9 and 9a.
- **Open question 2:** narrowed to the Free-plan conflict and the alarm subrequest count.
- **Part 4:** "CPU limit for DO alarms" is removed from what is undone.
- I left everything else from revision 2 unchanged. The checker confirmed items 1–8, 10, 11 and 14 against the raw pages.

## 2. Why
The source check (research/Q-006-source-check.md) failed revision 2 on two grounds:
- **Item 9 was wrong.** It called a documented figure "not documented".
- **No sourcing ruling is in the folder.** That is outside my lane and is carried forward in part 5.

The checker also pointed out that item 15 rests on an assumption, so I lowered its grade and narrowed its wording.

### Findings
Every source is a Cloudflare page on developers.cloudflare.com, because the question allows only Cloudflare's own documentation. Grade A means the statement is quoted from that documentation. No independent source confirms any of it.

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 1 | Free: "CPU time per HTTP request \| 10 ms"; "CPU time per Cron Trigger \| 10 ms". Pricing: "10 milliseconds of CPU time per invocation". | fact | A | [Limits](https://developers.cloudflare.com/workers/platform/limits/) :71-72; [Pricing](https://developers.cloudflare.com/workers/platform/pricing/) |
| 2 | "Waiting on network requests (such as `fetch()` calls, KV reads, or database queries) does **not** count toward CPU time." | fact | A | Limits :67 only |
| 3 | Paid: "CPU time per HTTP request \| 5 min (default: 30 seconds)". "CPU time per Cron Trigger \| 30 seconds (< 1 hour interval) / 15 min (>= 1 hour interval)". The default is changed with `limits.cpu_ms`. | fact | A | Limits :71-72 |
| 3a | **Conflict:** Pricing says "Max of 15 minutes of CPU time per Cron Trigger or Queue Consumer invocation", with no interval condition. | fact (conflict) | B | Pricing :34 vs Limits :72 |
| 4 | Going over the CPU limit: Limits allows occasional overages, but "If your Worker starts hitting the limit consistently, its execution will be terminated according to the limit configured." It also says "Cloudflare returns Error 1102 to the client with the message `Worker exceeded resource limits`." The Errors page's 1102 row reads "Worker exceeded CPU time limit", so the two pages word the same error differently. | fact | A | Limits :76, :80; [Errors](https://developers.cloudflare.com/workers/observability/errors/) :26 |
| 5 | Subrequests per invocation: Free 50, plus 1,000 to Cloudflare services. Paid 10,000 by default, settable up to 10M. "Each subrequest in a redirect chain counts against this limit." | fact | A | Limits :188-191; [Changelog 2026-02-11](https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/) |
| 6 | The error for going over the subrequest limit, "Error: Too many subrequests.", appears only on the Workflows limits page. The Workers Limits and Errors pages don't give it, so for plain Workers it is **not documented**. | fact (scope-limited) | B | [Workflows limits](https://developers.cloudflare.com/workflows/reference/limits/) :157 |
| 7 | At most 6 connections per invocation can wait for response headers at once. "Once response headers arrive for a connection, it no longer counts toward the six-connection limit." A 7th connection "is queued until one of the existing connections receives its response headers". It waits; it does not fail. | fact | A | Limits :216 |
| 8 | Wall-clock time: no limit for HTTP requests; 15 min each for Cron Triggers, Queue consumers and Durable Object alarms. "`ctx.waitUntil()` can extend execution for up to 30 seconds after the response is sent or the client disconnects." | fact | A | Limits :420-423 |
| 9 | Durable Objects (SQLite): "CPU per request \| 30 seconds (default) / configurable to 5 minutes of active CPU time". "By default, the maximum CPU time per Durable Objects invocation (HTTP request, WebSocket message, or Alarm) is set to 30 seconds", and it can be raised with `limits.cpu_ms`. "Each incoming HTTP request or WebSocket message resets the remaining available CPU time to 30 seconds." Alarm wall time is 15 min. **Not documented:** the subrequest count for an alarm invocation. | fact / not documented | A / – | [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/) :99, :101; Limits :420-423 |
| 9a | **Conflict / gap:** the same DO page says "Durable Objects are Worker scripts, and have the same per invocation CPU limits as any Workers do", and Free Workers get 10 ms (#1). The DO page's CPU figures don't distinguish Free from Paid. Its only plan distinctions cover storage and class counts, and it notes that Free supports only SQLite-backed DOs. Which CPU limit applies to a Durable Object, including an alarm, on Free is **not documented**. | fact (conflict) | B | DO limits :99 vs :101; Limits :71 |
| 10 | Free daily requests: "100,000 requests, resetting at midnight UTC" (Limits). Going over returns Error 1027, "Worker exceeded free tier daily request limit" (Errors). Pricing gives "100,000 per day" only. | fact | A | Limits :171; Errors :32; Pricing |
| 11 | "Cloudflare does not bill for subrequests you make from your Worker." | fact | A | Pricing :36 |
| 12 | Differences between trigger types:<br>• CPU: the same for HTTP and Cron on Free; different on Paid (#3). DO invocations, alarms included, have a 30 s default (#9), and the Free-plan figure for them is unclear (#9a).<br>• Wall time: differs by trigger (#8).<br>• Subrequests: no difference by trigger type is documented. | fact / not documented | A | Limits; DO limits |
| 13 | For O3: 15 requests use 30% of the Free limit of 50. Each redirect hop adds one subrequest. A 304 "not modified" reply still counts as a subrequest. | estimate | B | from #5 |
| 14 | 10 ms of CPU is the limit that binds. Limits says: "The average Worker uses approximately 2.2 ms per request. Heavier workloads that handle authentication, server-side rendering, or parse large payloads typically use 10-20 ms." Checking a JWT and parsing 15 JSON replies per request is that kind of heavier work, so it would typically sit at or above 10 ms. Overages are tolerated only when occasional (#4). The real cost of this workload is **not documented** and would need measuring. | estimate | B | Limits :74 |
| 15 | With 15 requests started together, those beyond the 6th wait for a header slot (#7). That can add wall time, which is unlimited for HTTP requests, and it adds no CPU time. How much time it adds depends on GitHub's time to first header; nothing documents that. | estimate | C | from #7, #8 |

### Proposed library entries (for the Source checker)
All of these come from Cloudflare alone and depend on the sourcing ruling in part 5.
- **F-cf-workers-01** (fact, A, 6 mo, cloudflare/hosting/cost): items 1, 2 and 4.
- **F-cf-workers-02** (fact, A, 6 mo, cloudflare/hosting/cost): items 3, 5 and 11, plus the 3a conflict (B).
- **F-cf-workers-03** (fact, A, 6 mo, cloudflare/hosting): items 7 and 8.
- **F-cf-workers-04** (fact, B, 6 mo, cloudflare): item 6, stated as Workflows-only.
- **F-cf-workers-05** (fact, A, 6 mo, cloudflare/cost): item 10.
- **F-cf-do-01** (fact, A, 6 mo, cloudflare/hosting), rewritten:
  - Claim: "Durable Object invocations (HTTP request, WebSocket message, or alarm) default to 30 s of CPU, configurable to 5 min via `limits.cpu_ms`. Each incoming request or WebSocket message resets the remaining CPU time to 30 s. Alarm handlers have 15 min of wall time. The same page says DOs 'have the same per invocation CPU limits as any Workers do' and does not say how this applies on Workers Free (10 ms). Not documented: the Free-plan DO CPU limit and an alarm's subrequest count."
  - Sources: DO limits; Workers Limits.
  - It sits alongside F-hosting-02a, which comes from the same DO limits page; the two don't conflict.
- **P-cf-fanout-01** (pattern, opinion, B, cloudflare/hosting/cost), unchanged from revision 2: "On Workers Free, small API fan-out (≤50 outbound calls, redirects included) fits the subrequest limit, and connections beyond 6 queue rather than fail. The 10 ms CPU limit is the constraint. Cloudflare says authentication and payload parsing typically use 10–20 ms, so a Worker that verifies tokens and parses many replies should expect to need Paid (30 s default CPU). Measure before relying on Free."
- F-hosting-01 agrees with item 1 and needs no change.

## 3. What I verified
These were page fetches through the summarizer. I have no shell.
- I re-read research/Q-006.md, the revision 2 memo and the source check.
- I fetched `durable-objects/platform/limits/index.md` twice and got back verbatim:
  - "By default, the maximum CPU time per Durable Objects invocation (HTTP request, WebSocket message, or Alarm) is set to 30 seconds…";
  - "Durable Objects are Worker scripts, and have the same per invocation CPU limits as any Workers do.";
  - "CPU per request | 30 seconds (default) / configurable to 5 minutes of active CPU time";
  - the 30-second reset sentence;
  - "Durable Object alarm handlers have a maximum wall time of 15 minutes."

  Plan-specific text on the page covers only storage (5 GB on Free), class counts (100 on Free) and the SQLite-only rule. A search for "subrequest" found nothing on the page.
- I fetched `workers/platform/limits/index.md`:
  - The CPU table rows are as quoted in #1 and #3.
  - Durable Objects appear only in the wall-time rows: alarms 15 min, DO RPC/HTTP unlimited.
  - A sentence about legacy "Bundled plan" Workers having no duration limits is about a legacy plan, so I didn't use it.
  - The page gives no CPU figure for Durable Objects.
- I did not re-fetch Pricing, Errors, Workflows limits or the changelog. They rest on the checker's raw-file line numbers from this round.

## 4. What is undone
- The error for going over the subrequest limit on plain Workers is not documented (#6).
- Which CPU limit applies to a Durable Object, including an alarm, on Free is not documented (#9a), and neither is an alarm's subrequest count (#9).
- The real CPU cost of the O3 workload is unknown. Only a measurement can settle it, and the question rules out testing.

## 5. What is needed outside my lane
- **Sourcing ruling (Chief of Staff → owner decision card).** This is still outstanding. The question allows only Cloudflare sources, but governance/standards/sources.md requires an independent source for cost and risk claims. As written, no fact here can meet both. The owner needs to rule on one of two options:
  - Cloudflare's own documentation counts as a source for Cloudflare product behaviour; or
  - these entries are filed with a single source and the grade stated.
- **Source checker:** check revised item 9, the new 9a and F-cf-do-01 against the raw DO limits file (:99, :101 and the alarm wall-time line). Also check the regraded item 15.
- **If O3 depends on #14:** a separate task to measure CPU per request on a Free Worker.

## 6. Open questions
- Paid Cron CPU: is Pricing right (15 min, no condition) or Limits (30 s for schedules under a 1-hour interval)?
- On Free, does a Durable Object invocation (request or alarm) get the DO page's 30 s default, or the Workers Free 10 ms ("same per invocation CPU limits as any Workers do")? Does an alarm get a fresh count of 50 subrequests?
- Does the 1102 error wording differ because one code covers both CPU and other resource limits? Neither page says.

Sources:
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/observability/errors/
- https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/
- https://developers.cloudflare.com/workflows/reference/limits/
- https://developers.cloudflare.com/durable-objects/platform/limits/
