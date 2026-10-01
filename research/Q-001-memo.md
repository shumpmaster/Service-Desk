# Q-001 revision: researcher return

The revised memo below is ready to record. All four rejected entries are now fixed or withdrawn. One snag: the original memo is not in this folder (research/Q-001.md holds only the question), so I rebuilt the memo around the seven filed entries rather than editing it line by line. Line numbers will not match the old memo.

## 1. What I changed

- **F-hosting-02 (Durable Objects):** split into three narrower claims and corrected two errors:
  - The 20:1 WebSocket ratio is now stated as paid-plan billing only, not a free-plan limit.
  - "Storage billing is live" is now "announced for 7 January 2026 or later; Free plan not charged". Whether billing actually started is still unconfirmed.
  - "Free plan is SQLite only" is now sourced to the limits page, not the pricing page.
- **F-auth-01 (Access pricing):** the primary source is now Cloudflare's own Access product page, replacing the community thread. One opened secondary source backs it up.
- **F-auth-02, JWT part:** re-proposed with a verbatim sentence from Cloudflare's JWT validation page, which is a different page from the one the source checker opened.
- **F-hosting-04 (Fly.io):**
  - Withdrew "a card is required", because two Fly pages contradict each other. Both are reported.
  - "No free tier" is now an inference from absence, graded C.
- **G7 (GitHub CORS):** sourced and proposed as F-gh-03.
- **Render paid price:** kept as an estimate only. I never opened a page showing the price.
- **Hetzner price:** sourced as F-hosting-06. The price excludes VAT and IPv4.
- **P-auth-01:** now explicitly a pattern (graded opinion) that rests on named facts, rather than something to be checked like a fact.

## 2. Why

The source check failed these items because the sources did not say what was claimed. In one case (the 20:1 ratio) my memo said something the source did not.

## 3. What I verified

I have no shell. I used WebFetch and WebSearch only, all on 2026-10-01. WebFetch answers through a summarising model, so the quotes below should be re-opened rather than trusted word for word.

- **DO pricing page** (last updated 30 Sep 2026):
  - The Free plan is SQLite-only.
  - Storage billing "will be enabled in January 2026, with a target date of January 7, 2026 (no earlier)".
  - The 20:1 ratio applies to compute billing for incoming WebSocket messages.
  - Free plan: 100,000 requests and 13,000 GB-s per day.
  - Paid plan: 1M requests and 400,000 GB-s per month.
- **DO limits page:** the Free plan is SQLite-only with 5 GB of storage per account. Two fetches gave different per-object limits (1 GB vs 10 GB), so I left that figure out.
- **DO changelog (12 Dec 2025):** "Developers on the Workers Free plan will not be charged". The DO release notes for 2026 have no entry saying billing went live.
- **cloudflare.com/sase/products/access/:** Free is "$0 forever" with a 50-user limit. Pay-as-you-go is "$7 per user/month (paid annually)". costbench.com (verified 22 Aug 2026) agrees.
- **Cloudflare JWT validation page:** "You should validate the token with your public key to ensure that the request came from Access and not a malicious third party."
- **docs.fly.io/about/free-trial/:**
  - The trial is "2 hours of machine runtime or 7 days of access, whichever comes first".
  - "Adding a card ends the free trial."
  - No card is needed to start the trial.
  - It does not mention a lasting free tier.
- **docs.fly.io/about/pricing/:**
  - "All organizations (except for Linked Organizations) require a credit card on file."
  - Volumes cost $0.15/GB per month.
  - The machine price table is rendered by script, so I could not read the $1.73 figure myself.
- **GitHub CORS doc:** "The REST API supports cross-origin resource sharing (CORS) for AJAX requests from any origin."
- **Hetzner price-adjustment doc:**
  - CX23 is €5.49/month or $6.49/month, excluding IPv4 and VAT.
  - Prices changed on 15 June 2026 for new orders and rescales.
- **Render compute-plans doc:** Starter is 0.5 CPU and 512 MB, but the price is not on that page. The $7/month figure comes only from a search summary.
- **Failed fetches:**
  - cloudflare.com/plans/zero-trust-services: no prices on the page.
  - render.com/pricing: content not returned.
  - hetzner.com/cloud: prices shown as placeholders.
  - render.com/docs/instance-types: 404.

## 4. What is undone

- Whether DO storage billing is actually live on paid accounts.
- The per-object DO storage limit on the Free plan.
- Render's Starter price from an opened page.
- The Fly machine price, which I could not reproduce myself.
- Whether Workers secrets are a good place for the GitHub token. This is not sourced this round, so it is marked as an opinion.

