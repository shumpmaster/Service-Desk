---
id: F-rec-git-default-refs-01
form: fact
claim: "By default git notes are saved to and read from refs/notes/commits. git-fetch shows a typical configured remote as fetch = +refs/heads/*:refs/remotes/origin/*, and by default also fetches any tag that points into the histories being fetched. push.default=simple pushes the current branch to the same-name branch on the remote. notes.rewriteRef has no default value."
grade: B
topics: [github, change-reporting]
checked_on: 2026-11-12
opened_by: source-checker (Q-023 round 3, 2026-11-12), through a summarising fetch
memo: research/Q-023-memo.md
shelf_life: 36 months
note: "One page per claim. Narrowed from the memo: git-fetch calls the refspec 'typical', not 'set by clone'. That notes are therefore not pushed or fetched by default is the researcher's inference; no page states it, and it is not filed."
sources:
  - https://git-scm.com/docs/git-notes
  - https://git-scm.com/docs/git-fetch
  - https://git-scm.com/docs/git-push
---
