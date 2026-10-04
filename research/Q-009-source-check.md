Verdict: FAIL

The memo's central question is still unanswered from documentation. It asks which usage figures `claude -p` reports, and no CLI page lists the `-p` result fields beyond a few cost fields. The memo now says this itself, so its SDK-scoped facts hold. The CLI link stays an estimate, and an unverifiable claim is a FAIL. I opened the cited pages as full text and ran nothing. I did not open `.env` or any credential file.

## Filed
- **`library/facts/LIB-F-j-claude-p-output-formats.md`**, grade A, 3-month shelf life, formats only.
  - `text` (the default), `json` and `stream-json` are on cli-reference (`--output-format` row) and headless ("Get structured output").
  - Headless alone says json carries `total_cost_usd` and a per-model breakdown, and that the last stream-json line is a `result` message with cost. That part is single-page (B), and the entry says so.
- **`library/facts/LIB-F-n-modelusage-contextwindow-sdk.md`**, grade A, 3-month shelf life, SDK scope only.
  - `contextWindow` is in the Python reference (line 1677) and the TypeScript reference (`ModelUsage`, line 4850).
  - `get_context_usage()` is in Python (line 470) and `getContextUsage()` in TypeScript (line 630).
  - The memo graded these B because it could not read the TypeScript page. They are A at SDK scope.
- **`LIB-F-k`**, filed in the earlier round, still holds. The raw changelog file (the full text, not a summary) confirms 0.3.223, line 424: "`usage` is main-loop-only and per-turn; `modelUsage` is cumulative". Cost-tracking and headless state the rest.

## Memo claims confirmed
- **Client-side estimates.** headless "Pipe data" paragraph; cost-tracking Warning block.
- **1.1× multiplier.** cost-tracking Warning; changelog line 337.
- **Resumed totals.** headless; cost-tracking "Accumulate costs"; changelog line 110 (0.3.277).
- **Turn limit.** cli-reference `--max-turns`: "Exits with an error when the limit is reached".
- **SIGTERM.** headless: exit code 143, "records no result for it".
- **Background wait.** headless: 10-minute ceiling.
- **`API_TIMEOUT_MS`.** errors.md line 429: default 600000.
- **Result subtypes.** agent-loop lines 201 and 320–321; Python line 1642.
- **Crash.** agent-loop line 329; cost-tracking "Recover totals".
- **`terminal_reason` and API error.** Python lines 1650 and 1995.
- **`thinkingTokens`.** Python line 1675; TypeScript line 4858; changelog line 246 (0.3.257).
- **`--agent`.** cli-reference row; sub-agents line 851. Neither page says usage reporting differs.
- **OpenTelemetry.** monitoring-usage lines 604–605 and 663.
- **0.3.280 usage-limit event.** changelog line 91. It is single-page (B), as the memo says.
- **Bonus.** `SDKResultMessage` in TypeScript has `duration_ms` and `num_turns` (lines 1522–1526). That makes `duration_ms` A at SDK scope, where the memo graded it B.

## Not filed
- **LIB-F-j2 (SDK result is probably the `-p` result):** an inference (C), so it does not go in the library.
- **LIB-F-l (how a run ends):** the memo's wording mixes A and B facts and several are single-page: API-error `success`, the budget-crossing `usage` gap and `budget_exhausted`. The A parts, subtypes and crash zeroing, are SDK-only. I held it for the Researcher to split by grade.
- **LIB-F-m (per-step `output_tokens` placeholder):** cost-tracking only, so single-page.
- **The `-p` result field list, the `-p` ending shape and `--agent` behaviour:** not documented. This is the cause of the FAIL.

## Memo defects
- Memo F10 says `duration_ms` has no second page. TypeScript line 1522 is one.
- Memo F13 and F19 grade `contextWindow` and `get_context_usage()` as B. Both are on two pages.
- Memo F12 and the short answer attribute the "per-turn" wording to changelog 0.3.223. That is right, but `usage` being per-turn has no second page.
- The changelog extracts returned by the fetch tool omitted the 0.3.223, 0.3.277 and 0.3.280 lines the memo cites. The raw file has them. Memo "What I verified" overstates the extract route.

## Open questions
- Does any Anthropic page list the `-p` JSON result fields (Q-009c)? Without one, E1 stays an estimate and the decision (what the Orchestrator can record per session) rests on inference.
- What does `num_turns` count (Q-009a)?
- Is `total_cost_usd` cumulative under `json` the same way as under `stream-json` (Q-009b)?
- Does `-p` report anything on a usage limit or whole-session timeout? No page was found.
- Do `--agent` sessions differ in their figures, or in `agent.name` in OpenTelemetry? Not documented.
- Python `ResultMessage` fields I did not individually check: `origin`, `deferred_tool_use`.

Nothing was committed. The working directory is not a git repository.
