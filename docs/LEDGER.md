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

## L-0008 — Model v3.3.0 adopted: six phases with milestones, three gates, the user representative (not needed here), plain English first
date: 2026-10-13
type: ruling
supersedes: []
scope: project
expires: never
asked: The model's S-023 to S-026 are merged there (VERSION 3.3.0, its PR #28, c8d31c4). Bring Service Desk to v3.3 in one pull request, with its graduation ruling record's rule and form now and the record itself only at its Launch gate, its own milestones reworded as achievements and checked by the Critic, and the pronoun fixes in a second pull request?
decision: Adopted from the model at c8d31c4. Copied byte for byte: eight tools in governance/checks/, ROUTING.toml, RUNNER.toml, BRIEFS.toml, the orchestrator workflow, the intake forms, the spec and handover forms, seven agent cards (user-rep among them, never dispatched here), the gate, profile and join-up forms, the software playbook, status/README.md, and research/_GROUNDWORK.md (renamed from _DISCOVERY.md). Merged, keeping this project's own changes: PACKS.toml, SURFACES.md, decisions/README.md (with the graduation record's rule and form), the critic card and docs/SETUP.md. AGENTS.md takes "Plain English first"; the definition of ready is re-copied word for word; OPERATING_MODEL_VERSION reads 3.3.0. docs/PROJECT.md gains section 9 ("The owner is the user.") and nine project milestones in section 3 (M1, M2, M2B, MD1, MD2, MD3, M3A, M3B, M3C), worded by the owner's rulings (decisions/questions/P-001-milestones-adoption.md, P-001-milestones-ruling-2.md, and P-001-milestones-ruling-3.md, which puts M2's "done when" back to the owner's own words after the review found it widened) after the Critic failed the first draft (P-001-milestones-adoption-critic-1.md) and passed the second and third (-critic-2.md, -critic-3.md); S-001's header names them. No graduation record is written: it is written at the Launch gate, after go-live. Still to do: the pronoun fixes (the second pull request); PR #64's two review notes, which the owner adds with this pull request; the Critic's non-blocking points for the owner (M3B's scope in section 1, the old repository's archiving, the milestones' order, a Discovery milestone).
licenses_next: The pronoun pull request (S-001 directly, EXP-005 by a superseding entry, L-0009); then Design i2's MD2 and MD3 under the new phases.
decided_by: owner (multiple-choice answers in the session, 2026-10-13, recorded in decisions/questions/P-001-v33-sync.md, P-001-milestones-ruling-2.md and P-001-milestones-ruling-3.md; merges this pull request)
proposed_by: orchestrator
reversibility: reversible

## L-0009 — EXP-005's wording refers to the owner without gendered pronouns; the pronoun fixes land
date: 2026-10-14
type: ruling
supersedes: []
scope: project
expires: never
asked: The second pull request agreed on 2026-10-13 ("Two PRs (Recommended)", decisions/questions/P-001-v33-sync.md:7): S-001's wording directly (it is a draft), research/_GROUNDWORK.md:7 to match the model's form after its S-028, and EXP-005, which is frozen, by this entry rather than an edit?
decision: EXP-005 (experiments/EXP-005-md-glance-test.md) stays frozen and unedited. Wherever it says "he", "him" or "his" for the person running the glance test (lines 23, 24, 31, 32, 33, 36, 47, 48 and 49), read "the owner", "they" or "their": the test, its steps and its scoring do not change. S-001 and research/_GROUNDWORK.md:7 are reworded in place. governance/standards/definition-of-ready.md keeps the model's wording until the next model sync (R3).
licenses_next: The next model sync (v3.3.2), which copies the definition of ready's reworded line.
decided_by: owner ("Two PRs (Recommended)", 2026-10-13, decisions/questions/P-001-v33-sync.md:7)
proposed_by: orchestrator
reversibility: reversible


