I couldn't change anything on disk because I have no write tool. The Orchestrator should save the revised memo below in place of `research/Q-005-memo.md`.

# Q-005 — researcher return, revision 2 (2026-10-01)

## 1. What I changed
- **F-09 (failed the source check): fixed.** The `anthropic-beta: experimental-cc-routine-2026-04-01` header is now described as **optional**. Only `Authorization: Bearer <token>` and `anthropic-version: 2023-06-01` are required, plus `Content-Type: application/json` when there is a body. While re-reading the fire page I also added three details:
  - Over the limit, the call returns `429 rate_limit_error` with a `Retry-After` header.
  - Firing a paused routine returns `400`.
  - `2023-06-01` is "the only accepted value" for `anthropic-version`.
- **Revision 1's claim that `research/Q-005.md` exists: replaced with what I actually saw.** In my folder, `research/Q-005.md` is there, and I read it again this round (the question, the decision it serves, depth 3, topics). The source checker reports it is not in theirs. I can't settle that from my side; it is passed on in §5. My memo no longer depends on it: the question text is restated in the memo header.
- **F-07 / Q-005e: brought up to date with the source check, without marking it myself.** The source checker read the full Remote Control page. They confirmed the requirements and found no API or third-party access documented. I record that as their finding. My own grade stays B because I still have not read the full page (see §3). Whether to raise it to A is the source checker's call.
- **Library section:** I removed the "LIB-F-a needs an update" request, because the source checker has filed LIB-F-a2 to cover it. I checked that LIB-F-a2 agrees with the new F-09.

## 2. Why
`research/Q-005-source-check.md` failed F-09 because the memo called the beta header "required", which contradicts its own cited page. The checker also flagged the `research/Q-005.md` claim as one they could not check. F-07, F-12, F-13 and F-14 were confirmed and are unchanged apart from the F-07 wording above.

## 3. What I verified (commands and results)
- **Read in the folder:** `research/Q-005.md`, `research/Q-005-memo.md`, `research/Q-005-source-check.md` and `library/facts/LIB-F-a2-routine-fire-limits-and-beta-header.md`.
  - LIB-F-a2 matches the corrected F-09.
  - I did not open `.env*`, `.npmrc`, `.yarnrc*`, `package*.json`, the lock files or `.gitmodules`.
- **WebFetch of platform.claude.com/docs/en/api/claude-code/routines-fire:** the full page text came back.
  - Its Headers table marks only `Authorization` and `anthropic-version` as required, and `Content-Type` "when body is present".
  - It says: "Older integrations that send an `anthropic-beta: experimental-cc-routine-2026-04-01` header are unaffected: the endpoint accepts requests with and without it."
  - The 400 and 429 error rows and the `Retry-After` text are confirmed.
- **WebFetch of code.claude.com/docs/en/remote-control:** the output was too large again and was saved to a file outside the folder. I did not read that file; only the opening (about 2 KB) was visible. F-07 stays B on my side.

## 4. What is undone
- I have not read the full Remote Control page myself; three attempts have failed.
- Still not read: GitHub Actions billing pages, GitHub's fine-grained token permission names, Anthropic's Commercial and Consumer Terms (needed for Q-005a), and the claude.ai Pro, Max and Team usage limits.
- I have not looked for second pages for LIB-F-b, -d, -e or -h.

## 5. Needed outside my lane
- **Source checker:** please recheck F-09. Please also decide whether F-07 and Q-005e move to grade A on the strength of your full-page read.
- **Orchestrator:** `research/Q-005.md` is in the researcher's folder but, by the checker's report, not in theirs. Please check `governance/PACKS.toml` for the source-checker pack.
- **Chief of Staff or owner:** do two separate Anthropic pages count as independent sources? That decides LIB-F-b, -d, -e and -h. Q-005a needs the Terms read, and may need a decision card.

