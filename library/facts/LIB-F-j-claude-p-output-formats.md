---
id: LIB-F-j
form: fact
title: `claude -p` offers three output formats (`text` default, `json`, `stream-json`); json carries `total_cost_usd` and a per-model breakdown; no CLI page lists `num_turns`, durations or token fields
topics: [claude-code, usage]
grade: A
checked_on: 2026-10-04
shelf_life: 3 months
opened_by: source-checker (Q-009, 2026-10-04), full page text read directly (cli-reference, headless)
memo: research/Q-009-memo.md (F1, F2; narrowed LIB-F-j)
sources:
  - https://code.claude.com/docs/en/cli-reference  # `--output-format`: "options: `text`, `json`, `stream-json`"
  - https://code.claude.com/docs/en/headless  # "Get structured output": `text` (default), `json`, `stream-json`; json "response payload includes `total_cost_usd` and a per-model cost breakdown"
independence: separate pages, same publisher (Anthropic); counts as two sources for product behaviour under governance/standards/sources.md
---
- Formats: two pages (grade A). The list of fields in json / stream-json output is headless-only (single page, B): `total_cost_usd`, per-model breakdown, `session_id`, `result`, with `--json-schema` also `structured_output` and "usage"; last stream-json line is a `result` message with "cost, and session metadata"; `permission_denials` under `--permission-prompts none`.
- Not documented on any CLI page read: `num_turns`, `duration_ms`, `duration_api_ms`, `stop_reason` and the four token fields in `-p` output. These are on the SDK result message (separate fact scope); that they appear in `-p` output is an inference, not filed.
