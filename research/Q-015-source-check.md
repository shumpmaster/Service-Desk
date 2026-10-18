Verdict: FAIL

All five load-bearing claims pass, and so does almost every other quote. The overall verdict is FAIL because of F1.5. The memo quotes part of a sentence from the REST page and leaves out the next sentence, which says the user endpoints "are only applicable if the user has purchased their own Copilot plan". That omitted sentence contradicts the memo's opinion that Actions usage is not excluded. I also found two first-party sources on the token conflict that the memo does not cite or quote.

Every docs source was opened as raw source from the github/docs repository, not as a summary from a fetch tool. I compared quotes against the files themselves. Commit dates come from a blob-less git clone of github/docs (history from 2025-08-01). docs.github.com and github.blog did not resolve. github.com pages (community discussions, the go-github PR) returned 403 through the proxy. So S17–S23 could not be opened, and every claim resting only on them is UNVERIFIABLE. I did not commit, did not edit the memo, and wrote nothing to `library/`, as the brief instructs. The per-entry filing results are at the end, so whoever files the entries can act on them.

Files read (raw, main as of 2026-10-18 unless noted): `src/rest/data/fpt-2022-11-28/billing.json` and `fpt-2026-03-10/billing.json` (byte-identical), `billing.json` at 1ec98da, `src/github-apps/data/fpt-2022-11-28/fine-grained-pat-permissions.json`, `content/rest/billing/usage.md`, `content/billing/tutorials/automate-usage-reporting.md`, `previous-billing-platform-endpoints.md` at 77399b3, `github-actions.md` (main, 9075b64, ce33310), `actions-standard-runner-prices.md` (main, ce33310), `actions-runner-pricing.md`, `product-usage-included.md`, `actions-included-quotas.md`, `billing-cycles.md`, `billing-reports.md`, `usage-reports-api-limitation.md`, `budgets-and-alerts.md`, `set-up-budgets.md`, `github_token.md`, `github-token-available-permissions.md`, the CORS page, `product-and-sku-names.md`, `default-over-quota-behavior.md`, `actions-usage-delay.md`, `data/variables/product.yml` and `actions.yml`, and `content/billing/get-started/introduction-to-billing.md` (not cited by the memo).

★ = load-bearing.

## Q1. Endpoints and fields

- **F1.1 — PASS (A).** Source: S1. The title "Get billing usage report for a user" and the description "Gets a report of the total usage for a user." match, as does the note "This endpoint is only available to users with access to the enhanced billing platform." `year`: "Default value is the current year." `month` states no default. The required fields match exactly, `repositoryName` is optional, and the example item matches (`pricePerUnit` 0.008, `netAmount` 0.8). The 2026-03-10 file is byte-identical.
- **★ F1.2 — PASS (A).** Source: S1. Title "Get billing usage summary for a user". "This endpoint is in public preview and is subject to change." and "Only data from the past 24 months is accessible via this endpoint." both match. The parameters `year`, `month`, `day`, `repository` ("in the format owner/repository"), `product` ("The name is not case sensitive.") and `sku` match. The top-level fields `timePeriod{year,month,day}`, `user`, `repository`, `product`, `sku` and the ten `usageItems` fields match the schema, and all ten are required. The example (actions_linux, minutes, grossQuantity 1000, grossAmount 8, netAmount 8) matches.
  - One small difference: the memo puts "Defaults to the current month" in quotation marks, but the source reads "Default value is the current month." The meaning is the same.
  - Independent support: S4 (hand-written) says the same approach works "for an organization or user by calling the equivalent endpoint". The field list rests on S1 alone, which is the generated schema.
  - Conflict the memo does not note: S4 says "By default, usage summary endpoints return data for the **current year**", while S1 says `month` defaults to the current month. This doesn't matter if `month` is always passed, as the design does.
  - Caveat from F1.5 (below): the REST page intro restricts user endpoints to Copilot.
