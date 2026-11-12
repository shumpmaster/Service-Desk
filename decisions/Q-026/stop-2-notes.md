# Q-026 stop-2 — the Chief of Staff's notes

Recommendation: left to the owner, not answered by proxy. The way on that is expected to pass is the owner's ruling on two gaps in the source rule, then `re-specify`; `re-specify` alone is expected to stop again.

Why: Q-026 asks how events can be classified. Since the owner's ruling on specification text (decisions/questions/P-005-spec-sources.md) and stop-1's `re-specify`, its three source checks filed nine entries, among them the OpenTelemetry finding that stop-1 held, and the third check holds back three (research/Q-026-source-check.md on item/Q-026):
- `F-linear-category-rules-01` and `F-incidentio-severity-permission-01`: each quote is on one vendor page only, and the source rule needs two pages for a vendor's own product behaviour (governance/standards/sources.md). The check asks the Researcher to find a second page for each or drop them.
- `F-linear-duplicate-status-01`: its quotes are confirmed, but Linear's pages disagree on the Duplicate status, and the source rule says neither whether a changelog counts as a page nor whether a dated newer reading may be filed against an older page. The check puts this entry to the owner, not to the Researcher: "Owner (Q-e, Q-f): please rule on both. The Duplicate entry depends on them."
Triage found the checker working as designed and two causes: entries resting on one page each, and those gaps in the source rule (Triage's return of the 17:53 UTC session, 2026-11-12, recorded on item/Q-026; it notes the earlier 07:36 return no longer describes the current check). It advises no further Researcher round "without a new source or a ruling", and only "if the owner wants the held entries"; it asks whether the owner wants them, or whether the memo should close on what is filed.

The words on the card:
- `re-specify` sends the memo back to the Researcher with rounds reset and the source check's reasons, the only feedback it sees besides its own memo (governance/PACKS.toml, `[roles.researcher]`). It may drop the two single-page entries, as the check asks. Nothing it receives asks it to drop the Duplicate entry, so it is likely to hold it and stop again on it, the repeat Triage warns against. A strike, the second on Q-026.
- `confirm` sends the same memo to the same checker unchanged, so it would fail on the same three entries.
- `drop` would close the item, and a closed item never merges (governance/checks/orchestrator_git.py, `ready_items`), so the nine filed entries would stay off the main branch. It is refused by proxy (governance/ROUTING.toml, `[proxy]`).

The rulings that would let this pass, each a one-line change to the source rule like the specification-text ruling (an R3 governance change the owner approves), then `re-specify`:
- For the Duplicate entry: does a vendor's dated changelog count as one of its pages (the checker's Q-f), and may a dated newer reading be filed with the older page's reading noted (Q-e)?
- For the two single-page entries, only if the owner wants them kept: may a single-page vendor fact be kept in the library on hold, not load-bearing (Q-g)? Otherwise the Researcher drops them.
Triage also asks whether a vendor's two pages count as two sources, for the filed `F-enum-escape-values-01`; that is settled: the entry rests on OCSF's and Google's specification text, which the owner's specification-text ruling covers, and that ruling left the entry standing.

Not answered by proxy: L-0049 allows reversible procedural answers, but here the only answer expected to pass turns on the source rule, which is the owner's, as at stop-1; and whether the held entries are wanted at all is a question Triage leaves to the owner.
