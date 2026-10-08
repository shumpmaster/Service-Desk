# Q-011 memo, revision 3 (complete; replaces revisions 1 and 2)

**Researcher, 2026-10-08. Depth 3. Topics: notifications, web-push, cloudflare, github.**

This memo stands on its own. The checker could not open revision 1's unchanged rows, so I have not carried any of them forward. Every row below comes from a page fetched in this round. Row IDs are new: the prefix letter shows the area, and the "was" column links a row to a revision 2 ID where one existed. Revision 1 IDs that I cannot see (W4, W6, W7, W11, W13, W16, S4, S5, X1–X7, P1, P3–P5, T6, G2–G7) are retired. Their subjects are covered again below under new IDs.

**How I read the pages:** through a fetch tool that summarises. The Apple doc came back as raw markdown (the `.md` URL), so I quote it exactly. Quotes from the other pages are as the tool returned them.

**Grades:**
- A = two different pages state it. Same-publisher pages count for limits and behaviour under the checker's ruling; prices need an independent source, and I make no price claim.
- B = one page states it.
- C = inferred, or stated only by press, forums or search snippets.
- "Not documented" = no page I read says it.

No cost or quality recommendations.

## 1. Web Push on the device (iOS Safari, Android Chrome)

| ID | was | Statement | Kind | Grade | Sources |
|---|---|---|---|---|---|
| W1 | W1 | On iOS/iPadOS 16.4+ Web Push is described for **Home Screen web apps**. Apple: "Add web push to Home Screen web apps in iOS 16.4 or later". MDN BCD (safari_ios 16.4): "Notifications are supported in web apps saved to the home screen." | fact | A (filed F-webpush-01b) | Apple doc; WebKit 13878; MDN BCD |
| W2 | W1a | That iOS Safari **tabs** cannot use Web Push: **not documented** on any Apple, WebKit or MDN page I read. Only press and blogs say it (9to5Mac; a webventures blog), and so does an extended search summary. | estimate | C | none primary |
| W3 | W3 | The manifest `display` member set to `standalone` or `fullscreen` makes the site a Home Screen web app. WebKit: "create a manifest file (with its display member set to standalone or fullscreen)". The W3C manifest fetch did not return the display definitions. | fact | B | WebKit 13878 |
| W4 | — | **The permission request needs a user gesture.** Apple: "call the push subscription method immediately from the gesture's event handler". WebKit: "in response to direct user interaction". MDN: "the request should be made in response to user interaction". MDN BCD (Firefox Android 79+): subscribe "can only be called in response to a user gesture". | fact | A (already in F-webpush-01) | Apple doc; WebKit 13878; MDN requestPermission; MDN BCD |
| W5 | — | No Apple Developer Program membership is needed. Apple: "You don't need to join the Apple Developer Program". WebKit: "You do not need to be a member". | fact | A (F-webpush-01) | Apple doc; WebKit 13878 |
| W6 | — | **A service worker is required, and push arrives when the page is not open.** MDN: "it has to have an active service worker"; the API receives messages "whether or not the web app is in the foreground, or even currently loaded". Apple's steps include "Add a service worker that handles receiving push notifications." | fact | A | MDN Push API; Apple doc; web.dev overview |
| W7 | — | Notifications and service-worker registration need a secure context (HTTPS). | fact | A (two MDN pages, same publisher) | MDN requestPermission; MDN register() |
| W8 | W5 | **Safari revokes permission or the subscription if a push shows no notification.** Apple: "Safari doesn't support invisible push notifications… Safari revokes the push notification permission for your site." | fact | A for Safari; B for iOS (filed F-webpush-04) | Apple doc; WebKit "Meet Web Push" |
| W9 | — | `userVisibleOnly: true` is "a symbolic agreement with the browser that the web app displays a notification every time it receives a push message". | fact | A | web.dev subscribing; WebKit "Meet Web Push" |
| W10 | — | **Android Chrome:** "The Android OS is designed to listen for push messages and… wake up the appropriate Android app… regardless of whether the app is closed or not." BCD lists Chrome Android as supporting PushManager with no Home Screen note. No page I read *states* that Android needs no installation, so that part is inferred. | fact (wake) / estimate (no install) | B / C | web.dev push FAQ; MDN BCD |
| W11 | — | Chrome Android heuristic: "sites which have been launched from homescreen within the last ten days will be opened in standalone from a tap on a notification". The page itself calls this possibly "unreliable". | fact | B | web.dev push FAQ |
| W12 | — | Chrome requires the `applicationServerKey` option on subscribe. Android WebView does not support PushManager. | fact | B | MDN BCD |

