# M3E stage G7: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g7 at 286ebae (fix commit 286ebae, on 1382866) (G7's work over 93e06a4).

---

Verdict: PASS

**Summary.** G7 is done and the round-1 blocker (B1) is fixed. This covers round 1 (build/builder/g7 at 1382866, judged from `git diff 93e06a4 1382866`) and round 2 (the fix 286ebae, judged from `git diff 1382866 286ebae`). I read only the commits' subjects and trailers.

- **The product is right, as in round 1:**
  - Every mark AC92 (a) lists is green or red in both themes.
  - Gone-back-over checks and absences stay grey, and the kicked-back card stays vermilion.
  - Gold means only "next to reach", and Plan's moved edge is `--line2` with "moved" kept in its accessible text.
  - The briefing's can't-read lines carry the ✕.
- **B1 is fixed.** The cascade check now walks AC88's portfolio states and Plan's ideas. A green "nothing queued" tick (mutant m3), which got through in round 1, now fails it.
- **The fix touches tests only, and weakens nothing.**

## Checks run (round 2, at 286ebae)
- `cd src && npm test`, alone: 1246 pass, 0 fail, exit 0, in 1040 s. Log: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/r2/npmtest.txt. Round 1 was also 1246/0, in 846 s.
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 93e06a4`: 24 PASS and 1 FAIL. The failure is `record_checks merges`, and it names only the orchestrator merge 1382866 ("no Item: trailer"). That is the expected local-only flag.
- `python3 governance/checks/surface_guard.py diff --range 93e06a4..286ebae --branch build/builder/g7`: "OK: 5 commit(s) … checked (1 merge(s) skipped …)".
- `python3 governance/checks/review_check.py pr 999 --base 93e06a4`: R1, requires design-reviewer and reviewer. The only failures are the two "missing verdict" lines. No test-weakening flag.
- 286ebae is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.
- `git diff 1382866 286ebae -- src/` is empty, so no product code changed.
- `git status` is clean, and the spec is untouched.
- **G7_ONCE is still exact.** The fix doesn't touch G7_LOOK, G7_KEY, G7_ONCE or the stage-8 walk, and the stage-8 test passes in the full suite.
- **Captures (round 1):** 48 from `glance-shots.mjs … g7-`. None scrolls sideways, and the four I looked at read as the spec says.

## B1 (round 1): fixed
**What it was.** G7's cascade check ("where --ok and --bad are drawn") never drew AC88's own portfolio state. So a portfolio card's ✕ note, Plan's ideas and the "nothing queued" absence tick went unchecked. Mutant m3 (that tick drawn green) passed every G7 test and all 61 portfolio tests.

**What the fix adds** (tests/desk/ac88-dark.test.mjs):
- The walk now takes AC88's "portfolio" state (a queued card and an odd card), a healthy portfolio with nothing queued, and the refused portfolio as before.
- A new `okBadInk` gives places to:
  - the portfolio's problem line (`pfs-problem`);
  - a portfolio card's note (`pf-note`);
  - the block's "nothing queued" tick and its other marks;
  - Plan's idea rows.
- Each of those fails if anything inside it is --ok or --bad.
- All five are in the want-list, so each must actually be drawn.
- It also adds a made-up phone with notifications refused, so AC75's warning (its border the one red border) and the group head's can't-read count are reached and asserted.
- The title now says what the walk covers.

**Mutants rerun against 286ebae** (copies in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/mut/r2m3, r2m4, r2m5, with logs):

| Mutant | What it changes | Result |
|---|---|---|
| m3 | The "nothing queued" tick drawn green (sandbox.js:1060) | Now fails the cascade: `portfolio, nothing queued … ink: the portfolio block's "nothing queued" tick … in --ok or --bad` |
| m4 (new) | The card note's ✕ given the CI ✕'s red class `v2-cim bad` (sandbox.js:2988) | Fails: `ink: a portfolio card's note: svg.v2-k.v2-cim.bad … in --ok or --bad`. The general check alone would have accepted this as a placed CI mark, so the new ink check is what catches it. |
| m5 (new) | Plan's idea marks drawn coloured (sandbox.js:3831) | Fails: `ink: Plan's ideas: svg.v2-s.st-cross.bad …` |

I didn't rerun probe5, because it builds its own walk. Its question (are the note and the ideas drawn?) is now asserted inside the test itself, through the want-list, and the test passes on the build.

**Nothing weakened:**
- The old "portfolio refused" walk is kept, now inside the loop.
- Every earlier want-list entry is kept, with five ink places and two exception places added.
- The palette test's additions only add assertions:
  - a v2.5 page's CI row reading failing (red cross, its shape) and passing;
  - the Pipeline view's CI line, a ✓ or ✕ before its words, in both themes.
- The made-up states (notifications refused; a portfolio with nothing queued) are labelled NOT real in tests/desk/fixtures/README.md.

## The planned tasks (rounds 1 and 2)
All done:
1. Green ticks on reached marks: Timeline, page strip, opened phase, Home tile, and Plan's Reached list (a new check), carried-over included.
2. Green ✓ on sprint marks, a passing CI line and the Done lane.
3. Red ✕ on sprint marks and on a failing CI line, sheets included.
4. Red not-reached crosses, and the deploy mismatch mark (AC72).
5. Gone-back-over marks and absences grey; kicked-back vermilion; error and can't-read lines red.
6. Plan's moved edge in `--line2`, with "moved" kept in its accessible text.
7. The ✕ before each of the briefing's can't-read lines.
8. AC92 (a) in AC88's cascade, with its named exceptions; G7_ONCE exact. The stage-8 walk leaves out the sprint-opened Timeline. Probe2 confirms the only non-G7 difference there is the pre-G7 `sb-mkw min-height 24px`.
9. AC48's and AC81's notes: names stay neutral; token values and distances are unchanged (13.3 light, 12.2 dark).
10. The memory release (57225b4): sound, and it weakens no test.

Run identity, checked as the G5/G6 lesson asked: G7 adds no keyed state. Colours follow each run object (probe1, on `mix`'s and `gates`' Alpha, where runs share a key).

The Builder's choices hold:
- colour opt-in through `smk`, not a blanket rule (the mock's blanket rule is caught by the cascade check);
- the "Status icons" key coloured like the rail;
- a ✓ or ✕ before every CI line, sheets included;
- no colour on a matching deploy's ✓, Team's "just finished" or Plan's ideas;
- the ✓ at weight 600, from the mock;
- G1's `unread` case extended for the briefing's ✕.

## Join-up
- The tile, strip, opened phase and Timeline agree run by run.
- Every CI line (Details, Pipeline view, v2.5 row, sheets) marks passing and failing the same way, with no mark for "none".
- The portfolio and Plan's ideas stay ink, now checked by the cascade (round 2).

## Non-blocking notes (carried)
1. **G7's sprint ✓/✕ declarations are pinned by no stage-8 exception.** The guard's walk excludes the sprint-opened Timeline; AC84's rule case and the palette test lock them instead. The pre-G7 `span.sb-mkw min-height 24px` difference is also unexcepted. Route: Orchestrator or Definer.
2. **Not-reached crosses are red in runs still to come and in runs gone back over** (Alpha's "Run 3 · planned"). This follows the letter of AC92 (a). Route: the Design reviewer, to confirm it reads well.
3. **The suite now takes about 17 minutes alone.** The 25-minute limit still holds it.

## Open questions
- Should a later stage walk the sprint-opened Timeline in the stage-8 guard, with the pre-G7 `min-height` difference named?

Files:
- /home/user/sd-g7/tests/desk/ac88-dark.test.mjs (`okBadInk`; the G7 cascade walk)
- /home/user/sd-g7/tests/desk/ac92-glance-palette.test.mjs
- /home/user/sd-g7/tests/desk/fixtures/README.md
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/mut/r2m3.log
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/mut/r2m4.log
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/mut/r2m5.log
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/r2/npmtest.txt
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/t/ (round-1 probes 1 to 5)
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-review/shots/