## 5. Needed outside my lane

- **Source checker:** re-open the new sources, especially the Fly contradiction and the DO limits page.
- **Someone with dashboard access** (not me): check the DO storage-billing line on an account.
- **Orchestrator:** record the memo below verbatim in research/. The previous memo text was not in my pack.

## 6. Open questions

- Commercial or personal use? Vercel Hobby and GitHub Pages depend on it.
- Personal or organisation repos? This sets token expiry: organisations default to 366 days (F-gh-02).
- Is polling every few seconds acceptable, or must updates be pushed? This decides whether Durable Objects or webhooks are needed.
- Should two independent sources be required before filing cost facts? The source checker asked this; it is for the owner.

---

# Memo — Q-001 (revised 2026-10-01, round 2)

Grades: A = primary vendor doc opened; B = vendor doc with a caveat, or secondary sources that agree; C = inference or opinion. Each statement is tagged **[F]** fact, **[E]** estimate or **[O]** opinion. Facts already filed are cited by ID.

## Shared facts

- [F, A] GitHub limits (5,000 requests/hour; content-creating requests 80/minute and 500/hour). A 304 response to a conditional request does not count against the limit. See F-gh-01.
- [F, A] App installation tokens last 1 hour. Fine-grained tokens can have no expiry, or 1–366 days if set by an admin. See F-gh-02.
- [F, A] The GitHub REST API supports CORS from any origin. See F-gh-03 (proposed).
- [O, C] One person polling every 10–30 s with conditional requests stays well inside the limits. Small file writes stay far below 80/minute.

## Option 1: Cloudflare Workers with static assets, Access, and optionally Durable Objects

- **Cost:**
  - [F, A] Free plan: 100k requests/day and 10 ms CPU. Paid plan: $5/month. See F-hosting-01.
  - [F, A] Durable Objects are on the Free plan with the SQLite backend only, 5 GB per account. See F-hosting-02a.
  - [F, A] DO storage billing was announced for 7 January 2026 or later, and Free-plan users are not charged. Whether billing is live now is unconfirmed. See F-hosting-02b.
  - [F, A] The 20:1 WebSocket ratio is a paid-plan billing rule only. See F-hosting-02c.
- **Login:**
  - [F, A] Access policies can name single email addresses. A One-time-PIN-only policy lets anyone in. See F-auth-02.
  - [F, A] Access is free for up to 50 users; pay-as-you-go is $7/user/month, billed annually. See F-auth-01.
  - [F, A] The app should validate the Access JWT, so it knows the request came through Access. See F-auth-04.
  - [F, A] Version URLs are public unless Access covers them. See F-auth-03.
- **Upkeep:** [O, C] Rotate the GitHub token, or use an App so tokens are minted automatically. Keep the Access policy tight. Cover workers.dev and preview URLs with Access.

## Option 2: Cloudflare Pages static app, with the browser calling GitHub directly

- [F, A] This works because of CORS (F-gh-03).
- [O, C] The token would live on the phone, there is no server-side state, and losing the device exposes the token. Only acceptable with a fine-grained token limited to the named repos.

## Option 3: Vercel

- [F, A] Hobby is free but for non-commercial use only. Pro is $20/seat; Password Protection adds $20/month. See F-hosting-03.

## Option 4: Fly.io

- [F, A] The trial is 2 machine-hours or 7 days, whichever comes first. Adding a card ends the trial. See F-hosting-04a.
- [F, B] The sources conflict: the trial page lets you start without a card, but the pricing page says "all organizations … require a credit card on file". See F-hosting-04b.
- [F, A] Volumes cost $0.15/GB per month. [F, B] Smallest machine: $1.73/month (confirmed by the source checker, not reproduced by me).
- [E, C] The trial page names no lasting free tier, so I infer there is none.

## Option 5: Render

- [F, A] The free service stops after 15 minutes idle, with 750 hours/month and no disk. See F-hosting-05.
- [E, C] Starter (0.5 CPU, 512 MB) is about $7/month. This comes from a search summary only and is unconfirmed.
- [O, C] Waking from sleep on each phone visit is a poor fit.

## Option 6: Hetzner VPS (not Cloudflare, fully self-run)

- [F, A] CX23 is €5.49/month or $6.49/month, excluding VAT and IPv4, from 15 June 2026. See F-hosting-06.
- [O, C] You run the OS, TLS, patches and login yourself, so this has the highest upkeep.

## Ruled out

- [F, A] GitHub Pages: its terms forbid use as a free host for SaaS or commercial sites (confirmed by the source checker). It cannot hold secrets.

