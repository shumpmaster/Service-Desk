---
id: F-gh-13
form: fact
claim: "The REST endpoint 'Create a repository dispatch event' (POST /repos/{owner}/{repo}/dispatches) triggers a GitHub Actions workflow with the repository_dispatch event from outside GitHub; client_payload may have at most 10 top-level properties. The payload size limit is NOT settled: the events page says 65,535 characters, the REST page says the JSON must be 'less than 64KB'. Token scope for this endpoint was not confirmed (the 'repo' scope text read on the REST page belongs to the create-repository endpoint)."
grade: A
topics: [github, automation]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08); both pages read via docs.github.com article body
memo: research/Q-011-memo.md
publisher_note: same publisher (GitHub); behaviour claim; size figures conflict so none is claimed
sources:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
  - https://docs.github.com/en/rest/repos/repos
note: Not filed - classic PAT needs repo scope (memo T10): not confirmed for this endpoint.
---
