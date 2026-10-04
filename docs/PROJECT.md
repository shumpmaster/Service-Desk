# Project document — Service Desk

*One document, two parts (D-052). Part 1 is settled when the owner approves the move to Build; Part 2
stays living. The Critic checks Part 1 against the definition of ready.*

# Part 1 — The brief

*Lines in italics are instructions. CI checks that every section below has content beyond its instruction once a spec is frozen (S-009).*

## 1. Scope
*What is in, what is explicitly out, and where it must work (target devices or places).*

*Draft 3, 2026-10-04, Chief of Staff, from Part 2 and the owner's rulings; revised after two Critic
returns. Not yet approved.*

**In (the first version people use):**
- **Universe screen:** one box per project with its state, headline, sprint and main-branch health,
  worst first. At least as correct as the Operations-Hub page it replaces.
- **Decision cards and owner questions:** each readable in full, with its options, and answerable
  from the desk: the desk prepares the answer and the owner commits it on GitHub, so it lands in
  the project repository as the owner's own record (§8 "act").
- **Team and pipeline:** for each project, its v3 stage, the item and role at work, and what comes
  next.
- **Planning and scheduling:** the work ahead across projects, and the owner's choice of its order
  and timing. In the first version by the owner's ruling of 2026-10-01. The owner's choices are
  recorded through the same prefilled-link route as card answers, and the Chief of Staff carries
  them out by filing requests in that order and at those times. No Orchestrator acts on them
  automatically in the first version (owner's ruling of 2026-10-04; automatic action is a later
  model change). See "Owner rulings" in §8.
- **Time asked of the owner:** for each project, how long its waits have taken, from a card or
  question being raised to the owner's answer being committed, read from its records. Spend is out
  of the first version, because no project records its spend yet (owner's ruling of 2026-10-04).
- **Agent usage and context:** for each project, each agent session's role, run time, result,
  tokens used and how full its context window got, shown alongside the timelines. The Orchestrator
  doesn't record tokens or context today, so this needs a change to the operating model, D7 (owner's
  ruling of 2026-10-04: in the first version, even if launch moves).
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
  - D2.1 Status, queue, decisions, dispatch log, sprints and CI state, per project, with the
    times cards were raised and answered, and each agent session's usage record (D7).
  - D2.2 Change detection fast enough for V1. *Depends on D1.1.*
- **D3 Screens, phone first.** *Depends on D2.*
  - D3.1 Universe. D3.2 Decision card and question view. D3.3 Team and pipeline.
  - D3.4 Work ahead and scheduling. D3.5 Time asked of the owner.
  - D3.6 Agent usage and context. *Depends on D7.*
- **D4 Acting.** *Depends on D1.2, D3.2 and (for D4.2) D3.4.*
  - D4.1 Answering a card or question, recorded as `decisions/<item>/<gate>-<card>.md`. The desk
    opens GitHub's new-file page with the answer filled in, and the owner commits it (the
    prefilled-link route, the owner's ruling; see "Owner rulings" in §8). Depends on O4.
  - D4.2 Planning choices (order and timing), recorded the same way; the record's path is set in
    Define. The Chief of Staff carries them out.
- **D5 Security and trust.** *Depends on D1.2. Gates D4's launch.*
  - D5.1 The read token's handling and the login; the desk holds no write credential. D5.2 A security review of the
    login and the read token's handling, by the Reviewer.
- **D6 Launch and hand-over.** *Depends on D3, D4, D5 and D7.*
  - D6.1 Preview, then the owner's launch approval.
  - D6.2 Address cut-over and archiving Operations-Hub.
  - D6.3 Operating notes for the run stage.
- **D7 Usage recording (an operating-model change).** *Depends on research Q-009 (O6).*
  - D7.1 The model's session runner records, for each agent session, the usage and context figures
    the command line reports, with the session's outcome. Specified and built in the model's own
    repository, under its spec process, and carried to Service-Desk as a model upgrade.
  - D7.2 Service-Desk adopts that model version, so its sessions carry the records D2.1 reads.

**Route to compression (Part 2):** D3.1 and D3.2 need only D2, so they can ship to the preview
before D4. A read-only preview could replace the old page early, with acting following it.

## 4. Owners
*An owner for every deliverable, including anything that needs the owner or an outside party.*

