I stopped before changing anything, because the S-007 baseline can't be recorded in this workspace. I made no edits and no commits.

**1. What I changed**
Nothing. I read the brief, `specs/S-007.md`, the locked checks in `tests/acceptance/S-007/` and the earlier rulings in `decisions/P-003/`.

**2. Why**
- **No git here.** The workspace isn't a git repository: `git rev-parse` fails, there is no `.git` anywhere above it, and there is no `governance/` folder.
- **The baseline needs git.** The locked checks require me to write the seam, then run `record-baseline.mjs` at the base commit, before any change under `src/`. That script needs a real base commit (`git cat-file`, `git diff base -- src/`). Then I must commit the baseline file before touching `src/`.
- **Provenance can't pass.** `baseline-provenance.test.mjs` checks that order from git history. If I built the rule and recorded the baseline afterwards, it would be a false baseline, and the ACs that compare against it (AC9, AC10, AC14, AC15, AC16 and AC17) would prove nothing.
- **Seam and baseline don't exist yet.** `tests/desk/s007-seam.mjs` isn't there, and neither is `tests/desk/S-007-baseline.json`. Every locked test imports the seam, so none can run.
- **I didn't work around it.** I didn't run `git init` or guess a base commit. Both would fake the provenance the checks exist to prove.

**3. What I verified**
- `ls` on `tests/desk` for seam or baseline files returned nothing.
- `git -C pack rev-parse --show-toplevel` returned "not a git repository".
- I did not run the acceptance tests, because the seam is missing.
- `reviews/S-007/checks.txt` shows governance failures:
  - `surface_guard`: 12 violations, entries citing ledger ids (L-0024 to L-0036, except L-0034) that aren't in `docs/LEDGER.md`.
  - `digest`: 2 violations.
  - These are outside my lane. They don't depend on the build.

**4. What is undone**
All of it:
- the seam at `tests/desk/s007-seam.mjs`
- the baseline, recorded and committed before any `src/` change
- the one rule in `src/lib/`
- the changes to the views and to `src/public/sandbox.js`
- the unit tests under `tests/desk/`
- the handover package in `docs/handover/`, including the operating notes (AC18) and the monitoring section

**5. Needed outside my lane**
- A checkout of the repository with full history (the checks say `fetch-depth: 0`), on branch `build/builder/P-003`.
- The base commit's id, for `seam.baseCommit`.
- The governance files, so I can check my commit trailers and branch rules.
- The ledger and digest failures in `checks.txt` need whoever owns `governance/`.

**6. Open questions**
- Is there a different workspace, with git, where this builder session should run? If not, should the freeze gate treat the missing git history as a blocker? I think it should.
- The seam must reach the real code in `src/lib/`, `src/public/sandbox.js` and `src/notify/`. That is a sizeable task. I'd do it first, at the base commit, once git is available.