---
id: F-cf-04
form: fact
claim: "Pages 'Enable access policy' protects only preview deployments, not *.pages.dev or a custom domain. To protect *.pages.dev: edit the Access app it created, delete the wildcard in the Subdomain field, save, then re-select Enable access policy (giving two Access apps). A custom domain needs its own Access policy, else login 'will render but not work' (that sentence: Known issues page only, grade B)."
grade: A
topics: [cloudflare, authentication]
checked_on: 2026-10-04
shelf_life: 6 months
opened_by: source-checker (Q-008, 2026-10-04), raw page HTML re-fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-008-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources under governance/standards/sources.md for product behaviour
sources:
  - https://developers.cloudflare.com/pages/configuration/preview-deployments/  # "will only protect your preview deployments ... and not your *.pages.dev domain or custom domain"
  - https://developers.cloudflare.com/pages/platform/known-issues/  # steps; "an Access authentication will render but not work for your custom domain visitors"
note: Same Known issues page also says a custom domain cannot be added to a Pages project where an Access policy is already enabled on that domain (single page; not in memo, found by checker).
---
