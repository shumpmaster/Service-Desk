Verdict: PASS

The Critic's check of research/Q-016.md for gaps and neutral phrasing, on a different model from its writer, verbatim: round 1 (FAIL), round 2 (PASS; non-blocking findings 1 and 4 applied, 2 met by this record, 3 noted: the library has no topics list to check against). Recorded by the orchestrator. Session session_01QBwHGLrbUaowxNjhF5oC3A, 2026-11-01.

## Round 1
Verdict: FAIL

The question has real neutrality problems (1-2) and several gaps (3-8). I opened the cited files and checked the setup claims. Q-016 is at /home/user/Service-Desk/research/Q-016.md.

**Blocking**

1. **The "idea to be explored" names the hoped-for form.**
   - The line "a page on the desk that summarizes every pull request in the way a slide in a briefing deck summarizes one topic" fixes four things: a page, on the desk, every pull request, slide form.
   - The opening line also presupposes "one summary per change".
   - The "Map the ground" lead-in presupposes the page ("what such a page should do, for whom") before it asks "whether it should exist".
   - The decision line calls the work "the desk's pull-request briefing work", which also presupposes it.
   - The last bullet is the only place slides come up as a form the Researcher should weigh, and it lists them as one option among several.
   - Suggested replacements:
     - Opening line: "Groundwork map: how one owner who oversees several projects worked on mostly by AI agents keeps up with the completed and waiting changes in them."
     - Replace the "idea to be explored" paragraph with: "Ways of keeping up that are in view include: reading pull requests on GitHub as now; the desk as it is; a per-change summary shown somewhere; a periodic digest; a notification only; and doing nothing new. The map should cover all of them and the cost of leaving things as they are."
     - Lead-in: "Map the ground an expert would cover before deciding whether the owner needs anything beyond what exists, and if so what, for whom and in what form:".
     - Decision line: "The shape of the Discovery for how the owner keeps up with changes across projects: ...".

2. **The setup paragraph leans toward reusing the authors' text.**
   - It lists the fixed description form in detail ("already follows a fixed form") and then says "Older pull requests may lack some of these parts".
   - Together these nudge toward taking the summary from what the author wrote.
   - Suggested wording: "Pull-request descriptions in this setup are required to follow a fixed form (parts listed). CI checks the form in v3 projects. Older pull requests were not rewritten, and nothing in this question assumes the descriptions are accurate or complete."
   - Bullet 3 should also name a third option. Suggested wording: "how summaries could be produced (taken from what the author wrote, generated from the change, written by a person, or a mix) ..."

3. **No alternatives or status quo.**
   - The current way the owner keeps up is not mapped: reading pull requests on GitHub, the desk's pull-request rows, the phone notification.
   - Neither is the cost of leaving things as they are.
   - Add a bullet: "how the owner keeps up with changes today, what that costs in time and what gets missed, and what a no-change option would leave unsolved; and what alternatives to a per-change summary exist (a periodic digest, notifications only, sorting or filtering what exists, better descriptions)".
   - Bullet 5 ("replaces, duplicates or adds") is the only nearby coverage.

4. **No trust, verification or failure modes.**
   - Bullet 3 touches who checks the summary. Nothing covers a summary that is confidently wrong or omits a risk, the owner approving from it without looking deeper, or agents writing summaries of their own work.
   - Add a bullet: "how a summary can mislead or be wrong (an omitted risk, a flattering account of the author's own work, a stale or missing description), how that would be noticed, who checks it, what the owner relies on it for, and what happens when it fails".

5. **No staleness or update behaviour.**
   - Add a bullet: "what happens to a summary when the pull request changes after it was written (new commits, edited description, review findings, checks turning red, a merge or close), and how the reader knows which state a summary describes".

6. **No privacy or vendor-data coverage.**
   - Generating summaries may send private repository content, including diffs, to an AI vendor or service.
   - Add a bullet: "what data would leave the repositories if summaries are generated, to whom, under what terms, and whether the repositories' privacy and the owner's accounts allow it".

7. **No volume or scale.**
   - Add a bullet: "how many changes arrive per day or week across the projects, and how that changes what is readable, what is skipped, and what it costs to produce summaries".

8. **No definition of "seen" or "done" for the reader.**
   - Add a bullet: "what it means for the owner to have seen or dealt with a summary (read, acknowledged, acted on, cleared), whether that is recorded, and what the reader does after reading".
   - Bullet 1 covers "when" but not this.

**Non-blocking**