## 6. Open questions
- **Q-005a.** May a single owner's private desk use the owner's subscription (an OAuth token, or `--cloud` follow-ups) without breaking the Agent SDK note or the Terms? Not documented; it needs the Terms.
- **Q-005b.** Is there an API to read or list claude.ai cloud-session transcripts or status? None found. The `/fire` token has "no read access". Not finding it in the index is not proof that none exists.
- **Q-005c.** When will routines and `/fire` leave research preview or experimental status, and will the limits change? Not documented.
- **Q-005d.** Can a running cloud session or routine run be stopped through an API? Not documented.
- **Q-005e.** Does the Remote Control page document any API or third-party access? The source checker found none on the full page. I have not confirmed this myself.

---

# MEMO — Q-005: Driving Claude Code / Agent SDK work on GitHub from a web application
Date 2026-10-01 (revision 2) · Depth 3 · Topics: claude-code, agents, automation, cost

**The question (from research/Q-005.md).** From published documentation only: what can a web application do today to start, send messages to, monitor or stop Claude Code sessions or Claude Agent SDK agents that work on GitHub repositories? For each route, cover its abilities and limits, the credential it needs and where that must be kept, cost, rate or usage limits, and how output is read back. Where the documentation does not say, write "not documented".

**Grades.**
- **A:** official Anthropic or GitHub doc, full text read.
- **B:** official doc read through the fetch or search tool's summary, or a detail that needs a recheck.
- **C:** inference across sources.

Each item is marked **fact**, **estimate** or **opinion**.

**Volatility.** Routines are a research preview, `/fire` is experimental and Managed Agents is a beta. Suggested shelf life for those entries: 3 months.

## Summary of routes
| Route | Start | Send message | Monitor / read output | Stop | Credential | Billing |
|---|---|---|---|---|---|---|
| R1 Cloud sessions (claude.ai/code) | UI, `claude --cloud` | UI; `claude -p "…" --cloud <id>` | UI only (no read API found) | UI archive/delete; stops when inactive | claude.ai login | Subscription |
| R2 Routines + `/fire` API | HTTP POST per routine; schedule; GitHub PR/release events; Run now | Not by API (UI or CLI follow-up) | Returns session URL; read in UI | Pause/delete routine in web UI; archive/delete a run's session in UI | Per-routine bearer token | Subscription (+ usage credits) |
| R3 Claude Code GitHub Action | `@claude` comment; any GitHub event; `workflow_dispatch` via GitHub | New comment or dispatch | Issue/PR comments; run logs via GitHub API | GitHub cancel/force-cancel run | API key, OAuth token or OIDC federation; kept as GitHub Secrets | API tokens or subscription, plus Actions minutes |
| R4 Agent SDK (self-hosted) | Your server calls `query()` | `streamInput()` / `ClaudeSDKClient` | Streamed messages, transcripts, OTEL | `interrupt()`, `close()`, abort | Console API key (or Bedrock/Vertex/Foundry) | API tokens plus your hosting |
| R5 Managed Agents (REST) | `POST /v1/sessions` | `POST …/events` | SSE stream, event history, webhooks | `user.interrupt`, archive, delete, budget | Console API key; GitHub token per session | API tokens + $0.08/session-hour running |

## R1 — Cloud sessions (Claude Code on the web)
- **F-01 (fact, A).** Who can use cloud sessions and how they start:
  - Available on Pro, Max and Team plans, and for Enterprise premium or Chat + Claude Code seats.
  - They run on Anthropic-managed VMs (or a self-hosted environment) and keep running after the laptop closes.
  - Start from claude.ai/code, the mobile app, the Desktop app, `claude --cloud`, or routines.
  - Source: code.claude.com/docs/en/claude-code-on-the-web
- **F-02 (fact, A).** GitHub access:
  - Granted through the Claude GitHub App, or through `/web-setup`, which syncs the local `gh` token.
  - In Anthropic-hosted environments, "your GitHub credentials stay encrypted on Anthropic's servers and never enter a session's VM". A GitHub proxy attaches them server-side.
  - Source: same page
