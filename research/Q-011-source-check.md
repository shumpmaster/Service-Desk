Verdict: FAIL

I filed one narrowed entry. T10 can't be ruled on, and X5 and X7 are still unopened. Every page below went through a summarising fetch, not a raw read. Nothing was committed, because the folder is not a git repository.

**Filed**
- `library/facts/F-webpush-08.md` is Declarative Web Push (D1).
  - **Grade A** covers only these two points, which both WebKit pages support:
    - Availability on iOS/iPadOS 18.4 for Home Screen web apps. 16574 says: "Declarative Web Push is now available on iOS and iPadOS 18.4 for web apps added to the Home Screen."
    - Subscribing and showing notifications without an installed service worker (16535).
  - **Single-page detail (16535 only)**, kept in the entry but labelled single-page: the `"web_push": 8030` payload, the required `title` and `navigate`, and the service-worker override and fallback.
  - The memo proposed all of this as grade A, so I narrowed it.
  - 16535 mentions Home Screen apps only in connection with Badging, which is not the same statement as 16574's.
  - The "other browsers not documented" line is an absence claim. I only read two pages.

**Confirmed (fetched this round)**
- **W12:** the Chrome note reads "The `options` parameter with a `applicationServerKey` value is required." `webview_android` is `false` (MDN BCD PushManager.json).
- **T7:** the Workflows changelog entry is dated Jun 2, 2026. The quote is exact, and the page names no plan.
- **T9:** the GitHub events page has the UTC and IANA timezone sentence and the DST "advance to the next valid time" sentence.
- **T2, mostly:** no Pages changelog entry mentions cron. The tool lists entries for 11 Aug 2026, 23 Jan 2026, 30 May 2025, 22 Mar 2025 (two entries) and 17 Mar 2025.
  - That is seven entries, not the memo's six.
  - The date range matches.
  - T2 stays grade B and is not filed.

**Why FAIL**
- **T10 (classic-PAT scope):** I can't rule on it.
  - The summarising fetch of the REST page puts "need the repo scope to use this endpoint" under "Create a repository dispatch event". That matches the Researcher's reading.
  - The previous round's raw read said the sentence belonged to the create-repository endpoint.
  - These two readings conflict, and a summary can't settle it.
  - It needs a raw read of the section boundary. Until then it is unverifiable, and `F-gh-13` stays without the scope claim.
- **X5 and X7:** I did not open the Cloudflare Access CORS page or the MDN `notificationclick` and `openWindow` pages this round. They are unchecked.
- **P3:** the Chromium blog post is bot-blocked, so the claim rests on the CrUX blog only (B). I did not re-open it.
- **W2:** it has no primary source. This is correctly graded C and not filed.

**Open questions**
- Can someone with raw access settle T10 by reading the heading and paragraph order in the `api/article/body` output? Alternatively, drop T10's scope claim.
- X5 and X7 need a raw open next round. Should the Researcher drop them instead?
- Q-d, Q-e, Q-h, Q-i and Q-j remain not documented.
