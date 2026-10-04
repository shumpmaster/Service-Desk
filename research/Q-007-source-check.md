Verdict: FAIL

The memo's claims on parameters, the 414 error, forks and pull requests, and GitHub Mobile mostly hold up. Two claims don't, so the memo as a whole fails. I filed F-gh-05, F-gh-06, F-gh-07 and F-gh-09 in `library/`. I did not file F-gh-08. I opened the pages through web fetch and curl on the raw `github/docs` markdown. Line numbers are in the raw markdown files.

## Confirmed and filed

- **1.1 / F-gh-05:**
  - The 2012 blog post, updated 2019-12-06, says "Typing `?filename=yournewfile.txt` … will pre-fill the filename field."
  - 1.2 is also confirmed: the raw `creating-new-files.md` names no URL parameters, and its line "type the `/` directory separator" confirms 1.6.
  - This is one page only, so it is not "confirmed" by the question's two-page bar. I filed it as grade B and labelled it single page.
- **2.2 / F-gh-06:**
  - The issue page (`creating-an-issue.md`, line 131) and the pull request page (`using-query-parameters-to-create-a-pull-request.md`, line 31) both say a URL over the server limit returns `414 URI Too Long`. Neither gives a number.
  - Two pages from the same publisher, grade A.
- **3.1 and 3.2 / F-gh-07:**
  - `creating-new-files.md` and `editing-files.md` both say forking and a pull request apply without access.
  - The shared reusable `choose_commit_branch` says to use a new branch if the current one is the default branch.
  - The "Commit changes" or "Propose changes" button is in `propose_new_file` and `propose_file_change`.
- **4.2 / F-gh-09:**
  - `github-mobile.md` lines 100–104 confirm Universal Links are on by default on iOS.
  - The memo left out that long-press then "Open" turns this off for later taps for the same GitHub instance, not just that one tap. I added that to the entry.
- **4.5 and 4.6 / F-gh-09:**
  - The 2023-03-07 blog post confirms editing, a new branch while committing, and "Propose changes". It does not cover creating files.
  - Staff post #40852 (alcere, 2023-10-19) confirms the "Create file" option in the top-bar overflow menu. That is grade C.

## Problems

1. **3.7 is graded too high.** The memo calls it A, but the push-rulesets text is in `creating-new-files.md` only. `editing-files.md` doesn't include it. That makes it single page, grade B. I filed it that way in F-gh-07.
2. **3.8 is wrong.** The memo says no page covers protected branches and the web editor. `editing-files.md` includes a reusable tip, `protected-branches-block-web-edits-uploads`: "If a repository has any protected branches, you can't edit or upload files in the protected branch using GitHub." This is one page and covers edit and upload, not creating a new file. I added it to F-gh-07. It bears directly on the Service Desk decision.
3. **F-gh-08 not filed.** It says "pushing to protected branches needs Maintain or Admin." The roles page does show Push to protected branches as Maintain and Admin only. But `about-protected-branches.md` line 170 says write-access actors can be given push access to a protected branch, and that admins can always push. The two pages conflict, so the claim as worded is not confirmed.
   - On the same page, line 37 says the rules don't apply to admins by default, and that line is consistent with the memo.
   - Items 3.3 to 3.6 were only partly checked. I did not open the personal-account permissions page (3.4), and I did not confirm the 3.6 pull-request-ruleset sentence beyond `available-rules-for-rulesets.md` line 101, which supports it.

## Not checked

- The 2012 blog post as a source for 3.1 (not needed, since two docs pages cover it).
- `supported-browsers` (4.1).
- Both non-GitHub issue-tracker links (1.3, 1.5, 2.3), which the memo didn't offer as facts.
- Whether the "Create file" option appears on GitHub's mobile website. No checked page says either way.

## Open questions

- Does the protected-branch tip on `editing-files` also apply to creating a new file? It says "edit or upload." That needs its own source or the owner's decision.
- Should F-gh-08 be re-researched and split into a protected-branch claim and a ruleset claim, with the Maintain and Admin wording corrected?
- The memo's 3.8 should be corrected before anyone relies on it.
