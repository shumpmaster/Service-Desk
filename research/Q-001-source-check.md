Verdict: FAIL

Seven entries were confirmed and filed, but four proposed entries could not be filed. Four claims in the memo were not confirmed, so the memo as a whole fails.

**Filed (confirmed against the source I opened)**

I filed these in `library/`. I filed F-auth-02 in narrowed form, as noted under "Not confirmed". Each of these has one primary vendor source, not two.

| Entry | Memo line | What I confirmed |
|---|---|---|
| F-hosting-01 | 28–29 | Workers free plan is 100,000 requests/day and 10 ms CPU. The paid plan is $5/month with 10M requests and 30M CPU-ms. Static assets are free, and Pages Functions count against Workers. |
| F-auth-02 (narrowed) | 35 | Access policies take email addresses. A One-time-PIN-only policy lets anyone in. |
| F-auth-03 | 41 | Version URLs are on by default when workers.dev is enabled, and they are public unless Access covers them. |
| F-gh-01 | 15–16, 20 | 5,000 requests/hour. Content-creating requests are limited to 80/minute and 500/hour. Writes cost 5 points against 900 points/minute. |
| F-gh-02 | 17–18 | Installation tokens last 1 hour and are minted from a JWT. Fine-grained tokens can have no expiry. Admins can set 1–366 days, and the organization default is 366 days. |
| F-hosting-03 | 54–55 | Vercel Hobby limits, the non-commercial restriction, Pro at $20 per seat, and password protection at $20/month. |
| F-hosting-05 | 65 | Render free services stop after 15 minutes idle, with 750 instance-hours and no disk. |

I also confirmed two further claims, but they are not in a filed entry:
- **G6 (line 20):** the best-practices page says a 304 response to a conditional request does not count against the primary limit. I added that to F-gh-01.
- **GitHub Pages (line 51):** the limits page forbids use as a free host for SaaS or commercial sites.

**Not confirmed, kept out**

- **F-hosting-02 (lines 30–31):**
  - The DO pricing page still says storage billing starts on 7 January 2026 (no earlier). I could not tell whether it is now billing.
  - The page does not say that free-plan Durable Objects must use SQLite.
  - It applies the 20:1 WebSocket ratio to the paid plan, but the memo presents it as a free-plan limit.
- **F-auth-01 (line 34):**
  - I opened zerotrustcost.com, which confirms 50 users free and $7 per user. The community thread returned 403 for me, and cloudflare.com/pricing could not be opened either.
  - A web search returned several secondary pages agreeing on the figures, but I did not open them.
  - So there is one opened secondary source, not two independent ones.
- **F-auth-02, JWT part (line 42):** the page only recommends validating the `Cf-Access-Jwt-Assertion` header instead of the `CF_Authorization` cookie. It does not say that without the check "it can't confirm a request came through Access". I filed only the email and OTP parts.
- **F-hosting-04 (line 59):**
  - The trial is 2 machine-hours or 7 days. The page says a card can be added at any time and that adding one ends the trial.
  - That contradicts the memo's "a card is required".
  - The $1.73/month and $0.15/GB figures match docs.fly.io.
  - The "no free tier" claim is not stated by the page, which says nothing about a free tier either way.
- **G7 (line 21, CORS):** I did not check it, and Option 3 depends on it.
- **Render and Hetzner paid prices (lines 66, 69):** not retrieved, so they are not facts.
- **P-auth-01 (line 92):** not filed. It is the Researcher's synthesis and is graded C, so there is nothing to confirm in a source. It also includes the JWT claim I could not confirm.

**Open questions**

- Is one primary vendor document enough for load-bearing cost facts, or do you want a second independent source before filing? I filed on the primary document alone and marked the grade.
- Can someone re-check the Durable Objects storage-billing status? It needs the Cloudflare changelog or a dashboard check.
- The memo's open questions are still open: commercial use, personal or organization repos, and whether push updates are needed.
