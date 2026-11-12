# Research memo (revision 2): Q-026, Event vocabularies: closed sets, open labels, free text, or none (2026-11-12)

*Researcher, depth 2. This revises `research/Q-026-memo.md` to answer `research/Q-026-source-check.md`. I did not see the routing table, the operating model or any project plan. **I read every web page in this round through a summarising fetch, not as raw text.** The quotes below are what that summariser returned, so the Source checker should re-read them raw.*

**Grade key, as the library uses it.** A: the vendor's own docs about its own product. B: one authoritative source, or a solid source plus some inference. C: third-party or secondary sources only. Each statement is marked **[F]** fact, **[E]** estimate or **[O]** opinion.

**Already filed by the Source checker, not proposed again:** `F-enum-evolution-01` and `F-change-events-separate-01`.

## Summary

None of the systems I checked uses a single pure form. Six of the twelve in §A clearly use the same layered form, two arguably do, and four use a single open form (§B gives the count):

- **A small closed set** for the thing tools must count, colour or route on. Examples: GitHub check run `conclusion`, PagerDuty `severity`, Kubernetes Event `type`, Jira's three status categories, CloudTrail `eventCategory`.
- **An open identifier named by the producer** for the specific kind. Examples: Kubernetes `reason`, PagerDuty `class`, GitHub check `name`, CloudTrail `eventName`.
- **Free text** for the human detail. Examples: Kubernetes `message`, PagerDuty `summary`.

Where a closed set must still take in values nobody planned for, schemas add explicit escape values: OCSF's `0 Unknown` and `99 Other`, and a zero value ending `_UNSPECIFIED` in AIP-126 and the protobuf style guide.

Events with no counterpart in the host usually go **in the same envelope, under a separate namespace with a named owner** (CloudEvents type prefixes, OCSF extensions), or **in a separate stream** (PagerDuty change events). In both cases they are **shown together** on one view.

Who owns the vocabulary is explicit wherever it is documented. Open labels that anyone with write access can edit are the least controlled form.

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
   - Sources: …/deployments/deployments; …/deployments/statuses. *(Checker confirmed.)*
3. **[F, A]** *Custom events (GitHub).*
   - `repository_dispatch` `event_type` must be 100 characters or fewer.
   - `client_payload` may have at most 10 top-level properties and must be under 64 KB.
   - Source: docs.github.com/en/rest/repos/repos. *(Checker confirmed.)*
4. *Host-owned sets (GitHub).*
   - **[F, A]** Audit log entries are named `category.action`. *(Checker confirmed.)*
   - **[F, A]** GitHub publishes a list of issue and timeline event types. Each type is marked as available in the REST API for issue events or for timeline events.
   - **[E] (revised)** I found no documented way to add custom timeline event types. **This is an absence on the page, not a rule GitHub states.** The earlier memo said "cannot be extended" as if it were fact, and that is withdrawn.
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
   - "By convention, every Enum type has two common values with integer value 0 for `Unknown` and 99 for `Other`."
   - The `_name` sibling attribute carries the string. On the authentication class, `activity_name` is "The event activity name, as defined by the activity_id".
   - `type_uid` is "calculated by the logging system as: `class_uid * 100 + activity_id`".
   - The authentication class lists `activity_id` values 0 Unknown, 1–6, and 99 Other.
   - Sources: github.com/ocsf/ocsf-docs overview/understanding-ocsf.md; schema.ocsf.io/1.3.0/classes/authentication.
9. **[F, A]** *Cluster events (Kubernetes). Attribution revised.*
   - **Event v1 reference:** `type` is "Normal, Warning; new types could be added in the future". `reason` is "a short, machine understandable string". *(Checker confirmed.)*
   - **api-conventions, under "Typical status properties":** "In condition types, and everywhere else they appear in the API, `Reason` is intended to be a one-word, CamelCase representation of the category of cause of the current status, and `Message` is intended to be a human-readable phrase or sentence…"
     - The earlier memo wrongly put this quote on the Event v1 page.
     - **[E]** The words "everywhere else they appear in the API" suggest the rule also covers Event `reason`. That is my reading, not a stated rule.
   - **api-conventions, "Events" section:** "Choose a unique, specific, short, CamelCase reason for each event category. For example, `FreeDiskSpaceInvalid` is a good event reason… but `Started` is not…"
