# S-001 desk v2, stage 8 (into the desk): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-8 at ec715da.

---

Verdict: FAIL

**The branch moved during this review.** This verdict is for ec715da, the commit I was asked to review. `build/builder/desk-v2-8` is now at e3cb774: one commit, "Stage 8, review round 1: restore .sb-unb-t; guard the removal; AC17 and AC18 on every answering sheet". Its CSS change restores exactly the rule behind my one blocking finding. I read its diff but did not capture or test it, so e3cb774 needs its own pass.

Stage 8 does what it says, with one exception. The desk now opens at `/` and looks like the trial view did. The "Sandbox: candidate design" line is gone, the tab title reads "Service Desk", and old icon and notification addresses land on the same screens. The exception: on the owner's tile on each Team screen, the "· unblocks: …" words lost their own style when the old styles were cleared out, so they show one size larger than the rest of their line. Nothing else changed that the owner would notice, and nothing here is irreversible.

**What I ran**
- **Worktrees:** fresh detached worktrees at ec715da and bd4097d, both removed at the end.
- **Fixtures:** head's for both, so only the page differs. They match at both commits, except the test loader in `sandbox-helpers.mjs`.
- **Captures:** a new harness, /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr8-h/ (`cap8.mjs`, built from the 6b harness). bd4097d at `/?sandbox` is in .../dr8-h/cap-base/, ec715da at `/` in .../dr8-h/cap-new/, and ec715da through old `?sandbox` addresses in .../dr8-h/cap-old*/.
- **Scope of captures:** fixtures main, extremes, sdq, unread25 and letters, plus portfolio states pf-cards, pf-x-cards, pf-q-one, pf-access, pf-fail and pf-none (`pf-fixtures.mjs`). Also signed-out, a forced render error, "No such project", and three taps: a gone key, a pull request and a decision card. All at 360×740 and 414×896, light and dark.
- **Comparison:** for every screen, each visible element's tag, classes, 25 computed style properties and size, in DOM order with the marker skipped, plus the screen's text and the tab title (`sty.js`, `cmp8.mjs`). Plain pixel diffs don't work here, because removing the marker moves every screen up.
- **Tests:** the locked page tests ac80-board, ac81-bar-type and ac48-62-63-look, plus ac88-dark: 51 of 51 pass. The full suite: 1,056 of 1,056 pass (.../dr8-h/suite.txt).

## Blocking finding (at ec715da)

**B1. `.sb-unb-t` lost its rule, so "· unblocks: …" on the owner's Team tile went from 12 px to 13 px.**
- **Rulebook:** part A item 8, type roles: one line now mixes 12 and 13 px. It also breaks stage 8's own scope, "looks exactly as the trial view", and the coordinator's check that nothing lost its rule.
- **Cause:** bd4097d:src/public/sandbox.css:361 `.sb-unb-t { font: var(--t-meta); }` was removed as dead, but sandbox.js:2919 still draws `span.sb-unb-t`.
- **Measured:** 12px/16.8px at bd4097d, 13px/18.85px at ec715da. The same line's "· waiting 13 d 11 h" stays 12 px.
- **Where:** the only element-style difference in the whole comparison. It covers every Team screen whose owner has queue lines: 24 captures in main, 120 in extremes, and sdq and letters, where the line also re-wraps and the tile grows.
- **Captures:** .../dr8-h/crops/unb-dr8-wt-c.png and .../dr8-h/crops/unb-dr8-base.png, from the sdq fixture at 414.
- e3cb774 restores the rule and adds `.sb-unb-t.gap` to the grey rule (not verified by me).

## Checks that pass at ec715da

- **Every screen at `/` matches the trial view at bd4097d.** Of 1,256 normal captures, the only differences are:
  - B1;
  - the marker;
  - the tab title, now "Service Desk — <state>" where it was "Sandbox — <state>";
  - the new hold and merge folds;
  - capture races in the running log's full-page shots. These go both ways; probed directly, the Members definer's log is 442/440 px at both commits.
  - A "5 h 2 m" against "5 h 3 m" waiting time in letters.

  Portfolio states: 516 of 516 identical. Signed-out, render error and tap screens: identical. Comparison output: `node cmp8.mjs` over .../dr8-h/cap-base and cap-new.
