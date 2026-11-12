I've written revision 4 of the memo below. It deals with the five items the round-3 source check held. Two gaps are now closed: incident.io and Linear have official sources. The colour-limit item now has a peer-reviewed second source. Two items still rest on one page each. I read every page through a summarising fetch, so the checker needs to re-read the quotes as raw text.

---

# Research memo (revision 4): Q-026, Event vocabularies: closed sets, open labels, free text, or none (2026-11-12)

*Researcher, depth 2. This revision answers `research/Q-026-source-check.md` (round 4 of checking). Research is blind: I did not see the routing table, the operating model or any project plan. **Every page this round was read through a summarising fetch, not raw.** The quotes below are what that summariser returned, so the Source checker should re-read them raw.*

**Grade key:** A means the vendor's own docs about its own product. B means one authoritative source, or a solid source plus some inference. C means secondary sources only. Each statement is marked **[F]** fact, **[E]** estimate or **[O]** opinion.

**Unchanged from revision 3:** sections A to E and the summary stand, except where noted below. These are already filed and not proposed again: `F-enum-evolution-01`, `F-change-events-separate-01`, `F-enum-escape-values-01`, `F-high-cardinality-01`, `F-board-status-categories-01`, `F-gh-custom-kinds-01`, `F-vocab-registry-check-01` and `F-semconv-stable-split-01`.

## What changed in the findings

### 1. incident.io: URL supplied (checker question 2)
**[F, A]** Source: https://docs.incident.io/incidents/severities (fetched as `.md`).
- On the default severities: "These are a starting point, not a rule. Rename them, rewrite their descriptions, or add your own to match how your team thinks about impact."
- On who can change them: "Managing severities requires the **Manage organization settings** permission."
- On incident types: "Within an incident type you can override a severity's description, hide severities that don't apply, and restrict who's allowed to set a particular severity."

This gives a new ownership point for §D: **who may change the vocabulary is controlled by a named permission**.

### 2. Linear: official source found (checker question 4)
The page that answers it is **https://linear.app/docs/issue-property**. The configuring-workflows and issue-status pages still return 404.
- **[F, A]** "Issue statuses define the type and order of states that issues can move through from start to completion. These workflows are team-specific and come with a default set and order: *Backlog > Todo > In Progress > Done > Canceled*."
- **[F, A]** "Teams can reorder statuses within each status category, but the categories themselves stay in a fixed order."
- **[F, A]** On editing statuses: "…make changes to the name, color, or description. Create statuses by clicking the **+** button, or remove statuses (as long as at least one status exists in each category)."
- **[F, A]** "Triage is an additional status category that acts as an Inbox for your team." The triage page agrees: "By default, we exclude triage issues from all views since triage is considered to be outside the normal workflow."
- **[F, A]** A "How we work at Linear" note on the same page shows each category holding several statuses. For example, *Canceled* holds Canceled, Could not reproduce and Won't Fix. *Duplicate* holds Duplicate, applied automatically.
- **[F, A] Linear's own pages disagree:**
  - The issue-property page says: "Issues marked as duplicates are automatically moved into a reserved *Duplicate* status… a system-managed status that cannot be renamed or customized."
  - The triage page says a duplicate "is updated to a *Canceled* status type".
- **[E]** Linear seems to have added a seventh category recently, and not every page has been updated. This is a live case of a closed set growing (the "change over time" column in §B). Revision 3 inferred the same from third-party pull requests; this is now on vendor pages.

Linear is now **counted** in the pattern on a grade-A source. The pattern no longer relies on the grade-C sources.

**[E] Revised count (§B):**
- 6 systems clearly combine a closed category with an open kind on grade-A sources: GitHub, CloudTrail, Kubernetes, PagerDuty, Jira and Linear.
- 2 arguably do: OCSF and incident.io.
- 4 use a single open form.

It is still a convenience sample, not a survey.

### 3. CloudEvents reverse-DNS rule: second source for half of it (checker question 3)
- **[F, A]** The Firebase Admin Node SDK reference (Google, a different publisher from the CloudEvents project) describes `CloudEvent.type` as: "Type of the event. Should be prefixed with a reverse-DNS name (`com.my-org.v1.something.happended`)." Source: https://firebase.google.com/docs/reference/admin/node/firebase-admin.eventarc.cloudevent
- **[F, B]** The half that says who owns the meaning is still on one page only: "The prefixed domain dictates the organization which defines the semantics of this event type." No other page I found repeats it.
- I therefore split the entry: the prefix rule (two publishers) and the ownership rule (one specification).

