# M3E stage G1: the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/g1-home at ae09c2d (base e1cfa2e).

---

Verdict: PASS

G1 of "S-001 after the glance audit": build/builder/g1-home at ae09c2d on e1cfa2e, reviewed over e1cfa2e..ae09c2d in /home/user/sd-g1.

There are no blocking findings. All five parts of AC91 for Home, (a) to (e), are built as the spec words them: the larger count, the due lines, the stopped-project line, the can't-read treatments, "At work" in ink and the two-line cut. Nothing outside Home changed. Every rewritten test is one the spec's text changes, and each still checks at least as much as before. The guard's new exception is exact. The public copy of the library matches the source.

One thing will stop the merge mechanically, though it isn't a fault in the work. The review check reads a harmless `process.exit(1)` in the new screenshot tool as a skipped test, so as things stand it asks for the owner's verdict (note 1).

I ran the mutations by reading the tests, not by running them. I wrote no files, so no mutated copies.

## Blocking findings
None.

## What I checked
1. **(a) The count and what falls due.**
   - `briefingView` (src/lib/home.js:152-167) moves the settle and undo parts out of `parts` into `due`, in the order past, coming, undo. Each has its icon (clock, clock, lock), and the words are AC82's and AC89 (j)'s with a capital, sums included.
   - `parts` keeps "<w> waiting", ", <k> kicked back" and "oldest <age>".
   - sandbox.js:704-714 draws each due line as `span.v2-bdue`, in 500 12 px `--ink` with its icon in `--ink` (sandbox.css:741-744).
   - `.v2-brief.k-you .v2-bt1` takes `--t-sheet` (600 18 px), and the ◆ is 18 px. Only `k-you` changes. The other briefing forms keep their look: the test checks this for `k-quiet`, and the stage-8 guard checks every other form it walks.
   - The AC91 test checks that every other text on Home is under 18 px.
2. **(b) The stall line.**
   - It moved to directly under the name row (sandbox.js:889-890), with the clock.
   - `.v2-ln.v2-stall` is 500 12 px `--ink`. While the line says nothing it is `display: none`, and the tick switches the class through the existing `_liveClass` code (sandbox.js:4769).
   - When it shows and what it says are unchanged. The old `.sb-stall` rules have no users left.
3. **(c) A project the desk can't read.**
   - **The corner:** "✕ Can't read since HH:MM", or "✕ Can't read" with no time, in 500 12 px `--bad` (home.js:636; css `.v2-wt.bad`). It keeps "◆ <n> wait on you" when cards wait, and "Checking…" as now.
   - **The foot** (home.js:649): "Reason: …" in `--t-small` `--ink2` beside a corner that says it can't read, or the red "✕ Can't read[ since HH:MM]: …" beside one that says what waits. The tests confirm the time is said once.
   - **The can't-draw tile:** its class is plain `v2-tile`, the `.v2-tile.bad` rule is deleted, and its line has the ✕ in `--bad` (sandbox.js:978). No CSS rule draws a tile border in `--bad`.
   - **Signed out:** the briefing's ✕ is in `--bad` in place of the clock.
   - **"Since you last looked":** its empty line becomes "Not read since HH:MM" (the earliest "since") or "Not read in this opening", in `.v2-ql.bad` (sandbox.js:809, 915; home.js:675). Lines from projects that were read still show, and nothing reads "Nothing new since".
4. **(d) At work.** `atWorkParts` (home.js:661) splits only "At work: <value>". "At work: not available", "No agent run recorded[ since …]" and "No dispatch log: not used here" stay wholly `v2-g`. Those are all of `atWorkLine`'s return forms (home.js:572-580) plus `unreadLines`'.
5. **(e) Two lines.** `.v2-e1` is cut at `calc(2 * 1.45em)` with the fade kept, and each entry is still a link. The tile summary's three-line rule is unchanged.
6. **Nothing outside G1.** All 13 changed files are in G1's areas (src/lib, src/public, tests/desk). Every hunk in sandbox.js is in Home's briefing, tiles or since list, and each changed function has one caller, on Home. The `diff` of src/lib/home.js against src/public/lib/home.js finds no difference, and build.mjs says "36 page modules in step".
7. **Rewritten locked tests.** Each one is marked "Rewritten in G1", and none lost an assertion (review_check raised no fewer-assertions flag).
   - **ac69-72's AC69 case:** its one changed assertion is AC71's line colour, slate → ink. AC71's glance note (spec :6668) and AC92 (a)'s "Stays grey (`--ink` or `--ink2`): … the stall line" cover it, and the stage table names "AC71's case rewritten for ink". The rewrite also adds "never `--you` or `--bad`" for any stall rule. The AC71 case asserts the new place, class and clock in place of "under Next:". Covered.
   - **ac85-sheets' AC89 (j) briefing case:** AC91 (a) says the due lines take "AC89 (j)'s words … unchanged but for the capital", and AC91's preamble says "where they differ, the part governs". The rewrite keeps the words, the date form and "past first", and adds the line-of-its-own and clock checks. Covered.
   - **ac82-home (four cases) and md-sandbox (one):** the parts and due split, the corner's "since", the N2 foot (now stronger: the whole `z` array instead of `slice(0,3)`), and the two-line cut.
