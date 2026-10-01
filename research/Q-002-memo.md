I've fixed L-F12 and resubmitted it as revision 5 of the memo. The Orchestrator should record only the text between the two `=====` lines as `research/Q-002-memo.md`. The six-part contract comes after the second line and is not for the Source checker.

=====

# Q-002 memo, revision 5 (complete)

**Date:** 2026-10-01. **Depth:** 3. **Topics:** github, authentication, attribution, security.

**About this revision**
- This memo is complete and replaces all earlier versions. Source numbers are the same as in revision 4.
- The only change is in §3 and the proposed L-F12. Everything else is the same as revision 4, except that L-F9 and L-F11 are now marked as filed.
- L-F7 stays withdrawn.
- Entries already filed by the Source checker are not resubmitted: L-F1, L-F2, L-F3, L-F4, L-F5, L-F6, L-F8, L-F9, L-F10, L-F11 and L-P1.
- **Resubmitted:** L-F12, rewritten. The absence claim has been taken out of it and is now an estimate at grade C.

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
- **Fact, B (L-F10, L-F2).**
  - R3: "User access tokens will attribute activity to a user and to your app."
  - R5: the UI shows "the user's avatar photo along with the app's identicon badge as the author."
  - Security logs list the user as the actor, with `programmatic_access_type` set to "GitHub App user-to-server token" (R5).
- **Fact, B.** Access is the intersection of what the app may reach and what the user may reach (R5).
- **Fact, A (L-F2).** The access token lasts 8 hours and the refresh token 6 months (R3, R6). Expiry is on unless the app opts out (R6).
- **Fact, B (filed as L-F11).** R6: "Once you use a refresh token, that refresh token and the old user access token will no longer work." Each refresh returns a new `refresh_token`. Its `refresh_token_expires_in` is always 15897600 (6 months), and `expires_in` is always 28800 (8 hours) (R6).
- **Estimate, B.** The 6-month limit therefore runs from the most recent refresh. An app that refreshes at least once every 6 months keeps access without the person having to authorize again. R6 does not say this in words; it follows from the response fields above.

## 3. OAuth app, user token
- **Fact, B (L-F4).** "A user access token identifies the app as the user who signed into the app, such as @octocat" (R2).
- **Fact, B (L-F4).** An authorized OAuth app "has access to all of the user's or organization owner's accessible resources" (R2).
- **Fact, B (rewritten L-F12).** R6b lists these ten scopes that act on repositories:

  | Scope | R6b description |
  |---|---|
  | `repo` | "Grants full access to public and private repositories including read and write access to code, commit statuses, repository invitations, collaborators, deployment statuses, and repository webhooks." |
  | `repo:status` | "Grants read/write access to commit statuses in public and private repositories." |
  | `repo_deployment` | "Grants access to deployment statuses for public and private repositories." |
  | `public_repo` | "Limits access to public repositories. That includes read/write access to code, commit statuses, repository projects, collaborators, and deployment statuses." |
  | `repo:invite` | "Grants accept/decline abilities for invitations to collaborate on a repository." |
  | `security_events` | "Grants: read and write access to security events in the code scanning API." |
  | `admin:repo_hook` | "Grants read, write, ping, and delete access to repository hooks in public or private repositories." |
  | `write:repo_hook` | "Grants read, write, and ping access to hooks in public or private repositories." |
  | `read:repo_hook` | "Grants read and ping access to hooks in public or private repositories." |
  | `workflow` | "Grants the ability to add and update GitHub Actions workflow files." |

  I am not claiming this is the complete list of scopes on R6b. It lists the repository-related scopes the fetch returned.
- **Fact, B (R6b).** "Scopes limit access for OAuth tokens. They do not grant any additional permission beyond that which the user already has."
- **Estimate, C.** None of the descriptions above, other than `repo`, mentions writing code in private repositories. So `repo` is probably the narrowest scope that lets an OAuth app commit to a person's private repository.
  - The `repo` description does not name issues, comments or reviews. That `repo` also covers these, and that no narrower scope does, rests on the docs leaving it out.
  - A live test is needed.
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
- **Fact, B (filed as L-F9).** These are the entries in R13 (fine-grained PATs) and R13a (GitHub Apps); both tables give the same entries.

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
  - The review response schema lists 13 top-level properties: `id`, `node_id`, `user`, `body`, `state`, `html_url`, `pull_request_url`, `_links`, `submitted_at`, `commit_id`, `body_html`, `body_text` and `author_association`. The field is not among them (R18).
