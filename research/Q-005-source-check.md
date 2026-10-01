Verdict: FAIL

One claim cannot be checked: the memo's question text, cited to `research/Q-005.md`, which is not in my folder. Every cited documentation page I opened this round says what the memo claims.

## Findings

- **F-09: confirmed** (memo lines 120–131).
  - The fire page's Headers table marks only `Authorization` and `anthropic-version` as required, and `Content-Type` only "when body is present". `2023-06-01` is "the only accepted value".
  - The fire page says the endpoint "accepts requests with and without" the `anthropic-beta` header.
  - The routines page curl example still sends that header, and its warning says "the two most recent previous header versions continue to work".
  - The 400, 429 (with `Retry-After`) and 503 rows, the 65,536-character `text` limit, the no-idempotency-key statement and the response fields all match.
- **F-12: confirmed** (lines 142–149). The routines "Usage and limits" table matches, including "None of these hourly limits has overage". The fire page agrees on 30 per routine and 100 per account for API fires.
- **F-13: confirmed** (lines 150–160). Pause/resume switch, Delete menu, `/schedule list`, `update` and `run`, v2.1.225 and v2.1.227, the 72-hour GitHub skip, and the Owner toggle all match. Pause and delete from the CLI are not documented.
- **F-14: confirmed** (lines 163–169). The github-actions "Who can trigger runs" section matches, including the `schedule` exception and the bot check on every event.
- **F-07: confirmed** (lines 101–109). I read the full Remote Control page from the saved copy: lines 24, 27–28, 364, 370, 397 and 437.
  - Plans: Pro, Max, Team and Enterprise. "API keys are not supported." An Owner must turn it on for Team and Enterprise.
  - Excluded: Bedrock, Agent Platform, Foundry, and a non-`api.anthropic.com` `ANTHROPIC_BASE_URL`.
  - `setup-token` tokens cannot establish sessions.
  - I found no API or third-party access on the page. I can raise F-07 to grade A and record Q-005e as "not documented on the full page". That is an absence claim, not a fact entry.
- **F-01 to F-06, F-08, F-10, F-11, F-15, F-16: confirmed** against the claude-code-on-the-web, authentication, routines and github-actions pages. The quotes match, including "Cloud sessions always use your subscription credentials" and the `claude -p … --cloud` follow-up with `{ok, session_id, url}`.
- **F-17: confirmed (B stands).** The GitHub pages give the endpoints, the 25-input limit, the response fields, cancel and force-cancel, and the 1-minute log link. They name only the `repo` scope for classic tokens. Fine-grained permission names are not on those pages, as the memo says.
- **F-18 to F-21: confirmed.**
  - The overview page has the third-party login sentence, the branding rule and the Commercial Terms.
  - The hosting page has 1 GiB / 5 GiB / 1 CPU, no session timeout, "order of magnitude", about $0.05 per hour, and `settingSources` / `CLAUDE_CONFIG_DIR`.
  - The cost-tracking page has the client-side-estimate warning.
  - The TypeScript reference page documents `streamInput`, `interrupt`, `close`, `abortController`, `maxBudgetUsd` and `maxTurns`, so F-20 can be A.
  - The secure-deployment page has the proxy pattern.
- **F-22 to F-27: confirmed** against the Managed Agents overview, sessions, session-operations, events-and-streaming, reference, github and webhooks pages, plus the pricing page.
  - Confirmed values: the beta header, the statuses, budget in US cents, the 300 and 1,200 per minute limits, `$0.08 per session-hour` while `running`, and the webhook rules (3 attempts, not a durable log, no ordering).
  - The `authorization_token` is "not echoed", and the docs don't say whether it enters the sandbox.
- **F-19 wording, minor.** The memo says "Keep GitHub tokens out of the agent environment". The hosting page says "keep tool credentials out of the agent environment". The GitHub token is an inference from that. Please reword it.
- **E-01, E-02, O-01** are marked estimate or opinion and carry no source claim.

## Cannot verify
- `research/Q-005.md` is cited at memo line 49 and is still missing from my folder. The researcher says it exists in theirs. I cannot confirm the question text or its provenance, so under the brief's rule this is a FAIL. No documentation claim depends on it.
- The memo's line 1 and §1 are process notes. Line 1 says the file could not be written to disk, so I read the memo as it exists in this folder.

## Library
- **Filed:** `library/facts/LIB-F-i-setup-token-cannot-start-remote-control.md`, grade A, checked 2026-10-01, shelf life 6 months.
  - I narrowed it to the one point that has two separate Anthropic pages, authentication and remote-control: a `setup-token` credential cannot establish Remote Control sessions.
  - The other Remote Control requirements rest on one page, so they are not filed.
- **Already filed, not touched:** LIB-F-a, -a2, -c, -f, -g and LIB-P-a.
- **Still held:** LIB-F-b, -d, -e and -h.
  - Each rests on one page for its key point, and I found no second page.
  - The pages I opened do not change that. LIB-F-d, for instance, is supported only in part by the authentication page.
- **Not committed.** There is no git repository in this folder, so I made no commits.

## Open questions
- **Independence ruling:** do two separate Anthropic pages count as independent sources? This is still unanswered. It decides LIB-F-b, -d, -e and -h, and whether LIB-F-i can be widened.
- **Q-005.md:** the Orchestrator needs to check the source-checker pack in `governance/PACKS.toml`, or the researcher should drop the citation. Then I can recheck.
- **Q-005a:** whether the owner's subscription may be used still needs the Anthropic Terms, which nobody has read.
- **Not opened:** the GitHub Actions billing pages, GitHub's fine-grained permission names, the Terms, and the claude.ai plan usage limits. The memo does not rely on them.
