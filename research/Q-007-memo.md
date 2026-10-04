# Q-007 memo, revision 2: prefilled GitHub new-file page and committing from a phone

**Date:** 2026-10-04 · **Researcher:** researcher (fresh session) · **Depth:** 3 · **Topics:** github, web, mobile
**Revises:** research/Q-007-memo.md, following research/Q-007-source-check.md (verdict FAIL).
**Method:** I used web search and web fetch on GitHub's own pages only. Where I could, I read the raw markdown in `github/docs`. I tested nothing. I opened no config or `.env` files in this folder.

**Grade key (unchanged):**
- **A:** two different GitHub pages say it. If the two pages share the same reusable text, I add "shared text", because they are not independent.
- **B:** one GitHub page, blog post or changelog says it ("single page").
- **C:** only a post by GitHub staff on the community forum says it.
- **ND:** not documented.

**Short answer:** Partly.
- GitHub documents one prefill parameter for the new-file page, `filename`.
- It does not document prefilling the file's content, or committing from a phone's web browser.
- Two GitHub pages say that if a repository has any protected branch, you can't edit or upload files in that branch on GitHub's site. No page says whether that also applies to creating a new file.

## What changed since revision 1

| Item | Was | Now | Reason |
|---|---|---|---|
| 3.7 | A, citing "several pages" without naming them | **A (shared text)**, naming the two pages | The Source checker was right that `editing-files.md` does not include the push-rulesets text. But `adding-a-file-to-a-repository.md` does, so two pages carry it. Revision 1 failed to name that page. If the checker does not count shared reusable text as two pages, the grade is B. |
| 3.8 | "ND: no page covers protected branches and the web editor" | **Withdrawn and replaced with a sourced fact (A, shared text)** | Revision 1 was wrong. The reusable `protected-branches-block-web-edits-uploads` appears on `editing-files.md` and on `adding-a-file-to-a-repository.md`. It covers editing and uploading. Creating a new file stays ND. |
| 3.3 | "Pushing to protected branches needs Maintain or Admin" | **Split and reworded** | The roles table does list that permission for Maintain and Admin only, with a note that it "doesn't apply to rulesets". But `about-protected-branches` says that with push restrictions on, anyone given permission can push, and that admins can always push. The table describes what each role gets by default. It does not say who can push. |
| 3.4 | Not checked by the Source checker | Re-read (rendered page) | The quotes are now given in the table below. |
| F-gh-08 | One combined entry | **Split into F-gh-08a (protected branches) and F-gh-08b (rulesets)** | The checker's open question asked for this. |

