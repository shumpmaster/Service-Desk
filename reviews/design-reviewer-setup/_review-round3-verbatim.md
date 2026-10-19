# Pull request #148, the Design reviewer's setup: the Reviewer's round-3 report, verbatim

Dispatched by the orchestrator on 2026-10-19 against orch/design-reviewer at 6d0b570, by a fresh Reviewer. A FAIL at round 3 goes to the owner under the stop rule.

---

Verdict: FAIL

**Base:** origin/main is fc62f64 ("Your answer: text boxes keep 16 px, everything else sized like Linear (#152)"). HEAD 6d0b570 contains it, since merge-base = fc62f64, so the branch is current.

Every round-1 and round-2 finding is fixed except the two notes below. Two new findings block. One leaves the reviewer with no test for a ruling it is meant to enforce. The other is a ledger line that is untrue.

## Blocking findings

**B1. "Sized like Linear" is listed as a standing ruling, but the pack gives no way to judge it.** The reviewer would wrongly pass or wrongly fail the next real PR, the board build.
- **What the pack says:** README:133 lists "Text boxes and element sizes follow Linear's as closely as possible". README:134–135 lists text-box-size A, "everything else is sized like Linear". README:129–130 lists the Timeline "given Linear's visual formatting". README:297–299 drops brief 4 because these rulings "now rule those points". So they are enforced now, through part A item 1 ("keep every standing ruling … that covers what it touches").
- **What the reviewer is meant to enforce:** the conflicts question as filed (60093fc:questions/P-001-redesign-conflicts.md) gives its blast radius as "what the next mockup draws, and what the Design reviewer enforces".
- **What is missing:** no part A item, and no reference for Linear's sizes. The only sizes written down are in docs/design/mockups/linear-inspired/README.md ("20, 15, 13 and 11 px … plus 14 px"). That mockup is unchosen, and README:51 says no mockup counts as chosen. The owner's 36 Linear screenshots (a zip, owner-request-…-design-steward.md) are not in the repo.
- **Effect:** any change that sets a size gets an undecidable item 1. That includes the board, which board-layout requires to be smaller. The reviewer either FAILs it as unverifiable (README:321) or passes without checking. The transition rule (README:48) names only the board, tabs and typeface rulings; it doesn't say how these sizing rulings apply now.

**B2. L-0018 says something untrue about which projects the reviewer checks against.**
- docs/LEDGER.md L-0018 `decision:` says each change is "checked against the inventory's three test projects".
- Those three are Service-Desk, POOM and the made-up Members Letter (docs/design/inventory-2026-10-19.md §6, "Two test projects, and one made up").
- The pack (README:226–231) checks the service-desk, poom and md-extremes fixtures, with Members Letter "once one exists". The PR body's own known limits say the same.
- The ledger is append-only, so this should be corrected before merge. It is a one-line wording fix.

## Non-blocking findings

**N1. Note 13 is not marked as narrowed.** README:95 keeps notes-2 note 13, "Each phase its own colour", standing. It is not named as narrowed by redesign-conflicts item 4 ("some colour or icons may mark phases"). A change that marks phases with icons only could be wrongly FAILed.

**N2. Brief 3 is described two ways.** README:297–298 says brief 3 is left out because the new rulings "now rule" it. Conflict 1 (README:335–339) says those rulings don't settle it.

**N3. The hold on the redesign-direction question is not recorded anywhere that governs it.**
- The question file still says `TIMEOUT: 48`. It was filed in e6d64d2 at 2026-10-19 18:37 UTC, so it times out around 2026-10-21 18:37.
- AGENTS.md §5 says a reversible question "adopt[s] the recommendation at timeout". The recommendation is A, not DEFAULT C.
- The quote README:44 relies on, "The redesign-direction question is held", is in the orchestrator's summary, which the source file labels "not the owner's words".
- The reviewer still behaves safely, because it treats only the owner's words as a ruling. But "its timeout default does not apply" has no rule behind it. Record the hold on the question itself.

