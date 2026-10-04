Verdict: FAIL

I re-opened the three pages that the two proposed library entries depend on. I fetched them as raw `index.md` copies with curl, and the line numbers below come from those copies. The two entries pass. The memo as a whole fails because several of its claims can't be confirmed. The folder isn't a git repository, so I committed nothing.

**Checked and confirmed**
- **Item 7b (a 7th connection queues until an earlier one gets its response headers):**
  - Limits:216 says: "If a seventh connection is attempted while six are already waiting for headers, it is queued until one of the existing connections receives its response headers."
  - Changelog 2026-04-09:29 contains "A 7th fetch starts as soon as any earlier connection receives its response headers". It is only the alt text of the "After" diagram, under the heading at :27, not body text.
  - The same changelog's old-rule caption is at :25. The "without queueing" sentence is at :31.
  - Neither page says what happens if a queued connection waits a long time, so no claim that a 7th connection never fails is filed.
  - Grade B, as the memo itself says.
  - **Filed:** `library/F-cf-workers-07.md`. Its claim text, line numbers and grade match what I just read, so I left it unedited.
- **Item 4a (occasional CPU overages are tolerated):**
  - Limits:76 says each isolate has "some built-in flexibility to allow for cases where your Worker infrequently runs over the configured limit".
  - Metrics and analytics:58 contains the rollover sentence word for word. It describes a related mechanism, not the same claim, so the grade is B.
  - **Filed:** `library/F-cf-workers-08.md`. It matches what I read, so I left it unedited.

**Not confirmed, so not filed**
- **"Can't be raised" (Free's 10 ms CPU limit, in the memo's short answer):**
  - Limits:22 and :71 give the 10 ms figure.
  - Limits:37 describes a generic Limit Increase Request Form, "if the limit can be increased".
  - Limits:84 and :90 describe raising CPU only on Paid.
  - No line says Free's limit is fixed.
- **4b (consistent overages are terminated):** Limits:76 only, one page.
- **4c (Exceeded Resources status):** the Metrics page only, one page. The memo doesn't propose filing it.
- **Item 6 (error text for too many subrequests):** the Workflows limits page only, and it covers Workflows, not plain Workers.
- **8c (Free HTTP has no duration limit):** Limits:159 and :420 only.
- **Item 11 and P-cf-fanout-01 (cost claims):** `governance/standards/sources.md:10` requires an independent source for cost claims, and there is none.
- **Item 14 (the 10–20 ms CPU estimate):** one page, and an estimate rather than a fact.

I did not re-open the Workflows limits, Error 1102, Pricing or 2026-02-11 changelog pages this round. The earlier-round notes cover them, and the memo's claims resting on them are held out regardless.

**Open questions**
- Is Free's 10 ms CPU limit fixed, or can it be raised on request?
- What CPU limit and subrequest count apply to a Durable Object alarm on Free?
- What error does a plain Worker raise when it exceeds the subrequest limit?
- Does a 304 reply count as a subrequest?
- Can a queued 7th connection time out or fail?
- Which of Pricing, Limits and Queues limits is right for Paid Cron and Queue CPU (F-cf-workers-06)?
- For items 11 and P-cf-fanout-01, should the owner allow a non-Cloudflare source, accept them as single-source, or leave them unfiled?
- Should the O3 CPU cost be measured in a separate task?
