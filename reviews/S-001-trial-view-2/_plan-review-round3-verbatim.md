Verdict: FAIL

Plan review round 3 of specs/S-001.md at 1d3a22a (drafts 1 to 4 on orch/trial-view-2). I edited nothing. One finding blocks, and it is new in draft 4 (AC72): on the normal production-deploy path it would tell the owner "don't approve" for a deploy that is safe. Every round-2 finding is fixed. The colour figures check out exactly. Everything else below is non-blocking.

**Checks:** `GOV_BRANCH=build/definer/s001-trial-view-2 bash governance/checks/check_all.sh . orch/trial-view-2` exits 0. All 24 checks pass ("OK: all governance checks passed."). AC57 to AC72 each have one trace tag and one `ac-test:` marker, and J12 keeps its `join-test:`. AC45 has no test marker; it is a ruling criterion.

**1. Round-2 findings (fixed in draft 3)**
- **B1 fixed.** AC60 (:2862-2876) and AC57 (:2552-2553): a pull request named only in its own `Milestone:` line sits in its own folded line, "named by its pull request, not yet in the plan". It changes no milestone state, mark, delivery order, now run or next milestone to reach. AC57's test checks this with `Milestone: MD3`.
- **B2 fixed.** On Status, MD2 reads "No work filed yet · next to reach" (:2549-2551). The key never calls the gold ring "now" alone (:2525-2529), and the test checks both.
- **N1 fixed** (now settled by the owner). **N2 fixed:** 14 untied pull requests since 680797b, and the record notes the owner was asked with the older count.
- **N3 fixed:** a run still to come gathers its standard milestones in one "· still to come" line (:2754-2757).
- **N4 fixed:** CS13 is the owner's, by hand (:4943).
- **N5 fixed:** J12 now also does a daily full read (:4586), AC50's words are taken in order (:1511-1522), and the now run's dot falls back to the half-filled circle when nothing is next to reach (:2505-2510).
- **N6 fixed:** the "differs from S-032" list now covers it (:3036-3041).

**Colour arithmetic (draft 4).** I re-ran my CIEDE2000 script (`de3.py`, `de4.py` in the scratchpad) on the 13 colours that carry a meaning in each theme, 78 pairs each.
- Every pair is at least 10.
- Light theme closest pairs: coral and red 11.44, amber and gold 12.46, blue and purple 12.57.
- Dark theme closest pairs: amber and the new gold 11.03, coral and red 11.83.
- These match AC48's "about 11.4" and "about 11.0" (:1323-1333).
- The old dark gold `#d4ae4f` against amber was 7.15, so the owner's fix was needed.
- The lane shades AC49 uses (`--shade1-3`, `--you1-3`) are outside the rule, but they also clear 10 against every new colour (lowest 11.7, `--you3` against Launch in the dark theme).
- Context `#ad606a`/`#bc7e8d`, Why `#756592`/`#c7adcb`, dark gold `#c9b04f` and the 3-day stall signal are carried exactly as the owner gave them.

**B1. AC72 checks the wrong commit for a deploy started by hand (`workflow_dispatch`), so it tells the owner "don't approve" for safe production deploys.**
- Where: AC72 :3503-3505. It says: "its commit is its `head_sha`, the current head".
- For a hand-started run, `head_sha` is main's head at the moment of starting. The commit actually deployed is `inputs.sha`:
  - .github/workflows/desk-deploy.yml:15: `run-name: deploy ${{ … || inputs.sha }}`;
  - .github/scripts/desk_pick_commit.sh:17: `workflow_dispatch) SHA="${INPUT_SHA:-}"`;
  - the input itself says: "The full 40-character merge commit to deploy (from the Reviewer-passed PR's page)".
- Every production deploy, every exp-002 run and every manual preview redeploy is started by hand.
- Main's head is often a records-only commit by then. In the real history, e34574d ("Create P-001-design-lab-open.md") follows a merge, and orchestrator status commits land on main directly.
- So for the production deploy of a reviewed merge, AC72 as written says "Doesn't match a reviewed pull request: don't approve". The approved design asks the opposite question: "does the commit being deployed match…".
- Not unsafe: desk_pick_commit.sh refuses any commit whose deployable files differ from main, so a wrong "PASS" can't happen. But it gives the wrong instruction on the owner's most important approval.
- Fix: for a push run, use `head_sha`. For a hand-started run, take the 40-character sha after `deploy ` in the run's `display_title`, which is in J1's run list. If it can't be parsed, show "Can't check this deploy yet". Add a hand-started case whose `inputs.sha` differs from `head_sha` to AC72's test.

