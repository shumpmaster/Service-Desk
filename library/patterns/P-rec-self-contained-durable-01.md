---
id: P-rec-self-contained-durable-01
form: pattern
claim: "Copy what a reader needs (actor, principal and role, occurrence and record time with offset, result, run ID with attempt, commit SHA) into a durable record at event time, and refer to host objects by IDs that do not move (SHA, run ID plus attempt, PR number) rather than branch names; treat host URLs as hints that may expire. Basis: checks, runs and statuses now expire with Actions retention (F-rec-actions-retention-02); audit log 180 d and Events API 30 d (F-rec-host-windows-01); GitHub says the file content at a commit-ID link will not change; SLSA invocationId and check-run external_id are writer-owned IDs. Opinion built on those facts."
grade: B
topics: [github, status-reports, automation]
checked_on: 2026-11-12
opened_by: source-checker (Q-023, 2026-11-12), through a summarising fetch; AU-3/AU-8 also read in NIST's own OSCAL catalog
memo: research/Q-023-memo.md
shelf_life: 12 months
note: conclusion is the researcher's opinion; 'permanent while reachable' in the memo was not confirmed and is left out
sources:
  - https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses
  - https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files
  - https://slsa.dev/spec/v1.0/provenance
  - https://docs.github.com/en/rest/checks/runs
---
