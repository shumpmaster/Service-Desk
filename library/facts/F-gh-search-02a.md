---
id: F-gh-search-02a
form: fact
claim: "GitHub REST code search is limited to 10 requests per minute (separate code-search rate-limit category since 2023-04-10)."
grade: A
topics: [github]
checked_on: 2026-11-03
shelf_life: 12 months
opened_by: source-checker (Q-018, 2026-11-03), through a summarising fetch
memo: research/Q-018-memo.md
publisher_note: same publisher (GitHub); docs page and changelog post
sources:
  - https://docs.github.com/en/rest/search/search  # "The Search code endpoint requires you to authenticate and limits you to 10 requests per minute."
  - https://github.blog/changelog/2023-03-10-changes-to-the-code-search-api/  # "The separate code search category will have a rate limit of 10 requests per minute."; "take effect ... on April 10, 2023"
note: NOT filed (one source only): 30/min authenticated, 10/min unauthenticated, 1,000-result cap, incomplete_results on timeout (docs page only).
---
