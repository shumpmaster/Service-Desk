I've finished the checks for this round, and the memo still isn't ready to pass. The Source checker failed it on two rows, T6 and T10. I dropped T6. On T10 the checker and I read the GitHub page differently, so it needs their ruling. I can't write files, so the full revision 4 memo is below for the Orchestrator to save in place of revision 3.

---

# Q-011 memo, revision 4 (complete; replaces revisions 1–3)

**Researcher, 2026-10-08. Depth 3. Topics: notifications, web-push, cloudflare, github.**

This memo stands alone. Row IDs are the same as in revision 3. Rows changed this round are marked **[r4]**; rows not marked are unchanged from revision 3, and the checker has already opened them.

**How I read the pages:** through a fetch tool that summarises. Where I could, I fetched raw bodies: Cloudflare `index.md` pages, the GitHub `api/article/body` endpoint, and the MDN BCD JSON. Quotes are as the tool returned them.

**Grades:**
- A = two different pages state it. Same-publisher pages count for limits and behaviour; prices need an independent source.
- B = one page states it.
- C = inferred, or stated only by press, forums or search snippets.
- "Not documented" = no page I read says it.

No cost or quality recommendations.

## 1. Web Push on the device

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| W1 | **iOS/iPadOS 16.4 and later support Web Push for Home Screen web apps.** **[r4]** Third page: WebKit 16.4 features says "iOS and iPadOS 16.4 add support for Web Push to web apps added to the Home Screen." | fact | A (F-webpush-01b) | Apple doc; WebKit 13878; MDN BCD; WebKit 13966 |
| W2 | **That iOS Safari tabs cannot use Web Push is not documented.** **[r4]** Rechecked WebKit 13966 and 16574 (Safari 18.4 features). Both say "for web apps added to the Home Screen", and neither says tabs are excluded. The exclusion appears only in press, blogs and search summaries. | estimate | C | none primary |
| W3 | **A manifest `display` of `standalone` or `fullscreen` makes the site a Home Screen web app.** | fact | B | WebKit 13878 |
| W4 | **Subscribing or asking for permission needs a user gesture.** | fact | A (F-webpush-01) | Apple; WebKit 13878; MDN |
| W5 | **No Apple Developer Program membership is needed.** | fact | A (F-webpush-01) | Apple; WebKit 13878 |
| W6 | **Standard Web Push needs an active service worker, and push arrives when the page is not loaded.** **[r4]** Exception: Declarative Web Push on iOS/iPadOS 18.4 does not need a service worker (see D1). | fact | A (F-webpush-07) | MDN Push API; Apple; web.dev |
| W7 | **HTTPS (a secure context) is required.** | fact | A | MDN ×2 |
| W8 | **Safari revokes permission if a push shows no notification.** | fact | A for Safari; B for iOS (F-webpush-04) | Apple; WebKit 12945 |
| W9 | **`userVisibleOnly: true` is a "symbolic agreement" to show a notification for every push.** | fact | A | web.dev; WebKit 12945 |
| W10 | **Android wakes the receiving app for a push whether or not it is closed.** That Android needs no installation is not stated on any page. | fact / estimate | B / C | web.dev FAQ; MDN BCD |
| W11 | **Chrome Android may open a notification tap in standalone if the site was launched from the home screen in the last ten days.** The page itself calls this "unreliable". | fact | B | web.dev FAQ |
| W12 | **[r4, opened]** Chrome's `subscribe` note reads: "The `options` parameter with a `applicationServerKey` value is required." (Chrome 42). For `webview_android`, `subscribe` is `"version_added": false`. | fact | B | MDN BCD PushManager.json (raw) |
| D1 | **[r4, new] Declarative Web Push.** WebKit: it "allows web developers to request a Web Push subscription and display user visible notifications without requiring an installed service worker". The subscription comes from `window.pushManager.subscribe(...)`. The payload is JSON with `"web_push": 8030` and a `notification` object, where `title` and `navigate` are required. If a service worker exists, it gets a `PushEvent` and may replace the notification; if that fails, "the fallback is used". Older browsers handle the same message "imperatively". Second page, Safari 18.4: "Declarative Web Push is now available on iOS and iPadOS 18.4 for web apps added to the Home Screen." Support: iOS/iPadOS 18.4, macOS 15.5 beta (as of that post). Android/Chrome support is not documented on the pages I read. MDN has no `Window.pushManager` page (404). | fact | A (two WebKit pages, behaviour) | WebKit 16535; WebKit 16574 |

