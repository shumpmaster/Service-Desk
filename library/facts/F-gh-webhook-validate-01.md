---
id: F-gh-webhook-validate-01
form: fact
claim: "Webhook signature is sent in X-Hub-Signature-256, is an HMAC hex digest that always starts with sha256=; never compare with a plain == operator, use a constant-time comparison."
grade: B
checked_on: 2026-11-12
shelf_life: 12 months
topics: [github, webhooks, security]
sources:
  - https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Single page."
---
