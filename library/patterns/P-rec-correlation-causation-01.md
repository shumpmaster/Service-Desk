---
id: P-rec-correlation-causation-01
form: pattern
claim: "Give every event its own ID, a correlation ID for the whole piece of work, and a causation ID naming the event that directly caused it ('If you are responding to a message, you copy its correlation id as your correlation id, its message id is your causation id'). Axon defines correlation ID as the identifier of the original message that started the business transaction and causation ID as the immediate parent message. W3C trace-id/parent-id and CDEvents chainId/PATH links are similar in shape (the checker's reading, not stated by those specs). Helps rebuild order and grouping when clocks disagree."
grade: B
topics: [automation, agents, change-reporting]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 36 months
note: the link to webhooks arriving out of order (F-Q004-12) was not re-checked here
sources:
  - https://blog.arkency.com/correlation-id-and-causation-id-in-evented-systems/
  - https://docs.axoniq.io/axon-framework-reference/5.0/messaging-concepts/message-correlation/
  - https://www.w3.org/TR/trace-context/
  - https://github.com/cdevents/spec/blob/main/links.md
---
