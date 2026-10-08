---
id: F-webpush-01
form: fact
claim: "Apple supports Web Push for Home Screen web apps from iOS/iPadOS 16.4 (and for webpages in Safari 16 on macOS 13+). The permission request must come from a user gesture (e.g. tapping a subscribe button); Apple says to call the subscribe method immediately from the gesture's event handler. No Apple Developer Program membership is needed (Apple + WebKit)."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08), pages fetched by a summarising tool except the Apple page, which returned raw markdown; researcher read the same pages
memo: research/Q-011-memo.md
publisher_note: different publishers (Apple developer docs; WebKit blog)
sources:
  - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers  # "Add web push to Home Screen web apps in iOS 16.4 or later and Webpages in Safari 16 for macOS 13 or later"; gesture; "You don't need to join the Apple Developer Program"
  - https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/  # "adding support for Web Push to Home Screen web apps"; "direct user interaction"; no Developer Program needed
note: NOT filed here (single page or unconfirmed) - that iOS Web Push works ONLY for Home Screen apps (neither page was seen to say "only"); that Safari revokes permission for non-visible pushes (Apple page only; WebKit blog did not mention it); manifest display standalone/fullscreen (WebKit only).
---
