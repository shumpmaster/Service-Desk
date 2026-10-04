I've revised the memo to revision 5. The main fix is item 7b: I had cited the 2026-04-09 changelog as support for it, and the sentence I quoted doesn't say that. That citation is gone. I found a different sentence on the same page that probably does support it, but I read it through a summarizer, so the Source checker needs to confirm it in the raw file. Items 8c, 4b and 6 still have only one page each. The full memo is below for the Orchestrator to record verbatim.

---

# Q-006: limits on a single Cloudflare Workers invocation, Free vs Paid (researcher memo, revision 5, 2026-10-04)

**Short answer (unchanged).** 15 GitHub requests in one invocation are well within the Free plan's limit of 50 outbound requests. The limit that matters is Free's 10 ms of CPU per request, which can't be raised. Waiting on the network doesn't count toward it, but checking a sign-in token and parsing 15 replies does. That is an estimate on one page and hasn't been measured (item 14).

## 1. What I changed
- **Item 7b (a 7th connection waits rather than fails):**
  - **Removed** the citation of the changelog's "without queueing, as long as no more than six are waiting" sentence. The checker was right: it doesn't say a 7th connection queues.
  - **Added a different sentence from the same changelog** (2026-04-09). The summarizer returned it as text that goes with the page's after-the-change diagram: "A 7th fetch starts as soon as any earlier connection receives its response headers." Its before-the-change text reads: "A 7th fetch is queued until an earlier connection fully completes…" (the checker found that at :25).
  - Read together, the new rule is that a 7th fetch waits for headers and then starts. Neither sentence says it does not fail.
  - Grade: **B for now.** It becomes A only if the checker finds the "starts as soon as" sentence in the raw file. If it isn't there, 7b stays on Limits:216 alone.
- **Item 4:** split in two.
  - **4a (occasional overages are tolerated):** Limits:76, plus related support from a second page, Metrics and analytics. It says higher quantiles "may appear to exceed CPU time limits without generating invocation errors because of a mechanism in the Workers runtime that allows rollover CPU time for requests below the CPU limit."
    - That describes a related mechanism (rollover), not the same wording, so 4a is **B**.
  - **4b (consistent overages are terminated):** still Limits:76 only. Not proposed for filing.
- **Item 4c (new, from the same Metrics page):** "The Exceeded Resources status may appear when the Worker exceeds a runtime limit. The most common cause is excessive CPU time, but is also caused by a Worker exceeding startup time or free tier limits." This is offered only as context for what happens when a limit is exceeded. It is single-page and not proposed for filing.
- **Item 13:** restated without any 304 wording. The 304 question now sits only in "not documented" and the open questions.
- **Item 8c and item 6:** I searched again and found no second page.
  - 8c: Pricing:33 ("No charge for duration") is not cited as support. It was only context in revision 4, and that is now said outright.
  - 6: the 2026-02-11 changelog is not cited as support.
- **Item 14 (10–20 ms CPU estimate):** remains an estimate on one page. Not proposed for filing.

## 2. Why
The checker listed sources that didn't say what I claimed:
- **Changelog for 7b:** the sentence I cited didn't say it. Fixed by removing that citation and pointing to a different sentence the checker can verify.
- **Pricing for 8c:** it is about billing, not limits. Agreed. It is now context only.
- **Changelog 2026-02-11 for 6:** it has no error text. Agreed. Not cited.
- **304 for 13:** no page says it. Removed.

For each one-page item I searched for a second Cloudflare page, as owner ruling A allows (two Cloudflare pages count as two sources for product behaviour). The only new material is the Metrics page for 4a, and only as related support.

