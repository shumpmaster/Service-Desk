# M3D stage 6a (S-001 after MD3): the Reviewer's round 4, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/m3d-6a at 00446a5, after the Design reviewer's round 3.

---

Verdict: PASS

## Stage 6a, round 4: build/builder/m3d-6a at 00446a5, on 22eca92

E1 is fixed and the suite and all checks pass. I have two non-blocking notes: the rewritten case still misses a `min-height` regression, and the new fixture has no README entry.

**Blocking findings:** none.

**E1 is fixed against AC89 (k) (:7936): "the ordering view's rows have no empty space under them".**
- **The new rule.** A bare row's controls now use `align-self: stretch; grid-auto-rows: minmax(24px, 1fr)`, with `height: auto` on each control (sandbox.css:1232-1233). So the controls need at least 2 × 24 + 4 = 52 px, and otherwise fill the row.
- **My row-height sums.** A one-line bare row is 9 + 17.55 (13 px/1.35 name) + 2 + 15.4 (11 px/1.4 code) + 9 = 52.95 px. That is never less than 52, so nothing is left under the words.
  - On `shortRowsSetup()` ('Desk known', 'Look chosen') and on my earlier 414 px row ("The desk's value targets shown"), each control comes to (52.95 − 4) / 2 ≈ 24.47 px.
  - Two-line rows (70.5 px) give about 33.25 px each.
  - This matches the Design reviewer's Chromium table (36 × 24.47, 36 × 33.23, and 0 px under every row).
- **The controls still meet the size floor.** 36 × 24.47 meets "every other target at least 24 × 24 px" (spec :6528, :7792).
- **The margin is thin.** It is under 1 px: 52.95 against 52. The Design reviewer's render confirms it holds at both widths.

**The rewritten ordering case (ac89-words-drawing.test.mjs:293) now partly pins the outcome.**
- **Caught:**
  - A1: back to 22eca92's rule.
  - A2: `minmax(32px, 1fr)`.
  - A3: no `height: auto`.
  - A4: an 8 px gap in its own rule; A4b: an 8 px gap in the base rule.
  - A7: `align-self: start`.
  - A8: the controls set back to 32 px by a later rule.
  - A6c: a shorter name line set through `font`. This one is caught by the new least-height-fits-one-line sum, not by a declaration pin.
- **Survived:** see note 1.

**Other checks:**
- **The fixture is labelled made up in code.** wa-fixtures.mjs says "made up for the test, NOT a real record". The test asserts that both short names are drawn, so the `.replace` calls can't silently do nothing.
- **Nothing else changed.** Only sandbox.css (the rule and its comment), the ordering case and wa-fixtures.mjs (+13 lines) differ. The one removed assert is the exact-rule regex, which per-node declaration checks replace.
- Suite: 1123 pass, 0 fail.
- build: PASS.
- `check_all.sh . 22eca92`: OK.
- surface_guard over 22eca92..00446a5: OK, 1 commit. Over db1474e..00446a5: OK, 4 commits.
- `review_check.py pr 999 --base db1474e`: R1, no "Flag:" lines, only the expected missing verdicts.

**Non-blocking notes (carry as risks):**
1. **The outcome sum doesn't read the controls' own sizes.** `least = 2 * 24 + gap` hard-codes the 24 px floor and ignores any `min-height`. Two mutations bring back a 68 px column, and with it about 15 px under a one-line row, and still pass:
   - A5: `.v2-plmv { min-height: 32px; }`.
   - A9: `min-height: 68px` on the bare row's `.v2-plmove`.
   - A `min-height` for touch targets is a plausible future edit. Reading the track minimum, each control's `min-height` and the column's `min-height` from the cascade would close the gap.
2. **A record slip against :7969-7970 (route: Build).** AC89's made-up cases are to be "labelled NOT real in tests/desk/fixtures/README.md". The README's stage 6a section (README.md:632-642) doesn't list `shortRowsSetup()` (Service-Desk's docs/PROJECT.md at 77bfeae with MD1's and MD2's names shortened). It also doesn't list round 2's made-up records: the P-004 Launch-gate card naming M3A, and the P-001 stop card with `Milestone: MD3`.
3. **A6b (helper limit, not this test).** A `line-height: 1.1 !important` longhand on the name survives, because on this branch the cascade's computed line-height ignores a winning longhand. This branch predates stage 8's helper changes. Shortening the line through `font` (A6c) is caught.

## Open questions
None.

My worktree and copies are removed. I changed no repo files and made no commits. The mutation script is kept at /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/mutate18.py.