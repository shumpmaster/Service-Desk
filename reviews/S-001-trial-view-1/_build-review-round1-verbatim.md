Verdict: FAIL
Reviewed: 8f6f0d92b8cc18ed7e5073e801d698c37ca61953

Three findings block the merge. Most of the batch holds up: there are no regressions without `?sandbox`, no escaping holes, every claim I re-ran checks out, and the commits are clean. What fails is two things the owner would hit on a phone, plus one AC56 check the spec names that the ac-test leaves out.

## Blocking findings

**B1. A single tap on a card's "Latest" control does not open its bubble once another card's control has had focus (AC54 (b), AC56).**
- **Where:** `src/public/sandbox.js:360-362`. The old control's `onblur` sets `bubble.pointerFocus = null`. This clears the flag that the new control's `onpointerdown` had just set (line 342).
  - The new control's `onfocus` (line 358) then opens the bubble as if from the keyboard (`via 'key'`).
  - The click that follows goes to `bubbleTap`, which sees the bubble already open and closes it (lines 1342-1349).
- **Touch reproduction (Chromium, 360 px, touch), on the real fixtures and on H5's extremes:** tap Alpha's "Latest" (it opens), tap it again (it closes), then tap Beta's "Latest" once. No bubble opens.
  - Event trace on the last tap: `pointerdown:0  focusout:latest:Alpha:0  focusin:latest:Beta:1  click:…:1`, and no bubble at the end.
  - Tapping straight from an open bubble to another card's control also ends with nothing open.
  - On my first pass, cards 2 to 5 each needed two taps.
- **Mouse reproduction (1000 px):** hover Beta's control (it opens), then click it. It closes.
- **Why the tests missed it:** the fake DOM never fires blur or focus on a tap, and `tests/desk/ac56-moving-refresh.test.mjs:105-131` and the AC54 bubble test only ever tap one control.

