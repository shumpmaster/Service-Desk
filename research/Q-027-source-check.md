Verdict: PASS

The three entries proposed this round all hold up, and I filed them. I fetched the raw pages and read the library files myself. I did not rely on the earlier source-check report.

**Findings**
- **`F-gh-retention-02` (`research/Q-027-memo.md:60,111`): confirmed.**
  - The changelog at github.blog (`datePublished` 2026-10-01) contains the quoted sentences:
    - "are now governed by the same GitHub Actions retention setting"
    - "automatically cleaned up when they exceed the retention period configured for your enterprise, organization, or repository"
    - "This applies to checks and statuses created by GitHub Actions and third-party applications"
    - "the maximum retention for public repositories is 90 days"
    - "Changing the setting won't restore data that was previously removed"
  - The page says nothing about records already past the setting on 1 October, as the memo says.
  - The repository settings page gives the 90-day default, 1–90 days for public repositories and 1–400 for private ones.
  - That page still reads "Starting October 1, 2026, these policies will apply…", so the future tense is real.
  - Grade B: the claim that the change took effect rests on the changelog alone.
- **`P-gh-cross-repo-alerts-01` (`:115`): confirmed.**
  - The earlier failure is fixed. "Not redelivered" now cites `F-Q004-1`, which in `library/Q-004-facts.md:6` is "no automatic redelivery".
  - `F-Q004-3a`, `-4` and `-12` are cited only for delay and ordering, which matches `Q-004-facts.md:14-16`.
  - `F-gh-12` and `F-gh-12b` match the 5-minute and delayed-or-dropped schedule claims.
  - `F-cf-cron-01`, `F-gh-11` and `F-gh-webhook-types-01` support the uses made of them.
  - The "keys in one place" point is marked as an estimate, not a sourced fact.
- **`P-gh-owner-action-01` (`:113`): confirmed.**
  - `L-F1`: installation tokens act as name[bot].
  - `L-F10` and `L-F2`: the user-and-app attribution, security-log detail and badge. The memo flags both as resting on a single page.
  - `F-gh-app-tokens-02`: the intersection of user and App permissions, and narrowing by `repository_id`.
  - `F-gh-perm-02`: the permission levels.
  - `LIB-P-a`: the credential kept outside the agent. I did not use its Anthropic webhook point.
  - `P-auth-01`: the Cloudflare Access policy with Emails set to the owner.
  - `F-cf-05`: limited to Workers and noted "not documented for Pages", as the pattern says.
- **Filed:** `library/facts/F-gh-retention-02.md`, `library/patterns/P-gh-owner-action-01.md` and `library/patterns/P-gh-cross-repo-alerts-01.md`. Both patterns are grade C, since they are opinion built on confirmed entries. I edited no existing entry. `F-gh-retention-01` stays as it was, and the new fact complements it.
- **Not committed:** the folder is not a git repository, so no commit was made.

**Open questions**
1. Research questions 1–5 in the memo are still open, and I did not check them. They are for the Researcher.
2. The claim that the retention change took effect rests on one page, the changelog. A second source, such as an updated docs page, would raise it to A. The `F-gh-perm-02` facts also rest on single pages.
3. The memo's own "not checked" items are still not checked or filed: A14's unchecked events, the App permission rows for merge, reviews and contents, and the third-party tool scan.