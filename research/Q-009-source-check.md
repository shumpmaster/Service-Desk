Verdict: FAIL

I opened the cited pages and both changelogs myself and ran nothing. I did not open `.env` or any other credential file. The memo's SDK-scoped facts hold and its CLI claims match the pages. The question's core is still not answered from documentation, though: no page says which usage figures `claude -p` reports beyond a few cost fields. An unverifiable claim is a FAIL, so the memo stays a FAIL. The Researcher's own notes at `research/Q-009-memo.md` lines 21 and 34 say the same.

## Confirmed against the pages

- **Formats, two pages (A).** The cli-reference `--output-format` row lists `text`, `json` and `stream-json`. The headless page lists the same at lines 138–142, with `text` as the default.
- **Cost fields in `json`, headless only (B).** Line 112 names `total_cost_usd` and a per-model cost breakdown. It also says "Both figures are client-side estimates". Line 150 says `--json-schema` adds usage and session ID, and line 185 describes the final stream-json `result` line as carrying "cost, and session metadata".
- **Cost is an estimate, two pages (A).** headless line 112 and cost-tracking line 14. The 1.1× multiplier is at cost-tracking line 20.
- **Usage scope, two pages.** cost-tracking line 94 says `usage` is "Excluded. Counts only the top-level agent loop". SDK changelog 0.3.223 (line 423) says `usage` is main-loop-only and per-turn, and `modelUsage` is cumulative. This supports `LIB-F-k`. The cost-tracking "per-turn" wording at line 64 is about turns in streaming input mode, as the memo says at S3.
- **Turn limit (B).** cli-reference `--max-turns`: "Exits with an error when the limit is reached".
- **SIGTERM (B).** headless line 85: exit code 143, "records no result for it".
- **Background wait (B).** headless line 79: 10-minute idle ceiling, then it "drops its partial result".
- **`API_TIMEOUT_MS` (B).** errors.md line 429: default 600000.
- **Crash (A).** cost-tracking line 327: `error_during_execution`, with `usage`, `total_cost_usd` and `modelUsage` possibly zeroed.
- **`contextWindow` (A, SDK scope).** Python line 1677 and TypeScript line 4850.
- **`duration_ms` (A, SDK scope).** TypeScript line 1522 and the Python reference.
- **`--agent` (A).** The cli-reference row reads "Specify an agent for the current session". Nothing there says usage reporting differs.
- **Usage-limit event (B).** SDK changelog 0.3.280 (line 90): a usage-limit wait emits `rate_limit_event` (`rejected`, `resetsAt`).

## Why it fails

- **`-p` field list not documented.** I searched the full Claude Code CHANGELOG (904 KB raw file, the check the memo handed to me at part 5). `num_turns` and `duration_api_ms` do not appear in it. `duration_ms` appears once, line 4931, and is about hook inputs, not `-p` results. headless and cli-reference give no such list either.
- **Link from `-p` to SDK result fields is an estimate.** The memo calls it E1 (grade C) and rightly keeps it out of the library. That leaves turns, duration, token fields, context size and endings unconfirmed for `-p`.
- **Question parts with no documentation.** How `-p` reports a usage limit or a whole-session timeout, and whether `--agent` changes anything.

## Library entries

- **Already filed, still correct.** `LIB-F-j` (formats; grade A for formats, B for fields), `LIB-F-n` (SDK `contextWindow` and `getContextUsage`, grade A) and `LIB-F-k` (usage scope and cost estimates, grade A). Each is in `library/facts/`. I changed nothing.
- **Left out, so no new entries.**
  - `LIB-F-l-A`: the entry is SDK-only, and it needs checking per source (the `error_max_*` subtypes, `terminal_reason` and changelog 0.3.204) before filing. I have not done that.
  - `LIB-F-l-B`: it mixes B-only facts and is not ready.
  - `LIB-F-m`: single page (cost-tracking), grade B.
  - `LIB-F-j2`: withdrawn by the memo as an estimate.

## Defects in the memo

- **Memo line 1.** It is stray text before the heading ("I've finished the search…").
- **Memo line 4 vs the check file.** The memo cites "`research/Q-009-source-check.md`" as a verdict-FAIL document. It also relies on that file's claim that the checker read the TypeScript `SDKResultMessage` and `ModelUsage` sections. I verified both myself (lines 1522 and 4850), so the grades stand.
- **Part 4 of the contract.** It lists the full Claude Code CHANGELOG as unread. I have now read it, and it adds nothing on `-p` fields.

## Open questions

- Does any Anthropic page list the `-p` JSON result fields (Q-009c)? Without one the decision (what the Orchestrator can record per session) rests on inference.
- What does `num_turns` count (Q-009a)?
- Is `total_cost_usd` cumulative under `json` as it is under `stream-json` (Q-009b)?
- How does `-p` report a usage-limit ending or a whole-session timeout?
- Does `--agent` change any figure?
- What do the Python `origin` and `deferred_tool_use` fields mean? I did not check them.

Nothing was committed. The working directory is not a git repository.
