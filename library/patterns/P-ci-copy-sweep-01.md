---
id: P-ci-copy-sweep-01
form: pattern
claim: "To keep lasting copies of workflow runs, check runs and commit statuses in the same repository, copy with a sweep (a schedule plus manual workflow_dispatch) and use event triggers only to copy sooner; do not depend on workflow_run 'requested' events (they do not occur on re-runs). Key workflow runs by run_id plus run_attempt, check runs and statuses by their id; list commits from git history to reach check runs and statuses; write to a single-writer branch or ref that is not the default branch, using the workflow token, one copier at a time (concurrency). Basis: F-gh-trigger-scope-01, F-gh-token-limits-02, F-gh-token-life-01, F-gh-checks-runs-01, F-gh-status-list-01, F-gh-12, F-gh-12b, F-gh-retention-02, F-gh-contents-read-01, F-field-actions-attic-01. Opinion built on those facts."
grade: C
topics: [records, ci, actions]
checked_on: 2026-11-13
shelf_life: 12 months
opened_by: source-checker (Q-028, 2026-11-13); basis facts checked in raw page HTML
memo: research/Q-028-memo.md
note: "Conclusion is the researcher's opinion. Two parts rest on undocumented behaviour: that a ref outside refs/heads/ can be pushed with the workflow token and is untouched by rulesets (memo open question 2), and that statuses posted with the workflow token do not start status-triggered workflows (open question 5). Cost figures in the memo's worked examples are estimates and are not filed."
---
