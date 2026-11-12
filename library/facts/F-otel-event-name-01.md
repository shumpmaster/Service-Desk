---
id: F-otel-event-name-01
form: fact
claim: "OpenTelemetry: an event name identifies the event structure. The semconv events page (status: Development) says 'An event MUST have an event name that uniquely identifies the event structure'; the logs data model says the EventName 'SHOULD uniquely identify the event structure (both attributes and body)'. The entry rests on the MUST text; the data model states it at SHOULD strength."
grade: A
topics: [monitoring, change-reporting]
checked_on: 2026-11-12
shelf_life: 18 months
opened_by: source-checker (Q-026 round 5, 2026-11-12), raw page text fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-026-memo.md
publisher_note: specification text; one quoted passage is enough under owner ruling A of 2026-11-12 (governance/standards/sources.md). Says what the specification requires, not what implementers do.
sources:
  - https://opentelemetry.io/docs/specs/semconv/general/events/index.md  # "An event MUST have an event name that uniquely identifies the event structure"
  - https://raw.githubusercontent.com/open-telemetry/opentelemetry-specification/main/specification/logs/data-model.md  # "This name SHOULD uniquely identify the event structure"
---
