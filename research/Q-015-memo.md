*Researcher memo for Q-015, recorded verbatim by the Orchestrator on 2026-10-18. Not yet source-checked.*

MEMO: a personal Pro account's GitHub Actions usage, cost and alerts, for the Service-Desk notifications work
Researcher memo, dated 2026-10-18. Depth: level 3, a graded memo. Blind: I did not see PROJECT.md, decision cards or the owner's leanings. I ran nothing; there were no API calls.

**Bottom line.**
- **Endpoint.** Use `GET /users/{username}/settings/billing/usage/summary?year=&month=&product=Actions`, or the daily `/usage` report.
- **Token.** The REST reference says a fine-grained token with the "Plan" user permission (read) works. A GitHub tutorial says fine-grained tokens are not supported. This conflict is unresolved: test it.
- **GITHUB_TOKEN** cannot call these endpoints.
- **What comes back.** Amounts come back in USD: gross, discount and net. `netAmount` is the billed amount, after the included minutes are subtracted.
- **Billing period.** The period is the calendar month in UTC, not the billing date.
- **Price.** Standard Linux 2-core is $0.006/min from 2026-01-01; it was $0.008.
- **Old endpoint.** `/users/{u}/settings/billing/actions` was retired. The changelog dates the notice 2025-09-25/26, and the endpoint is gone from the REST reference.
- **CORS** is allowed from any origin.
- **Built-in alerts.** GitHub's own budgets can email at 75%, 90% and 100% of a dollar budget. Separate alerts fire at 90% and 100% of included usage. There is no "every $50" option.

### Retrieval note (read first)
- docs.github.com, github.blog and resources.github.com did not resolve from this environment.
- Docs text was read from the github/docs repository's source files (main branch, read 2026-10-18). Where noted, I read a specific dated commit. REST facts come from the docs repo's generated REST data, `src/rest/data/fpt-2022-11-28/billing.json` and `fpt-2026-03-10/billing.json`. Token facts come from `src/github-apps/data/fpt-2022-11-28/fine-grained-pat-permissions.json`.
- Changelog wording was seen only in search-engine snippets. Those items are grade B, and their exact wording is NOT verified.
- The fetch tool limits quotes to about 120 characters, so long passages are quoted in fragments.
- Docs text uses template variables, which I resolved from `data/variables/product.yml`: pat_v1 = "personal access token (classic)", pat_v2_plural = "fine-grained personal access tokens".

### Sources (read 2026-10-18 unless dated otherwise)
- **S1** REST data, billing (2022-11-28 version): https://raw.githubusercontent.com/github/docs/main/src/rest/data/fpt-2022-11-28/billing.json
  - The 2026-03-10 version is the same path with `fpt-2026-03-10`.
  - Published page: https://docs.github.com/en/rest/billing/usage
- **S2** REST page stub: https://raw.githubusercontent.com/github/docs/main/content/rest/billing/usage.md
- **S3** Fine-grained token permissions data: https://raw.githubusercontent.com/github/docs/main/src/github-apps/data/fpt-2022-11-28/fine-grained-pat-permissions.json
- **S4** Tutorial "Automate usage reporting": https://raw.githubusercontent.com/github/docs/main/content/billing/tutorials/automate-usage-reporting.md (published at https://docs.github.com/en/billing/tutorials/automate-usage-reporting)
- **S5** "Migrating from the endpoints used for the previous billing platform", at commit 77399b3 (2026-01-09): https://raw.githubusercontent.com/github/docs/77399b3d2de2f1c9df8b02d7957e41e33761a9e1/content/billing/reference/previous-billing-platform-endpoints.md
  - This page no longer exists on main (404).
- **S6** "How use of GitHub Actions is measured": https://raw.githubusercontent.com/github/docs/main/content/billing/concepts/product-billing/github-actions.md
  - Earlier versions read: commit 9075b64 (2025-08-14) and ce33310 (2025-12-16).
  - Commit diffs read: dd812b3 (2025-12-17) and 260144b (2026-01-05, "Phase 2: Update relevant content for 1 Jan price change").
