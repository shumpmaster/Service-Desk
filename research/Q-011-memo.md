# Q-011 memo, revision 2

I fixed every claim in `research/Q-011-source-check.md`. Seven now have a second page, and I corrected one wrong citation (Apple Support 120681, row P2). Three claims are still on one page or unproven, and I now label them that way. Unchanged rows from revision 1 stand as written in `research/Q-011-memo.md`. This revision replaces only the rows and proposals listed below. All pages were read through a fetch tool that summarises, except the Apple page (raw markdown) and the RFC 8030 text, which came back quoted in full.

**Researcher, 2026-10-08. Depth 3. Topics: notifications, web-push, cloudflare, github.** Grades: A = two different pages; B = one page; C = secondary or inferred.

## Revised rows

| # | Statement | Kind | Grade | Sources (quote as fetched) |
|---|---|---|---|---|
| W1 (rev) | On iOS/iPadOS 16.4+, Apple, WebKit and MDN all describe Web Push **for Home Screen web apps**. Apple: "Add web push to Home Screen web apps in iOS 16.4 or later". WebKit: "adding support for Web Push to Home Screen web apps". MDN compat note for Safari iOS: "Notifications are supported in web apps saved to the home screen." | fact | A | Apple doc; WebKit blog 2023-02-16; MDN browser-compat-data `api/PushManager.json` |
| W1a (new) | That iOS Safari **tabs** cannot use Web Push (the "only"): **no primary page I read says this outright.** Only press articles (9to5Mac, AppleInsider) say it, and I do not use them as sources. | estimate | C | — |
| W3 (unchanged) | A manifest `display` of `standalone` or `fullscreen` makes the site open as a Home Screen web app. I found no second page. | fact | B | WebKit blog |
| W5 (rev) | **Safari revokes push permission when a push shows no notification.** Apple: "Safari doesn't support invisible push notifications… If you don't, Safari revokes the push notification permission for your site." WebKit: "Violations of the `userVisibleOnly` promise will result in a push subscription being revoked." Caveat: the WebKit post (Meet Web Push, 2022) was written for Safari 16 on macOS. The Apple page covers iOS web apps and macOS together. | fact | A (Safari as a whole); B for iOS specifically | Apple doc; WebKit "Meet Web Push" |
| W9 (rev wording) | Apple: 410 = "The device token has expired"; 429 = "too many requests for the same destination"; payload limit "4 KB"; allow `https://*.push.apple.com`; don't refresh the JWT more than once an hour. | fact | B | Apple doc (re-fetched raw) |
| W10 (rev) | **Topic:** RFC 8030 §5.4: "A push message with a topic replaces any outstanding push message with an identical topic." The Topic is at most 32 characters, and a non-conforming one gets 400. Apple calls the Topic an identifier the service "uses to coalesce notifications", with the same 32-character limit. | fact | A for the 32 characters; replacement is in the RFC (normative), and Apple's "coalesce" agrees but is not the same word | RFC 8030 (text fetched); Apple doc |
| S2 (rev) | **KV Free:** 100,000 reads a day, 1,000 writes, 1,000 deletes, 1,000 lists, 1 GB. Max 1 write per second to the same key (429 beyond that). Writes "can take up to 60 seconds (or the value of the `cacheTtl`…)" to be visible elsewhere. | fact | Two Cloudflare pages per part. **No independent publisher**, see part 5 | KV limits + KV pricing (figures); How KV works + Write key-value pairs (60 s, 1 per second) |
| T1 (rev) | **Pages has no Cron Triggers:** the matrix shows "Cron Triggers ✅ Workers ❌ Pages". The Builder Day post (2024-09-26) says Workers can "use features that are not yet supported in Pages, including… Cron Triggers". Note "not yet": this may change, and the blog is two years old. | fact | A (two Cloudflare pages, one dated) | Migration matrix; Cloudflare blog Builder Day 2024 |
| T1a (new) | A Pages Function can call a Worker through a **service binding**. Bindings page: "Service bindings enable you to call a Worker from within your Pages Function." Matrix: "Service bindings ✅ ✅" (Workers and Pages). | fact | A | Pages bindings; migration matrix. A third page, "Call Workflows from Pages", was seen in a search summary only and not fetched |
| T4 (rev) | Actions `schedule`: "can be delayed during periods of high loads… start of every hour… some queued jobs may be dropped" (events page; troubleshoot-workflows page). Public repositories: "scheduled workflows are automatically disabled when no repository activity has occurred in 60 days" (events page; disable-and-enable page). | fact | A for each part | Events page; Troubleshoot workflows; Disable and enable workflows |
| P2 (corrected) | **Correction:** Apple Support 120681 does **not** mention web apps (fetched: it covers notification settings for installed apps only). I withdraw it as a source. WebKit: users "manage those permissions per web app in Notifications Settings"; notifications "integrate with Focus"; "it's easy for people to get into situations where they are overwhelmed". Apple doc: users "can configure badging permissions for your Home Screen web app in Notifications settings". | fact | A for per-app settings (WebKit + Apple doc on badging); B for Focus and the quote | WebKit blog; Apple doc |

## Revised proposals for the library

