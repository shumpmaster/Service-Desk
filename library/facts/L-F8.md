---
id: L-F8
form: fact
claim: "Events made with GITHUB_TOKEN do not create new workflow runs, except workflow_dispatch and repository_dispatch; pull_request events (opened, synchronize, reopened) from it create approval-required runs. Using a GitHub App installation token or a PAT instead lets runs start (the docs state this for triggering events and for pull requests without approval)."
grade: B
checked_on: 2026-10-01
shelf_life: 6 months
topics: [github, authentication]
sources:
  - https://docs.github.com/en/actions/concepts/security/github_token
  - https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow
opened_by: source-checker (Q-002, 2026-10-01)
note: GITHUB_TOKEN part on two pages (A); installation token/PAT part B.
---
