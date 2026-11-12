I've re-opened both pages the checker flagged and am now writing revision 3.

---

# Memo — Q-023, revision 3: what an event record must hold for work to be rebuilt from records alone

Researcher · 2026-11-12 · depth 2 · topics: github, attribution, automation, change-reporting, status-reports, agents

**Scope of this revision.** The source check (research/Q-023-source-check.md) found two statements that the pages contradict: §2.2 and §5.3. Only those two sections change here. I read both pages again today through a summarising fetch and asked for exact quotes. The quotes below are as that fetch returned them. I have not checked my own facts.

**Grades** (same key as before):
- **A**: two or more pages from the publisher.
- **B**: one such page, or one standard document.
- **C**: secondary sources only.

## Filed by the Source checker, not changed
- **From revision 2:**
  - F-rec-coauthor-trailer-01 (B, which replaces my proposed A)
  - F-rec-prov-attribution-association-01
  - F-rec-git-default-refs-01 (with the checker's narrower wording: the refspec is "typical", not "set by clone")
  - F-rec-actions-retention-notice-01
  - F-rec-personal-security-log-01
  - F-rec-host-refs-01
  - F-rec-swhid-01
  - F-rec-pr-review-fields-01
- **Filed earlier:** the F-rec-* and P-rec-* entries listed in revision 2.
- **Unchanged from revision 2:** §1.2, §1.3a, §1.5, §3.2, §4.3 (estimate), §4.4 (fact plus estimate), §5.1, §5.2a and §5.4.

## Revised sections

**2.2 Revised again: Fact (B). The open part stays open.**
- *Check runs:* times are "ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ" (unchanged).
- *Git commits API (docs.github.com/en/rest/git/commits):* the date text says "This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ." The request example is `"2008-07-09T16:13:30+12:00"`. That example is an input, so it shows only that an offset can be supplied (unchanged).
- *Commits REST API (docs.github.com/en/rest/commits/commits). Correction:* revision 2 said this page has "no statement about time zones", and that was wrong. The page does give the `Z` form. Two fetches today placed it as follows:
  - **On the query filters:** "This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ." appears twice, once for the `since` query parameter and once for `until` of "List commits". The `since` text continues: "Due to limitations of Git, timestamps must be between 1970-01-01 and 2099-12-31 (inclusive) or unexpected results may be returned."
  - **On the response dates:** in responses, `commit.author.date` and `commit.committer.date` appear only as `string, format: date-time`. Asked directly, the fetch said no sentence on the page gives the time zone of these response fields, and it found no example date value.
  - **Where the checker and I disagree:** the checker's fetch attached the ISO 8601 sentence to the author and committer dates. Mine attached it to `since`/`until`. Both of us read the page through a summary. Someone should settle this by reading the rendered page directly (see part 5 of the contract).
- *Not established:* whether reads keep the author's original UTC offset.
- *Withdrawn (as in revision 2):* the audit-log "milliseconds since the epoch" claim.
- Sources: docs.github.com/en/rest/checks/runs; docs.github.com/en/rest/git/commits; docs.github.com/en/rest/commits/commits

**5.3 Revised again: Fact (B) for each item.**
- *Permalinks. Correction:* revision 2 said the words "permanently link" are not on the page, and that was wrong. I withdraw that correction. The page says:
  - "For a permanent link to the specific version of a file that you see, instead of using a branch name in the URL (i.e. the `main` part in the example above), put a commit ID."
  - "This will permanently link to the exact version of the file in that commit."
  - The URL "replaces `main` with a specific commit ID and the file content will not change."
  - "The version of a file at the head of branch can change as new commits are made" (from revision 2; not asked for again today).
  - Pressing "y" updates the URL "to a permalink to the exact version of the file you see".
  - There is a heading "Creating a permanent link to a code snippet".
- *PR refs:* "The remote `refs/pull/` namespace is *read-only*." Heads can be fetched with `git fetch origin pull/ID/head:BRANCH_NAME` (unchanged).
- *Restoring branches:* "You can restore the head branch of a closed pull request … click **Restore branch**." (unchanged).
- Limits: the page says the *content behind the link* does not change. It does not say how long the link keeps working, for example after a force-push, a repository deletion or the end of a retention period. That stays a gap.
- Sources: docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files; docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/checking-out-pull-requests-locally; docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request

## Proposed library entries
None are new. The filed entry F-rec-host-refs-01 does not rely on the withdrawn wording, so it needs no change.

Optionally, the checker could add this wording to F-rec-host-refs-01, quoted from the page: "This will permanently link to the exact version of the file in that commit." That decision is the checker's.

## Gaps still open
- Whether GitHub's REST commit reads keep the author's original UTC offset (§2.2).
- Which part of the Commits REST page the ISO 8601 `Z` sentence describes: the `since`/`until` filters or the response dates (§2.2; the two fetches disagree).
- Whether reviews, merges and deployment approvals performed by an app record that app.
- Who else can view the personal security log, and whether it can be exported or read through an API.
- Whether `Co-authored-by` lines survive squash merges (§4.3).
- Whether git notes are left out of push and fetch by default (§4.4; no page says so outright).
- Whether `chainId` is required (§3.2).
- What happens to `refs/pull/*` and permalinks when a repository is deleted or transferred, or a commit becomes unreachable.

---

## Six-part contract

**1. What I changed**
- **§2.2:** I removed "no statement about time zones". The memo now quotes the Commits REST page's ISO 8601 `…Z` sentence and the parameters my fetch attached it to (`since` and `until`). It records that the response date fields appear only as `date-time`, and it flags that my fetch and the checker's disagree on where the sentence sits.
- **§5.3:** I withdrew revision 2's claim that "permanently link" is not on the page, and now quote the page's "permanent" and "permanently" sentences.
- I added the permalink lifetime question to the gaps.
- No other section and no library entry changed.

**2. Why.** The source check found these two statements contradicted by the pages. On re-reading, the checker was right that the page says "permanently link". The checker was also right that the Commits REST page states the ISO 8601 `Z` format, though my fetch attached it to the query filters, not the response dates.

**3. What I verified.** I ran no commands because I have no shell. I made 3 page fetches today:
- **docs.github.com/en/rest/commits/commits, 2 fetches:**
  - Both returned the ISO 8601 `…Z` sentence under `since` and `until`, and the response `date` only as `string, format: date-time`.
  - Asked directly, the second said there is no sentence on the time zone of the response dates, and the first said there are no example date values.
- **docs.github.com/…/getting-permanent-links-to-files, 1 fetch:** it returned "This will permanently link to the exact version of the file in that commit." and the "permanent link" heading and sentences quoted in §5.3.

**4. What is undone.** Everything under "Gaps still open". I did not re-open sources for the unchanged sections.

**5. Needed outside my lane**
- **Source checker:** re-check §2.2 and §5.3. In particular, decide where the ISO 8601 sentence sits on the Commits REST page by reading it without a summary if possible. Our two summarising fetches disagree.
- **Source checker:** decide whether to add the "permanently link" quote to F-rec-host-refs-01.
- **Orchestrator:** record this revision verbatim. I have no write tool.

**6. Open questions** (raised neutrally; none closed)
- Do GitHub's REST commit endpoints return the author's original UTC offset, or a time converted to UTC?
- On the Commits REST page, does the ISO 8601 `Z` sentence describe the `since`/`until` filters, the response dates, or both?
- How long does a commit-ID permalink keep working after a force-push, a repository deletion or transfer, or the end of a retention period?
- Whether a single-document standard counts as A or B is still for the owner or the Chief of Staff to rule.

Nothing here needs a level-5 expert or a paid source.

Sources:
- [GitHub REST: Commits](https://docs.github.com/en/rest/commits/commits)
- [GitHub: Getting permanent links to files](https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files)
- [GitHub REST: Git commits](https://docs.github.com/en/rest/git/commits) (carried from revision 2)
- [GitHub REST: Check runs](https://docs.github.com/en/rest/checks/runs) (carried from revision 2)
- [GitHub: Checking out pull requests locally](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/checking-out-pull-requests-locally) (carried from revision 2)
- [GitHub: Deleting and restoring branches in a pull request](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request) (carried from revision 2)