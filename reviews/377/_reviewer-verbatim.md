# The Reviewer's return on the change of PR #377, round 1, word for word

*Read before the pull request was opened, on the commits 68975ef..c045f4c; recorded here once it had its number.*

Verdict: PASS

I found nothing that blocks this change. The rule line, header, ledger entry, register row, surface and identity all hold up against the owner's ruling (option A). There is one hazard about where the commits sit, which must be handled before anything is pushed (point 1 under non-blocking).

## Blocking findings
None.

## Evidence per item
1. **The rule line** (/home/user/Service-Desk/governance/standards/sources.md lines 11-13)
   - "one quoted passage of that specification is enough" matches A's "one quoted passage is enough".
   - "A specification's text is never evidence of what others do in practice" matches A almost word for word, and the answer record's last bullet.
   - The different-strengths clause ("the entry quotes the one it rests on and notes the others") turns A's text on the held finding ("filed on the MUST, with the data model's SHOULD noted") into a general rule. It permits nothing beyond A; it adds a duty, noting the other pages. I do not read it as widening A.
2. **Earlier rules and header**
   - Lines 9-10 and 14 are byte-unchanged in the diff; only the header and the new rule changed.
   - The header adds "and by owner ruling A, 2026-11-12 (decisions/questions/P-005-spec-sources.md)". The date, option and path match the answer record in 68975ef.
   - The header's other sentences are unchanged; one line was only re-wrapped.
3. **L-0048 and the register row**
   - The old ledger is a byte prefix of the new one (75537 to 77368 bytes).
   - All 12 fields from the ledger header are present, in the same order as L-0046.
   - `asked`, `decision`, `licenses_next` and `decided_by` (the owner's verbatim words, the session, the record path) match the question and the answer record. `reversibility: irreversible` matches the question.
   - The register row is a measurement. It reports what was measured on the file (two rules before, three after, the earlier two unchanged). It labels the live effect "Not measured live yet", with the instrument named (Q-026's next source check). Nothing in it is a promise.
4. **Surface and identity**
   - surface_guard passed.
   - The full suite on the trial merge passed (25 of 25).
   - No commit carries a model name or AI co-author line. The authors are chief-of-staff@agents.invalid and orchestrator@agents.invalid.
   - **Will the checker read the line?** Yes. governance/PACKS.toml `[roles.source-checker]` has `must_read` including governance/standards/sources.md. The header cites decisions/questions/P-005, and decisions/** is in the checker's `must_not_see`, but the two earlier citations work the same way, and the rule line stands on its own without that file.

## Non-blocking points
1. **Where the commits sit.** Local `claude/chief-of-staff-p005-o5tad8` (c045f4c) is three commits ahead of `origin/claude/chief-of-staff-p005-o5tad8` (68975ef), which is PR #376's head.
   - If this branch is pushed as it is, PR #376 will carry the R3 rule change.
   - That makes #376's body false ("It changes nothing yet. The rule line itself comes next as its own pull request"), and the owner would merge the rule inside the answer PR.
   - That would break the answer record's "as its own pull request". This change needs its own branch and PR, opened after #376 merges or based on it.
2. **Ambiguous wording a Source checker could hit** (sources.md lines 11-13; worth a later clarification, which would need its own ruling):
   - "notes the others": does the checker have to look for other pages of the specification, or only note the ones the memo cites? Its charter says it opens what the memo cites.
   - "the one it rests on": the entry may rest on either strength. That is what A allows, but the line does not say the filed claim states the strength quoted.
   - "published specification" is not defined, so a checker may differ on whether OCSF or Google's AIP and style guides count. Under A the filed `F-enum-escape-values-01` stands either way. "Specification" could also be read as a vendor's own API spec, which would overlap the vendor two-page rule.
3. **Ledger detail.** L-0048 `options_considered` sums up C as "the OCSF part of the filed entry withdrawn by a superseding entry". The question says "withdrawn, or re-filed as single-source and not load-bearing … and the Google part too unless…". This is shortened, not false.
4. **Trailers.** bd35f09 has no `Spec:` trailer, which CLAUDE.md asks of builder commits. Earlier chief-of-staff commits, including a4b2919 (the last sources.md change), also use a bare `Agent-Session`, and surface_guard accepts it.
5. **Register row source not checked.** "held at the third check on this gap alone" could not be checked against research/Q-026-source-check.md, because no item/Q-026 branch exists locally. It agrees with the question's Context and decisions/Q-026/stop-1-notes.md.

## Open questions
- My instructions say to follow docs/archive/OPERATING_MODEL_v2.5.1.md §12 under ledger entry L-0112. Neither exists: there is no docs/archive/ directory, the ledger ends at L-0048, and governance/OPERATING_MODEL_VERSION is 3.7.2. So I could not apply that checklist and reviewed against your brief.
- My instructions also make a PR body that does not open with "What this means for you" a FAIL. This change has no PR yet, so that check is pending. PR #376's body does open with that heading.

## Commands run
- `git log` / `git diff 68975ef..claude/chief-of-staff-p005-o5tad8`: 3 commits, 5 files, +23/-2.
- `git show 974b774:questions/P-005-spec-sources.md`, `git show 68975ef:decisions/questions/P-005-spec-sources.md`: read the question and the answer record.
- Byte-prefix check of docs/LEDGER.md (68975ef against the branch tip), in Python: True.
- `python3 governance/checks/surface_guard.py diff --range 68975ef..build/chief-of-staff/spec-sources-rule --branch build/chief-of-staff/spec-sources-rule`: "OK: 1 commit(s) … checked", exit 0.
- `git log --format='%an %ae %B' … | grep -i 'claude|opus|sonnet|anthropic|co-authored|gpt'`: no matches.
- In /tmp/claude-0/-home-user/2a5720a6-8e32-50d8-a793-187fe914e204/scratchpad/trial (e6df90e, a merge of 974b774 and c045f4c): `governance/checks/check_all.sh . origin/main` gave all 25 PASS, "OK: all governance checks passed.", exit 0. Output is in /tmp/claude-0/-home-user/2a5720a6-8e32-50d8-a793-187fe914e204/scratchpad/checkall.out.
- `gh api repos/shumpmaster/Service-Desk/pulls/376`: open, head `claude/chief-of-staff-p005-o5tad8` at 68975ef, 1 commit.
