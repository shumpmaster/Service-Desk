---
id: F-gh-status-list-01
form: fact
claim: "List commit statuses for a reference: the ref can be a SHA, branch or tag; statuses come in reverse chronological order (latest first); per_page max 100 (default 30); 'there is a limit of 1000 statuses per sha and context'. The endpoints need the fine-grained permission 'Commit statuses' (read), shown both on the statuses REST page and in the fine-grained token permissions page (GET /commits/{ref}/statuses). A status object has id, state, context, description, target_url, creator, created_at and updated_at."
grade: A
publisher_note: same publisher (GitHub docs); permission part on two pages, rest on one
topics: [github, ci]
checked_on: 2026-11-13
shelf_life: 12 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://docs.github.com/en/rest/commits/statuses
  - https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens
note: "Listing and limits: statuses page only. Permission: two pages. The statuses page was read for the combined-status permission text; the list endpoint appears under Commit statuses (read) on the permissions page. There is no repository-wide status list endpoint (memo opinion, not filed)."
---
