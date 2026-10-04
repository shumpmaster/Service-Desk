id: F-cf-workers-03
checked-on: 2026-10-04
opened-by: source-checker (Q-006 round 4; all sources fetched as raw index.md, line numbers from those copies)
form: fact
shelf-life: 6 months
grade: A (same publisher: two or more Cloudflare pages per owner ruling A 2026-10-03)
topics: cloudflare, hosting
claim: Each Workers invocation may have up to six connections waiting for response headers at once; a connection stops counting once its headers arrive (changelog 2026-04-09 replaced the older rule, 2019-09-19, of 6 concurrent outgoing fetches held until the body was read). Wall time limits: Cron Trigger 15 min; Queue consumer 15 min; Durable Object alarm 15 min; HTTP request on Paid no limit while client stays connected. ctx.waitUntil() runs up to 30 s after the response is sent or client disconnects, the 30 s is shared across all waitUntil calls in the request, unfinished promises are cancelled. NOT filed (one page only): that a 7th connection is queued (only Limits:216 says so; changelog 2026-04-09 only says "without queueing" while no more than six wait); that HTTP on Free has no duration limit (Limits:159, :420 only; Pricing:33 says only "No charge for duration").
sources: https://developers.cloudflare.com/workers/platform/limits/ (:25, :155-159, :205, :216, :420-423) ; https://developers.cloudflare.com/changelog/post/2026-04-09-relaxed-connection-limiting/ (:21, :31) ; https://developers.cloudflare.com/workers/platform/changelog/historical-changelog/ (:362 Cron 15 min, :449 old 6-fetch rule) ; https://developers.cloudflare.com/workers/platform/pricing/ (:34 "No charge or limit for duration") ; https://developers.cloudflare.com/workers/runtime-apis/context/ (:234) ; https://developers.cloudflare.com/queues/platform/limits/ (:33, :84-86)
