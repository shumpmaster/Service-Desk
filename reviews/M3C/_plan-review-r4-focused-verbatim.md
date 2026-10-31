Verdict: PASS

Draft 4 fixes all seven items: B1, B2, N2, N3, N4, N9 and N10. Each fix is right against the code and the rules. It lists N1, N5–N8, N11 and N12 under "Carried to the build" (S-001.md:4359-4369) and does not fix them. Nothing in the diff breaks a rule or makes a step impossible. I found six non-blocking points, all small.

I worked read-only in /home/user/sd-ladef, scope `git diff c36977e a85ae63 -- specs/S-001.md`. Line numbers are in specs/S-001.md at a85ae63. The tree is still clean. `surface_guard.py diff --range f588bf3..a85ae63` passes (1 commit, Definer's trailers present). The diff's scope matches the owner's ruling (decisions/questions/P-001-m3c-plan-stop.md, A).

**The Definer's correction: confirmed.** In v3_checks.py, `ruling_why` (1811-1822) checks only the record's path, that it exists, its first-line form and that it names the id. It never looks at `(defaulted)`. Only `reached_licence` refuses a defaulted record (2074-2075). My round 3 was wrong to say the standard-lines check refuses one.

Question 1's default is safe as the plan now states it (21587-21590). The plan rests it on CS40's own rule (18880-18881), not on a check, and that holds. A second backstop holds too: asks-merge never merges a `(defaulted)` record (asks_merge.py:211-212), and OPERATING_MODEL.md:100 has a default wait for the owner's merge. So a defaulted A lands only if the owner merges it. Note that no check stops a skipped line from citing a defaulted record. The quoted question names Build-1 to Build-3 whole, so `ruling_why` would pass it. See N5.

**What I relied on, graded**
- **A (read or ran myself):**
  - desk-deploy.yml:15, 17-36, 43, 57-64; desk_pick_commit.sh:38-50; desk_preview_check.py (whole); desk-build.yml:10-16 (`pull_request` has no path filter).
  - decisions/README.md:5-7, 11-13, 43, 53-69; ROUTING.toml:424.
  - asks_merge.py:196-215 (closing_problem); governance_checks.py:325-345, 356-393; record_checks.py:433-478.
  - AGENTS.md:75-77; OPERATING_MODEL.md:94-100 (model repo); risk-paths.toml:8 (R3 is irreversible or gate-bearing).
  - v3_checks.py:1811-1822, 1946-1977, 2061-2100.
  - sandbox.js:1725-1745 and 1760; weekly.js:19-20 and 129-145; records.js:356-389 and board.js:401-420 (how the desk reads `DEFAULT: none (…)`).
  - tests/desk/notify-ac76.test.mjs:1 (`ac-test: S-001/AC76`); the owner-time sum (69 + 37 + 4 = 110).
- **B (sampled):** that `decided_by: owner` is a ledger convention (asks_merge.py:275), not a check that refuses a defaulted record.
- **C (could not check):** wrangler's cli.js:301455. node_modules isn't installed, so I couldn't confirm that `PROD_BRANCH: "null"` makes a preview deployment. The N10 fix is right either way.

**The seven, item by item**
- **B1 fixed** (4046-4054, 4106-4112, 4128-4129, 4163).
  - A dispatch with `job=preview`, `sha=R` passes the preview job's `if` (yml:43) and the pick check (on main, nothing deployable after it, :42-50). Its title `deploy R — note` is read by desk_preview_check.
  - desk-build runs on every pull request (yml:11), so CS38's PR run exists. The fallback, the Reviewer's own run at R, always exists.
  - W1-W4 and the records come before S3; O3b is counted.
- **B2 fixed** (3926-3934, 4170-4171, 4225-4227, 4335-4340, 18910-18914, Q3's WHY).
  - The README and ROUTING.toml:424 refuse `launch.kill` and `launch.proceed`, and not `hold` or `recycle`, as the plan now says.
  - Question 3 is now irreversible, so asks-merge's kind (b) refuses its answer mechanically (asks_merge.py:203-204).
- **N2 fixed.**
  - Irreversible fits R3 (risk-paths.toml:8). `DEFAULT: none (…)` has precedent and gives "Can't be undone" on the desk (board.js:410).
  - A names the 37 minutes and the tokens. C's four phases match README:12. D says what happens to the preview desk.
  - Question 4's safety is A (v3_checks.py:2074).
- **N3 fixed.** The trial line shows only while an unsaved trial week is offered (weekly.js:134-135; sandbox.js:1743). The block is shown for `planning: true` (sandbox.js:1760). O5 saves after R.
- **N4 fixed.** The check now runs before the merge, and `^1` is confirmed after it (4239-4246, 18901-18908).
- **N9 fixed.** The dry run's record names a commit SHA the Reviewer can check. The "stopped" issue's tests exist and carry the marker. The desk-notify condition now reads "none failed".
- **N10 fixed** (18838, 18852-18854).

**Blocking**
None.

**Non-blocking**
- **N1. Question 2's WHY no longer matches the plan.**
  - Draft 4 says LA1 does not open on a defaulted answer, and "nothing changes until the owner answers" (4053-4054; 21591-21592).
  - Question 2's WHY still tells the owner "Left unruled, the notes give option B" (S-001.md, question 2's WHY). In fact, left unruled, the launch waits.
  - The filed copy (/home/user/Service-Desk/questions/P-001-graduated-changes.md:6) says the same.
  - Fix: change the WHY to "left unruled, your Builder does not start, and the launch waits", or let a defaulted answer write B's notes.
- **N2. S5's CI record can clash with S5's own rule.**
  - S5 takes "a record dated after R" (4151-4153), but CS38's pull-request run is dated before R (4163).
  - Separately, a pull-request run tests GitHub's merge ref, not `head_sha`, so the `git diff <head_sha> R -- src tests` test (4108) is a stand-in.
  - The Reviewer's own run at R always exists and is after R, so nothing fails by construction.
  - Fix: at S5, name the Reviewer's S3 run, or LA1's push run of desk-build (LA1 touches tests/**).
- **N3. The step list puts two steps out of order.** "The steps, in order" lists O3b and W1-W4 (4128-4129) after S3 (4083), though they come before it (4048-4054). Fix: move both bullets above S3.
- **N4. Two small gaps at L3.**
  - L3 says nothing if `^1` is not the fetched tip (4242-4243; 18905). Fix: re-run `git diff --quiet R <LA2>^1 -- …` there and stop if it differs.
  - L3's failure branch already starts the preview deploy after L2, which is part of N5, yet N5 is still listed as carried (4362). Fix: say so in N5's carried line.
- **N5. Question 1's safety rests on an instruction alone.**
  - Only CS40's rule (18880) and the owner's merge of a defaulted record (asks_merge.py:211; OPERATING_MODEL.md:100) stand behind it; no check refuses a defaulted record cited for a skipped line.
  - Fix: have the Critic's check of the lines, or S7, confirm the cited record's first line doesn't end `(defaulted)`.
- **N6. The kill path doesn't say who deletes the leftover question file.** The general rule covers it: the Chief of Staff deletes it in a pull request of its own (OPERATING_MODEL.md:100). Fix: say so beside 18912-18914, as 4279 does for a proceed.

**Open questions (outside the diff, for the Chief of Staff)**
- The filed questions 1 and 2 (/home/user/Service-Desk, 15ad528) differ from the spec's text.
  - Question 2 is filed as `REVERSIBILITY: costly` with `DEFAULT: B (a timeout cannot grant an exception)`. The spec's text and its "safe in effect" paragraph treat question 2 as reversible.
  - CS39 says to file the spec's text word for word (18859-18860).
  - Which text governs? The spec should follow whichever was filed.