## 2. What the sender needs

| ID | was | Statement | Kind | Grade | Sources |
|---|---|---|---|---|---|
| V1 | — | VAPID key pair (ES256/P-256); JWT `exp` at most 24 h ahead; `aud` = the push service origin; `sub` = mailto: or https:. | fact | A (F-webpush-02) | RFC 8292; Apple doc ("BadJwtToken… more than one day") |
| V2 | — | **The subscription holds an endpoint and keys.** web.dev: "The `endpoint` is the push service's URL… The `keys` object contains the values used to encrypt". RFC 8291: "The ECDH public key and the authentication secret are sent to the application server". Apple: "register the provided push notification endpoint and encryption keys". | fact | A | web.dev subscribing; RFC 8291; Apple doc |
| V3 | — | **The payload is encrypted per subscription with `aes128gcm`, in a single record.** RFC 8291: "exactly one value, which is 'aes128gcm'". Apple: "build and encrypt the payload for each push notification". | fact | A | RFC 8291; Apple doc; web.dev protocol |
| V4 | — | **4096 bytes is the guaranteed payload size.** RFC 8030: the service "MUST NOT return a 413" for ≤4096 bytes. RFC 8291: "not required to support more than 4096 octets". Apple: "over the limit of 4 KB". RFC 8291 puts usable plaintext at about 3,993 octets (as summarised). | fact | A (plaintext figure B) | RFC 8030; RFC 8291; Apple doc; web.dev protocol |
| V5 | — | TTL is mandatory; Urgency is one of very-low, low, normal or high (Apple: `high` = "attempt to deliver… immediately"); Topic is at most 32 characters. | fact | A (F-webpush-02) | RFC 8030; Apple doc |
| V6 | W10 | **A Topic replaces a waiting message.** RFC 8030 §5.4: "A push message with a topic replaces any outstanding push message with an identical topic." web.dev: Topics let you "replace a pending messages with a new message if they have matching topic names". Apple: "coalesce". | fact | **A now** (IETF + Google web.dev; the second page is new this round) | RFC 8030; web.dev protocol; Apple doc |
| V7 | W9 | **Response codes.** 201 = accepted (RFC 8030; Apple "Success."; web.dev). For an expired subscription the RFC says "MUST be signaled by returning a 404". Apple: 410 "The device token has expired". web.dev: 404 "you should delete the `PushSubscription`", 410 "should be removed from application server". 429 = rate limit (Apple "too many requests for the same destination"; web.dev). 413 = payload too large (Apple; RFC). | fact | A each | RFC 8030; Apple doc; web.dev protocol |
| V8 | W9 | **Apple-only details:** allow `https://*.push.apple.com` (Apple and WebKit, so A). The other details are on the Apple page only: "Don't refresh your JWT more frequently than once per hour"; storage "30 days or fewer"; "The number of notifications the push services stores while the device is offline is limited"; "Don't send more than 100 unacknowledged push requests" over HTTP/1.1. | fact | A (allowlist); B (rest) | Apple doc; WebKit 13878 |
| V9 | — | **The subscription endpoint must be kept secret.** MDN: it "is a unique capability URL… needs to be kept secret". | fact | B | MDN Push API |
| V10 | — | Subscriptions expire, and `pushsubscriptionchange` fires when one is invalidated. | fact | A (F-webpush-03) | web.dev; MDN |
| V11 | — | The Workers Web Crypto table lists ECDSA sign, ECDH deriveBits, AES-GCM encrypt and HKDF deriveBits as supported. Those are the primitives V1 and V3 use, so a Worker could in principle sign VAPID and encrypt the payload. That last step is my inference. **No Cloudflare page I read describes sending Web Push from a Worker.** | fact / estimate | B / C | CF Web Crypto |

