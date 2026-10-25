# M3E stage G7: the Reviewer's round 1 (FAIL, B1), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g7 at 1382866 (G7's work over 93e06a4).

---

Verdict: FAIL

**Summary.** This is G7 of "S-001 after the glance audit": build/builder/g7 at 1382866, reviewed in /home/user/sd-g7 from `git diff 93e06a4 1382866`. I used the worktree's specs/S-001.md (the G7 row at :2592, the build-plan line at :16828, AC92 (a) at :8829-8901 and its test part, AC91 (c) at :8574-8580 and :8780, AC24's note at :10313, and the AC48, AC81, AC82, AC86 and AC88 notes), the three owner rulings and the round-2 mock (changes2.js q1). Of the commits I read only the subjects and trailers.

The product is right. Every mark AC92 (a) lists is green or red in both themes:
- Grey stays on the gone-back-over checks and on every absence.
- The kicked-back card stays vermilion, and gold now means only "next to reach".
- Plan's moved edge is `--line2` with "moved" kept in its accessible text.
- The briefing's can't-read lines carry the ✕.
- The suite passes, and the captures read as the spec says.

There is one blocking defect, in the test rather than the product:
- The new AC88 cascade check ("where --ok and --bad are drawn") says in its title that it covers "every trial-view screen and sheet, from each fixture". It never draws AC88's own portfolio state.
- So the spec's required check that the "ink portfolio lines" stay not red is only half made: a portfolio card's ✕ note is never drawn.
- Plan's ideas are never drawn either, and one absence tick can turn green without any test noticing (shown with a mutant).

