---
id: LIB-F-e
form: fact
title: Third-party products built on the Claude Agent SDK may not offer claude.ai login or rate limits unless previously approved
topics: [agents, claude-code]
grade: A
checked_on: 2026-10-01
shelf_life: 6 months
opened_by: source-checker (Q-005 round 3), full page text of the pages named
memo: research/Q-005-memo.md (F-18)
sources:
  - https://code.claude.com/docs/en/agent-sdk/overview  (note under "Get started")
  - https://code.claude.com/docs/en/agent-sdk/quickstart  (note under "Set your API key")
  - https://code.claude.com/docs/en/agent-sdk/hosting  (subprocess model; first bullet below)
independence: separate pages, same publisher (Anthropic), per owner ruling A (product behaviour only).
---
- Overview and quickstart carry the same sentence: "Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK." Both direct you to API-key authentication instead.
- The SDK runs the Claude Code CLI as a subprocess (hosting page: "spawns and supervises a `claude` CLI subprocess"; overview: "A library that runs the Claude Code binary").

Not filed (one page only):
- Quickstart: key read from `ANTHROPIC_API_KEY`; third-party providers via `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX`, `CLAUDE_CODE_USE_FOUNDRY`, and also Claude Platform on AWS (`CLAUDE_CODE_USE_ANTHROPIC_AWS`). The memo's F-18 list omits the last one.
- Overview: may not be branded "Claude Code" or "Claude Code Agent"; governed by Anthropic's Commercial Terms of Service.

Open (not decided by this entry): whether a private single-owner desk counts as "offering" claude.ai login to a third party. The pages do not say (memo Q-005a); the Terms were not read.
