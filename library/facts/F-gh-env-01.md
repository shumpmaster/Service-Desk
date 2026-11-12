---
id: F-gh-env-01
form: fact
claim: "On GitHub Free, Pro and Team plans required reviewers (and wait timers, custom protection rules) are only available for public repositories; users with Pro and organizations with Team can configure environments for private repositories, Free only for public. Up to six users or teams may be reviewers; one approval is enough; with self-review prevention on, a user who initiates a deployment cannot approve it; a job not approved within 30 days automatically fails."
grade: A
checked_on: 2026-11-12
shelf_life: 6 months
topics: [github, deployments]
sources:
  - https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
  - https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
  - https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments
  - https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Product behaviour, same publisher. The 30 days failure rule is on control-deployments only; 30 days elsewhere is the wait-timer maximum."
---
