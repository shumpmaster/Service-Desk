Verdict: FAIL

I'm failing this because the brief names no document to check and the records the P-003 files cite aren't in the pack. I did not review a specific document. I read BRIEF.md, the two P-003 files, and the P-003 sections of docs/PROJECT.md.

**Findings**

1. **No document under review.** BRIEF.md (lines 1–9) says "spec none" and names no file. The only P-003 files are `decisions/questions/P-003-critic-pack-cap.md` and `research/P-003-sizing-findings.md`. Neither is a brief, spec, decision card, gate case or milestone line for me to check. I can't tell which duty applies.

2. **The ruling's cited review is missing.** `decisions/questions/P-003-critic-pack-cap.md:12` says the Critic gave "PASS at round 3" in `reviews/P-003-critic-pack-cap/critic.md`. There is no `reviews/` folder in the pack. The claim can't be checked.

3. **The milestone check can't be done.** `docs/PROJECT.md:593` cites `reviews/P-003-m4-line/critic.md` (PASS at round 2) for the proposed M4 line. That file is absent. The milestone line itself is "[Omitted long matching line]" at 595, so I couldn't read it. I therefore can't check that it reads as an achievement rather than a task, or that it has a plain-words ` · why:`.

4. **The sizing findings can't be checked against code.** `research/P-003-sizing-findings.md` cites many lines in `src/lib/model.js`, `board.js` and `sandbox.js`. There is no `src/` in the pack, so none of those references can be checked.

5. **The "Omitted long line" markers hide the key text.** `docs/PROJECT.md` lines 577, 579, 595, 602 and 607 are the card fix's purpose and its Discovery summary. I can't read them, so I can't check that the lines I can see (608–610) match them.

6. **Smaller points on the ruling card** (`decisions/questions/P-003-critic-pack-cap.md`):
   - The chat wording at line 12 labels option A "(Recommended)". The card records no recommendation for A, and the owner chose B. That is consistent, but the Chief of Staff's notes are not in the pack, so I can't tell whether the label is backed.
   - Line 18 says `change_set_bytes` goes from 20,971,520 to 134,217,728. The arithmetic is right: 128 MiB is 134,217,728. The current value in `governance/RUNNER.toml` is not in the pack.
   - Lines 19 and 20 say the same limit also guards other bundles and builder returns, and that a failed retry will raise a failure card. Both are unsupported by anything I can read.

**Open questions**

- Which document should I check for P-003? Likely candidates are the M4 milestone line, a plan review of the card-fix Design, or a gate case.
- Can the pack include `reviews/P-003-*/critic.md`, `governance/RUNNER.toml`, the full text of PROJECT.md Part 2 "Later work: the card fix (P-003)", and the code the sizing note cites?
- Is the ruling card meant to be checked as a record, or is it only context?