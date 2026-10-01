I've revised the memo below. All four items the source check failed are fixed or withdrawn, and it is ready for the Orchestrator to record verbatim. One correction is my own: my last memo said the source checker had confirmed a Fly machine price of $1.73/month. Nothing in this folder supports that, and the source check says so. I've withdrawn the figure.

## 1. What I changed

- **Fly machine price ($1.73/month, finding 1):** withdrawn. I also removed my wrong claim that the source checker had confirmed it. Option 4 now says the compute price is unknown and gives no number.
- **GitHub Pages (finding 2):**
  - Dropped "it cannot hold secrets" as a fact.
  - Proposed a new entry, F-gh-04, built from verbatim quotes on two GitHub pages.
  - Moved Pages from "Ruled out" to "Poor fit". It is allowed for non-commercial use, so the source does not rule it out.
  - The point about secrets is now my own inference, marked [O, C].
- **Durable Objects 20:1 WebSocket ratio:** removed my wording that it is "a Paid-plan billing rule only, not a free-plan limit". The memo now matches the narrowed F-hosting-02c.
- **Render Starter price (finding 3):** kept as an estimate. I still haven't opened a page that shows the price.
- **Filed entries:** the memo now cites the library IDs that were filed, and doesn't re-propose them. The only new entry is F-gh-04.

## 2. Why

- **Fly price:** I couldn't reproduce the $1.73 figure, and the source checker couldn't find it in the raw page. Saying the checker had confirmed it was untrue.
- **GitHub Pages:** the page supports the commercial-use ban but says nothing about holding secrets.
- **20:1 ratio:** the source checker found that the plan-scope wording was mine, not the page's.

## 3. What I verified

I have no shell, so I ran no commands. I used WebFetch and WebSearch on 2026-10-01. WebFetch answers through a summarising model, so every quote below needs re-opening.

- **docs.fly.io/about/pricing/:**
  - The summary gave $0.00608400/hour and $158.40/month for shared-cpu-1x 256 MB. These don't agree: $0.006084 × 730 hours is about $4.44. The figures are unreliable and I used neither.
  - It did confirm "Each 1GB of rootfs for a Machine stopped for 30 days is $0.15."
- **docs.github.com GitHub Pages limits page:**
  - Confirmed: "GitHub Pages is not intended for or allowed to be used as a free web-hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions or providing commercial software as a service (SaaS)."
  - Confirmed: "GitHub Pages sites shouldn't be used for sensitive transactions like sending passwords or credit card numbers."
- **docs.github.com "Creating a GitHub Pages site":**
  - Confirmed: "GitHub Pages sites are publicly available on the internet, even if the repository for the site is private".
  - Confirmed: "If the account that owns the repository uses GitHub Free or GitHub Free for organizations, the repository must be public."
  - A search summary also mentioned private publishing on GitHub Enterprise Cloud, but the opened page didn't show it. I left it out.
- **render.com/pricing:** no prices came back.
- **render.com/docs/compute-plans:** "no price shown"; it points to the pricing page. The $7 figure comes only from a search summary.

## 4. What is undone

- The Fly machine price, which needs someone to read the raw page or the price calculator.
- The Render Starter price from an opened page.
- Whether Durable Objects storage billing is actually live now.
- The per-object Durable Objects storage limit on the Free plan.
- Whether paid GitHub plans can keep a Pages site private. That would need a sourced entry.
- The Fly card-requirement conflict, which is still unresolved.

## 5. Needed outside my lane

- **Source checker:** re-open the two GitHub pages behind F-gh-04, and try the raw HTML of the Fly and Render pricing pages. You can fetch raw HTML; my tools can't.
- **Someone with Cloudflare dashboard access:** check whether Durable Objects storage billing is live.
- **Orchestrator:** record the memo below verbatim.

## 6. Open questions

- Is the Service Desk commercial or personal use? That decides whether Vercel Hobby and GitHub Pages are allowed.
- Are the repos personal or owned by an organisation? Organisations default to tokens that expire after 366 days (F-gh-02).
- Is polling every 10–30 seconds acceptable, or must updates be pushed? That decides whether Durable Objects or webhooks are needed.
- Should cost facts need two independent sources before they are filed? That is for the owner to decide.

---

# Memo — Q-001 (revised 2026-10-01, round 3)

Grades: A = primary vendor doc opened; B = vendor doc with a caveat, or secondary sources that agree; C = inference or opinion. Each statement is tagged **[F]** fact, **[E]** estimate or **[O]** opinion. Filed facts are cited by library ID.

## Shared facts

- [F, A] GitHub allows 5,000 requests/hour, and 80/minute and 500/hour for content-creating requests. A 304 response to a conditional request does not count against the limit. See F-gh-01.
- [F, A] GitHub App installation tokens last 1 hour. Fine-grained tokens can have no expiry for personal projects; admins can enforce 1–366 days, and organisations default to 366. See F-gh-02.
- [F, A] The GitHub REST API supports CORS from any origin. See F-gh-03.
- [O, C] One person polling every 10–30 s with conditional requests stays well inside these limits. Small file writes stay far below 80/minute.

