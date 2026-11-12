---
id: P-repeat-on-change-01
form: pattern
claim: "Do not re-send an unchanged waiting item on a short timer; re-notify when its state changes, escalate once after a set timeout, and treat an item waiting very long as a problem to fix rather than to re-sound. Supports: Alertmanager suppresses repeats when nothing changed and defaults to 4h (F-alertmanager-grouping-01); PagerDuty escalates high urgency on timeout but never low urgency (F-pagerduty-urgency-01); stale-alarm practice (F-alarm-rate-01); repeats lower acceptance (F-alert-repeat-01); latching until acknowledged cut audible alarms 89% without missed events (F-alarm-latch-retune-01). The recommendation is an inference, untested for AI-agent oversight."
grade: B
topics: [notifications]
checked_on: 2026-11-12
shelf_life: 36 months
opened_by: source-checker (Q-024, 2026-11-12); built on the entries cited; each cited entry is filed or already in the library
memo: research/Q-024-memo.md
sources: [see the cited entries]
---
