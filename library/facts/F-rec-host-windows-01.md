---
id: F-rec-host-windows-01
form: fact
claim: "GitHub organisation audit log contains data for the last 180 days and only owners can access it; the REST Events API includes only events from the past 30 days, up to 300 events, with latency from 30 s to 6 h."
grade: B
topics: [github]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 12 months
note: two claims, one page each; same publisher
sources:
  - https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization  # audit log
  - https://docs.github.com/en/rest/activity/events  # Events API
---