- **S7** Standard runner prices reusable: https://raw.githubusercontent.com/github/docs/main/data/reusables/billing/actions-standard-runner-prices.md
  - Also read at ce33310 (2025-12-16), which still has the "until January 1, 2026" column: https://raw.githubusercontent.com/github/docs/ce33310edb3d6ad3a43437b877a6f191c9349f0c/data/reusables/billing/actions-standard-runner-prices.md
  - File history: https://github.com/github/docs/commits/main/data/reusables/billing/actions-standard-runner-prices.md. Commits: 2025-12-16, 2026-01-05 and 2026-02-12 (arm64 rows added). Nothing later.
- **S8** Actions runner pricing reference: https://raw.githubusercontent.com/github/docs/main/content/billing/reference/actions-runner-pricing.md
- **S9** Included usage reference: https://raw.githubusercontent.com/github/docs/main/content/billing/reference/product-usage-included.md
  - Plus the reusable https://raw.githubusercontent.com/github/docs/main/data/reusables/billing/actions-included-quotas.md
- **S10** Billing cycles: https://raw.githubusercontent.com/github/docs/main/content/billing/concepts/billing-cycles.md
- **S11** Billing reports reference: https://raw.githubusercontent.com/github/docs/main/content/billing/reference/billing-reports.md
  - Plus the reusable `usage-reports-api-limitation.md`.
- **S12** Budgets and alerts: https://raw.githubusercontent.com/github/docs/main/content/billing/concepts/budgets-and-alerts.md
- **S13** Set up budgets: https://raw.githubusercontent.com/github/docs/main/content/billing/how-tos/set-up-budgets.md
- **S14** GITHUB_TOKEN:
  - https://raw.githubusercontent.com/github/docs/main/content/actions/concepts/security/github_token.md
  - https://raw.githubusercontent.com/github/docs/main/data/reusables/actions/github-token-available-permissions.md
- **S15** CORS: https://raw.githubusercontent.com/github/docs/main/content/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests.md
- **S16** Product and SKU names: https://raw.githubusercontent.com/github/docs/main/content/billing/reference/product-and-sku-names.md
- **S17** Changelog, 2025-09-25/26, "Product-specific billing APIs are closing down". Search snippets only.
  - https://github.blog/changelog/2025-09-26-product-specific-billing-apis-are-closing-down
  - https://github.blog/changelog/2025-09-25-product-specific-billing-apis-are-closing-down
- **S18** Changelog, 2025-12-16, "Update to GitHub Actions pricing". Snippets only. https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/
- **S19** Changelog, 2025-02-25, "Enhanced billing platform is now available for personal accounts". Snippets only. https://github.blog/changelog/2025-02-25-enhanced-billing-platform-is-now-available-for-personal-accounts/
- **S20** Changelog posts, snippets only:
  - 2025-11-03, "Manage budgets and track usage with new billing API updates": https://github.blog/changelog/2025-11-03-manage-budgets-and-track-usage-with-new-billing-api-updates
  - 2026-06-04, "Budget and usage management APIs now generally available": https://github.blog/changelog/2026-06-04-budget-and-usage-management-apis-now-generally-available
- **S21** Community discussion #178723: https://github.com/orgs/community/discussions/178723
  - queenofcorgis, Maintainer, 2025-11-04.
  - gmondello, 2025-12-11. No staff badge was visible to me.
- **S22** go-github PR #3701, merged 2025-09-25. Community, no GitHub staff: https://github.com/google/go-github/pull/3701
- **S23** Community discussion #156125, 2025-04 to 06. Community; the only Maintainer note just relabels the thread as a bug: https://github.com/orgs/community/discussions/156125

---

### Q1. Which endpoints, which fields, and the old endpoint

**Direct answer.** There are two current user endpoints, both on the enhanced billing platform. The old `/settings/billing/actions` endpoint is retired.

