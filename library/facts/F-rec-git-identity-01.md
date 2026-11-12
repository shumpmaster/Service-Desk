---
id: F-rec-git-identity-01
form: fact
claim: "Every git commit records an author (name, email, date) and a committer (name, email, commit time) separately; Pro Git: 'The author is the person who originally wrote the work, whereas the committer is the person who last applied the work.' Dates can be given in git internal format '<unix-timestamp> <time-zone-offset>' (e.g. +0100) and the author and committer dates can be set independently via GIT_AUTHOR_DATE / GIT_COMMITTER_DATE."
grade: A
topics: [github, attribution]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 60 months
note: claim reworded by the checker: the page shows the offset format for the date variables; it was not read as a statement about internal storage
sources:
  - https://git-scm.com/docs/git-commit-tree
  - https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History
---
