# Inventory: what the operating model gives every project, and where it goes on the desk

*2026-10-19, for the owner's request of today (docs/design/references/owner-request-2026-10-19-scope.md).
Inventory only: no mockups. The operating model's repository is private, so this file names its parts
and cites them by section; it quotes none of them.*

**What this is.** One row for each element the operating model gives a project, or the level above
projects, and what the desk should do with it for any project, not only Service-Desk.
**Sources.** The model: OPERATING_MODEL.md (VERSION 3.5.0; the file's own heading still says 3.0.0),
template-v3/, portfolio-template/ and the v2.5.1 text it carries forward. Service-Desk: AGENTS.md, governance/,
docs/PROJECT.md, specs/S-001.md, the design audit and the redesign mockups. The real portfolio repository.
**Main finding.** The desk shows the parts of the model Service-Desk happens to use, and the redesign cut
most of the rest because it was empty here. Three things are missing for the bigger picture: (1) the
portfolio level is not read at all; (2) the desk can't tell "this project doesn't use it" from "not
written yet", so both were cut together; (3) gates, experiments, domain reviews and value targets, which
other projects will lean on, were never drawn.

## 1. How to read the tables

- **Cites.** OM = OPERATING_MODEL.md. PB = the v3 software playbook (template-v3/docs/playbooks/software.md),
  whose sections 3, 8, 9, 10 and 14 are carried from v2.5.1. v2.5.1 = the archived v2.5.1 model. TPL =
  template-v3/. PF = portfolio-template/. Audit = docs/design/audit-2026-10-19.md. RD =
  docs/design/mockups/redesign-direction.html. AC and J numbers are S-001's.
- **How often** is my estimate of how often the owner needs it, not a measurement.
- **Where:** Waiting card · Plan · Project top (the sentence and phase strip) · Project page · Details ·
  Portfolio (a view across projects; the redesign has none yet) · Not on desk.
- **SD** = Service-Desk. **POOM** = the operating model's own repository, which runs v2.5.1 (sprints,
  ledger), not the v3 pipeline. "—" = does not apply.

## 2. The elements

### A. Purpose and value

| Element | Defined in | What the owner needs from it on the desk | How often | Where | Desk today | Audit / redesign | SD? | POOM? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Mission and strategy | OM §0, §1 (D-023); TPL docs/PROJECT.md §2 | One line on why the project exists | rarely | Project top | Home card shows README's summary (AC54) | Project sentence is phase + next only | Yes (PROJECT.md §2) | README only | |
| Value targets (V-lines) | OM §1 principle 13, §4 Discovery checklist; PROJECT.md §6 | Each target, its measure now, its date | weekly | Project page | Not shown; planned as SD's own milestone M3B | Moved to Details › Value targets (audit §5) | Yes, V1–V5 | No | Every project must have one, so a missing one is always a gap |
| Stop rule and miss | OM §1 principle 4; §4 gate case, kill criteria; PROJECT.md §6 | What would stop it, and how close it is | weekly | Project page, beside the targets | Not shown | Not mentioned | Yes | No | |
| Owner-time cost | OM §0–§1; §10 scorecard; PROJECT.md §6 | Time the project takes from the owner | weekly | Project page; Portfolio total | Time asked view (AC20, AC21) | Details (audit §2) | Yes | No | |
| Spend ceiling | OM §2 (never delegable); PB §10; PROJECT.md §5 | Spend against the ceiling | weekly | Project page | Out of first version; only GitHub Actions use (AC78) | Not mentioned | $0 ruled | Not checked | |
| Priority order | OM §1 (D-017) | Nothing; it is a rule for the team | never | Not on desk | — | — | — | — | |
| Project intent (Part 2) | OM §2 channels; §4 definition of ready (D-052) | What the owner said they want and would hate | rarely | Project page, one tap | Not shown | Not mentioned | Yes (draft) | No | |

### B. Who decides