| Deliverable | Owner |
|---|---|
| D1 | Researcher and Source checker, through research requests Q-001, Q-002, Q-004 to Q-009 (Q-003 dropped) filed by the Chief of Staff |
| D2 to D5 | Builder, to specs by the Definer, checks by the Check author, review by the Reviewer |
| D5.2 | Reviewer, with a security focus |
| Rulings: move to Build, criteria, tier, spend ceiling, launch, anything on D1.3 | The owner (Kenny) |
| Cloudflare and GitHub settings, and any secret | The owner, by hand. No agent holds them |
| D6.1 preview deploy | Builder; the owner approves launch |
| D6.2 address cut-over | The owner approves; Builder carries it out |
| D6.3 operating notes | Builder, with the Chief of Staff |
| Carrying out planning choices (D4.2) | Chief of Staff |
| D7 usage recording | The model's tools builder, to a model spec by the Definer, reviewed by the model's Reviewer; the owner approves the model change |
| Outside parties | GitHub and Cloudflare as platforms; Anthropic if the desk starts sessions (U3) |

## 5. Limits
*The spend ceiling, the data boundaries (what data may go to which outside service), and the tier (T1, T2 or T3 by the tier triggers), which is the project's trust level.*

- **Hosting spend ceiling (proposed): $0 a month.** Free tiers only, as Operations-Hub runs
  today. U1 shows the first version fits Cloudflare's Free plan if O3's measurement holds (§7); if
  it doesn't, the fallbacks are one invocation per repository on Free, or the $5 Paid plan, which
  needs a new ceiling from the owner. The owner said spend follows value, so any paid item comes
  with its own value case.
- **AI spend (proposed, for the owner to set on the move-to-Build card):** the agents that build the
  desk run through the owner's existing Claude Code setup. The playbook asks each project to record
  a monthly AI-spend ceiling and an 80% alert (docs/playbooks/software.md §10); the owner sets those
  numbers on the card.
- **Data boundaries:** the desk reads only the connected project and portfolio repositories. It may
  send their content only to GitHub and Cloudflare, plus Anthropic if U3 leads to sessions. No
  secret is ever sent to a model.
- **Tier (proposed): T1, as AGENTS.md says today.** Against the T1 → T2 triggers
  (docs/playbooks/software.md §3):
  - *Any external user:* none; the Access policy names one email address, the owner's (F-auth-02
    shows a policy can name specific addresses).
  - *Deploys to a shared environment:* the desk deploys to the owner's own Cloudflare account, used
    by the owner alone. We read "shared" as used by others, so this doesn't trigger; the owner
    rules on that reading.
  - *Anyone else's personal data:* none; the desk reads only the owner's repositories.
  - *3+ concurrent agents:* Build is planned with at most two agents at once; the Definer holds it
    to that in Define. More would trigger T2.
  - *A second human committer:* none; the humans block names only the owner.
  - *A release that hurt someone:* none.
  Operations-Hub's scope also made write-back a T2 trigger. Under the prefilled-link route the
  desk holds only a read token, so it doesn't apply. The owner rules the tier on the move-to-Build
  card.

## 6. Value and stop rule
*This project's own measure of value, the target and date, and what counts as a miss — including the cost to the owner's time. Write each value target on its own line starting with its ID, like `V1: <measure>, <target>, <date>`; spec criteria trace to these IDs.*

*Proposed values; the owner sets them on the move-to-Build card.*

V1: Missed decisions: items waiting on the owner in a connected project that the desk did not show within 5 minutes, 0 over the first 14 days after launch, 2026-11-11
V2: False alarms: items the desk flagged that did not need the owner, at most 1 a week over the first 14 days after launch, 2026-11-11
V3: Owner upkeep: the owner's time on the desk itself (tokens, settings, adding repositories), at most 30 minutes a week after launch, 2026-11-11
V4: Replacement: the desk serves the Operations-Hub address and the old repository is archived, by 2026-10-28

V4's date is proposed: the owner said on 2026-10-04 that it can move, and sets it on the
move-to-Build card.

