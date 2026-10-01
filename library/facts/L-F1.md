---
id: L-F1
form: fact
claim: "GitHub App installation token expires after 1 hour; requests made with it are attributed to the app's bot account (name[bot])."
grade: A
checked_on: 2026-10-01
shelf_life: 6 months
topics: [github, authentication, attribution]
sources:
  - https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation  # "The installation access token will expire after 1 hour."; "attributed to the app"
  - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps  # "identifies the app as a GitHub App bot account, such as @jenkins[bot]"
opened_by: source-checker (Q-002, 2026-10-01)
---
