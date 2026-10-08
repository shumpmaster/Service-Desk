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

## L-0006 — S-001 J10: how the desk shows missing and impossible usage figures; S-020's live usage check
date: 2026-10-08
type: ruling
supersedes: []
scope: project
expires: never
asked: Reviews of the J10 revision (PR #49) and the desk build (PR #52) asked for rulings on how the Agents view shows usage figures that are null, impossible or of the wrong kind, and whether it shows the cost estimate. S-020's adoption (L-0005) also asked for one real session's `usage` checked at the pinned CLI version.
decision: (1) A null figure shows "not available" everywhere, including the threshold percentage, "would have stopped" and the compaction count (PR #49 B1). (2) The drill-down shows `cost_usd_estimate` as "estimate $x.xx", never as a charge (PR #49 N3). (3) A negative or non-finite figure, or a non-integer whole-number figure, is the wrong kind: named in notes, that key "not recorded", the rest of the line still shown; a percentage with a zero divisor is "not available" (PR #52 B2; written into J10 and AC23 by PR #54). (4) Live check: the first sessions after adoption (Q-011 source checker and Q-012 researcher, dispatched 2026-10-08T16:59:31Z, status/outcomes.jsonl lines 98-99) carry `usage` with non-null token totals, turns, duration, context_window (1,000,000) and context_peak at the pinned 2.1.284; `autocompact_threshold`, `compactions` and `would_have_stopped` are null, because 2.1.284 emits no `autocompact_state` event. They stay null, shown "not available", until a newer CLI version is pinned and proven (S-020's stated outcome). (5) The scrub proof, run by hand after adoption (runs 37811975653, 37812997822, 37813311322 on runner image 20261004), passed every token check but failed "off: Read of the parent's environ (no call with a result)"; the fix is the model's S-021 (its L-0128), to be adopted here before a passing run sets proven_image_version.
licenses_next: Merging PR #54 then PR #52 (the desk reads the frozen usage form); adopting model S-021, then the proof run.
decided_by: owner (merges this pull request; items 1 to 3 proposed by the Orchestrator under the owner's standing "Go with reccomendations", 2026-10-08)
proposed_by: orchestrator
reversibility: reversible

## L-0007 — Scrub proof deferred; it must pass before P-001 closes
date: 2026-10-08
type: ruling
supersedes: []
scope: project
expires: never
asked: After adopting model S-021 (PR #56), the scrub proof was run by hand twice (runs 37843142513 and 37843333910, model sonnet, runner image 20261004). Every token check passed, the commands-on session passed every check (it read parent-pid.txt and its Read of the recorded parent's environ was blocked), but the commands-off session made no tool calls in either run, so its two Read checks had nothing to judge. A full pass needs a further model change. Fix it now, or defer?
decision: Deferred. RUNNER.toml stays as it is: session_commands "on", proven_image_version 202609, so on today's 202610 image pipeline builder sessions run with commands forced off (S-016 AC2). Nothing current is blocked: the desk (P-001) is built outside the pipeline, and the pipeline's open items are research, which uses no commands. Condition (the owner's): the proof must pass, and RUNNER.toml record the proven image, before P-001 is closed out (M3's close), and before the operating model is run on a new project.
licenses_next: The design milestone and M3 proceed; a model change making the commands-off session's Reads reliable, then a passing proof run here, before P-001's close-out.
decided_by: owner ("deferring them means we can get the service desk stood up. But we would need to ensure it's added before the project is closed out and I want to operate my operating model on new projects.", 2026-10-08)
proposed_by: orchestrator
reversibility: reversible
