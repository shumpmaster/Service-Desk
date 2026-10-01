I'm writing a complete memo to replace research/Q-002-memo.md. The Orchestrator records it verbatim. Your six-part contract follows it, kept apart so the Source checker can be sent the memo alone.

---

# research/Q-002-memo.md: Q-002 memo, revision 3 (complete)

**Date:** 2026-10-01. **Depth:** 3. **Topics:** github, authentication, attribution, security.

This is a complete memo that does not depend on any earlier version. It replaces the original memo and the revision-2 correction. The old S-numbers and F-numbers are retired, and the sources are renumbered R1–R18 below, each with its URL. The old F12/L-F7 is **withdrawn** and not resubmitted. Its text cannot be recovered, and every claim this memo needs is restated below with its own sources.

**Grade scale** (provisional, until someone confirms the D-032 scale):
- **A:** two or more independent first-party pages say it directly.
- **B:** one first-party page says it directly.
- **C:** inferred, or rests on something the docs leave out.

Each statement is marked **fact**, **estimate** or **opinion**. Quotes come from pages fetched on 2026-10-01 through a summarising fetch tool, so they are close to the page text but not guaranteed verbatim.

## 1. GitHub App, installation token
- **Fact, A.** Activity done with an installation token is attributed to the app's bot account (`name[bot]`), not to the person. R2: "identifies the app as a GitHub App bot account, such as @jenkins[bot]". R3: "Installation access tokens will attribute activity to your app." This is already filed as L-F1.
- **Fact, A.** The token expires after 1 hour (L-F1; R3: "Installation access tokens expire after one hour").
- **Fact, B.** Installing an app grants access to "a user or organization account's chosen repositories" (R2).
- **Fact, A.** Anyone holding the app's private key can mint installation tokens for "every account that the app is installed on" (R3). Private keys "do not expire and instead need to be manually revoked" (R4). R3 and R4 both recommend a sign-only key vault.

## 2. GitHub App, user access token (user-to-server)
- **Fact, B.** Activity is attributed to the user *and* the app. R3: "User access tokens will attribute activity to a user and to your app." R5: "the GitHub UI will show the user's avatar photo along with the app's identicon badge as the author." Security logs list "the user as the actor" with `programmatic_access_type` set to "GitHub App user-to-server token" (R5).
- **Fact, B.** Access is the intersection of what the app may access and what the user may access (R5). A token cannot grant the user extra access (R5).
- **Fact, A.** The access token lasts 8 hours and the refresh token 6 months (R3, R6; filed as L-F2). Using a refresh token makes both it and the old access token stop working, and a new refresh token is issued (R6). Expiry is on unless the app opts out (R6).

## 3. OAuth app, user token
- **Fact, B.** "A user access token identifies the app as the user who signed into the app, such as @octocat" (R2). No app badge or app marking is documented for OAuth apps (R2, R5).
- **Fact, B.** An authorized OAuth app "has access to all of the user's or organization owner's accessible resources" (R2).
  - The `repo` scope "grants full access to public and private repositories" (R6b).
  - `public_repo` covers public repositories only (R6b).
  - Scopes "do not grant any additional permission beyond that which the user already has" (R6b).
  - No per-repository restriction is documented in R2 or R6b. That last point is about what the docs leave out, so it is **C**.
- **Fact, A.** OAuth app tokens are long-lived by default (R2, R7).
  - Expiring tokens are opt-in, through `offline_access` or the app's settings (R7, R8).
  - They last 8 hours, and the refresh token lasts "six months without use" (R7).
  - Refreshing cannot change the scopes (R7).
  - The 2026-08-14 changelog says expiring tokens are "enabled by default for all new applications" (R8).
- **Fact, B.** An unused OAuth token is revoked after one year (R9).

