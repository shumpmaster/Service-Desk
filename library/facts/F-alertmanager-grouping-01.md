---
id: F-alertmanager-grouping-01
form: fact
claim: "Prometheus Alertmanager: group_by batches matching alerts into one group; group_wait (default 30s) waits before the first notification of a new group; group_interval (default 5m) spaces later notifications; repeat_interval (default 4h), and 'Notifications are not repeated if any new alerts have fired or any firing alerts have resolved since the last group_interval'; inhibition rules mute targets while a source alert fires; mute/active time intervals."
grade: B
topics: [notifications, monitoring]
checked_on: 2026-11-12
shelf_life: 12 months
opened_by: source-checker (Q-024, 2026-11-12); Alertmanager configuration page read raw (defaults 30s, 5m, 4h seen)
memo: research/Q-024-memo.md
sources:
  - https://prometheus.io/docs/alerting/latest/configuration/
note: Product behaviour, single page.
---
