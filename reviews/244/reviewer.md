Verdict: PASS

The Reviewer's verdicts on QW1 (PR #244), verbatim: round 1 at a765ea5 (FAIL), round 2 at 7ae05da (PASS), round 3 at 9ecd143 (PASS). After round 3 the Builder changed only the capture tool (0c52972), at the Design reviewer's round-2 N1. Recorded by the orchestrator.

## Round 1
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

## Round 2
Verdict: PASS

Round 2 of QW1 (build/builder/qw1 at 7ae05da, read-only in /home/user/sd-qw1) passes. B1 is closed, the reload-fold answer is built as AC94 now says, and N1, N2, N4 and the open question each have a case. The fix for B1 brought in one small regression (N1 below), which I rate non-blocking. The scratch worktrees are removed.

**Blocking**

None.

**Non-blocking (carry as risks)**

N1. A filter round trip drops a "couldn't check" message for a question still in the section. This came in with 0c4c912 and contradicts the settled rule, which drops those words only "when the question leaves the section" (specs/S-001.md, AC94 "Before and around a link").
- **Cause:** `goneRechecks` takes "here" from `qv.order` (src/public/sandbox.js:2676), which holds only the shown project's questions when one project is shown. It deletes a non-answered result (:2682-2683) before the per-project check (:2686).
- **Reproduction (planted in a scratch test, on `kindsState`):** wait 31 s, make Kinds' reads fail and tap "Answer A ↗" on Kinds-lettered. The card says "The desk couldn't check just now Open GitHub anyway". Go to `#/waiting/Ledger`, then back to `#/waiting`. The question is still in the section, but the words beside its button are gone.
- **Same probe on a765ea5:** the words stay.
- **Why non-blocking:** nothing wrong is shown, and tapping the button again re-reads. One possible fix is to skip results of other projects before deleting.

N2. Three parts of the round-2 rules are built but not locked; a planted bug in each leaves ac94, notify-ac77-desk, notify-ac77-desk-reads, notify-ac74-desk and ac85-sheets all passing:
- **"Only a full reload opens them" (C):** :2615 was changed to open the fold whenever this opening's drafts hold words. That bug opens a fold the owner never touched after they type in the sheet.
- **The open-sheet exception (AC56):** :2683 was changed to delete always. That bug drops an open sheet's words for a question that has left.
- **The drop itself:** :2683 was changed to delete nothing. That bug makes the "couldn't check" words come back beside the button after an Undo.

N3. AC94's revised test list asks for the reload step "every project shown and one", but the reload case (ac94-qw1-questions.test.mjs, the "owner's reload answer" test) opens only `#/waiting`. A probe at `#/waiting/Kinds` shows it works: the kept fold opens and the other stays closed. It is not locked.

N4. From round 1's N3, recorded for the pull request: some rewrites were labelled "forced" when the old case had only become vacuous.

**Checked and holding**

- **B1 closed:** both round-1 reproductions now leave the section with no line.
  - Failed re-read, then "Done ✓": no line.
  - Failed re-read, then the question answered at a poll: no line.
  - The three new B1 cases match the spec's two worked cases, plus the Done ✓ case. Undoing the fix fails two of them.
