---
id: L-F4
form: fact
claim: "An OAuth app user token identifies as the user who signed in; an authorized OAuth app has access to all the user's or organization owner's accessible resources, and the repo scope covers public and private repositories. OAuth app tokens are long-lived by default; expiring tokens (8 h access, refresh 6 months without use, scopes cannot change on refresh) are opt-in via offline_access or app settings, and the 2026-08-14 changelog says short-lived tokens are enabled by default for all new applications."
grade: B
checked_on: 2026-10-01
shelf_life: 3 months
topics: [github, authentication, attribution, security]
sources:
  - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps  # identity; all accessible resources; long-lived by default
  - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps  # repo scope
  - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps  # long-lived default; opt-in; 8h/6 months without use; no scope change
  - https://github.blog/changelog/2026-08-14-multiple-redirect-uris-and-token-refresh-for-oauth-apps/  # new apps default
opened_by: source-checker (Q-002, 2026-10-01)
note: Identity and reach rest on one page. The memo's "no per-repository restriction documented" clause is an absence claim and is not filed.
---
