---
id: LIB-F-a
form: fact
title: Routines /fire endpoint starts a Claude Code cloud session over HTTP
topics: [automation, claude-code]
grade: A
checked_on: 2026-10-01
shelf_life: 3 months   # research preview, endpoint marked experimental
opened_by: source-checker (Q-005), full page text
memo: research/Q-005-memo.md (F-09, F-10, F-12)
sources:
  - https://platform.claude.com/docs/en/api/claude-code/routines-fire
  - https://code.claude.com/docs/en/routines
independence: two separate pages, same publisher (Anthropic). No third-party source exists for product behaviour.
---
- `POST https://api.anthropic.com/v1/claude_code/routines/{trig_...}/fire`, headers `Authorization: Bearer <per-routine token>` and `anthropic-version: 2023-06-01`. Both pages.
- Optional `text` body field, max 65,536 characters (fire page). Arrives wrapped in a `<routine-fire-payload>` block labelled untrusted (routines page).
- Returns `claude_code_session_id` and `claude_code_session_url`. Does not stream output or wait for completion. No idempotency key: a retry makes another session (fire page).
- Token: shown once, one routine only, "no read access", no public token-management API, regenerating revokes the old one (fire page; routines page agrees on one-routine scope and regenerate/revoke).
- Billing: Claude Code subscription usage on claude.ai, not the Platform API; no SDK support (fire page).
- Limits, no overage: 30 fires/hour/routine (shared with Run now), 100 API fires/hour/account (both pages); 100 scheduled runs/hour/account (routines page).
- Status: "experimental"; research preview (both pages).
