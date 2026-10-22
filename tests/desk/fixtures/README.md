# Fixtures for the desk's tests (spec S-001, J1, J2, J9)

- `service-desk/`: real Service-Desk files, copied unchanged with `git show`:
  - `queue/`, `decisions/`, `questions/_TEMPLATE.md`, `decisions/questions/Q-005-sources.md` and
    `governance/ROUTING.toml` at 7da0fd7 (main on 2026-10-06);
  - `questions/Q-005-sources.md` at 4f2439a (the question before it was answered and deleted);
  - `dispatch-log/2026-10.jsonl` at e2ab9c5 (its 192 lines on 2026-10-06);
  - `status/P-001@<commit>.toml` at d4d0110 (dispatched), def1e83 (waiting-owner), b787280 (ready)
    and 7da0fd7 (closed).
- `service-desk/status/outcomes.jsonl`: the real file at dd71b14 (no `usage` key yet, J10).
  `service-desk/status/outcomes-usage-frozen.jsonl` is NOT a real record: it is the outcomes line
  of J10's sample session (P-001's critic, 2026-10-06T16:40:19Z) with a `usage` key added in the
  form model S-020 froze (J10), whose figures are EXP-003 run 2's
  (docs/handover/experiments/EXP-003-result.md), the same as J10's fixture line.
- `service-desk/status/outcomes-j10.jsonl`: J10's three join-test lines, in the order J10 lists
  them: sample line 1 (the real file's first line, no `usage`); J10's fixture line in the frozen
  form, copied from the spec (NOT a real record: `control` and `record_sha` are `<fixture>`); and
  the real line of session `Q-011:research-to-source:2026-10-08T16:59:31Z`, copied unchanged from
  origin/main's `status/outcomes.jsonl` at 8e69f54 (line 98).
- `github/`: real GitHub REST responses for Service-Desk (a public repository), recorded on
  2026-10-07 without the desk's token: status 200, the headers the function reads, and the body
  exactly as GitHub sent it. Each file's `note` names the request. From M2 (recorded 2026-10-08
  with `gh api`):
  - `runs-<sha>-push.json` and `runs-<sha>-dispatch.json`: J1's workflow-run lists 3a and 3b for
    the heads J1 quotes (e2ab9c5, 38722d3, bbd7abc), and 3a for 98cfcb4, whose Orchestrator run
    failed;
  - `compare-<status>.json`: `compare/{base}...{head}?per_page=1` answers with each status
    (`ahead`, `identical`, `behind`, `diverged`), bodies as GitHub sent them, `files` included.
- `orchestrator-m2/`: no hold or merge card is on main yet, so these are written with the exact
  format strings of `hold_card` (governance/checks/orchestrator_git.py:1233–1245) and
  `MergeGate.fail` (:2887–2910), and a `status/merges.jsonl` line in the form of :2873. The shas,
  items and reasons in them are made up for the tests.
- `poom/`: Personal-Org-Operating-Model is private, so its files are NOT copied here. These
  fixtures hold only the lines S-001 J9 quotes from it at 677fe5a (the open sprint's title and
  status line, the last ledger entry's heading, `date:` and `licenses_next:` lines), in the files'
  real form, with placeholder text where the spec quotes nothing.
- `j11-3117150/`: Service-Desk's records at 3117150 and the model's timeline for that commit, the
  oracle of J11's join test and AC50's and AC51's tests (its own README says how it was made).
- `md-extremes/`: discovery map H5's extremes for AC42 (5 connected projects, 12 waits, long
  titles). NOT real records: written for the test, in the real records' forms.
- `trial-view/`: AC54's README fixtures. `README-crossing.md` is NOT a real record: written for
  AC54 (a)'s width-change case, its paragraph runs to four lines at a 360 px phone's card width and
  three at 414 px in Chromium's default sans-serif (re-worded on 2026-10-16, when AC62 set the
  summary in the quoted-text role, so that it still crosses). The fake DOM cannot measure lines, so the
  browser check confirms it crosses the three-line mark before it checks anything else (plan
  review round 2, R4).
  `P-001-design-lab-open.md` is the real question file, added at bdb50a3; identical to its last
  version at dc97190 (the model 3.5.0 sync tidied the answered question away), read by AC53's and
  AC66's tests.
- `accepted-m2/`: `_headers` and `index.html` as main had them at 33d390a, for AC42's
  "unchanged or stricter" check without git history (its README says why).
- `github/j12-pulls-built.json` (2026-10-16, J12): **NOT as GitHub sent it.** GitHub's GraphQL
  API is not reachable from the agents' sessions (`gh api graphql` answers 403 there), so J12's
  answer is built in GraphQL's answer shape from REST answers for Service-Desk, a public
  repository, recorded on 2026-10-16 with `gh api`:
  `repos/shumpmaster/Service-Desk/pulls?state=all&per_page=100` (and `&page=2`, empty: 72 pull
  requests in all) and `repos/shumpmaster/Service-Desk/commits/<head sha>/check-runs?per_page=100`
  for #40, #44, #52, #75 and #77, whose check rollups the tests need (null for the rest). Built by
  `node tests/desk/tools/j12-fixture.mjs <dir>`, whose header gives each field's mapping. Its
  `endCursor` is made up. A real recording replaces it once Setup CS13 has made it.
- `github/j12-made-up-data-null.json`, `-rate-limited.json`, `-rate-limited-403.json` and
  `-field-error.json` (2026-10-16, J12): **MADE UP**, not recordings: J12's answers with an error
  (a `data: null` answer, a `RATE_LIMITED` one in a 200 and in a 403, and the field error for the
  check rollup with the rest of the answer present), in the shape GitHub's GraphQL documentation
  gives.
