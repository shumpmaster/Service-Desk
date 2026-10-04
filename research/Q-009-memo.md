I've finished checking the sources. Here is the revised memo.

---

# Research memo: Q-009, how `claude -p` reports a session's usage (revision 2)

**Researcher memo, dated 2026-10-04. Depth 3. Topics: claude-code, usage, agents.** This replaces `research/Q-009-memo.md` and answers `research/Q-009-source-check.md`.

**Grading.**
- **A, confirmed:** stated on two different Anthropic pages. The SDK changelog counts as one page.
- **B, single page:** stated on one page.
- **C, estimate:** my inference from documented facts.
- **Not documented:** no page I read says it.

**Scope of each grade.** This revision grades every statement for a stated surface:
- **[CLI]:** a page says it about `claude -p` or its output.
- **[SDK]:** a page says it about the Agent SDK's result message or types.

An [SDK] grade says nothing about whether the field appears in `-p` output. That link is graded once, as estimate E1, and every [SDK] fact carries it.

**How I read the pages.** In this round, the headless, cli-reference and streaming-output pages came back as full markdown. The Python reference and the TypeScript SDK changelog came back as verbatim-quote extracts. The TypeScript reference was cut off by the fetch tool before its `SDKResultMessage` and `ModelUsage` sections, for the second time, so nothing below relies on it.

## Short answer

- **Formats [CLI, A].** `-p` offers `text`, `json` and `stream-json`.
- **What CLI pages say the output carries.**
  - `json` includes `total_cost_usd`, a per-model cost breakdown, `session_id`, `result`, and with `--json-schema` also `structured_output` and "usage".
  - The last line of `stream-json` is a `result` message with "cost, and session metadata", and it lists `permission_denials`.
  - These are all **B [CLI]**, from the headless page only.
- **No CLI page lists** `num_turns`, `duration_ms`, `duration_api_ms`, `subtype`, `stop_reason`, `terminal_reason` or the four token fields. These are documented on the SDK's result message (A or B [SDK]). Their presence in `-p` output is an **estimate, C** (E1).
- **Cost [CLI and SDK, A].** Every cost figure is a client-side estimate.
- **Per turn.**
  - The SDK documents per-message `usage`, with a placeholder `output_tokens` (B [SDK]).
  - Changelog 0.3.223 calls the result's `usage` "main-loop-only and per-turn" on stream-json results.
  - Per-step figures in `-p` output: estimate, C.
- **Context.**
  - Each `modelUsage` entry has a context-window size, `contextWindow` (B [SDK]).
  - No result field gives a fill level. A fill level comes from SDK `get_context_usage()` (B [SDK]) or a `/context` result (B [SDK changelog]).
  - Whether `/context` works under `-p`: not documented.
- **`--agent`.** No page says anything about how usage is reported when a session runs with `--agent`.

## Estimate linking the SDK to the CLI

**E1. The SDK result-message fields are probably the fields of `-p` json/stream-json output. Estimate, C.** The evidence:
- cli-reference describes `claude -p "query"` as "Query via SDK", and its `-p` row points to the Agent SDK documentation "for programmatic usage details". [CLI]
- headless says "This page covers using the Agent SDK via the CLI (`claude -p`)". [CLI]
- SDK changelog 0.3.223 documents "`usage` vs `modelUsage` on stream-json results". In the same release it refers to "Bare headless (`-p` / SDK `query()` …)" as one surface.
- The SDK runs the `claude` CLI as a subprocess (library LIB-F-e). The Python reference says `terminal_reason` is `None` "on CLI versions that predate the field".

None of these pages lists the `-p` JSON fields, so the field-by-field match is not documented. In revision 1 I graded this link B, which was wrong: under my own scheme an inference is C.

## Facts

### What CLI pages say

**F1. Output formats [CLI].** `--output-format` takes `text` (the default), `json` or `stream-json`, in print mode only. **A** (cli-reference, headless).

**F2. What each format carries [CLI].**
- `json`: "structured JSON with result, session ID, and metadata". The response "includes `total_cost_usd` and a per-model cost breakdown". **B** (headless).
- `json` with `--json-schema`: "metadata about the request (session ID, usage, etc.)" and `structured_output`. **B** (headless).
- `stream-json`: "The last line of the stream is a `result` message with the final response text, cost, and session metadata". Under `--permission-prompts none`, "the final result message lists them in `permission_denials`". **B** (headless).
- `text`: described only as "plain text output". That it carries no figures is an **estimate, C**.

**F3. Cost is an estimate [CLI and SDK].** "Both figures are client-side estimates and can differ from your actual bill" (headless). The cost-tracking page says the same, as does the Python `costUSD` row ("computed client-side"). **A.**
- The figures apply a 1.1× multiplier when the response reports US-only inference. **A** (cost-tracking, changelog 0.3.239).

