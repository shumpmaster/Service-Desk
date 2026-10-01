# Q-002 researcher: revision 2

I could not edit the memo itself. `research/Q-002-memo.md` is not in this folder (the only files are `Q-002.md`, `Q-002-source-check.md` and `library/facts/L-F1/L-F2`). So below is a dated correction to that memo, using its F and L-F numbers as the source check quotes them, for the Orchestrator to record verbatim.

The main fix: the memo said fine-grained tokens are removed after a year unused. GitHub's documentation doesn't settle that, so it is now an open question. Of the six entries held back, the private-key one now has a second source, two more can only be resolved by a live test, and one (F12) I can't fix without the original memo.

---

## Correction to Q-002 memo, 2026-10-01

Grades use the memo's own A–C scale (A: two or more independent first-party sources say it directly; B: one direct first-party source, or a reasonable reading of first-party pages; C: inferred, or rests on something the docs leave out). Each statement is marked fact, estimate or opinion.

### C1. Replaces F20, the fine-grained part of L-F5, and OQ3 (unused tokens)
- **Fact, A.** Classic personal access tokens are removed after one year unused. The token-management page says, under its "Personal access tokens (classic)" heading: "GitHub automatically removes personal access tokens that haven't been used in a year." [S14]
- **Fact, A.** OAuth tokens are revoked after one year unused. The token-expiration page, under "Token expired due to lack of use", says: "GitHub will automatically revoke an OAuth token or personal access token when the token hasn't been used in one year." [S18]
- **Estimate, C, unresolved.** I can't say whether the one-year rule covers fine-grained tokens:
  - S14 places the rule under the classic heading.
  - S18 says "personal access token" without saying which kind.
  - Neither page says the rule applies to fine-grained tokens, and neither says it doesn't.
  - The old F20 statement, which applied the rule to fine-grained tokens, is withdrawn.
- **Revised OQ3.** Does GitHub revoke unused fine-grained tokens? This needs a statement from GitHub or a test over a year. For our design, assume the token stays valid until its expiry date. With `expires_in` set to "none", that means indefinitely.
- **Unchanged and confirmed by the source check.**
  - Fine-grained expiry is 1–366 days, or none. [S14]
  - Tokens are owned by a person or an organization. [S15]
  - "Each token can be further limited to only access specific repositories." [S14]
- **Fact, A.** Any OAuth, GitHub App or personal access token pushed to a public repository or gist is revoked automatically. Revoking an app's authorization also revokes its tokens. [S18]

**Revised L-F5:** "A fine-grained PAT can be limited to selected repositories, and its expiry is 1–366 days or none. The documented one-year inactivity removal is stated for classic PATs and OAuth tokens. Whether it applies to fine-grained PATs is not documented." Grade: A for the first two parts, C for the last. Topics: github, authentication, security. Shelf life: 6 months.

### C2. Replaces the scope part of F16/L-F4, and F17 (OAuth apps)
- **Fact, B.** An OAuth app's access covers whatever the user can reach. The documentation does not offer a way to limit it to particular repositories:
  - S2 says: "Authorizing an OAuth app grants the app access to the user's accessible resources."
  - S2 contrasts this with GitHub Apps, where installing grants access to "chosen repositories".
  - S11 says the `repo` scope "grants full access to public and private repositories…".
  - Withdrawn: the claims "all-or-nothing" and "cannot be limited to particular repositories". No source says either directly.
- **Fact, A.** Expiring OAuth tokens: the access token lasts 8 hours and the refresh token 6 months. Refreshing does not change the token's scopes. [S13, S19]
- **Estimate, C. Replaces F17.** S2 and S20 disagree about when expiring OAuth tokens became available:
  - The changelog dated 2026-08-14 [S20] announces expiring tokens for OAuth apps. It says apps opt in with `offline_access` or through a registration setting, and "enabled by default for all new applications."
  - S2 says OAuth apps "can also configure" 8-hour tokens, but gives no date.
  - Withdrawn: "Since 2026-08-14". It now reads "documented as of the 2026-08-14 changelog".
  - **Opinion.** Treat existing OAuth apps as issuing long-lived tokens unless they have been switched over. S2 says: "OAuth app tokens are long-lived by default."

**Revised L-F4:** "An OAuth app gets access to the user's accessible resources, and `repo` covers all of the user's private repositories. No per-repository restriction is documented. Expiring tokens (8 hours, with a 6-month refresh token) are opt-in, and the default for new apps per the 2026-08-14 changelog." Grade B. Topics: github, authentication, security. Shelf life: 3 months, because this area changed recently.

### C3. Replaces F4/L-F6 (GitHub App private key)
- **Fact, A.** The key "grants access to every account that the app is installed on." [S3]
- **Fact, A.** The key-management page [S21] says:
  - With the key, an attacker gets "persistent authentication as the GitHub App."
  - "Private keys do not expire and instead need to be manually revoked."
  - It recommends a sign-only key vault, warns that an environment variable is the weaker choice, and caps keys at 25 per app.
- Rewording: the withdrawn phrase "for as long as the key is valid" becomes "until the key is manually revoked", as S21 puts it.

