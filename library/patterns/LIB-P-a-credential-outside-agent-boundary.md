---
id: LIB-P-a
form: pattern
title: Keep credentials outside the agent boundary
topics: [agents, automation]
grade: A
checked_on: 2026-10-01
shelf_life: 12 months
opened_by: source-checker (Q-005), full page text
memo: research/Q-005-memo.md (F-19, F-02, F-25)
sources:
  - https://code.claude.com/docs/en/agent-sdk/secure-deployment
  - https://code.claude.com/docs/en/agent-sdk/hosting
  - https://code.claude.com/docs/en/claude-code-on-the-web
  - https://platform.claude.com/docs/en/managed-agents/webhooks
independence: separate pages, same publisher (Anthropic).
---
Pattern: the agent never holds the secret; something outside it attaches the credential.
- Proxy injects the key after the request leaves the container; for model calls set `ANTHROPIC_BASE_URL` to the proxy. Tool credentials such as git tokens go through a proxy or a custom tool/MCP server, not the agent environment (secure-deployment, hosting).
- Anthropic-hosted cloud sessions: GitHub credentials stay encrypted server-side and never enter the VM; a GitHub proxy attaches them (web page).
- Webhook-then-fetch: webhooks carry only event type and id; fetch the object with a GET. Up to 3 attempts, then the event is dropped, ordering not guaranteed, "not a durable log", so reconcile by listing (webhooks page).
Limit: a proxy cannot inject into HTTPS to arbitrary hosts without TLS termination (secure-deployment).
