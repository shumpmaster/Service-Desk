I've finished the research; the memo is below.

# Six-part contract — Q-002, researcher

**1. What I changed:** No files. I have no write tool. The memo below is for the Orchestrator to record verbatim in `research/` and then send to the Source checker.

**2. Why:** Q-002 asks for a depth-3 graded memo on how a web app can act in a person's private GitHub repositories on their behalf.

**3. What I verified:**
- I read `BRIEF.md` and `research/Q-002.md`. There were no library entries or domain briefs in the folder, so there was no prior library to reconcile with.
- I did not open `.env*`, `.npmrc` or the lock files. They are outside this question and may hold secrets.
- I made 17 web fetches and searches on 2026-10-01: 12 GitHub docs pages, 3 GitHub changelog posts and 2 searches. Every source is listed at the end of the memo. I ran no code, as my role requires.

**4. What is undone:**
- A few points rest on inference rather than a page that says them outright. They are marked "estimate" below, mainly items F14, F15 and F17 to F19.
- The exact narrowest permission for pull-request conversation comments (Issues or Pull requests) was not checked against the permissions reference.
- Nothing has been source-checked yet; that is the Source checker's job.

**5. What is needed outside my lane:**
- **Source checker:** check every entry, especially the 2026-08-14 changelog on OAuth app token refresh. It is newer than my training, so I rely only on the fetched page.
- **Grade scale:** the grades A to C below are my own (A: current official GitHub docs saying it directly; B: official source but my inference, or a changelog; C: secondary). The library's D-032 grade scale wasn't in my pack, so they may need mapping.
- **Closing the gaps:** these can be settled by running a test. That is outside my lane and would need a sandbox account and an owner decision. No level-5 expert or paid source is needed.

**6. Open questions (added, none closed):**
- **OQ1:** For a commit made through the API with a user access token or personal access token, which committer does GitHub record and how is it signed? Does that differ from a commit made in the web editor?
- **OQ2:** Does a personal account's security log show which token or app performed an action? The audit-log fields for this are documented only for organizations.
- **OQ3:** Does the "unused for a year, automatically removed" rule also apply to long-lived OAuth app tokens? It is documented for personal access tokens.
- **OQ4:** Do the review and commit webhook payloads carry any app or token marker that the REST schemas leave out?

---

# Memo Q-002: ways a web app can write to a person's private GitHub repositories on their behalf
*Researcher, 2026-10-01. Depth 3. Topics: github, authentication, attribution, security. Every statement is marked fact, estimate or opinion, with a grade and source numbers.*

## Summary

| Mechanism | Who GitHub shows as the actor | Can a workflow tell it apart from the person acting directly? | Lifetime |
|---|---|---|---|
| GitHub App, installation token | The app's bot (`name[bot]`) | Yes, always | 1 hour |
| GitHub App, user access token | The person, with the app's badge in the UI | Comments yes (`performed_via_github_app`); reviews and commits probably not | 8 h, refresh token 6 months |
| OAuth app token | The person | Probably not | Long-lived by default; 8 h + refresh if opted in |
| Fine-grained personal access token | The person | Probably not | 1–366 days, or none for personal resources |

## A. GitHub App, installation token

- **F1 (fact, A):** Requests made with an installation token are attributed to the app, shown as a bot account such as `@jenkins[bot]`. [1][2]
- **F2 (fact, A):** The token expires after 1 hour. It is minted by signing a JWT with the app's private key and calling `POST /app/installations/{id}/access_tokens`. [1][2]
- **F3 (fact, A):** When minting, the app can narrow the token to listed repositories (up to 500) and a subset of permissions. The person also chooses which repositories the app is installed on. [1][2]
- **F4 (fact, A):** If the private key leaks, the attacker gets access to every account the app is installed on, for as long as the key is valid. GitHub advises keeping the key in a key vault, sign-only, and never in code. [3]
- **F5 (fact, A):** Bot commits get a verified signature only if the request is authenticated as the app or bot and sets no custom author, committer or signature. [4]
- **F6 (estimate, B):** A workflow sees `github.actor` as the bot, so it can always tell these actions from the person's own. [2][5]

