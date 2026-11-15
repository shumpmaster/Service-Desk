I've written specs/S-012.md as a draft, re-pointed the two experiment files to it, and marked S-011 superseded. Nothing is committed: this folder is not a git repository, so there is no build/definer/P-005 branch and no commit with the session and spec trailers.

## 1. What I changed
- **specs/S-012.md (new, draft, milestones M6, M7, M8, lineage [S-010, S-011]).** It is S-011 with these changes:
  - **AC17** now uses the owner's widths, 360 and 414 CSS pixels, and is checkable. Its "not yet checkable" note is gone.
  - **The M8 note** now says the owner accepted the reading whole.
  - **The widget folder** is named as src/widget/ in the areas touched, AC37 and J10.
  - **AC23 and J5:** a step that leaves the waiting list and comes back counts as a return only if a run of the alert route found it gone. A step that leaves and comes back between two runs, with its `changed_at` unchanged, is not sent again. J5's test covers both cases. I also reworded one AC23 sentence that this change would otherwise have contradicted.
  - **Experiment statements:** I dropped every "not in this pack" statement about the experiment files. AC46, J11 and the known limits now cite the files' own lines.
  - **New in this revision:** a note that changes to the "three shared files the sender runs" need the owner's approval (docs/PROJECT.md:616). The stop rule, risks and builder brief follow from it.
  - **Open questions:** all four of S-011's are closed, and none blocks freeze. One new item is listed for the owner's scenario card (question 1 below).
  - **Labels:** all `join-test` labels now name S-012. Criterion numbers are unchanged.
- **experiments/P-005-E1.md:** now points to S-012 (lines 3 and 13). Line 28 now uses AC40's rule: an action is the proxy's only when its ending record has a `Proxy:` line. I also added AC40's rule for times with an unknown offset to the same line, so that J11's claim "E1 is measured by AC40's rule" is true. The line count is unchanged.
- **experiments/P-005-E2.md:** now points to S-012 (lines 3 and 14).
- **specs/S-011.md:** I changed only its status word. In this pack the word was `draft`, not `frozen` as the brief says, so `draft` became `superseded`.

## 2. Why
These are the fixes stop-5.md asks for, plus the three rulings it names (widths, M8 reading, widget folder). The definer-pack ruling put the experiment files in my pack, so I could re-point them myself. For the returning step, stop-5 offered two fixes. I took "a return counts only if a run saw the step gone", because the other fix needs every waiting kind to have a record of when it came back, which E2 has not shown yet. I added the unknown-offset line to E1 because J11 says E1 uses AC40's rule, and without it that claim was false.

## 3. What I verified
- `grep` for "S-011", "open question", "not in this" and "plan review reports" in S-012: the only hits left are the lineage and change notes.
- All 36 criteria have a `[trace: V<n> → AC<m>]` (0 without one).
- Ten join tests, J1 to J10, each labelled `S-012`. J11 has no test, as in S-011.
- The cited lines say what they're cited for: E1 lines 3, 28 and 31; E2 lines 3 and 19; docs/PROJECT.md lines 588, 593, 595, 616 and 631; plan lines 72, 108 and 135.
- The status lines of S-010 and S-011 read `superseded`, and S-012 reads `draft`.

## 4. What is undone
- The commit and branch, because there is no repository here.
- Freezing, the Critic's plan review and the scenario card come next in the handoff.
- Both experiment files still say experiments/_REGISTRATION.md was not in the definer's pack (line 5). That is still true here, so I left it.

## 5. What is needed outside my lane
- Whoever commits needs to put this on build/definer/P-005 as `definer`, with the `Agent-Session:` and `Spec: S-012` trailers.
- The freeze gate's records need to show S-012 as the item's spec.
- The Builder's reading of src/ needs to name which files under src/lib/ are among the sender's three shared files. That list is in governance/risk-paths.toml, which isn't in this pack.

## 6. Open questions
1. **For the owner at the scenario card (doesn't block freeze):** is it acceptable that a step which leaves and comes back between two alert runs, with its `changed_at` unchanged, is not sent a second time? It was already sent by name when first found. If the owner wants it sent every time, that is a revision.
2. **Status word:** S-011's header said `draft`, but the brief describes it as frozen. Someone should confirm that this pack's copy is the right one and that the superseded mark matches the real record.