# M3E stage G9: the Reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g9 at f9b5d9a (G9's work over d968b1e).

---

Verdict: PASS

G9 at f9b5d9a passes against specs/S-001.md as it stands. I judged G9's row (:2598), its build-plan line (:17497), AC92 (e) (:9446–9493 and the (e) test line :9525) and AC83's changed note (:7838–7843), using the starting per-screen list in the table as the list. The PASS holds only for that list. The spec's precondition is still open: the Design reviewer's list is not yet written into AC92 (e)'s table, and their run-head call (AC92 (d)) is not yet written either. The items under "Depends on the Design reviewer's call" below need re-review if that call changes the list.

**Blocking findings:** none.

**What I ran** (scratch worktree at f9b5d9a, since removed; /home/user/sd-g9 is clean on build/builder/g9):
- Build: PASS, 36 page modules in step, so src/public/lib/projectpage.js matches src/lib.
- surface_guard on d968b1e..f9b5d9a: OK, 8 commits, all `builder`, each with `Agent-Session:` and `Spec: S-001` trailers.
- Test files:
  - ac92-glance-boxes plus ac83-page: 27/27 pass.
  - ac88-dark: 6/6 pass, so G9_ONCE was met in both themes.
  - Full `npm test` (one process): 1313/1313 pass.
- Seeded defects in a throwaway copy, every one caught:
  - A display-key-only block lookup in `pageSprints`: the made-up project's tally became "1 sprint · none merged yet" where 5 sprints are expected.
  - Summing per run, or per phase, instead of counting each sprint once: caught by the pure test.
  - "0 of 0" when T is 0.
  - A border on `.v2-anchor`: failed three AC88 walks and the AC92 test.
  - A wrong `gap` on `.v2-anchor`.
- The base (d968b1e) ac83-page.test.mjs, run against G9's code: 23/23 pass.
- `g9-` Chromium captures: all 44 made. Nothing scrolls sideways and nothing is cut.

**The checks you asked for**
- **Locked tests.**
  - ac92-glance-boxes.test.mjs:1 and :4 carry `ac-test: S-001/AC92` and `S-001/AC83`.
  - It covers every clause of (e)'s test line: a box only where the table names one; never in a card, tile or sheet; never around an agents' gap; no box beside the Done lane; Home's five lines; the why line with no ground.
  - AC83's two cases are rewritten in their own commits, 30ed8d7 and 7fa6dd7, and named in their titles.
- **AC83 rewrites.**
  - Neither old case failed on the new code, so the rewrites were not forced by a failing check. The row names them, though, and they lock the new look.
  - The diffs are additions only. Every old assertion survives, so nothing is weakened.
- **G9_ONCE** (ac88-dark.test.mjs:1401–1418): exact and set-equal (:1749).
  - It pins exactly the CSS diff: `.v2-anchor`'s six declarations, `.v2-tally b`'s weight and colour, and the three declarations taken off `.v2-callout`.
  - The border mutation proves nothing outside it gets through.
- **The tally** (projectpage.js:507–526):
  - R and T come from `mv.sum`, the same sums as the head.
  - Sprints are deduplicated by id across every run on the page.
  - Each run's block is found by the run itself through `blockOf`. Only `mix`'s Alpha, with two runs both keyed "Build-i1", tells that apart from a display-key lookup, and the page test catches it.
  - When T is 0 it reads "no milestones tracked yet · no sprints filed yet", with nothing bold.
  - When the Timeline isn't drawn it reads "sprints not available".
- **v2.5 and never-read pages:** the box holds the sentence alone, and both are tested. A page that couldn't be drawn at all (sandbox.js:4791) has no box.
- **Fixtures:** `fiveLinesState`, `G9_OPENS` and the pure case's sprint views are all labelled NOT real in glance-fixtures.mjs and in fixtures/README.md.