## 2. What the sender needs (unchanged; filed where stated)

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| V1 | **VAPID uses ES256 keys.** The JWT `exp` must be no more than 24 h ahead, and `aud`/`sub` follow the rules. | fact | A (F-webpush-02) | RFC 8292; Apple |
| V2 | **A subscription is an endpoint plus encryption keys, which go to the server.** | fact | A | web.dev; RFC 8291; Apple |
| V3 | **The payload is encrypted per subscription.** That it uses `aes128gcm` in a single record is stated by RFC 8291 only, per the checker. | fact | A / B | RFC 8291; Apple |
| V4 | **Payloads up to 4096 bytes are guaranteed.** | fact | A (F-webpush-05) | RFC 8030; RFC 8291; Apple; web.dev |
| V5 | **TTL is mandatory; Urgency has four values; a Topic is at most 32 characters.** | fact | A (F-webpush-02) | RFC 8030; Apple |
| V6 | **A Topic replaces a waiting message with the same Topic.** | fact | A (F-webpush-02b) | RFC 8030; web.dev; Apple |
| V7 | **Response codes are stated per publisher:** RFC 8030 uses 404 for an expired subscription. Apple uses 404 for a bad `:path` and 410 for an expired token. web.dev treats 404 as expired and 410 as gone. 201 means accepted, 413 too large, 429 rate-limited. (Corrected by the checker; see F-webpush-06.) | fact | A | RFC 8030; Apple; web.dev |
| V8 | **Senders must allow `*.push.apple.com`** (A). Other Apple-only rules, from one page: refresh the JWT at most hourly, keep subscriptions 30 days or fewer, the offline store is limited, and at most 100 unacknowledged pushes. | fact | A / B | Apple; WebKit 13878 |
| V9 | **The endpoint is a capability URL and must be kept secret.** | fact | B | MDN Push API |
| V10 | **Subscriptions expire, and `pushsubscriptionchange` fires when one does.** | fact | A (F-webpush-03) | web.dev; MDN |
| V11 | **The Workers Web Crypto API has the primitives that VAPID signing and payload encryption use.** No Cloudflare page describes sending Web Push from a Worker. | fact / estimate | B / C | CF Web Crypto |

## 3. Storing the subscription without a database

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| S1 | **Apple and web.dev say the server stores the subscription; neither names a store.** Whether it can be stored without a database is not documented. | fact / n.d. | A / — | Apple; web.dev |
| S2 | **KV Free: 100k reads and 1k writes a day, 1 GB, one write per second per key, up to 60 s before a write is seen elsewhere.** | fact | A (F-cf-kv-01) | KV pages |
| S3 | **KV Free: 1k deletes and 1k lists a day, reset at 00:00 UTC.** | fact | A (F-cf-kv-01b) | KV pricing; Workers pricing |
| S4 | **Durable Objects on Free are SQLite-only, with 100k requests, 13k GB-s and 5 GB.** | fact | A (F-cf-do-free-01) | DO pricing; Workers pricing |
| S5 | **DO Free allows 5M rows read and 100k rows written a day; storage billing for SQLite DOs started no earlier than 7 January 2026.** | fact | B | DO pricing |
| S6 | **A Pages project cannot define a Durable Object; it needs a separate Worker and a binding.** | fact | A (F-cf-pages-do-01) | Migration guide; Pages bindings |
| S7 | **`wrangler secret put` deploys immediately.** A Worker changing its own secret at runtime is not documented. | fact / n.d. | B | CF secrets |
| S8 | **Free env vars are 5 KB each, 64 per Worker.** Whether secrets share these limits is not documented. | fact / n.d. | B | CF limits |