10. **[F, A]** *Incidents (PagerDuty Events v2).*
    - `severity` is one of `critical, error, warning, info`.
    - `event_action` is `trigger`, `acknowledge` or `resolve`.
    - `class`, `component` and `group` are free strings.
    - *(Checker confirmed.)*
11. **[F, A]** *Incidents (incident.io).* Severities are owned and renamed by the organisation: "starting point, not a rule". Incident types can override a severity's description. *(Checker confirmed.)*
12. **[F, A]** *Boards (Jira).*
    - "All statuses, even custom statuses you create yourself, must belong to one of three status categories – To do, In progress, or Done."
    - The colours are grey, blue and green "(this can't be customized)".
    - "Status categories impact how work items are visualized in lists, reports, and boards."
    - Source: support.atlassian.com/…/what-is-a-workflow-status/. Re-fetched this round.
    - **[F, C]** Community answers and JRACLOUD-44020 are consistent with categories being fixed. *(Checker confirmed.)*
13. **[F, C] (revised)** *Boards (Linear). Sources disagree; Linear's own docs could not be read.*
    - The checker reports that Linear's GraphQL schema lists **seven** types: `triage, backlog, unstarted, started, completed, canceled, duplicate`.
    - Third-party pages I fetched list six or fewer:
      - The DX schema page says "One of 'triage', 'backlog', 'unstarted', 'started', 'completed', 'canceled'".
      - Plain's mirror enum has six values plus its own `UNKNOWN`, described as "Placeholder for unknown or unsupported future states from Linear".
    - Several third-party GitHub pull requests in 2026 add handling for a `duplicate` type, which suggests it was added recently.
    - Sources I could not read:
      - linear.app/docs/configuring-workflows returned 404 again.
      - The Linear SDK schema file was cut off before `WorkflowState`.
    - The triage page says only that triage is "outside the normal workflow".
    - **Taken together:** Linear has a small closed set of state types with names each team chooses, and **that set has grown at least once**, which is itself evidence for §B's "change over time" column. I take the checker's seven-type list as the more current one. I make no claim about the order of the types: the earlier "fixed order" claim is withdrawn as unsourced.
14. **[F, A]** *Event envelopes (CloudEvents).* `type` "SHOULD be prefixed with a reverse-DNS name. The prefixed domain dictates the organization which defines the semantics of this event type." *(Checker confirmed.)*
    - The CloudEvents primer, fetched this round, says `type` "is expected to be the primary means by which consumers identify the type of event". It does **not** discuss reverse-DNS prefixes, so it is no second source for them.
15. **[F, A]** *Telemetry events (OpenTelemetry).*
    - The semantic-conventions events page says an event name "uniquely identifies the event structure", and names "MUST NOT include dynamic values". *(Checker confirmed.)*
    - The OTel logs data model, a separate spec page: `EventName` is the "Name that identifies the class / type of the Event. This name SHOULD uniquely identify the event structure (both attributes and body)."
    - That page does **not** contain the "dynamic values" rule.
16. **[F, A]** *Metrics labels (Prometheus, and now Grafana).*
    - Prometheus naming page: "Every unique combination of key-value label pairs represents a new time series… Do not use labels to store dimensions with high cardinality (many different label values), such as user IDs, email addresses, or other unbounded sets of values." *(Checker confirmed.)*
    - **New second source, Grafana Labs learning hub, "Use bounded labels":**
      - Never use as labels: "User, customer, or session IDs, Request or trace IDs, IP addresses, Email addresses, Timestamps".
      - "Each of these creates a new series per unique value, and the combinations multiply against every other label on the metric."
17. **[F, A]** *Dashboard overlays (Grafana).* Annotations are filtered by tags: a single tag, several tags (all must match), or wildcards. That page covers Graphite annotations only. *(Checker confirmed.)*

