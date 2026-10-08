# EXP-003 result — session usage fields

registration: experiments/EXP-003-o6-session-usage-fields.md   spec: S-001 (J10, AC23) and the
model's D7.1   open item: O6
run: 2026-10-08, by the Chief of Staff (the registered runner), at M2's start
recorded by: the Builder, from the Chief of Staff's hand-over (its summary, and the two runs'
stream-json output); the Builder ran no session

## How it was run

- The session runner's form: `claude -p … --output-format stream-json --verbose`, with the agent
  tool at version 2.1.294. **`--verbose` was required:** stream-json in print mode needs it (as the
  method says to record).
- **Run 1:** a trivial task, `--max-turns 2`. 1 turn, `duration_ms` 3392. Exit 0.
- **Run 2:** create and read three files, `--max-turns 10 --allowedTools Write,Read`. 7 turns,
  `duration_ms` 18392. Exit 0.
- **Redaction:** neither output holds a secret or token (searched for `sk-ant`, `ghp_`,
  `github_pat_` and `Bearer`: none). Below, the model names that key `modelUsage` are shown as
  `<model>`, and only numeric fields are quoted.
- **Message types seen:** `system/init`, `autocompact_state`, `active_goal`, `assistant` (1 in
  run 1; 7 stream lines carrying 5 distinct message ids in run 2), `user` (run 2), `rate_limit_event`,
  `system/post_turn_summary`, `system/task_summary` (run 2), and `result/success`.

## Measure: each target figure, present or absent, with its path

| Figure | Run 1 | Run 2 | Path |
|---|---|---|---|
| Input tokens (session total) | present | present | `result`: `usage.input_tokens` |
| Output tokens (session total) | present | present | `result`: `usage.output_tokens` |
| Cache-read tokens (session total) | present | present | `result`: `usage.cache_read_input_tokens` |
| Cache-write tokens (session total) | present | present | `result`: `usage.cache_creation_input_tokens` (split by lifetime in `usage.cache_creation.ephemeral_1h_input_tokens` and `ephemeral_5m_input_tokens`) |
| Turns | present (1) | present (7) | `result`: `num_turns` |
| Duration | present | present | `result`: `duration_ms` (also `duration_api_ms`) |
| Context window size | present | present | `result`: `modelUsage.<model>.contextWindow` (1000000), per model used |
| Context peak | not reported directly | not reported directly | derivable: the largest, over distinct `assistant` message ids, of `message.usage.input_tokens + cache_read_input_tokens + cache_creation_input_tokens` (run 2: 36,494) |

Further figures found (not targets of the registration):

| Figure | Run 1 | Run 2 | Path |
|---|---|---|---|
| Per-turn usage | present | present | each `assistant` line's `message.usage` (the same four token kinds). One message can repeat over several stream lines with the same `message.id`, so each id counts once. |
| Auto-compact point | present | present | first stream line, `type: autocompact_state`: `value.effective_window` (980000) and `value.threshold` (784000) |
| Cost | present (an estimate) | present (an estimate) | `result`: `total_cost_usd`; per model `modelUsage.<model>.costUSD`. An estimate (LIB-F-g): recorded, never shown as a bill. |
| Rate-limit use | present | present | `rate_limit_event`: `rate_limit_info.unifiedWindows.five_hour.utilization` and `seven_day.utilization` |

Two cautions from the output:
- **Session totals are sums over turns,** not a context size: run 2's `usage.cache_read_input_tokens`
  is 168,160 while its largest single turn's context is 36,494. The context figure must come from
  the per-turn messages.
- **A helper model also appears in `modelUsage`,** with small counts (run 1: 1,174 input and 14
  output tokens). Usage is recorded per model, or for the session's main model only; D7.1 chooses.

## Redacted output: the numeric figures the targets rest on

Run 1 (`result`, then the one `assistant` message, then `autocompact_state`):

```
num_turns = 1                     duration_ms = 3392          duration_api_ms = 2496
usage.input_tokens = 2            usage.output_tokens = 4
usage.cache_read_input_tokens = 24341
usage.cache_creation_input_tokens = 10941
modelUsage.<main model>.contextWindow = 1000000   maxOutputTokens = 128000
modelUsage.<helper model>.inputTokens = 1174      outputTokens = 14   contextWindow = 1000000
assistant message.usage: input 2, output 4, cache read 24341, cache write 10941   (context 35,284)
autocompact_state: value.effective_window = 980000   value.threshold = 784000
```

Run 2:

```
num_turns = 7                     duration_ms = 18392         duration_api_ms = 18569
usage.input_tokens = 10           usage.output_tokens = 707
usage.cache_read_input_tokens = 168160
usage.cache_creation_input_tokens = 11120
modelUsage.<main model>.contextWindow = 1000000   maxOutputTokens = 128000
modelUsage.<helper model>.inputTokens = 1226      outputTokens = 297  contextWindow = 1000000
assistant message.usage, per distinct message id (input + cache read + cache write = context):
  2 + 25372 + 9962  = 35,336
  2 + 35334 + 242   = 35,578
  2 + 35576 + 242   = 35,820
  2 + 35818 + 242   = 36,062
  2 + 36060 + 432   = 36,494   ← the peak
autocompact_state: value.effective_window = 980000   value.threshold = 784000
```

The two runs agree on which figures are present, so J10 reads the same set from each.

## Against the deciding threshold

- **Found, by name:** the four token kinds, turns, duration and the context window size. Each is
  named with its path above, for D7.1's record format and S-001's J10 `usage` key.
- **Context peak: not reported, but derivable** from per-turn usage. So D7.1 records it as a derived
  figure, marked as such, rather than "not available"; the desk labels it "derived from per-turn
  usage" (AC23).
- **No paid route** was used or is needed.
- Until D7.1 lands and Service-Desk adopts it (D7.2), `status/outcomes.jsonl` carries no `usage`
  key, so the desk shows "not recorded" for every session (AC23). A figure D7.1 leaves out shows
  "not available".

## For the Definer (J10): names and additions to consider

J10's `usage` names are the record's, not the tool's. They map as follows; the desk is built
against J10's names, and these are open questions, not changes made here:

| J10 key | From the tool | Note |
|---|---|---|
| `input_tokens` | `usage.input_tokens` | |
| `output_tokens` | `usage.output_tokens` | |
| `cache_read_tokens` | `usage.cache_read_input_tokens` | J10 drops `_input_` |
| `cache_write_tokens` | `usage.cache_creation_input_tokens` | the tool says "creation", J10 "write" |
| `turns` | `num_turns` | |
| `context_peak_tokens` | derived, max over per-turn messages | a derived figure: should the record mark it (for example `context_peak_derived: true`)? |
| `context_window_tokens` | `modelUsage.<model>.contextWindow` | per model: which model's window? |

Not in J10 today, but found: `duration_ms` (the desk takes run time from the dispatch log, so it
isn't needed for AC22); the auto-compact threshold (`autocompact_state.value.threshold`), which
would let the desk show how near a session came to compaction (relevant to the owner's answer 5);
and the helper-model split.
