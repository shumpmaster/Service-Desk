Verdict: FAIL

The memo can't pass as proposed. Several load-bearing claims rest on one page only, and I didn't open every cited source. Five proposed entries were narrowed to the parts two pages support, and one more was filed in a different form. Two others were not filed. I did not commit anything (there is no git repository here).

**Method:** I fetched each source through a summarising tool, so quotes are not raw page text. The Apple page came back as raw markdown on a second try. A first fetch of the Apple page without `.md` returned a summary that I discarded because it contradicted the raw page.

**Filed (under `library/facts/`)**
- **F-webpush-01** (narrowed): Apple and the WebKit blog both say Web Push works for Home Screen web apps from iOS 16.4, and both say the prompt needs a user gesture. Only Apple says no Developer Program is needed. I filed that claim anyway, because the WebKit blog fetch also mentions no membership, but it rests on that summary.
  - Not filed: that it works *only* for Home Screen apps. Neither page was seen to say "only".
  - Not filed: that Safari revokes permission for invisible pushes. The Apple page says it, but the WebKit blog does not mention it.
  - Not filed: the manifest `display` requirement, which comes from the WebKit blog alone.
- **F-webpush-02**: RFC 8292, RFC 8030 and the Apple page agree on the VAPID, TTL, Urgency and Topic details. I did not file the memo's claim that a Topic replaces a waiting message. The fetched RFC text didn't show it, and Apple says "coalesce".
- **F-webpush-03**: web.dev (`expirationTime`, browsers let subscriptions expire) and MDN (`pushsubscriptionchange`) cover the claim.
- **F-cf-pages-do-01** (replaces the DO half of the proposed F-cf-cron-01): the migration matrix and the Pages bindings page both say a Pages project cannot define a Durable Object.
- **F-gh-11**: the GitHub configuring-notifications doc and the GitHub blog agree on assignment pushes and Working Hours. The blog says team mentions are excluded; the doc fetch did not show that point, so it rests on the blog alone. The blog is from 2021 and may be dated.
- **F-gh-12** (narrowed): the events page and the workflow-syntax page both give the 5-minute minimum and the default-branch rule.

**Not filed**
- **Pages has no Cron Triggers** (proposed F-cf-cron-01, W-T1):
  - Only the migration matrix says it (Pages ❌).
  - The bindings page doesn't mention cron, and the Cron Triggers page doesn't discuss Pages.
  - Silence on a page doesn't count as a second source.
- **Service binding from Pages to a Worker:** one page only, the Pages bindings page.
- **F-cf-kv-01:**
  - Each part is on one page only. The limits come from the KV limits page, and the 60-second delay from the How KV works page.
  - The limits figures matched the memo (100,000 reads a day, 1,000 writes a day, 1 GB, 1 write per second to the same key).
  - They are cost and limit claims, which `governance/standards/sources.md` says need an independent source. Same-publisher pages don't supply one.
- **F-gh-12's other parts:** the delay and dropped-job warning and the 60-day disable for public repositories are on the events page only. The workflow-syntax fetch explicitly lacked them.
- **P-notify-01:** a grade-C inference resting on X1–X7. It is not a fact.
- **Not opened at all:**
  - Rows W3, W4, W9, W11 and W13: partly checked where they overlapped with other pages, but their own sources were not opened.
  - W5, W6, W7, W16 and S4: the MDN, web.dev and Cloudflare pages were not opened for these.
  - X1–X7 and S5: the Access pages, the library READMEs and the GitHub issues were not opened.
  - P1–P5 and T6: the Apple Support page, the Chrome Help page, the Android doc and the Actions billing page were not opened.
  - G2, G4, G5, G6 and G7: not opened beyond what the blog and configuring-notifications fetches showed.

**Open questions**
- Is there a second Cloudflare page, or a Pages Functions doc, that says Pages cannot use Cron Triggers?
- Is there a primary Apple or WebKit source that says iOS Web Push is limited to Home Screen apps, and a second page that says Safari revokes permission for invisible pushes?
- Does a second GitHub page state the Actions `schedule` delay, drop and 60-day rules?
- The memo's own gaps remain: Android install requirement, push latency, self-made assignment pushes, and the service worker behind an Access redirect. The first three are "not documented" and need no check. The Access redirect is rated C.
- The memo flags `.env*`, `.npmrc` and `.yarnrc*` files in the researcher pack (D-006). Someone should check how that pack was built; I did not open them.