## Option 1: Cloudflare Workers with static assets, Access, and optionally Durable Objects

- **Cost:**
  - [F, A] Workers Free plan: 100k requests/day and 10 ms CPU per invocation. Paid plan: $5/month. Static asset requests are free. See F-hosting-01.
  - [F, A] Durable Objects are available on the Free plan with the SQLite backend only, 5 GB per account. See F-hosting-02a.
  - [F, A] Durable Objects storage billing was announced for 7 January 2026 at the earliest, and Free-plan users are not charged. Whether billing is live now is unconfirmed. See F-hosting-02b.
  - [F, A] For compute-request billing, incoming WebSocket messages count at a 20:1 ratio. Free plan: 100,000 requests and 13,000 GB-s per day. Paid plan includes 1M requests and 400,000 GB-s per month. See F-hosting-02c.
- **Login:**
  - [F, A] Access policies can name single email addresses. A policy that only requires a One-time PIN lets anyone in. See F-auth-02.
  - [F, A] Access is free for up to 50 users. Pay-as-you-go is $7 per user/month, billed annually. See F-auth-01.
  - [F, A] Cloudflare advises validating the Access JWT, to ensure the request came from Access. See F-auth-04.
  - [F, A] When workers.dev is enabled, Version URLs are public unless Access covers them. See F-auth-03.
  - [O, C] Pattern P-auth-01 (filed) sets out the single-user setup.
- **Upkeep:** [O, C] Rotate the GitHub token, or use a GitHub App so tokens are minted automatically. Keep the Access policy tight. Cover workers.dev and preview URLs with Access.

## Option 2: Cloudflare Pages static app, with the browser calling GitHub directly

- [F, A] The browser can call GitHub directly because of CORS. See F-gh-03.
- [O, C] The token would live on the phone and there would be no server-side state, so losing the device exposes the token. This is only acceptable with a fine-grained token limited to the named repos.

## Option 3: Vercel

- [F, A] Hobby is free but for non-commercial personal use only. Pro is $20 per seat; Password Protection adds $20/month per project. Vercel Authentication is available on Hobby. See F-hosting-03.

## Option 4: Fly.io

- [F, A] The trial is 2 machine-hours or 7 days, whichever comes first. Adding a card ends the trial. See F-hosting-04a.
- [F, B] The sources conflict: the trial page lets you start without a card, but the pricing page says all organisations "require a credit card on file". See F-hosting-04b.
- [F, B] Volumes cost $0.15/GB per month. See F-hosting-04b.
- The machine compute price is unknown. I have not read it from an opened page, and no figure is given.
- [E, C] The trial page describes no lasting free tier, so I infer there is none.

## Option 5: Render

- [F, A] The free service spins down after 15 minutes idle, with 750 hours/month and no persistent disk. See F-hosting-05.
- [E, C] The Starter plan (0.5 CPU, 512 MB) is about $7/month. This comes from a search summary only and is unconfirmed.
- [O, C] Waking from sleep on each phone visit is a poor fit.

## Option 6: Hetzner VPS (not Cloudflare, fully self-run)

- [F, A] The CX23 server costs €5.49/month or $6.49/month, excluding VAT and IPv4, for orders from 15 June 2026. See F-hosting-06.
- [O, C] You run the OS, TLS, patches and login yourself, so this option has the most upkeep.

## Poor fit: GitHub Pages

- [F, A] Pages is not allowed as free hosting for an online business or for commercial SaaS. It "shouldn't be used for sensitive transactions like sending passwords". See F-gh-04 (proposed).
- [F, A] Pages sites are publicly available even when the repository is private. See F-gh-04 (proposed).
- [O, C] Pages serves static files publicly with no login layer of its own. Any token would have to sit in the browser, as in Option 2, but without Access in front.

## Proposed library entry

```
id: F-gh-04 | form: fact | grade: A | topics: hosting, authentication | shelf-life: 12 months
claim: GitHub Pages "is not intended for or allowed to be used as a free web-hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions or providing commercial software as a service (SaaS)"; Pages sites "shouldn't be used for sensitive transactions like sending passwords or credit card numbers"; "GitHub Pages sites are publicly available on the internet, even if the repository for the site is private". NOT claimed: anything about holding secrets, or private publishing on Enterprise plans (unverified).
sources: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits ; https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
```

Withdrawn: the Fly machine price ($1.73/month).

Sources:
- [DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- [DO billing changelog](https://developers.cloudflare.com/changelog/2025-12-12-durable-objects-sqlite-storage-billing/)
- [Cloudflare Access](https://www.cloudflare.com/sase/products/access/)
- [Validating JWT](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Fly trial](https://docs.fly.io/about/free-trial/)
- [Fly pricing](https://docs.fly.io/about/pricing/)
- [GitHub CORS](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Hetzner price adjustment](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/)
- [Render compute plans](https://render.com/docs/compute-plans)
- [Render pricing](https://render.com/pricing) (no prices returned)
