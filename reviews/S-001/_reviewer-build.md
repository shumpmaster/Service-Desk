Verdict: PASS

# Join-up review — Build, 2026-10-31

The eight paths at R = b7d22fa0e1d02aa890672ba0d346c00443f680f4 work together. Nothing blocks. There are six non-blocking findings (N1 to N6). Two need the Chief of Staff's attention: the corrected W4 (N1) and the owner's ticks (N2).

## Build: the working product's parts together
**Parts checked together:**
- **(i)** I ran the full suite in a clean detached worktree of R: `npm --prefix src ci` exit 0; `run build` "build: PASS (2 connected projects; 39 page modules in step)"; `npm test` 1558 tests, 1558 pass, 0 fail, exit 0. The cases walk the page's real code against tests/desk/fake-desk.mjs, the sender against the fake push service (notify-helpers.mjs), and the worker's handlers (sw.js).
- **(ii)** Run records, read with read-only `gh` and the REST API (the proxy refuses GraphQL).
- **(iii)** reviews/S-001/_owner-walkthrough.md, re-read at 34dcca8, with its Correction.

The branch moved to 7966bdc during the review. That adds only records and spec edits; `src`, `.github` and `tests` are unchanged since R.

| Path through the product | Result | Fix |
|---|---|---|
| 1. Home → waiting card or question → its sheet → answer link to GitHub's prefilled new-file page | Works together. Home's briefing links to `#/waiting` (ac82-home.test.mjs:120). The board opens a card's sheet by its own href (ac80-board.test.mjs:699). The sheet's links go to `/new/main?filename=…&value=…`: ac16-19-answering.test.mjs:134 (card), ac53-answer-boxes.test.mjs:168 (question), ac85-sheets.test.mjs:~280, ac80-board.test.mjs:183. W1 and W2 "as said". | none (N3) |
| 2. Notification → its tap → the desk opens | Works together. The sender's payload carries `navigate` (notify-ac74.test.mjs:33; test run notify-j17-push.test.mjs:179, which opens Home). The worker shows it and opens it on a tap (notify-ac75.test.mjs:295, :307, :406). The desk at `/?open=` opens Waiting and the sheet (notify-ac74-desk.test.mjs:79, :95, :210). The tap's origin is the preview (src/config/projects.json:6). Run 41203166648: success, after R. W3 "as said". | none (N3) |
| 3. Merged PR → desk-deploy's held `preview` run → the desk's Queue line (AC72) → the updated preview | Works together. ac69-72-audit-additions.test.mjs:318 walks a passed PR's merge to a waiting run, then a Deploy card "Approve ↗", then AC72's "Matches PR #77's merge · Reviewer PASS", then the run link. :281 covers R's title form `deploy <sha> — <note>`. reviews/256/reviewer.md reads "Verdict: PASS" at R. Run 41161879935 deployed R. | none (N5) |
| 4. Plan's milestones with estimates (AC24) | Works together. Home's Plan tab opens Plan (ac24-work-ahead.test.mjs:133). The rows show "about <low>–<high> days" and the rough finish (ac86-plan.test.mjs:142). The no-value words are checked at :173 and :352. | none |
| 5. Targets sheet before launch (AC97), and the weekly line's trial link (AC25) | Works together by cases; seen only in part on the preview. Before launch, the row reads "Measured from launch · …" (ac97-values-page.test.mjs:66-67). The sheet's V1–V3 have no chart and V5 reads "Before launch, not counted" (:154-162). V1–V3's words "Not measured yet · measured from launch" are checked at model level (ac97-values.test.mjs:138-144). For the trial link: Home's line opens the page, the sheet and "Your weekly figures" (ac25-weekly-page.test.mjs:115). Before launch, "Before launch: a trial, not counted" shows with each week's save link and file (:156; ac25-weekly.test.mjs:112). The corrected W4 saw only "measured from launch". | none (N1, N2) |
| 6. Agents view's drill-down on a real usage line (AC23) | Works together. The page case ac20-23-asked-agents.test.mjs:366 goes Agents view → drill-down → figures, but on a made-up line. The real Q-011 line is checked at model level (:276). My own probe at R checks the page with the real file (N4). | none (N4) |
| 7. The v2.5 project's view | Works together. Home's tile (ac82-home.test.mjs:271), the tile's tap to the page (:504), and the v2.5 page (ac83-page.test.mjs:506). The question sheet offers copy and no link (ac16-19-answering.test.mjs:187). Time asked (ac20-23-asked-agents.test.mjs:400). W1: every project read. | none |
| 8. A project the desk can't read | Works together. ac89-after-md3.test.mjs:491 fails two projects' reads and walks Home's tile, then the page, then the notes, then the v2.5 page, all in words. Also ac83-page.test.mjs:642 and ac82-home.test.mjs:522. Nothing failed on the live desk (W1: no "Can't read"), so this path rests on cases, as expected. | none |

