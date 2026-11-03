---
id: P-notice-actionable-01
form: pattern
claim: "Send an interrupting notice only when it needs action and is new; do not repeat unchanged items. Supports: repeats and per-sitting count lower acceptance (F-alert-repeat-01); irrelevant or repeated alerts drive override (F-alert-override-01); Google SRE practice: 'Every page should be actionable', pages should be about 'a novel problem', and 'Pages with rote, algorithmic responses should be a red flag'. Settings are clinical (distant) or one vendor's practice; untested with AI-agent oversight. The recommendation is an inference, not a finding."
grade: B
topics: [notifications, briefing]
checked_on: 2026-11-03
shelf_life: 36 months
opened_by: source-checker (Q-020, 2026-11-03), through summarising fetches of all three sources
memo: research/Q-020-memo.md
sources:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC1447540
  - https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1186/s12911-017-0430-8&resultType=core&format=json
  - https://sre.google/sre-book/monitoring-distributed-systems/
note: SRE source is documented practice by one vendor, not a study.
---
