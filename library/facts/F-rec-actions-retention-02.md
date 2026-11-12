---
id: F-rec-actions-retention-02
form: fact
claim: "From 2026-10-01, GitHub checks, workflow runs and commit statuses follow the Actions retention setting (the org page says they were kept 400+ days regardless before). Default 90 days; public repos 1-90 days; private repos 1-400 days. A changed setting applies only to new objects and does not restore removed data."
grade: A
topics: [github, automation]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 6 months
note: same publisher (GitHub docs and changelog)
sources:
  - https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization  # default, ranges, 400+ days before, not retroactive
  - https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses  # effective date, public max 90, 'won't restore data'
---
