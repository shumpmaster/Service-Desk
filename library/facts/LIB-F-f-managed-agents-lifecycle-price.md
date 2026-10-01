---
id: LIB-F-f
form: fact
title: Managed Agents (beta) session lifecycle, limits and price
topics: [agents, cost, automation]
grade: A
checked_on: 2026-10-01
shelf_life: 3 months   # beta
opened_by: source-checker (Q-005), full page text
memo: research/Q-005-memo.md (F-22, F-23, F-27)
sources:
  - https://platform.claude.com/docs/en/managed-agents/overview
  - https://platform.claude.com/docs/en/managed-agents/sessions
  - https://platform.claude.com/docs/en/managed-agents/session-operations
  - https://platform.claude.com/docs/en/managed-agents/reference
  - https://platform.claude.com/docs/en/about-claude/pricing
independence: separate pages, same publisher (Anthropic).
---
- Beta; every endpoint needs header `managed-agents-2026-04-01`; needs a Claude API key; enabled by default for API accounts. Not eligible for Zero Data Retention or HIPAA BAA (overview).
- Start: `POST /v1/sessions`, optional `initial_events` (user.message / user.define_outcome, max 50; session then starts `running`). Send: `POST /v1/sessions/{id}/events` with `user.message` (sessions).
- Statuses: idle, running, rescheduling, terminated. Archive blocks new events and keeps history; delete removes the record. A running session can be neither archived nor deleted until a `user.interrupt` leaves it idle (session-operations).
- Optional `budget` at creation only: `max_list_cost.amount` is US cents as a string, currency USD; session pauses idle with stop reason `budget_reached` (sessions). Enforced between requests, so it can overshoot.
- Rate limits per organization: 300 create requests/min, 1,200 read requests/min (reference).
- Price: tokens at model rates plus $0.08 per session-hour, metered only while `running` (pricing).
