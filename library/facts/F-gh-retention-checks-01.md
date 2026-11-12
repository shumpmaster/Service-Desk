---
id: F-gh-retention-checks-01
form: fact
claim: "From 2026-10-01, GitHub deletes checks, workflow runs and statuses (including those made by third-party apps) once they pass the Actions artifact/log retention period; default 90 days; public-repository maximum 90 days; private repositories 1 to 400 days; changing the setting does not restore data already removed."
grade: A
topics: [github, monitoring, dashboards]
checked_on: 2026-11-12
shelf_life: 12 months
opened_by: source-checker (Q-025, 2026-11-12), through summarising fetches; all three pages opened
memo: research/Q-025-memo.md
supersedes: none
publisher_note: same publisher (GitHub); behaviour claim; three pages
sources:
  - https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses  # governed by same setting; third-party; public max 90 days; "won't restore data that was previously removed"
  - https://github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses  # from Oct 1; default 90 days; was 400+ days; public max 90
  - https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization  # default 90; public 1-90; private 1-400; "does not retroactively apply"
---
