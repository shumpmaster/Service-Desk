Verdict: FAIL

I opened the cited pages as full markdown, not the summarised extracts the researcher used. Most of the memo's claims hold. The memo's headline claim does not: it presents SDK result-message fields as what `claude -p` reports, and no CLI page says that. Nothing was run, and I did not open any `.env` or credential files.

**What I filed**
- `library/facts/LIB-F-k-usage-main-loop-only-modelusage-includes-subagents.md`, grade A, 6-month shelf life.
- It says `usage` counts the main loop only, `modelUsage` and `total_cost_usd` include subagents, and cost figures are estimates.
- Sources: cost-tracking (lines 14, 90–96), SDK changelog 0.3.223 (`usage`/`modelUsage` on stream-json results), headless (line 112).
- I worded it narrowly to the SDK result message and `stream-json`. For `--output-format json`, headless names only `total_cost_usd` and a per-model breakdown.

**Not filed**
- **LIB-F-j (formats and fields): not confirmed.**
  - Formats confirmed: `text`, `json`, `stream-json` (cli-reference line 110, headless lines 138–142).
  - Also confirmed: json carries `total_cost_usd` and a per-model breakdown (headless 112), and the stream's last line is a `result` message with cost and metadata (headless 185).
  - Not confirmed: that `-p` output carries `num_turns`, `duration_ms`, `duration_api_ms`, `subtype`, `stop_reason` or the four token fields. Those appear only on the Python SDK page, agent-loop (line 327) and cost-tracking, which all describe the SDK.
  - No `num_turns` or `duration_ms` appears in headless, cli-reference, errors or sub-agents.
  - The memo marks these A in F4 and F5 and states them as `-p` facts in its short answer. Its own F3 says the link is an estimate, so they should be graded B at most. Only `usage`/`modelUsage` on stream-json (changelog 0.3.223) and cost on json (headless) are tied to the CLI.
- **LIB-F-l (error results): partly confirmed, held out.**
  - Confirmed: `error_max_turns` and `error_max_budget_usd` results carry cost, usage and turns (agent-loop 320–327); the crash result may be zeroed with `stop_reason` null (agent-loop 329, cost-tracking 320–327); the budget-crossing response is left out of `usage` (cost-tracking 321); `--max-turns` exits with an error (cli-reference 104); SIGTERM exits 143 with no result (headless 85).
  - Not confirmed: the same SDK-versus-CLI gap as above. The memo also omits that an API-error ending reports `subtype` "success" with `terminal_reason` "api_error" (Python reference, line 1995).
- **LIB-F-m (per-step usage): held out.** The placeholder `output_tokens` is on cost-tracking only (lines 153, 308); the cost-tracking page describes the SDK only, so the CLI link is unconfirmed.
- **LIB-F-n (context): held out.** `contextWindow` is on the Python page only (line 1677), and I found no second page (the TypeScript SDK changelog has none). `getContextUsage` is on the Python page (line 1448 onward). Changelog 0.3.257 only adds a `detail` option to it, so the memo's citation for it as the source of the feature is wrong. Whether `/context` works under `-p` is not documented.

**Smaller grading errors in the memo**
- `thinkingTokens` has two sources (Python line 1675, changelog 0.3.257), so it is A, not B.
- Changelog 0.3.223 calls `usage` "per-turn", which the memo's F10 does not use.

**Checked and holding**
- Cost is a client-side estimate (headless 112, cost-tracking 14).
- The 1.1× data-residency multiplier (cost-tracking 20).
- Resumed sessions report whole-conversation totals from v2.1.277 (cost-tracking 229, changelog 0.3.277).
- The `costBasis`, `canonicalModel` and `provider` fields (changelog 0.3.246 and 0.3.218, Python 1679–1680).
- The `terminal_reason` values `max_turns` and `api_error` (Python 1650, changelog 0.3.204).
- The rate-limit event fields (Python 1734–1750, changelog 0.3.260).
- `--agent` (cli-reference 62, sub-agents 830), with no usage differences documented.
- OpenTelemetry cost and token metrics (monitoring-usage 604–607, 814). On `agent.name`, the page only says it is absent when the request was not from a named subagent type (line 663).
- The idle ceiling and the 10-minute `API_TIMEOUT_MS` default (headless 79, errors 429).
- No whole-session timeout and no usage-limit result format are documented. I found nothing contrary.

**Open questions**
- Which Anthropic CLI page, if any, lists the `-p` JSON result fields? Without one, the memo's "Short answer" should grade `num_turns`, durations and the token fields as inferred from the SDK. Q-009b (whether `total_cost_usd` is cumulative under json versus stream-json) stays unresolved, since the docs do not settle it.
- I did not read the TypeScript reference page, which the memo also left unread; its `SDKResultMessage` and `ModelUsage` sections are unchecked.
