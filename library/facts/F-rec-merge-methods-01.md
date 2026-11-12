---
id: F-rec-merge-methods-01
form: fact
claim: "On GitHub a merge commit adds all feature-branch commits to the base branch; squash merging combines the commits into one; rebase merging always updates committer information and creates new commit SHAs. git push sends all necessary data not already on the remote; git log --first-parent follows only the first parent and so ignores the individual commits a merge brought in."
grade: A
topics: [github, change-reporting]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 24 months
note: the memo's inference that a pushed merge commit carries second-parent history is a reading of the push sentence, not quoted
sources:
  - https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github
  - https://git-scm.com/docs/git-push
  - https://git-scm.com/docs/git-log
---