## 1. Which URL parameters GitHub documents for the new-file page (unchanged; checker confirmed)

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 1.1 | Adding `?filename=yournewfile.txt` fills in the file name field. | fact | B (single page) | https://github.blog/news-insights/creating-files-on-github/ |
| 1.2 | "Creating new files" names no URL parameters. | fact | B | raw `creating-new-files.md` |
| 1.3 | A `value` parameter that fills in the content | — | ND | Only a non-GitHub tracker mentions it (isaacs/github #1527). Context only, not offered as fact. |
| 1.4 | A parameter for the commit message | — | ND | — |
| 1.5 | Branch and folder in the URL path (`/new/{branch}/{path}`) | — | ND | Non-GitHub sources only |
| 1.6 | Typing `/` in the file name field creates folders. | fact | B | `creating-new-files.md` |

## 2. Length limit on prefilled content (unchanged; checker confirmed)

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 2.1 | No limit is documented for the new-file page. | — | ND | — |
| 2.2 | Query-parameter URLs for issues and pull requests that go over the server limit return `414 URI Too Long`. No number is given. | fact | A (issues and PRs only) | creating-an-issue ; using-query-parameters-to-create-a-pull-request |
| 2.3 | "8191 bytes" comes from a non-staff user's issue (github/docs #5136). | — | not a GitHub source | context only |

## 3. Committing directly versus proposing a pull request (revised)

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 3.1 | Without access, creating or editing a file forks the repository and helps you open a pull request. | fact | A | creating-new-files ; editing-files |
| 3.2 | You choose between the current branch and a new branch. For the default branch, the docs advise a new branch plus a PR. The button reads "Commit changes" or "Propose changes". | fact | A (shared text) | creating-new-files ; editing-files |
| 3.3a | The roles table gives "Push to (write) the person or team's assigned repositories" to Write, Maintain and Admin. | fact | B | repository-roles-for-an-organization (rendered page) |
| 3.3b | The same table gives "Push to protected branches" to Maintain and Admin only, noting "Doesn't apply to rulesets as these have a different bypass model." This describes each role's default permission. It is not a rule about who can push. | fact | B | same page |
| 3.4 | "Collaborators on a personal repository can pull (read) the contents of the repository and push (write) changes to the repository." Only the owner can "Merge a pull request on a protected branch, even if there are no approving reviews." | fact | B | https://docs.github.com/en/account-and-profile/reference/permission-levels-for-a-personal-account-repository (rendered page; the raw path I tried returned 404) |
| 3.5a | "By default, the restrictions of a branch protection rule do not apply to people with admin permissions to the repository or custom roles with the 'bypass branch protections' permission." An optional setting can apply them to admins too. | fact | B | about-protected-branches |
| 3.5b | "If you enable required reviews, collaborators can only push changes to a protected branch via a pull request that is approved by the required number of reviewers with write permissions." | fact | B | about-protected-branches |
| 3.5c | With push restrictions on, "only users, teams, or apps that have been given permission can push to the protected branch". Those with permission "will still need to create a pull request when pull requests are required." "People and apps with admin permissions to a repository are always able to push to a protected branch." | fact | B | about-protected-branches |
| 3.6 | Rulesets: "Require a pull request before merging" means all changes to the target branch must be tied to a PR that "must be opened" but need not be approved. With "Restrict updates", "only users with bypass permissions can push". | fact | B | available-rules-for-rulesets |
| 3.7 | "Push rulesets may block creating a new file in the repository based on certain restrictions." They apply to the whole fork network. | fact | A (shared text) | creating-new-files ; https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository (both include `rulesets-push-rules-general-info-for-related-articles`; `editing-files` does not) |
| 3.8 | "If a repository has any protected branches, you can't edit or upload files in the protected branch using GitHub. You can use GitHub Desktop to move your changes to a new branch and commit them." | fact | A (shared text) | editing-files ; adding-a-file-to-a-repository (both include `protected-branches-block-web-edits-uploads`; `creating-new-files` does not) |
| 3.9 | Whether 3.8 also covers **creating** a new file on the new-file page | — | ND | The tip says "edit or upload", and `creating-new-files.md` does not include it. |
| 3.10 | How 3.8 fits with admins being always able to push (3.5a and 3.5c) | — | ND | No page says whether the web-editor block in 3.8 exempts admins. The pages neither confirm nor contradict each other on this. |

## 4. Phone web browser versus the GitHub Mobile app (unchanged except 4.2)

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 4.1 | Creating and committing a file in a phone's web browser | — | ND | supported-browsers says nothing about mobile |
| 4.2 | On iOS, GitHub Mobile turns Universal Links on by default, so GitHub links open in the app. Long-pressing a link and choosing "Open" sends it to Safari, and later taps for the same GitHub instance then also open in Safari until the setting is changed back. | fact | B | github-mobile, lines 100–104. The second sentence is corrected after the Source checker's note. |
| 4.3 | How Android hands GitHub links to the app | — | ND | — |
| 4.4 | The GitHub Mobile docs page lists "Edit files in pull requests" but does not list creating files. | fact | B | github-mobile |
| 4.5 | The app can edit files, commit to the current branch or a new one, and "Propose changes". | fact | B | 2023-03-07 blog post |
| 4.6 | The app has a "Create file" option in the top-bar overflow menu. | fact | C | staff post, discussion #40852 |
| 4.7 | Whether the app reads `filename` or `value` when it catches a link | — | ND | — |
| 4.8 | Whether "Create file" exists on GitHub's mobile **website** | — | ND | The Source checker found no page either way, and so did I. |

**Opinion (no source):** if the prefilled link points at a protected branch, 3.8 suggests the owner may not be able to commit to that branch on the site. 3.9 leaves this open for new files. This is my inference, not a fact.

## 5. Proposed library entries (not self-checked)

- **F-gh-07 amendment** · fact · topics: github, web · shelf life: 12 months
  - Change point (3) to A (shared text) and add adding-a-file-to-a-repository as a source.
  - Change point (4) to A (shared text) with the same added source. Keep "NOT claimed: creating a new file", and add "NOT claimed: whether admins are exempt".
- **F-gh-08a** · fact · grade B · topics: github · shelf life: 12 months
  - Claim: Admins and the "bypass branch protections" role are not bound by branch protection by default. An optional setting changes that.
  - With required reviews on, collaborators push only through an approved PR.
  - With push restrictions on, only actors given permission can push, and they still need a PR if PRs are required. Admins can always push.
  - The org roles table gives "Push to protected branches" to Maintain and Admin by default; it does not apply to rulesets.
  - NOT claimed: that Write can never push to a protected branch.
  - Sources: about-protected-branches ; repository-roles-for-an-organization.
- **F-gh-08b** · fact · grade B · topics: github · shelf life: 12 months
  - Claim: The ruleset rule "Require a pull request before merging" requires an opened PR, which need not be approved. "Restrict updates" limits pushes to actors with bypass permission.
  - Source: available-rules-for-rulesets.
- **F-gh-09 amendment:** add 4.8 as ND.

---

## Six-part contract

1. **What I changed**
   - Revised 3.7: named the second page, and kept the grade at A (shared text).
   - Withdrew the wrong ND at 3.8 and replaced it with the sourced protected-branch tip. Added 3.9 and 3.10 as ND.
   - Reworded 3.3 into 3.3a and 3.3b, put verbatim quotes in 3.4 to 3.6, and corrected 4.2.
   - Split F-gh-08 into 08a and 08b, and proposed amendments to F-gh-07 and F-gh-09.
   - I wrote no files; I have no write tool.
2. **Why:** The source check failed the memo on 3.7, 3.8 and F-gh-08, and pointed out the 4.2 omission.
3. **What I verified** (web fetch; quotes are verbatim where I asked for code-block copies):
   - Raw reusable `protected-branches-block-web-edits-uploads`: full text quoted in 3.8.
   - Raw reusable `rulesets-push-rules-general-info-for-related-articles`: full text, including "may block creating a new file".
   - Reusable lists on three raw pages:
     - `creating-new-files.md` has the rulesets text and not the protected-branch tip.
     - `editing-files.md` has the protected-branch tip and not the rulesets text.
     - `adding-a-file-to-a-repository.md` has both.
   - Raw `about-protected-branches.md`: quotes in 3.5a to 3.5c.
   - Rendered roles page: the rows in 3.3a and 3.3b. The raw fetch did not return the table.
   - Rendered personal-account permissions page: quotes in 3.4. The raw path returned 404.
   - Raw `available-rules-for-rulesets.md`: quotes in 3.6.
   - Some of these fetches went through a summarising model. The Source checker should re-fetch 3.3 to 3.6.
4. **What is undone**
   - Still ND: `value`, a commit-message parameter, the `/new/{branch}/{path}` format, a length limit for the new-file page, using the site from a phone browser, Android link handling, and items 3.9, 3.10 and 4.8.
   - I did not re-open the pages for sections 1, 2 and 4.5–4.6, because the checker already passed them.
5. **Needed outside my lane**
   - The Source checker should decide whether "A (shared text)" meets the two-page bar for 3.2, 3.7 and 3.8, and should file F-gh-08a and 08b if they pass.
   - Whether undocumented behaviour (`value`, 3.9) is acceptable is the owner's decision, through the Chief of Staff.
6. **Open questions** (none closed):
   - (a) Does the protected-branch block cover new files? (3.9)
   - (b) Are admins exempt from the web-editor block? (3.10)
   - (c) Does GitHub's mobile website offer "Create file"? (4.8)
   - (d) Are there any URL-parameter references for GitHub pages outside docs.github.com?
   - (e) Do the GitHub Enterprise Server docs differ on any of this?
   - (f) Would someone allowed to run tests be permitted to check this empirically?
   - (g) A prefilled link puts the content inside the URL. Does that matter for the owner's answers? (Opinion only.)

Sources:
- [Creating files on GitHub (blog)](https://github.blog/news-insights/creating-files-on-github/)
- [Creating new files](https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files)
- [Editing files](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files)
- [Adding a file to a repository](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Reusable: protected-branches-block-web-edits-uploads](https://raw.githubusercontent.com/github/docs/main/data/reusables/repositories/protected-branches-block-web-edits-uploads.md)
- [Reusable: rulesets-push-rules-general-info-for-related-articles](https://raw.githubusercontent.com/github/docs/main/data/reusables/repositories/rulesets-push-rules-general-info-for-related-articles.md)
- [Creating an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue)
- [Using query parameters to create a pull request](https://docs.github.com/en/pull-requests/reference/using-query-parameters-to-create-a-pull-request)
- [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [Repository roles for an organization](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)
- [Permission levels for a personal account repository](https://docs.github.com/en/account-and-profile/reference/permission-levels-for-a-personal-account-repository)
- [GitHub Mobile](https://docs.github.com/en/get-started/using-github/github-mobile)
- [Supported browsers](https://docs.github.com/en/get-started/using-github/supported-browsers)
- [File editing on GitHub Mobile keeps leveling up (blog)](https://github.blog/news-insights/product-news/file-editing-on-github-mobile-keeps-leveling-up/)
- [Community discussion #40852](https://github.com/orgs/community/discussions/40852)
- [editing-files.md on GitHub (search result)](https://github.com/github/docs/blob/main/content/repositories/working-with-files/managing-files/editing-files.md)
- [adding-a-file-to-a-repository.md on GitHub (search result)](https://github.com/github/docs/blob/main/content/repositories/working-with-files/managing-files/adding-a-file-to-a-repository.md)