## Proposed library entries

```
id: F-hosting-02a | form: fact | grade: A | topics: cloudflare, hosting, cost | shelf-life: 6 months
claim: Durable Objects are available on Workers Free, SQLite storage backend only; Free accounts are limited to 5 GB total DO storage.
sources: https://developers.cloudflare.com/durable-objects/platform/limits/ ; https://developers.cloudflare.com/durable-objects/platform/pricing/ (last updated 2026-09-30)

id: F-hosting-02b | form: fact | grade: A (announcement), status unconfirmed | topics: cloudflare, cost | shelf-life: 3 months
claim: SQLite-backed DO storage billing was announced (2025-12-12) for January 2026, target 7 January 2026 "no earlier"; Workers Free users are not charged. Whether billing is live is not confirmed.
sources: https://developers.cloudflare.com/changelog/2025-12-12-durable-objects-sqlite-storage-billing/ ; DO pricing page

id: F-hosting-02c | form: fact | grade: A | topics: cloudflare, cost | shelf-life: 6 months
claim: For compute-request billing only, incoming WebSocket messages count at a 20:1 ratio (a Paid-plan billing rule, not a free-plan limit). Free: 100,000 DO requests and 13,000 GB-s per day; Paid includes 1M requests and 400,000 GB-s per month.
sources: https://developers.cloudflare.com/durable-objects/platform/pricing/

id: F-auth-01 | form: fact | grade: A (vendor page) + B (secondary agrees) | topics: authentication, cloudflare, cost | shelf-life: 6 months
claim: Cloudflare Access/Zero Trust Free plan is $0 with a 50-user limit; Pay-as-you-go is $7 per user/month paid annually.
sources: https://www.cloudflare.com/sase/products/access/ ; https://costbench.com/software/business-vpn/cloudflare-zero-trust/free-plan/ (verified 2026-08-22)

id: F-auth-04 | form: fact | grade: A | topics: authentication, cloudflare | shelf-life: 12 months
claim: Cloudflare advises validating the Access JWT (Cf-Access-Jwt-Assertion) with the team public key "to ensure that the request came from Access and not a malicious third party."
sources: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/

id: F-hosting-04a | form: fact | grade: A | topics: hosting, cost | shelf-life: 6 months
claim: Fly.io trial = 2 hours machine runtime or 7 days, whichever first; apps stop when it runs out; adding a card ends the trial and billing starts. No lasting free tier is described.
sources: https://docs.fly.io/about/free-trial/

id: F-hosting-04b | form: fact (conflict) | grade: B | topics: hosting, cost | shelf-life: 6 months
claim: Fly.io pricing page: "All organizations (except for Linked Organizations) require a credit card on file"; this conflicts with the trial page allowing card-free start. Volumes $0.15/GB-month.
sources: https://docs.fly.io/about/pricing/ ; https://docs.fly.io/about/free-trial/

id: F-gh-03 | form: fact | grade: A | topics: hosting | shelf-life: 12 months
claim: The GitHub REST API supports CORS for AJAX requests from any origin.
sources: https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests

id: F-hosting-06 | form: fact | grade: A | topics: hosting, cost | shelf-life: 6 months
claim: Hetzner Cloud CX23 (DE/FI) €5.49/month ($6.49), excluding IPv4 and VAT, for new orders and rescales from 15 June 2026 (was €3.99).
sources: https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/

id: P-auth-01 | form: pattern | grade: C (opinion; synthesis) | topics: authentication, cloudflare | shelf-life: 12 months
pattern: Single-user Cloudflare app: Access policy Include > Emails = the one address (never Login Methods alone); cover workers.dev and preview URLs; validate the Access JWT in the Worker; hold the GitHub credential server-side (App with 1-hour installation tokens preferred over a long-lived PAT).
rests on: F-auth-02, F-auth-03, F-auth-04, F-gh-02
```

Sources:
- [DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- [DO billing changelog](https://developers.cloudflare.com/changelog/2025-12-12-durable-objects-sqlite-storage-billing/)
- [DO release notes](https://developers.cloudflare.com/durable-objects/release-notes/)
- [Cloudflare Access](https://www.cloudflare.com/sase/products/access/)
- [CostBench](https://costbench.com/software/business-vpn/cloudflare-zero-trust/free-plan/)
- [Validating JWT](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Fly trial](https://docs.fly.io/about/free-trial/)
- [Fly pricing](https://docs.fly.io/about/pricing/)
- [GitHub CORS](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests)
- [Hetzner price adjustment](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/)
- [Render compute plans](https://render.com/docs/compute-plans)
