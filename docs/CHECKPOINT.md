# Checkpoint — latest

*Written at the end of every working session, so the owner can read it in under two minutes.
Before each new one, move the previous one to docs/checkpoints/CP-NN.md.*

# CP-01 — 2026-10-24

## Where we are (≤ 4 sentences, plain language)
The new desk is done twice over: MD3 (the chosen design on the real back end) was accepted on 23 October, and M3D (the audit's faults fixed and the owner's design answers built) on 24 October. All nine M3D steps are merged, reviewed and live on the preview, https://service-desk-preview.pages.dev/. Nothing is broken or waiting on a fix. The next pieces of work start in a fresh session.

## What this session produced (ledger IDs, PRs, runs)
- M3D steps 1 to 8: pull requests #204, #205, #206, #208, #209, #210, #211, #212, #213; reviews in reviews/M3D/ and reviews/<PR>/; captures in docs/design/builds/m3d-*/.
- The owner's answers recorded: the portfolio marks stay as built (#207); M3D accepted (question #214, record #215).
- Earlier in the same session: MD3 accepted (#198), the design audit (#194), the after-MD3 plan (#203), and lesson LL-025 in the operating model (its PR #36).

## What went right / what didn't
- Right: every step passed both reviewers before its PR opened, and the owner merged and deployed each one in turn.
- Didn't: step 6a took four Reviewer rounds (two FAILs, one short of the stop rule); a calculation without a browser was settled by the Design reviewer's real render. Step 7 failed round 1 on a reload losing the 5-minute check. The session ran long enough to need one summary of its own context.

## Open threads, each with its exact next step
1. **The operating-model change from LL-025** (owner-approved, queued to follow the desk's stage 8, now due). Next step: in a fresh session on Personal-Org-Operating-Model, the Chief of Staff briefs its Definer with LL-025's three proposals (a kickoff check for a work type with no playbook; groundwork required, with a check; a standing "what the model can't do yet" list) for a new spec.
2. **The planner's follow-ups from M3D** (none blocking; listed below). Next step: the Chief of Staff gives the list to S-001's Definer for the next amendment, when the owner orders it.
3. **M3B and M3C toward launch** (value targets on the desk; the desk at the needs-you address; V4's date 2026-11-11). Next step: the Chief of Staff orders them against items 1 and 2 with the owner.

## Questions waiting on the owner
None. The next session's first ask is the order of the three threads above (recommended: 1, then 3, with 2 folded into M3B's plan).

## Appendix: the planner's follow-ups from M3D's reviews (none blocking)
## M3D follow-ups (stage reviews)
- Stage 2: tests for D1 (cannot-read keeps words), D7 (restore stops on input), D9 (kept scroll removed after use); cap the scroll restore by time/drawings before first read; recorded-answer words kept until merge (Define to note).
- Stage 3: tests for P5 (ordering view unchanged) and H1 (lone tile keeps its reason); Define: Plan partial "no estimate yet" vs "no estimates yet"; Home partial "<k> of <n> projects".
- Stage 5: Define to write in as C the copy-failure words and per-Copy names; test Q5 (due mark boundary), Q15, G3; unify v25Ruling and v25RulingText.
- Stage 4: none new.
- Stage 2 design N1: after a reload, focus on Close that the restored sheet scroll hides (sticky sheet head?); N2: Move to Done leaves focus on body (older).
- Stage 6a: Define to write in as C " · <workflow> · date not read" and the CoS Cost line "not recorded: no piece of its work is under way".
- From the M3D step 6a/6b Reviewer (2026-10-23), non-blocking test gaps:
  - X2: the Home tile's gate card isn't pinned to the first card (both fixtures are Launch gates); a two-kind case would close it.
  - S10: no runtime test that an experiment panel shows its header (fake DOM has no #top).
  - closedFoldControl covers only <details> folds and the Done "<n> more"; a button-drawn fold would not be found (none opens a sheet today).
- From the M3D step 6a Design reviewer (2026-10-23):
  - N2: the phases sentence still names Design and Build twice (different runs) against AC89 (k)'s "names each phase once" (S-001:7929). Is the literal reading meant?
  - N3: the v2.5 CI row puts the raw workflow name in title type; with no runs it reads "workflow and date not read" where nothing exists to read.
  - N4: the unparseable card's sheet names its file twice (the spec line covers the card only).
  - F1: the stage-8 guard draws none of 6a's restyled parts (Plan bubble + note, Timeline marks, ordering view, unparseable card) — candidate for stage 8.
- From the M3D stages 3-5 Design reviewer (2026-10-23), spec tensions:
  - Stage 3 N1: the Timeline's current-run shared line sits above Now, so opening at Now hides the reason (item 32 vs AC90 "under its band").
  - Stage 3 N2: AC90's Timeline bullet writes "<k> of <n>" even when it covers all, against AC90's own "<n> milestones" rule.
  - Stage 4 N1: "10 idle ›" keeps its chevron when open (Home's heads switch).
  - Stage 5 N1: a gate's title is cut on the board and again in its sheet — whole title two taps away.
  - Stage 5 N2: the decision card's fold is still "The whole record" while question/gate folds say "· and the file each answer writes".
  - Stage 5 N3: "Copied" stays after the owner types new words.
- From the M3D step 6b Design reviewer (2026-10-23):
  - N1/N2 (F1): the failed-load screen's only message is a 12 px meta line with no way out, and "Reload to try again." has no control; a Home Screen app on iOS has no reload, so the owner must quit and reopen. Add a Reload button and a larger type role?
  - F2 (low): while loading, "Checking…" sits on style.css's ground and font until the desk starts, so both change on start.
- From the M3D step 3 Reviewer: Plan's partial line "no estimate yet" vs full "no estimates yet"; Home's partial "<k> of <n> projects" vs AC90's "<k> projects". Test gaps: P5 (ordering view not pinned unchanged), H1 (lone tile with missing why).
- From the M3D step 4 Reviewer round 2: D3 survives (reload onto now/<lane> then Escape: focus path untested); a reloaded now/<lane> sheet briefly says "no longer in the running log" until the first read (pre-existing for e/<i>).
- From the M3D step 7 Reviewer round 1 (FAIL; fixes B1-B3 to Build):
  - N1: intent/ holding other files besides PORTFOLIO-INTENT.md — spec gives no words (Builder's "; <n> more" removed to keep to the spec's words). Should the row name them?
  - N2: a mark's read falling due just before the regular read gets a deadline as small as 1 ms, so a healthy read can show "Can't read your portfolio since …" for ~2 s (J23 :12343-12345 read literally).
  - N4: a read under way when the page hides still times out in the background, so on return "Can't read" shows until the immediate read answers. Should hidden time stop the deadline?
  - N6: corrupt desk-pf-kick-reads-v1 disables extra reads for that opening; a failed overlapping read drops the mark's read.
- From the M3D step 6a Design reviewer round 2: N1, two gate cards at the same gate read alike on Plan ("Launch gate · waits on you" twice, no item code); the board names the item (part A item 19).
- From the M3D step 8 Reviewer (PASS): ROLE_PX lets 16 px through anywhere (AC63's text boxes only); the cascade helper's loud failure only fires on drawn nodes, and side/logical border shorthands aren't merged.
- From the M3D step 4 Design reviewer round 2 (PASS): N3, a handed-back piece's now/<lane> sheet is titled "Working now" (the plain /now says "is not working now"); an owner's log /now address reads "You is not working now" (pre-existing, typed/stale address only).
- From the M3D step 7 Reviewer round 2 (PASS): N1 `kickRead: card.portfolio` mutant survives (only unit-pinned); N2 "since" after a stuck read not pinned; N3 fixtures README lags round 2's made-up files; N4 two tabs each make a mark's read (cap counts once).
- From the M3D step 7 Design reviewer (PASS): with PORTFOLIO-INTENT.md present, an owner's own further intent file is no longer shown or counted anywhere (spec :12338-12339) — needs the Definer.
