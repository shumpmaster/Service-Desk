# Q-008 memo (researcher), 2026-10-04

**Question:** If a Cloudflare Pages project serves a site at its pages.dev address behind Cloudflare Access, how can a new application take over that address, and which Cloudflare products can do it?

**Sources:** Cloudflare's public docs, changelog and blog only. I read them on 2026-10-04 through web search and web fetch.

**How quotes were captured:** a small summarising model pulled out each quote. The Source checker should re-fetch them word for word before filing.

**Grades:**
- **A**: two different Cloudflare pages state it ("confirmed"). They are the same vendor, so not independent.
- **B**: one Cloudflare page only ("single page").
- **ND**: not documented in anything I read.

No cost or quality recommendations are made.

## Short answer
- **Only a Pages project serves a pages.dev address (opinion, from A and ND items below).** No page I read describes any other product doing so, or a Worker being reachable there.
- **A Worker gets its own addresses.** It is served on its workers.dev address, or on a custom domain or route in a Cloudflare zone.
- **Two ways a new application can hold the address, as documented:**
  - Deploy the new application into the existing Pages project. A production deployment replaces what the pages.dev address serves.
  - Run it elsewhere and redirect pages.dev with Bulk Redirects. The redirect target is documented only as a custom domain.
- **Protecting a pages.dev address with Access:** the Pages "Enable access policy" setting covers only previews. It covers pages.dev only after an extra manual edit, described in the Known issues page.
- **Worker-level Access** covers every hostname of a Worker. Nothing I read says it applies to Pages.

## Confirmed (A — two Cloudflare pages)

| # | Fact | Sources |
|---|---|---|
| A1 | Pages projects get a `pages.dev` subdomain. Workers get `<worker>.<subdomain>.workers.dev`. The migration guide: "Where previously you were offered a `pages.dev` subdomain for your Pages project, you can now configure a personalized `workers.dev` subdomain…" | Migrate from Pages to Workers (updated 2026-09-22); workers.dev page (2026-09-22) |
| A2 | A Worker route or Custom Domain needs an active Cloudflare zone on the account. Routes also need a proxied DNS record. "Unlike Pages, Workers does not support any domain whose nameservers are not managed by Cloudflare." | Routes (2026-06-01); Custom Domains (2026-09-29); migration guide |
| A3 | Requests to Pages Functions count as Workers requests against the Workers plan quota. Static asset requests are free and unlimited. | Pages Functions pricing (2026-09-08); Pages limits (2026-09-05). Extends filed F-hosting-01. |
| A4 | Pages "Enable access policy" protects only preview deployments, "and not your `*.pages.dev` domain or custom domain". To protect `*.pages.dev`, edit the Access app it creates: in the Subdomain field, delete the wildcard `*`. Then re-enable the policy, giving two Access apps. | Preview deployments (2026-06-03); Known issues (2026-05-06) |
| A5 | A production deployment replaces what `<project>.pages.dev` and the project's custom domains serve. Preview deployments do not affect them. Production branch commits "will update your `user-example.pages.dev` content, as well as any custom domains". `wrangler pages deploy` goes to production at `<PROJECT>.pages.dev`. On rollback, "your project's production deployment will change instantly". | Preview deployments; Direct Upload (2026-04-21); Rollbacks (2026-04-21) |
| A6 | Worker-level Access ("Require sign-in on a single Worker") protects every domain of the Worker: routes, Custom Domains, workers.dev and previews. It shipped 2026-08-14. It also offers "all Workers private by default". | Workers › Cloudflare Access (2026-08-18); blog "workers-protected-by-access" (2026-08-14); changelog 2026-08-14 |
| A7 | One-click Access exists for a Worker's workers.dev and Preview URLs (Settings › Domains & Routes › Enable Cloudflare Access). | Changelog 2025-10-03; workers.dev page |
| A8 | pages.dev can be redirected to a custom domain using Bulk Redirects (301; list plus rule). | Pages Custom domains (2026-04-21); "Redirecting *.pages.dev to a Custom Domain" (2026-04-21) |
| A9 | Pages Functions run on Workers: "executing code on the Cloudflare network with Cloudflare Workers". Advanced mode (`_worker.js`) is a module Worker that must forward to `env.ASSETS`. | Pages Functions overview; Advanced mode (both 2026-04-21). Two pages, but only for the "runs on Workers" part. |

## Single page (B)