- **F-webpush-01 amendment:** add the MDN compat note as a third source for the Home Screen statement. Keep "only" out of the claim (W1a is C).
- **F-webpush-04 (new; web-push; A; 6 months):** Safari doesn't support invisible pushes and revokes push permission or the subscription if a push shows no notification. Sources: Apple doc, WebKit "Meet Web Push". Note that the WebKit post is about macOS Safari 16.
- **F-webpush-02 amendment:** add "a push with a Topic replaces any outstanding message with the same Topic (RFC 8030 §5.4); Apple describes this as coalescing."
- **F-cf-cron-01 (revised; cloudflare; A; 6 months):** Pages has no Cron Triggers; a Worker is needed. Sources: migration matrix; Builder Day 2024 blog ("not yet supported in Pages").
- **F-cf-pages-svc-01 (new; cloudflare; A):** a Pages Function can call a Worker through a service binding. Sources: Pages bindings; migration matrix.
- **F-cf-kv-01 (revised; cloudflare, cost; two same-publisher pages per part):** Free limits; 1 write per second per key; up to 60 s to be visible elsewhere. Sources: KV limits, KV pricing, How KV works, Write key-value pairs. The Source checker decides whether the independent-source rule can be met.
- **F-gh-12 amendment / F-gh-12b (github, automation; A):** schedule runs may be delayed at high load and queued jobs dropped; disabled after 60 days without activity in public repositories. Sources: events page + troubleshoot-workflows; events page + disable-and-enable.
- **P-notify-01: withdrawn** as a library entry. It stays in the memo as a grade-C opinion only.

## Six-part contract

1. **What I changed:**
   - Rewrote W1, W5, W9, W10, S2, T1 and T4.
   - Added W1a and T1a.
   - Corrected P2's citation.
   - Revised or added seven proposals and withdrew P-notify-01.
   - No files were written (no write lane).
2. **Why:**
   - The source check found claims that rested on one page.
   - It found that "only" and "replaces" were not seen on any page.
   - My own re-fetch found that Apple Support 120681 doesn't support P2.
3. **What I verified:** 4 searches and 15 fetches this round.
   - Apple doc (raw): Home Screen wording, invisible-push revocation, Topic "coalesce", status codes, badging settings. It has no "only".
   - WebKit 13878: Home Screen, display, per-app settings, Focus, "overwhelmed". It has no revocation and no "only".
   - WebKit "Meet Web Push": `userVisibleOnly` revocation.
   - MDN BCD PushManager: the Safari iOS note.
   - Apple Support 120681: no web-app content.
   - RFC 8030 §5.4: the full text, including replacement.
   - CF migration matrix: Cron ❌ Pages; service bindings ✅ Pages; DO 🟡.
   - CF Builder Day blog: "not yet supported in Pages… Cron Triggers".
   - CF Pages bindings: the service-binding sentence; no mention of cron.
   - CF KV pricing and KV write pages: figures, 60 s, 1 write per second.
   - GitHub troubleshoot-workflows: delay and drop.
   - GitHub disable-and-enable: 60 days.
   - GitHub workflow-syntax: none of the delay, drop or 60-day rules.
4. **What is undone:**
   - W3 still rests on WebKit alone.
   - W1a ("only") has no primary source.
   - Rows the checker did not open (W4, W6, W7, W11, W13, W16, S4, S5, X1–X7, P1, P3–P5, T6, G2, G4–G7). I re-fetched only the Apple doc among them, and it confirms W4, the Apple half of W6, W9 and S1.
   - The earlier gaps (W14, W15, G5, G6, X6) are unchanged.
5. **Needed outside my lane:**
   - The Source checker should rule on whether two same-publisher Cloudflare pages are enough for the KV limit claims. The standard asks for an independent source, and I could find none that is primary.
   - The same question applies to T3 and T6.
   - On the earlier `.env*`/`.npmrc` flag: this round's pack listing shows no such files, so the earlier flag may have come from a different pack build. The Orchestrator should confirm.
6. **Open questions** (added, none closed):
   - Q-d: Does Apple say anywhere first-hand that iOS Safari tabs (not installed) cannot subscribe to push?
   - Q-e: Has Cloudflare added Cron Triggers to Pages since September 2024? The blog says "not yet".
   - Q-a, Q-b and Q-c stand as before.

Sources (new or re-fetched this round):
- [Apple: Sending web push notifications](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers.md)
- [WebKit: Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [WebKit: Meet Web Push](https://webkit.org/blog/12945/meet-web-push/)
- [MDN browser-compat-data: PushManager.json](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/PushManager.json)
- [Apple Support 120681](https://support.apple.com/en-us/120681) (withdrawn as a source)
- [RFC 8030 text](https://www.rfc-editor.org/rfc/rfc8030.txt)
- [Cloudflare: Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Cloudflare blog: Builder Day 2024](https://blog.cloudflare.com/builder-day-2024-announcements/)
- [Cloudflare: Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Cloudflare: Call Workflows from Pages](https://developers.cloudflare.com/workflows/build/call-workflows-from-pages/) (search summary only)
- [Cloudflare: KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [Cloudflare: KV write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/)
- [GitHub: Troubleshoot workflows](https://docs.github.com/en/actions/how-tos/troubleshoot-workflows)
- [GitHub: Disable and enable workflows](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows)
- [GitHub: Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [9to5Mac](https://9to5mac.com/2023/02/16/iphone-web-app-new-features-ios-16-4/), [AppleInsider](https://appleinsider.com/articles/23/02/16/developers-can-send-push-notifications-to-web-apps-in-ios-164) (press, not used as sources)
