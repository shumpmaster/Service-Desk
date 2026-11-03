Verdict: FAIL

I'm re-opening the memo's sources, and this round's checks are done. Nothing is filed in `library/`.

**Confirmed this round (second opening, grade B)**
- **#31 redirect (memo lines 90, 127–129, 155).** The diff of `decisions/questions/P-001-move-to-build-values.md` reads "if O5's fallback is needed, a permanent redirect from the old address counts as meeting V4." It also has "any API key needs the owner's ruling first." The memo's quotes match.
- **#161 (memo lines 100, 160).** The `pulls/161` body opens "Nothing failed or was skipped in this pull request." The head is `612cf90…` and the PR merged 2026-10-20T14:43:33Z. I did not re-open the run records, so the failed push run and passing pull_request run are not re-confirmed.
- **#239 body (memo lines 106, 134, 167).** The body has 41 commits and was created 2026-10-25T19:40:48Z. The sentence reads "Nine locked cases rewritten, each in its own commit, two of them forced and named (AC80, AC89, AC91)".
- **#239 forced commits.** Commit `69ec664`'s message reads "…rewritten for G8d (forced; not named in G8d's row)". Its date is 2026-10-25 13:58:47Z. Commit `f554f7a`'s message reads the same way, and its date is 13:58:57Z.

**Not confirmed or contradicted**
1. **F-pr-desc-01d (#239) fails.**
   - The memo quotes the body sentence without "and named (AC80, AC89, AC91)". That clause names three identifiers. "Two forced" may mean something other than the commits' "forced" label, and the memo's own open question (line 256) says so. The "short by one" finding is therefore not established.
   - The ten "Rewrite" commits are not confirmed. The HTML list I fetched showed six titles starting "Rewrite" among 41 commits. A third view disagrees again, as it did in the earlier round.
   - `16e1389`'s message begins "Rewrite round 2's locked case…". I did not see the quoted phrase "The one locked case G8d's round 3 forces". The date came back only as 2026-10-25, with no time. The 17:13:08Z timing is unconfirmed.
   - The API page 2 is empty, so the memo's "cut off at the 22nd entry" explanation is not confirmed. I did not re-test page 1.
2. **F-pr-desc-01b (#5 half), 01a (check-run half), 01c, 01e, 02, F-gh-api-01a and F-gh-api-01b, and the pattern entries** were not re-opened this round. The earlier round already carried them as single openings or unconfirmed (`research/Q-017-source-check.md` lines 22–34). Nothing here adds a second independent source.
3. **01c** still rests on 14 bodies that were not re-read in earlier rounds, and on inferred rule dates (grade C).
4. **The memo is not a groundwork map**, so every entry must pass on its own. None does.

**Open questions**
- What does "two of them forced and named (AC80, AC89, AC91)" mean? It may count forced cases differently from the commit labels.
- Why do the API and HTML commit views differ? An authenticated `gh` call or GraphQL would settle it.
- Can the model repo's version dates be read, so the rule binding dates stop being inferred?
- The memo's own gaps remain: six partial diffs, #148 unresolved, edit timing, and whether checks were required before merging.