## L-0010 — Overnight delegation: the Orchestrator merges records-only pull requests until the owner is back
date: 2026-10-14
type: delegation
supersedes: []
scope: project
expires: 2026-10-15
asked: While the owner sleeps, may the Orchestrator merge low-risk pull requests itself?
decision: Yes, for records-only pull requests (risk class R0) with CI green and any required review passed; each one is listed for the owner in the morning. Code (R1 here), R2, R3, every deploy and every choice that is the owner's (the design pick, gate approvals, owner verdicts) wait for the owner. The record of the question and the option texts: decisions/questions/P-001-overnight-merges.md. PR #67 was merged under it.
licenses_next: Merging the records-only pull requests prepared overnight, the S-001 design revision among them.
options_considered: "Merge nothing"; "Full authority".
decided_by: owner ("Merge low-risk only (Recommended)", 2026-10-14, decisions/questions/P-001-overnight-merges.md)
proposed_by: orchestrator
reversibility: reversible

## L-0011 — Model v3.3.2 adopted: S-029's tool fixes and the last owner-pronoun line
date: 2026-10-14
type: ruling
supersedes: []
scope: project
expires: never
asked: The model is at v3.3.2 (its PRs #29 to #31: S-028, S-029 and S-030, 7fe41d1). Bring Service Desk to it, as said on 2026-10-14 when PR #67 opened: the follow-up fixes, the stop rule, and the definition of ready's owner line?
decision: Copied byte for byte from the model at 7fe41d1: governance/checks/ governance_checks.py, orchestrator.py, orchestrator_git.py, session_runner.py and v3_checks.py (S-029). governance/standards/definition-of-ready.md takes the model's "including the owner and outside parties" (S-028; L-0009 left it for this sync) and names 7fe41d1 and 3.3.2 as its source. decisions/README.md takes the template's reworded Reason line (S-029 AC10). OPERATING_MODEL_VERSION reads 3.3.2. S-030's stop rule is not copied: it changes the model repository's own working rules only (its AC1 and AC3; v3 projects are unchanged). The pull-request-body workflow, the project document's intent line and research/_GROUNDWORK.md (PR #67, L-0009) already carried S-028's wording here.
licenses_next: The push-run check fix (a model spec, then this project's workflow).
decided_by: owner (merges this pull request, after adding their review notes)
proposed_by: orchestrator
reversibility: reversible

## L-0012 — The design lab ends: the owner picks the five agreed screens, with the phone's own font
date: 2026-10-14
type: ruling
supersedes: []
scope: project
expires: never
asked: Are the five agreed screens the desk's design (S-001 AC43, questions/P-001-design-pick.md), and how should the desk get its font, given that its security headers block Inter from Google?
decision: The five screens (Home, Project, Team, Timeline, and Queue with its response card) are the one design direction, and the design lab ends (AC43 A; AC44 step 1). The owner picked after trying the built candidate on a private page fed by a snapshot of both projects' records. The desk uses the phone's own font; no font file is added. The record of the questions and answers: decisions/questions/P-001-design-pick.md.
licenses_next: The sandbox pull request (AC43 B), then the owner-approved preview deploy and the owner's confirmation on live data (AC44 steps 2 and 3).
decided_by: owner ("These are the screens I want" and "Phone's own font", 2026-10-14, decisions/questions/P-001-design-pick.md)
proposed_by: orchestrator
reversibility: reversible

## L-0013 — The Orchestrator commits the Reviewer's verdict files verbatim; the owner's verdict stays the owner's
date: 2026-10-14
type: delegation
supersedes: []
scope: project
expires: never
asked: The Reviewer's verdict has to be saved as reviews/<PR>/reviewer.md before a pull request can go green. Who should add it?
decision: The Orchestrator commits it, word for word from the Reviewer's return, on PR #72 and future pull requests, as CLAUDE.md and reviews/README.md already describe. The owner's own verdict file (owner.md) is never written by an agent. PR #70's reviewer.md, which it merged without, is added under this entry; its owner.md is still the owner's to add. The record: decisions/questions/P-001-reviewer-verdict-files.md.
licenses_next: reviews/72/reviewer.md and reviews/70/reviewer.md in PR #72.
decided_by: owner ("You add it (Recommended)", 2026-10-14, decisions/questions/P-001-reviewer-verdict-files.md)
proposed_by: orchestrator
reversibility: reversible

## L-0014 — Trial-view notes 2: S-001's areas widened to the batch's record files, which its records commits had tagged "Spec: S-001"
date: 2026-10-16
type: ruling
supersedes: []
scope: project
expires: never
asked: The records commits of trial-view notes 2 (the owner's notes, the approved mockups, the audits and the MD2 sprints line) carried a "Spec: S-001" trailer, so v3_checks scope reads them as S-001 work outside its Areas touched. Earlier batches made such commits with no Spec: trailer. Rewriting the commit messages was refused as tampering with the audit trail. How to fix it?
decision: This entry widens S-001's areas, for the commits of orch/trial-view-2, to exactly the record files the check flags. Nothing is rewritten, and the history stays as made. From now on, records commits carry no "Spec:" trailer. The record: decisions/questions/P-001-batch2-records-scope.md.
extends_scope: decisions/questions/P-001-trial-view-notes-2.md, docs/PROJECT.md, docs/design/mockups/status-and-timeline.html, docs/design/mockups/other-screens.html, docs/design/mockups/audit-additions.html, docs/design/mockups/colour-swatches.html, docs/design/audits/2026-10-16-gap-audit-against-goals.md, docs/design/audits/2026-10-16-user-rep-missing-elements.md
licenses_next: The trial-view notes 2 pull request from orch/trial-view-2.
decided_by: owner ("Ledger entry (Recommended)", 2026-10-16, decisions/questions/P-001-batch2-records-scope.md)
proposed_by: orchestrator
reversibility: reversible

## L-0015 — Model v3.4.0 adopted: S-031's push trigger and S-032's why lines and pull-request Context and Why
date: 2026-10-17
type: ruling
supersedes: []
scope: project
expires: never
asked: The model is at v3.4.0 (its PRs #33 and #34: S-031 and S-032, c816cec). Bring Service Desk to it, as the owner asked on 2026-10-17 ("go ahead with the Service-Desk sync."): the push-run check fix, and the why lines on milestones and the Context and Why on every pull request?
decision: Copied byte for byte from the model at c816cec: governance/checks/ governance_checks.py and v3_checks.py (S-032). The model's changes to its v3 template are carried into this project's own copies, which differ from the template elsewhere: the governance workflow's push trigger reads `branches: [main, 'build/**']` (S-031); docs/SETUP.md takes S-031's corrected push sentences and S-032's merge-commit step, numbered 5 here; the playbook's new line; the Critic's card's two additions; AGENTS.md's "Context and why" paragraph; and docs/PROJECT.md's section 3 instruction line. OPERATING_MODEL_VERSION reads 3.4.0. The owner has turned on the merge-commit setting ("Additionally I changed the merge settings so we are good to go", 2026-10-17). Nothing written before is rewritten: a milestone line takes its why when it is next drafted or reworded, and the standard milestones get their lines when the project next plans a phase; since this project is already past its gates, each first standard line is an after-gate change (a line taken on with the Critic's check, a line skipped with the owner's ruling), as S-032's adoption says.
licenses_next: Pull requests in this project carry the Milestone line and the Context and Why sections from the one after this on. This pull request's merge is the first since the setting changed: its merge commit's first line is checked to end with (#<n>). S-001's next revision aligns AC61 with the model's final forms, corrects its line saying a merge commit's message begins "Merge pull request #<n>", and decides whether the deploy workflow's run title shows only the merge commit's first line.
decided_by: owner (asked for the sync on 2026-10-17; merges this pull request)
proposed_by: orchestrator
reversibility: reversible

## L-0016 — Model v3.5.0 adopted: every ask filed, the Chief of Staff's sessions recorded, a milestone's reached
date: 2026-10-17
type: ruling
supersedes: []
scope: project
expires: never
asked: The model is at v3.5.0 (its PR #35: S-033, 90f53e3). Bring Service Desk to it, as the owner asked on 2026-10-17 ("Proceed"): every ruling put to the owner filed first as a question with its milestone and context, the Chief of Staff's session lines, a milestone's reached mark by the owner's ruling, and the asks-merge workflow?
decision: Copied byte for byte from the model at 90f53e3: governance/checks/ governance_checks.py, v3_checks.py, record_checks.py, govlib.py, orchestrator.py, check_all.sh and the new asks_merge.py. The model's new template workflow .github/workflows/asks-merge.yml is copied with desk-build added to its trigger list, since desk-build checks every pull request here, and its setup-step number set to 6. The model's template changes are carried into this project's own copies: AGENTS.md's S-033 paragraphs; decisions/README.md's answer form; docs/PROJECT.md's section 3 reached sentence; docs/SETUP.md's asks-merge step, numbered 6 here; sessions/chief-of-staff/** in the Chief of Staff's lane (questions/** already was); sessions/** in R0; and the v3 question template, with its Milestone line and Context section. The answered question file questions/P-001-design-lab-open.md is removed; the AC66 desk test that read it now reads its frozen copy, tests/desk/fixtures/trial-view/P-001-design-lab-open.md, byte for byte the same (the Builder, under S-001). OPERATING_MODEL_VERSION reads 3.5.0. Nothing written before is rewritten.
licenses_next: From this merge on, every ruling put to the owner here is filed first as a question, and the Chief of Staff records its sessions in sessions/chief-of-staff/. S-001's next revision has the desk read the new records (open questions with their milestone and context, the Chief of Staff's sessions, a milestone's reached mark) and accept the reached part before any line carries one; only then is M1 marked reached from its acceptance record, and the owner is asked about M2 and M2B through filed questions.
decided_by: owner (asked for the sync on 2026-10-17; merges this pull request)
proposed_by: orchestrator
reversibility: reversible

## L-0017 — The asks-merge delegation: the Orchestrator's asks-merge workflow merges pull requests that only file or close the owner's asks or add the Chief of Staff's session lines
date: 2026-10-17
type: delegation
supersedes: []
scope: project
expires: never
asked: May the Orchestrator's asks-merge workflow merge pull requests that only file a question, close one with a reversible answer, tidy away one already answered, or add the Chief of Staff's session lines, once every check on the exact commit has passed, so a filed ask reaches the desk within minutes? (Model S-033 AC4.)
decision: asks-merge: granted, until the owner withdraws it by a later delegation entry superseding this one, with a decision beginning "asks-merge withdrawn:". The workflow merges only the four kinds S-033 AC4 lists, each merge commit naming this entry; code, specs, deploys, verdicts, decision cards, unasked rulings, withdrawals, timeouts and answers that cannot be undone wait for the owner. No agent session merges a pull request.
licenses_next: The asks-merge workflow's merges in this project, from this pull request's merge on.
options_considered: "You merge each ask"; "Desk reads unmerged asks"; "Record after only".
decided_by: owner ("Agents merge asks (Recommended)", 2026-10-17, decisions/questions/P-001-asks-merge.md)
proposed_by: orchestrator
reversibility: reversible

## L-0018 — A Design reviewer: a domain reviewer whose verdict changes to the page's code need, judged for every project the desk shows
date: 2026-10-19
type: ruling
supersedes: []
scope: project
expires: never
asked: The owner asked for "a new agent, or a responsibility for an existing agent" with "an inscrutable eye for modern UI", keeping the desk clean, light and modern and serving the project's intent, not a "live database" look and not an "AI generated doppleganger" (docs/design/references/owner-request-2026-10-19-design-steward.md). The owner later asked "how does the design review process work? Is it a new agent? Or a milestone? Or what" (same file). The orchestrator answered in the session with this setup: a new domain reviewer with a rulebook, a required verdict on the page's code and periodic audits. The owner's verdict on this pull request decides it.
decision: design-reviewer joins the roster as a read-only reviewer with the design domain pack (governance/domains/design/README.md). Its verdict is required on src/public/** (governance/risk-paths.toml), without raising a change's risk class. It audits the whole desk at each Design milestone's acceptance and monthly. It judges each change as a frame for every project under the operating model, checked against the test data that exists for Service-Desk, the operating model's own repository and the extremes case; the inventory's made-up project joins once it has test data. Until the session runner lists it, the orchestrator dispatches it by hand.
licenses_next: reviews/<PR>/design-reviewer.md on every pull request that changes src/public/**, from this pull request's merge on; docs/design/audit-<date>.md audits.
options_considered: "A new domain reviewer" (proposed); "A responsibility added to the existing Reviewer"; "A one-off audit only".
decided_by: owner (the owner's verdict on this pull request)
proposed_by: orchestrator
reversibility: reversible
