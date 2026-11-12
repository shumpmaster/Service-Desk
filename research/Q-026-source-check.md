Verdict: FAIL

I filed 7 entries and held back 2. I fetched every cited page as raw text and compared each quote with the memo. Nothing was committed, because this directory is not a git repository. The brief's rule is that an unverifiable claim fails the round, so the two held entries make the verdict FAIL.

## Rule applied
`governance/standards/sources.md` now includes the owner's ruling of 2026-11-12. One quoted specification passage is enough for what a specification requires. That clears the specification-text entries held last round.

## Filed (library/facts/ unless noted)
- **`F-otel-event-name-01`:** "An event MUST have an event name that uniquely identifies the event structure" is on the events `index.md`, whose Status is Development. "This name SHOULD uniquely identify the event structure (both attributes and body)" is in `logs/data-model.md`. The entry rests on the MUST text and notes the SHOULD.
- **`F-otel-event-name-static-01`:** "Event names MUST NOT include dynamic values. Use attributes for identifiers, names, or other values that vary per…" is on the same events page.
- **`F-cloudevents-type-owner-01` and `F-cloudevents-type-prefix-01`:** the spec text says "SHOULD be prefixed with a reverse-DNS name. The prefixed domain dictates the organization which defines the semantics of this event type." The Firebase reference says "Should be prefixed with a reverse-DNS name (com.my-org.v1.something.happended)". Because the spec passage is enough, I graded the ownership entry A, not B as the memo proposed.
- **`F-weaver-stability-values-01`:** `semconv-syntax.md` has `stability ::= "stable" | "development" | "alpha" | "beta" | "release_candidate"`. I treated that file as a syntax specification, not product behaviour, and graded it B. This is a judgement call; see open question 2.
- **`F-category-count-limit-01`:** the EU guide says "Seven is a good maximum". The arXiv 2508.17460 abstract says "if the category number is smaller than six, people tend to perform well at all tasks", "between 2 and 15 classes", and "When category numbers increased, performance fell". The record's journal reference is IEEE TVCG (2026) 32(1). These are two independent publishers. Applying the study to legends is the Researcher's inference, and the entry says so.
- **`library/patterns/P-event-vocab-layered-01`:**
  - The incident.io and Linear wording was read raw this round.
  - Every other cited page was reached. I spot-checked the field names:
    - GitHub: `conclusion` values, check `name`.
    - PagerDuty: `payload.class`.
    - Kubernetes: `type` (Normal, Warning) and Reason.
    - Jira: three status categories.
    - CloudTrail: `eventCategory`, `eventType`.
    - OCSF: the `_name` suffix.
    - Grafana: annotation tags.
    - Prometheus: the naming page.
  - I did not check the 6, 2 and 4 count. It is the Researcher's judgement, and the entry says so.

## Held (not filed)
- **`F-linear-status-categories-01`:**
  - The `issue-property` page confirms the fixed-order sentence, the "at least one status exists in each category" limit and the "additional status category" wording. The triage page confirms only the "outside the normal workflow" part.
  - Linear states the category rules on one page only. This is vendor behaviour, which needs two pages.
  - The two pages also disagree on duplicates. `issue-property` says the Duplicate status is "a system-managed status that cannot be renamed or customized", while `triage` says a duplicate moves to a "Canceled status type".
- **`F-incidentio-severity-ownership-01`:**
  - The `severities.md` page confirms all three quotes.
  - The only other page, `incident-types.md`, covers only customised severity descriptions and shared order. It does not cover the "Manage organization settings" permission or the hide and restrict wording. I count one page for this vendor behaviour, and the Researcher's own note also says to hold it.

## Open questions
1. **Researcher:** can you supply a second page for the Linear category rules and for the incident.io permission rule? The Linear configuring-workflows page returned 404 for you.
2. **Owner:** is `semconv-syntax.md` a specification under the ruling, or product documentation that needs two pages? If it is product documentation, `F-weaver-stability-values-01` needs a superseding entry, because I cannot edit a filed fact.
3. **Owner (the Researcher's Q-e):** when a vendor's own pages disagree, as Linear's do on duplicates, should the library file both readings with dates, or neither? The Linear entry stays out until this is ruled.
4. **Pattern shelf life:** the pattern rests on pages that change. I set it to 24 months, as the Researcher proposed.