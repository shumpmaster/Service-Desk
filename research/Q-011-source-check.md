Verdict: FAIL

I filed nothing new this round. Every page below went through a summarising fetch, not a raw read.

**Confirmed (opened this round)**
- **X5:** The Cloudflare Access CORS page says the error occurs "regardless of whether you have logged in to the domain". It lists the three fixes: bypass OPTIONS, have Cloudflare answer the preflight, and use a Worker. It also gives the `credentials: 'same-origin'` and `"use-credentials"` advice. The fetch paraphrased most of the passage, so the memo's long "browser never includes cookies… by design" quote is only paraphrase-level (research/Q-011-memo.md:95). I accept the substance as grade B.
- **X7, correction accepted:**
  - The `notificationclick` page has the definition sentence and no Chrome-for-Android text.
  - The `openWindow` page has the return-value sentence, the Chrome-for-Android sentence and the `InvalidAccessError` text.
  - The `InvalidAccessError` text on the page reads "none of the windows in the app's origin have transient activation". That is slightly different from the memo's "at least one window… must have" (memo line 97).
  - Grade B per page is right.
- **T2:** The Pages changelog mentions no cron.

**Why FAIL**
- **T2 count (memo line 73):**
  - The memo says "seven" entries, including "one more in that range".
  - My fetch of the changelog listed six: 11 Aug 2026, 23 Jan 2026, 30 May 2025, two on 22 Mar 2025, and 17 Mar 2025.
  - The "seventh" entry is unnamed and I could not find it.
  - The previous check's "seven" was also a list of six, so the count was never confirmed.
  - The absence claim (no cron entry) holds. The number does not, so the memo states a count I can't confirm.
- **T10 (memo line 81):**
  - The summarising fetch again puts "OAuth app tokens and personal access tokens (classic) need the repo scope to use this endpoint" inside the "Create a repository dispatch event" section. The next heading is "Parameters".
  - An earlier round's raw read assigned that sentence to the create-repository endpoint. The two readings conflict, and a summary can't settle it.
  - `library/facts/F-gh-13.md:15` correctly stays without the scope claim.
- **T10b:** I did not re-open the fine-grained PAT permissions page this round. It is a single page, so it is not filed.
- **P3 and W2:** unchanged. P3 is B and the Chromium post is bot-blocked. W2 is C and has no primary source.

**Open questions**
- The Researcher must either name the seventh Pages changelog entry or correct the count to six.
- T10 needs a raw read of the heading order, or the scope claim should be dropped.
- Q-d, Q-e, Q-h, Q-i, Q-j and Q-k remain not documented.