## Findings (changed items only; everything else is as filed in F-cf-workers-01, -02, -03, -06 and F-cf-do-01, or as in revision 4)

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 4a | Occasional CPU overages are tolerated: Limits says there is "built-in flexibility" for a Worker that "infrequently runs over". Metrics says CPU left over from requests under the limit can roll over. | fact | B (two pages, related wording) | Limits:76; [Metrics and analytics](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/) |
| 4b | A Worker that hits the CPU limit consistently is terminated. | fact | A, one page | Limits:76 only |
| 4c | Going over a runtime limit (most often CPU, also startup time or free-tier limits) shows as the "Exceeded Resources" status. | fact | A, one page | Metrics and analytics only |
| 6 | "Too many subrequests" is documented for Workflows only. For plain Workers the error is **not documented**. | fact (scope-limited) | B | Workflows limits:154-157 only |
| 7b | A 7th connection waits until an earlier one receives its response headers, then starts. No page says outright that it does not fail. | fact | B now; A if the checker finds the sentence | Limits:216; changelog 2026-04-09, "A 7th fetch starts as soon as any earlier connection receives its response headers" (line not yet set) |
| 8c | HTTP request on Free has no wall-time limit while the client stays connected. | fact | A, one page | Limits:159, :420 only |
| 13 | For O3: 15 requests use 30% of Free's 50 outbound requests. Each redirect hop adds one more. | estimate | B | from F-cf-workers-02 |
| 14 | The O3 workload's CPU would probably sit near or above Free's 10 ms. | estimate | C, one page | as in revision 4; not proposed |

### Proposed library entries (for the Source checker)
- **F-cf-workers-03 (amend), only if the sentence is confirmed:** move "a 7th connection is queued until an earlier connection receives its headers" from NOT filed to filed. Sources: Limits:216 and changelog 2026-04-09 (the line with "A 7th fetch starts as soon as…").
- **F-cf-workers-01 (amend, grade B part):** occasional overages are tolerated. Sources: Limits:76 and the Metrics and analytics rollover sentence. "Consistent overages are terminated" stays NOT filed.
- **Not proposed:** 4b, 4c, 6, 8c, 13, 14. **Still held:** item 11 and P-cf-fanout-01 (part 5).

## 3. What I verified
These were web fetches through a summarizer. I have no shell and ran no commands, so no line numbers.
- **Changelog 2026-04-09 (`index.md`), fetched:** returned the before and after sentences quoted under 7b.
- **Metrics and analytics (`index.md`), fetched:** returned the rollover and Exceeded Resources sentences quoted above.
- **Error 1102 support page (`index.md`), fetched:** says nothing about occasional versus consistent overages, termination or duration. It is not a second page for 4 or 8c.
- **Searches (Cloudflare domains only):**
  - "Too many subrequests": Workflows limits only.
  - Free HTTP duration: Limits only, nothing new.
  - Overage flexibility: led me to the Metrics page.
- **Not inspected:** the `.env*` files, package files and other environment files in this folder. The question rules that out.

## 4. What is undone
- Items 8c, 4b, 4c and 6 each have only one page.
- 7b depends on the checker confirming the sentence.
- **Still not documented:**
  - the error a plain Worker raises when it goes over the subrequest limit;
  - the CPU limit for a Durable Object or alarm on Free;
  - how many subrequests an alarm gets;
  - whether a 304 reply counts as a subrequest.
- The real CPU cost of the O3 workload can only be measured, and the question rules out testing.

## 5. What is needed outside my lane
- **Source checker:**
  - find "A 7th fetch starts as soon as any earlier connection receives its response headers" in the raw changelog 2026-04-09, and set its line number or reject 7b's upgrade;
  - check the Metrics and analytics rollover sentence for the F-cf-workers-01 amendment.
- **Chief of Staff → owner decision card (unchanged):** item 11 (subrequests aren't billed) and P-cf-fanout-01 are cost claims. The standard requires an independent source for those, but Q-006 allows Cloudflare sources only. The owner needs to choose one of:
  - allow a non-Cloudflare source for these two items;
  - accept them as single-source with the grade stated; or
  - leave them unfiled.
- **If O3 depends on item 14:** a separate task to measure CPU per request on a Free Worker.

## 6. Open questions
- Paid Cron and Queue CPU: which of Pricing, Limits and Queues limits is right (F-cf-workers-06)?
- On Free, what CPU limit does a Durable Object or alarm get, and how many subrequests does an alarm get?
- What error does a plain Worker raise when it goes over the subrequest limit?
- Does a 304 reply count as a subrequest?
- Does a queued 7th connection ever time out or fail, rather than just wait?

Sources:
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Relaxed simultaneous connection limiting (changelog 2026-04-09)](https://developers.cloudflare.com/changelog/post/2026-04-09-relaxed-connection-limiting/)
- [Workers metrics and analytics](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/)
- [Error 1102 (support)](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1102/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workflows limits](https://developers.cloudflare.com/workflows/reference/limits/)
- [Subrequests limit (changelog 2026-02-11)](https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/)
