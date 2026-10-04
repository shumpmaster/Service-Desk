I've finished the search and am writing up the revised memo now.

# Research memo: Q-009, how `claude -p` reports a session's usage (revision 3)

**Researcher memo, 2026-10-04. Depth 3. Topics: claude-code, usage, agents.** This replaces revision 2 and answers `research/Q-009-source-check.md` (verdict FAIL).

**Grades**
- **A, confirmed:** two different Anthropic pages say it. The SDK changelog counts as one page.
- **B, single page:** one page says it.
- **C, estimate:** my inference. It is never proposed as a library fact.
- **Not documented:** no page I read says it.

**Scope tags**
- **[CLI]:** a page says it about `claude -p`.
- **[SDK]:** a page says it about the Agent SDK's messages or types.

An [SDK] grade says nothing about `-p` output.

## The finding behind the FAIL

**No Anthropic page lists the fields of `claude -p --output-format json` or of the stream-json `result` line.** The question allows "not documented" as an answer, so that is my answer here. I don't infer a field list.

This round I looked in these places, and none of them has a field list:
- headless and cli-reference, both read in full
- cost-tracking, read in full
- the docs index (`llms.txt`)
- the GitHub Actions page
- the `claude-code-action` `action.yml` outputs. These give `execution_file` as "Path to the Claude Code execution output file", with no field list.
- the Claude Code CHANGELOG. The extract came back cut short, so this search is incomplete.
- two old headless URLs. Both redirect, and the chain ends at the SDK overview.

