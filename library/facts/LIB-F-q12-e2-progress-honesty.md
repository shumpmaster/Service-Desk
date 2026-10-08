---
id: LIB-F-q12-e2-progress-honesty
form: fact
supersedes: LIB-F-q12-e
title: Uneven or stalled percent-done progress harms the user; stationary indicator reads as stalled
topics: [design, dashboards]
grade: B (shared point corroborated by two authors; each Apple sentence alone is a guideline, A)
checked_on: 2026-10-08
shelf_life: 24 months
opened_by: source-checker (Q-012), NN/g page opened by fetch (exact sentence returned); Apple page via HIG JSON endpoint in the earlier round (Q-012-source-check.md)
memo: research/Q-012-memo.md (2.1-2.4, 2.6)
sources:
  - https://developer.apple.com/design/human-interface-guidelines/progress-indicators
  - https://www.nngroup.com/articles/progress-indicators/
---
- NN/g (Sherwin, 2014-10-26): "changes in speed will be noticed and will impact user satisfaction: if the progress moves quickly only to hang on the last percentage remaining, the user will become frustrated and the benefits of showing progress will be negated." Percent-done indicators "should be used for longer processes that take 10 or more seconds".
- Apple HIG: "Showing 90 percent completion in five seconds and the last 10 percent in 5 minutes ... can even feel deceptive." Determinate is "for a task with a well-defined duration"; indeterminate "for unquantifiable tasks". "People tend to associate a stationary indicator with a stalled process or a frozen app."
- Corroborated point: a percent-done indicator that advances unevenly or hangs near the end harms the user. Apple's example (last 10 percent taking minutes) and Sherwin's (hang on the last percentage) are close but not identical; only the shared point is graded B.
- Apple "indeterminate" quotes were confirmed in the earlier round, not re-opened in this one.
