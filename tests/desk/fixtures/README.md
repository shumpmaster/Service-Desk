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
    `s-orphan` (an end line before any start and one after an end) and `s-cost` (a made-up end line
    with a cost). `python3 governance/checks/v3_checks.py sessions --root <a v3 root holding them>`
    passes them; its output, `good/check.txt`:
    ```
    exit 0
    NOTE: 7 session file(s) in sessions/chief-of-staff/
    OK: the Chief of Staff's session lines are in their form
    ```
  - `bad/sessions/chief-of-staff/s-bad.jsonl`: **NOT a real record**: line 1 in form; lines 2 to 20
    one for each finding the desk mirrors (it names and skips them); lines 21 to 23 for those it reads
    as written (a repeated key, `1.0` for a count, a time earlier than the line before); line 24 an end
    line whose usage has a figure of the wrong kind and line 26 one whose usage is not an object (read by
    J10's rule); line 25 in form. The same command's output, the model's failure beside each line,
    `bad/check.txt`:
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
    FAIL: 24 violation(s)
    ```
