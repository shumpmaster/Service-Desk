I've written revision 6 of the memo below. It fixes the four points the source check failed or flagged, so the check should now pass. The fixes:

- **Pages changelog count (T2):** the changelog has six entries, not seven.
- **Repository dispatch token sentence (T10):** I've dropped the claim about which token permission the endpoint needs. Summarised reads can't settle which section the sentence belongs to.
- **Cloudflare Access quote (X5):** I've cut it to the two sentences I could confirm word for word.
- **`openWindow` wording (X7):** I've quoted both of the page's sentences, each with its section.

Every page still went through a summarising fetch, so nothing here is a byte-exact read.

---

# Q-011 memo, revision 6 (complete; replaces revisions 1–5)

**Researcher, 2026-10-08. Depth 3. Topics: notifications, web-push, cloudflare, github.**

This memo stands alone. Row IDs are the same as in revision 5. Rows changed this round are marked **[r6]**. Unmarked rows are the same as in revision 5.

**How I read the pages:** everything went through a fetch tool that summarises, including the "raw" endpoints (Cloudflare `index.md`, GitHub `api/article/body`, MDN BCD JSON). Quotes are as the tool returned them. I can't do a byte-exact read. Where a quote could only be confirmed in substance, the row says so.

**Grades:**
- A = two different pages state it. Same-publisher pages count for limits and behaviour; prices need an independent source.
- B = one page states it.
- C = inferred, or stated only by press, forums or search snippets.
- "Not documented" = no page I read says it.

No cost or quality recommendations.

## 1. Web Push on the device (unchanged)

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| W1 | iOS/iPadOS 16.4 and later support Web Push for Home Screen web apps. | fact | A (F-webpush-01b) | Apple doc; WebKit 13878; MDN BCD; WebKit 13966 |
| W2 | That iOS Safari tabs cannot use Web Push is not documented on a primary page. WebKit 13966 and 16574 say "for web apps added to the Home Screen" but never say tabs are excluded. The exclusion appears only in press and blogs. | estimate | C | none primary |
| W3 | A manifest `display` of `standalone` or `fullscreen` makes the site a Home Screen web app. | fact | B | WebKit 13878 |
| W4 | Subscribing or asking for permission needs a user gesture. | fact | A (F-webpush-01) | Apple; WebKit 13878; MDN |
| W5 | No Apple Developer Program membership is needed. | fact | A (F-webpush-01) | Apple; WebKit 13878 |
| W6 | Standard Web Push needs an active service worker, and the push arrives when the page is not loaded. Exception: Declarative Web Push (D1). | fact | A (F-webpush-07) | MDN Push API; Apple; web.dev |
| W7 | HTTPS (a secure context) is required. | fact | A | MDN ×2 |
| W8 | Safari revokes permission if a push shows no notification. | fact | A for Safari; B for iOS (F-webpush-04) | Apple; WebKit 12945 |
| W9 | `userVisibleOnly: true` is a "symbolic agreement" to show a notification for every push. | fact | A | web.dev; WebKit 12945 |
| W10 | Android wakes the receiving app for a push whether or not it is closed (B). That Android needs no installation is not stated on any page (C). | fact / estimate | B / C | web.dev FAQ; MDN BCD |
| W11 | Chrome Android may open a notification tap in standalone if the site was launched from the home screen in the last ten days. The page calls this "unreliable". | fact | B | web.dev FAQ |
| W12 | Chrome's `subscribe` note: "The `options` parameter with a `applicationServerKey` value is required." For `webview_android`, `subscribe` is `false`. | fact | B | MDN BCD PushManager.json |
| D1 | **Grade A (WebKit 16535 + 16574):** Declarative Web Push is available on iOS/iPadOS 18.4 for Home Screen web apps. It lets a page request a subscription and show notifications "without requiring an installed service worker".<br>**Single page, grade B (16535 only):** the payload is JSON with `"web_push": 8030` and a `notification` object that requires `title` and `navigate`. An installed service worker gets a `PushEvent` and may replace the notification; if that fails, "the fallback is used". It was also on macOS 15.5 beta.<br>**Not documented:** support in other browsers. This is an absence on the two pages I read, not a stated fact. | fact / n.d. | A / B / — (F-webpush-08) | WebKit 16535; WebKit 16574 |

