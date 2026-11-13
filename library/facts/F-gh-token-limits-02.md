---
id: F-gh-token-limits-02
form: fact
claim: "The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository (15,000 for Enterprise Cloud resources). Secondary limits (rate-limits page): no more than 100 concurrent requests, 900 points per minute per REST endpoint, and in general no more than 80 content-generating requests per minute and 500 per hour."
grade: A
publisher_note: same publisher (GitHub docs); two pages for the 1,000 figure
topics: [github, actions, records]
checked_on: 2026-11-13
shelf_life: 6 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
  - https://docs.github.com/en/actions/reference/limits
note: "Two GitHub pages state the 1,000 per hour per repository figure. The secondary limits are on the rate-limits page only. Whether concurrent jobs in one repository share the 1,000 is not stated (open question 4 of the memo)."
---
