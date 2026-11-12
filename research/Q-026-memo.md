# Research memo (revision 3): Q-026, Event vocabularies: closed sets, open labels, free text, or none (2026-11-12)

*Researcher, depth 2. This revision answers the round-3 source check in `research/Q-026-source-check.md`. I did not see the routing table, the operating model or any project plan. **I read every page in this round through a summarising fetch, not as raw text.** The quotes below are what that summariser returned, so the Source checker should re-read them raw.*

**Grade key, as the library uses it.** A: the vendor's own docs about its own product. B: one authoritative source, or a solid source plus some inference. C: third-party or secondary sources only. Each statement is marked **[F]** fact, **[E]** estimate or **[O]** opinion.

**Already filed, not proposed again:** `F-enum-evolution-01`, `F-change-events-separate-01`, `F-enum-escape-values-01`, `F-high-cardinality-01` and `F-board-status-categories-01`.

## Summary

None of the systems I checked uses a single pure form. Most of them layer three forms. Of the 12 systems in §A, five clearly do this on grade-A sources, Linear also does on grade-C sources, two arguably do, and four use a single open form (§B gives the count). The three layers are:

- **A small closed set** for the thing tools must count, colour or route on. Examples: GitHub check `conclusion`, PagerDuty `severity`, Kubernetes Event `type`, Jira's three status categories, CloudTrail `eventCategory`.
- **An open identifier named by the producer** for the specific kind. Examples: Kubernetes `reason`, PagerDuty `class`, GitHub check `name`, CloudTrail `eventName`.
- **Free text** for the human detail. Examples: Kubernetes `message`, PagerDuty `summary`.

Where a closed set must still take in values nobody planned for, schemas add escape values: OCSF's `0 Unknown` and `99 Other`, and a zero value ending `_UNSPECIFIED` (filed: `F-enum-escape-values-01`).

Events with no counterpart in the host usually go one of two ways:
- **In the same envelope, under a namespace with a named owner.** Examples: CloudEvents type prefixes, OCSF extensions.
- **In a separate stream.** Example: PagerDuty change events.

Either way, they are **shown together** in one view.

Who owns the vocabulary is explicit wherever it is documented. Open labels that anyone with write access can edit are the least controlled form. The only drift control I found documented is mechanical: a registry, plus a check of what is actually emitted against it.

## A. The forms in use, by system

1. **[F, A]** *CI (GitHub checks).*
   - Check run `status` is one of `queued, in_progress, completed, waiting, requested, pending`.
   - `conclusion` is one of `action_required, cancelled, failure, neutral, success, skipped, stale, timed_out`.
   - "You cannot change a check run conclusion to stale, only GitHub can set this."
   - The check `name` is free text.
   - Source: docs.github.com/en/rest/checks/runs. *(Checker confirmed.)*
2. **[F, A]** *Deploys (GitHub).*
   - Deployment `environment` and `task` are free strings.
   - Deployment status `state` is one of `error, failure, inactive, in_progress, queued, pending, success`.
   - *(Checker confirmed.)*
3. **[F, A]** *Custom events (GitHub).*
   - `repository_dispatch` `event_type` must be 100 characters or fewer.
   - `client_payload` may have at most 10 top-level properties and must be under 64 KB.
   - *(Checker confirmed.)*
4. *Host-owned sets (GitHub).*
   - **[F, A] (sources added)** Audit log entry names have the form `category.operation`.
     - Organisation audit-log page: "The name for each audit log entry is composed of a category of events, followed by an operation type. For example, the `repo.create` entry refers to the `create` operation on the `repo` category."
     - Enterprise audit-log search page: "Each category has a set of associated actions that you can filter on. For example: `action:team.create` finds all events where a team was created."
     - The round-3 check was right that none of the five pages cited earlier said this. These two pages are new.
   - **[F, A]** GitHub publishes a list of issue and timeline event types.
   - **[E]** I found no documented way to add custom timeline event types. This is an absence on the page, not a rule GitHub states.
5. **[F, A]** *Open labels (GitHub).*
   - There are ten default labels.
   - Anyone with write access can create or edit a label.
   - Organisation owners set the defaults for new repositories.
   - *(Checker confirmed.)*
6. **[F, A]** *Annotations (GitHub Actions).* There are three levels: `notice`, `warning` and `error`. *(Checker confirmed.)*
7. **[F, A]** *Audit log (AWS CloudTrail).*
   - `eventCategory` is one of `Management`, `Data` or `NetworkActivity`.
   - `eventType` has five values.
   - `eventName` is an API action, so it is open across services.
   - The event version does not change when new event types are introduced.
   - *(Checker confirmed.)*
