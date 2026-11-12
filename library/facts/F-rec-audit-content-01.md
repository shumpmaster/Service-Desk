---
id: F-rec-audit-content-01
form: fact
claim: "NIST SP 800-53 r5 AU-3: audit records contain information establishing what type of event occurred, when, where, the source, the outcome, and the identity of any individuals, subjects, or objects/entities associated with the event. AU-8: timestamps use UTC, have a fixed local time offset from UTC, or include the local time offset as part of the time stamp, at a granularity the organisation defines."
grade: B
topics: [status-reports, change-reporting]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 60 months
note: upgraded from the memo's C: NIST's own OSCAL catalog was opened. The 'organisation defines granularity' wording is parameter text in the catalog.
sources:
  - https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json  # NIST's own catalog, AU-3 and AU-8 statements read directly
  - https://www.tarleton.edu/security-controls-catalog/audit-and-accountability-au/au-3-content-of-audit-records/  # mirror
  - https://www.upguard.com/compliance/nist-sp-800-53/au/au-8.md  # mirror
---
