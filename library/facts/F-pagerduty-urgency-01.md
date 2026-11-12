---
id: F-pagerduty-urgency-01
form: fact
claim: "PagerDuty: high urgency 'escalates if not acknowledged'; low urgency 'cannot escalate'; notification rules can differ during and outside support hours. Escalation timeout default 30 minutes; a policy may repeat up to nine times, only while unacknowledged."
grade: B
topics: [notifications, monitoring]
checked_on: 2026-11-12
shelf_life: 12 months
opened_by: source-checker (Q-024, 2026-11-12); both PagerDuty pages read raw (the timeout and repeat rows were confirmed on the escalation-policies page, not from a search summary)
memo: research/Q-024-memo.md
sources:
  - https://docs.pagerduty.com/incident-management/incidents/dynamic-notifications
  - https://support.pagerduty.com/docs/escalation-policies
note: One publisher (PagerDuty), two pages; each row confirmed on its own page. Product behaviour; defaults may change.
---
