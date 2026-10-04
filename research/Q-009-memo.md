# Research memo: Q-009, how `claude -p` reports a session's usage

**Researcher memo, dated 2026-10-04. Depth 3. Topics: claude-code, usage, agents.**

**Grading.** A **confirmed** fact (grade A) is stated on two different Anthropic pages. **Single page** (grade B) is stated on one. **Estimate** (grade C) is my inference from documented facts. **Not documented** means no page I read says it.

**How I read the pages.** Everything came through the web fetch tool, which returns a summary or extract made by a small model, not the full page text. The headless, cost-tracking and agent-loop pages came back as full markdown. The other pages came back as extracts.

**One extract was false.** When I asked for the `SDKResultMessage` section of the TypeScript SDK reference, the tool returned a type that it later said it had never received (`result:{stop_reason…}`, `cost_usd`, `thinking_tokens`). I threw that extract away, and nothing below relies on it. The TypeScript reference is too long for the tool, so I used the Python reference for type definitions. The Source checker should open full page text for every entry.

## Short answer

- **Formats.** `-p` offers three output formats: `text`, `json` and `stream-json`. Only `json` and `stream-json` carry usage figures.
- **Whole-session figures.** The final result reports:
  - estimated cost: `total_cost_usd`
  - main-loop tokens: `usage` (input, output, cache creation, cache read)
  - per-model tokens and cost, subagents included: `modelUsage`
  - `num_turns`, `duration_ms`, `duration_api_ms`, `stop_reason` and an end state (`subtype`, `terminal_reason`).
- **Cost.** Every cost figure is a client-side estimate.
- **Per turn.** Per-step figures exist only in `stream-json`, as `usage` on each assistant message. They are reliable for input and cache tokens only.
- **Context.** The documentation gives a context-window *size* per model, but no context *fill level* in the result.
- **`--agent`.** No page says anything about usage reporting for a session run with `--agent`.

## Facts and estimates

**F1. Output formats.** `--output-format` accepts `text` (the default), `json` and `stream-json`, in print mode only. **Fact, A.** Sources: headless, cli-reference.

**F2. Which formats carry usage.** `json` returns "result, session ID, and metadata", including `total_cost_usd` and a per-model cost breakdown. The `--json-schema` passage says the response includes "metadata about the request (session ID, usage, etc.)". The last line of `stream-json` is a `result` message "with the final response text, cost, and session metadata". **Fact, B for the CLI wording (headless only).**
- That `text` carries no figures is an **estimate, C**. The docs describe it only as "plain text output".

**F3. The CLI's result is the SDK's result message.** The SDK runs the `claude` CLI as a subprocess (library LIB-F-e). SDK changelog 0.3.223 describes `usage` and `modelUsage` "on stream-json results". So the result-message fields below apply to `claude -p --output-format json/stream-json`. **Estimate, B.** The link is stated in a changelog, but no CLI page lists the fields.

**F4. Result message fields.** The Python `ResultMessage` lists:
- `subtype`, `duration_ms`, `duration_api_ms`, `is_error`, `num_turns`, `session_id`, `stop_reason`
- `total_cost_usd`, `usage`, `result`, `structured_output`, `model_usage`
- `permission_denials`, `errors`, `api_error_status`, `terminal_reason`.

Agent-loop says every subtype carries `total_cost_usd`, `usage`, `num_turns` and `session_id`.
- `num_turns`, `total_cost_usd`, `usage`, `session_id`, `stop_reason`: **Fact, A** (python, agent-loop).
- `duration_api_ms`: **Fact, A** (python, cost-tracking, TS SDK changelog 0.3.239).
- `duration_ms`: **Fact, B** (python only). No page says what it measures.

**F5. Token fields in `usage`.** `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`. **Fact, A** (cost-tracking, python).

**F6. Which calls each figure counts.**
- `usage` counts only the top-level agent loop, so subagent tokens are left out.
- `total_cost_usd` and `modelUsage` include subagents.
- `modelUsage` covers the main loop, subagents, compaction and Workflow agents. It leaves out helper calls outside the query pipeline, such as the permission classifier and token-counting requests (python).

**Fact, A** (cost-tracking, python, agent-loop, TS SDK changelog 0.3.223). The list of excluded helper calls is **B** (python).

**F7. Fields of each `modelUsage` entry.**
- `inputTokens`, `outputTokens`, `cacheReadInputTokens`, `cacheCreationInputTokens`, `costUSD`: **A** (cost-tracking, python).
- `costBasis` (`list`/`managed`/`unknown`): **A** (cost-tracking, changelog 0.3.246).
- `canonicalModel`, `provider`: **A** (python, changelog 0.3.218).
- `webSearchRequests`, `thinkingTokens`: **B** (python).
- **`contextWindow` ("Context window size for this model") and `maxOutputTokens`: B (python only).**

