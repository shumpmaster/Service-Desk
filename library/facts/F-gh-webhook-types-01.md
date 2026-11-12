---
id: F-gh-webhook-types-01
form: fact
claim: "You cannot create webhooks for individual user accounts or for user-specific events (personal notifications, mentions); at most 20 webhooks per event type in a repository; each GitHub App has a single webhook that receives events from repositories or organizations the app has been granted access to; which events an App can select depends on its permissions; deployment_review and deployment_protection_rule are available to GitHub Apps only (each needs Deployments read)."
grade: B
checked_on: 2026-11-12
shelf_life: 12 months
topics: [github, webhooks]
sources:
  - https://docs.github.com/en/webhooks/types-of-webhooks
  - https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/using-webhooks-with-github-apps
  - https://docs.github.com/en/webhooks/webhook-events-and-payloads
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Same publisher, several pages; graded B as the memo graded it."
---
