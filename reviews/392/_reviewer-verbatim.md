# The Reviewer's return on the change of PR #392, round 1, word for word

*Read before the pull request was opened, on commit 94f0fa50 of build/chief-of-staff/vendor-pages-rule; recorded here once it had its number.*

Verdict: PASS

I tried to refute the change on all five points and could not. I found no blocking findings.

**1. Fidelity to ruling A** (/home/user/sd-vendor/governance/standards/sources.md, lines 12-19)
- **Line 12-13 (changelog):** matches A(1) word for word, except that "tool" becomes "vendor ... its product".
- **Line 14-16 (pages disagree):** matches A(2), including "quoting each with its page and any date it gives, without stating which is current" and "not load-bearing". The added words "on how its product behaves" narrow the scope; they do not widen it.
- **Line 17-18 (single page):** matches A(3), including "may be filed marked "single page"" and "not load-bearing".
- **"Tool" vs "vendor":** this does not change the meaning. The existing two-page line (line 10) already uses "vendor's own product". A's "tool" is that product (Linear, incident.io), and A's "a tool's own pages" are the vendor's pages about it. The file just keeps the term it already uses, and nothing is wider.
- **Line 19 ("Not load-bearing means no plan decision may rest on the entry"):** this is within the ruling. It is A's own sentence, and the answer record at decisions/questions/P-005-vendor-pages.md (under "How it is carried out") repeats it as part of carrying the ruling out. The file says "the entry" where A says "it" (the fact); the meaning is the same, because a fact goes into the library as an entry.

**2. Can the checker apply it, and does it conflict?** Each line can be applied as written. There is no conflict with the two-page rule: a changelog plus one guide page counting as two sources is exactly the cost A states. There is no conflict with the specification-text rule, which covers a different kind of claim. There is no conflict with the checker's file (/home/user/sd-vendor/.claude/agents/source-checker.md, "Two independent sources for load-bearing facts"): both new entry kinds are declared not load-bearing, and each quote is still confirmed, so "never file a fact you could not confirm" holds.

**3. Earlier lines and header**
- The only removed lines are the two header lines that were rewrapped. Lines 10-11 and 20-23 are unchanged.
- The header adds "by owner ruling A, 2026-11-12 (decisions/questions/P-005-vendor-pages.md)". That file exists at the base commit f51977a3, and it records option A, the date 2026-11-12, and the owner's words.

**4. Surface and identity**
- surface_guard diff --range 94f0fa50^..build/chief-of-staff/vendor-pages-rule: "OK: 1 commit(s) ... checked", exit 0.
- The author is chief-of-staff <chief-of-staff@agents.invalid>. The commit carries the trailer `Agent-Session: session_01QBwHGJzc87ezrCJjztgrMp`.
- I searched the commit message for model names and AI co-author lines (claude, opus, sonnet, gpt, anthropic, openai, co-authored) and found none.
- There is no `Spec:` trailer. That is consistent with AGENTS.md line 27 (Spec is needed only on builder commits for a spec) and with the earlier change to this file, bd35f09b, which had none either.
- The whole commit changes only governance/standards/sources.md, which is inside chief-of-staff's lane (`governance/**` in governance/SURFACES.md).
- check_all.sh . origin/main in /home/user/sd-vendor: all 24 checks PASS, ending "OK: all governance checks passed.", exit 0.

**5. Will the checker read it?** Yes. governance/PACKS.toml `[roles.source-checker]` lists governance/standards/sources.md under must_read.

**Non-blocking points**
- **Overlap between rules.** When two pages agree and a third disagrees (the Linear case: the changelog and the issue-property page against the triage page), both the two-page rule and the disagreement rule could apply. A reading of the text suggests the disagreement rule decides, but the file does not say which one wins. A has the same gap, so this is not a widening; a later ruling could settle it.
- **No label for disagreement records.** Single-page entries get the mark "single page", but no mark is named for disagreement records. A names none either. The checker will need a convention for showing "not load-bearing" in the library entry.

**Open questions**
- The checklist you asked me to follow (docs/archive/OPERATING_MODEL_v2.5.1.md §12) does not exist in this worktree: docs/archive/ is missing, though the README and the checks still cite it. I reviewed against the brief, AGENTS.md and the checks instead.
- No pull request exists yet for this branch, so I could not check the rule that a PR body must open with a plain "What this means for you" paragraph. If that paragraph is missing when the pull request is opened, that would be a FAIL finding.

**Commands run**
- `git log`, `git show` and `git diff` on 94f0fa50, f51977a3 and `origin/main:questions/P-005-vendor-pages.md`
- The `surface_guard.py diff` and `check_all.sh` runs above. The full check output is at /tmp/claude-0/-home-user/2a5720a6-8e32-50d8-a793-187fe914e204/scratchpad/checkall.txt
- grep over AGENTS.md, governance/SURFACES.md, governance/PACKS.toml and the earlier commits to this file