- **F-03 (fact, A).** Sending follow-up messages from a script:
  - `claude -p "message" --cloud <session-id>` "queues the message… and exits without waiting for a reply".
  - `--output-format json` returns `{ok, session_id, url}`.
  - It needs a claude.ai login and the org policy `allow_remote_sessions`. It does not work with Bedrock, Vertex or other third-party providers.
  - The page names sending follow-ups "from a CI script" as a use.
  - Source: same page
- **F-04 (fact, A).** Monitoring and output:
  - Sessions appear in the sidebar with a diff view, and a PR can be created from the UI.
  - `--teleport` pulls a session and its branch into a terminal, and needs subscription auth.
  - Sharing views "don't update in real time".
  - **Not documented:** any API to list sessions or read transcripts.
  - Source: same page
- **F-05 (fact, A).** Stopping, cost and exclusions:
  - Sessions can be archived (they then reject new messages) or deleted.
  - They "stop after a period of inactivity". The period is not documented.
  - "Cloud sessions share rate limits with all other Claude and Claude Code usage within your account… There is no separate compute charge for the cloud VM."
  - Zero Data Retention organizations are excluded, and org IP allowlisting breaks Anthropic-hosted sessions.
  - Source: same page
- **F-06 (fact, A).** Credentials:
  - "Cloud sessions always use your subscription credentials". `ANTHROPIC_API_KEY` doesn't override this.
  - `claude setup-token` makes a one-year OAuth token that "can only make model requests, so it can't establish Remote Control sessions."
  - Source: code.claude.com/docs/en/authentication
- **F-07 (fact; A for the first two points, B for the rest on my read).** Remote Control:
  - **What it is (A).** Remote Control "connects claude.ai/code or the Claude app for iOS and Android to a Claude Code session running on your machine". "Claude keeps running locally the entire time", and messages can be sent "from your terminal, browser, and phone interchangeably". Source: code.claude.com/docs/en/remote-control, opening section.
  - **Token limit (A).** `setup-token` tokens "can't establish Remote Control sessions" (authentication page).
  - **Requirements (B on my read).**
    - Pro, Max, Team and Enterprise plans. "API keys are not supported"; you sign in through claude.ai.
    - Not available with Bedrock, Agent Platform, Foundry, or an `ANTHROPIC_BASE_URL` other than api.anthropic.com.
    - On Team and Enterprise, an Owner must turn it on.
    - The source checker reports these as confirmed against the full page (source check, round 2).
  - **API or third-party access:** the source checker found none documented on the full page. I have not confirmed this myself (Q-005e).

## R2 — Routines and the `/fire` endpoint (the only documented HTTP way to start a cloud session)
- **F-08 (fact, A).** What a routine is:
  - A saved prompt plus repositories, environment and connectors.
  - Triggers: schedule (minimum 1 hour, or a one-off time), API, or GitHub pull request and release events.
  - Research preview, on Pro, Max, Team and Enterprise.
  - Routines belong to the individual account, and commits and PRs "carry your GitHub user".
  - Runs are fully autonomous.
  - Claude pushes to `claude/` branches. Pushes elsewhere are rejected if the branch is protected, has someone else's open PR, or carries others' commits.
  - Source: code.claude.com/docs/en/routines
- **F-09 (fact, A). Revised in round 2.** The endpoint:
  - `POST https://api.anthropic.com/v1/claude_code/routines/{trig_…}/fire`
  - **Required headers:** `Authorization: Bearer <per-routine token>` and `anthropic-version: 2023-06-01` ("the only accepted value"), plus `Content-Type: application/json` "when body is present".
  - **Optional header:** `anthropic-beta: experimental-cc-routine-2026-04-01`. The endpoint "accepts requests with and without it". The routines page example still sends it, and says "breaking changes ship behind new dated beta header versions, and the two most recent previous header versions continue to work."
  - Body: optional `text` field, up to 65,536 characters, passed as a literal string. Unknown fields are ignored.
  - Returns `200` with `claude_code_session_id` and `claude_code_session_url`. "It does not stream session output or wait for the session to complete."
  - No idempotency key, so a retry creates another session.
  - Errors:
    - `400` for a missing or unsupported `anthropic-version`, an oversized `text`, or a paused routine.
    - `429 rate_limit_error` with `Retry-After` when an hourly limit is reached.
    - `503` when overloaded.
  - Sources: platform.claude.com/docs/en/api/claude-code/routines-fire; routines page
