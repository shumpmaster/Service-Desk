Verdict: FAIL

I filed nothing and changed nothing in `library/`. The revised memo's claims all check out against the pages. What blocks filing is the sourcing rule, which the memo itself flags.

I fetched all six cited pages as raw `index.md` from developers.cloudflare.com. The line numbers below are from those fetched files, and they match the memo's line references. Raw copies are in `$TMPDIR`.

**Why nothing was filed**
- `governance/standards/sources.md:7-9` only lets two same-publisher pages count as two sources for Anthropic product behaviour. Claims about cost, risk or quality still need an independent source.
- Every proposed entry comes from Cloudflare alone, so I cannot confirm any of them as two-source facts.
- The proposed entries tagged cost are F-cf-workers-01, -02 and -05. The sourcing standard also requires two sources for load-bearing facts.
- The sourcing ruling is still not in the folder (memo part 5). The earlier single-source filing of F-hosting-01 does not count as one.

**Revised items confirmed**
- **Item 9:**
  - The DO limits page says "By default, the maximum CPU time per Durable Objects invocation (HTTP request, WebSocket message, or Alarm) is set to 30 seconds" (DO limits:101).
  - The CPU row for SQLite-backed objects reads "30 seconds (default) / configurable to 5 minutes" (:31).
  - The reset-to-30-seconds sentence is in footnote 4 (:168).
  - The alarm wall time of 15 minutes is at :157, and also at Limits:423.
  - Searching the DO page for "subrequest" finds only the six-connection row (:70). That is the connection limit, not a subrequest count, so the alarm subrequest count is correctly "not documented".
- **Item 9a:** the conflict is real. DO limits:99 says DOs "have the same per invocation CPU limits as any Workers do", and Limits:71 gives Free 10 ms. The DO page's plan distinctions cover storage, class counts and the SQLite-only rule (:24, :25, :54). The page does not say which CPU limit applies to a DO on Free.
- **Item 15:** the C grade is right. Limits:216 says a 7th connection is queued until one of the existing connections receives its response headers. Time to first header is not documented, so the claim stays an estimate.
- **Items 1-8, 10, 11 and 14:** confirmed.
  - Limits:67, :71-72, :74, :76, :80, :171, :188-191, :216 and :420-423.
  - Pricing:33, :34 and :36. The 3a conflict is at Pricing:34, which gives "Max of 15 minutes of CPU time per Cron Trigger or Queue Consumer invocation" with no interval condition.
  - Errors:26 and :32.
  - Workflows limits:157.
  - The changelog line about Free staying at 50 external and 1000 Cloudflare-service subrequests.

**Small notes for the Researcher**
- Limits:129 gives the same Error 1102 message for memory limits. This supports the open question about why the 1102 wording differs between pages.
- Item 13, the 15-of-50 arithmetic, rests on item 5 and is fine. Its redirect and 304 sub-claims go beyond the cited text. Redirects are covered at Limits:191, but a 304 counting as a subrequest is not stated on any page I read.

**Open questions**
- Will the owner rule that Cloudflare's own documentation counts as a source for Cloudflare product behaviour, or approve single-source filing with the grade stated? Once that is decided, the entries can be filed. F-cf-workers-01, -03, -05 and -04 (grade B, Workflows-only) can go as written. F-cf-workers-02 can go with the 3a conflict stated, and F-cf-do-01 with the 9a gap.
- Which page is right for Paid Cron CPU: Pricing or Limits?
- Which CPU limit applies to a Durable Object on Free, and does an alarm get its own subrequest count?
- Should the 304 claim in item 13 be cited or dropped?
