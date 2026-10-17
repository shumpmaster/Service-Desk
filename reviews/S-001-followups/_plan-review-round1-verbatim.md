Verdict: FAIL

This is the plan review, round 1, of 9ca6b61 on build/definer/s001-followups. It changes only specs/S-001.md. The author is `definer`, with `Agent-Session:` and `Spec: S-001` trailers. I edited nothing.

**Checks run**
- `GOV_BRANCH=build/definer/s001-followups bash governance/checks/check_all.sh . orch/desk-followups`: all 24 checks pass ("OK: all governance checks passed").
- governance/checks/governance_checks.py is byte-identical to the model's tools/governance_checks.py at c816cec (`cmp`).

**Verified true**
- **Code citations.**
  - feed.js:766: `SHA40 = /^deploy ([0-9a-f]{40})(?![0-9a-f])/`. A push run's commit comes from `headSha` (:769).
  - sandbox.js:416 builds the row as `${r.name}: waiting for approval`, from records.js:810's `name`.
  - pulls.js:20-21 says "its draft of 2026-10-16".
  - `PULLS_RATE_MS` is at pulls.js:12.
  - pullsDue and applyPulls (scheduler.js:173-215) take the clock as `clock.now()`, so the fake clock can drive the backoff.
  - The src/public/lib copies are identical.
  - Nothing under src/lib or src/functions contains "Merge pull request".