- **F-10 (fact, A).** The token:
  - Made in the claude.ai web UI and "shown once". Store it "somewhere secure such as your alerting tool's secret store".
  - Scope: "One routine only; no read access."
  - "There is no public API for token management." Generating a new token revokes the previous one, and "the CLI cannot currently create or revoke tokens."
  - The endpoint is for claude.ai users only, and usage is billed as Claude Code subscription usage.
  - Sources: same pages
- **F-11 (fact, A).** How fire text is treated:
  - `text` arrives wrapped in a `<routine-fire-payload>` block "that labels it as untrusted data", and the saved prompt must opt in to acting on it. Run now text gets the same treatment.
  - The saved prompt is the assigned task, "not live user input", and "can't act as approval or consent".
  - Source: routines page
- **F-12 (fact, A). Confirmed in round 2.** Hourly limits, none with overage:
  - Scheduled runs: 100 per hour per account. Over the limit, "the run waits".
  - Run now, API fires and one-off re-arms share a count of 30 per hour per routine. Over the limit, the action fails.
  - Run now: 100 per hour per account.
  - API fires: 100 per hour per account, counted separately. Over the limit, the call returns `429` with `Retry-After`.
  - GitHub events are capped per routine and per account, and excess events "are dropped".
  - Past the subscription usage limit, organizations with usage credits "can keep running routines on metered overage"; otherwise runs are rejected until the window resets.
  - Sources: routines page; fire page
- **F-13 (fact, A). Confirmed in round 2.** Monitoring and stopping:
  - Each run is a normal session. "A green status… does not mean the task in your prompt succeeded."
  - A run's session can be renamed, archived or deleted from its menu.
  - The routine's detail page in the web UI has a pause/resume switch and a Delete menu item.
  - CLI: `/schedule` (alias `/routines`), `list`, `update`, `run`, adding a GitHub trigger (v2.1.225 or later) and run history (v2.1.227 or later). It needs a subscription login and is unavailable inside a cloud session.
  - **Not documented:** pausing or deleting from the CLI, or any API to stop a running run.
  - Other stops:
    - A Team or Enterprise Owner's switch makes "existing routines stop running".
    - If the GitHub connection is missing, runs are skipped for up to 72 hours, then the routine turns off.
    - A paused subscription means no runs.
  - Source: routines page

## R3 — Claude Code GitHub Action (`anthropics/claude-code-action@v1`)
- **F-14 (fact, A). Confirmed in round 2.** Modes and who can trigger:
  - **Interactive mode:** `@claude` in comments, reviews, or a new issue's title or body. Results appear in a comment that updates as it works.
  - **Automation mode:** a `prompt` input on any event, including `schedule`. Output goes to the run log unless the prompt directs posting.
  - **Write-access check:** "on issue and pull request events, the triggering user must have write access". Exceptions: users in `allowed_non_write_users` (with your own `github_token`), and "events that no user authors, such as a `schedule` trigger, skip this check."
  - **Bot check:** on every event, bot actors are rejected unless listed in `allowed_bots`.
  - The Action is built on the Agent SDK.
  - Source: code.claude.com/docs/en/github-actions
- **F-15 (fact, A).** Credentials:
  - `ANTHROPIC_API_KEY`, `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`), or OIDC workload identity federation. Bedrock, Agent Platform and Foundry work via OIDC.
  - "Never commit API keys or OAuth tokens… Always store them as GitHub Secrets."
  - Use an API key for shared secrets, because an OAuth token "is tied to the subscription of the person who ran `claude setup-token`".
  - Deleting a secret leaves the credential valid.
  - The Claude GitHub App takes broad permissions, including Actions, Workflows and Contents write. A custom app can be limited to Contents, Issues and Pull requests.
  - Source: same page
