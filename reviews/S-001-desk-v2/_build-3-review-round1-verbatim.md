# S-001 desk v2, stage 3 (the project page and its Timeline): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-3 at b3e2156.

---

Verdict: FAIL

One blocking finding, and it is small. Everything else holds: the suite, the build, the checks, J7's new key, J23's reads and the test rewrites. The private-content rule also holds. The fix goes to Build, and nothing needs to go to Define first.

## Runs (in a detached scratch worktree at b3e2156, now removed)
- `cd src && node --test ../tests/desk/*.test.mjs`: 946 tests, 946 pass, 0 fail.
- `node src/tools/build.mjs`: `build: PASS (2 connected projects; 34 page modules in step)`.
- `bash governance/checks/check_all.sh . 28b829d`: every check PASS, ending `OK: all governance checks passed.`
- `python3 governance/checks/surface_guard.py diff --range 28b829d..b3e2156 --branch build/builder/desk-v2-3`: `OK: 4 commit(s) … checked`.
- `python3 governance/checks/review_check.py pr 999 --base 28b829d`: risk class R3 (src/config/projects.json). Required: design-reviewer, owner and reviewer. It reports 3 violations, and all three are missing verdict files that are not recorded yet. There is **no test-weakening flag and no dependency flag**.
- Commits: all four are by `builder <builder@agents.invalid>` with `Agent-Session:` and `Spec: S-001` trailers. No model names. Nothing changed under governance/, .github/, docs/ or intake/.

## Blocking findings

**B1. The Timeline draws "✕" as text. AC81 forbids that on a mockup-v2 screen, and AC81's character check does not look at the new screens. Routes to Build.**
- AC81 (specs/S-001.md:6389-6392, and its test at :6563-6564) says every screen built to mockup v2 uses IBM Plex served by the desk, and that "◆, ✕, ▸ and ⇅ appear only as SVG icons". Stage 3 rebuilds the Timeline to frame 7b. It now sits in `.v2-timeline` and `html.v2-page`.
- `src/lib/feed.js:331` and `:496` give a sprint mark `{ mark: '✕', … }`. `sandbox.js` `markNode` writes `${m.mark} ${m.word}` as plain text.
- How I found it: I rendered `#/p/Service-Desk/timeline` from the J11 and J12 fixtures with every fold open, then checked each character against the served Plex Sans `unicode-range`. Result: `AS TEXT ✕ … ✓ merged– reviewreview not recorded✕ checks…` and `OUTSIDE U+2715 "✕"`. The page, the Team screen and the v2.5 project's screens were clean.
- Why the suite misses it: the AC81 case at tests/desk/ac81-bar-type.test.mjs:220 only collects text from `v2-board`, `v2-bar`, `v2-row` and `v2-sheet`. So it never reads `v2-proj` or `v2-timeline`. This stage did not extend it to the screens it builds.
- Fix: draw the failing mark as an icon, as the bar and board do, and keep its word so AC84's "every word stays" still holds. Extend AC81's character case to the page, the Timeline and the Team screen's phase line.

## Checked and holding

**J7 and J23, the security review (R3)**
- `publishesModel` is checked at build: only `true`/`false` (src/lib/configcheck.js:91), at most one entry (:100), allowed on a v3 entry.
- It can't widen what is read. It adds only the root `VERSION`, and only for the marked project (src/lib/model.js:364).
- The three reads are optional blobs, registered only with `ctx.j11`, so the accepted view and the sender read none. They travel in the existing blob call by sha (src/lib/github.js blob form, unchanged). No function file changed. Only the tier is kept in the cache.
- Mutations: allowing two marked entries, allowing a wrong-kind value, reading VERSION for every project, making a read a required one, and dropping the `ctx.j11` guard were each caught by j23-versions.test.mjs.
- A3: the j23 test shows each blob asked for once in an opening, inside a call made anyway, and asked again only when its sha changes.

**Private content**
- The two new fixture files, `j11-77bfeae/AGENTS.md` and `governance/OPERATING_MODEL_VERSION`, are byte-identical to `git show 77bfeae:…`.
- The operating-model project's `VERSION 3.5.0` and `tier: T1 # placeholder comment` are written inline and labelled NOT real, including in tests/desk/fixtures/README.md.
- The sprint file names the new test uses already existed in the poom/ fixtures. I found no new private content.

