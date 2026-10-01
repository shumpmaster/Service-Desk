---
id: LIB-F-a2
form: fact
title: Routines /fire — beta header is optional; per-action hourly limits and overage rules
topics: [automation, claude-code, cost]
grade: A
checked_on: 2026-10-01
shelf_life: 3 months   # research preview, endpoint marked experimental
opened_by: source-checker (Q-005 round 2), full page text of both pages
supersedes: LIB-F-a (limits and header detail only; the rest of LIB-F-a stands)
memo: research/Q-005-memo.md (F-12; F-09 corrected, see below)
sources:
  - https://platform.claude.com/docs/en/api/claude-code/routines-fire
  - https://code.claude.com/docs/en/routines
independence: two separate pages, same publisher (Anthropic). No third-party source exists for product behaviour.
---
- Required headers per the fire page: `Authorization: Bearer <token>` and `anthropic-version: 2023-06-01` (the only accepted value). `anthropic-beta: experimental-cc-routine-2026-04-01` is NOT required: the fire page says the endpoint "accepts requests with and without it". The routines page curl example still sends it, and says breaking changes ship behind new dated beta headers with the two most recent previous versions still working. (Memo revision 1 called the header "required"; that is wrong.)
- Limits (routines page, "Usage and limits"): scheduled runs incl. one-off 100/hour/account, over limit the run waits. Run now + API fires + one-off re-arm 30/hour/routine, one shared count, over limit the action fails. Run now + one-off re-arm 100/hour/account. API fires 100/hour/account, counted separately from Run now. GitHub events have per-routine and per-account hourly caps; excess events are dropped. "None of these hourly limits has overage."
- API over the limit: `429 rate_limit_error` with `Retry-After` (fire page).
- Subscription usage limit: orgs with usage credits on "can keep running routines on metered overage"; without credits, runs are rejected until the window resets (routines page).
- A paused routine returns 400 on fire (fire page error table).
