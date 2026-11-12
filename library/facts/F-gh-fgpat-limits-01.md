---
id: F-gh-fgpat-limits-01
form: fact
claim: "Fine-grained personal access tokens cannot call the Checks API: the token-management page lists 'Using fine-grained personal access token to call the Checks API' among unsupported uses, and the endpoints-available list has no check-runs or check-suites endpoints (it does list commit status and statuses). The check-run endpoint boxes list only GitHub App user and installation tokens. The notifications endpoints are not on the list either. A fine-grained PAT has the same capabilities that the owner of the token has, further limited by its permissions."
grade: A
checked_on: 2026-11-12
shelf_life: 6 months
topics: [github, authentication, attribution]
sources:
  - https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
  - https://docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens
  - https://docs.github.com/en/rest/checks/runs
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Product behaviour, same publisher, three pages."
---