9. **Wording slip.** "stream of completed changes" in the first line conflicts with bullet 1, which includes changes "waiting on the owner". Suggested: "completed and waiting changes".

10. **Unconfirmed claim about the portfolio.** The statement that the desk "reads the projects' pull requests but not the portfolio's" is not stated in the cited docs.
    - docs/handover/service-desk.md lines 19-21 say "with the portfolio read for your other work".
    - src/lib/scheduler.js lines 253-257 show a separate portfolio read of records (cards, "blobs"). I found no pull-request read for the portfolio.
    - So the claim is probably right, but it is an inference. Soften it: "The desk's pull-request rows come from the projects' repositories; the portfolio repository is read for its records (docs/handover/service-desk.md, 'What it does')." Alternatively, have the Chief of Staff confirm it.

11. **Value and measurement of any change.**
    - Add to bullet 6, or as a new bullet: "how the value of any approach could be measured or tried cheaply, and what an experiment would need".
    - Also consider one bullet on whether the same question applies to changes that are not pull requests (direct commits, deploys, records).

12. **Citation wording.** The section references are accurate, so keep them.
    - "Plain English first" is in OPERATING_MODEL §2, line 79.
    - "Why and context (S-032)" is in §3, line 120.
    - "Tasks and steps (S-034)" is in §3, line 122.
    - "Milestone: M<id>" appears in the S-032 text.
    - The desk docs files exist: docs/PROJECT.md and docs/handover/.
    - Add the S-numbers (S-026, S-032, S-034) for the Researcher.

**Other checks**

- **Answerability:** Most areas can be answered from the repositories and from web search on briefing practice. Bullets 1 and 2 are partly owner-only. That is acceptable in a groundwork map, which routes them to the owner shortlist. Depth 3 is fine.
- **Topics:** The `topics:` line cannot be checked against a library list, because I found no topics file in Service-Desk/research. Confirm the tags against the library.
- **Form:** The three headings and the "What each answer would change" text match Model-Lab's Q-001. The form is fine apart from the points above.

## Round 2
Verdict: PASS

Q-016 now meets the standard. All my round-1 blocking findings are closed, and I found nothing blocking. I re-read /home/user/Service-Desk/research/Q-016.md and /home/user/Service-Desk/intake/requests/Q-016.toml cold.

**Round-1 findings, closed**
- **Neutrality (1, 2):** The slide-form "idea" paragraph is gone. The framing is now "keeps up with changes", with six options in view that include "doing nothing new". The question asks "whether the owner needs anything beyond what exists". The setup states that "nothing in this question assumes the descriptions are accurate or complete". Summary production now lists "written by a person" as an option next to the other three. Slides appear only once, in the other-fields bullet, as one example among several.
- **Gaps (3-8):** These are now covered:
  - today's situation and the no-change cost
  - what "seen" or "dealt with" means
  - volume
  - how a summary can mislead and what happens when it fails
  - staleness
  - data leaving the repositories
- **Round-1 non-blocking points (9-11):** These are also fixed:
  - "completed and waiting" now fixes the stream wording.
  - The portfolio sentence now reads "the portfolio repository is read for its records".
  - A measurement or cheap-trial item is added.
  - Non-pull-request changes are added as a bullet.
- **Setup claims:** I checked them against OPERATING_MODEL.md. All are true.
  - §2 line 79 holds the "What this means for you" heading rule (S-026).
  - §3 line 120 holds the Context, Why and Milestone lines (S-032).
  - §3 line 122 holds the Tasks section (S-034).
  - "CI checks the form ... not the content" matches lines 120 and 122, which say CI checks form and the Critic, Reviewer and owner judge the rest.
  - The portfolio sentence is consistent with src/lib/scheduler.js and docs/handover/service-desk.md.

**Non-blocking findings**
1. Line 9 says "Each change arrives as a pull request", but the bullet at line 27 asks whether the same applies to changes that are not pull requests. Suggested: "Changes in this setup mostly arrive as a pull request on GitHub, from several project repositories ...".
2. The toml comment cites reviews/Q-016/critic.md. That file will not exist until the Orchestrator records this verdict. Make sure it is written before the request is filed, or reword the comment to "to be checked by the Critic".
3. The `topics:` tags still cannot be checked against a library list. I found no topics file in Service-Desk/research. Confirm the tags against the library.
4. This is optional. For a stricter blind to slides, change the other-fields example list to "(for example, change logs, release notes, intelligence or executive briefings, status reports)". As written, "slide-based reporting" is one example among several and does not breach neutrality.
