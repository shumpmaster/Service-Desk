# M3D stage 3 (S-001 after MD3): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/builder/m3d-3 at 7f01fd5.

---

Verdict: PASS

Stage 3 of the after-MD3 plan (M3D), commit 7f01fd5 on a57ad0e, reviewed over a57ad0e..7f01fd5. There are no blocking findings. A "not yet" reason that two or more rows share is now said once per group, on Plan, the Timeline and Home, with the right counts. No reason is lost, each row that has its own reason keeps it, and every milestone's sheet still says everything. The Team screen is untouched, and Plan's ⇅ ordering view is unchanged. Two of my mutations were missed by the tests; they are in the notes.

## Blocking findings
None.

## What I checked
1. **Plan.**
   - `groupOnce` (workahead.js) puts a reason that two or more of a group's rows share at the group's head, and those rows drop it. A reason only one row has stays on that row.
   - The counts are right. `n` is the group's milestones, with the gate row left out, and `k` is the rows the reason covers.
   - The head's words: "<n> milestones · no estimates yet", "<k> of <n> milestones · …", "<n> milestones · estimate not available" and "<k> rough finishes not available: <reason>".
   - Each milestone's sheet (`planSheet`) still shows its estimate and rough finish in full.
   - The ⇅ ordering view still calls `planRow(v, r, true)` with no `once`, so it is unchanged.
2. **The Timeline.**
   - The line under each band reads "Why not recorded yet for <k> of <n> milestones · for the agents to add".
   - It is in the agents' grey (`gap`), still says who fills the gap, and counts the planned rows too.
   - Milestones it covers show no why line. A lone milestone with no why keeps its own line (Launch's M3C).
3. **Home.**
   - A group's head reads "<n> projects · why their run went back: not recorded", or "<k> of <n> projects · …" when it covers only some of the tiles.
   - Each tile keeps only its own "went back on <date>".
4. **The Team part is untouched.** No Team code is in the diff. AC90's test file says its Team part is stage 4's.
5. **The rewritten cases** each match their cited lines:
   - AC24 (:398-404) and J14 (:230-240), the failed estimate read;
   - AC59's AC61 case and AC84 (the why said once, with M3C keeping its own);
   - AC82 (:253-256, :307-313);
   - AC86 (:168-197, :350-362);
   - J15 (:357).
   - **J14** keeps its two assertions, each exact (one gap, `['6 milestones · estimate not available']`). That is honest, not padded.
   - **J15**'s regex gains one alternative, "no estimates yet", so it still matches once rows stop saying "Estimate". It was already loose.
   - **Two AC86 assertions** now match `^\d+` in place of a count. Other cases hold the counts exactly (mutations P2 and P3 below).
6. **The guard exception (ac88-dark.test.mjs:395-405, :485-488) is exactly this change.** It lets through `div.v2-plonce` inside `.v2-plgrp`, with its 3 declarations, and `p.v2-msd.gap.v2-tonce` inside `.v2-tblk`, with its 1. It requires each of them to occur, and that nothing else is let through.
7. **Mutations.** Of 18 tried, 15 were caught, one doesn't change behaviour, and two were missed.
   - Caught:
     - a lone reason moved to the head (estimate or rough finish);
     - the estimate count taken from the group size;
     - the rough finish count off by one;
     - rows keeping a reason the head says;
     - a lone missing why folded;
     - the Timeline count leaving out planned rows;
     - milestones keeping their own why;
     - the head line losing "for the agents to add";
     - a tile losing its own date;
     - "<k> of <n> projects" said as "<k> projects";
     - guard: Plan's box with another gap, the Timeline line with another padding, the group restyled, the box's rule spread to every small line.
   - G5 (a colour on the Timeline line) doesn't change behaviour: `.v2 .gap` outranks `.v2-tonce`, so the colour never shows.
   - Missed: P5 and H1, in notes 1 and 2.

## Commands run
- Full suite: 1087 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . a57ad0e`: "OK: all governance checks passed."
- `surface_guard.py diff --range a57ad0e..7f01fd5 --branch build/builder/m3d-3`: "OK: 1 commit(s) … checked".
- `review_check.py pr 999 --base a57ad0e`: risk class R1; needs design-reviewer and reviewer. Its only violations are the two missing verdict files, with no test-weakening flag.
- 7f01fd5 is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **No test holds the ⇅ ordering view unchanged** (P5 missed). If the ordering view also folded reasons, no test would fail. It is correct today.
2. **No test has a lone tile with a missing why** (H1 missed). If a group with only one such tile moved its reason to the head, no test would fail. AC90 says a reason only one row has stays on that row.
3. **Two word choices for Define to confirm:**
   - **Plan's partial case** reads "<k> of <n> milestones · no estimate yet", singular, where the full case reads "no estimates yet". AC90's rule says the reason is said word for word, though its test line does mention "its singular".
   - **Home** uses "<k> of <n> projects" when the reason covers only some tiles. AC90's "Where" gives only "<k> projects"; the Builder applied the general rule.
4. **Who fills a gap.** Plan's head lines and Home's line name no one who fills the gap, but the rows they replace named no one either, so nothing is lost. Only the Timeline line names the agents.

## Open questions
1. For Define: should Plan's partial line read "no estimate yet" or "no estimates yet"? And should Home's partial line read "<k> of <n> projects" or "<k> projects"?

The worktree and copies are removed. One other entry remains in the scratchpad, m3d3, which I didn't make; I left it alone. Disk is at 7.2 GB free. My mutation script is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/mutate10.py.