**F4. Resumed sessions [CLI and SDK].** With `--continue` or `--resume`, "the run reports the conversation's whole total, earlier runs' spend included". **A** (headless, cost-tracking, changelog 0.3.277).
- `--max-budget-usd` does not count totals restored from earlier runs, but it does count subagent spend. **B** (cli-reference).

**F5. Turn limit [CLI].** `--max-turns` will "Limit the number of agentic turns (print mode only). Exits with an error when the limit is reached." **B [CLI]** (cli-reference). For the result's shape, see F13.

**F6. SIGTERM [CLI].** Exit code 143. Claude Code "leaves the turn that was in progress unfinished and records no result for it". **B** (headless).

**F7. Background wait ceiling [CLI].** After 10 minutes of continuous idle waiting for background subagents or workflows, Claude Code "stops whatever is still running and drops its partial result". The ceiling is set with `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`. **B** (headless).
- Separately, the per-request `API_TIMEOUT_MS` defaults to 10 minutes. **B** (errors page).
- **No page documents a whole-session timeout, or how figures are reported when a run ends on any timeout.**

**F8. Exit status [CLI].** The exit code is 0 on success and non-zero when the run fails. A failure inside the run is printed "as the result on stdout". **B** (headless).

**F9. Retry events [CLI].** `stream-json` emits `system/api_retry` events. Their `error` field can be `rate_limit`, `billing_error` and other values. **B** (headless).

### What SDK pages say about the result message (each one depends on E1 for `-p`)

**F10. Result message fields [SDK].** The Python `ResultMessage` has these fields:
- `subtype`, `duration_ms`, `duration_api_ms`, `is_error`, `num_turns`, `session_id`, `stop_reason`
- `total_cost_usd`, `usage`, `result`, `structured_output`, `model_usage`, `permission_denials`
- `deferred_tool_use`, `errors`, `api_error_status`, `uuid`, `terminal_reason`, `origin`.

Grades:
- `num_turns`, `total_cost_usd`, `usage`, `session_id`: **A [SDK]** (python, agent-loop).
- `duration_api_ms`: **A [SDK]** (python, cost-tracking, changelog 0.3.239).
- `duration_ms`: **B [SDK]** (python). No page says what it measures.
- `stop_reason`: **A [SDK]** (python, agent-loop).

**F11. Token fields in `usage` [SDK].** `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`. **A [SDK]** (cost-tracking, python).
- `usage.output_tokens_details.thinking_tokens` exists, and a fix made it report the real count. **B [SDK]** (changelog 0.3.257).

**F12. Which calls each figure counts [SDK].**
- `usage` counts the main loop only. `total_cost_usd` and `modelUsage` include subagents. **A [SDK]**, already filed as LIB-F-k.
- Changelog 0.3.223 says this about "stream-json results" and calls `usage` "main-loop-only and per-turn", with `modelUsage` "cumulative". That wording is the closest documented tie to `-p` output. **B [SDK changelog, stream-json]**.
- The helper calls left out of `modelUsage` (the permission classifier, token-counting requests): **B [SDK]** (python).

**F13. `modelUsage` entry fields [SDK].**
- `inputTokens`, `outputTokens`, `cacheReadInputTokens`, `cacheCreationInputTokens`, `costUSD`: **A** (cost-tracking, python).
- `costBasis`: **A** (cost-tracking, changelog 0.3.246).
- `canonicalModel`, `provider`: **A** (python, changelog 0.3.218).
- `thinkingTokens`, a subset of `outputTokens`: **A** (python, changelog 0.3.257). *Corrected from B.*
- `webSearchRequests`, `contextWindow` ("Context window size for this model"), `maxOutputTokens`: **B** (python only).

**F14. How a run ended [SDK].**
- **Turn limit.** Subtype `error_max_turns`, with no `result` text but still carrying cost, usage and `num_turns`. **A [SDK]** (agent-loop, python). `terminal_reason` is `"max_turns"`. **A [SDK]** (python, changelog 0.3.204 context).
- **Budget limit.** Subtype `error_max_budget_usd`, with the same figures. **A [SDK]** (agent-loop, python).
  - `usage` leaves out the response that crossed the budget, while `total_cost_usd` and `modelUsage` include it. **B** (cost-tracking).
  - Changelog 0.3.204 added a `terminal_reason` value `budget_exhausted` and says budget-exhaustion results "previously omitted `terminal_reason`". **B.**