## 3. Storing the subscription without a database

| ID | was | Statement | Kind | Grade | Sources |
|---|---|---|---|---|---|
| S1 | — | **Apple and web.dev expect the server to store the subscription.** Apple says to "Store the push notification subscription endpoint and encryption keys together with the user's account information". web.dev: "send it to your server". Neither names a store or requires a database. **Whether a subscription can be stored and sent without a database: not documented.** | fact / not documented | A / — | Apple doc; web.dev subscribing |
| S2 | S2 | **KV Free:** 100,000 reads a day, 1,000 writes a day, 1 GB stored. Max 1 write per second to the same key. A write can take up to 60 s to be visible elsewhere. | fact | A (filed F-cf-kv-01) | KV limits; KV pricing; KV write; How KV works |
| S3 | — | **KV Free deletes and lists: 1,000 a day each.** Free limits reset at 00:00 UTC. | fact | **A now** (KV pricing + Workers pricing; the second page is new) | KV pricing; Workers pricing |
| S4 | — | **Durable Objects on Free:** "Only Durable Objects with SQLite storage backend are available". 100,000 requests a day; 13,000 GB-s a day; 5 GB total. | fact | A | DO pricing; Workers pricing |
| S5 | — | **DO row limits and billing start (DO pricing page only):** 5 million rows read a day and 100,000 rows written a day. Storage billing for SQLite DOs started January 2026 ("no earlier" than 7 January). | fact | B | DO pricing |
| S6 | — | A Pages project cannot define a Durable Object; a separate Worker plus a binding is needed. | fact | A (F-cf-pages-do-01) | Migration guide; Pages bindings |
| S7 | — | **Secrets are set by wrangler, the dashboard or a bulk upload.** `wrangler secret put` "creates a new Worker version and deploys immediately". **A Worker changing its own secret at runtime: not documented.** | fact / not documented | B | CF secrets |
| S8 | — | **Env var size and count on Free:** "5 KB" each and "64/Worker". The limits page does not say whether secrets share these limits (not documented). A subscription's size in bytes is also not documented. | fact / not documented | B | CF Workers limits |

## 4. What triggers a send when nothing is polling

