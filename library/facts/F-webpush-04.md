---
id: F-webpush-04
form: fact
claim: "Safari does not support invisible push notifications: a push must be shown to the user when the service worker receives it, otherwise Safari revokes the push permission (Apple) / the push subscription (WebKit) for the site."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08); Apple page read raw; WebKit pages through a summarising fetch
memo: research/Q-011-memo.md
publisher_note: Apple developer docs and WebKit blog (Apple-run, but two different pages)
sources:
  - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers  # "Safari doesn't support invisible push notifications... If you don't, Safari revokes the push notification permission for your site." (page covers Home Screen web apps on iOS 16.4+ and Safari 16 on macOS)
  - https://webkit.org/blog/12945/meet-web-push/  # "Violations of the `userVisibleOnly` promise will result in a push subscription being revoked."
note: The WebKit post is about Safari 16 on macOS Ventura (iOS support was still to come). For iOS specifically only the Apple page is a source (single page).
---