## B. Gains and losses by form

The rows are opinion or estimate built on §A, unless marked [F].

| Form | Filtering | Counting | Legend | Change over time |
|---|---|---|---|---|
| Closed set | Exact and complete [O] | Reliable totals; a zero means something [O] | Bounded; can be fixed in advance (Jira fixes the colours) [F 12] | Costly to change: see filed entry `F-enum-evolution-01`. Real sets do grow: Linear's `duplicate` [F 13, C]; Kubernetes "new types could be added" [F 9]; Plain's mirror carries an `UNKNOWN` placeholder for future Linear states [F 13, C] |
| Open labels / ids named by producers | Flexible, but only as good as naming discipline [O] | Totals split across synonyms; unbounded values inflate metric storage [F 16] | Unbounded. One guide says "Seven is a good maximum" for category colours [F, C, single source] | Easy to add; drift goes unnoticed [O] |
| Free text | Search only [O] | Not countable without classifying it later [O] | None [O] | No migration, and no structure [O] |
| Mix (closed category + open kind + free detail) | Coarse filters on the category, exact filters on the kind [O] | Count by category, drill down by kind [O] | Colour by category only, which stays within the colour limit [E] | The category changes rarely; kinds grow freely; escape values absorb surprises [F 8] |
| None | — | — | — | Every reader builds its own classification [O] |

**[E] (revised count)** §A covers **12 systems**, counting GitHub as one.

- **Clearly a closed category beside an open kind (6):** GitHub, CloudTrail, Kubernetes, PagerDuty, Jira, Linear.
- **Arguably (2):**
  - OCSF: closed IDs at every level, with only the `_name` string open, used when `Other` is chosen.
  - incident.io: severities form a closed set within each organisation, but the organisation defines it.
- **No closed category, one open form (4):** CloudEvents, OpenTelemetry events, Prometheus labels, Grafana tags.

This is a convenience sample, not a survey. The earlier figure, "9 of 11", is withdrawn because it matched neither the list nor any stated rule for counting.

## C. Events with no host counterpart (phase gates, decisions, research, stops)

- **Same envelope, separate namespace.**
  - The CloudEvents type prefix names the organisation that defines the type [F 14].
  - "OCSF schemas can be extended by adding new attributes, objects, categories, profiles and event classes." *(Quote order corrected.)*
  - To make an extension public, "add a UID to your extension name in the OCSF Extensions Registry … to avoid collisions with core or other extension schemas". "New categories and event classes will have their unique IDs offset by the UID." [F, A, understanding-ocsf.md]
  - Kubernetes records the controller that emitted an event in `reportingComponent` [F 9].
- **Separate stream, joined at display.** PagerDuty change events go to a separate endpoint and appear beside incidents (filed entry `F-change-events-separate-01`). Grafana annotations are drawn over metric series [F 17].
- **The host's free fields used as the carrier.** On GitHub, custom kinds fit in the free fields: check `name`, deployment `environment` and `task`, `repository_dispatch` `event_type`, and labels [F 1–5].
  - GitHub alone sets the conclusions [F 1] and the audit action names [F 4].
  - **[E]** For timeline event types, no way to add one is documented (§A 4, revised).

Costs [O], unchanged from the first memo:

- **Same scheme:** one filter and one legend, but two owners must keep it in step.
- **Separate scheme:** each side stays clean, but every view must join them.
- **Both** (a shared top-level category plus namespaced kinds): costs one mapping table and buys a common legend.

## D. Who owns the vocabulary, and how drift is held back

- **[F, A]** *The vendor owns the categories and admins own the names:* Jira [12], GitHub conclusions [1]. Linear follows the same pattern [13, grade C].
- **[F, A]** *The namespace owner defines the meaning:* CloudEvents [14]. OCSF extensions reserve their IDs in a registry [C].
- **[F, A]** *A registry plus a checking tool (stability wording revised):*
  - Weaver's `registry check` validates a semantic-convention registry, and `registry live-check` checks an OTLP stream against it. *(Checker confirmed.)*
  - Generated libraries keep experimental names in an `_incubating` path. *(Checker confirmed.)*
  - **[F, B] (revised)** Weaver's semconv syntax document lists the `stability` values as `stable`, `development`, `alpha`, `beta` and `release_candidate`, and says "Stability is not required for attribute groups". Source: github.com/open-telemetry/weaver schemas/semconv-syntax.md, read through a summarising fetch.
  - The earlier "stable or experimental (default experimental)" is **withdrawn**.