**F8. Cost is an estimate.** `total_cost_usd` and `costUSD` are "client-side estimates, not authoritative billing data". They come from a bundled price table or a `modelPricing` table. They apply the 1.1× multiplier for US-only inference. **Fact, A** (headless, cost-tracking, python; library LIB-F-g already holds this).

**F9. Turn count is per session, and what counts as a turn.** `num_turns` covers the whole call. `maxTurns` "counts tool-use turns only" (agent-loop, **B**). The cli-reference calls them "agentic turns". No page says whether `num_turns` counts the final text-only turn. Agent-loop's worked example counts "four turns: three with tool calls, one final text-only response", which suggests it does. **Exact definition of `num_turns`: not documented.**

**F10. Per-turn figures.** Each assistant message carries `usage` and a message `id`. Parallel tool calls share an id and must be counted once (**A**: cost-tracking, python `AssistantMessage.usage`/`message_id`).
- Per-step `output_tokens` is a placeholder taken at `message_start`. Real output tokens are only in the result's `usage`/`modelUsage`, or in the `message_delta` partial events. **B** (cost-tracking).
- Per-step `usage` also exists on `stream-json` only; `json` gives the final result only. **Estimate, C.**
- Per-step cost: **not documented** (no per-step cost field is described).

**F11. Several user turns in one run.** With streaming input (`--input-format stream-json`), each user turn emits its own result. `usage` covers that turn's main loop. `total_cost_usd` and `modelUsage` are running totals, and `/clear` resets them. **A** (cost-tracking, python, changelog 0.3.223).

**F12. Resumed sessions.** With `--continue` or `--resume`, the result reports the whole conversation's total, including earlier runs (v2.1.277 and later). **A** (headless, cost-tracking, changelog 0.3.277).

**F13. Ending on the turn limit.** `--max-turns` "Exits with an error when the limit is reached" (cli-reference). The result has subtype `error_max_turns` with no `result` text, but still carries cost, usage and `num_turns` (agent-loop; python lists the subtype). `errors` holds the max-turns message and `terminal_reason` is `"max_turns"` (python).
- Subtype and figures: **A** (agent-loop, python).
- `terminal_reason` value: **B** (python).
- The CLI exiting non-zero: **A** (cli-reference, agent-loop).

**F14. Ending on the budget limit.** `--max-budget-usd` ends with `error_max_budget_usd`. In that result, `usage` leaves out the response that crossed the budget, while `total_cost_usd` and `modelUsage` include it.
- Subtype: **A** (agent-loop, python, cli-reference flag).
- What `usage` leaves out: **B** (cost-tracking).

**F15. Crashes, timeouts and SIGTERM.**
- **Crash.** The result is `error_during_execution`; its cost fields may be zero and `stop_reason` is null. **A** (cost-tracking, agent-loop).
- **API errors.** `terminal_reason` takes the value `api_error`. **A** (python, changelog 0.3.204).
- **SIGTERM.** Exit code 143; "records no result" for the turn in progress. **B** (headless).
- **Timeouts.** No page documents a whole-session timeout for `-p`. What exists:
  - a per-request `API_TIMEOUT_MS`, default 10 minutes (errors page, **B**);
  - a 10-minute idle ceiling while waiting for background subagents, after which Claude Code "drops its partial result" (headless, **B**).

  **How figures are reported when a session ends on a timeout: not documented.**

**F16. Ending on a usage limit.** **Not documented** for the result message. What is documented:
- `stream-json` emits `system/api_retry` events whose `error` can be `rate_limit` (headless, **B**).
- The SDK has a rate-limit event with `status`, `resets_at`, `rate_limit_type` and `utilization` (python; the event is also named in changelog 0.3.260). **A that it exists in the SDK. Estimate, C, that it appears in CLI `stream-json`.**
- Plan-limit messages ("You've hit your session limit · resets …") are on the errors page (**B**, extract). That page does not say how they appear in `-p` output.

**F17. Context fill level.** Not in the result message.
- The SDK can get it through `get_context_usage()` / `getContextUsage()`, which returns `totalTokens`, `maxTokens`, `percentage` and categories (python, changelog 0.3.257). **A for the SDK.**
- A `/context` result carries a structured `context_usage` (changelog 0.3.232, **B**).
- Whether a plain `claude -p "/context"` works: **not documented**. The headless page's list of commands that work in `-p` does not include it.
- When compaction happens, a `compact_boundary` system message is emitted (agent-loop, **B**).

**F18. `/usage` in headless mode.** A headless `/usage` result has a `usage_report` field (session totals and plan usage rows) on the assistant message. **B** (TS SDK changelog 0.3.273 only).

