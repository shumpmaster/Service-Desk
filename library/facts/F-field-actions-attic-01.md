---
id: F-field-actions-attic-01
form: fact
claim: "Booyaka101/actions-attic (MIT; 22 commits and 0 stars when checked): a nightly schedule plus workflow_dispatch job using GITHUB_TOKEN with actions/checks/statuses: read and contents: write; writes monthly JSONL files for runs, checks and statuses plus manifest.json to refs/attic/archive, 'deliberately not a branch'; stops at max-requests 800 (default) to stay under the 1,000 per hour token limit; keeps no log text; 'One writer at a time' (two jobs race on the ref; the loser reloads, retries once, then fails); it splits a time window in half when a count hits the search cap. The author's post (dev.to, Aug 28) says run IDs embedded in npm provenance, artifact attestations and SLSA generators can no longer be checked once the runs expire."
grade: C
topics: [records, retention, ci]
checked_on: 2026-11-13
shelf_life: 6 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://github.com/Booyaka101/actions-attic
  - https://dev.to/booyaka101/github-starts-deleting-your-actions-run-history-on-october-1-there-is-no-export-button-3ck1
note: "One project, by the same author as the post: not independent. Discrepancy: the README gives 2,500 as the cap that triggers halving; the post and GitHub's workflow-runs page say 1,000. Records the design, not that it works."
---
