I've revised the memo to round 4. The checker's round-3 verdict was FAIL, but four entries were filed. Two of the held-back claims (items 7 and 8) now have a second Cloudflare page each. Two others (items 4 and 6) still have only one page. Item 11 and the fan-out pattern are blocked by a sourcing conflict only the owner can settle. The full memo is below for the Orchestrator to record verbatim.

---

# Q-006: limits on a single Cloudflare Workers invocation, Free vs Paid (researcher memo, revision 4, 2026-10-04)

**Short answer (unchanged).** 15 GitHub requests in one invocation are well within the Free plan's limit of 50 outbound requests (subrequests). The limit that matters is Free's 10 ms of CPU, which can't be raised. Waiting on the network doesn't count toward it, but checking a sign-in token and parsing 15 replies does. Cloudflare's own typical figure for that kind of work is 10–20 ms, so this workload would probably sit at or above the Free limit. That is an estimate; it hasn't been measured.

## 1. What I changed
- **Item 7 (6 connections waiting at once):** added a second page, the changelog of 2026-04-09, "Relaxed simultaneous connection limiting for Workers". It says: "a connection is freed as soon as response headers arrive, so the six-connection limit only constrains how many connections can be in the initial 'waiting for headers' phase simultaneously." The 2019-09-19 historical changelog ("up to 6 concurrent outgoing `fetch()` requests") is recorded as the older rule, now replaced.
  - That the 7th connection waits rather than fails is still graded B. The changelog only implies it: the search excerpt says Workers can have more connections open "without queueing, as long as no more than six are waiting". I could not get that sentence back from the page fetch itself.
- **Item 8 (wall-clock time):** added second pages:
  - Cron 15 min: historical changelog, 2021-04-19: "Cron Triggers now have a 15 minute wall time limit, in addition to the existing CPU time limit."
  - Paid HTTP has no time limit: the Pricing table's Standard row reads "No charge or limit for duration".
  - `waitUntil` 30 s: the Context API page says "waitUntil has a 30-second time limit after invocation end", that the limit is shared across all calls, and that unfinished tasks are cancelled.
  - Queue consumer 15 min: Queues limits.
  - Free HTTP's "no limit" still has only Limits. The Free row of Pricing says "No charge for duration", which is about charges, not limits.
- **Item 13:** dropped the claim that a 304 reply counts as a subrequest. No page says it either way. It is now **not documented**.
- **Item 3a (Paid Cron CPU conflict):** added related evidence. Queues limits gives "Consumer CPU time | Configurable to 5 minutes", while Pricing gives "Max of 15 minutes of CPU time per … Queue Consumer invocation". So Pricing's 15-minute line conflicts with a second page as well. My opinion (grade C) is that Pricing's line is the odd one out. That doesn't settle the conflict.
- **Item 4:** the sentence that consistent overages get the Worker terminated still has only one page. Errors gives only the 1102 wording, and the 2025-03-25 CPU changelog doesn't cover what happens when the limit is exceeded. It stays in the memo, and I don't propose filing it.
- **Item 6 ("Too many subrequests"):** still found only on the Workflows limits page. The 2026-02-11 changelog says long-running requests "could often exceed this limit and error" but gives no message. I've withdrawn the proposed entry F-cf-workers-04.
- **Item 9a (CPU for a Durable Object on Free):** still not documented. I checked the DO pricing page and the DO release notes (2025-04-07, "available on the Workers Free plan with these limits"). Neither gives a CPU figure for Free.
- **Proposed entries:** F-cf-workers-03 is put forward again for items 7 and 8, now with two pages each, and the parts still on one page are separated out. F-cf-workers-04 is withdrawn. P-cf-fanout-01 is held (part 5).

