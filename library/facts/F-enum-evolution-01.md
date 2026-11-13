---
id: F-enum-evolution-01
form: fact
claim: "Closed sets are costly to change: Kubernetes API conventions state 'adding new enum values breaks backward compatibility' (said of phase enums); Google AIP-126 says enums should get new values infrequently ('no more than once a year' as a rule of thumb), should document whether frozen, and that for enums that change frequently the API should use a string and document the format; protobuf closed enums store an unrecognised value in the unknown field set so accessors report the field as unset, while open enums keep the value."
grade: A
topics: [change-reporting, monitoring]
checked_on: 2026-11-12
shelf_life: 36 months
opened_by: source-checker (Q-026, 2026-11-12), raw page text fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-026-memo.md
sources:
  - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md  # "hampered evolution, since adding new enum values breaks backward compatibility"
  - https://google.aip.dev/126  # "a good rule of thumb is no more than once a year"; "Enums should document whether the enum is frozen"; "use a string and document the format"
  - https://protobuf.dev/programming-guides/enum/  # closed enums: "store it in the message's unknown field set. Accessors will report the field as unset"
note: The Kubernetes sentence is in the discussion of deprecated `phase` fields, not a general rule for all enums.
---