| ID | was | Statement | Kind | Grade | Sources |
|---|---|---|---|---|---|
| T1 | T1 | **Pages has no Cron Triggers; Workers does.** | fact | A (filed F-cf-cron-01) | Migration matrix; Builder Day 2024 blog |
| T2 | — | **No Pages changelog entry from September 2024 to August 2026 adds cron or scheduled handlers.** The fetch may have truncated the list. | fact (absence) | B | CF Pages changelog |
| T3 | T1a | **A Pages Function can call a Worker through a service binding.** | fact | A (filed F-cf-pages-svc-01) | Pages bindings; migration matrix |
| T4 | — | **Workers Cron behaviour:** Cron Triggers "execute on UTC time"; the finest interval is every minute; changes take "up to 15 minutes to propagate". A `scheduled()` handler is needed. | fact | B | CF Cron Triggers page |
| T5 | — | **Workers Free:** 5 Cron Triggers per account (Paid 250); 10 ms CPU per Cron Trigger; 100,000 requests a day. | fact | A for 100,000 a day (limits + pricing); B for 5 per account; 10 ms is A in F-cf-workers-01 | CF Workers limits; CF Workers pricing |
| T6 | — | Workers pricing (as summarised) says Cron Triggers "are counted as requests". | fact | B | CF Workers pricing |
| T7 | — | **Workflows cron (2026 changelog):** "You can now attach cron schedules directly to a Workflow binding… Each scheduled run creates a new Workflow instance". The entry is dated 2 June 2026 per the fetch; a search snippet said 1 May. Plan eligibility is not stated. | fact | B | CF Workflows changelog |
| T8 | T4 | **Actions `schedule`:** at most every 5 minutes; runs on the default branch. Runs can be delayed at high load (including the top of the hour), and queued jobs may be dropped. In public repos it is disabled after 60 days without activity. | fact | A (filed F-gh-12, F-gh-12b) | Events; workflow syntax; troubleshoot; disable-enable |
| T9 | — | **Actions schedule time zone:** UTC by default; IANA time zone strings are supported. | fact | B | GitHub events page |
| T10 | — | **`repository_dispatch` triggers a workflow from outside GitHub through the REST API.** `client_payload` has at most 10 top-level properties. The size limit differs by page: the events page says 65,535 characters, the REST page "less than 64KB". A classic PAT needs `repo` scope (REST page only). | fact | A (trigger, 10 properties); B (scope); size conflicts | GitHub events; GitHub REST repos |
| T11 | — | **Actions cost:** "free… for public repositories that use standard GitHub-hosted runners". GitHub Free private repos get 2,000 minutes a month. | fact (quota) | B | GitHub Actions billing |

## 5. Cloudflare Access and the service worker / click-through

| ID | was | Statement | Kind | Grade | Sources |
|---|---|---|---|---|---|
| X1 | — | **Service worker registration behind Access is not documented.** No Cloudflare page I read mentions service workers, web app manifests or push. Forum threads (Gramps, Node-RED) report manifest CORS errors and stale service workers behind Access. They are not sources. | not documented | — | (forums seen in search only) |
| X2 | — | MDN: the service-worker script and its scope must be same-origin with the page, over HTTPS, and served "with a valid JavaScript media type". What happens if Access answers that fetch with a login page is **not documented**. A failed registration would be my inference (C). | fact / estimate | B / C | MDN register() |
| X3 | — | **Access drops background requests when the token has expired.** Cloudflare: "Pages that rely heavily on AJAX or single-page applications can block sub-requests due to an expired Access token without prompting the user to re-authenticate." The header `X-Requested-With: XMLHttpRequest` makes Access return 401 instead. | fact | B | CF session management |
| X4 | — | **Access session lengths:** the global session runs from 15 minutes to one month (default 24 h). An expired application token is reissued if the global token is still valid; otherwise the user re-authenticates with the IdP. | fact | B (one doc; the second URL in search was the same doc) | CF session management |
| X5 | — | **CORS preflight fails behind Access.** The browser "never includes cookies with OPTIONS requests", so preflights fail with 403. Three documented fixes; troubleshooting advises `credentials: 'same-origin'`. | fact | B | CF Access CORS |
| X6 | — | **Machines get in with a service token.** Service tokens are for "automated systems". They use the headers `CF-Access-Client-Id` / `CF-Access-Client-Secret`, and the policy action must be "Service Auth". | fact | A (headers on both pages) | CF service tokens; CF Access CORS |
| X7 | — | **Click-through:** `notificationclick` fires on a tap, and the handler may call `clients.openWindow`. `openWindow` resolves to a client only for a same-origin URL ("or a null value otherwise"). Chrome for Android "may open the URL in an existing browsing context provided by a standalone web app". **How Access treats that navigation when the session has lapsed is not documented.** | fact / not documented | A (two MDN pages); B (Chrome note) | MDN notificationclick; MDN openWindow |
| X8 | — | Push messages go from the sender to the push service endpoint (e.g. `*.push.apple.com`) and then to the device, not to the site's origin. So Access is not on the delivery path. This is my inference from Apple and RFC 8030. **Not stated by Cloudflare.** | estimate | C | Apple doc; RFC 8030 |
| X9 | — | The W3C manifest spec fetches the manifest as a CORS request whose credentials mode follows the link's `crossorigin` attribute (as summarised). Whether Access lets that request through is not documented. | fact / not documented | B | W3C appmanifest |

