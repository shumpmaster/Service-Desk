---
id: F-git-dates-settable-01
form: fact
claim: "In git, the GIT_AUTHOR_DATE and GIT_COMMITTER_DATE environment variables supply the timestamps in a commit's author and committer fields, and accept arbitrary dates in several formats (git internal, RFC 2822, ISO 8601); so those dates are set by whoever runs the commit."
grade: B
topics: [github, provenance, status-reports]
checked_on: 2026-11-12
shelf_life: 36 months
opened_by: source-checker (Q-025, 2026-11-12), through summarising fetches; all three pages opened
memo: research/Q-025-memo.md
supersedes: none
publisher_note: same publisher (git project); behaviour claim; three pages. The last clause ("set by whoever runs the commit") is the checker's reading of the three pages together, not a quoted sentence.
sources:
  - https://git-scm.com/docs/git-commit  # DATE FORMATS: variables support these formats
  - https://git-scm.com/docs/git-commit-tree  # same section
  - https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables  # "timestamp used for the 'author' field"; "for the timestamp in the 'committer' field"
note: "Not filed (single source): that --date overrides the author date; web-interface signing."
---
