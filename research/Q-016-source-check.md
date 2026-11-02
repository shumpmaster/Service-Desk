# Source check — Q-016 (round 1), verbatim

*The Source checker's return, on a different model from the Researcher. Recorded by the orchestrator, session session_01QBwHGLrbUaowxNjhF5oC3A, 2026-11-01.*

Verdict: FAIL

The map fails on one blocking finding: area D's pull-request count is wrong. Everything else checks out apart from small corrections. Every web quote is there word for word in the raw page text, and every repository quote is at or next to the line cited. Both shortlists are within limits (8 owner questions, 5 research questions). Nothing was filed in library/, because this is a groundwork map, and no file was edited. The only change to the clone was `git fetch --unshallow`.

## Count (my own, two methods that agree)
- **Method 1:** the GitHub API, `gh api repos/shumpmaster/Service-Desk/pulls?state=closed&per_page=100&page=1..4`, keeping PRs with `merged_at` set and grouping by UTC date. That gives 258 closed PRs, of which 251 are merged (#1 to #264).
- **Method 2:** after `git fetch --unshallow`, `TZ=UTC git log origin/main --first-parent --merges`, reading PR numbers from `(#NNN)` or `Merge pull request #NNN`. That also gives 251 PRs. The two sets are identical and every merge date matches.
- **Merged per day (UTC):**

| Day | Merged | PRs |
|---|---|---|
| Oct 25 | **22** | #222–#243 |
| Oct 26 | 4 | |
| Oct 27 | 1 | |
| Oct 28 | 1 | |
| Oct 29 | 3 | |
| Oct 30 | 1 | |
| Oct 31 | 6 | |
| Nov 1 | 5 | #260–#264; #264 at 23:44:20Z |

- **Totals:** 43 in those 8 days, or 42 before #264 merged.
- **Merged per week (Mon–Sun):**

| Week | Merged |
|---|---|
| Sep 28–Oct 4 | 27 |
| Oct 5–11 | 28 |
| Oct 12–18 | 54 |
| Oct 19–25 | 121 (Oct 19 alone: 36) |
| Oct 26–Nov 1 | 21 |

- **Average:** about 55 a week since the first merge on 2026-09-30.
- **Open now:** #265.

## Findings (all in research/Q-016-memo.md)

1. **Blocking: the count table and the rate taken from it (lines 56–69, 192).**
   - **The Oct 25 row (line 60) is wrong.** It says 4 (#240–#243); the real figure is 22 (#222–#243).
   - **Why:** I fetched the raw list page, and it holds exactly #240–#264. That is GitHub's first page of 25. The summariser counted only the PRs on that page, so Oct 25 came out partial. The Oct 26 to Nov 1 rows match exactly.
   - **Line 69:** the 8-day sum is 43, not 25. That is about 38 a week, not 22.
   - **The longer series:** the week before had 121, and the average is about 55 a week. "About 22 a week, or about 3 a day" is the quietest recent week, not a typical one. The map's own trap at line 188 warns against exactly this.
   - **Correction:** replace the table with the counts above, state the method (API and git, which agree), and either drop the per-week figure or give the 5-week series. In line 192, replace "The 22-per-week count" with the real series.
2. **Non-blocking: where the #264 data came from (lines 56, 67).**
   - "251 results" and #264 in the Nov 1 row are only true after 23:44:20Z on Nov 1.
   - The map was committed at 23:50:00Z. So either the fetch ran in that 6-minute gap, or the figures did not come from one fetch.
   - Since the counts now match reality, the rows for Oct 26 to Nov 1 are plausible. But "251" and the Nov 1 row should be marked "as of after 23:44Z, Nov 1", or the count re-dated.
3. **Non-blocking: lines 71 and 119 (I2).** "The repository may be private" is wrong. The GitHub API reports shumpmaster/Service-Desk as `visibility: public`. That explains why the fetch worked. It also bears on I1, I2 and owner question 8: Service-Desk's content is already public. Correct line 71, and add to I2 that Service-Desk is public and the other repositories are still to check.
4. **Non-blocking: B2, line 32.**
   - The quote is at docs/PROJECT.md:556, not :555.
   - It also comes from "Carried forward, to reconfirm … from the Pocket Universe design guide … not from this conversation" (lines 553–555), not from the owner's own intent.
   - Correction: "a carried-forward principle not yet reconfirmed by the owner (docs/PROJECT.md:553–556)".
5. **Non-blocking: C2, lines 40–41.**
   - "Nothing is stored on Cloudflare" is at docs/PROJECT.md:212, not :213. It is said about the V1/V2 measure figures, not as a general rule.
   - The on-device marks are at :205–206. The same passage (:206–209) says those figures are committed once a week, via a prefilled link, to the owner's private portfolio repository.
   - That is an existing answer to "where would a seen mark live". Add it to C2.
6. **Non-blocking: O1, line 155.** "Phone first" is at docs/PROJECT.md:516, not :517.
7. **Non-blocking: K1, line 132.** The source reads "The desk is never a source of truth" (lower case, :558). Correct the quote's capital.
8. **Non-blocking: owner question 5, line 168.** The question offers only new things (a list on the desk, a note, an alert, or a mix). It leaves out "nothing beyond what you have now", which Q-016 requires the map to cover. Add "or nothing beyond what you have now" so the question does not lean toward building something.
9. **Non-blocking: I3, line 121.** The cited URL now redirects to https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-code-review. Both quotes are verbatim there. Record the URL it now opens at.
10. **Confirmed, no change needed:**
    - **Web quotes, all verbatim in the raw text:**
      - GitHub notifications page (C3): the Done, Saved, Unsubscribing and Mobile push quotes.
      - NN/g mobile page (E1, P1): all three quotes.
      - Copilot code-review page (I3): "ephemeral development environment" and "improve the product…", which refers to thumbs feedback.
      - The two Copilot "Not opened" URLs do return HTTP 404.
    - **docs/PROJECT.md, quote at the cited line:** :192, :550 (under "What the owner would hate", :548), :48, :420–421, :158–161, :367, :190–191, :165–167, :116, :532–533, :343–344, :54, :106 and :110.
    - **docs/handover/service-desk.md:** :21–23, :25–27, :10–11, :39–40, and #256 at :112.
    - **docs/handover/desk-operations.md:** :81, with "Fine-grained tokens" at :78.
    - **docs/LEDGER.md:** :214, and #261 at :294.
    - **Library entries:** both quotes match line 4 of each file (P-glance-disclosure-01, P-stale-visible-01).
    - **Other:** the CLAUDE.md reviewer step.
    - **Form:**
      - Known items are graded and sourced.
      - Inferences are labelled C.
      - Assumed and unknown items are not dressed as facts; D1's count was honestly marked unverified, it is just wrong.
      - All six ways of keeping up listed in Q-016 are covered.
      - The other owner questions are plain and neutral enough.

Files: /home/user/Service-Desk/research/Q-016-memo.md (the map checked; not edited). My working files are in /tmp/claude-0/-home-user/63608b9f-b905-58e5-9426-c33e90a877a9/scratchpad: /tmp/claude-0/-home-user/63608b9f-b905-58e5-9426-c33e90a877a9/scratchpad/merged.txt (API: PR number and merge time) and /tmp/claude-0/-home-user/63608b9f-b905-58e5-9426-c33e90a877a9/scratchpad/git_prs.txt (git: PR number and UTC date).
