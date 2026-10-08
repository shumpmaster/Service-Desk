---
id: F-cf-kv-01b
form: fact
claim: "Workers KV on the Free plan allows 1,000 key deletes and 1,000 list requests a day (also 100,000 reads, 1,000 writes, 1 GB). Limits reset daily at 00:00 UTC; beyond a limit, operations of that type fail with an error. Quota facts only, no price claim."
grade: A
topics: [cloudflare, kv, limits]
checked_on: 2026-10-08
shelf_life: 3 months
opened_by: source-checker (Q-011, 2026-10-08); both pages read as raw markdown (index.md)
memo: research/Q-011-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources for limits under governance/standards/sources.md
sources:
  - https://developers.cloudflare.com/kv/platform/pricing/  # table: Keys deleted 1,000/day; List requests 1,000/day; footnote 00:00 UTC
  - https://developers.cloudflare.com/workers/platform/pricing/  # same table under Workers KV
---