**2. New criteria for notes 28 to 35**

AC65 to AC72 match the owner's picks and the option texts. AC70's "not recorded" for Service-Desk is honest, and the mockup's quote is named as an illustration. The `BOUNDARY_WORDS` and `is_boundary` references are correct (orchestrator.py:130, :284-286), as is `Reason:` (decisions/README.md:13), and the log lines do carry `record`, `proxy`, `time`, `gate` and `word`. J12 adds `mergeCommit { oid }` and keeps it (:4576, :4596). AC71's `committedAt` exists (github.js:194). Desk-deploy runs only on pushes touching `src/**`, so record commits don't start deploys.

**N1. AC58's and AC50's own tests still check what AC65 removes.**
- AC58's test (end of AC58) and AC50's test still check "1 of 4 phases finished" and the row words "Now · run 2" and "Run 2 still to come".
- AC65's test checks the opposite: no "of 4 phases finished", and the tile words "now · run 2" and "run 2 to come".
- AC58's line "Where … differ, AC65 governs" decides it, but the two test descriptions contradict each other.
- Fix: rewrite those bullets in AC58's and AC50's tests to point to AC65.

**N2. Removing the Pipeline view (AC68) leaves the project's record notes with nowhere to show.**
- AC68 (:3363-3367) removes the v3 Pipeline view from the sandbox. That view is the only place it shows `model.notes` (sandbox.js:760-762).
- Those notes are where AC31 names skipped record lines and fields, and where AC61's out-of-form and repeated lines are noted.
- AC36's change (:1016-1021) only lists, in the pull request, the AC9 facts that end up shown nowhere. The notes are not AC9 facts.
- Fix: name where the notes live in the sandbox for a v3 project, for example a "Record notes" entry under "More detail". Cover it in AC68's test.

**N3. Notification text elsewhere still treats AC45 as undecided.**
- AC45 (:1185-1199) is honest: the owner's 2026-10-08 ruling is quoted, it is built in M3, and its criteria are not written yet. The M3 pointer (:3534) and the owner-facing note (:5485) agree.
- Still out of date:
  - the risk at :5374-5376 still says "Nothing is built until the owner rules";
  - AC45's "Only extra channels…" paragraph still calls a GitHub-run Web Push sender "an exception to the desk's design", which is the very channel that was ruled;
  - the time line at :5214 still lists "the phone-notification ruling".
- Fix: mark all three as ruled (the security review still applies).

**N4. The Definer's (C) choices, as asked:**
- **AC72 traced to V4:** defensible (taking over the live address depends on safe deploys), but none of V1 to V5 measures it and the spec gives no reason. Add a one-line reason, or trace it to V3.
- **AC71 counting an open pull request's `updated_at`:** acceptable. A comment also bumps it, but the line names what moved ("PR #n updated"), so the owner can see that.
- **AC70's "<gate> gate: <word>" fallback:** it shows model working terms ("dor gate: re-aim") in an owner-facing line. Either give it plain words with the code after, in line with AC64, or keep the fallback inside a code-role span.
- **AC67's "Just finished" check:** fine; a check means done everywhere.
- **"Idle" icon:** AC67 uses the empty dashed circle, which already means "planned" (AC59) and "still to come" (AC65). The owner approved it as drawn, but it now carries two meanings. Note it as a known difference.

**N5. Slate now carries a meaning but sits outside the colour rule.**
- AC48 (:1328-1329) leaves Technical's slate (`--muted`) out of the distance rule. AC69 now gives slate a meaning: a gap the agents fill.
- It passes anyway: 17.6 against purple in the light theme, 16.05 against Why in the dark theme.
- Fix: bring `--muted` into the rule's 13 colours (making 14).

**Open questions:** none for the owner beyond what N3 and N4 suggest telling them.

Files:
- /home/user/sd-def2/specs/S-001.md
- /home/user/sd-def2/decisions/questions/P-001-trial-view-notes-2.md
- /home/user/sd-def2/decisions/questions/P-001-notifications.md
- /home/user/sd-def2/.github/workflows/desk-deploy.yml
- /home/user/sd-def2/.github/scripts/desk_pick_commit.sh
- /home/user/sd-def2/src/public/sandbox.js
- /home/user/sd-def2/docs/design/mockups/other-screens.html
- /home/user/sd-def2/docs/design/mockups/audit-additions.html
- /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/de3.py
- /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/de4.py
- /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/checks3.txt
