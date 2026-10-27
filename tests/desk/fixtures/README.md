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

## The desk as mockup v2, stage 6b: the portfolio's read (2026-10-22, S-001 AC87, J23, J24)

- **No portfolio file is used, copied or read.** The portfolio repository (`shumpmaster/portfolio`) is private; the
  Builder did not fetch it. Every portfolio file the tests read is **made up, NOT a real record**, written inline in
  `tests/desk/pf-fixtures.mjs` in poom/'s placeholder form: the forms J23 names, with made-up words, each file saying
  "made up for the desk's tests, NOT a real record":
  - `ideas/IDEAS.md`: the template's own example heading (`## YYYY-MM-DD <the idea's name>`), then made-up ideas in
    each state (captured, shaping, approved, re-aimed, stopped), one with two `state:` lines, one with no `state:`
    line and one with another value;
  - `queue/_DECISION_CARD.md` and `queue/_CRITIQUE_DIGEST.md` (templates, never cards), and, where a case adds one, a
    made-up decision card `queue/PF-001-explore-<n>.md` in J2's card form (its seven sections, made-up options
    `explore` and `park`), or a file that is not a card at all;
  - `rulings/` (a README and two made-up rulings), `intent/` (a README and a `_TEMPLATE.md`), `library/facts/` (a
    README), and, where a case adds them, a made-up intent file or fact;
  - `README.md`.
- The portfolio's branch answer in the J23 function test is made up in GitHub's form (as `github/branch-main.json`
  records it for Service-Desk), with made-up shas.
- `tests/desk/helpers.mjs`'s `CONFIG` is J7 less its `portfolio` (6a's state, which J7 says builds), so every case
  written before stage 6b runs as it ran; the portfolio's cases add it (`withPortfolio`), and J7's read the file whole
  (`J7_FILE`).

## The desk, stage 8: the accepted views' facts (2026-10-22, S-001 AC44 step 4, AC55)

- `accepted-views-bd4097d.json` is **generated, not hand-written**: `tests/desk/tools/accepted-views-snapshot.mjs`
  ran the accepted page itself (src/public/app.js at bd4097d, the last commit that drew the accepted M1 and M2
  views) over `tests/desk/accepted-views.mjs`'s `detailRepos()` (the real fixtures named there, with the clock at
  its `WHEN`) and recorded each view's facts: Pipeline (Personal-Org-Operating-Model, 20 facts), Time asked
  (Service-Desk 29, Personal-Org-Operating-Model 5) and Agents (Service-Desk 171). Stage 8 removes those views, so
  AC55's comparison now reads this record instead of drawing them; nothing in it is made up.
- `stage8/sandbox-bd4097d.css` is a byte-for-byte copy of `src/public/sandbox.css` at bd4097d, before stage 8 took out the
  rules nothing draws once the desk is `/`. AC88's test cascades every desk screen with it and with today's stylesheet,
  and requires every element to look the same (the Reviewer's B1, stage 8 round 1). Nothing in it is made up.

## After MD3, stage 1 (2026-10-23, S-001 AC89 (a), (b), (c) and (h))

`tests/desk/ac89-after-md3.test.mjs` adds no fixture file. Its made-up records are written inline, each **NOT a real
record**:
- "Beta" and "Gamma", made-up v3 projects (a README saying so); Gamma's `status/P-001.toml` waits on `stop-6` with no
  card file, so it shows a card that went missing;
- a made-up waiting push run, `deploy <sha>` (run 12), on Service-Desk's J11 records at 3117150, with
  `reviews/77/reviewer.md` reading PASS and J12's built answer giving PR #77's merge commit, as AC72's test makes them;
- the read states themselves: a read left unanswered (the fake desk function's call held open), a network failure,
  and a refused read (`cant-read`, reason `token`), each made up.
It reuses AC52's one item of each kind (`fullRepo`, made up), screen-text.mjs's `textSetup()` (Service-Desk at 3117150,
real; Alpha, made up; Delta in poom/'s placeholder form), and AC77's real asked question and session file
(`notify/ac77-real/`).

## After MD3, stage 3 (2026-10-23, S-001 AC90's Plan, Timeline and Home parts)

`tests/desk/ac90-once-per-group.test.mjs` adds no fixture file. It reuses Service-Desk's J11 records at 3117150 and
77bfeae (real), poom/'s placeholder form, AC52's one item of each kind (`fullRepo`, made up), AC61's made-up why lines,
and wa-fixtures.mjs's estimate lines (made up, NOT real records); the three estimate lines it writes inline (MD1 and MD2
0 to 0 days, MD3 3 to 5) are made up too, NOT a real record.

## After MD3, stage 4 (2026-10-23, S-001 AC49's lanes, AC67's idle fold, AC90's Team part)

`tests/desk/lanes-fixtures.mjs` writes made-up records inline, each **NOT a real record** (the amendment's (b) item 30,
second part, and item 36):
- `cosLanes()`: three made-up projects ("Lanes-four", "Lanes-fifth", "Lanes-five") whose Chief of Staff's session lines,
  in J13's form as `j13/good/` writes it, give a log of four pieces open together, one where a fifth piece opens while the
  first is still open after three others came and went, and one of five open together; every `doing` is made up;
- `ownerStubs()`: a made-up project ("Lanes-owner") whose dispatch log raises three cards in turn, the first answered (its
  decision filed, with a made-up decision file) and the other two waiting, so the owner's log has a stub on lanes 2 and 3.
The Team screen's cases reuse Service-Desk at 3117150 (real), AC52's one item of each kind and md-extremes (made up), and
J13's `good/` files (made up).
After the Reviewer's round 1 of stage 4, `tests/desk/ac67-90-team-after-md3.test.mjs` adds, inline, four made-up outcome
lines (**NOT real records**) to Service-Desk's dispatch log at 3117150, one each for the check author, the builder, the
input reader and the reviewer, so that only the user representative's card has no recorded work (a reason one card has
stays on that card). Its "Just finished" case uses the real log as it stands, read at 22:00 UTC on 8 Oct, eight minutes
after the source checker's last outcome line and twelve after the researcher's.

## After MD3, stage 5 (2026-10-23, S-001 AC17, changed; AC89 (j))

Two made-up question files join AC85's made-up "Letters" records, each **NOT a real record** (fixtures/ac85/README.md):
`questions/P-003-overdue.md`, a reversible question raised by the test so that its settle time has passed while it still
waits, across America/Chicago's clock change of 1 Nov 2026; and `questions/P-003-unlettered.md`, with one line between its
lettered options that is neither lettered nor numbered. `tests/desk/ac85-sheets.test.mjs` also gives Service-Desk's real
`queue/P-001-stop-6.md` two made-up numbered lines ("2." and "3.", **NOT real**) under its Background, inline, so that the
decision card's whole record is seen keeping the file's own list numbers.

## After MD3, stage 6a (2026-10-23, S-001 AC89 (d) to (g) and (k))

`tests/desk/long-fixtures.mjs` is the amendment's long-text fixture ((b) item 30, first part): Service-Desk's J11 records
at 77bfeae (real) with made-up records added, each **NOT a real record** — a README whose summary runs long, estimate lines
with long notes, a later-work list whose first item's answer file holds a long ruling (with its made-up commit time) — so
that a bubble opens on every screen that has one: Home's tile, the project page's "Your last action", Plan and a
milestone's sheet. `tests/desk/ac89-words-drawing.test.mjs` also writes made-up records inline, each **NOT real**: a
`Milestone: MD3` line under AC85's made-up gate card's answer line and a made-up question naming M3A; a made-up sprint
(`PR #99`) on M3A's line in Service-Desk's docs/PROJECT.md at 77bfeae; a FAIL verdict in place of PASS on Service-Desk's
Q-013 source check at 3117150; a made-up CI run, with its `updated_at`, for the made-up v2.5 project "Delta"; and two
made-up portfolio queue files. `tests/desk/fake-desk.mjs` passes a fixture run's `updatedAt` as GitHub's `updated_at`.