- **F-16 (fact, A).** Cost is Actions minutes plus API tokens, or subscription usage with an OAuth token. Controls: `--max-turns`, timeouts and concurrency. Source: same page.
- **F-17 (fact, B).** How a web app drives this route through GitHub's REST API:
  - Start: `POST /repos/{o}/{r}/actions/workflows/{id}/dispatches`, with at most 25 inputs. Returns `workflow_run_id`, `run_url` and `html_url`.
  - List or get runs: `GET …/actions/runs[/{id}]`.
  - Stop: `POST …/runs/{id}/cancel` or `/force-cancel`.
  - Logs: `GET …/runs/{id}/logs`, which redirects to an archive whose link expires in 1 minute.
  - Classic tokens need `repo` scope. Fine-grained permission names are not confirmed.
  - Sources: docs.github.com/en/rest/actions/workflows; …/workflow-runs
- **E-01 (estimate, C).** Sending a message into an Action job that is already running is not documented. Each new comment or dispatch starts a new run.

## R4 — Claude Agent SDK, self-hosted
- **F-18 (fact, A).** What it is:
  - A Python or TypeScript library that spawns the `claude` CLI.
  - Auth is a Console API key or Bedrock, Vertex or Foundry.
  - "Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK."
  - It may not be branded "Claude Code", and it is governed by the Commercial Terms.
  - Source: code.claude.com/docs/en/agent-sdk/overview
- **F-19 (fact, A).** Hosting:
  - One session is one subprocess. Transcripts sit on local disk and are lost on restart unless a `SessionStore` is configured.
  - Suggested size: 1 GiB RAM, 5 GiB disk and 1 CPU per agent.
  - "No top-level session timeout"; use `maxTurns`.
  - Supply the key "from your secret manager", or keep it outside the container via a proxy. Keep GitHub tokens out of the agent environment.
  - Per-tenant isolation: `cwd`, `CLAUDE_CONFIG_DIR` and `settingSources: []`.
  - Sources: …/agent-sdk/hosting; …/secure-deployment
- **F-20 (fact, B).** Control:
  - `streamInput()` adds turns, and `interrupt()` stops the current turn.
  - `close()` ends the process, and `abortController` is available.
  - `maxBudgetUsd` and `maxTurns` set limits.
  - Source: …/agent-sdk/typescript
- **F-21 (fact, A).** Cost:
  - Token cost "typically dominates container infrastructure cost by an order of magnitude or more" (about $0.05 per hour for a minimal container).
  - `total_cost_usd` is a "client-side estimate… Do not bill end users… from these fields."
  - Sources: …/hosting; …/cost-tracking
- **E-02 (estimate, C).** GitHub access is not built in. The agent uses git or `gh` with a credential you provide, ideally through a proxy.

## R5 — Claude Managed Agents (REST)
- **F-22 (fact, A).** Status and model:
  - Beta, with header `managed-agents-2026-04-01`. Needs a Console API key.
  - Concepts: agent, environment, session, events.
  - "Not currently eligible for Zero Data Retention or HIPAA BAA."
  - Source: platform.claude.com/docs/en/managed-agents/overview
- **F-23 (fact, A).** Lifecycle:
  - Start: `POST /v1/sessions` (optionally with `initial_events`).
  - Send: `POST /v1/sessions/{id}/events` with `user.message`.
  - Statuses: idle, running, rescheduling, terminated.
  - Archive or delete. A running session must be interrupted first.
  - Optional hard `budget` in US cents.
  - Sources: …/sessions; …/session-operations
- **F-24 (fact, B).** Monitoring:
  - SSE stream at `GET …/events/stream`. Full history at `GET …/events`.
  - `user.interrupt`: "A model response in progress stops immediately".
  - Source: …/events-and-streaming
- **F-25 (fact, A).** Webhooks:
  - Set up in the Console; HTTPS on port 443; signed with a `whsec_` secret.
  - Events include `session.status_idled` and `session.status_terminated`.
  - Up to 3 delivery attempts. "Webhooks aren't a durable log", and order is not guaranteed.
  - Source: …/webhooks