8. **[F, A]** *Security events (OCSF).*
   - Every enum has `0 Unknown` and `99 Other`.
   - `_name` siblings carry the string.
   - `type_uid = class_uid * 100 + activity_id`.
   - *(Filed as `F-enum-escape-values-01`.)*
9. **[F, A]** *Cluster events (Kubernetes).*
   - **Event v1 reference:** `type` is "Normal, Warning; new types could be added in the future". `reason` is "a short, machine understandable string". It also has `reportingComponent`.
   - **api-conventions:** `Reason` is "a one-word, CamelCase representation of the category of cause", "everywhere else they appear in the API". "Choose a unique, specific, short, CamelCase reason for each event category."
   - *(All checker confirmed.)*
   - **[E]** I read "everywhere else" as covering Event `reason` too.
10. **[F, A]** *Incidents (PagerDuty Events v2).*
    - `severity` is one of `critical, error, warning, info`.
    - `event_action` is `trigger`, `acknowledge` or `resolve`.
    - `class`, `component` and `group` are free strings.
    - *(Checker confirmed.)*
11. **[F, A]** *Incidents (incident.io).* The organisation owns and renames severities ("starting point, not a rule"). Incident types can override a severity's description. *(Checker confirmed.)*
12. **[F, A]** *Boards (Jira).* Every status belongs to one of three fixed categories, whose colours can't be customised. *(Filed as `F-board-status-categories-01`. It is a UI rule: a database workaround exists, per the checker's note.)*
13. **[F, C]** *Boards (Linear). Still no official source.*
    - Linear's GraphQL schema, as the checker reports it, lists seven types: `triage, backlog, unstarted, started, completed, canceled, duplicate`.
    - Third-party mirrors list six. Pull requests in 2026 add `duplicate`, which suggests it was added recently.
    - This round I tried three official sources:
      - linear.app/docs/issue-status returned 404.
      - linear.app/docs/configuring-workflows returned 404 again.
      - The Linear SDK `schema.graphql` excerpt I could read did not include `WorkflowState`.
    - The triage page says triage is "outside the normal workflow", and that declining an issue or marking it duplicate moves it to "a *Canceled* status type". That last part is my summariser's wording. It does not list the types.
    - Linear stays grade C and is **left out of the counted pattern** (§B).
14. **[F, A]** *Event envelopes (CloudEvents).* `type` "SHOULD be prefixed with a reverse-DNS name. The prefixed domain dictates the organization which defines the semantics of this event type." *(Checker confirmed. Single source; see §E.)*
15. **[F, A]** *Telemetry events (OpenTelemetry).*
    - The semconv events page says an event name "uniquely identifies the event structure", and names "MUST NOT include dynamic values".
    - The logs data model says `EventName` "SHOULD uniquely identify the event structure (both attributes and body)".
    - *(Checker confirmed.)*
    - The "dynamic values" rule is on the events page only. I looked for it in two more places this round:
      - The how-to-write-conventions page has only the span rule: "Span names must have low cardinality…"
      - The Logs API page refers to the data model and adds nothing.
      - **[E]** The span rule is a related principle, not a second source for the event rule.
16. **[F, A]** *Metrics labels.* Unbounded label values create a new series each. *(Filed as `F-high-cardinality-01`.)*
17. **[F, A]** *Dashboard overlays (Grafana).*
    - The Graphite annotation page covers filtering by a single tag, by several tags (all must match), and by wildcards. *(Checker confirmed.)*
    - **New:** the built-in annotations page (the `-- Grafana --` data source) says "If multiple tags are defined in an annotation query, then Grafana only shows annotations matching all the tags." With `Match any` enabled, "Grafana shows annotations that contain any one of the tags you provided."
    - Source: grafana.com/docs/grafana/latest/dashboards/build-dashboards/annotate-visualizations/.

## B. Gains and losses by form

The rows are opinion or estimate built on §A, unless marked [F].