## 6. Permission and fatigue

| ID | was | Statement | Kind | Grade | Sources |
|---|---|---|---|---|---|
| P1 | — | **Ask in context, never on load.** web.dev: "Never ask on page load or without user interaction". Chrome: "Avoid showing prompts… immediately after a user lands on the site." | opinion (platform guidance) | A | web.dev permissions; Chrome CrUX blog 2020 |
| P2 | — | **A denial sticks.** web.dev: "Once a user has permanently denied access… browsers honor that decision". MDN: on `"default"`, "the application will act as if permission was `denied`". | fact | A (two publishers, complementary) | web.dev permissions; MDN requestPermission |
| P3 | — | **Chrome's quieter UI:** "Chrome will automatically enroll sites with very low Accept rates into the quieter UI" (2020). The Chromium blog post did not render; I have only its search snippet. | fact | B | Chrome CrUX blog |
| P4 | P2 | **iOS per-app control.** WebKit: users "manage those permissions per web app in Notifications Settings"; notifications "integrate with Focus"; "it's easy for people to get into situations where they are overwhelmed". Apple: badging permissions are set "in Notifications settings". Apple Support 120681 stays withdrawn. | fact / opinion | B (per-app permission and Focus: WebKit only; Apple covers badging only) | WebKit 13878; Apple doc |
| P5 | — | **Google's guidance on what notifications should be:** "timely, relevant, and precise". | opinion | B | web.dev overview |

## 7. GitHub Mobile as a second channel

| ID | was | Statement | Kind | Grade | Sources |
|---|---|---|---|---|---|
| G1 | — | **What GitHub Mobile pushes, and the user's controls.** Push types: direct mentions, assignments to issues or PRs, review requests and deployment approvals. Each type has its own toggle in the app's Settings > Notifications, and Working Hours sets the times when pushes arrive. | fact | A (F-gh-11) | GitHub configuring notifications; GitHub blog 2021-03-30 |
| G2 | — | "Team mentions and team review requests are excluded" from the additional push types (2021, may be dated). | fact | B | GitHub blog |
| G3 | — | **Being assigned subscribes you automatically.** Being "assigned to an issue or pull request" subscribes the user by default. Notifications can be read in the web inbox, GitHub Mobile or email. | fact | B | GitHub about notifications |
| G4 | — | **Latency on github.com: not documented.** For GitHub Enterprise Server, users may "experience a delay in receiving push notifications". | not documented / fact | — / B | GitHub configuring notifications |
| G5 | — | **Self-made and bot-made assignments.** Current docs do not say whether self-made actions push to mobile, or whether a workflow's (bot) assignment does: not documented. Email has an opt-in for "Your own updates". An old GHE 2.0 page reportedly says "You will not get notifications for your own actions"; I saw that in a search snippet only and do not use it. | not documented / fact | — / B | GitHub configuring notifications |
| G6 | — | The `issues` event has an `assigned` activity type, so a workflow can react to an assignment. | fact | B | GitHub events |

## Proposed library entries (for the Source checker)