**Miss and stop rule:** a miss is V4 not met by 2026-10-28, or the redesign taking more than about
2 hours a week of the owner's time before launch. At a miss, the owner rules: re-aim (for example,
launch read-only and add acting after) or stop. A V1 to V3 miss after launch goes to the stage-8
evidence review, where the owner rules continue, re-aim or stop. V1 misses are found in Define's
design by comparing each repository's card times with the desk's own log of what it showed. Operations-Hub stays live until launch, so stopping
loses nothing that exists today. The 5-minute figure in V1 rests on U4.

## 7. Solid foundation
*Every load-bearing unknown, each answered with evidence (library entry or research memo), including through research sub-projects if needed.*

*Draft 4, 2026-10-04, Chief of Staff, after the Critic's second definition-of-ready return. U1 to
U4 rest on library entries only; each entry, or for the Q-004 entries the file header, names the
source check that filed it. Each A or B grade is the one filed in that entry; C marks our own
inference or an absence we found, and E our own estimate (shown with its arithmetic). Items still open are under "Open at this exit" below.*

| Unknown | Why it bears load | Evidence | Status |
|---|---|---|---|
| U1 Hosting a live, interactive, single-user app: options, cost, upkeep | §5 spend, V3, D2 to D4 | F-hosting-01, -02a/b/c, -03 to -06, F-auth-01 to -04, F-gh-04, P-auth-01, F-cf-01 to -07, P-cf-01, F-cf-workers-01 to -03, -05 to -08 | Answered except O3 (CPU per reconcile, measured in Define) |
| U2 Acting in GitHub on the owner's behalf: mechanisms, attribution, credential risk | D4, D5, the tier, D-011 | L-F1 to L-F6, L-F8 to L-F12, L-P1 | Answered; the prefilled-link route is the owner's ruling (O1); it rests on O4 |
| U3 What starting, steering or monitoring Claude Code sessions from a web app can do | D1.3, the owner's later ruling | LIB-F-a to -i, LIB-P-a | Answered enough for the owner's ruling |
| U4 How quickly GitHub changes can reach a web page | V1, D2.2 | F-Q004-1, -2, -3a, -4, -6 to -13, PAT-Q004-1 | Answered: 5 minutes is reachable with a page-driven poll; webhooks optional |
| Deploying the desk into the `needs-you` Pages project, behind Access | D6, V4 | F-cf-02, -03, -04, -07, P-cf-01; Operations-Hub's workflow deploys `needs-you` with `wrangler pages deploy` (observed, C) | Answered (O5, closed) |
| A fine-grained read token reads the v3 records the screens need | D2.1 | Operations-Hub docs/research/002 and 004 (v2 records), and on 2026-10-01 the hub reading Service-Desk; outside the library | Observed, not filed (C); reading the v3 files themselves is inferred (C). Not load-bearing for the design: if the token can't read them, the fix is one read permission the owner adds by hand. Parsing them is D2.1 build work |

### U1 — Hosting
- **The desk is a Cloudflare Pages project with Pages Functions, deployed into the existing
  `needs-you` project, behind Access.**
  - Pages Functions run on Cloudflare Workers, and their requests count against the Workers plan
    quota (F-cf-06, A). That the runtime limits are identical to a Worker's is not documented
    (F-cf-06); the Free-plan limits below are the Workers ones, and Define's measurement (O3) is
    taken on the Pages project itself.
  - The Free plan gives 100,000 requests a day, resetting at midnight UTC (F-cf-workers-05, A), and
    static asset requests are free (F-hosting-01, A).
  - Access is free for up to 50 users, and a policy can name specific email addresses (F-auth-01,
    -02, A).
- **Taking over the address (O5, closed by research Q-008).**
  - A production deployment to a Pages project, by Git commit or `wrangler pages deploy`, changes
    what `<project>.pages.dev` and its custom domains serve; rollback is instant (F-cf-02, A).
  - A project can't switch deployment method (F-cf-03, B). Operations-Hub deploys `needs-you` with
    `wrangler pages deploy`, a Direct Upload (observed in its workflow, C), so the desk deploys the
    same way.
  - The documented routes are to deploy into the same Pages project, or to host elsewhere and 301
    the `pages.dev` address to a custom domain (P-cf-01, C; F-cf-07, A). The desk takes the first.
    Whether a Worker can hold a `pages.dev` address is not documented, so a plain Worker is not used.
  - Pages-only gaps that matter: no Cron Triggers, and Durable Objects only by workaround (F-cf-06).
    The design needs neither (below).