- **F1.3 — UNVERIFIABLE (B).** S20 is on github.blog, which did not resolve. The "public preview" note it is set against does appear in S1 today, so that half holds.
- **F1.4 — PASS (A).** Sources: S1, S16, S7. `unitType: "minutes"` is confirmed. The money fields are type `number` with no currency named. The S7 column header reads "Per-minute rate (USD)". S16 lists `actions_linux`, `actions_windows` and `actions_macos`, and the `/usage` example uses "Actions Linux".
- **F1.5 — FAIL (material omission).** Source: S2. The fragments are verbatim: "User endpoints return {% data variables.product.prodname_copilot_short %} usage that is billed directly to an individual user's personal account." But the very next sentence, which the memo leaves out, reads: "These endpoints are only applicable if the user has purchased their own {% data variables.product.prodname_copilot_short %} plan." That sentence was added on 2026-01-22 in commit 9c32d33, "Add a clarification note to the REST API billing usage documentation".
  - The memo's opinion, "It does not say Actions usage is excluded", is misleading next to that sentence. U-6 ("Opinion: no … Unconfirmed") understates the risk.
  - S1's Actions examples, S4's "aggregated usage data for all paid products", and S5's instruction to move Actions reporting to `/usage` point the other way. So this is a second documentary conflict, and it bears on whether the endpoint chosen in F1.2 returns Actions data for a Pro account with no Copilot plan. It belongs with U-1 in the same test call.
- **F1.6 — PASS (A).** Source: S11, `usage-reports-api-limitation.md`. "Data for the detailed usage report is available only through the {GitHub} web interface and cannot be obtained via the REST API `/usage` endpoint. The REST API only provides access to summarized billing information." The memo splits this into fragments but keeps the meaning.
- **F1.7 — UNVERIFIABLE (B).** S17 is on github.blog, which did not resolve. The B grade, based on snippets, is right.
- **F1.8 — PASS (A).** Source: S1 at 1ec98da (2026-03-18T23:46Z, "Split REST sync script…") and on main. Neither has any operation ending `/billing/actions`, and no JSON file contains that path string.
- **F1.9 — PASS (A).** Source: S5 at 77399b3 (2026-01-09). The quote "After you transition to metered billing, the endpoints you used to get data from the previous billing platform will no longer return accurate usage information." matches. The four field mappings match, including "This is now represented as a $ amount via `netAmount`." and "…via `discountAmount`."
  - The page is absent on main: commit 92716c6 (2026-02-25) deleted it.
  - Omission: S5 also has a "Changes in authentication" section. See the token conflict below.
- **F1.10 — UNVERIFIABLE (B).** S19 is on github.blog, which did not resolve. My search of the docs tree for "June 30, 2025" timed out, so the date stays unconfirmed, as the memo already says.
- **F1.11 — UNVERIFIABLE (C).** S22 and S23 on github.com returned 403 through the proxy.

## Q2. Token permissions — the F2.1 / F2.2 conflict

- **★ F2.1 — PASS (A) as a statement of what the REST data says. Not confirmed as working behaviour.**
  - Source S1 (main and 1ec98da), for both user endpoints: `"userToServerRest": true, "serverToServer": false, "fineGrainedPat": true, "permissions": [{"\"Plan\" user permissions": "read"}]`.
  - Source S3, key `plan`, "User permissions for \"Plan\"", lists GET `/users/{username}/settings/billing/ai_credit/usage`, `/premium_request/usage`, `/usage` and `/usage/summary`, all `"access": "read"`.
  - S1 and S3 are both generated from the same OpenAPI data, so they are **not independent**.
  - Uncited support: `content/billing/get-started/introduction-to-billing.md` says "First you will need to create a fine-grained access token with the permissions defined by the end point". That text is older than 2025-08-01.
- **F2.2 — PASS (A). The conflict is real.** Source: S4, with variables resolved from `product.yml`: "You authenticate using a personal access token (classic). The billing usage endpoints do not support fine-grained personal access tokens." The sentence was added in 77399b3 (2026-01-09). The tutorial was last edited in 5c17e4a on 2026-08-26, as the memo says. S1 already showed `fineGrainedPat: true` at 1ec98da (2026-03-18), as the memo says.
  - Uncited support for the classic side: S5 at 77399b3, "Changes in authentication": "If you used a fine-grained personal access token to authenticate with the previous endpoints, you will need create a personal access token (classic) to authenticate with the new endpoint." This came in the same commit as the tutorial sentence, so it is not independent of S4.
  - **Ruling:** the generated reference plus one older hand-written page say fine-grained tokens work. One hand-written commit of 2026-01-09 (tutorial plus migration page) says they don't, and the tutorial still carries that sentence after its 2026-08-26 edit. Both sides are first-party. The sources can't settle it, so the memo's U-1 stands. Only a test call decides. The fact "a Plan: read token works" stays out of the library. The documented conflict itself is confirmed and can be filed.
