---
id: F-gh-check-states-01
form: fact
claim: "GitHub check run statuses are queued, in_progress, completed, waiting, requested, pending (only GitHub Actions can set waiting, pending or requested); conclusions include action_required, cancelled, failure, neutral, success, skipped, stale, timed_out. Only GitHub can set 'stale'; it does so for a check run left incomplete for more than 14 days."
grade: B
topics: [github, status-reports, dashboards]
checked_on: 2026-11-12
shelf_life: 24 months
opened_by: source-checker (Q-025, 2026-11-12), through summarising fetches; both pages opened
memo: research/Q-025-memo.md
supersedes: none
publisher_note: same publisher (GitHub); behaviour claim; two pages. The 14-day figure is on the 2020 changelog page only (the REST page does not state it); it may have changed since 2020.
sources:
  - https://docs.github.com/en/rest/checks/runs  # status and conclusion lists; Actions-only statuses; only GitHub sets stale
  - https://developer.github.com/changes/2020-02-03-stale-conclusion  # 14 days; "Only GitHub can mark check runs as stale"
---
