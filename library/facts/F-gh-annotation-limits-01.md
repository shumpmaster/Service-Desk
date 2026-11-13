---
id: F-gh-annotation-limits-01
form: fact
claim: "actions/toolkit docs/problem-matchers.md: 'Currently, GitHub Actions limit the annotation count in a workflow run': 10 warning, 10 error and 10 notice annotations per step; 50 annotations per job (sum over steps). The same file also lists '50 annotations per run (separate from the job annotations, these annotations aren't created by users)'. Community discussion 68471 says only 'you can only have 10 warnings or errors per step, and 50 per job'."
grade: B
topics: [actions, ci]
checked_on: 2026-11-13
shelf_life: 12 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://raw.githubusercontent.com/actions/toolkit/HEAD/docs/problem-matchers.md
  - https://github.com/orgs/community/discussions/68471
note: "One GitHub-owned source (a docs file in the toolkit repository, not the docs site); the community post (C) agrees on 10 per step and 50 per job but does not mention notices. Single source, not load-bearing. The per-run system-annotation line is on the toolkit page as written; the memo kept it out as unconfirmed and it is recorded here only as page text."
---
