---
id: F-gh-commit-sign-01
form: fact
claim: "GitHub automatically uses GPG to sign commits made through the web interface and shows them verified; a cryptographically verifiable bot signature is marked verified (only if the request is authenticated as the App or bot and carries no custom author/committer info); vigilant mode is off by default. Whether REST API commits with an App user token are signed is not stated."
grade: B
checked_on: 2026-11-12
shelf_life: 12 months
topics: [github, attribution]
sources:
  - https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
---