**F19. `--agent`.**
- `--agent <name>` makes the main thread take that agent's tool restrictions, model and system prompt. **A** (sub-agents, cli-reference).
- **Any difference in usage reporting, output format or turn counting under `--agent`: not documented.**
- Whether the agent's `maxTurns` frontmatter applies when it runs as the main thread: **not documented** (the frontmatter field is described for subagents).

**F20. OpenTelemetry (a second reporting route).**
- Metrics: `claude_code.token.usage`, `claude_code.cost.usage`, `claude_code.active_time.total`.
- A per-request `api_request` event carries input, output and cache tokens, `cost_usd` ("Estimated cost in USD") and `duration_ms`.
- The page names "Agent SDK and `-p` sessions".
- The `agent.name` attribute is "absent when the request was not issued by a named subagent type". Whether that covers an `--agent` main thread is **not documented**.

**B** (monitoring-usage, one page, read as an extract).

## Proposed library entries (forms for the Source checker)

| id (proposed) | form | title | grade | shelf life | sources |
|---|---|---|---|---|---|
| LIB-F-j | fact | `claude -p` output formats; only json/stream-json carry the result message with cost, usage, num_turns, durations | A (B for the CLI wording) | 3 months | headless; cli-reference; agent-sdk/python; agent-sdk/agent-loop |
| LIB-F-k | fact | `usage` = main loop only; `modelUsage`/`total_cost_usd` include subagents; all cost fields are estimates | A | 6 months | cost-tracking; python; agent-loop; TS SDK CHANGELOG 0.3.223 |
| LIB-F-l | fact | Error results (max turns, budget, crash) still carry figures, with documented gaps (budget `usage`, zeroed crash totals, SIGTERM leaves no result) | A/B mixed | 3 months | agent-loop; cost-tracking; python; headless; cli-reference |
| LIB-F-m | fact | Per-step usage on assistant messages (stream-json); per-step `output_tokens` is a placeholder | A/B | 3 months | cost-tracking; python |
| LIB-F-n | fact | Context: `modelUsage.contextWindow` (single page); fill level only via SDK `getContextUsage`/`/context`; nothing documented for `--agent` | B | 3 months | python; TS SDK CHANGELOG 0.3.232/0.3.257; sub-agents |

The shelf lives are short because the pages cite releases up to v2.1.287, and fields keep changing release by release.

## Sources
- [Run Claude Code programmatically (headless)](https://code.claude.com/docs/en/headless)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking)
- [How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop)
- [Agent SDK reference – Python](https://code.claude.com/docs/en/agent-sdk/python)
- [Agent SDK reference – TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript) (too long to read in full; not relied on)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Error reference](https://code.claude.com/docs/en/errors)
- [Commands](https://code.claude.com/docs/en/commands)
- [Monitoring usage](https://code.claude.com/docs/en/monitoring-usage)
- [Claude Code changelog](https://code.claude.com/docs/en/changelog)
- [claude-agent-sdk-typescript CHANGELOG](https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md)
- Not used as sources, leads only: [GitHub issue #83239](https://github.com/anthropics/claude-code/issues/83239) (a user report)

---

## Six-part contract

1. **What I changed:** Nothing on disk; I have no write tool. The memo above is my output, for the Orchestrator to record in `research/` and for the Source checker.
2. **Why:** The research question in `research/Q-009.md` asks for a graded memo at depth 3, from public Anthropic documentation only.
3. **What I verified:**
   - I read `research/Q-009.md` and the library entries sharing its topics (LIB-F-e, LIB-F-g).
   - I fetched 12 Anthropic pages with the web fetch tool and ran 3 web searches.
   - I found one false extract from the fetch tool (the TypeScript `SDKResultMessage`) and dropped it.
   - I did not run the CLI, did not inspect the environment, and did not open the `.env` files in the folder.
4. **What is undone:**
   - I could not read the full TypeScript reference; its `SDKResultMessage` and `ModelUsage` sections are unchecked.
   - No second page was found for `contextWindow` or `duration_ms`.
   - Most pages were read as model extracts, not full text.
5. **Needed outside my lane:**
   - The Source checker should read full page text, especially of the TypeScript reference and the errors and monitoring-usage pages.
   - Some answers can only come from testing, which is outside this question's rules: behaviour on timeouts and usage limits, `/context` under `-p`, and reporting under `--agent`. Whether to test is the owner's call.
6. **Open questions** (Q-009a and Q-009b are new):
   - Q-009a: Does `num_turns` count the final text-only turn? (Not documented.)
   - Q-009b: GitHub issue #83239, a user report and not a source, claims that `total_cost_usd` is cumulative under `stream-json` but per-call under `json`. The docs don't settle this, so it needs a check.
   - What does the result look like when a `-p` session hits a plan usage limit or a timeout?
   - Do `--agent` sessions differ in their figures, or carry an `agent.name` in OpenTelemetry?
