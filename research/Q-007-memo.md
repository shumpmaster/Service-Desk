# Q-007 research memo: opening a prefilled GitHub new-file page and committing it from a phone

**Date:** 2026-10-04 · **Researcher:** researcher (fresh session) · **Depth:** 3 · **Topics:** github, web, mobile
**Method:** web search and web fetch of GitHub's own pages only. Where I could, I read the raw markdown in the `github/docs` repository instead of a summary. I tested nothing. I did not open the `.env`, `.npmrc` or other config files in this folder; the question rules them out.

**Grade key:** **A** means two different GitHub pages say it (the "confirmed" bar the question sets). **B** means one GitHub docs page or official blog/changelog post says it ("single page"). **C** means only a GitHub staff post on the community forum says it. **ND** means GitHub does not document it.

**Short answer:** Partly. GitHub's own pages document only one prefill parameter, `filename`. They do not document filling in the content or committing from a phone's web browser. Whether the person commits directly or must open a pull request depends on their access and the branch rules, and that part is well documented.

## 1. Which URL parameters GitHub documents for the new-file page

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 1.1 | Adding `?filename=yournewfile.txt` to the new-file page URL fills in the file name field. | fact | **B** (one official blog post, dated 2012-12-05, updated 2019-12-06) | https://github.blog/news-insights/creating-files-on-github/ |
| 1.2 | The current docs page "Creating new files" names no URL parameters at all (checked in the raw markdown). | fact | B | https://raw.githubusercontent.com/github/docs/main/content/repositories/working-with-files/managing-files/creating-new-files.md |
| 1.3 | A `value` parameter that fills in the file's content | — | **ND** | Only a non-GitHub issue tracker describes it (isaacs/github #1527, 2019, no GitHub staff reply): https://github.com/isaacs/github/issues/1527. It is not a GitHub source and I am not offering it as a fact. |
| 1.4 | A parameter for the commit message | — | **ND** | — |
| 1.5 | The branch and folder as part of the URL path (`/new/{branch}/{path}`) | — | **ND** | Only non-GitHub sources show it (same issue as 1.3, which also reports that `filename` makes the page drop the last folder of the path). |
| 1.6 | The file name field accepts `/` to create folders. | fact | B | "Creating new files" docs page (link in 1.2) |

## 2. Length limit on prefilled content

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 2.1 | No limit is documented for the new-file page. | — | **ND** | — |
| 2.2 | On GitHub's query-parameter pages for **issues and pull requests**, a URL that "exceeds the server limit" returns `414 URI Too Long`. Neither page gives a number. | fact (about issues and PRs only) | **A** for issues and PRs, two pages. Whether it applies to the new-file page is ND. | https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue ; https://docs.github.com/en/pull-requests/reference/using-query-parameters-to-create-a-pull-request |
| 2.3 | The figure "8191 bytes" comes from a non-staff user's issue on github/docs (#5136, 2021), with no source given. | — | not a GitHub source, so not offered | https://github.com/github/docs/issues/5136 |

## 3. Committing directly versus proposing a pull request

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 3.1 | Someone without write access who creates or edits a file gets the repository forked to their account, and GitHub helps them open a pull request. | fact | **A** | creating-new-files ; https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files ; the 2012 blog post |
| 3.2 | The commit step asks whether to commit to the current branch or a new branch. For the default branch the docs advise a new branch plus a pull request. The final button reads "Commit changes" or "Propose changes". | fact | **A** | creating-new-files ; editing-files (both pull in the same reusable text, so not independent) |
| 3.3 | The Write role can push. Read and Triage cannot. Pushing to protected branches needs Maintain or Admin. | fact | B | https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization |
| 3.4 | Collaborators on a personal-account repository can push. Only the owner can merge a PR on a protected branch without approving reviews. | fact | B | https://docs.github.com/en/account-and-profile/reference/permission-levels-for-a-personal-account-repository |
| 3.5 | With required reviews on, collaborators can push to a protected branch only through an approved PR. By default the rules don't apply to admins unless "Do not allow bypassing" is set. With push restrictions on, only listed actors can push. | fact | B | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches |
| 3.6 | A ruleset can require every change to the target branch to go through an opened PR (it need not be approved). "Restrict updates" limits pushes to actors with bypass permission. | fact | B | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets |
| 3.7 | Push rulesets can block creating a new file. | fact | **A** (one shared reusable text that appears on several pages) | creating-new-files ; the reusable `rulesets-push-rules-general-info-for-related-articles` |
| 3.8 | No page says directly that branch protection forces the "Propose changes" path in the web editor. | — | **ND** (3.5 and 3.6 suggest it, but no page states the web-editor behaviour) | — |

## 4. Phone web browser versus the GitHub Mobile app

| # | Statement | Type | Grade | Sources |
|---|---|---|---|---|
| 4.1 | Creating and committing a file on GitHub's site from a phone's web browser | — | **ND** | The "Supported browsers" page lists Safari, Chrome, Edge and Firefox and says nothing about mobile: https://docs.github.com/en/get-started/using-github/supported-browsers |
| 4.2 | On iOS, once GitHub Mobile is installed, "Universal Links" are on by default, so tapping any GitHub link opens the app instead of Safari. Long-pressing a link and choosing "Open" sends it to Safari instead. | fact | B | https://docs.github.com/en/get-started/using-github/github-mobile (raw markdown checked) |
| 4.3 | How Android hands GitHub links to the app | — | **ND** | same page |
| 4.4 | The GitHub Mobile docs page lists "Edit files in pull requests" but does not list creating files. | fact | B | same page |
| 4.5 | GitHub Mobile can edit files, commit to the current branch or a new branch, and "Propose changes" to open a PR. | fact | B | https://github.blog/news-insights/product-news/file-editing-on-github-mobile-keeps-leveling-up/ (2023-03-07) |
| 4.6 | GitHub Mobile on Android and iOS has had a "Create file" option since about October 2023. | fact | **C** (staff post, alcere, 2023-10-19) | https://github.com/orgs/community/discussions/40852 |
| 4.7 | Whether the app reads the `filename` or `value` parameters when it catches a link | — | **ND** | — |

