---
id: F-gh-token-life-01
form: fact
claim: "GITHUB_TOKEN: its permissions are limited to the repository that contains the workflow; it 'expires when the job finishes or after its effective maximum lifetime': 6 hours on GitHub-hosted runners (maximum job time), and on self-hosted runners (5-day job limit) it 'can only be refreshed for up to 24 hours'. Workflow syntax page: permission keys include actions, checks, contents and statuses (read|write|none); if access is specified for any, all unspecified permissions are set to none."
grade: B
publisher_note: same publisher (GitHub docs); one page per part
topics: [github, actions, records]
checked_on: 2026-11-13
shelf_life: 6 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://docs.github.com/en/actions/concepts/security/github_token
  - https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
note: "Lifetime and own-repository scope: token page only (single page, not load-bearing). Permission keys and 'unspecified become none': workflow syntax only. The memo's 'metadata is always read' rested on a search summary and is left out. Replaces the lifetime wording proposed in the memo for F-gh-token-limits-02 (A not supported for this part)."
---