**B2. On the Timeline, step tiles and milestone capsules are drawn over the bottom bar and take taps meant for its Status tab (AC51, and AC48's bottom bar).**
- **Where:** `src/public/sandbox.css:173`. `.sb-dock` is `position: fixed` with no z-index, while `.sb-tl-tile` is `position: relative; z-index: 1` (lines 300-301, and the capsule at line 314). This stacking rule is new on this branch.
- **Evidence:** I scrolled each screen in 8 px steps and checked which element sits under each tab.
  - On `#/p/Service-Desk/timeline`, the Status tab was covered by `SPAN.sb-tl-tile` 10 times and by `SPAN.sb-tl-tile cap` 8 times.
  - On `#/p/Service-Desk/timeline/Build-i1`, it was covered by the capsule 4 times.
  - Status, Alpha's Status and the Team log were never covered.
  - My first Timeline screenshot shows a capsule drawn over "STATUS" (the label reads "ATUS").
  - Agreed screen 4 keeps its bar on top.

**B3. The AC56 test leaves out a check the spec names, and the behaviour fails it.**
- AC56's test bullet requires, for every sheet and bubble, that each of the control, a tap outside and Escape closes it "with focus back on its opener".
- `ac56-moving-refresh.test.mjs:123` skips the focus check for the bubble closed by a tap outside: `if (how !== 'outside')`.
- `outsideTap` (`sandbox.js:1380-1387`) closes the bubble but never returns focus to its control.
- So the locked check is weaker than the spec. Either build it and test it, or have the Definer change the spec.

## Non-blocking notes

- **N1.** AC55's "same facts" test (`ac55-status.test.mjs:156`) only checks one direction: each accepted fact appears somewhere in the sandbox text. I checked both directions by rendering the same fixtures. For Pipeline, Time asked, Agents and the v2.5 reduced view, the only differences are navigation words (the "← Service-Desk" links, the page titles, the bottom-bar tabs). The facts match, but the test should compare both ways.
- **N2.** `src/lib/sandbox.js:692`: a gate card's `Reason:` is passed through `oneLine`, which also turns "; " into ", ". The spec gives that joining rule only for numbered rulings. Line breaks have to be joined for `Reason:`, but "; " does not, so the owner's words are changed more than needed.
- **N3.** The cache key bump (`desk-blobs-v3` to `v4`) is needed and safe.
  - **Needed:** the cache is keyed by kind and sha and is never fetched again (`scheduler.js:170`). Old v3 ruling entries have no `line1`, so the sandbox would keep asking for them and stay at "not available yet".
  - **Safe:** v3 is added to the old-key list, which is cleared at load (`scheduler.js:90`).
  - **Cost:** the plain desk re-reads its records once after deploy. The AC14 budget test passes.
- **N4.** In the rebuilt Pipeline, Time asked and Agents views, durations ("ran 20 min", "so far") are not updated by the tick, only by the minute's poll. This is acceptable under AC56's wording.
- **N5.** Screen 4's run switch shows dates ("5 to 6 Oct", "since 7 Oct"); the sandbox's switch shows only "Design i1 / i2". The spec doesn't ask for the dates, so this is a risk to carry, not a defect.

## The Builder's three open questions

1. **Owner lanes filed by a decision's answer file.** This fits the spec in spirit but not to the letter. AC49 names only "its line in status/merges.jsonl, or its outcome's record". The decision answer file (and the Orchestrator's `done` line) are additions. Without them every owner lane would end in a stub. The Definer should write this reading into the spec as a choice of its own.
2. **The one-box fallback leaving `Ruling: ` blank.** This fits. The spec says "J3's question form, with the owner's words after it". No letter can be known without guessing, and the rule line flags the missing letter.
3. **The run item's own steps under "Not tied to a milestone".** This fits. The fixture's NOTE output puts those lines inside the run's `untagged` block (NOTE lines 69-77 and 100-110), which is exactly what the spec puts under that heading.

## Join-up review (Reviewer, end of Build)

**The parts together:**
- Home, Status, Queue, a sheet, the Timeline, then Back twice, all in Chromium:
  - Back gives the Queue, then Status.
  - Escape on a sheet returns focus to the row that opened it.
  - A response sheet with typed text, its cursor at 4 and scrolled to 300 survived 76 s with 2 polls and the tick: the same text, cursor, scroll and focus.
- The patched redraw, the shared scheduler and the J11 reads work across every screen.
- Crawl: 273 routes per theme on the real fixtures and 173 per theme on the extremes, all clean.

**The screens side by side:**
- **Timeline against screen 4:** the phase strip, the run switch, the folded standard milestones box and the 1 px line are as agreed.
  - The tiles sit exactly on the line (0 px off, 11 tiles).
  - Milestone capsules are 40 px tall, 800-weight 16.3 px text, coloured `ink` on the surface colour in both themes. That meets the owner's "Bold headings, no colour".
  - Steps are tinted 24 px tiles, 600-weight 13.4 px text.
  - The things the spec says not to carry are absent.
  - Differences: **B2** (blocking) and **N5** (a risk).
- **Running log against screen 3:** in the browser every line is vertical, there is one dot per row on its lane, rows are centred within 0.6 px, and the drawing is the same height as the list (owner, Orchestrator, critic, researcher, definer).
- **Home:** two 160 px columns at 360 px. The 600-character summary is shown whole, with no clipping. The bubble lies inside the viewport and its Close control is 44×44.
  - Difference: **B1** (blocking).

## What I ran (scratch clones under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-tv1/)

- **Tests:** `npm --prefix src test` in a full clone at 8f6f0d9 and in a depth-1 clone: 282 tests, 282 pass, 0 fail. On base 4f01e61: 231 pass.
- **Build:** `npm run build` gives "build: PASS (2 connected projects; 16 page modules in step)" in all three clones.
- **Surface guard:** `python3 governance/checks/surface_guard.py diff --range 4f01e61..HEAD --branch build/builder/trial-view-1` gives "OK: 7 commit(s) … checked", rc 0.
- **Commits:** all 7 are by `builder <builder@agents.invalid>`. `interpret-trailers` finds `Agent-Session` and `Spec: S-001` on each. A search for co-author lines or model names finds 0.
- **No regression without `?sandbox`:** `plaincmp.mjs` renders the plain desk (app.js) on base and on the branch. It covers 8 routes, including Time asked with a proxy ruling and a Critic file, and the card and question pages. The DOM, screen state, footer and API calls are byte-identical.
  - `model.js` changes only the parse of rulings (two added fields) and adds reads behind `ctx.j11`, which only the sandbox sets.
  - `j11.js` adds the README parse.
  - `scheduler.js` only bumps the cache key.
- **AC42:** no package files changed. `_headers` and `index.html` match the `accepted-m2` copies. The only origins in the code are `github.com` and the SVG namespace.
  - `crawl.mjs` ran at 360 px, light and dark, with reduced motion, on the real fixtures and on H5's extremes. I added hostile text to the extremes: `<img onerror>`, `<script>`, `<svg onload>` and a `javascript:` link in a README.
  - Result: scrollWidth never exceeded the viewport, nothing overflowed, no console errors, no requests to outside origins, and no alert ever fired. Record text is escaped.
- **Targeted browser checks:** `checks.mjs`, `bub.mjs`, `bub2.mjs`, `mouse.mjs`, `dock.mjs`, `survive.mjs` and `shots.mjs` (output above) in …/rv-tv1/br/.
- **Earlier tests the Builder edited:** each edit follows a spec change and none was weakened to pass.
  - AC54 moved the summary and Latest control; AC55 removed links to the accepted views; note 10 changed "Done today"; note 15 added the "Recommended" label and the box present before a pick; notes 12 and 13 changed J11's grouping.
  - The moved fixtures are unchanged.
  - The one weakened check is B3.
- **The real question file:** the fixture `questions/P-001-design-lab-open.md` is the same as the real file at bb6f8e7. It splits into 11 numbered questions, each with its own recommendation, none picked.
