Verdict: PASS

The revision-6 short answer and item 15 match the Limits page. I fetched `https://developers.cloudflare.com/workers/platform/limits/index.md` with curl and read the line numbers from that copy. There is nothing new to file this round, and I committed nothing.

**Confirmed (Limits page)**
- **:37** says "To request an adjustment to a limit, complete the Limit Increase Request Form… If the limit can be increased, Cloudflare will contact you with next steps." This is a general form, and it names no plan. The memo describes it correctly.
- **:84 and :90** both describe raising CPU time only "On the Workers Paid plan", from a 30-second default up to 5 minutes. The memo's wording, "describes raising CPU time only on Paid", is accurate.
- **:22 and :71** give 10 ms for Free. No line on the page says Free's limit is fixed or that it can be raised, so "not documented" for Free is a fair reading of this page. The removed "can't be raised" claim is gone.
- **Short-answer claims that are filed or confirmed:**
  - Free allows 50 subrequests per invocation: Limits:188, which matches F-cf-workers-02.
  - Free's CPU limit is 10 ms: Limits:71, which matches F-cf-workers-01.
  - Waiting on network requests does not count toward CPU time: Limits:67.
  - The 15-request workload is the memo's own estimate (item 13), and the memo labels it as one.
- **Item 14** is labelled an estimate at grade C on one page, and the memo doesn't present it as fact.
- **F-cf-workers-07 and -08** exist, and their claim text matches what the memo cites. Limits:76 and :216 re-read as quoted.

**Not filed (single page or held, and the memo says so)**
- **4b** (consistent CPU overages are terminated): Limits:76 only.
- **4c** (Exceeded Resources status): the Metrics page only.
- **6** (subrequest error text): the Workflows limits page only.
- **8c** (Free HTTP has no duration limit): Limits:159 and :420, the same page.
- **14** (the 10–20 ms CPU estimate): one page, and an estimate.
- **Item 11 and P-cf-fanout-01** (cost claims): `governance/standards/sources.md:10` requires an independent source, and none exists.
- **Item 15** is not proposed for filing, since "not documented" can't have a second source.

I did not re-open the Metrics, Errors, Pricing, Workflows, or changelog pages this round. The memo claims nothing new from them.

**Open questions**
- Can Free's 10 ms CPU limit be raised on request? This is not documented on the Limits page.
- Which of Pricing, Limits and Queues limits is right for Paid Cron and Queue CPU (F-cf-workers-06)?
- On Free, what CPU limit and subrequest count does a Durable Object alarm get?
- What error does a plain Worker raise when it exceeds the subrequest limit?
- Does a 304 reply count as a subrequest?
- Can a queued 7th connection time out or fail?
- Items 11 and P-cf-fanout-01 need an owner decision: allow a non-Cloudflare source, accept them as single-source, or leave them unfiled.
- Should the CPU cost of the O3 workload be measured in a separate task?
