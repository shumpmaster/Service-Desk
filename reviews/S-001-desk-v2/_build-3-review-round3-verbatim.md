# S-001 desk v2, stage 3 (the project page and its Timeline): the Reviewer's round 3, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-3 at 6cf4200.

---

Verdict: PASS

Both round-2 blockers are fixed at 6cf4200. N-a, N-b and N-d are fixed too. Every run passes and no test was weakened. Three small points remain. None blocks, and they are carried as risks below.

## Runs (detached scratch worktree at 6cf4200, now removed)
- `cd src && node --test ../tests/desk/*.test.mjs`: 958 tests, 958 pass, 0 fail.
- `node src/tools/build.mjs`: `build: PASS (2 connected projects; 34 page modules in step)`. The worktree was still clean afterwards.
- `bash governance/checks/check_all.sh . 28b829d`: exit 0, `OK: all governance checks passed.`
- `python3 governance/checks/surface_guard.py diff --range 28b829d..6cf4200 --branch build/builder/desk-v2-3`: `OK: 7 commit(s) in 28b829d..6cf4200 checked`.
- `python3 governance/checks/review_check.py pr 999 --base 28b829d`: risk class R3 (src/config/projects.json). It requires design-reviewer, owner and reviewer. Its 3 violations are all verdict files not yet recorded. It raises no test-weakening flag and no dependency flag.
- Identity: 6cf4200 is by `builder <builder@agents.invalid>`. It has the `Agent-Session:` and `Spec: S-001` trailers, and no model names or co-author lines. Only files under src/ and tests/ changed.

## Test weakening
None.
- The `test(` count went up or stayed the same in every changed file (for example, ac83-page went 19 → 21 and ac84-timeline 13 → 15 since round 2).
- 6cf4200 removes one assertion line: the regex check on `.v2-stats .v2-mk` at ac84-timeline.test.mjs. Its replacement is stricter. It is an anchored exact match on `.v2-stats .v2-smk` (`width: 10px; height: 10px; color: inherit;`), plus a `stroke: currentColor` check on `.v2-k`.

## Round-2 findings
- **NB1 (a failed check silent to a screen reader): fixed.**
  - `markNode` now adds a visually hidden `<span class="sb-vh">failed </span>` after the hidden icon (src/public/sandbox.js:2152-2155).
  - In Chromium, Playwright's accessibility snapshot of J11's #40 marks row reads `✓ merged ✓ review failed checks`. A passing row reads `✓ merged ✓ review` then `– checks`.
  - The hidden span is 1 px wide and clipped. The gap from icon to word is still 2 px, and the icon sits 0.4 px from the word's midline. There is no sideways scroll at 360 or 414.
  - The new case is at ac84-timeline.test.mjs:470-494. All six of my mutations are caught: span dropped, name empty, span aria-hidden, name shown on screen, wrong name ("passing"), and the `.sb-vh` rule made visible.
- **NB2 (an unread v2.5 project saying "No open sprint."): fixed.**
  - `pageSentence` now returns the unread sentence when there is no tree, before it reads the sprint strip (src/lib/projectpage.js:69-70; the served copy is identical).
  - In Chromium I used the `unread25` fixture: Personal-Org-Operating-Model, can't read, never read. The page, the Timeline's phase line and the Team screen's phase line all read "Where it's heading: not available until the project's records are read." Home's tile reads "Now: not available". "No open sprint" appears nowhere.
  - The page and the tile now decide "unread" the same way in practice. A read only counts as ok once the tree has been parsed (src/lib/scheduler.js:700-711), and the tile tests `read !== 'ok' && !snap.tree`.
  - The new case is at ac83-page.test.mjs:581-606. All seven mutations are caught: guard removed, guard testing `snap` instead of `snap.tree`, guard removed in the served copy only, guard removed in src/lib only, the phase line alone saying "No open sprint.", the waits part kept, and the words changed.
