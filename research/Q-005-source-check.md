Verdict: FAIL

Four of the five revised claims (F-07, F-12, F-13, F-14) now hold against their pages. F-09 does not, because the memo's header claim contradicts its own cited source. I also filed one new library entry and held another.

I re-read the routines, github-actions, routines-fire and remote-control pages in full. I did not open the `.env*`, `.npmrc` or lockfiles. I made no commits.

## Findings
- **F-09: fail** (`research/Q-005-memo.md` line 13 and lines 133–141).
  - Line 13 calls `anthropic-beta: experimental-cc-routine-2026-04-01` a "required header". The fire page lists only `Authorization` and `anthropic-version` as required. It adds that the endpoint "accepts requests with and without" the beta header.
  - The routines page curl example does send it. The "two most recent previous header versions continue to work" quote is on the routines page and is correct.
  - The memo should say the beta header is optional.
- **F-12: confirmed** (memo lines 152–159). It matches the routines page "Usage and limits" table, including the "None of these hourly limits has overage" sentence, run-now's separate 100/hour account limit, and the metered-overage wording.
- **F-13: confirmed** (memo lines 160–167).
  - The routines page has the pause switch and Delete menu in the web UI.
  - The CLI commands are `/schedule list`, `update` and `run`, plus GitHub trigger (v2.1.225) and run history (v2.1.227).
  - The Owner toggle, the 72-hour GitHub skip and the archive/delete of run sessions all match.
  - Pause and delete from the CLI are not documented, as the memo now says.
- **F-14: confirmed** (memo lines 170–176). The "Who can trigger runs" section matches: the write-access check applies to issue and PR events, `schedule` skips it, and `allowed_non_write_users` is the exception. The bot check applies on every event, including scheduled runs.
- **F-07: confirmed, and the open question can be narrowed** (memo lines 114–122). I read the full Remote Control page from the fetch's saved copy.
  - Pro, Max, Team and Enterprise are covered. "API keys are not supported."
  - Bedrock, Agent Platform, Foundry and a non-`api.anthropic.com` `ANTHROPIC_BASE_URL` are excluded.
  - On Team and Enterprise, an Owner must turn it on, and `setup-token` tokens cannot establish sessions.
  - I found no API or third-party access documented anywhere on that page.
  - The memo grades the requirements B. They can be A now, so the F-07 absence claim (Q-005e) can be recorded as "not documented on the full page".
- **Memo §1 line 18 is false.** It says `research/Q-005.md` exists. It is not in the folder, so the memo's claim to have re-read it cannot be checked.

## Library
- **Filed:** `library/facts/LIB-F-a2-routine-fire-limits-and-beta-header.md`. It carries the limits table, the overage rules and the corrected header rule. It supersedes LIB-F-a on those points only, and I did not edit LIB-F-a. Grade A, checked 2026-10-01, shelf life 3 months. It rests on two Anthropic pages, labelled as the same publisher.
- **Held:** LIB-F-h (F-13 + F-14). Each half rests on one page, which is the same bar that held LIB-F-b, -d and -e last round.
- **Still held:** LIB-F-b, -d and -e, since no second page was found.
- **LIB-F-a still says** "Limits, no overage… (both pages)" and omits the beta header. This is not wrong, but it is incomplete, so readers should use LIB-F-a2.

## Open questions
- Does the owner accept two separate Anthropic pages as independent sources? That decides LIB-F-h and the other held entries. It is still unanswered.
- Q-005a, whether the owner's subscription may be used, needs the Terms, which nobody has read.
- The researcher should fix F-09 and the line-18 claim, then I can recheck.