## 4. Fine-grained personal access token
- **Fact, B.** It is limited to "resources owned by a single user or organization". It "can be further limited to only access specific repositories", and it carries specific fine-grained permissions (R10).
- **Fact, B.** Its expiry can be set, and "Infinite lifetimes are allowed but may be blocked by a maximum lifetime policy" (R10). The REST parameter `expires_in` takes 1–366 or `none`. The Source checker confirmed this on R10 in the previous round.
- **Estimate, C.** It is not documented whether GitHub removes fine-grained tokens after a year unused:
  - R10 states the one-year removal under the heading "Personal access tokens (classic)".
  - R9 says "personal access token" without saying which kind.
  - Treat a fine-grained token as valid until its expiry date.
- **Estimate, B.** Commits made through the REST API with a PAT are attributed to the token's owner. R11 says the `committer` defaults to "the authenticated user" and the author defaults to the committer. No page I found states the general attribution for PAT actions directly (R10, R12 are silent).
- **Estimate, C.** No source documents anything that marks PAT activity as token-made rather than made in the browser. This rests on what the docs leave out.

## 5. Narrowest permissions (fine-grained model)
- **Fact, B (R13).**
  - Creating or updating a file (`PUT …/contents/{path}`) needs Contents: write.
  - A low-level commit (`POST …/git/commits`) needs Contents: write.
  - An issue or PR conversation comment (`POST …/issues/{n}/comments`) needs Issues: write.
  - A pull request review (`POST …/pulls/{n}/reviews`) needs Pull requests: write.
  - R13 marks the contents and issue-comment endpoints as needing "additional permissions", which the fetch did not name. R11 says classic tokens also need the `workflow` scope to change `.github/workflows`.
- **Estimate, B.** GitHub Apps use the same permission names. R3 says "select the minimum permissions". I did not open the app-specific permissions table.
- **Fact, B.** OAuth apps cannot go below `repo` for private repositories (R11, R6b).

## 6. Signatures and the "verified" mark
- **Fact, B.** GitHub signs commits made in the web interface with its `web-flow` key (R14).
- **Fact, B.** Bot signature verification "will only work if the request is verified and authenticated as the GitHub App or bot and contains no custom author information, custom committer information" (R14).
- **Estimate, C.** The docs do not say whether commits made through the API with a PAT, OAuth token or user token are signed. The Contents API response does carry a `verification` object (R11).

## 7. Can a workflow tell it apart from the person acting directly?
- **Fact, B.** `github.actor` is "the username of the user that triggered the initial workflow run". `github.actor_id` is the ID of "the person or app". `github.event` is "identical to the webhook payload" (R15).
- **Fact, B.** R16 says: "Don't assume `sender` always identifies the person who caused an event."
- **Fact, B.** The issue-comment REST schema has `performed_via_github_app`, which is null or a GitHub app (R17).
- **Estimate, C.** Whether that field reaches workflows is undocumented. The webhook page (R16) never mentions it.
- **Estimate, C.** The documented pull request review schema has 13 top-level properties, and `performed_via_github_app` is not one of them (R18). This rests on the field being absent from the docs.
- **Estimate, C, overall.** Comparing the mechanisms:
  - Installation-token actions show the bot as actor, so they are distinguishable (A, from §1).
  - Actions with a GitHub App user token are marked in the UI and the security log (B). A workflow may or may not see that marking (C).
  - For OAuth-token and PAT actions, no documented field tells them apart from browser actions (C).
  - This needs a live test.

## 8. Do the resulting events start workflows?
- **Fact, A.** Events made with `GITHUB_TOKEN` do not start new runs, except `workflow_dispatch` and `repository_dispatch` (R19, R20). Pull requests it opens, synchronizes or reopens start runs that need approval (R19, R20).
- **Fact, B.** Installation tokens and PATs do start runs: "you can use a GitHub App installation access token or a personal access token instead of GITHUB_TOKEN to trigger events" (R20). R19 says the same for pull requests only.
- **Estimate, C.** User tokens from a GitHub App or OAuth app behave like PATs. R20 does not mention them.

