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
  three at 414 px in Chromium's default sans-serif. The fake DOM cannot measure lines, so the
  browser check confirms it crosses the three-line mark before it checks anything else (plan
  review round 2, R4).
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
  draft forms (taken on, skipped, one out of form, one repeated, one naming no standard
  milestone); `pulls.json` holds made-up pull requests #901 to #909 with `Milestone:` lines and
  `## Context` / `## Why` sections in each form AC61 (c) reads.
- `ac62-text-2c1acb6.json` (2026-10-16, AC62): every sandbox screen's text at commit 2c1acb6,
  outside the parts AC57 to AC60 and AC65 to AC68 rebuild, drawn by the page itself from
  `tests/desk/screen-text.mjs`'s fixtures; made by `node tests/desk/tools/ac62-snapshot.mjs` in a
  checkout of 2c1acb6's `src/` (the file's header says how).