| Element | Defined in | What the owner needs from it on the desk | How often | Where | Desk today | Audit / redesign | SD? | POOM? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| The owner's reserved decisions | OM §2 (D-018) | Every one that waits, told apart from routine | several a day | Waiting card | Queue groups (AC52); board (AC80) | Kept: the board is the queue | Yes | PRs and questions | |
| Decision cards | OM §2 (D-019); PF queue/_DECISION_CARD.md; TPL queue/ | The question, options, recommendation, default | when raised | Waiting card + sheet | Full text, options, answer link (AC11, AC16) | Kept: sheet with option chips (RD frame 2) | 15 card files in queue/ | No queue/ | |
| Stop, failure and not-ready cards | TPL governance/ROUTING.toml gates; OM §4 stop rule | Fixed options; which ones can't be proxied | rarely | Waiting card | "Decisions" group (AC52) | All become "Answer"; kind not drawn | Yes (past) | No | |
| Hold and merge cards | S-001 Terms (Orchestrator records) | Fix CI, or merge by hand | rarely | Waiting card | AC46, AC47 | Not drawn | Yes | No | |
| Owner questions and answers | OM §2 "Every ask is filed" (S-033); TPL questions/, decisions/ | Question, options, default, timeout, milestone it unblocks | several a day | Waiting card | AC3, AC12, AC19, AC66; held while asked in a session (AC77) | Kept as "Answer" | 2 open; 85 files in decisions/questions/ | Files; rulings go to the ledger (S-001 Terms) | |
| Reversible vs irreversible; default at timeout | OM §2; v2.5.1 §7 | Which ones decide themselves if left, and when | per item | Waiting card meta | Told apart at a glance (AC38) | Not drawn on board cards (uncertain) | Yes | Yes | |
| Proxy answers | OM §2 (D-066) | Which answers the Chief of Staff recorded for the owner | weekly | Sheet meta; Done lane | Time asked marks proxy (AC20) | "Proxy" only when true (audit §4.18) | Yes | — | |
| Delegation grants | OM §2 (D-012, D-058, S-033) | What is delegated, until when, each use | rarely | Project page, one line | Asks-merge grant read only to judge PRs (AC79) | Not shown | Yes (ledger L-0010, L-0017) | Not checked | |
| Backup human | v2.5.1 §7 (T2+); AGENTS.md `backup:` | Who rules while the owner is away | rarely | Project page (T2+) | Not shown | — | Line left unfilled | No such line | Uncertain whether v3 keeps it: not in OM §7's carried list |
| Recorded rulings (project) | TPL decisions/README; OM §2 Rulings channel | The last thing the owner decided, and history | daily | Done lane; project page | "Your last action" (AC55); Done lane (AC80) | Done lane kept | Yes | Ledger | |
| Critique digest | OM §2 (D-044); PF queue/_CRITIQUE_DIGEST.md | What was challenged and how it was settled | per gate | Sheet, under "More" | Not shown | Not mentioned | None found | No | |
| Plain English first | OM §2 (S-026) | Every ask and PR opens in plain words | per item | Sheet's first lines | Gate case's opening quoted (AC52); PRs by title | Sheet "what you're deciding" | Yes | Yes | |

### C. Phases, gates and milestones