- **F1.1 — fact, A (S1).** `GET /users/{username}/settings/billing/usage`, titled "Get billing usage report for a user".
  - Description: "Gets a report of the total usage for a user." Note: "This endpoint is only available to users with access to the enhanced billing platform."
  - Query parameters: `year` (defaults to the current year), `month` (1–12), `day` (1–31). The `month` parameter states no default.
  - Response: `usageItems[]`.
    - Required fields: `date`, `product`, `sku`, `quantity` (integer), `unitType`, `pricePerUnit`, `grossAmount`, `discountAmount`, `netAmount`.
    - Optional field: `repositoryName`.
  - Example item: `"product":"Actions","sku":"Actions Linux","quantity":100,"unitType":"minutes","pricePerUnit":0.008,"grossAmount":0.8,"discountAmount":0,"netAmount":0.8`.
  - The 2026-03-10 API version has the same schema.
- **F1.2 — fact, A (S1).** `GET /users/{username}/settings/billing/usage/summary`, titled "Get billing usage summary for a user".
  - The reference still says: "This endpoint is in public preview and is subject to change." Also: "Only data from the past 24 months is accessible via this endpoint."
  - Query parameters: `year`, `month` ("Defaults to the current month"), `day`, `repository` (owner/repo), `product` (not case-sensitive), `sku`.
  - Response:
    - Top level: `timePeriod{year,month,day}`, `user`, `repository`, `product`, `sku`.
    - `usageItems[]` fields: `product`, `sku`, `unitType`, `pricePerUnit`, `grossQuantity`, `grossAmount`, `discountQuantity`, `discountAmount`, `netQuantity`, `netAmount`.
  - Example item: sku `actions_linux`, unitType `minutes`, grossQuantity 1000, grossAmount 8, netAmount 8.
- **F1.3 — fact, B (S20, snippets).** The 2026-06-04 changelog says the budget and usage-summary APIs are "now generally available". This conflicts with the reference's "public preview" note (F1.2).
- **F1.4 — fact, A (S1, S16).** On units and currency:
  - Minutes appear as `unitType: "minutes"`.
  - Money fields are plain numbers. The schema names no currency. The price pages are in USD (S7).
  - SKU identifiers include `actions_linux`, `actions_windows` and `actions_macos`. The `/usage` example instead shows the display name "Actions Linux". Do not hard-code one form.
- **F1.5 — fact, A (S2).** Text on the REST page, verbatim fragments: "User endpoints return {Copilot} usage" "billed directly to an individual user's personal account."
  - Opinion: this intro concerns Copilot licences. It does not say Actions usage is excluded, and the example responses are Actions items. See U-6.
- **F1.6 — fact, A (S11).** "Data for the detailed usage report is available only through the GitHub" web interface. The API's `/usage` endpoint "only provides access to summarized billing information."
- **F1.7 — fact, B (S17, snippets).** The 2025-09-25/26 changelog is titled "Product-specific billing APIs are closing down".
  - It says GitHub is "closing down the remaining product-specific billing APIs for Actions, Packages, and shared storage".
  - It covers the enterprise, organization and user `/settings/billing/actions|packages|shared-storage` routes, which it lists as no longer supported.
  - The replacement is the consolidated usage endpoint.
  - The exact switch-off date was NOT found.
- **F1.8 — fact, A (S1 at commit 1ec98da, 2026-03-18, and S1 on main).** No `/users/{username}/settings/billing/actions` operation appears in the REST data, either on 2026-03-18 or today.
- **F1.9 — fact, A (S5, docs at 2026-01-09; page since removed).**
  - "After you transition to metered billing, the endpoints you used to get data from the previous billing platform will no longer return accurate usage information."
  - Field mapping, each after filtering to `"product": "Actions"` and `"unitType": "minutes"`:
    - `total_minutes_used` = sum of `quantity`.
    - `total_paid_minutes_used`: "This is now represented as a $ amount via `netAmount`."
    - `included_minutes`: "now represented as a $ amount via `discountAmount`."
    - `minutes_used_breakdown` = `quantity` summed by `sku`.
