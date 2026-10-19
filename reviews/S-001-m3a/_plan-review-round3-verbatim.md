Verdict: PASS with notes

**For the owner:** Draft 4 fixes both problems that failed the last round, and the three smaller ones. Merged rough estimates now stay off the Timeline, as the summary promises. The planning setting on the operating-model project no longer breaks the build. Nothing blocks the build now. I have four notes for the Builder:
- **One failure could hide most of the Timeline.** To tell an estimate apart, the desk now asks GitHub which files each pull request changed. Nobody can try that question from these sessions. If GitHub ever refuses it, the plan as written would hide most of the Timeline's work, not just the estimates. Falling back to showing everything is safer.
- **A "Done today" link would point at nothing.** Its row for a merged estimate would link to a Timeline entry that no longer exists.
- **A saved test file needs updating.** It is a recorded GitHub answer that lacks the new file details.
- **One cost figure is out of date.** Each request now costs about two of GitHub's points, not one.

None of this is irreversible.

**Round 2 findings** (line numbers are in specs/S-001.md on b83c5ab)
- **A, fixed.**
  - AC60 has a named exception (:4085–4093). A merged pull request counts as estimate-only when its only changed path is `intake/estimates.jsonl` and its `Milestone:` line reads `none (a rough estimate)`. It is kept off the Timeline under the same three rules as the job's merges, plan exception included.
  - The test covers it (:4196–4201). The owner paragraph now says "once merged it shows nowhere on the Timeline" (:1152–1154).
  - CS20 is split, so the estimate pull request is estimate-only and the later-work one is honestly "Not tied" (:8914–8921).
  - The brief no longer calls the private project's sprints "real records" (:10455–10459). That gap was the Critic's catch; I missed it in round 2.
- **B, fixed.** Only `planning: true` on a v2.5 entry fails the build. `false` passes, matching projects.json and configcheck.js:81–83 (:6814–6817; test :6842–6846; brief :10444–10446).
- **C, fixed.** The words are now Status's own, "Work filed: <its sprints>", with the empty ring (:5772–5774; test :5948–5949). That matches src/lib/feed.js:109.
- **D, fixed.** The wording is now "the days since it count as 0" (:1316; test :5957–5959).
- **E, fixed.** Every fixture estimate stays under 7 days old on both days (:5985–5987).

**Is J12's new read sound?**
- **The fields exist.**
  - I checked GitHub's published GraphQL schema, using octokit's copy: `PullRequest.changedFiles: Int!` and `PullRequest.files(first, after, …): PullRequestChangedFileConnection`, whose nodes have `path: String!`. Note that `files` is nullable.
  - The REST equivalents answer for Service-Desk: pull request #123 gives `changed_files: 4` and its file paths.
- **What I could not verify.** A live GraphQL call is refused here (403), so whether the desk's read token gets `files` through GraphQL is untested. It ought to, since setup step G1 gives the token Contents and Pull requests read, and the REST files list needs Pull requests read. Setup step CS13's recording should confirm it.
- **Request count and AC14's budget.** The fields ride the same query, so there are no new requests or function calls, and AC14 and A3 are unchanged. GitHub's point cost does change; see note 3.
- **The key move** (`desk-pulls-v2` to `desk-pulls-v3`) follows the earlier v1-to-v2 move exactly. The old key is removed on load, entries are read again, and a missing field counts as unread. The test covers it. That costs one cold re-read, up to 3 pages, which A3 already counts.
- **More than 2 files:** `changedFiles` above 1 gives "no", so that case is sound. `first: 2` is more than the rule needs, but harmless.

**Notes**
1. **Note: if `files` can't be read, most of the Timeline disappears.**
   - Where: AC60 at :4091–4093 says "a merge whose changed paths J12 has not read is placed as a merge J12 has not yet read". J12 at :7289–7291 says the same for an entry missing the field.
   - Failure case: GitHub refuses `files` for the token, or answers `null`. The current code (src/lib/pulls.js:307) only handles errors on the check-rollup field, so it uses the rest of the answer and every pull request's `files` is null. Every merged pull request is then placed only under plan lines. Every "Not tied to a milestone" line and every placement by a pull request's own `Milestone:` line goes silently.
   - Because the field can't be checked from these sessions, a safer rule is: changed paths not read means not estimate-only, so the pull request is placed as any pull request. The worst case is then an estimate showing on the Timeline. Also say how an error on the `files` path is judged, as the check-rollup error is.
2. **Note: the existing real J12 fixture lacks the new fields.**
   - tests/desk/fixtures/github/j12-pulls-built.json has no `changedFiles` (0 matches), and tests/desk/tools/j12-fixture.mjs maps none.
   - Under note 1's current rule, the existing AC59 and AC60 tests that use it would lose every untied and `Milestone:`-placed pull request.
   - Name the fixture's rebuild: add REST `pulls/<n>` (`changed_files`) and `pulls/<n>/files` to the tool, labelled as before. Or adopt note 1's fallback.
3. **Note: J12's point cost is now stale.** J12's "Size, not count" paragraph still says a page "still costs about 1 point". The query already nests `commits(last: 1)`, and `files(first: 2)` adds a second nested connection under 100 pull requests. Under GitHub's formula a page now costs about 2 points, against a limit of 5,000 an hour. That is still small, but restate it.
4. **Note: "Done today" isn't updated for estimates.**
   - AC66 (:4552–4563) links a merged pull request's "Done today" row to "its own sprint (AC60)". Only the job's merges get "not on the Timeline: merged by the automatic job".
   - An estimate the owner merged now has no sprint, so its row would link to nothing, and the job's words would be untrue for it.
   - Give it words, for example "not on the Timeline: a rough estimate", and a test case.
5. **Note: the exception's exact match is undefined.** AC60's match on `none (a rough estimate)` doesn't say how letter case or spaces are handled. Say exact after trimming, as J12 reads the line.

**Checks run:** `governance/checks/check_all.sh . origin/main` passes everything except `record_checks merges`. That is the same branch-local failure on the Orchestrator's own commits seen in rounds 1 and 2, and it is not a finding against the spec.

Files: /home/user/sd-orch-m3a/specs/S-001.md, /home/user/sd-orch-m3a/src/lib/pulls.js, /home/user/sd-orch-m3a/src/lib/github.js, /home/user/sd-orch-m3a/tests/desk/fixtures/github/j12-pulls-built.json, /home/user/sd-orch-m3a/tests/desk/tools/j12-fixture.mjs, /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/schema/schema.graphql
