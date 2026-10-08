---
id: F-webpush-03
form: fact
claim: "Push subscriptions can expire: PushSubscription.expirationTime may be null, yet browsers commonly let subscriptions expire (e.g. after long inactivity); the pushsubscriptionchange event fires when a subscription has been invalidated or is about to be."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08), through a summarising fetch; researcher read the same pages
memo: research/Q-011-memo.md
publisher_note: different publishers (Google web.dev; MDN)
sources:
  - https://web.dev/articles/push-notifications-subscribing-a-user  # expirationTime null yet browsers commonly allow expiry
  - https://developer.mozilla.org/en-US/docs/Web/API/Push_API  # "fired whenever a pushsubscriptionchange event occurs; ... invalidated, or is about to be invalidated"
---
