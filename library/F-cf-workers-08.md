id: F-cf-workers-08
checked-on: 2026-10-04
opened-by: source-checker (Q-006 round 5; raw index.md copies fetched with curl, line numbers from those copies)
form: fact
supersedes: the "Not filed here" overage note in F-cf-workers-01 (F-cf-workers-01 itself is unedited)
shelf-life: 6 months
grade: B (same publisher, two pages; the second describes a related mechanism, not the same wording)
topics: cloudflare, hosting
claim: Occasional CPU overages are tolerated. Limits:76 says each isolate has "built-in flexibility to allow for cases where your Worker infrequently runs over the configured limit". Metrics and analytics:58 says higher quantiles "may appear to exceed CPU time limits without generating invocation errors because of a mechanism in the Workers runtime that allows rollover CPU time for requests below the CPU limit". That the Worker is terminated if it hits the limit consistently is on Limits:76 only and is NOT filed.
sources: https://developers.cloudflare.com/workers/platform/limits/ (:76) ; https://developers.cloudflare.com/workers/observability/metrics-and-analytics/ (:58)
