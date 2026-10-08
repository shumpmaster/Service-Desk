---
id: F-webpush-05
form: fact
claim: "Push services must accept payload bodies of 4096 bytes or less (RFC 8030 s7.2: MUST NOT return 413 for a body of 4096 bytes or less; RFC 8291: a push service 'is not required to support more than 4096 octets'; web.dev: 'minimum size payload a push service must support is 4096 bytes'; Apple: error PayloadTooLarge 'over the limit of 4 KB'). Payloads are encrypted per subscription (Apple: 'build and encrypt the payload for each push notification'). That the Content-Encoding is exactly 'aes128gcm' and that a message is encrypted as a single record is stated by RFC 8291 only (single source)."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 12 months
opened_by: source-checker (Q-011, 2026-10-08); RFCs and Apple raw; web.dev HTML raw
memo: research/Q-011-memo.md
sources:
  - https://www.rfc-editor.org/rfc/rfc8030.txt
  - https://www.rfc-editor.org/rfc/rfc8291.txt
  - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
  - https://web.dev/articles/push-notifications-web-push-protocol
note: The aes128gcm / single-record detail is grade B (RFC 8291 only); the 4096-byte limit is A. The memo's "about 3,993 octets plaintext" was not confirmed and is not filed.
---