## 2. What the sender needs (unchanged)

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| V1 | VAPID uses ES256 keys. The JWT `exp` must be no more than 24 h ahead, and `aud`/`sub` follow the rules. | fact | A (F-webpush-02) | RFC 8292; Apple |
| V2 | A subscription is an endpoint plus encryption keys, which go to the server. | fact | A | web.dev; RFC 8291; Apple |
| V3 | The payload is encrypted per subscription (A). That it uses `aes128gcm` in a single record is stated by RFC 8291 only (B). | fact | A / B | RFC 8291; Apple |
| V4 | Payloads up to 4096 bytes are guaranteed. | fact | A (F-webpush-05) | RFC 8030; RFC 8291; Apple; web.dev |
| V5 | TTL is mandatory; Urgency has four values; a Topic is at most 32 characters. | fact | A (F-webpush-02) | RFC 8030; Apple |
| V6 | A Topic replaces a waiting message with the same Topic. | fact | A (F-webpush-02b) | RFC 8030; web.dev; Apple |
| V7 | Response codes are stated per publisher. RFC 8030: 404 = expired subscription. Apple: 404 = bad `:path`, 410 = expired token. web.dev: 404 = expired, 410 = gone. 201 = accepted, 413 = too large, 429 = rate-limited. | fact | A (F-webpush-06) | RFC 8030; Apple; web.dev |
| V8 | Senders must allow `*.push.apple.com` (A). Other Apple-only rules (B): refresh the JWT at most hourly, keep subscriptions 30 days or fewer, the offline store is limited, at most 100 unacknowledged pushes. | fact | A / B | Apple; WebKit 13878 |
| V9 | The endpoint is a capability URL and must be kept secret. | fact | B | MDN Push API |
| V10 | Subscriptions expire, and `pushsubscriptionchange` fires when one does. | fact | A (F-webpush-03) | web.dev; MDN |
| V11 | Workers Web Crypto has the primitives that VAPID signing and payload encryption use (B). No Cloudflare page describes sending Web Push from a Worker (C). | fact / estimate | B / C | CF Web Crypto |

## 3. Storing the subscription without a database (unchanged)

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| S1 | Apple and web.dev say the server stores the subscription but don't name a store. Whether it can be stored without a database is not documented. | fact / n.d. | A / — | Apple; web.dev |
| S2 | KV Free: 100k reads and 1k writes a day, 1 GB, one write per second per key, up to 60 s before a write is seen elsewhere. | fact | A (F-cf-kv-01) | KV pages |
| S3 | KV Free: 1k deletes and 1k lists a day, reset at 00:00 UTC. | fact | A (F-cf-kv-01b) | KV pricing; Workers pricing |
| S4 | Durable Objects on Free are SQLite-only: 100k requests, 13k GB-s, 5 GB. | fact | A (F-cf-do-free-01) | DO pricing; Workers pricing |
| S5 | DO Free: 5M rows read and 100k rows written a day. Storage billing for SQLite DOs starts no earlier than 7 January 2026. | fact | B | DO pricing |
| S6 | A Pages project cannot define a Durable Object; it needs a separate Worker and a binding. | fact | A (F-cf-pages-do-01) | Migration guide; Pages bindings |
| S7 | `wrangler secret put` deploys immediately. A Worker changing its own secret at runtime is not documented. | fact / n.d. | B | CF secrets |
| S8 | Free env vars are 5 KB each, 64 per Worker. Whether secrets share these limits is not documented. | fact / n.d. | B | CF limits |

