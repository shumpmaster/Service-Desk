Verdict: PASS

Revision 3 changes only §2.2 and §5.3, and both now match the pages. I proposed no new library entries and filed none. I read the raw HTML of the pages with curl, not a summarising fetch. I did not re-open the four sources cited only for unchanged sections (checks/runs and git/commits were spot-checked only). I also did not re-open the checking-out-pull-requests and deleting-and-restoring-branches pages.

**§2.2 (Commits REST page, `research/Q-023-memo.md` lines 34–37, 62): confirmed.**
- The raw HTML of docs.github.com/en/rest/commits/commits contains "ISO 8601" four times. Two are rendered text and two are the same text in embedded JSON.
- All four sit under the `since` and `until` query parameters. The `since` text reads "Only show results that were last updated after the given time. This is a timestamp in ISO 8601 format…". The `until` text reads "Only commits before this date will be returned. This is a timestamp in ISO 8601 format…".
- My summarising fetch showed the response `date` as `string, format: date-time` with no example value. That matches the memo.
- The earlier source check (`research/Q-023-source-check.md`) said the sentence is attached to the author and committer dates. The raw HTML does not support that.
- That earlier "contradiction" therefore did not hold. The memo's original "no statement about time zones" was wrong for the page as a whole, but its revision 3 position is correct.
- The git/commits page has two "This is a timestamp in" sentences and the example `2008-07-09T16:13:30+12:00`, as the memo says. The checks/runs page has the `YYYY-MM-DDTHH:MM:SSZ` form.

**§5.3 (permalink page, lines 43–49, 52): confirmed.** The raw page contains the following:
- "This will permanently link to the exact version of the file in that commit."
- "the file content will not change"
- "can change as new commits are made"
- The heading "Creating a permanent link to a code snippet"
- "to a permalink to the exact version of the file" (the "y" key sentence)

The memo's limit also holds: I found no statement about how long a link keeps working.

**Entries:** `library/facts/F-rec-host-refs-01.md` has a `note:` that says the memo claims "permanently link" is absent, and that is now stale. A filed fact is not edited, so I left it. Its claim does not depend on that wording.

**Open questions**
- Do REST commit reads keep the author's original UTC offset? The page does not say, and I checked only the documentation, not live API output.
- Should the "permanently link" quote be added to `F-rec-host-refs-01`? The memo leaves that to the checker. A new superseding entry could carry it, but the quote adds nothing the filed claim needs, so I did not file one.
- The memo's claim of 3 page fetches in §3 of its contract (line 82) cannot be checked.
- Whether a single-document standard counts as A or B is still for the owner or the Chief of Staff.
- The remaining gaps on lines 61–68 are open questions, not claims, so they do not affect the verdict.