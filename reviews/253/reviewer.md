Verdict: PASS

The Reviewer's verdicts on HD1 (PR #253), verbatim: round 1 at 374c7d9 (FAIL), round 2 at 8c372b0 (FAIL), round 3 at 15e8503 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: FAIL

The build looks right everywhere I checked. It fails on one gap in its locked test, which is quick to fix. The "beside" question is a fault in the spec, not the Builder's.

**What I ran**
- `npm --prefix src test`: 1558 tests, 1558 pass, 0 fail.
- `node src/tools/build.mjs`: PASS (2 projects, 39 modules in step).
- `surface_guard.py diff --range 2c20c9a..build/builder/hd1 --branch build/builder/hd1`: OK, 30 commits, every one has the `Agent-Session` and `Spec: S-001` trailers.
- `tests/desk/fixtures/hd1/sandbox-2c20c9a.css` matches `git show 2c20c9a:src/public/sandbox.css` byte for byte.
- `tests/desk/tools/hd1-shots.mjs` (before and after, 360 and 414, light and dark): no FAIL line. The two headings are one line at 360: 146+125 = 271 px and 141+94 = 235 px, each in a 328 px row.

## Blocking findings

**B1. The AC98 test leaves out heading cases HD1's row lists.**
- specs/S-001.md:11831 says the AC98 test "checks every case HD1's row lists". The row (specs/S-001.md:3727) lists "· 18 Oct, 04:00" beside "Mark as seen", and "· 12 of 15 reached" and "· none tracked yet" beside "↑ start at the foot".
- tests/desk/ac98-headers.test.mjs:298-359 only runs "yesterday, HH:MM", "in the last 7 days" and one "N of M reached".
- To reproduce: `grep -n "18 Oct\|none tracked yet\|12 of 15" tests/desk/ac98-headers.test.mjs tests/desk/hd1-fixtures.mjs tests/desk/tools/hd1-shots.mjs` finds nothing.
- Neither form is locked: a time with its date in Plex Mono, and the uncounted words in Plex Sans. In Chromium the behaviour is right for "11 Oct, 10:00" and today's "08:00". "none tracked yet" is checked nowhere.
- Fix: add those cases to `check()`.

## Non-blocking findings (carry into the gate's case as risks)

**N1. The "beside 'Mark as seen' / '↑ start at the foot'" wording (my judgement).**
- The Builder's measurement holds. At 360 px the heading takes 271 or 235 of 328 px, and the control (a button of about 86 px, or a mono note of about 125 px) can't fit beside it.
- The owner's answer A (P-001-headers-wrap.md) only asks that the heading words at 15 px and the time or count at 12 px sit "on one line". The build meets that:
  - at 414 px the control stays beside the heading;
  - at 360 px it moves under the heading, on the right, with no overlap;
  - today's "· 08:00" still fits beside at 360.
- "Beside" was the Definer's own reading (C), and as written it can't be built. It also conflicts with "Nothing else changes: no … place" (specs/S-001.md:11828).
- The approved picture draws the control beside the heading. Image 4 has "↑ start at the foot" wrapped onto two lines beside it; image 1 has "Mark as seen" beside a two-line heading.
- So this isn't a Builder defect. Before HD1 lands, the Definer should amend HD1's row and AC98 at specs/S-001.md:3727 and :11810, and the Design reviewer should judge the under-the-heading look against the picture. src/public/sandbox.css:1499-1500 and the test's assertion at ac98-headers.test.mjs:323 lock the Builder's choice in place.

**N2. A rewrite at ac94-qw1-questions.test.mjs:720 is wider than it needs to be.** It now accepts 15 px for every text in the section, not only the head. The spec's words ("the section's sizes gaining its head's 15 px") allow it, but it no longer catches a card title drawn at 15 px. Allowing 15 px only for the head's title span would close that.

