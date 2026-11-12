I have enough sources and am writing the memo now.

# Research memo — Q-026 — Event vocabularies: closed sets, open labels, free text, or none — 2026-11-12

*Researcher, depth 2. The question asked for a memo, not a groundwork map. I did not see the routing table, the operating model or any project plan, and I read none of them. Every web page below was read through a summarising fetch, not raw. The Source checker should re-read the quotes.*

**Grade key, as the library uses it.** A: the vendor's own docs about its own product. B: a single authoritative source, or a solid source with some inference. C: third-party or secondary sources only. Each statement is marked **[F]** fact, **[E]** estimate or **[O]** opinion.

## Summary

None of the systems I checked uses a single pure form. The pattern that keeps recurring is layered:

- **A small closed set** for the dimension that tools must count, colour or route on. Examples: GitHub check run `conclusion`, PagerDuty `severity`, Kubernetes Event `type`, Jira's three status categories, OCSF `activity_id`.
- **An open, producer-named identifier** for the specific kind. Examples: Kubernetes `reason`, CloudEvents `type`, PagerDuty `class`, GitHub check `name`, `repository_dispatch` `event_type`.
- **Free text** for the human detail. Examples: Kubernetes `message`/`note`, PagerDuty `summary`.

Where a closed set must still take in unforeseen values, schemas add explicit escape values: OCSF's `0 Unknown` / `99 Other`, and AIP-126's `_UNSPECIFIED`.

Events with no counterpart in the host are most often kept **in the same envelope but in a separate, owner-marked namespace or stream**. Examples: CloudEvents reverse-DNS prefixes, OCSF extensions with reserved IDs, PagerDuty change events. They are then **shown together on one timeline**.

Ownership is explicit in every case where it is documented: the vendor, an org admin, a namespace owner, or a registry with a checking tool. Open labels anyone can edit, such as GitHub labels, are the least controlled form.

## A. The forms in use, by system

1. **[F, A]** *CI (GitHub checks).* Check run `status` is one of `queued, in_progress, completed, waiting, requested, pending`. `conclusion` is one of `action_required, cancelled, failure, neutral, success, skipped, stale, timed_out`. "You cannot change a check run conclusion to stale, only GitHub can set this." The check `name` is free ("For example, 'code-coverage'"). Source: docs.github.com/en/rest/checks/runs.
2. **[F, A]** *Deploys (GitHub).* The deployment `environment` is a free string ("e.g., production, staging, qa"; default `production`), and so is `task` (default `deploy`). The deployment status `state` is closed: `error, failure, inactive, in_progress, queued, pending, success`. Sources: docs.github.com/en/rest/deployments/deployments; …/deployments/statuses.
3. **[F, A]** *Custom events (GitHub).* `repository_dispatch` `event_type` is "A custom webhook event name. Must be 100 characters or fewer." `client_payload` allows at most 10 top-level properties and must be under 64 KB. Source: docs.github.com/en/rest/repos/repos.
4. **[F, A]** *Host-owned closed sets (GitHub).* Issue and timeline event types (`labeled`, `merged`, `deployed`, …) are listed by GitHub. The fetched page showed no way to add custom types. That second point comes from the summariser's reading, not a quoted statement, so it needs a check. Audit log entries are named `category.action` ("a category of events, followed by an operation type"), e.g. `repo.create`. Sources: docs.github.com/en/rest/using-the-rest-api/issue-event-types; GitHub org audit-log events page.
5. **[F, A]** *Open labels (GitHub).* There are ten default labels. "Anyone with write access to a repository can create a label" and edit one. "Organization owners can customize the default labels" for new repositories. Source: docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels.
6. **[F, A]** *Annotations (GitHub Actions).* Annotation levels are a closed set of three (`notice`, `warning`, `error`) with a free message and title. Source: GitHub workflow-commands reference.
7. **[F, A]** *Audit log (AWS CloudTrail).* Records are layered:
   - `eventCategory` is closed (`Management`, `Data`, `NetworkActivity`) and is "used in LookupEvents calls to filter".
   - `eventType` is closed (five values).
   - `eventSource` names the service.
   - `eventName` is "one of the actions in the API for that service", so it is open across services and grows as APIs grow.
   - "If CloudTrail introduces new event types, but the structure of the event is otherwise unchanged, the event version does not change."
   Source: docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html.
