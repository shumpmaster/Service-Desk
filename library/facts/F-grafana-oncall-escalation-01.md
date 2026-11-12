---
id: F-grafana-oncall-escalation-01
form: fact
claim: "Grafana OnCall: each escalation step notifies with either 'Default notifications' ('Standard alert notifications as configured in the user's profile') or 'Important notifications' ('High-priority notifications that use more aggressive channels or frequencies'); each user customises their own notification rules. A repeat step will 'Loop the previous escalation steps up to five times'; each repeat step keeps its own counter."
grade: B
topics: [notifications, monitoring]
checked_on: 2026-11-12
shelf_life: 12 months
opened_by: source-checker (Q-024, 2026-11-12); page HTML read raw
memo: research/Q-024-memo.md
sources:
  - https://grafana.com/docs/grafana-cloud/alerting-and-irm/oncall/configure/escalation-chains-and-routes/
note: Product behaviour, single vendor page.
---