| Form | Filtering | Counting | Legend | Change over time |
|---|---|---|---|---|
| Closed set | Exact and complete [O] | Reliable totals; a zero means something [O] | Bounded; can be fixed in advance (Jira fixes the colours) [F 12] | Costly to change (`F-enum-evolution-01`). Real sets do grow: Kubernetes "new types could be added" [F 9]; Linear's `duplicate` [F 13, C] |
| Open labels / ids named by producers | Flexible, but only as good as naming discipline [O] | Totals split across synonyms; unbounded values inflate metric storage [F 16] | Unbounded. One guide says "Seven is a good maximum" [F, C, single source] | Easy to add; drift goes unnoticed [O] |
| Free text | Search only [O] | Not countable without classifying it later [O] | None [O] | No migration, and no structure [O] |
| Mix (closed category + open kind + free detail) | Coarse filters on the category, exact filters on the kind [O] | Count by category, drill down by kind [O] | Colour by category only [E] | The category changes rarely; kinds grow freely; escape values absorb surprises [F 8] |
| None | — | — | — | Every reader builds its own classification [O] |

**[E] (count revised again)** §A covers 12 systems, counting GitHub as one.

- **Clearly a closed category beside an open kind, on grade-A sources (5):** GitHub, CloudTrail, Kubernetes, PagerDuty, Jira.
- **Same, but on grade-C sources only (1):** Linear. It is not counted in the proposed pattern.
- **Arguably (2):**
  - OCSF: closed IDs at every level; only the `_name` string is open.
  - incident.io: severities are a closed set within each organisation, but the organisation defines it.
- **One open form, no closed category (4):** CloudEvents `type`, OpenTelemetry event name, Prometheus labels, Grafana annotation tags.

This is a convenience sample, not a survey.

## C. Events with no host counterpart (phase gates, decisions, research, stops)

- **Same envelope, separate namespace.**
  - The CloudEvents type prefix names the organisation that defines the type [F 14].
  - OCSF: "OCSF schemas can be extended by adding new attributes, objects, categories, profiles and event classes". Public extensions get a UID in the OCSF Extensions Registry, "to avoid collisions" [F, A]. *(Checker confirmed in round 2.)*
  - Kubernetes `reportingComponent` names the controller that emitted the event [F 9].
  - **[F, C-as-example]** Azure Event Grid's CloudEvents page uses types such as `com.yourcompany.order.created` and `com.example.someeventtype` in its examples. It does **not** state the prefix rule, so I do not count it as a second source.
- **Separate stream, joined at display.** PagerDuty change events (`F-change-events-separate-01`). Grafana annotations drawn over series, filtered by tags [F 17].
- **The host's free fields used as the carrier.** On GitHub, custom kinds can go in check `name`, deployment `environment` and `task`, `repository_dispatch` `event_type`, and labels [F 1–5].
  - Only GitHub sets the conclusions [F 1] and the audit action names [F 4].
  - **[E]** No documented way to add timeline event types.

Costs [O]:

- **Same scheme:** one filter and one legend, but two owners must keep it in step.
- **Separate scheme:** each side stays clean, but every view must join them.
- **Both** (a shared top-level category plus namespaced kinds): costs one mapping table and buys a common legend.

## D. Who owns the vocabulary, and how drift is held back

- **[F, A]** *The vendor owns the categories and admins own the names:* Jira [12], GitHub conclusions [1]. Linear may follow the same pattern [13, grade C].
- **[F, A]** *The namespace owner defines the meaning:* CloudEvents [14]; OCSF extension registry [C].
- **[F, A] (second sources added)** *A registry plus a checking tool.*
  - **Weaver README:** `registry check` "Validates a semantic convention registry". `registry live-check` will "Check the conformance level of an OTLP stream against a semantic convention registry".
  - **OpenTelemetry blog, "Observability by Design: Unlocking Consistency with OpenTelemetry Weaver" (2025):** "Users and maintainers can leverage Weaver to live-check that their application correctly emits telemetry conforming to the official semantic conventions, or a custom registry." Also: "Weaver ensures every change to the registry is consistent, validated, and follows the core policies."
    - The second blog sentence was matched to `registry check` by my summariser, so the checker should confirm that pairing in raw text.
- **[F, A] (narrowed)** *Stable and experimental conventions are shipped apart.*
  - **Code-generation page:** "Ship two different artifacts: one that contains stable Semantic Conventions and another one with all available conventions." Python "puts unstable attributes in `opentelemetry.semconv._incubating` import path which is considered … to be internal and subject to change."
  - **semantic-conventions-java README:**
    - `io.opentelemetry.semconv:opentelemetry-semconv` is "Generated code for stable semantic conventions."
    - `…:opentelemetry-semconv-incubating` is "Generated code for experimental semantic conventions", an `-alpha` artifact that "comes with no compatibility guarantees".
  - The two pages agree on the Java split. The Python path rests on the code-generation page only.
  - The earlier wording, "experimental names in an `_incubating` path", is withdrawn as broader than the source.
