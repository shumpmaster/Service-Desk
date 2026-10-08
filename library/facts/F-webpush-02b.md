---
id: F-webpush-02b
form: fact
claim: "A Web Push message sent with a Topic header replaces any outstanding (not yet delivered) push message to the same subscription with an identical topic. RFC 8030 section 5.4: 'A push message with a topic replaces any outstanding push message with an identical topic.' web.dev: Topics 'can be used to replace a pending messages with a new message if they have matching topic names'. Apple describes Topic as an identifier 'the push service uses to coalesce notifications'."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08); RFC 8030 text and web.dev HTML read raw; Apple page read raw (.md)
memo: research/Q-011-memo.md
supersedes: note in F-webpush-02 (F-webpush-02 itself unchanged)
publisher_note: IETF and Google (web.dev) are independent; Apple agrees in different words
sources:
  - https://www.rfc-editor.org/rfc/rfc8030.txt  # section 5.4
  - https://web.dev/articles/push-notifications-web-push-protocol  # Topic
  - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers  # "coalesce"
---
