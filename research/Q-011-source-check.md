Verdict: FAIL

The nine proposed entries passed and I filed them, but the memo still has claims I could not confirm. I made no commits, because the folder is not a git repository. The sources were opened as raw pages, not through a summarising fetch. I fetched raw text for the RFCs, the Apple `.md` page, the web.dev, MDN and Chrome pages, Cloudflare `index.md` and the GitHub article bodies.

**Filed in `library/` (all dated 2026-10-08)**
- **`facts/F-webpush-02b.md`** (a Topic replaces a pending push):
  - RFC 8030 §5.4 reads "A push message with a topic replaces any outstanding push message with an identical topic" (rfc8030.txt, line 748).
  - web.dev says Topics "replace a pending messages". Apple says "coalesce" (apple.md, line 66).
- **`facts/F-webpush-05.md`** (4096-byte payload limit, grade A):
  - RFC 8030 (line 1115), RFC 8291 (line 365), web.dev and Apple's "4 KB" error (apple.md, line 105) all confirm the limit.
  - Only RFC 8291 says `aes128gcm` and single-record encryption (lines 352 and 374), so that part is stated as single-source.
  - I did not file the memo's "about 3,993 octets" figure.
- **`facts/F-webpush-06.md`** (response codes):
  - I corrected the memo's shorthand "404 or 410 = expired". Apple's 404 means an invalid `:path` (apple.md, line 84). Apple's 410 means the token expired (line 86).
  - RFC 8030 §7.3 says expired subscriptions get a 404. web.dev says 404 means expired and 410 means gone.
  - The entry states each code per publisher.
- **`facts/F-webpush-07.md`** (service worker, push while the page is closed, HTTPS):
  - Confirmed by MDN Push API, Apple (apple.md, line 28), web.dev overview and MDN `register()`.
  - Apple does not state the HTTPS rule.
- **`patterns/P-notify-permission-01.md`** (ask for permission inside a user action):
  - I graded it B, not the memo's A. web.dev and developer.chrome.com are both Google, and the advice is a quality claim that needs an independent source.
  - MDN independently confirms only the denied/default behaviour.
- **`facts/F-cf-kv-01b.md`** (KV Free: 1,000 deletes and 1,000 lists a day, reset at 00:00 UTC): confirmed on the KV pricing page (lines 23–24) and the Workers pricing page. Same-publisher pages count under `governance/standards/sources.md`.
- **`facts/F-cf-do-free-01.md`** (Workers Free allows only SQLite-backed Durable Objects): the 100,000 requests a day, 13,000 GB-s a day and 5 GB are on both Cloudflare pages. The 5 million rows read and 100,000 rows written a day are on the DO pricing page only (line 88–89), so I labelled them single-source.
- **`facts/F-cf-access-svc-01.md`** (service-token headers and the "Service Auth" action): confirmed on the service-tokens page (lines 145 and 159–161) and the CORS page (lines 139 and 197–198).
- **`facts/F-gh-13.md`** (`repository_dispatch` and the 10-property limit on `client_payload`): both GitHub pages confirm it. I filed it with no size figure, because the events page says 65,535 characters and the REST page says "less than 64KB". That answers the memo's open request.

**Why FAIL**
- **T10, token scope:** the memo says a classic PAT needs `repo` scope, from the REST page. That sentence on the page belongs to the create-repository endpoint, not the dispatch endpoint. I dropped the claim from `F-gh-13`.
- **T6, Cron Triggers "counted as requests":** the Workers pricing page has no such sentence.
- **G2, team mentions excluded from push (GitHub blog):** confirmed on the blog page.
- **Rows I did not open:** I did not open W12 (MDN BCD), X5, X7, T2, T7's date, T9's time-zone text or the Chromium blog. None is proposed for filing, but they remain unchecked.
- **Rows I confirmed:**
  - Cron: UTC, up to 15 minutes to propagate, 5 triggers on Free.
  - Access: the AJAX sentence and the `X-Requested-With` header, plus the session range of 15 minutes to one month with a 24-hour default.
  - Secrets: `wrangler secret put` deploys immediately.
  - Web Crypto: the primitives listed.
  - Workflows cron: confirmed.
  - WebKit: the manifest `display` wording, per-app Notifications Settings, Focus, and no Developer Program needed.
  - web.dev FAQ: the ten-day heuristic and "unreliable".
  - GitHub: the mobile push types, Working Hours and the delay note; the 5-minute and 60-day schedule rules; the `assigned` activity type.
  - Billing: free for public repositories.
  - DO billing: SQLite storage billing starting no earlier than 7 January 2026.

**Open questions**
- Should the Researcher correct T10 and T6, or drop them?
- Q-d (a primary page saying iOS Safari tabs cannot subscribe to push) and Q-e (Cron Triggers on Pages after September 2024) remain open.
- Do the Free-plan Durable Object storage limits still hold after SQLite storage billing began? I set a 3-month shelf life on `F-cf-do-free-01` for this reason.