- **F1.10 — fact, B (S19, snippets).** "As of February 13, 2025, new GitHub Free and Pro plan customers now have access to the enhanced billing platform."
  - Search snippets of the docs (not verified) say personal accounts created before then were to be migrated "by June 30, 2025".
- **F1.11 — C (S22, S23, community).** A go-github PR removed the user and organization ActionsBilling methods on 2025-09-25, as a breaking change. Users reported the old organization endpoint returning zeros from 2025-03-27, around the migration.

**Design consequence.** Build on `/usage/summary` with `product=Actions&year=YYYY&month=MM`. Fall back to `/usage` with year and month if the summary changes, since it is still labelled preview. Never use `/settings/billing/actions`.

### Q2. Token permissions
- **F2.1 — fact, A (S1, S3).** For both user endpoints, the REST data reads `"fineGrainedPat": true`, `"userToServerRest": true`, `"serverToServer": false`, permission `"Plan" user permissions: read`.
  - S3 lists the user permission "Plan", covering GET `/users/{username}/settings/billing/usage` and `/usage/summary` (plus the `ai_credit` and `premium_request` usage endpoints), all read.
- **F2.2 — fact, A (S4), and it CONFLICTS with F2.1.** The tutorial's prerequisites say: "You authenticate using a personal access token (classic). The billing usage endpoints do not support fine-grained personal access tokens."
  - The tutorial was last edited 2026-08-26.
  - The REST data said fine-grained tokens work as early as 2026-03-18.
  - Which is right in practice: UNKNOWN (U-1).
- **F2.3 — UNKNOWN, with a C pointer.** Neither the REST data nor the tutorial names a classic-token scope for these endpoints; S4 says only "the required billing permissions". The `user` scope is my unverified guess from the old endpoints' wording, and I have no source for it (U-2).
- **F2.4 — fact, A (S14, S1).** GITHUB_TOKEN cannot call these endpoints. Expectation confirmed.
  - "The `GITHUB_TOKEN` secret is a GitHub App installation access token." "The token's permissions are limited to the repository that contains your workflow."
  - The 17 permission keys a workflow can set include no plan, billing or administration key.
  - The endpoints are `serverToServer: false`, so installation tokens are not accepted. Concluding that GITHUB_TOKEN is refused is my one-step deduction, which I grade A.
- **F2.5 — fact, A (S4).** "User-level reports: account holder." So the token must belong to the account itself, with `{username}` equal to the token's owner.

**Design consequence.** The workflow needs a personal token stored as a repository secret. Try a fine-grained token with Account permissions → Plan: Read first. If that returns 403, use a classic token. The owner can settle this with one test call.

### Q3. Freshness, billing period reset, rounding, included minutes
- **F3.1 — fact, A (S10).**
  - "Metered products … have a fixed billing period that starts at 00:00:00 UTC on the first day of each month and ends at 23:59:59 UTC on the last day of the month."
  - "At the end of each month, your metered usage is calculated and scheduled to be billed on your billing date."
  - For personal accounts, the billing date "is typically the day you started a paid plan".
- **F3.2 — fact, A (S6).** S6 says both "At the start of each month, the minutes used by the account are reset to zero" and "Your free minutes reset to the full amount at the start of each billing cycle."
  - Opinion: S10 defines the metered period as the calendar month in UTC, so the two sentences agree. The owner's Plan billing date is not the reset point.
- **F3.3 — fact, A (S8).** "GitHub rounds the minutes and partial minutes each job uses up to the nearest whole minute." This is per job, not per run.
- **F3.4 — fact, A (S9).** Pro includes 1 GB artifact storage and 3,000 "Minutes (per month)". Free includes 2,000 and Team 3,000.
- **F3.5 — fact, A (S6).**
  - "usage is **free** for **self-hosted runners** and for **public repositories** that use standard GitHub-hosted runners."
  - "For **private repositories**, each GitHub account receives a quota of free minutes, artifact storage, and cache storage … depending on the account's plan."
  - "Included minutes cannot be used for larger runners" (S8). Larger runners are always charged.
