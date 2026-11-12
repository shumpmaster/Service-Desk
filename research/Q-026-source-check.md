Verdict: FAIL

I filed three of the memo's proposed entries. The other five are held back. The directory is not a git repository, so nothing was committed. I fetched every cited page as raw text and searched it for the quoted wording. Evidence is in `research/Q-026-memo.md` (the memo) and the new entries in `library/facts/`.

## Filed
- **`library/facts/F-enum-escape-values-01.md`:**
  - The OCSF overview has "every Enum type has two common values with integer value 0 for `Unknown` and 99 for `Other`" and `class_uid * 100 + activity_id`.
  - The OCSF authentication class page has "0 Unknown", "99 Other", "its string sibling is activity_name" and the same `type_uid` formula.
  - AIP-126 names the zero value `_UNSPECIFIED`, with a "clearly useful zero value" exception for `UNKNOWN`.
  - The protobuf style guide has "suffix of either _UNSPECIFIED or _UNKNOWN" and "distinct from any of the semantic values you expect to be explicitly set".
  - Each half rests on two pages from one publisher (OCSF, Google). `governance/standards/sources.md` speaks of vendor product behaviour, so applying it to specification text is my reading (see open question 1).
- **`library/facts/F-high-cardinality-01.md`:**
  - Prometheus's naming page has "Do not use labels to store dimensions with high cardinality… such as user IDs, email addresses, or other unbounded sets of values".
  - Grafana Labs has "Never use these as metric label values: … Each of these creates a new series per unique value".
  - The two sources are from different publishers.
- **`library/facts/F-board-status-categories-01.md`:**
  - The Jira page has all three quotes: "even custom statuses… must belong to one of three status categories", grey/blue/green "(this can't be customized)", and the effect on "lists, reports, and boards".
  - JRACLOUD-44020 says a status can't be created "without any Category via the JIRA UI". It supports only the category rule. The colour and board sentences rest on the first page.
  - That issue also describes a database workaround that sets "No Category", so the rule is a UI rule. I put this in the entry's note.
  - Both pages are Atlassian's, filed under the same-publisher rule.

## Not filed
- **`F-event-namespace-owner-01`:**
  - Confirmed: the OpenTelemetry events page has "MUST NOT include dynamic values", and the logs data model has `EventName` "SHOULD uniquely identify the event structure". The CloudEvents spec has the reverse-DNS wording.
  - The "dynamic values" rule is on the events page only. The reverse-DNS rule is on the spec only. Each of those parts has a single source.
- **`F-gh-custom-kinds-01`:**
  - The claim says "audit log entries are named category.action", but none of its five listed pages contains that text. I searched all five.
  - Confirmed: `event_type` of 100 characters or fewer, `client_payload` at 10 properties and under 64KB, only GitHub can set `stale`, deployment `environment` and `task`, and "Anyone with write access" for labels.
- **`F-vocab-registry-check-01`:**
  - Weaver's README has `registry check` and `registry live-check`. The code-generation page covers `_incubating` only as examples: a Python import path, and Java "incubating" artifacts.
  - The two pages support different halves of the claim, so each half has a single source. "Experimental names in an `_incubating` path" is also broader than the page.
- **`P-event-vocab-layered-01`:**
  - The five named examples are confirmed: GitHub check conclusion and name, PagerDuty `severity` with `class` and `summary`, Kubernetes `type`, `reason` and `message`, Jira's three categories, and CloudTrail `eventCategory`, `eventType` and `eventName`.
  - The "6 of 12" count includes Linear, which has no official source. The "4 single open form" systems (CloudEvents, OpenTelemetry events, Prometheus labels, Grafana tags) are not in the entry's source list.
  - The count of 12 matches §A.
- **`F-legend-colour-limit-01`:** "Seven is a good maximum" is on the EU guide, but it is a single source.

## Memo points checked
- **Kubernetes quote:** the "one-word, CamelCase" Reason/Message text is now correctly placed in api-conventions, with the "everywhere else they appear" wording. The "Choose a unique, specific, short, CamelCase reason" text and `reportingComponent` are also confirmed.
- **Weaver stability:** the `stability` values `stable | development | alpha | beta | release_candidate` and "`stability` is not required for attrib…" are in semconv-syntax.md. The extract was cut off, so I did not confirm the full sentence. It is not filed.
- **Ten default labels:** confirmed on the labels page.
- **Linear:** the memo says it could not read an official source, and I did not try one. Linear stays grade C and unfiled.

## Open questions
1. Does the owner accept two pages from one publisher as two sources for specification text, as I did for `F-enum-escape-values-01`? If not, that entry should be withdrawn.
2. Can the Researcher find a second source for the OpenTelemetry "dynamic values" rule and the CloudEvents reverse-DNS rule? They could also split the entry into two claims.
3. The Researcher needs to fix or drop the audit-log claim in `F-gh-custom-kinds-01`, or cite the page that has it. They also need to narrow the `_incubating` claim.
4. Is there an official Linear source for the state types?