8. **[F, A]** *Security events (OCSF).* Event classes are grouped into categories. `type_uid = class_uid * 100 + activity_id`. "By convention, every Enum type has two common values with integer value 0 for Unknown and 99 for Other." When `Other` is used, the sibling `_name` string carries the source's own value (e.g. `activity_name`). Sources: github.com/ocsf/ocsf-docs overview/understanding-ocsf.md; schema.ocsf.io authentication class.
9. **[F, A]** *Cluster events (Kubernetes).*
   - `type` is "Normal, Warning; new types could be added in the future".
   - `reason` is "a short, machine understandable string", described as "a one-word, CamelCase representation of the category of cause".
   - `message` is "a human-readable phrase or sentence".
   - The API conventions state that "adding new enum values breaks backward compatibility", and give that as a reason to prefer conditions over a `phase` enum.
   Sources: kubernetes.io Event v1 reference; kubernetes/community api-conventions.md.
10. **[F, A]** *Incidents (PagerDuty Events v2).* `severity` is `critical, error, warning or info`. `event_action` is `trigger` / `acknowledge` / `resolve`. `class` ("e.g. ping failure"), `component` and `group` are free strings, and `custom_details` is free. Source: docs.pagerduty.com/developer/send-alert-event.
11. **[F, A]** *Incidents (incident.io).* Severities are organisation-owned and ranked: "These are a starting point, not a rule. Rename them… or add your own". Incident types can override a severity's description per type while keeping the name, which the vendor says keeps terminology consistent (blog). Sources: docs.incident.io/incidents/severities; incident.io/blog/incident-types.
12. **[F, A]** *Boards (Jira).* "All statuses, even custom statuses you create yourself, must belong to one of three status categories – To do, In progress, or Done". Their colours are grey, blue and green ("this can't be customized"). "Status categories impact how work items are visualized in lists, reports, and boards." Source: support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/. **[F, C]** Only community answers say that new categories cannot be created (community.atlassian.com; jira.atlassian.com JRACLOUD-44020).
13. **[F, C]** *Boards (Linear).* Workflow-state `type` is reported as one of `triage, backlog, unstarted, started, completed, canceled`. Teams name statuses freely within a category, and the categories keep a fixed order. The official docs pages returned 404 when fetched, so this rests on search snippets of linear.app and third-party SDK docs. Linear's Triage page (fetched) says "triage is considered to be outside the normal workflow". The Source checker should re-fetch it.
14. **[F, A]** *Event envelopes (CloudEvents).* `type` is a required non-empty string that "SHOULD be prefixed with a reverse-DNS name. The prefixed domain dictates the organization which defines the semantics of this event type." Source: github.com/cloudevents/spec cloudevents/spec.md.
15. **[F, A]** *Telemetry events (OpenTelemetry).*
    - An event name "uniquely identifies the event structure".
    - Names "MUST NOT include dynamic values".
    - Custom events should keep low-cardinality, domain-specific names.
    Source: opentelemetry.io/docs/specs/semconv/general/events/.
16. **[F, A]** *Metrics labels (Prometheus).* "Every unique combination of key-value label pairs represents a new time series… Do not use labels to store dimensions with high cardinality… or other unbounded sets of values." Source: prometheus.io/docs/practices/naming/.
17. **[F, B]** *Dashboard overlays (Grafana).* Annotations put events such as deploys over graphs and are filtered by free tags: one tag, several tags (AND), or wildcards. Source: grafana.com Graphite annotations docs (search result; the page itself was not fetched).

## B. Gains and losses by form

These rows are opinion or estimate, built on the facts above.

| Form | Filtering | Counting | Legend | Change over time |
|---|---|---|---|---|
| Closed set | Exact and complete [O] | Reliable totals; zero is meaningful [O] | Bounded, can be fixed in advance (Jira fixes colours) [F 12] | Adding a value breaks strict readers [F 9]; AIP-126 says to add values "no more than once a year" as a rule of thumb and to "document whether the enum is frozen" [F, A, google.aip.dev/126]; protobuf *closed* enums turn unknown values into "unset" while *open* enums keep them [F, A, protobuf.dev/programming-guides/enum] |
| Open labels / producer-named ids | Flexible, but only as good as naming discipline [O] | Totals split across synonyms; unbounded sets inflate storage in metric systems [F 16] | Unbounded; a guide suggests about seven colours at most ("Seven is a good maximum") [F, B, data.europa.eu data-visualisation guide; single source] | Easy to add; drift goes unnoticed [O] |
| Free text | Search only [O] | Not countable without later classifying [O] | None [O] | No migration needed, and no structure [O] |
| Mix (closed category + open kind + free detail) | Coarse filters on the category, exact filters on the kind [O] | Count by category, drill down by kind [O] | Colour by category only, which stays inside the colour limit [E] | The category changes rarely; kinds grow freely; escape values (Other/Unknown) absorb surprises [F 8] |
| None | — | — | — | Every reader builds its own classification [O] |

