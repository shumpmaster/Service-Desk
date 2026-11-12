Verdict: FAIL

Two statements in the memo are contradicted by the pages I opened, so the memo as a whole fails. All 8 proposed entries passed, and I filed them in `library/facts/`.

I read every source through a summarising fetch, so quotes are as that fetch returned them. This folder is not a git repository, so I made no commit.

**Memo statements the sources contradict** (`research/Q-023-memo.md`)
- **Line 55–56 (§2.2):** the memo says the Commits REST API page has "no statement about time zones". The fetch of docs.github.com/en/rest/commits/commits returned the text "This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ." for the author and committer dates. The open question about whether reads keep the original offset stays open.
- **Line 94 (§5.3):** the memo says the words "permanently link" are not on the permalink page. The fetch says they appear several times, including in headings. The filed entry does not rely on them, but the memo's correction is wrong.

**Filed entries** (all in `library/facts/`)
- **`F-rec-coauthor-trailer-01` (B):**
  - The `Co-authored-by` line and the "count as a contribution" email sentence match the GitHub co-author page word for word.
  - The trailer definition matches `git-interpret-trailers`.
  - The memo proposed A. I graded it B because each half rests on one page.
- **`F-rec-prov-attribution-association-01` (B):** PROV-O defines attribution and association as quoted, with `wasAttributedTo` and `wasAssociatedWith`. It is a single document.
- **`F-rec-git-default-refs-01` (B), with the claim narrowed:**
  - `git-notes` confirms `refs/notes/commits` and that `notes.rewriteRef` has no default.
  - `git-fetch` confirms the tag default.
  - `git-push` confirms `push.default=simple`.
  - `git-fetch` calls the fetch refspec "typical", not "set by clone", so I changed the wording.
  - The memo's inference that notes are not pushed or fetched by default is not filed. No page says it.
- **`F-rec-actions-retention-notice-01` (A):**
  - Both changelogs confirm 400+ days before, 1 October 2026, the 90-day default and the public maximum of 90 days.
  - Both confirm the third-party scope.
  - The full "Export or archive … configured retention period" sentence appeared only in the 08-27 fetch. The 07-17 fetch gave "Export or archive anything you need to keep".
  - It adds to `F-rec-actions-retention-02`, which I did not edit.
- **`F-rec-personal-security-log-01` (B):** the security log page matches on 90 days, actions by others involving you, and the `repo` category.
- **`F-rec-host-refs-01` (B):** the three pages match on "the file content will not change", the branch-head wording, the read-only `refs/pull/` namespace with its fetch command, and "You can restore the head branch of a closed pull request".
- **`F-rec-swhid-01` (B):** swhid.org v1.2 clauses 5 and 6 match on the four fields, the five types, the six qualifiers, the `=` and `;` syntax, and "not guaranteed to be maintained".
- **`F-rec-pr-review-fields-01` (B):** all 15 listed properties match. The fetch reported `performed_via_github_app` as absent from the page, which is an absence seen through a summary.

**Not filed, as the memo itself marks them**
- §4.3: squash merges keeping co-authors as trailers is only an estimate.
- §4.4: notes not being pushed or fetched by default is only an inference.
- §3.2: whether `chainId` is required. The fetch said the document does not state it.
- §2.2: whether REST commit reads keep the original offset.

**Open questions**
- Do REST commit reads keep the author's original UTC offset?
- Which GitHub App objects (reviews, merges, approvals) record the app?
- Who can view the personal security log, and can it be exported or read through an API?
- Should a single-document standard such as PROV-O or SWHID count as A? I kept B, following the memo.
- The memo's line 235 says it made "18 page fetches and 1 search". I can't check that count.