| Element | Defined in | What the owner needs from it on the desk | How often | Where | Desk today | Audit / redesign | SD? | POOM? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Phases (six; four on the desk) | OM §3, §4 (S-023) | Where the project stands | weekly | Project top | AC50, AC57, AC58 | Kept as a 4-part strip (audit §5) | Yes | No (sprints) | |
| Iterations ("Design i2") | OM §3 Iterations | That it went back, and why | rarely | Project top, one phrase | Runs and branches (AC57, AC70) | "Second time through" (audit §4.3) | Design i2 | No | |
| Phase gates (Design, Build, Launch) | OM §2, §4 Phase gates (S-024); TPL docs/gates/ | The case, the Critic's view, then proceed / hold / recycle / kill | about 3 per project | Waiting card, its own kind | "Gate rulings" group with case opening and links (AC52) | Board has 4 verbs, none for a gate (audit §5) | No S-024 gate yet (docs/gates/ holds templates) | No | The heaviest decisions the owner makes |
| Build "nothing needed" | OM §3, §4 | That Build was passed empty, on which record | rarely | Project top | "Not needed" state (AC57) | — | No | No | |
| User representative | OM §4 (S-025); TPL docs/users/ | The simulated user's verdict at each gate | per gate | Gate sheet | "Not needed" line (AC52) | Not drawn | Not needed: owner is the user (PROJECT.md §9) | No | |
| Definition of ready | OM §4 (D-052) | Whether the brief is ready to rule on | once | Gate sheet | Only as a card | — | Yes (cards) | No | |
| Discovery time limit | OM §3 ([open] length) | Days left in Discovery | weekly, in Discovery | Project top | Not shown | — | Past Discovery | No | Length not yet set |
| Standard milestones | OM §4 table: Discovery 8, Design 6, Build 5, Launch 5 | Each phase's checklist: reached, skipped, not needed, not recorded | weekly near a gate | Project page, folded per phase | AC57, AC59 with states | Cut (audit §4.2) | No lines written | No | See §3 |
| Taken-on / skipped lines | OM §3 "Why and context" (S-032); PROJECT.md §3 | What the project chose to skip, and why | at gates | Project page | Read, shown "Skipped" (AC61) | Cut with the above | 0 lines | No | The record that says "not used" |
| The project's own milestones | OM §3 (S-023); PROJECT.md §3 | Plain name, done when, state | daily–weekly | Project page; Plan | AC50, AC59, AC24 | Kept (audit §5) | 9, 3 reached | No | |
| A milestone's why | OM §3 (S-032) | Why it is being done | when planning | Milestone sheet | AC61 | Only if recorded (audit §5) | 1 of 9 (M3A) | No | |
| Reached mark | OM §3 (S-033) | That the owner accepted it, and when | at acceptance | Project page; the ask is a Waiting card | J11, AC50 | Kept ("3 reached") | Yes | No | |
| Sprints (PRs or items) | OM §3 | What work fed a milestone | weekly | Milestone sheet | Timeline sprints (AC60, J12) | "Not tied to a milestone" cut (audit §4.14) | Yes | Sprint files | |
| Steps (agent sessions) | OM §3 | Only when steering | weekly | Details › Agents | AC22, AC23 | Details (audit §2) | Yes | No | |
| Graduation and re-entry | OM §3 "Graduation and re-entry" | That it is Done; when new work comes back | rarely | Projects row; re-entry ruling = Waiting card | "Done" (AC50) | Projects row | Not yet | No | |
| The cap on work in progress | OM §1 principle 7; §3 The cap ([open] number) | Projects in Build or Launch plus research, against the cap | weekly | Portfolio | Not shown | — | — | — | Countable only across projects |

### D. Building and checking

