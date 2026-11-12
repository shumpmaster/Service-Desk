---
id: F-linear-status-categories-01
form: fact
claim: "Linear: issue statuses form workflows, 'a group of ordered issue statuses defined per-team', with a default workflow teams can customise in Team Settings. A team's statuses fall into named workflow state categories, Backlog among them. Triage issues are excluded from views by default because triage is 'outside the normal workflow'."
grade: A
topics: [status-reports, dashboards, change-reporting]
checked_on: 2026-11-12
shelf_life: 12 months
opened_by: source-checker (Q-026 round 7, 2026-11-12), all four pages fetched and read as raw page text; researcher read them through a summarising fetch
memo: research/Q-026-memo.md
publisher_note: vendor product behaviour; four different pages of the vendor's own site (docs x3, developer docs x1), labelled same publisher. Reorder/fixed-order/minimum-status rules and the Duplicate status are NOT part of this entry.
sources:
  - https://linear.app/docs/conceptual-model  # "a group of ordered issue statuses defined per-team." / "a default workflow for you that you can further customize in Team Settings."
  - https://linear.app/docs/issue-property  # "workflows are team-specific and come with a default set and order: Backlog > Todo > ..."; categories Backlog, Unstarted, Started, Completed, Canceled
  - https://linear.app/developers/graphql  # "the team's first state in the Backlog workflow state category"; "assigned to the Triage workflow state"
  - https://linear.app/docs/triage  # "we exclude triage issues from all views since triage is considered to be outside the normal workflow"
---
