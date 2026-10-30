# Stage HD1: the Reviewer's round 3 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-30 against build/builder/hd1 at 15e8503 (HD1 round 3).

---

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