8. **The stage-8 guard exception (`G1_ONCE`).**
   - It pins each changed declaration, before and after, per theme, to its own element. Those elements are the `k-you` brief, `v2-bi`, the ◆, `v2-bt1`, `v2-go`, `v2-bdue` with its icon and words, the empty `p.v2-stall`, and `span.v2-wt.bad`.
   - The new assertion requires the excepted set to equal the pinned set, so nothing pinned goes unused and nothing else is excused. The docblock explains what the guard can't see (the deleted border rule; screens with a "last looked") and names the AC91 cases that lock those.
   - One pin goes beyond the spec's words: "Waiting ›" is centred (`align-self: center`). This is layout that comes with the larger count, and is for the Design reviewer.
9. **The fixtures** (tests/desk/glance-fixtures.mjs).
   - `text`: waSetup, real 77bfeae.
   - `mix`: text plus the made-up "Alpha" from fullRepo, one card of each kind.
   - `unread`: one project's reads fail as a network error, before or after its first reads, and for the nothing-waiting or cards-waiting project.
   - signed-out: every project returns 403.
   - `stall`: the built J12 answer, with the clock 8 d 41 m after PR #77's merge.
   - `ext`: md-extremes.
   - Each made-up part, and each inline addition in the AC91 test, is labelled NOT real in tests/desk/fixtures/README.md:667-689. `quiet`, failed-load and F1/F2 are left, as the file says, to G2, G4 and G5.
10. **Mutations, checked against the tests.** Each of these would fail a test:
    - due lines' order swapped;
    - lower-case words;
    - due parts back in `parts`;
    - lock → clock;
    - due line in `--ink2` or at weight 400;
    - the count at 15 px;
    - the ◆ at 16 px;
    - `k-you`'s look leaking to other briefing forms (the quiet case and the guard);
    - the stall line after Next, in `--ink2`, without its clock, or shown when something waits;
    - the corner without the ✕, in grey, with no time, or saying "Can't read" while cards wait;
    - the foot missing, red beside a can't-read corner, or missing beside a waits corner;
    - `v2-tile bad` restored;
    - the can't-draw line without its ✕;
    - signed-out with the clock;
    - "Nothing new since" while unread;
    - max in place of min for the "since";
    - a never-read project giving a time;
    - the since line not in `--bad`;
    - the At work label in ink, the value in grey, or "not available" split;
    - three lines in place of two;
    - the fade dropped.

## Join-up (the parts working together)
In each state the parts agree:
- **unread:** the briefing says "Can't read <project> since HH:MM", the tile's corner gives the same time, the foot gives the reason, and "Since" says "Not read since" the same HH:MM (ac91:355-357).
- **signed-out:** the briefing's ✕, every tile's corner and "Not read in this opening".
- **stall:** the quiet briefing next to the stopped tile.

These are on screens, but I made no Chromium captures.

## Commands run
- `cd src && npm test`: 1166 pass, 0 fail.
- `node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . e1cfa2e`: "OK: all governance checks passed."
- `surface_guard.py diff --range e1cfa2e..ae09c2d --branch build/builder/g1-home`: "OK: 1 commit(s) … checked".
- `review_check.py pr 999 --base e1cfa2e`: risk R1; needs design-reviewer and reviewer, plus owner because of the flag in note 1.
- ae09c2d is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **A false test-weakening flag that will block the merge.** review_check's skip-marker list matches `xit(` inside `process.exit(1)` (tests/desk/tools/glance-shots.mjs:127; governance/checks/review_check.py:196-198), so it asks for the owner's verdict. Route: the Builder replaces it with `process.exitCode = 1`, or the Orchestrator records that it's a false positive. The matcher is a governance-lane fix.
2. **The due lines catch up only on the next redraw.** They are drawn from the view at render time (sandbox.js:714), and only their words are live. When a coming settle time passes on the tick, the "coming" line hides, but the "past" line appears only at the next redraw, about one poll later. Before G1, the single live `parts` string updated at once. No test covers the tick of these lines.
3. **A mixed "Since" case the spec doesn't settle.** If one project failed after a read in this opening and another has never been read, `sinceUnreadWords` (home.js:678) says "Not read in this opening". The spec's sentence can be read either way, and the code calls its choice "C" in a comment. Route: the Definer confirms or words it.
4. **AC89 (j) has no glance note.** Its own text still has the lower-case "one question was due…" in the briefing (spec :8265 area). AC91 (a) governs, but a one-line note in AC89 (j) would remove the tension.
5. **The capture tool doesn't serve the real page shell.** glance-shots.mjs uses its own HTML shell, not src/public/index.html and app.js, and sets dark with `colorScheme`. The PR's captures (360×740 and 414×896, light and dark) are still to be produced and judged by the Design reviewer.
6. **A weak time check.** The corner-time test (ac91:249) only checks that the time is no earlier than the moment of failure. The code takes `rs.since`, which is right, as the foot already did.

## Open questions
None beyond note 3.

I changed no tracked file, and the worktree is clean. Running check_all had Python write its git-ignored bytecode cache, governance/checks/__pycache__/ (18:36 UTC). I read only the commit's subject line, not its message body.
