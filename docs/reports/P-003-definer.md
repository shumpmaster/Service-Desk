I wrote S-006 as a draft and marked S-005 superseded. Every criterion, join sheet, fact, risk and open question is S-005's, word for word, as the owner's ruling `decisions/P-003/stop-11.md` (checks-wrong) asks. I didn't freeze it: it goes to the Critic, then the freeze gate.

**1. What I changed**
- **New file `specs/S-006.md`.** It is S-005 carried forward with only these changes:
  - the title id is now S-006;
  - `status: draft   frozen_at: — (set at the freeze gate)`;
  - `lineage:` now ends with S-005;
  - the "Supersedes" note is new;
  - the six join-test marks now read `join-test: S-006/J1` to `S-006/J6`;
  - the surface-owner brief now names `specs/S-006.md` and "the check author's checks for S-006".
- **`specs/S-005.md`:** the status word only, from `frozen` to `superseded`. Nothing else in it changed.
- Nothing under `experiments/`: Design-3 is still skipped and no experiment is registered.

**2. Why**
- stop-11 rules: "The criteria are not wrong. Carry S-005 forward unchanged in the new spec, with only its id, its supersedes line and anything the plan review requires. Do not grow it."
- The status change is needed because a new spec goes to the Critic as a draft.
- The join-test marks have to name the spec they belong to, so they are part of "its id".
- The new note says the owner's approval of S-005's criteria (`criteria-9.md`, "proceed") covers these same words. It also says why the checks failed, as stop-11 gives it: the Check author's revision rounds never saw the tests (L-0039).
- No plan-review findings for S-006 are in my pack, so nothing was changed on that account.

**3. What I verified**
- **Citations:** I re-read every line S-006 cites and each still says what the spec claims. That covers `docs/projects/P-003.md` (lines 15, 21, 22–23, 27, 34, 40, 74, 85–89, 96–97, 105, 109, 111, 113, 118, 120, 126, 133, 135) and `docs/PROJECT.md` (85, 121, 125, 127, 540, 588, 616). It also covers `JOIN_UP_REVIEW.md:12-33`, `specs/S-004.md:161,164` and the four library entries (F-cf-02, P-notice-actionable-01, P-stale-visible-01, F-automation-complacency-01).
- **Search for `S-005|S-006/J`:** S-005 now appears only in the lineage and the Supersedes note, and all six marks read S-006/J1–J6.
- **Search for trace marks:** 19 `[trace: V6 → ACn]`, one for each of AC1 to AC19.
- **S-005's status line** now reads `status: superseded`, with the rest of the line unchanged.
- **Not verified:** I had no shell or git, so I couldn't run a mechanical diff of S-005 against S-006. The sameness of everything outside the listed changes rests on how I built the file.

**4. What is undone**
- S-006 is not frozen. It needs the Critic's plan review, then the freeze gate (D-043), then the owner's scenario card.
- Nothing is committed. My workspace has no git, so the commit to `build/definer/P-003` (as definer, with the `Agent-Session:` trailer) still needs making.

**5. What is needed outside my lane**
- **Check author:** per stop-11 and L-0039, its revision rounds need to see the tests this time. The locked checks also need to target the `S-006/Jn` join-test marks.
- **Empty stray file:** `specs/S-005.facts.tmp` is in my pack and empty. I left it alone; whoever made it should remove it.

**6. Open questions**
- **Join-up sign-off:** I kept S-005's sign-off line word for word: the Build gate's record "does not exist yet". `criteria-9.md` ("proceed") may be that record for S-005's review. Should S-006 name it, or should it wait for S-006's own Build-gate ruling? I didn't change it, to follow "change nothing else".
- **Heading level:** the "# Join-up review" heading is a top-level heading in the middle of the spec, carried over as it was. If the plan review wants it as `##`, that is a one-character fix.