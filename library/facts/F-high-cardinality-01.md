---
id: F-high-cardinality-01
form: fact
claim: "Every unique combination of label key-value pairs is a new time series (Prometheus); labels must not hold high-cardinality or unbounded values such as user IDs or email addresses (Prometheus naming page). Grafana Labs: never use user, customer or session IDs, request or trace IDs, IP addresses, email addresses or timestamps as metric label values, since 'each of these creates a new series per unique value'."
grade: A
topics: [monitoring, dashboards]
checked_on: 2026-11-12
shelf_life: 36 months
opened_by: source-checker (Q-026 round 3, 2026-11-12), raw page text fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-026-memo.md
sources:
  - https://prometheus.io/docs/practices/naming/  # "Do not use labels to store dimensions with high cardinality (many different label values), such as user IDs, email addresses, or other unbounded sets of values"
  - https://grafana.com/docs/learning-hub/labeling-strategy/03-metrics-labeling/09-use-bounded-labels/  # "Never use these as metric label values: ... Each of these creates a new series per unique value"
note: Two different publishers.
---
