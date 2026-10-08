---
id: F-webpush-07
form: fact
claim: "Web Push needs an active service worker (MDN: 'it has to have an active service worker'; Apple: 'Add a service worker that handles receiving push notifications'); messages arrive whether or not the page is open (MDN: 'whether or not the web app is in the foreground, or even currently loaded'; web.dev: a service worker 'can run in the background, even when your website isn't open or the browser is closed'). Service worker registration requires a secure context (MDN register(): 'available only in secure contexts (HTTPS)'); MDN Notification.requestPermission says the same. Apple does not state the HTTPS rule on the page read."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 12 months
opened_by: source-checker (Q-011, 2026-10-08); all pages fetched raw
memo: research/Q-011-memo.md
publisher_note: Apple, MDN and Google web.dev; HTTPS rule is two MDN pages (same publisher, behaviour claim)
sources:
  - https://developer.mozilla.org/en-US/docs/Web/API/Push_API
  - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
  - https://web.dev/articles/push-notifications-overview
  - https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
---
