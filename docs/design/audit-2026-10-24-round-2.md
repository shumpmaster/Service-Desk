**Design audit, round 2 (2026-10-24): colour, anchors, "you are here", counts, and standard milestones**

You asked for five things, and all five can be done without making the desk loud. **Colour:** no new colour is needed. The desk already has a green and a red. The proposal is to use them only on the small status marks: a green tick for something finished and confirmed, a red cross for something that failed. Vermilion stays "needs you", gold stays "next to reach", and everything else stays grey. **Anchors:** one soft box per screen at most. Only the project page earns a new one, around "where it's heading". **Arrow:** one small solid dark arrow pointing at "now", on every timeline and plan drawing. **"0 of 5":** it was counting only the model's standard checklist. Your own milestones never counted, so even Build, where M1, M2 and M2B are reached, says "Standard: 0 of 5 recorded". The fix counts all your milestones ("3 of 5 reached") and states the unused standard ones in words. **Standard milestones:** today they differ from yours only by a slightly lighter grey, in the same size and weight. The proposal gives them their own labelled group, "Standard checklist", and folds the unused ones into a single line. **Pieces of work inside a sprint:** the desk can't show "done of total" yet, because nothing the desk reads lists a sprint's pieces in advance. Making that possible needs a small change to the operating model, explained in item 4. Nothing in the repository was changed. The full test suite passes (1,154 of 1,154) and `git status` is clean.

*By the Design reviewer. Judged against the domain pack (part A, and part B where a frame draws the point), your rulings first, with your round-1 choices taken as the baseline: all 11 accepted, and item 4 as your strip (P-001-glance-lanes: C, with equal widths).*

**Evidence**
- **Setup:** the desk at da4a342 (src/public as on main), served locally from the repository's test fixtures. Captured with Playwright and Chromium at 360×740 and 414×896, light and dark, IBM Plex loaded.
- **Baseline applied first:** every "now" capture first applies the round-1 baseline in the page: the repository's changes.js p1–p11, plus pK with lanes set to `1fr 1fr`, and p7 on the Timeline.
- **Fixtures:**
  - `text` carries your exact words, "Yours: M3C · Standard: 0 of 5, not recorded yet".
  - `mix` is Service-Desk with real-shaped Build run 1 (M1, M2, M2B reached), Alpha, and POOM.
- **Mocks:** each proposal was mocked in the page (scripts/changes2.js) to check fit. No sideways scroll in any mock, at either width or theme.

---

## 1. A limited status palette

- **Where:** status marks across the desk.

- **Now (measured):**
  - The v2 tokens already include `--ok` #12733a / #4cc06a dark and `--bad` #b3162a / #ff6b78 (sandbox.css:472, :493). AC81 lists them "for pass, fail" (spec line 7082).
  - In practice almost every status mark is ink:
    - the reached ✓ (`.v2-s.st-check`) and the not-reached ✕ (`st-cross`, e.g. Timeline "Design-6 · not reached") are --ink;
    - the sprint marks "✓ merged ✓ source-checked" are --ink2 (sandbox.css:1104);
    - --ok appears only on the Done lane's ✓ (:628);
    - --bad appears only on can't-read lines (:584, :736, :795, :939), on a whole-tile border (`.v2-tile.bad`, :770) and on the failed-load screen.
  - Captures: `mix/mix-p_Service_Desk_timeline-base-360-light-full.png`, `crop-tile-sd-light.png`.