- **What the free plan limits, and how the design stays inside them.**
  - **CPU:** 10 ms per request on the Free plan, and time spent waiting on network requests doesn't
    count (F-cf-workers-01, A). Occasional overages are tolerated (F-cf-workers-08, B).
  - **Outbound requests:** 50 per invocation on Free, each redirect hop counting
    (F-cf-workers-02, A). A reconcile makes about 15: 3 conditional requests for each of 5
    repositories (PAT-Q004-1; E1).
  - **Connections:** up to six may wait for response headers at once; a seventh waits until one
    gets its headers (F-cf-workers-03, A; F-cf-workers-07, B). Fifteen requests run in waves.
  - **What stays open (O3):** whether the CPU spent parsing 15 responses fits 10 ms. Most polls get
    an empty 304 when nothing changed (F-Q004-7), but the figure is only known by measuring.
  - **Requests:** one page polling every minute for 16 hours is 960 requests a day, against 100,000
    (E2: 60 × 16 = 960).
  - **The page drives the reconcile poll; no cron or alarm is needed.** While the desk is open, the
    page asks the function every 1 to 2 minutes, and the function makes conditional requests to
    GitHub. When the desk is closed, nothing needs showing, so nothing polls, and opening it
    reconciles at once (design; see "show" in §8).
  - **WebSockets aren't used.** Cloudflare bills incoming WebSocket messages at 20 to 1 as requests
    (F-hosting-02c, A); the desk polls over plain HTTP, so the question never arises.
- **Two requirements carry into D5.**
  - Validate the Access token in the function (F-auth-04, A).
  - Put an Access policy on every hostname. Pages' own "Enable access policy" covers previews only;
    `*.pages.dev` needs the wildcard removed from the Access app, and each custom domain needs its
    own policy (F-cf-04, A). Worker-level Access (F-cf-05, A) is not documented for Pages.
- **The others are worse fits.**
  - Vercel Hobby is non-commercial personal use only (F-hosting-03, A).
  - Fly.io offers only a trial of 2 hours of machine time or 7 days; no lasting free tier is
    described (F-hosting-04a, A).
  - Render's free service sleeps after 15 minutes idle (F-hosting-05, A).
  - A Hetzner server is about €5.49 a month (F-hosting-06, A); that it needs the most upkeep is our
    judgement (C).
  - GitHub Pages sites are public, even when the repository is private, "if your plan or
    organization allows it" (F-gh-04, A). The entry doesn't cover private publishing on Enterprise
    plans.
- **Upkeep (V3):** the Access policies, one Pages project, and the read token (U2).

### U2 — Acting on the owner's behalf
- **Who GitHub shows as the actor (Q-002 §1 to §4, §9):**
  - **App installation token:** the app's bot, `name[bot]` (L-F1, A). It cannot record an answer
    as the owner.
  - **GitHub App user token:** the owner, with the app's badge in the UI and the security log
    (L-F10, A; the library notes the badge and security-log detail rest on one page). The token
    lasts 8 hours and the refresh token 6 months (L-F2, A).
  - **Fine-grained personal access token:** recorded as the owner. It is limited to chosen
    repositories and permissions, and can run to an expiry date or none (L-F5, B). We found no
    documented marking that separates its actions from the browser's; that is an absence, not a
    filed fact (C).
  - **OAuth app token (`repo` scope):** the owner, across every repository the owner can reach
    (L-F4, B). Too broad for the desk.
- **Writing an answer file through the API** is listed under Contents: write and Workflows: write,
  marked "additional permissions"; the tables don't say whether both are needed or either suffices
  (L-F9, B). Under the prefilled-link route the desk makes no such call, so this only matters for the later token
  routes.
- **Storage (L-P1, B):** encrypted on the back end. A GitHub App private key is kept sign-only in a
  key vault, not in environment variables. No secret ever goes to a model (§5).
- **A route with no credential at all:** the desk links each card to GitHub's new-file page with the
  answer already filled in, and the owner commits it on GitHub. The desk then needs only a read
  token. It rests on GitHub's new-file page taking a prefilled file name and content from a link,
  in the owner's phone browser. That is not yet in the library: open item O4, research Q-007.
