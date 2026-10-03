id: F-cf-workers-02
checked-on: 2026-10-03
opened-by: source-checker (Q-006 check; all sources fetched directly as raw index.md, line numbers from those files)
form: fact
shelf-life: 6 months
grade: A for Free and Paid HTTP CPU and subrequests; B for Paid Cron CPU (pages conflict)
topics: cloudflare, hosting
claim: Subrequests per invocation: Free 50 external plus 1,000 to Cloudflare services; Paid 10,000 default, settable up to 10M; each redirect hop counts. Paid CPU per HTTP request is 5 min max, 30 s default. Paid Cron CPU CONFLICT: Limits:72 says 30 s (<1 h interval) or 15 min (>=1 h); Pricing:34 says max 15 min per Cron Trigger or Queue Consumer with no interval condition. Not filed (single source, cost claim): that subrequests are not billed (Pricing:36 only).
sources: https://developers.cloudflare.com/workers/platform/limits/ (:71-72, :188-191) ; https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/ (:23, :38) ; https://developers.cloudflare.com/workers/platform/pricing/ (:34)
