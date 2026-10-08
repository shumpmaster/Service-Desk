---
id: F-webpush-02
form: fact
claim: "A Web Push sender needs a VAPID key pair (ES256 on P-256); the JWT 'exp' must not be more than 24 hours ahead; 'aud' is the push service origin; 'sub' a mailto: or https: URI; header 'Authorization: vapid t=<jwt>, k=<public key>'. The payload is encrypted per subscription and POSTed to the stored endpoint per RFC 8030, with a mandatory TTL header, Urgency (very-low, low, normal, high; high = attempt immediate delivery on Apple), and optional Topic (max 32 URL/filename-safe base64 characters). Apple may store an undelivered message 30 days or fewer depending on TTL."
grade: A
topics: [web-push, notifications]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08), Apple page read raw; RFC pages through a summarising fetch
memo: research/Q-011-memo.md
publisher_note: RFC 8292 (IETF), RFC 8030 (IETF), Apple docs - independent publishers
sources:
  - https://www.rfc-editor.org/rfc/rfc8292.html  # ES256; "exp ... MUST NOT be more than 24 hours"; aud; sub; vapid t=, k=
  - https://www.rfc-editor.org/rfc/rfc8030.html  # TTL MUST; Urgency levels; Topic max 32 chars
  - https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers  # TTL 30 days or fewer; Urgency high; Topic 32; JWT exp > one day = BadJwtToken; payload limit 4 KB
note: Topic replacing a waiting message was not seen in the fetched RFC text (Apple says "coalesce"); the claim says only max 32 chars.
---
