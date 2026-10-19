# Pull request #148, the Design reviewer's setup: the Reviewer's round-1 report, verbatim

Dispatched by the orchestrator on 2026-10-19 against orch/design-reviewer at its first push.

---

Verdict: FAIL

The structure is sound: governance checks pass apart from the known `record_checks merges` failure, the risk-paths glob routes `src/public/**` to design-reviewer, and every quote I checked matches its source exactly. The PR fails on content. The rulebook says it lists "the owner's design rulings to date", but it leaves out standing rulings on main. Several of them conflict with its pass/fail checklist. The result is that the reviewer would fail work the owner explicitly ruled for, and would apply a redesign the owner hasn't ruled on yet.

## Findings

**1. BLOCKING: the ruling list is incomplete, and the missing rulings conflict with the checklist.**
- **Where:** governance/domains/design/README.md, lines 35–72, says "The owner's design rulings to date… A change that goes against one is a FAIL". The PR body says "The rulebook lists all your design answers to date."
- **Missing from it (all on origin/main):**
  - decisions/questions/P-001-trial-view-notes-1.md
  - decisions/questions/P-001-trial-view-notes-2.md
  - decisions/questions/P-001-design-lab-open.md
  - the main ruling of P-001-design-pick.md ("the five agreed screens … are the desk's one design direction"). Only its font line is cited, as replaced.
- **Direct conflicts** (`git show origin/main:decisions/questions/P-001-trial-view-notes-2.md`):
  - Note 4: "every text box's text is at least 16 px". This is also spec S-001 AC63 (specs/S-001.md:4497 "The exceptions: AC63's text boxes, at least 16 px"). Checklist item 16 allows "only 20, 15, 13 and 11 px, plus 14 px".
  - Note 13: "each phase has its own colour". Note 14: "Technical, Context and Why each have their own colour". Item 18 allows "at most five neutrals, one accent and two status colours", and the cited audit §5 says "Phases get no colour".
  - Notes 6(b), 7/8 and 17: "why: not recorded" / "reads 'not recorded'" on the main path. Item 6 fails any "not recorded" outside Details.
  - Note 5: "There is a lot of text … which i want specifically" / "Every word of text stays". This is in tension with items 9 and 14.
- **Effect on today's page:** it fails at once. src/public/sandbox.css:19 has phase colours (`--ph-disc: #0f766e; --ph-des: #9d2f7e …`). Lines 28–34 set type sizes 1.45rem, .74rem, 1rem, .94rem, .78rem and .9rem, at weights 800, 700, 600, 500 and 400. So every src/public PR would fail items 16 and 18.

**2. BLOCKING: the checklist settles an open owner question.**
- questions/P-001-redesign-direction.md is still open, with "DEFAULT: C" ("Board only for now — Build the board, and leave the other screens as they are").
- The README names it as open (line 74), yet items 6, 11, 14, 15, 16, 18, 19 and 25 are the audit's redesign brief (audit-2026-10-19.md §6, briefs 3–15). They are imposed as FAIL conditions on every src/public change.
- Item 15 ("No per-project tab bar") also conflicts with design-pick's five agreed screens, which the default keeps.
- There is no rule for a change that leaves the old screens in place.

