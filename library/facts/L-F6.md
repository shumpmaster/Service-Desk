---
id: L-F6
form: fact
claim: "A GitHub App private key grants access to every account the app is installed on; keys do not expire and must be revoked manually; store sign-only in a key vault."
grade: B
checked_on: 2026-10-01
shelf_life: 6 months
topics: [github, security]
sources:
  - https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app  # "every account that the app is installed on"; key vault, sign-only
  - https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps  # no expiry; manual revoke; sign-only vault
opened_by: source-checker (Q-002, 2026-10-01)
note: Memo graded A; downgraded. The "every account" wording appears only in the best-practices page (the key-management page does not say it). No-expiry and sign-only rest on the key page, sign-only also on best practices.
---
