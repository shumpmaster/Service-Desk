---
id: LIB-F-q12-e
form: fact
title: Misleading or stuck progress feels deceptive; stationary indicator reads as stalled
topics: [design, dashboards]
grade: B (honesty point corroborated by two authors; stationary-indicator point is one guideline)
checked_on: 2026-10-08
shelf_life: 24 months
opened_by: source-checker (Q-012), Apple via HIG JSON endpoint, NN/g page, both via fetch extract
memo: research/Q-012-memo.md (2.1-2.4)
sources:
  - https://developer.apple.com/design/human-interface-guidelines/progress-indicators
  - https://www.nngroup.com/articles/progress-indicators/
---
- Apple: determinate indicator is "for a task with a well-defined duration"; "Showing 90 percent completion in five seconds and the last 10 percent in 5 minutes can make people wonder if your app is still working and can even feel deceptive." "People tend to associate a stationary indicator with a stalled process or a frozen app."
- NN/g (Sherwin, 2014-10-26): "if the progress moves quickly only to hang on the last percentage remaining, the user will become frustrated"; percent-done "for delays of 10 seconds or more".
Not confirmed and left out: the memo's "negated" clause and its exact "indeterminate" quotes (not returned by the fetch).
