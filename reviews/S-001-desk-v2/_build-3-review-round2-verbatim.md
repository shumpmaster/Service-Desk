# S-001 desk v2, stage 3 (the project page and its Timeline): the Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-3 at db35d08.

---

Verdict: FAIL

All four round-1 findings are fixed. All the runs pass, and no test was weakened. Two new blocking findings remain. Both are small, both go to Build, and neither needs Define:
- the ✕ fix lost the meaning of a failed check for screen readers;
- the Design reviewer's B2 fix misses a v2.5 project's sentence.

## Runs (detached scratch worktree at db35d08, now removed)
- `cd src && node --test ../tests/desk/*.test.mjs`: 955 tests, 955 pass, 0 fail.
- `node src/tools/build.mjs`: `build: PASS (2 connected projects; 34 page modules in step)`. The worktree was still clean afterwards.
- `bash governance/checks/check_all.sh . 28b829d`: exit 0, `OK: all governance checks passed.`
- `python3 governance/checks/surface_guard.py diff --range 28b829d..db35d08 --branch build/builder/desk-v2-3`: `OK: 6 commit(s) … checked`.
- `python3 governance/checks/review_check.py pr 999 --base 28b829d`: risk class R3 (src/config/projects.json), and design-reviewer, owner and reviewer are required. It reports 3 violations, all of them verdict files not recorded yet. There is no test-weakening flag and no dependency flag.
- Both new commits are by `builder <builder@agents.invalid>`, with `Agent-Session:` and `Spec: S-001` trailers and no model names. Only src/ and tests/ changed.

## Round-1 findings
- **B1: fixed.**
  - `markNode` draws ✕ with `vi('bad')` and keeps the word (sandbox.js:2152).
  - AC81's character case now reads `v2-proj`, `v2-timeline` with every fold open, `v2-phlpin` and `v2-sheet` (ac81-bar-type.test.mjs:242-265).
  - In Chromium, J12's fixture shows 3 ✕ icons at 10×10 beside "checks", and no ✕, ◆ or ▸ as text.
  - Mutations caught: ✕ back to text (fails 2 cases), and icon plus ✕ text (fails 2 cases).
- **N2: fixed.** All three mutations are now caught: counting every `## ` heading, leaving Kicked back out of the page's count, and leaving it out of the page's names.
- **N3: fixed.** The new case at ac83-page.test.mjs:464 renders a first-run project and a Done one. Three render-only mutations are caught: "Done." drawn as "Done", the strip dropped when Done, and "first time through" changed on the page only.
- **N4: fixed.** db35d08 changes comments only; I found 0 non-comment lines in its diff. I checked every new citation against specs/S-001.md, for example :6456-6464, :6559-6561, :6563-6565, :6768-6771, :6903-6906, :6913-6915, :6917-6926 and :6161-6164. All are right.

## Design fixes in 6bb850c
- **"not available" for an unread project:** true for a v3 project. The page uses the same test as Home's tile (`read !== 'ok' && !snap.tree`; sandbox.js:827 and :1031).
  - In Chromium, the unreadable v3 fixture shows "At work now: not available", "with the agents: not available" and "Experiments · not available". Its tile says "At work: not available".
  - CI keeps AC29's "not read yet", in Details and on the v2.5 page.
  - Five of the six mutations are caught. See NB2 for the v2.5 gap.
- **`.v2-pdetail`:** holds. The only `.sb-more` display rule is sandbox.css:132, and `.v2-pdetail` comes later at :1180 with the same weight.
  - In Chromium, opened, it is `display: block`, the summary is full width (328 px at 360, 382 px at 414), and the views sit under it.
  - Mutations caught: inline-flex, the rule removed, and a later heavier rule.
- **Experiments links:** 32 px tall, touching, 312 px wide at 360 and 366 px at 414. Both mutations are caught.
- **Measured "<n> more":** correct. On AC61's fixture, a control appears only where scrollHeight is greater than clientHeight. The false "1 more" under Why is gone. Three of the four mutations are caught; see N-c below.
- **Header-height classes:** the header bottom now equals the band top: 96/96 at 360 and 414, and 152/152 for the long name. Five refits kept the scroll position and one class, with no creep. Both mutations are caught.
- **h4 margins and the marks row:** both mutations are caught.

## Test weakening
None. No `test(` case was dropped in any file. The only changed assertion is AC84's "what stays": a ✕ mark now expects its word, plus a matching count of icons and no ✕ text. That is equal or stronger.

## Mutations
44 run, 41 caught. The 3 missed are listed under N-b, N-c and N-d.

## New blocking findings (route to Build)
**NB1. A failed check is silent to a screen reader.**
- AC81 (specs/S-001.md:6512-6517) says each icon-drawn mark "keeps its word or its accessible name".
- The ✕ icon is `aria-hidden="true"` (sandbox.js:1449) and has no name. Its word is only "checks".
- In Chromium the sprint's marks read `✓ merged✓ reviewchecks`. The failure is not said in text anywhere.
- Before the fix, "✕ checks" was at least different from "✓ checks".
- Fix: give the failed mark an accessible name, and test it.

**NB2. An unread v2.5 project's page and Timeline say "No open sprint."**
- Case: Personal-Org-Operating-Model with `fail: network` and never read.
- The page shows "No open sprint." directly above "Sprints: not read yet". The Timeline's phase line says the same.
- Home's tile for the same project says "Now: not available".
- Cause: in `pageSentence`, the v2.5 branch falls through to 'No open sprint.' when `sprintStrip` is untracked (projectpage.js:71). The v3 branch has its own unread wording at :76.
- This is the same kind of fault as the Design reviewer's B2: a value shown for an unknown.

## Non-blocking (carry as risks)
- **N-a.** The ✕ icon reuses the board card's `.v2-mk` class (sandbox.css:880). That rule sets `color: var(--ink)`, so the icon is #18191c while its word and the ✓ marks are #5c5f66.
- **N-b.** Not caught: dropping the failed mark's word. Both tests look for "checks" anywhere, and "✓ checks" supplies it.
- **N-c.** Not caught: counting every part instead of the hidden ones. The fixture's two-fact case gives 1 either way. See question 1.
- **N-d.** Not caught: CI "not recorded" for an unread project with no model. This is an edge case.
- **N-e.** Already there at 28b829d: an unreadable project shows "Phases: reading…" on its tile and page (src/lib/sandbox.js:245).

## Open questions
1. What does "<n>" count in "<n> more ▸"? The build counts parts not wholly shown, so PR #901's Context reads "2 more" while its first fact is partly visible. Frame 7b (desk-v2.html:674) puts "2 more ▸" after a whole first fact. That reads as the parts after it. The spec (:6921) doesn't say. Define, or the owner, should rule.
2. Round 1's open questions 1 and 3 still stand: frame 8's top line, and the Chromium captures for the pull request.

## Join-up (Build)
Unchanged from round 1. In addition, the unread state now matches across Home and the page for v3, but not for v2.5 (NB2).

Probe harness I reused (read-only, outside the repo): /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3b-out/probe.mjs. Mutation list and results: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv3r2-tools/mut-out.txt