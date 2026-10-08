I've written the Q-011 memo below. It covers every part of the question, but many facts rest on one page only, and none of it has been through the Source checker yet. I hold no write tool, so the memo is returned here for the Orchestrator to record in `research/`.

---

# Q-011 memo: phone notifications for a closed, single-user Pages + Access page

**Researcher, 2026-10-08. Depth 3. Topics: notifications, web-push, cloudflare, github.**

**Grades:** **A** = confirmed (two different pages say it); **B** = single page; **C** = secondary or inferred. "Not documented" means no page I read says it.

**How the pages were read:** every page went through a fetch tool that summarises. Quotes are as that tool returned them, so the Source checker should re-fetch raw copies. I made no cost or quality recommendations.

## 1. Web Push on iOS and Android

| # | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| W1 | On iPhone and iPad, Web Push works only for **Home Screen web apps**, from iOS/iPadOS 16.4. Safari 16 on macOS 13 also has it for ordinary webpages. | fact | A | Apple doc; WebKit blog 2023-02-16 |
| W2 | iOS asks for permission only when the request comes from a **user gesture**, such as tapping a subscribe button. Apple says to call subscribe "immediately from the gesture's event handler". | fact | A | Apple doc; WebKit blog |
| W3 | For a Home Screen site to act as a web app, its manifest `display` must be `standalone` or `fullscreen`. | fact | B | WebKit blog |
| W4 | No Apple Developer Program membership is needed to send web push. | fact | B | Apple doc |
| W5 | **Safari does not allow invisible pushes.** Each push must show a notification straight away, or "Safari revokes the push notification permission". Chrome's equivalent is that it only supports `userVisibleOnly: true` subscriptions. | fact | A for the rule that pushes must be visible; B for each browser's detail | Apple doc; web.dev "subscribing a user"; MDN Push API |
| W6 | The page needs a service worker, a push subscription with a VAPID public key (`applicationServerKey`), and Notifications API code to show the message. The subscription gives an `endpoint` plus `keys.p256dh` and `keys.auth`. | fact | A | Apple doc; web.dev; MDN Push API |
| W7 | Push reaches the service worker "whether or not the web app is in the foreground, or even currently loaded". | fact | A | MDN Push API; web.dev overview ("even when… the browser is closed") |
| W8 | **What the server must do:** hold a VAPID P-256 key pair; sign an ES256 JWT (`aud` = the push service's origin; `exp` no more than 24 h ahead; `sub` = a mailto: or https: contact). It sends `Authorization: vapid t=…, k=…`, encrypts each payload for that one subscription, and POSTs to the stored endpoint following RFC 8030. | fact | A | RFC 8292; Apple doc |
| W9 | Apple-specific: allow `https://*.push.apple.com`; the payload limit is **4 KB**; refresh the JWT no more than once an hour; error 410 means the token has expired; error 429 means too many requests to the same device. | fact | B | Apple doc |
| W10 | `TTL` and `Urgency` headers: Apple stores an undelivered message for "30 days or fewer", depending on TTL. `Urgency` is very-low, low, normal or high, and `high` asks for immediate delivery. A message with the same `Topic` (up to 32 characters) replaces one still waiting. | fact | A | Apple doc; RFC 8030 |
| W11 | Delivery is **not guaranteed**: a push service may shorten the TTL, and messages can expire or the device can stay offline. | fact | B (RFC 8030 only; Apple's page agrees only on storage being limited) | RFC 8030 |
| W12 | Subscriptions can expire. `expirationTime` may be null, but browsers "commonly auto-expire subscriptions after periods of inactivity". A `pushsubscriptionchange` event fires when a subscription is invalidated. | fact | A | web.dev; MDN Push API |
| W13 | When the user taps a notification, `clients.openWindow()` must be given a same-origin URL and needs transient user activation (which a notification click gives). On Chrome for Android it may open the installed standalone app instead of a browser tab. | fact | B | MDN openWindow |
| W14 | Whether **Android Chrome needs the site installed** to receive push: not documented in any page I read. The Chrome Help page on site notifications mentions no install step. | not documented | — | Chrome Help |
| W15 | Push latency (how long from send to the phone) on either platform: **not documented**. | not documented | — | — |
| W16 | Chrome sets no limit on push messages; Firefox gives a quota, but pushes that show a notification are exempt from it. | fact | B | MDN Push API |

## 2. Storing a subscription without a database

| # | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| S1 | Apple's guidance assumes the server **stores** the endpoint and keys "together with the user's account information". | fact | B | Apple doc |
| S2 | **KV:** Pages Functions can bind KV. KV Free allows 100,000 reads a day, 1,000 writes a day, 1 GB, and 1 write per second to the same key. Writes "may take up to 60 seconds or more" to be seen elsewhere. | fact | B for each part | Pages bindings; KV limits; How KV works |
| S3 | **Durable Objects:** a Pages project cannot define a DO itself. It needs "a separate Worker with a Durable Object" bound to it. | fact | A | Migration-guide compatibility matrix; Pages bindings page |
| S4 | **A secret:** Workers allow 64 variables (secrets + text) per Worker on Free and 128 on Paid, each up to 5 KB. A subscription is an endpoint URL plus two short keys; I found no stated size. Whether a Worker can write its own secret at runtime is **not documented** in what I read. Secrets are set at deploy or configure time. | fact (limits) B; the rest not documented | — | Workers limits |
| S5 | **Workers Web Crypto** supports ECDSA sign, ECDH, HKDF and AES-GCM, which are the operations VAPID and payload encryption need. Cloudflare has **no first-party guide** to sending web push. Third-party libraries say they work on Workers (web-push-browser, PushForge, web-push-neo). | fact B; the libraries are C | — | Workers Web Crypto; library READMEs |
| S6 | An **opinion** on fit with S-001 (no server-side state): KV, a DO, or a hand-entered secret each keeps about one record of state server-side. Which one counts as the "ruled exception" is for the owner, not this memo. | opinion | C | — |

## 3. What triggers a send when nothing is polling

| # | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| T1 | **Pages has no Cron Triggers** (Workers ✅, Pages ❌). A separate Worker is needed, and it can be called from Pages through a service binding. | fact | A for "Pages has no cron" (matrix, and absent from the bindings page); B for the service-binding route | Compatibility matrix; Pages bindings |
| T2 | Cron Triggers run on UTC, as often as every minute, through a `scheduled()` handler. Changes take up to 15 minutes to spread. The page says nothing on whether a run is guaranteed or can be skipped (**not documented**). | fact | B | Cron Triggers page |
| T3 | Workers Free allows 5 Cron Triggers per account and 10 ms CPU per Cron Trigger. Paid allows 250. | fact | A for 10 ms (already filed as F-cf-workers-01); B for 5 and 250 | Workers limits |
| T4 | **GitHub Actions `schedule`:** runs at most every 5 minutes, only from the default branch, in UTC unless a timezone is set. It "can be delayed during periods of high loads… some queued jobs may be dropped". In public repositories it is disabled after 60 days with no repository activity. | fact | B | Events-that-trigger-workflows (raw body) |
| T5 | Actions can also start on `issues` events (including `assigned`), `workflow_dispatch` or `repository_dispatch`. These are event-driven, so nothing has to poll. | fact | B | Same page |
| T6 | Actions cost: free on standard runners for public repositories. Private repositories on GitHub Free get 2,000 minutes a month. | fact | B | Actions billing page |

## 4. Cloudflare Access and the service worker

| # | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| X1 | Cloudflare documents nothing about **service workers or Web Push behind Access**. | not documented | — | — |
| X2 | An unauthenticated simple CORS request to an Access app returns a CORS error, and preflight OPTIONS requests get 403, because browsers never send cookies with OPTIONS. Cloudflare says to use `credentials: 'same-origin'` and `crossorigin="use-credentials"`. | fact | B | Access CORS page |
| X3 | MDN: if a manifest needs credentials to fetch, `crossorigin="use-credentials"` is required, "even if… same origin". | fact | B | MDN PWA Manifest |
| X4 | Access application tokens default to **24 h** (configurable from immediate to 1 month). The global session can be 15 min to 1 month, and expired app tokens are reissued while the global session is valid. What a service-worker update fetch does after the session lapses is **not documented** by Cloudflare. | fact B; the effect not documented | — | Access session-management page |
| X5 | A **Bypass** policy on a path-scoped second Access app makes that path public, but bypassed requests are not logged and cannot use identity rules. | fact | B | Access policies page |
| X6 | Service-worker script fetches failing on redirects (which would block registration or updates through an Access redirect): **not confirmed from a primary source**. Project issue threads say it (C); my attempt to read it in the W3C spec text was truncated. | estimate | C | GitHub issues mealie #3935, LibreChat #5154 |
| X7 | The push itself goes from the push service to the device and never touches the Access-protected host. Only the click-through page load and SW updates do (inference from W8 and W13). | opinion | C | — |

## 5. GitHub Mobile as an alternative channel

| # | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| G1 | GitHub Mobile can send push notifications for "Direct mentions", "**Assignments to issues or pull requests**", review requests and deployment approvals. The user turns these on in the app's settings. | fact | A | Configuring-notifications doc; GitHub blog 2021-03-30 |
| G2 | Being assigned to an issue subscribes the user to it automatically. | fact | B | About-notifications doc |
| G3 | Controls: **Working Hours** / custom working hours to schedule pushes; per-repository watch settings in the app; the mobile inbox syncs with the web inbox. | fact | A | Configuring-notifications doc; blog 2021 |
| G4 | To use the inbox on GitHub and GitHub Mobile, notifications must be on for both "Email" and "On GitHub". | fact | B | Configuring-notifications (as summarised by search) |
| G5 | **Latency:** not documented for github.com. The only statement is for Enterprise Server, which "uses background fetch… you may experience a delay". | not documented | — | GitHub Mobile doc; Configuring-notifications |
| G6 | Whether the owner gets a push when the assignment is made with **their own** account or token: **not documented** for push. By default, email leaves out your own activity unless you turn on "Include your own updates". | fact (email) B; push not documented | — | GitHub blog 2016-06-30 |
| G7 | Team mentions and team review requests are left out of the extra push types. | fact | B | Blog 2021 |

## 6. Permission and fatigue: what the platforms say

| # | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| P1 | Ask in context, after a user action. | fact | A | Apple doc; WebKit blog; Android notification-permission doc |
| P2 | iOS: web app notifications are managed per app in Settings › Notifications, work with **Focus**, and the user can switch badges off. WebKit: "it's easy for people to get into situations where they are overwhelmed". | fact | A for per-app settings; B for the quote | WebKit blog; Apple Support 120681; Apple doc |
| P3 | Chrome Android: the user allows or blocks per site, can turn on "quieter messaging", and Chrome may automatically remove permission from sites it judges "intrusive or misleading". | fact | A | Chrome Help; Chromium blog 2020-01 |
| P4 | web.dev: notifications that are not "timely, relevant, and precise" will annoy users. Android: users can see how many notifications a day each app sends and can revoke permission. | fact | B each | web.dev overview (updated 2020-11-10); Android doc |
| P5 | Once a user blocks, the site cannot ask again; the user has to change the setting by hand. | fact | B | web.dev |

**Costs on free plans** come from the rows above: Workers Free (F-hosting-01, already filed), KV Free (S2), Cron count (T3), Actions (T6), and Access Free (F-auth-01, already filed). Apple's page says no Developer Program is needed. I found no published price for Apple's or Google's push service itself (**not documented**).

## Proposed library entries (for the Source checker)

Each proposal names the memo rows it rests on. Shelf life is 6 months unless stated.

- **F-webpush-01** (web-push, notifications; A): iOS Web Push only works for Home Screen web apps (iOS 16.4+), the permission request must come from a user gesture, and every push must show a notification or Safari revokes permission. Sources: Apple doc, WebKit blog.
- **F-webpush-02** (web-push; A): a sender needs VAPID P-256/ES256 with a JWT `exp` of 24 h or less, payloads encrypted per subscription, and a POST to the stored endpoint. Headers: TTL (Apple keeps up to 30 days), Urgency (`high` = immediate), Topic (up to 32 characters, replaces a waiting message). Sources: RFC 8292, RFC 8030, Apple doc.
- **F-webpush-03** (web-push; A): subscriptions can expire, and `pushsubscriptionchange` signals it. Sources: web.dev, MDN.
- **F-cf-cron-01** (cloudflare; A): Pages has no Cron Triggers, and a DO needs a separate Worker. Cron needs a Worker, which Pages can call through a service binding (the service-binding part is B). Sources: compatibility matrix, Pages bindings.
- **F-cf-kv-01** (cloudflare, cost; B): KV Free limits plus the 60-second-or-more visibility delay. Sources: KV limits, How KV works.
- **F-gh-11** (github, notifications; A): GitHub Mobile pushes on assignment once enabled in settings, with Working Hours to schedule them. Latency is not documented. Sources: configuring-notifications, blog 2021-03-30.
- **F-gh-12** (github, automation; B): Actions `schedule` runs at most every 5 minutes, may be delayed or dropped at the top of the hour, and is disabled after 60 days without activity in public repositories. Source: events-that-trigger-workflows.
- **P-notify-01** (pattern, C, 12 months): if Web Push is chosen, three parts are needed: a stored subscription (one record), a trigger (a Cron Worker or an event-driven Action), and a sender using Web Crypto. Access protects only the page load and SW updates, not the push path. Rests on F-webpush-01/02, F-cf-cron-01, X1–X7.

## Six-part contract

1. **What I changed:** no files; I have no write lane. I return the memo above.
2. **Why:** this answers Q-011 at depth 3 for the Source checker, without seeing any recommendation (D-055).
3. **What I verified:**
   - I read `research/Q-011.md` and the library entries that share its topics (F-gh-09, F-cf-do-01, F-hosting-01, F-auth-01, P-auth-01, P-cf-01, F-cf-workers-03/07/08, and the claim lines of the other cf/gh/auth/hosting entries).
   - I ran about 15 web searches and about 30 page fetches, all listed in the rows above.
   - Gaps: the W3C Service Workers spec fetch came back truncated (X6 is still C). MDN's `rel=manifest` page did not have the credentials sentence; MDN's PWA Manifest page did.
   - I opened no `.env`, `.npmrc` or other configuration or credential files in the pack.
4. **What is undone:**
   - A primary source for service-worker fetches failing on redirects (X6).
   - Whether Android Chrome needs the site installed (W14).
   - Push latency (W15, G5).
   - Whether self-made assignments push to GitHub Mobile (G6).
   - Apple's primary page on the 2024 EU Home Screen web app episode. I saw only press coverage and have not used it.
5. **Needed outside my lane:**
   - The Source checker should re-fetch every page raw, because all my quotes came through a summarising fetch.
   - The pack contains `.env*`, `.npmrc` and `.yarnrc*` files, which a researcher pack probably should not hold (D-006). I did not open them; the Orchestrator should check how the pack is built.
6. **Open questions** (added, none closed):
   - Q-a: Does a GitHub assignment made by the owner's own token, compared with one made by a GitHub App bot, produce a GitHub Mobile push?
   - Q-b: Does an Access redirect stop service-worker updates once the session has expired, and does Cloudflare say so anywhere?
   - Q-c: Does Android Chrome deliver Web Push to a site that is not installed, and is that documented?

Sources:
- [Apple: Sending web push notifications in web apps and browsers](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers.md)
- [WebKit: Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [Apple Support 120681](https://support.apple.com/en-us/120681)
- [RFC 8030](https://www.rfc-editor.org/rfc/rfc8030.html)
- [RFC 8292](https://www.rfc-editor.org/rfc/rfc8292.html)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [MDN Clients.openWindow](https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow)
- [MDN PWA Manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [web.dev: subscribing a user](https://web.dev/articles/push-notifications-subscribing-a-user)
- [web.dev: push overview](https://web.dev/articles/push-notifications-overview)
- [Chrome Help: notifications (Android)](https://support.google.com/chrome/answer/3220216?co=GENIE.Platform%3DAndroid&hl=en)
- [Chromium blog: quieter permission UI](https://blog.chromium.org/2020/01/introducing-quieter-permission-ui-for.html)
- [Android notification permission](https://developer.android.com/develop/ui/views/notifications/notification-permission)
- [Cloudflare: Pages→Workers migration matrix](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Cloudflare: Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Cloudflare: Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cloudflare: Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare: Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
- [Cloudflare: KV limits](https://developers.cloudflare.com/kv/platform/limits/)
- [Cloudflare: How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Cloudflare Access: CORS](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/cors/)
- [Cloudflare Access: policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)
- [Cloudflare Access: session management](https://developers.cloudflare.com/cloudflare-one/identity/users/session-management)
- [GitHub: Configuring notifications](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications)
- [GitHub: About notifications](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications)
- [GitHub Mobile docs](https://docs.github.com/en/get-started/using-github/github-mobile)
- [GitHub blog 2021-03-30](https://github.blog/news-insights/product-news/new-push-notifications-scheduling-releases-github-mobile/)
- [GitHub blog: own-activity emails](https://github.blog/news-insights/email-updates-about-your-own-activity)
- [GitHub: Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [mealie #3935](https://github.com/mealie-recipes/mealie/issues/3935)
- [LibreChat #5154](https://github.com/danny-avila/LibreChat/discussions/5154)
- [web-push-browser README](https://cdn.jsdelivr.net/npm/web-push-browser@1.4.2/README.md)
- [PushForge](https://github.com/draphy/pushforge)
- [web-push-neo](https://github.com/ryoppippi/web-push-neo)
