---
id: F-rec-git-expiry-01
form: fact
claim: "git gc calls prune --expire 2.weeks.ago by default (gc.pruneExpire); git reflog expire removes entries older than 90 days (gc.reflogExpire) or, for entries not reachable from the current tip, 30 days (gc.reflogExpireUnreachable)."
grade: B
topics: [github]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 36 months
note: one page
sources:
  - https://git-scm.com/docs/git-gc
---