- **API error (added in this revision).** "When the final request fails, such as on an API error, Claude Code reports `subtype` `"success"` with the cause in `terminal_reason`, for example `"api_error"`; when a limit you set ends the run … it reports an `error_*` subtype." `api_error_status` holds the HTTP status and is "Populated only on `subtype="success"`". **B [SDK]** (python).
  - The value `api_error` itself is **A** (python, changelog 0.3.204).
  - Changelog 0.3.218 says `api_error_status` now reports 429/529 for rate-limit and overloaded errors delivered mid-stream. **B.**
- **Crash.** Subtype `error_during_execution`; cost fields may be zero and `stop_reason` null. **A [SDK]** (agent-loop, cost-tracking).
  - `terminal_reason` is `None` on "synthesized error results emitted when the session fails fatally". **B** (python).

**F15. Usage limit (plan limits) [SDK].** **No page documents the result message for a run that ends on a usage limit.** What is documented:
- A rate-limit event with `status`, `resets_at`, `rate_limit_type`, `utilization`. **A [SDK]** (python, changelog 0.3.260). Whether it appears in `-p` `stream-json`: **estimate, C**.
- Changelog 0.3.280: under `CLAUDE_CODE_RETRY_WATCHDOG`, "a usage-limit wait emits `rate_limit_event` (`rejected`, `resetsAt`) as it begins". **B** (new in this revision).
- The errors page shows plan-limit messages, but does not say how they appear in `-p` output. **B.**

**F16. Per-step figures [SDK].**
- Each assistant message carries `usage` and a message id, and parallel tool calls share an id. **A [SDK]** (cost-tracking, python; streaming-output confirms the shared id).
- Per-step `output_tokens` is a placeholder. **B [SDK]** (cost-tracking).
- Per-step `usage` in `-p` `stream-json` (and not in `json`): **estimate, C**.
- Per-step cost: **not documented**.

**F17. Several user turns in one run [SDK].** With streaming input, each user turn emits a result. `total_cost_usd` and `modelUsage` are running totals. **A [SDK]** (cost-tracking, changelog 0.3.223).
- The CLI side: `--input-format stream-json` exists, and under it a queued message "starts a new turn with its own limit". **B [CLI]** (cli-reference).

**F18. Turn count.** `maxTurns` "counts tool-use turns only" (agent-loop, **B**); cli-reference says "agentic turns". **What `num_turns` counts exactly: not documented** (Q-009a).

**F19. Context fill level [SDK].**
- Not in the result message.
- `get_context_usage()` returns `totalTokens`, `maxTokens`, `percentage` and categories. It makes token-counting requests that do not appear in the stream. **B [SDK]** (python only). *Corrected: changelog 0.3.257 only adds a `detail` option to `getContextUsage()` and is not a source for the method itself.*
- `/context` results carry a structured `context_usage`. **B** (changelog 0.3.232).
- Whether `claude -p "/context"` works: **not documented**. Headless's list of commands that work under `-p` does not include it.
- When compaction happens, a compact-boundary message is emitted. **A [SDK]** (agent-loop, streaming-output).

**F20. `/usage` headless [SDK].** The assistant message that delivers a headless `/usage` result carries a `usage_report`. **B** (changelog 0.3.273). Python adds that `terminal_reason` is `None` on `/usage` results.

**F21. `--agent` [CLI].**
- `--agent` will "Specify an agent for the current session". **A** (cli-reference, sub-agents).
- **Any difference in usage reporting, output format or turn counting: not documented.** Whether the agent's `maxTurns` frontmatter applies to the main thread: not documented.

**F22. OpenTelemetry [CLI].** Metrics `claude_code.token.usage` and `claude_code.cost.usage`, plus an `api_request` event with tokens, `cost_usd` and `duration_ms`. **B** (monitoring-usage).
- The page says `agent.name` is "absent when the request was not issued by a named subagent type". Whether that applies to an `--agent` main thread: **not documented**.

## Proposed library entries (revised)

