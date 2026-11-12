Verdict: FAIL

I filed three of the memo's proposed entries and held back five. The directory is not a git repository, so nothing was committed. I fetched the new pages as raw text and searched them for the quoted wording. I did not re-fetch the pages that the earlier source check had already confirmed from raw text.

## Filed
- **`library/facts/F-gh-custom-kinds-01.md`:**
  - The organisation audit-log page says "composed of a category of events, followed by an operation type. For example, the `repo.create` entry…".
  - The enterprise search page says "Each category has a set of associated actions" and "`action:team.create` finds all events where a team was created".
  - The other five pages were confirmed raw in the earlier round.
  - Both audit-log pages are GitHub's own docs about GitHub, so the same-publisher rule in `governance/standards/sources.md` applies.
- **`library/facts/F-vocab-registry-check-01.md`:**
  - The Weaver README table (raw) has `registry check` as "Validates a semantic convention registry" and `registry live-check` as "Check the conformance level of an OTLP stream against a semantic convention registry".
  - The blog has "live-check that their application correctly emits telemetry conforming to the official semantic conventions, or a custom registry".
  - The blog also has "Weaver ensures every change to the registry is consistent, validated…" directly above `weaver registry check -r registry-path`. That settles the pairing the memo asked me to confirm.
  - Both pages are the OpenTelemetry project describing its own tool, so I filed it on the same-publisher rule.
- **`library/facts/F-semconv-stable-split-01.md`:**
  - The Java README (raw) has "Generated code for stable semantic conventions" and "Generated code for experimental semantic conventions". It also has "-alpha … no compatibility guarantees".
  - The code-generation page has "Ship two different artifacts: one that contains stable Semantic Conventions and another one with all available conventions".
  - I left out the Python `_incubating` sentence. It is on the code-generation page only, and the Researcher's claim included it, so I narrowed the claim.

## Not filed
- **`F-otel-event-name-01`:**
  - Both quotes are confirmed. The events page has "An event MUST have an event name that uniquely identifies the event structure". `logs/data-model.md` line 450 has "This name SHOULD uniquely identify the event structure (both attributes and body)".
  - The source standard covers vendor product behaviour only. It does not cover specification text, and anything wider needs its own owner ruling. I am holding this until the owner rules.
- **`F-otel-event-name-static-01`:** "MUST NOT include dynamic values" is confirmed on the events page, but it is the only source.
- **`F-cloudevents-type-owner-01`:** the memo itself says there is a single source. I did not re-open it.
- **`F-legend-colour-limit-01`:** single source, grade C.
- **`P-event-vocab-layered-01`:**
  - The claim counts incident.io, but the entry's source list has no incident.io URL. The note admits this, and the Researcher has not supplied it.
  - The same list has no source for Linear. The memo says Linear is not counted, but the claim still mentions it.
  - I cannot confirm those two parts, so the pattern is held. The classification into "closed beside open" and "single open form" is the Researcher's own judgement.

## Open questions
1. **Owner ruling on specification text:** does one publisher's two pages count as two sources for specification text? I filed `F-enum-escape-values-01` last round on that reading, and it has not been ruled on. If the owner says no, it needs a superseding entry. I cannot edit a filed fact. `F-otel-event-name-01` waits on the same ruling.
2. **Researcher:** supply the incident.io URL for the pattern entry, and drop Linear from the claim or source it.
3. **Researcher:** a second source for the OpenTelemetry "dynamic values" rule, the CloudEvents reverse-DNS rule and the colour limit.
4. **Linear:** is there an official source? The memo reports that the pages it tried return 404.
5. **Weaver `stability` sentence:** still not confirmed in full, and still unfiled.