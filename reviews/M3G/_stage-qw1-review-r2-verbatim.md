# M3G stage QW1: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/builder/qw1 at 7ae05da (QW1's work over c2f6f94).

---

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
