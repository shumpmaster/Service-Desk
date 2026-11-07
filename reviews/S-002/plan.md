Verdict: FAIL

Status: I read the spec against its plan, the sizing findings and the cited records. These are the findings.

**Blocking**

1. **AC7, J3 and J5 contradict AC11, and the sender can't follow them.**
   - specs/S-002.md:26 and :56 add a state, "whether the open desk has already shown it", and say a shown card is never withdrawn.
   - That memory lives in the open desk, which is a browser session.
   - The notification sender is a separate run (research/P-003-sizing-findings.md §1, collect.mjs). It can't see that session.
   - So a sender that has read the log sees the card as held, while a desk with the log unread shows it. AC11 (:34) promises they agree card by card, and they won't.
   - The spec doesn't say where "notified once" (:34, :58) is remembered, or how "once shown, not withdrawn" survives a reload. Neither can be tested as written.

2. **AC13 to AC15 (:39–:41) are not buildable or testable by the Builder.**
   - They are Chief of Staff duties: writing to intake/value-checks.jsonl, reporting misses weekly, and putting a card to the owner after 2026-12-31.
   - intake/ is not in "Areas touched" (:61).
   - The brief section puts how cards are written and the operating model out of scope (:94).
   - A criterion no locked check can test is unverifiable. Split these off as plan or process items, or have the owner approve them as in scope.

3. **The join-up review section is missing.**
   - A plan review must add one in the docs/design/JOIN_UP_REVIEW.md form.
   - The queue, Home's count, the board, the card sheet and the notices are five views. They need a side-by-side check, and the plan itself commits to one (Design-5, docs/projects/P-003.md:60).
   - Findings so far:
     - Blocking: the disagreement in item 1.
     - Non-blocking, to carry into the gate's case: a slow dispatch log shows held cards at once (AC7). That is the "answered against intent" risk the owner wants avoided (docs/projects/P-003.md:130).
     - Needed change to the records: none beyond the notes files.

**Non-blocking**

4. **J4 (:57) misstates the code.**
   - It says src/public/sandbox.js has "generated copies".
   - The sizing (:22, :56) says that file is hand-written and not mirrored. Only src/public/lib/ is generated.
   - The edit location is also src/public/sandbox.js:3701–3717 plus src/lib/sandbox.js:955. The spec doesn't pin the second one.

5. **The sender's files need the owner's approval (docs/projects/P-003.md:71).**
   - "Areas touched" lists src/notify/** (:61) with no approval record.
   - The sizing (:28) suggests collect.mjs may need no change. The spec should say whether it does.

6. **The owner's ruling record is quoted second-hand (:12, :71).**
   - decisions/questions/P-001-card-recommendation.md is not in this pack, so I could not confirm the quotes.
   - The plan's wording matches what the spec quotes.

**Checked and holding**
- The header's `milestones: M4` matches docs/projects/P-003.md:44.
- decisions/P-003/dor-4.md says "proceed".
- docs/PROJECT.md:85 and :540 support the file-naming facts.
- Launch-5 is at docs/PROJECT.md:127. I did not check it is in §3.
- library/facts/F-cf-02.md supports the rollback claim.
- The library entries P-notice-actionable-01 and F-automation-complacency-01 exist, but I did not open them. I did not check what they say, so the two spec lines that cite them (:70, :79) are unverified.
- The J2 examples agree with the real note forms in the sizing (§4), including the bare "## Recommendation" in Q-003.

**Open questions**
- Where does the sender record that a card has been notified? If that is an existing mechanism, name it in J5.
- Should AC7's "never withdraw" apply only within a desk session, or across reloads and the sender too?
- Are AC13 to AC15 in this spec's scope, or do they move to the plan or the Launch gate?