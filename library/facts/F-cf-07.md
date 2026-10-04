---
id: F-cf-07
form: fact
claim: "A <project>.pages.dev address can be redirected to a custom domain with Bulk Redirects (301, list plus rule); only a custom-domain target is documented. *.pages.dev subdomains cannot be changed; the documented route is to delete the project and create a new one (Known issues page only, grade B). Reuse of a deleted name: not documented."
grade: A
topics: [cloudflare, hosting]
checked_on: 2026-10-04
shelf_life: 6 months
opened_by: source-checker (Q-008, 2026-10-04), raw page HTML re-fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-008-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources under governance/standards/sources.md for product behaviour
sources:
  - https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/  # table <project>.pages.dev -> https://example.com, 301
  - https://developers.cloudflare.com/pages/configuration/custom-domains/  # "account-level Bulk Redirect feature to redirect your *.pages.dev URL to a custom domain"
  - https://developers.cloudflare.com/pages/platform/known-issues/  # "*.pages.dev subdomains currently cannot be changed."
---
