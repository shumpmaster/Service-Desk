---
id: LIB-F-i
form: fact
title: A `claude setup-token` / CLAUDE_CODE_OAUTH_TOKEN credential cannot establish Remote Control sessions
topics: [claude-code, automation]
grade: A
checked_on: 2026-10-01
shelf_life: 6 months
opened_by: source-checker (Q-005 round 3), full page text of both pages
memo: research/Q-005-memo.md (F-06, F-07)
sources:
  - https://code.claude.com/docs/en/authentication  ("Generate a long-lived token")
  - https://code.claude.com/docs/en/remote-control  (troubleshooting, long-lived token entry)
independence: two separate pages, same publisher (Anthropic). No third-party source exists for product behaviour.
scope: narrowed from the memo's proposed LIB-F-i. Only the setup-token point has two pages. The other requirements below are on the Remote Control page alone, so they are NOT filed (see "not filed").
---
- Authentication page: the one-year token from `claude setup-token` "can only make model requests, so it can't establish Remote Control sessions or fetch claude.ai connectors."
- Remote Control page: a session using a `setup-token` / `CLAUDE_CODE_OAUTH_TOKEN` credential gets "These tokens can only make model requests, so they can't establish Remote Control sessions"; fix is `claude auth login`.

Not filed (one page only, same bar that held LIB-F-b, -d, -e, -h):
- Remote Control plans (Pro, Max, Team, Enterprise), "API keys are not supported", Owner toggle on Team/Enterprise, exclusion of Bedrock / Agent Platform / Foundry / non-api.anthropic.com `ANTHROPIC_BASE_URL` (Remote Control page).
- "No API or third-party access documented": an absence claim, read across the full Remote Control page only. Not a fact entry.
