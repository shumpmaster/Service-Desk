---
id: F-cf-do-free-01
form: fact
claim: "On the Workers Free plan only SQLite-backed Durable Objects are available, with 100,000 requests a day and 13,000 GB-s duration a day; SQL stored data 5 GB (total). The DO pricing page also lists 5 million rows read and 100,000 rows written a day (that row figure is that page only). Quota facts only."
grade: A
topics: [cloudflare, durable-objects, limits]
checked_on: 2026-10-08
shelf_life: 3 months
opened_by: source-checker (Q-011, 2026-10-08); both pages read as raw markdown
memo: research/Q-011-memo.md
publisher_note: same publisher (Cloudflare), limits claim
sources:
  - https://developers.cloudflare.com/durable-objects/platform/pricing/
  - https://developers.cloudflare.com/workers/platform/pricing/  # Durable Objects section: SQLite only on Free; 100,000/day; 13,000 GB-s/day; 5 GB
note: Storage billing for SQLite DOs targeted 7 January 2026 (no earlier) per the DO page; Free-plan storage limit may be affected - recheck.
---