- **The prefilled-link route is the owner's ruling of 2026-10-01** (see "Owner rulings"
  in §8). The token routes stay possible after launch; each
  would need two things first:
  - a D-066 ruling that an answer the desk writes with the owner's token counts as the owner's own
    action;
  - for a GitHub App user token only, a live test in Define that its commit starts the run.
    Personal access tokens are documented to start runs (L-F8, B); user tokens are not (C).

### U3 — Running work from the desk
*Out of the first version (§1). Recorded here only to inform the owner's later ruling.*
- **What the library holds:**
  - A routine's `/fire` endpoint starts a Claude Code cloud session over HTTP (LIB-F-a, A), with
    per-action hourly limits and an optional beta header (LIB-F-a2, A). Who can run routines and
    who can trigger the Claude Code GitHub Action is in LIB-F-h (A).
  - Cloud sessions bill to the claude.ai subscription and can't use an API key (LIB-F-c, A). A
    message can be queued into a running cloud session from the CLI (LIB-F-b, A).
  - The GitHub Action authenticates with an API key or a `claude setup-token` token, the latter on
    subscription plans only (LIB-F-d, A).
  - Managed Agents give full control by REST, with their own lifecycle and price (LIB-F-f, A); the
    Agent SDK's cost fields are estimates (LIB-F-g, A).
  - Licensing (LIB-F-e, A): "Unless previously approved, Anthropic does not allow third party
    developers to offer claude.ai login or rate limits for their products, including agents built
    on the Claude Agent SDK." Whether one owner's private desk may use the owner's own subscription
    isn't in the library; it needs the Terms.
- **Not in the library (C):** we found no documented API to read back or stop a cloud session.
- **What it means:** full control (start, message, monitor, stop) needs the paid API routes, which
  break the $0 ceiling and need their own value case (§5). On the subscription, the desk could at
  most start work and link to it.
- **Recommendation:** keep U3 out of the first version, as §1 has it. Revisit after launch with a
  value case.

### U4 — How fast changes reach the desk
- **Webhooks alone can't meet 5 minutes.**
  - GitHub calls delivery "near real-time" but says it "can take a few minutes" (F-Q004-3a, A).
  - Deliveries can arrive out of order (F-Q004-12, A) and are not retried automatically
    (F-Q004-1, A).
  - Push webhooks ran up to 40 minutes late on 2026-02-03 (F-Q004-4, B).
- **Polling is cheap enough to back them up.**
  - A conditional request that returns 304 costs nothing against the limit (F-Q004-7, A).
  - About 3 calls per repository each minute, for 5 repositories, is about 900 calls an hour,
    against a limit of 5,000 (estimate E1).
- **Design for D2.2 (PAT-Q004-1):** a reconcile poll every 1 to 2 minutes while the desk is open,
  driven by the page (U1). That alone meets V1's 5 minutes. Webhooks can be added later for speed;
  the first version doesn't depend on them.
  - **If webhooks are added:** the endpoint answers within 10 seconds and queues the work
    (F-Q004-2). It orders events by their timestamps and drops repeats by delivery ID.
  - **The rate limit above is GitHub's, not Cloudflare's.** Cloudflare's limits are under U1.
  - **Don't use the Events API for freshness:** its latency is 30 seconds to 6 hours (F-Q004-9, A).

### Open at this exit
Each item has an owner and a place where it closes. O1 and O2 are closed by the owner's rulings,
O3's acceptance is the owner's too, O5 is closed by research, and O4 and O6 wait on research (see "Owner rulings" in §8).