A web search did turn up field lists with `num_turns` and `duration_ms` in `-p` JSON. They came from third-party blogs and a user bug report (anthropics/claude-code issue #38706). Neither is Anthropic documentation, so I don't use them.

The decision this serves is which figures the Orchestrator can record per session. From documentation alone, only the CLI-documented items (F2) are known to appear in `-p` output. Everything else depends on estimate E1, which stays C.

## Short answer

- **Formats [CLI, A].** `text` (the default), `json` and `stream-json`.
- **Figures CLI pages say `-p` output carries [CLI, B, headless only].**
  - `json` carries `total_cost_usd`, a per-model cost breakdown, `session_id` and `result`.
  - With `--json-schema` it also carries "usage" and `structured_output`.
  - The last stream-json line is a `result` message with "cost, and session metadata". Under `--permission-prompts none` it also carries `permission_denials`.
- **Not documented for `-p`:** turns, durations, the four token fields, `subtype`, `stop_reason`, `terminal_reason`, context-window size or fill level, and per-step figures. They are documented for SDK result messages ([SDK] facts below). That `-p` emits the same message is estimate E1 (C).
- **Cost is a client-side estimate [CLI and SDK, A].**
- **Turn limit, timeout, usage limit [CLI]:**
  - `--max-turns` "Exits with an error" (B).
  - SIGTERM exits with code 143 and records no result (B).
  - The background wait has a 10-minute ceiling and drops partial results (B).
  - How figures are reported on a usage limit or a whole-session timeout is not documented.
- **`--agent`:** no page describes any difference in usage reporting.

## Estimate (not proposed for the library)

**E1, C.** The `-p` json and stream-json result is probably the SDK result message. The evidence:
- cli-reference describes `claude -p` as "Query via SDK" and points to the Agent SDK docs "for programmatic usage details".
- headless says "This page covers using the Agent SDK via the CLI (`claude -p`)".
- SDK changelog 0.3.223 talks about "`usage` vs `modelUsage` on stream-json results".
- The Python reference says `terminal_reason` is `None` "on CLI versions that predate the field".

## Facts: CLI pages

- **F1. Formats.** `--output-format` takes `text`, `json` or `stream-json`, in print mode. **A** (cli-reference, headless).
- **F2. What each format carries.** These are the quotes in the short answer. **B** (headless).
  - That `text` carries no figures is an **estimate, C**.
- **F3. Cost is an estimate.**
  - headless says "Both figures are client-side estimates and can differ from your actual bill". The cost-tracking Warning block says the same. **A.**
  - A 1.1× multiplier applies when a response reports US-only inference. **A** (cost-tracking, changelog 0.3.239).
- **F4. Resumed runs.**
  - With `--continue` or `--resume`, "the run reports the conversation's whole total, earlier runs' spend included". **A** (headless; cost-tracking "Accumulate costs", which names `claude -p`; changelog 0.3.277).
  - `--max-budget-usd` counts subagent spend but not restored totals. **A** (cli-reference; cost-tracking "Track costs in streaming input mode" says the same of `maxBudgetUsd`, at SDK scope).
- **F5. Turn limit.** `--max-turns` will "Limit the number of agentic turns (print mode only). Exits with an error when the limit is reached." **B** (cli-reference).
- **F6. SIGTERM.** Exit code 143. Claude Code "records no result for it". **B** (headless).
- **F7. Background wait ceiling.**
  - The wait for background subagents ends after 10 minutes idle. Claude Code then "drops its partial result". The ceiling is set by `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`. **B** (headless).
  - On the SDK side, the result's `total_cost_usd`, `duration_api_ms` and `modelUsage` include work done during the wait. **B** (cost-tracking).
  - `API_TIMEOUT_MS` defaults to 600000. **B** (errors).
- **F8. Exit status.** The exit code is 0 on success and non-zero on failure. A failure inside the run is printed "as the result on stdout". **B** (headless).
- **F9. Retries.** stream-json emits `system/api_retry` events. Their `error` values include `rate_limit` and `billing_error`. **B** (headless).
- **F10. OpenTelemetry.** It provides `claude_code.token.usage`, `claude_code.cost.usage`, and an `api_request` event with tokens, `cost_usd` and `duration_ms`. **B** (monitoring-usage).
- **F11. `--agent`.** It will "Specify an agent for the current session". **A** (cli-reference, sub-agents). Any effect on figures is **not documented**.

## Facts: SDK pages (they apply to `-p` only through E1)

- **S1. Result message fields.**
  - `num_turns`, `total_cost_usd`, `usage`, `session_id`, `stop_reason`, `subtype`: **A** (python, agent-loop).
  - `duration_ms`: **A** (python; TypeScript `SDKResultMessage`, which the checker confirmed). *Raised from B.* What it measures is not documented.
  - `duration_api_ms`: **A** (python, cost-tracking).
- **S2. Token fields in `usage`.** `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`. **A** (cost-tracking, python).
- **S3. Scope of each figure.**
  - `usage` counts the main loop only. `total_cost_usd` and `modelUsage` include subagents. **A**, already filed as LIB-F-k.
  - `usage` is "per-turn", meaning one result per user turn in streaming input mode. **A** (cost-tracking "covers only that turn"; changelog 0.3.223). *Corrected: revision 2 rested this on 0.3.223 alone.*
  - That this per-turn scope holds for a single-prompt `-p` run is **not documented**.
- **S4. `modelUsage` entries.**
  - Token counts, `costUSD` and `costBasis`: **A**.
  - `thinkingTokens`: **A** (python, TypeScript, changelog 0.3.257).
  - `contextWindow`: **A** (python, TypeScript `ModelUsage`, which the checker confirmed). *Raised from B.*
  - `webSearchRequests` and `maxOutputTokens`: **B** (python).
- **S5. Context fill level.**
  - It is not in the result message.
  - `get_context_usage()` / `getContextUsage()` gives it. **A** (python; TypeScript, which I read this round: "computed with token-counting API requests that don't appear in the message stream"). *Raised from B.*
  - Whether `/context` works under `-p` is **not documented**.
- **S6. Endings, A only.**
  - `error_max_turns` and `error_max_budget_usd` still carry cost, usage and `num_turns` (agent-loop, python).
  - On a crash the subtype is `error_during_execution`, and cost fields may be zero (agent-loop, cost-tracking).
  - `terminal_reason` takes the values `max_turns` and `api_error` (python, changelog 0.3.204).
- **S7. Endings, B only.**
  - An API error is reported as subtype `success`, with the cause in `terminal_reason` (python).
  - `usage` leaves out the response that crossed the budget (cost-tracking).
  - `terminal_reason` can be `budget_exhausted` (changelog 0.3.204).
  - A rate-limit wait emits `rate_limit_event` (changelog 0.3.280).
- **S8. Per-step figures.**
  - Assistant messages carry `usage` and an id, and parallel tool calls share the id. **A** (cost-tracking, python, streaming-output).
  - Per-step `output_tokens` is a placeholder. **B** (cost-tracking).
  - Per-step cost is **not documented**.

## Proposed library entries

| id | form | content | grade | shelf life | sources |
|---|---|---|---|---|---|
| LIB-F-j (filed) | fact | No change. Add a note: "No Anthropic page lists `-p` result fields beyond those named in headless (checked 2026-10-04)" | A / B | 3 months | cli-reference; headless |
| LIB-F-l-A (split) | fact | SDK results that end on `error_max_turns` or `error_max_budget_usd` still carry cost, usage and `num_turns`. A crash (`error_during_execution`) may zero the cost fields. `terminal_reason` values include `max_turns` and `api_error`. [SDK] scope | A | 3 months | agent-loop; python; cost-tracking; changelog 0.3.204 |
| LIB-F-l-B (split) | fact | In the SDK, an API error is subtype `success` plus `terminal_reason`; `usage` omits the response that crossed the budget; a `budget_exhausted` terminal reason exists. On the CLI side, `--max-turns` exits with an error and SIGTERM exits 143 with no result | B, single page each | 3 months | python; cost-tracking; changelog 0.3.204; cli-reference; headless |
| LIB-F-m | fact | Per-step `output_tokens` on SDK assistant messages is a placeholder | B | 3 months | cost-tracking |

LIB-F-j2 (E1) is withdrawn, because it is an estimate. The checker already filed LIB-F-n.

## Sources
- Anthropic documentation:
  - [headless](https://code.claude.com/docs/en/headless)
  - [cli-reference](https://code.claude.com/docs/en/cli-reference)
  - [cost-tracking](https://code.claude.com/docs/en/agent-sdk/cost-tracking)
  - [TypeScript reference](https://code.claude.com/docs/en/agent-sdk/typescript)
  - [Python reference](https://code.claude.com/docs/en/agent-sdk/python)
  - [agent-loop](https://code.claude.com/docs/en/agent-sdk/agent-loop)
  - [github-actions](https://code.claude.com/docs/en/github-actions)
  - [llms.txt](https://code.claude.com/docs/llms.txt)
- Anthropic repositories:
  - [claude-code-action action.yml](https://raw.githubusercontent.com/anthropics/claude-code-action/main/action.yml)
  - [Claude Code CHANGELOG](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md), extract only
  - [SDK changelog](https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md)
- Seen in search but not used, because they are not Anthropic documentation:
  - [issue #38706](https://github.com/anthropics/claude-code/issues/38706)
  - [dev.to](https://dev.to/panthpatel/402-on-one-ticket-cost-per-turn-in-headless-claude-code-4khe)
  - [swareco](https://www.swareco.com/blog/claude-code-headless-mode)
  - [takopi](https://takopi.dev/reference/runners/claude/stream-json-cheatsheet/)

---

## Six-part contract

**1. What I changed**
- The memo now says outright that the `-p` result field list is not documented. It gives only the headless-documented items as `-p` figures.
- I withdrew LIB-F-j2, since an estimate doesn't go in the library.
- I split LIB-F-l into an A entry and a B entry.
- I raised `duration_ms`, `contextWindow` and `get_context_usage` to A.
- I fixed the "per-turn" sourcing. It is now A at streaming-input scope, and its single-prompt meaning is not documented.
- I added the background-wait figures and the second page for `--max-budget-usd`.
- I dropped my earlier claim that the changelog extracts were verbatim.

**2. Why**
- The source check failed on an unverifiable CLI link and on grading defects. The question allows "not documented", so that is now my answer for the field list. It is no longer a claim in the memo.

**3. What I verified** (web fetch and web search only; I ran nothing)
- headless, cli-reference and cost-tracking, read in full. None lists the `-p` result fields.
- TypeScript: `getContextUsage()` confirmed. `SDKResultMessage` and `ModelUsage` were cut off again, so for those I rely on the checker's full-text read.
- `llms.txt`, the github-actions page and `action.yml`: no field list.
- The old headless URLs redirect, and the chain ends at the SDK overview.
- Two web searches found only third-party sources.
- I opened no `.env` or credential file.

**4. What is undone**
- I could not read the full Claude Code CHANGELOG. The extract was cut short, and a fix that adds `-p` fields might be in it.
- I have not personally read the TypeScript `SDKResultMessage` and `ModelUsage` sections.

**5. What is needed outside my lane**
- If the owner needs a `-p` field list as fact, documentation cannot supply it today. It would take a test run, which the question rules out, or a question to Anthropic. That is a decision card for the Chief of Staff to put to the owner.
- The Source checker should read the full Claude Code CHANGELOG raw file and search it for `num_turns` and `duration`.

**6. Open questions**
- **Q-009a:** what does `num_turns` count?
- **Q-009b:** is `total_cost_usd` cumulative under `json` the same way as under stream-json?
- **Q-009c:** does any Anthropic page list the `-p` json fields? None was found in this round.
- How does a `-p` run that ends on a usage limit or a timeout report its figures?
- Do `--agent` sessions differ in their figures, or in OpenTelemetry's `agent.name`?
- What do the Python `origin` and `deferred_tool_use` fields mean?