- **[F, A]** *Owned and renamed by the organisation:* incident.io severities [11]; GitHub default labels [5].
- **[O]** The only drift control I found documented is mechanical: one machine-readable source plus a check of what is actually emitted against it (Weaver live-check). Written style rules, such as Kubernetes's `reason` guidance, govern the form of names but not which names exist.
- **[E]** I found no study measuring vocabulary drift (no level-3 evidence).

## Field scan

The fields are unchanged from the first memo. New pages this round:

- protobuf style guide
- Grafana Labs learning hub
- OTel logs data model
- CloudEvents primer
- Weaver semconv-syntax
- DX and Plain Linear mirrors
- OCSF authentication class page

Still not covered: records-management and controlled-vocabulary literature, and ITIL change categories.

## Proposed library entries (revised)

```yaml
---
id: P-event-vocab-layered-01
form: pattern
claim: "Of 12 event/label systems sampled (convenience sample, not a survey), 6 clearly layer a small closed set (used for filtering, counting, colour) over an open producer-named kind and free-text detail: GitHub check conclusion + check name; PagerDuty severity + class + summary; Kubernetes Event type + reason + message; Jira's three fixed status categories + custom statuses; CloudTrail eventCategory/eventType + eventName; Linear state type + team-named status (grade C part). 2 arguably do (OCSF, incident.io); 4 use a single open form (CloudEvents type, OpenTelemetry event name, Prometheus labels, Grafana tags)."
grade: B
topics: [change-reporting, dashboards, monitoring, status-reports]
shelf_life: 24 months
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.pagerduty.com/developer/send-alert-event
  - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/
  - https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html
note: The count is the researcher's classification of memo §A (revision 2); the five named examples are each sourced. Linear example rests on grade C sources.
---
```

```yaml
---
id: F-enum-escape-values-01
form: fact
claim: "OCSF: by convention every enum has 0 Unknown and 99 Other; the sibling _name attribute (e.g. activity_name) carries the string; type_uid = class_uid * 100 + activity_id (both on the overview doc and on the schema's authentication class page). Google AIP-126 and the protobuf style guide: the first (zero) enum value should be an unspecified/unknown value; the style guide says suffix _UNSPECIFIED or _UNKNOWN, 'distinct from any of the semantic values you expect to be explicitly set'."
grade: A
topics: [monitoring, change-reporting]
shelf_life: 36 months
sources:
  - https://github.com/ocsf/ocsf-docs/blob/main/overview/understanding-ocsf.md
  - https://schema.ocsf.io/1.3.0/classes/authentication
  - https://google.aip.dev/126
  - https://protobuf.dev/programming-guides/style/
note: Each half now has two pages; each pair is from one publisher (OCSF; Google), as accepted for PagerDuty in F-change-events-separate-01.
---
```

```yaml
---
id: F-event-namespace-owner-01
form: fact
claim: "OpenTelemetry: an event name identifies the event structure (semconv events page: 'uniquely identifies the event structure'; logs data model: EventName 'SHOULD uniquely identify the event structure (both attributes and body)'), and event names 'MUST NOT include dynamic values' (semconv events page only). CloudEvents: type SHOULD be prefixed with a reverse-DNS name; 'The prefixed domain dictates the organization which defines the semantics of this event type' (spec only; the primer does not repeat it)."
grade: A
topics: [monitoring, change-reporting]
shelf_life: 36 months
sources:
  - https://opentelemetry.io/docs/specs/semconv/general/events/
  - https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
note: The 'dynamic values' rule and the CloudEvents reverse-DNS rule each rest on one specification; filing those parts needs the owner's waiver for primary specification text (checker open question 1).
---
```