- **F3.6 — fact, A (S6 at 2025-08-14) / UNKNOWN now.**
  - The August 2025 docs said Windows and macOS jobs "consume minutes at 2 and 10 times the rate" of Linux.
  - The current page no longer mentions multipliers.
  - Whether included minutes are still drawn down at 2× and 10× is UNKNOWN (U-4). This matters only if non-Linux runners are used.
- **F3.7 — UNKNOWN.** No GitHub source gives the delay before Actions minutes appear in usage data.
  - The only delay reusable, `actions-usage-delay.md`, is about Advanced Security ("up to two hours").
  - S6 says artifact storage updates "within 6 to 12 hours". That is storage, not minutes.

**Design consequence.**
- Compute "this period" as the current UTC calendar month, with `year` and `month` taken from the UTC date.
- Treat the figures as lagging by an unknown amount. Show "as of <fetch time>".
- The workflow costs money itself, because each job rounds up to one minute. For example, an hourly run with one job on a private repo is about 744 min/month, about $4.46 at $0.006. That is my arithmetic. A cron in a public repo would be free (F3.5).

### Q4. Prices and 2025–2026 changes
- **F4.1 — fact, A (S7, current).** Current per-minute prices:

  | Runner | SKU | Price per minute |
  |---|---|---|
  | Linux 1-core | `actions_linux_slim` | $0.002 |
  | Linux 2-core (x64) | `actions_linux` | $0.006 |
  | Linux 2-core arm64 | `actions_linux_arm` | $0.005 |
  | Windows 2-core (x64) | `actions_windows` | $0.010 |
  | Windows 2-core arm64 | `actions_windows_arm` | $0.010 |
  | macOS 3/4-core | `actions_macos` | $0.062 |

- **F4.2 — fact, A (S7 at ce33310, 2025-12-16).** Rates "until January 1, 2026" and "January 1, 2026 onward":
  - Linux 2-core: $0.008 → $0.006 (−25%).
  - Windows 2-core: $0.016 → $0.010 (−38%).
  - macOS: $0.080 → $0.062 (−23%).
  - Linux 1-core: $0.002, unchanged.
  - The docs commit "Update relevant content for 1 Jan price change" landed 2026-01-05. The file's history shows no price change since (only arm64 rows, added 2026-02-12).
- **F4.3 — fact, B (S18, snippets).**
  - "On January 1, 2026, GitHub will reduce the price of GitHub-hosted runners by up to 39% depending on the machine type used." Free minute quotas stay the same.
  - A $0.002/min platform charge for self-hosted runners, announced for 2026-03-01, was later postponed: "postponing the announced billing change for self-hosted GitHub Actions". The current docs (S6) say self-hosted usage is free (A).
- **F4.4 — fact, A (S1).** The API examples still show `pricePerUnit: 0.008`. These are stale examples.

**Design consequence.** Do not hard-code prices. Use the `pricePerUnit` and `netAmount` the API returns. If a fallback constant is needed, use $0.006 for Linux and record the date it was taken.

### Q5. Is the inclusion netted out, and how to compute "cost so far"
- **F5.1 — fact, A (S11).** Definitions in the billing reports reference:
  - `gross_amount - discount_amount = net_amount`
  - `discount_amount`: "Usage that is discounted as part of your account's included usage is reflected in this field." It "Also includes discounts for {Actions} usage for standard GitHub-hosted runners in public repositories and for self-hosted runners."
  - `net_amount`: "This is the amount that your account will be billed."
  - S11 is the CSV-report reference. S5 applies the same `netAmount`/`discountAmount` meanings to the API (A).