| ID | Open item | Bears on | Closes by |
|---|---|---|---|
| O1 | Which route the desk acts through | D4, D5, the tier | **Closed** by the owner's ruling: the prefilled-link route (rests on O4) |
| O2 | Whether planning and scheduling (D3.4, D4.2) are in the first version | §1, D3, D4, V4 | **Closed** by the owner's ruling: in |
| O3 | Whether the CPU one reconcile spends parsing about 15 responses fits the Free plan's 10 ms | U1, $0 ceiling | **Open into Define, as the owner accepted on 2026-10-04.** This is an exception to the definition of ready's item 7, put to the owner on the move-to-Build card. Research Q-006 settled the rest: network waits don't count as CPU, 50 outbound requests are allowed, and overages are tolerated occasionally (F-cf-workers-01, -02, -08). Closes by measuring one reconcile on the Pages project in Define. If it doesn't fit: one invocation per repository, or the $5 Paid plan, which needs a new ceiling from the owner (F-hosting-01) |
| O4 | Whether GitHub's new-file page takes a prefilled file name and content from a link, and lets the owner commit from a phone browser | D4, the prefilled-link route | Research Q-007. If it doesn't: the desk shows the answer to copy and links to the empty new-file page, or the owner rules on a token route |
| O5 | How the desk takes over the `needs-you` Pages address | V4, D6.2, U1 | **Closed** by research Q-008: the desk is a Pages project with Functions, deployed into `needs-you` by `wrangler pages deploy` (U1) |
| O6 | Which usage and context figures Claude Code's command line reports for a session run non-interactively (tokens by kind, turns, context-window use, duration) | D7, D3.6 | Research Q-009. Whatever it reports is what D7 records; a figure it doesn't report is shown as not available |

## 8. Clear and consistent
*Key terms defined; constraints checked against each other and found not to contradict.*

**Terms.**
- *Desk:* this project's product, Service Desk.
- *Needs the owner:* an open card in a connected project's `queue/`, or a PR or question that
  waits on the owner's verdict.
- *Act:* the desk prepares the owner's answer in the form the Orchestrator already reads
  (`decisions/<item>/<gate>-<card>.md`) and opens GitHub's new-file page with it filled in; the
  owner commits it. The desk writes nothing to a repository itself.
- *Quiet:* nothing needs the owner. Shown plainly; it is the success state.
- *Real time:* within V1's figure, 5 minutes, unless U4 changes it.
- *Show:* on the screen while the owner has the desk open, or as soon as the owner opens it. V1
  counts an item missed if it was waiting for more than 5 minutes and the open desk didn't show it.
- *Connected project:* a repository on the desk's list, with a token that can read it.

**Owner rulings this brief relies on.** They live in the project's decision records, which the
Critic's pack does not include; the owner confirms all of them on the move-to-Build card.
- Route A, prefilled GitHub links; the desk holds no write credential (2026-10-01; O1).
- Planning and scheduling in the first version (2026-10-01; O2).
- O3 stays open into Define, closed by a measurement there with the stated fallback (2026-10-04).
- Spend is out of the first version; the desk shows the time asked of the owner (2026-10-04).
- Planning choices are recorded and carried out by the Chief of Staff, not acted on automatically
  by the Orchestrators, in the first version (2026-10-04).
- Agent usage and context are in the first version, with the model change they need (D7), even if
  launch moves (2026-10-04).
- Two pages of a vendor's own documentation count as two sources for how its own product behaves
  (2026-10-01 for Anthropic, widened to any vendor on 2026-10-03); cost, risk and quality claims
  still need an independent source. This one is also in governance/standards/sources.md.

**Checks, and the tensions.**
- "Never a source of truth" against planning and scheduling: no conflict, provided planning choices
  are recorded as rulings in the repositories (§1). D2 and D4 must keep it that way.
- D-066 allows proxy answers only by the Chief of Staff, and never for words that close an item or
  approve launch. U2 shows the desk can write with the owner's own identity: a GitHub App user
  token, or a fine-grained token. Resolved by the owner's ruling for the no-credential route (O1), so the
  owner commits each answer and no proxy question arises.
- Scope against the owner's picks: resolved. The owner put planning and scheduling in the first
  version (O2), so it is a fifth pick (Part 2).
- Tier: AGENTS.md says T1, and §5 now proposes T1. The owner confirms at the move to Build.
- Scope against the date: planning and scheduling (D3.4, D4.2) and usage recording (D7, a model
  change) put 2026-10-28 at risk. The owner accepted that the date can move (2026-10-04); V4's date
  is set on the move-to-Build card. §3's route to compression still applies: D3.1 and D3.2 can ship
  to the preview first.
- Spend: $0 against "spend follows value". The first version fits $0 on Cloudflare's Free plan if
  O3's measurement holds; its fallbacks and U3's paid routes would need a new ceiling from the
  owner, and U3 is out of the first version.
