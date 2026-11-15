Verdict: FAIL

I checked the spec against the plan, both experiment registrations, `decisions/P-005/stop-5.md`, the owner's ruling files, the cited library files and `docs/PROJECT.md:586-631`. The re-pointing work holds up. The failures are in the monitoring criteria and the join-up review.

**What checks out**
- The header `milestones: M6, M7, M8` (spec line 7) names milestones that exist in `docs/projects/P-005.md` lines 72-74, which is the plan of this item.
- Both registrations name `specs/S-012.md` at line 3. E1 line 28 and the `Proxy:` rule in spec lines 82 and 112 agree. E1 says "pull request opened" where AC40 says `created_at`, which is the same thing.
- The three fixes `stop-5.md` asks for (lines 13-15) are in place:
  - The registrations are re-pointed.
  - AC23 and J5 now say a return counts only if a run saw the step gone, and J5's test list includes that case.
  - AC17 names 360 and 414 CSS pixels, and `src/widget/**` is in the areas touched.
- Every owner ruling quote I checked is verbatim: stop-4 answers 1-6, the widths, the M8 reading and the widget folder.
- The library files the spec cites all exist.
- The spec's own check of the `docs/PROJECT.md` lines it cites holds: `:588`, `:593`, `:595`, `:616` and `:631` say what the spec uses them for.
- The V7, V8 and V9 trace tags match plan lines 128-130.

**Blocking findings**
1. **AC41 cannot be checked when a weekly device log is missing.**
   - AC41 (line 85) takes "shown on an open timeline" from the committed device logs.
   - AC26 and AC39 make that commit a weekly manual step by the owner.
   - J9 covers a week with no visible time, which commits an empty file. Nothing says what AC41 does when no file was committed.
   - A missing week would read as "not shown", which counts a step as a miss. Or it would read as "shown", which hides one. The spec has to choose, and its sample-log test list (line 85) has no case for it.
2. **AC41's repeat causes cannot be derived from J5's notice log.**
   - J5 (line 106) writes each notice as `{at, id}`, with no `changed_at`.
   - AC41 lists "sent more than once with no move of its `changed_at`", marked by cause (a) or (b).
   - `changed_at` appears only in the `notified` sets of the `read:true` lines. Cause (a) means no earlier `true` line was found, so AC41 must also read those lines.
   - AC41 says it reads only "the alert route's log of notices sent". Either AC41 or J5 must say which lines are joined.
3. **AC40 says it is stated "in full" (line 75) but is not.**
   - "A pull request that needs the owner" is defined in E1 line 26 as one the card-making code puts on the waiting list, run on the records at the window's end. AC40 line 79 never defines it.
   - "A decision card" has no kinds in AC40. E1 line 20 lists `dor-fail`, `stop` and `failure`.
   - "The commit that adds its answer record" (line 76) has no "first, on the first-parent line", which E1 states.
   - Because AC40's test rests on this spec alone (line 112), the spec as written can pass the test and still differ from the E1 baseline. That breaks J11's claim that "the baseline and V7's later counts agree".
4. **Join-up review: the check rows that need the mockups and the E2 table are still blocking.** See the section below.

**Non-blocking, to fix at the same time**
- AC23 and J5 do not say what happens when two runs overlap, for example a schedule run and a late run. Both would read the same notified set and double-send. AC41 would file that as a cause (a) or (b) repeat, but neither cause describes it.
- AC17 says "44 by 44 points". The cited fact (`F-wcag22-01`, line 4) gives WCAG 2.5.8 as 24 CSS pixels and 44 CSS pixels only at the AAA level (SC 2.5.5). The "points" figure rests on `F-platform-targets-contrast-01` alone. State the unit.
- AC43 shows V7 to V9 figures "beside the desk's others", but it has no join sheet. The spec does not say where the desk gets a figure that AC40 says anyone runs, given that nothing is stored on Cloudflare (AC38). AC44 and AC45 also have no join.
- AC37 and J10 pass vacuously until P-004 adds a copy. The spec says so openly, so I rate it a risk only.
- The deploy addition in J4 changes the card-making code that the sender runs (`docs/PROJECT.md:588`). That may well be one of the three risk-path files (`:616`), and the spec leaves it to the Builder's reading. This is correctly a stop condition, but the owner's approval is likely needed on the M7 pull request, not just possible.

## Join-up review — Design, 2026-11-15
Screens checked: the timeline (no design file exists yet), Home, Project, Team, the Timeline screen and Queue with its response card (listed in `docs/design/README.md`, which is outside this pack, so I could not open them), notifications (J5), and the home-screen widget (J10).

| Check | Result | Fix |
|---|---|---|
| One meaning per colour or status signal | Blocking until the mockups. J2's colours cannot be compared with the existing green and red (`docs/PROJECT.md:115`) because the timeline has no drawing. | Check the first mockup against J2. |
| One navigation | Blocking until the mockups. A notice opens the timeline at its step (AC24), but there is no navigation drawing. | Check the mockup. |
| Consistent type, spacing and codes | Blocking until the mockups. | Check the mockup. |
| No two screens doing the same job | Non-blocking. Both the unreplaced screens and the timeline take J4's list (AC20). The overlap lasts until M10. | Carry the overlap as a risk. |
| Every screen's data available from the records, or listed as a needed change | Blocking until E2. `experiments/P-005-E2-result.md` does not exist. | E2's table (J11, AC46). |

Needed changes to the records: none known until E2.

I could not verify the mockup rows or the E2 row, and they are not closed in this review. The spec reaches the same conclusion in its own lines 119-121.

## Open questions
- Which route, and which outside check, will the owner choose at Design? J5 and J7 are written to hold for any of them, but AC41 cause (a) depends on Actions run logs being the notified-set store.
- Should a step that leaves and returns between two runs with an unchanged `changed_at` stay unsent? The spec lists this at line 198 for the owner and names the alternative.