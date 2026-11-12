---
id: F-cloudevents-type-prefix-01
form: fact
claim: "CloudEvents event type should be prefixed with a reverse-DNS name. The specification says the type 'SHOULD be prefixed with a reverse-DNS name'; Google's Firebase Admin Node SDK reference for its CloudEvent type says 'Should be prefixed with a reverse-DNS name (com.my-org.v1.something.happended)'."
grade: A
topics: [monitoring, change-reporting]
checked_on: 2026-11-12
shelf_life: 36 months
opened_by: source-checker (Q-026 round 5, 2026-11-12), raw page text fetched and read directly; researcher read the same pages through a summarising fetch
memo: research/Q-026-memo.md
publisher_note: the specification passage alone suffices (ruling of 2026-11-12); the Firebase page is a different publisher stating guidance for its own SDK, not a restatement of the specification.
sources:
  - https://raw.githubusercontent.com/cloudevents/spec/main/cloudevents/spec.md
  - https://firebase.google.com/docs/reference/admin/node/firebase-admin.eventarc.cloudevent
---
