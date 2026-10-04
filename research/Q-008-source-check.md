Verdict: PASS

I opened all 23 cited pages and read the raw page text myself. The memo's own quotes came from a summarising fetch, and I re-checked them against the pages. Every proposed entry passes, and I filed all eight. One quote is not word for word, and a few memo claims are wider than the pages support. None of these block an entry.

**Filed**
- Facts: `library/facts/F-cf-01.md` to `F-cf-07.md`.
- Pattern: `library/patterns/P-cf-01.md`, grade C and labelled opinion.
- Each entry has the checked-on date, shelf life, topics, who opened the sources and the memo it came from.
- Nothing is committed (none of this folder is a git repository).
- Per `governance/standards/sources.md`, two Cloudflare pages count as two sources for product behaviour, and each entry notes "same publisher".

**Findings**
- **F-cf-01 (A1, A2):** confirmed. The migrate-from-pages page has the `pages.dev` → `workers.dev` quote and the "Unlike Pages…" quote. The workers.dev page gives the `<WORKER>.<SUBDOMAIN>.workers.dev` form. The routes and custom-domains pages both say "An active Cloudflare zone".
- **F-cf-02 (A5):** confirmed. The preview-deployments page says commits "will update your user-example.pages.dev content, as well as any custom domains". The Direct Upload page says production is at `<PROJECT_NAME>.pages.dev`. The rollbacks page says "production deployment will change instantly".
- **F-cf-03 (B3, B4):** both quotes are verbatim, one per page, so grade B. Direct Upload page: "cannot switch to Git integration later". Git integration page: "cannot switch to Direct Upload later".
- **F-cf-04 (A4, B7):** confirmed. The preview-deployments page says the policy protects previews "and not your *.pages.dev domain or custom domain". The Known issues page has the steps: delete the `*` in the Subdomain field, then reselect "Enable access policy", giving two policies. B7 is verbatim on Known issues only.
- **F-cf-05 (A6, B11, B12):** confirmed. The Workers Access page says "automatically protects every domain associated with the Worker…", gives the WebSocket 403, and says "No extra configuration or JWT parsing is required." The blog covers all hostnames and account-wide private by default. The 2026-08-14 changelog covers `ctx.access` only; it does not state the all-hostnames claim. Earlier entries `F-auth-04` and `P-auth-01` are untouched.
- **F-cf-06 (A9, A3, B1, B2):** confirmed. The Functions overview says it runs on Workers. The pricing and limits pages both say Functions requests count against the Workers quota. I checked every B1 matrix mark (✅/❌/🟡) against the page, and all match. B2 and the module-aliasing note are on the wrangler-configuration page only.
- **F-cf-07 (A8, B5):** confirmed. The Bulk Redirects how-to has the 301 table with a custom-domain target. The custom-domains page names the account-level Bulk Redirect feature. B5 is verbatim on Known issues only.
- **B6, B9, B10:** B6 is confirmed (">100" is worded "over 100" on the page), B9 is verbatim, and B10 is accurate: the page doesn't mention pages.dev or workers.dev. None is filed.
- **P-cf-01:** it rests on the facts above and on no new source. It is filed as opinion, with the "not documented" items and the ordering caveat from the Known issues page.

**Memo defects (not blocking)**
- **B8 is not a verbatim quote.** The page has a bullet list: "It is currently not possible to add a custom domain with: …a wildcard…, a Worker already routed on that domain…, a Cloudflare Access policy already enabled on that domain." The memo stitched it together. B8 is not filed. The meaning is right.
- **The Access-policy bullet is missing from the memo.** The same list says a Pages custom domain cannot be added where an Access policy already exists on it. I added it as a single-page note on `F-cf-04` and `P-cf-01`, because it affects the order of steps.
- **A3's "static asset requests are free" is on the pricing page only.** The limits page doesn't say it. The migration guide also says it for Workers. It isn't in my entry, since `F-hosting-01` already carries it.
- **The memo's first short-answer bullet is an inference from silence.** "Only a Pages project serves a pages.dev address" rests on not-documented items, so I did not file it. I found no page that contradicts the not-documented items, and none of the Workers routing pages mention pages.dev.

**Open questions**
- **ND1 to ND8 are untested.** I confirmed none of them from the docs, which is correct under the brief. ND1 and ND3 (whether a Worker can hold a pages.dev address, and whether worker-level Access applies to Pages) still decide the Service Desk replacement route. Settling them needs support or a test, which means an owner decision.
- **The old project's deployment method is unknown.** It decides whether route 1 is open (B3, B4).
- **`P-auth-01` may need amending.** I judge `F-auth-04` and `P-auth-01` still correct for per-hostname Access, and I left them unedited. Amending `P-auth-01` for worker-level Access (`ctx.access`) would be a new superseding entry. That is for the owner to decide.