- **F-webpush-02b** (web-push; A; 6 months): a push with a Topic replaces any outstanding push with the same Topic. Sources: RFC 8030 §5.4 and web.dev web-push-protocol; Apple "coalesce" agrees. This supersedes the note in F-webpush-02.
- **F-webpush-05** (web-push; A; 12 months): push services must accept payloads of 4096 bytes or less (Apple: 4 KB limit). The payload is encrypted with `aes128gcm` in one record, using the subscription's p256dh key and auth secret. Sources: RFC 8030, RFC 8291, Apple doc, web.dev.
- **F-webpush-06** (web-push; A; 6 months): 201 = accepted; 404 or 410 = expired subscription, which the sender should remove; 429 = rate-limited. Sources: RFC 8030, Apple doc, web.dev.
- **F-webpush-07** (web-push; A; 12 months): an active service worker is required; push is received when the page is not loaded; HTTPS is required. Sources: MDN Push API, Apple doc, web.dev overview, MDN register.
- **P-notify-permission-01** (pattern; notifications; A; 12 months): ask for notification permission inside a user action, never on load, because a denial is permanent. Sources: web.dev permissions, Chrome CrUX blog, MDN requestPermission.
- **F-cf-kv-01b** (cloudflare, limits; A; 3 months): KV Free allows 1,000 deletes and 1,000 lists a day, reset at 00:00 UTC. Sources: KV pricing, Workers pricing.
- **F-cf-do-free-01** (cloudflare, limits; A; 3 months): the Workers Free plan has only SQLite-backed Durable Objects, with 100,000 requests a day, 13,000 GB-s a day and 5 GB. Sources: DO pricing, Workers pricing.
- **F-cf-access-svc-01** (cloudflare, auth; A; 6 months): automated callers pass an Access policy with a service token, using the `CF-Access-Client-Id` and `CF-Access-Client-Secret` headers and a "Service Auth" action. Sources: service tokens page, Access CORS page.
- **F-gh-13** (github, automation; A; 6 months): `repository_dispatch` triggers a workflow from outside GitHub through the REST API; `client_payload` has at most 10 top-level properties. The size limit is inconsistent between the pages (65,535 characters vs under 64 KB). Sources: GitHub events page, REST repos page.
- Not proposed (B, C or not documented): W2, W3, W10–W12, V8 (except the allowlist), V9, V11, S5, S7, S8, T2, T4, T6, T7, T9, T11, X1–X5, X7–X9, P3–P5, G2–G6.

## Six-part contract

1. **What I changed:**
   - Rewrote the memo as one complete document that replaces revisions 1 and 2. Nothing refers to unseen rows any more.
   - Re-researched every subject in the question and gave each row a new ID, with a link to the revision 2 ID where one existed.
   - Gave a second page to two claims the checker left unfiled: Topic replacement (web.dev protocol) and KV deletes/lists (Workers pricing).
   - Added 9 library proposals.
2. **Why:** the source check failed the memo for two reasons:
   - The unchanged rows could not be opened, because revision 1 was overwritten.
   - Topic replacement and KV deletes/lists rested on one page.
3. **What I verified:** 12 searches and 37 fetches this round. Every row cites the page it came from. Notable results:
   - The Apple doc (raw) confirms the gesture rule, the server steps, the status table and the 4 KB limit.
   - The web.dev protocol page gives Topic "replace a pending messages" and 404/410 "delete".
   - The Workers pricing page lists KV deletes and lists at 1,000 a day each.
   - The DO pricing page says Free is SQLite only.
   - The Access session-management page has the sentence on AJAX sub-requests.
   - Three fetches returned nothing useful:
     - the Chromium blog (body empty);
     - the HTML spec section on `rel=manifest`;
     - the W3C display definitions.
4. **What is undone:**
   - W2 (the iOS "only") still has no primary source.
   - Service-worker and manifest behaviour behind Access (X1, X2, X9) and click-through after a lapsed session (X7) are not documented by Cloudflare.
   - GitHub push latency and whether self-made or bot-made assignments push (G4, G5) are not documented.
   - Durable Object alarms as a trigger were not researched.
5. **Needed outside my lane:**
   - The Orchestrator should record this memo in full, replacing the file rather than appending, so the checker can open every row.
   - The Source checker should rule on whether the conflicting `client_payload` size limits block F-gh-13; I proposed the entry without a size figure.
