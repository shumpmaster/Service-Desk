# M3G stage QW3: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/builder/qw3 at 2572838 (QW3's work over a0437b8).

---

Verdict: PASS

**What this means for you.** Round 2 fixes the one blocking problem from round 1, and the four smaller gaps I raised are now covered by tests. Every bug I planted is now caught, including the five that got through last round. The full suite passes. Both rewritten older tests really had to change, and neither checks less than before. At 12 px the long "Waits on a question being asked in your session" line now fits in two lines on a 360 px phone. So the point that was going to the owner no longer comes up.

I reviewed build/builder/qw3 at **2572838** (round 1 was at 226bc81). The three scratch worktrees I used have been removed.

## Blocking
None.

## Non-blocking
- **N1 (carried).** Every commit's committer field reads "Claude <noreply@anthropic.com>". The environment sets this, and 421 commits already on main show it. The author identities are correct, and all 8 new Builder commits and f329f94 carry `Agent-Session:` and `Spec: S-001`. No commit has a co-author line or a model name.
- **N2 (carried).** surface_guard over the whole range from the base flags the Definer's commits. They came in through the Orchestrator's merges (ffcc1a6, cac9bb3), the route QW1 and QW2 took. Over the Builder's round-2 commits (cac9bb3..tip) it reports OK, 8 commits.
- **N3.** On the heap, the Builder's summary says 1194 MB. I measured 1214.6 MB used at peak (1263.3 MB committed) out of 2096 MB, using `--trace-gc` as in round 1. That matches the 1215.1 MB in the Builder's own 1586c92 message. It leaves about 880 MB to spare, so the file doesn't need splitting.

## What I checked
- **Full suite.** 1447 of 1447 pass at 2572838.
- **Survivors re-planted.** All five are now caught:
  - R1: the section card's "Waits on" line removed.
  - R2: the gate card's "Waits on" line removed.
  - R3: the focus target never cleared (the case at ac96 test 21 taps, blurs, then taps the notification).
  - R19: blocker ties sorted by raised time only (test 13).
  - R23: the "Cards waiting on it" list shown on v3 questions only (test 22).
- **New plants on the round-2 changes.** All 10 are caught:
  - R31: the entry's code not in mono.
  - R32: the row title's clip class dropped.
  - R33: the title cut at 4 lines instead of 3.
  - R34: the held line given `.v2-body` again.
  - R35 and R36: either line set back to `--t-body`.
  - R37: the held line in `--ink2`.
  - R38: an extra declaration on `.v2-heldl`.
  - R39: the screen reader's " · " dropped.
  - R40: the place and kind no longer a block of their own.
- **The two forced rewrites.**
  - 6fe62d9 (ac94-qw1-questions.test.mjs:387-395): with its old version put back at the tip, exactly test 10 fails. The new version checks more than the old one: the line's class, that it sits right under the title, and that no `.v2-body` carries the words.
  - 1586c92 (ac88-dark.test.mjs, QW1 walk, around :2223-2229): with its old version put back, the walk fails on exactly the `span.v2-heldl` exceptions. The rewrite allows only that one new exception and requires it to match `QW3_ONCE`'s own entries.
- **`QW3_ONCE` is exact with the new rules.** It pins `.v2-afirst` and `.v2-waits` at 12px/1.4, the row's three parts (`.v2-wlk`, `.sb-vh`, `.v2-tt`) and `.v2-heldl`. The "met exactly" check holds, and an extra declaration fails it (R38).
- **The size correction matches the spec.** Settled point 3 as corrected, AC95 and the design review's N1 to N3:
  - `.v2-afirst`, `.v2-waits` and `.v2-heldl` use `--t-small` `--ink` (sandbox.css, the hunk after :628).
  - The sheet list stays `--t-small`.
  - An uncounted entry's code is `.v2-mono`, and its words are `.v2-small`, which is `--t-small` `--ink2` (sandbox.css:553-554).
  - A row's title is cut at three lines with the fade (`.v2-wlist .v2-tt`, sandbox.css:652).
- **Round 1's B1 and N1 are fixed.** The fixtures now include a section question that waits on another and a held-up gate card. The ac88 walk requires a "Waits on" line on a section card, a gate card, a strip card and a lane card. The two test titles now match what the tests check.
- **Captures.** I reran the `qw3-` Chromium captures: all 16 pass at 360 and 414 px, light and dark, and the run exits 0. Each shows at most 2 lines per "Waits on" line, boxes at least 24.8 px and links at least 25 px tall. None scrolls sideways.
- **The desk still writes nothing.** The round-2 changes to src add no fetch, storage or write call.

## Open questions
None.

Files are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/:
- the full-suite log: rv2-qw3-full.log
- the heap log: rv2-heap.log
- the forced-rewrite runs: rv2-forced94.log and rv2-forced88.log
- the mutants and their runner: rv-qw3-tools/mutants.py and rv-qw3-tools/run.py
- the captures and their log: rv2-shots/ and rv2-shots.log
