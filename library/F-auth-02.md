id: F-auth-02 (narrowed)
checked-on: 2026-10-01
opened-by: source-checker (Q-001 check; sources fetched directly)
form: fact
grade: A
topics: authentication, cloudflare
shelf-life: 12 months
claim: Access policies can include specific email addresses (Emails selector). A policy with only Include > Login Methods > One-time PIN lets anyone in (listed as a common misconfiguration). NOT filed: that the app must check Cf-Access-Jwt-Assertion to confirm Access routing; the page only recommends the header over the CF_Authorization cookie.
sources: https://developers.cloudflare.com/cloudflare-one/access-controls/policies/
