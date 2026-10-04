I've written revision 6 of the memo; it's below for the Orchestrator to record verbatim. The main fix is the short answer: it said Free's 10 ms CPU limit "can't be raised", and no Cloudflare page says that, so it now says this is not documented. I searched again for second sources for the other items the checker held back and found none, so they stay unfiled.

---

# Q-006: limits on a single Cloudflare Workers invocation, Free vs Paid (researcher memo, revision 6, 2026-10-04)

**Short answer (revised).** The 15 GitHub requests the app makes in one invocation are well within the Free plan's limit of 50 outbound requests (F-cf-workers-02; item 13 is an estimate, grade B). The limit that matters is Free's 10 ms of CPU per request (F-cf-workers-01). Waiting on the network doesn't count toward it, but checking a sign-in token and parsing 15 replies does. Whether that work fits in 10 ms is an estimate based on one page, and nobody has measured it (item 14, grade C).

Whether Free's 10 ms can be raised is **not documented**:
- The Limits page describes raising CPU time only on Paid (Limits:84, :90).
- It mentions a general request form only "if the limit can be increased" (Limits:37).
- No page says Free's limit is fixed, and none says it can be raised.

So, from the documents, the documented way to get more than 10 ms of CPU is the Paid plan.

## 1. What I changed
- **Short answer:**
  - **Removed** "which can't be raised".
  - **Replaced it** with the wording above. It cites the lines the checker found (Limits:37, :84, :90) and says "not documented" for whether Free's limit can be raised.
  - Added the new item 15 to the findings to record this.
- **Items 7b and 4a:** now filed as F-cf-workers-07 and F-cf-workers-08 (both grade B). The memo now points to those entries and no longer proposes amending F-cf-workers-03 or -01. My revision-5 "A if confirmed" for 7b is dropped. The checker set B because the changelog line is diagram alt text, and I accept that.
- **Items 4b, 4c, 6, 8c and 14:** no change to what they claim. Each is now labelled single-page and not proposed for filing, and the findings table says why.
- **Item 11 and P-cf-fanout-01:** still held for the owner (part 5).

## 2. Why
- The checker found that no line supports "can't be raised" (source check: Limits:22, :71, :37, :84, :90). I cited no other page for it, so I can't keep the claim.
- One thing to flag: in this round's fetch, the summarizer again told me the Free limit "cannot be raised on Free plan". When I asked for the actual wording, though, it quoted only the Paid-plan sentence and the general form sentence. I took the checker's reading of the raw file over the summarizer's paraphrase.
- For the other held items, owner ruling A lets a second Cloudflare page count as a second source. I looked for one and found none (part 3), so they stay unfiled.

## Findings (changed items only; everything else is as filed in F-cf-workers-01, -02, -03, -06, -07, -08 and F-cf-do-01, or as in revision 5)

| # | Statement | Type | Grade | Sources | Filing |
|---|---|---|---|---|---|
| 15 (new) | Free's 10 ms CPU limit: the documents describe raising CPU time only on Paid. Whether Free's limit can be raised on request is **not documented**. | fact (scope-limited) | B: one page, and "not documented" can't have a second source | Limits:37, :84, :90 (lines as the checker read them) | not proposed; context for the short answer |
| 4a | Occasional CPU overages are tolerated | fact | B | — | **filed as F-cf-workers-08** |
| 4b | A Worker that hits the CPU limit consistently is terminated | fact | one page | Limits:76 only | not proposed |
| 4c | Going over a runtime limit shows as the "Exceeded Resources" status | fact | one page | Metrics and analytics only | not proposed |
| 6 | "Too many subrequests" is documented for Workflows only. The error a plain Worker raises is **not documented**. | fact (scope-limited) | B | Workflows limits:154-157 only | not proposed |
| 7b | A 7th connection is queued until an earlier one receives its response headers. Whether a queued connection can time out or fail is not documented. | fact | B | — | **filed as F-cf-workers-07** |
| 8c | An HTTP request on Free has no duration limit while the client stays connected | fact | one page | Limits:159, :420 only | not proposed |
| 14 | The O3 workload's CPU would probably sit near or above Free's 10 ms | estimate | C, one page | as in revision 4 | not proposed |