## 4. What triggers a send

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| T1 | **Pages has no Cron Triggers; Workers does.** | fact | A (F-cf-cron-01) | Migration matrix; Builder Day 2024 |
| T2 | **[r4, corrected] The Pages changelog adds no cron feature in the entries it shows.** It now shows six entries, 17 March 2025 to 11 August 2026, and none mentions cron, Cron Triggers or scheduled handlers. Revision 3's "from September 2024" is withdrawn, because the page no longer shows entries that old. | fact (absence) | B | CF Pages changelog |
| T3 | **A Pages Function can call a Worker through a service binding.** | fact | A (F-cf-pages-svc-01) | Pages bindings; matrix |
| T4 | **Workers Cron runs on UTC, can fire every minute, takes up to 15 min to propagate changes, and needs a `scheduled()` handler.** | fact | B | CF Cron Triggers |
| T5 | **Workers Free: 5 Cron Triggers per account, 10 ms CPU, 100k requests a day.** | fact | A / B as in revision 3 | CF limits; pricing |
| T6 | **[r4, dropped]** "Cron Triggers are counted as requests" is not on the Workers pricing page; my re-fetch agrees with the checker. Whether cron invocations count against the 100k requests a day is **not documented**. | n.d. | — | — |
| T7 | **[r4, opened]** The Workflows changelog entry is dated **2 June 2026** and titled "Schedule Workflow instances directly from your Workflow binding". It reads: "Each scheduled run creates a new Workflow instance automatically, so you do not need to define a separate Worker with a `scheduled` handler". The page does not say which plans can use it; its example config mentions Workers Paid. | fact / n.d. | B | CF Workflows changelog |
| T8 | **Actions `schedule` runs at most every 5 minutes, may be delayed or dropped, and is disabled after 60 days without activity in public repos.** | fact | A (F-gh-12, F-gh-12b) | GitHub pages |
| T9 | **[r4, opened]** GitHub: "By default, scheduled workflows run in UTC. You can optionally specify a timezone using an IANA timezone string for timezone-aware scheduling." On daylight-saving changes, "scheduled workflows in skipped hours advance to the next valid time." | fact | B | GitHub events (raw body) |
| T10 | **[r4, disputed]** `repository_dispatch` and the 10-property limit are filed as F-gh-13; the size limits conflict between pages. On the classic-PAT scope, my raw-body fetch of the REST repos article puts this sentence inside the "Create a repository dispatch event" section, after the `client_payload` text: "OAuth app tokens and personal access tokens (classic) need the repo scope to use this endpoint." The create-repository endpoints use different wording ("need the public_repo or repo scope to create a public repository…"). This contradicts the checker's reading, so I ask for a re-check and propose nothing. | fact | B (disputed) | GitHub REST repos (`docs.github.com/api/article/body?pathname=/en/rest/repos/repos`) |
| T11 | **Actions is free for public repos on standard runners; private repos on GitHub Free get 2,000 minutes a month.** | fact | B | GitHub billing |
| T12 | **[r4, new] Durable Object alarms.** "Durable Objects alarms allow you to schedule the Durable Object to be woken up at a time in the future." Only one alarm can be set per DO at a time. Execution is "guaranteed at-least-once", with retries on exponential backoff from 2 s, up to 6 retries. Alarms work "without relying on incoming requests". Whether alarms are restricted on the Free plan is not documented. | fact / n.d. | B | CF DO alarms API |
| T13 | **[r4, new]** Workers pricing: "Each setAlarm() is billed as a single row written" (SQLite-backed DOs). | fact | B | CF Workers pricing |

## 5. Cloudflare Access and the service worker or click-through

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| X1 | **How Access treats service-worker registration is not documented.** Only forums report problems, and they are not sources. | n.d. | — | — |
| X2 | **MDN: the service-worker script must be same-origin, served over HTTPS, with a JS MIME type.** What happens if Access returns a login page instead is not documented. | fact / estimate | B / C | MDN register() |
| X3 | **Access can block AJAX sub-requests after its token expires; the `X-Requested-With` header makes it return 401.** | fact | B | CF session mgmt |
| X4 | **The Access session runs from 15 min to one month, 24 h by default; the app token is reissued while the global session is valid.** | fact | B | CF session mgmt |
| X5 | **[r4, opened]** "the browser never includes cookies with OPTIONS requests, by design. Cloudflare will therefore block the preflight request, causing the CORS exchange to fail" (403). The page gives three fixes: bypass OPTIONS to the origin, have Cloudflare answer OPTIONS, or use a Worker to send tokens. Troubleshooting says to ensure "`credentials: 'same-origin'` in all fetch or XHR requests", with cross-origin scripts set to `"use-credentials"`. | fact | B | CF Access CORS (index.md) |
| X6 | **Machines pass Access with a service token, using two headers and a "Service Auth" policy.** | fact | A (F-cf-access-svc-01) | CF ×2 |
| X7 | **[r4, opened]** `notificationclick` "is fired to indicate that a system notification spawned by `ServiceWorkerRegistration.showNotification()` has been clicked". `openWindow` resolves to a `WindowClient` "if the URL is from the same origin as the service worker or a null value otherwise". Chrome for Android "may instead open the URL in an existing browsing context provided by a standalone web app". `openWindow` needs transient activation in some window of the origin, otherwise it throws `InvalidAccessError`. How Access treats this navigation after its session lapses is not documented. | fact / n.d. | A (MDN ×2) / B (Chrome note, activation) | MDN notificationclick; MDN openWindow |
| X8 | **Pushes travel through the push service, not the site's origin, so Access is not on the delivery path.** | estimate | C | Apple; RFC 8030 |
| X9 | **The manifest is fetched as a CORS request whose credentials follow `crossorigin`.** Whether Access lets it through is not documented. | fact / n.d. | B | W3C appmanifest |
| X10 | **[r4, new]** Inference from D1: on iOS/iPadOS 18.4 and later, a declarative push needs no service worker, so the X1/X2 service-worker fetch does not arise for display on iOS. The tap still navigates to the `navigate` URL, which Access would gate as in X7. Cloudflare says nothing about this. | estimate | C | WebKit 16535 |