- **F5.2 — opinion/estimate, C (from F5.1, F1.9, F3.5).** Suggested computation:
  - **Estimated cost so far this period:** the sum of `netAmount` over items with `product == "Actions"` for the current UTC month.
    - This includes Actions storage SKUs, if any, as the bill does.
    - To show minutes cost only, also filter `unitType == "minutes"`.
    - Do not subtract the included minutes again. They are already in `discountAmount`.
  - **Percent of included minutes:** private-repo minutes ÷ 3,000.
    - `grossQuantity` can include free public-repo minutes, which are discounted but do not use up the quota. So minutes from public repos should be excluded, through the `repository` filter or `/usage` `repositoryName`. That needs the repos' visibility.
    - Once `netAmount` > 0 on minute SKUs, the quota is used up (≥ 100%).
  - **$50 steps:** notify when floor(net / 50) rises above the last value notified for that month, and keep that value per year-month.
  - Matching the invoice exactly also depends on the data lag (U-3) and on end-of-month finalisation (F3.1).

### Q6. CORS
- **F6.1 — fact, A (S15).**
  - "The REST API supports cross-origin resource sharing (CORS) for AJAX requests from any origin."
  - Example preflight response headers:
    - `Access-Control-Allow-Origin: *`
    - `Access-Control-Allow-Headers: Authorization, Content-Type, If-Match`
    - `Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE`
    - `Access-Control-Expose-Headers: ETag, Link, x-ratelimit-limit`
    - `Access-Control-Max-Age: 86400`
  - The page says nothing specific about requests that send credentials. Authorization is in the allowed headers.
- **UNKNOWN (U-5).** The docs example does not list `X-GitHub-Api-Version` among the allowed headers, so it is not confirmed that a browser may send it. Requests without it use the default version (api-versions page; the version name did not render in the source).

**Design consequence.** A static page can `fetch` the endpoint with `Authorization: Bearer <token>` and no cookies. If the preflight rejects `X-GitHub-Api-Version`, leave that header out.

### Q7. GitHub's own budgets and alerts
- **F7.1 — fact, A (S12, S13).**
  - Personal account owners "can set budgets for their own account".
  - Budget types: a "Product-level budget" (for example Actions) or a "SKU-level budget". Scope: "Budgets can be set for a specific repository or for your whole account."
  - Amounts are in dollars, "By setting a monthly budget".
  - Alerts: "notified when usage reaches 75%, 90%, and 100% of the budget amount". They arrive by email and as a banner. These thresholds are fixed; I found no way to set custom percentages or dollar steps.
  - "Stop usage when budget limit is reached": without it, "you will be notified by email if you exceed your budget, but usage **will not** be stopped". With it, usage is blocked "until the next billing cycle or until the … budget is increased".
  - At most 10,000 budgets per account. "We recommend that you avoid creating overlapping budgets for the use of a product and a SKU"; usage "can count toward multiple applicable budgets at the same time".
- **F7.2 — fact, A (S12, S13, S9).** Included-usage alerts are separate from budgets. They email "when the included usage for your plan reaches 90% and 100%" in a billing period, for Actions among other products. The personal-account toggle is "Receive alerts when my included usage reaches 90% and 100%". The docs commit adding this is dated 2026-03-03.
- **F7.3 — fact, A (S9, `default-over-quota-behavior` reusable).** "If you have a valid payment method on file, spending may be limited by one or more budgets."
- **F7.4 — fact, A (S1).** The Free/Pro/Team (fpt) REST reference has budget endpoints only for organizations (`/organizations/{org}/settings/billing/budgets`). I found none for users, so a personal account's budgets are UI-only.
- **F7.5 — opinion, C.** Several Actions budgets ($50, $100, $150 …) without the stop option might give an email at each 100% mark, a native stand-in for "every $50". The docs advise against overlap and do not say how overlapping budgets behave (U-7).

**Design consequence.** As a complement, turn on the included-usage alerts (90/100%) and add one Actions budget with alerts set at the owner's ceiling. The custom workflow is still needed for exact $50 steps and for the percent display.

