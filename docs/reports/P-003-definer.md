The edits are in. I checked the line list against S-007 with a diff and confirmed the cited evidence lines. Writing up the return now.

## 1. What I changed

I revised `specs/S-008.md`. It is now 259 lines (S-007 is 231). Line 11 lists every changed line, and a diff against S-007 matches that list.

- **Line 23 (the baseline run):** the Reviewer of this build now makes the baseline record, as the first step of the build's review. The Reviewer:
  - reads the adapter against `src/` at the base commit;
  - confirms that every output field comes from `src/`;
  - runs the adapter once on every case;
  - commits the output, unedited, under `reviews/S-008/baseline/`, with a note giving the record's SHA-256.

  If the Reviewer cannot confirm, it makes no record and the build stops and returns. The Check author then commits a byte-for-byte copy with the locked checks. The locked check now also requires the adapter to fail when `src/` is unusable.
- **J7, line 148:** the adapter reads only the case file and the `src/` code it imports. It works out no output field itself; it only picks fields, sorts, and writes `<id>`.
- **J7, lines 169 to 171:**
  - The record copy must match the hash in the Reviewer's note.
  - A new **poison run**: the check copies the working tree, replaces every `.js`, `.mjs` and `.cjs` file under `src/` with one line that throws, and runs every case. Every run must fail.
  - "The run's role" is now "the Reviewer".
- **Line 217 (Known limits):** says who makes and keeps the record, with evidence.
- **Line 235 (Risks):** rewritten around the Reviewer's confirmation, the poison run and the hash checks.
- **Line 245:** back to S-007's "None of these needs your ruling before freeze."
- **Open question 7 (line 252):** now for information only, not a ruling before freeze.
- **Brief (lines 257 and 258):** the Builder waits for the Reviewer's record and the Check author's copy. It returns at once if the Reviewer cannot confirm the adapter.
- **Line 11:** the change list is updated to match.

No criterion's meaning, other join sheet, fact or other open question changed.

## 2. Why

- **Finding 1:** the spec relied on a role still to be ruled. The ruling (`failure-15.md:4`) requires the spec to say who runs the adapter. The Reviewer is the role the plan already gives the build's review and the job of trying to break the fix (`P-003.md:69, :87`). The Reviewer checks each pull request (`PROJECT.md:120`) and writes reviews under `reviews/` (`PROJECT.md:122, :125`). So the record goes in the Reviewer's own write area, and no new lane is needed. The copy goes with the locked checks, which the Check author locks (`P-003.md:67`). The Builder cannot change either: they are outside its areas touched, which CI enforces (`_TEMPLATE.md:19`).
- **Finding 2:** a canned adapter could pass every check. The poison run now fails any adapter that gives a result without `src/`. That still cannot catch an adapter that loads `src/` and then discards its output, so the Reviewer, who can read `src/`, is the named second party who confirms. The review offered both fixes, and the spec now has both.

## 3. What I verified

- `diff specs/S-007.md specs/S-008.md | grep -E '^[0-9]'` gives changes at 1, 3–4, 11, 18, 23, 58, 83, 97, 106, 116, 122, 145–172, 209, 217, 235, 252 and 257–258. That is exactly the list in line 11.
- `wc -l` gives 231 and 259, as line 11 says.
- `grep` finds no remaining "proposed", "role ruled" or "ruled before freeze" wording about the runner.
- I read every evidence line I cited and each says what the spec claims: `PROJECT.md:120, 122, 125`, `P-003.md:67, 69, 87` and `_TEMPLATE.md:19, 36`.

## 4. What is undone

- **Not committed:** the pack is not a git repository, so I could not commit to `build/definer/<task>`.
- **Not frozen:** the spec goes back to the Critic for plan review.

## 5. Needed outside my lane

- The Orchestrator must dispatch the Reviewer partway through the build: after the adapter is committed, before any change under `src/`. Then the Check author must commit the copy. The Reviewer's role card is not in my pack, so I can't confirm that its trigger covers this step (said in line 217).
- The Reviewer's write lane (`reviews/**`) is inferred from its past review paths, not from `governance/SURFACES.md`, which I don't have.

## 6. Open questions

- **Which criteria did the owner approve?** `decisions/P-003/criteria-13.md` says "proceed" but names no spec. This is still to be confirmed before the scenario card, as line 18 says.
- **Does J7's check count toward the stop rule?** The plan review asks whether J7's check, which covers the hashes, coverage, poison run and comparisons, counts as one test against the stop rule's 24. I left the sizing as it was, because earlier rulings said not to grow the spec. The Critic or the owner may want that settled.
- **Should a second party rerun the record?** Open question 7 is now for information only: anyone beyond the Reviewer rerunning it would need a new spec.