- **Reload-fold (P-001-m3g-reload-fold.md, A; AC94's readings):**
  - A fold opens after a reload when the device's `DRAFTS_KEY` record holds non-empty words for that question (`readDrafts` drops empty and expired ones). For a numbered question, words for any part count.
  - Folds with no kept words stay closed, and "Show choices ›" is not opened.
  - The scroll is put back with the words already drawn.
  - A fold the owner closes stays closed through the next poll.
  - Planting "never opens" or "every fold opens" is caught.
- **N1 and N2 re-planted:**
  - One words box for a numbered question is caught by 2 cases.
  - No scroll to the held card on a notification tap is caught by the new N2 case.
- **Open question 2 and N4:** both now have cases (d7846e8). The open-question case taps "Show choices ›" and "Add your own words" on held lettered and v2.5 questions and uses their sheets' boxes and "The whole question" fold; none ends the hold. The N4 case puts "Still reading the portfolio…" last among the read lines, below a section that holds questions.
- **The open-sheet exception is within AC56's scope:** AC56 (specs/S-001.md:5676-5678) says that when what a sheet is about leaves, "the sheet stays open and says so … What the owner typed stays". AC94 also says "as a sheet open over the question keeps them". A probe confirms the open sheet still shows the "couldn't check" words.
- **Full suite:** `npm --prefix src test` at 7ae05da passes 1401 of 1401 (4 min 39 s).
- **Heap:** ac88-dark peaks at about 1193 MB of used heap (`--trace-gc`). The Builder reported 1163 MB. Both are well under the 2096 MB limit.
- **surface_guard:** with `--commits-from` over the 53 builder commits in c2f6f94..7ae05da it reports "OK: 53 commit(s)", exit 0.
- **Identity:** the 8 new builder commits are authored `builder <builder@agents.invalid>`, each with `Agent-Session` and `Spec: S-001` trailers, and none has a co-author line or a model name.
- **The 7ae05da merge:** remerge-diff shows nothing beyond d155f84's spec text and the decision record.
- **Nothing regressed apart from N1:** no write path was added, and the round-2 source changes are confined to sandbox.js's re-read words, the reload fold and the drafts' load.

**Open questions**

1. Should N1's fix go in this round, or be carried? It is a one-condition change.
2. The new `qw1-epsilon-choices` capture is listed in glance-shots.mjs, but no `qw1-` captures are committed. Will they go on the pull request?

## Round 3
Verdict: PASS

QW1 round 3 (build/builder/qw1 at 9ecd143, read-only in /home/user/sd-qw1) passes: dcad3b4 fixes round 2's N1 without loosening the B1 rule, and every planted bug is now caught.

**Blocking**

None.

**Non-blocking**

N1. Carried from round 1, as the orchestrator will note it in the pull request: some rewrite commit messages say "forced" where the old case had only become vacuous.

**Checked and holding**

- **The fix keeps the round-2 rule:** dcad3b4 moves the per-project skip (`if (only && v.project !== only) continue;`, src/public/sandbox.js, `goneRechecks`) ahead of both the drop and the draw. It changes nothing else.
  - Only "answered" and "recording" are still drawn once a question leaves; every other kind is dropped, except while its sheet is open (AC56).
  - With one project shown, another project's results are neither drawn nor dropped. They are judged again when every project is shown.
- **Planted bugs, all caught:** 12 bugs, run against ac94, notify-ac77-desk, notify-ac77-desk-reads, notify-ac74-desk and ac85-sheets.
  - **Round 2's, re-planted:**
    - B1 undone, so every kind of result is drawn;
    - one words box for a numbered question;
    - no scroll to the held card on a notification tap;
    - the reload fold never opening, or always opening;
    - the fold opening when words are typed within the same opening;
    - the open-sheet exception removed;
    - nothing dropped.
  - **New:**
    - dcad3b4 undone (the round-2 order);
    - the one-project skip removed;
    - "recording" dropped as well, so only "answered" stays;
    - the reload fold never opening with one project shown.
- **The round-3 cases:**
  - My N1 reproduction: "couldn't check" survives a round trip through `#/waiting/Ledger`.
  - N2 (a): words typed in the sheet within an opening leave the section's fold closed.
  - N2 (b): an open sheet keeps its "couldn't check" words when the question leaves.
  - N2 (c): after "Done ✓" and "Undo" the question returns without its old words.
  - N3: the reload step at `#/waiting/Kinds`.
- **Full suite:** `npm --prefix src test` at 9ecd143 passes 1405 of 1405 (4 min 55 s).
- **surface_guard:** with `--commits-from` over the 55 builder commits in c2f6f94..9ecd143 it reports "OK: 55 commit(s)", exit 0.
- **Identity:** dcad3b4 and 9ecd143 are authored `builder <builder@agents.invalid>`, each with `Agent-Session` and `Spec: S-001` trailers, and neither has a co-author line or a model name.
- **Nothing regressed:** the source change is the three-line reorder above. ac88-dark.test.mjs is unchanged, so I did not measure the heap again; round 2 measured about 1193 MB.

The scratch worktrees are removed and the branch is unchanged.

**Open questions**

None new. The `qw1-` captures are still not committed (round 2's open question 2); they belong with the pull request.