### UNKNOWNs
- **U-1.** Do the user usage endpoints accept a fine-grained token with Plan: read? The REST data says yes; the tutorial says no. One test call settles it.
- **U-2.** Which classic-token scope these endpoints require. Not documented.
- **U-3.** How long Actions minutes take to appear in the usage API. Not documented.
- **U-4.** Whether Windows and macOS minutes still draw down the included quota at 2× and 10×, and whether the quota is applied in minutes or in dollars. S5 calls `included_minutes` "a $ amount via `discountAmount`".
- **U-5.** Whether the CORS preflight allows `X-GitHub-Api-Version`.
- **U-6.** Whether the Copilot-only wording on the REST page's intro (F1.5) means anything for Actions on user endpoints. Opinion: no, given the Actions examples. Unconfirmed.
- **U-7.** How overlapping or stacked budgets behave, and whether alerts repeat after 100%.
- **U-8.** The exact switch-off date of `/users/{u}/settings/billing/actions`, and what it returns today.
- **U-9.** Whether `/usage` with `year` but no `month` returns the whole year (`month` has no stated default). Always pass `month`.
- **U-10.** Whether this specific Pro account is on the enhanced billing platform. Very likely after June 2025, but it is not stated for this account.

### Proposed library entries (fact form; for the Source checker)
- **F-ghbill-01 — user usage endpoints.** Claim: Q1 F1.1, F1.2 and F1.4. Grade A. Topics: github, billing, actions, api. Shelf life 6 months (the summary endpoint is preview/GA in flux). Sources: S1.
- **F-ghbill-02 — token for the user usage endpoints.** Claim: the REST data gives fine-grained Plan: read, not server-to-server. The tutorial S4 says fine-grained tokens are unsupported. GITHUB_TOKEN cannot call them. Grade A, conflict noted. Topics: github, billing, auth. Shelf life 3 months. Sources: S1, S3, S4, S14.
- **F-ghbill-03 — billing period.** Claim: metered usage runs on the calendar month, 00:00:00 UTC on the 1st to month end, and is billed on the billing date. Included minutes reset monthly. Grade A. Topics: github, billing. Shelf life 12 months. Sources: S10, S6.
- **F-ghbill-04 — Actions prices.** Claim: standard runner rates from 2026-01-01, with the old rates, per F4.1 and F4.2. Rounding up per job. Grade A. Topics: github, actions, billing, pricing. Shelf life 6 months. Sources: S7 (main and ce33310), S8, S18 (B).
- **F-ghbill-05 — Pro included usage.** Claim: Pro includes 3,000 min/month. Standard runners on public repos and self-hosted runners are free. The quota applies to private repos, and larger runners are excluded. Grade A. Topics: github, actions, billing. Shelf life 12 months. Sources: S6, S8, S9.
- **F-ghbill-06 — amounts are net of the inclusion.** Claim: `net = gross − discount`. The discount includes included usage and public-repo or self-hosted discounts. Net is the billed amount. The old fields map per S5. Grade A. Topics: github, billing, api. Shelf life 12 months. Sources: S11, S5.
- **F-ghbill-07 — old endpoint retired.** Claim: product-specific billing APIs, including `/users/{u}/settings/billing/actions`, were announced closed on 2025-09-25/26. They are absent from the REST reference by 2026-03-18. Grade B (changelog snippets) plus A (absence in the REST data). Topics: github, billing, api. Shelf life 12 months. Sources: S17, S1.
- **F-ghbill-08 — budgets and alerts.** Claim: personal budgets per product or SKU, in dollars, with fixed alerts at 75/90/100% by email and banner and an optional stop. Separate included-usage alerts at 90/100%. No user budget REST endpoints. Grade A. Topics: github, billing, notifications. Shelf life 6 months. Sources: S12, S13, S1.
- **F-gh-cors-01 — REST CORS.** Claim: the REST API supports CORS from any origin, per the example preflight headers. Grade A. Topics: github, api, web. Shelf life 12 months. Sources: S15.

Escalation: none needed. U-1, U-3 and U-5 can be settled by a single real call (a level-4 spike), with the owner's token, if the Chief of Staff wants it.
