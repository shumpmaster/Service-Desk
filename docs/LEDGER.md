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

## L-0019 — Overnight proxy: the Orchestrator works on and merges reviewed pull requests for six hours while the owner sleeps
date: 2026-10-25
type: delegation
supersedes: []
scope: project
expires: 2026-10-25
asked: none; the owner said in the session (session_017seyaGqUxAff6E8dKWHDCR, 2026-10-25 03:36 UTC): "I'm going to bed, you have my permission to act as my proxy to work through the night for the next 6 hours".
decision: Until 09:36 UTC on the expiry date, the Orchestrator goes on with the plan after the glance audit (M3E's stages, then the plan's order) and may merge a pull request itself when every verdict its risk class needs is recorded as PASS, CI on its head is green apart from the owner signal, it has no conflict and its Tasks are all ticked or explained: records (R0) and the desk's code (R1) only, read as narrowly as L-0010 and the owner's earlier "Merge low-risk only" allow, widened to R1 by the owner's words "act as my proxy". Each merge commit names this entry, and each is listed for the owner when they are back. Governance changes (R3), any owner verdict file, deploy approvals, gate rulings and the owner's open questions are not answered or done by proxy; they wait for the owner, and a question's own default and timeout apply as written. Nothing irreversible is done.
licenses_next: The merges of M3E's reviewed stage pull requests, and their records, until 09:36 UTC on 2026-10-25.
options_considered: "Work only, merge nothing" (the owner's words grant more); "Full authority, R3 and verdicts included" (beyond what a proxy should do unasked, and against L-0010's line on verdicts).
decided_by: owner ("you have my permission to act as my proxy to work through the night for the next 6 hours", 2026-10-25, in the session)
proposed_by: orchestrator
reversibility: reversible

## L-0020 — After launch, four settings jobs on the desk are running it, past L-0003's end
date: 2026-10-31
type: ruling
supersedes: []
scope: P-001 (specs/S-001.md)
expires: never
asked: L-0003 lets the Builder change the desk from the draft S-001 only "until P-001 launches (S-001 AC28) or is stopped", and a graduated product's other work comes back as new work. After Service-Desk graduates, are four routine settings changes running the desk, or new work each time? (decisions/questions/P-001-graduated-changes.md, filed at 15ad528 after the Critic's two checks.)
decision: Running the desk. From launch on, these four jobs only stay in the Builder's lane against S-001 as it stands at launch: adding a project (AC26), moving a project from v2.5 to v3, changing the notification key after a leak, and taking the tap's address back in a rollback. Each is the Builder's pull request, reviewed by the Reviewer and the Design reviewer, with the owner's verdict, as the operating notes (docs/handover/desk-operations.md) and the handover package (docs/handover/service-desk.md) say. Anything else after launch is new work: a fix through a short Design, an addition through a small Discovery.
licenses_next: The Builder's pull requests for those four jobs after launch.
options_considered: "As new work each time" (1 to 2 days and 15 to 30 owner minutes each, an estimate; the operating notes would break their under-10-minutes promise and a rollback mid-incident would wait days).
decided_by: owner (decisions/questions/P-001-graduated-changes.md, A)
proposed_by: orchestrator
reversibility: costly