- `ac61/` (2026-10-16, AC61): NOT real records. `docs/PROJECT.md` is the 3117150 fixture's with
  why ends on M2B and MD1, two out-of-form whys (MZ1, MZ2), and standard-milestone lines in S-032's
  forms (written to its draft of 2026-10-16, whose forms the frozen S-032 keeps for these lines:
  taken on, skipped, one out of form, one repeated, one naming no standard milestone);
  `pulls.json` holds made-up pull requests #901 to #909 with `Milestone:` lines and
  `## Context` / `## Why` sections in each form AC61 (c) reads. The three display leniencies
  AC61 names (2026-10-17, the desk follow-ups: closing `#`s on a heading, `Milestone:M2`, Why
  before Context) are made-up bodies written inline in AC61's test, NOT real records.
- `ac62-text-2c1acb6.json` (2026-10-16, AC62): every sandbox screen's text at commit 2c1acb6,
  outside the parts AC57 to AC60 and AC65 to AC68 rebuild, drawn by the page itself from
  `tests/desk/screen-text.mjs`'s fixtures; made by `node tests/desk/tools/ac62-snapshot.mjs` in a
  checkout of 2c1acb6's `src/` (the file's header says how).

## Model 3.5.0's records (2026-10-17, S-001 revision of that date)

Each fixture below is made or checked by the model's own code where it has any, with the command
that did it. The model's code is run from this repository's `governance/checks/` at 9f5fa73
(model v3.5.0). None of these is a real record unless it says so.

- `j11-reached/` (J11, AC50, AC57, AC59, AC65, AC68): **NOT a real record.**
  - `docs/PROJECT.md` is J11's fixture's `docs/PROJECT.md` (Service-Desk at 3117150) with M1's line
    ending ` · reached: 2026-10-07` and MD2's, which lists no sprints, ending
    ` · reached: 2026-10-16`, and four lines out of form added after M3C: MX1 `2026-02-30`, MX2
    the part before ` · sprints:`, MX3 after ` · dropped`, MX4 after ` · why:`.
  - `both/docs/PROJECT.md` is the same with two more lines after MD3: MX5, both ` · reached:` and
    ` · dropped`, and MX6, a reached line with sprints and a why. It is a separate file because
    the model's timeline prints a milestone line for each, so `trace` on it is not J11's `NOTE:`
    lines unchanged (below).
  - `model-verdicts.json` is the model's verdict on every line of both files (real-on-real):
    `python3 tests/desk/tools/milestone-verdicts.py tests/desk/fixtures/j11-reached/docs/PROJECT.md tests/desk/fixtures/j11-reached/both/docs/PROJECT.md > tests/desk/fixtures/j11-reached/model-verdicts.json`,
    which runs `milestone_lines` from governance/checks/v3_checks.py. It reads M1 (reached
    2026-10-07), M2, M2B, MD1, MD2 (reached 2026-10-16), MD3, M3A, M3B and M3C and skips lines
    115 to 118 (MX1 to MX4) of `docs/PROJECT.md`; in `both/` it also reads MX5 (reached and
    dropped) and MX6 (reached 2026-10-15, its why kept) and skips lines 117 to 120.
  - The timeline: in a scratch checkout of 3117150 (`git archive 3117150 | tar -x -C <dir>`) with
    its `governance/checks/` replaced by 9f5fa73's, `python3 governance/checks/v3_checks.py trace --root .`
    prints J11's `trace-notes.txt` lines (and the two lines that are not the timeline); with
    `j11-reached/docs/PROJECT.md` copied over `docs/PROJECT.md` it prints J11's `NOTE:` lines unchanged
    (`diff` empty, checked 2026-10-18); with `j11-reached/both/docs/PROJECT.md` it prints them with
    three lines added in Design i2, after MD3: `MX5 "A milestone both reached and dropped" (dropped)`,
    `MX6 "A milestone reached with its why"` and `sprint PR #54`.
  - The model's `v3_checks milestones` reports a line both reached and dropped
    (governance/checks/v3_checks.py:1884); it needs a `--base` and the repository's history, so it
    is not run on the fixture.
