---
id: F-cf-access-svc-01
form: fact
claim: "Automated callers can pass a Cloudflare Access policy with a service token sent as headers 'CF-Access-Client-Id' and 'CF-Access-Client-Secret'; the Access policy action must be 'Service Auth' (otherwise Access prompts for IdP login). Only Service Auth policies can authorize such a request."
grade: A
topics: [cloudflare, authentication, access]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08); both pages read as raw markdown
memo: research/Q-011-memo.md
publisher_note: same publisher (Cloudflare); behaviour claim
sources:
  - https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/
  - https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/cors/  # Service Auth policy; Worker sets the two headers
---
