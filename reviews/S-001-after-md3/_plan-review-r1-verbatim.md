# S-001 after MD3: the plan Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/definer/s001-after-md3 at 572ac1b.

---

Verdict: FAIL

The amendment mostly holds up against main. Most of what it says is "as built" is true, the owner's rulings are applied as they read, and A3's sum is right. It fails on two small points that need fixing before it is frozen. First, one "as built" note says something main does not do. Second, a Risks entry still gives the old call-budget margin, which contradicts A3's new one.

**Checks run (worktree /home/user/sd-def-md3-after, 572ac1b)**
- `bash governance/checks/check_all.sh . origin/main`: "OK: all governance checks passed." (25 of 25 PASS, exit 0)
- `python3 governance/checks/surface_guard.py diff --range origin/main..572ac1b --branch build/definer/s001-after-md3`: "OK: 1 commit(s) … checked" (exit 0). The commit is by `definer <definer@agents.invalid>` with `Agent-Session:` and `Spec: S-001` trailers.

## Blocking findings

**B1. AC69's "as built" note is wrong about the owner tile's edge.**
- The spec says the owner tile's edge and the queue rows' edges are ink, not vermilion (specs/S-001.md, AC69's note "After MD3, as built from stage 7 (#187…)").
- Main does not draw the owner tile's edge in ink:
  - src/public/sandbox.css:278 gives it `.sb-you { … border-left: 4px solid var(--tie) }`.
  - src/public/sandbox.css:515 sets `--tie: var(--line2)` on every screen (html.v2-page, set at src/public/sandbox.js:3960 and :4107).
  - So the edge is the light line grey, #d6d6db in light and #34363c in dark.
  - Stage 7 (6ff490f) changed it from `var(--you)` to `var(--tie)`, not to ink.
- Only the queue rows' edges are ink: `.sb-qrow.g-decisions` at src/public/sandbox.css:236, the one row class drawn (src/public/sandbox.js:1408).
- The error comes from the stage 7 Reviewer's note, which the amendment copied: reviews/S-001-desk-v2/_build-7-review-round1-verbatim.md:42.
- To reproduce: `grep -n "sb-you {" src/public/sandbox.css` and `grep -n -- "--tie:" src/public/sandbox.css`.
- Route: Definer. Either correct the note (owner tile edge `--tie`/`--line2`, decisions rows `--ink`), or, if ink is wanted, turn it into a change with a test and a stage.

**B2. Risks still gives the old budget margin, against A3's new sum.**
- A3 now reads "9,817 + 125 + 10 = 9,952 … with 48 to spare" (specs/S-001.md:13843-13844).
- Risks still says "The call budget's margin narrows to 183 a day … (A3's 9,817)", and that "the next addition that needs calls is counted against the 183" (specs/S-001.md:14531-14537). The amendment did not touch this entry, though it says Risks was written in.
- A margin about four times smaller is what the owner and the next Definer should see.
- Route: Definer. Restate the entry at 9,952 with 48 to spare.

## Checked and holding
- **A3, recomputed:**
  - (288 + 25) × 5 = 1,565; 1,565 − 1,440 = 125; 9,817 + 125 + 10 = 9,952; 10,000 − 9,952 = 48.
  - The measured 1,562 and 7,534 match reviews/S-001-desk-v2/_build-1a-review-round2-verbatim.md:101 and :113-114.
- **Rulings:**
  - All nine in decisions/questions/ are quoted word for word and applied as they read: lanes, pick, frozen record, glance test, repeat, copy, team, reload, md3-accept.
  - P-001-audit-marks stays open (questions/P-001-audit-marks.md, default A), and no stage waits on it.
- **EXP-005:** only a note and a `withdrawn:` line are added at the top. The rest is unchanged.
- **Lanes (AC49):**
  - The four looks match src/public/sandbox.css:329-337 and :520. The lanes take them in turn at src/lib/sandbox.js:1450.
  - The stub is 4 px wide with 1.5 on, 2.5 off (:331).
  - --ink and --ink2 are 23 apart in light and 18 in dark, from the stage 7 review round 2, line 17.
- **J6:** `no-access` is set at src/lib/github.js:419-422.
- **AC85:** the gate card's section 5 is written at governance/checks/orchestrator.py:923-934.
- **AC24's note:** the gate card's `Milestone:` line comes from the spec header (orchestrator.py:879-892). Plan's row count does count gate cards today (src/lib/workview.js:57-67), so AC89 (k) is a real change.
- **J16:** the sender's usage read uses the billing token after the collect step, and syncIssue runs after sending (src/notify/sender.mjs:228, :331).
- **Owner question 2:** the sender's transitive `src/lib` imports are exactly the 16 modules named. The three risk paths are at governance/risk-paths.toml:22-24.
- **Things AC89 asks to change are not already built** (sampled):
  - sw.js hands a tap to `desks[0]` with no `exp=` filter (src/public/sw.js:97-108);
  - "Your merges?" is at src/public/sandbox.js:1382;
  - "Its status file" is at src/lib/sandbox.js:982;
  - "Phases: reading…" is at src/lib/sandbox.js:244;
  - the default line stutters "Default: per the question file: DEFAULT …" (src/lib/sheets.js:105 with src/lib/records.js:341);
  - the portfolio's queue and template filters are missing (src/lib/portfolio.js:199, :382).
- **"As built" samples that match:** AC82's Next line (src/lib/home.js:563-584), AC67's key and "Idle" (src/lib/feed.js:826), and AC87's "patch/major release(s) behind" (src/lib/portfolio.js:148-152).
- **Closed items that are truly closed:**
  - #192's sandbox.css change is 23 lines in and 254 out, and every named dead rule has 0 matches;
  - the stub's 3 px test is at tests/desk/ac88-dark.test.mjs:516-520;
  - the stage-8 guard is at tests/desk/ac88-dark.test.mjs:364-422;
  - the pin 5a7e55a is on main;
  - LL-025 is Personal-Org-Operating-Model's 5dc43c2 (#36).
- **Milestones:** the `Milestone: none (<reason>)` form is the one governance_checks.py:650-653 accepts. M3B's and M3C's "done when" lines are as quoted (docs/PROJECT.md:113-114).

## Non-blocking notes
1. **Owner question 1's recommended reason misses the point.** J22 trusts the `owner-verdict` status by its context alone (src/lib/j22.js:420). So `.github/**` being R3 does not stop an agent posting the status directly, which is the question's own premise. Correct the reason before the Chief of Staff files it.
2. **Stage order.** Stage 3 (AC90) comes before stage 4 (AC67's idle fold), but AC67 and AC90 both put a shared reason at the head of the opened idle list. Stage 4's test column doesn't name AC90's Team case. Name it, or swap the two stages.
3. **Stage 6 is heavy for one pull request.** It covers (d) to (g) plus 14 items of (k), across Home, Plan, the Timeline, the v2.5 page, the portfolio, loading and sw.js, each needing a stage-8 guard exception. Consider splitting (k).
4. **(b) item 30** (the long-text fixture and the lanes fixtures) is assigned to "Stage 8", but the stage table's stage 8 row lists only item 36.
5. **Closed item "the accepted view's `defaultLabel`… the accepted views went at stage 8" gives the wrong reason.** `defaultLabel` still exists and the new sheets use it (src/lib/sheets.js:105). The bug is closed because it now goes through `defaultLetter` (src/lib/records.js:325-341).
6. **CS27 "moot" rests on an Orchestrator note of 2026-10-21 that is not in the records.** I confirmed the fact locally: Personal-Org-Operating-Model's origin/main has only ci.yml, launch-trial.yml, pr-body.yml and scrub-proof.yml, so no Workflow 4. The spec should cite a record. The same goes for "the Orchestrator's working list" as the source of the sorting, though every item traces to reviews/S-001-desk-v2/.
7. **AC44 step 4 cites only #192.** The step also needs the Reviewer's pass and the owner's approval of the preview deploy. reviews/192/reviewer.md and owner.md are PASS; cite them and the deploy approval.
8. **Wording slips.**
   - "The eight rulings" is followed by a list of nine (md3-accept is the ninth).
   - "Each is built as answered" is not yet true for AC17, AC56, AC67 and AC90; they are carried, not built.
   - "Unchanged: every criterion of what waits on the owner" overclaims: AC89 (a) changes AC80's one-project view, and AC89 (k) drops gate cards from AC24's count. Neither hides anything.
9. **Known limit 6** (five or more lanes share a look), like the fourth lane repeating a dash, goes a step past the lanes ruling's "every lane looks different at a glance". The owner accepted MD3 as built, but the opening paragraph for the owner doesn't mention it. Consider telling them.
10. The audit says "three small wording or drawing points"; the amendment counts four, adding the sprint marks from item 9. That is fine, just not the audit's own count.

## Open questions
- None for the owner from this review beyond the three the amendment lists. A join-up section does not apply to a plan review.
