# Project document — Service Desk

*One document, two parts (D-052). Part 1 is settled when the owner approves the move to Build; Part 2
stays living. The Critic checks Part 1 against the definition of ready.*

# Part 1 — The brief

*Lines in italics are instructions. CI checks that every section below has content beyond its instruction once a spec is frozen (S-009).*

## 1. Scope
*What is in, what is explicitly out, and where it must work (target devices or places).*

*Draft 1, 2026-10-01, Chief of Staff, from Part 2. Not yet checked by the Critic or approved.*

**In (the first version people use):**
- **Universe screen:** one box per project with its state, headline, sprint and main-branch health,
  worst first. At least as correct as the Operations-Hub page it replaces.
- **Decision cards and owner questions:** each readable in full, with its options, and answerable
  from the desk. The answer lands in the project repository as the owner's own record (§8 "act").
- **Team and pipeline:** for each project, its v3 stage, the item and role at work, and what comes
  next.
- **Planning and scheduling:** the work ahead across projects, and the owner's choice of its order
  and timing, recorded as rulings the Orchestrators act on.
- **Spend and time:** spend against each project's ceiling, and the time each project has asked of
  the owner.
- **Launch:** taking over the Operations-Hub address (Cloudflare Pages project `needs-you`) and
  archiving the old repository (L-0115 in the model's ledger).

**Out:**
- Being a source of truth. The repositories stay the memory; the desk reads them and writes rulings
  into them.
- Code review and diffs: those stay on GitHub, and the desk links to them.
- Any user but the owner.
- Running projects from the desk instead of a Claude Code session. This is a candidate, not
  committed: it enters scope only by the owner's ruling, after the research in §7 (U3).
- Reusing Operations-Hub's code. It is a reference, not a base.

**Where it must work:** the owner's phone browser first; a desktop browser second. Behind a login
that only the owner passes.

## 2. Strategy
*In plain language: the chain from the deliverables to the value — how this work produces it.*

1. The owner runs several AI-built projects. Each one stops and waits whenever it needs a ruling.
2. Today the owner finds out from a read-only page refreshed hourly, then goes to GitHub or a Claude
   Code session to act. Every hop costs time, and any wait the page misses stalls a project.
3. The desk puts what needs the owner, and the means to answer it, on one phone screen, close to
   real time. It also shows enough of each pipeline to plan what comes next.
4. So projects wait less for the owner, the owner spends less time per decision, and the owner
   can trust "quiet" when nothing is waiting. §6 measures each link.

## 3. The 25,000-foot plan
*The deliverables two levels deep, with the dependencies between them.*

- **D1 Foundation:** the answers to §7's unknowns.
  - D1.1 Hosting and live-update design (U1, U4).
  - D1.2 Acting on the owner's behalf: mechanism and attribution (U2).
  - D1.3 What running work from the desk could look like (U3). Informs a later ruling only.
- **D2 Read model:** one reader of every connected repository's v3 records.
  - D2.1 Status, queue, decisions, dispatch log, sprints and CI state, per project.
  - D2.2 Change detection fast enough for V1. *Depends on D1.1.*
- **D3 Screens, phone first.** *Depends on D2.*
  - D3.1 Universe. D3.2 Decision card and question view. D3.3 Team and pipeline.
  - D3.4 Work ahead and scheduling. D3.5 Spend and time.
- **D4 Acting.** *Depends on D1.2 and D3.2.*
  - D4.1 Answering a card or question, recorded as `decisions/<item>/<gate>-<card>.md`.
  - D4.2 Planning rulings (order and timing), recorded the same way.
- **D5 Security and trust.** *Depends on D1.2. Gates D4's launch.*
  - D5.1 Credential handling and the login. D5.2 The security review the tier requires.
- **D6 Launch and hand-over.** *Depends on D3, D4 and D5.*
  - D6.1 Preview, then the owner's launch approval.
  - D6.2 Address cut-over and archiving Operations-Hub.
  - D6.3 Operating notes for the run stage.

**Route to compression (Part 2):** D3.1 and D3.2 need only D2, so they can ship to the preview
before D4. A read-only preview could replace the old page early, with acting following it.

## 4. Owners
*An owner for every deliverable, including anything that needs the owner or an outside party.*

| Deliverable | Owner |
|---|---|
| D1 | Researcher and Source checker, through research requests Q-001 to Q-004 filed by the Chief of Staff |
| D2 to D5 | Builder, to specs by the Definer, checks by the Check author, review by the Reviewer |
| D5.2 | Reviewer, with a security focus |
| Rulings: move to Build, criteria, tier, spend ceiling, launch, anything on D1.3 | The owner (Kenny) |
| Cloudflare and GitHub settings, and any secret | The owner, by hand. No agent holds them |
| D6.2 address cut-over | The owner approves; Builder carries it out |
| Outside parties | GitHub and Cloudflare as platforms; Anthropic if the desk starts sessions (U3) |

## 5. Limits
*The spend ceiling, the data boundaries (what data may go to which outside service), and the tier (T1, T2 or T3 by the tier triggers), which is the project's trust level.*

- **Spend ceiling (proposed): $0 a month, while U1 is open.** Free tiers only, as Operations-Hub
  runs today. The owner said spend follows value, so after U1 any paid item comes with its own
  value case and a new ceiling for the owner to rule on. Alert at 80% of that ceiling.
- **Data boundaries:** the desk reads only the connected project and portfolio repositories. It may
  send their content only to GitHub and Cloudflare, plus Anthropic if U3 leads to sessions. No
  secret is ever sent to a model.
- **Tier (proposed): T2.** The desk will hold credentials that write to the owner's repositories.
  Operations-Hub's own scope ruled that write-back makes the hub T2 and needs a security review.
  v2.5.1's tier table doesn't name this trigger directly, so it is the owner's ruling. AGENTS.md
  says T1 today; a ledger entry changes it.

## 6. Value and stop rule
*This project's own measure of value, the target and date, and what counts as a miss — including the cost to the owner's time. Write each value target on its own line starting with its ID, like `V1: <measure>, <target>, <date>`; spec criteria trace to these IDs.*

*Proposed values; the owner sets them on the move-to-Build card.*

V1: Missed decisions: items waiting on the owner in a connected project that the desk did not show within 5 minutes, 0 over the first 14 days after launch, 2026-11-11
V2: False alarms: items the desk flagged that did not need the owner, at most 1 a week over the first 14 days after launch, 2026-11-11
V3: Owner upkeep: the owner's time on the desk itself (tokens, settings, adding repositories), at most 30 minutes a week after launch, 2026-11-11
V4: Replacement: the desk serves the Operations-Hub address and the old repository is archived, by 2026-10-28

**Miss and stop rule:** a miss is V4 not met by 2026-10-28, or the redesign taking more than about
2 hours a week of the owner's time before launch. At a miss, the owner rules: re-aim (for example,
launch read-only and add acting after) or stop. Operations-Hub stays live until launch, so stopping
loses nothing that exists today. The 5-minute figure in V1 rests on U4.

