---
id: F-gh-12b
form: fact
claim: "GitHub Actions 'schedule' runs can be delayed during periods of high load (high load includes the start of every hour), and if load is high enough some queued jobs may be dropped. In public repositories scheduled workflows are automatically disabled when no repository activity has occurred in 60 days."
grade: A
topics: [github, automation]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08), through a summarising fetch
memo: research/Q-011-memo.md
supersedes: none (adds to F-gh-12, which is unchanged)
publisher_note: same publisher (GitHub docs); two pages per part
sources:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows  # delay, start of every hour, dropped jobs, 60 days
  - https://docs.github.com/en/actions/how-tos/troubleshoot-workflows  # "Scheduled events can be delayed..."; "some queued jobs may be dropped"
  - https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows  # "In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days."
---
