---
id: F-field-actions-attic-02
form: fact
supersedes: F-field-actions-attic-01
claim: "Booyaka101/actions-attic: same design as F-field-actions-attic-01 (nightly schedule plus workflow_dispatch, GITHUB_TOKEN, monthly JSONL files on refs/attic/archive, stops at max-requests 800, one writer at a time). The earlier 2,500-versus-1,000 discrepancy is resolved by the README text. The backfill halves a window that reports 1,000 or more results (the GET /actions/runs 1,000-result search cap). The preflight count halves a window that reads 2,500, the cap on total_count since 2026-09-25. These are two different caps used for two different jobs."
grade: C
topics: [records, retention, ci]
checked_on: 2026-11-13
shelf_life: 6 months
opened_by: source-checker (Q-028, 2026-11-13), README raw text fetched with curl and searched (lines 214-218, 425, 439, 486-487); GitHub changelog and workflow-runs page fetched as raw HTML
memo: research/Q-028-memo.md
sources:
  - https://github.com/Booyaka101/actions-attic
  - https://github.blog/changelog/2026-09-25-changes-to-query-results-in-the-github-actions-api-and-ui
  - https://docs.github.com/en/rest/actions/workflow-runs
note: "One project: records the design, not that it works. README gives both numbers; the GitHub pages confirm each cap separately."
---
