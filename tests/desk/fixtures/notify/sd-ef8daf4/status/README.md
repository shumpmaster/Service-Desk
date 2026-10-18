# Status files (S-012)

One `<item>.toml` per work item, written only by the Orchestrator. `plan.json` is the current run's
plan for the session runner; `processed.json` records inputs already applied, so nothing is done twice.

A research item's status file carries `milestone`, copied from its request; each dispatch-log line
routed for a project item carries the project's `phase` and that phase's `iteration` (S-023).

At a phase gate the status carries three more fields (S-024):
- `next_gate`: the gate the item waits on, `dor`, `criteria` or `launch`, held only while its role is
  `critic-gate`. It is set when the item reaches the gate and cleared when the gate's card is raised.
- `gate_n`: the case's number at that gate, a whole number of at least 1. It is 1 the first time the item
  reaches the gate, then one more after a hold or on a later arrival after a recycle. It stays when the
  card is raised.
- `gate_recommendation`: the Critic's recommendation line from its gate view, at most 500 characters,
  held only while the role is `critic-gate`. The card quotes it. It is cleared when the item reaches a
  gate and when the owner's answer on the gate card is applied.