**[E]** The mix is the dominant form among the systems sampled: 9 of the 11 in §A use a closed category beside an open kind. This is a convenience sample, not a survey.

## C. Events with no host counterpart (phase gates, decisions, research, stops)

Patterns seen:

- **Same envelope, separate namespace.** CloudEvents marks the defining organisation by type prefix [F 14]. OCSF extensions can add "attributes, objects, profiles, event classes, and categories" without changing the core schema, and must reserve a unique ID and name in the OCSF Extensions Registry to avoid collisions [F, B, search summaries of OCSF docs; the extension text itself was not fetched]. Kubernetes records the emitting controller in `reportingComponent` [F 9].
- **Separate stream, joined at display.** PagerDuty change events go to a different endpoint. "Change events do not create alerts, incidents or notifications". They appear on a Recent Changes page, on service pages and on incident detail, and are not shown after 90 days [F, A, docs.pagerduty.com/ai-automation/aiops/recent-changes]. Grafana annotations sit outside the metric series and are overlaid on them [F 17].
- **Host's free fields used as the carrier.** On GitHub itself, custom kinds can only live in the free fields: check `name`, deployment `environment`/`task`, `repository_dispatch` `event_type`, labels [F 1–5]. The closed sets (timeline event types, audit actions, conclusions) are host-owned and cannot be extended [F 1, 4].

Costs [O]:

- **Same scheme.** One filter and one legend, but a merged scheme must be kept in step with two owners: the host and the process.
- **Separate scheme.** Each side stays clean, but every view must join them and map their states onto a common category.
- **Both** (a shared top-level category plus namespaced kinds). This is what CloudEvents and OCSF do: it costs one mapping table and buys a common legend.

## D. Who owns the vocabulary, and how drift is held back

- **[F, A]** *Vendor-owned categories, admin-owned names:* Jira [12], Linear [13, grade C] and GitHub check conclusions [1].
- **[F, A]** *Namespace owner defines the semantics:* CloudEvents [14].
- **[F, A]** *Registry plus tooling:* OpenTelemetry keeps conventions in YAML. Weaver "Validates a semantic convention registry" (`registry check`) and checks "the conformance level of an OTLP stream against a semantic convention registry" (`live-check`). Groups carry stability levels (stable / experimental), and generated libraries keep experimental names in an incubating path. Sources: github.com/open-telemetry/weaver; opentelemetry.io/docs/specs/semconv/non-normative/code-generation/.
- **[F, A]** *Organisation-owned and renamable:* incident.io severities [11]; GitHub org default labels [5].
- **[O]** The documented drift control is mechanical: one machine-readable source and a check that compares what is actually emitted against it (Weaver live-check). Written conventions alone (the Kubernetes `reason` style rules) set form, not membership.
- **[E]** I found no study measuring vocabulary drift in event or label schemes. That gap remains: the answer above rests on vendor practice (level 2), not on evidence of outcomes.

## Field scan (adjacent fields checked)

- Security logging: OCSF, CloudTrail.
- Observability: OpenTelemetry, Prometheus, Grafana.
- Event interchange: CloudEvents.
- API design: AIP-126, protobuf, Kubernetes conventions.
- Work tracking: Jira, Linear, GitHub.
- Incident response: PagerDuty, incident.io.
- Data visualisation: data.europa.eu.

Not covered: records-management or library-science taxonomy literature (controlled vocabularies, thesauri), which may hold evidence on drift. ITIL change categories (standard, normal, emergency) were not checked.

## Proposed library entries

```yaml
---
id: P-event-vocab-layered-01
form: pattern
claim: "Event schemes in CI, audit, incident and board tools commonly layer a small closed set (for filtering, counting, colour) over an open producer-named kind and free-text detail: GitHub check conclusion + check name; PagerDuty severity + class + summary; Kubernetes Event type + reason + message; Jira's three fixed status categories + custom statuses; CloudTrail eventCategory/eventType + eventName. Convenience sample of 11 systems; inference, not a survey."
grade: B
topics: [change-reporting, dashboards, monitoring, status-reports]
shelf_life: 24 months
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.pagerduty.com/developer/send-alert-event
  - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/
  - https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html
---
```

```yaml
---
id: F-enum-evolution-01
form: fact
claim: "Closed sets are costly to change: Kubernetes API conventions state 'adding new enum values breaks backward compatibility'; Google AIP-126 says enums should get new values infrequently ('no more than once a year' as a rule of thumb), should document whether frozen, and frequently-changing values should be strings with documented allowed values; protobuf closed enums store unknown values as unset, open enums keep them."
grade: A
topics: [change-reporting, monitoring]
shelf_life: 36 months
sources:
  - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md
  - https://google.aip.dev/126
  - https://protobuf.dev/programming-guides/enum/
---
```

