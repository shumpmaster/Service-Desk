---
id: LIB-F-b
form: fact
title: `claude -p "<msg>" --cloud <session-id>` queues a message into an existing cloud session
topics: [claude-code, automation]
grade: A
checked_on: 2026-10-01
shelf_life: 6 months
opened_by: source-checker (Q-005 round 3), full page text of both pages
memo: research/Q-005-memo.md (F-03)
sources:
  - https://code.claude.com/docs/en/claude-code-on-the-web  ("Send follow-ups from the CLI")
  - https://code.claude.com/docs/en/cli-reference  (`--cloud` flag row)
independence: two separate pages, same publisher (Anthropic), per owner ruling A (governance/standards/sources.md; product behaviour only).
scope: narrowed to the points both pages state. Points on one page only are listed under "not filed".
---
- With a task description, `claude --cloud "..."` creates a new cloud session. With `-p` and a session ID (`session_...` or `cse_...`) or a claude.ai/code URL, it queues a message into that existing session instead (web page and CLI reference both say so). `--remote` is a deprecated alias.

Not filed (one page only: the claude-code-on-the-web page):
- The CLI "queues the message into the session and exits without waiting for a reply"; `--output-format json` gives `{ok, session_id, url}` (or `{ok: false, session_id, error}`); `stream-json` is not supported with `--cloud <session-id>`.
- Needs `claude auth login` (an Anthropic account); not available with Bedrock, Agent Platform or other third-party providers (an LLM gateway set only through `ANTHROPIC_BASE_URL` does not count as one); org policy `allow_remote_sessions` must be on.
- Archived session: send fails with "cloud session <id> is archived and cannot accept new messages".
- The page names "a CI script" as a use.
