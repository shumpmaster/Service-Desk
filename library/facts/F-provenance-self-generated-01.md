---
id: F-provenance-self-generated-01
form: fact
claim: "SLSA v1.0 build levels: at Build L1 provenance may be unsigned or self-generated and gives little tamper resistance (spec: 'trivial to bypass or forge'); at L2 the provenance is signed by a hosted/managed build platform, deterring simple tampering; at L3 the signing material must not be accessible to the user-defined build steps, so code in the build cannot forge its own provenance."
grade: B
topics: [trust, provenance, machine-summaries]
checked_on: 2026-11-12
shelf_life: 36 months
opened_by: source-checker (Q-025, 2026-11-12); all three pages opened through summarising fetches that returned verbatim quotes
memo: research/Q-025-memo.md
supersedes: none
sources:
  - https://slsa.dev/spec/v1.0/levels  # L1 "trivial to bypass or forge"; L2 "explicit 'attack'"; L3 "accessible to the user-defined build steps"
  - https://github.blog/enterprise-software/devsecops/enhance-build-security-and-reach-slsa-level-3-with-github-artifact-attestations/  # Heidinger, 19 Dec 2024; GitHub, not the spec's publisher
  - https://socket.dev/glossary/supply-chain-levels-for-software-artifacts.md  # Socket, page dated 2026-10-30; L1 "unsigned or self-generated"; L3 "first level at which code running inside your build cannot forge your provenance"
note: "The two secondary pages restate the spec; they are different publishers but add no new evidence. Spec-only, not in the claim: requirements page 'trusted control plane' line; W3C PROV definition."
---