```yaml
---
id: F-enum-escape-values-01
form: fact
claim: "OCSF: every enum has 0 Unknown and 99 Other by convention; when Other is used, a sibling _name string carries the source's own value; type_uid = class_uid*100 + activity_id. AIP-126: the first enum value should be <NAME>_UNSPECIFIED (or UNKNOWN where clearly useful)."
grade: A
topics: [monitoring, change-reporting]
shelf_life: 36 months
sources:
  - https://github.com/ocsf/ocsf-docs/blob/main/overview/understanding-ocsf.md
  - https://google.aip.dev/126
---
```

```yaml
---
id: F-event-namespace-owner-01
form: fact
claim: "CloudEvents: type is a required non-empty string that SHOULD be prefixed with a reverse-DNS name; 'The prefixed domain dictates the organization which defines the semantics of this event type.' OpenTelemetry: an event name uniquely identifies the event structure and MUST NOT include dynamic values."
grade: A
topics: [monitoring, change-reporting]
shelf_life: 36 months
sources:
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
  - https://opentelemetry.io/docs/specs/semconv/general/events/
---
```

```yaml
---
id: F-change-events-separate-01
form: fact
claim: "PagerDuty change events use a separate endpoint (/v2/change/enqueue), 'do not create alerts, incidents or notifications', are shown on Recent Changes, service pages and incident detail (at most two in mobile views), and are not shown after 90 days."
grade: A
topics: [monitoring, change-reporting]
shelf_life: 12 months
sources:
  - https://docs.pagerduty.com/ai-automation/aiops/recent-changes
note: Endpoint path from search summary of PagerDuty docs; re-check.
---
```

```yaml
---
id: F-gh-custom-kinds-01
form: fact
claim: "On GitHub, custom kinds fit only free fields: check run name, deployment environment and task, repository_dispatch event_type (max 100 chars; client_payload max 10 top-level properties, under 64 KB), labels (anyone with write access can create or edit; org owners set defaults). Closed and host-set: check status/conclusion (stale set only by GitHub), deployment status state, issue/timeline event types, audit log category.action names."
grade: A
topics: [change-reporting, status-reports]
shelf_life: 12 months
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.github.com/en/rest/deployments/deployments
  - https://docs.github.com/en/rest/deployments/statuses
  - https://docs.github.com/en/rest/repos/repos
  - https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels
  - https://docs.github.com/en/rest/using-the-rest-api/issue-event-types
note: "Timeline types cannot be extended" is an absence in the fetched page, not a stated rule.
---
```

```yaml
---
id: F-board-status-categories-01
form: fact
claim: "Jira: all statuses, including custom ones, must belong to one of three status categories (To do, In progress, Done), shown grey, blue, green, not customisable; categories drive lists, reports and boards. Linear (grade C part): state types triage, backlog, unstarted, started, completed, canceled, fixed order, custom names within each."
grade: B
topics: [dashboards, status-reports]
shelf_life: 24 months
sources:
  - https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/
  - https://linear.app/docs/triage
note: Grade B overall because the Linear part rests on search snippets; official Linear workflow page returned 404 on fetch.
---
```

```yaml
---
id: F-vocab-registry-check-01
form: fact
claim: "OpenTelemetry Weaver validates a semantic convention registry ('registry check') and checks the conformance of an emitted OTLP stream against it ('live-check'); semantic convention groups are stable or experimental (default experimental), and language libraries may ship experimental names in an incubating path."
grade: A
topics: [monitoring]
shelf_life: 18 months
sources:
  - https://github.com/open-telemetry/weaver
  - https://opentelemetry.io/docs/specs/semconv/non-normative/code-generation/
---
```

```yaml
---
id: F-high-cardinality-01
form: fact
claim: "Prometheus: every unique combination of label key-value pairs is a new time series; do not use labels for high-cardinality or unbounded values such as user IDs or email addresses."
grade: A
topics: [monitoring, dashboards]
shelf_life: 36 months
sources:
  - https://prometheus.io/docs/practices/naming/
---
```

```yaml
---
id: F-legend-colour-limit-01
form: fact
claim: "EU data visualisation guide: for categories shown in different colours, 'Seven is a good maximum'; avoid sequential palettes for categorical data."
grade: C
topics: [dashboards, design]
shelf_life: 36 months
sources:
  - https://data.europa.eu/apps/data-visualisation-guide/colour-for-categories
note: Single guidance source; other limits (6, 8–12) were seen only in search snippets (Adobe Spectrum page fetch did not return the text).
---
```

