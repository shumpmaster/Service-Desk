---
id: L-F9
form: fact
claim: "Fine-grained permission tables (PATs and GitHub Apps) list: create/update file contents (PUT contents/{path}) under Contents: write and Workflows: write, with the 'additional permissions' mark; low-level git commit under Contents: write only; create issue comment (issue or PR conversation) under Issues: write and Pull requests: write, with the mark; create PR review under Pull requests: write only. The mark means either several permissions are required or any one of a set suffices; the tables do not say which."
grade: B
checked_on: 2026-10-01
shelf_life: 6 months
topics: [github, authentication, security]
sources:
  - https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens
  - https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps  # same publisher, near-identical generated table; not independent
opened_by: source-checker (Q-002, 2026-10-01)
note: Both pages opened; entries and the 'Additional permissions' sentence match. Fetch was a summarising tool, not verbatim. Which permission case applies per endpoint is unconfirmed.
---
