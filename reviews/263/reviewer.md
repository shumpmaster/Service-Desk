Verdict: PASS

The Reviewer's verdict on branch build/builder/add-model-lab (1d7992b..444cca8), landed in #263, verbatim. Run on a different model from both Builders. Recorded by the orchestrator. Session session_01QBwHGJH9m3A4Ray7WpHzBo, 2026-11-01.

Reviewed: branch build/builder/add-model-lab in /home/user/sd-add-model-lab, range 1d7992b..444cca8 (3124ab4 test decoupling; 444cca8 Model-Lab entry plus the two regenerated config.js copies). Standard: L-0021, S-001 AC26 (specs/S-001.md:14103-14105), the J7 join sheet (specs/S-001.md:15407-15450), docs/handover/desk-operations.md:148-178. I read no builder summary and no docs/reports/**; nothing in the repository was written; all mutations ran in copies under the scratchpad. `git status --short` on the worktree is empty after the review.

## Checks that held

1. Suite and build on the worktree.
   `npm --prefix src ci && npm --prefix src test` -> `# tests 1569 / # pass 1569 / # fail 0`.
   `node src/tools/build.mjs` -> `build: PASS (3 connected projects; 39 page modules in step)`, exit 0.
   `python3 governance/checks/surface_guard.py diff --range 1d7992b..444cca8 --branch build/builder/add-model-lab` -> `OK: 2 commit(s) ... checked`.

2. L-0021's actual standard, adding a project changes only the settings file. On a complete scratch copy of the tree (everything but .git and node_modules) I appended a fourth project, `Scratch-One`, v2.5, planning false, ran `node src/tools/build.mjs --write`, then `node src/tools/build.mjs` -> `build: PASS (4 connected projects ...)` and the full suite -> `# tests 1569 / # pass 1569 / # fail 0`. No test depends on the length or membership of the live list any more. (A first attempt that copied only src/, tests/ and governance/ showed 20+ failing files; that was my copy's fault: tests/desk/sandbox-fixtures.mjs:86 reads decisions/questions/P-001-design-lab-open.md from the repository root. The complete copy is the result that counts.)

3. Pinned assertions keep their meaning on the fixed fixture. tests/desk/fixtures/config/projects.json is byte-identical to the pre-change src/config/projects.json (`git show 1d7992b:src/config/projects.json | cmp - tests/desk/fixtures/config/projects.json` -> IDENTICAL; same blob c121aca in the diff). helpers.mjs:26 now reads J7_FILE from the fixture, so CONFIG, SD, POOM and PORTFOLIO (helpers.mjs:30-39) are unchanged values. The launch-value pins (j7-config.test.mjs:30-46), the deploysNeedOwner pin (j7-config.test.mjs:104), the publishesModel pin (j23-versions.test.mjs:138) and the planning pin (j7-config.test.mjs:149-162) are the base assertions verbatim, now on the fixture; the only moved assertion is `GENERATED` equals the committed file, which moved from the fixture to LIVE_FILE (j7-config.test.mjs:20), the only correct place for it.

4. Tags kept. ac-test/join-test lines before and after are the same set: j7-config.test.mjs:1 (join-test J7), :4 (AC15), :49 (AC26), :103 (AC28); j23-versions.test.mjs:1-7 (join-test J23, J7 publishesModel); page-app.test.mjs:5 (AC4, AC5), :60 (AC30), :97 (AC32).

5. The new rule checks on the live list are real checks. Each mutation in its own scratch copy, then `node src/tools/build.mjs --write; node src/tools/build.mjs` and `node --test` on j7-config, j23-versions and page-app:
   - Model-Lab `planning: true` (second planning project): build fails; j7-config.test.mjs:17 fails with `only one project may hold "planning": true ...`; the build test at :61 fails. (2 fail)
   - Model-Lab `model: "v4"`: build fails; j7-config.test.mjs:17 fails with `projects[2].model must be "v3" or "v2.5", not "v4"`. (2 fail)
   - `publishesModel` moved to Model-Lab, off Personal-Org-Operating-Model (validator-clean, build PASS): only j23-versions.test.mjs:140 catches it, `+ 'Model-Lab' - 'Personal-Org-Operating-Model'`. (1 fail)
   - Model-Lab `contentParam: "other"` (validator-clean, build PASS): only j7-config.test.mjs:23-26 catches it. (1 fail)

6. page-app's use of the live list is justified and safe. `entry: true` imports src/public/app.js (sandbox-helpers.mjs:180-188), and app.js:9 imports `./lib/config.js`, the generated live list, so the page under test polls whatever the committed file names; a fixed config cannot change that without product code, which L-0021 forbids. page-app.test.mjs:30 gives every project beyond the two an empty repo, and :38-39 hands the same live list to the fake function, so poll counts at :50, :53, :76, :89 stay consistent. It passed with Model-Lab (v3) and with the added v2.5 project in mutation 1.

7. The Model-Lab entry against the validator and J7. src/config/projects.json:15-17: plain name, repo in owner/name form, defaultBranch `main`, model `v3`, planning false (Service-Desk keeps the one planning slot), the three EXP-004 keys as the other rows, no deploysNeedOwner, publishesModel or actionsUsage; validateConfig returns [] (build PASS). `gh api repos/shumpmaster/Model-Lab` -> `{"default_branch":"main","full_name":"shumpmaster/Model-Lab","private":false}`, so repo and defaultBranch match the live repository. Three projects is under AC26's limit of 5. src/lib/config.js and src/public/lib/config.js are the build's regeneration (the build check compares them byte for byte and passes); no product code changed. The change is the one entry the handover (desk-operations.md:150-157) describes.

## Non-blocking findings (carry as risks)

N1. The deploysNeedOwner live-list rule is weaker than the test's title and the spec's wording. j7-config.test.mjs:102 is titled "deploysNeedOwner on Service-Desk only" and specs/S-001.md:4684 and :6273 say "(Service-Desk only)", but the new rule at :106-107 only requires the flag to be true or absent per row and present on Service-Desk. Mutation: Model-Lab `deploysNeedOwner: true` -> build PASS and `# pass 21 / # fail 0` on the three files. Before this change the pin on the committed list would have failed. The fixture pin at :104 keeps the original assertion's meaning, and the validator has always allowed the flag on any entry, so this is not a change of meaning; it is a gap in the new rule that the owner or Design reviewer may want closed (`LIVE_FILE.projects.filter(p => p.deploysNeedOwner === true).map(p => p.name)` equal to `['Service-Desk']`) in a later PR, not this one.

N2. Two comments overstate the isolation. helpers.mjs:27 says "only J7's own test of the committed file reads it", but j23-versions.test.mjs:140 and page-app.test.mjs:8,30,38 read LIVE_FILE too; page-app.test.mjs:37 says it is "the one place beside J7's own test that reads the live list", but j23 reads it, and three other files load the entry and so reach the live list through app.js:9 (ac24-work-ahead.test.mjs:161, notify-ac74-desk.test.mjs:188,199,211, notify-ac78-desk.test.mjs:292). Those three pass with three and with four projects (their assertions do not count tiles or polls), so they are safe for a new project today; the comments are inaccurate, not the tests.

N3. The commit message of 444cca8 cites L-0020 (adding a project is a settings job); the ruling that licenses this pull request is L-0021. Cosmetic; the ledger is the record.

## Open questions

Q1. I reviewed the branch; no pull request body was given to me, so the Tasks-section check (model S-034) was not done. The orchestrator should confirm each ticked task against the two commits before recording this verdict.

Q2. N1: does the owner want "deploysNeedOwner on Service-Desk only" enforced on the committed list, as the title and specs/S-001.md:4684 read, or is the flag meant to be available to any project that adopts owner-approved deploys? If the former, it is a one-line follow-up in the Builder's lane.
