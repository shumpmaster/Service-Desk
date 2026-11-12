---
id: F-vocab-registry-check-01
form: fact
claim: "OpenTelemetry Weaver validates a semantic convention registry ('registry check') and checks that emitted telemetry (an OTLP stream) conforms to the official or a custom registry ('registry live-check')."
grade: A
topics: [monitoring]
checked_on: 2026-11-12
shelf_life: 18 months
opened_by: source-checker (Q-026 round 4, 2026-11-12), raw page text fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-026-memo.md
publisher_note: both pages are from the OpenTelemetry project, about the behaviour of its own tool; filed on the same-publisher rule (governance/standards/sources.md)
sources:
  - https://raw.githubusercontent.com/open-telemetry/weaver/main/README.md  # "weaver registry check | Validates a semantic convention registry"; "weaver registry live-check | Check the conformance level of an OTLP stream against a semantic convention registry"
  - https://opentelemetry.io/blog/2025/otel-weaver/  # "live-check that their application correctly emits telemetry conforming to the official semantic conventions, or a custom registry"; "Weaver ensures every change to the registry is consistent, validated... weaver registry check -r registry-path"
note: Blog pairs the "ensures every change" sentence with the `weaver registry check` command directly beneath it (raw text). This is a description of what the tool does, not evidence that it prevents vocabulary drift.
---