## 6. Permission and fatigue

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| P1 | **Ask for permission in context, never on load.** | opinion | B (checker: both Google; P-notify-permission-01) | web.dev; Chrome CrUX blog |
| P2 | **A denial is permanent.** | fact | A | web.dev; MDN |
| P3 | **Chrome automatically moves sites with very low Accept rates to the quieter permission UI.** **[r4]** The Chromium blog post was blocked by a Google "sorry" (bot-check) redirect on both URLs I tried. The search summary adds that users who often deny are also enrolled, and that sites leave once acceptance improves; that addition is C. | fact | B (CrUX blog) / C (rest) | Chrome CrUX blog |
| P4 | **iOS: users manage permission per web app in Notifications Settings, and it integrates with Focus.** **[r4]** WebKit 13966 adds that Badging permission "is automatically granted when a user gives permission for notifications". | fact | B (each) | WebKit 13878; WebKit 13966 |
| P5 | **Notifications should be "timely, relevant, and precise".** | opinion | B | web.dev |

## 7. GitHub Mobile

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| G1 | **Push types are mentions, assignments, review requests and deployment approvals, each with a toggle, plus Working Hours.** **[r4, re-fetched]** The same page adds: "When you install GitHub Mobile, you will automatically be opted into web notifications." | fact | A (F-gh-11) / B (opt-in) | GitHub configuring; GitHub blog 2021 |
| G2 | "Team mentions and team review requests are excluded from all the additional push notification types." (30 March 2021; confirmed by the checker) | fact | B | GitHub blog |
| G3 | **Being assigned subscribes you by default.** | fact | B | GitHub about notifications |
| G4 | **github.com push latency is not documented;** GitHub Enterprise Server warns of possible delay. | n.d. / fact | — / B | GitHub configuring |
| G5 | **Whether your own or a bot's assignment pushes to mobile is not documented.** | n.d. | — | — |
| G6 | **The `issues` event has an `assigned` activity type.** | fact | B | GitHub events |

## Proposed library entries

- **F-webpush-08** (web-push; A, two WebKit pages; shelf life 6 months).
  - Declarative Web Push on iOS/iPadOS 18.4 and later, for Home Screen web apps.
  - The subscription comes from `window.pushManager.subscribe` with no service worker.
  - The payload is JSON with `"web_push": 8030` and a `notification` that has `title` and `navigate`.
  - An installed service worker can override; a failed override falls back to the declarative one.
  - Support on other browsers is not documented.
  - Sources: WebKit 16535; WebKit 16574.
- Not proposed: everything graded B, C or not documented. T10's scope stays out until the checker re-checks it.

## Six-part contract

1. **What I changed:**
   - Dropped T6.
   - Recorded T10's scope as disputed, quoting the dispatch section.
   - Opened and quoted W12, X5, X7, T7 and T9.
   - Corrected T2's date range.
   - Added D1 (Declarative Web Push), T12–T13 (DO alarms), X10, plus small additions to W1, P4 and G1.
   - Proposed F-webpush-08.
2. **Why:**
   - The checker failed T6 and T10 and listed W12, X5, X7, T2, T7 and T9 as unchecked.
   - Revision 3 left DO alarms unresearched.
   - While re-checking W2 I found that WebKit documents a push path with no service worker. It bears directly on the Access and service-worker questions.
3. **What I verified:** 4 searches and 20 fetches.
   - Pages that confirmed claims:
     - The GitHub REST raw body puts the repo-scope sentence under the dispatch heading.
     - Workers pricing has no "counted as requests" sentence; it has the setAlarm billing line.
     - BCD shows the Chrome note and `webview_android: false`.
     - The Pages changelog's oldest entry shown is 17 March 2025.
     - The Workflows entry is dated 2 June 2026.
     - The GitHub events page has the timezone and DST sentences.
     - The DO alarms page and WebKit 13966, 16574 and 16535 gave the quotes used.
   - Fetches that failed:
     - Both Chromium blog URLs redirected to a Google bot-check page.
     - MDN `Window/pushManager` returned 404.
