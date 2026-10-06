# Experiment registration — EXP-003

*Pre-registered before any run (D-047). Frozen once the line below is set.*

spec: S-001 (J10, AC23) and the model's D7.1 spec   open item: O6   milestone: M2, at its start
runner: the Chief of Staff, or the model's tools builder; it is outside the Definer's and the
Builder's lanes   result: handed to the Builder, who records it at
docs/handover/experiments/EXP-003-result.md (redacted output plus the field table)
rulings: decisions/questions/P-001-o6-define.md (accepted open), P-001-o6-fallback.md (option A);
P-001-build-path.md question 5 (usage and context stay in the first version, at M2)

## Hypothesis
When a Claude Code session runs the way the Orchestrator runs sessions, with
`--output-format stream-json`, its final result message reports:
- input tokens, output tokens, cache-read tokens and cache-write tokens;
- the number of turns;
- the duration.

It does not report context-window fill or window size directly. This is a guess, not evidence.

Why it bears load:
- D7.1 records these figures, and S-001's AC23 shows them.
- Research Q-009 was dropped (decisions/Q-009/stop-1.md), so nothing about the fields is in the
  library.
- The Agent SDK's cost fields are estimates (LIB-F-g, A). This experiment records field names and
  presence only, not accuracy.

## Method
- **Run 1:** one session, started as the Orchestrator's session runner starts sessions (model
  S-014), on a trivial task in a scratch directory, with `--output-format stream-json`.
  - Add `--verbose` only if the command line requires it for stream-json, and record that it did.
- **Run 2:** one session with a task long enough to take at least five turns, to see whether
  per-turn usage appears.
- **What is recorded:** the full output is saved. The run lists every message type, every field
  with a numeric value, its path, and the message it appears in.
- **Redaction:** any secret or token is redacted before saving (PROJECT.md §5).

## Measure
- For each target figure (the four token kinds, turns, duration, context peak, context window
  size): present or absent, with its field path, in run 1 and in run 2.

## Sample
Two sessions.

## Exclusions
- **A session that errors before producing a result message:** repeated once.

## Deciding threshold
- **A figure found:** named, with its field path, in D7.1's record format and in S-001's J10 `usage`
  key.
- **A figure not found:** shown as "not available" in AC23, per the owner's fallback
  (decisions/questions/P-001-o6-fallback.md, option A). No paid route is used to get it.
- **The two runs differ:** both are recorded, J10 reads the union, and a missing field is
  "not available".

## Holdout use
none

frozen: the last commit that changes this file on build/definer/S-001-rev, before any run (revised
after the Reviewer's round 1, with no run yet)
