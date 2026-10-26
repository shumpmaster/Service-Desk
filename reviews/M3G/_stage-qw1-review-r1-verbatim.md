# M3G stage QW1: the Reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/builder/qw1 at a765ea5 (QW1's work over c2f6f94).

---

Verdict: FAIL

QW1 at a765ea5 (build/builder/qw1, read-only, checked in /home/user/sd-qw1) is close. It fails on one defect: the section shows re-read messages the spec does not allow. Everything else I checked holds up. The scratch worktrees are removed and the branch is unchanged.

**Blocking**

B1. The section keeps messages that AC94 only allows for answered or being-recorded questions.
- **What the spec says:** specs/S-001.md:10632-10638 ("Before and around a link") and point 2 of "Settled from QW1's build" (:10665-10669) cover only the case where the re-read takes the question out of the section, "answered, or being recorded". Only then do AC77's words stay as "<title>: <words>".
- **What the code does:** `goneRechecks` (src/public/sandbox.js:2664-2676) shows every saved re-read result for a question no longer in the section. It skips only "Checking…" (:2669). So it also shows `RECHECK_WORDS.failed` (set at :2316) and "Still open:" when the pop-up is blocked (:2328). These are drawn without the "Open GitHub anyway" link they depend on, and they stay for the whole opening.
- **Reproduction 1 (planted in a scratch test, on `kindsState`):** open Waiting and wait 31 s. Make Kinds' reads fail (`s.repos.Kinds.fail = {kind:'network'}`) and tap "Answer A ↗" on Kinds-lettered; the card says "The desk couldn't check just now Open GitHub anyway". Clear the failure, poll, and tap that question's "Done ✓". The card leaves, and the section says "Which colour should a kicked-back card's icon take?: The desk couldn't check just now".
- **Reproduction 2:** same start, but after clearing the failure commit `decisions/questions/Kinds-lettered.md` and poll twice. The answered question leaves and the section says it "couldn't check", not that it was already answered.
- **Not caught by any case:** the settled-2 case (tests/desk/ac94-qw1-questions.test.mjs:773-814) only covers the answered and being-recorded outcomes.

**Non-blocking (carry as risks)**

N1. One of the Builder's readings is not locked. "Add your own words" holds one box per part for a numbered question (src/public/sandbox.js:2580; the reading is at specs/S-001.md:10701-10702). Replacing that line so a numbered question gets a single box (`;`) leaves ac94, ac85-sheets, md-sandbox, ac80-board and notify-ac77-desk all passing. The words-in-both-places case (ac94:181-227) covers lettered questions only.

N2. c959fe5's behaviour is not locked. When a notification tap opens a held question, Waiting scrolls to its card in the section (`scrollToRow = rowId(\`q:${t.key}\`)`, src/public/sandbox.js:95). Replacing that line with `;` leaves notify-ac74-desk, ac79-desk, ac80-board, notify-ac77-desk and notify-ac77-desk-reads all passing. The fold it replaces was not locked before QW1 either.

N3. Some rewrites say "forced" when the old case did not fail. The old versions of these cases still pass on the new source:
- notify-ac77-desk: "real question unchanged", "a line in another form", "within one opening", "at a new opening".
- notify-ac77-desk-reads: 5 of d813f41's 11 cases.

They pass only because the old line "Being asked in your session: answer there" is no longer drawn, so their "not shown" checks became vacuous. Rewriting them was right and none was weakened. "Forced" here means "made vacuous", and the commit messages should say so.

N4. No QW1 case shows "Still reading the portfolio…" together with the section. It is covered by combining two cases: G9c's case (ac91-g9c-quiet-lines.test.mjs:489) puts it among the quiet lines, and QW1's case (ac94:934-952) puts the quiet lines below the section.

**Checked and holding**

- **Full suite:** `npm --prefix src test` on a765ea5 passes 1393 of 1393 (241 s).
- **Heap:** I measured ac88-dark's peak at about 1168 MB of used heap (`node --trace-gc`). The Builder reported 1206 MB, which is the same order. Either leaves about 890 MB of the 2096 MB limit.
- **surface_guard:** the plain range check reports 14 violations, all commits by others that came in through merges (definer, chief-of-staff, orchestrator). Over the 45 builder commits alone (`--commits-from`, a JSON list built with `git rev-list --author=builder c2f6f94..a765ea5 ^build/builder/g9c`) it reports "OK: 45 commit(s)", exit 0.
- **Commit identity:** all 45 are authored `builder <builder@agents.invalid>` and carry `Agent-Session: session_017seyaGqUxAff6E8dKWHDCR` and `Spec: S-001`. None has a co-author line or a model name in its message. The committer field is "Claude <noreply@anthropic.com>" on every commit, the same as on main (184 of main's last 200), so it is the environment's setting, not the Builder's.
- **Planted bugs:** 26 bugs in the shipped code; 24 were caught. Among the caught ones:
  - questions left in the lane; four choices shown instead of three; "Done ✓" on a held question; a held question's "Move to Done" in its sheet;
  - a held question's answer link or copy button not ending the hold, and "Answer in its sheet ›" ending it;
  - no "new" in the section; no "your questions are above"; no grey line for state 2;
  - section links without the saved words; v2.5 copy without the saved words; no "Recommended" on a v2.5 box;
  - "Show choices ›" open from the start; held question placed after the counted ones; "Nothing waiting" ignoring held questions;
  - the "Already answered" words never shown, or shown across projects;
  - the head's or a group's count including held questions;
  - the "Also asked in your session" line drawn on every question, or on none; held questions dropped from the section.
  - The two survivors are N1 and N2.
- **New cases on old source:** the AC94 file fails on the source before QW1 (870a74c, with G9c landed), as does each rewritten case.
- **Rewritten locked cases:** running the 870a74c versions of the 10 changed test files on QW1's source fails exactly the renamed or rewritten cases (apart from N3), and the new versions fail on the old source. I read every diff; none was weakened. Counts become lane plus section with the badge still checked, and the held-question checks now look for the section's line.
- **d813f41 (the shared constant `HELD_WORDS = SECTION_WORDS.heldLine`):** all 11 cases reading it still test something. Each fails under at least one of two planted bugs: the held line drawn on every question, or never drawn.
- **The 725f223 merge:** remerge-diff shows the src conflicts resolved with both sides kept. QW1's src changes after the merge match its changes before it, and the same holds for G9c's, apart from the one combined "Nothing waiting" line. Both ONCE lists came through unchanged: `QW1_ONCE` is the same as at ea88d85 and `G9C_ONCE` the same as at 870a74c, and the closing check names both.
- **QW2 and QW3:** no "<k> of <N> waiting", no "Answer first", no "Waits on" and no `Blocks:` reading in the diff.
- **The desk writes nothing:** QW1 adds no fetch, no write method and no window.open, and does not touch src/functions, links.js or the config. Answers are still links to GitHub's new-file page or copied text.
- **Fixtures:** tests/desk/qw1-fixtures.mjs and the QW1 section of tests/desk/fixtures/README.md label every made-up part NOT real.

**Open questions**

1. The `qw1-` Chromium captures listed in tests/desk/tools/glance-shots.mjs:312-317 are not committed on the branch. Will they be attached to the pull request, as G9c's were?
2. Should "Show choices ›" and "Add your own words" not ending a hold be pinned for v2.5 and lettered held questions in the sheet as well? The settled-4 case taps them only in the section.