## 9. Storage, and what an attacker gets
- **Fact, B.** For a web app, "encrypt the tokens on your back end and ensure there is security around the systems that can access the tokens" (R3). For PATs: "Treat your access tokens like passwords" (R10).
- **Fact, A.** A token pushed to a public repository or gist is revoked automatically (R9). Revoking an app's authorization revokes its tokens (R9).
- **Estimate, B.** What an attacker gets with each credential follows from the facts above:

| Credential | Reach | Lifetime | Identity shown |
|---|---|---|---|
| Private key | Every installation, minting 1-hour tokens | Until revoked | The app's bot |
| Installation token | The installed repositories, with the app's permissions | ≤ 1 hour | The app's bot |
| GitHub App user token plus refresh token | The intersection of app and user access | Renewable for as long as refreshes continue; 6-month refresh limit | The user, with the app badge |
| OAuth token (`repo`) | Every repository the user can reach | Long-lived by default | Indistinguishable from the user |
| Fine-grained PAT | The selected repositories and permissions | Until expiry, possibly none | The user |

## 10. The person's setup and upkeep
- **Fact, B.** For a GitHub App:
  - The person installs it and chooses repositories (R2), then authorizes it once for user tokens.
  - If 6 months pass without a refresh, they authorize again (R6). R6 states the 6-month limit without saying "without use", so whether use extends it is **C**.
  - The operator must look after the private key (R4).
- **Fact, B.** For an OAuth app, the person authorizes once. There is no repository choice (R2).
- **Fact, B.** For a fine-grained PAT, the person creates the token in settings and chooses the owner, repositories, permissions and expiry (R10). They create a new one at each expiry, and an organization policy may cap the lifetime (R10).

## Proposed library entries
L-F1 and L-F2 are already filed and are not resubmitted. **L-F7 is withdrawn.**

- **L-F3, fact.** "Issue comments carry `performed_via_github_app` (null or app) in the REST schema; the documented PR review schema does not include it."
  - Grade: B for the first part, C for the second.
  - Sources: R17, R18. Topics: github, attribution. Shelf life: 6 months.
- **L-F4, fact.** "An OAuth app user token identifies as the user; an authorized OAuth app reaches all the user's accessible resources and `repo` covers all private repositories; no per-repo restriction is documented. Tokens are long-lived by default; expiring tokens (8 h, refresh 6 months without use, scopes fixed) are opt-in, and the default for new apps per the 2026-08-14 changelog."
  - Grade: B; the "no per-repo restriction" part is C.
  - Sources: R2, R6b, R7, R8. Topics: github, authentication, attribution, security. Shelf life: 3 months.
- **L-F5, fact (narrowed).** "A fine-grained PAT is limited to one resource owner, optionally to selected repositories, with fine-grained permissions; expiry is 1–366 days or none, subject to org/enterprise policy. One-year inactivity removal is documented for classic PATs; whether it applies to fine-grained PATs is not documented."
  - Grade: B; the last clause is C.
  - Sources: R10, R9. Topics: github, authentication, security. Shelf life: 6 months.
- **L-F6, fact.** "A GitHub App private key grants access to every account where the app is installed; keys do not expire and must be revoked manually; store sign-only in a key vault."
  - Grade: A.
  - Sources: R3, R4. Topics: github, security. Shelf life: 6 months.
- **L-F8, fact.** "Events made with GITHUB_TOKEN do not start workflow runs (except workflow_dispatch and repository_dispatch; PRs it opens, synchronizes or reopens give approval-required runs); events made with installation tokens or PATs do."
  - Grade: A for the `GITHUB_TOKEN` part, B for the rest.
  - Sources: R19, R20. Topics: github, authentication. Shelf life: 6 months.
- **L-F9, fact.** "Fine-grained permissions: file write or commit → Contents: write; issue/PR conversation comment → Issues: write; PR review → Pull requests: write."
  - Grade: B.
  - Source: R13. Topics: github, authentication, security. Shelf life: 6 months.
