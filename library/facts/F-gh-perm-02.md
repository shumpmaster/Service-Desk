---
id: F-gh-perm-02
form: fact
claim: "Fine-grained PAT permission table: list workflow runs = Actions read; list pull requests = Pull requests read; read contents = Contents read; list deployments = Deployments read; repository events = Metadata read; review pending deployments (POST) = Deployments write; merge pull request = Contents write; create review = Pull requests write; create/update file = Contents write plus Workflows write; repository_dispatch = Contents write. The review-pending-deployments endpoint page says 'Required reviewers with read access to the repository contents and deployments can use this endpoint' (a role) and its own fine-grained box lists Deployments write (the token permission); the two do not conflict."
grade: B
checked_on: 2026-11-12
shelf_life: 6 months
topics: [github, authentication]
sources:
  - https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens
  - https://docs.github.com/en/rest/actions/workflow-runs
  - https://docs.github.com/en/rest/repos/repos
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Same publisher, two pages; table and endpoint boxes agree."
---