## B. GitHub App, user access token (user-to-server)

- **F7 (fact, A):** The app can reach only what both the person and the app's permissions allow. [6]
- **F8 (fact, A):** In the UI, a resource the app creates this way shows the person's avatar together with the app's identicon badge. [6]
- **F9 (fact, A):** The access token expires after 8 hours and the refresh token after 6 months. Using a refresh token invalidates both it and the old access token. The app owner can opt out of expiry. [7][3]
- **F10 (fact, A):** The issue-comment object has a `performed_via_github_app` field, which is either null or the app. [8]
- **F11 (fact, A):** The pull-request review object, as documented, has no such field. [9]
- **F12 (fact, A):** The GraphQL mutation `createCommitOnBranch` lets GitHub Apps write commits "directly or on behalf of users". Those commits are automatically GPG-signed and shown as verified. [10]
- **F13 (fact, A):** GitHub's own guidance: encrypt user tokens on the back end, and store refresh tokens apart from access tokens. [3]
- **F14 (estimate, B):** What a workflow can see:
  - For issue and pull-request comments, it can tell app-made comments apart, because `github.event.comment.performed_via_github_app` is set.
  - For reviews and commits it probably cannot. `github.actor` is the person [5], and no app field is documented [9].

## C. OAuth app user token

- **F15 (fact, A):** The token identifies the app as the user who signed in, e.g. `@octocat`. [2]
- **F16 (fact, A):** Scopes are coarse:
  - `repo` grants full access to all public and private repositories (code, collaborators, webhooks and more).
  - No scope covers private repositories more narrowly.
  - Scopes cannot be limited to particular repositories.
  - Changing workflow files also needs the `workflow` scope. [11][12]
- **F17 (fact, A/B):** Lifetime:
  - These tokens are long-lived by default. [2]
  - Since 2026-08-14, OAuth apps can opt in, via the `offline_access` scope or an app setting, to 8-hour tokens with 6-month refresh tokens.
  - This is on by default for new OAuth apps. [13]
- **F18 (estimate, B):** A leaked `repo` token gives full control of every repository the person can reach, including other people's and organizations' repositories. The actions look exactly like the person's own. The `performed_via_github_app` field is for GitHub Apps only, so a workflow probably cannot tell the difference. [8][11]

## D. Fine-grained personal access token

- **F19 (fact, A):** Setup and scope:
  - The token is tied to the user who created it.
  - It is limited to one resource owner, to the repositories they select, and to the permissions they choose.
  - The person creates it in Settings and pastes it into the web app. [14]
- **F20 (fact, A):**
  - **Lifetime:** 1–366 days, or none. No expiry is allowed for personal projects; organizations and enterprises have a 366-day maximum by default. [14][15]
  - **No refresh:** the person must make a new token and paste it in again.
  - **Unused tokens:** tokens unused for a year are removed automatically. [14]
- **F21 (fact, A):** Limits: fine-grained tokens cannot be used where the person is only an outside collaborator, and cannot call the Checks API, among other gaps. [14]
- **F22 (estimate, B):**
  - **Attribution:** commits, comments and reviews show as the person, with no app marker, so a workflow cannot tell them from the person's own actions.
  - **If leaked:** anyone holding the token can do whatever its permissions allow until it expires, which may be never.

## E. Points common to all four mechanisms