## 7. Solid foundation
*Every load-bearing unknown, each answered with evidence (library entry or research memo), including through research sub-projects if needed.*

| Unknown | Why it bears load | Evidence |
|---|---|---|
| U1 Hosting a live, interactive, single-user app: options, cost, upkeep | §5 spend, V3, D2 to D4 | Pending: research Q-001 |
| U2 Acting in GitHub on the owner's behalf: mechanisms, attribution, credential risk | D4, D5, the tier, D-011 (approvals are the owner's own GitHub action) | Pending: research Q-002 |
| U3 What starting, steering or monitoring Claude Code sessions from a web app can do | D1.3, the owner's later ruling | Pending: research Q-003 |
| U4 How quickly GitHub changes can reach a web page | V1, D2.2 | Pending: research Q-004 |
| Cloudflare Pages deploys from Actions, behind Access | D6 | Proven: Operations-Hub docs/research/003 (spike, 2026-09-25) |
| A fine-grained read token reads the v3 records the screens need | D2.1 | Partly proven: Operations-Hub docs/research/002 and 004 (v2 records); v3 records not yet checked |

## 8. Clear and consistent
*Key terms defined; constraints checked against each other and found not to contradict.*

**Terms.**
- *Desk:* this project's product, Service Desk.
- *Needs the owner:* an open card in a connected project's `queue/`, or a PR or question that
  waits on the owner's verdict.
- *Act:* the desk writes the owner's answer into the project repository, in the form the
  Orchestrator already reads (`decisions/`). It changes nothing else.
- *Quiet:* nothing needs the owner. Shown plainly; it is the success state.
- *Real time:* within V1's figure, 5 minutes, unless U4 changes it.
- *Connected project:* a repository on the desk's list, with a token that can read it.

**Checks, and the tensions still open.**
- "Never a source of truth" against planning and scheduling: no conflict, provided planning choices
  are recorded as rulings in the repositories (§1). D2 and D4 must keep it that way.