- `s033/` (J2, J3, AC3, AC53, AC66): model S-033's question, card and answer forms.
  - **Real records**, copied unchanged with `git show`: `questions/_TEMPLATE.md` at 368effa (S-033's form);
    `decisions/questions/P-001-asks-merge.md` at 368effa (a ruling with its `Proxy:` line on line 2,
    asked before S-033 was adopted, so no `Milestone:` line); `questions/P-001-asks-merge-on-desk.md`
    and `questions/P-001-cos-sessions-on-desk.md` at 3f206a5 (the first questions filed in S-033's
    form) and their answers `decisions/questions/<same name>.md` at d727b64 (the Chief of Staff's
    form: `Proxy:` on line 2, `Milestone: MD2` on line 3).
  - **Real-on-real** (NOT real records; the model's own code made or passed them): made by
    `python3 tests/desk/tools/s033-fixtures.py tests/desk/fixtures/s033`, which also copies the real
    records above. Its output on 2026-10-18:
    ```
    governance_checks.py questions: exit 0
    OK: questions check passed
    card_text: queue/P-002-stop-1.md (Milestone: M2, spec specs/S-002-made-up.md), queue/P-003-launch-2.md (a launch gate card, no milestone, no spec) and queue/Q-013-stop-2.md (a research item's stop card, no milestone: AC66 falls to its item)
    closing_problem(S033-milestone): None
    closing_problem(P-001-asks-merge-on-desk, the real question at 3f206a5, the real answer at d727b64): None
    closing_problem(P-001-cos-sessions-on-desk, the real question at 3f206a5, the real answer at d727b64): None
    ```
    - `questions/S033-milestone.md`, `-two.md`, `-standard.md` and `-none.md`: written from the
      template for a project milestone (MD3), two ids (M2, M2B), a standard id (Design-6) and
      `none (a records-only question)`; `python3 governance/checks/governance_checks.py questions --root <a v3 root holding only them>`
      passes them (exit 0, above);
    - `queue/P-002-stop-1.md`, `queue/P-003-launch-2.md` and `queue/Q-013-stop-2.md`: written by
      `card_text` (governance/checks/orchestrator.py) with this repository's
      governance/ROUTING.toml: one with `Milestone: M2` and a spec path, a launch gate card with
      neither (its `## Context` before `## 8.`), and a research item's stop card with neither;
    - `decisions/questions/S033-milestone.md`: the Chief of Staff's answer form, which
      `closing_problem` (governance/checks/asks_merge.py, the asks-merge job's check of kind (b))
      passes against `questions/S033-milestone.md` (None, above).
  - **Made from decisions/README.md:43 and J3, checked by no model code** (written inline in
    tests/desk/s033-records.test.mjs, NOT real records): the owner's own form (`Ruling:` with the
    `Milestone:` line on line 3), the answer box's (with the line after `Question:`) and the accepted
    link's (without it). No model code reads these forms' `Milestone:` line.
- `github/j12-pulls-built.json` and `github/j12-asks-merge.json` (J12, AC59, AC60, AC66; the owner's
  answer "B. Off the Timeline (Recommended)"): **NOT as GitHub sent them.** From 2026-10-17 J12's query
  asks for `mergeCommit { oid message author { name } }`; GraphQL is not reachable from the agents'
  sessions, so both are built in GraphQL's answer shape from REST answers for Service-Desk (a public
  repository), recorded on 2026-10-18 with
  `gh api repos/shumpmaster/Service-Desk/commits/<oid> > <dir>/commit-<oid>.json` (each merge commit
  of the built fixture, and 21bc250) and `gh api repos/shumpmaster/Service-Desk/pulls/84 > <dir>/pull-84.json`,
  then `python3 tests/desk/tools/j12-merge-messages.py <dir>`, which maps `commit.message` to
  `mergeCommit.message` and `commit.author.name` to `mergeCommit.author.name`:
  - `j12-pulls-built.json` keeps every other field as `tests/desk/tools/j12-fixture.mjs` built it on
    2026-10-16 and gains each of its 71 merge commits' message and author (none is the job's);
  - `j12-asks-merge.json`: #84 (**real-on-real**, from pulls/84 and commits/21bc250) and #951 to #959
    (**MADE UP**): the line quoted mid-text with an ordinary final paragraph (#951), the trailer
    paragraph by `shumpmaster` (#952), `Merged-By: someone` (#953), two `Merged-By` trailers (#954),
    the trailer mixed with a plain line (#955), the job's merge whose body names MD3 (#956), a `#`
    comment line after the trailers (#957), `Signed-off-by: A <a@x>` and `Merged-By: orchestrator` with
    two plain lines (#958), and a job's merge for a made-up plan line to list under MD3 (#959);
  - beside every message, in each file's `model` field (outside the answer's body), the model's own
    `govlib.parse_trailers` output, the author, and whether the model's rule (one
    `Merged-By: orchestrator`, author `github-actions[bot]`) makes it the job's. The script printed:
    ```
    #84 author github-actions[bot] parse_trailers [('Merged-By', 'orchestrator'), ('Delegation', 'L-0017'), ('Merged-Head', '6c34acb6a72d6d94c791c65e4084269d9a6a3974')] -> the job's
    #951 author github-actions[bot] parse_trailers [] -> not the job's
    #952 author shumpmaster parse_trailers [('Merged-By', 'orchestrator'), ('Delegation', 'L-0017'), ('Merged-Head', 'cccccccccccccccccccccccccccccccccccccccc')] -> not the job's
    #953 author github-actions[bot] parse_trailers [('Merged-By', 'someone'), ('Delegation', 'L-0017')] -> not the job's
    #954 author github-actions[bot] parse_trailers [('Merged-By', 'orchestrator'), ('Merged-By', 'orchestrator')] -> not the job's
    #955 author github-actions[bot] parse_trailers [] -> not the job's
    #956 author github-actions[bot] parse_trailers [('Merged-By', 'orchestrator'), ('Delegation', 'L-0017'), ('Merged-Head', 'cccccccccccccccccccccccccccccccccccccccc')] -> the job's
    #957 author github-actions[bot] parse_trailers [('Merged-By', 'orchestrator'), ('Delegation', 'L-0017'), ('Merged-Head', 'cccccccccccccccccccccccccccccccccccccccc')] -> the job's
    #958 author github-actions[bot] parse_trailers [('Signed-off-by', 'A <a@x>'), ('Merged-By', 'orchestrator')] -> the job's
    #959 author github-actions[bot] parse_trailers [('Merged-By', 'orchestrator'), ('Delegation', 'L-0017'), ('Merged-Head', 'cccccccccccccccccccccccccccccccccccccccc')] -> the job's
    built fixture: 71 merge commits, 0 the job's
    ```
  - **Not known yet:** that GraphQL gives the job's merge commits' `author.name` as
    `github-actions[bot]`, the git author name REST gives at 21bc250. Setup CS13's recording confirms
    it; until then J12's author check rests on REST.
- `github/j12-made-up-field-error.json` (2026-10-18): its two merged nodes gained a made-up merge
  message (`<title> (#<n>)`, a blank line, the body) and the author `shumpmaster`, in the query's new
  shape. Still MADE UP.
- `j13/` (J13, AC49, AC67): the Chief of Staff's session files, made by
  `python3 tests/desk/tools/j13-fixtures.py tests/desk/fixtures/j13`:
  - `real/sessions/chief-of-staff/session_012RJPVKAoLga2RkqLYRDcBY.jsonl`: **real**, the first
    session file on the default branch (one start line), copied unchanged from 21bc250 with `git show`;
  - `good/sessions/chief-of-staff/*.jsonl`: **NOT real records** (real-on-real: written in S-033
    AC6's forms and passed by the model's own check): `s-ended` (a piece ended, a `definer` helper
    with figures and a `ux-researcher` helper, whose role the roster lacks, with `null`s; its end
    line's usage `duration_ms` only), `s-open` (under way, with a `definer` helper), `s-two` (a second
    session under way), `s-restart` (a start after a start), `s-old` (left open since 03:30),
    `s-orphan` (an end line before any start and one after an end), `s-cost` (a made-up end line
    with a cost), and, from build review round 1, `s-edge` (a `doing` of U+FEFF alone, which Python's
    strip keeps; a helper whose times differ by one microsecond, in order) and `s-year50` (times in
    the year 50, with a fraction and `+00:00`).
    `python3 governance/checks/v3_checks.py sessions --root <a v3 root holding them>` passes them;
    its output, `good/check.txt`:
    ```
    exit 0
    NOTE: 9 session file(s) in sessions/chief-of-staff/
    OK: the Chief of Staff's session lines are in their form
    ```
  - `bad/sessions/chief-of-staff/s-bad.jsonl`: **NOT a real record**: line 1 in form; lines 2 to 20
    one for each finding the desk mirrors (it names and skips them); lines 21 to 23 for those it reads
    as written (a repeated key, `1.0` for a count, a time earlier than the line before); line 24 an end
    line whose usage has a figure of the wrong kind and line 26 one whose usage is not an object (read by
    J10's rule); line 25 in form; and, from build review round 1, lines 27 to 30 an `event` of
    `constructor`, `__proto__`, `toString` and `hasOwnProperty` (B1), lines 31 and 32 a `doing` of
    U+001C and of U+0085 (N1), and line 33 a helper that started a few microseconds after it ended
    (N3), each of which the desk names and skips. The same command's output, the model's failure
    beside each line, `bad/check.txt`:
    ```
    exit 1
    NOTE: 1 session file(s) in sessions/chief-of-staff/
    sessions/chief-of-staff/s-bad.jsonl line 2: not one JSON object (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 3: not one JSON object (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 4: missing key event (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 5: event has the wrong type (a string) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 6: unknown event 'pause' (start, helper or end) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 7: missing key doing (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 8: extra key note (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 9: session has the wrong type (a string) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 10: the file's name is not its lines' session ('other') (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 11: doing has the wrong type (a non-empty string) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 12: role has the wrong type (a non-empty string) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 13: time '2026-10-17 09:11:00' is not UTC ISO-8601 (yyyy-mm-ddThh:mm:ssZ) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 14: time '2026-02-30T09:12:00Z' is not UTC ISO-8601 (yyyy-mm-ddThh:mm:ssZ) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 15: reported has the wrong type (an object) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 16: reported: missing key duration_ms (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 17: reported: extra key cost (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 18: reported tokens has the wrong type (a whole number or null) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 19: reported tokens has the wrong type (a whole number or null) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 20: the helper started after it ended (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 21: not one JSON object (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 22: reported tokens has the wrong type (a whole number or null) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 23: its time is earlier than the time of the previous start or end line (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 24: the usage object is not model S-020's (cost_usd_estimate is not a finite number from 0 to 10^6 or null) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 26: the usage object is not model S-020's (not an object) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 27: unknown event 'constructor' (start, helper or end) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 28: unknown event '__proto__' (start, helper or end) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 29: unknown event 'toString' (start, helper or end) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 30: unknown event 'hasOwnProperty' (start, helper or end) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 31: doing has the wrong type (a non-empty string) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 32: doing has the wrong type (a non-empty string) (model S-033 AC6)
    sessions/chief-of-staff/s-bad.jsonl line 33: the helper started after it ended (model S-033 AC6)
    FAIL: 31 violation(s)
    ```

## The notification sender (2026-10-18, S-001 notifications, the brief's step 2)

The sender's tests (tests/desk/notify-*.test.mjs) need no network and no secret: every VAPID key, push
subscription and state key in them is made for the test run (tests/desk/notify-helpers.mjs) and thrown away,
and J7's `push` and `actionsUsage` entries are given in the tests' own config (`testConfig`), with the made-up
address `https://desk.example.invalid`, never in src/config/projects.json.

- `github/asks-merge-job-117691950060-excerpt.log`: **real (an excerpt).** The log of one asks-merge `merge`
  job in Service-Desk: job 117691950060, run 39133048850, 2026-10-18, fetched by the Chief of Staff through
  the GitHub API (`repos/shumpmaster/Service-Desk/actions/jobs/117691950060/logs`, Setup CS18): the run step's
  output with some cleanup lines left out, copied unchanged (sha256
  `8baf8d45efaf3b7e59278735b2959311810e50cd0a5becb3fa4b6a5391967a30`). It holds one line for a pull request,
  `PR #103: waits: check run 'build' (.github/workflows/desk-build.yml) is in_progress/None` (J16's rule (b)).
- `github/notify-pulls-open.json`, `notify-pulls-recent.json`, `notify-pull-107-files.json`,
  `notify-pull-108-files.json` and `notify-pull-84-files.json`: **real** REST answers for Service-Desk (a
  public repository), recorded once on 2026-10-18 with
  `python3 tests/desk/tools/notify-record.py tests/desk/fixtures/github` (`gh api -i`), in this folder's form.
  The open list was empty when recorded (`[]`), so AC73's test serves pull requests #107 and #108 from
  `notify-pulls-recent.json` (`pulls?state=all&per_page=8`) as open ones: real objects, their `state` set to
  `open` by the test. Its output:
  ```
  notify-pulls-open.json: 200, 2 bytes
  notify-pulls-recent.json: 200, 134523 bytes
  notify-pull-107-files.json: 200, 4828 bytes
  notify-pull-108-files.json: 200, 7329 bytes
  notify-pull-84-files.json: 200, 1046 bytes
  ```
- `notify/`, made by `python3 tests/desk/tools/notify-fixtures.py tests/desk/fixtures/notify`, which runs the
  model's own code from this repository's `governance/checks/` (read only):
  - `sd-ef8daf4/`: **real.** Service-Desk's records at ef8daf4 that the desk's readers and the sender read
    (`queue/`, `decisions/`, `questions/`, `status/`, `dispatch-log/`, `sessions/chief-of-staff/`,
    `governance/ROUTING.toml`, `docs/LEDGER.md`, `.github/workflows/asks-merge.yml`), copied unchanged with
    `git show`: 131 files. Every card there is answered and no question is open, so they give AC73 no item
    of their own; they give it the real grant (L-0017) and its `decided_by` record.
  - `ac77-real/questions/P-001-next-work.md` and
    `ac77-real/sessions/chief-of-staff/session_012RJPVKAoLga2RkqLYRDcBY.jsonl`: **real**, as they stand at
    ccf320f (the end line at 03:08:21Z, then the start at 11:26:22Z; the question raised at 11:26:23Z).
    `ac77-real/asked/questions/P-001-next-work.md`: **real except one added line**,
    `Asked in session: session_012RJPVKAoLga2RkqLYRDcBY`, directly after its `Milestone: M3A` line (the
    real question was filed before the line existed; AC77, review round 4, B1).
  - `model-classify.json`: **real-on-real** (NOT real records): `classify` (asks_merge.py:117) on 18 made-up
    diffs, with readers giving every file a form the job takes, so the verdict turns on the paths.
  - `model-waits.json`: **real-on-real** (NOT real records): the model's own `run` (asks_merge.py:600)
    driven by a fake API, one pull request a scenario, each giving one of its `waits` reasons (27), a merge
    (3) or nothing judged (1); its printed lines, and the same lines written into a log in GitHub's form, a
    timestamp before each. `find_grant` is replaced for these scenarios only (the grant L-0017 given), and
    the ledger it reads at the tip is the real one at ef8daf4.
  - `grant-cases.json` and `model-grants.json`: **real-on-real** (NOT real records): seven made-up histories
    (the real ledger at ef8daf4, changed where the case says), written into scratch repositories with git's
    plumbing (`build_repo`; tests/desk/notify-helpers.mjs `buildRepo` writes them again the same way), and
    `find_grant`'s verdict on each.

  The script printed, on 2026-10-18 (its full output, 59 lines, is the tool's to reproduce; these are the
  verdicts the tests compare):
  ```
  sd-ef8daf4: 131 files copied from ef8daf4
  ac77-real: the question and the session file at ccf320f; the asked copy adds one line after line 3
  classify(filing): kinds a, problems 0
  classify(closing): kinds b, problems 0
  classify(session added): kinds c, problems 0
  classify(session lines added): kinds c, problems 0
  classify(tidying): kinds d, problems 0
  classify(filing and a session): kinds ac, problems 0
  classify(<each of the 12 other diffs>): kinds -, problems 1   ("filing and code": kinds a, problems 1)
  run(merged): exit 0, PR #7: merged (kinds a) at aaaaaaaaaaaa under L-0017
  run(no check run yet): exit 0, PR #7: waits: no counted check run on the head yet
  run(a check running): exit 0, PR #7: waits: check run 'build' (.github/workflows/desk-build.yml) is in_progress/None
  run(GitHub refused the merge): exit 0, PR #7: waits: GitHub refused the merge (HTTP 409: conflict)
  run(judged nothing (the open pull requests unreadable)): exit 0, no PR line
  find_grant(this repository, ef8daf4): L-0017 []
  find_grant(the real ledger, brought in a plain commit): L-0017
  find_grant(superseded by a withdrawal): None
  find_grant(its decided_by record absent): None
  find_grant(no ledger): None
  find_grant(arrived in a merge carrying Merged-By): None
  find_grant(arrived in a plain merge): L-0017
  find_grant(a later entry that is not a grant): L-0017
  ```
  - `made-up/`: **NOT real records**, written for AC73, AC74 and AC77 in the real records' forms, for the
    kinds no record on main holds: a decision card (`queue/P-951-stop-1.md`), a gate ruling
    (`queue/P-952-criteria-1.md`), a card that went missing (`status/P-950.toml`, `waiting-owner` with no card
    file), an open question, a question held by AC77 (`questions/N-held.md`, with its session file
    `sessions/chief-of-staff/s-made-up.jsonl`, one start line) and a question whose answer is being recorded.
    The hold card and the merge card are `orchestrator-m2/`'s (made up, above).
  - `poom-made-up/questions/`: **NOT real records**: three v2.5 questions in poom/'s placeholder form (an
    open one, one held by AC77, one whose answer is being recorded); no file of that private project is
    copied.
- Written inline in the tests, **NOT real records**: the pull requests other than #107 and #108, their
  files, check runs, statuses, workflow runs, asks-merge runs, jobs and logs (J16's rules (a) to (d));
  the deploys; the push service's answers (AC76); and every billing answer (AC78, J21), made up from research
  Q-015's documented fields in the form GitHub's REST reference gives (no real billing figure is in this
  public repository).
- RFC 8291's worked example (Appendix A) is written into tests/desk/notify-j17-push.test.mjs: its inputs and
  its message, which the sender's encryption reproduces byte for byte.

## The desk's receiving side (2026-10-18, S-001 notifications, the brief's steps 3 and 3b)

The desk-side tests (notify-ac52-deploys, notify-ac74-desk, notify-ac75, notify-ac77-desk, notify-ac77-desk-reads
(from draft 7), notify-ac78-desk, notify-j20-desk) add no fixture file. What they read:

- `notify/ac77-real/` (above): **real**, and the `asked/` copy real except its one added line, read here by the
  page as the sender reads them (AC77's real-record cases on the desk).
- `notify/made-up/questions/N-open.md` and `queue/P-951-stop-1.md` (above): **NOT real**, the same made-up
  records the sender's tests use, for the `/?open=` tap.
- `github/notify-pull-107-files.json` and `notify-pull-108-files.json` (above): **real**, for J20's read in the
  function's blob call.
- Everything else is **NOT real** and written inline in the tests: made-up pull requests, their files, closed
  pull requests (and, from draft 7, pages of made-up merged ones and the single pull request answers), waiting
  deploy runs (run 7001, desk-deploy run 40), session lines, questions, and every billing
  answer for AC78 and J21 (made up from research Q-015's documented fields; no real billing figure is in this
  public repository). Every VAPID key and push subscription is made for the test run and thrown away, and the
  public key that AC75's sandbox case uses goes in that test's own config only, never in
  src/config/projects.json (which has no `push` until the owner's key, Setup N1).
- `tools/notify-throw-preload.mjs` is a test tool, not a fixture: it makes the sender's config read throw, for
  the exit-2 test in notify-entry.test.mjs.
- `j11-77bfeae/` (2026-10-19, S-001 AC24, Work ahead by milestones): **real.** Service-Desk's records
  at 77bfeae, the ones J11 and the model's timeline read, copied unchanged with `git show
  77bfeae:<path>` as `j11-3117150/` was, with `tree.txt` (`git ls-tree -r --name-only 77bfeae`) and
  `trace-notes.txt`, the `NOTE:` lines of `python3 governance/checks/v3_checks.py trace --root .` run
  in a `git archive 77bfeae` copy, the oracle of AC24's test (MD1 to MD3 in Design i2, the now run;
  M3A and M3B in Build i2; M3C in Launch i1; M1, M2 and M2B reached). Its own README lists the
  records. No file of Personal-Org-Operating-Model is in it.
- Work ahead's made-up records (2026-10-19, S-001 AC24, J4, J14, J15; tests/desk/wa-fixtures.mjs,
  ac24-work-ahead.test.mjs, j4-j14-j15-work-ahead.test.mjs): **NOT real records.** Every J4 plan
  (`docs/planning/<name>.md`), J14 estimate line (`intake/estimates.jsonl`; the worked example's
  figures are the mockup's, every line's `session` is `session_made_up_for_tests`), J15 later-work
  list (`intake/later-work.md`; its first two lines are Setup CS20's as the spec gives them, the rest
  made up), ask (`intake/milestone-asks/`), later-work question and answer, and the made-up plan-line
  edits to 77bfeae's `docs/PROJECT.md` (a sprint on M3A or MD3, a dropped M3D) is written by the tests
  in J4's, J14's and J15's forms; none is copied from any repository. The question naming MD3 is the
  real `notify/ac77-real/questions/P-001-next-work.md` with its `Milestone:` line and title changed,
  so it is NOT a real record either. Personal-Org-Operating-Model is read in `poom/`'s placeholder
  form only (its open sprint's title as the spec quotes it at 90f53e3, "m1.4 — v3 build: specs,
  tools, template and agent files"); for AC24's "sprint unclear" case the same placeholder sprint
  is used twice, under a second made-up name.
- `github/j12-pulls-built.json`, rebuilt on 2026-10-19 (S-001 J12, AC60's estimate-only exception,
  draft 5 of "Work ahead by milestones"): **NOT as GitHub sent it.** Built again through
  `tests/desk/tools/j12-fixture.mjs`, which now also maps each pull request's `changed_files` from
  REST `pulls/<n>` to `changedFiles` and the first two paths of REST `pulls/<n>/files` to
  `files { nodes { path } }`, from REST answers recorded on 2026-10-19:
  `gh api 'repos/shumpmaster/Service-Desk/pulls?state=all&per_page=100'` (pages 1 to 3),
  `gh api repos/shumpmaster/Service-Desk/pulls/<n>` and `.../pulls/<n>/files?per_page=100` for each
  pull request kept, `.../commits/<head sha>/check-runs?per_page=100` for #40, #44, #52, #75 and #77,
  then `node tests/desk/tools/j12-fixture.mjs <dir> --upto 77` (the 72 pull requests the fixture held
  when first built, so every earlier case is unchanged) and
  `python3 tests/desk/tools/j12-merge-messages.py <dir>` (with `commits/<oid>` for each merge
  commit, `pulls/84` and `commits/21bc250`). Compared with the fixture it replaces, every field but
  the two new ones is the same for all 72; none is estimate-only (16 change one path, none of them
  `intake/estimates.jsonl`). `j12-asks-merge.json` came out of the same run unchanged (its nodes have
  no changed paths, so read as not estimate-only). The made-up pull requests #970 to #980 in
  j12-ac60-ac66-estimates.test.mjs, with their changed paths and `files` errors, are **MADE UP**,
  in the shape GitHub's GraphQL documentation gives.

## The job's pull requests, being recorded (2026-10-19, S-001 AC79, the brief's step 7)

The AC79 tests (ac79-being-recorded, ac79-desk, and AC79's cases in ac14-budget, notify-ac73-set,
notify-ac77-desk, notify-j16-jobs and j6-j8-function) add no fixture file. What they read:

- `notify/sd-ef8daf4/docs/LEDGER.md`, `decisions/questions/P-001-asks-merge.md` and
  `.github/workflows/asks-merge.yml` (above): **real**, for the ledger's form check, the grant L-0017 and the
  record its `decided_by` names, and the job's workflow in the tree.
- `notify/grant-cases.json` and `model-grants.json` (above): **real-on-real**, for the form check against
  `find_grant`'s verdicts (the page never trusts more than `find_grant`; the one case it cannot see is the
  `Merged-By:` arrival).
- `github/asks-merge-job-117691950060-excerpt.log` (above): **real (an excerpt)**, for the log form's filtered
  lines against the whole log.
- `notify/ac77-real/questions/P-001-next-work.md` (above): **real**, the question an answer record's pull
  request records, for "Your answer to <question>".
- Everything else is **NOT real** and written inline in the tests: the candidates' pull requests and files,
  their check runs, statuses and workflow runs, the asks-merge runs, their jobs and logs (each line in GitHub's
  form, a timestamp before it), the head commits' times, and the failures.

## The desk as mockup v2, stage 1a (2026-10-20, S-001 AC80, AC81, J20 and J22)

- `j22/` (J22, J20; read by `j22-board-rules.test.mjs`): **real**, Service-Desk (a public
  repository), recorded on 2026-10-20 with `gh api` (no token needed) and the model's own tools at
  recorded commits:
  - `files-<n>-p<k>.json`: `gh api "repos/shumpmaster/Service-Desk/pulls/<n>/files?per_page=100"`
    (and `&page=2` for #128's 128 files and #148's), for #126, #128, #130, #135 and #148, cut to
    the fields J20 reads (`sha`, `filename`, `status`, `previous_filename`), order unchanged;
  - `status-<n>.json`: `gh api "repos/shumpmaster/Service-Desk/commits/<head>/status?per_page=100"`
    at each pull request's head (#126 153824c, #128 f8f54ef, #130 58923ad, #135 a00be9d, #148
    d1d964b), cut to `state`, `sha`, `total_count` and each status's `context`, `state` and
    `description`;
  - `risk-paths-304144d.toml`: `git show 304144d:governance/risk-paths.toml` (the head of #130 and
    #135 reads the same file); `risk-paths-pr126.toml` (#126's and #128's) and
    `risk-paths-pr148.toml`, each `governance/risk-paths.toml` at that pull request's head;
  - `classify-304144d.txt`: in a worktree at 304144d, `git ls-files -z | xargs -0 env
    PYTHONDONTWRITEBYTECODE=1 python3 -I governance/checks/review_check.py classify --root .`
    (1,277 lines: 612 R0, 574 R1, 91 R3);
  - `review-check-pr.txt`: in a worktree at each head, `PYTHONDONTWRITEBYTECODE=1 python3 -I
    governance/checks/review_check.py pr <n> --base <base>` (bases d8026fa for #126, #128 and
    #130, b64257d for #135, a48d31b for #148), its `Risk class`, `Required reviews` and `Flag`
    lines: #126 R0, none; #128 R1, reviewer; #130, #135 and #148 R3, owner and reviewer.
  - `review_check.parse_verdict`, run on the verdict texts the J22 test gives
    (`python3 -I -c 'import sys; sys.path.insert(0, "governance/checks"); import review_check as r;
    print(r.parse_verdict(open(0).read()))'`): the four PASS texts read `PASS`, the FAIL text
    `FAIL`, `Verdict: pass` and a text with no `Verdict:` line `None`.
- `j22/blobs/<sha>` (stage 1b, J16's rule 0 in the sender; read by `notify-j16-rule0.test.mjs`):
  **real**, Service-Desk (a public repository): the verdict files `reviews/<n>/<id>.md` that the
  `files-<n>-p<k>.json` lists above name (#126's and #130's `owner.md`, the same blob as #135's and
  #148's, and the `reviewer.md` of #128, #130, #135 and #148), each `git cat-file blob <sha>` in a
  clone of Service-Desk, unchanged, named by its blob sha (`git hash-object <file>` gives that name
  back). The sender reads them by sha as GitHub's `git/blobs/<sha>` would answer them (base64, made
  by the fake GitHub from these bytes), so the real-on-real case holds the sender's rule 0 against
  the page's on the real lists, real verdicts and real statuses of those five pull requests.
- Stage 1b's other cases (`notify-j16-rule0.test.mjs`, `notify-j18-rule0.test.mjs`,
  `notify-ac73-rule0.test.mjs`, through `rule0-fixture.mjs`): **NOT real records**, written inline:
  every pull request, file list, verdict text, owner-check status, ETag, failure and rate-limit
  count; each verdict file's sha is its made-up text's real blob sha.
- `board-v5/` (AC80): **NOT real records.** Version 5's eight example cards, made up from
  `docs/design/mockups/board.html`'s `ITEMS` (#135, #130, #126, #127, #128 and the questions
  "qa", "qd" and "q"), as the made-up project "Example": its `governance/risk-paths.toml`, in
  J22's form, and the three questions, in model S-033's question form. The pull requests and their
  changed files are made up in `ac80-board.test.mjs` itself; so are the cards of AC52's one of each
  kind (`sandbox-fixtures.mjs`'s `fullRepo`, NOT real, as before) and every mark, head and verdict
  the tests give.
- `src/public/fonts/` (AC81; not a fixture, recorded here for its test): IBM's own files,
  unchanged, from `npm pack @ibm/plex-sans@1.1.0 @ibm/plex-mono@2.5.0` (npm's `dist.shasum`
  44a45a8e269870221c431eb4e8023dca6ed21ceb and 152c0b1dda619ef5f032db258bda798cf278125e), each
  `package/fonts/split/woff2/<file>` and `package/LICENSE.txt` copied with `cp`. Their SHA-256,
  `sha256sum` of the package's file and of the served file alike (AC81's test compares these):

  ```
  b5ad7bd39f996144915f0ad9849a90183b27d8c28ad97ed98af5b1bebc51f6b1  IBMPlexSans-Regular-Latin1.woff2
  1487059829a180f975627e473acc81ff22c2c0faf1da09b314c27eeb41b7f2e4  IBMPlexSans-Regular-Pi.woff2
  b5610af04d0d4b5a14a621d96d974b993e945a065db1a8861918f69ef9321934  IBMPlexSans-Medium-Latin1.woff2
  bf05f10c977353cfb5a5c11e8973adf77c2b93a4798da3aa0dd8ba5088e12515  IBMPlexSans-Medium-Pi.woff2
  fff0ab3a88b0b4aa0b693e4f0201359a15183b08e3fa5696d1918d8f0ade8ad5  IBMPlexSans-SemiBold-Latin1.woff2
  768421433d850d3a30118dddf05972625d99ee49bc32c5a8fd26bbe020c4d0f9  IBMPlexSans-SemiBold-Pi.woff2
  e8993d946649b9d01abb1ed06d574b19d8ea3e66b5c3948602db335c44c18e56  IBMPlexMono-Regular-Latin1.woff2
  b8002770aa636f544ba43e124da6a227301769754f295eae26e16475b469c767  IBMPlexMono-Regular-Pi.woff2
  41201b658a328b9d00368215c2f1102770f80b15952ab82631e4006255e6365d  IBMPlexMono-Medium-Latin1.woff2
  92bd18415e8c43a2569f615e4e84a94b1b1c4e0377ba9d8f4d894bbf6ffcc39d  IBMPlexMono-Medium-Pi.woff2
  7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da  LICENSE.txt
  ```

  The two packages' `LICENSE.txt` are the same file (the SIL Open Font License 1.1). Each
  `@font-face`'s `unicode-range` is, character for character, the one IBM's own CSS beside the files
  gives for that file (`package/fonts/split/woff2/IBMPlexSans-<weight>.css` and
  `IBMPlexMono-<weight>.css`, its "Subset: Latin1" and "Subset: Pi" rules), checked on 2026-10-20 by
  comparing each served rule's range with that file's.

## The desk as mockup v2, stage 2: Home (2026-10-21, S-001 AC82 and J24)

- `j24/commits-148-p1.json` and `j24/commits-177-p1.json` (J24's commits read; read by `j24-since.test.mjs`):
  **real**, Service-Desk (a public repository), recorded on 2026-10-21 with `gh api` (no token needed):
  `gh api "repos/shumpmaster/Service-Desk/pulls/<n>/commits?per_page=100" --jq '[.[] | {sha, parents: [.parents[] |
  {sha}], commit: {message: .commit.message, author: {name: .commit.author.name, email: .commit.author.email},
  committer: {date: .commit.committer.date}}, author: (if .author then {login: .author.login} else null end)}]'`,
  for #148 (33 commits, 10 of them merges: the Chief of Staff's, the Orchestrator's and the owner's) and #177 (7
  commits, 2 merges: the Builder's, the Orchestrator's and the owner's), each one page, cut to the fields J24
  takes, order unchanged.
- Everything else J24's and AC82's tests give is **NOT real** and written inline: the questions, answers, cards,
  dispatch-log lines, pull requests, merges, milestones, made-up commits (the force-push, the bot, a commit dated
  ahead, the 250-commit pull requests), every failure, "last looked" on the device and the marks. The capture rig
  for the pull request's screenshots (outside the repository) serves the page these fixtures through
  `fake-desk.mjs`, with #148's recorded commits moved in time so they fall after its made-up "last looked".

## The desk as mockup v2, stage 3: the project page and its Timeline (2026-10-21, S-001 AC83, AC84 and J23)

- `j11-77bfeae/AGENTS.md` and `j11-77bfeae/governance/OPERATING_MODEL_VERSION` (J23's version reads; read by
  `j23-versions.test.mjs` and `ac83-page.test.mjs`): **real**, Service-Desk's files at 77bfeae, copied unchanged
  with `git show 77bfeae:AGENTS.md` and `git show 77bfeae:governance/OPERATING_MODEL_VERSION`, beside the
  77bfeae records already there (the fixture's tree.txt lists both). AGENTS.md:3 is the `tier:` line the spec
  quotes; the version file reads `3.5.0`. Service-Desk's tree has no root `VERSION` at 77bfeae.
- Personal-Org-Operating-Model's `VERSION` (`3.5.0`) and `AGENTS.md` (`tier: T1   # placeholder comment`) in
  those tests are **NOT real records**: placeholders written inline in poom/'s form, since that repository is
  private and none of its files is copied here.
- Everything else AC83's, AC84's and J23's tests give is **NOT real** and written inline, each saying so: all 24
  standard lines in section 3 (Design-2 and Build-4 skipped), a run 2 with a recorded reason (a made-up `dor`
  recycle line and its answer), a project in its first run, one that is Done, two waiting questions, a charter
  with no `tier:` line, `tier:` lines with no value or not in column 0, version files in other forms, a made-up
  `VERSION` on Service-Desk, a questions folder and a dispatch log on the v2.5 project, Work ahead's estimates
  (wa-fixtures.mjs's worked example), and, for 77bfeae's `experiments/` paths and J11's research memos, files
  with placeholder text whose paths are the real tree's (the page names them from the tree only).
- `ac85/` (2026-10-22, AC85; stage 4 of mockup v2): **NOT real records**, the made-up project "Letters" for
  the question's and the gate's sheets, in the real records' forms: a Launch-gate card as the Orchestrator
  writes one (its section 5 quoting the Critic's and the user representative's lines), its case with the
  proposer's recommendation, docs/PROJECT.md's standard lines and a profile, and three questions
  (irreversible, no default, options that can't be split). Its own README lists each. AC85's test also
  renders two real question files already here: `notify/ac77-real/questions/P-001-next-work.md` and
  `trial-view/P-001-design-lab-open.md`.
- `trial-view/P-001-design-pick.md` (2026-10-22, AC12 and AC85; stage 4's build review, round 1, B1): the real
  Service-Desk question file at f8dfd1b, copied unchanged with `git show`, whose `DEFAULT: none — this is your
  pick and never defaults (AC43)` names no option letter.

## The desk as mockup v2, stage 6a: the portfolio's block from today's reads (2026-10-22, S-001 AC87)

- AC87's test (`ac87-portfolio.test.mjs`) adds no fixture file. Service-Desk's records and its
  `governance/OPERATING_MODEL_VERSION` (`3.5.0`) are the **real** ones at 77bfeae (`j11-77bfeae/`).
- Everything else it gives is **NOT real** and written inline, each saying so:
  - "Example", "In Build", "In Launch", "Finished", "Odd" and "Lower" are Service-Desk's 77bfeae records under
    another name, with a made-up `· sprints: PR #900` added to milestone lines (so AC50's now phase moves to
    Build or Launch), a made-up graduation ruling, or a made-up version file (`3.4.0`, `v3.4`, none);
  - "Unread", "Broken" and "No run" have no records at all: each is only a made-up J7 entry with a made-up
    phase view (not read yet, a project that can't be drawn, and a timeline with no now run), and a made-up
    read state where the case gives one;
  - the A3 case adds made-up root `VERSION` files (`9.9.9`, `9.9.8`) to Service-Desk's and Example's trees, to
    show they are never read;
  - Personal-Org-Operating-Model is in poom/'s placeholder form, with a placeholder root `VERSION` (`3.5.0`,
    `3.5`, or none), since that repository is private and none of its files is copied here.
- No portfolio file is used or copied: the portfolio is not read before stage 6b.