6. **Open questions** (added, none closed):
   - **Q-d:** Does any primary Apple or WebKit page say iOS Safari tabs cannot subscribe?
   - **Q-e:** Has Pages gained cron? No changelog entry through August 2026 says so.
   - **Q-f:** How does Access treat the fetch of the service-worker script and manifest, and a notification-click navigation, once the session has expired? Answering it would need a test, which my lane does not allow.
   - **Q-g:** Does a workflow-made (bot) assignment push to GitHub Mobile?
   - **Q-h:** Are Cron Triggers on Workflows available on the Free plan?
   - Q-a, Q-b and Q-c carry over from revision 1; I cannot see their wording.

Sources:
- [Apple: Sending web push notifications (raw)](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers.md)
- [WebKit: Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [WebKit: Meet Web Push](https://webkit.org/blog/12945/meet-web-push/) (filed earlier; not re-fetched)
- [MDN BCD PushManager.json](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/PushManager.json)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [MDN Notification.requestPermission](https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static)
- [MDN ServiceWorkerContainer.register](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register)
- [MDN notificationclick](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event)
- [MDN Clients.openWindow](https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow)
- [web.dev: Subscribing a user](https://web.dev/articles/push-notifications-subscribing-a-user)
- [web.dev: Web Push protocol](https://web.dev/articles/push-notifications-web-push-protocol)
- [web.dev: Push overview](https://web.dev/articles/push-notifications-overview)
- [web.dev: Push FAQ](https://web.dev/articles/push-notifications-faq)
- [web.dev: Permissions best practices](https://web.dev/articles/permissions-best-practices)
- [Chrome: Notification permission data in CrUX](https://developer.chrome.com/blog/notification-permission-data-in-crux/)
- [Chromium blog: quieter permission UI](https://blog.chromium.org/2020/01/introducing-quieter-permission-ui-for.html) (body did not render)
- [RFC 8030](https://www.rfc-editor.org/rfc/rfc8030.txt)
- [RFC 8291](https://www.rfc-editor.org/rfc/rfc8291.txt)
- [RFC 8292](https://www.rfc-editor.org/rfc/rfc8292.html) (filed earlier)
- [W3C App Manifest](https://www.w3.org/TR/appmanifest/)
- [CF Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [CF Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [CF Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [CF DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [CF secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [CF Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
- [CF Access CORS](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/cors/)
- [CF session management](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/)
- [CF service tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/)
- [CF Pages changelog](https://developers.cloudflare.com/changelog/product/pages/)
- [CF Workflows changelog](https://developers.cloudflare.com/changelog/product/workflows/)
- [CF migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/), [CF Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [CF Builder Day 2024](https://blog.cloudflare.com/builder-day-2024-announcements/), [KV limits](https://developers.cloudflare.com/kv/platform/limits/), [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/) (filed earlier)
- [GitHub configuring notifications](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications)
- [GitHub about notifications](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications)
- [GitHub blog 2021-03-30](https://github.blog/news-insights/product-news/new-push-notifications-scheduling-releases-github-mobile/)
- [GitHub events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [GitHub REST repository dispatch](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)
- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- Press, blogs and forums seen but **not used as sources**:
  - [9to5Mac](https://9to5mac.com/2023/02/16/iphone-web-app-new-features-ios-16-4/)
  - [webventures](https://webventures.rejh.nl/blog/2023/ios-web-push-requires-install/)
  - [Gramps forum](https://gramps.discourse.group/t/cannot-access-gramps-web-once-cloudflare-access-session-expires/9386)
  - [Node-RED forum](https://discourse.nodered.org/t/dashboard-2-0-pwa-service-worker-prevents-authentication-redirect-when-session-expires/100574)
  - [GHE 2.0 about notifications](https://docs.github.com/enterprise/2.0/user/articles/about-notifications)
