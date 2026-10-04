---
id: P-cf-01
form: pattern
claim: "To put a new application at an existing pages.dev address there are two documented routes: (1) deploy it into the same Pages project using that project's existing deployment method; (2) host it elsewhere and 301 the pages.dev address to a custom domain with Bulk Redirects. Put an Access policy on every hostname (pages.dev, previews, each custom domain). Opinion drawn from the facts below; whether a Worker can ever hold a pages.dev address is not documented."
grade: C
topics: [cloudflare, hosting, authentication]
checked_on: 2026-10-04
shelf_life: 6 months
opened_by: source-checker (Q-008, 2026-10-04), raw page HTML re-fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-008-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources under governance/standards/sources.md for product behaviour
rests_on: [F-cf-01, F-cf-02, F-cf-03, F-cf-04, F-cf-05, F-cf-07]
sources:
  - https://developers.cloudflare.com/pages/configuration/preview-deployments/
  - https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/
note: Not documented, so not claimed: Access vs Bulk Redirect order on one host; whether worker-level Access applies to Pages. Known-issues page says a custom domain cannot be added where Access is already enabled on it, so order of steps matters.
---
