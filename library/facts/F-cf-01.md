---
id: F-cf-01
form: fact
claim: "Pages projects get a pages.dev subdomain; Workers get <worker-name>.<account-subdomain>.workers.dev. A Worker route or Custom Domain needs an active Cloudflare zone on the account (routes also a proxied DNS record); Workers does not support domains whose nameservers are not managed by Cloudflare, unlike Pages."
grade: A
topics: [cloudflare, hosting]
checked_on: 2026-10-04
shelf_life: 6 months
opened_by: source-checker (Q-008, 2026-10-04), raw page HTML re-fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-008-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources under governance/standards/sources.md for product behaviour
sources:
  - https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/  # "Where previously you were offered a pages.dev subdomain for your Pages project, you can now configure a personalized workers.dev subdomain"; "Unlike Pages, Workers does not support any domain whose nameservers are not managed by Cloudflare."
  - https://developers.cloudflare.com/workers/configuration/routing/workers-dev/  # "<YOUR_WORKER_NAME>.<YOUR_SUBDOMAIN>.workers.dev"
  - https://developers.cloudflare.com/workers/configuration/routing/routes/  # "An active Cloudflare zone"; DNS record proxied
  - https://developers.cloudflare.com/workers/configuration/routing/custom-domains/  # "An active Cloudflare zone"
note: No page read says a Worker can or cannot serve a pages.dev hostname (not documented).
---
