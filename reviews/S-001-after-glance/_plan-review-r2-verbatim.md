# S-001 after the glance audit: the plan Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/definer/glance-plan at ee4c946.

---

Verdict: FAIL

**Plain summary.** All the repo checks pass: the governance suite, the surface guard and the full desk test suite (1,154 of 1,154). Draft 2 fixes most of round 1: the date form, the soft box's line cap, "largest text under the title", the red-tile premise, the milestone questions, and 14 of the 15 notes. It still fails on two points, both for the Definer and neither needing the owner.
- **The new count still gets a finished phase wrong.** Some standard milestones are ones the model never records. Once a project writes the "taken on" line the model asks for, the count treats them as forever still to do. In a committed test fixture, a finished Discovery whose every recordable milestone was reached reads "4 of 8 reached". That is the owner's own complaint.
- **The fixtures can't be rebuilt from the files named.** `mix` and `text` are named from the October 6 copy of the records, which has no milestones or phases. `text` is also built from a file that is an expected-output snapshot, not records.

Without those standard lines, the real records do give a concrete "T of T": Discovery reads "4 of 4".

**Checks run (/home/user/sd-definer at ee4c946)**
- `bash governance/checks/check_all.sh . 2d0edb0`: every line PASS, "OK: all governance checks passed.", exit 0.
- `python3 governance/checks/surface_guard.py diff --range 2d0edb0..ee4c946 --branch build/definer/glance-plan`: "OK: 2 commit(s) in 2d0edb0..ee4c946 checked", exit 0. Both commits are by `definer <definer@agents.invalid>` with `Agent-Session:` and `Spec: S-001` trailers. Only specs/S-001.md changed.
- `cd src && npm test`: 1154 tests, 1154 pass, 0 fail, exit 0. The working tree was clean afterwards.
- One inline `node --input-type=module -e` run (no file written). It used j11Records, timelineOf, phaseView and runsContext on j11-77bfeae, built as ac83-page.test.mjs's `ctxOf` builds it, plus the same records with ac83-page.test.mjs:38's committed `ALL_24`. It applied AC92 (c)'s classes 1 to 5 exactly as S-001:8688-8701 words them. Results are below.

**Blocking findings**

- **R2-B1 (round 1's B1, the Critic's 3): class 4 counts milestones the model can never record as "still to do".**
  - **The rule:** S-001:8696 puts a standard milestone "taken on" by its section-3 line in class 4, inside T and outside R.
  - **The ids that can never get a state:**
    - the ten in `NOT_RECORDED_IDS` (src/lib/timeline.js:44-45), which `stateOf` always records "not recorded" (timeline.js:337);
    - Launch-4, whose file part is always 'not-recorded' (timeline.js:329);
    - Discovery-3, which is "not recorded" without groundwork.
  - **What follows:** once the line says "taken on", such a milestone sits in T and can never enter R.
  - **Reproduce:** j11-77bfeae plus `ALL_24` (ac83-page.test.mjs:38). Discovery's run is "finished" and all four recordable standard milestones are reached. Draft 2 gives "4 of 8 reached", with Discovery-1, -3, -4 and -6 in class 4. Without the lines, the same records give "4 of 4".
  - **What it contradicts:**
    - the spec's own "nothing that can't be reached is counted as still to do" (S-001:8682-8683);
    - "it reads fewer only where a record says one was not reached, or an own milestone's line isn't marked reached yet" (:8702-8704);
    - the owner's "Even on phases we've fully completed".
  - **Why it's real:** the model tells every project to write these lines (j11-77bfeae/docs/PROJECT.md:69), and committed fixtures already do: ac61/docs/PROJECT.md:118 has "Discovery-1 (standard) · taken on"; ac85/docs/PROJECT.md:10-13 has Launch-1, -2 and -4 taken on.
  - **Also affected:** (d)'s per-run "· <k> tracked" (:8746-8748) counts them as tracked too.
  - **The gap in the test list:** (c)'s cases (:8810-8818) never pair "a finished phase all reached" with taken-on lines.
  - Route: Definer. Place "taken on, with no state the model records" outside T, or define it otherwise, and add the case.

- **R2-B2 (round 1's N7, the Critic's 12, not fixed): the fixture states name sources that can't produce them.**
  - **`service-desk/` has no phases:** S-001:8372-8376 builds `mix` and `text` from `service-desk/`. That is the 2026-10-06 copy (fixtures/README.md:3-9): queue, decisions, dispatch log and status only, with no docs/PROJECT.md and no specs. Its v3 page therefore has no phases.
  - **The audits used other records:** their `mix` and `text` captures are Service-Desk's page and Timeline with phases. F1 and F2 (round 2:291-292) need M3C and a Launch run. The amendment's own examples match j11-77bfeae exactly: Discovery "4 of 4 · 4 tracked · 4 not tracked", and Build "3 of 5 · none tracked (5)". That is the fixture wa-fixtures.mjs's `SD` tests already use.
  - **`text` can't be built at all:** it is "service-desk/ with fixtures/ac62-text-2c1acb6.json's words", but that file is an expected-output snapshot of screen text. tools/ac62-snapshot.mjs:14 writes it, and ac48-62-63-look.test.mjs:249 reads it as the expected value. It holds no records.
  - **What breaks:** the AC91 and AC92 tests "check each part from the fixtures above" (:8553, :8801), and the captures the owner judges are taken on these states.
  - Route: Definer. Name j11-77bfeae for the Service-Desk states, and say what `text` is built from.

