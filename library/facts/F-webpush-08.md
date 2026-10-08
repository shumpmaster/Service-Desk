---
id: F-webpush-08
form: fact
claim: "Declarative Web Push is available on iOS/iPadOS 18.4 for web apps added to the Home Screen, and lets a page request a Web Push subscription and show notifications without an installed service worker (WebKit 16535: 'allows web developers to request a Web Push subscription and display user visible notifications without requiring an installed service worker'; WebKit 16574: 'Declarative Web Push is now available on iOS and iPadOS 18.4 for web apps added to the Home Screen'). Single-page detail, grade B, from WebKit 16535 only: the payload is JSON with top-level 'web_push': 8030 and a notification with a non-empty title and a navigate URL; an installed service worker gets a push event and may replace the notification, otherwise the fallback is shown; also testable on macOS 15.5 beta. Support on Android/Chrome is not documented on the pages read."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011 round 3, 2026-10-08); both WebKit pages through a summarising fetch, not raw
memo: research/Q-011-memo.md
publisher_note: two WebKit blog pages (same publisher, behaviour claim). Grade A applies to the availability/no-service-worker claim only; payload and override detail is single-page.
sources:
  - https://webkit.org/blog/16535/meet-declarative-web-push/
  - https://webkit.org/blog/16574/webkit-features-in-safari-18-4/
---
