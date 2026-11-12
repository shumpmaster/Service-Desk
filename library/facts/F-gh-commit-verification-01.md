---
id: F-gh-commit-verification-01
form: fact
claim: "GitHub shows a commit as Verified (signed, signature successfully verified), Unverified (signed, signature could not be verified), or with no status (unsigned); with vigilant mode, unsigned commits show Unverified, and a signed, verified commit whose author is not the committer and has vigilant mode on shows Partially verified."
grade: B
topics: [github, provenance, status-reports]
checked_on: 2026-11-12
shelf_life: 24 months
opened_by: source-checker (Q-025, 2026-11-12), through summarising fetches; both pages opened
memo: research/Q-025-memo.md
supersedes: none
publisher_note: same publisher (GitHub); behaviour claim; two pages.
sources:
  - https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification  # Verified, Unverified, unsigned, Partially verified
  - https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits  # vigilant mode: unsigned -> Unverified; Partially verified
note: "Not filed (single source): GitHub signs web-interface commits automatically (first page only)."
---