- **F2.3 — PASS (UNKNOWN is correct).** S4 says only "a {pat_generic} with the required billing permissions". I found no classic-token scope named in the billing or REST docs. The `user` guess has no source, as the memo admits.
- **F2.4 — PASS (A).** Source: S14. "The `GITHUB_TOKEN` secret is a {GitHub App} installation access token." and "The token's permissions are limited to the repository that contains your workflow." both match. The permissions list has 17 keys, from actions to vulnerability-alerts, with no plan, billing or administration key. Both endpoints are `serverToServer: false`. The one-step deduction holds.
- **F2.5 — PASS (A).** Source: S4, "User-level reports: account holder". The `{username}` equals token-owner reading is a deduction, not a quote.

## Q3. Period, reset, rounding, included minutes

- **★ F3.1 — PASS (A).** Source: S10, quoted verbatim. The memo's "…" stands for "and all payments made using an Azure subscription ID,". The quotes: "have a fixed **billing period** that starts at 00:00:00 UTC on the first day of each month and ends at 23:59:59 UTC on the last day of the month." / "At the end of each month, your metered usage is calculated and scheduled to be billed on your **billing date**." / "This is typically the day you started a paid plan".
  - Second source: S6 "At the start of each month, the minutes used by the account are reset to zero." and S11 "All usage is logged in UTC." Both are separate pages from the same publisher.
- **F3.2 — PASS (A).** Source: S6. Both sentences are verbatim on the current page.
- **F3.3 — PASS (A).** Source: S8, verbatim.
- **F3.4 — PASS (A).** Sources: S9 and `actions-included-quotas.md`. Pro: 1 GB storage and 3,000 minutes. Free: 2,000. Team: 3,000.
- **F3.5 — PASS (A).** Sources: S6, quoted verbatim, and S8 "Included minutes cannot be used for {actions.hosted_runner}s", where `actions.yml` resolves the variable to "larger runner". S6 adds: "Larger runners are always charged for".
- **F3.6 — PASS (A).** Source: S6 at 9075b64 (2025-08-14): "consume minutes at 2 and 10 times the rate that jobs on Linux runners consume." The current page doesn't mention multipliers.
- **F3.7 — PASS (UNKNOWN is correct).** `actions-usage-delay.md` is about GHAS, "up to two hours". The text "within 6 to 12 hours" in S6 is about artifact storage.

## Q4. Prices

- **★ F4.1 — PASS (A).** Source: S7 on main. The table matches cell for cell:
  - `actions_linux_slim` $0.002
  - `actions_linux` $0.006
  - `actions_linux_arm` $0.005
  - `actions_windows` $0.010
  - `actions_windows_arm` $0.010
  - `actions_macos` $0.062

  Small wording differences: the source says "Linux 1-core (x64)" and "macOS 3-core or 4-core (M1 or Intel)".

  Second source: S6's own worked example, "3,000 Linux minutes at $0.006 USD per minute = $18 USD" and "2,000 Windows minutes at $0.010 USD". S8 only embeds the S7 reusable, so it is not independent.
- **F4.2 — PASS (A).** Source: S7 at ce33310 (2025-12-16). The columns read "Per-minute rate until January 1, 2026 (USD)" and "January 1, 2026 onward". The values:
  - Linux 2-core: $0.008 → $0.006, −25%
  - Windows 2-core: $0.016 → $0.010, −38%
  - macOS: $0.080 → $0.062, −23%
  - Linux 1-core: $0.002 → $0.002, 0%

  At that commit the SKU column shows `linux`, `windows` and `macos`, without the `actions_` prefix. The memo doesn't rely on those names.

  File history: ce33310 (2025-12-16), then 260144b (2026-01-05, "Phase 2: Update relevant content for 1 Jan price change"), then 6d1eb11 (2026-02-12, "Add arm64 standard runners pricing"). Nothing later. dd812b3 is dated 2025-12-17, matching the memo.
- **F4.3 — UNVERIFIABLE (B)** for the changelog wording: S18 is on github.blog, which did not resolve. Supporting evidence: commit dd812b3 deleted `self-hosted-price-note.md` and `actions-price-changes.md`. The A part, that S6 says self-hosted usage is free, passes.
- **F4.4 — PASS (A).** Both S1 examples show `pricePerUnit` 0.008.

## Q5. Net amounts

- **★ F5.1 — PASS (A).** Source: S11, quoted verbatim: "`gross_amount - discount_amount = net_amount`" / "Usage that is discounted as part of your account's included usage is reflected in this field. Also includes discounts for {Actions} usage for standard {GitHub}-hosted runners in public repositories and for self-hosted runners." / "This is the amount that your account will be billed."
  - A second source for the API field names: S4, Step 5: "A **netAmount**, which represents the billed cost for that usage" and "A **discountAmount**, which represents usage covered by included quotas or discounts". S5 maps paid minutes to `netAmount` and included minutes to `discountAmount`.
