# Check of the Builder's RFC 8291 example values (step 2)

*Recorded by the Orchestrator, 2026-10-18.*

The Builder reported that it wrote tests/desk/notify-j17-push.test.mjs's RFC 8291 Appendix A
values from memory, since rfc-editor.org, datatracker.ietf.org and ietf.org are blocked by this
session's proxy.

What was compared:
- Source: the working group's draft source, which became RFC 8291,
  https://raw.githubusercontent.com/webpush-wg/webpush-encryption/master/draft-ietf-webpush-encryption.md
  (fetched 2026-10-18, sha256 4bb6a20fb030c6dceb62e272bec6375087744d9370bfa685b4f7023ab200d0fb).
  This is the draft's source, not the published RFC page.
- Its worked example's inputs (the plain text, the authentication secret, both key pairs, the
  salt) equal the test's literals.
- Its final encrypted message (the header and the cipher text, joined across its wrapped lines)
  equals the test's expected value, character for character. The test passes on the sender's
  code, so the sender reproduces that message.

The in-between values (the shared secret, the keys, the nonce) are not separate literals in the
test. Since the final message depends on all of them, they are not compared one by one.
