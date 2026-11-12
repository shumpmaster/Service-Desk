---
id: P-event-vocab-layered-01
form: pattern
claim: "Of 12 event/label systems sampled (convenience sample, not a survey), 6 layer a small closed set (for filtering, counting, colour) over an open producer- or admin-named kind, usually with free-text detail: GitHub check conclusion + check name; PagerDuty severity + class + summary; Kubernetes Event type (Normal, Warning) + reason + message; Jira's three fixed status categories + custom statuses; Linear's fixed-order status categories + team-created statuses; CloudTrail eventCategory/eventType + eventName. 2 arguably do (OCSF: closed IDs with open _name; incident.io: severities defined by the organisation). 4 use a single open form (CloudEvents type, OpenTelemetry event name, Prometheus labels, Grafana annotation tags). The grouping is the researcher's judgement."
grade: B
topics: [change-reporting, dashboards, monitoring, status-reports]
checked_on: 2026-11-12
shelf_life: 24 months
opened_by: source-checker (Q-026 round 5, 2026-11-12), raw page text fetched and read directly; researcher read the same pages through a summarising fetch. Each system rests on one vendor page, as a pattern across systems, not as a stand-alone fact; the Linear and incident.io wording was read raw this round, the other pages were fetched this round and spot-checked for the field names (conclusion, class, Reason, type Normal/Warning, status categories, eventCategory, eventType, _name suffix).
memo: research/Q-026-memo.md
supersedes: none
publisher_note: the count and the closed-versus-open grouping are the researcher's classification; not independently verifiable as a count. Individual Linear and incident.io facts are not filed (single page each).
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.pagerduty.com/developer/send-alert-event
  - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/
  - https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/
  - https://linear.app/docs/issue-property
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html
  - https://raw.githubusercontent.com/ocsf/ocsf-docs/main/overview/understanding-ocsf.md
  - https://docs.incident.io/incidents/severities
  - https://raw.githubusercontent.com/cloudevents/spec/main/cloudevents/spec.md
  - https://opentelemetry.io/docs/specs/semconv/general/events/index.md
  - https://prometheus.io/docs/practices/naming/
  - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/annotate-visualizations/
---
