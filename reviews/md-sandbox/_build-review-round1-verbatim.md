Verdict: FAIL
Reviewed: 6eeae15 (build/builder/md-sandbox, on main 33d390a)

Three blocking defects. One of them would also turn the pull request's desk-build check red. Most of the other claims hold up when I re-ran them: the plain view is unchanged, the 360 px layout holds, the escaping is sound, the timeline port matches the model, and the commits are in order.

## Blocking findings

**B1. AC41 / AC49: the owner's "Rulings" group shows a count next to "none yet".**
- In the browser on Service-Desk's real records at 3117150, `#/p/Service-Desk/team/owner` shows "Rulings 27 · none yet". The count says 27 rulings exist and the line under it says there are none.
- Cause: src/lib/sandbox.js:933 always sets `latest: null` for Rulings. src/public/sandbox.js:576 then draws `g.latest || (g.count == null ? g.why : 'none yet')`, so any group with a count above 0 and no latest record reads "none yet".
- AC49 says each group shows its count "and the latest one", or "not recorded" where no record can fill it.
- The test misses it: tests/desk/md-sandbox.test.mjs:481 checks Rulings' count (1) but never what is shown under it. With that fixture the screen would read "Rulings 1 · none yet".

**B2. AC50: "Graduated" is shown on screen.**
- The standard milestone Launch-5 keeps the model's name (src/lib/timeline.js:41, `['Launch-5', 'Launch', 'Graduated']`). The sandbox draws it as "Graduated Launch-5 not recorded".
- Where it shows: the Status screen's Launch milestone list (`#/p/Service-Desk`) and `#/p/Service-Desk/timeline/Launch-i1`. I found it in the page's full DOM text on real records in Chromium; it is inside the collapsed lists, which the owner opens with a tap.
- AC50 says "Done", never "Graduated", on every screen: the desk only translates the model's word.
- AC50's test (tests/desk/j11-timeline.test.mjs:244) only searches the source files' string literals, not the drawn text, so it can't catch a word that comes from a record or a table.

**B3. The AC42 test fails on a shallow checkout, so desk-build would fail the pull request.**
- tests/desk/md-sandbox.test.mjs:578 runs `git show 33d390a:src/public/_headers` (and the same for index.html).
- .github/workflows/desk-build.yml uses `actions/checkout` with its default single-commit depth, so 33d390a isn't there.
- To reproduce: `git clone --depth 1 --branch build/builder/md-sandbox file:///home/user/sd-md-sandbox <dir>`, then `npm --prefix src test` gives `not ok 212 - AC42: no packages, the security headers and CSP unchanged…` with `fatal: invalid object name '33d390a'`; the run ends "pass 227, fail 1".
- The claim "228 desk tests pass" is true only in a full clone.

## Non-blocking notes

**N1. The blob cache key move to `desk-blobs-v3` is needed and safe.**
- It is needed: cached v2 logs and merges have no `rows`, so without the bump the sandbox would draw an empty timeline until a month's sha changed.
- It is safe: the old key is dropped with `store.remove` (scheduler.js:90), and the plain view simply re-reads its blobs once on its next load.
- Side effect: the plain view now stores `rows` too. October's parsed log is about 159 KB in the cache against 71 KB raw. If the browser's storage fills, the desk falls back to "Cache not kept on this device".

