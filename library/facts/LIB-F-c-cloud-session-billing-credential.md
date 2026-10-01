---
id: LIB-F-c
form: fact
title: Cloud sessions bill to the claude.ai subscription and cannot use an API key
topics: [claude-code, cost]
grade: A
checked_on: 2026-10-01
shelf_life: 6 months
opened_by: source-checker (Q-005), full page text
memo: research/Q-005-memo.md (F-05, F-06)
sources:
  - https://code.claude.com/docs/en/claude-code-on-the-web
  - https://code.claude.com/docs/en/authentication
  - https://platform.claude.com/docs/en/api/claude-code/routines-fire
independence: separate pages, same publisher (Anthropic).
---
- "Cloud sessions always use your subscription credentials"; setting `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` in the cloud environment does not override it (authentication page).
- Cloud sessions share rate limits with all other Claude and Claude Code use in the account; no separate compute charge for the VM (web page). Routine runs draw down the same subscription usage (fire page).
- `claude setup-token` makes a one-year OAuth token for model requests only; it cannot establish Remote Control sessions (authentication page).
- Sessions stop after an unspecified period of inactivity; archived sessions reject new messages (web page). Zero Data Retention orgs cannot use cloud sessions; org IP allowlisting breaks Anthropic-hosted sessions (web page).
