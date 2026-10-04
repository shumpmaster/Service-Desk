Verdict: PASS

I re-opened the sources behind the revised claims (3.3–3.10) and filed four new entries. Sections 1, 2 and 4.2–4.6 passed last round, and the memo leaves them unchanged. I did not re-open those pages, but the entries filed then (F-gh-05, 06, 09) stand.

I fetched the raw `github/docs` markdown with curl. For the two pages whose tables the raw file lacks, I read the rendered HTML table cells. Line numbers below are in the raw files.

## Confirmed and filed

- **3.7 and 3.8, filed as F-gh-10 (new entry, grade A with "shared text" label).**
  - The push-rulesets reusable ("may block creating a new file", fork network) is included in `creating-new-files.md` line 18 and `adding-a-file-to-a-repository.md` line 30. `editing-files.md` does not include it, as the memo says.
  - The protected-branch reusable ("you can't edit or upload files in the protected branch") is included in `editing-files.md` line 24 and `adding-a-file-to-a-repository.md` line 28. `creating-new-files.md` does not include it.
  - The reusable text matches the memo's quotes word for word.
  - F-gh-10 supersedes points (3) and (4) of F-gh-07. I did not edit F-gh-07.
- **3.3a, 3.3b, 3.4, 3.5a–c, filed as F-gh-08a (grade B).**
  - `about-protected-branches.md`:
    - Lines 37 and 156: the rules don't apply to admins by default.
    - Line 68: with required reviews, collaborators can only push through an approved pull request.
    - Line 166: with push restrictions on, only users, teams or apps given permission can push, and they still need a pull request when one is required.
    - Line 170: admins are always able to push.
  - Roles page, rendered table:
    - "Push to (write)" is ticked for Write, Maintain and Admin.
    - "Push to protected branches" is ticked for Maintain and Admin only, with the note "Doesn't apply to rulesets as these have a different bypass model."
  - Personal-account page: I reached it by following a 301 redirect. "Collaborators … can pull (read) … and push (write)" is there. The "Merge a pull request on a protected branch, even if there are no approving reviews" row sits in the owner-access table, so "only the owner" holds.
  - The entry says this is a default-role table, not a rule about who can push. This resolves the conflict that kept F-gh-08 out last round.
- **3.6, filed as F-gh-08b (grade B).** `available-rules-for-rulesets.md` line 101 says the pull request "doesn't necessarily have to be approved, but it must be opened". Line 31 says "only users with bypass permissions can push".

## Not filed

- 3.9, 3.10, 4.1, 4.3, 4.7 and 4.8 are "not documented", so there is nothing to file as a fact.
- The F-gh-09 amendment for 4.8 would add only a "not documented" item, so I left F-gh-09 as it is.

## Open questions

- **Grade A for shared reusable text.** The owner ruling in `governance/standards/sources.md` counts two different pages as two sources. F-gh-10's two pages carry one identical sentence each, so the wording is not independent. I filed it as A and labelled it. If the owner wants a stricter reading, it is B. F-gh-07 point (2) and 3.2 use the same pattern.
- **Protected branches and new files.** Does the protected-branch block cover creating a new file? The tip says "edit or upload", and `creating-new-files.md` doesn't include it. This is the point the Service Desk decision turns on, and no page answers it.
- **Admins.** Are admins exempt from the web-editor block? No page says.
- **Memo "Verified" line 3.** The memo flags that some of its fetches went through a summarising model. I re-fetched 3.3–3.6 directly, so that concern is closed.
- **Mobile website.** Does the mobile website offer "Create file"? Still not documented.