```yaml
---
id: F-gh-custom-kinds-01
form: fact
claim: "On GitHub, custom kinds fit free fields: check run name, deployment environment and task, repository_dispatch event_type (100 characters or fewer; client_payload at most 10 top-level properties, under 64 KB), labels (anyone with write access can create or edit; organization owners set defaults). Host-defined lists: check status and conclusion (only GitHub can set 'stale'), deployment status state; audit log entries are named category.action."
grade: A
topics: [change-reporting, status-reports]
shelf_life: 12 months
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.github.com/en/rest/deployments/deployments
  - https://docs.github.com/en/rest/deployments/statuses
  - https://docs.github.com/en/rest/repos/repos
  - https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels
note: Revised. The claim that issue/timeline event types cannot be extended is removed (it was an absence on the page, not a stated rule); it stays in the memo as an estimate only.
---
```

```yaml
---
id: F-board-status-categories-01
form: fact
claim: "Jira: 'All statuses, even custom statuses you create yourself, must belong to one of three status categories – To do, In progress, or Done'; shown grey, blue and green '(this can't be customized)'; 'Status categories impact how work items are visualized in lists, reports, and boards.'"
grade: A
topics: [dashboards, status-reports]
shelf_life: 24 months
sources:
  - https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/
  - https://jira.atlassian.com/browse/JRACLOUD-44020
note: Revised to Jira only; the Linear half is withdrawn (official page unreadable; sources disagree on six vs seven types). Second source is Atlassian's own issue tracker, same publisher, and supports only that statuses carry a category.
---
```

```yaml
---
id: F-vocab-registry-check-01
form: fact
claim: "OpenTelemetry Weaver validates a semantic convention registry ('registry check') and checks the conformance of an OTLP stream against it ('registry live-check'); OpenTelemetry code generation places experimental names in an _incubating path."
grade: A
topics: [monitoring]
shelf_life: 18 months
sources:
  - https://github.com/open-telemetry/weaver
  - https://opentelemetry.io/docs/specs/semconv/non-normative/code-generation/
note: Revised. The unconfirmed 'stable or experimental (default experimental)' is removed. The memo cites stability values from weaver schemas/semconv-syntax.md as grade B, unfiled.
---
```

```yaml
---
id: F-high-cardinality-01
form: fact
claim: "Every unique combination of label key-value pairs is a new time series (Prometheus); labels must not hold high-cardinality or unbounded values such as user IDs or email addresses (Prometheus naming page; Grafana Labs: never use user, customer or session IDs, request or trace IDs, IP addresses, email addresses or timestamps as label values, since 'each of these creates a new series per unique value')."
grade: A
topics: [monitoring, dashboards]
shelf_life: 36 months
sources:
  - https://prometheus.io/docs/practices/naming/
  - https://grafana.com/docs/learning-hub/labeling-strategy/03-metrics-labeling/09-use-bounded-labels/
note: Second source replaces the Prometheus instrumentation page; different publisher.
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
note: Unchanged; still a single source. Adobe Spectrum page fetched again and returned no colour-count text; search snippets attributing 'fewer than 6' to Spectrum are unverified. Hold unless the owner accepts single-source grade C.
---
```

---

## Six-part contract

1. **What I changed.** I revised the memo and its entries for every point the checker raised:
   - **Linear:** the six-type list is replaced by the open disagreement, the "fixed order" claim is dropped, and the Linear half is removed from `F-board-status-categories-01`.
   - **Weaver:** the stability claim is withdrawn, replaced with grade-B values from semconv-syntax.md, and removed from `F-vocab-registry-check-01`.
   - **GitHub timeline types:** "cannot be extended" is now an estimate, and it is removed from `F-gh-custom-kinds-01`.
   - **"9 of 11":** replaced by an explicit classification of 12 systems (6 clear, 2 arguable, 4 not).
   - **Kubernetes quote:** moved to api-conventions "Typical status properties", with the "Events" section text added.
   - **OCSF extension quote:** source word order restored, registry wording added.
   - **Second sources:**
     - Grafana Labs for Prometheus cardinality.
     - The OCSF schema page for the enum and type_uid points.
     - The protobuf style guide for `_UNSPECIFIED`.
     - The OTel logs data model for "identifies the event structure".
   - I removed the two entries already filed.
