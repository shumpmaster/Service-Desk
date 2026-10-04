---
id: LIB-F-k
form: fact
title: Result `usage` counts the main loop only; `modelUsage` and `total_cost_usd` include subagents; cost figures are estimates
topics: [claude-code, usage, agents]
grade: A
checked_on: 2026-10-04
shelf_life: 6 months
opened_by: source-checker (Q-009, 2026-10-04), full page markdown fetched and read directly (cost-tracking, headless, agent-loop; SDK changelog raw file)
memo: research/Q-009-memo.md (F6, F8)
sources:
  - https://code.claude.com/docs/en/agent-sdk/cost-tracking  # table: `usage` "Excluded. Counts only the top-level agent loop"; `modelUsage` "Included"; "`total_cost_usd` and `costUSD` fields are client-side estimates, not authoritative billing data"
  - https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md  # 0.3.223: "`usage` is main-loop-only and per-turn; `modelUsage` is cumulative ... on stream-json results"
  - https://code.claude.com/docs/en/headless  # with `--output-format json`, `total_cost_usd` and a per-model breakdown; "Both figures are client-side estimates"
independence: separate pages, same publisher (Anthropic); counts as two sources for product behaviour under governance/standards/sources.md
---
- Scope: the result message of the Agent SDK and of `claude -p` `stream-json` (changelog 0.3.223); for `--output-format json` the headless page names `total_cost_usd` and a per-model breakdown only.
- `usage` leaves out subagent tokens; `modelUsage` (`model_usage` in Python) includes them; `total_cost_usd` is the cumulative estimate. Cost fields are client-side estimates.
- Not covered: what `--agent` changes (not documented); the exact `num_turns` definition (not documented).