**N3. Some test names no longer match what they check** (the same kind of slip as the plan review's N1):
- ac91-g8d.test.mjs:961 and :1034 still say the strip is "in --t-label --ink2"; it is now 13 px.
- ac91-glance-gates.test.mjs:191 still says "its sheet's title in --t-sheet".
- ac85-sheets.test.mjs:92 still says "its title in --t-sheet".
- ac92-glance-standard.test.mjs:171 still says "in --t-label --ink".

**N4. Some forced cases are not named in HD1's row**, so the PR body must name them (specs/S-001.md:3727):
- ac88-dark.test.mjs:98-101 (`ROLE_PX` gaining 28 and 20).
- The guard's last assertion, ac88-dark.test.mjs:2373-2376.
- One helper line, ac91-g8d.test.mjs:906, which breaks two tests (26 and 29).

**N5. The "one line at 360 px" check runs by hand, not in the suite** (tests/desk/tools/hd1-shots.mjs:150). This follows the suite's no-browser method (ac88-dark.test.mjs:2-3), but the PR has to carry the tool's run. I ran it, and it passes.

## Rewritten locked cases
- I ran each pre-HD1 test file (from 2c20c9a) against HD1's source.
- **Forced:** each one that should fail does fail, every time on HD1's own value:
  - ac81:134/136;
  - ac91-home:142, gates:224, waiting:145/204/287, g8d:906;
  - ac92:195/239;
  - ac94:696/716.
- **Vacuous:** each still passes unchanged, but its message is now untrue: ac80:808 and :813, ac81:336, ac83:559, ac85:114.
- Each new value follows AC98, and none is a weakening apart from N2. ac92:239 now ranks the heads by size instead of weight, as AC92 (d)'s HD1 note says. The ac88 pins (G2, G6, G9, QW1, the strip, VT1) now record HD1's look exactly.
- **Count:** there are 20 forced and 5 vacuous rewrite commits (25 "Rewritten in HD1" markers), one case per commit. Your brief said 23 forced.

## Every role built, kept-small roles unchanged
- The CSS at src/public/sandbox.css:1471-1501 covers every selector in AC98's table, in mockup v2's block.
- The ac98 test meets every role across its tests 1 and 2.
- A Chromium before/after diff of computed looks on 14 screens, light and dark, at 360 and 414:
  - Only the table's roles changed.
  - Counts, mono notes, "Mark as seen", Plan's folder icon and "More detail"'s chevron kept their looks.
  - No kept-small role changed.
  - AC97's figure stays 24 px and the briefing's count 18 px.
- `splitHead` (src/public/sandbox.js:856) leaves the words unchanged inside the one `h2`. Plex Mono goes only on a clock time: "in the last 7 days" and the milestones count stay in Plex Sans.

## Planted bugs (in the scratch copy): 15 of 16 caught
- **Caught:**
  - `.v2-subh` at 13 px;
  - "More detail"'s chevron colour rule dropped (caught only by HD1's ac88 guard);
  - "in the last 7 days" set in mono;
  - the small part in `--ink`;
  - `.v2-kq` at weight 600;
  - `.v2-kd` added to the sub-head rule;
  - " · " dropped from the tail;
  - the row's wrap removed;
  - the title's line height set to 1.15;
  - the goal labels set to `--ink`;
  - the milestones count in mono;
  - a new 600 16 pair;
  - `.v2-hgt` dropped from the section rule;
  - `.v2-tpn` at 13 px;
  - `.v2-bh` in `--ink2`.
- **Not caught:** splitting at the last " · " instead of the first. No heading has two dots, so this changes nothing on any heading.

## Join-up review — Build, 2026-10-29
Parts checked together: the desk's real sandbox.js and CSS, served to Chromium and answered by tests/desk/fake-desk.mjs. Fixtures: `mix` with last looked 20 h, 3 days and 2 h before; md-extremes (five projects, long names); `gates`; VT1's day 5. At 360 and 414, light and dark, the walk covered every screen (Home, since, Waiting and each project's Waiting, Plan, each project's page with its phases opened, info, values, experiments, timeline, notes, pipeline, asked, agents, team) and up to 40 linked sheets: card, milestone, portfolio rows and member pages.

| Path through the product | Result | Fix |
|---|---|---|
| Home → "Since you last looked · <time>" → Mark as seen | Heading on one line for every time form; control beside at 414, under at 360 (beside for "08:00"); no overlap | Spec amendment (N1) |
| A project's page → "Milestones by phase · N of M reached" → phases opened | One line; run heads 13 px over group heads 12 px | — |
| Waiting → section, lanes, strip, empty line → a card's sheet | Sizes as in AC98; no sideways scroll | — |
| Plan, Team, Details, gate and targets sheets, md-extremes' long names | No sideways scroll on the page or a sheet; no header text spills out of its box or off screen | — |

