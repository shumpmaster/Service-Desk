---
id: F-incidentio-severity-ownership-01
form: fact
claim: "incident.io: each incident's severity is 'picked from one of the severities configured in your organisations settings'; severities 'are shared across incident types and their order will remain consistent'; per incident type an organisation can hide a severity and restrict who may set it ('This feature can be enabled per incident type, not in the general severity configuration'; incident types and the restriction are on Pro and Enterprise plans)."
grade: A
topics: [monitoring, status-reports]
checked_on: 2026-11-12
shelf_life: 18 months
opened_by: source-checker (Q-026 round 6, 2026-11-12), all four pages fetched and read as raw page text; researcher read them through a summarising fetch
memo: research/Q-026-memo.md
publisher_note: vendor product behaviour; four different pages of the vendor's own site (docs x3, changelog 2026-04-08), labelled same publisher. The 'Manage organization settings' permission and 'Rename them... add your own' wording are NOT part of this entry (single page).
sources:
  - https://docs.incident.io/incidents/severities  # "hide severities that don't apply, and restrict who's allowed to set a particular severity"
  - https://docs.incident.io/incidents/incident-types  # "severities are shared across incident types and their order will remain consistent"; "You can restrict which users are allowed to select a particular severity for a given incident type"; "Incident types are only available on our Pro or Enterprise plan"
  - https://incident.io/changelog/incident-role-restrictions  # 2026-04-08
  - https://docs.incident.io/api-reference/severities-v1  # "picked from one of the severities configured in your organisations settings"
---
