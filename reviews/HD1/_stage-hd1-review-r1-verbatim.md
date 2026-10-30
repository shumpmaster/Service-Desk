# Stage HD1: the Reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-30 against build/builder/hd1 at 374c7d9 (HD1's work over 2c20c9a).

---

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
