# Q-026 stop-1 — the Chief of Staff's notes

Recommendation: `re-specify`, once you have answered questions/P-005-spec-sources.md and, under A or B, once the new line is merged into the source rule. Not `drop`.

Why: Q-026 asks how events can be classified (a closed set, open labels, free text, a mix, or none). Its source checks filed six entries over three rounds and held five back (research/Q-026-source-check.md on item/Q-026). Triage found two causes (triage/Q-026.md on item/Q-026): claims that need new sources, which the Researcher can find (three single-source entries; a pattern naming incident.io and Linear with no source for either), and a gap in the source rule, which covers vendor product behaviour but not how a specification's own text counts (governance/standards/sources.md). The checker holds `F-otel-event-name-01` until you rule; each part of the filed `F-enum-escape-values-01` (one from OCSF, one from Google) rests on reading one publisher's two pages as two sources.
- `re-specify` sends the memo back to the Researcher with rounds reset, to find the new sources; under A or B it does so with a rule the checker can apply, once that rule is in governance/standards/sources.md, since the checker reads that file and not decisions/ (governance/PACKS.toml).
- `confirm` sends the same memo to the same checker unchanged, so it would still fail on the four entries that need new sources.
- `drop` would close the item, and a closed item never merges (governance/checks/orchestrator_git.py, `ready_items`), so the six filed entries would stay off the main branch.

Not answered by proxy: the next step turns on the source rule, which L-0047 leaves to you, and the rule itself says anything wider needs its own ruling (governance/standards/sources.md). `re-specify` is logged as a strike on the dispatch line.
