# EXP-003 — O6: which usage and context figures does an Orchestrator-run session report?

status: registered (not run)   spec: S-002 (proposed) and the model's D7.1 spec   open item: O6
registered: 2026-10-06 by definer
*Written without experiments/_REGISTRATION.md, which is not in this pack; restructure to it if it differs.*

## Question
When the Orchestrator runs a Claude Code session with `--output-format stream-json`, which of these
fields appear, under what names, and in which message: input tokens, output tokens, cache-read and
cache-write tokens, number of turns, duration, outcome, context-window size or fill?

## Why it bears load
D7.1 records them and D3.6 (S-002) shows them. Research Q-009 was dropped
(decisions/Q-009/stop-1.md), so nothing about the fields is in the library. Cost fields from the
Agent SDK are estimates (LIB-F-g, A); this experiment records fields only, not their accuracy.

## Expectation (stated before running)
Token counts by kind, turns and duration appear in the final result message; context-window fill
does not appear directly. This is a guess, not evidence.

## Method
- One session, started the way the Orchestrator starts sessions, on a trivial task in a scratch
  directory, with `--output-format stream-json` (add `--verbose` only if the command line requires
  it for stream-json, and record that it did).
- Save the full output. List every message type and every field name with a numeric value, and the
  message each appears in. Redact any secret or token before saving (PROJECT.md §5: no secret to a
  model or a file).
- Repeat once with a task long enough to take at least five turns, to see whether per-turn usage
  appears.

## Decision rule (fixed now)
- Each figure found → named in S-002's join sheet and D7.1's record format, with the field path.
- Each figure not found → shown as "not available" in D3.6, per the owner's fallback
  (decisions/questions/P-001-o6-fallback.md, option A). No paid route is used to get it.
- The output format differs between the two runs → both recorded; S-002 reads the union and treats
  a missing field as "not available".

## Runner, cost, result file
Runner: the Chief of Staff or the model's tools builder (outside the Definer's lane; the Definer
doesn't run sessions). Cost: two short sessions on the owner's subscription, $0 API spend.
Result: `experiments/EXP-003-result.md` (redacted output plus the field table).