| Element | Defined in | What the owner needs from it on the desk | How often | Where | Desk today | Audit / redesign | SD? | POOM? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Specs, criteria, freeze | OM §4 Freeze gate (D-043); TPL specs/ | Which criteria were approved; that they froze | at the Build gate | Gate sheet; milestone sheet | Spec headers read for milestones (J11) | — | S-001, built from a draft (L-0003) | 32 specs | |
| Join sheets and join-up review | OM §4 (D-046, S-024); TPL docs/design/JOIN_UP_REVIEW.md | That the parts were checked together | per gate | Gate sheet | Not in S-001 | — | Template only | No | |
| Locked checks and hidden holdouts | OM §5, §7 (D-054); TPL governance/HOLDOUTS.md | Only that they exist and pass | rarely | Details | Not shown | — | No holdout set listed | No | |
| Experiments | OM §6 (D-047); OM §4 Design and Build checklists; TPL experiments/ | Each unknown's test, its result, a kill if it fails | weekly, in Design and Build | Milestone sheet; a kill = Waiting card | Not shown | Not mentioned | 6 registered (EXP-001 to 006) | No | |
| Research and the groundwork map | OM §4 Groundwork (S-020); §6 (D-032); TPL research/ | The owner's short list to answer; research done and source-checked | in Discovery | Waiting (short list); milestone sheet | Research items as sprints (AC60), pipeline (AC9) | — | 13 items (Q-001 to Q-013) | No | |
| Research sub-projects | OM §4 (D-051) | Budget, time limit; counts toward the cap | rarely | Project page; Portfolio | Not told apart | — | No | No | |
| Stop rule (3 plan, 3 build rounds) | OM §4 Stop rule (D-044) | One summary and a card with fixed options | rarely | Waiting card | Stop cards (AC52) | Board "Answer" | Yes | v2.5.1 §5 | |
| Triage | OM §5 Critic and Triage | The root cause, inside the stop card | rarely | Sheet | Not shown | — | 4 files in triage/ | No | |
| Traceability and drift | OM §4 (D-035) | Work that traces to no value target | rarely | Details › Record gaps | Not shown | — | CI | — | |
| Playbooks and work types | OM §7 (D-021) | Which kind of work, and what "done" means | rarely | Project page meta | Not shown | — | Software | Software | |
| Risk classes R0–R3 | PB §3; governance/risk-paths.toml | Which pull requests need the owner | per PR | Waiting card's verb | Decides the "Verdict" step (J22) | Kept | Yes | Yes | |
| Required reviews and verdicts, the owner's included | PB §3, §8; risk-paths [reviews]; reviews/ | Write the owner's verdict where needed; see the Reviewer's | several a day | Waiting card | Verdict step (J22, AC80); "Verdicts to write" reads "not recorded" (AC52) | Verdict ↗ kept; the panel cut (audit §3) | 66 entries in reviews/ | Yes | |
| Domain reviewers and domain packs | PB §3; governance/domains/; a roster row; a [paths] table | That the security (or other) review passed before the owner merges | per PR on those paths | Waiting card's sheet | A domain table raises the class only (J22); its verdict not shown | — | No: template pack only, no roster row, no [paths] table | No | |
| Autonomy levels, agent authority | PB §3 | Nothing day to day | never | Not on desk | — | — | Yes (SURFACES.md) | Yes | |
| Pull requests (Milestone, Context, Why) | OM §3 (S-032); §9 | What the PR is for, in plain words | several a day | Waiting card + sheet | Flagged (AC2); Context and Why on the Timeline (AC61) | Kept | Yes | Older form | |
| CI | PB §9; OM §9 | Only when failing or blocking | daily | Projects row glyph | AC8, AC29 | Failures only (audit §4) | Yes | Yes | |
| Automatic merges | OM §5 (D-067); §2 (S-033) | That it is handled without the owner | daily | Waiting quiet line | "Being recorded by the automatic job" (AC79) | Kept | Yes | No | |
| Deploys and their approval | OM §3 (the owner approves every production deploy) | Approve a waiting deploy; who approved | when waiting | Waiting card | Deploys group if `deploysNeedOwner` (AC52) | "Approve ↗" | Yes (the only one marked) | No | Approver not recorded (S-001 "does not cover") |
| Break-glass and incidents | v2.5.1 §4; PB §9; SD AGENTS.md §1 | An open waiver and its 3-working-day deadline | hopefully never | Waiting card | Not shown | — | None | None | Uncertain under v3: see §7 |
| Spend alerts (80%, 100%) | PB §10 | Pause at 80%; everything stops at 100% | rarely | Waiting card | Not shown (Actions use only, AC78) | — | $0 | — | |

### E. Team

| Element | Defined in | What the owner needs from it on the desk | How often | Where | Desk today | Audit / redesign | SD? | POOM? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Roster and roles | OM §5; TPL governance/SURFACES.md, .claude/agents/ | Who is at work now, and on what | daily | Project page, one line | Team screen (AC49, AC67) | "At work now", roles in a sheet (audit §4.7) | 10 roster rows | 2 rows | |
| Chief of Staff and its sessions | OM §5, §8 (S-033) | What the Chief of Staff is doing for the owner | daily | Project page line | J13, AC49 | Details › Agents | 1 session file | No | |
| Orchestrator, dispatch log, status files | OM §5 (D-041, D-042), §8 | Retries and anomalies only | rarely | Details | Activity (AC6), pipeline (AC9), AC39 | Details | 263 log lines, the last on 2026-10-08 | No | |
| Session usage and context | OM §8; model S-020 (via J10) | Timelines and context windows, to steer | weekly | Details › Agents | AC22, AC23 | Kept in Details (audit §2) | Yes | No | |
| Model diversity | OM §5 (D-056) | Rarely: which model checked what | rarely | Details | Not shown | — | Set outside the repo | — | |
| Operating team | OM §3 pipeline boundary (D-036); §4 Launch | Who runs it after launch | at launch | Project page (Launch) | Not shown | — | Not yet | No | |
| Handover package | OM §3; TPL docs/handover/ | Ready to graduate? | at the Launch gate | Gate sheet | Not shown | — | Operating notes only | No | |

