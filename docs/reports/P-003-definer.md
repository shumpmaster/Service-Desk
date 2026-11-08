I've updated the draft of specs/S-005.md as the owner's recycle ruling (criteria-8) asked: every fact and known limit under "Facts relied on" now cites a file with a line number. No criterion changed and the spec did not grow. It is still a draft. Nothing is committed, because this folder is not a git repository.

**1. What I changed** (specs/S-005.md only)
- **Facts relied on:** each fact now ends in the template's form, `— evidence: <file>:<line>`. The vague section references are gone:
  - plan sections (§2, §4, §5, §6, §7, §8) now point to lines in docs/projects/P-003.md: :15, :21, :22-23, :27, :34, :40, :74, :85-89, :96-97, :105, :109, :111, :113, :118, :120, :126, :133, :135;
  - the owner's ruling is now decisions/P-003/stop-7.md:3;
  - the three library entries now point to their claim and grade lines, e.g. library/facts/F-cf-02.md:4, :5, :15.
- **New evidence for the card-file name form:** docs/PROJECT.md:540 names one real card file, `queue/Q-003-failure-1.md`. The form is now "inferred from one example" rather than "not stated anywhere".
- **Known limits:** each one now cites its evidence too:
  - the tests/desk/ folder comes from specs/S-004.md:161 and :164 (I don't cite the earlier review round, per stop-7);
  - the missing source code is shown by a search that finds no `src/` files in my folder;
  - stop-7.md:3 for AC7, and P-003.md:86, :105, :111 for the rest.
- **One wording fix:** the tests/desk/ limit used to say the path "replaces tests/desk/ at freeze". The Builder only confirms the folder after freeze, and a frozen spec can't change, so it now says "the spec is revised to name that path".
- **Join-up note:** it now cites docs/design/JOIN_UP_REVIEW.md:12-33, since that file is in my folder this round; the old "not in this definer's pack" line was wrong.
- **Other edits:** the Risks citation is now F-automation-complacency-01.md:4, and the header note has one sentence recording this round.

**2. Why**
The owner's criteria-8 ruling: give each fact a path with a line, or a command, so the desk's evidence check passes; change no criterion; don't grow the spec. Earlier rulings still hold: stop-7 (cite only files in my folder, never a review round) and stop-5.

**3. What I verified**
- A search of S-005 for leftover "Evidence:" lines and section-only references found none in "Facts relied on". The section references left elsewhere in the spec (lines 16, 19 and 215) are not facts.
- A search for the quoted phrases confirmed each is on the line cited: P-003.md:15, :21, :118, :120 and stop-7.md:3.
- I read the cited lines of docs/PROJECT.md (85, 121, 125, 540, 588, 616), specs/S-004.md (161, 164), the three library entries and JOIN_UP_REVIEW.md, and they match what the spec says.
- I have not run the desk's evidence check itself; I don't have it.

**4. What is undone**
- **A leftover empty file:** I first drafted the new section in a scratch file, specs/S-005.facts.tmp. I emptied it but cannot delete it with my tools, so it needs deleting before any commit.
- **Not done by design:** the spec is not frozen; that is the freeze gate's job. The Critic's other non-blocking points (the AC13(a) wording, and how the AC13 and J6 tests are set up) are not acted on, because changing AC13 would change a criterion.

**5. Needed outside my lane**
- Delete specs/S-005.facts.tmp, then commit to build/definer/P-003 with the `Agent-Session` trailer.
- The Critic re-checks the facts section, then the freeze gate.
- The research memo research/P-003-sizing-findings.md is not in my folder, so I cite it only through S-004 and the plan.

**6. Open questions**
None new; the six for the owner in the spec stand. One for the Critic: is the known limit about the missing source code acceptable with a search as its evidence ("no `src/` files in the definer's folder"), or does the evidence check need a file and line there too?