## Questions
1. Where does "23 forced" come from? I count 20 forced commits.
2. Is N1's amendment routed to the Definer, under the stop rule, before the gate?

The tools I wrote are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/tools/ (probe.mjs, probe2.mjs, plant.py). Their outputs are /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/probe.out, /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/probe2.out and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/plants.out. Nothing in /home/user/sd-hd1 was changed.

## Round 2
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

## Round 3
Verdict: PASS

Round 3 (15e8503) fixes B2. My overlap plant now fails both the capture tool and the suite. The suite, the build check and surface_guard all pass, and nothing regressed. 15e8503 is one Builder commit after 8c372b0, touching only tests/desk/ac98-headers.test.mjs and tests/desk/tools/hd1-shots.mjs. Nothing under src changed.

**What I ran** (HEAD 15e8503)
- `npm --prefix src test`: 1558 tests, 1558 pass, 0 fail. That is the same count as round 2, because the new checks sit inside an existing test.
- `node src/tools/build.mjs`: PASS (2 projects, 39 modules in step).
- `surface_guard.py diff --branch build/builder/hd1`: OK over each Builder range:
  - `2c20c9a..374c7d9`: 30 commits;
  - `374c7d9..f90baa6`: 3 commits;
  - `8c372b0..15e8503`: 1 commit.
- Capture tool, unplanted, on a `git archive` copy at 15e8503: exit 0, no FAIL line. Every split heading is one line.
  - At 414 px the control is beside each form.
  - At 360 px it is "under, 4 px below, at the right" for "yesterday, 14:00", "in the last 7 days", "11 Oct, 10:00", "8 of 15", "14 of 18" and "none tracked yet".
  - At 360 px it stays beside "· 08:00".
  - This agrees with my own probe from round 2.

## B2: confirmed fixed
- **The overlap plant** (at 360 px, `.v2-sh.v2-shsplit { position: relative }` with the control `position: absolute; right: 0; top: 0`):
  - The tool fails it: "its control over the heading's text", on every form that doesn't fit.
  - The suite fails it: `ac98-headers.test.mjs` test 3, "since-h, light 360: the row in the flow, nothing moving it" (`'relative'`).
- **The same overlap, on the forms that don't fit only** (by a class set from JS, so "08:00" stays clean): fails the tool and the suite.
- **Other placement plants, all caught by the tool:**
  - the control under the heading at 414 px: "not beside it at 414 px";
  - the control above the heading at 360 px: "neither beside it nor under it at the right";
  - the control under but not at the right (`margin-right: 120px`): caught at both widths;
  - a zero-width `h2` with its text running under the control: "over the heading's text".
- The round-2 plant "control at the left" still fails the suite.

## Non-blocking findings (carry into the gate's case as risks)
- **N5 (carried):** these four layout plants pass the suite and only the tool catches them: under at 414, above, not at the right, and the zero-width `h2`. That is what AC98 allows: "measured by HD1's capture tool too". So the PR must carry the tool's run, /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/hd1/r3-tool.log. I also ran the tool myself, and its output agrees with that log.
- **N8:** the tool checks that an under-placed control's top is at or below the heading, but sets no upper limit on the gap. A control pushed far below would pass. It is 4 px today.
- **N6 (carried):** the test uses "11 Oct, 10:00" and "5 of 15" in place of the row's literal "18 Oct, 04:00" and "12 of 15". They are the same forms.
- **N7 is settled** by your plan to accept the branch on the three Builder ranges, as long as the PR body says so.

## Join-up review (Build, round 3)
Unchanged from round 2, except that the two heading paths are now locked:

| Path through the product | Result | Rating |
|---|---|---|
| Home → "Since you last looked · <time>" → Mark as seen | One line; the control beside at 414, under on the right at 360 (beside for "08:00"), never over the heading's text; locked by the tool and the suite | None |
| A project's page → "Milestones by phase · …" → ↑ start at the foot | The same as Home, locked the same way | None |
| Waiting, Plan, gate and targets sheets | No change since round 1 | None |

## Questions
None.

Nothing in /home/user/sd-hd1 was changed. Files are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad:
- round-3 copy: hd1copy3/;
- plant script: tools/plant4.py;
- suite log: hd1r3-suite.log;
- unplanted tool run: hd1r3-shots.log;
- plant results: plants4-shots.out and plants4-suite.out.