## L-0021 — Exception: the desk's tests are fixed directly so that adding a project changes only the settings file
date: 2026-11-01
type: ruling
supersedes: []
scope: P-001 (specs/S-001.md)
expires: never
asked: Adding Model-Lab (the settings job "adding a project", L-0020) made 50 of the desk's tests fail, because they expect exactly the two projects of today. The model's re-entry rule (§3) sends a graduated product's change to its tests through a small Discovery; the handover sends a defect fix through a short Design. Which route? (decisions/questions/P-001-add-project-tests.md, filed in PR #261 after the Critic's two checks.)
decision: A, as an exception neither rule provides: the desk's tests are changed so they no longer depend on the live project list, and Model-Lab's row is added where the list is written out; then the one-line settings change lands. Made by a separate Builder session on a different model from the settings change (the tests are in the Builder's lane, not the check author's), reviewed by the Reviewer and the Design reviewer, with the owner's verdict and merge, and the two deploy approvals. This sets a precedent for fixing a graduated product's tests without a Discovery; it covers only this change.
licenses_next: The Builder's pull request for the test change and the Model-Lab entry.
options_considered: B, a small Discovery for the desk (the model's rule; slower, a day or more by estimate). C, leaving Model-Lab off the desk (every later addition hits the same failures).
decided_by: owner (decisions/questions/P-001-add-project-tests.md, A)
proposed_by: chief-of-staff
reversibility: reversible

## L-0022 — Model v3.7.0 adopted: a later project item may have a plan of its own, and is judged on it
date: 2026-11-05
type: ruling
supersedes: []
scope: project
expires: never
asked: The model is at v3.7.0 (its PR #46: S-035, bbe010f). Bring Service Desk to it, as the owner asked on 2026-11-05 ("then take the desk's adoption of 3.7.0"): a later project item may have a plan of its own in docs/projects/<item>.md, and the checks judge each item on its own plan?
decision: Copied byte for byte from the model at bbe010f: governance/checks/ v3_checks.py, orchestrator.py, govlib.py and governance_checks.py (each was byte-identical to the model's copy at 226f1c5). The model's template-v3 changes from 226f1c5 to bbe010f are carried into this project's own copies, keeping the desk's own lines: governance/PACKS.toml's nine pack lines, BRIEFS.toml's four brief lines, SURFACES.md's two docs/projects/** lines; the builder, critic, definer and researcher cards; docs/SETUP.md, docs/gates/_GATE.md, docs/users/_PROFILE.md, intake/requests/README.md; docs/PROJECT.md's section 3 instruction line only; docs/projects/README.md and _TEMPLATE.md (a byte-for-byte copy of the model's plan form). OPERATING_MODEL_VERSION reads 3.7.0. P-003 and P-004 keep their ` · for:` path; their Discovery-2 and Discovery-7 now read not recorded, as S-035 says. The Chief of Staff's card gains its S-035 lines wherever it lives; no file of it is in a repository this session reaches. Nothing written before is rewritten.
licenses_next: The briefing work (P-002) files its project request with docs/projects/P-002.md; P-003's plan is rewritten as docs/projects/P-003.md (decisions/questions/P-003-plan-place.md). The desk's own reading of the plans folder is S-001's (J1), and the design-reviewer pack gains its docs/projects/{item}.md line in a later change (reviews/302, N8).
decided_by: owner (asked for the sync on 2026-11-05; merges this pull request)
proposed_by: chief-of-staff
reversibility: reversible

## L-0023 — Model v3.7.2 adopted: the check run's copy leaves out design images and lets large text through, and a cut-short history reports the sprint-merged test
date: 2026-11-05
type: ruling
supersedes: []
scope: project
expires: never
asked: The model is at v3.7.2: S-036 (3.7.1, the check run's copy) and S-037 (3.7.2, a cut-short history). Bring Service Desk to it, as the owner asked on 2026-11-05 ("Then plan and make the desk's model sync to 3.7.2 (S-036 and S-037 together, with the workflow's tree untar line)"), so the card fix's first check run is neither refused on the desk's large files nor failed on nine lines that are not the builder's?
decision: Copied byte for byte from the model at b18259c (its pull request for 3.7.2): governance/checks/ orchestrator_git.py, session_runner.py and v3_checks.py (each was byte-identical to the model's copy at bbe010f before it). The workflow's tree untar line gains ` --check-tree` with them, as the model's CHANGELOG 3.7.1 says the two go together; .github/workflows/orchestrator.yml is then byte-identical to the model's template-v3 copy. OPERATING_MODEL_VERSION reads 3.7.2. Also the design-reviewer pack may read docs/projects/{item}.md (reviews/302, N8, carried in L-0022). This pull request merges after the model's 3.7.2 pull request.
licenses_next: P-003's check runs on the desk's full tree; P-002 reaches design review with its own plan in the pack.
decided_by: owner (asked for the sync on 2026-11-05; merges this pull request)
proposed_by: chief-of-staff
reversibility: reversible

## L-0024 — The plan-writer's commit 57c024b (EXP-007 draft 1 (its pre-registration)) is exempt from the range checks
date: 2026-11-05
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The nine Definer commits that wrote experiments/EXP-007-widget-refresh.md carry `Spec: P-004`, which the scope check never accepts (it takes only `S-nnn`, read at each commit), so PR #300's governance check fails; they are pushed and can't be rewritten. How should they get past it? (questions/P-004-registration-commits.md, read cold by the Critic, reviews/P-004-registration-commits/critic.md.)
decision: Exempt 57c024b8a9f2717008243d37b77d51a0e955e605 (governance/SURFACES.md exempt block). It changes only experiments/EXP-007-widget-refresh.md, in the Definer's own lane, and passed surface_guard diff before the exemption ("OK: 9 commit(s) … checked", 2026-11-05). The scope check and surface_guard skip it from now on.
licenses_next: PR #300's governance check passes; the answer is recorded in decisions/questions/P-004-registration-commits.md once #300 is on the default branch.
options_considered: B, merging #300 with the scope check red. C, changing the scope check so a Definer commit may name a project item (R3, its own plan and reviews; #300 would wait).
decided_by: owner ("Exempt the nine commits (Recommended)", 2026-11-05, asked in session session_01QBwHGNFKViyibzxHx5qTtm; merges PR #300)
proposed_by: chief-of-staff
reversibility: reversible

## L-0025 — The plan-writer's commit 3dd65a5 (EXP-007 draft 1, the log's route and the key) is exempt from the range checks
date: 2026-11-05
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The nine Definer commits that wrote experiments/EXP-007-widget-refresh.md carry `Spec: P-004`, which the scope check never accepts (it takes only `S-nnn`, read at each commit), so PR #300's governance check fails; they are pushed and can't be rewritten. How should they get past it? (questions/P-004-registration-commits.md, read cold by the Critic, reviews/P-004-registration-commits/critic.md.)
decision: Exempt 3dd65a5ad0845f974fcf554530272e44d208e481 (governance/SURFACES.md exempt block). It changes only experiments/EXP-007-widget-refresh.md, in the Definer's own lane, and passed surface_guard diff before the exemption ("OK: 9 commit(s) … checked", 2026-11-05). The scope check and surface_guard skip it from now on.
licenses_next: PR #300's governance check passes; the answer is recorded in decisions/questions/P-004-registration-commits.md once #300 is on the default branch.
options_considered: B, merging #300 with the scope check red. C, changing the scope check so a Definer commit may name a project item (R3, its own plan and reviews; #300 would wait).
decided_by: owner ("Exempt the nine commits (Recommended)", 2026-11-05, asked in session session_01QBwHGNFKViyibzxHx5qTtm; merges PR #300)
proposed_by: chief-of-staff
reversibility: reversible

## L-0026 — The plan-writer's commit e11b6f4 (EXP-007 draft 2) is exempt from the range checks
date: 2026-11-05
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The nine Definer commits that wrote experiments/EXP-007-widget-refresh.md carry `Spec: P-004`, which the scope check never accepts (it takes only `S-nnn`, read at each commit), so PR #300's governance check fails; they are pushed and can't be rewritten. How should they get past it? (questions/P-004-registration-commits.md, read cold by the Critic, reviews/P-004-registration-commits/critic.md.)
decision: Exempt e11b6f4321d25702347097502ad7214146a5f01c (governance/SURFACES.md exempt block). It changes only experiments/EXP-007-widget-refresh.md, in the Definer's own lane, and passed surface_guard diff before the exemption ("OK: 9 commit(s) … checked", 2026-11-05). The scope check and surface_guard skip it from now on.
licenses_next: PR #300's governance check passes; the answer is recorded in decisions/questions/P-004-registration-commits.md once #300 is on the default branch.
options_considered: B, merging #300 with the scope check red. C, changing the scope check so a Definer commit may name a project item (R3, its own plan and reviews; #300 would wait).
decided_by: owner ("Exempt the nine commits (Recommended)", 2026-11-05, asked in session session_01QBwHGNFKViyibzxHx5qTtm; merges PR #300)
proposed_by: chief-of-staff
reversibility: reversible

## L-0027 — The plan-writer's commit ddc67fb (EXP-007 draft 2, its failure cases) is exempt from the range checks
date: 2026-11-05
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The nine Definer commits that wrote experiments/EXP-007-widget-refresh.md carry `Spec: P-004`, which the scope check never accepts (it takes only `S-nnn`, read at each commit), so PR #300's governance check fails; they are pushed and can't be rewritten. How should they get past it? (questions/P-004-registration-commits.md, read cold by the Critic, reviews/P-004-registration-commits/critic.md.)
decision: Exempt ddc67fb8602b7ef7af5955edfda5a6d2505db4d0 (governance/SURFACES.md exempt block). It changes only experiments/EXP-007-widget-refresh.md, in the Definer's own lane, and passed surface_guard diff before the exemption ("OK: 9 commit(s) … checked", 2026-11-05). The scope check and surface_guard skip it from now on.
licenses_next: PR #300's governance check passes; the answer is recorded in decisions/questions/P-004-registration-commits.md once #300 is on the default branch.
options_considered: B, merging #300 with the scope check red. C, changing the scope check so a Definer commit may name a project item (R3, its own plan and reviews; #300 would wait).
decided_by: owner ("Exempt the nine commits (Recommended)", 2026-11-05, asked in session session_01QBwHGNFKViyibzxHx5qTtm; merges PR #300)
proposed_by: chief-of-staff
reversibility: reversible

## L-0028 — The plan-writer's commit 7fdeedc (EXP-007 draft 3) is exempt from the range checks
date: 2026-11-05
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The nine Definer commits that wrote experiments/EXP-007-widget-refresh.md carry `Spec: P-004`, which the scope check never accepts (it takes only `S-nnn`, read at each commit), so PR #300's governance check fails; they are pushed and can't be rewritten. How should they get past it? (questions/P-004-registration-commits.md, read cold by the Critic, reviews/P-004-registration-commits/critic.md.)
decision: Exempt 7fdeedcbbaecf80e5b9189e979b6292e9d000fbd (governance/SURFACES.md exempt block). It changes only experiments/EXP-007-widget-refresh.md, in the Definer's own lane, and passed surface_guard diff before the exemption ("OK: 9 commit(s) … checked", 2026-11-05). The scope check and surface_guard skip it from now on.
licenses_next: PR #300's governance check passes; the answer is recorded in decisions/questions/P-004-registration-commits.md once #300 is on the default branch.
options_considered: B, merging #300 with the scope check red. C, changing the scope check so a Definer commit may name a project item (R3, its own plan and reviews; #300 would wait).
decided_by: owner ("Exempt the nine commits (Recommended)", 2026-11-05, asked in session session_01QBwHGNFKViyibzxHx5qTtm; merges PR #300)
proposed_by: chief-of-staff
reversibility: reversible

## L-0029 — The plan-writer's commit 514675d (EXP-007 draft 3, from the widget at 4a2684e) is exempt from the range checks
date: 2026-11-05
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The nine Definer commits that wrote experiments/EXP-007-widget-refresh.md carry `Spec: P-004`, which the scope check never accepts (it takes only `S-nnn`, read at each commit), so PR #300's governance check fails; they are pushed and can't be rewritten. How should they get past it? (questions/P-004-registration-commits.md, read cold by the Critic, reviews/P-004-registration-commits/critic.md.)
decision: Exempt 514675db43d90a44ce0a05a141ed07769100e601 (governance/SURFACES.md exempt block). It changes only experiments/EXP-007-widget-refresh.md, in the Definer's own lane, and passed surface_guard diff before the exemption ("OK: 9 commit(s) … checked", 2026-11-05). The scope check and surface_guard skip it from now on.
licenses_next: PR #300's governance check passes; the answer is recorded in decisions/questions/P-004-registration-commits.md once #300 is on the default branch.
options_considered: B, merging #300 with the scope check red. C, changing the scope check so a Definer commit may name a project item (R3, its own plan and reviews; #300 would wait).
decided_by: owner ("Exempt the nine commits (Recommended)", 2026-11-05, asked in session session_01QBwHGNFKViyibzxHx5qTtm; merges PR #300)
proposed_by: chief-of-staff
reversibility: reversible

## L-0030 — The plan-writer's commit 389dd68 (EXP-007 draft 4) is exempt from the range checks
date: 2026-11-05
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The nine Definer commits that wrote experiments/EXP-007-widget-refresh.md carry `Spec: P-004`, which the scope check never accepts (it takes only `S-nnn`, read at each commit), so PR #300's governance check fails; they are pushed and can't be rewritten. How should they get past it? (questions/P-004-registration-commits.md, read cold by the Critic, reviews/P-004-registration-commits/critic.md.)
decision: Exempt 389dd68d5a76d7949a5476a0184dbaaa5e286ad9 (governance/SURFACES.md exempt block). It changes only experiments/EXP-007-widget-refresh.md, in the Definer's own lane, and passed surface_guard diff before the exemption ("OK: 9 commit(s) … checked", 2026-11-05). The scope check and surface_guard skip it from now on.
licenses_next: PR #300's governance check passes; the answer is recorded in decisions/questions/P-004-registration-commits.md once #300 is on the default branch.
options_considered: B, merging #300 with the scope check red. C, changing the scope check so a Definer commit may name a project item (R3, its own plan and reviews; #300 would wait).
decided_by: owner ("Exempt the nine commits (Recommended)", 2026-11-05, asked in session session_01QBwHGNFKViyibzxHx5qTtm; merges PR #300)
proposed_by: chief-of-staff
reversibility: reversible

## L-0031 — The plan-writer's commit 4184785 (EXP-007 draft 5) is exempt from the range checks
date: 2026-11-05
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The nine Definer commits that wrote experiments/EXP-007-widget-refresh.md carry `Spec: P-004`, which the scope check never accepts (it takes only `S-nnn`, read at each commit), so PR #300's governance check fails; they are pushed and can't be rewritten. How should they get past it? (questions/P-004-registration-commits.md, read cold by the Critic, reviews/P-004-registration-commits/critic.md.)
decision: Exempt 4184785b67ebfa6e4b05d840b5c9d50f262cde66 (governance/SURFACES.md exempt block). It changes only experiments/EXP-007-widget-refresh.md, in the Definer's own lane, and passed surface_guard diff before the exemption ("OK: 9 commit(s) … checked", 2026-11-05). The scope check and surface_guard skip it from now on.
licenses_next: PR #300's governance check passes; the answer is recorded in decisions/questions/P-004-registration-commits.md once #300 is on the default branch.
options_considered: B, merging #300 with the scope check red. C, changing the scope check so a Definer commit may name a project item (R3, its own plan and reviews; #300 would wait).
decided_by: owner ("Exempt the nine commits (Recommended)", 2026-11-05, asked in session session_01QBwHGNFKViyibzxHx5qTtm; merges PR #300)
proposed_by: chief-of-staff
reversibility: reversible

## L-0032 — The plan-writer's commit ad2709e (EXP-007 draft 6, the frozen version) is exempt from the range checks
date: 2026-11-05
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The nine Definer commits that wrote experiments/EXP-007-widget-refresh.md carry `Spec: P-004`, which the scope check never accepts (it takes only `S-nnn`, read at each commit), so PR #300's governance check fails; they are pushed and can't be rewritten. How should they get past it? (questions/P-004-registration-commits.md, read cold by the Critic, reviews/P-004-registration-commits/critic.md.)
decision: Exempt ad2709e20faddd72483acc0a21ce2aeaacecb73c (governance/SURFACES.md exempt block). It changes only experiments/EXP-007-widget-refresh.md, in the Definer's own lane, and passed surface_guard diff before the exemption ("OK: 9 commit(s) … checked", 2026-11-05). The scope check and surface_guard skip it from now on.
licenses_next: PR #300's governance check passes; the answer is recorded in decisions/questions/P-004-registration-commits.md once #300 is on the default branch.
options_considered: B, merging #300 with the scope check red. C, changing the scope check so a Definer commit may name a project item (R3, its own plan and reviews; #300 would wait).
decided_by: owner ("Exempt the nine commits (Recommended)", 2026-11-05, asked in session session_01QBwHGNFKViyibzxHx5qTtm; merges PR #300)
proposed_by: chief-of-staff
reversibility: reversible

## L-0033 — The Builder's commit c7086cd (EXP-007's result) is exempt from the range checks
date: 2026-11-07
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The widget test's result is the Builder's to file (experiments/EXP-007-widget-refresh.md, "result:"), and the scope check fails every builder commit without an S-numbered spec, which P-004 can get only at its Design gate. How should the result be filed? (questions/P-004-result-spec.md, read cold by the Critic, reviews/P-004-result-spec/critic.md, PASS at round 3.)
decision: Exempt c7086cde9e20d626e204ab7ca89c24b6897f02b5 (governance/SURFACES.md exempt block). It adds only docs/handover/experiments/EXP-007-result.md, in the Builder's own lane, carries no Spec: trailer on purpose, and passed surface_guard diff before the exemption ("OK: 1 commit(s) … checked", 2026-11-07). The scope check and surface_guard skip it from now on. The first planned entry under the ruling; the second test's commits are exempted the same way, each with its own entry.
licenses_next: The result is on the default branch once this pull request merges; then the owner deletes the portfolio branch exp-007-test-data and the phone's test data (experiments/EXP-007-widget-refresh.md, Method 7).
options_considered: B, keeping the Reviewer's record as the result; C, waiting for P-004's spec; D, changing the check through the operating model (questions/P-004-result-spec.md).
decided_by: owner ("Exempt each such commit (Recommended)", 2026-11-06, asked in session session_01QBwHGJ3UVJ6HY4SS92w7UW; recorded by the owner in decisions/questions/P-004-result-spec.md, "Ruling: A"; merges this pull request)
proposed_by: chief-of-staff
reversibility: reversible

## L-0034 — The plan-writer's commit 712c951 (EXP-008 draft 1) is exempt from the range checks
date: 2026-11-07
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The second widget test's registration is the Definer's to write, and the scope check fails every builder-class commit without an S-numbered spec, which P-004 can get only at its Design gate. How should such commits be filed? (questions/P-004-result-spec.md, read cold by the Critic, reviews/P-004-result-spec/critic.md, PASS at round 3; its option A names the second test's plan commits.)
decision: Exempt 712c951f164f5b5344106acb9f2ec237afb94436 (governance/SURFACES.md exempt block). It changes only experiments/EXP-008-widget-refresh-documents.md, in the Definer's own lane, carries no Spec: trailer on purpose, and passed surface_guard diff before the exemption ("OK: 3 commit(s) in origin/main..build/definer/p004-exp008 checked", 2026-11-07). The scope check and surface_guard skip it from now on. One of the three Definer commits of EXP-008, each with its own entry.
licenses_next: EXP-008's registration is on the default branch once this pull request merges, frozen at 9328cfc after the Critic's PASS at round 3 (reviews/EXP-008/critic.md) and the Reviewer's PASS of the test widget at 92caf00 (reviews/EXP-008/_reviewer-widget-92caf00.md); then the owner gets the install steps.
options_considered: B, keeping the Reviewer's record as the result; C, waiting for P-004's spec; D, changing the check through the operating model (questions/P-004-result-spec.md).
decided_by: owner ("Exempt each such commit (Recommended)", 2026-11-06, asked in session session_01QBwHGJ3UVJ6HY4SS92w7UW; recorded by the owner in decisions/questions/P-004-result-spec.md, "Ruling: A"; merges this pull request)
proposed_by: chief-of-staff
reversibility: reversible

## L-0035 — The plan-writer's commit cd98e5f (EXP-008 draft 2) is exempt from the range checks
date: 2026-11-07
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The second widget test's registration is the Definer's to write, and the scope check fails every builder-class commit without an S-numbered spec, which P-004 can get only at its Design gate. How should such commits be filed? (questions/P-004-result-spec.md, read cold by the Critic, reviews/P-004-result-spec/critic.md, PASS at round 3; its option A names the second test's plan commits.)
decision: Exempt cd98e5f08cdfce990360dd0b3cc5958ccb3bc6ca (governance/SURFACES.md exempt block). It changes only experiments/EXP-008-widget-refresh-documents.md, in the Definer's own lane, carries no Spec: trailer on purpose, and passed surface_guard diff before the exemption ("OK: 3 commit(s) in origin/main..build/definer/p004-exp008 checked", 2026-11-07). The scope check and surface_guard skip it from now on. One of the three Definer commits of EXP-008, each with its own entry.
licenses_next: EXP-008's registration is on the default branch once this pull request merges, frozen at 9328cfc after the Critic's PASS at round 3 (reviews/EXP-008/critic.md) and the Reviewer's PASS of the test widget at 92caf00 (reviews/EXP-008/_reviewer-widget-92caf00.md); then the owner gets the install steps.
options_considered: B, keeping the Reviewer's record as the result; C, waiting for P-004's spec; D, changing the check through the operating model (questions/P-004-result-spec.md).
decided_by: owner ("Exempt each such commit (Recommended)", 2026-11-06, asked in session session_01QBwHGJ3UVJ6HY4SS92w7UW; recorded by the owner in decisions/questions/P-004-result-spec.md, "Ruling: A"; merges this pull request)
proposed_by: chief-of-staff
reversibility: reversible

## L-0036 — The plan-writer's commit 9328cfc (EXP-008 draft 3, the frozen version) is exempt from the range checks
date: 2026-11-07
type: ruling
supersedes: []
scope: P-004
expires: never
asked: The second widget test's registration is the Definer's to write, and the scope check fails every builder-class commit without an S-numbered spec, which P-004 can get only at its Design gate. How should such commits be filed? (questions/P-004-result-spec.md, read cold by the Critic, reviews/P-004-result-spec/critic.md, PASS at round 3; its option A names the second test's plan commits.)
decision: Exempt 9328cfc05dcd76898f9869693386c52f99dc0521 (governance/SURFACES.md exempt block). It changes only experiments/EXP-008-widget-refresh-documents.md, in the Definer's own lane, carries no Spec: trailer on purpose, and passed surface_guard diff before the exemption ("OK: 3 commit(s) in origin/main..build/definer/p004-exp008 checked", 2026-11-07). The scope check and surface_guard skip it from now on. One of the three Definer commits of EXP-008, each with its own entry.
licenses_next: EXP-008's registration is on the default branch once this pull request merges, frozen at 9328cfc after the Critic's PASS at round 3 (reviews/EXP-008/critic.md) and the Reviewer's PASS of the test widget at 92caf00 (reviews/EXP-008/_reviewer-widget-92caf00.md); then the owner gets the install steps.
options_considered: B, keeping the Reviewer's record as the result; C, waiting for P-004's spec; D, changing the check through the operating model (questions/P-004-result-spec.md).
decided_by: owner ("Exempt each such commit (Recommended)", 2026-11-06, asked in session session_01QBwHGJ3UVJ6HY4SS92w7UW; recorded by the owner in decisions/questions/P-004-result-spec.md, "Ruling: A"; merges this pull request)
proposed_by: chief-of-staff
reversibility: reversible

## L-0037 — The Definer's pack gains the join-up review form
date: 2026-11-08
type: ruling
supersedes: []
scope: project
expires: never
asked: The Definer's pack has no docs/design/**, so it cannot read docs/design/JOIN_UP_REVIEW.md, the form a spec's join-up review section must follow (S-024 AC7; .claude/agents/critic.md), though the Critic's pack has it. S-004's third plan review and S-005's first both failed on that section (reviews/S-005/plan.md on item/P-003; triage/P-003.md). Approve adding the one file to the Definer's may_read? Put in session, not first filed as a question file (AGENTS.md §5, model S-033): the Chief of Staff's slip.
decision: governance/PACKS.toml [roles.definer] may_read gains "docs/design/JOIN_UP_REVIEW.md", that file only. Measured: a Definer pack built by governance/checks/session_runner.py pack for P-003/S-005 from main's tree at 65e0c00 holds 119 files before and 120 after (from item/P-003's tree, 116 and 117, by the Reviewer); the one added file is docs/design/JOIN_UP_REVIEW.md.
licenses_next: The Definer's next session at Design reads the form, so its join-up section can follow it. The same gap in the model's template (Personal-Org-Operating-Model template-v3/governance/PACKS.toml) is raised there separately.
options_considered: Leave the pack as it is and let the Definer copy the form from the Critic's review; add all of docs/design/** (more than the Definer needs).
decided_by: owner ("i approve the fix", 2026-11-08, asked in session session_01QBwHGKhJ6vt6gamzfUwHwc; recorded in decisions/questions/definer-join-up-form.md; merges this pull request)
proposed_by: chief-of-staff
reversibility: reversible

## L-0038 — The Check author's commits are bounded by its own surface in the scope check
date: 2026-11-09
type: ruling
supersedes: []
scope: project
expires: never
asked: The Check author wrote S-005's locked tests twice (P-003, orchestrator runs 832 and 833), and both times the record step refused them: `v3_checks.py scope` judged every file under checks/S-005/ and tests/acceptance/S-005/ "outside the Areas touched of S-005". The check bounds only the Definer by its own surface (model S-019 AC1); the Check author's surface (governance/SURFACES.md, tests/acceptance/** and checks/**) is in no spec's areas touched. Approve a fix that gives the Check author the same lane? Filed first as questions/P-003-check-author-scope.md (#339). The fix landed in #341 without this entry; this entry and its register row follow it.
decision: governance/checks/v3_checks.py `check_scope` bounds a spec-scoped commit by the Check author, like one by the Definer, by that role's own surface, and reports such paths in a separate "check-author-lane" note; every other builder is judged against the spec's Areas touched as before. Measured on a replay: a Check author commit on item/P-003 (`Spec: S-005`) touching checks/S-005/INDEX.md and tests/acceptance/S-005/rule.test.mjs fails the check before (2 violations) and passes after; a Builder commit into tests/acceptance/S-005/ and a Check author commit to a path outside both its surface and the areas still fail (1 violation each).
licenses_next: A `retry` on P-003's failure card dispatches the Check author, whose locked tests the record step can now push. The same gap in the operating model (Personal-Org-Operating-Model tools/v3_checks.py) is raised there separately.
options_considered: Re-specify S-005 with the two test folders in its areas touched (this project only, another spec round); a one-off ledger widening of S-005's areas on item/P-003 (this project only, needs an Orchestrator session).
decided_by: owner ("A: approve fix (Recommended)", 2026-11-09, asked in session session_01QBwHGLyWwT6VLiL5hC3LpG, and the same answer, "A: approve the fix (Recommended)", in session session_01QBwHGNazv3PGnrNErBEZfX; recorded in decisions/questions/P-003-check-author-scope.md; the fix merged by the owner in #341)
proposed_by: chief-of-staff
reversibility: reversible

## L-0039 — The Check author may read its own locked checks, to revise them on a Critic FAIL
date: 2026-11-09
type: ruling
supersedes: []
scope: project
expires: never
asked: The Critic failed S-005's locked checks (P-003, reviews/S-005/_critic-checks.md) and route checks-fail sent them back to the Check author, but its pack (governance/PACKS.toml `[roles.check-author]`) held no tests/acceptance/ or checks/ file, so its round-2 session (orchestrator run 847) changed nothing and reported that the files it was asked to revise were missing; the outcome was still `ok`. Approve a fix that lets the Check author read its own checks? Filed first as questions/P-003-check-author-pack.md (#343).
decision: governance/PACKS.toml `[roles.check-author]` may_read gains tests/acceptance/** and checks/**, the paths the Critic, Builder and Reviewer already read; holdouts are always excluded and its must_not_see (src/**, docs/handover/**, docs/reports/**) is unchanged. Measured with `session_runner.py pack` for the round-2 entry on item/P-003: 4 files besides the library and playbooks before, 23 after (checks/S-005's mutants and rubric, both READMEs and the 15 scripts in tests/acceptance/S-005 added), with no src/ in either.
licenses_next: The Check author's next dispatch on P-003 sees its checks with the Critic's findings and can revise them. The same gap in the operating model (Personal-Org-Operating-Model template-v3/governance/PACKS.toml) is raised there.
options_considered: No fix, letting the rounds run out to a stop card (fixes nothing, wastes two or three rounds); fixing it in the operating model first and bringing it with the next sync (P-003 waits).
decided_by: owner ("A: approve the fix (Recommended)", 2026-11-09, asked in session session_01QBwHGN37HCacjWVWzYVhq5; recorded in decisions/questions/P-003-check-author-pack.md)
proposed_by: chief-of-staff
reversibility: reversible

## L-0040 — The Critic may read the specs a new spec supersedes, to check what it carries forward
date: 2026-11-10
type: ruling
supersedes: []
scope: project
expires: never
asked: The owner ruled that S-006 carry S-005 forward unchanged (decisions/P-003/stop-11.md). The Critic failed S-006's plan review three times (P-003, 2026-11-09 20:41Z and 21:16Z, 2026-11-10 03:28Z), each time because specs/S-005.md was not in its pack (governance/PACKS.toml `[roles.critic]` may read no spec but the one under review), so the "unchanged" claim could not be verified. Approve a fix that lets the Critic read specs/**, as the Definer does? Filed first as questions/P-003-critic-superseded-specs.md (#346).
decision: governance/PACKS.toml `[roles.critic]` may_read gains specs/**; its must_not_see (docs/reports/**, docs/briefs/**) is unchanged, and the critic-triage and critic-gate entries are unchanged. Measured with `session_runner.py pack` for the plan-review entry on item/P-003: specs/S-006.md only before, specs S-002 to S-006, specs/_TEMPLATE.md and specs/S-005.facts.tmp after, with no other file changed.
licenses_next: The plan review of a spec that supersedes another can compare the two. The same gap in the operating model (Personal-Org-Operating-Model template-v3/governance/PACKS.toml) is raised there.
options_considered: No fix, with the next spec dropping its "unchanged" claim (breaks the link to the approved criteria); an Orchestrator-attached diff of the two specs (a pack-builder code change and an Orchestrator session).
decided_by: owner ("A: approve the fix (Recommended)", 2026-11-10, asked in session session_01QBwHGN37HCacjWVWzYVhq5; recorded in decisions/questions/P-003-critic-superseded-specs.md)
proposed_by: chief-of-staff
reversibility: reversible

## L-0042 — The loop's timer gaps are raised in the operating model; nothing on the desk changes
date: 2026-11-11
type: ruling
supersedes: []
scope: project
expires: never
asked: The loop's timer (.github/workflows/orchestrator.yml, every 30 minutes) fired about 40 times from 2026-10-31 15:02Z to 2026-11-10 11:30Z, 4 to 8 hours apart. With the chain cap of five self-starts (model S-015 AC10), ready work waits for it: three stalls on 2026-11-09, and on 2026-11-10 the Critic's dispatch for S-007 waited from 13:23Z to 19:19Z. Raise it upstream, add a desk alert too, or leave it? Filed first as questions/orchestrator-schedule-gaps.md (#348).
decision: Raise it in the operating model (Personal-Org-Operating-Model docs/LESSONS.md LL-045, #55) and record it here; the timer, the chain cap and the workflows stay as they are. The Chief of Staff reports stalls each session; a manual start stays the owner's call.
licenses_next: The model's owner decides how the loop resumes after the cap. This entry is numbered above both main (L-0040) and item/P-003 (L-0041), whose ledgers already share L-0034, L-0037, L-0038 and L-0040 (raised as LL-046).
options_considered: The same plus a desk item to alert the owner when the loop stops at the cap with work ready (a new spec competing with P-003 for runs); leave it unrecorded.
decided_by: owner ("A: raise upstream (Recommended)", 2026-11-10, asked in session session_01QBwHGNGhaxp9ABH6WFJJE2; recorded in decisions/questions/orchestrator-schedule-gaps.md)
proposed_by: chief-of-staff
reversibility: reversible

## L-0043 — The check run's copy keeps the default branch's ledger and adds the item branch's own entries
date: 2026-11-11
type: ruling
supersedes: []
scope: project
expires: never
asked: P-003's check runs (2026-11-11, recorded 07:20Z and again 12:29Z, reviews/S-007/checks.txt on item/P-003) failed its surface and digest checks, whatever the build: the copy is main plus the item branch's changed files (governance/checks/orchestrator_git.py build_tree), so item/P-003's 26-entry ledger replaced main's 41, and 12 exempt lines cited entries the copy lacked. Fix it, pause for the model, or decide at the stop card? Filed first as questions/P-003-build-blocked.md (#353).
decision: build_tree's new step keep_default_ledger: when the item branch changed docs/LEDGER.md, the copy holds main's ledger with the item branch's own new entries after it, each whose id main already uses renumbered above both, and the digest rebuilt from it. Measured on P-003's copy: 26 entries before and 46 after; surface_guard and digest fail before and pass after; every other check is unchanged. A desk change to a copy of the operating model's tools (raised there as LL-048).
licenses_next: P-003's next check run judges the build, not the stale ledger. The merge gate still merges the two ledgers by git, which conflicts, and the item branch's ids still clash with main's (L-0034, L-0037, L-0038, L-0040; LL-046): both need a ruling before P-003 lands. Renumbered ids in a copy or pack (above main's highest, so L-0046 upward on P-003's once this lands) exist only there.
options_considered: Pause P-003 until the model fixes it upstream; leave it and decide at the stop card.
decided_by: owner ("A: fix both (Recommended)", 2026-11-11, asked in session session_01QBwHGNGhaxp9ABH6WFJJE2; recorded in decisions/questions/P-003-build-blocked.md)
proposed_by: chief-of-staff
reversibility: reversible

## L-0044 — The safety proof also runs every Monday
date: 2026-11-11
type: ruling
supersedes: []
scope: project
expires: never
asked: Builder commands run only while the runner image's month matches the last passing proof (governance/RUNNER.toml), and the proof starts only by hand, so commands switch off silently each new month; they had been off since October. Run it on a schedule, and how often? Filed first as questions/scrub-proof-schedule.md (#354).
decision: .github/workflows/scrub-proof.yml gains `schedule: cron "41 10 * * 1"`; a scheduled run's model is the MODEL_BUILDER repository variable. Its permissions stay read-only and it still writes and commits nothing. A pass on a new image month leads to a RUNNER.toml rule change the Chief of Staff opens for the owner's approval; a failure is reported by the Chief of Staff.
licenses_next: The desk's notifications do not watch this workflow, so a scheduled failure is seen only at a Chief of Staff session.
options_considered: Monthly on the 3rd; weekly with the passing run opening the settings change itself (needs write access the proof lacks).
decided_by: owner ("A: weekly (Recommended)", 2026-11-11, asked in session session_01QBwHGNGhaxp9ABH6WFJJE2; recorded in decisions/questions/scrub-proof-schedule.md)
proposed_by: chief-of-staff
reversibility: reversible

## L-0045 — The proof's commands-off session opens with a harmless Write
date: 2026-11-11
type: ruling
supersedes: []
scope: project
expires: never
asked: In every proof run on the desk (October, L-0007; 2026-11-11, run 43018049218) the commands-off session made no tool calls, so its two Read checks had nothing to judge and the proof could not pass. The model's L-0129 suggests the commands-on brief's harmless first step, but its frozen S-015 AC12 and S-021 AC2 fix the commands-off brief. Change the desk's copy now, wait for the model, or build outside the loop? Filed first as questions/scrub-proof-off-brief.md (#355).
decision: governance/checks/orchestrator_git.py PROOF_OFF: step 1 writes off-check.txt holding the fixed text "harness check" (never nonce A, L-0101; not proof.txt), then the two Reads as steps 2 and 3. A desk departure from model S-015 AC12 and S-021 AC2: run against the model's tests, the copy fails 2 of 91 (the commands-off step numbers, and "Write" in the commands-off brief), and passes every check that only line counts are asked for and that both Reads are made.
licenses_next: The owner runs the proof again by hand. If it passes, RUNNER.toml records its image month by a rule change, and Builder sessions run commands. Raised in the model as LL-047, for it to adopt or replace.
options_considered: Wait for a model spec superseding S-015 AC12 and S-021 AC2; build P-003 outside the loop in a session that has a shell.
decided_by: owner ("A: change it now (Recommended)", 2026-11-11, asked in session session_01QBwHGNGhaxp9ABH6WFJJE2; recorded in decisions/questions/scrub-proof-off-brief.md)
proposed_by: chief-of-staff
reversibility: reversible

## L-0046 — The safety proof passed on November's image, and the runner settings record it
date: 2026-11-12
type: ruling
supersedes: []
scope: project
expires: never
asked: With L-0045's harmless first step, the owner ran the safety proof by hand (run 43126296640, 2026-11-12 00:18Z, model sonnet, runner image ubuntu24 20261101.360.1, command line 2.1.284). Record its image month in the runner settings, as ruling A on questions/P-003-build-blocked.md provides when a proof passes?
decision: governance/RUNNER.toml `proven_image_version` goes from "202609" to "202611"; `proven_version` (2.1.284), `proven_image_os` (ubuntu24), `session_commands` ("on") and `pass_env_cleared` (false) are unchanged. The proof passed all 21 checks: the 8 commands-on checks, the 4 commands-off checks (its session made 4 tool calls, a Write and three Reads, both environment Reads blocked) and the 9 sandbox checks. Measured with session_runner.py `proven`: true for image 20261101.360.1, false for 20260920 and 20261201.
licenses_next: Builder-class sessions on November's images run with commands, so P-003's Builder can record its baseline after the owner answers stop card 14 `rebuild`. L-0007's condition, a passing proof before P-001 closes, is met on this image. December's first image switches commands off again until the Monday proof (L-0044) passes and a change like this one records it.
options_considered: Leave commands off until the operating model adopts L-0045's step (LL-047).
decided_by: owner ("A: fix both (Recommended)", 2026-11-11, asked in session session_01QBwHGNGhaxp9ABH6WFJJE2; recorded in decisions/questions/P-003-build-blocked.md)
proposed_by: chief-of-staff
reversibility: reversible

## L-0047 — Six-hour proxy: the Chief of Staff carries the timeline Discovery forward on the owner's behalf until 10:53 UTC
date: 2026-11-12
type: delegation
supersedes: []
scope: project
expires: 2026-11-12
asked: none; the owner said in the session (session_01QBwHGMeiscLbX8ZWj6MH1K, 2026-11-12 04:53 UTC): "Merged, now I am giving you as my chief of staff permission to act on my behalf over the next 6hours. My only expectation is a summary of any rulings/ decisions etc be provided on the 6 hours is up".
decision: Until 10:53 UTC on the expiry date, the Chief of Staff acts as the owner's proxy (D-066) on the desk's timeline work (P-005) and what it waits on. It may file research requests and the project request, start Orchestrator runs by hand, merge a records-only (R0) pull request when its checks are green and it holds no code, and answer a reversible procedural question of this work as the owner's proxy, its answer record's second line "Proxy: done at the owner's request". It is read as narrowly as L-0019, the earlier six-hour proxy. Not done by proxy, and left for the owner: the plan's value target, success criteria and stop rule, which are drafted for the owner's approval at the Design gate; gate rulings; kills; rule changes; owner verdict files; deploys; code (R1) and governance (R3) changes; another session's questions and cards; and anything irreversible. Every proxy action is listed in the summary to the owner at the end and in the session's handoff.
licenses_next: The timeline Discovery's research requests and project request, their merges, and Orchestrator runs started by hand, until 10:53 UTC on 2026-11-12.
options_considered: "Work only, merge nothing" (the owner's words grant more); "Full authority, the plan's value target and gate rulings included" (never delegable under the operating model's delegation grants).
decided_by: owner ("permission to act on my behalf over the next 6hours", 2026-11-12, in the session)
proposed_by: chief-of-staff
reversibility: reversible

## L-0048 — A published specification's own quoted text is enough to source what it requires
date: 2026-11-12
type: ruling
supersedes: []
scope: project
expires: never
asked: The source rule covers a vendor's documentation of its own product but not a published specification's text about its own requirements, and Q-026's third source check held `F-otel-event-name-01` on that gap (OpenTelemetry's events page says an event name "MUST" uniquely identify the event structure; its log data model says "SHOULD"). Is one quoted passage enough, two of its pages, or two independent publishers? Filed first as questions/P-005-spec-sources.md (#373), after the Critic's four cold reads.
decision: governance/standards/sources.md gains one rule: for what a published specification itself requires, one quoted passage of that specification is enough; where its pages state the requirement at different strengths, the entry quotes the one it rests on and notes the others; a specification's text is never evidence of what others do in practice. The two rules already there are unchanged.
licenses_next: Once merged, and only with the owner's say-so in session, the Q-026 stop card is answered `re-specify` (a strike), and its next source check may file `F-otel-event-name-01` on the "MUST", with the "SHOULD" noted. The filed `F-enum-escape-values-01` stands.
options_considered: B, two of the specification's pages labelled "same publisher" (a requirement stated on one page could not be filed); C, two independent publishers (no rule change; the OCSF part of the filed entry withdrawn by a superseding entry).
decided_by: owner ("A: one passage (Recommended)", 2026-11-12, asked in session session_01QBwHGJzc87ezrCJjztgrMp; recorded in decisions/questions/P-005-spec-sources.md)
proposed_by: chief-of-staff
reversibility: irreversible

## L-0049 — Open-ended proxy: the Chief of Staff carries the timeline work forward on the owner's behalf until its first design mockup
date: 2026-11-12
type: delegation
supersedes: []
scope: project
expires: never
asked: none; the owner said in the session (session_01QBwHGJzc87ezrCJjztgrMp, 2026-11-12 about 15:43 UTC): "Honestly you can run autonomously as you did overnight. You stoppage point is our first design mock up. Please notify me if any significant blockers arise".
decision: From now until the timeline work (P-005) reaches its first design mockup, or the owner ends it, the Chief of Staff acts as the owner's proxy (D-066) on that work and what it waits on, with the same scope as L-0047 and read as narrowly as L-0019: it may file research requests, questions and the project request, start Orchestrator runs by hand, replace its own unmerged branch's commits where no pull request uses them, merge a records-only (R0) pull request when its checks are green and it holds no code, and answer a reversible procedural question or card of this work as the owner's proxy, its answer record's second line "Proxy: done at the owner's request". Not done by proxy, and left for the owner: the plan's value targets, misses, costs and stop rule; gate rulings, the Design gate included, which comes before any design mockup and so ends this proxy in practice; kills; rule changes; owner verdict files; deploys; code (R1) and governance (R3) changes; another session's questions and cards; and anything irreversible. Every proxy action is listed in the session's handoff; a significant blocker is sent to the owner's phone.
licenses_next: Q-026's return to the Researcher and its source checks, the question on taking experiments E1 and E2 into Design, and the project request P-005 with its readiness check, until the owner's Design gate.
options_considered: Stop and ask before each step (the owner's words grant more); "Full authority", the Design gate and the plan's targets included (never delegable under the operating model's delegation grants).
decided_by: owner ("you can run autonomously as you did overnight. You stoppage point is our first design mock up", 2026-11-12, in the session)
proposed_by: chief-of-staff
reversibility: reversible