- **F5.2 — C (opinion), not graded.** It follows from F5.1, F1.9 and F3.5. I found no source that contradicts it.

## Q6. CORS

- **F6.1 — PASS (A), with a note.** Source: S15. "The REST API supports cross-origin resource sharing (CORS) for AJAX requests from any origin." matches. The preflight shows `Access-Control-Allow-Origin: *`, `Allow-Methods: GET, POST, PATCH, PUT, DELETE` and `Max-Age: 86400`, all matching.
  - The memo truncates two header lists without marking it. The full Allow-Headers is "Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With". Expose-Headers also lists x-ratelimit-remaining, x-ratelimit-reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes and X-Poll-Interval.
  - U-5 still stands: `X-GitHub-Api-Version` is absent from the full list too.

## Q7. Budgets and alerts

- **F7.1 — PASS (A).** Sources: S12 and S13.
  - S12: "personal account owners can set budgets for their own account". "By setting a monthly budget". "notified when usage reaches 75%, 90%, and 100% of the budget amount". The 10,000 limit.
  - S13: "Product-level budget" and "SKU-level budget". "Budgets can be set for a specific repository or for your whole account." The personal-account section has "you will be notified via email and a banner". "you will be notified by email if you exceed your budget, but usage **will not** be stopped". "until the next billing cycle or until the "Actions" product budget is increased", which is the organization example. "We recommend that you avoid creating overlapping budgets for the use of a product and a SKU". "can count toward multiple applicable budgets at the same time".
  - Note: S12 also says "Budget alerts are available for budgets scoped to your enterprise, a cost center, an organization, or a repository." That list doesn't name a whole personal account. The note that follows it shows it is about user-scoped Copilot budgets, and S13's personal-account section explicitly offers alerts. The claim stands, but the wording is worth recording.
- **F7.2 — PASS (A).** Sources: S12, S13, S9. "when the included usage for your plan reaches 90% and 100% during a billing period". The included-usage alerts list "Actions minutes". The toggle reads "Receive alerts when my included usage reaches 90% and 100%". Commit d8983c4 is dated 2026-03-03.
- **F7.3 — PASS (A).** Source: `default-over-quota-behavior.md`, verbatim.
- **F7.4 — PASS (A).** Source: S1. The only budget paths are `/organizations/{org}/settings/billing/budgets` and `/budgets/{budget_id}`. There are none for users.
- **F7.5 — C (opinion), not graded.** The overlap advice it cites is confirmed (S13).

## Per proposed entry

| Entry | Result | Why |
|---|---|---|
| F-ghbill-01 endpoints | Confirmed, with a required caveat | F1.1, F1.2 and F1.4 pass. The entry must also carry S2's sentence that user endpoints "are only applicable if the user has purchased their own Copilot plan", and the preview label. |
| F-ghbill-02 token | Confirmed as a record of the conflict only | Both sides are verbatim. Add the uncited sources: introduction-to-billing (fine-grained side), and the S5 auth section (classic side, same commit as S4). Do not file "Plan: read works" as fact. |
| F-ghbill-03 billing period | Confirmed | S10, with S6 and S11. |
| F-ghbill-04 prices | Confirmed for S7, S8 and S6. The S18 part is not confirmed | Changelog snippets could not be opened, so file without the S18 wording, or mark it B and unverified. |
| F-ghbill-05 Pro included usage | Confirmed | S6, S8, S9. |
| F-ghbill-06 net of inclusion | Confirmed | S11, with S4 and S5. |
| F-ghbill-07 old endpoint retired | Not confirmed as stated | The absence from REST data (1ec98da and main) is confirmed. The 2025-09-25/26 announcement rests on unopened snippets. Only the absence half can be filed. |
| F-ghbill-08 budgets and alerts | Confirmed | S12, S13, S1. Record the S12 alert-scope wording. |
| F-gh-cors-01 CORS | Confirmed (single source) | S15. Use the full header lists, not the truncated ones. |

**Overall:** FAIL. The five load-bearing claims pass: F1.2, F2.1 (as documentary text; its conflict with F2.2 is real and unresolved), F3.1, F4.1 and F5.1. The prices table matches the source exactly. F1.5 fails because its partial quote leaves out a sentence that contradicts the memo's opinion and U-6. Seven claims are unverifiable because their only sources (S17–S23) could not be opened. One test call with the owner's token should settle U-1 and the F1.5/U-6 question together: a fine-grained Plan: read token, then a classic token, calling `/users/{u}/settings/billing/usage/summary?product=Actions` on an account with no Copilot plan.
