I've written the Q-001 memo below. Its main finding: on the Cloudflare side the person already uses, this app can be hosted for $0 a month, and the first paid step is $5 a month. Most of the memo's facts come from vendor documentation I fetched today. A few items I couldn't confirm are marked as estimates, and a checker needs to look at them before anything relies on them.

---

# Memo — Q-001: Hosting a one-person, phone-first app over private GitHub repos

**Date:** 2026-10-01 · **Depth:** 3 · **Topics:** hosting, cloudflare, cost, authentication
**Grades:** **A** = vendor's own documentation, fetched today · **B** = vendor blog/changelog or several secondary sources that agree · **C** = one secondary source, or my own reasoning · **U** = not checked this session
**Labels:** each statement is marked **F** (fact), **E** (estimate) or **O** (opinion).

## 1. What every option has to handle (the GitHub side)

| # | Statement | Label | Grade | Source |
|---|---|---|---|---|
| G1 | Personal tokens and GitHub App installation tokens are each limited to 5,000 REST requests per hour. | F | A | [GH rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) |
| G2 | Requests that create content (such as writing files) are limited to 80 per minute and 500 per hour. Writes cost 5 points each, against 900 points per minute. | F | A | same |
| G3 | A GitHub App installation token expires after 1 hour. The server must mint new ones from a JWT, so it has to keep the app's private key. | F | A | [GH App tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app) |
| G4 | Fine-grained personal tokens can have no expiry for personal projects. For use with an organization, admins can enforce a limit of 1–366 days, and the default organization policy is 366 days. | F | B | [GH changelog 2024-10-18](https://github.blog/changelog/2024-10-18-new-pat-rotation-policies-preview-and-optional-expiration-for-fine-grained-pats/) |
| G5 | Polling 10 repos every 30 seconds while the app is open is about 1,200 requests per hour. That fits under G1. | E | C | arithmetic |
| G6 | Conditional requests (ETag, answered with 304) don't count against the main rate limit. | F | U | not re-checked |
| G7 | api.github.com allows browser calls from other sites (CORS), so a page with no server could call it directly. | F | U | not re-checked |
| G8 | There are two ways to "update while open": polling (works on every option) or GitHub webhooks pushed to a server that stays running. Webhooks need a public endpoint that is not behind Access. | O | C | reasoning |

## 2. Options

### Option 1: Cloudflare Workers (or Pages Functions) + Access + Durable Object
- **Cost.**
  - Free plan: 100,000 Worker requests per day and 10 ms of CPU per call. Paid plan: $5 a month per account, with 10 million requests and 30 million CPU-ms included. **F, A** ([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/))
  - Requests for static files are free and unlimited. Pages Functions requests count against the Workers allowance. **F, A** ([Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/))
  - Durable Objects on the free plan must use SQLite storage. Free limits: 100,000 requests per day, 13,000 GB-s per day, 5 GB storage. Incoming WebSocket messages are billed at 20:1. **F, A** ([DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/))
  - The Durable Objects page I fetched today still says storage billing "will be enabled in January 2026". That wording is out of date and current status is unconfirmed. **U**
  - At one user's scale, this should cost $0, with $5 a month as the first paid step. **E, C**
- **Login.**
  - Cloudflare Zero Trust is free for up to 50 users, and the next plan is $7 per user per month. **F, B** (secondary sources agree: [zerotrustcost](https://zerotrustcost.com/cloudflare-zero-trust-pricing), [Cloudflare community](https://community.cloudflare.com/t/what-happens-if-i-exceed-50-users/479340)). Cloudflare's own pricing page didn't show the numbers when fetched.
  - An Access policy can include specific email addresses, so it can be limited to one person. Using "Login method: One-time PIN" on its own lets in anyone who completes a PIN, which is a misconfiguration. **F, A** ([Access policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/))
- **State and secrets.**
  - Worker secrets are encrypted and can't be viewed again in Wrangler or the dashboard after they are set. **F, A** ([Secrets](https://developers.cloudflare.com/workers/configuration/secrets/))
  - State can live in a Durable Object, KV or D1. KV on the free plan allows 1,000 writes per day; D1 allows 100,000 row writes per day and 5 GB. **F, A**
- **Setup and upkeep.** The person needs an Access application and policy, a GitHub App or token stored as a secret, and a deploy pipeline. A token without expiry needs no rotation. **E, C**
- **Failure modes.**
  - When workers.dev is on, version (preview) URLs are public by default. Access must cover them. **F, A** ([Previews](https://developers.cloudflare.com/workers/configuration/previews/))
  - The app's code should check the `Cf-Access-Jwt-Assertion` header. Otherwise it can't confirm that a request really came through Access. **F, A** ([JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/))
  - A webhook endpoint has to bypass Access, so it needs its own signature check. **O, C**

### Option 2: Cloudflare Pages (existing) + Pages Functions + Access, polling only
This is Option 1 without the Durable Object. The page polls a Function, and the Function calls GitHub. It costs $0 with the same limits as above. It is simpler but has no push updates, and every poll counts against the 100,000 requests per day. **E, C**

### Option 3: Static app with no server (the browser holds the token)
- The phone keeps a fine-grained token and calls GitHub directly (this depends on G7, unchecked). It can be hosted on Cloudflare Pages behind Access for $0. **E, C**
- No server-side state is possible. The secret sits on the device, so a lost or compromised phone means revoking the token. **O, C**
- GitHub Pages forbids use as a SaaS or commercial host. **F, A** ([Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)) Whether GitHub Pages works from private repos on each plan was not confirmed. **U**

### Option 4: Vercel (not Cloudflare)
- **Cost.** The Hobby plan is free but only for non-commercial, personal use. It includes 1 million function invocations and 4 active CPU-hours, and runtime logs are kept for 1 hour. If a limit is exceeded, that feature is usually blocked until 30 days have passed. Pro is $20 per developer seat per month. **F, A** ([Vercel Hobby](https://vercel.com/docs/plans/hobby))
- **Login.** "Vercel Authentication" deployment protection is included on Hobby. Password protection costs $20 a month per project on Pro. **F, A**
- **State and secrets.** Vercel Blob storage and environment secrets are available. Long-lived WebSockets are unlikely to work on its functions, so updates would come from polling or bounded server-sent events (functions run up to 300 s on Hobby). **E, C**

### Option 5: Fly.io container (not Cloudflare)
- **Cost.** There is no ongoing free tier. The trial gives 2 machine-hours or 7 days, and a card is required. **F, B** ([Fly free trial](https://fly.io/docs/about/free-trial/), via search summary) The smallest machine (shared-cpu-1x, 256 MB) is about $1.73 a month, and volumes cost $0.15 per GB per month. **F, A** ([Fly pricing](https://docs.fly.io/about/pricing/)) For one user, roughly $2–3 a month. **E, C**
- **Login.** Fly has no built-in single-user login gate. Options are app-level GitHub OAuth with an allow-list of one user, or putting Cloudflare Access / Tunnel in front. **O, C**
- **State.** A process that stays running plus a volume, so WebSockets and webhooks work naturally. **E, C**
- **Upkeep.** Container image updates and the app's own auth code. **O, C**

### Option 6: Render (not Cloudflare)
- The free plan stops a web service after 15 minutes with no traffic. It has 750 instance-hours per month and no persistent disk. **F, A** ([Render free](https://render.com/docs/free)) The result is a cold start every time the phone opens the app. **E, C**
- The price of the first paid step was not retrieved. **U**

### Option 7: Self-managed VPS (e.g. Hetzner) + Cloudflare Tunnel or Tailscale (not Cloudflare-hosted)
- The cost is a few euros a month. I couldn't get exact prices (the page didn't render them). **E, U**
- This option needs the most upkeep: OS patching, backups and TLS. **O, C**

## 3. Summary (opinion, grade C)
- **Lowest cost and least new setup:** Option 1 or 2 on the person's existing Cloudflare account. $0, then $5 a month. Access with one email address is the login.
- **Simplest Cloudflare-free option that does true push updates:** Fly.io at about $2–3 a month, but the person writes or maintains the login themselves.
- **Vercel Hobby:** only suitable if the use really is non-commercial.

## 4. Proposed library entries (for the Source checker)

**Facts**
- F-hosting-01: Cloudflare Workers free plan limits and the $5 paid plan. Grade A. Topics: cloudflare, cost. Shelf life: 6 months.
- F-hosting-02: Durable Objects SQLite free limits; storage-billing status unconfirmed. Grade A/U. Topics: cloudflare, cost. Shelf life: 3 months.
- F-auth-01: Zero Trust free up to 50 users, then $7 per user. Grade B; needs a Cloudflare primary source. Topics: authentication, cloudflare, cost. Shelf life: 6 months.
- F-auth-02: Access policies by email address; OTP on its own is a misconfiguration; check the JWT at the app. Grade A. Topics: authentication, cloudflare. Shelf life: 12 months.
- F-auth-03: Version URLs on workers.dev are public unless Access covers them. Grade A. Topics: authentication, cloudflare. Shelf life: 12 months.
- F-gh-01: GitHub rate limits (5,000 per hour; 80 per minute and 500 per hour for content). Grade A. Topics: hosting. Shelf life: 12 months.
- F-gh-02: Installation tokens last 1 hour; fine-grained token expiry rules. Grade A/B. Topics: authentication. Shelf life: 12 months.
- F-hosting-03: Vercel Hobby is non-commercial only, with the listed limits; Pro is $20 per seat. Grade A. Topics: hosting, cost. Shelf life: 6 months.
- F-hosting-04: Fly.io has no free tier; smallest machine is about $1.73 a month. Grade A/B. Topics: hosting, cost. Shelf life: 6 months.
- F-hosting-05: Render free plan stops services after 15 minutes idle and has no disk. Grade A. Topics: hosting, cost. Shelf life: 6 months.

**Pattern**
- P-auth-01: "Single-user gate at the edge": an Access policy with one email address, the app checking `Cf-Access-Jwt-Assertion`, Access covering every hostname including previews, and webhook paths excluded from Access but checked by signature. Grade C (my synthesis). Topics: authentication, cloudflare. Shelf life: 12 months.

---

## Six-part contract

1. **What I changed:** No files; I have no write tool. The memo above is my output, for the Orchestrator to record word for word in research/.
2. **Why:** Q-001 asks for a depth-3 graded memo comparing hosting options, with at least one Cloudflare option and at least one without Cloudflare.
3. **What I verified:**
   - I read `research/Q-001.md` and `BRIEF.md`.
   - I fetched vendor docs (Cloudflare Workers, Durable Objects, Pages Functions, Access, Secrets, Previews; GitHub rate limits and App tokens; Vercel Hobby; Fly pricing; Render free) and ran searches for Zero Trust pricing, Fly's trial and fine-grained token expiry.
   - Three pages gave no usable numbers: Cloudflare's own pricing page, Render's pricing page and Hetzner's prices.
   - No code was run, because my role doesn't allow it.
4. **What is undone:**
   - G6, G7 and the current Durable Objects storage-billing status are unchecked.
   - Render's paid price, Hetzner's prices, the Access session-length options and whether GitHub Pages works from private repos are also missing.
   - No library entries sharing these topics were in the folder, so I couldn't cross-check against existing entries.
5. **Needed outside my lane:**
   - The Source checker (a different model, per D-056) should check every fact entry, especially the B and U items.
   - The folder also contains files unrelated to this question: `.env*` (eight files), npm/yarn/pnpm/bun config files and lockfiles, and `.gitmodules`. I didn't open any of them. Under D-006 they probably shouldn't be in a researcher's context pack, so whoever maintains PACKS.toml should check this.
6. **Open questions** (added; I'm not closing any):
   - Does "commercial" use apply to this project? This decides whether Vercel Hobby is allowed.
   - Are the repos personal or owned by an organization? This affects G4: an organization's 366-day token limit would mean yearly rotation.
   - Is true push (webhooks) needed, or is polling every 30–60 seconds enough? This decides whether a Durable Object or an always-running server is needed.