**3. BLOCKING (it can't be answered yes or no): items 16 and 25 depend on "the chosen mockup".**
- README lines 211–213 and 228–229 refer to "the chosen mockup", citing docs/design/mockups/linear-inspired/README.md and redesign-direction.html.
- No mockup has been chosen. `git grep -il linear origin/main -- decisions questions docs/LEDGER.md` finds only P-001-design-discovery-notes.md, and no ruling.
- Item 25 also contradicts the source it cites. Audit §5 says "no gradients, no avatars, no shadows"; the linear README calls its shadows "One departure from the audit's brief".
- Two "tells" in item 25, "emoji as decoration" and "everything bold", are in neither research §12 / the research summary nor audit §5. They are untraced.
- "Labels in the owner's plain voice?" is a matter of taste, not a yes/no check.

**4. BLOCKING: the rulebook depends on documents that are on no route to main.**
- `git cat-file -e origin/main:<path>` returns N for:
  - docs/design/audit-2026-10-19.md
  - docs/design/inventory-2026-10-19.md
  - docs/design/references/research-2026-10-19-modern-mobile-design.md
  - both owner-request files
  - docs/design/mockups/linear-inspired/README.md
  - docs/design/mockups/redesign-direction.html
- All of them exist only on origin/orch/board-mockup, which has no PR (`gh api "repos/shumpmaster/Service-Desk/pulls?state=all&head=shumpmaster:orch/board-mockup"` returns empty). Open PRs are only #147 and #148.
- .claude/agents/design-reviewer.md:10 and README lines 211 and 229 cite these files without the "on orch/board-mockup" qualifier.
- Once merged, the reviewer's pack (`docs/design/**`) holds none of the checklist's sources.

**5. Non-blocking: owner words placed in the wrong sequence in the ledger.**
- docs/LEDGER.md L-0018 `asked:` says "The orchestrator proposed a new domain reviewer with a rulebook, a required verdict on the page's code and periodic audits; the owner said 'im pleased with that initial proposal so far'."
- The source, owner-request-2026-10-19-design-steward.md on board-mockup, reads: "how does the design review process work? Is it a new agent? Or a milestone? Or what - because im pleased with that initial proposal so far." The owner was still asking what form it takes. There is no record of the proposal as described before those words, so the claim can't be verified.
- The ledger is append-only, so this should be corrected before merge.

**6. Non-blocking: the PR body's plain-English paragraph overstates what it delivers.**
- "The rulebook lists all your design answers to date" is false (finding 1).
- "Nothing failed or was skipped" leaves out two things that the "Known limits" footer mentions only in file-path terms: the session runner doesn't list the reviewer (governance/RUNNER.toml [tools] has no design-reviewer), and its sources haven't landed. `record_checks merges` also fails before merge.
- "It audits the whole desk monthly" has no trigger mechanism behind it; it's hand-dispatched.
- Milestone/Context/Why form: fine. No `Word: value` ending.

**7. Non-blocking: the glob catches non-visual changes too.**
- What it catches, by design:
  - src/lib/*.js page modules, through the byte-identical copies that src/tools/build.mjs and CI enforce (.github/workflows/governance.yml:59, desk-build.yml:51). `npm --prefix src run build` → `build: PASS … 29 page modules in step`.
  - the icons.
- But it also requires design review for things with no visual effect:
  - src/config/projects.json, which is R3 and regenerates src/public/lib/config.js
  - src/lib/jobcand.js and ledgergrant.js, the R3 notification-sender logic, which are page modules
  - src/public/_headers (security headers)
  - src/public/sw.js
- The rulebook has no "nothing visible changed" path, and the full evidence set is screenshots at 360 and 414, light and dark.
- Server-side data selection (src/lib/api.js and github.js, used by functions/api/poll.js) is not covered. That's arguably correct.

**8. Non-blocking: smaller checklist gaps.**
- Item 22 (360/414 widths) cites nothing. The widths can be traced to the linear README's checks.
- Item 16's "plus 14 px" makes five sizes, while the brief 4 it cites says "At most 4 text sizes".
- Item 15 needs "the pull request's Why", which is not in the design-reviewer pack.

## Checked and found sound
- **Governance checks:** `GOV_BRANCH=orch/design-reviewer GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main` → all PASS except `FAIL record_checks merges --base origin/main` (3 first-parent orchestrator commits without `Item:` trailers, the known pre-merge case). Nothing else fails.
- **review_check:** it takes `pr <n> --files-from <file>`, or `classify <paths>`.
  - src/public/app.js → "Required reviews: design-reviewer, reviewer … (required by domain src/public/**)", class stays R1.
  - src/lib/board.js → "Required reviews: reviewer".
  - docs/README.md → none.
- **Follows the security pattern and AGENTS.md §2/§4:**
  - roster row `design-reviewer reviewer installed autonomous`, with an empty surface
  - an agent file with Read/Grep/Glob/Bash and no write tools
  - a PACKS role with `must_not_see = ["docs/reports/**"]`; `decisions/**` `-notes.md` files are excluded by session_runner.py:739
  - a `[paths."src/public/**"]` table
  - ledger L-0018 and the improvement-register row are in the same PR, and the digest is regenerated
- **Cited ruling files:** all 20 exist on origin/main. board-scope and redesign-direction are open in questions/ (board-scope is also being re-asked in PR #147).
- **Exact quotes:** all owner quotes match their sources: design-discovery Q3 and Q7, design-lab-1, board-layout, redesign-nav, the steward request, the scope request, and "a new agent, or a responsibility for an existing agent".
- **Rulings described correctly:** tile-clip, followup, spacing, board-direction, bounce, answer, done-keep, standard-milestones, gate-card, portfolio-read, portfolio-plan, after-agents and done-button.
- **Figures traceable to their sources:**
  - 20/15/13/11 px, weights 400/600/700, 36 px tap, 1,800 px and 414×896 → audit §5/§6
  - 4.5:1 contrast → WCAG / linear README
  - the three test projects and the three states → inventory §6 and §4
- **No owner pronouns:** grep finds only "them" and "their" referring to things, in diff lines 128, 146 and 229.
- **No model names, no private-repo passages:** a 10-word n-gram overlap against /home/user/Personal-Org-Operating-Model matches only template-v3 agent/security/PACKS boilerplate that Service-Desk already carries.

## Open questions
- Is the checklist meant to judge the redesign as the target, or the current agreed screens until redesign-direction is ruled? This needs an owner ruling, or a stated transition rule.
- Should orch/board-mockup's audit, research, inventory and owner-request files land first, or in this PR?

## Files
- /home/user/sd-orch-design/governance/domains/design/README.md
- /home/user/sd-orch-design/.claude/agents/design-reviewer.md
- /home/user/sd-orch-design/governance/risk-paths.toml
- /home/user/sd-orch-design/governance/PACKS.toml
- /home/user/sd-orch-design/docs/LEDGER.md
- /home/user/sd-orch-design/src/public/sandbox.css
- /home/user/sd-orch-design/specs/S-001.md
