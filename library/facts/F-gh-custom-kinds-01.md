---
id: F-gh-custom-kinds-01
form: fact
claim: "On GitHub, custom kinds fit free fields: check run name, deployment environment and task, repository_dispatch event_type (100 characters or fewer; client_payload at most 10 top-level properties, under 64 KB), labels (anyone with write access can create or edit; organization owners set defaults). Host-defined lists: check status and conclusion (only GitHub can set 'stale'), deployment status state. Audit log entry names are a category followed by an operation (e.g. repo.create, team.create)."
grade: A
topics: [change-reporting, status-reports]
checked_on: 2026-11-12
shelf_life: 12 months
opened_by: source-checker (Q-026 round 4, 2026-11-12). Audit-log pages fetched and read as raw text this round; the other five pages were confirmed raw in the earlier round (research/Q-026-source-check.md). Researcher read through a summarising fetch.
memo: research/Q-026-memo.md
publisher_note: all pages are GitHub documentation about GitHub's own behaviour; two pages per claim count as two sources under governance/standards/sources.md (same publisher)
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.github.com/en/rest/deployments/deployments
  - https://docs.github.com/en/rest/deployments/statuses
  - https://docs.github.com/en/rest/repos/repos
  - https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels
  - https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization  # "composed of a category of events, followed by an operation type. For example, the repo.create entry"
  - https://docs.github.com/en/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/searching-the-audit-log-for-your-enterprise  # "Each category has a set of associated actions"; "action:team.create"
note: Timeline-event-type claim is not included (an estimate in the memo only).
---
