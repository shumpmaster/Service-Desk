---
id: F-cf-05
form: fact
claim: "Worker-level Cloudflare Access (announced 2026-08-14) protects every domain of a Worker (routes, Custom Domains, workers.dev, previews) and can be set account-wide; the Worker reads identity via ctx.access with no JWT parsing. WebSocket upgrades to a protected Worker fail with 403 (docs page only). Not documented for Pages projects."
grade: A
topics: [cloudflare, authentication]
checked_on: 2026-10-04
shelf_life: 6 months
opened_by: source-checker (Q-008, 2026-10-04), raw page HTML re-fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-008-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources under governance/standards/sources.md for product behaviour
sources:
  - https://developers.cloudflare.com/workers/configuration/cloudflare-access/  # "automatically protects every domain associated with the Worker, including its routes, Custom Domains, workers.dev hostname, and previews"; "No extra configuration or JWT parsing is required."; WebSocket 403
  - https://blog.cloudflare.com/workers-protected-by-access/  # "It doesn't matter how the request gets to your Worker..."; account-wide default private
  - https://developers.cloudflare.com/changelog/post/2026-08-14-workers-access/  # ctx.access; account-level protection (does not itself state the all-hostnames claim)
note: Earlier entries F-auth-04 / P-auth-01 (validate the JWT) concern per-hostname Access and the 2025-10-03 one-click flow; they are not contradicted, not edited here.
---