- **L-F10, fact.** "GitHub App installation tokens attribute activity to the app; user access tokens attribute activity to the user and the app (avatar with app badge; security log `programmatic_access_type`)."
  - Grade: A for the first part (R2, R3), B for the second (R3, R5).
  - Topics: github, attribution. Shelf life: 6 months.
- **L-P1, pattern.** "Web app holding GitHub credentials: keep tokens server-side, encrypted at rest, with restricted access; keep the App private key sign-only in a key vault, not in an environment variable."
  - Grade: B.
  - Sources: R3, R4. Topics: github, security. Shelf life: 12 months.

## Open questions
1. Are unused fine-grained PATs revoked after a year?
2. Does `performed_via_github_app` reach workflow event payloads? Is there any app marking on reviews?
3. Do GitHub App and OAuth user tokens start workflows?
4. Does using a GitHub App refresh token extend its 6-month life?
5. Which permissions are the "additional permissions" in R13?
6. Which grade scale does D-032 use?

## Sources
- R2 [Differences between GitHub Apps and OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)
- R3 [Best practices for creating a GitHub App](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app)
- R4 [Managing private keys for GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps)
- R5 [Authenticating with a GitHub App on behalf of a user](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-with-a-github-app-on-behalf-of-a-user)
- R6 [Refreshing user access tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens)
- R6b [Scopes for OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)
- R7 [Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- R8 [Changelog 2026-08-14](https://github.blog/changelog/2026-08-14-multiple-redirect-uris-and-token-refresh-for-oauth-apps/)
- R9 [Token expiration and revocation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/token-expiration-and-revocation)
- R10 [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- R11 [REST: Repository contents](https://docs.github.com/en/rest/repos/contents)
- R12 [About authentication to GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)
- R13 [Permissions required for fine-grained PATs](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens)
- R14 [About commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
- R15 [Contexts reference](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts)
- R16 [Webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
- R17 [REST: Issue comments](https://docs.github.com/en/rest/issues/comments)
- R18 [REST: Pull request reviews](https://docs.github.com/en/rest/pulls/reviews)
- R19 [GITHUB_TOKEN concept](https://docs.github.com/en/actions/concepts/security/github_token)
- R20 [Triggering a workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- L-F1's own source: [Authenticating as a GitHub App installation](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation)

---

## Six-part contract

**1. What I changed**
- I replaced the revision-2 correction with a complete memo that does not depend on any earlier version.
- Every source now has a URL. The S-numbers that had none (S1, S3, S8, S9, S11, S13, S15) are replaced by R-numbered sources with URLs, and I reopened each of them.
- I withdrew F12/L-F7.
- I narrowed L-F5, which answers the Source checker's question 4.
- I added L-F9, L-F10 and L-P1. I added the sections on permissions, signatures, storage and upkeep.
- I took my working notes out of the memo.

**2. Why**
The source check failed the memo for four reasons:
- It was a correction rather than the memo.
- F12 couldn't be checked.
- Most sources had no URL.
- My reasoning was mixed into the file.

**3. What I verified**
I fetched these pages on 2026-10-01 and read the results as quoted in the memo:
- R2, R3, R5, R6, R6b, R7, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19 and R20.
- The organisation audit-log page, which has nothing on `programmatic_access_type`, so I cite R5 for it.

I did not fetch these again this round:
- R4, R9 and R8, which the Source checker confirmed last round.
- L-F1's source.

Quotes went through a summarising model.

**4. Undone**
- The five questions that need a live test or a statement from GitHub (open questions 1–5).
- The app-specific permissions table, which I did not open.

**5. Needed outside my lane**
- The Orchestrator should record the memo above as `research/Q-002-memo.md` and send it to the Source checker.
- Someone with a test GitHub account should run the live tests for open questions 1–4.
- If GitHub support or a paid source is needed, the Chief of Staff should put a decision card to the owner.

**6. Open questions**
These are the six listed in the memo. The D-032 grade scale is the one that blocks final grading.