## 4. What triggers a send

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| T1 | Pages has no Cron Triggers; Workers does. | fact | A (F-cf-cron-01) | Migration matrix; Builder Day 2024 |
| T2 | **[r6, count corrected to six, all entries named]** The Pages changelog adds no cron feature in the entries it shows. It shows **six** entries:<br>1. 11 Aug 2026, "Pages now skips superseded queued builds"<br>2. 23 Jan 2026, "Increased Pages file limit to 100,000 for paid plans"<br>3. 30 May 2025, "Cloudflare Pages builds now provide Node.js v22 by default"<br>4. 22 Mar 2025, "New Managed WAF rule for Next.js CVE-2025-29927"<br>5. 22 Mar 2025, "Smart Placement is smarter about running Workers and Pages Functions in the best locations"<br>6. 17 Mar 2025, "Retry Pages & Workers Builds Directly from GitHub"<br>None mentions cron, scheduled runs or Cron Triggers. Revision 5's "seven" and its unnamed "one more" are withdrawn: there was no seventh entry. | fact (absence) | B | CF Pages changelog |
| T3 | A Pages Function can call a Worker through a service binding. | fact | A (F-cf-pages-svc-01) | Pages bindings; matrix |
| T4 | Workers Cron runs on UTC, can fire every minute, takes up to 15 min to propagate changes, and needs a `scheduled()` handler. | fact | B | CF Cron Triggers |
| T5 | Workers Free: 5 Cron Triggers per account, 10 ms CPU, 100k requests a day. | fact | A / B | CF limits; pricing |
| T6 | Whether cron invocations count against the 100k requests a day is not documented. | n.d. | — | — |
| T7 | Workflows changelog, dated 2 June 2026: "Each scheduled run creates a new Workflow instance automatically, so you do not need to define a separate Worker with a `scheduled` handler". It names no plan. | fact / n.d. | B | CF Workflows changelog |
| T8 | Actions `schedule` runs at most every 5 minutes, may be delayed or dropped, and is disabled after 60 days without activity in public repos. | fact | A (F-gh-12, F-gh-12b) | GitHub pages |
| T9 | Scheduled workflows run in UTC by default, and an IANA timezone is optional. In a daylight-saving change, "scheduled workflows in skipped hours advance to the next valid time." | fact | B | GitHub events |
| T10 | **[r6, scope claim dropped]** `POST /repos/{owner}/{repo}/dispatches` triggers a `repository_dispatch` event that a GitHub Actions workflow can run on. Body: `event_type` (required, 100 characters or fewer) and `client_payload` (at most 10 top-level properties, under 64 KB). It returns 204 on success. **Not settled:** which classic-token scope the endpoint needs. Two summarising fetches put the "repo scope" sentence inside the dispatch section, but this round's fetch also printed it before the heading, and an earlier raw read placed it elsewhere. I no longer make the scope claim. | fact / n.d. | B / — | GitHub REST repos (article body) |
| T10b | The fine-grained PAT permissions page lists `POST /repos/{owner}/{repo}/dispatches` under "Contents" with **write** access. Not re-opened this round. | fact | B | GitHub fine-grained PAT permissions |
| T11 | Actions is free for public repos on standard runners. Private repos on GitHub Free get 2,000 minutes a month. | fact | B | GitHub billing |
| T12 | DO alarms "allow you to schedule the Durable Object to be woken up at a time in the future". There is one alarm per DO, execution is at-least-once, and failures retry with exponential backoff from 2 s, up to 6 retries. Alarms work without incoming requests. Whether Free plans restrict them is not documented. | fact / n.d. | B | CF DO alarms |
| T13 | "Each setAlarm() is billed as a single row written" (SQLite DOs). | fact | B | CF Workers pricing |

