Status: I re-read the routines and GitHub Actions pages in full to fix F-13 and F-14. The Remote Control page spilled to a cache file outside the folder again, so I'm narrowing F-07 rather than reading that file. Writing the revised memo now.

# Q-005 — researcher return, revision 1 (2026-10-01)

I fixed the three claims the source checker failed (F-13, F-14, F-07) and two smaller errors I found while re-reading. F-07 is narrowed, not fully fixed: the Remote Control page again came back too large for me to read. The rest of the memo is as before, and the full revised memo is below for the Orchestrator to record.

## 1. What I changed
I have no write tool, so nothing changed on disk.

- **F-13 (stopping routines).** "Paused or deleted… with `/schedule` in the CLI" is gone. Pause and resume are a switch on the routine page, and delete is a menu item there, both in the web UI. The CLI's documented commands are create, `list`, `update`, `run`, adding a GitHub trigger, and asking about run history. Pause and delete from the CLI are now marked **not documented**. I added that each run can be archived or deleted from its session menu, that a Team or Enterprise Owner's switch stops all routines, and that runs are skipped while the GitHub connection is missing.
- **F-14 (who can trigger the Action).** The write-access check now covers issue and PR events only. Events no user authors, such as `schedule`, skip it, and `allowed_non_write_users` (with your own `github_token`) is an exception. I added the separate bot check, which applies to every event, scheduled runs included.
- **F-07 (Remote Control).** It now holds only what I saw on the official pages. The absence claim is no longer a fact. It is recorded as **not established** (page not fully read), and the open question is reworded to match.
- **F-09.** Added the required header `anthropic-beta: experimental-cc-routine-2026-04-01`, which I left out before. It is the dated header under which "breaking changes ship".
- **F-12.** Corrected against the full limits table.
  - What happens over a limit differs: scheduled runs wait, while Run now and API fires fail.
  - Run now has its own limit of 100 per hour per account.
  - Past the subscription limit, organizations with usage credits turned on continue "on metered overage". Without credits, extra runs are rejected.
- **§3.** The source checker said `research/Q-005.md` didn't exist. It does exist in the folder now, and I re-read it this round.

## 2. Why
`research/Q-005-source-check.md` found F-13 and F-14 broader than their pages, and F-07's absence claim unverifiable. It asked me to correct them so it can recheck. F-09 and F-12 changed because re-reading the routines page in full showed my first version was incomplete.

## 3. What I verified (commands and results)
- **Read in the folder:**
  - `BRIEF.md`, `research/Q-005.md`, `research/Q-005-memo.md`, `research/Q-005-source-check.md`.
  - I listed `library/` (five entries filed last round) but did not open them.
  - As before, I did not read `.env*`, `.npmrc`, `.yarnrc*`, `package*.json`, the lock files or `.gitmodules`.
- **WebFetch of code.claude.com/docs/en/routines:** the full page text came back. It supports the new F-13 and the corrections to F-09 and F-12.
- **WebFetch of code.claude.com/docs/en/github-actions:** the full page text came back. It supports the new F-14, including the "Who can trigger runs" section quoted below.
- **WebFetch of code.claude.com/docs/en/remote-control (and `.md`), twice:** both spilled to a cache file outside the folder, and I did not read it. Only the opening (about 2 KB) was visible.
- **One WebSearch** limited to Anthropic domains, about Remote Control requirements. The result was a search-tool summary, not page text, so anything taken from it is graded B and marked as needing a recheck.

## 4. What is undone
- I have still not read the Remote Control page in full. The F-07 absence claim is open.
- Carried over from last round:
  - GitHub Actions billing pages and GitHub's fine-grained token permission names.
  - Anthropic's Commercial and Consumer Terms (needed for Q-005a).
  - Usage limits for the claude.ai Pro, Max and Team plans.
- I did not look for second pages for the held entries LIB-F-b, LIB-F-d and LIB-F-e (see §5).

## 5. Needed outside my lane
- **Source checker:**
  - Recheck F-07, F-09, F-12, F-13 and F-14.
  - F-07 needs someone who can read the full Remote Control page. Two reads on my side have failed, so the Orchestrator may want to route it differently.
  - On independence: product behaviour is only documented by Anthropic, so a non-Anthropic source can't corroborate it. Whether separate Anthropic pages count as two sources is a ruling for the Chief of Staff or owner, not me.
