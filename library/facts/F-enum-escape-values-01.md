---
id: F-enum-escape-values-01
form: fact
claim: "OCSF: by convention every enum has 0 Unknown and 99 Other; the sibling _name attribute (e.g. activity_name) carries the string; type_uid = class_uid * 100 + activity_id (on both the overview doc and the schema's authentication class page). Google AIP-126 and the protobuf style guide: the first (zero) enum value should be an unspecified/unknown value; the style guide says suffix _UNSPECIFIED or _UNKNOWN, 'distinct from any of the semantic values you expect to be explicitly set'."
grade: A
topics: [monitoring, change-reporting]
checked_on: 2026-11-12
shelf_life: 36 months
opened_by: source-checker (Q-026 round 3, 2026-11-12), raw page text fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-026-memo.md
publisher_note: each half has two pages from one publisher (OCSF; Google); filed on the same-publisher rule in governance/standards/sources.md. That rule is worded for vendor product behaviour; applying it to specification text is the checker's reading, flagged for the owner.
sources:
  - https://github.com/ocsf/ocsf-docs/blob/main/overview/understanding-ocsf.md  # "every Enum type has two common values with integer value 0 for Unknown and 99 for Other"; "class_uid * 100 + activity_id"
  - https://schema.ocsf.io/1.3.0/classes/authentication  # "99 Other"; "its string sibling is activity_name"; "calculated by the logging system as: class_uid * 100 + activity_id"
  - https://google.aip.dev/126  # zero value named with suffix _UNSPECIFIED, or a useful UNKNOWN as zero value
  - https://protobuf.dev/programming-guides/style/  # "suffix of either _UNSPECIFIED or _UNKNOWN"; "distinct from any of the semantic values you expect to be explicitly set"
note: AIP-126 allows a clearly useful zero value (e.g. UNKNOWN) as an exception to _UNSPECIFIED.
---
