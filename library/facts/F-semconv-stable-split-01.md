---
id: F-semconv-stable-split-01
form: fact
claim: "OpenTelemetry semantic-convention libraries ship stable and experimental conventions apart. Java has two artifacts: opentelemetry-semconv ('Generated code for stable semantic conventions') and opentelemetry-semconv-incubating ('Generated code for experimental semantic conventions', an -alpha artifact with 'no compatibility guarantees'). The code-generation guidance recommends 'two different artifacts: one that contains stable Semantic Conventions and another one with all available conventions'."
grade: A
topics: [monitoring, change-reporting]
checked_on: 2026-11-12
shelf_life: 18 months
opened_by: source-checker (Q-026 round 4, 2026-11-12), raw page text fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-026-memo.md
publisher_note: both pages are from the OpenTelemetry project; filed on the same-publisher rule (governance/standards/sources.md)
sources:
  - https://opentelemetry.io/docs/specs/semconv/non-normative/code-generation/  # "Ship two different artifacts: one that contains stable Semantic Conventions and another one with all available conventions"
  - https://raw.githubusercontent.com/open-telemetry/semantic-conventions-java/main/README.md  # artifact table, "-alpha ... no compatibility guarantees"
note: The memo's Python claim (unstable attributes in opentelemetry.semconv._incubating) is on the code-generation page only, so it is left out of this entry.
---