- **Old addresses.** Each lands on the same screen as its plain address, with identical text and history, and ends at `/` (.../dr8-h/oldaddr.mjs): `?sandbox#/p/…/team/<member>/now`, `#/waiting/card/<gate>`, `#/work`, `?sandbox=1#/p/…/timeline`, `?sandbox&open=actions-usage` (the project page, as plain), `?open=<hold>&sandbox`, the old Queue address (to `/#/waiting/Alpha`), and the v2.5 pipeline.
  - All 620 main captures loaded through `/?sandbox` match plain `/` (.../dr8-h/imgdiff-old.txt).
- **Taps, all four variants:**
  - `/?open=Alpha|pr|80` and the decision card each land on their sheet with "Opened from a notification";
  - a key that no longer waits lands on the project page with "That no longer waits on you";
  - the old `/?sandbox&open=…` forms land identically.
  - The page's service-worker handover listener is in place (sandbox.js:4151).
- **The Home Screen icon:** `start_url` is `/` (manifest.webmanifest), and build.mjs checks it. Notification addresses are `/?open=<key>` and `/` (src/notify/words.mjs).
- **No "sandbox", "trial view" or "candidate" in rendered text** on any capture at head. No owner-visible string in the code holds them either; what remains is in comments.
- **New on the sheets, rendered** with fixtures varied to `webCommitsToDefault: false`, `contentPrefill: false` or `linkCap` 300 (.../dr8-h/sheets-new/, `sheets8.mjs`):
  - **The web-commit message** (AC18): 12 px, 400 weight, ink, with a mark, in v2's mark-line form before the choices. That holds on question, numbered question, gate and decision sheets.
  - **The copy route** (AC17): words, the text in a `--bg2` panel, and a Copy button 52 to 111 × 36 px.
  - **"The whole record" fold** on hold and merge sheets, on `--bg2`: #f7f7f8 in light, #141517 in dark. Capture: folds-main-hold-…-360-dark.png.
  - Pull request sheets draw no fold.
  - All of it: no low contrast, no undersized targets, no sideways scroll, and only AC81 colours in light. In dark one extra colour appears on every sheet, which I didn't trace; the AC88 test, which checks dark against AC81, passes.
- **Nothing made up:** the hold and merge folds show the record file, and the copy texts are the answers the links carry.
- **Every head set:** nothing scrolls sideways, no text under 4.5:1, text boxes 16 px. The undersized-target measure lists the same kinds at base and head (412 and 420).

## Non-blocking findings

1. **Top spacing is tighter than the frames.**
   - With the marker gone, each screen's first row starts 4 px from the top. Team starts at 0, and the Timeline's pinned head at 0.
   - Mockup v2's `.scr` has 14 px top padding (desk-v2.html:97). Measured on Home: title box top 11.6 px against 23.6 px in frame H1.
   - Part B item 26, frames H1, 1, 5 and 11. A 14 px top padding on the screen would match.
2. **The copy route stacks every option's full answer file above the choices.** On a three-option question that is three monospace blocks before A, B and C, and the same files are in the "The whole question · and the file each answer writes" fold.
   - Capture: .../dr8-h/sheets-new/copy-letters-question-P_003_send_issue_md-360-light.png.
   - AC17 requires the text and a Copy button, but not where. Part A item 19 (technical detail one step down) suggests a Copy inside each option, as v2.5 sheets already do, or the texts below the choices.
   - With the real config (`linkCap` 6000, prefill on) the owner should rarely see it.
3. **The web-commit message's mark is the ✕ icon** (`vi('bad')`, drawn in ink), which reads as "close" or "fail". A neutral mark would suit a note better. Items 13 and 18.
4. **Carried from stage 7:** the seam between a Plan bubble's top row and its ground, and "Cost: –" on the Working now sheet.

## Open questions

1. **This diff edits two locked page tests.**
   - ac48-62-63-look: thresholds loosened from >600 lines to "found", >200 to >100 and >100 to >60, with new anchor assertions; the marker leaves the word snapshot; the `.sb-rail` and `.sb-rtag` checks are replaced.
   - ac81-bar-type: the marker rule's assertion is inverted.
   - The bd4097d versions, run against the ec715da page, fail 6 of 48. All six are those counts, removed selectors or the marker's words; none is a real scale or word violation.
   - Whether a builder may edit these is for the Reviewer and the Orchestrator.
   - To run those versions I wrote copies into the disposable scratch worktree and deleted them straight after; `git status` there was clean.
2. Should the top spacing in non-blocking 1 be brought to the frames' 14 px at stage 8, or left for a later pass?