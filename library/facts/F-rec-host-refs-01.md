---
id: F-rec-host-refs-01
form: fact
claim: "GitHub: a file link using a commit ID gives 'the file content will not change', while the version at a branch head 'can change as new commits are made'; 'The remote refs/pull/ namespace is read-only' and a PR head can be fetched with git fetch origin pull/ID/head:BRANCH_NAME; 'You can restore the head branch of a closed pull request' with the Restore branch button."
grade: B
topics: [github, change-reporting]
checked_on: 2026-11-12
opened_by: source-checker (Q-023 round 3, 2026-11-12), through a summarising fetch
memo: research/Q-023-memo.md
shelf_life: 24 months
note: one page per claim. The memo says the words 'permanently link' are not on the permalink page; the fetch says they are. Not relied on here.
sources:
  - https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files
  - https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/checking-out-pull-requests-locally
  - https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request
---
