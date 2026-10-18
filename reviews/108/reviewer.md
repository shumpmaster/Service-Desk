Verdict: PASS

**What this means for you:** This pull request makes one change. From now on, any change to the notification sender's code (`src/notify/`) or to the desk's settings file (`src/config/projects.json`) needs your approval as well as the Reviewer's. I tested that it works: those two paths now come out as R3, and the rest of the desk's code, including `src/lib/` (left out on purpose), stays R1 and needs only the Reviewer. Nothing else in the file changed, every governance check passes on a trial merge into main, and no check needs this file to match the model's template. This pull request is R3 itself, so it needs your approval and the Reviewer's recorded before it merges. No sender pull request is open yet, so the order CS18 asks for still holds.

**Findings**

1. **The TOML is valid and lint passes.** `tomllib` loads the file, and R3 now lists 13 patterns, the last two being `src/notify/**` and `src/config/projects.json`. `python3 governance/checks/review_check.py lint` printed `OK: governance/risk-paths.toml and 50 verdict file(s) are well-formed` and exited 0.

2. **Classification, from `review_check.py classify` in /home/user/sd-r3:**
   - `src/notify/x.mjs: R3`
   - `src/config/projects.json: R3`
   - `src/lib/x.js: R1`
   - `src/public/x.js: R1`

   Extra cases I tried: `src/notify/a/b/c.mjs` is R3, so the rule reaches files nested deeper. `src/config/other.json` and `src/config/projects.json.bak` are R1, so the config rule covers exactly one file. `src/ui/x.js` and `config/projects.json` are still R2. `src/config/projects.json` exists on the branch; `src/notify/` does not exist yet, as expected.

3. **Nothing else changes.** `git diff origin/main...HEAD` shows one file, `governance/risk-paths.toml`, with 2 lines added and none removed, at lines 20–21 inside the R3 list. The PR's head on GitHub is `e86c2e9`, the same as the branch, and its base is main at `93606360c4f02bf9db78d01de56532194f9b98fb`.

4. **It matches CS18 exactly** (specs/S-001.md:7641–7654 on orch/s001-notifications, `5ab08e8`):
   - It adds `src/notify/**` and `src/config/projects.json` to R3.
   - It does not add `src/lib/**`.
   - `.github/**` is already R3 (line 12).
   - Each added line's comment gives CS18's reason and cites "S-001, CS18".
   - The "When it lands" condition is met: the only open pull request is #108, and build/builder/notify-sender has no commits beyond `5ab08e8`.

5. **No check needs the file to match the template byte for byte.** I searched every file in /home/user/sd-r3/governance/checks/ and `check_all.sh`:
   - `review_check`, `owner_signal`, `record_checks` and `govlib` read the file only through `load_risk_paths`/`parse_risk_paths`, which parse and validate it.
   - The only byte-for-byte or SHA comparisons are the profile's `Profile-Sha256` (v3_checks.py:1244), the handover form's instruction lines (governance_checks.py:749) and session lines (v3_checks.py:2303). None of them involves this file.
   - For context: before this PR, Service-Desk's copy was identical to the model's `template-v3/governance/risk-paths.toml`. After it, the copy differs by exactly these two lines. A future model sync should keep them, but no check here enforces that.

6. **check_all.sh on the trial merge.** I cloned the repo into /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r3rev and made a `--no-ff` merge of `e86c2e9` into `9360636` as `shumpmaster <furchken@gmail.com>`, giving merge commit `b36f92b`. Command: `GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . 93606360c4f02bf9db78d01de56532194f9b98fb`. Result: all 25 steps PASS, ending `OK: all governance checks passed.`, exit 0. The full log is at /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r3rev-checkall.log.

   I also ran `review_check.py pr 108 --base 9360636…` on the trial merge. It reports `Risk class: R3` and `Required reviews: owner, reviewer`, and it fails only because `reviews/108/owner.md` and `reviews/108/reviewer.md` don't exist yet. That is expected before the reviews are recorded.

7. **Non-blocking, carried as a risk: the commit has no `Spec:` trailer.** `e86c2e9` ends with only `Agent-Session: session_012RJPVKAoLga2RkqLYRDcBY`. AGENTS.md:27 asks for `Spec: <id>` on builder commits for a spec, and `chief-of-staff` has class `builder` (governance/SURFACES.md:25). The commit carries out S-001's CS18. `v3_checks scope` passes because it counts this commit as "without a Spec: trailer and not a builder's", so no check catches the gap. You can either add `Spec: S-001` to the commit message before merging or accept it as is. The change itself is unaffected.

**Open questions**
- None about the content. Before merging: record your approval and the Reviewer's in `reviews/108/`, and decide about the missing `Spec: S-001` trailer (finding 7).

No files in /home/user/sd-r3 were changed; `git status` is clean.
