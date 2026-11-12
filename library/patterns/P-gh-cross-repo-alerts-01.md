---
id: P-gh-cross-repo-alerts-01
form: pattern
claim: "For alerts from every repository: one receiver, the GitHub App's single webhook, which covers every repository the App is granted [F-gh-webhook-types-01], delivered to a Worker; backed by a conditional poll on a Worker cron [F-cf-cron-01; Pages has no cron], because GitHub does not redeliver failed webhooks automatically [F-Q004-1], deliveries can take minutes or be delayed [F-Q004-3a, F-Q004-4] and arrive out of order [F-Q004-12]; GitHub Mobile for GitHub-native events [F-gh-11]; per-repository Actions senders are weaker because schedules run at most every 5 minutes and can be delayed or dropped [F-gh-12, F-gh-12b]. Keeping the sender's keys in one place is the researcher's estimate, not a sourced fact."
grade: C
topics: [notifications, github, web-push]
checked_on: 2026-11-12
shelf_life: 6 months
opened_by: source-checker (Q-027, 2026-11-12); every cited entry read and found to state what the pattern uses it for
memo: research/Q-027-memo.md
rests_on: [F-gh-webhook-types-01, F-cf-cron-01, F-Q004-1, F-Q004-3a, F-Q004-4, F-Q004-12, F-gh-11, F-gh-12, F-gh-12b]
---
