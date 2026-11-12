---
id: F-cf-loc-01
form: fact
claim: "Workers KV stores data in a small number of centralized data centers and caches it in Cloudflare data centers after access; the page states no jurisdiction. Durable Object jurisdictions are eu, us and fedramp; location hints are a best effort and not a guarantee; Durable Objects do not currently change locations after creation."
grade: B
checked_on: 2026-11-12
shelf_life: 6 months
topics: [cloudflare, data-location]
sources:
  - https://developers.cloudflare.com/kv/concepts/how-kv-works/
  - https://developers.cloudflare.com/durable-objects/reference/data-location/
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Two pages, absence claim for KV jurisdiction (no 'jurisdiction' string on the page)."
---
