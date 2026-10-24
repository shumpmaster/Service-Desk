# M3E stage G2: the Reviewer's confirmation (round 2), verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/g2-waiting at 6d776f2 (fix commits 3e20c1e and 6d776f2, on 6a5b992) (base e808650).

---

Verdict: PASS

Round 2 of G2: I reviewed the two fix commits on build/builder/g2-waiting, 3e20c1e and 6d776f2, judged from `git diff 6a5b992 6d776f2` in /home/user/sd-g2. Both commits are by `builder <builder@agents.invalid>` with `Agent-Session` and `Spec: S-001` trailers, and I read only their subject lines.

Both fixes are made as the spec says, nothing outside them changed, no locked test was weakened, and the guard's exception is still exact. There are no findings.

**N1 (a redraw while carrying a card) and N2 (lifting from a scrolled row):**
- The drag now keeps its move as `dx`/`dy`, and one function, `place()`, sets the card's position.
- After every redraw, `keepDrag()` runs (sandbox.js, in the render just after `morphChildren`) and puts back `lifted`, `carrying` and the card's position.
- When a card is lifted from a scrolled row, `lift()` now calls `place()` at once, so the card makes up the row's lost scroll before the finger moves.
- The new AC91 case checks the card at `translate(-288px, 0px)` right after the hold, a redraw by hand and a poll's redraw while carrying, and a landing in Done. It also checks that a redraw after the drag puts nothing back.
- **Checked in real Chromium:** I used touch events on a row scrolled 208 px.
  - Right after the hold, before any move, the card was under the finger (left edge 14 px, finger at 34 px) with `translate(-208px, 0px)`.
  - After a further 61 s on the page clock with the card still held, the card was still `lifted`, its row still `carrying`, and it hadn't moved.
  - Let go outside Done, it stayed in the strip, and the row was no longer `carrying`.
  - The page never scrolled sideways.
- This also fixes the same redraw problem for drags from the lanes.

**The leftover:** `void MIX_PROJECT2;` and its import are gone from glance-shots.mjs.

**The amended AC91 (f) (6d776f2), against HEAD:specs/S-001.md:8534 ff:**
- `stripEmptyParts` puts " · " and "none" in `.v2-kn` (`--t-mono`). The words that are not a count go in a new `.v2-kw` with no rule of its own, so it takes the line's `--t-label` `--ink2`:
  - " when last read" follows " · none";
  - "not read yet" and "can't read" follow " · " alone.
- The line's text is unchanged, so every locked case that reads it exactly (AC80, AC89 (a), AC81) still holds as it is.
- The new case checks each part's text, role and colour in both themes in four states: read, before the first read, nothing readable, and AC89 (a)'s state 5.
- The amended G2 row (:2587) names every rewritten case I listed in round 1.

**The guard exception:** G2_ONCE adds `span.v2-kw` only inside `p.v2-kq`, pinned to the same declarations as "Kicked back". The set-equality assertions (G2, and the leftover check with `G[12]`) are unchanged and pass, so the new pin is used and nothing else is excused.

**The one-inline-style rule (AC50 + AC41):** the new case asserts `Object.keys(c.style)` is `['transform']` while carrying, and in Chromium the carried card's style attribute held only `transform`.

**Nothing else changed:** only src/lib/board.js with its public copy (still identical), sandbox.css (a comment only), sandbox.js (the drag code, the strip's line and one `keepDrag()` call in the render), ac88-dark, ac91-glance-waiting and glance-shots. No locked test lost an assertion.

**Commands run:**
- `cd src && npm test`: exit 0. I sent the output to /dev/null, so I have no total; ac91 and ac80 run alone: 42 pass, 0 fail.
- `node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `check_all.sh . e808650`: "OK: all governance checks passed."
- `surface_guard.py diff --range e808650..6d776f2 --branch build/builder/g2-waiting`: "OK: 4 commit(s) … checked".
- `review_check.py pr 999 --base e808650`: R1. It fails only on the two missing verdicts (the design reviewer's and mine), with no test-weakening flag.

I changed no tracked file, and the worktree is clean. My scratch scripts and captures are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g2-review/.
