# M3G stage QW2: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/builder/qw2 at 2b1d664 (QW2's work over 2516b26).

---

Verdict: PASS

QW2 round 2, checked read-only against build/builder/qw2 at 2b1d664 (/home/user/sd-qw2). I ran everything in scratch worktrees under the scratchpad and removed them afterwards. The working tree is clean.

**Blocking findings**
None.

**What I checked, with evidence**
- **Full suite:** at 2b1d664 it passes 1421 of 1421, with 0 failing, in 239 s. The log is /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rvqw2/full2.log.
- **Scope of the round:** 2b1d664 changes only tests/desk/ac95-qw2-places.test.mjs. Nothing under src changed between 8e530a5 and 2b1d664.
- **Identity and trailers:** 2b1d664 is by `builder <builder@agents.invalid>` with `Agent-Session:` and `Spec: S-001`. 928f07e is by `definer`, merged by `orchestrator` in a21c7b7. surface_guard over a21c7b7..2b1d664 is OK (1 commit).
- **Re-planted bugs:** I planted six bugs and ran tests/desk/ac95-qw2-places.test.mjs. Each new case catches the plants aimed at it:

| Plant | Where | N2 case | N5 case |
|---|---|---|---|
| P1: hold nothing | board.js | fails | passes |
| P2: hold the board before the sheet finds its item | board.js | fails | passes |
| P3: no place over Plan | `places` = empty Map at sandbox.js:5102 | passes | fails |
| P4: hold released once a project is read | `heldView` | fails | passes |
| P5: hold only once every project is read | `found` at sandbox.js:5059 | fails | passes |
| P6: a wrong place over Plan | k+1 at sandbox.js:5102 | passes | fails |

- **The N2 case** (ac95-qw2-places.test.mjs:489-521) locks what it claims:
  - The other projects' and the portfolio's first reads are held. It uses the fake desk's existing `hold` at fake-desk.mjs:140 and :328; no fixture change.
  - The board holds through two polls once the reads come in: the same cards and places, and the five "Still reading…" lines kept.
  - The sheet keeps " · 3 of 12 waiting", while the badge moves from 12 to 33.
  - Once closed, the other projects' places show, 33 in all.
- **The N5 case** (ac95-qw2-places.test.mjs:523-556) locks what it claims:
  - Each of two made-up Launch-gate sheets opened over Plan ends its small line with the exact place the board gives that card.
  - Plan's rows are unchanged under each sheet, and Plan shows no place line.
  - "Plan's order as before" also holds by construction: `renderWorkAhead(built, …)` takes no board view, and QW2 does not touch it.
- **The spec now matches the build** (928f07e, merged in a21c7b7):
  - The "When the order changes" passage and settled point 3 say the held board is the one drawn once the sheet is open on its item. It is held whole: "Still reading <project>…" stays and unread projects' cards stay out until the sheet closes, with the badge live. That is what `heldBoard` (src/lib/board.js:1045) and sandbox.js:5058-5061 do, and what the N2 case locks.
  - The corrected N3 wording now matches what I measured in round 1:
    - Settled point 1 and QW2's row now call the AC91 (f) strip-order case "named, not forced" (its base version passes on the new source).
    - They now call "the strip opens by itself" forced (40f7740).
  - QW2's row and settled point 1 now name the seven b0cb865 rewrites by file. The Criteria column adds AC16, AC77, AC79 and AC94 as changed. AC95's test list and QW2's row name the N1/N2 and N5 cases.

**Non-blocking findings**
- **N1:** settled point 5 still reads "**The build must change:** the build adds nothing to a held question's sheet line" (specs/S-001.md, AC95's "Settled from QW2's build", 5). Point 3 now says its change was made ("e1f73f7 and `heldBoard` do so"), but point 5 does not. The change is built (src/public/sandbox.js:3156-3160) and locked (ac95-qw2-places.test.mjs:331). The Definer may want to add the same "made in e1f73f7" note to point 5. This is wording only.
- **N2:** the N5 case checks the place against the board, not against fixed numbers (`/^\d+ of \d+ waiting$/`). That is enough for what it claims (P6 is caught). The fixed numbers are already locked by the other place cases.

**Open questions**
None.