- **N-a (the ✕ icon's colour): fixed.**
  - The icon now has its own class `v2-smk` with `color: inherit` (sandbox.css:1304).
  - In Chromium it renders rgb(92,95,102) in light and rgb(162,165,172) in dark. That matches its word and the ✓ marks, at 360 and 414.
  - Two of three mutations are caught. See R1 for the third.
- **N-b (dropping the failed mark's word): fixed.** The new case compares the whole spoken text of each mark, so dropping "checks" now fails ac84-timeline's new case.
- **N-d (CI with no model): fixed where I found it.** The new case at ac83-page.test.mjs:608-612 catches my round-2 mutation U6 (v2.5 CI "not recorded" when unread with no model). It also catches the reverse ("not available" even once read). See R2 for the Details line.
- **N-c:** unchanged, as expected. L4 is still missed, and the question stays with the Definer.

## The new words
- **"failed checks" as the accessible name: acceptable.**
  - The ✕ mark is only ever given for a recorded failure: J12's FAILURE or ERROR (src/lib/pulls.js:365), a review verdict of FAIL (feed.js:331), or a source-checker FAIL (feed.js:496). That is AC60's own meaning (specs/S-001.md:5038-5052), so "failed" states what the record says and makes nothing up.
  - AC81 asks that the mark keep "its word or its accessible name" (:6512-6517). The word "checks" stays visible, and the name is added for assistive technology only.
  - Small wording point: the same name gives "failed source-checked" for a research run, which reads awkwardly. It is not wrong.
- **"Where it's heading: not available until the project's records are read.": acceptable.**
  - These are the same words the v3 page has used since round 1, which round 2 accepted.
  - "not available" is the desk's word for records it couldn't read, as distinct from "not recorded" (src/lib/home.js:581-586). The sentence is true whether the first read is still checking or has failed.
  - It drops the waits part, as the function's own comment says it must.
  - The spec gives no unread form for either model (:6755-6759), so this is the build's reading. It invents no value.
- **Details' CI "not available" with no model: correct.**
  - The model is null only when building it threw an error (src/lib/universe.js:87-98, drawError). Then the desk cannot give CI's state, so "not available" is right, and "not recorded" would claim the records hold nothing.
  - The code comment says "No model yet (nothing read)". That isn't quite the case it covers, but what the screen shows is right.

## Mutations
62 run, 59 caught.
- The 44 from round 2 were re-run, with B1's three adapted to the new code, plus 18 new ones.
- The ones marked missed on the test subset were re-checked on the full suite. O12 to O15 are caught there, by j23-versions and the J7 case.
- 3 are missed: L4 (N-c), plus Na3 and Nd2, below.

## New findings (all non-blocking; route to Build; carry as risks)
- **R1. The icon's colour is only checked as rule text.** A later, heavier rule `.v2-timeline .v2-stats .v2-smk { color: var(--ink); }` passes all 958 tests (Na3). Chromium shows the colour is right today.
- **R2. Details' CI line has no test.** Turning src/public/sandbox.js:1117 back to `NOT_RECORDED` passes all 958 tests (Nd2). The case is an edge (a draw error only).
- **R3. Wording:** "failed source-checked" for a ✕ source-check. It reads awkwardly but its meaning is right.

## Join-up (Build)
Unchanged from round 1, plus one gain. The unread state now matches across Home, the page, the Timeline and Team for both v3 and v2.5 projects. Home says "Now: not available". The page and both phase lines say "Where it's heading: not available until the project's records are read." In the same fixture the page still shows "CI on main: not read yet", as AC29 gives it. That is consistent.

## Open questions
1. N-c, what "<n> more" counts, is still with the Definer.
2. Round 1's open questions 1 and 3 still stand: frame 8's top line, and the Chromium captures for the pull request.

Files:
- Mutation list: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv3r3-tools/muts.json
- Results on the test subset: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv3r3-tools/mut-out.txt
- Full-suite re-runs: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv3r3-tools/mut-full.txt
- Probe reused, unchanged: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3r2-out/probe.mjs