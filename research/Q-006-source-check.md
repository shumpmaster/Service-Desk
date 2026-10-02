Verdict: FAIL

I fetched all six cited pages as raw `index.md` files and grepped them. I filed nothing and changed nothing in `library/`. Line numbers below refer to those fetched files.

**Why nothing was filed**
1. **No ruling on the sourcing question.** `governance/standards/sources.md` only counts two pages from the same publisher as two sources for Anthropic product behaviour. Cost and risk claims still need an independent source. Every entry here is Cloudflare-only. The memo asks for a ruling (part 5), but none is in the folder. F-hosting-01 being filed as single-source is not a ruling.
2. **Item 9 is wrong.** The memo says the CPU limit for Durable Object alarms is "not documented".
   - The DO limits page says: "the maximum CPU time per Durable Objects invocation (HTTP request, WebSocket message, or Alarm) is set to 30 seconds" by default (durable-objects limits:101).
   - It also says DOs "have the same per invocation CPU limits… as any Workers do" (line 99).
   - So alarms are documented at 30 s. What is still unclear is how that squares with the Free plan's 10 ms.
   - The page doesn't mention Free plan CPU or a subrequest count for alarms, so those two parts are still "not documented".
   - F-cf-do-01 and open question 2 need revising.

**Confirmed against the raw pages**
- **Item 1:** Free is 10 ms for HTTP and for Cron (limits:71-72).
- **Item 2:** the network-wait sentence is on the Limits page (limits:67).
- **Item 3:** Paid Cron CPU is 30 s under a 1-hour interval and 15 min at or above it (limits:72).
- **Item 3a:** the conflict is real. Pricing says "Max of 15 minutes of CPU time per Cron Trigger or Queue Consumer invocation" with no interval condition (pricing:34).
- **Item 4:**
  - Error 1102 and `Worker exceeded resource limits` are at limits:80.
  - The overage-flexibility wording is at limits:76.
  - The Errors page 1102 row says "Worker exceeded CPU time limit" (errors:26).
- **Item 5:**
  - Free is 50 subrequests, with 1,000 to internal services. Paid is 10,000, up to 10M (limits:188-189).
  - The redirect-chain sentence is at limits:191.
  - The changelog says Free is "limited to 50 external subrequests and 1000 subrequests to Cloudflare services".
- **Item 6:** "Error: Too many subrequests." appears only in the Workflows limits page (workflows:157). It is not in Errors or Limits.
- **Item 7:** the seventh connection is queued (limits:216).
- **Item 8:** HTTP wall time is unlimited, Cron, Queue and DO alarms are 15 min each, and `waitUntil` allows 30 s (limits:420-423).
- **Item 10:** 100,000 requests a day, resetting at midnight UTC, Error 1027 (limits:171, errors:32).
- **Item 11:** Pricing says "Cloudflare does not bill for subrequests you make from your Worker" (pricing:36). This is now confirmed in the raw file.
- **Item 14:** the 2.2 ms average and the 10-20 ms sentence for authentication and payload-heavy work are at limits:74.

**Open questions**
- Will the owner rule that Cloudflare's own documentation counts for Cloudflare product behaviour? Without that ruling, even the passing items (1, 2, 3, 5, 7, 8, 10, 11) can only be filed single-source with the grade stated. The cost items are also affected.
- Should the Researcher fix item 9 and F-cf-do-01, then resubmit?
- Which page is right for Paid Cron CPU: Pricing or Limits?
- Item 15 is a derived estimate. It assumes a 7th connection waits only for headers, so it is not a documented figure.
