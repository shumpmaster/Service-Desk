Verdict: FAIL

I filed nothing. `library/` still holds only L-F1 and L-F2, and I didn't edit either. The memo is not a complete memo, and several claims rest on sources I can't identify or open.

**Blocking problems**
- **The memo is a correction, not the memo.** `research/Q-002-memo.md` lines 1–5 say the original memo is missing and this is "revision 2". The entries it proposes (F12/L-F7, F16/L-F4 and others) depend on text I don't have.
- **F12/L-F7 can't be checked.** Lines 80–81 say the researcher can't see what F12 claims, so it stays unfiled.
- **Many cited sources have no URL.** The memo cites S1–S3, S8, S9, S11, S13, S15 and others only by number. Only S14, S16 and S18–S24 can be matched to URLs, in lines 83–92 and the closing source list. I could not open S3, which is the first source for the "every account" part of L-F6, nor S8, S9, S11 or S13.
- **Several claims are marked as unsupported by the researcher itself.** C1 (fine-grained tokens), C4 (user tokens), C5 (reviews) and C6 (`performed_via_github_app` in workflows) are marked C or "needs a live test" (lines 16–21, 61, 67–75). These can't be filed as facts.
- **The researcher's reasoning is in the memo.** The brief says I must not see this. It is mixed into the file, so my read of it may be influenced.

**Confirmed by opening the pages** (WebFetch passes text through a summarising model, so the quotes are reliable but not verbatim page text)
- **Classic PAT removal, memo line 14:** the page "Managing your personal access tokens" says "GitHub automatically removes personal access tokens that haven't been used in a year." It appears under the heading "Personal access tokens (classic)".
- **Fine-grained expiry, line 23:** `expires_in` accepts "Integer between 1 and 366, or `none`". This is on the same page.
- **Repository limit, line 25:** "Each token can be further limited to only access specific repositories…" is on the same page.
- **One-year revocation, line 15:** the page "Token expiration and revocation" says "GitHub will automatically revoke an OAuth token or personal access token when the token hasn't been used in one year." It sits under "Token expired due to lack of use" and doesn't say which kind of personal access token.
- **Public push, line 26:** the same page says a token pushed to a public repository or gist is automatically revoked.
- **Private key, lines 47–50:** the key-management page says "Private keys do not expire and instead need to be manually revoked." It also gives the 25-key limit, recommends a sign-only vault, and warns that an environment variable is risky. It quotes "persistent authentication as the GitHub App" in the environment-variable warning. The memo's phrasing, "an attacker gets…", is a slight stretch.
- **OAuth apps, lines 31–41:** the "Differences between GitHub Apps and OAuth apps" page confirms three things.
  - Authorizing an OAuth app grants "the user's accessible resources".
  - "OAuth app tokens re long-lived by default" appears with the typo "re" in the fetched text.
  - 8-hour expiring tokens are configurable.
- **Bot naming, L-F1:** the same page says an installation token identifies the app as a bot account "such as @jenkins[bot]".
- **Changelog, lines 37–40:** the 2026-08-14 changelog exists, mentions `offline_access`, and says short-lived tokens are "enabled by default for all new applications".
- **Workflow triggering, line 58:** the "Triggering a workflow" page says events triggered by `GITHUB_TOKEN` don't create a new workflow run, with exceptions. It also contains the sentence about using an installation token or PAT instead.

**Not opened:** the private-key "grants access to every account" claim (S3), S8, S9, S11, S13, S15, S19, S22, S23 and S24. I could not confirm them, and I did not look for them.

**Open questions**
1. Can the Orchestrator supply the original memo, or at least the S1–S24 URL list? Then I can re-run the check.
2. Which grade scale does D-032 use? The memo asks this too (line 123).
3. Does GitHub revoke unused fine-grained tokens? No page I opened says so (memo OQ3).
4. Should L-F5 be filed in a narrower form, covering only the confirmed parts? Those are classic PAT removal, the 1–366 days or none expiry, and the repository limit. I need the memo or a go-ahead before I do that.
