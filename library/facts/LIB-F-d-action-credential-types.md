---
id: LIB-F-d
form: fact
title: The Claude Code GitHub Action authenticates with an API key or a `claude setup-token` OAuth token (subscription plans only)
topics: [claude-code, automation]
grade: A
checked_on: 2026-10-01
shelf_life: 6 months
opened_by: source-checker (Q-005 round 3), full page text of the pages named
memo: research/Q-005-memo.md (F-15; F-16 not filed, see below)
sources:
  - https://code.claude.com/docs/en/github-actions  (Manual setup, secrets)
  - https://code.claude.com/docs/en/authentication  ("Generate a long-lived token")
  - https://code.claude.com/docs/en/cli-reference  (`claude setup-token` row)
independence: separate pages, same publisher (Anthropic), per owner ruling A (product behaviour only).
scope: narrowed. The cost claims (F-16) are NOT filed; the standard needs an independent source for cost and none has been opened.
---
- The Action takes `ANTHROPIC_API_KEY` (Claude Console key) or `CLAUDE_CODE_OAUTH_TOKEN` (github-actions page).
- `claude setup-token` makes a one-year OAuth token for "CI pipelines and scripts", set as `CLAUDE_CODE_OAUTH_TOKEN`; it needs a Pro, Max, Team or Enterprise plan and can only make model requests (authentication page; CLI reference says "Requires a Claude subscription"; github-actions page says the token is available on those plans).

Not filed:
- One page only (github-actions): store credentials as GitHub Secrets and never commit them; an OAuth token "is tied to the subscription of the person who ran `claude setup-token`", so use an API key for org-shared secrets; deleting a secret leaves the credential valid; OIDC workload identity federation inputs; the Claude GitHub App's permission set and the custom-app option.
- Cost (F-16: Actions minutes plus API tokens or subscription usage; `--max-turns`, timeouts, concurrency): github-actions page only, and a cost claim. GitHub's billing page, which the page links to, was not opened.
