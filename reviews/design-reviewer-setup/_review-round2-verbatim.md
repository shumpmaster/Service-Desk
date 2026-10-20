# Pull request #148, the Design reviewer's setup: the Reviewer's round-2 report, verbatim

Dispatched by the orchestrator on 2026-10-19 against orch/design-reviewer at 25a924f, by a fresh Reviewer.

The orchestrator's answer to open question / finding 6 ("Which four questions did 'A on all four' answer?"): the four put in the session just before were tabs (P-001-redesign-nav), typeface (P-001-redesign-type), PRs with the agents (P-001-board-after-agents) and the Done button (P-001-board-done-button). The redesign-direction question was held and not put. The records in f01e70f are correct.

---

Verdict: FAIL

The round-1 fixes mostly landed, but three things still block. (1) origin/main moved during this review, so the rulebook is now out of date and the governance checks fail on it. (2) Part A item 6 can't be checked for one of its three test projects, so it fails every change you can see. (3) Part A items 10 and 11 fail today's Status screen: item 11 because the checklist misstates the standard it cites, item 10 because the page really is below WCAG contrast.

## Findings

**1. BLOCKING: the rulebook is stale against origin/main.**
- origin/main went from 92184a0 to 60093fc between 21:07 and 21:13 UTC, while I was reviewing. It added:
  - #149: decisions/questions/P-001-board-scope.md, ruling C ("one board, grouped by project")
  - #150: two new open questions, questions/P-001-redesign-conflicts.md and questions/P-001-text-box-size.md
- governance/domains/design/README.md:147 still lists board-scope as "Still open, so not rulings". It names neither new question.
- README:251–252 says "The orchestrator puts them to the owner with the redesign-direction question". The filed questions don't match that:
  - P-001-redesign-conflicts puts five conflicts to the owner, not nine.
  - Its item (5), text boxes of at least 16 px, is not in the README's conflict list.
  - README conflicts 4 (legends), 5 (navigation), 6 (answer boxes), 8 (reading order) and 9 (typeface) are put to the owner nowhere.
- The PR body says "it lists nine places … for you to decide". The owner was asked about five.
- Check result: `GOV_BRANCH=orch/design-reviewer GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main` now gives `FAIL governance_checks all`: "questions/P-001-board-scope.md: added in the range, but its answer record … is already on the base origin/main: a reused name". This is because the branch hasn't merged the new main. It's in addition to the known `record_checks merges` failure (6 orchestrator commits without `Item:`). So "Nothing failed" is untrue against the current base.

**2. BLOCKING: part A item 6 can't be verified, so it fails every change you can see.**
- README:169–173 requires each change to "render without error or overflow" for all three test projects, including the made-up "Members Letter".
- No fixture for it exists. `grep -rli "members letter" tests/ src/` finds nothing. tests/desk/fixtures has service-desk, poom and md-extremes only.
- It can't be on the preview, and the reviewer may not create files (agent file:12).
- README:245 says "An unverifiable claim is a FAIL", so every visible src/public PR fails item 6.
- This is a checklist error, not a defect in the page. The periodic audit (README:312–313) has the same problem.

**3. BLOCKING: part A fails today's Status screen through items 10 and 11.**
- **Item 11 is a checklist error.** It requires "every other tap area at least 24 by 24 CSS px (WCAG 2.2, 2.5.8)" but drops the standard's own exceptions: inline, spacing, equivalent, user-agent and essential.
  - The "Your last action" record link is an inline `<a class="code">` (sandbox.js:1086) in `--t-code` .74rem/1.3, about 15 px tall (sandbox.css:30, 79, 621).
  - The same applies to "Done today" rows (sandbox.css:646).
  - WCAG exempts these as inline targets; item 11 as written fails them on every project's Status and Queue.
