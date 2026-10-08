---
id: F-webpush-06
form: fact
claim: "Push service responses: 201 = accepted (RFC 8030, web.dev, Apple 'Success'). Expired subscription: RFC 8030 s7.3 says a push service MUST return 404; web.dev says 404 means expired and the PushSubscription should be deleted, and 410 means no longer valid and should be removed; Apple documents 410 'The device token has expired' (Apple's 404 means an invalid :path, not an expired subscription). 429 = rate limit (RFC 8030 s8.4 'MAY'; web.dev; Apple 'too many requests'). 413 = payload too large (RFC 8030, web.dev, Apple)."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08); RFC and Apple raw; web.dev raw HTML
memo: research/Q-011-memo.md
sources:
  - https://www.rfc-editor.org/rfc/rfc8030.txt
  - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
  - https://web.dev/articles/push-notifications-web-push-protocol
note: The memo's shorthand "404 or 410 = expired" is not true of Apple's 404; this entry states it per publisher.
---
