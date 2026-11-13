---
id: F-gh-actions-price-01
form: fact
claim: "Linux 2-core (x64) is $0.006 per minute and Linux 1-core (x64, ubuntu-slim) is $0.002 per minute (runner pricing page; the Actions billing page repeats the same table). 'GitHub rounds the minutes and partial minutes each job uses up to the nearest whole minute' (runner pricing page); billable job minutes 'are rounded up to the next minute' (view job execution time page). Standard GitHub-hosted runners are free and unlimited on public repositories (hosted-runners page); the billing page lists them as usage that remains free."
grade: A
publisher_note: same publisher (GitHub docs); two pages per part
topics: [billing, actions]
checked_on: 2026-11-13
shelf_life: 6 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://docs.github.com/en/billing/reference/actions-runner-pricing
  - https://docs.github.com/en/actions/how-tos/monitor-workflows/view-job-execution-time
  - https://docs.github.com/en/billing/concepts/product-billing/github-actions
  - https://docs.github.com/en/actions/reference/runners/github-hosted-runners
note: "Each part is on two GitHub pages (same publisher). The billing page does not contain the rounding sentence (the memo's first-round misattribution stays corrected)."
---