- Timeline against research: D1 must land within the first week to keep V4. Four of its questions
  passed on day 1 (2026-10-01); Q-006 and Q-008 passed on 2026-10-04 (O5 closed, O3 narrowed); O4 and O6 wait on Q-007
  and Q-009.

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
The owner picked all four, and on 2026-10-01 added a fifth:
1. **The Universe screen:** one box per project, with state, headline, sprint and main-branch
   health. This is the old hub's core and must not get worse.
2. **Decision cards:** v3's seven-part cards and owner questions, readable in full on the desk.
3. **Team and pipeline:** where each project sits in the v3 stages (Shape, Build, Run), who is
   working, and what comes next.
4. **Spend and time:** spend against each project's ceiling, and the cost to the owner's time.
   On 2026-10-04 the owner deferred spend, because no project records it yet; time stays.
5. **Planning and scheduling.** The owner, 2026-10-01: "No I want planning and scheduling in".
6. **Agent usage and context.** The owner, 2026-10-04: "It's important for me to see timelines and
   context windows to be able to drive things." Chosen over keeping the launch date: "The launch
   date isn't set in stone."

### Preferences and trade-offs
- **Phone first.** Desktop is a bigger view of the same thing.
- **Open to the desk becoming the easier way to run projects.** The model was designed to run from
  a Claude Code window. The owner clarified: "if a design can be reached that makes future projects
  or builds easier to run via the service desk than the are in a Claude code session - I am open to
  that. I just hadn't thought that far so I can't be definitive about what is possible yet." So
  running work from the desk is welcome where it is genuinely easier than a Claude Code session,
  but it is not yet a requirement. Shape should find out what is possible and show the owner, and
  the owner decides then.
- **Why running work from the desk could matter: requests get buried.** The owner, 2026-10-01:
  "here we see a potential justification for executing the sessions within the webpage. Simply
  because the Claude windows tend to expand as actions are completed, or with tests, or other
  setup. The point being that requests get buried sometimes in a Claude code conversation." The
  case in point: on the first day of Shape, decisions the owner needed to make (a security card,
  a merge, a yes or no) sat inside long streams of progress messages. Whatever the desk becomes, a
  request for the owner must stand apart from activity, and never depend on the owner scrolling a
  conversation to find it.
- **Spend follows value.** "I'm open to most anything if the value can be justified." There is no
  fixed ceiling yet. Every paid service carries its value case, and Part 1 §5 still needs a
  number.
- **Four weeks, with a faster route shown; the date can move.** On 2026-10-04 the owner said "The
  launch date isn't set in stone" when choosing to include usage and context. Launch by 2026-10-28 is acceptable, "but with a route
  to timeline compression if we work it aggressively." The plan should show what could shorten it
  and what that would cost.
- **Accepted risk: the session token.** Two Q-003 Researcher sessions read the session OAuth token
  (Service-Desk queue/Q-003-failure-1.md; model LESSONS LL-013). The Chief of Staff advised rotating
  it. The owner, 2026-10-01: "I'm not rotating the token, I am comfortable with the risk level."
- **Acting means write access.** The old hub deferred write-back because the page would then hold
  the owner's credentials, which makes it T2 and needs a security review (Operations-Hub
  SCOPE.md). The owner accepted that trade by choosing to act from the desk. Then, on 2026-10-01,
  the owner chose the route that avoids it for the first version: the desk prepares each answer and
  the owner commits it on GitHub, so the desk holds no write credential (the prefilled-link route).

### What the owner would hate
- **False alarms.** It flags things that don't need the owner, and trust erodes.
- **Missed decisions.** Something waits on the owner while the desk says "quiet".
- **Upkeep on the owner.** Time spent on tokens, configuration or adding repositories.

### Carried forward, to reconfirm
These come from the Pocket Universe design guide (Operations-Hub docs/research/001), not from this
conversation:
- Exceptions first, activity second. Quiet is the success state.
- Only flag what needs a human. A gate catching a problem, or an agent retrying, is activity.
- The desk is never a source of truth. Every answer lands in the repository as the owner's own
  commit.

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
   upkeep? The owner is open to it but has not decided (see Preferences). The owner's reason to
   want it is that requests get buried in long Claude Code conversations, so the question includes
   whether the desk can keep every request for the owner separate from the activity around it.
4. **The spend ceiling and the tier** that Part 1 §5 must state.
