---
id: LIB-F-n
form: fact
title: SDK `modelUsage` entries carry `contextWindow` (model's context window size); a fill level comes only from `getContextUsage()` / `get_context_usage()`, not from the result message
topics: [claude-code, usage]
grade: A
checked_on: 2026-10-04
shelf_life: 3 months
opened_by: source-checker (Q-009, 2026-10-04), full page text read directly (Python and TypeScript SDK references)
memo: research/Q-009-memo.md (F13, F19; corrected LIB-F-n; upgraded from memo's B)
sources:
  - https://code.claude.com/docs/en/agent-sdk/python  # `contextWindow`: "Context window size for this model" (line ~1677); `get_context_usage()` (line ~470)
  - https://code.claude.com/docs/en/agent-sdk/typescript  # `ModelUsage.contextWindow: number` (line ~4850); `getContextUsage(opts?)` (line ~630)
independence: separate pages, same publisher (Anthropic); counts as two sources for product behaviour under governance/standards/sources.md
---
- Scope: Agent SDK only. Whether `-p` output carries `contextWindow`, and whether `/context` works under `-p`, is not documented on any page read.
- The memo graded this B (Python only); the TypeScript reference, which the memo could not read, is the second page.
- Changelog 0.3.257 adds only a `detail` option to `getContextUsage` (not its source). Changelog 0.3.232: `/context` result messages carry structured `context_usage` (single page, not filed).
