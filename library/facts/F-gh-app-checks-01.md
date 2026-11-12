---
id: F-gh-app-checks-01
form: fact
claim: "GitHub App user and installation tokens can read check runs (GET commits/{ref}/check-runs, GET check-runs/{id}) with Checks read; repository_dispatch accepts App user and installation tokens with Contents write; POST pending_deployments accepts both with Deployments write."
grade: B
checked_on: 2026-11-12
shelf_life: 6 months
topics: [github, authentication]
sources:
  - https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.github.com/en/rest/repos/repos
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Table plus two endpoint boxes agree."
---