**N2. The timeline port matches the model's timeline, but not every line of `trace`.**
- At 3117150: identical (153 lines) to `v3_checks.py trace`, once the two summary lines are left out.
- At 33d390a: the port leaves out 20 lines of the form "specs/S-0xx-….md has no `milestones:` header line". `trace` prints these from its spec checks (v3_checks.py:1464), not from its timeline. The timeline lines themselves are identical.
- On a second dataset (the H5 "Alpha" fixture, run through the model's trace) it is identical apart from one "later work … has no milestone" line, which also isn't a timeline line.
- So the Builder's claim holds for the timeline, not for every line `trace` prints.

**N3. The AC42 360 px test only checks the CSS.** It looks for patterns, and one of them is `html.sb body { overflow-x: hidden }`, which would hide sideways overflow rather than prevent it. In practice I measured no overflow (see below), but the test as written would not catch a real overflow.

**N4. Working now's "Time so far" shows "not recorded"** when `dispatched_at` is later than the device clock. The spec's form is "–" with the reason. I saw this only because my harness clock was skewed.

**N5. Links from GitHub's own lists are used unchecked.** Pull request and workflow run links (`html_url`) go into `href` as GitHub sends them, as M2 already does. Every link the desk builds itself starts `https://github.com/`.

**N6. The card rule line only checks line 1.** It trims the word, and doesn't refuse extra `Decision:` lines. A second "Verdict:" line after a first `Verdict: PASS` also reads "In form", which is right under the first-line-decides rule.

## What I checked that holds

1. **No regression without ?sandbox (AC43 B).**
   - I rendered the plain view with main's code (`git archive 33d390a`) and the branch's code, each under its own page harness, on the same fake data. That data held the J11 records, cards, a question, three pull requests (one with HTML in its title) and a waiting deploy.
   - 7 routes: `#/`, `#/p/Service-Desk`, `/asked`, `/agents`, `/card/…`, `/q/…`, and Personal-Org-Operating-Model.
   - Over three poll cycles, the serialised DOM, the state line, the footer, the title and every `/api/*` request body were byte-identical.
   - The edits to existing files (model.js, records.js, scheduler.js, app.js, build.mjs) only add things, or only act behind `ctx.j11` / `opts.j11`. No plain-mode code walks the parsed records by kind.
2. **AC42 limits.**
   - package.json, the lockfile, _headers, index.html and style.css are unchanged. No font file, and nothing outside src/** and tests/**.
   - Chromium crawl at 360×740, light and dark, with reduced motion, every `#/` link followed: 152 routes on the H5 extremes and 266 on the real 3117150 records.
   - Results: no element beyond the viewport, `scrollWidth` never over 360, no console or page errors, no request to another origin, the marker on every screen, and no href other than `https://github.com/…` or the plain view's own.
   - Animations sit inside `prefers-reduced-motion: no-preference` blocks.
3. **Security.** The only `innerHTML` is renderMarkdown's escaped output (sandbox.js:497). A pull request titled `<img src=x onerror=alert(1)>…<script>…` showed as plain text and raised no dialog.
   - The verdict link encodes each branch segment and keeps `/`: `…/new/build/builder/a%3Fb%23c%26d%3D1?filename=reviews%2F90%2Fowner.md&value=…`.
   - A fork's pull request gets "copy the text" and no link.
   - Card links match J3's example exactly.
4. **Scope.** The "Tell your Chief of Staff…" bar is a disabled button with the deferred words. No "+" and no notification code.
5. **Commits.** Both are builder <builder@agents.invalid>, with the `Agent-Session` and `Spec: S-001` trailers. No model names or co-author lines.

## What I ran
- `npm --prefix src test`: tests 228, pass 228, fail 0 (full clone).
- `npm --prefix src run build`: "build: PASS (2 connected projects; 16 page modules in step)".
- Same tests on a depth-1 clone: pass 227, fail 1 (B3).
- `python3 governance/checks/surface_guard.py diff --range 33d390a..HEAD --branch build/builder/md-sandbox`: "OK: 2 commit(s) in 33d390a..HEAD checked (0 merge(s) skipped, 0 exempt, 0 human)", exit code 0.
- `python3 -I governance/checks/v3_checks.py trace --root .` in `git archive` checkouts of 3117150 and 33d390a, compared with my own runs of the port (`j11Records` / `timelineOf(...).lines()`) on the same trees (N2).
- The scratch scripts (plain-view comparison, Chromium crawl, port runner) are under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/ (cmp/ and br/).
- Nothing in the repository was edited.

## Open questions
- B3: should the AC42 test compare against a copy of _headers and the CSP kept in the repository, or should desk-build fetch history? desk-build is the Chief of Staff's file, so the second would be their change.