**Non-blocking notes (carry as risks)**
- **N-a. The palette list misses one red element, and lists some that aren't red.**
  - **Missing:** Home's since-list entry "Commits on #<n> couldn't be read" draws its ✕ in `--bad` (lib/home.js:308 `icon: 'bad'`; sandbox.js:708; sandbox.css:750). It is neither a listed mark nor a named exception. The catch-all (S-001:8632-8633) makes test (a) pass after G7, but only by turning this failed read's ✕ grey while the other failed reads stay red. Name it.
  - **Listed under "Red words kept … as built" but grey today:**
    - "Can't show this" (sandbox.js:1001) and "Can't show this project/Plan" (sandbox.js:4452, 4472, 4482) are `.v2-small`, `--ink2` (css:557). No `.v2-small.bad` rule exists.
    - The portfolio problem line (sandbox.js:1056) and a card's note (sandbox.js:2764) are `.v2-mark`, ink, with an uncoloured ✕ (css:653). No `.v2-mark .v2-k.bad` rule exists.
    - Say whether these become red or stay as they are.
  - **Self-implication (D-050):** my round-1 B3 wrongly called sandbox.js:1001 red.
  - **Dead rules:** `.v2-why.bad` (css:617) and `.circ.tick` (css:188; `circle()` is never called) draw nothing.
  - **Otherwise complete:** every other `--bad`/`--block`/`--fail`/`--ok`/`--pass` use is covered. That is css:104, 263, 584, 628, 736, 765, 770, 795, 864, 939 and 988, with `--block`, `--fail` and `--pass` mapped at css:526.
- **N-b. AC91 (c) with no "since" time.** The foot line exists only when `rs.since != null` (sandbox.js:872). With cards waiting and no time held, the tile says nothing about the failure, though S-001:8425 says "so the failure is said at the tile's foot". With the corner reading "✕ Can't read" alone, the spec doesn't say whether a "Reason:" line shows. Otherwise (c) matches `tileWaits` (home.js:626-631) and `tileNode` and its catch (sandbox.js:862-872, 936-938).
- **N-c. AC91 (l) on today's times.** `whenText` gives "09:30" for today (timefmt.js:34-39), and ac55-status.test.mjs:37-49 lock "· 09:30". Say whether today's time stays HH:MM. If it doesn't, AC55's cases are rewritten, not "added" as G4's row says (S-001:2580).
- **N-d. The CI line.**
  - **What it builds on:** the line is derivable and adds no read. `reduceWorkflowRuns` and `latestPerWorkflow` (records.js:905-948) hold the latest run per workflow with the activity workflows set aside. G5 must return the counted list, since only the `ci` word is kept today (records.js:941-948; model.js:498-500).
  - **The mismatch:** k counts `success` only, while AC29 reads passing on neutral, skipped, cancelled or stale (records.js:831, 851). "passing · 2 of 3 workflows passed" can therefore appear. Add a skipped or cancelled case to the test list.
- **N-e. "merges not read when none was read" is unclear.** With pipeline-item sprints beside unread pull requests in a phase, it doesn't say whether that means w = s or w = all the pull requests.
- **N-f. Class order, defined but worth the owner's eye:**
  - A standard milestone planned as skipped but recorded reached ("reached · planned as skipped", projectpage.js:228-229) is outside both R and T.
  - "Not needed" in any run outranks "not reached" in another.

**Confirmed fixed (no finding)**
- **B2:** (l) is limited to "Your last action" (sandbox.js:1401) and the member page (`whenOr`, sandbox.js:1422).
- **J9 and AC78 untouched:** the diff only adds notes in AC49 and AC55. J9's text, AC78 and j9-pipeline.test.mjs:68 are unchanged.
- **B4:** no line cap; the briefing holds every line it needs.
- **B5:** the can't-draw tile and the corner when cards wait are both specified (but see N-b).
- **B6:** "the largest text under the title".
- **B1's other parts:**
  - once per phase (own milestones sit in one run each, timeline.js:183-229);
  - reached in any run, a run gone back over included;
  - carried over (`standardWord`, sandbox.js:120-123);
  - not needed (timeline.js:336);
  - k + q + j + e = 8, 6, 5 or 5 (STANDARD_COUNT);
  - s once per id (feed.js:400-410, 480-481);
  - m from the Timeline's own ✓ source (feed.js:483, 496-497);
  - w (feed.js:474-478);
  - distinct letters.
- **The round-1 notes:** N1 to N6 and N8 to N15 are addressed as listed.
- **G10:** still gated on S-034 being frozen, released and synced, with a further draft after that. Nothing in G1 to G9 depends on S-034, and questions 1 (B) and 2 now agree.
- **AC91 (k):** app.js owns the failed-load path (app.js:124-140), so it can draw the ✕ itself. No index.html change.

**Open questions**
1. Should a standard milestone that is taken on, but whose state the model can't record, count in a phase's total? This is for the Definer, or the owner if the rulings don't settle it.
2. Does a time from today keep "09:30" alone in "Your last action" and on a member's page?
3. Should the since-list's failed-read ✕ ("Commits on #n couldn't be read") stay red as a named exception, or turn ink?

Files:
- /home/user/sd-definer/specs/S-001.md
- /home/user/sd-definer/src/lib/timeline.js
- /home/user/sd-definer/src/lib/projectpage.js
- /home/user/sd-definer/src/lib/feed.js
- /home/user/sd-definer/src/lib/records.js
- /home/user/sd-definer/src/lib/home.js
- /home/user/sd-definer/src/public/sandbox.js
- /home/user/sd-definer/src/public/sandbox.css
- /home/user/sd-definer/tests/desk/ac83-page.test.mjs
- /home/user/sd-definer/tests/desk/ac55-status.test.mjs
- /home/user/sd-definer/tests/desk/fixtures/README.md
- /home/user/sd-definer/tests/desk/fixtures/ac61/docs/PROJECT.md
- /home/user/sd-definer/tests/desk/tools/ac62-snapshot.mjs