- **[F, B]** Weaver's semconv syntax lists `stability` values `stable | development | alpha | beta | release_candidate`. The checker saw a cut-off extract, so this stays unfiled.
- **[F, A]** *Owned and renamed by the organisation:* incident.io severities [11]; GitHub default labels [5].
- **[O]** The only drift control I found documented is mechanical: one machine-readable registry plus a live check of what is emitted. Written style rules, such as Kubernetes `reason`, govern the form of names but not which names exist.
- **[E]** I found no study measuring vocabulary drift (no level-3 evidence).

## E. Items that rest on one specification

These are split out so that each can be filed or held on its own:
- the OpenTelemetry "MUST NOT include dynamic values" rule;
- the CloudEvents reverse-DNS rule;
- the OCSF extension registry wording;
- the EU colour limit (grade C).

I searched for second sources for the first two and found none (§A 14–15, §C). Filing them needs the owner's ruling on single-specification text (checker open question 1).

## Field scan

Pages new in this round:
- GitHub organisation and enterprise audit-log pages
- OpenTelemetry Weaver blog
- semantic-conventions-java README
- Grafana built-in annotations page
- Azure Event Grid CloudEvents page
- OTel how-to-write-conventions and Logs API pages
- Linear triage page; Linear issue-status page (404)

Still not covered: records-management and controlled-vocabulary literature, and ITIL change categories.

## Proposed library entries (revision 3)

```yaml
---
id: P-event-vocab-layered-01
form: pattern
claim: "Of 12 event/label systems sampled (convenience sample, not a survey), 5 clearly layer a small closed set (used for filtering, counting, colour) over an open producer-named kind, usually with free-text detail, on vendor sources: GitHub check conclusion + check name; PagerDuty severity + class + summary; Kubernetes Event type + reason + message; Jira's three fixed status categories + custom statuses; CloudTrail eventCategory/eventType + eventName. 2 arguably do (OCSF: closed IDs with open _name; incident.io: closed per-organisation severities). 4 use a single open form with no closed category (CloudEvents type, OpenTelemetry event name, Prometheus labels, Grafana annotation tags). A sixth layered case, Linear, rests on third-party sources only and is not counted."
grade: B
topics: [change-reporting, dashboards, monitoring, status-reports]
shelf_life: 24 months
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.pagerduty.com/developer/send-alert-event
  - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/
  - https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html
  - https://github.com/ocsf/ocsf-docs/blob/main/overview/understanding-ocsf.md
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
  - https://opentelemetry.io/docs/specs/semconv/general/events/
  - https://prometheus.io/docs/practices/naming/
  - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/annotate-visualizations/
note: Revised. Linear removed from the count. Sources added for OCSF and all four single-open-form systems. The incident.io page is the one cited in the first memo and confirmed by the checker; the Orchestrator's record of that memo has its URL. The classification is the researcher's.
---
```

```yaml
---
id: F-otel-event-name-01
form: fact
claim: "OpenTelemetry: an event name identifies the event structure. The semconv events page says it 'uniquely identifies the event structure'; the logs data model says EventName 'SHOULD uniquely identify the event structure (both attributes and body)'."
grade: A
topics: [monitoring, change-reporting]
shelf_life: 36 months
sources:
  - https://opentelemetry.io/docs/specs/semconv/general/events/
  - https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md
note: Split from F-event-namespace-owner-01. Two pages from one publisher; filing depends on checker open question 1.
---
```

```yaml
---
id: F-otel-event-name-static-01
form: fact
claim: "OpenTelemetry semantic conventions: event names 'MUST NOT include dynamic values'."
grade: B
topics: [monitoring]
shelf_life: 36 months
sources:
  - https://opentelemetry.io/docs/specs/semconv/general/events/
note: Single specification. No second source found (how-to-write-conventions has only the span-name low-cardinality rule; the Logs API page adds nothing). Hold unless the owner accepts single-specification text.
---
```

```yaml
---
id: F-cloudevents-type-owner-01
form: fact
claim: "CloudEvents: type SHOULD be prefixed with a reverse-DNS name; 'The prefixed domain dictates the organization which defines the semantics of this event type.'"
grade: B
topics: [monitoring, change-reporting]
shelf_life: 36 months
sources:
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
note: Single specification. The CloudEvents primer does not repeat the rule. Azure Event Grid's CloudEvents page uses reverse-DNS types in examples only (https://learn.microsoft.com/en-us/azure/event-grid/namespaces-cloud-events) and does not state the rule. Hold unless the owner accepts single-specification text.
---
```

