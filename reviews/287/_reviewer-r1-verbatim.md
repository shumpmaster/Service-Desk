# PR #287, the Reviewer's verdict, round 1 — verbatim

*Dispatched by the orchestrator in session session_01QBwHGL14SMPK1652qVZprr on 2026-11-04, read-only, against cos/p003-runner-limit at 6f729470. Returned FAIL on the pull request's description only; the description was then corrected. Recorded unchanged below. Its run: 73,590 tokens, 45 tool uses, about 5 minutes.*

---

Verdict: FAIL

One thing blocks this, and it is text only. The diff is correct and does fix the refusal. But the PR body states as fact something the code contradicts: "Files over 1 MB stay out of every bundle, as before." It is true for the reading packs. It is false for the whole-tree tar that a check run hands on: that tar is refused outright.

**1. Scope of the diff: PASS**
- The diff is one line: governance/RUNNER.toml:49, `change_set_bytes` goes from 20971520 to 134217728 (128 MiB), with a comment citing the ruling.
- `file_bytes` (1048576), `change_set_files` (500) and the other limits are unchanged. This matches option B as put ("about 128 MB") and the answer record's "How it is carried out" (134,217,728 bytes, per-file limit unchanged).
- There is one commit, 6f729470, authored by chief-of-staff with an `Agent-Session:` trailer. It merges cleanly onto the current origin/main (84fb4a3f; the only commit since base d64599f4 is an Orchestrator status run).
- The new comment cites decisions/questions/P-003-critic-pack-cap.md, which is not on main until PR #286 lands. Merge #286 first or alongside.

**2. Does it fix the refusal: PASS**
- Where the caps come from:
  - In `prepare`, `Prepare.__init__` (orchestrator_git.py:1546-1551) reads `governance/RUNNER.toml` from the default branch's tip and passes it through `caps_of`, which uses DEFAULT_CAPS (line 242) only as a fallback per key. `put_tar` (line 1613-1619) then calls `make_tar(..., self.caps)`, the path of the run-676 error.
  - The session-side and collect-side code reads the control file's `limits`, which `session_runner pack` copies from `Config.limits` (the tree's RUNNER.toml). That covers `cmd_hand_on` (`caps_of(ctl["limits"])`), `record_entry`, and `untar` with `--limits control.json --limits-hash` in orchestrator.yml:217, 319, 326 and 327.
  - The change-set check in `Collect` reads the default branch's RUNNER.toml (lines 2119-2128).
  - DEFAULT_CAPS is used only when the key is missing or not a positive int.
- Reproduced end to end in scratch: I built the P-003 tree with `orchestrator_git.py tree`, then ran the real `session_runner.py pack` and `orchestrator_git.py tar --limits <control>`.
  - Critic pack: 87,704,656 bytes, 945 files. The tar passes under the new caps. Under main's RUNNER.toml it fails with "ERROR: refused: the folder is over the total cap of 20971520 bytes", the run-676 error exactly.
  - Gate Critic pack (gate dor and gate launch): 94,636,489 bytes, 1480 files. The tar passes, and `untar` with the hashed control file passes.
  - Headroom: 39.6 MB (gate Critic) and 46.5 MB (Critic).
- `python3 -I reviews/P-003-critic-pack-cap/measure.py` gives 87,697,069 and 94,628,799 bytes. It still prints "over the 20 MB limit" because the 20 MB is hard-coded in the script, but both totals are under 134,217,728.
- Nothing else pins the value:
  - No test in tests/ references `change_set_bytes`, 20971520 or the caps.
  - No hash of RUNNER.toml is pinned. RUNNER_HASH in the workflow is a per-run hash of the runner tools tar.
  - `proven_version` and the image values are not touched.
  - v3_checks.py:2494 reads only `file_bytes`.

