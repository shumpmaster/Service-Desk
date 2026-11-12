---
id: F-gh-notif-01
form: fact
claim: "GitHub's notifications REST endpoints only support authentication using a personal access token (classic); they support Last-Modified / If-Modified-Since, 304 replies and an X-Poll-Interval header. They require the notifications or repo scope."
grade: B
checked_on: 2026-11-12
shelf_life: 6 months
topics: [github, notifications, authentication]
sources:
  - https://docs.github.com/en/rest/activity/notifications
opened_by: source-checker (Q-027, 2026-11-12), raw page HTML fetched and searched for the quoted strings
memo: research/Q-027-memo.md
note: "Single page."
---
