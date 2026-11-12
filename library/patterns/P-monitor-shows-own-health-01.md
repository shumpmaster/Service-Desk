---
id: P-monitor-shows-own-health-01
form: pattern
claim: "A supervision display or alert channel should show its own freshness and failure, and signals that need action should travel on a channel designed and treated as an alert. Supports: Knight Capital's PMON gave no automated alerts and its delayed reports were inaccurate, and 97 emails 'not designed … to be system alerts' went unreviewed (F-ignored-channel-knight-01); show when data was last updated and do not hide stale data (P-stale-visible-01); indications that showed the command sent rather than the actual state (F-misleading-display-cases-01). Inference across cases, untested for AI-agent oversight."
grade: B
topics: [monitoring, dashboards]
checked_on: 2026-11-12
shelf_life: 36 months
opened_by: source-checker (Q-024, 2026-11-12); checked against the three filed entries' claims, not re-opened at source this round
memo: research/Q-024-memo.md
sources: [F-ignored-channel-knight-01, P-stale-visible-01, F-misleading-display-cases-01]
note: Revision 2 of the memo removed the 2003 blackout clause. P-stale-visible-01 was itself read through a summarising fetch (Q-013).
---