**3. What else the same limit governs**
- **Tree tar for a check run (blocking for the PR body; pre-existing in the code).** `checks()` (orchestrator_git.py:1722) tars the whole source tree. `build_tree` has no size filter, and `make_tar` (lines 742-744) raises an error on a file over `file_bytes` instead of leaving it out. Reproduced: `tar --dir <P-003 tree> --limits governance/RUNNER.toml` gives "ERROR: refused: docs/design/builds/m3g-qw2/02-qw2-busiest-360x740-light-MADE-UP-NOT-real.png is 1089406 bytes, over the per-file cap of 1048576".
  - There are three files over 1 MB on main: that one, m3g-qw3/01-…png (1,218,210 bytes) and specs/S-001.md (2,170,257 bytes). The tree totals 111.3 MB, which also left only about 23 MB under the new cap.
  - So once an item reaches its check run (stage 5), it is refused both before and after this PR. No run-checks entry has ever been dispatched (zero in dispatch-log/2026-10 and 2026-11), which is why nobody has seen it.
  - The question's "larger files are already left out of any bundle" told the owner the same untrue thing. This PR does not make it worse, but the body must not repeat it, and the owner should be told that Build and Launch still cannot get through a check run.
- **Bundle headroom (not blocking).** The bundle copies each builder's collected change set (`record_entry`) and is unpacked under STATE_CAPS = 256 MiB (lines 245 and 2107). Before, about 12 change sets at the maximum filled that; now about 2 do, and the whole run's bundle would then be refused. Reaching it needs at least 128 files of about 1 MB in one change set, so it is unlikely, but the question did not say so.
- **Builder change sets.** One change set may now add up to 128 MiB to the repository's history (500 files of 1 MB each would be about 500 MB, so the total cap is what binds). The question did say, in general terms, that this limit is loosened.
- **Untar.** Unpacking now allows up to 128 MiB per tar. The tars are made by the pipeline and hash-checked, so the risk is low.
- **GitHub artifacts.** The repository is public, so Actions artifact storage is free. upload-artifact v4.6.2 sets no per-artifact limit at this size, and retention is 1 day. No problem.

**4. PR body**
- It passes `governance_checks.py pr-body` run against the live body (fetched over REST): "OK: pr-body check passed".
- It opens with `## What this means for you` and a plain paragraph. It has Milestone (Discovery-8), Context (each of its three bullets has a source), Why (the ruling and PR #286), and a Tasks line in form, `- [x]`, which the diff does do.
- True claims:
  - The sizes: 88 and 95 MB, about 39 MB to spare.
  - Builders' change sets and hand-over bundles share the key.
  - The file-count limit applies only to change sets (session_runner.py:1433 and orchestrator_git.py:2323; `make_tar` does not count files).
- False claim (blocking): "Files over 1 MB stay out of every bundle, as before." See item 3. The fix is to reword it, for example: "Files over 1 MB stay out of every reading bundle, as before; the whole-tree bundle a check run uses is refused outright when it holds one (three on main today), which this change does not fix and which needs its own question before any item reaches its check run."
- Minor, not blocking: "once it is merged, the card fix's readiness check can run." status/P-003.toml has attempts = 1 and state "ready", so the pipeline's next try will probably be refused before the merge, raising a failure card that needs `retry`. The answer record covers this; the body could say it in a few words.

**5. `bash governance/checks/check_all.sh . origin/main` on the branch**
- Exit code 1. The only FAIL is `v3_checks trace`. All 9 of its violations are "sprint PR #40/#41/#44/#52/#72/#74/#75/#77 has no merge commit … reachable from HEAD", and `git rev-parse --is-shallow-repository` returns true. These are the known shallow-clone artefacts.
- `record_checks merges` passed here. Every other check passed.

**Open questions for the owner, through the Chief of Staff**
- The check-run tree tar is refused because of files over 1 MB (and the tree's growing total). It needs its own fix: make `make_tar` leave large files out of the tree, move or shrink the three files, or a tools change from the operating model. Should it be raised as a question now, before P-003 reaches Build?
- Should STATE_CAPS (256 MiB) be raised along with the new total limit, or is two maximum-size change sets per run an accepted limit?

Scratch output is in /tmp/claude-0/-home-user/10ad1d98-ee29-5874-8994-ef77eb7b632b/scratchpad/ (checkall.txt, the pack-* folders, the tree). No repository files were changed.
