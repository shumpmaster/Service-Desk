# Ledger

*Append-only. Every ruling, predeclaration, reading, kill, incident and delegation is a new entry
at the bottom. A mistake is corrected by a new entry that says what was wrong, never by editing.
CI proves the old file is a byte-for-byte prefix of the new one and that IDs are unique.*

*Entries hold facts at the time of writing only. Whether an entry is still active is computed
into docs/DIGEST.md, never written back here. The title states the outcome. Write for a reader
who wasn't in the conversation: no "as discussed".*

*Fields: date · type (ruling | predeclaration | reading | kill | incident | postmortem |
delegation | defaulted | tier-change | rule-experiment | correction) · supersedes · scope ·
expires · asked · decision · licenses_next · options_considered · decided_by · proposed_by ·
reversibility.*

*Before your first commit, set L-0001's date to your start date.*

## L-0001 — Project founded under the AI Build Operating Model at tier T1
date: 2026-09-30
type: ruling
supersedes: []
scope: project
expires: never
asked: Stand the project up under a governed operating model from day one.
decision: Adopt the AI Build Operating Model at the version in governance/OPERATING_MODEL_VERSION, at tier T1. AGENTS.md is the charter.
licenses_next: Writing MISSION.md and SCOPE.md, then opening the first sprint.
decided_by: owner
proposed_by: orchestrator
reversibility: reversible

## L-0002 — The founding import is exempt from the range guard
date: 2026-09-30
type: ruling
supersedes: []
scope: project
expires: never
asked: The project was founded in one commit (c1c9a56) holding the whole v3 template, authored by the orchestrator, which touches every surface. Exempt it from the range guard?
decision: Exempt c1c9a56491d34565b931a6a8f6f41fab2caa855e (governance/SURFACES.md exempt block). It is the generated template, unchanged apart from the owner line, the founding date and the README title; the owner approves by merging the founding pull request.
holdouts: changed
licenses_next: The owner's GitHub setup (docs/SETUP.md), then the intent capture in docs/PROJECT.md.
decided_by: owner (merges the founding pull request)
proposed_by: orchestrator
reversibility: reversible

## L-0003 — P-001 is built from its draft spec, outside the freeze rule
date: 2026-10-07
type: ruling
supersedes: []
scope: P-001 (specs/S-001.md)
expires: never
asked: AGENTS.md §1 says specs are frozen before build or measurement. P-001's pipeline closed with re-scope (decisions/P-001/stop-6.md), and the owner chose to build the Service Desk outside the pipeline from the approved brief and the draft spec. May the Builder build from specs/S-001.md while it stays status: draft?
decision: Yes, for S-001 only, until P-001 launches (S-001 AC28) or is stopped. The owner's ruling is decisions/questions/P-001-build-path.md, question 0. The Builder builds S-001 from the draft merged in PR #36 (bf1f6c6), in milestones M1 to M3. The Reviewer checks each milestone's pull request against the spec, and the owner merges it. There are no locked acceptance tests or Critic gate for S-001. The Builder's own tests in tests/desk/ and the Reviewer stand in for them, and the experiments EXP-001 to EXP-004 run during Build. Every Builder commit carries Spec: S-001 and stays within the spec's Areas touched, which CI's v3_checks scope enforces. This is S-001's setup task CS8.
licenses_next: The Builder's M1 branch (build/builder/m1-status-page).
options_considered: Freeze S-001 through the full pipeline first (the owner declined: three Define plan-review rounds had already failed); build with no spec (refused, as the Reviewer needs something to judge against).
decided_by: owner
proposed_by: orchestrator
reversibility: reversible

## L-0004 — Service-Desk is a public repository, so deploys can wait on the owner's approval
date: 2026-10-07
type: ruling
supersedes: []
scope: project
expires: never
asked: S-001's deploy design (Reviewer round 3, R3-B1) needs GitHub environments whose required reviewer is the owner, so that no deploy runs without the owner's approval. GitHub offers required reviewers on a personal account's private repositories only with Enterprise. Make the repository public, stay private with a weaker after-the-fact gate (needing a spec amendment and another review), or buy Enterprise?
decision: Make Service-Desk public. The owner changed the visibility on 2026-10-07, after a scan of all 406 commits on all 57 branches. gitleaks 8.30.1 found no secrets (its 347 hits were all file hashes in review control records), and searches found no tokens, private keys, phone numbers or IP addresses. The owner accepted that his commit email, already in his own commits and in governance/SURFACES.md, becomes public. Workflow logs and one-day artifacts become public too. Secrets stay in GitHub environments and Cloudflare. The owner reports setting up the environments `preview` and `production` with the owner as required reviewer, deployment branch main only, and the Cloudflare secrets. Recommended at the same time: interaction limits set to prior contributors (GitHub caps this at six months, so it needs renewing), and approval required for all external contributors' fork workflows.
licenses_next: S-001's deploys as designed (desk-deploy.yml).
options_considered: Stay private and deploy without approval, checked after the fact at each milestone (a spec change that the Reviewer had already rejected once); GitHub Enterprise (a monthly cost per user for one gate).
decided_by: owner
proposed_by: orchestrator
reversibility: reversible (the visibility can be set back to private; what was public meanwhile may have been copied)

## L-0005 — Model S-020 adopted: sessions record usage, PRs lead with what they mean, a discovery form for the Researcher
date: 2026-10-08
type: ruling
supersedes: []
scope: project
expires: never
asked: The model's S-020 (frozen under the model's L-0125, built and merged as the model's PR #21) is approved by the owner. Adopt it here as its "Adoption by Service-Desk" section says?
decision: Adopted. governance/checks/session_runner.py, orchestrator_git.py and governance_checks.py are copied from the model at its PR #21 merge (each was identical to the model's 677fe5a copy before). Also copied: .github/workflows/pr-body.yml (a non-blocking red check on PR bodies); the Researcher's PACKS.toml line and research/_DISCOVERY.md; the Researcher's and Source checker's discovery-map duties; and AGENTS.md's two rules (PRs lead with "What this means for you"; a stopping point before compaction). Sessions now run with stream-json and their outcome lines carry `usage`. Nothing stops a session for its context; `would_have_stopped` only records it (the owner's ruling). Still to do: S-001's J10 revision and the desk's reading of the new names (a Definer and Builder change); one real session's `usage` checked at the pinned CLI version; the scrub proof run once by hand, since its wrapper changed (model S-015 AC12).
licenses_next: The live checks above; then the J10 revision.
decided_by: owner ("Go with reccomendations" on S-020's questions, 2026-10-08; merged the model's PR #21)
proposed_by: orchestrator
reversibility: reversible
