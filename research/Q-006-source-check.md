Verdict: FAIL

I'm giving you the result now. I fetched the raw Cloudflare pages as markdown with curl and compared them with the memo. Several memo claims are wrong or unsupported, and none of the proposed entries meets the sourcing rule. I filed nothing and changed nothing in library/.

**Wrong or unsupported in the memo**

- **Item 7 is wrong.** The memo says what happens to a 7th connection is "not documented". The raw Limits page says: "If a seventh connection is attempted while six are already waiting for headers, it is queued until one of the existing connections receives its response headers" (limits.md:216). It queues and does not fail. F-cf-workers-03 therefore can't be filed as drafted. Item 15's "waves" reasoning does hold.
- **Item 2 is only half supported.** The Limits page confirms it (limits.md:67). The memo also says Pricing "says the same", and Pricing does not. I found no such sentence in pricing.md, and the Pricing summary said it doesn't address the point.
- **Item 4 is partly unsupported.**
  - The Limits page confirms Error 1102 with "Worker exceeded resource limits" (limits.md:80). I did not check the "built-in flexibility" sentence against the raw page.
  - The Errors page only says 1102 means "Worker exceeded CPU time limit" (errors.md:26). I found no statement there that resource-limit breaches end the whole request with an error page. The closest text is errors.md:21, which is about errors that stop a Worker returning a response.
- **Item 14 omits relevant text.** limits.md:74 follows the 2.2 ms average with: "Heavier workloads that handle authentication, server-side rendering, or parse large payloads typically use 10-20 ms." That bears directly on the 10 ms risk for a JWT-checking Worker, and it is stronger than the memo's "not documented". The P-cf-fanout-01 pattern needs revising to reflect it.
- **Item 10 is only half confirmed.** Error 1027 and the 100,000/day limit are confirmed (limits.md:171, errors.md:32, pricing.md:33). The reset time was not confirmed on Pricing, and "Errors; Pricing" overstates it.

**Confirmed against the raw pages**

- Items 1 and 3: Free is 10 ms for HTTP and Cron. Paid Cron is 30 s under a 1-hour interval and 15 min at or above it (limits.md:72).
- Item 3a: the conflict is real. Pricing says "Max of 15 minutes of CPU time per Cron Trigger or Queue Consumer invocation" with no interval condition (pricing.md:34).
- Item 5: Free is 50 per invocation and 1,000 to internal services. Paid is 10,000, up to 10M. The redirect-chain sentence is present (limits.md:185-192). The 2026-02-11 changelog matches, but I checked that one through the summarizer only.
- Item 8: HTTP wall time is unlimited, and Cron, Queue consumer and Durable Object alarm are 15 min each (limits.md:421-423). `waitUntil` extends execution by up to 30 s (limits.md:192).
- Item 11: "Cloudflare does not bill for subrequests" is confirmed. I saw it through the summarizer only and did not grep it in the raw file.
- Item 6: the Workflows-only scope holds. The Errors page has no "Too many subrequests" entry. The Workflows limits page was checked through the summarizer only.
- Item 9: the Durable Objects limits page was checked through the summarizer only. It matches the memo.

**Why nothing was filed**
1. Every source is Cloudflare, so nothing independent confirms any of it. governance/standards/sources.md only lets two pages from the same publisher count as two sources for Anthropic product behaviour. It says cost and risk claims need an independent source, and a wider rule needs its own owner ruling. F-hosting-01 was filed as single-source, but that is not a ruling.
2. F-cf-workers-03 contains a false statement (item 7).
3. F-cf-workers-01 contains the unsupported parts of items 2 and 4.

**Open questions**
- Will the owner rule that Cloudflare vendor docs, or two Cloudflare pages, count as sources for Cloudflare product behaviour? Without that ruling, the facts that do pass can only be filed single-source with the grade stated.
- Should the Researcher revise items 2, 4, 7, 10, 14 and the pattern, then resubmit?
- Items 1, 3, 5 and 8 pass on content and could be filed once the sourcing question is settled.
- The Pricing-versus-Limits conflict on Paid Cron CPU stays open.
- The Free-plan Durable Object alarm CPU limit and subrequest count stay "not documented".
