---
id: F-cf-06
form: fact
claim: "Pages Functions run on Cloudflare Workers and their requests count against the Workers plan quota. The Workers/Pages compatibility matrix marks as Workers-only (Pages unsupported): Vite plugin, Gradual Deployments, --remote, Workers Logs, Logpush, Tail Workers, Source Maps, Cron Triggers, Email Workers, Queue Consumers, Rate Limiting binding, non-root routes; Durable Objects is workaround-only on Pages. The matrix is one page (grade B). Identical runtime limits to Workers: not documented."
grade: A
topics: [cloudflare, hosting]
checked_on: 2026-10-04
shelf_life: 6 months
opened_by: source-checker (Q-008, 2026-10-04), raw page HTML re-fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-008-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources under governance/standards/sources.md for product behaviour
sources:
  - https://developers.cloudflare.com/pages/functions/  # "executing code on the Cloudflare network with Cloudflare Workers"
  - https://developers.cloudflare.com/pages/functions/pricing/  # "Requests to your Functions are billed as Cloudflare Workers requests"
  - https://developers.cloudflare.com/pages/platform/limits/  # "Requests to Pages functions count towards your quota for Workers plans"
  - https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/  # compatibility matrix (single page)
  - https://developers.cloudflare.com/pages/functions/wrangler-configuration/  # "You can configure limits for your Pages project in the same way you can for Workers" (single page)
note: Extends F-hosting-01.
---