### 4. Colour limit: replaced by a better-sourced claim (checker question 3)
- **[F, C]** The EU data visualisation guide says "Seven is a good maximum". This is unchanged.
- **[F, A for the paper's own findings]** Wang, Quadri, Zhu, Tseng and Szafir, "Characterizing Visualization Perception with Psychological Phenomena: Uncovering the Role of Subitizing in Data Visualization". It is in *IEEE TVCG* 32(1), 2026, and on arXiv as 2508.17460.
  - The abstract says: "We conducted three experiments with multi-class scatterplots — between 2 and 15 classes… Our results indicate if the category number is smaller than six, people tend to perform well at all tasks… When category numbers increased, performance fell, with the magnitude of the performance change depending on task and encoding."
  - **This is level-3 evidence**: a controlled study, not a guideline.
- **[E]** It tested scatterplots, not legends or timelines. Applying it to a timeline legend is my inference.
- Other guides I saw gave figures of 6 to 10. I could not read the text of the Atlassian or Adobe Spectrum pages (the fetch returned only navigation), so they are not cited.

### 5. OpenTelemetry "dynamic values" rule: still single-source, plus a new caveat
- **[F, A]** The events page (fetched as `index.md`) still has "Event names MUST NOT include dynamic values. Use attributes for identifiers, names, or other values that vary per occurrence."
  - It adds that when an existing system lacks a single name field, "semantic conventions can use a combination of fields to create a low-cardinality event name."
- **[F, A] New:** the page is marked **Status: Development**.
  - This affects `F-otel-event-name-01` too: the semconv-page half of that claim is not stable text. I shortened that entry's shelf life to 18 months.
- No second source turned up:
  - The semconv naming page covers event names only under general naming rules, with nothing about cardinality.
  - The `events-general` URL returns 404.

### 6. Weaver `stability` values (checker question 5)
- **[F, B]** A second, separate fetch of the raw `schemas/semconv-syntax.md` returned: `stability ::= "stable" | "development" | "alpha" | "beta" | "release_candidate"`.
- This is one page. I propose it below for the checker to read raw. It does not affect the answer to the question.

### Corrections to revision 3
- In §A 13, Linear moves from [F, C] to [F, A] on the vendor page, with the disagreement between Linear's pages noted.
- In §B, the "change over time" cell for closed sets now cites Linear at grade A.
- In §D, add: **[F, A]** incident.io limits changes to severities by a named permission.

## Field scan (new this round)
- incident.io severities docs
- Linear issue-property and triage pages
- Firebase Admin Eventarc CloudEvent reference
- Google Eventarc CloudEvents pages (in search results only, not read)
- the TVCG 2026 subitizing paper
- the EU guide, re-found
- OpenTelemetry semconv naming and events `index.md`
- Weaver `semconv-syntax.md`

**Still not covered:** controlled-vocabulary and records-management literature, and ITIL change categories.

## Proposed library entries (revision 4)

```yaml
---
id: P-event-vocab-layered-01
form: pattern
claim: "Of 12 event/label systems sampled (convenience sample, not a survey), 6 clearly layer a small closed set (used for filtering, counting, colour) over an open producer- or admin-named kind, usually with free-text detail, on vendor sources: GitHub check conclusion + check name; PagerDuty severity + class + summary; Kubernetes Event type + reason + message; Jira's three fixed status categories + custom statuses; Linear's fixed-order status categories + team-created statuses; CloudTrail eventCategory/eventType + eventName. 2 arguably do (OCSF: closed IDs with open _name; incident.io: severities closed within an organisation but defined by it). 4 use a single open form with no closed category (CloudEvents type, OpenTelemetry event name, Prometheus labels, Grafana annotation tags)."
grade: B
topics: [change-reporting, dashboards, monitoring, status-reports]
shelf_life: 24 months
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://docs.pagerduty.com/developer/send-alert-event
  - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/
  - https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/
  - https://linear.app/docs/issue-property  # "Teams can reorder statuses within each status category, but the categories themselves stay in a fixed order."
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html
  - https://github.com/ocsf/ocsf-docs/blob/main/overview/understanding-ocsf.md
  - https://docs.incident.io/incidents/severities  # "These are a starting point, not a rule. Rename them, rewrite their descriptions, or add your own…"
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
  - https://opentelemetry.io/docs/specs/semconv/general/events/
  - https://prometheus.io/docs/practices/naming/
  - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/annotate-visualizations/
note: Revision 4. incident.io URL supplied; Linear now sourced from its own docs and counted (6 clear, was 5). The classification into 'closed beside open' versus 'single open form' is the researcher's judgement.
---
```

```yaml
---
id: F-linear-status-categories-01
form: fact
claim: "Linear: issue statuses are team-specific and each belongs to a status category; teams can reorder statuses within a category but 'the categories themselves stay in a fixed order'. Teams can create, rename, recolour, re-describe and remove statuses 'as long as at least one status exists in each category'. Triage is 'an additional status category' that is excluded from views by default as 'outside the normal workflow'."
grade: A
topics: [status-reports, dashboards]
shelf_life: 12 months
sources:
  - https://linear.app/docs/issue-property
  - https://linear.app/docs/triage  # "By default, we exclude triage issues from all views since triage is considered to be outside the normal workflow."
note: New. Duplicate handling is deliberately left out. issue-property says duplicates move to 'a reserved Duplicate status… system-managed', while triage says they are 'updated to a Canceled status type'. Linear's own pages disagree, which suggests a recently added category. Short shelf life for that reason.
---
```

```yaml
---
id: F-incidentio-severity-ownership-01
form: fact
claim: "incident.io: the default severities 'are a starting point, not a rule'; an organisation can rename them, rewrite descriptions or add its own; managing severities 'requires the Manage organization settings permission'; within an incident type one can override a severity's description, hide severities and restrict who may set a severity."
grade: A
topics: [monitoring, status-reports]
shelf_life: 18 months
sources:
  - https://docs.incident.io/incidents/severities
note: New, single vendor page about its own product. Hold if the source standard needs two pages from the vendor.
---
```

```yaml
---
id: F-cloudevents-type-prefix-01
form: fact
claim: "CloudEvents event type should be prefixed with a reverse-DNS name. Stated in the CloudEvents specification ('SHOULD be prefixed with a reverse-DNS name') and repeated in Google's Firebase Admin SDK reference for its CloudEvent type ('Should be prefixed with a reverse-DNS name (com.my-org.v1.something.happended)')."
grade: A
topics: [monitoring, change-reporting]
shelf_life: 36 months
sources:
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
  - https://firebase.google.com/docs/reference/admin/node/firebase-admin.eventarc.cloudevent
note: New, split from F-cloudevents-type-owner-01. Two publishers. Firebase states it as guidance for its own SDK, not as a restatement of the specification.
---
```

```yaml
---
id: F-cloudevents-type-owner-01
form: fact
claim: "CloudEvents: 'The prefixed domain dictates the organization which defines the semantics of this event type.'"
grade: B
topics: [monitoring, change-reporting]
shelf_life: 36 months
sources:
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
note: Narrowed to the ownership sentence; the prefix half is now F-cloudevents-type-prefix-01. Still a single specification; hold unless the owner accepts single-specification text.
---
```

```yaml
---
id: F-category-count-limit-01
form: fact
claim: "Guidance and evidence put the number of colour-coded categories people handle well at about six to seven. The EU data visualisation guide: 'Seven is a good maximum'. A 2026 IEEE TVCG study (three experiments, multi-class scatterplots with 2–15 classes): 'if the category number is smaller than six, people tend to perform well at all tasks… When category numbers increased, performance fell', with the size of the drop depending on task and encoding."
grade: B
topics: [dashboards, design]
shelf_life: 60 months
sources:
  - https://data.europa.eu/apps/data-visualisation-guide/colour-for-categories
  - https://arxiv.org/abs/2508.17460  # Wang, Quadri, Zhu, Tseng, Szafir; IEEE TVCG 32(1), 2026
note: Replaces F-legend-colour-limit-01 (withdrawn). The study used scatterplots; applying it to legends and timelines is inference. Other guides give 6–10; not cited because their text could not be read.
---
```

```yaml
---
id: F-otel-event-name-01
form: fact
claim: "OpenTelemetry: an event name identifies the event structure. The semconv events page (status: Development) says an event 'MUST have an event name that uniquely identifies the event structure'; the logs data model says EventName 'SHOULD uniquely identify the event structure (both attributes and body)'."
grade: A
topics: [monitoring, change-reporting]
shelf_life: 18 months
sources:
  - https://opentelemetry.io/docs/specs/semconv/general/events/
  - https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md
note: Revised. Development status noted and shelf life cut from 36 to 18 months. Still waits on checker open question 1 (one publisher's two pages for specification text).
---
```

```yaml
---
id: F-otel-event-name-static-01
form: fact
claim: "OpenTelemetry semantic conventions (events page, status: Development): 'Event names MUST NOT include dynamic values. Use attributes for identifiers, names, or other values that vary per occurrence.'"
grade: B
topics: [monitoring]
shelf_life: 18 months
sources:
  - https://opentelemetry.io/docs/specs/semconv/general/events/
note: Still single-source; the naming page and Logs API page do not repeat it. Hold unless the owner accepts single-specification text.
---
```

```yaml
---
id: F-weaver-stability-values-01
form: fact
claim: "Weaver's semantic-convention syntax defines stability ::= 'stable' | 'development' | 'alpha' | 'beta' | 'release_candidate'."
grade: B
topics: [monitoring]
shelf_life: 18 months
sources:
  - https://raw.githubusercontent.com/open-telemetry/weaver/main/schemas/semconv-syntax.md
note: Single page; checker to read raw. Low importance to Q-026.
---
```

**Withdrawn:** `F-legend-colour-limit-01`, replaced by `F-category-count-limit-01`.

---

## Six-part contract

1. **What I changed**
   - **`P-event-vocab-layered-01`:** added the incident.io URL. Linear now has its own docs as a source and is counted, so the count is now 6, 2 and 4.
   - **New entries:**
     - `F-linear-status-categories-01`
     - `F-incidentio-severity-ownership-01`
     - `F-cloudevents-type-prefix-01`, a second publisher (Firebase/Google)
     - `F-category-count-limit-01`, adding the TVCG 2026 study to the EU guide
     - `F-weaver-stability-values-01`
   - **Narrowed:** `F-cloudevents-type-owner-01`, now only the ownership sentence.
   - **Revised:**
     - Both OpenTelemetry event entries now note the page's Development status.
     - `F-otel-event-name-01` has a shorter shelf life.
   - **Withdrawn:** `F-legend-colour-limit-01`.
2. **Why:** these are the round-4 check's open questions 2 to 5.
   - The pattern lacked an incident.io URL and a Linear source.
   - Three items needed second sources.
   - The Weaver `stability` text was unconfirmed.
3. **What I verified:** I have no shell, so I ran no commands. I made about 20 summarising fetches and searches.
   - **Confirmed:**
     - the incident.io wording, three quotes
     - the Linear issue-property wording, four quotes, and the triage wording
     - the Firebase `type` description
     - the arXiv abstract and the journal it appeared in
     - the OpenTelemetry events page wording and its Development status
     - the Weaver `stability` grammar
   - **Negative results:**
     - Linear's configuring-workflows page still returns 404.
     - The OpenTelemetry `events-general` URL returns 404.
     - The OpenTelemetry naming page has no rule on event-name cardinality.
     - The Atlassian and Adobe Spectrum fetches returned no body text.
   - **Contradiction found:** two Linear pages disagree on how duplicates are handled. The new Linear entry leaves duplicate handling out.
4. **What is undone**
   - A second source for the OpenTelemetry "dynamic values" rule and the CloudEvents ownership sentence.
   - A second page for the incident.io and Weaver entries.
   - The controlled-vocabulary literature and ITIL.
   - Evidence on vocabulary drift outcomes. There is still none; the TVCG paper is level-3 evidence only on how many categories people can read.
5. **Needed outside my lane**
   - **Source checker:** re-read every quote above as raw text, especially:
     - Linear issue-property: the fixed-order sentence and the note block
     - the Firebase `type` text
     - the arXiv abstract
   - **Owner:** rule on checker open question 1, which decides:
     - `F-otel-event-name-01`
     - `F-otel-event-name-static-01` and `F-cloudevents-type-owner-01` (single-specification text)
     - possibly `F-incidentio-severity-ownership-01` and `F-weaver-stability-values-01` (single vendor page)
6. **Open questions**
   - Q-a to Q-d from earlier rounds stand.
   - **New, Q-e:** when a system's own docs disagree, as Linear's do on duplicates, should the library file both readings with dates, or file neither until the docs are fixed?
   - Checker question 4 (an official Linear source) can close.

Sources:
- [incident.io severities](https://docs.incident.io/incidents/severities)
- [Linear issue properties](https://linear.app/docs/issue-property)
- [Linear triage](https://linear.app/docs/triage)
- [Firebase Admin Eventarc CloudEvent](https://firebase.google.com/docs/reference/admin/node/firebase-admin.eventarc.cloudevent)
- [CloudEvents spec](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md)
- [Wang et al., subitizing in visualization (arXiv / IEEE TVCG 2026)](https://arxiv.org/abs/2508.17460)
- [EU data visualisation guide](https://data.europa.eu/apps/data-visualisation-guide/colour-for-categories)
- [OTel semconv events](https://opentelemetry.io/docs/specs/semconv/general/events/)
- [OTel semconv naming](https://opentelemetry.io/docs/specs/semconv/general/naming/)
- [OTel logs data model](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md)
- [Weaver semconv syntax (raw)](https://raw.githubusercontent.com/open-telemetry/weaver/main/schemas/semconv-syntax.md)
- [Linear configuring workflows (404)](https://linear.app/docs/configuring-workflows)
- Pattern sources for GitHub, PagerDuty, Kubernetes, Jira, CloudTrail, OCSF, Prometheus and Grafana: as in revision 3, all confirmed by the checker.