- **Opinion, C.** Overall comparison. A live test is needed for everything except the first point.
  - Installation-token actions can be told apart, because the bot is the actor (A, from §1).
  - GitHub App user-token actions are marked in the UI and the security log (B). Issue comments may also carry `performed_via_github_app` (B for the schema). A workflow may or may not see that marking (C).
  - For OAuth-token and PAT actions, no documented field separates them from browser actions (C).

## 8. Do the resulting events start workflows?
- **Fact, B (L-F8).** Events made with `GITHUB_TOKEN` do not start new runs, except `workflow_dispatch` and `repository_dispatch` (R19, R20). Pull requests that `GITHUB_TOKEN` opens, synchronizes or reopens start runs that need approval (R19).
- **Fact, B (L-F8).** Installation tokens and PATs do start runs: R20 says to use "A GitHub App installation access token or a personal access token instead of `GITHUB_TOKEN` to trigger events". R19 says the same for pull requests only.
- **Estimate, C.** GitHub App and OAuth user tokens probably start runs as PATs do. R20 does not mention them.

## 9. Storage, and what an attacker gets
- **Fact, B (L-P1).**
  - For a web app, "encrypt the tokens on your back end and ensure there is security around the systems that can access the tokens" (R3).
  - For PATs, "Treat your access tokens like passwords" (R10).
  - Keep the private key sign-only in a key vault (R3, R4). R4 warns against environment variables.
- **Fact, B.** A token pushed to a public repository or gist is revoked automatically, and revoking an app's authorization revokes its tokens (R9).
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

**L-F12, fact (rewritten)**
- Claim: "Scopes for OAuth apps lists these repository-related scopes: `repo` (full access to public and private repositories, including read and write access to code, commit statuses, repository invitations, collaborators, deployment statuses and repository webhooks); `repo:status`; `repo_deployment`; `public_repo` (public repositories only, including read/write to code); `repo:invite`; `security_events` (code scanning security events); `admin:repo_hook`, `write:repo_hook` and `read:repo_hook` (repository hooks); and `workflow` (add and update Actions workflow files). Of these, only `repo`'s description covers code in private repositories. Scopes do not grant any permission beyond what the user already has."
- Grade: B. Source: R6b.
- Topics: github, authentication, security. Shelf life: 6 months.
- Not part of the claim: whether `repo` is the narrowest scope that can write issues, comments or reviews in private repositories. That stays an estimate at grade C (§3) and is not proposed for filing.

## Open questions
1. Are unused fine-grained PATs revoked after a year? This needs a statement from GitHub or a year-long test.
2. Does `performed_via_github_app` reach workflow event payloads? Do PR reviews carry any app marking? This needs a live test.
3. Do GitHub App and OAuth user tokens start workflow runs? This needs a live test.
4. For the two checkmarked endpoints in §5, which case applies: several permissions required, or any one of a set? This needs a live test or a full render of the endpoint pages.
5. Does `repo` cover writing issues, comments and reviews in private repositories, and is there no narrower OAuth scope that does? This needs a live test.
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
- **L-F12 rewritten:** it now lists all ten repository-related scopes, adding `security_events`, `admin:repo_hook`, `write:repo_hook` and `read:repo_hook`. It no longer says "all the scopes R6b lists".
- **Absence claim moved out:** "no scope narrower than `repo`" is no longer part of L-F12. It is now an estimate at grade C in §3. I also note that `repo`'s own description doesn't name issues, comments or reviews.
- **New open question 5:** whether `repo` covers issues, comments and reviews.
- **L-F9 and L-F11:** marked as filed and taken out of the proposed entries.
- **Unchanged:** everything else in the memo.

**2. Why**

The source check rejected L-F12 because "all" was false (R6b lists four more scopes). It also found the absence claim was not stated by R6b. While re-reading `repo`'s description, I saw it says "code" but not issues, comments or reviews, so that part also has to be grade C.

**3. What I verified**

I have no shell, so this was fetch only.
- **R6b, fetched 2026-10-01:** it returned the ten scopes and the descriptions quoted in §3, plus the "Scopes limit access…" sentence. The fetch was a summariser, so the quotes may not be verbatim. Because I can't be sure the fetch returned the whole table, L-F12 does not claim to be complete.
- **`library/facts/L-F9.md`:** it is filed as proposed.
- I did not re-open any other source this round.

**4. What is undone**

Open questions 1–5 need live tests. Question 6 needs a governance answer.

**5. Needed outside my lane**
- **Orchestrator:** record only the text between the `=====` markers. Last round the contract was recorded inside the memo file.
- **Source checker:** check L-F12 again.
- **Someone with a test account:** run the live tests.

**6. Open questions**
- **Grade scale:** which scale does D-032 use? It blocks final grading.
- **Live tests:** can a live test count as a source in a level-3 memo, or must it be a separate experiment item?
