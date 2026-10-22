# S-001 desk v2, stage 6a (the portfolio block): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-6a at 5edaaf3.

---

Verdict: PASS

I found no blocking issues in stage 6a (84c1224..5edaaf3). The block sits between Home's groups and the "More detail" fold. It makes up nothing. It reads nothing new, and nothing in it can write. Every 6a test fails when its rule breaks: all 34 mutations I tried were caught. Four of the Builder's readings go beyond the spec's words. Each one avoids saying something false, so none blocks, but Define should confirm the words (notes 1 to 4 below).

**Commands run** (in a detached worktree at 5edaaf3, now removed)
- `cd src && node --test ../tests/desk/*.test.mjs`: 1013 tests, 1013 pass, 0 fail. This matches the orchestrator's count.
- `node src/tools/build.mjs`: `build: PASS (2 connected projects; 36 page modules in step)`.
- `bash governance/checks/check_all.sh . 84c1224`: every check PASS, ending `OK: all governance checks passed.`
- `python3 governance/checks/surface_guard.py diff --range 84c1224..5edaaf3 --branch build/builder/desk-v2-6a`: `OK: 2 commit(s) in 84c1224..5edaaf3 checked`.
- `python3 governance/checks/review_check.py pr 999 --base 84c1224`: R1. It requires design-reviewer and reviewer verdicts. It fails only because those two verdict files don't exist for a dry-run PR number. It raised no test-weakening flag.
- Both commits are by `builder <builder@agents.invalid>`, each with `Agent-Session:` and `Spec: S-001` trailers. No model names.

**Checked against the spec and the owner's answers**
- **Where it sits (AC82, spec 6696-6700; portfolio-tab A):** Home's order is the groups, then `portfolio`, then `home-more-detail`, and the fold is still last. There is no Portfolio tab.
- **The AC82 rewrite (ac82-home.test.mjs:116, :126) is not a weakening.** :116 now expects the block between the groups and the fold. :126 still checks that the fold is Home's last child. Mutation M28, which moves the block above the groups, fails both AC82 and AC87.
- **The cap (src/lib/portfolio.js:61-84):** it counts only connected v3 projects whose now phase is Build or Launch. It reads the same `b.pv` (AC50) the tiles use. Done, Discovery or Design, v2.5 projects and render errors are not counted. It says "your cap: no record for this in the model yet" with the slashed circle, not the frame's "not set yet".
- **"Not read yet":**
  - "Decisions across projects", the rarer records, the line under the rows and Plan's ideas section all show 6a's exact words.
  - Plan's ideas line and the decisions row share one constant, `WA.ideasNotRead`.
  - None of 6b's words appear.
- **Model versions (:89-148):**
  - "latest" comes only from the `publishesModel` project's root `VERSION`. With none, it reads "latest: not recorded" and nothing is compared.
  - A missing file reads "not recorded"; a file not read yet reads "not available".
  - A version that isn't three whole numbers reads "<text>, not compared".
  - The v2.5 publisher reads "runs the v2.5 pipeline, publishes <VERSION>".
- **No new reads, read only (A3 cost 0):**
  - The source diff adds no `fetch`, no `neededReads` entry, no storage, no URL and no token (grep of the added lines found none).
  - `portfolio.js` is pure. The block's only links are `#/pf/<row>`, and it has no buttons or forms.
  - The A3 sum is untouched, and the AC14 test passes.
- **No private content:** no fixture file was added.
  - Service-Desk's records and its `3.5.0` are real, from 77bfeae.
  - The other projects are made up and labelled NOT real in the test and in fixtures/README.md.
  - Personal-Org-Operating-Model uses the existing poom/ placeholders plus a placeholder `VERSION`. The public mockup already shows that value, 3.5.0.
  - Nothing from the portfolio is used.
