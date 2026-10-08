---
id: F-gh-12
form: fact
claim: "GitHub Actions 'schedule' workflows run at most once every 5 minutes and run on the latest commit on the default branch (the workflow file must exist there)."
grade: A
topics: [github, automation]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08), through a summarising fetch
memo: research/Q-011-memo.md
publisher_note: same publisher (GitHub docs); two pages
sources:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows  # "shortest interval ... once every 5 minutes"; default branch
  - https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax  # same two statements under on.schedule
note: NOT filed (events page only): delay at high load / dropped queued jobs; public-repo disable after 60 days without activity.
---
