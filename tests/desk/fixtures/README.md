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
