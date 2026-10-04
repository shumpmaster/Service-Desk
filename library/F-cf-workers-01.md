id: F-cf-workers-01
checked-on: 2026-10-03
opened-by: source-checker (Q-006 check; all sources fetched directly as raw index.md, line numbers from those files)
form: fact
shelf-life: 6 months
grade: A (same publisher: two Cloudflare pages per owner ruling A 2026-10-03)
topics: cloudflare, hosting
claim: Workers Free allows 10 ms CPU time per HTTP request and per Cron Trigger. CPU time excludes time waiting on network requests (fetch, KV, database). Exceeding the CPU limit returns Error 1102; the Limits page words it "Worker exceeded resource limits", the Errors page "Worker exceeded CPU time limit". Not filed here (single page only): that occasional overages are tolerated but consistent ones are terminated (Limits:76).
sources: https://developers.cloudflare.com/workers/platform/limits/ (:67, :71-72, :80) ; https://developers.cloudflare.com/workers/platform/pricing/ (:33, 10 ms per invocation) ; https://developers.cloudflare.com/workers/observability/errors/ (:26) ; https://developers.cloudflare.com/durable-objects/platform/limits/ (:99, network waits do not count)
