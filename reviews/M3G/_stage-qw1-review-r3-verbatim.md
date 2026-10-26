# M3G stage QW1: the Reviewer's round 3 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/builder/qw1 at 9ecd143 (QW1's work over c2f6f94).

---

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