**Notes (non-blocking)**
- **N1. The memory fix (f9b5d9a) does weaken one assertion, despite its message saying "with no assertion weakened".**
  - The every-screen walk's minimum at ac92-glance-boxes.test.mjs:212 dropped from `> 150` to `> 100`. I measured the walk: 229 screens now, 320 before. So `> 150`, or better `> 200`, still passes, and the drop bought nothing.
  - Coverage was cut, compared with the Builder's own earlier commits (nothing landed or locked before G9 lost anything):
    - `quiet`'s every-screen walk is gone; only its page is still checked.
    - `text`'s walk is gone, but `mix` contains it, so that one is fair.
    - G9_OPENS no longer goes through AC88's okBadCheck or the stage-8 guard's sameLook. G9_ONCE's set-equality still proves the guard reaches every pinned element, and pageBox and doneOnly cover the colour checks on G9's own screens.
  - Fix in any fix round: put the minimum back.
- **N2.** fixtures/README.md:949 still says G9's walks in ac88-dark.test.mjs open these made-up parts. Since f9b5d9a they don't.
- **N3.** sandbox.js:1433: `milestonesNode`'s old doc comment now sits on top of `pageMilestones`'s, two stacked, so `milestonesNode` has none.
- **N4.** `tallyAgrees` (ac92:291) only checks that the page's sprint count is at most the sum of the phases' counts. "Each sprint once" is locked by the pure test (ac92:80–92) and by the exact tally strings, so this is adequate, just loose.

**Heap note**
- **How close:** the peak used heap during the full run was 2004 MB against a 2096 MB limit (default on 16 GB). That leaves about 92 MB, roughly 33 more page loads.
  - I measured about 2.8 MB kept for good per `loadSandbox`, because each load imports sandbox.js under a new URL and it is never freed.
  - The run took 19 minutes, with GC slowing it near the limit.
  - The repo is public, so CI's ubuntu-24.04 runner has 16 GB and the same limit. CI has the same headroom.
- **Is a bigger heap in src/package.json safe?** For example `node --max-old-space-size=4096 --test ../tests/desk/`.
  - Mechanically yes: src/** is the Builder's surface, both CI workflows call `npm --prefix src test`, and 16 GB holds it easily.
  - But it only postpones the problem: growth stays linear, so 4 GB buys about 700 more loads, and runs stay slow.
  - It also departs from the command the spec quotes word for word (S-001:14061: "`npm --prefix src test`, which runs `node --test ../tests/desk/`"), so it needs the Definer's note.
  - The root fixes are to stop the per-load leak in sandbox-helpers.mjs:183–186, or to run each test file in its own process. Each of those also changes :14061 or index.js's design.
  - Recommendation: do it as its own small change with a spec note, not inside G9. Carry it as a risk now, because the next stage that adds about 35 loads will run out of memory.

**Depends on the Design reviewer's call**
- **D1. The list itself.** The Builder built the starting list: Home's briefing; on a project's page the sentence plus the tally; nothing elsewhere. The waits row is left out of the box, citing round 2's reason. The comments in sandbox.js and ac92:8 say "as the Design reviewer's list names". That is true of round 2's list (docs/design/audit-2026-10-24-round-2.md §2, the Design reviewer's), but not yet of the list the spec asks for in G9's plan. The merge waits on that list being written into the table and matching what is built.
- **D2. Run head vs group heads** (AC92 (d), build-plan :17497): nothing is built. It waits on the call.
- **D3. The look at 360 px:**
  - On the real records the "one-line tally" wraps to two lines mid-phrase ("9 merged, 8 / not read"); it fits on one line at 414.
  - The strip's now-arrow sits 3 px under the box.
  - The capture that shows both: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots/g9-page-text-360x740-light.png
- **D4. Boxing a sentence with no tally:** the v2.5 page's "Sprint … is open. Nothing waits on you." and a never-read page's "Where it's heading: not available until the project's records are read." Both are a fair reading of "a project's page", but the Design reviewer should confirm a box around an unknown.

**Join-up (end of Build, parts together):**
- The page's box reuses the briefing's look exactly, in both themes: `--bg2` ground, 12 px radius and padding, `4px 10px` gap, no edge.
- The tally's R and T equal the head's sums and the phases' lines (checked on two pages).
- The why line now matches the agents'-gap grey used elsewhere.
- Waiting's only filled ground is still the Done lane.
- No blocking difference.

**Open questions**
- D1 to D4 are for the Design reviewer.
- The heap fix is for the Definer and Orchestrator.

Captures for the Design reviewer: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots/ (44 PNGs). Their per-capture readings are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots.txt
