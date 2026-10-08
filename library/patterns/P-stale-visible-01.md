---
id: P-stale-visible-01
form: pattern
claim: "Apple Widgets: if people may check more often than the data updates, show text saying when it was last updated, and show content quickly without hiding stale data behind placeholder content. Apple Live Activities: if the underlying status is unchanged, keep the same display. NN/g (Kaplan 2021): state plainly when there is no data; 'Inaccurate system-status messages for empty states are particularly harmful.' Tension: Apple Loading says to show placeholders while content loads and to say clearly that it is loading; Apple gives both for different contexts and neither is chosen here. Not documented: making stale data visibly fade or degrade; unknown values in a gauge or number tile."
grade: B
topics: [design, dashboards]
checked_on: 2026-10-08
shelf_life: 12 months
opened_by: source-checker (Q-013, 2026-10-08); Apple JSON and NN/g HTML through a summarising fetch, not raw; the Widgets stale-data sentence was confirmed on a second, narrower fetch
memo: research/Q-013-memo.md
publisher_note: Apple rows are single authoritative source; empty-state row is single source (NN/g)
sources:
  - https://developer.apple.com/design/human-interface-guidelines/widgets
  - https://developer.apple.com/design/human-interface-guidelines/live-activities
  - https://developer.apple.com/design/human-interface-guidelines/loading
  - https://www.nngroup.com/articles/empty-state-interface-design/
---
