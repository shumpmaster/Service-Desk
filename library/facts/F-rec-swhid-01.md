---
id: F-rec-swhid-01
form: fact
claim: "SWHID v1.2: a core identifier has four colon-separated fields (swh, 1, object type, hex hash); types cnt, dir, rev, rel, snp. Qualifiers origin, visit, anchor, path, lines, bytes are key=value pairs separated by ';'. Identifiers for contents, directories, revisions and releases match git's computation today, but 'Git compatibility is practical, but incidental and is not guaranteed to be maintained in future versions'."
grade: B
topics: [change-reporting, status-reports]
checked_on: 2026-11-12
opened_by: source-checker (Q-023 round 3, 2026-11-12), through a summarising fetch
memo: research/Q-023-memo.md
shelf_life: 60 months
note: one specification (two clauses)
sources:
  - https://www.swhid.org/specification/v1.2/5.Core_identifiers/
  - https://www.swhid.org/specification/v1.2/6.Qualified_identifiers/
---