**Product differences**
- **B1 – Pages Functions lack several Workers features.** The migration compatibility matrix marks these as Workers ✅, Pages ❌ or 🟡:
  - ❌: Cron Triggers, Queue Consumers, Rate Limiting binding, Email Workers, Gradual Deployments, Workers Logs, Logpush, Tail Workers, Source Maps, Vite plugin, `--remote`, non-root routes.
  - 🟡: Durable Objects.
  - The one Pages-only item is custom domains outside Cloudflare zones.
- **B2 – Limits:** "You can configure limits for your Pages project in the same way you can for Workers" (Pages Functions Wrangler configuration). That page also says Workers keys like `main` don't apply, and module aliasing is not supported yet.

**Pages project constraints**
- **B3 – Direct Upload is one-way:** "If you choose Direct Upload, you cannot switch to Git integration later" (Direct Upload page).
- **B4 – Git integration is one-way:** "If you deploy using the Git integration, you cannot switch to Direct Upload later" (Git integration page). B3 and B4 come from different pages, each stating one direction. Taken together, the old project's deployment method fixes how new code can be deployed to it.
- **B5 – pages.dev names:** "*.pages.dev subdomains currently cannot be changed. If you need to change your *.pages.dev subdomain, delete your project and create a new one." (Known issues)
- **B6 – Deleting a project:** a project with more than 100 deployments may not be deletable (Known issues).

**Access and custom domains**
- **B7 – Access on a Pages custom domain:** "If you do not configure an Access policy for your custom domain, an Access authentication will render but not work for your custom domain visitors." (Known issues)
- **B8 – Pages custom domain blocked by a Worker:** "It is currently not possible to add a custom domain with a Worker already routed on that domain." (Pages Known issues)
- **B9 – Worker Custom Domain blocked by a CNAME:** "You cannot create a Custom Domain on a hostname with an existing CNAME DNS record or on a zone you do not own." (Workers Custom Domains)
- **B10 – Access self-hosted apps:** they need a domain in "an active zone in your Cloudflare account" (or a Cloudflare for SaaS custom hostname). The page does not mention pages.dev or workers.dev. (Publish a self-hosted application, 2026-04-17)

**Worker-level Access details** (all from Workers › Cloudflare Access)
- **B11 – WebSockets:** "WebSocket upgrade requests to a Worker protected by a worker-level Access policy will fail with a `403` error."
- **B12 – Identity:** it is exposed as `ctx.access`, with "No extra configuration or JWT parsing is required."
  - This differs from the 2025-10-03 one-click changelog, which says to validate `Cf-Access-Jwt-Assertion`.
  - It also differs from filed F-auth-04 and P-auth-01, which say to validate the JWT.
  - The two apply to different mechanisms (worker-level vs per-hostname). I am not saying either one is wrong.

## Not documented (ND)
- **ND1:** a Worker serving a pages.dev hostname, or being routed onto one. No page says it can or can't. A third-party blog claims "a Worker never receives requests for a pages.dev host". It is not Cloudflare, so I did not use it.
- **ND2:** whether a deleted project's pages.dev name can be taken again by a new project.
- **ND3:** whether worker-level Access or `ctx.access` applies to Pages projects or Pages Functions. The changelog and blog don't mention Pages.
- **ND4:** a Bulk Redirect from pages.dev to a workers.dev target. Only a custom-domain target is documented.
- **ND5:** how an Access app on `*.pages.dev` interacts with a Bulk Redirect on the same host, i.e. which acts first.
- **ND6:** whether Pages Functions' runtime limits (CPU, memory, subrequests) are identical to a Worker's. The Workers limits page doesn't mention Pages.
- **ND7:** whether an older production deployment stays reachable at its unique URL after it is replaced.
- **ND8:** changing the Git repository of an existing Git-integrated project, or disconnecting it.

## Proposed library entries (for the Source checker)
All entries: form fact, opened by researcher, grade as shown, shelf life 6 months.

