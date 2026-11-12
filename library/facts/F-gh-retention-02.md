---
id: F-gh-retention-02
form: fact
claim: "GitHub changelog dated 2026-10-01: checks, workflow runs and statuses 'are now governed by the same GitHub Actions retention setting that controls how long artifacts and logs are kept'; they are 'automatically cleaned up when they exceed the retention period configured for your enterprise, organization, or repository'; this applies to checks and statuses created by GitHub Actions and third-party applications; the maximum for public repositories is 90 days; 'Changing the setting won't restore data that was previously removed.' Repository settings page: default 90 days; public 1-90 days, private 1-400 days. Not stated: whether records already past the setting on 1 Oct were deleted at once or gradually. The repository docs page still reads 'Starting October 1, 2026, these policies will apply' (future tense)."
grade: B
checked_on: 2026-11-12
shelf_life: 6 months
topics: [github, retention]
sources:
  - https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses
  - https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "That the change took effect rests on the changelog alone (one page, datePublished 2026-10-01); the docs page confirms the settings only. Complements F-gh-retention-01, which is not edited."
---
