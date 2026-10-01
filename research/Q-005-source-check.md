Verdict: PASS

I opened every cited source this round, and each says what the memo claims, apart from the wording notes below. The two earlier blockers are cleared:
- `research/Q-005.md` is now in my folder. Its question text and "Depth: 3, … Topics: claude-code, agents, automation, cost" match memo lines 47–49.
- The ruling in `governance/standards/sources.md` says two Anthropic pages count as two sources for product-behaviour facts, and cost claims still need an independent source. That settles the independence question.

## Findings (memo line → source)

**Cloud sessions and Remote Control**
- **F-01 to F-06 (lines 70–100): confirmed.**
  - The claude-code-on-the-web page matches on plans, the `--cloud` follow-up and its JSON shape, `allow_remote_sessions`, the third-party-provider exclusion and the archive error.
  - It also matches on the inactivity stop, the shared rate limits with "no separate compute charge", and the Zero Data Retention (ZDR) and IP-allowlist exclusions.
  - The authentication page matches on "Cloud sessions always use your subscription credentials" and the `setup-token` limit.
- **F-07 (lines 101–109): confirmed, grade A.**
  - I read the full Remote Control page. It says Pro, Max, Team and Enterprise, "API keys are not supported", and an Owner toggle (page line 24).
  - It excludes Bedrock, Agent Platform, Foundry and a non-`api.anthropic.com` `ANTHROPIC_BASE_URL` (lines 27–28 and 397).
  - It says `setup-token` tokens cannot establish sessions (line 370).
  - I found no API or third-party access on the page. That is an absence finding for Q-005e, not a filed fact.

**Routines**
- **F-08 to F-13 (lines 112–160): confirmed** against the routines page and the fire page.
  - Fire page: the required headers and the optional `anthropic-beta` header; the 65,536-character limit; the 400, 429 (with `Retry-After`) and 503 rows; no idempotency key; the "no read access" token.
  - Routines page: the limits table, with 30 per routine and 100 per account for fires and "None of these hourly limits has overage".
  - Also the Pause/Delete controls, the `/schedule` subcommands and version numbers, the 72-hour skip, and the Owner toggle.

**GitHub Action**
- **F-14 to F-16 (lines 163–177): confirmed.**
  - The github-actions page matches on the trigger checks, secrets, OIDC, the "tied to the subscription" sentence and the cost section.
  - `anthropics/claude-code-action/docs/security.md` independently matches on write access, `allowed_bots` and the schedule exception.
- **F-17 (lines 178–184): confirmed, grade B stands.** GitHub REST pages show the dispatch endpoint with at most 25 inputs, `workflow_run_id`/`run_url`/`html_url`, the cancel and force-cancel endpoints, and logs with a 1-minute redirect. Only the classic `repo` scope is named, so fine-grained permission names stay unconfirmed, as the memo says.

**Agent SDK**
- **F-18 to F-21 (lines 188–209): confirmed.**
  - The overview and quickstart both carry the third-party login sentence.
  - The hosting page matches on 1 GiB / 5 GiB / 1 CPU, "No top-level session timeout", `settingSources: []`, `CLAUDE_CONFIG_DIR` and the ~$0.05/hour figure.
  - The cost-tracking page matches on "Do not bill end users".
  - The TypeScript reference page matches on `streamInput`, `interrupt`, `close`, `abortController`, `maxBudgetUsd` and `maxTurns`, so F-20 can be A.

**Managed Agents**
- **F-22 to F-27 (lines 213–242): confirmed** against the overview, session-operations, events-and-streaming, webhooks, github, reference, budgets and pricing pages.
  - Confirmed values: the beta header; the ZDR/HIPAA statement; the four statuses; budget in whole US cents as a string; the 300 and 1,200 per-minute limits; $0.08 per session-hour while `running`; webhook rules (HTTPS on 443, `whsec_`, 3 attempts, "aren't a durable log", no ordering).
  - The github page says the `authorization_token` is "not echoed in API responses" and doesn't say whether it enters the sandbox.
- **F-28, E-01, E-02 and O-01** are inference or opinion, correctly labelled, and carry no new source claim.

**Wording fixes the Researcher should make (none changes a verdict)**
- **F-18 (line 190):** the auth list omits Claude Platform on AWS, which the quickstart also lists.
- **F-19 (line 198):** "Keep GitHub tokens out of the agent environment" is an inference. The hosting page says "tool credentials". The secure-deployment page uses git credentials as its example. This also sits oddly beside F-26, where the Managed Agents docs have you pass a GitHub token into the session.
- **F-20 (line 202):** the TypeScript reference says `interrupt()` is "only available in streaming input mode". The memo omits that.

## Library (in `library/facts/`)

Not committed: this folder is not a git repository.

- **Filed:**
  - LIB-F-b: the `--cloud` follow-up, two pages.
  - LIB-F-d: credential types for the Action, narrowed to the points two pages state.
  - LIB-F-e: no third-party claude.ai login, three pages.
  - LIB-F-h: the GitHub Action trigger checks in full, and the two-page routine points.
  - Each entry lists what is not filed.
- **Already filed before this round, untouched:** LIB-F-a, -a2, -c, -f, -g, -i and LIB-P-a.
- **Held:** F-16, the Action's cost claims. The standard needs an independent source for cost, and I did not open GitHub's billing page.

## Open questions

1. **Cost facts already filed.** LIB-F-c ("no separate compute charge") and LIB-F-f (the $0.08/session-hour price) state cost claims on same-publisher pages only. LIB-F-g likewise rests on the cost-tracking page. The ruling postdates them. I did not edit them; should an independent source be sought, or the entries marked?
2. **Q-005a.** Whether a single owner's desk may use subscription credentials is still unanswered. Nobody has read the Terms.
3. **Not opened:** GitHub Actions billing, GitHub fine-grained permission names, claude.ai plan usage limits and the Terms. The memo does not rely on any of them.
4. **Memo line 1** is a process note, not memo content. It should come out when the Orchestrator saves the file.