---

## Six-part contract

1. **What I changed.** Nothing on disk; I have no write tool. This reply is the memo for the Orchestrator to record as `research/Q-026-memo.md`.
2. **Why.** Q-026 asks a depth-2 question that is not a groundwork map, so it gets a graded memo. The library had nothing on event vocabularies. Its entries on the same topics (F-change-approval-01, F-status-optimism-01, F-automation-complacency-01, P-stale-visible-01, P-glance-disclosure-01) are not about classification schemes.
3. **What I checked.**
   - I read `research/Q-026.md`, `research/_GROUNDWORK.md` and the library entries sharing its topics.
   - About 25 fetches of vendor docs and specs. Fetches that failed:
     - Linear workflow docs: 404 twice.
     - Adobe Spectrum: the page returned had no colour text.
     - The first Atlassian page: wrong content, so I fetched a different page.
     - PagerDuty: redirected, then fetched at the new address.
   - All reading was through a summarising fetch, not raw. I checked nothing myself.
4. **What is undone.**
   - Records-management and taxonomy literature on vocabulary drift.
   - ITIL change categories.
   - The full OCSF extension text.
   - The official Linear workflow page.
   - No level-3 (outcome) evidence on which form works best.
5. **Needed outside my lane.**
   - The Source checker should re-fetch the Linear docs, the OCSF extension text and PagerDuty's change endpoint path. It should also check that "timeline types cannot be extended" is only an absence on the page, not a stated rule.
   - Applying §C to the process's own events (phase gates, decisions, research, stops) needs the routing table and operating model, which I may not see. That belongs to whoever writes the spec.
6. **Open questions** (proposed additions, phrased neutrally):
   - Q-a: What does the records-management or controlled-vocabulary literature report about how classification schemes drift and how drift is detected? Decision: the drift rule. Depth 2.
   - Q-b: How do timeline views that merge events from several sources map each source's states onto one shared category set and legend, and what is lost? Decision: placing events that have no GitHub counterpart. Depth 2.
   - Q-c: Is there any outcome evidence (level 3) comparing closed and open classification schemes for later filtering or counting accuracy? Depth 3.

Sources:
- [GitHub check runs](https://docs.github.com/en/rest/checks/runs)
- [GitHub deployments](https://docs.github.com/en/rest/deployments/deployments)
- [GitHub deployment statuses](https://docs.github.com/en/rest/deployments/statuses)
- [GitHub repos / repository dispatch](https://docs.github.com/en/rest/repos/repos)
- [GitHub labels](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels)
- [GitHub issue event types](https://docs.github.com/en/rest/using-the-rest-api/issue-event-types)
- [GitHub org audit log events](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization)
- [GitHub workflow commands](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands)
- [CloudTrail record contents](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html)
- [OCSF understanding](https://github.com/ocsf/ocsf-docs/blob/main/overview/understanding-ocsf.md)
- [OCSF authentication class](https://schema.ocsf.io/1.3.0/classes/authentication)
- [Kubernetes Event v1](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/)
- [Kubernetes API conventions](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md)
- [PagerDuty send alert event](https://docs.pagerduty.com/developer/send-alert-event)
- [PagerDuty recent changes](https://docs.pagerduty.com/ai-automation/aiops/recent-changes)
- [incident.io severities](https://docs.incident.io/incidents/severities)
- [incident.io incident types](https://incident.io/blog/incident-types)
- [Jira workflow status](https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/)
- [Atlassian community on status categories](https://community.atlassian.com/forums/Jira-questions/How-can-I-create-a-status-category/qaq-p/764219)
- [JRACLOUD-44020](https://jira.atlassian.com/browse/JRACLOUD-44020)
- [Linear triage](https://linear.app/docs/triage)
- [Linear configuring workflows](https://linear.app/docs/configuring-workflows)
- [CloudEvents spec](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)
- [OpenTelemetry events](https://opentelemetry.io/docs/specs/semconv/general/events/)
- [OpenTelemetry code generation](https://opentelemetry.io/docs/specs/semconv/non-normative/code-generation/)
- [OpenTelemetry Weaver](https://github.com/open-telemetry/weaver)
- [Prometheus naming](https://prometheus.io/docs/practices/naming/)
- [Grafana Graphite annotations](https://grafana.com/docs/grafana/latest/datasources/graphite/annotations/)
- [Google AIP-126](https://google.aip.dev/126)
- [Protobuf enums](https://protobuf.dev/programming-guides/enum/)
- [EU data visualisation guide: colour for categories](https://data.europa.eu/apps/data-visualisation-guide/colour-for-categories)