---
id: F-change-events-separate-01
form: fact
claim: "PagerDuty change events use a separate endpoint (https://events.pagerduty.com/v2/change/enqueue, alert events use /v2/enqueue), 'do not create alerts, incidents or notifications', are shown in Recent Changes, on service pages and on incident detail (mobile app: a maximum of two on incident detail), and are not shown in the Recent Changes table after 90 days."
grade: A
topics: [monitoring, change-reporting]
checked_on: 2026-11-12
shelf_life: 12 months
opened_by: source-checker (Q-026, 2026-11-12), raw page text fetched and read directly; researcher read the recent-changes page through a summarising fetch
memo: research/Q-026-memo.md
publisher_note: same publisher (PagerDuty); two pages count as two sources under governance/standards/sources.md for product behaviour
sources:
  - https://docs.pagerduty.com/ai-automation/aiops/recent-changes  # "Change events do not create alerts, incidents or notifications"; "will not display change events that happened more than 90 days in the past"; endpoint list
  - https://docs.pagerduty.com/developer/send-change-event  # "/v2/change/enqueue endpoint used to post non-incident change events" (second page added by the checker)
note: The 90-day limit is stated for the Recent Changes table.
---
