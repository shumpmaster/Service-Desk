Verdict: PASS

I re-opened only the four rows changed in revision 6: T2, T10, X5 and X7. All were read through summarising fetches, not byte-exact. I did not re-open the "unchanged" rows. They stay as passed in earlier rounds, because the feedback file records no failures on them.

**Findings**
- **T2 passes** (research/Q-011-memo.md:80). The Pages changelog lists six entries, with the same dates and titles the memo names. The fetch first printed "5" and then corrected itself to 6 while listing six numbered items. None mentions cron or scheduled runs. The "seventh entry" is rightly withdrawn.
- **T10 passes** (memo:88). The memo now claims only the endpoint, `event_type` (100 characters or fewer), `client_payload` (at most 10 top-level properties, under 64 KB) and the 204 response.
  - It no longer claims a token scope. This round's fetch put the "repo scope" sentence in the dispatch section, but earlier rounds conflicted on that, so dropping the claim is correct.
  - `library/facts/F-gh-13.md:4` is consistent with this: it makes no scope claim.
- **X5 passes** (memo:102). Both quoted sentences came back verbatim from the Cloudflare Access CORS `index.md`. The three fixes match. I did not verify the `credentials: 'same-origin'` and `"use-credentials"` advice this round. The memo marks that part as substance only, which is fair.
- **X7 passes** (memo:104). The `openWindow` page returned both transient-activation sentences verbatim: "At least one window in the app's origin must have transient activation" (Security requirements) and "none of the windows … have transient activation" (Exceptions). The return-value sentence and the Chrome for Android sentence also match.
- **Library:** the memo proposes no new entries (memo:132), so I filed none. F-gh-13 is unchanged, and I edited nothing.

**Open questions**
- **Payload size conflict:** T10 states "under 64 KB" from the REST page alone. F-gh-13:4 records that the events page says 65,535 characters and the figures conflict. The row is graded B, so it is not wrong. The Researcher should not treat 64 KB as settled.
- **Still unconfirmed, as the memo says:**
  - The T10 token scope (Q-k) needs a raw read.
  - T10b was not re-opened.
  - P3 lacks the Chromium post.
  - W2 has no primary source.
  - Q-d, Q-e, Q-f, Q-g, Q-h, Q-i and Q-j remain not documented.