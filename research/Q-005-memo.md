# Q-005 — researcher return (2026-10-01)

## 1. What I changed
Nothing on disk. I have no write tool. The full memo is below so the Orchestrator can record it verbatim in `research/` (D-064).

## 2. Why
Q-005 asks for a depth-3 graded memo. It covers what a web application can do today to start, message, monitor and stop Claude Code or Agent SDK work on GitHub repositories, using public Anthropic and GitHub documentation only.

## 3. What I verified (commands and results)
- **Read in the brief folder:** `BRIEF.md`, `research/Q-005.md` and my agent file. The folder has no library or domain briefs, so no existing entries share these topics.
- **Not read:** `.env*`, `.npmrc`, `.yarnrc*`, `package*.json`, lock files and `.gitmodules`. The question forbids touching the environment or credentials.
- **Two Remote Control fetches spilled to a cache file outside the folder.** I did not read that file. Remote Control facts below come only from the page preview and the Authentication page.
- **Web searches:** 5. Two used Anthropic and GitHub domain filters. Secondary results (blogs, aicoder.com) were used only to find official pages, never as sources.
- **Web fetches that worked (17):** code.claude.com pages: claude-code-on-the-web, routines, github-actions, authentication, agent-sdk/overview, agent-sdk/hosting, agent-sdk/cost-tracking, agent-sdk/secure-deployment, agent-sdk/typescript, llms.txt. platform.claude.com pages: api/claude-code/routines-fire, managed-agents overview, sessions, session-operations, events-and-streaming, reference, github, webhooks, about-claude/pricing. GitHub: docs.github.com REST pages for workflow dispatch and workflow runs.
- **How each page came back:**
  - Most Anthropic pages came back as full page text.
  - Four came back paraphrased by the fetch tool's own model, so facts from them are graded B: events-and-streaming, agent-sdk/typescript, and both GitHub REST pages.
  - The pricing figure for Managed Agents was confirmed on the full pricing page.

## 4. What is undone
- I did not read the GitHub Actions billing pages or GitHub's fine-grained token permission tables.
- I did not read Anthropic's Commercial or Consumer Terms. The policy question in §6 depends on them.
- I did not read the Remote Control page in full.
- I did not read the claude.ai plan usage limits for Pro, Max or Team. Docs say they are shared but give no numbers in the pages I read.

## 5. Needed outside my lane
- Source checker: check every fact below. B-graded and time-sensitive items first (F-07, F-14, F-17, F-20).
- The F-06/F-08 policy question in §6 may need the owner, or legal reading of Anthropic's terms. If so, the Chief of Staff should put a decision card to the owner. I am not closing it.