**Revised L-F6:** "A GitHub App private key grants access to every account where the app is installed. It does not expire and stays usable until manually revoked. Store it sign-only in a key vault." Grade A (S3 and S21). Topics: github, security. Shelf life: 6 months.

### C4. F25/L-F8 (do workflows start)
- **Fact, A.** Events triggered by `GITHUB_TOKEN` do not start workflow runs, apart from `workflow_dispatch` and `repository_dispatch`. Pull requests opened, synchronized or reopened by `GITHUB_TOKEN` start runs that need approval. [S16, S22]
- **Fact, B.** Installation tokens and PATs do start workflows:
  - S16 says: "If you do want to trigger a workflow from within a workflow run, you can use a GitHub App installation access token or a personal access token instead of GITHUB_TOKEN to trigger events that require a token."
  - That is a direct statement, but from one page.
  - S23 supports it only for pull requests: such runs "execute without requiring approval."
- No source mentions user tokens (from a GitHub App or OAuth app). **Estimate, C:** they behave like PATs. A live test is needed.

**Revised L-F8:** Grade B. The `GITHUB_TOKEN` part is A, and the part about other tokens is B. Topics: github, authentication.

### C5. The review half of F10/F11 and L-F3
- **Fact, A, unchanged.** In the issue-comment schema, `performed_via_github_app` is either null or a GitHub app. [S8]
- **Estimate, B.**
  - The full review response schema has 13 top-level properties (`id` … `author_association`), and `performed_via_github_app` is not among them. [S9] I checked the schema itself this time, not just the example.
  - This is still one page, and it relies on the field being absent. It needs a live test.

### C6. F14 and F18 (telling the actor apart inside a workflow)
- **Estimate, C. Was an estimate before, now marked as having no source.**
  - The webhook payload documentation [S24] never mentions `performed_via_github_app`.
  - S24 does say: "Don't assume `sender` always identifies the person who caused an event."
  - So the claim that a workflow can read `github.event.comment.performed_via_github_app` has no supporting source. Whether a workflow can tell an app-assisted comment from a direct one needs a live test.
- The minor fixes:
  - F1 now cites S2 for the `[bot]` naming.
  - F3 cites only S1.

### C7. F12/L-F7
Not revised. Without the memo I can't see what F12 claims, so I can't look for a second source. It stays unfiled.

### New sources
- S18: docs.github.com/en/authentication/keeping-your-account-and-data-secure/token-expiration-and-revocation
- S19: docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
- S20: github.blog/changelog/2026-08-14-multiple-redirect-uris-and-token-refresh-for-oauth-apps/
- S21: docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps
- S22: docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows
- S23: docs.github.com/en/actions/concepts/security/github_token
- S24: docs.github.com/en/webhooks/webhook-events-and-payloads

S16 is the "Triggering a workflow" page (docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

---

## 1. What I changed
- Withdrew F20, so the one-year removal no longer covers fine-grained tokens, and restated OQ3 as an open question.
- Narrowed F16 and reframed F17.
- Added a second source to L-F6 and reworded its overreaching phrase.
- Regraded L-F8 and L-F3.
- Marked F14/F18 as having no source and fixed the citations for F1/F3.
- Proposed revised L-F4, L-F5, L-F6 and L-F8.

## 2. Why
The source check failed the memo on F20 and OQ3. It also flagged single-source claims and claims based on what a page leaves out. Each was either fixed with a direct quote, given a second source, or downgraded.

## 3. What I verified
I used WebFetch on S14, S11, S16, S18 (twice, to get the exact wording), S2, S19, S20, S21, S3, S24 (twice, including a search for the literal field name: none found), S9's schema, S22, S23 and the automatic-token page (nothing relevant there). I also ran two web searches. Results are as quoted above. As before, WebFetch quotes pass through a summarising model.

## 4. Undone
- F12/L-F7, because the memo is missing.
- Three things only a live test can settle: unused fine-grained tokens, reviews made through an app, and whether user tokens start workflows.

## 5. Needed outside my lane
- The Orchestrator should give me `research/Q-002-memo.md` (or merge this correction into it) so F12 can be fixed. It should then send the memo to the Source checker again.
- Someone holding a test GitHub account should run the live tests. I can't run code.
- GitHub support could answer the fine-grained token question, but that may be a level-5 or paid source. If so, the Chief of Staff should put a decision card to the owner.

## 6. Open questions
- OQ3 as revised in C1.
- Do user tokens start workflows (C4)?
- Can a workflow tell a comment or review made through an app from one made directly (C5, C6)?
- Which grade scale D-032 uses. This is still open from the source check.
- When expiring OAuth tokens first became available (C2). This matters little to the decision.

Sources:
- [Token expiration and revocation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/token-expiration-and-revocation)
- [Managing personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Scopes for OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)
- [Differences between GitHub Apps and OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)
- [Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Changelog 2026-08-14](https://github.blog/changelog/2026-08-14-multiple-redirect-uris-and-token-refresh-for-oauth-apps/)
- [Managing private keys for GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps)
- [Best practices for creating a GitHub App](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app)
- [Triggering a workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [Events that trigger workflows](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows)
- [GITHUB_TOKEN concept](https://docs.github.com/en/actions/concepts/security/github_token)
- [Webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
- [REST pull request reviews](https://docs.github.com/en/rest/pulls/reviews)
