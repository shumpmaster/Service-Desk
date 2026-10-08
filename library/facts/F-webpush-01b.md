---
id: F-webpush-01b
form: fact
claim: "On iOS/iPadOS 16.4+, Apple, WebKit and MDN each describe Web Push as available to Home Screen web apps (MDN: 'Notifications are supported in web apps saved to the home screen')."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08); Apple page raw; WebKit and MDN through a summarising fetch
memo: research/Q-011-memo.md
supersedes: F-webpush-01 (adds a third source; F-webpush-01 itself is unchanged)
publisher_note: three different publishers (Apple, WebKit, MDN browser-compat-data)
sources:
  - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers  # "Add web push to Home Screen web apps in iOS 16.4 or later"
  - https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/  # "adding support for Web Push to Home Screen web apps"
  - https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/PushManager.json  # safari_ios note
note: NOT filed - that Safari tabs cannot use Web Push ("only"): no primary page says it. Manifest display standalone/fullscreen: WebKit blog only (single page).
---