- **Proposed:** no new token, and no third colour.
  - **Green `--ok`, on the mark only:**
    - (a) `.v2 .v2-s.st-check { color: var(--ok) }`: reached milestones and finished phases on the Timeline, the project page strip, the opened phase rows, the Home tile drawing and Plan's Reached list;
    - (b) the ✓ glyph of the sprint marks merged, review passed, checks passed and source-checked, wrapped in a span in --ok, with the word staying --ink2;
    - (c) the Done lane ✓, as now;
    - (d) a "CI … passing" line, as a ✓ before the words.
  - **Red `--bad`, on the mark only:**
    - (a) `.v2-s.st-cross` (not reached);
    - (b) `.v2-smk`, the ✕ for review failed, checks failed and source check failed;
    - (c) can't read: the ✕ and its words, as today and as round-1 item 2;
    - (d) the failed-load ✕ (round-1 item 10);
    - (e) "CI … failing" lines, such as the sheet's "What was checked: CI on main's head: failing", as a ✕ before the words;
    - (f) a waiting deploy that doesn't match a passed pull request (note 35): its mismatch mark.
  - **Stays grey (`--ink`/`--ink2`):**
    - planned, in progress (half circle), not recorded, no record in the model, skipped and not needed;
    - reached-then-gone-back-over (`pastcheck`: history, kept lighter as note 2 rules);
    - every absence: "Nothing waiting", "Nothing needs you" and its tick, "checked … ago";
    - agents' gaps (grey diamond, AC69), "new" (P-001-glance-new: "no colour");
    - the stall line, ink plus clock as round-1 item 1, offered below as your choice;
    - the settle/undo line (clock or lock in ink, P-001-glance-count);
    - Technical, Context and Why labels.
  - **Remove** `.v2-tile.bad`'s whole-tile red border (:770). The corner's "✕ Can't read since …" carries it.
  - **The rule that keeps it limited:**
    1. Colour only on a status mark (an icon or a ✓/✕ glyph). Never on fills, borders, row grounds or headings. Words stay ink or grey, except the can't-read line.
    2. Every coloured mark keeps its shape and word. Tick and cross differ by shape, so colour-blind readers lose nothing (part A item 13).
    3. Green only for a recorded, finished fact (reached, merged, passed, confirmed). Never for an absence or "quiet".
    4. Red only for a recorded failure or a failed read. Never for an agents' gap or for something waiting.
    5. If a mark is yours and failing (a kicked-back card), vermilion wins.
    6. Gold stays "next to reach".
    7. No third colour.
  - **Is a third "at risk / waiting" colour needed? No.**
    - What waits on you is already vermilion. What waits on agents or time is ink plus clock.
    - The obvious amber (#9e5800 / #e3a33b) would sit 12.5 (light) and 11.0 (dark) from --gold by CIEDE2000. That passes AC81's ≥10, but at 14 px it reads as gold. Rejected.
  - **Optional (your choice):** retune --bad to #a8123a light / #ff5c7a dark, to move it away from vermilion now that red appears more often. Distance from --you goes from 13.3→19.8 (light) and 15.6→19.0 (dark). It stays 18.2 / 17.6 from Design's magenta.

**Numbers (WCAG contrast; CIEDE2000 via tests/desk/ciede2000.mjs)**

| | on bg | card | bg2 | chip | vs --you | vs each other |
|---|---|---|---|---|---|---|
| --ok light #12733a | 5.93 | 5.73 | 5.54 | 5.26 | 59.1 | ok–bad 64.5 |
| --ok dark #4cc06a | 8.21 | 7.66 | 7.88 | 6.85 | 63.6 | ok–bad 71.1 |
| --bad light #b3162a | 6.85 | 6.62 | 6.40 | 6.07 | **13.3** | |
| --bad dark #ff6b78 | 6.91 | 6.45 | 6.64 | 5.77 | **15.6** | |
| retuned bad light #a8123a | 7.47 | 7.22 | 6.97 | 6.62 | 19.8 | |
| retuned bad dark #ff5c7a | 6.40 | 5.97 | 6.15 | 5.35 | 19.0 | |

- **Other distances:**
  - --ok: 15.9 / 19.2 from Discovery teal, 16.0 / 15.0 from Build olive, 29.8 / 26.8 from gold.
  - --bad: 24.0 / 19.6 from Design magenta, 20.4 / 21.1 from Launch brown.
  - The nine-colour minimum is unchanged: 13.3 light (you/bad) and 12.2 dark (gold/olive).
- **Mock:** `mock2/mix-page3-360-*-after.png`, `mix-openDesign-360-light-after.png` (red ✕ on Design-6), `crop-home-tiles-*-after.png`.

- **Rationale:** You asked for consistent "going well / not going well". The desk already owns exactly those two tokens and almost never uses them. So the smallest change is to put them on the marks that already mean pass and fail. Colouring only the 14–16 px mark, not words or rows, keeps a long Timeline calm. A column of small green ticks reads as "fine" without shouting. It also leaves vermilion as the one thing that pulls your eye. Keeping absences grey matters most: round 1 found a green-feeling "Nothing needs you" hiding a stopped project, and a green tick there would make that worse.

- **Serves:** your words of 2026-10-24 ("a limited palette that enforces consistent indication…"); part A items 13 and 14.

- **Changes:**
  - P-001-trial-view-notes-2.md **note 23** ("statuses … an icon inside a plain circle, not by colour");
  - **note 28's pick**, whose option text replaced the tile's "green checks" (P-001-trial-view-notes-2.md:135);
  - P-001-trial-view-notes-1.md "Bold headings, no colour". The milestone headings stay uncoloured; only the icon changes, but you should know.
  - S-001 AC48 "Milestones are neutral"; AC59/AC84 icons; AC71 "slate" (if the stall line moves);
  - P-001-timeline-labels.md's clause "colour is left for what needs the owner";
  - frames 5, 6, 7b and H5 as drawn (part B items 26 and 32);
  - AC81 and AC88 token values and their test, only if --bad is retuned.
  - Unchanged: P-001-redesign-type ("one vermilion accent") and AC69.

- **Kind:** your choice (it changes rulings), then the Definer.

---

## 2. Outlined boxes / subtle callouts as anchors

- **Now:**
  - Filled panels already exist: Home's briefing (`.v2-brief`, sandbox.css:731, --bg2), the why-once callout (`.v2-callout`, :975), the Timeline's two goal boxes (`.v2-goal`, :1021) and Plan's card (:1173).
  - --bg2 against --bg is only 1.07:1 light and 1.04:1 dark.
  - Outlined things already mean "tap or type": tiles and cards (1px --line, 1.23 / 1.29:1), answer options (`.v2-opt`, 1px --line, r12), the text box (`.v2-input`: --bg2 plus 1px --line2, :668).
  - The mockup's only outlined callout is vermilion (`.callout.youc`, desk-v2.html:262, the spend alert).

- **Proposed treatment, one form:** `.v2-anchor { display:grid; gap:6px; padding:12px; border-radius:12px; background:var(--bg2) }`. This is the briefing's own look.
  - I tested a 1px --line2 edge too. It makes the box identical to the answer text box (bg2 + line2), so no edge.
  - An outline in vermilion stays the spend alert's.

- **Rule:**
  - at most one anchor per screen;
  - never inside a card, tile or sheet;
  - one fact, at most 3 lines, in ink;
  - never for a gap the agents fill;
  - never vermilion.

- **Per screen:**

| Screen | Anchor | Why |
|---|---|---|
| Home | the briefing (exists) | Nothing else; tiles are already boxes. |
| Project page | **the one sentence plus a one-line tally** ("8 of 16 milestones reached · 17 sprints: 9 merged, 8 not read", from idea 4) | It answers "where is it and how far", the page's job (AC83). Not the strip: its 12 px padding broke "Discover/y" mid-word at 360 (`mock2/mix-page-360-light-after.png`). Not the ◆ row: vermilion already anchors it, and it is absent when nothing waits. |
| Timeline | none | The Now line plus the arrow (idea 3) is the anchor. The goal boxes sit at the two ends. |
| Plan | none | The arrow marks "next". |
| Waiting | none | Cards are boxes, and the strip is ruled "one quiet line". |
| Question/gate sheet | none | The settle/undo line already leads with an icon and bold (P-001-glance-count). A box would sit beside outlined options and the text box. |
| Team, member pages, Details, portfolio, failed load | none | |

- **Consequence:** the why-once callout ("Why each is taken on or skipped: not written yet…", sandbox.js:1251) uses the same fill for an agents' gap. It becomes a plain `v2-small gap` line with its eye icon, so a filled box means "anchor" only.
- **Mock:** `mock2/mix-page3-360-light-after.png` and `-dark-after.png`. Measured cost: about 24 px.

- **Rationale:** Linear-style anchors work because they are rare. The desk already has a calm, approved anchor shape (Home's briefing), so reusing it means "boxed" carries one meaning across the desk. Edges were rejected because every edged thing on the desk is something to tap or type into.

- **Serves:** your words ("occasional … outlined boxes or subtle callouts … for the most important information"); PROJECT.md §2 (a glance); part B item 31.

- **Changes:** frame 5 and AC83 (the sentence drawn unboxed; part B items 26 and 31); frame 6's callout for the why line (desk-v2.html:595), and AC90/P-001-why-line's form (not its words).

- **Kind:** your choice.

---

## 3. A "you are here" arrow

- **Now:**

| Drawing | How "now" is marked today |
|---|---|
| Timeline | The Now line's `::before` is a 16×2 px ink bar (sandbox.css:1091). After round-1 item 7, Now rests at viewport y=247 of 740. |
| Strip | The now cell's name goes from weight 500 to 600 (:908), plus the words "run 2 · now". |
| Home tile | The now column's label is bold (`.v2-lb b`), plus the half circle and "Now: Design, run 2". |
| Plan | The gold ring "next to reach" only. |
| Opened phase | Nothing. Its ▲ (`.v2-arrow`, sandbox.js:1240, drawn by frame 6 at desk-v2.html:577) is already a **filled triangle**, meaning "read from the bottom up". |

- **Proposed:** one shape everywhere: a small filled triangle in `--ink`, pointing *at* the present. It points right on vertical drawings and down on horizontal ones, never up. It is `aria-hidden`; the words beside it already say now, Now or next to reach. No animation. It is drawn with `clip-path: polygon(…)` on a span; mocks are in changes2.js q3.
  - **Timeline:** `.v2-nowl::before` becomes an 8×10 px right-pointing triangle, with `margin-left:4px` to centre it on the rail (x≈23). One per Timeline.
  - **Strip:** `.v2-ph.now::before`, a 10×6 px down-pointing triangle, centred 9 px above the now cell's bar. It fits the measured 12 px gap between the sentence (bottom y=222) and the strip (top y=234).
  - **Home tile:** a 6×8 px right-pointing triangle, 3 px left of the now dot (`.v2-c.s-now`). It must be a span: `.v2-c.up > i` would turn an `<i>` into the dashed drop line (:832).
  - **Plan:** a 6×8 px right-pointing triangle on the row whose icon is `st-next`, in the 16 px page margin (x 4–10, top 14 px).
    - This matches the desk's own "now" (P-001-design-lab-open: the first run with an own milestone that has no work filed).
    - One per project group.
  - **Opened phase:** the same 6×8 triangle on the phase's thin line (x≈18) beside the next-to-reach row, in the now phase only.
  - **Remove the ▲ reading arrow.** "↑ start at the foot" already says the reading order once in the section head. Otherwise two triangles would mean two things.
  - **Contrast:** ink is 17.58 / 16.25:1 on --bg and 16.99 / 15.15:1 on --card. Its smallness keeps it subtle.

- **Mock:** `mock2/mix-timeline-360-light-after.png`, `mix-page3-360-*-after.png` (strip), `crop-home-tiles-*-after.png`, `mix-plan-360-light-after.png`, `mix-openDesign-360-light-after.png`.

- **Rationale:**
  - Ink is the Now line's own colour (frame 7b), so the arrow reads as "Now" everywhere. Vermilion is "needs you". Gold already marks "next to reach", and on Plan the arrow sits beside that ring.
  - A filled shape among stroked icons is noticed without being big.
  - It does not fight round-1 item 7: that item only moves where the Timeline rests, and the arrow lands on the first screen.

- **Serves:** your words ("a subtle but noticeable visual arrow indicator for where we are"); part A items 13 and 24; part B item 35 (no key needed).

- **Changes:** frames 5, 6 (the ▲), 7b's Now line, H5 and 11 as drawn (part B item 26); AC82/AC65, AC83, AC84 and AC86 drawing words. No standing ruling.

- **Kind:** your choice (small), then the Definer.

---

## 4. Counts of all milestones, sprints, and pieces of work

**Now: what the desk counts**
- **Project page folded line** (`.v2-sd`, 12/400 --ink2 with the count in 12/500 ink; projectpage.js:273-291, sandbox.js:1266-1268):
  - `text` fixture: "Yours: M3C · Standard: **0 of 5**, not recorded yet". Your words, captured in `text/text-p_Service_Desk-base-360-light-full.png`.
  - `mix` fixture, Build: "Yours: M3A, M3B · run 1: M1, M2, M2B reached · Standard: **0 of 5** recorded" (`mix/mix-p_Service_Desk-base-360-light-full.png`).
  - Your milestones are listed by ID but never counted. The bold "x of y" is always the standard checklist (`std.bold`, :287-291).
- **The section head:** "Milestones by phase · yours and the model's 24" leads with the 24.
- **The Timeline:** "6 standard Design milestones · not recorded for this run" (feed.js:587-588); per milestone "4 sprints ›" (feed.js:704, sandbox.js:2880).
- **Sprint marks:** "✓ merged ✓ review ✓ checks" (feed.js:488).

**Your answer on "actions"** (verbatim): "the pieces of work within a sprint in a milestone".
- Nothing the desk reads lists a sprint's pieces in advance, so **done of total for pieces cannot be shown honestly today** (part A item 5).
- What exists:
  - (a) a pull-request sprint's commits, each one a piece of work. They have a count, but no planned total. The desk only links to them (feed.js:491, :518) and does not read them.
  - (b) a research sprint's (Q-/P-) steps in the dispatch log, which are read.

**Proposed**
- **Section head:** "Milestones by phase · **8 of 16** reached" (mix).
- **Each phase's folded line, two lines:**
  - L1: "**R of T** reached · <sprints>".
    - T counts, once each: your milestones across all the phase's runs (not dropped), plus the standard ones tracked (with a recorded state, or "taken on" by a plan line). R counts those reached.
    - <sprints> is one of: "m of s sprints merged", "no sprints filed yet", or "s sprints, merges not read" when J12 can't be read (as in `mix`).
  - L2: "Standard checklist: k tracked · u not tracked", or "none tracked (5)", adding "· n skipped" where lines say skipped. Unused ones are stated in words, never as "0 of 5".
  - Mix examples:

    | Phase | L1 | L2 |
    |---|---|---|
    | Build | "3 of 5 reached · 4 sprints, merges not read" | "Standard checklist: none tracked (5)" |
    | Design | "1 of 5 reached · 6 sprints: 2 merged, 4 not read" | |
    | Discovery | "4 of 4 reached · 7 of 7 sprints merged" | "4 tracked · 4 not tracked" |

- **Per milestone** (opened phase row and Timeline fold): "4 sprints · 3 merged ›"; the opened row "work filed · 1 of 1 sprint merged".
- **Per sprint, the pieces of work (the main ask):**
  - **Option A, done of total.** A sprint's pull request carries its planned pieces as a task list (`- [ ]` / `- [x]`). The desk counts "7 of 9 pieces done" on the sprint, the milestone and the phase.
    - J12 already reads each body (github.js:77, `body`; parsed by pulls.js:118 `prBodyParts`), so the desk side is simple once the record exists.
    - The record itself is a **change to the operating model's sprint form** (OPERATING_MODEL §3, S-032).
  - **Option B, interim, count only.** "12 pieces so far / 12 pieces" from the commits. This needs `commits { totalCount }` added to J12's fixed query (github.js:78): one field, no extra call, but it changes J12's frozen query text. There is no total, so no "x of y".
  - Research sprints can show "n steps", already read.

**Only if simple** (you said you wouldn't mind these too)
- **Running-log entries (the dispatch log):**
  - Simple for research sprints. The sprint ID is the log's `item`. They are already read: feed.js:377 `stepTimes` (`action: "dispatch"`, `trigger: "step"`), outcomes at feed.js:500. They could show on the sprint's mono line, e.g. "19 Oct · Q-012 · 9 log entries".
  - **Not simple for pull-request sprints.** The log's entries carry item, spec, session and stage, never a PR number (all 263 October lines checked). Joining them needs a new field in the log or a new commit read.
- **GitHub Actions runs:**
  - Simple only for the latest commit on main. The desk already reads its runs (github.js:103/:117; records.js:870 `parseWorkflowRuns`, each with conclusion). Details' "CI on main: passing" could add "· 3 runs, 3 passed".
  - **Not simple per sprint.** It needs one more call per sprint, by its merge commit. The per-PR check *state* is already read (pulls.js:360 `checksMark`), but not counts.

**Data the desk already reads**
- Your milestones per run, reached and dropped: projectpage.js:273-277 (from the timeline.js trace and J11 plan lines).
- Standard states: projectpage.js:279-284 and run.standard.
- Sprints per milestone: feed.js:540, :556 and the named PRs at :440-465.
- Merged state: feed.js:483 and :496-497.
- The project page's `milestonesByPhase` doesn't take `feedView`. Adding sprint totals is new *derivation*, not a new read.

- **Mock:** `mock2/mix-page3-*-after.png`, `mix-openBuild-360-light-after.png`. The words are stand-ins, hand-tallied from probes of the rendered page.

- **Rationale:**
  - "0 of 5" reads as "nothing done" because the only bold number is the checklist you didn't use. Leading with your own milestones, counted across runs, answers "how far". Saying the unused checklist in words answers "what's in or out" without a false zero.
  - Option A is the only way to get a true "of total" for pieces; anything else would invent a total.

- **Serves:** your words ("expand that to all milestones … same logic applied to sprints and actions"); part A items 5 and 7.

- **Changes:** AC83's detail-line words (projectpage.js:244-246); frame 6's "Standard: 5 of 6 reached" form (desk-v2.html:626); AC84's sprint fold words; J12's query (option B); the model's sprint form (option A).

- **Kind:** needs the Definer. Option A also needs your ruling and the model's maintainers.

---

## 5. Standard milestones set apart

- **Now (measured, `text/…-openDesign-base-360-light.png`, probe):**
  - Opened phase:
    - your rows are 13px/400 `--ink` #18191c; standard rows are 13px/400 `--ink2` #5c5f66: same size, same weight. The only difference is the grey (ΔE 23.0 light, 18.1 dark) and a dashed icon.
    - Both group heads, "Yours" and "The model's standard six", are 11px/400 --ink2 (`.v2-subh`, sandbox.css:960): the faintest text in the list.
    - A *reached* standard row is full ink, identical to yours (e.g. Discovery-8).
    - Earlier runs have **no group heads at all**; yours and standard are mixed in one grey list (sandbox.js:1247).
  - Timeline: standard rows are 13/500 ink, **identical** to yours. Only the 11 px mono code ("Design-6" against "MD2") differs.
  - Plan and Home: not shown.

- **Proposed:**
  - Heads become "Your milestones · 3" and "Standard checklist · 6 · 2 tracked" (or "· none tracked this run"). Both use `--t-label` (500 11px) in `--ink`. The standard head gets a 1px --line rule above it and an 8 px gap.
  - The same heads go on earlier runs.
  - Standard rows not tracked (not recorded yet, or no record in the model) fold into one row: dashed ring, "6 not tracked this run: 4 not recorded yet, 2 no record in the model ›", --t-small --ink2. A tap lists each with its own icon, so part B item 30's three states survive.
  - Skipped ones stay listed, each named with its why (P-001-standard-milestones).
  - Your rows' names go to the row role, 13/500. Tracked standard rows stay 13/400.
  - Timeline: the meta line reads "Design-6 · standard · not reached"; standard names 13/400, yours stay 13/500; the gathered line reads "Standard checklist · 6 not recorded for this run ›".

- **Mock:** `mock2/text-openLaunch-360-light-after.png` (your Launch case), `mix-openDesign-360-light-after.png`, `mix-openBuild-360-light-after.png`.

- **Rationale:** You skip the lighter rows because lighter is the *only* signal, and the labels that should explain it are the faintest text on the screen. A named group with a rule says "in or out" in words. Folding the untracked ones removes most of the grey. Giving your own milestones the row weight keeps them louder than the checklist, as you asked.

- **Serves:** your words ("visually segregate … confused on what's in or out"); P-001-standard-milestones; P-001-redesign-conflicts item 2 (every standard milestone stays shown, folded, one tap away); notes-2 note 11; part B item 30.

- **Changes:** frames 6 and 6b as drawn (part B item 26); AC83 and AC84's words. No ruling is broken.

- **Kind:** your choice, then the Definer.

---

## Checked against your round-1 choices
- **Stall (item 1):** stays ink plus clock. Can't-read (item 2) is already --bad, consistent with the palette.
- **Due line (item 3):** stays an ink clock or lock.
- **Kicked-back strip (4b):** untouched. Vermilion kind icons stay; no anchor box.
- **Gate titles (item 5):** unaffected.
- **Timeline opening point (item 7):** compatible; the arrow is on the first screen.
- **"new" (item 11):** stays uncoloured.

## Problems that were already there (to file, not caused by these proposals)
- **F1:** mix, Launch line: "Standard: 0 of 5, not recorded yet" while its opened run 3 lists Launch-3 "not reached". `everRun` false ignores recorded states (projectpage.js:288-290). Part A items 5 and 7.
- **F2:** the same line drops your M3C (planned, in run 2). "Yours" lists only the latest run's own milestones, and earlier runs only reached ones (projectpage.js:273-277).
- **F3:** gold has two meanings: "next to reach" and Plan's "moved last" edge (sandbox.css:1171, which AC24 specifies). Part A item 14; a question, since the spec sets it.
- **F4:** `.v2-tile.bad` paints a whole tile's border red (:770).

## What I could not audit
- Members Letter (no fixture), a real iPhone, or your real data.
- Pull-request sprint counts: `mix` can't read pull requests, so merges show "not read".
- Steps and commit counts: no fixture data.

## Questions for you
1. **Pieces of work:** option A (a task list in each sprint's pull request, giving true done-of-total; a model change) or option B (commit counts, no total)?
2. **Wording:** "not tracked" or "not used" for standard milestones with no record? "Not used" is only true where a plan line says skipped.
3. **Stall line:** keep it ink plus clock, or make it --bad?
4. **--bad:** keep it, or retune it further from vermilion?
5. **Reached in a run that was gone back over:** green, or grey as proposed?

## Captures
All under the reviewer's scratch folder (outside the repository), glance-audit-2/:
- **Palette:**
  - now: `cap/mix/mix-p_Service_Desk_timeline-base-360-light-full.png`, `cap/crop-tile-sd-light.png`
  - mock: `cap/mock2/mix-openDesign-360-light-after.png`
- **Anchors:**
  - now: `cap/mix/mix-p_Service_Desk-base-360-light.png`
  - mock: `cap/mock2/mix-page3-360-dark-after.png`
  - strip break: `cap/mock2/mix-page-360-light-after.png`
- **Arrow:**
  - now: `cap/mix/mix-p_Service_Desk_timeline-base-360-light.png`, `cap/mix/mix-work-base-360-dark.png`
  - mock: `cap/mock2/mix-timeline-360-light-after.png`, `cap/mock2/crop-home-tiles-dark-after.png`, `cap/mock2/mix-plan-360-light-after.png`
- **Counts:**
  - now: `cap/text/text-p_Service_Desk-base-360-light-full.png`, `cap/mix/mix-p_Service_Desk-base-360-light-full.png`
- **Standard set apart:**
  - now: `cap/text/text-p_Service_Desk-openDesign-base-360-light.png`, `cap/text/text-p_Service_Desk-openLaunch-base-360-light.png`
  - mock: `cap/mock2/text-openLaunch-360-light-after.png`
- Every "now" capture has a `.json` beside it (text, computed type, colours, contrast) and a `-full.png`; mocks have `-before`/`-after`.
- Scripts: `scripts/cap2.mjs`, `scripts/probe2.mjs`, `scripts/mock2.mjs`, `scripts/changes2.js`, `scripts/colours.mjs`.
- Test run: `suite.txt`.

*Orchestrator's note: recorded verbatim, except that the Captures section's scratch-folder path is shortened, since that folder is outside the repository.*
