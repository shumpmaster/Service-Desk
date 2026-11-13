# PR #429 — the Reviewer's return, verbatim

*Recorded by the Chief of Staff's session (session_01QBwHGM9A8Rm6ghUgprr5tF) as `orchestrator`. Read at 2395d20 on claude/chief-of-staff-discovery-gptn7g, dispatched about 2026-11-13T16:12Z, returned about 16:20Z. Recorder's note: the blocking finding's line numbers in s009-j4-views.test.mjs (":191-198", ":197") do not match the file, which has 79 lines; the test it names, "AC15: once the card shows again", is at :71-79, and the assertion at :77. The finding itself was checked against the file and holds.*

Verdict: FAIL

The PR does what it says on process. Nothing under src/ changed, every builder-class commit has the right identity, and every builder branch landed with a merge commit. The surface guard passes, and the S-009 tests fail only because the adapter, the baseline record and the handover notes don't exist yet. The three owner-answer records are faithful, and reading "Go with your reccomendations for the answer" as A is fair. I am failing it for one locked check that I believe a correct build can fail: the "once the card shows again" check in J4 needs the notice's `shows` to contain the "No Chief of Staff recommendation yet" mark. The frozen spec defines a notice's `shows` as only the arrival words, and today's code shows "Opened from a notification" there, which never contains the mark. These checks are being locked here, so this needs fixing first. Because round 3 was the last, that is the owner's call.

Checklist used: docs/archive/OPERATING_MODEL_v2.5.1.md is not in Service-Desk (no docs/archive/, and the ledger has no L-0112), as reviews/341, /343 and /346 also found. I used /home/user/Personal-Org-Operating-Model/docs/archive/OPERATING_MODEL_v2.5.1.md §12 "Reviewer brief" items 1-7, together with AGENTS.md §1, §4 and §5 and your brief.

## What I read and ran
- **Read:** specs/S-009.md in full, every file under tests/acceptance/ (the lib, all 11 test files, the README, package.json, run-all.cjs and the 12 baseline cases), checks/S-009/review-rubric.md and AC18-rubric.md, the four files in decisions/questions/P-003-S-009-*.md, and `git show 334a886:questions/P-003-S-009-checks-lock.md`. Also reviews/S-009/_critic-checks.md (rounds 3 and 2), docs/handoff/2026-11-13-chief-of-staff-p002-48.md, and the outside-build plan's steps 4 and 5 (docs/handoff/2026-11-13-P-003-outside-build-plan.md:68-77).
- **Read to judge false stops:** src/public/sandbox.js:76-115 and src/notify/sender.mjs:85-130 and :225-302, plus reviews/S-009/_src-reading.md:55-75 and :270-300.
- **Fetched:** the PR body, via `gh api repos/.../pulls/429`.
- **Checked:** commit identities, trailers and parents with `git log` and `git interpret-trailers`.
- **Ran:** the two commands below. Neither wrote into the repository; `git status --porcelain` was empty before and after.

`python3 governance/checks/surface_guard.py diff --range origin/main..HEAD --branch claude/chief-of-staff-discovery-gptn7g` (exit 0):
```
NOTE: 7 merge commit(s) skipped
OK: 25 commit(s) in origin/main..HEAD checked (7 merge(s) skipped, 0 exempt, 0 human)
```

`node --test tests/acceptance/S-009/*.test.mjs 2>&1 | tail -12` (exit 1):
```
1..54
# tests 62
# suites 0
# pass 7
# fail 48
# cancelled 0
# skipped 7
# todo 0
# duration_ms 293.223073
```

The 48 failures are all expected, nothing else:
- 45 × "output does not exist yet: the adapter tests/desk/baseline/adapter.mjs is not there yet"
- 1 × "baseline record not there yet: reviews/S-009/baseline/record.json"
- 1 × "output does not exist yet: docs/handover/P-003/"
- 1 × the J7 parent test, "1 subtest failed"

The 7 passes are the case-set checks. The 7 skips are J7's later steps, skipped because the record is missing.

