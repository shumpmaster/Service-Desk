---
id: F-rec-pr-review-fields-01
form: fact
claim: "GitHub's documented PR review response lists id, node_id, user, body, state, is_copilot_code_review, copilot_code_review_effort, html_url, pull_request_url, _links, submitted_at, commit_id, body_html, body_text, author_association; performed_via_github_app does not appear on that page."
grade: B
topics: [github, attribution, agents]
checked_on: 2026-11-12
opened_by: source-checker (Q-023 round 3, 2026-11-12), through a summarising fetch
memo: research/Q-023-memo.md
shelf_life: 12 months
note: absence in documentation, seen through a summary; not proof the API never returns the field
sources:
  - https://docs.github.com/en/rest/pulls/reviews
---