## Checks run
- `cd src && npm test`, alone: 1246 pass, 0 fail, exit 0, in 846 s. Log: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/npmtest.txt
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 93e06a4`: 24 PASS and 1 FAIL. The failure is `record_checks merges`, and it names only the orchestrator merge 1382866 ("no Item: trailer"). That is the expected local-only flag.
- `python3 governance/checks/surface_guard.py diff --range 93e06a4..1382866 --branch build/builder/g7`: "OK: 4 commit(s) … checked (1 merge(s) skipped …)".
- `python3 governance/checks/review_check.py pr 999 --base 93e06a4`: R1, requires design-reviewer and reviewer. The only failures are the two "missing verdict" lines. No test-weakening flag.
- Commits:
  - 6c9b904, c2a6eef and 57225b4 are by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.
  - 1382866 is by `orchestrator`.
- The spec is untouched, src/lib and src/public/lib are identical, and `git status` is clean.
- `node tests/desk/tools/glance-shots.mjs <scratch>/shots g7-`: 48 captures, none scrolling sideways. I looked at four:
  - g7-brief-cant-show-360x740-light: the ✕ before "Can't show Alpha"; the tile's finished check green and the gone-back-over checks grey.
  - g7-plan-moved-360x740-light: the moved edge light grey, Reached's three checks green, MD3's gold ring.
  - g7-deploy-mismatch-360x740-dark: the red ✕ with its words in ink, and "CI on main's head: none" with no mark.
  - g7-timeline-sprints-414x896-dark: too tall to read at this scale.
- Probes and mutants: in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/t/ and …/g7-review/mut/. They are described below.

## Blocking findings
**B1. G7's AC88 cascade walk leaves out AC88's portfolio state, so "the ink portfolio lines still not red" is not fully checked, and the test's title overclaims (AC92 (a)'s test part; the task "AC92 (a) in AC88's cascade with its named exceptions").**
- **Where:** tests/desk/ac88-dark.test.mjs, the new test "AC88 + AC92 (a) … where --ok and --bad are drawn — on every trial-view screen and sheet, from each fixture …" (added at :~610-695).
  - Its walk takes text, md-extremes, service-desk + J12, plan, the three failing-read states, "portfolio refused" (`pfFiles({})`) and G7_OPENS.
  - It does not take AC88's own "portfolio" state (:371-382). That state is the healthy portfolio with a queued card and an odd card, which draws:
    - the block's rows and sheets;
    - a card under "Portfolio" with its sheet;
    - Plan's ideas in each state.
- **Reproduction:** probe5.test.mjs (`node --test --test-name-pattern=PROBE5`, from /home/user/sd-g7). It counts what each walk draws:
  - G7's walk: `{"pfs-problem":2,"pf-note":0,"plidea":0}`.
  - AC88's portfolio state: `{"pf-note":1,"plidea":28}`.
- **Why it matters:**
  - The spec names "a card's note at Home's foot" (the portfolio card sheet's `pf-note`, a `.v2-mark` whose ✕ stays uncoloured; sandbox.js:2988) among the lines that "stay as built". G7's check never draws it.
  - Plan's ideas, which the Builder chose not to colour, are never cascaded either.
  - The want-list asserts the grey "Can't show this" line, but asserts no ink portfolio line.
- **A mutant shows the gap:** mutant m3 draws the portfolio block's "nothing queued" absence tick with `smk` (sandbox.js:1060), making it green, which AC92 (a) forbids. These all pass on it:
  - G7's tests: 10 of 10.
  - All four portfolio test files: 61 of 61.
- **The build itself is right:** probe4.test.mjs runs G7's own `okBadCheck` over both portfolio states. It gives no failures on the build, and it catches m3.
- **Route:** Builder. Add AC88's "portfolio" state, and a nothing-queued healthy portfolio (`pfFiles({})` with no fail), to G7's walk. Then add places for the ink portfolio lines (the problem line and `pf-note`) and Plan's ideas to the want-list, asserting each was drawn and is not --ok or --bad.

## What I checked (the planned tasks)
1. **Green ticks on reached marks: Timeline, strip, opened phase, Home tile, Plan's Reached list (new check), carried-over included.** Done.
   - All go through `smk`, which adds `.ok` only to `check` and `.bad` only to `cross` (sandbox.js:682-686).
   - `.v2-s.st-check.ok` (0,3,0) beats `.v2-prow > .v2-s` (0,2,0).
   - Carried over maps to `check` (projectpage.js:414; tested pure).
   - The Reached check is hidden from assistive technology, and its name stays ink.
2. **Green ✓ on sprint marks, a passing CI line and Done.** Done.
   - `.v2-okm` is in --ok at 600; the Done lane is unchanged.
   - The CI ✓/✕ is on Details, the Pipeline view, the v2.5 row and both sheet forms.
   - I probed a failing v2.5 row and the Pipeline line in both themes (probe3): right colours.
3. **Red ✕ on sprint marks and a failing CI line.** Done. `.v2-stats .v2-smk` is in --bad, and the word stays --ink2 (cascade-tested in AC84 and G7).
4. **Red not-reached crosses and the deploy mismatch (AC72).** Done. The deploy mark is `.v2-safe.bad > .v2-safe-l > .v2-k`, with its words in ink.
5. **Gone-back-over and absences grey, kicked-back vermilion, error and can't-read lines red.** Done. Gone-back-over is `pastcheck`, which never takes `.ok`.
6. **Run identity (the G5/G6 lesson).** G7 adds no new keyed state. The gone-back-over colour comes from `ctx.state.get(run)`, keyed by the run object (projectpage.js:407, feed.js:78).
   - probe1 opens `mix`'s and `gates`' Alpha: page, every phase and fold, Timeline, Home tile. Each run's marks follow its own state. Both "Build-i1" runs, and all three "Launch-i1" runs, carry their own crosses and grey checks.
7. **Plan's moved edge in --line2, "moved" kept.** Done. AC24's case pins the rule, and the palette test cascades it in both themes.
8. **The briefing's ✕ before each can't-read line (AC91 (c)).** Done for "Can't read <p> since", "Can't show <p>" and the portfolio line. Where the first line is itself a can't-read line, it keeps its ✕ as built.
9. **AC92 (a) in AC88's cascade, and G7_ONCE exact.** Partly done: the logic is strong, and mutants m1 and m2 are caught (below), but its walk has the gap in B1.
   - m1: "Nothing waiting" drawn with `smk` is caught by both the cascade and the absence case.
   - m2: the mock's blanket `.v2-s.st-check{--ok}` is caught by the cascade and the CI case.
   - G7_ONCE is exact for what the stage-8 walk reaches.
   - The walk leaves out the sprint-opened Timeline. probe2 confirms the Builder's stated reason: the only non-G7 difference there is `span.sb-mkw min-height: (none) → 24px`, which predates G7.
10. **AC48's and AC81's notes.** Done.
    - Names and headings are tested in ink or grey.
    - `--ok` and `--bad` keep their values, and the least distance is 13.3 (light) and 12.2 (dark).
11. **The memory release (57225b4, not G7's).** Sound.
    - Only the module-held `call` closure loses the server (`held.server = null`). `app.server` is kept, so tests reading it are unaffected.
    - A call after restore would now throw instead of answering quietly, which is stricter, not weaker.
    - No assertion changed, and the suite passes.
12. **The locked case outside the row (c2a6eef, AC83's Details CI pin).** Forced by the line's new key and mark, and kept at full strength: it pins the same words, and adds a pin that `ciMark` draws nothing for a missing model.

**The Builder's choices:**
- Opt-in through `smk` rather than a blanket rule: right. The mock's blanket rule would colour absences (m2 proves it).
- The "Status icons" key coloured like the rail: sensible, and it is on the Timeline.
- ✓/✕ before every CI line, sheets included: matches "a CI line that reads passing/failing".
- Leaving a matching deploy's ✓, Team's "just finished" and Plan's ideas uncoloured: matches the letter of the green list.
- The ✓ at 600: from the mock's `.mk-okm`.
- The G1 case extended is the `unread` "cards waiting and the read failing" case (ac91-glance-home.test.mjs:295). It is reasonable, and the palette test covers the other two forms.

## Join-up (the parts working together)
- **Home tile, page strip, opened phase and Timeline:** they agree per run on `text`, `mix` and `gates` (probe1).
- **Details, Pipeline view, v2.5 row and sheets:** every CI line marks passing and failing the same way, and "none" gets no mark on any of them.
- **The ruling's order of precedence:**
  - kicked-back stays vermilion;
  - gold is only on the next-to-reach ring;
  - Plan's moved edge is grey, with its word in its accessible text.
- **Visual join-up:** I checked the four captures listed under "Checks run" against the spec and found no difference.

## Non-blocking notes
1. **G7's sprint ✓/✕ declarations are pinned by no stage-8 exception.** The guard's walk excludes the sprint-opened Timeline. Their declarations are locked instead by AC84's rule case and the palette test's cascade. Acceptable, but it is a hole in the guard's "every change named" promise. The pre-existing `span.sb-mkw min-height 24px` difference (from before G7) is also unexcepted anywhere. Route: Orchestrator or Definer, to decide whether a later stage pins both.
2. **The cascade want-list has no positive entry for several named exceptions:** AC75's warning border, the render-error screen, the failed-load ✕, a failed read's ✕ and `.v2-hgb`. The check would still fail any colour outside a place, so this is coverage, not correctness.
3. **The v2.5 row's failing cross and the Pipeline view's CI mark are untested.** Both are correct by probe3.
4. **Not-reached crosses are red in runs still to come and in runs gone back over.** This happens on Alpha's "Run 3 · planned" Build-1 to Build-3. It follows the letter ("a recorded failure"). Route: the Design reviewer, to confirm it reads well.

## Open questions
- Should the stage-8 guard walk the sprint-opened Timeline, with the pre-G7 `min-height` difference named, so G7's sprint marks are pinned there too?

Files:
- /home/user/sd-g7/tests/desk/ac88-dark.test.mjs (G7's cascade walk; AC88's portfolio state at :371-382)
- /home/user/sd-g7/tests/desk/ac92-glance-palette.test.mjs
- /home/user/sd-g7/src/public/sandbox.js (`smk`, `ciMark`, `ciCircle`; `pfLine` :1060; `pf-note` :2988)
- /home/user/sd-g7/src/public/sandbox.css
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/t/probe1.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/t/probe2-ac88copy.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/t/probe3.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/t/probe4.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/t/probe5.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/mut/ (m1, m2 and m3, with their logs)
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/shots/
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/npmtest.txt