- **Held entries:** a second page may exist. Two leads, neither checked:
  - The authentication page ("Generate a long-lived token") partly backs LIB-F-d.
  - The routines page backs the "GitHub user" part of nothing held.
- **Q-005a** (whether the desk may use the owner's subscription) still needs the Terms read, and possibly a decision card to the owner.

## 6. Open questions
- **Q-005a.** Does the Agent SDK note restrict a single owner's private desk from using the owner's subscription (an OAuth token, or `--cloud` follow-ups)? Not documented. It needs the Terms.
- **Q-005b.** Is there a read or list API for claude.ai cloud-session transcripts or status? None in the pages or the llms.txt index I read. The `/fire` token has "no read access". An absence in the index is not proof.
- **Q-005c.** When will routines and `/fire` leave research preview, and will the limits change? Not documented. The page does say the two most recent earlier beta-header versions keep working.
- **Q-005d.** Can a running cloud session or routine run be stopped through an API, rather than archived or deleted in the UI? Not documented.
- **Q-005e (reworded).** Does the Remote Control page document any API or third-party access? Not established, because the page has not been read in full.

---

# MEMO — Q-005: Driving Claude Code / Agent SDK work on GitHub from a web application
Date 2026-10-01 (revision 1) · Depth 3 · Topics: claude-code, agents, automation, cost

**Grades.**
- **A:** official Anthropic or GitHub doc, full text read.
- **B:** official doc read through the fetch or search tool's summary, or a detail that needs a recheck.
- **C:** inference across sources.

Each item is marked **fact**, **estimate** or **opinion**.

**Volatility.** Routines are a research preview, `/fire` is experimental, and Managed Agents is a beta. Suggested shelf life for those entries: 3 months.

## Summary of routes
| Route | Start | Send message | Monitor / read output | Stop | Credential | Billing |
|---|---|---|---|---|---|---|
| R1 Cloud sessions (claude.ai/code) | UI, `claude --cloud` | UI; `claude -p "…" --cloud <id>` | UI only (no read API found) | UI archive/delete; stops when inactive | claude.ai login | Subscription |
| R2 Routines + `/fire` API | HTTP POST per routine; schedule; GitHub PR/release events; Run now | Not by API (UI or CLI follow-up) | Returns session URL; read in UI | Pause/delete routine in web UI; archive/delete a run's session in UI | Per-routine bearer token | Subscription (+ usage credits) |
| R3 Claude Code GitHub Action | `@claude` comment; any GitHub event; `workflow_dispatch` via GitHub | New comment or dispatch | Issue/PR comments; run logs via GitHub API | GitHub cancel/force-cancel run | API key, OAuth token or OIDC federation; kept as GitHub Secrets | API tokens or subscription, plus Actions minutes |
| R4 Agent SDK (self-hosted) | Your server calls `query()` | `streamInput()` / `ClaudeSDKClient` | Streamed messages, transcripts, OTEL | `interrupt()`, `close()`, abort | Console API key (or Bedrock/Vertex/Foundry) | API tokens plus your hosting |
| R5 Managed Agents (REST) | `POST /v1/sessions` | `POST …/events` | SSE stream, event history, webhooks | `user.interrupt`, archive, delete, budget | Console API key; GitHub token per session | API tokens + $0.08/session-hour running |

## R1 — Cloud sessions (Claude Code on the web)
- **F-01 (fact, A).** Cloud sessions are available on Pro, Max and Team plans, and for Enterprise premium or Chat + Claude Code seats.
  - They run on Anthropic-managed VMs (or a self-hosted environment) and keep running after the laptop closes.
  - Start from: claude.ai/code, the mobile app, the Desktop app, `claude --cloud`, or routines.
  - Source: code.claude.com/docs/en/claude-code-on-the-web
- **F-02 (fact, A).** GitHub access is granted one of two ways:
  - the Claude GitHub App, or
  - `/web-setup`, which syncs the local `gh` token to the Claude account.
  - In Anthropic-hosted environments, "your GitHub credentials stay encrypted on Anthropic's servers and never enter a session's VM". A GitHub proxy attaches them server-side.
  - Source: same page
- **F-03 (fact, A).** A script can send follow-up messages with `claude -p "message" --cloud <session-id>`.
  - It "queues the message… and exits without waiting for a reply".
  - `--output-format json` returns `{ok, session_id, url}`.
  - It needs a claude.ai login (`claude auth login`) and the org policy `allow_remote_sessions`.
  - It does not work with Bedrock, Vertex or other third-party providers.
  - The docs name sending follow-ups "from a CI script" as a use.
  - Source: same page
- **F-04 (fact, A).** Monitoring and output:
  - Sessions appear in the claude.ai/code sidebar with a diff view, and a PR can be created from the UI.
  - `--teleport` pulls a session and its branch into a terminal, and needs claude.ai subscription auth.
  - Sharing views "don't update in real time".
  - **Not documented:** any API to list sessions or read transcripts.
  - Source: same page
- **F-05 (fact, A).** Stopping and limits:
  - Sessions can be archived (archived sessions reject new messages) or deleted permanently.
  - They "stop after a period of inactivity" and the VM is reclaimed. The period is not documented.
  - "Cloud sessions share rate limits with all other Claude and Claude Code usage within your account… There is no separate compute charge for the cloud VM."
  - Zero Data Retention organizations can't use cloud sessions.
  - Org IP allowlisting breaks Anthropic-hosted sessions.
  - Source: same page
- **F-06 (fact, A).** "Cloud sessions always use your subscription credentials." Setting `ANTHROPIC_API_KEY` in the cloud environment doesn't override this.
  - `claude setup-token` makes a one-year OAuth token that "can only make model requests, so it can't establish Remote Control sessions."
  - Source: code.claude.com/docs/en/authentication
- **F-07 (fact, A for the first two points; B for the third). Revised.**
  - **What it is (A).** Remote Control "connects claude.ai/code or the Claude app for iOS and Android to a Claude Code session running on your machine". "Claude keeps running locally the entire time". Messages can be sent "from your terminal, browser, and phone interchangeably". Source: code.claude.com/docs/en/remote-control, opening section.
  - **Token limit (A).** A `setup-token` OAuth token "can't establish Remote Control sessions". Source: authentication page (F-06).
  - **Requirements (B, from a search-tool summary; recheck on the page).**
    - Pro, Max, Team and Enterprise plans.
    - "API keys are not supported". You sign in through claude.ai with `/login`.
    - Not available with Bedrock, Agent Platform or Foundry, or with `ANTHROPIC_BASE_URL` pointed at another host.
    - On Team and Enterprise, an Owner must turn it on.
  - **Not established:** whether the page documents any API or third-party access to Remote Control. I have not read the page in full, so this is not an absence claim (Q-005e).

## R2 — Routines and the `/fire` endpoint (the only documented HTTP way to start a cloud session)
- **F-08 (fact, A).** What a routine is:
  - A saved prompt plus repositories, environment and connectors.
  - Triggers: schedule (recurring, minimum 1 hour, or a one-off time), API, or GitHub events (pull request and release only).
  - Research preview. Available on Pro, Max, Team and Enterprise.
  - Routines belong to the individual account. Commits and PRs "carry your GitHub user".
  - They run fully autonomously ("no permission-mode picker").
  - Claude pushes to `claude/`-prefixed branches. Pushes elsewhere are rejected if the branch is protected, has someone else's open PR, or carries others' commits.
  - Source: code.claude.com/docs/en/routines
- **F-09 (fact, A). Revised.** The endpoint:
  - `POST https://api.anthropic.com/v1/claude_code/routines/{trig_…}/fire`
  - Headers: `Authorization: Bearer <per-routine token>`, `anthropic-beta: experimental-cc-routine-2026-04-01` and `anthropic-version: 2023-06-01`.
  - Optional `text` field, up to 65,536 characters, passed as a literal string.
  - Returns `claude_code_session_id` and `claude_code_session_url`.
  - "It does not stream session output or wait for the session to complete."
  - No idempotency key, so a retry creates another session.
  - "Breaking changes ship behind new dated beta header versions, and the two most recent previous header versions continue to work."
  - Sources: platform.claude.com/docs/en/api/claude-code/routines-fire; routines page
- **F-10 (fact, A).** The token:
  - Made in the claude.ai web UI and "shown once". Docs say to "store it somewhere secure such as your alerting tool's secret store".
  - Scope: "One routine only; no read access."
  - "There is no public API for token management." It is regenerated or revoked in the same modal. "The CLI cannot currently create or revoke tokens."
  - `/fire` "is available to claude.ai users only and is not part of the Claude Platform API surface". Usage is billed as Claude Code subscription usage.
  - Sources: same pages
- **F-11 (fact, A).** Request `text` arrives wrapped in a `<routine-fire-payload>` block "that labels it as untrusted data". The routine's saved prompt must opt in to acting on it. The same wrapping applies to Run now text.
  - The routine's saved prompt itself is treated as the assigned task, "not live user input", and "can't act as approval or consent".
  - This bears on keeping requests separate from the activity around them.
  - Source: routines page
- **F-12 (fact, A). Revised.** Hourly limits, none with overage:
  - Scheduled runs (one-off runs included): 100 per hour per account. Over the limit, "the run waits".
  - Run now, API fires and re-arming a one-off: 30 per hour per routine, shared count. Over the limit, the action fails.
  - Run now: 100 per hour per account.
  - API fires: 100 per hour per account, counted separately from Run now. Over the limit, the call fails.
  - GitHub events have per-routine and per-account hourly caps, and excess events "are dropped".
  - Runs draw down subscription usage. Past that limit, organizations with usage credits on "can keep running routines on metered overage"; otherwise runs are rejected until the window resets.
  - Source: routines page
- **F-13 (fact, A). Revised.** Monitoring and stopping:
  - Each run is a normal session. "A green status… does not mean the task in your prompt succeeded."
  - A run's session can be renamed, archived or deleted from its session menu in the UI.
  - On the routine's detail page (web UI), an on/off switch pauses or resumes the schedule, and a menu item deletes the routine.
  - The CLI documents creating routines (`/schedule`, alias `/routines`), `/schedule list`, `/schedule update`, `/schedule run`, adding a GitHub trigger (v2.1.225 or later) and asking about run history (v2.1.227 or later). `/schedule` needs a claude.ai subscription login, not an API key, and is unavailable inside a cloud session.
  - **Not documented:** pausing or deleting a routine from the CLI, or any API to stop a run that is already going.
  - Other stops: a Team or Enterprise Owner's Routines switch makes "existing routines stop running". If the GitHub connection is missing, runs are skipped for up to 72 hours, then the routine turns off. While a subscription is paused, routines don't run.
  - Source: routines page

## R3 — Claude Code GitHub Action (`anthropics/claude-code-action@v1`)
- **F-14 (fact, A). Revised.** Modes and who can trigger:
  - **Interactive mode:** `@claude` in an issue or PR comment, a PR review, or a new issue's title or body. Progress and results appear as a comment that updates as it works.
  - **Automation mode:** a `prompt` input on any GitHub event, including `schedule`. Results go to the run log unless the prompt directs posting and Claude has a tool that can post.
  - **Write-access check:** "on issue and pull request events, the triggering user must have write access". Exceptions: users listed in `allowed_non_write_users` (with your own `github_token`), and "events that no user authors, such as a `schedule` trigger, skip this check."
  - **Bot check:** "on every event", bot actors are rejected unless listed in `allowed_bots`. This includes scheduled runs, which GitHub attributes to a repository user.
  - The Action is built on the Agent SDK.
  - Source: code.claude.com/docs/en/github-actions
- **F-15 (fact, A).** Credentials:
  - `ANTHROPIC_API_KEY` (Console), `CLAUDE_CODE_OAUTH_TOKEN` (subscription, from `claude setup-token`), or OIDC workload identity federation with no stored secret. Bedrock, Agent Platform and Foundry work via OIDC.
  - "Never commit API keys or OAuth tokens… Always store them as GitHub Secrets."
  - For shared secrets, use an API key, because an OAuth token "is tied to the subscription of the person who ran `claude setup-token`".
  - Deleting a secret leaves the credential valid.
  - The Claude GitHub App takes a fixed, broad permission set, including Actions, Workflows and Contents write. A custom app can be limited to Contents, Issues and Pull requests.
  - Source: same page
- **F-16 (fact, A).** Cost is GitHub Actions minutes plus API tokens, or subscription usage when an OAuth token is used. Controls: `--max-turns`, workflow timeouts and GitHub concurrency.
  - Source: same page
- **F-17 (fact, B).** How a web app drives this route through GitHub's REST API:
  - Start: `POST /repos/{o}/{r}/actions/workflows/{id}/dispatches`, with at most 25 inputs. It returns `workflow_run_id`, `run_url` and `html_url`.
  - List or get runs: `GET …/actions/runs[/{id}]`.
  - Stop: `POST …/runs/{id}/cancel` or `/force-cancel`.
  - Logs: `GET …/runs/{id}/logs`, which redirects to an archive whose link expires in 1 minute.
  - Classic tokens need `repo` scope. Fine-grained permission names are not confirmed.
  - Sources: docs.github.com/en/rest/actions/workflows; …/workflow-runs
- **E-01 (estimate, C).** Sending a new message into an Action job that is already running is not documented. Each new `@claude` comment or dispatch starts a new run.

## R4 — Claude Agent SDK, self-hosted behind your web app
- **F-18 (fact, A).** What it is:
  - A Python or TypeScript library that spawns the `claude` CLI as a subprocess.
  - Auth is a Console API key or Bedrock, Vertex or Foundry.
  - "Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK."
  - It may not be branded "Claude Code".
  - Governed by the Commercial Terms.
  - Source: code.claude.com/docs/en/agent-sdk/overview
- **F-19 (fact, A).** Hosting:
  - One session is one subprocess. Transcripts sit on local disk and are lost on restart unless a `SessionStore` is configured.
  - Suggested size: 1 GiB RAM, 5 GiB disk and 1 CPU per agent.
  - "No top-level session timeout"; use `maxTurns`.
  - Supply the key "from your secret manager", or keep it outside the container via a proxy (`ANTHROPIC_BASE_URL`). Keep tool credentials such as GitHub tokens out of the agent environment.
  - Multi-tenant isolation: per-tenant `cwd`, `CLAUDE_CONFIG_DIR`, and `settingSources: []`.
  - Sources: …/agent-sdk/hosting; …/agent-sdk/secure-deployment
- **F-20 (fact, B).** Control:
  - `streamInput()` adds turns.
  - `interrupt()` stops the current turn.
  - `close()` ends the process, and `abortController` is available.
  - `maxBudgetUsd` and `maxTurns` set limits.
  - Source: …/agent-sdk/typescript
- **F-21 (fact, A).** Cost:
  - "Anthropic token cost typically dominates container infrastructure cost by an order of magnitude or more" (about $0.05 per hour for a minimal container).
  - `total_cost_usd` is a "client-side estimate… Do not bill end users… from these fields." Use the Usage and Cost API instead.
  - Sources: …/hosting; …/cost-tracking
- **E-02 (estimate, C).** GitHub access is not built in. The agent uses git or `gh` with a credential you provide, ideally through a proxy (F-19).

## R5 — Claude Managed Agents (Anthropic-hosted, REST API)
- **F-22 (fact, A).** Status and model:
  - Beta, with header `managed-agents-2026-04-01`. Needs a Console API key and is on by default for API accounts.
  - Concepts: agent, environment, session, events.
  - "Not currently eligible for Zero Data Retention or HIPAA BAA."
  - Source: platform.claude.com/docs/en/managed-agents/overview
- **F-23 (fact, A).** Lifecycle:
  - Start: `POST /v1/sessions` (optionally with `initial_events`).
  - Send: `POST /v1/sessions/{id}/events` with `user.message`.
  - Statuses: idle, running, rescheduling, terminated.
  - Archive (blocks new events, keeps history) or delete. A running session must be interrupted first.
  - Optional hard `budget` in US cents, set at creation.
  - Sources: …/sessions; …/session-operations
- **F-24 (fact, B).** Monitoring:
  - SSE stream at `GET …/events/stream`. Full history at `GET …/events`, filterable by type.
  - `user.interrupt`: "A model response in progress stops immediately".
  - Source: …/events-and-streaming
- **F-25 (fact, A).** Webhooks:
  - Configured in the Console; HTTPS on port 443; signed with a `whsec_` secret.
  - Events include `session.status_idled` and `session.status_terminated`.
  - Up to 3 delivery attempts, then the event is dropped. "Webhooks aren't a durable log." Order is not guaranteed.
  - Source: …/managed-agents/webhooks
- **F-26 (fact, B).** GitHub:
  - A `github_repository` resource with an `authorization_token` that is "not echoed in API responses". The token can be rotated mid-session. Repositories are fixed for the session's life.
  - PRs go through the GitHub MCP server.
  - Docs advise "fine-grained personal access tokens with minimum required permissions".
  - **Not stated:** whether the token enters the sandbox.
  - Source: …/managed-agents/github
- **F-27 (fact, A).** Cost and limits:
  - Tokens at model rates, plus "$0.08 per session-hour", metered only while `running`.
  - Per-organization limits: 300 create requests and 1,200 read requests per minute, plus tier limits.
  - Sources: platform.claude.com/docs/en/about-claude/pricing; …/managed-agents/reference

## Keeping each owner request separate from the activity around it
- **F-28 (fact, A).** Each request starts its own session:
  - Each `--cloud` start, each `/fire` call and each GitHub event starts its own session. Routines don't "reuse sessions across events".
  - Managed Agents events are typed: `user.*` versus `agent.*`, `session.*` and `span.*`.
  - Routine fire text is wrapped and labelled untrusted, and the saved prompt is the assigned task (F-11).
  - Sources: routines; managed-agents/reference
- **O-01 (opinion, C).** Of the documented routes, R5 (and R4) give a web app its own record of each request and full read-back of the activity. As far as the docs show, R1 and R2 can start or nudge work, but read-back is by UI link only.

## Proposed library entries (for the Source checker)
Already filed last round: LIB-F-a, LIB-F-c, LIB-F-f, LIB-F-g and LIB-P-a.

**LIB-F-a needs an update.** F-09 and F-12 were revised:
- the `anthropic-beta` header and its versioning rule;
- the per-action limits table and what happens over each limit;
- the metered-overage wording.

Please compare these with the filed entry.

**Still held, unchanged:**
- LIB-F-b (F-03): topics claude-code, automation; grade A; shelf life 6 months.
- LIB-F-d (F-15 + F-16): topics claude-code, automation, cost; grade A; shelf life 6 months.
- LIB-F-e (F-18): topics agents, claude-code; grade A; shelf life 6 months.

**New:**
- **LIB-F-h = F-13 + F-14** ("Who can trigger and who can stop: routines and the GitHub Action"): topics claude-code, automation; grade A; shelf life 3 months. It rests on two pages, routines and github-actions, but each half rests on one page.

## Sources
- [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Automate work with routines](https://code.claude.com/docs/en/routines)
- [Trigger a routine through the API](https://platform.claude.com/docs/en/api/claude-code/routines-fire)
- [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Authentication](https://code.claude.com/docs/en/authentication)
- [Remote Control](https://code.claude.com/docs/en/remote-control) (opening section only, plus search summary)
- [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)
- [Hosting the Agent SDK](https://code.claude.com/docs/en/agent-sdk/hosting)
- [Securely deploying AI agents](https://code.claude.com/docs/en/agent-sdk/secure-deployment)
- [Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking)
- [Agent SDK reference – TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript)
- [Docs index (llms.txt)](https://code.claude.com/docs/llms.txt)
- [Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview)
- [Managed Agents – Start a session](https://platform.claude.com/docs/en/managed-agents/sessions)
- [Managed Agents – Session operations](https://platform.claude.com/docs/en/managed-agents/session-operations)
- [Managed Agents – Event stream](https://platform.claude.com/docs/en/managed-agents/events-and-streaming)
- [Managed Agents – Reference](https://platform.claude.com/docs/en/managed-agents/reference)
- [Managed Agents – Accessing GitHub](https://platform.claude.com/docs/en/managed-agents/github)
- [Managed Agents – Webhooks](https://platform.claude.com/docs/en/managed-agents/webhooks)
- [Claude Platform pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [GitHub REST – Workflows (dispatch)](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event)
- [GitHub REST – Workflow runs](https://docs.github.com/en/rest/actions/workflow-runs)