**N4. Some rulings that touch the page are not listed, though the PR body's Why says "every standing design ruling".** Missing:
- github-app-links (answer links keep pointing at GitHub's new-file page)
- acting-route A
- m3a-when, m3a-done-when, m3a-estimator
- notify-job-merges
- notifications

Item 2's range also leaves out AC73–AC76 (the notification criteria), although README:372–377 says notification logic is visible to the owner.

**N5. The seven conflicts are accurate, but the list is incomplete:**
- Audit §4.14 cuts the "Not tied to a milestone" blocks. That is against notes-2 follow-up Q4(2), which README:93–94 lists as standing.
- Audit §4.7 cuts Team's tiles and running logs. That is against notes-1 note 11 and notes-2 note 30; conflict 3 covers it only partly.
- Conflict 3 doesn't say that redesign-conflicts item 3 already keeps the Timeline.

Nothing that is already ruled is listed as a conflict.

**N6. Two ambiguities could catch the board build:**
- redesign-nav's tabs are the redesign's own (Waiting, Plan, Projects). If the direction comes back C, nav A and direction C clash, and the pack doesn't anticipate that.
- Item 17 asks for "its own answer box", while board-answer C rules buttons that open a filled-in file. It's unclear whether a board card with buttons only passes.

**N7. One quote is not byte-exact.** README:228–229 quotes design-discovery answer 8 with straight apostrophes (they're); the source has curly ones (they’re). Every other owner quote I checked is exact.

**N8. The PR body misleads about the red check.**
- The plain paragraph says "Nothing failed", but the PR's governance check is red at 6d0b570.
- I rebuilt CI's merge ref in a scratch clone (6d0b570 merged onto fc62f64, run with PR 148). `record_checks merges` PASSES there. The only failure is `review_check pr 148`: reviews/148/owner.md and reviews/148/reviewer.md are missing, which is normal before review.
- The known-limits line names the local branch-tip failure, not the cause of the red check. Past orch/ PRs (#115–#135) passed governance in CI.

**N9. Item 6 has no ready way to render fixtures in a real browser.** The fixtures are fed to the fake DOM in tests/desk/sandbox-helpers.mjs (loadSandbox) and tests/desk/fake-desk.mjs (fakeServer). md-extremes is put together in code (sandbox-fixtures.mjs extremes()). It can be checked, but the first review will have to build a Playwright setup outside the repo.

## Earlier rounds

- **Round 1:** findings 1–8 fixed.
- **Round 2:**
  - 1 fixed: board-scope C, both conflicts rulings and text-box-size A are listed and accurately described.
  - 2 fixed, apart from the ledger line (B2).
  - 3 fixed: the WCAG 2.5.8 exceptions are quoted exactly; `--soft` is 3.18:1 light and 3.88:1 dark, as the pack says, and is carried as a follow-up under the new pre-existing-failure rule.
  - 4 fixed: all the rulings it named are added, and item 2 now covers AC35–41 and AC77–79.
  - 5 fixed: order of authority #2; design-lab-open answer 4 and design-pick's font line are named as replaced.
  - 6: answered by the orchestrator, and consistent with the records.
  - 7–12 fixed.

## Checked and sound

- **Governance checks:** `GOV_BRANCH=orch/design-reviewer GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main` gives only `FAIL record_checks merges`: 9 orchestrator first-parent commits without an `Item:` trailer. Everything else passes.
- **Build and tests:** `npm --prefix src run build` PASS; tests 769/769 pass.
- **Routing (`review_check pr`):**
  - src/public/app.js and src/public/lib/feed.js → design-reviewer and reviewer, R1
  - src/lib/board.js → reviewer only
  - docs/README.md → none
  - governance/domains/design/README.md → R3, owner and reviewer
- **docs/design:** `git diff --quiet origin/orch/board-mockup HEAD -- docs/design` exits 0 (PNGs included), and the PR only adds files under it. Every cited path exists.
- **Newest rulings and their quotes:** board-scope C, redesign-conflicts items 1–5 (including what is "not ruled") and text-box-size A match their records. So do the nav and type quotes, design-lab-1, board-layout, discovery Q3/Q7, the steward request and the scope request. The notes-1 and notes-2 note numbers in the pack match their sources.
- **Conflicts 1–7:** each audit citation (§4.3, §4.4, §4.5, §4.10, §4.11, §4.14, briefs 3/5/8/10/12) is correct.
- **Part A against today's page:** with the "what part A judges" rule, no item now fails every visible PR. `--you` is #d23c0f / #ff6a3d (sandbox.css:16, 42), and `.sb-last` is in OWNER_CORAL (test:23).
- **Pronouns, model names, private repo:** the only owner pronoun is "themself", which is gender-neutral. No model names or co-author lines in the diff or the commits. Against /home/user/Personal-Org-Operating-Model, the only 10-word overlap not already in Service-Desk is the template's agent-file description.

## Open questions

- What should the reviewer measure "sized like Linear" and "Linear's visual formatting" against before the next mockup is approved (B1)?
- Should the redesign-direction hold be recorded on the question, so the AGENTS.md §5 timeout can't adopt A (N3)?

## Files

- /home/user/sd-orch-design/governance/domains/design/README.md
- /home/user/sd-orch-design/docs/LEDGER.md
- /home/user/sd-orch-design/.claude/agents/design-reviewer.md
- /home/user/sd-orch-design/docs/design/mockups/linear-inspired/README.md
- /home/user/sd-orch-design/docs/design/inventory-2026-10-19.md
- /home/user/sd-orch-design/questions/P-001-redesign-direction.md
- /home/user/sd-orch-design/AGENTS.md