From stage 6a's reviews, more made-up records, each **NOT a real record**:
- `shortRowsSetup()` in `tests/desk/wa-fixtures.mjs` (the design review's round 2, B1): Service-Desk's docs/PROJECT.md
  at 77bfeae with MD1's and MD2's names shortened ("Desk known" and "Look chosen", `SHORT_NAMES`), so that their rows on
  Plan take one line, and the worked example's estimates, so that no row has a line under it;
- in `tests/desk/ac89-words-drawing.test.mjs` (the review's round 1, B1): a second Launch-gate card, `queue/P-004-launch-1.md`,
  made from AC85's made-up `P-003-launch-1.md` with its item renamed P-004, both given a `Milestone: M3A` line under
  their answer lines, with a made-up dispatch-log line raising each card;
- in the same file (round 1, B2): Service-Desk's real stop card, `queue/P-001-stop-6.md`, given a made-up
  `Milestone: MD3` line under its answer line, with a made-up dispatch-log line raising it.

## After MD3, stage 7 (2026-10-23, S-001 AC89 (l), J23 changed)

`tests/desk/ac89-portfolio-reads.test.mjs` uses the made-up portfolio of `pf-fixtures.mjs` and adds, inline, made-up files
in the model portfolio template's form, each **NOT a real record**: `library/facts/_TEMPLATE.md` and
`intent/PORTFOLIO-INTENT.md` (the template's own files), a queue `README.md` and `.gitkeep`, and a device's made-up count
of ten reads already made today after portfolio marks. From its review's round 1 (B2 and N1), more made-up files beside
those, each **NOT a real record**: `library/facts/_draft.md`, `library/facts/sub/_TEMPLATE.md` and
`library/facts/_TEMPLATE.md.bak` (each a fact, by name), and `intent/2026-standing.md` (an intent file beside the
template's own); and kept Done marks on a device, made up, for the reload case. Its scheduler cases (the J23 case for a
read that stays pending, and `pfDesk()`) also build fake repos holding a made-up Service-Desk `governance/ROUTING.toml`
(`[time_limits]` alone) and a made-up Personal-Org-Operating-Model `docs/LEDGER.md` (`# Ledger` alone), each **NOT a real
record**. `tests/desk/ac14-budget.test.mjs`'s day adds twelve made-up
portfolio Done marks on one device.

## After the glance audit, G1 (2026-10-24, S-001 AC91 (a) to (e), AC71 and AC82 changed)

`tests/desk/glance-fixtures.mjs` builds the fixture states AC91's note names that G1 needs, on `fake-desk.mjs`'s in-memory
repositories, from committed fixtures; `tests/desk/ac91-glance-home.test.mjs` opens Home on them:
- **`text`**: Service-Desk's records at 77bfeae (`j11-77bfeae/`, real, as committed) and Personal-Org-Operating-Model in
  `poom/`'s placeholder form (`waSetup()` of `wa-fixtures.mjs`); nothing added.
- **`mix`**: `text`, with one made-up project, "Alpha", holding one card of each kind: AC52's one-of-each fixture
  (`fullRepo` of `sandbox-fixtures.mjs`: `md-extremes/`'s gate card and case, `orchestrator-m2/`'s hold and merge cards, a
  question, a pull request and a deploy waiting), **NOT real records**. The F1 and F2 Launch run is G5's, added there.
- **`unread`**: `mix` with one project's reads failing (Service-Desk by default, or "Alpha"): the fake desk's function made
  unreachable for it, a made-up failure, **NOT a real event**.
- **signed-out**: `mix` with every read refused as signed out (the fake desk's 403), made up, **NOT a real event**.
- **`stall`**: `text` with Service-Desk's J12 answer the built one (`github/j12-pulls-built.json`, NOT as GitHub sent it,
  above), whose latest movement is PR #77's merge on 16 Oct, opened at a made-up clock, 2026-10-24T12:00:00Z, so nothing
  has moved for 8 days: **made-up times**.
- **`ext`**: `md-extremes/` as AC42's tests hold it (`extremes()`), **NOT real records**.

The AC91 test also adds, inline, each **NOT a real record**: on "Alpha", a reversible question past its settle time
(`questions/Alpha-past.md`, raised 6 Oct, TIMEOUT 24) and an irreversible one (`questions/Alpha-final.md`), with made-up
raised times; a second dispatched member (`status/P-004.toml`, a reviewer); a pull request whose title can't be printed
(`BAD_PR`), so the tile can't be drawn; and a device's made-up "last looked" times, one of them 19 Oct, after the records'
last dates.

## After the glance audit, G2 (2026-10-24, S-001 AC91 (f) and (g), AC80 changed)

`tests/desk/glance-fixtures.mjs` adds the states G2 needs; `tests/desk/ac91-glance-waiting.test.mjs` opens Waiting on them,
and `tests/desk/tools/glance-shots.mjs` captures it:
- **`quiet`**: `text`, with the made-up project "Alpha" holding no card (its README alone, **NOT a real record**), so every
  project is read and nothing waits.
- **two made-up projects**: `mix` with a second made-up project, "Bravo", holding one card of each kind (`fullRepo`, as
  "Alpha"'s), **NOT real records**, so the Kicked back strip holds two projects' cards.
- **Done marks kept on a device** (`deviceMarks`, `KICKED`): made up, **NOT real** (no owner made them): Alpha's pull
  request, Bravo's question and Alpha's gate card marked done and kicked back 1, 3 and 7 minutes before the clock, and
  Bravo's pull request marked a minute before it, still confirming; stored as the board stores its marks
  (`desk-board-marks-v1`).
- **"last looked" times** on a device (`desk-seen-v1`), made up: 5 hours and 30 days before the clock, and none.

AC80's, AC66's, AC88's and AC89's tests rewritten in G2 add nothing new: they use their own made-up records, above.

## After the glance audit, G3 (2026-10-24, S-001 AC91 (h); AC80, AC85, AC86 and AC89 (j) changed)

`tests/desk/glance-fixtures.mjs` adds the state G3 needs; `tests/desk/ac91-glance-gates.test.mjs` opens Waiting, the gate
sheets and Plan on it, and `tests/desk/tools/glance-shots.mjs` captures them (`g3-`):
- **`gates`**: `mix`, with two more gate cards in the made-up project "Alpha", both at the Launch gate, **NOT real
  records**: AC85's made-up Launch-gate card (`ac85/queue/P-003-launch-1.md`, above) copied as item P-004's card 1 ("The
  Launch gate, case 1.") and as item P-005's card 2 ("The Launch gate, case 2."), its section 2 saying it was copied for
  G3; for each, a made-up status file (`status/P-004.toml`, `status/P-005.toml`, waiting on the owner at that card), a
  made-up `card` line in Alpha's dispatch log (raised 60 and 30 minutes before the clock) and AC85's made-up case under its
  own path (`docs/gates/P-004/launch-gate-1-case.md`, `docs/gates/P-005/launch-gate-2-case.md`). Alpha's own Build-gate
  card (`md-extremes/gate-card.md`, P-002) has no case line in its section 1.
- **`gates` with `caseLines: false`**: the same, with the two Launch cards' case lines left out (made up: as a card
  written before the Orchestrator named its case).

AC80's, AC85's, AC86's, AC88's and AC89 (j)'s tests rewritten in G3 add nothing new: they use their own made-up records, above.

## After the glance audit, G4 (2026-10-25, S-001 AC91 (i) to (l); AC49, AC55, AC59, AC83, AC84 and AC89 (c), (h) changed)

G4 adds no fixture file. `tests/desk/ac91-glance-page.test.mjs`, `ac91-glance-timeline.test.mjs`,
`ac91-glance-load.test.mjs` and G4's cases in `ac91-glance-gates.test.mjs` open the states above, with these made-up
parts, each **NOT real**, and `tests/desk/tools/glance-shots.mjs` captures them (`g4-`):
- **`gates` with `sameItem: true`** (`glance-fixtures.mjs`): the second made-up Launch-gate card is item P-004's own card 2
  (`queue/P-004-launch-2.md`, "The Launch gate, case 2."), in place of P-005's, its case under
  `docs/gates/P-004/launch-gate-2-case.md`; so one item has two gate cards waiting at one gate (AC89 (c)). **NOT real
  records.**
- **a gate card listed but not read** (`fake-desk.mjs`'s `blobNull`): in `gates`, the made-up P-004 card's file is in the
  tree and its blob answers null, as a read still to come; made up, **NOT** how GitHub answered any read.
- **Done marks kept on a device** (`deviceMarks`, now taking `id`, `title` and `confirmedAt`): the made-up P-004 gate card
  marked done a minute before the clock, still confirming, and a made-up P-009 gate card ("The Launch gate, case 1 ·
  P-009", no file anywhere) GitHub confirmed two hours before it; **NOT real** (no owner made them).
- **a made-up outcome line** in Service-Desk's dispatch log at 3117150 (`j11-3117150/dispatch-log/2026-10.jsonl`, real),
  added in the tests only: the Definer's "finished — ok" 30 minutes before the clock (and at 23:30 on 14 Oct for the
  midnight case), session `P-001:made-up-for-G4`; **NOT a real record**.
- **a made-up ruling** (`decisions/questions/Alpha-late.md`, "Ruling: B") in sandbox-fixtures.mjs's made-up project,
  first committed at 23:49 on 14 Oct in Chicago, for "Your last action" across midnight; **NOT a real record**.
- **the failed-load page**: `src/public/app.js` copied as it is into a scratch folder with no `sandbox.js` beside it, so
  the desk's code fails to load (made up: a dropped network or a stale cache does this in the browser).

- **G4's fix round** (AC89 (c), AC91 (l)): a made-up dispatched item P-003 with its dispatch line, and a made-up Chief of
  Staff piece with a helper and, ended, its hand-back, each from late on 14 Oct (in `ac91-glance-page.test.mjs`, written
  in the test, **NOT real records**); `lanes-fixtures.mjs`'s made-up session lines opened a day after them; `gates` with
  `sameItem` and no case lines for the waits row's ids.

AC49's, AC55's, AC59's, AC62's, AC83's, AC84's, AC88's and AC89's tests rewritten or extended in G4 add nothing new beyond
these: they use their own records, above.

## After the glance audit, G5 (2026-10-25, S-001 AC92 (c); AC83, AC84 and AC89 (c) changed)

G5 adds no fixture file. `tests/desk/ac92-glance-counts.test.mjs` and G5's cases in `ac89-after-md3.test.mjs` open the
states above, with these made-up parts, each **NOT real**, and `tests/desk/tools/glance-shots.mjs` captures them (`g5-`):
- **`mix` with `laterLaunch: true`** (`glance-fixtures.mjs`, `LATER_LAUNCH_LINES`), for round 2's F1 and F2: five lines
  added after Service-Desk's own dispatch log at 77bfeae (`j11-77bfeae/dispatch-log/2026-10.jsonl`, real): P-001 sent to
  stage 6 (the Launch phase's builder) on the morning of 2026-10-14 (before the states' clock) with its outcome, a
  "revise" at its Launch gate (`decisions/P-001/launch-9.md`, a file that exists nowhere), and stage 6 again with its
  outcome. The model's timeline
  then holds two Launch runs still to come: run 2 holding M3C, planned, and run 3 recording Launch-3 "not reached".
  **NOT real records** (Service-Desk has never reached its Launch phase).
- **made-up runs, sprints and section-3 lines** written in `ac92-glance-counts.test.mjs` for the counts' classes (own
  milestones over two runs, dropped, planned in an earlier run; standard ones reached, carried over, not reached, not
  needed, skipped, taken on; sprints merged, not read, open, closed, a pipeline item with and without its merge), each
  only the shape the desk's timeline gives; **NOT real records**.
- **made-up workflow runs** on the head (Details' CI line: passing, failing, running, queued, skipped, cancelled, neutral,
  stale and timed out, with the deploy, Orchestrator and notification workflows' runs), in `ac92-glance-counts.test.mjs`
  and on `text`'s Service-Desk for the page and its captures; **NOT how GitHub answered any read**.
- **a Done mark kept on a device that GitHub did not confirm** (`deviceMarks` with `kickedAt`), on one of `gates`' made-up
  Launch-gate cards, so a gate's cards stand in both parts of Waiting (AC89 (c)); **NOT real** (no owner made it).
- J12's built answer (`github/j12-pulls-built.json`, from REST answers, **NOT as GitHub sent it**) on `text`, as `stall`
  uses it, so the pull requests are read.

AC83's, AC84's, AC57's (j11-reached) and AC88's tests rewritten or extended in G5 add nothing new beyond these.

## After the glance audit, G6 (2026-10-25, S-001 AC92 (d); AC83 and AC84 changed)

G6 adds no fixture file. `tests/desk/ac92-glance-standard.test.mjs`, G6's rewritten cases in `ac83-page.test.mjs` and
`ac84-timeline.test.mjs`, and G6's walk in `ac88-dark.test.mjs` open the states above, with these made-up parts, each
**NOT real**, and `tests/desk/tools/glance-shots.mjs` captures them (`g6-`):
- **`standard`** (`glance-fixtures.mjs`, `standardState` and `standardLines`): `text` with a line in Service-Desk's
  docs/PROJECT.md section 3 for each of the model's 24 standard milestones, each "taken on" with the why "made up for the
  test, <id>", but Design-2 and Build-4 (`STANDARD_SKIPPED`), "skipped", as `ac83-page.test.mjs`'s `ALL_24` writes them;
  with `ids`, only those milestones' lines (Build-4's alone for the three states together). **NOT real records**
  (Service-Desk's own section 3 at 77bfeae holds no standard line).
- **made-up runs and section-3 lines** written in `ac92-glance-standard.test.mjs` for h per run and the rows each run
  lists (states reached, carried over, not reached and not needed in runs now, gone back over, still to come and finished;
  taken-on lines the model can and can't record; skipped lines), each only the shape the desk's timeline gives; **NOT
  real records**.
- **`mix` with both "Build-i1" runs holding an untied sprint** (G6's fix round; `sharedUntied` in
  `ac92-glance-standard.test.mjs`): a made-up dispatch line sending P-002 to its Build stage 260 minutes before the
  states' clock, and J12 answering two made-up merged pull requests, #901 (250 minutes before, in run 1) and #902 (5
  minutes before, in P-003's run 3), so two runs that share the key "Build-i1" each draw "Not tied to a milestone"; **NOT
  real records**.

## After the glance audit, G7 (2026-10-25, S-001 AC92 (a); AC24, AC48, AC81, AC88 and AC91 (c) changed)

G7 adds no fixture file. `tests/desk/ac92-glance-palette.test.mjs`, G7's walk in `ac88-dark.test.mjs` (AC92 (a)'s cascade
check and the stage-8 guard's `G7_ONCE`) and G7's rewritten cases open the states above, with these made-up parts, each
**NOT real**, and `tests/desk/tools/glance-shots.mjs` captures them (`g7-`):
- **`ciState`** (`glance-fixtures.mjs`, `G7_RUN`): one made-up workflow run, `desk-tests`, completed with success
  (`passing`) or failure (`failing`), on the head of `text`'s Service-Desk, of Personal-Org-Operating-Model's v2.5
  placeholder, or of `mix`'s made-up project beside its deploy waiting, so a CI line reads AC29's passing or failing.
  **NOT how GitHub answered any read.**
- **`mismatchState`** (`glance-fixtures.mjs`): J11's records at 3117150 with J12's built answer, PR #77's merge commit made
  the fake repository's head and a made-up PASS verdict for it (`reviews/77/reviewer.md`), as AC72's test makes them, and
  a hand-started desk-deploy run waiting at a made-up commit (`ddd…d`) that no merge has, so its sheet shows the mismatch.
  **NOT real records, NOT as GitHub sent them.**
- **`G7_OPENS`** (`glance-fixtures.mjs`): those states and earlier stages' (`text`, `mix`, `unread`, `gates` with a
  made-up confirmed Done mark), each opened as the owner opens it (every phase, every sprint fold, Plan's ordering with a
  row moved, Reached, Details, a card's sheet, Home after a read fails). The portfolio refused (`pf-fixtures.mjs`, made
  up) and a project whose drawing throws (`BAD_PR`) are as AC88's walk already makes them.
- **made-up runs** written in `ac92-glance-palette.test.mjs` for a "carried over" milestone in a run now and reached and
  carried-over ones in a run gone back over, each only the shape the desk's timeline gives; **NOT real records**.
- **notifications refused** (G7's round-1 fix, in `ac88-dark.test.mjs`'s G7 cascade walk): `text` opened as if added to
  the Home Screen (`matchMedia` answering standalone) with the phone's notification permission `denied`, so AC75's
  warning is drawn; and the portfolio with nothing queued (`pfFiles({})`, no failure), beside AC88's own portfolio states.
  **NOT a real phone's settings, NOT real records.**

## After the glance audit, G7b (2026-10-25, S-001 AC91 (c) changed; AC92 (a) noted)

G7b adds no fixture file. `tests/desk/ac91-g7b-since-missing.test.mjs`, G7b's walks in `ac88-dark.test.mjs` (AC92 (a)'s
cascade check, its want-list holding the grey missing line, and the stage-8 guard's `G7B_ONCE`) open the states above, with
these made-up parts, each **NOT real**, and `tests/desk/tools/glance-shots.mjs` captures them (`g7b-`):
- **a "last looked" held on the device** (`glance-fixtures.mjs`, `lookedAt`, `SINCE_LATE` and `SINCE_FULL`; and 18 Oct
  00:00 in `ac91-g7b-since-missing.test.mjs`): 19 Oct, after the records' last dates, so the list holds no line; ten days
  before the states' clock, so it holds four lines and "<n> more"; or 18 Oct, so it holds two of Service-Desk's lines.
  **NOT a real device's record.**
- **`G7B_OPENS`** (`glance-fixtures.mjs`): Home on `unread`, signed-out and `ext` with reads failing (the fake desk's
  network cause, AC5, or every read refused as signed out, J6): Service-Desk failing after its first reads; Service-Desk
  failing from the start and the made-up project after its first reads; signed out from the start; `ext`'s made-up Beta
  and long-named Epsilon failing after their first reads; and Service-Desk failing with the list full. **NOT how any read
  failed.**
- **a read still in flight** (`fake-desk.mjs`, a project's `hold`, as the portfolio's): Service-Desk's first read held
  pending while the made-up project's fails, so its tile says "Checking…". **NOT a real read.**

## After the glance audit, G8 (2026-10-25, S-001 AC92 (b); AC82, AC83, AC84 and AC86 changed)

G8 adds no fixture file. `tests/desk/ac92-glance-arrow.test.mjs`, G8's walk in `ac88-dark.test.mjs` (the stage-8 guard's
`G8_ONCE`) and G8's rewritten cases open the states above, with these made-up parts, each **NOT real**, and
`tests/desk/tools/glance-shots.mjs` captures them (`g8-`):
- **`nowShared`** (`glance-fixtures.mjs`): the made-up project's docs/PROJECT.md (Service-Desk's section 3 at 3117150, as
  `fullRepo` copies it) with its lines' sprints changed, so its now run shares its key with later runs: `build`, on `mix`,
  M2's "PR #44" taken off its line, so run 1's "Build-i1" is now and run 3's "Build-i1" shares the key; `launch`, on
  `gates`, MD2, MD3, M3A and M3B each given a made-up sprint "PR #90", so run 2's "Launch-i1" is now and runs 3 and 4
  (P-004's and P-005's "Launch-i1") share the key. **NOT real records.**
- **`sprintsState`** (`glance-fixtures.mjs`): Personal-Org-Operating-Model's sprints with a made-up open sprint,
  `docs/sprints/m1.5-made-up.md`, beside the real m1.4 (two open), or m1.4 written `status: closed` (none open).
  **NOT real records.**
- **a graduation ruling** written in `ac92-glance-arrow.test.mjs`, `decisions/questions/P-001-graduation.md` ("Ruling:
  proceed"), so `text`'s Service-Desk is Done, as AC83's Done case makes it. **NOT a real record.**

## After the glance audit, G8b (2026-10-25, S-001 AC24's note changed, P-001-glance-moved-word.md, B; AC92 (a) noted)

G8b adds no fixture file. `tests/desk/ac24-g8b-moved-word.test.mjs`, G8b's walks in `ac88-dark.test.mjs` (AC92 (a)'s
cascade check, its want-list holding Plan's "moved" word, and the stage-8 guard's `G8B_ONCE`) and G8b's extended cases
(AC24's moving case, G7's Plan case) open the states above, with these made-up parts, each **NOT real**, and
`tests/desk/tools/glance-shots.mjs` captures them (`g8b-`):
- **`longNameState`** (`glance-fixtures.mjs`, `G8B_LONG`): `text`'s Service-Desk with the worked estimates
  (`wa-fixtures.mjs`'s `WORKED`, made up) and M3B's name on its docs/PROJECT.md line replaced by a long made-up name,
  "A made-up long milestone name, NOT real, to wrap on Plan at 360 px: Pneumonoultramicroscopicsilicovolcanoconiosis
  shown against its measure", one word of it too long for the row's column, so the moved row's name wraps under the word
  "moved" and must never be cut. **NOT a real record.**
- **`G8B_OPENS`** (`glance-fixtures.mjs`): Plan with a row moved (a draft on the device, made up: no owner moved it), in
  the ordering and out of it: `text` with the worked estimates, M3A moved up; `longNameState`, the long-named M3B moved
  up; and `gates`, the made-up project's MD3 moved up beside its gate cards' rows. **NOT a real device's draft.**
- **a newer plan** written in `ac24-g8b-moved-word.test.mjs`, `docs/planning/2026-10-18T1805Z-01.md`, as AC24's test
  writes it, so the draft is set aside and the word goes. **NOT a real record.**

## After the glance audit, G8c (2026-10-25, S-001 AC91 (c), AC92 (b) and AC89 (a) changed, P-001-glance-opening-wording.md, P-001-glance-cant-read-order.md, P-001-glance-cant-show-line.md and P-001-glance-arrow-on-line.md, each B)

G8c adds no fixture file. `tests/desk/ac91-g8c-home.test.mjs`, G8c's walks in `ac88-dark.test.mjs` (AC92 (a)'s cascade
check, its want-list unchanged, and the stage-8 guard's `G8C_ONCE`) and the locked cases it rewrites open the states
above, with these made-up parts, each **NOT real**, and `tests/desk/tools/glance-shots.mjs` captures them (`g8c-`):
- **`openingState`** (`glance-fixtures.mjs`): `unread` with Service-Desk's reads failing from the start (the fake desk's
  network cause, AC5), so no read of it succeeds in this opening; `fail()` makes the made-up project's reads fail after its
  first reads succeeded. **NOT how any read failed.**
- **`signedOutMixedState`** (`glance-fixtures.mjs`): `mix` with Service-Desk's reads failing from the start (the network
  cause); `fail()` then refuses every read as signed out (J6). **NOT how any read failed.**
- **`orderState`** (`glance-fixtures.mjs`): the config's order (Service-Desk, Personal-Org-Operating-Model, the made-up
  project) unlike Home's tile order, each failure made up (the network cause): on `quiet`, nothing waiting, the projects it
  names failing from the start, or with `cantShow` the made-up project drawn with fake-desk.mjs's `BAD_PR` (a made-up pull
  request the desk can't draw) and its read working; with `waiting`, on `mix`, Service-Desk and Personal-Org-Operating-Model
  failing from the start and the made-up project, its cards held, failing later. **NOT real records or failures.**
- **`sprintsState(1)`** (`glance-fixtures.mjs`): Personal-Org-Operating-Model's sprints with poom/'s placeholder m1.3
  (closed) added before m1.4 (open), so its one open sprint follows a closed one and a line leads into its circle.
  **NOT the project's sprints** (poom/ holds placeholders only).
- **`g8cStore`** (`glance-fixtures.mjs`): what a device keeps, "last looked" (`desk-seen-v1`) and Home's groups folded
  (`desk-home-groups-v1`, "Closed or not run by the desk" folded). **NOT a real device's record.**
- **`G8C_OPENS`** (`glance-fixtures.mjs`): Home on the states above, on `nowShared('build')` and with `BAD_PR` on `mix`'s
  made-up project, each opened as the owner opens Home. **NOT real records or failures.**
- **a reader that never answers** (`ac91-g8c-home.test.mjs`, the fake desk's `hold` set to a promise that never settles), so
  a read stays unanswered for 3 minutes, AC89 (a)'s 3-minute cause. **NOT how any read went.**
- **blobs GitHub fails** (`ac91-g8c-home.test.mjs`, from G8c's review, round 1, B1): `unread` with the made-up project's
  `blobFail` (fake-desk.mjs) naming every file's blob sha, or one file's, so its first read holds the tree, and with it the
  cards, but fails in its blob phase (AC5's GitHub cause): a project with cards waiting that no read has succeeded for in
  this opening. **NOT how any read failed.**
- **a portfolio that refuses the desk** (`ac91-g8c-home.test.mjs`, pf-fixtures.mjs's `pfFiles` with `no-access`), as G7's
  palette test makes it. **NOT a real record.**

## After the glance audit, G8d (2026-10-25, S-001 AC91 (c), AC89 (a) and (h) and AC54 changed; the owner's answers of 2026-10-25 to G8c's design review, docs/design/references/owner-answers-2026-10-25-g8c-review.md: "Yes, everywhere (Recommended)", "Say "can't be shown" (Recommended)", "Keep it, as built (Recommended)")

G8d adds no fixture file. `tests/desk/ac91-g8d.test.mjs`, G8d's walks in `ac88-dark.test.mjs` (AC92 (a)'s cascade check,
its want-list with the group head's new "can't be shown" part, and the stage-8 guard, no `G8D_ONCE` since that part takes
`.v2-hgb`'s look) and the locked cases it rewrites open G8c's states above and these made-up parts, each **NOT real**, and
`tests/desk/tools/glance-shots.mjs` captures them (`g8d-`):
- **`blobFailState`** (`glance-fixtures.mjs`): `unread` with the made-up project's `blobFail` (fake-desk.mjs) naming every
  file's blob sha, or one file's, as G8c's B1 case makes it, so its first read holds the tree, and with it the cards, but
  fails in its blob phase (AC5's GitHub cause): AC89 (a)'s state 2 with cards. **NOT how any read failed.**
- **`cantShowState`** (`glance-fixtures.mjs`): Home's "Your projects · active" with a made-up project the desk can read but
  can't draw (fake-desk.mjs's `BAD_PR`, a made-up pull request) beside Service-Desk failing from the start (the network
  cause): on `quiet` (nothing waiting, `orderState`'s `cantShow` with only Service-Desk failing), or with `waiting` on
  `twoMix`, its second made-up project (Bravo) the one it can't draw beside the first's cards. **NOT real records or
  failures.**
- **`G8D_OPENS`** (`glance-fixtures.mjs`): Waiting (every project shown on `openingState` and `signedOutMixedState`;
  Service-Desk alone shown; the made-up project alone shown on `blobFailState`), Service-Desk's page, the v2.5 Pipeline view
  (`orderState({ waiting: true })`) and Home on `cantShowState`, each opened at its address as the owner opens it.
  **NOT real records or failures.**
- **a reader that never answers** (`ac91-g8d.test.mjs`, as G8c's), for the 3-minute cause on Waiting, a page and the
  Pipeline view; **a project's reads failing after its first ones** (`ac91-g8d.test.mjs`: Personal-Org-Operating-Model on
  `mix`, the made-up project with `BAD_PR` on `mix`), for the "since HH:MM" kept. **NOT how any read failed.**

### G8d's round 2 (2026-10-25, S-001 AC80, AC89 (a) and AC91 (c) changed; the owner's answer of 2026-10-25 to G8d's design review, item 4: ""✕ Can't show Bravo" (Recommended)"; the Reviewer's N1 to N5)

Still no fixture file. `tests/desk/ac91-g8d.test.mjs`'s round-2 cases, G8d's walks in `ac88-dark.test.mjs` and the
`g8d-` captures open these made-up parts, each **NOT real**:
- **`blobFailNoCardState`** (`glance-fixtures.mjs`, the Reviewer's N3): `quiet` with the made-up project holding one
  made-up status file that gives no card (`status/P-009.toml`, a project dispatched to the builder) and its first read
  holding the tree but failing in its blob phase on that file's blob (fake-desk.mjs's `blobFail`): AC89 (a)'s state 2 on the
  blob-failure path with empty lanes. **NOT a real record, NOT how any read failed.**
- **`cantShowAmongState`** (`glance-fixtures.mjs`): `twoMix` with the made-up project Alpha the desk can read but can't draw
  (fake-desk.mjs's `BAD_PR`) between Service-Desk and the made-up Bravo, whose reads fail from the start (the network
  cause), so Waiting's "Can't show" line sits among the can't-read lines in the board's order. **NOT real records or
  failures.**
- **`G8D_OPENS`'s three round-2 entries** (`glance-fixtures.mjs`): Waiting on `cantShowState`, every project shown (nothing
  waiting, and with `waiting` beside the first made-up project's cards) and the made-up project alone shown. **NOT real
  records or failures.**
- **a project the desk can't draw whose read fails** (`ac91-g8d.test.mjs`): `BAD_PR` on the made-up project with
  `blobFailState('every file')` (never read in this opening, the Reviewer's N4), with its reads failing after its first ones
  on `mix` (the network cause), and on `signedOutState` (every read refused as signed out after the first ones, J6).
  **NOT how any read failed.**
- **a reader that never answers** for Waiting's quiet line with every project shown (the Reviewer's N1), and
  **`signedOutState`** for Service-Desk's page read before the sign-out (N2), as above. **NOT how any read went.**

### G8d's round 3 (2026-10-25, S-001 AC89 (a) and AC91 (f) changed, AC80 noted; the owner's rulings of 2026-10-25 on G8d's round-2 reviews, both "Ruling: A": decisions/questions/P-001-glance-no-quiet-lanes.md and P-001-glance-cant-show-last-read.md)

Still no fixture file. `tests/desk/ac91-g8d.test.mjs`'s round-3 cases, G8d's walks in `ac88-dark.test.mjs` and the
`g8d-` captures open these made-up parts, each **NOT real**:
- **`noneDrawnState`** (`glance-fixtures.mjs`): Waiting with every project shown and no shown project both read and drawn.
  By default, `quiet` with Service-Desk and Personal-Org-Operating-Model failing from the start (the network cause) and the
  made-up project the desk can read but can't draw (fake-desk.mjs's `BAD_PR`), as G8c's `orderState({ cantShow: true })`;
  with `every`, `quiet` with `BAD_PR` on every project, every read working; with `waiting`, `twoMix` with the made-up Bravo
  holding `BAD_PR`, Service-Desk and Personal-Org-Operating-Model failing from the start and the made-up Alpha's reads
  failing after its first ones, its last read's cards kept; with `pending`, as by default but Service-Desk's first read
  never answering (a reader that never answers). **NOT real records, NOT a real pull request, NOT how any read failed or went.**
- **`cantShowLastState`** (`glance-fixtures.mjs`): the made-up project with `BAD_PR`, read in this opening and then failing
  (the network cause), for AC89 (a)'s state 5 alone shown: on `quiet` (no card) by default, on `mix` with `cards`, and with
  `signedOut` on `signedOutState` (every read refused as signed out after the first ones, J6). **NOT real records, NOT a
  real pull request, NOT how any read failed.**
- **`G8D_OPENS`'s two round-3 entries** (`glance-fixtures.mjs`): Waiting on `noneDrawnState` (by default) with every
  project shown, and on `cantShowLastState` (by default) with the made-up project alone shown. **NOT real records or
  failures.**
- **a drawn project in state 5** (`ac91-g8d.test.mjs`): `quiet`'s made-up project read and then failing (the network
  cause), for "Nothing here when last read" kept; and **a project the desk can't draw, never read in this opening**,
  `BAD_PR` on `blobFailState('every file')`, for state 2's "Can't read" kept, as round 2's. **NOT how any read failed.**
- **reads made to work again** (`ac91-g8d.test.mjs`, "gone once a project reads and draws again"): Service-Desk's made-up
  failure removed on `noneDrawnState`, and the made-up project's failure (and, for one step, its `BAD_PR`) removed on
  `cantShowLastState`. **NOT how any read went.**

## After the glance audit, G9 (2026-10-25, S-001 AC92 (e); AC83 changed; P-001-glance2-anchor.md, A, widened by the owner)

G9 adds no fixture file. `tests/desk/ac92-glance-boxes.test.mjs` (its every-screen walk over `mix`, `gates`, `quiet`, `ext`
and the portfolio, and G9's own screens, `G9_OPENS`, each opened once), G9's walks over `G9_OPENS` in `ac88-dark.test.mjs`
(AC92 (a)'s cascade check, whose want-list gains the page's soft box and the plain why line, and the stage-8 guard, whose
`G9_ONCE` pins them and, from G9's round 2, the run heads), AC83's rewritten sentence and why-line cases
(`ac83-page.test.mjs`, on 77bfeae's real records), G9's round-2 run-heading case (`ac92-glance-standard.test.mjs`, on
`mix`'s made-up project's Build and `gates`' Launch, the states above) and the `g9-` captures open the states above and
these made-up parts, each **NOT real**:
- **`fiveLinesState`** (`glance-fixtures.mjs`): `mix` with two made-up questions on the made-up project, one past its settle
  time (raised 6 Oct, 24 hours) and one that can't be undone, beside fullRepo's question that settles itself, as AC91 (a)'s
  test adds them, so Home's briefing holds five lines (its count, its parts and the three due and undo lines). **NOT real
  records.**
- **`G9_OPENS`** (`glance-fixtures.mjs`): Service-Desk's page on `mix` with its made-up later Launch run (so its tally reads
  the spec's example, "8 of 16 milestones reached · 17 sprints · 9 merged, 8 not read"), the made-up project's page, and
  Service-Desk's page on `text` with every phase opened; the v2.5 page (poom/'s placeholder form); `quiet`'s made-up project's
  page (its README alone, nothing recorded: "no milestones tracked yet"); Service-Desk's page never read in this opening
  (`openingState`, the network cause); Home on `fiveLinesState`; and Waiting on `gates` with a device's made-up Done mark (a
  confirmed gate row in the Done lane). **NOT real records, marks or failures.**
- **made-up sprint views** (`ac92-glance-boxes.test.mjs`, its pure case for the tally's sprints): two runs' blocks drawing
  "PR #1" in each, a pull request not read ("PR #2"), a pipeline item ("P-003") and one named by its pull request ("PR #4"),
  so a sprint drawn twice counts once. **NOT real records.**

## After the glance audit, G9b (2026-10-25, S-001 AC91 (c) and AC82 changed, AC80, AC89 (a) and AC91 (f) noted; the owner's ruling of 2026-10-25, "Ruling: A", decisions/questions/P-001-glance-checking-line.md)

G9b adds no fixture file. `tests/desk/ac91-g9b-checking-line.test.mjs` (its pure cases of home.js's `titleLine` and its
screen cases on Home and Waiting), G9b's walk over `G9B_OPENS` in `ac88-dark.test.mjs` (AC92 (a)'s cascade check, whose
want-list gains the line under the title as a grey place, and the stage-8 guard, with no exception added: no CSS changed,
so there is no `G9B_ONCE`) and the `g9b-` captures open the states above (`unread`, `signedOutState`,
`signedOutMixedState`, `openingState`, `orderState`, `blobFailState`, as they are) and these made-up parts, each **NOT real**:
- **`failedHeldState`** (`glance-fixtures.mjs`): `mix` with three projects, each first read in its own state: the made-up
  project's failing from the start (the fake desk's network cause), Service-Desk's held pending (its calls wait on a
  promise, fake-desk.mjs's `hold`) and Personal-Org-Operating-Model read (poom/'s placeholder form); `release()` lets the
  held read answer and `mend()` lets the made-up project's reads succeed. **NOT real records, NOT how any read failed or
  went.**
- **`G9B_OPENS`** (`glance-fixtures.mjs`): Home and Waiting with every project shown on `failedHeldState` (one first read
  failed, one on its way), on `orderState` (every first read failed, nothing waiting) and on `signedOutState` refused from
  the start (no read before the sign-out); and Waiting with Service-Desk alone shown on `failedHeldState` (its own first read
  on its way beside the made-up project's failed one); each with "last looked" after the records' dates (G8c's `g8cStore`).
  **NOT real records or failures.**
- **two held reads** (`ac91-g9b-checking-line.test.mjs`, AC91 (f)'s lanes and strip kept): `failedHeldState` with
  Personal-Org-Operating-Model's first read held too, so no project is read; **a reader that never answers**, Service-Desk's
  calls on `mix` left unanswered for 3 minutes in view (as ac89-after-md3.test.mjs's `hang`); and **reads made to work
  again**, the made-up project's failure removed on `orderState`. **NOT how any read went.**

## After the glance audit, G9c (2026-10-25, S-001 AC91 (c), AC80 and AC83 changed, AC89 (a), AC91 (f) and AC94 noted; the owner's rulings of 2026-10-25, each "Ruling: A", decisions/questions/P-001-glance-waiting-pending.md, -waiting-signed-out.md and -page-checking.md, with -g9c-several.md, -g9c-alone.md and -g9c-signed-out-all.md, each A, and -g9c-portfolio.md, B)

G9c adds no fixture file. `tests/desk/ac91-g9c-quiet-lines.test.mjs` (its pure cases of board.js's read lines and
projectpage.js's `pageCheckedWords`, and its screen cases on Waiting and a project's page), G9c's walk over `G9C_OPENS` in
`ac88-dark.test.mjs` (AC92 (a)'s cascade check, whose want-list gains the "Still reading" line as a grey place, and the
stage-8 guard, with no exception added: no CSS changed, so there is no `G9C_ONCE`) and the `g9c-` captures open the states
above (`unread`, `signedOutState`, `signedOutMixedState`, `openingState`, `orderState`, `cantShowLastState`,
`failedHeldState`, as they are, with fake-desk.mjs's `hold`, AC89 (a)'s `hang` and the made-up portfolio of
`pf-fixtures.mjs`) and these made-up parts, each **NOT real**:
- **`failedHeldState({ poomHeld: true })`** (`glance-fixtures.mjs`): `failedHeldState` with Personal-Org-Operating-Model's
  first read held too (the form G9b's case built in place), so no project is read; `release()` lets both answer. **NOT how
  any read went.**
- **`heldReadsState`** (`glance-fixtures.mjs`): `mix` (or `quiet`) with the first reads it names held on their way, each
  call waiting on a promise of its own (fake-desk.mjs's `hold`): two held (Service-Desk's and the made-up project's), every
  one held, or Service-Desk's alone; with `portfolio`, a made-up portfolio in J7 (`pf-fixtures.mjs`'s files, its queue
  holding one made-up card) whose reads are held too; `release(name)` lets one answer, `failPortfolio()` makes the
  portfolio's fail (the network cause). **NOT real records, NOT how any read went or failed.**
- **`cantShowHeldState`** (`glance-fixtures.mjs`): `quiet` with the made-up project the desk can read but can't draw
  (fake-desk.mjs's `BAD_PR`, NOT a real pull request) and its first read on its way, its tree and pull requests answered and
  its blob calls held (**fake-desk.mjs's `blobHold`**, new in G9c: a promise only a project's blob calls wait on). **NOT
  real records, NOT how any read went.**
- **`G9C_OPENS`** (`glance-fixtures.mjs`): Waiting with every project shown on `failedHeldState` and its variant, the first
  paint with every first read held (the portfolio's among them), the portfolio's read held beside Service-Desk's, the
  can't-draw project's parts still arriving, signed out (`signedOutMixedState`, and `signedOutState` from the start), every
  first read failed not signed out (`orderState`), and Service-Desk's page, read, beside the made-up project failing from
  the start (`unread`); each with "last looked" after the records' dates (G8c's `g8cStore`). **NOT real records or
  failures.**
- **`recordingState`** (`glance-fixtures.mjs` from G9c's round 2, in the test file before it): the portfolio beside "Being
  recorded by the automatic job": AC79's asks-merge fixture as `ac79-desk.test.mjs` builds it, Service-Desk's records at
  ef8daf4 (real) with one made-up pull request the job is recording and made-up job runs and log line, beside a made-up
  portfolio whose read is held, opened at `RECORDING_NOW` (AC79's clock). **NOT real pull requests, runs or reads.**
- **`agentsState`** (`glance-fixtures.mjs`, G9c's round 2: the Reviewer's B1 and draft 3's lines side by side): `quiet`
  with the made-up project holding one made-up pull request "With the agents" (a code change from a builder's branch, its
  required reviewer's verdict missing under board-v5/'s made-up risk paths, J22 rule 0), the first reads it names held on
  their way, and `fail()` refusing every read as signed out (J6). **NOT real records, pull requests or reads.**
- **a read in state 4** (`ac91-g9c-quiet-lines.test.mjs`, G9c's round 2, the Reviewer's B2): on `heldReadsState`, the
  made-up project read, then its re-reads held while the page is hidden for 10 minutes. **NOT how any read went.**
- **reads changed in the cases** (`ac91-g9c-quiet-lines.test.mjs`): a held read made to fail instead (the network cause)
  and every read refused as signed out while two reads are held (J6), and the made-up project's re-reads held after its
  first read, so its last read grows older than Service-Desk's. **NOT how any read went or failed.**

## After the questions request, QW1 (2026-10-25, S-001 AC94; AC52, AC77, AC80, AC89 (j) and AC91 (f) changed; the owner's "Top of Waiting", "One tap, then commit" and "In the section", and the approved picture, decisions/questions/P-001-m3g-picture.md, A)

QW1 adds `tests/desk/qw1-fixtures.mjs` and no fixture file. `tests/desk/ac94-qw1-questions.test.mjs` (its pure cases of
board.js's section and its screen cases), QW1's walk over `QW1_OPENS` in `ac88-dark.test.mjs` (AC69's vermilion check,
whose want-list gains a question's kind icon in the section; AC92 (a)'s cascade check, whose want-list gains the section's
grey line; and the stage-8 guard, whose `QW1_ONCE` pins the section's own look), the locked cases QW1 rewrites, and the
`qw1-` captures open the states above (`quiet`, `orderState`, `noneDrawnState`, `cantShowState`, `cantShowLastState`,
`twoMixState` with `KICKED`, md-extremes/, as they are) and these made-up parts, each **NOT real**:
- **made-up question files** (`qw1-fixtures.mjs`'s `qFile`, `Q_ALPHA` to `Q_EPSILON`, `Q_HELD`, `K_FILES` and `K25_FILES`):
  owner questions in questions/_TEMPLATE.md's form (J2), none of them ever put to the owner: lettered with and without a
  `Milestone:` line, with four to six choices, some with a description after " — ", one that can't be undone and some that
  settle themselves; a numbered one with its parts' options and recommendations on its lines; one whose OPTIONS: lines mix
  letters, numbers and neither, so it can't be split; one with no OPTIONS: block; v2.5 ones with letters and without; a long
  title holding md-extremes/' long unbroken word, with long choices; and one held as being asked in a session (its `Asked in
  session:` line naming a made-up session id, `session_0QW1MadeUpNotARealSession01`, with no session file). Their raised
  times (J2's first commits) are made up. **NOT real records.**
- **`busiestState`** (`qw1-fixtures.mjs`): md-extremes/ (AC42's five connected projects, twelve waits) with each project's own
  question replaced by one of the made-up ones above and Beta holding the held one too; the device's Done mark on Beta's
  question, kicked back three minutes before the clock (made up, as `deviceMarks` makes them); and `fail()`, Delta's reads
  failing after its first read (the network cause). **NOT real records, marks or failures.**
- **`kindsState`** (`qw1-fixtures.mjs`): two made-up projects, "Kinds" (v3) and "Ledger" (v2.5, poom/'s LEDGER.md placeholder),
  holding the kinds above; with `linkCap`, a small cap so each link is past it; and, in the cases, Kinds with
  `contentPrefill: false` or `webCommitsToDefault: false`, a made-up answer's pull request (#70) adding its answer file, its
  answer committed to the default branch, Ledger failing from the start or holding `BAD_PR`, and two more made-up projects,
  "Held" (only the held question) and "Quiet" (a README alone). **NOT real records, pull requests or failures.**
- **words a device keeps** (`desk-sheet-words-v1`) for a question, made up, and **"last looked"** times before and after the
  questions' raised times. **NOT a real device's record.**
- **`QW1_OPENS`** (`qw1-fixtures.mjs`): Waiting on `busiestState` with every fold opened and Delta then failing; Beta alone
  shown; the held question's sheet; and Waiting on `kindsState` with every fold opened and kept words. **NOT real.**
- **for AC94's "Settled from QW1's build"** (`ac94-qw1-questions.test.mjs`): `kindsState` cut down to two Kinds questions,
  one answered meanwhile and one with a made-up answer pull request (#71) opened meanwhile; and `kindsState` with a made-up
  project "Held" holding a held numbered and a held lettered question and Ledger holding a held v2.5 one, each asked in the
  made-up session above and raised an hour before the clock. **NOT real records or pull requests.**

## After the questions request, QW2 (2026-10-26, S-001 AC95, all but its blocker parts; AC80, AC85, AC87 and AC91 (f) changed; the owner's "Blockers first" and answer 1, "One order per project (Recommended)")

QW2 adds `tests/desk/qw2-fixtures.mjs` and no fixture file. `tests/desk/ac95-qw2-places.test.mjs` (its pure cases of
board.js's places and its screen cases), QW2's walk over `QW2_OPENS` in `ac88-dark.test.mjs`, the locked cases QW2
rewrites, and the `qw2-` captures open the states above (QW1's `busiestState`, `twoMixState`, AC85's Letters, Example) and
these made-up parts, each **NOT real**:
- **`qw2BusiestState`** (`qw2-fixtures.mjs`): QW1's `busiestState` with Alpha brought to twelve cards waiting, for two-digit
  places (AC94's "Settled from QW1's build", point 6): three made-up pull requests (#81, #82, #83, opened 3 days, 2 hours and
  9 days before the clock, on made-up `build/builder/qw2-<n>` branches), a made-up second question
  (`questions/Alpha-second.md`, raised 6 hours before the clock), a deploy waiting for its approval (Alpha made
  `deploysNeedOwner`, md-extremes/' own waiting `desk-deploy` run), and a made-up status file (`status/P-009.toml`) naming
  card criteria-2 with no card file (a card that went missing); the portfolio with two made-up cards (pf-fixtures.mjs's card
  form); and the device's Done marks on Alpha's #82, Gamma's merge card and the portfolio's first card, each kicked back
  (made up, as `deviceMarks` makes them), beside QW1's on Beta's question. **NOT real records, pull requests, cards or marks.**
- **`stripState`** (`qw2-fixtures.mjs`): `twoMixState` (Service-Desk at 77bfeae, real, with the made-up Alpha and Bravo) with
  Bravo's made-up pull request #80 opened two days before the clock, the portfolio with one made-up card, and the device's
  Done marks (`STRIP_KICKS`) on Alpha's pull request and gate card, Bravo's pull request, hold card and question, and the
  portfolio's card, each kicked back at a made-up minute chosen so the newest kick first, the age order across projects and
  the strip's order all differ. **NOT real records or marks.**
- **`QW2_OPENS`** (`qw2-fixtures.mjs`): Waiting on `qw2BusiestState`, and a made-up pull request's sheet over it. **NOT real.**

## After the questions request, QW3 (2026-10-26, S-001 AC96 and AC95's blocker parts; J2 changed; the owner's "Blockers first", answer 2, "The question names them (Recommended)", and "After the blockers (Recommended)", decisions/questions/P-001-m3g-held-place.md, B)

QW3 adds `tests/desk/qw3-fixtures.mjs` and no fixture file. `tests/desk/ac96-qw3-blockers.test.mjs` (the `Blocks:` line's read,
the blocker order's worked cases and boardView's blockers, pure, and their screen cases), QW3's walk over `QW3_OPENS` in
`ac88-dark.test.mjs` (with `QW3_ONCE`) and the `qw3-` captures open these made-up parts, each **NOT real**:
- **made-up `Blocks:` lines** (`qw3-fixtures.mjs`'s `withBlocks` and `ALPHA_BLOCKS`; the test file's own question texts): lines
  in AC96's form put into QW1's and QW2's made-up question files and into question texts written inline in the cases, before
  and after their `Milestone:` and `Asked in session:` lines, after `WHY:` (not read), in files with no `WHY:` line, a second
  line, malformed lines (no space after a comma, an empty line, a pull request `#0`, words), and entries naming pull requests,
  card files, other questions, the question itself, a held question, a question in another project, and items not there. No
  Chief of Staff wrote any of them. **NOT real records.**
- **`qw3BusiestState`** (`qw3-fixtures.mjs`): QW2's `qw2BusiestState` with those lines: Alpha's two questions blocking #81,
  #82 (kicked back) and the decision card Q-020-stop-1, the first blocking the second too (from QW3's round 2); a made-up question held as asked in a session in Alpha
  (`questions/Alpha-held.md`, in the made-up session `session_0QW1MadeUpNotARealSession01`, raised 3 hours before the clock)
  blocking #80 and the hold card and naming itself, Beta's held question, #999, a card file not there and an entry in no
  form; Beta's kicked-back question blocking Beta's #80 and naming Beta's held question; and Gamma's question blocking Gamma's
  kicked-back merge card and (from QW3's round 2) Gamma's Build-gate card. As the approved picture's frame 1 (itself made up) draws them. **NOT real records or marks.**
- **`QW3_OPENS`** (`qw3-fixtures.mjs`): Waiting on `qw3BusiestState`, and the held blocker's sheet over it. **NOT real.**
- **a v2.5 blocker** (`ac96-qw3-blockers.test.mjs`, from QW3's round 2): QW1's `kindsState` with a made-up pull request #61 in
  the made-up v2.5 project "Ledger" and a made-up `Blocks:` line on its first question naming #61, Ledger's other question
  and #62 (not there). **NOT real records or pull requests.**
- **the worked cases' cards** (`ac96-qw3-blockers.test.mjs`): AC95's five worked cases (X, Y, Z; A, B, C, D; U, V, W), as
  made-up questions in a made-up project, each raised at a made-up time in the case's order. **NOT real records.**

## The value targets shown, VT1 (2026-10-27, S-001 AC97 and J25; AC60 and J12 changed for M3B; stage VT1 of "The desk's value targets shown: M3B")

- `j11-7b69b2b/docs/PROJECT.md`: **real.** Service-Desk's docs/PROJECT.md at 7b69b2b (`git show 7b69b2b:docs/PROJECT.md`),
  section 3 and section 6 as CS36 left them (V4 at launch with no date, the 14 days after launch, the miss rule's time limit
  only), copied unchanged. AC97's tests read its section 6 lines and its miss and stop rule from it, over the other records
  of `j11-77bfeae/` (real), as AC97 names it (round 6, the Reviewer's N2).

VT1 adds `tests/desk/vt1-fixtures.mjs`. `ac97-values.test.mjs`, `ac97-values-page.test.mjs`, `j25-value-checks.test.mjs`,
`j12-value-checks.test.mjs`, VT1's walk in `ac88-dark.test.mjs` (with `VT1_ONCE`) and the `vt1-` captures
(`tools/vt1-shots.mjs`) open these made-up parts, each **NOT real**:
- **the launch** (`LAUNCH`, `withLaunch`): M3C's line given ` · reached: 2026-12-02`, the approved picture's made-up launch
  day (Wed 2 Dec 2026), and other made-up days (28 Nov, 6 and 7 Dec 2026, 8 Jan 2027) for launches on other weekdays. Not a
  plan: launch has no date (P-001-m3b-launch-date.md, A). **NOT a real record.**
- **J25 lines** (`vc`, `DAY5`, `FINAL`, and lines written inline in the tests): Chief of Staff weekly value checks in J25's
  form, in every state and awkward case (two checks of one target, malformed lines of every kind, a time 5 and 11 minutes
  after the clock, either side of midnight in Chicago, `Z` and `+00:00`, a target section 6 does not hold, a project not
  connected, a v2.5 project's line, a line dated before an earlier one, values at 0, at each goal, past it and past the
  chart's scale, `null` on V4 and `not measured` lines). Their figures are the approved picture's or made up; every
  `session` is `session_made_up_for_vt1`, every `source` a made-up path. No Chief of Staff wrote any of them. **NOT real
  records.**
- **dispatch-log cards** (`cardsLog`, `windowCards`, `novemberCards`): item Q-901's failure cards in made-up
  `dispatch-log/2026-11.jsonl` and `2026-12.jsonl`, raised and answered at made-up times — inside and outside the 14 days
  (one raised on launch day), one open at the window's end and one answered after it — with made-up answer records and card
  files. **NOT real records.**
- **other v3 projects** (`docWithTargets`, `ALPHA_TARGETS`, and lines written inline): sandbox-fixtures.mjs's made-up
  `fullRepo('Alpha')` with a made-up section 6 in place of the 3117150 doc's own: three targets with no J25 line, ids out of
  order, a long target line, and no `V<n>:` line. **NOT real records.**
- **J12 pull requests 990 to 996** (`j12-value-checks.test.mjs`): made-up merged weekly value check pull requests and their
  changed paths. **NOT real records.**
