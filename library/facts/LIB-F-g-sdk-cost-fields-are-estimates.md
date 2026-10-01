---
id: LIB-F-g
form: fact
title: Agent SDK cost fields are client-side estimates, not billing data
topics: [agents, cost]
grade: A
checked_on: 2026-10-01
shelf_life: 12 months
opened_by: source-checker (Q-005), full page text
memo: research/Q-005-memo.md (F-21)
sources:
  - https://code.claude.com/docs/en/agent-sdk/cost-tracking
  - https://code.claude.com/docs/en/agent-sdk/typescript
  - https://code.claude.com/docs/en/agent-sdk/hosting
independence: separate pages, same publisher (Anthropic). The typescript page was read through the fetch tool's extract, not full text.
---
- `total_cost_usd` and `costUSD` are "client-side estimates, not authoritative billing data", computed from a bundled price table; they can drift. "Do not bill end users or trigger financial decisions from these fields." Use the Usage and Cost API or Console Usage page (cost-tracking). `maxBudgetUsd` likewise stops on a "client-side cost estimate" (typescript).
- Anthropic token cost "typically dominates container infrastructure cost by an order of magnitude or more"; a minimal container is roughly $0.05/hour (hosting).