## 2. Why
Under the owner's ruling A (2026-10-03, quoted by the checker), two pages of Cloudflare's own documentation count as two sources for product behaviour. The checker held items 7, 8, 6 and 4 back only because each rested on one page, so I looked for second pages. It asked me to cite the 304 claim or drop it; I dropped it. Item 11 and the fan-out pattern are cost claims, which still need an independent source. The question allows Cloudflare sources only, so I can't fix those in my lane.

## Findings (changed or affected items only; items 1–3, 5, 9, 9a, 10 and 12 are as filed or as in revision 3)

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 3a+ | Pricing: "Max of 15 minutes of CPU time per Cron Trigger or Queue Consumer invocation". Limits: Paid Cron 30 s (< 1 h interval) / 15 min (≥ 1 h). Queues limits: consumer CPU "Configurable to 5 minutes". Two pages disagree with Pricing. | fact (conflict) | B | Pricing; Limits; [Queues limits](https://developers.cloudflare.com/queues/platform/limits/) |
| 3a-op | Pricing's 15-minute line is probably out of date or loosely worded. | opinion | C | from 3a+ |
| 4 | Occasional overages are tolerated ("built-in flexibility … infrequently runs over"). Consistent overages are terminated. | fact | A, one page | Limits only |
| 6 | "Too many subrequests" is documented for Workflows only. For plain Workers the error is **not documented**. | fact (scope-limited) | B | Workflows limits only |
| 7 | At most 6 connections per invocation can wait for response headers at once. A connection is freed when its headers arrive. | fact | A | Limits; [Changelog 2026-04-09](https://developers.cloudflare.com/changelog/post/2026-04-09-relaxed-connection-limiting/) |
| 7b | A 7th connection is queued until one of the existing connections receives its headers. It waits; it does not fail. | fact | B (stated on Limits, implied by the changelog) | Limits; changelog 2026-04-09 (search excerpt) |
| 8a | Wall time: Cron Trigger 15 min. | fact | A | Limits; [Historical changelog 2021-04-19](https://developers.cloudflare.com/workers/platform/changelog/historical-changelog/) |
| 8b | Wall time: HTTP request on Paid, no limit. | fact | A | Limits; Pricing ("No charge or limit for duration") |
| 8c | Wall time: HTTP request on Free, no limit. | fact | A, one page | Limits only |
| 8d | `waitUntil` runs for up to 30 s after the response is sent or the client disconnects. The 30 s is shared across calls, and unfinished tasks are cancelled. | fact | A | Limits; [Context API](https://developers.cloudflare.com/workers/runtime-apis/context/) |
| 8e | Wall time: DO alarm 15 min (filed as F-cf-do-01); Queue consumer 15 min. | fact | A | Limits; DO limits; Queues limits |
| 13 | For O3: 15 requests use 30% of Free's 50. Each redirect hop adds one. Whether a 304 reply counts is **not documented**. | estimate | B | from #5 |

### Proposed library entries (for the Source checker)
- **F-cf-workers-03** (fact, grade A, 6 months, topics cloudflare/hosting):
  - Claim: "Each invocation may have at most 6 connections waiting for response headers. A connection stops counting once its headers arrive (changelog 2026-04-09; this replaced the older rule of 6 concurrent fetches from 2019-09-19). Wall time: Cron Trigger 15 min; Queue consumer 15 min; DO alarm 15 min; HTTP request on Paid, no limit. `ctx.waitUntil()` may run up to 30 s after the response is sent, shared across calls, with unfinished tasks cancelled. Single page only (grade B): that a 7th connection is queued rather than failed; that HTTP on Free has no duration limit."
  - Sources: Limits; changelog 2026-04-09; historical changelog 2021-04-19; Pricing; Context API; Queues limits.
- **F-cf-workers-02 (amend):** add the Queues limits evidence to the Cron/Queue CPU conflict.
- **F-cf-workers-04:** withdrawn.
- **P-cf-fanout-01:** held. It is a cost recommendation (part 5).

## 3. What I verified
These were web fetches through a summarizer. I have no shell and ran no commands.
- **Pages fetched:**
  - Limits (`index.md`): the connections text, the duration table, the CPU table, the flexibility sentence. No "Too many subrequests" and no 304.
  - Changelog 2026-04-09: fetched twice. Both returns gave the "freed as soon as response headers arrive" sentence.
  - Historical changelog: the 2021-04-19 Cron wall-time sentence and the 2019-09-19 entry on 6 concurrent fetches.
  - Pricing: table copied verbatim, including "No charge or limit for duration" and footnote 1.
  - Context API: the `waitUntil` 30 s text.
  - Queues limits: the consumer CPU and duration rows, verbatim.
  - Errors: 1102 and 1027 only.
  - Changelog 2026-02-11: no billing statement and no error text.
  - 2025-03-25 CPU changelog: says nothing about exceeding the limit, Free, or Durable Objects.
  - DO pricing and DO release notes: no CPU figure for Free.
  - Cron Triggers page and Workers changelog: no figures.
- **Searches:** "Too many subrequests" (Workflows page only); DO Free CPU (nothing new).
- **Limits of this check:** the summarizer doesn't return line numbers, so the checker needs to set them from the raw files. The "without queueing" phrase behind 7b comes from a search excerpt, not a fetch.
- **Not inspected:** the `.env*` files, package files and other environment files in this folder. The question rules that out.

## 4. What is undone
- Still not documented: the error for exceeding the subrequest limit on plain Workers; the CPU limit for a Durable Object or alarm on Free; an alarm's subrequest count; whether a 304 reply counts as a subrequest.
- Items 4 and 8c each have only one page.
- The real CPU cost of the O3 workload can only be measured, and the question rules out testing.

## 5. What is needed outside my lane
- **Chief of Staff → owner decision card:** item 11 (subrequests aren't billed) and P-cf-fanout-01 are cost claims. The standard requires an independent source for those, but Q-006 allows Cloudflare sources only. The owner needs to choose one of:
  - allow a non-Cloudflare source for these two items; or
  - accept them as single-source with the grade stated; or
  - leave them unfiled.
- **Source checker:**
  - check F-cf-workers-03 and the F-cf-workers-02 amendment against the raw files;
  - fetch the raw changelog 2026-04-09 to confirm or reject the "without queueing" wording behind 7b.
- **If O3 depends on #14:** a separate task to measure CPU per request on a Free Worker.

## 6. Open questions
- Paid Cron and Queue CPU: is Pricing's 15 min right, or are Limits and Queues limits (30 s / 5 min) right?
- On Free, does a Durable Object or alarm get 30 s of CPU or 10 ms? Does an alarm get a fresh 50 subrequests?
- What error does a plain Worker raise when it goes over the subrequest limit?
- Does a 304 reply count as a subrequest? It almost certainly costs one fetch, but no page says so.

Sources:
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers errors](https://developers.cloudflare.com/workers/observability/errors/)
- [Relaxed simultaneous connection limiting (changelog 2026-04-09)](https://developers.cloudflare.com/changelog/post/2026-04-09-relaxed-connection-limiting/)
- [Workers historical changelog](https://developers.cloudflare.com/workers/platform/changelog/historical-changelog/)
- [Workers changelog](https://developers.cloudflare.com/workers/platform/changelog/)
- [Context API (waitUntil)](https://developers.cloudflare.com/workers/runtime-apis/context/)
- [Queues limits](https://developers.cloudflare.com/queues/platform/limits/)
- [Subrequests limit (changelog 2026-02-11)](https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/)
- [Run Workers for up to 5 minutes of CPU time (changelog 2025-03-25)](https://developers.cloudflare.com/changelog/post/2025-03-25-higher-cpu-limits/)
- [Workflows limits](https://developers.cloudflare.com/workflows/reference/limits/)
- [Durable Objects limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Durable Objects release notes](https://developers.cloudflare.com/durable-objects/release-notes/)
- [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
