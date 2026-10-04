id: F-cf-workers-06
checked-on: 2026-10-04
opened-by: source-checker (Q-006 round 4; raw index.md copies)
form: fact
supersedes: the Paid Cron CPU conflict part of F-cf-workers-02 (F-cf-workers-02 itself is unedited)
shelf-life: 6 months
grade: B (three Cloudflare pages disagree; conflict recorded, not resolved)
topics: cloudflare, hosting
claim: Paid Cron/Queue consumer CPU is documented inconsistently. Pricing says max 15 min CPU per Cron Trigger or Queue Consumer invocation. Limits says Cron CPU is 30 s (<1 h interval) or 15 min (>=1 h). Queues limits says consumer CPU is configurable to 5 min, default 30 s. No page says which is right. Free is 10 ms per Cron Trigger (Limits:72) and is not affected.
sources: https://developers.cloudflare.com/workers/platform/pricing/ (:34) ; https://developers.cloudflare.com/workers/platform/limits/ (:72) ; https://developers.cloudflare.com/queues/platform/limits/ (:34, :56)
