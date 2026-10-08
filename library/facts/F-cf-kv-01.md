---
id: F-cf-kv-01
form: fact
claim: "Workers KV Free plan: 100,000 reads per day, 1,000 writes per day, 1 GB storage. At most 1 write per second to the same key (429 beyond that). A write is visible at once in the same location but can take up to 60 seconds (or the cacheTtl value) to be visible elsewhere."
grade: A
topics: [cloudflare, limits]
checked_on: 2026-10-08
shelf_life: 3 months
opened_by: source-checker (Q-011, 2026-10-08), through a summarising fetch
memo: research/Q-011-memo.md
publisher_note: same publisher (Cloudflare); two pages per figure. Ruled as product limits/behaviour under governance/standards/sources.md (two vendor pages suffice). No price or cost recommendation is filed; a dollar-cost claim would need an independent source.
sources:
  - https://developers.cloudflare.com/kv/platform/limits/  # 100,000 reads/day; 1,000 writes/day; 1 GB; 1 write/sec same key
  - https://developers.cloudflare.com/kv/platform/pricing/  # Free: 100,000 reads, 1,000 writes, 1 GB
  - https://developers.cloudflare.com/kv/api/write-key-value-pairs/  # 1 write/sec same key, 429; "up to 60 seconds (or the value of the cacheTtl parameter...)"
  - https://developers.cloudflare.com/kv/concepts/how-kv-works/  # "up to 60 seconds or more"; cacheTtl default 60
note: NOT filed - Free deletes 1,000/day and lists 1,000/day: seen on the pricing page only (the limits page fetch did not itemise them). Single page.
---
