---
id: F-gh-checks-runs-01
form: fact
claim: "Listing workflow runs returns up to 1,000 results per search when filtered by actor, branch, check_suite_id, created, event, head_sha or status. In a check suite GitHub limits check runs with the same name to 1000 and automatically deletes older ones beyond that; with more than 1000 check suites on a git reference, the list-check-runs endpoint limits results to the 1000 most recent suites."
grade: B
checked_on: 2026-11-12
shelf_life: 12 months
topics: [github, polling]
sources:
  - https://docs.github.com/en/rest/actions/workflow-runs
  - https://docs.github.com/en/rest/checks/runs
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Written '1000' with no comma on the checks page; confirmed in raw HTML."
---