- **Records.**
  - e9630a4 has two parents, its first line ends "(#79)" and its body is PR #79's description.
  - docs/SETUP.md:60 is step 5.
  - runs-bbd7abc-push.json: the deploy run's `name` and `display_title` are the same string, "deploy bbd7abc… — Merge pull request #40 …\n\nM1: …".
  - S-032 was merged at c816cec (its PR #34).
  - Frozen J2 now ties a merged pull request through the plan's ` · sprints:` lists, so dropping that difference is right.
  - Known limit N1 matches: governance_checks.py:438 `PR_LEAD_RE` uses `\s*`, while the desk's `OPENING_RE` needs a space or tab.
  - Known limit N2 matches: j11.js:200-208 `whyEnd`, and :232-236 skips the line with a problem.
  - Both quote S-032's build review round 1, N1 and N2, accurately.
- **The run-name expression.**
  - `run-name` may use the `github`, `inputs` and `vars` contexts, and `format()` is an ordinary function, so it is allowed there.
  - A scratch copy of desk-deploy.yml with the new line 15 parses as YAML into the intended string.
  - For a push run it gives `deploy <sha>`. For a hand-started run it gives `deploy <sha> — <note>`.
  - With an empty note it gives `deploy <sha> — `, the same as today's form.
  - AC72's parse holds for all three titles (tested in node).
- **The backoff arithmetic.**
  - Each window's retries cost 5, 10, 20, 40, then 60 minutes each. Spending the 960 minutes on the cheapest retries first: 10 windows × 4 retries = 750 minutes, and the 210 minutes left buy 3 more, so 43 per project is the true maximum.
  - 5,500 + 5 × 43 = 5,715. The review's 10,300 matches the record.
  - The test is feasible: the existing AC14 shape of 10 × 96 minutes gives 40 retries per project.
- **Lanes.** `.github/**` is the Chief of Staff's surface (governance/SURFACES.md:84). CS3's commit 8640a0c carried no `Spec:` trailer, as CS14 says.

**Findings**

B1. **The "differs" list is still incomplete, and :3064-3065 says otherwise.**
- What the spec claims:
  - :3064-3065: "The frozen forms read the same for every case below, except those under 'Where the desk differs from S-032'."
  - :3162: the new test "keeps the list true".
  - The commit message says the list is "made true".
- What I reproduced: I ran the 3.4.0 `check_pr_body(payload, root=<v3 root>)` and the desk's `prBodyParts` (pulls.js) on the same bodies. The probe scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probe/. Each body below fails the check, the desk reads it anyway, and none of them is on the list:
  - a plain line in Context. This is a case AC61 itself lists at :3102 ("a line in the section that is no bullet is not shown"), so the "every case below" sentence is false;
  - an indented line after a blank line in Context (dropped);
  - `Milestone: Design-9` → `{ids:["Design-9"]}`;
  - bare `Milestone: none` → `{ids:["none"]}`;
  - `(source: none)` → source "none";
  - the exception bullet beside another bullet;
  - the exception bullet with an unquoted Why;
  - a Why of only "TBD".
- Fix: add these as display leniencies, or replace the claim with a catch-all such as "any other body the check fails is read as (c) reads it, for example …". Then reword :3064-3065 to match.

N1. **"The other way round …" (:3128-3129) is no longer a difference.** Frozen J2 says the same thing ("A `Milestone:` line ties the sprint only for the desk's display; it changes no milestone's state"). Fix: say "as in S-032's J2".

N2. **The research-runs item (:3115) is not a "body that check would fail".** Research runs have no pull request body; S-032 leaves them out of scope. Fix: put it outside the "So the desk shows some bodies …" lead-in.

N3. **The freeze date is wrong.** :3142 says "S-032 froze with these forms (2026-10-17, …)", but S-032 froze on 2026-10-16 (24987db). c816cec was merged 2026-10-16 21:05 -0500. Only the adoption (L-0015) is 2026-10-17. Fix: "S-032 froze on 2026-10-16 (24987db; merged at c816cec); Service-Desk adopted it on 2026-10-17".
- Also at :3064, "S-032's draft's" should read "S-032's draft of 2026-10-16".
- :418 and :3064 should name which draft; the desk's earlier difference matches draft 1 (7108d1d), whose J2 did not tie through the plan.

N4. **A second reader of the run title is not named.**
- .github/scripts/desk_preview_check.py:28 (`TITLE = re.compile(r"^deploy ([0-9a-f]{40})\b")`, docstring :15 "`deploy <sha> — ...`") reads the run title, and the production job depends on it (desk-deploy.yml:132). It matches `deploy <sha>` alone (tested), so nothing breaks.
- Fix:
  - CS14 (:5156) and AC72 (:3633) should say that this reader still holds, so a different title form is not chosen by mistake.
  - CS14 should also update that docstring.

N5. **The owner quote at :5279 is trimmed.** The owner's words, as L-0015 records them, are "Additionally I changed the merge settings so we are good to go". PR #79's review, N2, flagged the same trim.

N6. **AC14's new test should say exactly what it counts (:814).** "At most 43 J12 retries a project" does not say whether each opening's first J12 read counts. Fix: "at most 43 J12 reads after a failed one (each opening's first read not counted)", or "at most 53 J12 reads".

N7. **The flapping case is not covered by "at most 5,715 calls" (:803).** A success resets the backoff, so a read that answers and then fails in turn is outside the all-day-failing count. Pages 1 and 2 answering and page 3 failing gives 3 calls every 7 minutes, about 2,057 a day for 5 projects, so about 7,557 in all. That is still under 10,000. Fix: one sentence in A3 noting this case.

N8. **AC72's test fixture should set both fields (:3674).** The row is built from the run's `name`, not `display_title`. Fix: set both `name` and `display_title` to `deploy <sha>`.

N9. **Optional:** :309 and :350 still say S-032 is "being drafted" or "carries S-032". They sit in the dated 2026-10-16 block, so leaving them is defensible.

**Change size, plain English and lanes**
- The diff is proportionate. There are no desk code changes beyond the backoff and AC61's comments.
- Test markers follow the spec's pattern: `ac-test: S-001/AC14`, `join-test: S-001/J12`, and the existing AC61 and AC72 markers.
- CS14 is correctly the Chief of Staff's, in an owner-merged pull request with no `Spec:` trailer.

**Open questions:** none.