## 6. Open questions
- **Q-005a.** Does the Agent SDK note restrict a single owner's private desk? The note says third-party developers may not "offer claude.ai login or rate limits" without approval. Not documented. It decides whether the desk may use the owner's subscription (an OAuth token, or the CLI's `--cloud` follow-ups) or must use a Console API key.
- **Q-005b.** Is there any read or list API for claude.ai cloud-session transcripts or status? Not documented in the pages read. The `/fire` token explicitly has "no read access".
- **Q-005c.** When will routines and the `/fire` endpoint leave research preview, and will the hourly caps change? Not documented.
- **Q-005d.** Can a cloud session or routine run be stopped programmatically, rather than archived or paused in the UI? Not documented.

---

# MEMO — Q-005: Driving Claude Code / Agent SDK work on GitHub from a web application
Date 2026-10-01 · Depth 3 · Topics: claude-code, agents, automation, cost

**Grades.** A = official Anthropic or GitHub doc, full text read this session. B = official doc, but read through the fetch tool's paraphrase, or a detail needing recheck. C = inference across sources. Each item is marked **fact**, **estimate** or **opinion**.

**Volatility.** Routines are research preview, `/fire` is experimental, and Managed Agents is beta. Suggested shelf life for those entries: 3 months.

## Summary of routes
| Route | Start | Send message | Monitor / read output | Stop | Credential | Billing |
|---|---|---|---|---|---|---|
| R1 Cloud sessions (claude.ai/code) | UI, `claude --cloud` | UI; `claude -p "…" --cloud <id>` | UI only (no read API found) | UI archive/delete; inactivity expiry | claude.ai login | Subscription |
| R2 Routines + `/fire` API | HTTP POST per routine; schedule; GitHub PR/release events | Not by API (UI or CLI follow-up) | Returns session URL; read in UI | Pause/delete routine in UI | Per-routine bearer token | Subscription (+ usage credits) |
| R3 Claude Code GitHub Action | `@claude` comment; any GitHub event; via GitHub, `workflow_dispatch` | New comment or dispatch | Issue/PR comments, run logs via GitHub API | GitHub cancel/force-cancel run | API key, OAuth token, or OIDC federation, kept as GitHub Secrets | API tokens or subscription, plus Actions minutes |
| R4 Agent SDK (self-hosted) | Your server calls `query()` | `streamInput()` / `ClaudeSDKClient` | Streamed messages, transcripts, OTEL | `interrupt()`, `close()`, abort | Console API key (or Bedrock/Vertex/Foundry) | API tokens plus your hosting |
| R5 Managed Agents (REST) | `POST /v1/sessions` | `POST …/events` | SSE stream, event history, webhooks | `user.interrupt`, archive, delete, budget | Console API key; GitHub token per session | API tokens + $0.08/session-hour running |

## R1 — Cloud sessions (Claude Code on the web)
- **F-01 (fact, A).** Cloud sessions are available on Pro, Max and Team plans, and for Enterprise premium or Chat + Claude Code seats. They run on Anthropic-managed VMs (or a self-hosted environment) and keep running after the laptop closes.
  - Start from: claude.ai/code, the mobile app, the Desktop app, `claude --cloud`, or routines.
  - Source: code.claude.com/docs/en/claude-code-on-the-web
- **F-02 (fact, A).** GitHub access is granted in one of two ways:
  - the Claude GitHub App, or
  - `/web-setup`, which sends the local `gh` token to the Claude account.
  - In Anthropic-hosted environments, "your GitHub credentials stay encrypted on Anthropic's servers and never enter a session's VM", and a GitHub proxy attaches them server-side.
  - Source: same page
- **F-03 (fact, A).** Follow-up messages can be sent from a script: `claude -p "message" --cloud <session-id>`. It "queues the message… and exits without waiting for a reply". `--output-format json` returns `{ok, session_id, url}`.
  - It needs a claude.ai account login (`claude auth login`) and the organization policy `allow_remote_sessions`.
  - It does not work with Bedrock, Vertex or other third-party providers.
  - Docs name sending follow-ups "from a CI script" as a use.
  - Source: same page
- **F-04 (fact, A).** Monitoring and output:
  - Sessions show in the claude.ai/code sidebar with a diff view.
  - A PR can be created from the UI.
  - `--teleport` pulls a session and its branch into a terminal, and needs claude.ai subscription auth.
  - Sharing views "don't update in real time".
  - **Not documented:** any API to list sessions or read transcripts.
  - Source: same page
- **F-05 (fact, A).** Stopping and limits:
  - Sessions can be archived (archived sessions reject new messages) or deleted permanently.
  - They "stop after a period of inactivity", with the VM reclaimed. The exact period is not documented.
  - "Cloud sessions share rate limits with all other Claude and Claude Code usage within your account… There is no separate compute charge for the cloud VM."
  - Organizations with Zero Data Retention can't use cloud sessions.
  - Organization IP allowlisting breaks Anthropic-hosted sessions.
  - Source: same page
- **F-06 (fact, A).** "Cloud sessions always use your subscription credentials." Setting `ANTHROPIC_API_KEY` in the cloud environment doesn't override this.
  - `claude setup-token` makes a one-year OAuth token that "can only make model requests, so it can't establish Remote Control sessions."
  - Source: code.claude.com/docs/en/authentication
- **F-07 (fact, B).** Remote Control is a separate feature. It lets claude.ai/code or the Claude app steer a session running locally on your own machine.
  - **Not documented:** any third-party or API access to it. Page only partly read.
  - Source: code.claude.com/docs/en/remote-control

## R2 — Routines and the `/fire` endpoint (the only documented HTTP way to start a cloud session)
- **F-08 (fact, A).** What a routine is:
  - A saved prompt plus repositories, environment and connectors.
  - Triggers: schedule (minimum 1 hour), API, or GitHub events (pull request and release only).
  - Research preview. Available on Pro, Max, Team and Enterprise.
  - Routines belong to the individual account. Commits and PRs "carry your GitHub user".
  - They run fully autonomously ("no permission-mode picker").
  - Claude pushes to `claude/`-prefixed branches. Pushes to protected branches, or to branches with others' commits, are rejected.
  - Source: code.claude.com/docs/en/routines
- **F-09 (fact, A).** The endpoint:
  - `POST https://api.anthropic.com/v1/claude_code/routines/{trig_…}/fire`, with `Authorization: Bearer <per-routine token>` and `anthropic-version: 2023-06-01`.
  - Optional `text` field, up to 65,536 characters.
  - Returns `claude_code_session_id` and `claude_code_session_url`.
  - "It does not stream session output or wait for the session to complete."
  - No idempotency key, so a retry creates another session.
  - "Experimental… may change."
  - Source: platform.claude.com/docs/en/api/claude-code/routines-fire
- **F-10 (fact, A).** The token:
  - Made in the claude.ai web UI and "shown once". Docs say "store it somewhere secure such as your alerting tool's secret store". The GitHub Actions example stores it in `secrets.*`.
  - Scope: "One routine only; no read access."
  - "There is no public API for token management." Regenerating revokes the old one.
  - Billing: "Claude Code subscription usage on claude.ai". It is not part of the Claude Platform API and has no SDK support.
  - Sources: same page; routines page
- **F-11 (fact, A).** `text` from the request arrives wrapped in a `<routine-fire-payload>` block that is "labeled as untrusted data". The routine's saved prompt must opt in to acting on it. Relevant to keeping requests separate from the activity around them.
  - Source: routines page
- **F-12 (fact, A).** Limits, with no overage on any of them:
  - 30 fires per hour per routine (shared with Run now).
  - 100 API fires per hour per account.
  - 100 scheduled runs per hour per account.
  - GitHub events have hourly caps per routine and per account. Excess events are dropped.
  - Runs draw down subscription usage. Past the limit, runs continue on usage credits only if credits are enabled.
  - Source: routines page
- **F-13 (fact, A).** Monitoring and stopping:
  - Each run is a normal session in the UI.
  - "A green status… does not mean the task in your prompt succeeded."
  - The routine can be paused or deleted in the UI or with `/schedule` in the CLI.
  - `/schedule` needs a claude.ai subscription login, not an API key.
  - **Not documented:** an API to stop a running fired session.
  - Source: routines page

## R3 — Claude Code GitHub Action (`anthropics/claude-code-action@v1`)
- **F-14 (fact, A).** Two modes:
  - Interactive: `@claude` in an issue or PR comment, review, or new issue. Replies appear as a comment that updates as it works.
  - Automation: a `prompt` input on any GitHub event, including `schedule`. Results go to the run log unless the prompt directs posting.
  - The triggering user needs write access. Bots are rejected unless listed in `allowed_bots`.
  - Built on the Agent SDK.
  - Source: code.claude.com/docs/en/github-actions
- **F-15 (fact, A).** Credentials:
  - `ANTHROPIC_API_KEY` (Console), or `CLAUDE_CODE_OAUTH_TOKEN` (subscription, from `claude setup-token`), or OIDC workload identity federation with no stored secret.
  - Bedrock, Vertex and Foundry work via OIDC.
  - "Never commit API keys or OAuth tokens… Always store them as GitHub Secrets." For shared secrets, use an API key rather than an OAuth token, because the token "is tied to the subscription of the person who ran `claude setup-token`".
  - Deleting a secret doesn't revoke the key.
  - The Claude GitHub App asks for a broad, fixed permission set, including Actions, Workflows and Contents write. A custom app can be limited to Contents, Issues and Pull requests.
  - Source: same page
- **F-16 (fact, A).** Cost is GitHub Actions minutes plus API tokens, or subscription usage if an OAuth token is used. Controls: `--max-turns`, workflow timeouts, GitHub concurrency.
  - Source: same page
- **F-17 (fact, B).** How a web app drives this route through GitHub's REST API:
  - Start: `POST /repos/{o}/{r}/actions/workflows/{id}/dispatches`, with at most 25 inputs. The page states it returns `workflow_run_id`, `run_url` and `html_url`. This is recent; recheck.
  - List or get runs: `GET …/actions/runs[/{id}]`.
  - Stop: `POST …/runs/{id}/cancel` or `/force-cancel`.
  - Logs: `GET …/runs/{id}/logs`, which redirects to an archive whose link expires in 1 minute.
  - Classic tokens need `repo` scope. Fine-grained permission names not confirmed.
  - Source: docs.github.com/en/rest/actions/workflows; …/workflow-runs
- **E-01 (estimate, C).** Mid-run messages: sending a new message into a running Action job is not documented. Each new `@claude` comment or dispatch starts a new run.

## R4 — Claude Agent SDK, self-hosted behind your web app
- **F-18 (fact, A).** What it is and how it authenticates:
  - A Python or TypeScript library that spawns the `claude` CLI as a subprocess.
  - Auth is a Console API key (`ANTHROPIC_API_KEY`) or Bedrock, Vertex or Foundry.
  - "Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK."
  - Branding: may not be called "Claude Code".
  - Governed by the Commercial Terms.
  - Source: code.claude.com/docs/en/agent-sdk/overview
- **F-19 (fact, A).** Hosting:
  - One session is one subprocess, with transcripts on local disk (lost on restart unless a `SessionStore` is configured).
  - Suggested start: 1 GiB RAM, 5 GiB disk, 1 CPU per agent.
  - "No top-level session timeout": use `maxTurns`.
  - Credentials: supply the key "from your secret manager", or keep it outside the container through a proxy (`ANTHROPIC_BASE_URL`). Keep tool credentials such as GitHub tokens out of the agent environment via a proxy or custom tool.
  - Multi-tenant isolation: per-tenant `cwd`, `CLAUDE_CONFIG_DIR`, `settingSources: []`.
  - Sources: …/agent-sdk/hosting; …/agent-sdk/secure-deployment
- **F-20 (fact, B).** Control:
  - `streamInput()` adds turns.
  - `interrupt()` stops the current turn.
  - `close()` ends the process. `abortController` is available.
  - `maxBudgetUsd` and `maxTurns` set limits.
  - Source: …/agent-sdk/typescript
- **F-21 (fact, A).** Cost:
  - "Anthropic token cost typically dominates container infrastructure cost by an order of magnitude or more" (about $0.05/hour for a minimal container).
  - `total_cost_usd` is a "client-side estimate… Do not bill end users… from these fields." Use the Usage and Cost API instead.
  - Sources: …/hosting; …/cost-tracking
- **E-02 (estimate, C).** GitHub access is not built in. The agent uses git or `gh` inside its working directory with a credential you provide, ideally through a proxy (F-19).

## R5 — Claude Managed Agents (Anthropic-hosted, REST API)
- **F-22 (fact, A).** Status and model:
  - Beta, with header `managed-agents-2026-04-01`. Needs a Console API key and is enabled by default for API accounts.
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
  - SSE stream at `GET …/events/stream`. Full persisted history at `GET …/events`, filterable by type.
  - `user.interrupt` stops the agent: "A model response in progress stops immediately".
  - Source: …/events-and-streaming
- **F-25 (fact, A).** Webhooks:
  - Configured in the Console; HTTPS on port 443; signed with a `whsec_` secret.
  - Events include `session.status_idled` and `session.status_terminated`.
  - Up to 3 delivery attempts, then the event is dropped. "Webhooks aren't a durable log." Ordering not guaranteed.
  - Source: …/managed-agents/webhooks
- **F-26 (fact, A).** GitHub:
  - A `github_repository` resource with `authorization_token`, which is "not echoed in API responses".
  - The token can be rotated mid-session. Repositories are fixed for the session's life.
  - PRs go through the GitHub MCP server.
  - Docs advise "fine-grained personal access tokens with minimum required permissions".
  - **Not stated:** whether the token enters the sandbox.
  - Source: …/managed-agents/github
- **F-27 (fact, A).** Cost and limits:
  - Tokens at model rates, plus session runtime at "$0.08 per session-hour", metered only while `running`.
  - Rate limits per organization: 300 create requests per minute and 1,200 read requests per minute, plus tier limits.
  - Sources: platform.claude.com/docs/en/about-claude/pricing; …/managed-agents/reference

## Keeping each owner request separate from the activity around it
- **F-28 (fact, A).** Each `--cloud`, each `/fire` call, and each GitHub event starts its own session ("doesn't reuse sessions across events").
  - Managed Agents events are typed: `user.*` vs `agent.*`, `session.*` and `span.*`.
  - Routine fire text is wrapped and marked as untrusted.
  - Sources: routines; managed-agents/reference
- **O-01 (opinion, C).** Of the documented routes, R5 (and R4) give a web app its own record of each request and full read-back of the activity. R1 and R2 can start or nudge work, but read-back is by UI link only, as far as the docs show.

## Proposed library entries (for the Source checker)
**Facts:**
- LIB-F-a = F-09 + F-10 + F-12 (`/fire` endpoint): topics automation, claude-code; grade A; shelf life 3 months.
- LIB-F-b = F-03 (CLI follow-ups to cloud sessions): topics claude-code, automation; A; 6 months.
- LIB-F-c = F-05 + F-06 (cloud-session billing and credential): topics claude-code, cost; A; 6 months.
- LIB-F-d = F-15 + F-16 (Action credentials and cost): topics claude-code, automation, cost; A; 6 months.
- LIB-F-e = F-18 (Agent SDK auth policy): topics agents, claude-code; A; 6 months.
- LIB-F-f = F-22 + F-23 + F-27 (Managed Agents lifecycle and price): topics agents, cost, automation; A; 3 months.
- LIB-F-g = F-21 (SDK cost figures are estimates): topics agents, cost; A; 12 months.

**Pattern:**
- LIB-P-a, "Credential outside the agent boundary": proxy-injected keys (F-19), GitHub proxy (F-02), webhook-then-fetch (F-25). Topics: agents, automation. Grade A. Shelf life 12 months.

## Sources
- [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Automate work with routines](https://code.claude.com/docs/en/routines)
- [Trigger a routine through the API](https://platform.claude.com/docs/en/api/claude-code/routines-fire)
- [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Authentication](https://code.claude.com/docs/en/authentication)
- [Remote Control](https://code.claude.com/docs/en/remote-control)
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
