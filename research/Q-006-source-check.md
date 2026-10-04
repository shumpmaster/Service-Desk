Verdict: FAIL

The folder isn't a git repository, so nothing was committed. I opened the changelog, Limits and Metrics pages as raw `index.md` copies with curl. Line numbers below come from those copies. I did not re-open the other sources, which are the Workflows limits, Error 1102, Pricing and 2026-02-11 changelog pages. Earlier rounds covered them, and the memo's claims that rest on them are held out anyway.

**Filed** (checked 2026-10-04, shelf life 6 months, opened by me)
- **F-cf-workers-07 (item 7b, grade B):** a 7th connection queues until an earlier one receives its response headers.
  - Limits:216 says it outright: "it is queued until one of the existing connections receives its response headers".
  - The changelog sentence the memo asked me to find is at changelog 2026-04-09:29: "A 7th fetch starts as soon as any earlier connection receives its response headers". It is only the image caption under the heading at :27, not body text. That is why this is B, not A.
  - Neither page says whether a queued connection can time out or fail, so I filed no claim that a 7th connection never fails.
  - The old-rule caption at :25 and the "without queueing" sentence at :31 are as the earlier round described them.
- **F-cf-workers-08 (item 4a, grade B):** occasional CPU overages are tolerated.
  - Limits:76 says each isolate has "built-in flexibility" for a Worker that "infrequently runs over the configured limit".
  - Metrics and analytics:58 contains the rollover sentence word for word. It describes a related mechanism, not the same claim, so the grade is B.
- I did not edit F-cf-workers-03 or F-cf-workers-01. The new entries supersede only the "not filed" notes in them.

**Not filed**
- **Item 4b (consistent overages are terminated):** Limits:76 only.
- **Item 4c (Exceeded Resources status):** Metrics:90 and :93 only. The memo doesn't propose filing it.
- **Item 6 (error text for too many subrequests):** Workflows limits only, and it covers Workflows, not plain Workers.
- **Item 8c (Free HTTP has no duration limit):** Limits:159 and :420 only. Pricing:33 is about billing.
- **Item 11 and P-cf-fanout-01 (cost claims):** no independent source, as `governance/standards/sources.md:10` requires.
- **Item 14 (the 10–20 ms CPU estimate):** one page. Limits:71 says "heavier workloads … typically use 10-20 ms" generally, not for this workload.
- **Item 13:** it rests on F-cf-workers-02, which I re-checked. Limits:188 gives 50 subrequests on Free. Items 13 and 14 are estimates, not facts.
- **"Can't be raised" in the memo's short answer:** nothing I opened says Free's 10 ms can't be raised.
  - Limits:84 and :90 describe raising CPU only on Paid.
  - Limits:37 describes a generic limit-increase form.
  - I filed nothing on this.

**Why FAIL:** the memo's short answer includes claims that can't be confirmed: the "can't be raised" claim, the item 14 estimate, and the held-out items 4b, 6, 8c and 11. By the rule that an unverifiable claim is a FAIL, the memo as a whole fails. The two proposed amendments themselves passed.

**Open questions**
- Is Free's 10 ms CPU limit fixed, or can it be raised by request? No page says.
- Which of Pricing, Limits and Queues limits is right for Paid Cron and Queue CPU (F-cf-workers-06)?
- What CPU limit and subrequest count apply to a Durable Object alarm on Free?
- What error does a plain Worker raise when it exceeds the subrequest limit?
- Does a 304 reply count as a subrequest?
- Can a queued 7th connection time out or fail?
- Should the owner allow a non-Cloudflare source for the two cost claims, accept them as single-source, or leave them unfiled?
- Should the O3 CPU cost be measured in a separate task?
