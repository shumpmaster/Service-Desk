---
id: F-rec-actions-actor-attempt-01
form: fact
claim: "In GitHub Actions, github.actor is the user that triggered the initial workflow run and github.triggering_actor the user that initiated the run; on a re-run they may differ. run_id does not change on re-run; run_attempt begins at 1 and increments with each re-run; run_number increments per new run of a workflow and does not change on re-run."
grade: A
topics: [github, automation, attribution]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 12 months
note: same publisher (GitHub docs), two pages
sources:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/contexts
  - https://docs.github.com/en/rest/actions/workflow-runs  # run_attempt, triggering_actor, actor fields exist
---