**Run records (ii), as I read them:**
- **desk-deploy 41161879935:** head_sha R, run-name "deploy b7d22fa… — O3b…". Job `preview` succeeded, completed 02:52:53Z; its "Deploy to service-desk-preview" step succeeded at 02:52:51Z. exp-002 and production were skipped.
- **desk-notify 41203166648:** workflow_dispatch on main, head 0f7df82 (records only over R). Success, created 12:54:29Z, updated 12:54:53Z. R was committed at 02:51:33Z.
- **desk-notify on main since 2026-10-24T00:00Z** (more than 7 days, to 13:06Z today): 2413 runs, all completed. 977 success, 1125 skipped, 311 cancelled, 0 failed or any other conclusion. I fetched them in half-day windows; every window's count matched its total_count.
- **Open issues labelled `desk-notify`:** 0. The only one, #121, closed 2026-10-19.
- **CI at R:** desk-build run 41161002293 (pull_request) on #256's head 8492d4a succeeded, including its "Build and test" step. `git diff --quiet 8492d4a R -- src tests` holds. My own full-suite run is in (i).

**How much I rely on each:**
- High: my suite run; desk-build on #256 and its tree equal to R; the notify history; the issues; the deploy's SHA (from head_sha, the run-name input and desk-deploy.yml:15, :53, :57-62).
- Medium: the deploy itself. The job log was refused (403 from the blob host), so I have the step's success, not its log line.
- Medium: run 41203166648's `test = true`. REST doesn't show dispatch inputs, so this rests on the evidence file and the owner's words.
- Medium to low: the owner's ticks (N2).

## Blocking findings
None.

## Non-blocking findings (carried into the gate's case as risks)
- **N1 — Path 5's trial line was not seen on the preview.** In the Correction (_owner-walkthrough.md:26-27), W4 saw only the sheet's "measured from launch" words. The code confirms nothing could show yet:
  - `notedWeeks` keeps only weeks before this one (src/lib/weekly.js:62);
  - `weeklyOffer` returns null when none is left (:136);
  - `weeklyBlock` draws nothing without an offer (src/public/sandbox.js:1726).

  The cases above cover the trial line. Risk: the trial line and the first save are first seen live from Monday 2 November. That ties to decisions/questions/P-001-m3c-weekly-trial-waive.md.
- **N2 — The owner's ticks are weaker evidence than they look.**
  - All four were ticked in one line, and W4 was first recorded "as said" for a line that could not show (_owner-walkthrough.md:24, at 3a48215).
  - W1 and W2 rest on those ticks alone; W3 is partly backed by the run record.
  - The owner's own words don't say it was the iPhone, the Home Screen icon, or whether sign-in was asked. The spec's rule is still met on the corrected record.
- **N3 — Paths 1 and 2 are walked by chains of cases, not one case.** Each chain joins on the real href or address that the next case opens. W1, W2 and W3 cover both paths.
- **N4 — Path 6: no committed page case draws a real usage line.**
  - The page case's fixture outcomes-usage-frozen.jsonl is "NOT a real record" (tests/desk/fixtures/README.md:11).
  - The real Q-011 line (status/outcomes.jsonl:98) is checked only through `usageLines` (ac20-23-asked-agents.test.mjs:276-293). The page draws `usageLines(s)` itself (src/public/sandbox.js:2006).
  - My probe loaded the page at R (the test sandbox against fake-desk, with R's real status/outcomes.jsonl and dispatch log). It drew 8 drill-downs with figures. Q-011's lines matched :286-292 word for word, and its nulls read "not available".
  - The 9th real line (Q-013, 21:42:17Z) has no row, as built: the log ignored that session as an anomaly (dispatch-log/2026-10.jsonl:260).
  - I rate this non-blocking because the case does walk the drill-down end to end; only its input line is made up. Fix later with a page case on a real line.
- **N5 — Path 3's live Queue line for R's run isn't in the owner's words.** The owner approved the run on GitHub (O3b), and the cases cover the line.
- **N6 — Path 5's before-launch sheet words are checked at model level.** No page case checks V1–V3's "Not measured yet · measured from launch" as drawn; ac97-values.test.mjs:138-144 does at model level. W4's corrected part covers it.

**Not covered before go-live (a risk, not a finding):** LA2's address, and the production job (CS37, CS38). Their own reviews and L4, L6 and L7 cover them.

## Open questions
1. Should the Chief of Staff ask the owner to confirm, in their own words, that W1–W3 were on the iPhone from the Home Screen icon, and whether sign-in was asked (N2)?
2. The branch moved to 7966bdc during this review: the owner waived the trial week and the dry run (P-001-m3c-weekly-trial-waive.md), with spec edits at O5 and S5. S3's text is unchanged (now at specs/S-001.md:4089) and no deployable path changed. This doesn't change path 5 here; S5 takes the waiver.
3. The spec's header reads `status: draft   frozen_at: —`, at R and now.
4. `gh auth status` reports the token as invalid, but public reads worked. `--paginate` failed past page 1 and the API caps results at 1000, hence the windowed reads.

## Sign-off
The owner's ruling at the gate: decisions/questions/P-001-graduation.md. It does not exist yet; the owner commits it.

I changed nothing in the repository. The worktree I made (/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/s3) and my probe files are removed. The suite logs are kept at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/test.log, /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/build.log and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/ci.log.