### Proposed library entries
None new this round. The checker has already filed F-cf-workers-07 and -08. Items 4b, 4c, 6, 8c, 14 and 15 are not proposed. Item 11 and P-cf-fanout-01 are still held.

## 3. What I verified
I fetched pages through a summarizer. I have no shell, so I ran no commands and have no line numbers of my own. Any line numbers above are the checker's.
- **Limits (`index.md`):** returned the Paid-only sentence about raising CPU ("On the Workers Paid plan, you can increase the maximum CPU time from the default 30 seconds to 5 minutes") and the general Limit Increase Request Form sentence. It also returned the termination sentence (4b) and the duration sentence (8c). The summarizer said nothing about the subrequest error, and no wording saying Free is fixed came back.
- **Errors and exceptions (`index.md`):** the summarizer found no text about going over the subrequest limit, consistent overages, or duration. So it is not a second page for 4b, 6 or 8c.
- **Historical changelog (`index.md`):** nothing on the subrequest error, Free HTTP duration, raising Free CPU, or termination. Its only duration entry is the 15-minute Cron limit, which is already filed.
- **Searches limited to Cloudflare domains:**
  - "Too many subrequests": only Workflows has the error text.
  - "no hard limit on duration": only the Limits page.
  - Free CPU increase: nothing beyond Limits and Pricing. Community-forum results were not used, because they are not official documentation.
- **cloudflare.com/plans** (reached through the workers.cloudflare.com/plans redirect, developer-platform page): no technical limits on the page.
- **Not inspected:** the `.env*` files, package files and other environment files in this folder. The question rules that out.

## 4. What is undone
- Items 4b, 4c, 6, 8c and 14 each still have only one page.
- **Not documented:**
  - whether Free's CPU limit can be raised;
  - the error a plain Worker raises when it goes over the subrequest limit;
  - the CPU limit for a Durable Object alarm on Free, and how many subrequests an alarm gets;
  - whether a 304 reply counts as a subrequest;
  - whether a queued 7th connection can time out.
- The real CPU cost of the O3 workload has not been measured, and the question rules out testing.

## 5. What is needed outside my lane
- **Source checker:** confirm that the revised short answer and item 15 match Limits:37, :84 and :90.
- **Chief of Staff, as a decision card for the owner (unchanged):** item 11 and P-cf-fanout-01 are cost claims. `governance/standards/sources.md:10` requires an independent source for those, but Q-006 allows Cloudflare sources only. The owner needs to choose one of:
  - allow a non-Cloudflare source for these two items;
  - accept them as single-source with the grade stated; or
  - leave them unfiled.
- **If O3 depends on item 14:** a separate task to measure CPU per request on a Free Worker. Possibly also a question to Cloudflare support on whether Free's CPU can be raised. That is outside a documents-only question.

## 6. Open questions
- Can Free's 10 ms CPU limit be raised on request, or is it fixed?
- Which of Pricing, Limits and Queues limits is right for Paid Cron and Queue CPU (F-cf-workers-06)?
- On Free, what CPU limit and how many subrequests does a Durable Object alarm get?
- What error does a plain Worker raise when it goes over the subrequest limit?
- Does a 304 reply count as a subrequest?
- Can a queued 7th connection time out or fail?
- Should the O3 CPU cost be measured in a separate task?

Sources:
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers metrics and analytics](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/)
- [Workers errors and exceptions](https://developers.cloudflare.com/workers/observability/errors/)
- [Historical changelog](https://developers.cloudflare.com/workers/platform/changelog/historical-changelog/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workflows limits](https://developers.cloudflare.com/workflows/reference/limits/)
- [Relaxed connection limiting (changelog 2026-04-09)](https://developers.cloudflare.com/changelog/post/2026-04-09-relaxed-connection-limiting/)
- [Subrequests limit (changelog 2026-02-11)](https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/)
- [Cloudflare developer platform plans](https://www.cloudflare.com/plans/developer-platform/)