```yaml
---
id: F-gh-custom-kinds-01
form: fact
claim: "On GitHub, custom kinds fit free fields: check run name, deployment environment and task, repository_dispatch event_type (100 characters or fewer; client_payload at most 10 top-level properties, under 64 KB), labels (anyone with write access can create or edit; organization owners set defaults). Host-defined lists: check status and conclusion (only GitHub can set 'stale'), deployment status state. Audit log entry names are a category followed by an operation (e.g. repo.create, team.create)."
grade: A
topics: [change-reporting, status-reports]
shelf_life: 12 months
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.github.com/en/rest/deployments/deployments
  - https://docs.github.com/en/rest/deployments/statuses
  - https://docs.github.com/en/rest/repos/repos
  - https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels
  - https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization  # "composed of a category of events, followed by an operation type"
  - https://docs.github.com/en/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/searching-the-audit-log-for-your-enterprise  # "action:team.create"
note: Revised. The audit-log sentence now cites the two pages that carry it. The timeline-types claim is removed (an estimate in the memo only).
---
```

```yaml
---
id: F-vocab-registry-check-01
form: fact
claim: "OpenTelemetry Weaver validates a semantic convention registry ('registry check') and checks that emitted telemetry (an OTLP stream) conforms to the official or a custom registry ('registry live-check')."
grade: A
topics: [monitoring]
shelf_life: 18 months
sources:
  - https://github.com/open-telemetry/weaver  # README: "Validates a semantic convention registry"; "Check the conformance level of an OTLP stream against a semantic convention registry"
  - https://opentelemetry.io/blog/2025/otel-weaver/  # "live-check that their application correctly emits telemetry conforming to the official semantic conventions, or a custom registry"
note: Revised. Each half now has two pages from one project; filing depends on checker open question 1. The _incubating half has moved to F-semconv-stable-split-01.
---
```

```yaml
---
id: F-semconv-stable-split-01
form: fact
claim: "OpenTelemetry semantic-convention libraries ship stable and experimental conventions apart. Java has two artifacts: opentelemetry-semconv ('Generated code for stable semantic conventions') and opentelemetry-semconv-incubating ('Generated code for experimental semantic conventions', an -alpha artifact with 'no compatibility guarantees'). The code-generation guidance recommends 'two different artifacts: one that contains stable Semantic Conventions and another one with all available conventions'. Python puts unstable attributes in the opentelemetry.semconv._incubating import path."
grade: A
topics: [monitoring, change-reporting]
shelf_life: 18 months
sources:
  - https://opentelemetry.io/docs/specs/semconv/non-normative/code-generation/
  - https://github.com/open-telemetry/semantic-conventions-java/blob/main/README.md
note: New, narrowed from the old _incubating claim. The Java split rests on both pages; the Python path on the code-generation page only.
---
```

```yaml
---
id: F-legend-colour-limit-01
form: fact
claim: "EU data visualisation guide: for categories shown in different colours, 'Seven is a good maximum'."
grade: C
topics: [dashboards, design]
shelf_life: 36 months
sources:
  - https://data.europa.eu/apps/data-visualisation-guide/colour-for-categories
note: Unchanged and still single-source. Hold unless the owner accepts single-source grade C.
---
```

`F-event-namespace-owner-01` is **withdrawn**. It is replaced by `F-otel-event-name-01`, `F-otel-event-name-static-01` and `F-cloudevents-type-owner-01`.

---

## Six-part contract

1. **What I changed.**
   - **`F-gh-custom-kinds-01`:** the audit-log claim now cites the two GitHub audit-log pages that say it.
   - **`F-vocab-registry-check-01`:**
     - Narrowed to Weaver only, with a second source (the OpenTelemetry blog).
     - The `_incubating` half moved to a new `F-semconv-stable-split-01`, narrowed to what the pages say (the Java artifact pair, plus the Python path from one page), with the semantic-conventions-java README added.
   - **`F-event-namespace-owner-01`:** split into three entries, so that the two-page part can be filed apart from the two single-specification parts.
   - **`P-event-vocab-layered-01`:**
     - Linear is removed from the count, which is now 5 clear, 2 arguable and 4 open, plus Linear noted at grade C.
     - Sources are added for OCSF and for all four open-form systems, including the Grafana built-in annotations page.
   - **Memo:** the three filed entries are summarised by reference, and §E gathers the single-specification items.