### F. Knowledge and records

| Element | Defined in | What the owner needs from it on the desk | How often | Where | Desk today | Audit / redesign | SD? | POOM? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Library facts and shelf life | OM §6 (D-031); PF library/facts | Facts gone stale that a project relies on | rarely | Portfolio | Not shown | — | Kept in SD's own library/ | — | The model puts the library in the portfolio (§8) |
| Pattern library | OM §6 (D-032) | Nothing day to day | never | Not on desk | — | — | — | — | |
| Research depth 5 (a human expert) | OM §6 | Approve bringing in an expert | rarely | Waiting card | As a question | — | No | No | |
| Design references | OM §8 (L-0130) | Nothing on the desk | never | Not on desk | — | — | 20 files | — | |
| Ledger | OM §8; v2.5.1 §6 | For v2.5: headline and "next"; adoptions and kills | rarely | Project page | AC10 (v2.5); grant read (AC79) | POOM row "sprint m1.4" | 17 entries | 146 entries | |
| Digest | OM §8 (generated) | Nothing | never | Not on desk | — | — | Yes | Yes | |
| Checkpoint | v2.5.1 §4, §6 | Where things stood after a session | per session | Not on desk | Not shown | — | Template only | No file | |
| Improvement register | v2.5.1 §4, §6 | Whether each change measurably helped | rarely | Details | Not shown | — | Empty template | No file | |
| Intake items (reports after launch) | TPL intake/_TEMPLATE.md; v2.5.1 §4 feedback loop | New reports from users or the operating team | when raised | Project page; Waiting if it needs the owner | Not shown | — | None | No | |
| Intake requests (work items) | TPL intake/requests/README | New work filed, re-entries | rarely | Project page | Read for research items (J11) | — | 14 requests | No | |
| The brief (machine-built status) | OM §2 channels (D-039), §8 | The one-page status | daily | The desk itself | The desk plays this role (my reading) | — | No brief file | No | Uncertain |
| Weekly figures | OM §10; v2.5.1 §11 | Owner load, lead time, defects | weekly | Details | AC25 (SD's own V1 and V2 figures) | — | None filed yet | — | |

### G. Tiers, checks and changing the model

| Element | Defined in | What the owner needs from it on the desk | How often | Where | Desk today | Audit / redesign | SD? | POOM? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Tier T0–T3 and its triggers | PB §3; PROJECT.md §5; AGENTS.md `tier:` | The tier, which turns elements on, and a trigger hit | rarely | Project page meta | Not shown | — | T1 | T1 | Decides which elements apply (§4) |
| CI checks and warn-only mode | OM §9; PB §9; governance/enforcement.toml | Only a check that blocks | rarely | Projects row glyph | CI result (AC29) | — | No warn entries | Not checked | |
| The v3 switch | TPL governance/v3.toml | Which pipeline a project runs | never | Projects row meta | Desk uses its own setting (J7 `model`) | "Older pipeline" | Yes | No | |
| Model version per project | OM §10, §11; governance/OPERATING_MODEL_VERSION | Which version each runs; who is behind | per release | Portfolio | Not shown | — | 3.5.0 | Runs v2.5.1 | |
| Scorecard | OM §10 (D-024) | Portfolio value, project outcomes, model health | monthly | Portfolio | Not shown | — | — | — | Targets not yet set |
| Rule review and rule experiments | OM §10 (D-025, D-026) | The review's card, when due | rarely | Waiting card | Not shown | — | — | Its own work | How often is [open] |
| Lessons back to the model | OM §10 | That a lesson was filed | rarely | Portfolio | Not shown | — | — | LESSONS file | |
| Data classes | PB §10 (T2+) | Nothing | never | Not on desk | — | — | Yes | — | |

### H. Portfolio (the level above projects; detail in §5)

| Element | Defined in | What the owner needs from it on the desk | How often | Where | Desk today | Audit / redesign | SD? | POOM? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Idea log, with states | OM §4 stage 1, §8 (D-068); PF ideas/ | Ideas captured; which the owner agreed to explore | weekly | Portfolio | Not read | — | — | — | Real portfolio repo: 1 idea, "captured" |
| Portfolio intent | OM §2, §4; PF intent/ | Standing defaults across projects | rarely | Portfolio, one tap | Not read | — | — | — | Not yet written |
| Portfolio decision queue | OM §8; PF queue/ | Cards that span projects | when raised | Waiting card | Not read | — | — | — | |
| Portfolio rulings | OM §8; PF rulings/ | Cross-project rulings and their history | rarely | Portfolio | Not read | — | — | — | |
| Track records | OM §5 (D-038), §8 | How reliable the Chief of Staff and Triage are | rarely | Portfolio | Not shown | — | — | — | |

*Not from the model, the desk's own:* notifications (AC73–AC78), Kicked back (AC80), "new since you
last looked" (AC40) and the stalled-project line (AC71). They work for any project and are not counted above.

## 3. Cut because empty here

Each item was cut or collapsed mainly because it was empty, idle or unused in Service-Desk or POOM.

1. **Standard milestones** (audit §4.2, "none of which you act on"). Empty because SD wrote none of the
   taken-on / skipped lines (0 in PROJECT.md §3), and the model itself marks several "not recorded".
   *A full project needs:* each phase's checklist, folded ("Build: 2 of 5"), with skipped ones named. The
   gate case lists them, so the owner sees them at every gate anyway.
2. **"Not recorded" lines** (audit §4.1, 34 on one Status page). Most are SD's older records, written before
   the forms existed and never rewritten (OM §3). *A full project needs:* three different words, not one
   (see §4): skipped or not used (say so, or hide), missing (a gap for the agents), and can't be recorded.
3. **Team tiles, all "Idle"** (audit §1, §4.7). Idle because SD's pipeline has not dispatched since
   2026-10-08 (dispatch-log/2026-10.jsonl); SD now works through pull requests by hand. *A full project
   needs:* several roles moving at once (Critic, Check author, Reviewer), so "At work now" must allow
   more than one line ("At work now: 2 ▸").
4. **"Verdicts to write"** (audit §3, row 12). Empty because no record names the verdicts a pull request
   still needs (S-001, "does not cover"). *A full project needs,* with a domain reviewer: which verdicts are
   still missing before the owner merges ("Security review: waiting").
5. **Empty queue groups, including "Gate rulings"** (audit §4.17). Empty in SD today. The board has no gate
   card at all (audit §5 lists four verbs). *A full project needs:* a gate card of its own kind, with the
   case's opening, the Critic's view and, where one runs, the user representative's verdict.
6. **Phase rows and runs** (audit §4.3). SD has one rerun, Design i2, with no reason on record. *A full
   project needs:* "why it went back", which the model does record when a gate sends work back (OM §3).
7. **POOM's own screens** (audit §1 point 3, §2 last row). Collapsed to one row because v2.5.1 records none of
   the v3 fields. Right for POOM. *But* the project page frame must still exist for every v3 project.
8. **The pipeline view** (folded by AC68, then left out of the redesign). SD's only project item, P-001, is
   closed (status/P-001.toml: state closed, outcome re-scope). *A full project needs:* its items moving
   through the stages, with the next role, on the project page ("At work now"), not only milestones.
9. **Value targets in Details** (audit §2, §5, as "M3B"). Moved because showing them is one of SD's own
   milestones. *Every project* has value targets and a stop rule, so they belong on the project page.

**Never drawn at all, because SD doesn't need them (yet):** experiments and their kill rules, holdouts,
critique digests, join-up reviews, domain reviews, the operating team and handover, research sub-projects,
the cap, Discovery's time limit, break-glass, spend alerts, delegation grants, and the whole portfolio level.

## 4. The three states every element can be in

- **(a) Not used by this project**, by tier, by choice or by kind of work.
- **(b) Used, but not recorded yet.**
- **(c) Recorded.**
- And a fourth the desk meets: **(d) can't be recorded at all.** The Chief of Staff's own tokens and cost
  are an example: the model says no tool gives them (OM §8, S-033). Showing "not recorded" for (d) asks
  for something no one can do.

**A correction first.** governance/PACKS.toml does not say which elements a project uses. It lists what
each role's session may read and never see (OM §5, D-006). It can't tell (a) from (b).

**The records that can tell (a):**

| What says "not used" | Record | Elements it settles |
|---|---|---|
| The tier | AGENTS.md `tier:` line; PROJECT.md §5; PB §3's tables | T2+ only: backup human, holdout suite, mutation checks, incidents, data classes, CODEOWNERS |
| A standard milestone skipped | PROJECT.md §3 `(standard) · skipped · why` (S-032) | Any of the 24, and through them experiments (Design and Build checklists), join-up reviews, the operating team |
| The owner is the user | PROJECT.md §9 | User representative, target-user profile |
| Build passed with nothing needed | Gate answer with a `Nothing needed:` line (TPL decisions/README) | Build's 5 standard milestones |
| No domain configured | Roster row + `[paths]` table in risk-paths.toml (PB §3) | Domain reviewers and their verdicts |
| No groundwork map needed | PROJECT.md §7 says why | Groundwork map and its short list |
| No screens or views | Join-up review says so in one line | Screen checks at the gates |
| Not a v3 project | governance/v3.toml absent | Every v3-only element (the desk reads its own J7 setting instead) |
| Delegations, break-glass | Ledger: both must be logged | "None" is then a true answer |

**What the desk can't tell apart today, (a) from (b), and what would let it:**

| Element | Why it can't tell | Record that would let it |
|---|---|---|
| Standard milestones in SD | No taken-on / skipped lines exist | SD's Chief of Staff writes the 24 lines (the form already exists, S-032) |
| Experiments | An empty experiments/ folder means either | The Design and Build "experiments" checklist lines, taken on or skipped |
| Research sub-projects | No marker on a research item | A field in its request saying it is a sub-project (a model change) |
| Deploy approvals | The approver isn't recorded; "needs owner" is the desk's own J7 setting | A deploy record tied to the owner (listed in S-001 "does not cover") |
| Verdicts a PR still needs | No record names them | The open model change in S-001 "does not cover" |
| Who has the ball | Built from other records | A recorded state (same list) |
| Why a run began, when the plan's order started it | Only gate recycles record a reason | A line naming the ruling that started the run (same list) |
| Holdouts | An empty HOLDOUTS.md means either | A tier or work-type line saying none are needed (uncertain) |
| Operating team, handover | Absent until Launch, by design | Launch's standard lines (taken on / skipped) |
| Spend | The desk reads none | The ceiling (§5) plus a spend reading; out of the first version |

## 5. Portfolio level

The model gives the portfolio its own repository (OM §8, D-068), read by the display (Operations-Hub, which the desk replaces; PF README). The desk
reads only src/config/projects.json's 2 projects; the real portfolio repository holds one file,
ideas/IDEAS.md, with one idea in state "captured", and is not connected.

What only a view across projects can show:

1. **Ideas, by state** (captured, shaping, approved, re-aimed, stopped; PF ideas/). Discovery's first
   standard milestone (the owner agreeing to explore an idea) is *not recorded* in a project because the owner's
   agreement lives in the idea log (OM §4). Only a desk that reads the portfolio could show it.
2. **The cap** (OM §3): projects in Build or Launch plus active research, against the limit. The number
   is still the owner's open call.
3. **Every waiting item, across projects** (the board already does this), plus the portfolio's own
   decision queue (PF queue/), which no project holds.
4. **Portfolio rulings and intent** (PF rulings/, intent/): one tap, rarely.
5. **The plan order and estimates across projects.** Today these live inside Service-Desk
   (docs/planning/ by J4; intake/estimates.jsonl by J14, its place marked "C" in S-001). They are
   portfolio records kept in one project.
6. **The scorecard** (OM §10): portfolio value against the owner's time, each project's outcome against
   its target, the model's health. The owner's time across projects comes first, since it is the cost.
7. **Model versions:** each project's version against the model's latest, so a project left behind shows.
8. **Stale library facts** a live project relies on (OM §6 shelf lives, [open]).
9. **Track records** (OM §5): rarely, for trust in recommendations.

Tension to keep in view: the owner said not to "cross boundaries" between projects (AC52); the board
across projects is still an open question (questions/P-001-board-scope.md).

## 6. Two test projects, and one made up

**Service-Desk, as its records show it.**
- v3, model 3.5.0 (governance/OPERATING_MODEL_VERSION); tier T1 (AGENTS.md, PROJECT.md §5).
- The owner is the user (PROJECT.md §9), so no user representative.
- 9 own milestones, 3 reached; 1 has a why; 0 standard lines (PROJECT.md §3). Now in Design i2.
- One project item, P-001, closed by re-scope (status/P-001.toml); 13 research items (9 done, 4 closed).
  Since then, work runs through pull requests outside the pipeline; the dispatch log stops on 2026-10-08.
- 6 experiments registered (experiments/); 15 card files in queue/; 2 open questions; 17 ledger entries.
- 10 roster rows, no domain reviewer, no holdout set, no S-024 gate case yet, deploys need the owner.
- AGENTS.md still carries the template's unfilled owner, backup and spend lines.

**POOM (Personal-Org-Operating-Model), as its records show it.**
- Runs v2.5.1, tier T1 (its AGENTS.md); publishes the v3 model, now 3.5.0 (VERSION).
- Sprints: m1.1 to m1.3 closed, m1.4 open (docs/sprints/). 146 ledger entries; 32 specs.
- 2 roster rows. No queue/, status/, dispatch-log/, questions/ or experiments/ folders.
- On the desk it needs: open PRs, CI, the open sprint, the latest ruling, and nothing else.

**Made-up project: "Members Letter" (an example, not real; every figure below is an example).**
- A paid members' newsletter with sign-ups, run under v3 at **T2** (external users, their emails,
  deploys to a shared environment: PB §3's triggers). Card payments go through an outside provider;
  whether that is "money movement" (a T3 trigger) is the kind of thing the tier check would raise.
- **Target user is not the owner:** a profile, approved by the owner, so the user representative runs
  at all three gates.
- **Domain reviewer:** security, on `src/auth/**` and `src/billing/**`, with its own verdict per PR.
- **Experiments:** e.g. EXP-1 "a weekly digest lifts the open rate past an example threshold", with a
  kill if it misses; EXP-2 on sign-up wording.
- **A research sub-project** with an example budget and time limit, counting toward the cap.
- **Standard milestones:** all 24 lines written; e.g. "Design-3 taken on", "Launch-2 taken on".
- **Gates:** a Build-gate recycle into Design (Design i2, with its reason); later a Launch gate with a
  handover package, an operating team and its monitoring confirmed; then Graduated, then one defect
  fix re-entering at Build.
- **T2 extras:** a named backup human, holdouts, a spend ceiling of an example $20 a month with an 80%
  alert, one break-glass incident closed within 3 working days, a delegation grant.
- **What the desk must hold for it on one example day:** a security verdict still missing on PR #12;
  the owner's verdict on an R3 PR; a deploy to approve; EXP-1's result filed (a kill would be a card);
  a stop card after build round 3; two roles at work at once; the gate case waiting with the user
  representative's reject and the Critic's view; spend at 82% (an alert card).

Check every mockup against all three: SD (one project, owner is user, mostly by hand), POOM (older
pipeline, almost nothing to show) and Members Letter (everything at once).

## 7. Questions for the owner

1. **Connect the portfolio repository to the desk, read only?** It holds ideas, rulings, intent and the
   decision queue, and the model has the display read it. *Recommendation: yes*, add it to the read token.
2. **Move the cross-project plan and estimates into the portfolio?** They sit in Service-Desk today.
   *Recommendation: yes, once (1) is done*; until then, leave them where they are.
3. **Bring the standard milestones back as a folded checklist per phase** on each project page, with
   SD's Chief of Staff writing SD's 24 taken-on / skipped lines so the gaps become true answers?
   *Recommendation: yes.*
4. **Give gate rulings their own card on the board** (the case's opening, the Critic's view, the user
   representative's verdict, and the four words), apart from ordinary answers? *Recommendation: yes*:
   they are the biggest decisions the owner makes.
5. **Do break-glass and the backup human still apply to v3 projects?** v3 doesn't carry their section
   forward, but Service-Desk's charter still names both. *Recommendation:* treat both as in force, show
   an open break-glass as a Waiting card, and have the model say so plainly in its next version.
