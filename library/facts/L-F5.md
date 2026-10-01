---
id: L-F5
form: fact
claim: "A fine-grained PAT is limited to one user or organization, can be limited to specific repositories, and has fine-grained permissions; expires_in is 1-366 or none, and infinite lifetimes may be blocked by an org/enterprise maximum-lifetime policy. The one-year unused removal is documented under classic PATs; the token-expiration page says only 'personal access token' without type, so it is not documented whether it applies to fine-grained PATs."
grade: B
checked_on: 2026-10-01
shelf_life: 6 months
topics: [github, authentication, security]
sources:
  - https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
  - https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/token-expiration-and-revocation
opened_by: source-checker (Q-002, 2026-10-01)
note: Last clause is a documentation gap, not a fact about GitHub's behavior.
---