| id | form | title | grade | shelf life | sources |
|---|---|---|---|---|---|
| LIB-F-j (narrowed) | fact | `claude -p` formats are `text`/`json`/`stream-json`. CLI pages document `total_cost_usd`, a per-model cost breakdown, `session_id`, `result`, `structured_output`, "usage" and `permission_denials` on json/stream-json results. No CLI page lists `num_turns`, the durations or the token fields | A for formats; B for the field list (headless only) | 3 months | cli-reference; headless |
| LIB-F-j2 (new) | estimate | The `-p` json/stream-json result is probably the SDK result message (E1) | C | 3 months | cli-reference ("Query via SDK"); headless; SDK changelog 0.3.223 |
| LIB-F-l (narrowed, [SDK]) | fact | How SDK results report a run's ending: `error_max_turns` and `error_max_budget_usd` still carry figures; an API error is subtype `success` with `terminal_reason` `api_error`; on a crash, totals may be zero; `usage` leaves out the response that crossed the budget. CLI side: `--max-turns` exits with an error; SIGTERM exits 143 with no result. Applies to `-p` only through E1 | A/B mixed, as in F5, F6 and F14 | 3 months | agent-loop; python; cost-tracking; changelog 0.3.204; cli-reference; headless |
| LIB-F-m (narrowed, [SDK]) | fact | SDK assistant messages carry per-step `usage`, with a placeholder `output_tokens`. Presence in `-p` stream-json is estimate C | A/B, C for the CLI | 3 months | cost-tracking; python; streaming-output |
| LIB-F-n (corrected) | fact | `modelUsage.contextWindow` (B, python). Fill level only via SDK `get_context_usage()` (B, python) or a `/context` result (B, changelog 0.3.232). `/context` under `-p` and `--agent` effects: not documented | B | 3 months | python; changelog 0.3.232; headless; sub-agents |

## Sources
- [Run Claude Code programmatically (headless)](https://code.claude.com/docs/en/headless)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Stream responses in real-time](https://code.claude.com/docs/en/agent-sdk/streaming-output)
- [Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking)
- [How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop)
- [Agent SDK reference – Python](https://code.claude.com/docs/en/agent-sdk/python)
- [Subagents](https://code.claude.com/docs/en/sub-agents) · [Error reference](https://code.claude.com/docs/en/errors) · [Monitoring usage](https://code.claude.com/docs/en/monitoring-usage)
- [claude-agent-sdk-typescript CHANGELOG](https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md)
- Not relied on: [Agent SDK reference – TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript), which was cut off before the relevant sections. A search-engine summary listing `SDKResultMessage` fields was not used, because I could not check it against the page.

---

## Six-part contract

**1. What I changed**
- I split every fact into [CLI] and [SDK] scope, and moved `num_turns`, the durations, `subtype`, `stop_reason` and the token fields out of the CLI short answer.
- I made the SDK-to-CLI link its own estimate (E1), graded C instead of B.
- I added the API-error ending (subtype `success`, `terminal_reason` `api_error`, `api_error_status`).
- I raised `thinkingTokens` to A.
- I took changelog 0.3.257 off as the source for `getContextUsage`.
- I added changelog 0.3.223's "per-turn" wording, and new single-page facts: the `budget_exhausted` terminal reason, the 0.3.280 usage-limit `rate_limit_event`, the 0.3.239 result held back for background subagents, the `--max-budget-usd` counting rules, and exit-status behaviour.
- I narrowed proposals F-j, F-l, F-m and F-n and added F-j2. Nothing is on disk, because I have no write tool.

**2. Why**
- The source check failed revision 1, because it presented SDK-only fields as `-p` facts, graded the link inconsistently, left out the API-error subtype, miscited a changelog and under-graded `thinkingTokens`.

**3. What I verified**
- I re-fetched headless and cli-reference as full markdown. Neither lists `num_turns` or `duration_ms`.
- I fetched streaming-output in full. It has no CLI field list.
- I fetched verbatim quotes from the Python reference, including the `terminal_reason` and API-error passage, the `ModelUsage` table and `ContextUsageResponse`.
- I fetched verbatim changelog entries for 0.3.204, 0.3.218, 0.3.223, 0.3.232, 0.3.239, 0.3.246, 0.3.257, 0.3.260, 0.3.273, 0.3.277 and 0.3.280.
- I ran two web searches, and neither found a CLI page listing the `-p` result fields.
- I ran nothing and opened no `.env` or credential file.

**4. What is undone**
- The TypeScript reference's `SDKResultMessage` and `ModelUsage` sections are still unread, because the fetch tool cuts the page off.
- There is still no second page for `contextWindow`, `duration_ms` or `get_context_usage`.
- Q-009b is still unresolved.

**5. What is needed outside my lane**
- The Source checker should read the full TypeScript reference with a full-text tool, and check the new single-page items (0.3.280, 0.3.204 `budget_exhausted`).
- Turning E1 into a fact needs either a CLI page that lists the fields or a test run. Testing is outside this question's rules, so it is the owner's call.

**6. Open questions**
- Q-009a: what does `num_turns` count?
- Q-009b: is `total_cost_usd` cumulative under `json` the same way as under `stream-json`?
- Q-009c (new): does any Anthropic page list the `-p` `--output-format json` result fields?
- How does a `-p` run that ends on a usage limit or a timeout report its figures?
- Do `--agent` sessions differ in their figures, or in OpenTelemetry's `agent.name`?
