Verdict: FAIL

The memo as a whole fails because some claims don't match their sources. Five of the eight proposed library entries pass and are filed. Three are held.

I opened every cited source except the full Remote Control page. Its fetch came back truncated, so I only saw the opening description. I did not read `.env*`, `.npmrc`, lockfiles or other credential files in the folder. I made no commits and wrote no tests; the only changes are the five new files under `library/`.

## Claims that don't match their source
- **F-13 (research/Q-005-memo.md, §R2).**
  - The memo says a routine can be "paused or deleted in the UI or with `/schedule` in the CLI".
  - The routines page confirms pause and delete in the UI only. For the CLI it documents `/schedule list`, `update`, `run` and create, and says nothing about delete or pause. Not confirmed.
- **F-14 (research/Q-005-memo.md, §R3).**
  - The memo says "the triggering user needs write access".
  - The github-actions page limits this to issue and PR events. Events with no user author, such as `schedule`, skip the check, and `allowed_non_write_users` is an exception. The claim is too broad.
- **F-07 (research/Q-005-memo.md, §R1).**
  - What Remote Control is, is confirmed from the page opening.
  - "No third-party or API access is documented" is an absence claim I could not verify, because I didn't read the whole page.
- **Memo §3.** It says it read `research/Q-005.md`, but only `research/Q-005-memo.md` exists in the folder. Minor.

## Confirmed
Quotes match the pages unless noted.
- **F-01 to F-06, F-08 to F-12, F-15, F-16, F-18, F-19, F-21 to F-23, F-25, F-27.** Confirmed against code.claude.com and platform.claude.com. The F-22/F-23/F-27 pages are overview, sessions, session-operations, reference and pricing. F-23's "budget in US cents" is right: `amount` is cents written as a string.
- **F-17.** Confirmed on docs.github.com.
  - Workflow dispatch has a 25-input maximum and returns HTTP 200 with `workflow_run_id`, `run_url` and `html_url`.
  - `/cancel` and `/force-cancel` exist.
  - The logs link expires in 1 minute.
  - Classic tokens need the `repo` scope.
  - Fine-grained permission names are still not confirmed, as the memo says.
- **F-20, F-24, F-26.** Confirmed. These were read through the fetch tool's extract rather than the full page. F-26's statement that "whether the token enters the sandbox is not stated" held up.
- **Q-005b (no read API for cloud sessions).** The llms.txt index lists none. This is only an absence in the index, not proof that no such API exists.

## Entries filed (`library/`)
All were checked on 2026-10-01 and opened by source-checker.

| Entry | File | Shelf life |
|---|---|---|
| LIB-F-a | `facts/LIB-F-a-routine-fire-endpoint.md` | 3 months |
| LIB-F-c | `facts/LIB-F-c-cloud-session-billing-credential.md` | 6 months |
| LIB-F-f | `facts/LIB-F-f-managed-agents-lifecycle-price.md` | 3 months |
| LIB-F-g | `facts/LIB-F-g-sdk-cost-fields-are-estimates.md` | 12 months |
| LIB-P-a | `patterns/LIB-P-a-credential-outside-agent-boundary.md` | 12 months |

All five are grade A. Each rests on two or more separate Anthropic pages. LIB-F-g's TypeScript page was read through the fetch tool's extract, not the full text.

## Entries held (verified but not filed)
They rest on a single page.
- **LIB-F-b (F-03, CLI follow-ups).** Only the claude-code-on-the-web page covers it.
- **LIB-F-d (F-15/F-16, Action credentials and cost).** Only the github-actions page covers it. The authentication page only partly corroborates the credentials half.
- **LIB-F-e (F-18, Agent SDK auth policy).** Only the agent-sdk/overview page has the "third party developers" sentence.

## Open questions
- **Independence.** Every filed entry rests on Anthropic's own pages, and no third-party source exists for product behaviour. I counted separate pages as two sources and labelled each entry "same publisher". If you require non-Anthropic corroboration, all five entries and the held ones fail that bar. Please confirm which reading applies.
- **Q-005a (use of the owner's subscription)** needs a reading of Anthropic's Commercial and Consumer Terms. I did not read them, and the memo's author didn't either. This stays with the owner.
- **Held entries.** Is a second page or an Anthropic-published source available for the held entries? If so, I can file them.
- **Memo fixes.** The researcher should correct F-13 and F-14 and finish reading the Remote Control page for F-07. Then I can recheck.