**Opinion (grade: opinion, no source):** on an iPhone with GitHub Mobile installed, 4.2 and 4.7 together mean a prefilled link may open in the app with nothing prefilled. That is my inference, not a documented fact.

## 5. Proposed library entries (for the Source checker; I have not checked these myself)

- **F-gh-05** · fact · grade B · topics: github, web · shelf life: 12 months
  - Claim: GitHub's new-file page fills in the file name from the `?filename=` query parameter. GitHub documents no parameter for content, commit message or branch.
  - Sources: github.blog/news-insights/creating-files-on-github/ ; the raw creating-new-files.md, for the absence.
- **F-gh-06** · fact · grade A · topics: github, web · shelf life: 12 months
  - Claim: GitHub's issue and PR query-parameter URLs return `414 URI Too Long` past an unstated server limit. No limit is documented for the new-file page.
  - Sources: the creating-an-issue and using-query-parameters-to-create-a-pull-request pages.
- **F-gh-07** · fact · grade A · topics: github, web · shelf life: 12 months
  - Claim: Creating or editing a file without write access forks the repository and leads to a PR. Users with access choose between the current branch and a new branch ("Commit changes" or "Propose changes"). Push rulesets can block creating a file.
  - Sources: the creating-new-files and editing-files pages.
- **F-gh-08** · fact · grade B · topics: github · shelf life: 12 months
  - Claim: Required reviews, push restrictions and the "require a pull request" ruleset stop direct pushes to the target branch. Admins bypass branch protection by default unless "Do not allow bypassing" is set. Write role can push; pushing to protected branches needs Maintain or Admin.
  - Sources: the about-protected-branches, available-rules-for-rulesets and repository-roles pages.
- **F-gh-09** · fact · grade B, with the C part kept separate · topics: github, mobile · shelf life: 6 months
  - Claim: On iOS, GitHub Mobile turns on Universal Links by default, so GitHub links open in the app. The app can edit, commit, branch and propose changes. A staff post says it can create files. Using GitHub's site in a phone browser is not documented.
  - Sources: the github-mobile docs page ; the 2023 blog post ; community discussion #40852.

---

## Six-part contract

1. **What I changed:** No files; I have no write tools. The memo above is my output, for the Orchestrator to record verbatim in research/.
2. **Why:** It answers Q-007 at depth 3 for the Service Desk decision (O4), with no recommendation, as the question asks.
3. **What I verified:** I read research/Q-007.md and the library entries tagged github (F-gh-01 to 04, L-F1, L-F2, L-F3, L-F6, L-F10, L-P1); none of them cover this. I made about 25 web searches and fetches. Where I could, I read the raw markdown in github/docs (creating-new-files, github-mobile and three reusable snippets) so I wasn't relying only on summaries. Some quotes from rendered pages came through a summarising fetch, so the Source checker should re-fetch them.
4. **What is undone:** I found no GitHub source for `value`, a commit-message parameter, the `/new/{branch}/{path}` format, a length limit for the new-file page, use of the site from a phone browser, or Android link handling. I recorded each as ND rather than testing it. I did not use any level-5 expert or paid source.
5. **Needed outside my lane:** The Source checker should check items 1.1, 2.2, 3.1, 3.2, 4.2 and 4.6 first. Whether an undocumented feature (`value`) is acceptable is the owner's call, put to them by the Chief of Staff, not mine.
6. **Open questions I'm adding (none closed):**
   - (a) Does GitHub publish any reference for its web-page URLs outside docs.github.com, such as a support article?
   - (b) Do GitHub Enterprise Server docs differ on any of this?
   - (c) Would an empirical check of `value` and mobile behaviour be acceptable? That would need someone allowed to run tests, which I am not.
   - (d) A prefilled link puts the content inside the URL. Does that matter for what the owner's answers contain? (Opinion only; no source.)

Sources:
- [Creating files on GitHub (GitHub Blog)](https://github.blog/news-insights/creating-files-on-github/)
- [Creating new files (GitHub Docs)](https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files)
- [Editing files (GitHub Docs)](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files)
- [Creating an issue (GitHub Docs)](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue)
- [Using query parameters to create a pull request (GitHub Docs)](https://docs.github.com/en/pull-requests/reference/using-query-parameters-to-create-a-pull-request)
- [About protected branches (GitHub Docs)](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Available rules for rulesets (GitHub Docs)](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [Repository roles for an organization (GitHub Docs)](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)
- [Permission levels for a personal account repository (GitHub Docs)](https://docs.github.com/en/account-and-profile/reference/permission-levels-for-a-personal-account-repository)
- [GitHub Mobile (GitHub Docs)](https://docs.github.com/en/get-started/using-github/github-mobile)
- [Supported browsers (GitHub Docs)](https://docs.github.com/en/get-started/using-github/supported-browsers)
- [File editing on GitHub Mobile keeps leveling up (GitHub Blog)](https://github.blog/news-insights/product-news/file-editing-on-github-mobile-keeps-leveling-up/)
- [Community discussion #40852 (GitHub staff)](https://github.com/orgs/community/discussions/40852)
- [isaacs/github #1527 (non-GitHub; context only)](https://github.com/isaacs/github/issues/1527)
- [github/docs #5136 (non-staff; context only)](https://github.com/github/docs/issues/5136)