## 5. Cloudflare Access and the service worker or click-through

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| X1 | How Access treats service-worker registration is not documented. Only forums report problems. | n.d. | — | — |
| X2 | MDN: the service-worker script must be same-origin, served over HTTPS, with a JS MIME type (B). What happens if Access returns a login page instead is not documented (C). | fact / estimate | B / C | MDN register() |
| X3 | Access can block AJAX sub-requests after its token expires; the `X-Requested-With` header makes it return 401. | fact | B | CF session mgmt |
| X4 | The Access session runs from 15 min to one month, 24 h by default. The app token is reissued while the global session is valid. | fact | B | CF session mgmt |
| X5 | **[r6, quote cut to the confirmed text]**<br>**Verbatim (confirmed twice):** "This error occurs regardless of whether you have logged in to the domain. This is because the browser never includes cookies with OPTIONS requests, by design."<br>**Substance only (paraphrased by the fetch):** Access therefore blocks the CORS preflight. The page offers three fixes: bypass OPTIONS to the origin, have Cloudflare answer OPTIONS, or use a Worker that sends an authentication token. It also advises `credentials: 'same-origin'` in fetch/XHR and `"use-credentials"` on cross-origin script tags.<br>Revision 5's sentence "Cloudflare will therefore block the preflight request, causing the CORS exchange to fail." is no longer quoted. | fact | B | CF Access CORS (index.md) |
| X6 | Machines pass Access with a service token, using two headers and a "Service Auth" policy. | fact | A (F-cf-access-svc-01) | CF ×2 |
| X7 | **[r6, transient-activation wording corrected]**<br>**MDN `notificationclick` (B):** the event "is fired to indicate that a system notification spawned by `ServiceWorkerRegistration.showNotification()` has been clicked". This page has no Chrome-for-Android sentence.<br>**MDN `openWindow` (B):** it resolves to a `WindowClient` "if the URL is from the same origin as the service worker or a null value otherwise". In Chrome for Android it "may instead open the URL in an existing browsing context provided by a standalone web app previously added to the user's home screen".<br>**Transient activation (two sentences on the `openWindow` page):**<br>• Security requirements: "At least one window in the app's origin must have transient activation."<br>• Exceptions (`InvalidAccessError`): "The promise is rejected with this exception if none of the windows in the app's origin have transient activation."<br>Revision 5 merged these two into one paraphrase.<br>**Not documented:** how Access treats this navigation after its session lapses. | fact / n.d. | B (each page) / — | MDN notificationclick; MDN openWindow |
| X8 | Pushes travel through the push service, not the site's origin, so Access is not on the delivery path. | estimate | C | Apple; RFC 8030 |
| X9 | The manifest is fetched as a CORS request whose credentials follow `crossorigin`. Whether Access lets it through is not documented. | fact / n.d. | B | W3C appmanifest |
| X10 | Inference from D1: on iOS/iPadOS 18.4 and later, a declarative push needs no service worker, so the X1/X2 fetch does not arise for display. The tap still goes to the `navigate` URL, which Access would gate. Cloudflare says nothing about this. | estimate | C | WebKit 16535 |

## 6. Permission and fatigue (unchanged)

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| P1 | Ask for permission in context, never on load. | opinion | B (P-notify-permission-01) | web.dev; Chrome CrUX blog |
| P2 | A denial is permanent. | fact | A | web.dev; MDN |
| P3 | Chrome automatically moves sites with very low Accept rates to the quieter permission UI (B). The Chromium post is bot-blocked, and the search-summary additions are C. | fact | B / C | Chrome CrUX blog |
| P4 | iOS: users manage permission per web app in Notifications Settings, with Focus integration. Badging permission is granted with notification permission. | fact | B (each) | WebKit 13878; WebKit 13966 |
| P5 | Notifications should be "timely, relevant, and precise". | opinion | B | web.dev |

## 7. GitHub Mobile (unchanged)

| ID | Statement | Kind | Grade | Sources |
|---|---|---|---|---|
| G1 | Push types are mentions, assignments, review requests and deployment approvals, each with a toggle, plus Working Hours (A). Installing the app opts you into web notifications (B). | fact | A (F-gh-11) / B | GitHub configuring; GitHub blog 2021 |
| G2 | "Team mentions and team review requests are excluded from all the additional push notification types." | fact | B | GitHub blog |
| G3 | Being assigned subscribes you by default. | fact | B | GitHub about notifications |
| G4 | github.com push latency is not documented. GitHub Enterprise Server warns of possible delay (B). | n.d. / fact | — / B | GitHub configuring |
| G5 | Whether your own or a bot's assignment pushes to mobile is not documented. | n.d. | — | — |
| G6 | The `issues` event has an `assigned` activity type. | fact | B | GitHub events |

