---
id: P-notify-permission-01
form: pattern
claim: "Ask for notification permission inside a user action, not on page load. Google web.dev: 'Never ask on page load or without user interaction'; Chrome: 'Avoid showing prompts ... immediately after a user lands on the site'; Apple: request on a gesture. Why it matters: once a user has permanently denied permission, 'browsers honor that decision' (web.dev) and an undecided 'default' is treated as denied (MDN). Guidance is opinion from platform vendors."
grade: B
topics: [notifications, web-push]
checked_on: 2026-10-08
shelf_life: 12 months
opened_by: source-checker (Q-011, 2026-10-08); web.dev, Chrome blog and MDN fetched raw
memo: research/Q-011-memo.md
publisher_note: web.dev and developer.chrome.com are both Google, so the advice itself has one publisher; MDN independently states only the deny/default behaviour. Graded B, not the memo's A, because advice (quality claim) needs an independent source.
sources:
  - https://web.dev/articles/permissions-best-practices
  - https://developer.chrome.com/blog/notification-permission-data-in-crux/
  - https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static
  - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
note: "Permanent" denial is web.dev wording ("permanently denied ... browsers honor that decision"), not that no recovery exists.
---
