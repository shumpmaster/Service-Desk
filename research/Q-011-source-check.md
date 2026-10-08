Verdict: FAIL

I opened the sources for the revised rows and filed six entries that passed. The memo as a whole still can't pass. Some claims are on one page only, and I couldn't open the older rows at all. I made no commits because there is no git repository here.

**Filed** (all under `library/facts/`, dated 2026-10-08)
- **F-webpush-01b** passes (Home Screen web apps on iOS 16.4+). I read three pages:
  - The Apple doc says "Add web push to Home Screen web apps in iOS 16.4 or later".
  - The WebKit post says "adding support for Web Push to Home Screen web apps".
  - MDN's PushManager.json says "Notifications are supported in web apps saved to the home screen."
  - It is a new entry, because I may not edit F-webpush-01.
- **F-webpush-04** passes (Safari revokes permission for invisible pushes).
  - Apple says "Safari revokes the push notification permission for your site".
  - WebKit "Meet Web Push" says "Violations of the `userVisibleOnly` promise will result in a push subscription being revoked."
  - The WebKit post is about macOS Safari 16, so for iOS specifically only the Apple page supports it. I noted that in the entry.
- **F-cf-cron-01** passes (Pages has no Cron Triggers). The migration matrix shows Pages ❌ for Cron Triggers. The Builder Day post of 2024-09-26 says "not yet supported in Pages, including … Cron Triggers". The post is two years old, so this may have changed.
- **F-cf-pages-svc-01** passes (a Pages Function can call a Worker through a service binding). The bindings page says "Service bindings enable you to call a Worker from within your Pages Function." The matrix shows Service bindings ✅ for both Workers and Pages.
- **F-cf-kv-01** passes in part. It covers 100,000 reads a day, 1,000 writes a day, 1 GB, 1 write per second to the same key, and the 60-second visibility delay.
  - Each figure appears on two Cloudflare pages: limits, pricing, write-key-value-pairs and how-KV-works.
  - **Ruling you asked for:** `governance/standards/sources.md` lets two pages from the same vendor count as two sources for limits and behaviour. Only cost, risk and quality claims need an independent source. These are quotas, not prices, so they qualify. I filed no dollar-cost claim.
  - The 3-month shelf life is my choice.
- **F-gh-12b** passes (schedule delay and dropped jobs, plus the 60-day disable in public repositories). The events page and the troubleshoot-workflows page both give the delay and the dropped jobs. The events page and the disable-and-enable page both give the 60-day rule.

**Not filed**
- **Topic replaces a waiting message (F-webpush-02 amendment):** RFC 8030 §5.4 says "A push message with a topic replaces any outstanding push message with an identical topic." Apple says only "coalesce", so I count that as one page. The 32-character limit is already in F-webpush-02.
- **KV Free deletes and lists (1,000 each a day):** only the pricing page shows these. The limits-page fetch didn't itemise them.
- **W1a, that Safari tabs cannot use Web Push:** no primary page says it. The memo grades it C.
- **W3, the manifest `display` requirement:** the WebKit post is the only source.
- **P2 (per-app notification settings, Focus):** not proposed for filing. The WebKit post confirms it; the Apple badging point is thinner.

**Why FAIL**
- The memo says it replaces only the revised rows. The earlier version of `research/Q-011-memo.md` was overwritten, so I can't open the unchanged rows. These are W4, W6, W7, W11, W13, W16, S4, S5, X1–X7, P1, P3–P5, T6 and G2–G7.
- W1a, W3, the Topic replacement and the KV deletes/lists remain on one page or none.

**Open questions**
- Does any primary Apple or WebKit page say iOS Safari tabs cannot subscribe to push (Q-d)?
- Has Cloudflare added Cron Triggers to Pages since September 2024 (Q-e)?
- The memo's `.env*` / `.npmrc` flag: this pack has no such files, so I couldn't check it. The Orchestrator should confirm how the pack was built.
- T3 and T6 are not covered here: the memo doesn't state them, and I haven't opened them.