- **AC87's 6a test list is covered by tests/desk/ac87-portfolio.test.mjs:**
  - no portfolio in J7 (:95);
  - 6a's words in every row and in Plan (:94-107);
  - the cap from J11's phases (:127-171);
  - versions with one behind, one missing and no latest (:176-207);
  - each row's sheet (:231-296);
  - no reads and no writes (:301-315).

**Mutations** (in a scratch copy; every one was caught): Design counted; Launch dropped; Done, v2.5 or render-error project counted; an unknown phase left out silently; minor count off by one; patch counted as minor; lower major not said; never "behind"; a made-up latest with no publisher; the publisher's words; "not recorded" and "not available" swapped; no colon in "latest: not recorded"; 6b words in decisions, the rarer records or the line under the rows; the rarer records row not soft; scorecard marks the same; cap mark dropped; rows out of order; "not set yet"; "none" dropped; "not read yet" turned into "not recorded"; block above the groups; mark after the words; a GitHub write link or a button in the block; phases ignored; Setup P1 line dropped from the sheet; marks not aria-hidden; no sheet opening; Plan's ideas words changed.

**Join-up review (the parts working together):**
- Home's order works with AC82.
- The block reuses stage 3's version reads. The versions sheet shows AC83's top line for each project.
- The cap uses the same phase view as the tiles.
- Plan's ideas line uses the same words.
- The sheets open over Home at `#/pf/<row>` with no history step. They close with the button, a tap outside or Escape, and the focus goes back to the row.
- No blocking difference. The one difference from frame H4, where the marks sit, is note 4.

**Non-blocking notes** (carry as risks)
1. **A v3 project with no known phase is named, not counted (portfolio.js:65, :81). Route: Define, for the words.** AC87 only gives "In Build or Launch: <names>" or "none". The Builder adds "<project>'s phase: not read yet / not recorded / can't be read". A bare "none" would claim a record the desk hasn't read, so this follows the owner's rule. Also, a project whose first read failed says "not read yet" while its tile says "Can't read" (test :162-171). That is true, but softer than the tile.
2. **"Patch" and "major" behind (portfolio.js:99-109). Route: Define.** AC87 counts only minor releases within a major, which leaves a lower patch ("0 behind"?) and a lower major without words. The Builder's "<k> patch release(s) behind" and "<k> major release(s) behind" are true, but they are new words.
3. **A v3 publisher's words (portfolio.js:143). Route: Define.** The spec only gives "runs the v2.5 pipeline, publishes …", which would be false for a v3 publisher that J7 allows. The Builder writes "<project> <version>, publishes <VERSION>". No connected project is in this case today: Personal-Org-Operating-Model is v2.5.
4. **Where each mark sits. Route: the design reviewer.**
   - Frame H4 draws one mark in each row's leading column. The build leaves that column empty and puts each mark inline, before the part it marks (sandbox.js pfLine; sandbox.css:1047-1053). AC87's "the three states' marks" for the scorecard's two parts supports this reading.
   - The mark is held to its first word so it can't end a line alone. Only a capture at 360 px would confirm that, and the suite can't test it.
5. **AC87's own A3 case (test :301-311) is weak.** It checks only which projects are called and that no request names the portfolio. When I made every project read its root `VERSION` too, only J23's test caught it.
6. **Small record slips:**
   - sandbox.css:1046: the comment for "More detail" now sits above the portfolio rules, not above `.v2-mdetail`.
   - fixtures/README.md: it says "Unread", "Broken" and "No run" are Service-Desk's records under another name. In the test they have no records at all (test :154-158).

**Open questions**
- Should Define write the words for notes 1 to 3 into AC87 before 6b, so 6b doesn't inherit unwritten readings?
- The commit messages summarise the Builder's work. I read them, but my findings rest on the code and the tests alone.

Cleanup: my worktree and scratch copies are removed, the main checkout is unchanged, and the branch is still at 5edaaf3. The scratchpad has other sessions' files, including Builder handbacks, which I did not open.