2. **Why.** The source check failed those claims, either as not confirmed or as single-source.
3. **What I checked.** About 20 summarising fetches and searches. I have no shell, so there were no commands.
   - **Confirmed:** the api-conventions Reason/Message text and its section; the OCSF extension, registry and enum text; the OCSF authentication class values and `type_uid`; the Jira page; the protobuf style-guide zero value; the Grafana bounded-labels page; the OTel data-model `EventName`; the Weaver syntax stability values.
   - **Negative results:**
     - The CloudEvents primer has no reverse-DNS text.
     - The OTel data model has no "dynamic values" rule.
     - Adobe Spectrum returned no colour-count text.
     - linear.app/docs/configuring-workflows returned 404.
     - The Linear SDK schema was cut off.
     - Third-party Linear sources disagree with the checker's seven types.
4. **What is undone.**
   - An official Linear source.
   - A second source for the colour limit, the CloudEvents reverse-DNS rule and the OTel "dynamic values" rule.
   - The controlled-vocabulary literature, ITIL, and level-3 outcome evidence.
5. **Needed outside my lane.**
   - The Source checker should re-read the new quotes as raw text, especially the Weaver syntax values and the Grafana page. They should also confirm where the seven-type Linear list comes from in Linear's schema.
   - The owner should rule on single-specification entries (checker open question 1).
6. **Open questions.** Q-a, Q-b and Q-c from the first memo stand. One added question, phrased neutrally:
   - **Q-d:** How have published closed event-type sets (for example Linear state types, Kubernetes Event types) changed over time, and how did consumers handle the added values? Decision: the change rule for any closed set. Depth 2.

Sources:
- [Kubernetes API conventions (raw)](https://raw.githubusercontent.com/kubernetes/community/master/contributors/devel/sig-architecture/api-conventions.md)
- [OCSF understanding (raw)](https://raw.githubusercontent.com/ocsf/ocsf-docs/main/overview/understanding-ocsf.md)
- [OCSF authentication class](https://schema.ocsf.io/1.3.0/classes/authentication)
- [Weaver semconv syntax](https://raw.githubusercontent.com/open-telemetry/weaver/main/schemas/semconv-syntax.md)
- [Protobuf style guide](https://protobuf.dev/programming-guides/style/)
- [Google AIP-126](https://google.aip.dev/126)
- [Grafana: use bounded labels](https://grafana.com/docs/learning-hub/labeling-strategy/03-metrics-labeling/09-use-bounded-labels/)
- [Prometheus naming](https://prometheus.io/docs/practices/naming/)
- [OTel logs data model](https://raw.githubusercontent.com/open-telemetry/opentelemetry-specification/main/specification/logs/data-model.md)
- [OTel semconv events](https://opentelemetry.io/docs/specs/semconv/general/events/)
- [CloudEvents primer](https://raw.githubusercontent.com/cloudevents/spec/main/cloudevents/primer.md)
- [CloudEvents spec](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)
- [Jira workflow status](https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/)
- [JRACLOUD-44020](https://jira.atlassian.com/browse/JRACLOUD-44020)
- [DX linear_states schema](https://docs.getdx.com/schema/linear_states/)
- [Plain LinearIssueStateType](https://www.plain.com/docs/graphql-reference/types/LinearIssueStateType.md)
- [superlinear PR #19 (duplicate state)](https://github.com/armcknight/superlinear/pull/19)
- [Linear configuring workflows (404)](https://linear.app/docs/configuring-workflows)
- [Adobe Spectrum colour for data visualisation](https://spectrum.adobe.com/page/color-for-data-visualization)
- [EU data visualisation guide](https://data.europa.eu/apps/data-visualisation-guide/colour-for-categories)
- GitHub, CloudTrail, PagerDuty, incident.io and Grafana annotation pages: as listed in the first memo, all confirmed by the checker.