- **Item 10 is a real defect in the page.** Softened milestone text uses `--soft` (sandbox.css:366–367) on `--surf` (sandbox.css:340).
  - Contrast is 3.18:1 in light (#8a919a on #fff) and 3.88:1 in dark (#6f7680 on #16181c), below 4.5:1.
  - It is applied to every skipped or not-recorded standard milestone (src/lib/feed.js:87, 92, 96). Service-Desk has 0 standard lines recorded, so these show on its Status screen.
  - The ruling asked only for "softer" text (notes-2 note 11). It sets no colour, and S-001 sets no value either, so a compliant shade would satisfy both. This is a fair finding against the page.
- **Missing rule:** the pack doesn't say how to treat a failure the change didn't introduce, for example fail it, or carry it as a risk. Without one, any PR whose screenshots include Status fails.

**4. Non-blocking: standing rulings on main that touch the page and aren't listed.**
- P-001-build-path.md Q1 is the base rule for what counts as "needs you": open PRs awaiting the owner's approval or merge; other PRs are activity only.
- P-001-o6-fallback.md (A) and P-001-dor-fixes-round3.md Q3: the context window shows "not available". This also belongs in conflict 1, though S-001 AC41 covers it.
- P-001-s001-owner-questions.md: times are shown in America/Chicago.
- P-001-notify-which-view.md: the icon and notification taps open ?sandbox.
- P-001-usage-and-context.md (B): tokens and context are shown.
- P-001-design-discovery.md answer 8: "new since you last looked" markers.
- Notes-2 notes 28–31 are not summarised: Home tile phases, Queue icons go neutral, Team cards name their sprint, one phase marker everywhere, and Pipeline folds into Timeline. Note 35 (safe-to-approve) is not summarised either.
- Item 2's range (README:159) leaves out AC35–AC40, though AC43 names "each AC35–AC41 criterion" as MD's look criteria. AC35 says waits are "never pooled into one combined list", which is central to the board. It also leaves out the shown-on-desk AC77–AC79.

**5. Non-blocking: later rulings against earlier ones.**
- There is no general rule that a later ruling on the same point replaces an earlier one. The README applies one only for notify-deploys (line 120) and for the spec (line 34).
- So README:100 lists design-lab-open answer 4 ("phase checklist in words") as standing, though notes-2 note 28 and AC58 replaced it (S-001 AC48: "Changed by AC58").
- For conflict 9: redesign-type (2026-10-19) has the blast radius "the page's typeface", not just the redesign (question as filed in e6d64d2). It is five days later than design-pick's font line.
  - Asking the owner rather than picking is defensible.
  - But it hasn't been asked anywhere, and AC42's ban on fonts from another origin (the audit's Plex comes "from Google Fonts") is the real tension.

**6. Non-blocking: the record is ambiguous on "A on all four".**
- PR #141 (e6d64d2) filed four questions together: direction, nav, type and after-agents.
- The owner answered "A on all four". The records (f01e70f) apply that answer to nav, type, after-agents and done-button; done-button was filed separately, in f1e589e.
- The transition rule depends on redesign-direction being open. The orchestrator should confirm which four were put, since it was the same session.

**7. Non-blocking: conflict-list accuracy.**
- Item 26 says "see conflict 2", but conflict 2 never mentions notes-2 note 4 or AC63 (the 16 px text boxes).
- Brief 2's cross-project opening board against AC35 and design-lab-1 ruling 6 is not listed. Board-scope C now settles part of it.
- Conflict 5 quotes the lab's bar "Status · Timeline · + · Team · Queue" (docs/design/README.md:35). The bar as built is "Status · Timeline · Team · Queue": AC48 says "The lab's '+' … is not built". The conflict itself still holds.

**8. Non-blocking: items 14 and 10 will raise false findings against the spec.**
- Item 14 lets the "needs you" colour mark only what needs the owner. AC48's coral is "the owner", and AC69's list and test allow `.sb-last`, the coral "Your last action:" label (tests/desk/ac69-72-audit-additions.test.mjs:23, 39).
- The spec sets the run-3 and run-4 shades at "at least 3:1" (S-001:3775), and they are used as text in `.sb-rtag` (sandbox.css:354), at 3.89:1 and 3.81:1 against item 10's 4.5:1.
- The order of authority settles both, but the wording invites wrong FAILs.

**9. Non-blocking: item 22 is not a yes/no question.**
- "Default component tokens" and "rounded shadowed cards" come from research:36, which itself says "mostly taste" and notes that almost no web fetch succeeded.
- Today's approved boxes are rounded with inset-shadow stripes (sandbox.css:341, 691).

**10. Non-blocking: "No visible change" examples point the wrong way.**
- README:299–303 offers "configuration", "security headers", "the service worker" and "notification logic" as things that change nothing on screen. Each can:
  - src/config/projects.json regenerates src/public/lib/config.js, which sets the Home cards.
  - A Content-Security-Policy change alters what loads.
  - sw.js decides which version of the page is served.
  - Notification logic decides when a notification shows, and with what words.
- The closing sentence ("any words, layout, colour or behaviour the owner sees") plus the evidence demand closes the loophole, so this is wording only.

**11. Non-blocking: the transition rule is ambiguous in two places.**
- "A direction the owner has ruled" (README:43) could also mean board-direction, redesign-nav or redesign-type. The board build, the next PR, meets this at once.
- The pack doesn't say whether redesign-direction's DEFAULT C, applied on the 48-hour timeout, counts as "ruled".

**12. Minor: README:95 says "The owner's description of themself".** It is gender-neutral and matches the project's convention since a98e456. Change it only if the rule is no owner pronouns at all.

## Round-1 findings: status
- **1:** mostly fixed. The two trial-view notes, design-lab-open and design-pick's main ruling are now listed. The gaps are in finding 4.
- **2:** fixed by the transition rule and the A/B split.
- **3:** fixed. No mockup counts as chosen, the untraced "tells" are gone, and "no shadows" now cites audit §5.
- **4:** fixed. `git diff origin/orch/board-mockup HEAD -- docs/design` is empty, and every path cited resolves on HEAD.
- **5:** fixed. The asked line quotes the owner in order, and every quote is exact against owner-request-…-design-steward.md.
- **6:** partly fixed. "nine … for you to decide" now mismatches the five actually filed, and "Nothing failed" no longer holds (finding 1).
- **7:** fixed by the "No visible change" path (see finding 10).
- **8:** fixed. 14 px is dropped, the widths cite S-001, and the "pull request's Why" is dropped.

## Checked and found sound
- **Routing:** `review_check pr <probe> --files-from` gives:
  - src/public/app.js → "Required reviews: design-reviewer, reviewer (required by domain src/public/**)", R1
  - src/lib/board.js → reviewer only
  - docs/README.md → none
  - `classify` prints only the class. The governance files are R3.
- **Tests and checks:** `npm test` (src) gives 769 pass, 0 fail. All other governance checks pass.
- **Order of authority** (README:32–37) is stated and coherent, and no part A item conflicts with a standing ruling once you apply it.
- **Item 9 passes today:** text boxes are 16 px (sandbox.css:459, 654), and the viewport doesn't lock zoom (index.html:5).
- **Descriptions match their rulings:** the notes-1 and notes-2 summaries, design-lab-open, design-pick, design-discovery, design-lab-1, answer-pr-on-desk, notify-deploys (it does replace followup line 1), notify-more-detail, cos-sessions, asks-merge-on-desk, design-step, redesign-nav and redesign-type.
- **Part B numbering and quotes match audit §4–§6.**
- **The rest of the PR is consistent:** PACKS role (`{ruling}` is a documented placeholder), roster row, empty surface, agent file (read-only tools, the `-notes.md` exclusion), the ledger and digest, and the improvement-register row.
- **No model names, and nothing pasted from the private repo:** the 10-word shingle overlap is template boilerplate only, which Service-Desk already carries (governance/domains/security/README.md:5, template agent files).
- **PR body, otherwise:** accurate. That covers the rulings coming first, not enforcing the redesign until a direction is chosen, the hand dispatch and the landed documents.

## Open questions
- Which four questions did "A on all four" answer (finding 6)?
- Should part A judge only what a change adds, or every touched screen as a whole (finding 3)?
- Should a Members Letter fixture be built, or item 6 limited to the fixtures that exist (finding 2)?

Files: /home/user/sd-orch-design/governance/domains/design/README.md, /home/user/sd-orch-design/.claude/agents/design-reviewer.md, /home/user/sd-orch-design/src/public/sandbox.css, /home/user/sd-orch-design/src/public/sandbox.js, /home/user/sd-orch-design/src/lib/feed.js, /home/user/sd-orch-design/specs/S-001.md, /home/user/sd-orch-design/tests/desk/ac69-72-audit-additions.test.mjs, /home/user/sd-orch-design/docs/design/inventory-2026-10-19.md