## Blocking findings
1. **A false stop in tests/acceptance/S-009/s009-j4-views.test.mjs:191-198.** The test "AC15: once the card shows again" loops over `via` = link and notice, and asserts `o.shows.includes(MARK)` for both (:197).
   - **What the spec says.** specs/S-009.md:156 defines `shows` for a notice as "the arrival words the desk shows there, such as 'That no longer waits on you' or the can't-read words". Only for a direct link is it "the sheet's visible text".
   - **What today's code does.** A notice for a card on the list lands on its sheet with `OPENED_WORDS`, "Opened from a notification" (src/public/sandbox.js:96; reviews/S-009/_src-reading.md:283). The banner is suppressed there because "a sheet's own line says it" (sandbox.js:113). AC15 leaves the sender and these words unchanged, so on a correct build a spec-faithful adapter writes "Opened from a notification" for the notice. That never contains the mark, so :197 fails.
   - **How it could still pass.** Only if the Builder bends the adapter's `shows` for notices beyond line 156 to fit the check. That is the check-driven adapter shaping the Reviewer's confirmation at step 7 is meant to catch.
   - **Why the Critic missed it.** It did not read src/ (reviews/S-009/_critic-checks.md:15).
   - **Fix.** For `via: "notice"`, assert only `buttons` (and, if wanted, that `lands` is the card's sheet). Keep the mark assertion for `via: "link"`.

## Non-blocking findings
1. **The "notices" field expects card ids that today's sender may not send (likely stop, which the spec allows for).** The built-only checks expect a desk case's first sender run to list card ids in `notices`:
   - s009-hold-show.test.mjs:41 and :64
   - s009-j5-sender.test.mjs:40-42
   - s009-lib.mjs:264 (`assertViewsAgree`), used in hold-show AC6/AC7 and j4 AC11
   - J7's coverage rule (b) (s009-j7-baseline.test.mjs:78)

   Today's sender sends something else:
   - With no state (a first run) it sends one bootstrap summary, keyed `<project>|summary|<time>` (src/notify/sender.mjs:99-101, :269-275).
   - With three or more new items it sends one grouped notice, keyed by hashes (`GROUP_AT = 3`, :24, :276-283).
   - Almost every case has three or more cards, from the background alone.

   So the caught push call carries no card ids. The adapter would have to recover ids from the hashed state keys, which J7 line 148's "works out no output field itself" may forbid. Otherwise the adapter cannot run at the base commit, which is the stop spec :172 and :270 allow for. This follows the spec, so it is not a check defect. Known limit :242 foresaw only "sends nothing", not "sends one summary". Put it to the owner, and to the Reviewer's step-7 brief, before the Builder's first dispatch.
2. **A hole: where the AC16 and AC17 lines show.** AC16, AC17 and J4 (spec :61-62, :111) put the lines on the queue and on Home. J7's `lines` output merges both places (spec :154), and no rubric row covers it (checks/S-009/review-rubric.md R1-R11; AC18-rubric only covers what the notes say). A build that shows the lines on the queue only passes every check. The build's Reviewer or design reviewer has to catch it.
3. **The second fix was done by removal, not comparison.** The checks-lock Ruling line says the assertions are made to "compare with the record" (decisions/questions/P-003-S-009-checks-lock.md:1). What was done was to drop them and leave them to J7's comparison on the baseline cases. The record says so at :24, and the Critic accepted it (reviews/S-009/_critic-checks.md:32-54). But the PR body says only "The Check author made both fixes". The plain paragraph should say how the second was done.
4. **A vendor name in one commit's metadata.** aaca07d9 has committer "Claude <noreply@anthropic.com>", while its author is orchestrator. AGENTS.md §1 says no model names in commits. Precedent treats this as the environment's default (reviews/244/reviewer.md:38), but every other commit here sets the committer explicitly, so this one slipped.
5. **The round-3 Check-author signature.** 20ed5297 (check-author) carries the bare `Agent-Session: session_01QBwHGM9A8Rm6ghUgprr5tF`, the same as that session's own chief-of-staff and orchestrator commits. Earlier Check-author commits used `.../check-author-1`. This is valid under Service-Desk's CLAUDE.md, but it makes the helper's commit look like the session's own. Its branch was build/check-author/S-009-r3, not the plan's build/check-author/S-009 (plan :74).
6. **PR body.** It opens with `## What this means for you` and a plain paragraph that leads with what failed: it passes the opening rule. Two small points:
   - The paragraph uses "#425" as a noun ("It carries everything from #425"). AGENTS.md §4 wants ids only as cross-references after the words they support.
   - The task "Handoff part 50 and this session's lines" is unticked with no `(added: …)` or `(not done: …)` mark. On a non-draft PR, the tasks check will count it as unexplained.
7. **Remaining gaps the Critic named, carried as risks.**
   - No baseline gate card is more than a day old (round 3, N1).
   - No check looks at a gate card's sheet text.
   - The AC13/J6 list has no entry point (R7).
   - The poison run can be escaped by a symlink outside src/ that points into src/ (round 2, N3).

## Item-by-item evidence
1. **Checks against the spec.**
   - The J2 examples (j2:15-29) match spec :85-96. J1's skew, far-future and two-entry cases match :80-82.
   - Line 23's J7 check matches :163-171: the hashes, the coverage rules (a), (b) and (c), the twin and open-card rules, the gate-case mark rule, the poison run, the comparison with the notes failure mapped to the log failure, and the AC15 built-only cases.
   - The base commit 04b722ec is an ancestor of origin/main, and src/ and tests/desk/ are unchanged from it to origin/main.
   - Line 165's notes-to-log comparison looks safe against today's code: both a failed card blob and a failed log blob give reason `github` (_src-reading.md:74-75).
   - AC2's sheet wording is covered by rubric R11.
   - I found no check written to src/ rather than to the spec. The exception is blocking finding 1, which goes beyond the spec.
2. **Owner answer records.**
   - The words are quoted verbatim, typo kept: checks-lock.md:14, criteria.md:14, pre-freeze.md:14.
   - Each Ruling line follows from its option as put.
   - The question at 334a886 gives one RECOMMENDATION, A (:9), so reading "Go with your reccomendations" as A is fair. The record says why (checks-lock.md:11).
3. **Process.**
   - `git diff --stat origin/main...HEAD -- src/` is empty.
   - The Definer and Check-author commits carry `Spec: S-009`, and none carries a co-author line.
   - All 7 merges have two parents. Each builder commit (84b3891, 76c6e0f, 37181d0, e27eb1d, 20ed529) is the second parent of a merge.
   - The Check author's three commits touch only checks/S-009/** and tests/acceptance/**.
   - The spec has not changed since the freeze (76c6e0f1).
4. **Commands:** above.

## Open questions
1. Should blocking finding 1 go to the owner as a fourth, one-line round, since round 3 was the last? Or does the owner prefer to carry it as a risk, with a Builder instruction that `shows` for a notice landing on a sheet is the sheet's text?
2. Will the Reviewer at step 7 accept an adapter that turns the bootstrap summary or grouped notice into card ids by matching hashed state keys? If not, the build stops at the adapter (non-blocking finding 1). The owner may want to hear that before the Builder's first dispatch.
3. Should this repository's reviewer charter stop pointing at docs/archive/OPERATING_MODEL_v2.5.1.md and L-0112, which it does not hold? This is the fifth review to hit the gap.

Files: /home/user/Service-Desk/tests/acceptance/S-009/s009-j4-views.test.mjs, /home/user/Service-Desk/tests/acceptance/S-009/s009-lib.mjs, /home/user/Service-Desk/specs/S-009.md, /home/user/Service-Desk/src/public/sandbox.js, /home/user/Service-Desk/src/notify/sender.mjs, /home/user/Service-Desk/decisions/questions/P-003-S-009-checks-lock.md, /home/user/Service-Desk/checks/S-009/review-rubric.md
