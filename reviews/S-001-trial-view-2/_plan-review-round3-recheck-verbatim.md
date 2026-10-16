Verdict: PASS

This was a recheck of the single commit 2b9eb38 (draft 5) against my round-3 findings, as the owner ruled. It was not a full round 4. I edited nothing. All six round-3 findings are fixed, and the change adds nothing that blocks, so the Builder can start on notes 1 to 35.

**Checks:** `GOV_BRANCH=build/definer/s001-trial-view-2 bash governance/checks/check_all.sh . orch/trial-view-2` exits 0. All 24 checks pass: "OK: all governance checks passed." The output is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/checks4.txt.

**Round-3 findings:**
- **B1 fixed (the deploy check read the wrong commit).** AC72's "Which commit" now handles the two kinds of deploy run separately:
  - A run started by a push uses `head_sha`.
  - A run started by hand (`workflow_dispatch`) takes the 40-hex sha after `deploy ` in `display_title`.
  - If that can't be read, the row says "Can't check this deploy yet", with a reason.

  Each claim it rests on holds:
  - desk-deploy.yml:15 is the `run-name: deploy ${{ … inputs.sha }}` line.
  - desk_pick_commit.sh:18 is `workflow_dispatch) SHA="${INPUT_SHA:-}"`. The Definer is right that it is line 18; I wrote 17. The spec now cites 18.
  - `display_title` is a field in J1's run list. The recorded tests/desk/fixtures/github/runs-e2ab9c5-dispatch.json carries it, and real desk-deploy runs read `deploy <40-hex> — …` (REST list, checked in round 3).

  AC72's test adds three cases: a hand-started run whose head is a records-only commit and whose title names PR #77's merge commit, an unreadable title, and a push run.
- **N1 fixed.** AC58's test and AC50's test no longer check "1 of 4 phases finished" or the old row words. Both point to AC65's test. AC58's "Kept from AC50" marks the count as removed, and the brief line matches.
- **N2 fixed.** "More detail" for a v3 project now offers "Record notes (n)" when the project has notes. It is a full screen listing `model.notes` word for word, where AC31's skipped records and AC61's out-of-form plan lines are named. AC68's test covers both kinds of note and the no-notes case. The sandbox.js:760-762 reference is correct.
- **N3 fixed.** The risk entry, AC45's "Only extra channels…" paragraph and the time row now all say the notifications channel was ruled on 2026-10-08, with the Reviewer's security review kept for M3.
- **N4 fixed.**
  - AC72 states why it traces to V4.
  - AC70's no-reason fallback is now plain words: "sent back at a gate, with no reason written", then `<gate>: <word>` in the code role. Its test is updated.
  - The empty dashed circle meaning both "planned" and "Idle" is listed as a known difference from the mockups, approved as drawn.
- **N5 fixed.** Slate (`--muted`) joins the colour-distance rule, making 14 colours per theme and 91 pairs. I re-ran de3.py with slate added:
  - slate's nearest is purple at 17.62 (light) and Why's muted violet at 16.05 (dark), matching the spec's "about 17.6" and "about 16.1";
  - the overall minimums are unchanged: coral and red 11.44 (light), amber and gold 11.03 (dark);
  - all 91 pairs are at least 10 in both themes, and the brief's count reads 91.

**The Pipeline view's "Activity" list: acceptable, non-blocking.**
- Besides the notes, that view held an Activity list (sandbox.js, `m.activity`). Its entries are:
  - open pull requests the desk doesn't flag, such as drafts or ones into another branch;
  - workflow runs;
  - "CI failing";
  - merge-gate notes;
  - withdrawn records;
  - "<id>: can't read status".
- Most of these show elsewhere after the fold-in: merges and sprints on the Timeline, the CI line on Status (sandbox.js:641), and agents' latest work on Team.
- The owner explicitly chose to fold the Pipeline page into the Timeline. AC36's rule, that any fact no screen shows is listed in the sandbox pull request, puts every remaining gap in front of the owner to rule on. Nothing here is a missed decision: unreadable queue files are flagged in the box, not left as activity. Without `?sandbox`, the accepted view is unchanged.
- Suggestion for build review: name the Activity entries that lose a home in that pull-request list. An "Activity" entry under "More detail", like "Record notes", would be a cheap fix if the owner wants one.

**Nothing new that blocks.** One small leftover: AC58's "On the Home card" bullet still lists the old row words ("Finished", "Now · run 2"). AC58's "AC65 governs" line and the rewritten test settle it, so it needs no change before the build.

Files:
- /home/user/sd-def2/specs/S-001.md
- /home/user/sd-def2/decisions/questions/P-001-trial-view-notes-2.md
- /home/user/sd-def2/.github/workflows/desk-deploy.yml
- /home/user/sd-def2/.github/scripts/desk_pick_commit.sh
- /home/user/sd-def2/tests/desk/fixtures/github/runs-e2ab9c5-dispatch.json
- /home/user/sd-def2/src/public/sandbox.js
- /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/de3.py