2. **Why.** These are the round-3 failures:
   - the audit-log text was not on the cited pages;
   - the `_incubating` claim went beyond its source, and each half had only one source;
   - two parts of the namespace entry had single sources;
   - the pattern counted Linear and left the open-form systems unsourced.
3. **What I checked.** I have no shell, so I ran no commands. I made about 18 summarising fetches and searches.
   - **Confirmed:**
     - the GitHub organisation audit-log "category … followed by an operation type" text, and the enterprise search page's `action:team.create`;
     - the Weaver README and blog wording;
     - the code-generation "two different artifacts" and Python `_incubating` text;
     - the Java README artifact descriptions;
     - Grafana's built-in tag filtering ("matching all the tags", "Match any").
   - **Negative results:**
     - The Linear issue-status and configuring-workflows pages returned 404.
     - The Linear SDK schema excerpt had no `WorkflowState`.
     - The Linear triage page lists no types.
     - The OpenTelemetry how-to and Logs API pages have no event "dynamic values" rule.
     - Azure Event Grid shows reverse-DNS types only in examples.
4. **What is undone.**
   - An official Linear source.
   - A second source for the OpenTelemetry "dynamic values" rule, the CloudEvents reverse-DNS rule and the colour limit.
   - A full raw read of Weaver's `stability` text.
   - The controlled-vocabulary literature, ITIL, and level-3 outcome evidence.
5. **Needed outside my lane.**
   - **Source checker:** re-read the new quotes as raw text, especially the blog's `registry check` pairing and the two audit-log pages. Supply the incident.io URL for the pattern entry from the earlier record if it is needed.
   - **Owner:** rule on checker open question 1 (two pages from one publisher for specification text). This decides `F-otel-event-name-01`, `F-vocab-registry-check-01` and `F-semconv-stable-split-01`, and also whether single-specification and single-source grade-C entries can be filed (§E).
6. **Open questions.** Q-a, Q-b, Q-c and Q-d from earlier rounds stand. Checker question 4, whether there is an official Linear source, is still open: the public docs pages I tried return 404. Reading Linear's live GraphQL schema directly may need an authenticated tool, which is outside my lane.

Sources:
- [GitHub: reviewing the audit log for your organization](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization)
- [GitHub: searching the audit log for your enterprise](https://docs.github.com/en/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/searching-the-audit-log-for-your-enterprise)
- [Weaver README (raw)](https://raw.githubusercontent.com/open-telemetry/weaver/main/README.md)
- [OpenTelemetry blog: Observability by Design with Weaver](https://opentelemetry.io/blog/2025/otel-weaver/)
- [OTel semconv code generation](https://opentelemetry.io/docs/specs/semconv/non-normative/code-generation/)
- [semantic-conventions-java README (raw)](https://raw.githubusercontent.com/open-telemetry/semantic-conventions-java/main/README.md)
- [OTel how to write conventions](https://opentelemetry.io/docs/specs/semconv/how-to-write-conventions/)
- [OTel Logs API](https://opentelemetry.io/docs/specs/otel/logs/api/)
- [OTel semconv events](https://opentelemetry.io/docs/specs/semconv/general/events/)
- [OTel logs data model](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md)
- [CloudEvents spec](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)
- [Azure Event Grid: CloudEvents schema](https://learn.microsoft.com/en-us/azure/event-grid/namespaces-cloud-events)
- [Grafana: annotate visualizations](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/annotate-visualizations/)
- [Linear triage](https://linear.app/docs/triage)
- [Linear issue status (404)](https://linear.app/docs/issue-status)
- [Linear configuring workflows (404)](https://linear.app/docs/configuring-workflows)
- [Linear SDK schema (raw)](https://raw.githubusercontent.com/linear/linear/master/packages/sdk/src/schema.graphql)
- [Prometheus naming](https://prometheus.io/docs/practices/naming/)
- [OCSF understanding](https://github.com/ocsf/ocsf-docs/blob/main/overview/understanding-ocsf.md)
- [EU data visualisation guide](https://data.europa.eu/apps/data-visualisation-guide/colour-for-categories)
- Other GitHub, CloudTrail, PagerDuty, Kubernetes, Jira and incident.io pages: as in earlier rounds, all confirmed by the checker.