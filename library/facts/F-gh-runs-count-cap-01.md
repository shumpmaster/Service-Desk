---
id: F-gh-runs-count-cap-01
form: fact
claim: "From 2026-09-25, GitHub Actions API and UI queries for workflow runs that search by workflow, event, status, branch or actor report '2,500+' instead of an exact count when more than 2,500 records are found (queries over 2,500 records often time out and return an unreliable count). GitHub continues to return paginated results of up to 1,000 items. To retrieve specific runs from a larger set, narrow the filters, for example with a date range. Separately, the workflow-runs REST page says the list endpoint 'will return up to 1,000 results for each search' when using actor, branch, check_suite_id, created, event, head_sha or status."
grade: B
topics: [github, actions, ci]
checked_on: 2026-11-13
shelf_life: 6 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://github.blog/changelog/2026-09-25-changes-to-query-results-in-the-github-actions-api-and-ui
  - https://docs.github.com/en/rest/actions/workflow-runs
note: "The 2,500+ cap is on the changelog page only (single page, not load-bearing alone). The changelog does not list 'created' among the filters it names; the REST page's 1,000-result limit does list it. Whether the 2,500+ cap applies to the 'created' filter is not confirmed."
---