## Proposed library entries

- **None new.**
- F-gh-13 stays as filed, without a scope claim. T10 now matches it.
- T10b is single-page, so it is not proposed.

---

## Six-part contract

**1. What I changed**
- **T2:** the count is now six, and every entry is named with its date and title. The "seventh entry" is withdrawn.
- **T10:** the classic-token scope claim is dropped and recorded as not settled. The row now states only the endpoint, its body limits and the 204 response.
- **X5:** the verbatim quote is cut to the two sentences I confirmed. The rest is marked as substance only, and the "Cloudflare will therefore block…" sentence is no longer quoted.
- **X7:** the single paraphrase is replaced with the page's two transient-activation sentences, each with its section.

**2. Why**
- The source check failed T2: it found six entries, and there was no seventh.
- It asked me to either settle T10 with a raw read or drop the scope claim. I can't do a raw read, so I dropped it.
- It found the X5 quote was paraphrase-level and the X7 wording didn't match the page.

**3. What I verified** (4 summarising fetches; no shell, no search)
- **CF Pages changelog:** six entries (listed in T2), and none mentions cron or scheduled runs.
- **GitHub REST repos article body:** the fetch printed the "repo scope" sentence both inside the dispatch section and among the "three lines before" the heading. That is self-contradictory, so it settles nothing. The body limits and the 204, 404 and 422 codes were returned.
- **MDN `openWindow`:** both transient-activation sentences returned verbatim, from different sections.
- **CF Access CORS `index.md`:** the two X5 sentences returned verbatim. The third sentence was not returned.

**4. What is undone**
- The T10 scope claim needs a raw read.
- T10b was not re-checked.
- These are not documented: W2 (primary source), X1, X2, X7 (after a lapsed session), X9, G4, G5, Free-plan eligibility for Workflows cron and DO alarms, and Declarative Web Push outside Apple.
- P3 still lacks the Chromium post.

**5. What is needed outside my lane**
- The Orchestrator should save this memo in place of revision 5.
- The Source checker should re-check T2, T10, X5 and X7.
- Someone with a raw-read tool could settle the T10 scope (Q-k). It's optional, since the claim is dropped.

**6. Open questions** (none closed)
- **Q-d:** Does a primary page say iOS tabs can't subscribe?
- **Q-e:** Has Pages gained cron?
- **Q-f:** How does Access treat service-worker, manifest and click-through requests after its session expires? It's not documented and would need a test.
- **Q-g:** Does a bot's assignment push to GitHub Mobile?
- **Q-h:** Are Workflows cron schedules available on Free?
- **Q-i:** Are DO alarms available on Workers Free?
- **Q-j:** Does Chrome or Android support Declarative Web Push?
- **Q-k:** Which classic-token scope does the dispatches endpoint need? It needs a raw read of GitHub's docs or its OpenAPI description (operation `repos/create-dispatch-event`).
- Q-a to Q-c carry over.

Sources:
- [CF Pages changelog](https://developers.cloudflare.com/changelog/product/pages/)
- [GitHub REST repos (article body)](https://docs.github.com/api/article/body?pathname=/en/rest/repos/repos)
- [MDN openWindow](https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow)
- [CF Access CORS](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/cors/index.md)
- [MDN notificationclick](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event) (not re-opened this round)
- [GitHub fine-grained PAT permissions](https://docs.github.com/api/article/body?pathname=/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens) (not re-opened this round)
- [WebKit 16535](https://webkit.org/blog/16535/meet-declarative-web-push/)
- [WebKit 16574](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/)
- All other sources are as listed in earlier revisions (research/Q-011-memo.md).
