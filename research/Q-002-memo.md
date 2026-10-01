I've fixed the rejected entry and two of the open questions. I'm writing revision 4 of the memo now.

---

**Orchestrator:** record only the text between the two `=====` lines as `research/Q-002-memo.md`. The six-part contract follows the second line and must not go to the Source checker.

=====

# Q-002 memo, revision 4 (complete)

**Date:** 2026-10-01. **Depth:** 3. **Topics:** github, authentication, attribution, security.

**About this revision**
- This memo is complete and replaces all earlier versions. The source numbers R2–R20 are the same as in revision 3, plus a new R13a.
- L-F7 stays withdrawn.
- Entries already filed by the Source checker are not resubmitted: L-F1, L-F2, L-F3, L-F4, L-F5, L-F6, L-F8, L-F10 and L-P1.
- **Resubmitted:** L-F9, rewritten.
- **New:** L-F11 and L-F12.

**Grade scale** (provisional until D-032's scale is confirmed)
- **A:** two or more independent first-party pages say it directly.
- **B:** one first-party page says it directly.
- **C:** inferred, or rests on something the docs leave out.

**Statement types:** each statement is marked **fact**, **estimate** or **opinion**.

**About the quotes:** they come from pages fetched on 2026-10-01 through a summarising fetch tool. They are close to the page text but not guaranteed verbatim.

## 1. GitHub App, installation token
- **Fact, A (filed as L-F1).** Activity done with an installation token is attributed to the app's bot account (`name[bot]`). R2: "identifies the app as a GitHub App bot account, such as @jenkins[bot]". R3: "Installation access tokens will attribute activity to your app."
- **Fact, A (L-F1, F-gh-02).** The token expires after 1 hour.
- **Fact, B.** An installation covers "a user or organization account's chosen repositories" (R2).
- **Fact, B (filed as L-F6).** Anyone holding the app's private key can mint installation tokens for "every account that the app is installed on" (R3).
- **Fact, B (L-F6).** Private keys "do not expire and instead need to be manually revoked" (R4).
- **Fact, B (L-F6).** Both R3 and R4 recommend keeping the key sign-only in a key vault.

## 2. GitHub App, user access token (user-to-server)
- **Fact, B (L-F10, L-F2).** R3: "User access tokens will attribute activity to a user and to your app." R5: the UI shows "the user's avatar photo along with the app's identicon badge as the author." Security logs list the user as the actor, with `programmatic_access_type` set to "GitHub App user-to-server token" (R5).
- **Fact, B.** Access is the intersection of what the app may reach and what the user may reach (R5).
- **Fact, A (L-F2).** The access token lasts 8 hours and the refresh token 6 months (R3, R6). Expiry is on unless the app opts out (R6).
- **Fact, B (new, L-F11).** R6 says: "Once you use a refresh token, that refresh token and the old user access token will no longer work." Each refresh response carries a new `refresh_token`, and its `refresh_token_expires_in` "will always be `15897600` (6 months)" (R6).
- **Estimate, B.** The 6-month limit therefore runs from the most recent refresh. An app that refreshes at least once every 6 months keeps access without the person having to authorize again. R6 does not say this in words; it follows from the response field above.

## 3. OAuth app, user token
- **Fact, B (L-F4).** "A user access token identifies the app as the user who signed into the app, such as @octocat" (R2).
- **Fact, B (L-F4).** An authorized OAuth app "has access to all of the user's or organization owner's accessible resources" (R2).
- **Fact, B (new, L-F12).** These are all the repository scopes R6b lists:
  - `repo`: "Grants full access to public and private repositories including read and write access to code, …"
  - `public_repo`: "Limits access to public repositories."
  - `repo:status`: commit statuses.
  - `repo_deployment`: deployment statuses.
  - `repo:invite`: invitations.
  - `workflow`: "add and update GitHub Actions workflow files."

  No scope narrower than `repo` grants writing code, issues, comments or reviews in private repositories.
- **Fact, B (R6b).** Scopes grant no access beyond what the user already has.
- **Fact, B (L-F4).**
  - OAuth app tokens are long-lived unless expiring tokens are switched on (R2, R7).
  - Expiring tokens last 8 hours, with a refresh token lasting "six months without use" (R7).
  - Refreshing cannot change the scopes (R7).
  - Expiring tokens are "enabled by default for all new applications" (R8, changelog of 2026-08-14).
- **Fact, B.** An OAuth token unused for a year is revoked (R9).
- **Estimate, C.** Neither R2 nor R6b documents any way to limit an OAuth token to particular repositories. This rests on the docs leaving it out.

## 4. Fine-grained personal access token
- **Fact, B (L-F5).**
  - The token is limited to "resources owned by a single user or organization" and can be "further limited to only access specific repositories", with fine-grained permissions (R10).
  - `expires_in` takes 1–366 days or `none`. Infinite lifetimes "may be blocked by a maximum lifetime policy" (R10).
- **Estimate, C.** R10 documents removal after a year unused only for classic PATs; R9 says only "personal access token". Treat a fine-grained token as valid until its expiry date.
- **Estimate, B.** Commits made through the Contents API are attributed to the token's owner. R11 says the committer defaults to "the authenticated user" and the author defaults to the committer. No page states the general rule for other actions taken with a PAT.
- **Estimate, C.** No source documents any field that marks PAT activity as different from activity in the browser.

## 5. Narrowest permissions (fine-grained model, for both PATs and GitHub Apps)
- **Fact, B (rewritten L-F9).** These are the entries in R13 (fine-grained PATs) and R13a (GitHub Apps); both tables give the same entries.

  | Endpoint | Listed under | "Additional permissions" mark |
  |---|---|---|
  | `PUT /repos/{o}/{r}/contents/{path}` (create or update a file) | Contents: write **and** Workflows: write | ✓ |
  | `POST /repos/{o}/{r}/git/commits` (low-level commit) | Contents: write only | ✗ |
  | `POST /repos/{o}/{r}/issues/{n}/comments` (issue or PR conversation comment) | Issues: write **and** Pull requests: write | ✓ |
  | `POST /repos/{o}/{r}/pulls/{n}/reviews` (PR review) | Pull requests: write only | ✗ |

- **Fact, B.** The pages explain the mark: "Some endpoints require more than one permission. Other endpoints work with any one permission from a set of permissions. In these cases, the 'Additional permissions' column will include a checkmark. For full details … see the documentation for that endpoint" (R13, R13a). The tables do not say which of the two cases applies to a given endpoint.
- **Estimate, C.** The checkmarks probably mean the following. A live test is needed.
  - Issue comments probably need Issues: write *or* Pull requests: write: the first for an issue, the second for a pull request.
  - The file endpoint probably needs Workflows: write in addition to Contents: write only for paths under `.github/workflows`. This mirrors the classic rule that "The workflow scope is also required in order to modify files in the .github/workflows directory" (R11, a fact at grade B for classic and OAuth tokens).
  - The endpoint pages (R11, R17) should show each endpoint's permission sets, but the fetch tool did not return those boxes, so I could not confirm this.
- **Fact, B.** GitHub Apps should "select the minimum permissions" (R3).

## 6. Signatures and the "verified" mark
- **Fact, B.** GitHub signs commits made in the web interface with its `web-flow` key (R14).
- **Fact, B.** Signature verification for bot commits "will only work if the request is verified and authenticated as the GitHub App or bot and contains no custom author information, custom committer information, and no custom signature information, such as Commits API" (R14).
- **Estimate, C.** The docs do not say whether commits made through the API with a PAT, an OAuth token or a GitHub App user token are signed. The Contents API response does include a `verification` object (R11).

## 7. Can a workflow tell these apart from the person acting on github.com?
- **Fact, B.** `github.actor` is "the username of the user that triggered the initial workflow run". `github.event` is "identical to the webhook payload" (R15).
- **Fact, B.** "Don't assume `sender` always identifies the person who caused an event" (R16).
- **Fact, B (L-F3).** The issue-comment REST schema includes `performed_via_github_app`, which is null or a GitHub App (R17).
- **Estimate, C.**
  - R16 does not mention `performed_via_github_app`.
  - The review response schema fetched today lists 13 top-level properties: `id`, `node_id`, `user`, `body`, `state`, `html_url`, `pull_request_url`, `_links`, `submitted_at`, `commit_id`, `body_html`, `body_text` and `author_association`. The field is not among them (R18).
- **Opinion, C.** Overall comparison. A live test is needed for everything except the first point.
  - Installation-token actions can be told apart, because the bot is the actor (A, from §1).
  - GitHub App user-token actions are marked in the UI and the security log (B). Issue comments may also carry `performed_via_github_app` (B for the schema). A workflow may or may not see that marking (C).
  - For OAuth-token and PAT actions, no documented field separates them from browser actions (C).

## 8. Do the resulting events start workflows?
- **Fact, B (L-F8).** Events made with `GITHUB_TOKEN` do not start new runs, except `workflow_dispatch` and `repository_dispatch` (R19, R20). Pull requests that `GITHUB_TOKEN` opens, synchronizes or reopens start runs that need approval (R19).
- **Fact, B (L-F8).** Installation tokens and PATs do start runs: "A GitHub App installation access token or a personal access token instead of `GITHUB_TOKEN` to trigger events" (R20). R19 says the same for pull requests only.
- **Estimate, C.** GitHub App and OAuth user tokens probably start runs as PATs do. R20 does not mention them; I re-checked this today.

## 9. Storage, and what an attacker gets
- **Fact, B (L-P1).**
  - For a web app, "encrypt the tokens on your back end and ensure there is security around the systems that can access the tokens" (R3).
  - For PATs, "Treat your access tokens like passwords" (R10).
  - Keep the private key sign-only in a key vault (R3, R4). R4 warns against environment variables.
- **Fact, B.** A token pushed to a public repository or gist is revoked automatically, and revoking an app's authorization revokes its tokens (R9). This was graded A in revision 3, which was wrong: R9 is the only source.
- **Estimate, B.** What an attacker gets with each credential, derived from the facts above:

| Credential | Reach | Lifetime | Identity shown |
|---|---|---|---|
| App private key | Every installation, by minting 1-hour tokens | Until revoked | The app's bot |
| Installation token | The installed repositories, with the app's permissions | Up to 1 hour | The app's bot |
| App user token plus refresh token | The intersection of app and user access | Indefinite while refreshed at least every 6 months (§2) | The user, with the app badge |
| OAuth token (`repo`) | Every repository the user can reach | Long-lived unless expiry is on | The user, with no documented marking |
| Fine-grained PAT | The chosen owner, repositories and permissions | Until expiry, which may be none | The user, with no documented marking |

## 10. The person's setup and upkeep
- **Fact, B.** For a GitHub App:
  - The person installs the app and chooses repositories (R2), then authorizes it once to get user tokens.
  - They authorize again only if 6 months pass without a refresh (R6; see §2).
  - The operator looks after the private key (R4).
- **Fact, B.** For an OAuth app, the person authorizes once and there is no repository choice (R2).
- **Fact, B.** For a fine-grained PAT:
  - The person creates the token in settings and chooses the owner, repositories, permissions and expiry (R10).
  - They make a new token at each expiry. An organization policy may cap the lifetime (R10).

## Proposed library entries

**L-F9, fact (rewritten)**
- Claim: "Fine-grained permission tables (PATs and GitHub Apps) list: create/update file contents under Contents: write and Workflows: write, with the 'additional permissions' mark; low-level git commit under Contents: write only; create issue comment (issue or PR conversation) under Issues: write and Pull requests: write, with the mark; create PR review under Pull requests: write only. The mark means either several permissions are required or any one of a set suffices; the tables do not say which."
- Grade: B. Sources: R13, R13a.
- Topics: github, authentication, security. Shelf life: 6 months.

**L-F11, fact**
- Claim: "Refreshing a GitHub App user access token invalidates the used refresh token and the old access token and returns a new refresh token whose `refresh_token_expires_in` is always 15897600 s (6 months); access token `expires_in` is always 28800 s (8 h)."
- Grade: B. Source: R6.
- Topics: github, authentication. Shelf life: 6 months.

**L-F12, fact**
- Claim: "OAuth app repository scopes are `repo` (full access to public and private repositories, including code), `public_repo` (public only), `repo:status`, `repo_deployment`, `repo:invite` and `workflow`; none narrower than `repo` grants write access to code, issues or reviews in private repositories. Scopes add no permission beyond what the user already has."
- Grade: B. Source: R6b.
- Topics: github, authentication, security. Shelf life: 6 months.

## Open questions
1. Are unused fine-grained PATs revoked after a year? This needs a statement from GitHub or a year-long test.
2. Does `performed_via_github_app` reach workflow event payloads? Do PR reviews carry any app marking? This needs a live test.
3. Do GitHub App and OAuth user tokens start workflow runs? This needs a live test.
4. For the two checkmarked endpoints in §5, which case applies: several permissions required, or any one of a set? This needs a live test or a full render of the endpoint pages.
5. Which grade scale does D-032 use?

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
- R13a [Permissions required for GitHub Apps](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps)
- R14 [About commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
- R15 [Contexts reference](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts)
- R16 [Webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
- R17 [REST: Issue comments](https://docs.github.com/en/rest/issues/comments)
- R18 [REST: Pull request reviews](https://docs.github.com/en/rest/pulls/reviews)
- R19 [GITHUB_TOKEN concept](https://docs.github.com/en/actions/concepts/security/github_token)
- R20 [Triggering a workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)

=====

## Six-part contract

**1. What I changed**

I rewrote the whole memo as revision 4:
- **L-F9, the one rejected entry:** rewritten from the permission tables, and it now states plainly what the "additional permissions" mark means.
- **L-F11 (new):** refresh tokens. This settles the old question of whether using a refresh token extends its 6-month life.
- **L-F12 (new):** the full list of OAuth scopes.
- **Corrections from the source check:**
  - The automatic-revocation statement is now B, not A.
  - The `repo` claim now cites R6b, not R11.
  - The R14 quote is complete.
  - L-F6 is B.
  - Sources are named for every filed entry.
- I put the contract outside clear markers, so the Source checker gets the memo alone.

**2. Why**

The source check returned FAIL for three reasons:
- L-F9 was incomplete: it named only Contents: write and Issues: write, though the table lists more for two endpoints.
- Several grades and citations were wrong.
- My reasoning had been recorded inside the memo file.

**3. What I verified**

I used fetch and search only; I have no shell. I fetched these pages today:
- **R13:** the "additional permissions" explanation and the sections each endpoint is listed under. The summariser said the file endpoint appears in "three" sections but named only two (Contents and Workflows). The GitHub Apps table (R13a) also shows two, so I use two.
- **R13a:** the same entries as R13.
- **R11, R17, R18 (both API versions):** the fetch did not return the per-endpoint permission boxes. R18 shows 13 properties, without `performed_via_github_app`.
- **R6b:** the scope list.
- **R6:** the refresh response fields.
- **R20:** no mention of user tokens.

A web search summary said "Issues (write) or Pull requests (write)" for issue comments. I could not confirm that on the page, so it is not used as a fact.

I relied on the Source checker's earlier fetches for R2–R5, R7–R10, R12, R14–R16 and R19.

**4. What is undone**
- Open questions 1–4 need live tests.
- I could not get the per-endpoint permission boxes to render.

**5. Needed outside my lane**
- The Orchestrator should record only the text between the markers.
- The Source checker should check L-F9, L-F11 and L-F12.
- Someone with a test account should run the live tests.
- If a statement from GitHub support is needed, the Chief of Staff should put a decision card to the owner.

**6. Open questions**
- The five listed in the memo. The D-032 grade scale is the one that blocks final grading.
- Should a level-3 memo ever count a live test as a source, or must that be a separate experiment item?
