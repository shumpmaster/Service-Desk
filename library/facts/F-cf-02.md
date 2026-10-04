---
id: F-cf-02
form: fact
claim: "A Pages production deployment (Git production-branch commit, or wrangler pages deploy) updates what <project>.pages.dev and the project's custom domains serve; preview deployments do not. Rollback changes the production deployment instantly."
grade: A
topics: [cloudflare, hosting]
checked_on: 2026-10-04
shelf_life: 6 months
opened_by: source-checker (Q-008, 2026-10-04), raw page HTML re-fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-008-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources under governance/standards/sources.md for product behaviour
sources:
  - https://developers.cloudflare.com/pages/configuration/preview-deployments/  # "any commits to the main branch will update your user-example.pages.dev content, as well as any custom domains attached to the project"
  - https://developers.cloudflare.com/pages/get-started/direct-upload/  # "Your production deployment will be available at <PROJECT_NAME>.pages.dev"
  - https://developers.cloudflare.com/pages/configuration/rollbacks/  # "your project's production deployment will change instantly"
note: Whether a replaced deployment stays reachable at its unique URL is not documented.
---
