Verdict: FAIL

I opened all six cited pages again as raw `index.md` from developers.cloudflare.com, and the line numbers below come from those copies. I filed four entries and held back five claims. Each held-back claim fails because only one page supports it, or because no page does. Nothing was committed (the folder is not a git repository).

**Sourcing rule.** The earlier source check's "no ruling" blocker is out of date. `governance/standards/sources.md:1-9` now carries owner ruling A of 2026-10-03: two pages of a vendor's own documentation count as two sources for product behaviour. Claims about cost, risk or quality still need an independent source.

**Filed** (`library/`, checked 2026-10-03, shelf life 6 months, opened by source-checker)
- **F-cf-workers-01** (grade A, topics cloudflare, hosting): items 1, 2 and the Error 1102 part of item 4. I narrowed it from the proposal.
  - Free CPU is 10 ms per HTTP request and per Cron Trigger (Limits:71-72; Pricing:33).
  - Network waits don't count as CPU time (Limits:67; DO limits:99).
  - Exceeding the limit returns Error 1102 (Limits:80; Errors:26). The two pages word it differently.
  - I left out the "consistent overages are terminated" sentence (Limits:76) because only one page says it.
- **F-cf-workers-02** (grade A, B for Paid Cron CPU): items 3, 3a and 5, without item 11.
  - Subrequests: Free 50 plus 1,000 to Cloudflare services; Paid 10,000, settable up to 10M; redirect hops count (Limits:188-191; changelog:23, :38).
  - Paid HTTP CPU is 5 min, 30 s default (Limits:71; Pricing:34).
  - The Paid Cron CPU conflict is recorded: Limits:72 gives 30 s under a 1-hour interval, while Pricing:34 gives 15 min with no condition.
- **F-cf-workers-05** (grade A): item 10.
  - 100,000 requests a day, resetting at midnight UTC (Limits:171; Pricing:33).
  - Error 1027 on exceeding it (Errors:32).
- **F-cf-do-01** (grade A for the figures; the Free-plan question is recorded as a documented gap): items 9 and 9a, as in the memo's rewritten item 9.
  - DO CPU is 30 s by default, up to 5 min with `limits.cpu_ms` (DO limits:31, :101).
  - Each incoming request or message resets CPU time to 30 s (:168).
  - Alarm wall time is 15 min (DO limits:157; Limits:423).
  - The page says DOs "have the same per invocation CPU limits as any Workers do" (:99) and never says how that fits Free's 10 ms.
  - There is no alarm subrequest count; "subrequest" does not appear on the DO page.

**Not filed**
- **Item 11** (subrequests not billed): this is a cost claim with one source (Pricing:36). The standard requires an independent source for cost claims.
- **Item 7** (6-connection limit, the 7th queues until a header arrives): Limits:205 and :216 are on the same page, so this has one source.
- **Item 8** (wall time): Cron, Queue and HTTP rest on Limits:150-159 and :420-423 only. Only the alarm figure has a second page.
- **Item 6** (`Too many subrequests` error): only Workflows limits:157. It is scoped to Workflows and has no second page.
- **Item 13** (a 304 reply counts as a subrequest): I could not confirm it. A search for "304" and "not modified" in Limits found nothing. The redirect part is supported (Limits:191), and the 15-of-50 arithmetic holds.
- **Item 14** (CPU estimate) and **P-cf-fanout-01** (the pattern): the only support is the "10-20 ms" figure at Limits:74, from one page. The pattern is also a cost recommendation.
- **Item 15:** the C grade is correct. Limits:216 does not document time to first header, so it stays an estimate and is not filed.

Items 1-5, 9, 9a, 10 and 12 otherwise match the pages.

**Open questions**
- Which page is right for Paid Cron CPU: Pricing:34 or Limits:72?
- Which CPU limit applies to a Durable Object, or an alarm, on Free? What is an alarm's subrequest count?
- Does the owner want a cost-claim independent source for item 11 and the fan-out pattern? The question restricts sources to Cloudflare only, so no such source can be found under it.
- Item 13: cite the 304 claim from somewhere or drop it.
- Limits:129 gives Error 1102 for memory limits too, which may explain the different 1102 wording on the two pages. Neither page says so.
