---
id: L-P1
form: pattern
claim: "Web app holding GitHub credentials: keep user tokens server-side, encrypted, with access to the systems restricted; keep the App private key sign-only in a key vault rather than an environment variable."
grade: B
checked_on: 2026-10-01
shelf_life: 12 months
topics: [github, security]
sources:
  - https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app
  - https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps  # env var risk
opened_by: source-checker (Q-002, 2026-10-01)
---
