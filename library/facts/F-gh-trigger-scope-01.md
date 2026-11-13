---
id: F-gh-trigger-scope-01
form: fact
claim: "Events page: workflow_run fires on requested/in_progress/completed, only if the workflow file is on the default branch, cannot chain more than three levels, and the triggered workflow 'is able to access secrets and write tokens, even if the previous workflow was not'; 'The requested activity type does not occur when a workflow is re-run.' check_run and check_suite do not trigger workflows if the check suite was created by GitHub Actions or its head SHA is associated with GitHub Actions (both need the workflow file on the default branch); status fires when a commit status changes and needs the workflow file on the default branch. Workflow syntax page: the workflow_run 'workflows' filter accepts glob patterns (*, **, +, ?, !) and the event can be filtered by branches."
grade: B
publisher_note: same publisher (GitHub docs); one page for most parts
topics: [github, actions, ci]
checked_on: 2026-11-13
shelf_life: 6 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
  - https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
note: "Single page (events page) for everything except the glob/branches filter, which is on workflow syntax: single-page, not load-bearing. The memo proposed grade A for the bundle; the workflow-syntax page does not state the three-level limit, the re-run rule, the secrets/write-token sentence or the default-branch rule, so A is not supported. actions/runner #726 (2020-09-29 to 2023-02-28, community report, C) says a Re-run-all-jobs click gave check_run:created, workflow_run:completed, check_run:completed and no workflow_run:requested; it is not a basis for 'completed fires on every re-run', which stays an open question."
---
