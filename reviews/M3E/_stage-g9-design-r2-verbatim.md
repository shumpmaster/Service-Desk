# M3E stage G9: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g9 at b616b32 (G9's work over d968b1e).

---

Verdict: PASS

G9 round 2 (read-only check of b616b32 against 5775574): B1 is fixed and nothing else moved. Each run heading in an opened phase now outranks the "Your milestones" and "Standard checklist" headings under it. Every run after the first has a thin rule above it as the boundary; the first run has none. Contrast is fine in both themes, nothing scrolls sideways, and the full desk suite passes.

**Plain summary for the owner.** Inside an opened phase, each "Run 2 · 8 Oct – now" or "Run 1 · 5–8 Oct · gone back over" heading is now dark and slightly bolder than the two group headings under it. A thin line now marks where one run ends and the next begins, so earlier runs no longer blur into the latest one. The project-page box, its count line, the plain why line and every other screen look the same as in round 1.

## Evidence
**How I checked.** I exported 5775574 and b616b32 with `git archive`. The "before" export was given b616b32's tests/ folder so both sides could take the same captures. I took all 14 g9- states at 360×740 and 414×896, light and dark, which is 56 captures per side, each with a computed-style and text dump.

**Run headings outrank the group headings (AC92 (d); part A item 8).** Measured on `mix`'s Alpha Build (runs 3, 2, 1), `gates`' Launch (runs 4, 3, 2) and `text`'s Build and Design (Service-Desk's real records at 77bfeae):
- **Run headings:** 600 11px `--ink`, rgb(24,25,28) light and rgb(236,237,239) dark. Before they were 500 11px `--ink2`.
- **Group headings:** unchanged at 500 11px `--ink`.
- **Contrast of a run heading:** 6.4:1 → 17.58:1 in light, 7.72:1 → 16.25:1 in dark.
- **Sizes and weights:** 11px and 600 are both already on the scale (part B item 27), and no new colour was added.

**The rule marks the boundary between runs, and the first run has none.**
- Every run heading after the first draws a 1px solid `--line` rule (rgb(231,231,234) light, rgb(38,40,44) dark) with 8px above it.
- The first run heading in each opened phase has no rule: border 0px, margin 0px.
- Phases with one run have no rule either (Discovery and Launch in g9-page-every-phase).
- Each extra run adds 9 CSS px of page height. Nothing else on the page moves.
- In the captures, the run 1 heading now sits under its own rule, below run 2's fold.

**Width (item 12).** Nothing scrolls sideways in any of the 112 before and after dumps.

**Nothing else moved.**
- Pixel-compared before and after, these are identical apart from clock digits ("checked n s ago" and the wait timers, small glyph-sized boxes only):
  - Home's briefing;
  - every page state (`mix`, `ext`'s long name, v2.5, never read, nothing recorded, `text`, example);
  - Waiting.
- The pages whose height changed are only the ones with an opened phase holding two or more runs.

**The src/ diff** is the `.v2-runh` change (`font-weight: 600; color: var(--ink)`) and `.v2-runh ~ .v2-runh { margin-top: 8px; border-top: 1px solid var(--line); }` in src/public/sandbox.css. It also moves a doc comment in sandbox.js (no rendering change) and changes src/package.json's test glob to `*.test.mjs`. That last one is test running only, not something the owner sees.

**Tests.** The full desk suite passes on the b616b32 export: 1314/1314 (`node --test --test-concurrency=4 tests/desk/*.test.mjs`). The repository is untouched: HEAD is b616b32 and `git status` is clean.

## Notes (non-blocking)
- **N1.** The rule between runs and the rule above "Standard checklist" are the same 1px `--line`. The heavier run heading under the rule is what says "new run". That is as I called it. The owner sees it on the preview and may ask for more space.
- **N2 (pre-existing, not caused by this change).** In g9-page-every-phase, Launch's opened list shows only Run 2, though the page says "Design and Launch ran again". I haven't looked into why. It is the same before and after, so it is a follow-up, not a finding here.

## Questions for the owner
None new. Q1 is answered: the box stays always.

## Owner pair (added)
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/owner-pairs-final/05-run-headings-outrank-414x896-light-real-records-77bfeae.png: Service-Desk's Design phase opened, before (5775574) and after (b616b32). It uses real records at 77bfeae in the test setup, with a made-up clock. "Run 2" and "Run 1" are now dark and bolder, with the rule above Run 1.

A dark version is at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/r2/runs-text-414-dark.png. The round-2 captures and dumps are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/r2/shots-before/ and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/r2/shots-after/, and the suite's output is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9-design/r2/suite-after.txt.
