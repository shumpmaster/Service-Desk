Verdict: FAIL

I opened the memo's main sources myself as raw `index.md` pages from developers.cloudflare.com. Line numbers below are from those copies. Some claims are still on one page, or on none, so the memo as a whole can't pass. I filed two new entries. Nothing was committed, because the folder isn't a git repository.

**Filed** (`library/`, checked 2026-10-04, shelf life 6 months)
- **F-cf-workers-03** (grade A, same publisher):
  - Connections (item 7): at most six connections wait for response headers at once. A connection stops counting once its headers arrive (Limits:205, :216; changelog 2026-04-09:21, :31). The older rule of six concurrent fetches is in the historical changelog at :449.
  - Cron 15 min (item 8a): Limits:155, :421 and historical changelog:362.
  - Queue consumer 15 min (item 8e): Limits:157, :422 and Queues limits:33, :85.
  - Durable Object alarm 15 min (item 8e): Limits:156, :423. The Durable Objects limits page was filed earlier in F-cf-do-01.
  - Paid HTTP has no duration limit (item 8b): Limits:159, :420 and Pricing:34, "No charge or limit for duration".
  - `waitUntil` (item 8d): 30 s, shared across calls, unfinished tasks cancelled. Limits:159 and Context API:234.
- **F-cf-workers-06** (grade B): the Paid Cron and Queue CPU conflict. It supersedes the conflict part of F-cf-workers-02, which I left unedited.
  - Pricing:34 gives 15 min per Cron Trigger or Queue Consumer.
  - Limits:72 gives 30 s under a 1-hour interval and 15 min at 1 hour or more.
  - Queues limits:34 and :56 give "configurable to 5 minutes", default 30 s.
  - None of the three pages says which is right. I did not file the memo's opinion that Pricing is the odd one out (item 3a-op, grade C).

**Not filed**
- **Item 7b (a 7th connection queues rather than fails):** Limits:216 says it, but it is the only page. The 2026-04-09 changelog says only "without queueing, as long as no more than six are waiting" (:31). The only changelog line that says "queued" is the old-rule diagram caption at :25.
  - This answers the memo's request to check the "without queueing" wording against the raw page. The sentence is there, but it doesn't confirm the queueing claim.
- **Item 8c (Free HTTP has no duration limit):** only Limits:159 and :420 say so. Pricing:33 says "No charge for duration", which is about billing, not limits.
- **Item 4 (consistent overages are terminated):** Limits:76 only.
- **Item 6 (`Error: Too many subrequests`):** Workflows limits:154-157 only, and it covers Workflows, not plain Workers. The 2026-02-11 changelog (:21) gives no error text.
- **Item 11 and P-cf-fanout-01:** cost claims with no independent source. This is the owner-ruling gap in `governance/standards/sources.md:8-10`.
- **Items 13 and 14:** the 304 claim has no page behind it, and the CPU estimate has one page.
- **Pages I did not re-open:** DO pricing, DO release notes, Cron Triggers and Errors. They support only claims that are already withheld, or that earlier rounds filed.

**Open questions**
- Which of Pricing, Limits and Queues limits is right for Paid Cron and Queue CPU?
- What CPU limit applies to a Durable Object or alarm on Free? What is an alarm's subrequest count?
- Should the owner allow a non-Cloudflare source, accept a single-source grade, or leave unfiled the two cost claims (item 11 and P-cf-fanout-01)?
- What error does a plain Worker raise when it exceeds the subrequest limit?