4. **What is undone:**
   - W2 has no primary source.
   - X1, X2, X7 (behaviour after a lapsed session) and X9 are not documented.
   - G4 and G5 are not documented.
   - Free-plan eligibility for Workflows cron and for DO alarms is not documented.
   - Declarative Web Push support on Android or Chrome is not documented.
   - P3 needs the Chromium post itself.
5. **Needed outside my lane:**
   - The Orchestrator should save this memo whole, replacing revision 3.
   - The Source checker should re-open T10's scope in the raw REST body and rule.
6. **Open questions** (none closed):
   - **Q-d:** Does a primary page say iOS tabs cannot subscribe?
   - **Q-e:** Has Pages gained cron?
   - **Q-f:** How does Access treat the service-worker, manifest and click-through requests after its session expires? Answering it would need a test.
   - **Q-g:** Does a bot's assignment push to GitHub Mobile?
   - **Q-h:** Are Workflows cron schedules available on Free?
   - **Q-i (new):** Are DO alarms available on Workers Free?
   - **Q-j (new):** Does Chrome or Android support Declarative Web Push, or does only the imperative fallback apply there?
   - Q-a, Q-b and Q-c carry over (their wording is not visible to me).

Sources:
- [Apple: Sending web push notifications](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers.md)
- [WebKit 13878](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/), [WebKit 13966 (Safari 16.4)](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/), [WebKit 16574 (Safari 18.4)](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/), [WebKit 16535 Meet Declarative Web Push](https://webkit.org/blog/16535/meet-declarative-web-push/), [WebKit 12945](https://webkit.org/blog/12945/meet-web-push/)
- [MDN BCD PushManager.json](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/PushManager.json), [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API), [MDN requestPermission](https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static), [MDN register()](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register), [MDN notificationclick](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event), [MDN openWindow](https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow)
- [web.dev subscribing](https://web.dev/articles/push-notifications-subscribing-a-user), [web.dev protocol](https://web.dev/articles/push-notifications-web-push-protocol), [web.dev overview](https://web.dev/articles/push-notifications-overview), [web.dev FAQ](https://web.dev/articles/push-notifications-faq), [web.dev permissions](https://web.dev/articles/permissions-best-practices), [Chrome CrUX blog](https://developer.chrome.com/blog/notification-permission-data-in-crux/), [Chromium blog (blocked)](https://blog.chromium.org/2020/01/introducing-quieter-permission-ui-for.html)
- [RFC 8030](https://www.rfc-editor.org/rfc/rfc8030.txt), [RFC 8291](https://www.rfc-editor.org/rfc/rfc8291.txt), [RFC 8292](https://www.rfc-editor.org/rfc/rfc8292.html), [W3C App Manifest](https://www.w3.org/TR/appmanifest/)
- [CF Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [CF Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [CF Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/index.md), [CF DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), [CF DO alarms](https://developers.cloudflare.com/durable-objects/api/alarms/index.md), [CF secrets](https://developers.cloudflare.com/workers/configuration/secrets/), [CF Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/), [CF Access CORS](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/cors/index.md), [CF session management](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/), [CF service tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/), [CF Pages changelog](https://developers.cloudflare.com/changelog/product/pages/), [CF Workflows changelog](https://developers.cloudflare.com/changelog/product/workflows/), [CF migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/), [CF Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [CF Builder Day 2024](https://blog.cloudflare.com/builder-day-2024-announcements/), [KV limits](https://developers.cloudflare.com/kv/platform/limits/), [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [GitHub configuring notifications](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications), [GitHub about notifications](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications), [GitHub blog 2021-03-30](https://github.blog/news-insights/product-news/new-push-notifications-scheduling-releases-github-mobile/), [GitHub events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), [GitHub REST repos (raw body)](https://docs.github.com/api/article/body?pathname=/en/rest/repos/repos), [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- Seen but not used as sources: [Search Engine Journal](https://www.searchenginejournal.com/web-push-coming-to-ios/464365/), [webscraft blog](https://webscraft.org/blog/pwa-pushspovischennya-na-ios-u-2026-scho-realno-pratsyuye?lang=en), [9to5Mac](https://9to5mac.com/2023/02/16/iphone-web-app-new-features-ios-16-4/), [webventures](https://webventures.rejh.nl/blog/2023/ios-web-push-requires-install/)