| ID | Topics | Claim | Sources |
|---|---|---|---|
| F-cf-01 | cloudflare, hosting | Pages projects get pages.dev; Workers get `<name>.<subdomain>.workers.dev`. Worker routes and Custom Domains need an active Cloudflare zone on the account. Grade A. | migrate-from-pages; workers/configuration/routing/workers-dev; …/routing/routes; …/routing/custom-domains |
| F-cf-02 | cloudflare, hosting | A Pages production deployment (Git production branch or `wrangler pages deploy`) replaces what `<project>.pages.dev` and the project's custom domains serve. Previews do not. Grade A. | pages/configuration/preview-deployments; pages/get-started/direct-upload; pages/configuration/rollbacks |
| F-cf-03 | cloudflare, hosting | A Pages project cannot switch between Direct Upload and Git integration in either direction. Grade B, one page per direction. | pages/get-started/direct-upload; pages/configuration/git-integration |
| F-cf-04 | cloudflare, authentication | Pages "Enable access policy" protects only previews. Protecting `*.pages.dev` needs the wildcard removed from the created Access app, then re-enabling. A custom domain needs its own Access policy, or login "will render but not work". Grade A for the first part, B for the custom-domain sentence. | pages/configuration/preview-deployments; pages/platform/known-issues |
| F-cf-05 | cloudflare, authentication | Worker-level Access (from 2026-08-14) protects all hostnames of a Worker (routes, Custom Domains, workers.dev, previews) and exposes identity as `ctx.access`. WebSocket upgrades get 403 (B). Not documented for Pages (ND). Grade A. | workers/configuration/cloudflare-access; blog.cloudflare.com/workers-protected-by-access; changelog/post/2026-08-14-workers-access |
| F-cf-06 | cloudflare, hosting | Pages Functions run on Workers and their requests count against the Workers quota (A). The compatibility matrix lists Workers-only features: Cron, Queue consumers, Rate Limiting, Email Workers, Gradual Deployments, Workers Logs, Tail Workers (B). Identical runtime limits: ND. | pages/functions; pages/functions/pricing; pages/platform/limits; migrate-from-pages |
| F-cf-07 | cloudflare, hosting | pages.dev can be redirected to a custom domain with Bulk Redirects (A). pages.dev subdomains cannot be changed; delete and recreate the project (B). Reusing a deleted name: ND. | pages/how-to/redirect-to-custom-domain; pages/configuration/custom-domains; pages/platform/known-issues |

**Proposed pattern P-cf-01** (grade C, opinion; topics cloudflare, hosting, authentication; shelf life 6 months; rests on F-cf-01, 02, 04, 05, 07):

To put a new application at an existing pages.dev address, there are two documented routes:
1. Deploy it into the same Pages project, using that project's existing deployment method.
2. Host it elsewhere and 301 the pages.dev address to a custom domain with Bulk Redirects.

Either way, put an Access policy on every hostname: pages.dev, previews and each custom domain.

**Amendment to note:** filed P-auth-01 ("validate the Access JWT in the Worker") may need updating for worker-level Access (`ctx.access`, B12). That is for the Source checker to judge.

---

## Six-part contract
1. **What I changed:** nothing. I have no write lane; the memo above is my output.
2. **Why:** this answers Q-008 at depth 3 for the decision it serves.
3. **What I verified:**
   - About 20 web fetches and searches of developers.cloudflare.com, the Cloudflare changelog and blog.cloudflare.com. Their results are cited in the tables, with each page's last-updated date.
   - I read the brief, the question and the filed library entries on these topics: F-auth-01/02/03/04, P-auth-01, F-hosting-01, F-hosting-02a and F-gh-04 in full; the rest only in the topic search.
   - I ran no code. I did not read the environment, the `.env*` files or any configuration.
4. **What is undone:**
   - Exact verbatim quotes are not re-fetched; the fetch tool summarises.
   - I left out Workers limit numbers because the fetched summary looked unreliable.
   - I did not check that a Pages `_redirects` file can redirect to an outside URL (another possible stub route).
5. **What is needed outside my lane:**
   - The Source checker should re-fetch every source and confirm the quotes.
   - Decide whether B12 means amending P-auth-01 or F-auth-04.
6. **Open questions:**
   - Several facts are ND, and the brief says not to test them: ND1, ND2, ND3, ND4, ND5. ND1 and ND3 decide whether a Worker can ever hold the pages.dev address. Only Cloudflare support or a test could settle them, and that would need an owner decision card.
   - The old project's deployment method (Git or Direct Upload) fixes how new code can reach it (B3, B4). The owner's side would have to supply that fact; I did not look.

Sources:
- https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/
- https://developers.cloudflare.com/pages/platform/known-issues/
- https://developers.cloudflare.com/pages/configuration/preview-deployments/
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- https://developers.cloudflare.com/workers/configuration/routing/routes/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/pages/functions/
- https://developers.cloudflare.com/pages/functions/pricing/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/functions/wrangler-configuration/
- https://developers.cloudflare.com/pages/functions/advanced-mode/
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/rollbacks/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/
- https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/
- https://developers.cloudflare.com/changelog/post/2026-08-14-workers-access/
- https://developers.cloudflare.com/changelog/post/2025-10-03-one-click-access-for-workers/
- https://blog.cloudflare.com/workers-protected-by-access/
