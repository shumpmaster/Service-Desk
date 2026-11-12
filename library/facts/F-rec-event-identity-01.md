---
id: F-rec-event-identity-01
form: fact
claim: "CloudEvents requires id, source, specversion and type, and producers MUST ensure source + id is unique per distinct event. CDEvents requires id, type, source, timestamp and specversion; subsequent events about the same subject MUST use the same subject id; repeat delivery attempts of one event MAY share an id. CDEvents links use a chainId (UUID) and link types START, END, PATH (from/to) and RELATION (linkKind, source/target), each with timestamp and tags."
grade: A
topics: [automation, change-reporting]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 24 months
note: memo word 'optional chainId' left out: not confirmed
sources:
  - https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md
  - https://github.com/cdevents/spec/blob/main/spec.md
  - https://github.com/cdevents/spec/blob/main/links.md
---
