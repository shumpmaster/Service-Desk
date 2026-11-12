---
id: F-gh-app-tokens-02
form: fact
claim: "Installation access token: expires after 1 hour, lists up to 500 repositories, cannot be granted permissions the app was not granted, narrowable with the permissions parameter. User access token: only has permissions both the user and the app have, narrowable to one repository with repository_id, expires after 8 hours, refresh token 6 months. A private GitHub App can only be installed on the account that owns it, which may be a personal account."
grade: B
checked_on: 2026-11-12
shelf_life: 12 months
topics: [github, authentication]
sources:
  - https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app
  - https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app
  - https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/making-a-github-app-public-or-private
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Each point on one page."
---