- D-066 allows proxy answers only by the Chief of Staff, and never for words that close an item or
  approve launch. If the desk records answers, it must carry the owner's own identity (U2), or
  those cards stay GitHub-only. Not yet resolved.
- Tier: AGENTS.md says T1, while §5 proposes T2. Resolved by the owner's ruling at the move to
  Build.
- Spend: $0 against "spend follows value". Resolved by U1 and the owner's later ruling.
- Timeline against research: D1 must land within the first week to keep V4.

# Part 2 — The intent

## Intent
The owner's purpose, preferences and trade-offs for this project, and what he would hate. Drafted by
the Chief of Staff from conversations, portfolio defaults and past rulings; confirmed on the
move-to-Build card.

*Draft 1, 2026-09-30. Chief of Staff, from the owner's answers in the intent-capture conversation
on that date, the Operations-Hub record (its MISSION.md, SCOPE.md and docs/research/001, the
Pocket Universe design guide), and the model's L-0115 (D-081). Quotes are the owner's own words.
The owner has not yet confirmed it; confirmation comes on the move-to-Build card.*

### Purpose
- "I envisioned the service desk to be more of real time interactive planning, scheduling and
  interactive workbench."
- Service Desk replaces Operations-Hub, which is a read-only page answering "does anything need
  me?" and linking out to GitHub. The owner chose to **act from the desk**, not only look.
- On launch it takes over the old page's Cloudflare Pages project and address. Until then the old
  page stays live and untouched, and the desk publishes only to a preview (L-0115).

### What the first usable version covers
The owner picked all four:
1. **The Universe screen:** one box per project, with state, headline, sprint and main-branch
   health. This is the old hub's core and must not get worse.
2. **Decision cards:** v3's seven-part cards and owner questions, readable in full on the desk.
3. **Team and pipeline:** where each project sits in the v3 stages (Shape, Build, Run), who is
   working, and what comes next.
4. **Spend and time:** spend against each project's ceiling, and the cost to the owner's time.

### Preferences and trade-offs
- **Phone first.** Desktop is a bigger view of the same thing.
- **Open to the desk becoming the easier way to run projects.** The model was designed to run from
  a Claude Code window. The owner clarified: "if a design can be reached that makes future projects
  or builds easier to run via the service desk than the are in a Claude code session - I am open to
  that. I just hadn't thought that far so I can't be definitive about what is possible yet." So
  running work from the desk is welcome where it is genuinely easier than a Claude Code session,
  but it is not yet a requirement. Shape should find out what is possible and show the owner, and
  the owner decides then.
- **Spend follows value.** "I'm open to most anything if the value can be justified." There is no
  fixed ceiling yet. Every paid service carries its value case, and Part 1 §5 still needs a
  number.
- **Four weeks, with a faster route shown.** Launch by 2026-10-28 is acceptable, "but with a route
  to timeline compression if we work it aggressively." The plan should show what could shorten it
  and what that would cost.
- **Acting means write access.** The old hub deferred write-back because the page would then hold
  the owner's credentials, which makes it T2 and needs a security review (Operations-Hub
  SCOPE.md). The owner accepted that trade by choosing to act from the desk.

### What the owner would hate
- **False alarms.** It flags things that don't need the owner, and trust erodes.
- **Missed decisions.** Something waits on the owner while the desk says "quiet".
- **Upkeep on the owner.** Time spent on tokens, configuration or adding repositories.

### Carried forward, to reconfirm
These come from the Pocket Universe design guide (Operations-Hub docs/research/001), not from this
conversation:
- Exceptions first, activity second. Quiet is the success state.
- Only flag what needs a human. A gate catching a problem, or an agent retrying, is activity.
- The desk is never a source of truth. Every action writes back to the repository under the owner's
  identity.

### Open tensions for Shape
These are questions for Shape to answer with evidence, not rulings:
1. **Workbench versus source of truth.** Planning and scheduling need state. Does it live in the
   project and portfolio repositories (the model's rule: the repository is the memory), or does
   the desk keep its own?
2. **Real time versus a static page.** The old hub is a static page rebuilt hourly. A real-time,
   interactive desk needs a live backend, which bears on spend, tier and the data boundaries.
3. **Could the desk be an easier way to run projects than a Claude Code session?** What is
   possible: starting or steering sessions, driving each project's Orchestrator, or only recording
   the owner's rulings for the Orchestrator to act on? What would each cost in spend, tier and
   upkeep? The owner is open to it but has not decided (see Preferences).
4. **The spend ceiling and the tier** that Part 1 §5 must state.