- **F-26 (fact, B).** GitHub:
  - A `github_repository` resource with an `authorization_token` that is "not echoed in API responses". It can be rotated mid-session, and repositories are fixed for the session's life.
  - PRs go through the GitHub MCP server. The docs advise "fine-grained personal access tokens with minimum required permissions".
  - **Not stated:** whether the token enters the sandbox.
  - Source: …/github
- **F-27 (fact, A).** Cost and limits:
  - Tokens at model rates, plus "$0.08 per session-hour", metered only while `running`.
  - Per organization: 300 create requests and 1,200 read requests per minute, plus tier limits.
  - Sources: …/about-claude/pricing; …/managed-agents/reference

## Keeping each owner request separate from the activity around it
- **F-28 (fact, A).** Each request gets its own session:
  - Each `--cloud` start, `/fire` call and GitHub event starts its own session. Routines don't "reuse sessions across events".
  - Managed Agents events are typed: `user.*` versus `agent.*`, `session.*` and `span.*`.
  - Fire text is wrapped and labelled untrusted (F-11).
  - Sources: routines; managed-agents/reference
- **O-01 (opinion, C).** R5 and R4 give a web app its own record of each request and full read-back of the activity. As far as the docs show, R1 and R2 can start or nudge work, but read-back is by UI link only.

## Library entries
- **Filed:** LIB-F-a, LIB-F-c, LIB-F-f, LIB-F-g and LIB-P-a. LIB-F-a2 (filed by the source checker) supersedes LIB-F-a on limits and the header; I checked it against the corrected F-09.
- **Held, pending the independence ruling:**
  - LIB-F-b (F-03): topics claude-code, automation; grade A; shelf life 6 months.
  - LIB-F-d (F-15 + F-16): topics claude-code, automation, cost; grade A; shelf life 6 months.
  - LIB-F-e (F-18): topics agents, claude-code; grade A; shelf life 6 months.
  - LIB-F-h (F-13 + F-14): topics claude-code, automation; grade A; shelf life 3 months.
- **Proposed, new:**
  - **LIB-F-i (F-07):** "Remote Control requires a claude.ai login; no API key, third-party provider or `setup-token` access." Topics: claude-code, automation; shelf life 6 months. Grade A only if the source checker's full-page read stands, since I have not read the page in full.

## Sources
- [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Automate work with routines](https://code.claude.com/docs/en/routines)
- [Trigger a routine through the API](https://platform.claude.com/docs/en/api/claude-code/routines-fire), full page re-read 2026-10-01
- [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Authentication](https://code.claude.com/docs/en/authentication)
- [Remote Control](https://code.claude.com/docs/en/remote-control) (I read the opening section only; the source checker read the full page)
- [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)
- [Hosting the Agent SDK](https://code.claude.com/docs/en/agent-sdk/hosting)
- [Securely deploying AI agents](https://code.claude.com/docs/en/agent-sdk/secure-deployment)
- [Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking)
- [Agent SDK reference – TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript)
- [Docs index (llms.txt)](https://code.claude.com/docs/llms.txt)
- [Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview)
- [Managed Agents – Sessions](https://platform.claude.com/docs/en/managed-agents/sessions)
- [Managed Agents – Session operations](https://platform.claude.com/docs/en/managed-agents/session-operations)
- [Managed Agents – Event stream](https://platform.claude.com/docs/en/managed-agents/events-and-streaming)
- [Managed Agents – Reference](https://platform.claude.com/docs/en/managed-agents/reference)
- [Managed Agents – GitHub](https://platform.claude.com/docs/en/managed-agents/github)
- [Managed Agents – Webhooks](https://platform.claude.com/docs/en/managed-agents/webhooks)
- [Claude Platform pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [GitHub REST – Workflows](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event)
- [GitHub REST – Workflow runs](https://docs.github.com/en/rest/actions/workflow-runs)
