---
id: F-rec-two-times-01
form: fact
claim: "Event standards separate occurrence time from record time: OpenTelemetry Timestamp (time the event occurred, by the origin clock) vs ObservedTimestamp (time observed by the collection system); OWASP lists 'Log date and time' and 'Event date and time' separately; CDEvents timestamp is the time of occurrence but the production time MAY be used when it is not available; CloudEvents time is RFC 3339 and all producers for one source MUST be consistent in how they set it."
grade: A
topics: [automation, status-reports]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 36 months
sources:
  - https://opentelemetry.io/docs/specs/otel/logs/data-model/
  - https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
  - https://github.com/cdevents/spec/blob/main/spec.md
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
---
