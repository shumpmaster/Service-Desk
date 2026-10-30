# Stage HD1: the Reviewer's round 2 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-30 against build/builder/hd1 at 8c372b0 (HD1 round 2, with draft 3 merged).

---

Verdict: FAIL

The fixes you sent me to check are all done. B1 is fixed, N2 and N3 are fixed, and the build matches draft 3. HD1 still fails on one gap, and it is in a test, not in the build. Draft 3 added the words "never overlapping it" to HD1's row, along with the narrow-phone placement. Neither the suite nor the capture tool checks those, except for the one "· 08:00" case. That is the same kind of gap as B1. It isn't the Builder's slip: draft 3 (62b4559) landed at 00:12, four minutes before the Builder's B1 commit (780caab, 00:16), and on another branch. It is quick to fix.

**What I ran** (HEAD 8c372b0)
- `npm --prefix src test`: 1558 tests, 1558 pass, 0 fail.
- `node src/tools/build.mjs`: PASS (2 projects, 39 modules in step).
- `surface_guard.py diff --branch build/builder/hd1`:
  - `--range 2c20c9a..374c7d9`: OK, 30 commits.
  - `--range 374c7d9..f90baa6`: OK, 3 commits.
- Nothing under src changed after 374c7d9 (`git diff --stat 374c7d9 8c372b0 -- src` is empty), so round 1's checks of the build still hold.
- `tests/desk/tools/hd1-shots.mjs` on a `git archive` copy: no FAIL line. Every split heading is one line at 360 and 414 px. "· 08:00" has its control beside it at 360 px.
- My own probe, in Chromium, light and dark, on the real build:
  - at 414 px the control sits beside every heading form;
  - at 360 px it sits 4 px under the heading, flush right (0 px gap), and never overlaps it;
  - "· 08:00" keeps its control beside it at 360 px.
- So the build itself matches AC98 draft 3 and HD1's row.

## Blocking findings

**B2. The narrow-phone placement and "never overlapping it" are not checked by any test.**
- **What the spec asks:**
  - HD1's row (specs/S-001.md:3730), "Tests to lock", asks for "the control … beside the heading at 414 px, and at 360 px beside it where it fits ("· 08:00") and otherwise on its own line just below the heading, at the right, never overlapping it".
  - AC98 (specs/S-001.md:11852-11855) says that where the control sits "is measured by HD1's capture tool too".
- **What actually checks it:**
  - The capture tool asserts placement only for `/^Since you last looked · \d\d:\d\d$/` (tests/desk/tools/hd1-shots.mjs:161-162).
  - For every other form the tool measures `beside` but never checks it. It doesn't even print it at 414 px (:167).
  - The suite (tests/desk/ac98-headers.test.mjs:323) only checks the declarations `flex-wrap: wrap` and `margin-left: auto`.
- **To reproduce:** in a copy, add this to src/public/sandbox.css:
  `@media (max-width: 380px) { .v2-sh.v2-shsplit { position: relative; } .v2-sh.v2-shsplit > :last-child:not(:first-child) { position: absolute; right: 0; top: 0; } }`
  - "Mark as seen" and "↑ start at the foot" then sit on top of the heading's words at 360 px.
  - `ac98-headers` passes 4 of 4, and `hd1-shots.mjs … hd1-home` prints no FAIL.
- **Fix:** in the tool, for every `Since you last looked · ` and `Milestones by phase · ` heading:
  - at 414 px, require the control beside the heading;
  - at 360 px, where the heading doesn't fit with its control, require the control's top at or below the `h2`'s bottom and its right edge on the row's right edge;
  - at both widths, require no overlap between the control's box and the `h2`'s text boxes.

## Non-blocking findings (carry into the gate's case as risks)

**N6. Some test cases stand in for the row's exact strings.** The row lists "· 18 Oct, 04:00" and "· 12 of 15 reached". The test uses "· 11 Oct, 10:00" and "· 5 of 15 reached". These are the same forms, so I count them as covered. If the Definer meant the literal strings, the row should say so.

**N7. The guard fails over the whole branch.** `surface_guard.py diff --range 2c20c9a..8c372b0 --branch build/builder/hd1` FAILs with 4 violations: e95741d (orchestrator), e10c09b and 901366f (chief-of-staff), and 62b4559 (definer). The 8c372b0 merge brought them in. CLAUDE.md's accept command (`<base>..build/builder/hd1`) will therefore FAIL when the branch is landed. Use the two Builder ranges above, and say so in the PR body.

**N5 (from round 1) still applies:** the PR must carry the capture tool's run.

**A commit hash in the brief:** "f090baa6" doesn't exist. The commit is f90baa6.

## B1, N2 and N3: confirmed fixed
**B1.** ac98-headers.test.mjs:349-387 now runs every form the row lists: "yesterday, HH:MM", "in the last 7 days", a date with a time, today's time alone, two counts, and "none tracked yet". `noneTrackedState` is labelled NOT real in tests/desk/fixtures/README.md. I planted 10 bugs in the copy, and each one fails the AC98 test on the case it targets:
- date in Sans;
- the date outside the Mono span (fails "its date in the Mono part");
- today's time in Sans;
- "none tracked yet" in Mono;
- "none tracked yet" not split;
- the second count in Mono;
- the second count not split;
- today's time not split;
- the dated time not split;
- the control set at the left.

**N2.** ac94-qw1-questions.test.mjs:721-722 now allows 15 px only for the head's title.
- A card title at 15 px fails (the title assertion at :706).
- `.v2-qcard * { font-size: 15px }` fails on the narrowed check itself ("Place 2 of 6 waiting on you in" at 15px). Round 1's wider version let that through.
- One plant, `.v2-opt` at 15 px, changed nothing on screen, because the option words have their own font rules.

**N3.** All five test names now match what they check, and no assertion changed.

**N4.** The row now names the missed forced cases.

## Join-up review (Build, 2026-10-30)
The parts checked together: the desk's real sandbox.js and CSS, served to Chromium and answered by tests/desk/fake-desk.mjs. Fixtures: `mix` (last looked 20 h, 9 days, 3 days and 2 h before), `noneTrackedState`, and VT1's day 5. Widths 360 and 414 px, light and dark.

| Path through the product | Result | Rating |
|---|---|---|
| Home → "Since you last looked · <time>" (each form) → Mark as seen | One line. Control beside at 414; at 360 under the heading on the right, 4 px below, no overlap; beside for "08:00" | Build correct; lock gap (B2), blocking |
| A project's page → "Milestones by phase · 8 of 15 reached" / "· none tracked yet" → ↑ start at the foot | One line. Control beside at 414, under on the right at 360, no overlap | Build correct; lock gap (B2), blocking |
| Waiting, Plan, gate and targets sheets | Unchanged since round 1. No sideways scroll; the tool passes | None |

## Questions
1. Should the Builder fix B2 in round 3, the last round in HD1's budget?
2. N7: will the Orchestrator accept the branch on the Builder's ranges, rather than `2c20c9a..build/builder/hd1`?

Nothing in /home/user/sd-hd1 was changed. Files are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad:
- plant scripts: tools/plant3.py and tools/plant3msg.py;
- suite log: hd1r2-suite.log;
- tool runs: hd1r2-shots.log, and hd1probe2.log from my probe copy hd1probe2/;
- plant results: plants3-b1.out, plants3-n2.out, plants3-layout.out and plants3-layout-suite.out.