- **F23 (fact, A):** The contents API lets the caller set any author and committer name and email; by default both are the authenticated identity. Commit metadata therefore does not prove who acted. [12]
- **F24 (fact, A):** Commits made in the web editor are signed with GitHub's web-flow key. [4] Combined with F12, a verified badge does not show whether the person acted directly or a web app acted for them (estimate, B).
- **F25 (fact, A):** Events caused by `GITHUB_TOKEN` do not start new workflow runs, with exceptions. App installation tokens and personal access tokens do start them. [16]
- **F26 (fact, A):** Audit-log fields that show token type (`programmatic_access_type`, `hashed_token`, `token_scopes`) are documented for organizations only. [17] It is unknown whether a personal account's log offers the same (see OQ2).
- **F27 (estimate, B):** Narrowest repository permissions, plus the always-required Metadata: read:
  - Files and commits: Contents: write, plus Workflows: write if workflow files are touched.
  - Issue comments: Issues: write.
  - Reviews: Pull requests: write.

## F. The person's setup and upkeep

- **F28 (estimate, B):**
  - **Installation token:** install the app once on chosen repositories. Nothing else to maintain except key rotation by whoever runs the app.
  - **User access token:** additionally authorize once. Re-authorize if the refresh chain lapses (6 months unused).
  - **OAuth app:** authorize once.
  - **Fine-grained token:** create it, paste it in, and repeat at each expiry.
  - [1][7][14]

## G. Opinion (C, not a recommendation)

- **O1:** On the evidence above, only the installation token is plainly *not* the person. The user access token is the only one where GitHub itself marks an action as made through an app, and only on comments. The OAuth app token and the fine-grained token are indistinguishable from the person, both to workflows and to readers.
- Whether an action made through a web app "counts" as the person's own is therefore a policy choice. GitHub's signals cannot settle it.

## Proposed library entries (fact form)

Shelf life is 6 months for every entry, because token lifetimes and features change often.

| ID | Fact | Grade | Sources | Topics |
|---|---|---|---|---|
| L-F1 | Installation token: 1 hour, attributed to `app[bot]` | A | [1][2] | github, authentication, attribution |
| L-F2 | User access token: 8 h; refresh token 6 months; UI shows user avatar plus app badge | A | [3][6][7] | github, authentication, attribution |
| L-F3 | Issue comment has `performed_via_github_app`; review object has none | A | [8][9] | github, attribution |
| L-F4 | OAuth `repo` scope is all-or-nothing across repositories; tokens long-lived unless the 2026-08 expiring option is used | A | [2][11][13] | github, authentication, security |
| L-F5 | Fine-grained PAT: lifetime 1–366 days or none; per-repository scope; tied to the user; removed after 1 year unused | A | [14][15] | github, authentication, security |
| L-F6 | Leaked GitHub App private key gives access to all installations | A | [3] | security |
| L-F7 | `createCommitOnBranch` commits are auto-signed and verified, including commits on behalf of users | A | [10] | github, attribution |
| L-F8 | Events from `GITHUB_TOKEN` don't trigger workflows; app and PAT events do | A | [16] | github |

**Pattern P1** (opinion, C; topics: attribution, security): "To prove a person acted, don't trust commit author or committer fields or the verified badge, since both can come from API writes. Rely on the actor identity, plus `performed_via_github_app` where it exists."

## Sources
1. https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation
2. https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps
3. https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app
4. https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification
5. https://docs.github.com/en/actions/reference/workflows-and-actions/contexts
6. https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-with-a-github-app-on-behalf-of-a-user
7. https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens
8. https://docs.github.com/en/rest/issues/comments
9. https://docs.github.com/en/rest/pulls/reviews
10. https://github.blog/changelog/2021-09-13-a-simpler-api-for-authoring-commits/
11. https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
12. https://docs.github.com/en/rest/repos/contents
13. https://github.blog/changelog/2026-08-14-multiple-redirect-uris-and-token-refresh-for-oauth-apps/
14. https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
15. https://github.blog/changelog/2024-10-18-new-pat-rotation-policies-preview-and-optional-expiration-for-fine-grained-pats/
16. https://docs.github.com/en/actions/concepts/security/github_token
17. https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/identifying-audit-log-events-performed-by-an-access-token
