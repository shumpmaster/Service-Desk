id: F-cf-do-01
checked-on: 2026-10-03
opened-by: source-checker (Q-006 check; all sources fetched directly as raw index.md, line numbers from those files)
form: fact
shelf-life: 6 months
grade: A for the stated figures; the Free-plan question is a documented gap
topics: cloudflare, hosting
claim: Durable Object invocations (HTTP request, WebSocket message, alarm) default to 30 s CPU, configurable to 5 min via limits.cpu_ms. Each incoming request or WebSocket message resets remaining CPU time to 30 s (footnote 4). Alarm handlers have 15 min wall time. The same page says DOs "have the same per invocation CPU limits as any Workers do" and does not say how this fits Workers Free (10 ms). Not documented: the Free-plan DO CPU limit, and an alarm's subrequest count (no "subrequest" row on the DO page).
sources: https://developers.cloudflare.com/durable-objects/platform/limits/ (:31, :99, :101, :157, :168) ; https://developers.cloudflare.com/workers/platform/limits/ (:71, :423)
