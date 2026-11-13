---
id: F-gh-ruleset-bypass-01
form: fact
claim: "Creating rulesets page, bypass list: eligible are repository admins (and organization/enterprise owners), the maintain or write role (or custom roles based on write), teams (excluding secret teams), and 'GitHub Apps' / Dependabot."
grade: B
publisher_note: same publisher (GitHub docs); one page
topics: [github]
checked_on: 2026-11-13
shelf_life: 12 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository
note: "Single page, not load-bearing. Whether GitHub Actions (the workflow token) can be on the list in a personal-account repository is not documented there."
---
