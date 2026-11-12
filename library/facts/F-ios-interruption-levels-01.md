---
id: F-ios-interruption-levels-01
form: fact
claim: "Apple: four interruption levels. Passive and Active neither override scheduled delivery nor break through Focus; Time Sensitive does both; Critical also overrides the Ring/Silent switch. Use Time Sensitive 'only for notifications that are relevant in the moment' (now or within an hour); 'Build trust by accurately representing the urgency of each notification.' WebKit: Home Screen web app notifications 'integrate with Focus'; whether web push can be Time Sensitive is not stated."
grade: A
topics: [notifications, mobile]
checked_on: 2026-11-12
shelf_life: 12 months
opened_by: source-checker (Q-024, 2026-11-12); Apple HIG and UNNotificationInterruptionLevel read as JSON data files; WebKit blog read raw (no mention of levels or Time Sensitive found)
memo: research/Q-024-memo.md
publisher_note: Apple HIG plus Apple API docs (same publisher, behaviour claim); WebKit row is single source.
sources:
  - https://developer.apple.com/design/human-interface-guidelines/managing-notifications
  - https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel
  - https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
---