**Nothing made up**
- Counts, "Standard: k of n", tier, version and dates all come from records or the model's table.
- "Standard: 0 of 6 recorded" and the other detail lines match frame 5 (desk-v2.html:571-574).
- A file not yet read shows "not available"; a missing one shows "not recorded".

**AC83, AC84 and J23 tests**
- Every listed part exists, and Service-Desk's records are real (77bfeae and 3117150).
- I ran 41 mutations. 39 were caught. Among the caught ones: bottom-up order, the why line, the three states, the experiments count, the "Not used" rows, firstPart's ".", the Team line differing, scroll at Now, a label colour, a heavy band rule, cutting long Context, no "Checking…", the top row put back, and both rows' targets.

**Test rewrites**
- No test was dropped; every file has the same count of `test(` cases.
- Each rewrite replaces the Status screen, its boxes, drawing and marker, or the top row. That is what AC81's "From stage 3" and the "Changed by AC83/AC84" notes call for (:4235, :4478, :4740, :4927, :5613).
- I judge none of them a weakening. The AC56 tick case drops `#/p/Alpha` but adds a made-up `Quiet` project, where the live text must change.

**A3 and AC14**
- I added the three J23 files to AC14's fixture repos in scratch. Two cases rose by 10 calls a day: J12 failing went from 5180 to 5190, and AC79 from 6561 to 6571. Every bound still passed, including at most 16 blob calls a cycle, and every case stayed under 10,000.

## Non-blocking (carry as risks)
- **N1.** AC14's committed cases hold none of J23's files, so they don't measure J23's cost. My probe above shows the bounds hold.
- **N2.** Two mutations were not caught:
  - Counting every `## ` heading as a ledger entry (records.js:732). The placeholder ledger has no other heading.
  - Leaving "Kicked back" out of the page's "n wait on you" count (sandbox.js `pageWaits`). No fixture has a kicked-back card.
- **N3.** AC83's test names "a project in its first run" and "Done" as page renders. They are checked only through the pure functions (`pageSentence`, `phaseStrip`), not on a rendered page.
- **N4.** Many rewritten cases cite a criterion but no spec line: ac24, ac51, ac80, ac69, j11-timeline. Several cited lines are off by about 8:
  - "the bands :6911-6914" is really :6903-6906.
  - ":6929 never boxed" is really ~:6920.
  - "AC84 gone :6932-6934" is really :6923-6926.
  - ":6765-6768" is really :6768-6771.
  - ":6556-6558" is really :6559-6561.
- **N5.** Smaller differences from the spec:
  - The opened phase's head for the now run reads "Run 2 · 8 Oct – now", with no "how it ran". No record gives frame 6's words.
  - The v2.5 page's CI row has no workflow or date.
  - A folded "Status icons" key sits at the Timeline's foot (a C reading, which keeps AC59's words).

## Join-up review (Build): the parts together
These paths are driven end to end by the suite, under the fake DOM:

| Path | Result |
|---|---|
| Home tile → page | Works; Overview is current. |
| Page → "n wait on you" → Waiting filtered → Back | Works. |
| Page → "At work now" → Team → phase line → Timeline at Now | Works. |
| Overview ↔ Timeline switch | Works. |
| `p/<name>/queue` and `p/<name>/queue/<key>` | Both open Waiting filtered. |
| Details → Time asked and Agents | Both open. |
| One count across screens | The page's count equals the tile's and the board's (7 in ac80). |

One difference besides B1: the Team screen keeps its old look under the new phase line until stage 7. That is the mixed look the spec already lists under Risks. Non-blocking.

## Open questions
1. Spec against frame 8: the spec's form gives the operating-model project "v2.5 pipeline · model not recorded · T1 · publishes model 3.5.0". Frame 8 draws "v2.5.1 pipeline · T1 · publishes model 3.5.0". The build follows the spec, which is the right reading. If the owner wants frame 8's form, Define should change the spec.
2. AC84 and AC81 can be met together: AC84 keeps every word, AC81 keeps ✕ as an icon. Keeping the mark's word and drawing the ✕ as an icon satisfies both, so B1 needs no Define ruling.
3. I did not see the stage's Chromium captures and sideways-scroll check at 360 × 740 and 414 × 896, light and dark, that AC81 and AC84 require. They must go on the pull request.