---
id: F-cf-pages-do-01
form: fact
claim: "A Cloudflare Pages project cannot define a Durable Object itself; a separate Worker with the Durable Object must be created and bound to the Pages project."
grade: A
topics: [cloudflare, hosting]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08), through a summarising fetch
memo: research/Q-011-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources under governance/standards/sources.md for product behaviour
sources:
  - https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/  # "you must create a separate Worker with a Durable Object and then declare a binding to it"
  - https://developers.cloudflare.com/pages/functions/bindings/  # "You cannot create and deploy a Durable Object within a Pages project."
note: Not filed (one page affirms): Pages has no Cron Triggers (matrix says ❌; the bindings page and Cron Triggers page are silent). Service-binding route from Pages to a Worker: bindings page only.
---
