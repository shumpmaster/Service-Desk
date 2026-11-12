---
id: P-feed-deadman-01
form: pattern
claim: "To notice that a monitoring path has itself stopped, emit an always-on heartbeat that a separate outside service expects within a period plus grace, and alert from that service when it is missing (kube-prometheus Watchdog, expr vector(1); PromLabs; Healthchecks period and grace time). Mature tools give no-data, error, late and down their own states instead of reusing the last value (Grafana No Data/Error; Prometheus stale series; Healthchecks new/up/late/down/paused, where the API names the late state 'grace'). Case evidence of silent stops being trusted: the 2003 Northeast blackout, where FirstEnergy's alarm function failed without the operators knowing; Three Mile Island, where the relief-valve indicator light showed only that the close signal had been sent, not the valve's position. Documented practice and cases, not a controlled study; untested with AI-agent oversight."
grade: B
topics: [monitoring, dashboards, status-reports]
checked_on: 2026-11-12
shelf_life: 36 months
opened_by: source-checker (Q-025, 2026-11-12); kube-prometheus manifest, PromLabs, Healthchecks configuring_checks, Grafana, Prometheus read as full page text; others through summarising fetches
memo: research/Q-025-memo.md
supersedes: none
publisher_note: Watchdog: two independent sources. Healthchecks: three pages, same publisher. Grafana and Prometheus parts each rest on one vendor page; the pattern's generalisation is supported across three unrelated tools. Blackout: The Register and Computerworld, both press accounts of the investigation reports; the failure time is not claimed (Computerworld gives 2:40 p.m. for the interim report). TMI: NRC, a transcription of the Kemeny report (pddoc.com, unofficial) and Control Global.
sources:
  - https://raw.githubusercontent.com/prometheus-operator/kube-prometheus/main/manifests/kubePrometheus-prometheusRule.yaml
  - https://training.promlabs.com/training/monitoring-and-debugging-prometheus/metrics-based-meta-monitoring/end-to-end-watchdog-alerts/
  - https://healthchecks.io/docs/
  - https://healthchecks.io/docs/api/
  - https://healthchecks.io/docs/configuring_checks/
  - https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/
  - https://prometheus.io/docs/prometheus/latest/querying/basics/
  - https://www.theregister.com/2004/04/08/blackout_bug_report/
  - https://www.computerworld.com/article/1323183/software-failure-cited-in-august-blackout-investigation.html
  - https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle.html
  - https://pddoc.com/tmi2/kemeny/assessment_of_sinificant_events.htm
  - https://www.controlglobal.com/articles/2009/3MileIslandAccident0905
---
