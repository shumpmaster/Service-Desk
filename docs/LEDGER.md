# Ledger

*Append-only. Every ruling, predeclaration, reading, kill, incident and delegation is a new entry
at the bottom. A mistake is corrected by a new entry that says what was wrong, never by editing.
CI proves the old file is a byte-for-byte prefix of the new one and that IDs are unique.*

*Entries hold facts at the time of writing only. Whether an entry is still active is computed
into docs/DIGEST.md, never written back here. The title states the outcome. Write for a reader
who wasn't in the conversation: no "as discussed".*

*Fields: date · type (ruling | predeclaration | reading | kill | incident | postmortem |
delegation | defaulted | tier-change | rule-experiment | correction) · supersedes · scope ·
expires · asked · decision · licenses_next · options_considered · decided_by · proposed_by ·
reversibility.*

*Before your first commit, set L-0001's date to your start date.*

## L-0001 — Project founded under the AI Build Operating Model at tier T1
date: 2026-09-30
type: ruling
supersedes: []
scope: project
expires: never
asked: Stand the project up under a governed operating model from day one.
decision: Adopt the AI Build Operating Model at the version in governance/OPERATING_MODEL_VERSION, at tier T1. AGENTS.md is the charter.
licenses_next: Writing MISSION.md and SCOPE.md, then opening the first sprint.
decided_by: owner
proposed_by: orchestrator
reversibility: reversible

## L-0002 — The founding import is exempt from the range guard
date: 2026-09-30
type: ruling
supersedes: []
scope: project
expires: never
asked: The project was founded in one commit (c1c9a56) holding the whole v3 template, authored by the orchestrator, which touches every surface. Exempt it from the range guard?
decision: Exempt c1c9a56491d34565b931a6a8f6f41fab2caa855e (governance/SURFACES.md exempt block). It is the generated template, unchanged apart from the owner line, the founding date and the README title; the owner approves by merging the founding pull request.
holdouts: changed
licenses_next: The owner's GitHub setup (docs/SETUP.md), then the intent capture in docs/PROJECT.md.
decided_by: owner (merges the founding pull request)
proposed_by: orchestrator
reversibility: reversible
