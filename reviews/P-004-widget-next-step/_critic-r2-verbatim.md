# P-004's two next-step questions — the Critic's round 2, verbatim

Read: questions/P-004-widget-next-step.md and questions/P-004-result-spec.md at ff04bf4
(claude/new-session-afl9uw). Round 2 of at most 3 (D-044). The Critic read both files in one
reading, and its whole return is copied here verbatim; reviews/P-004-result-spec/_critic-r2-verbatim.md
points here. The facts the Critic could not check (it holds no shell) were checked by the
orchestrator: `git branch -a --list '*p004*'` printed nothing on 2026-11-06; docs/LEDGER.md L-0023
records governance/checks files copied byte for byte from the model at its 3.7.2 sync. Recorded by
the orchestrator, session session_01QBwHGJ3UVJ6HY4SS92w7UW, 2026-11-06.

---

Both files still fail at round 2 of 3 (D-044). Most round-1 findings are fixed. The first file has two blocking problems, one of them carried over from round 1. The second file has one blocking problem, and it comes from how the two cards fit together. I changed nothing. The next round is the last one.

# questions/P-004-widget-next-step.md — Verdict: FAIL

**Round-1 findings:**
- **Fixed:** 1 (Phone only is now "didn't settle", kept for the Design gate), 2 (the gap in the rules is in the WHY and bullet 23; B and C say "though the test didn't fail it"; D says "though they don't cleanly cover this case"), 4 (now "People report…"), 5 (bullet 27 cites Method 3 and Measure; bullet 25 says no other folder was tried), 7 (the timing claim now matches finding 6; D explains its 25 minutes).
- **Partly fixed:** 3 (A now says what a re-enabled switch means, but gives no remedy; see N6) and 6 (the new registration, the checks, the rebuild and "stays not judged" are now in A; the scope-check cost is still missing; see B2).
- 8 stands as a non-blocking note.

**New findings:**

1. **Blocking: option A moves only the kept copy, but the test also needs the widget's snapshots where the app can see them.**
   - Method 6 puts every refresh's snapshot in Caches only.
   - Finding 5(d): the test data sent from the app "holds only the 3 app refreshes". The widget's own snapshots were invisible to the app's send.
   - A says only "with the kept copy in Documents". Built that way, each widget refresh reaches the judge with no snapshot (`no-snapshot`), so the second test would likely come back not judged again.
   - A's privacy line also understates what lands in a backed-up folder: the snapshots run to several MB (the last was 7.4 MB, the bound 20 MB), not the 1.1 MB copy.
   - This undercuts the recommendation's reason ("the only option that can still tell…").
   - Routes to: question drafting.

2. **Blocking (carried over from round-1 finding 6): option A leaves out that a second test cannot pass the desk's scope check.**
   - The new registration is written by the Definer, which is builder class (governance/SURFACES.md:21).
   - check_scope (v3_checks.py:1797-1799) fails any builder commit with no `Spec:` trailer. A `Spec: P-004` trailer also fails (1807-1809). That is exactly what happened to the nine commits.
   - So a second test needs another set of R3 exemptions (registration commits and result commit) or the check change, which are the other card's options A and D.
   - A states neither. "Your time … about half an hour" and "likely a few days" understate it.
   - Routes to: question drafting.

**Non-blocking:**

3. **"This test stays not judged" is ambiguous.** It comes right after the second test is described, so a phone reader can take it as that test's outcome. Say "the first test's result stays not judged".
4. **The WHY's "Nothing the desk does or shows changes, whichever you choose" conflicts with B's "It changes the sender".** BLAST RADIUS repeats the claim.
5. **"All 25 … stopped by the phone within seconds" goes beyond finding 6.** Only 19 gaps are 2.1–4.1 s. The starts before the 193.7 s, 125.3 s and 3609.6 s idle gaps, and the 14:20 start, have no short bound. The Reviewer's own summary says the same thing, but bullet 24 is the accurate form. "Most within seconds" would be true.
6. **A gives no remedy if the backup switch has turned itself back on.** It does not say whether the owner stops the test, deletes the data, or carries on.
7. **D's rebuild is understated.** Method 8 runs the judge from a checkout at 491baa7, which is gone, so the judge must be rebuilt as well as the widget. The rebuild needs the Reviewer's check again. A rebuilt widget or judge may itself be a "changed widget", which bullet 28 says makes it a new registration. D should say this, or say how the run still counts as EXP-007's.
8. **Bullet 30's "it assumed the installed widget and its read key were still in place" is an inference.** The registration's runner lines (29-30) do not say it.

**Checked and true:**
- Bullets 22–29, 31–34, 36 and 37 match their sources. I took the branch-listing fact from you.
- Bullet 35 stays worded as reports.
- The sizing facts match findings 2 and 9.
- The extension of the data-route ruling is disclosed ("which this extends").
- R0, reversible, DEFAULT none and TIMEOUT none are acceptable, with a stated reason.
- No private project content: only repository names and counts, already public in records.

# questions/P-004-result-spec.md — Verdict: FAIL

**Round-1 findings:**
- **Fixed:** 1–4 (the spec route is dropped; bullets 20–22 are correct: S-001 is a draft and P-001's per status/P-001.toml; a spec id is given only at the Design gate per WORD_EFFECT ("dor","build"); a spec must name a milestone already in section 3), 5 (keys in the WHY and bullet 27), 6 (the nine named the project, "by my mistake"), 7 (A now contrasts the earlier mistake with this planned commit), 8 (D carries the model-sync point; bullet 28 cites L-0023, whose byte-for-byte copying I took from you), 9 (the DEFAULT reason is now about the recommendation).

**New findings:**

1. **Blocking: the recommendation's own change condition is met by the companion card's recommendation, and A's "same again" understates the cost.**
   - The RECOMMENDATION says it changes "if more results without a spec are coming, for example a second test: then D, with A meanwhile".
   - The companion card recommends a second test.
   - The owner, reading both, gets "A" here plus a condition the same author already expects. "D, with A meanwhile" is not a choice in the question tool.
   - A's "A second test's result would need the same again" also leaves out the registration commits (see the first file, B2).
   - The recommendation should say what it is if the owner takes the first card's A, and A should state the full repeat cost.
   - Routes to: question drafting.

**Option A is described honestly:**
- It says the commit carries no label on purpose and why.
- It names both checks that skip it, the one ledger entry, the Reviewer's check, and that the owner's merge is the approval (R3, as the exempt block's note and the earlier ruling).
- It sets it against the earlier mistake.
- It is feasible: the full sha is kept by `git merge --no-ff`, the governance/** entry is the Chief of Staff's surface, and Chief of Staff commits need no Spec (v3_checks.py:1797).
- A possible addition: this is the list's first deliberate use, where its documented example is a founding import (SURFACES.md:121-122). The earlier card mentioned that.

**The key-deletion advice is safe:**
- No option in either card needs the old keys. A rerun or second test makes new ones, as the first card's A and D say.
- The judge has already run, using the sessions' access, not the keys.
- Deleting them early only shortens the send key's window to write portfolio's main.
- It departs only from the order of Method 7's clean-up, not from anything measured, so it does not conflict with the frozen registration.

**Non-blocking:**

2. **The advice should say plainly that it is earlier than the test's plan says, and why that is safe.** It could also note that the home-screen widget's refreshes will then simply fail until it is removed.
3. **One WHY sentence is hard to parse on a phone:** "…stays on its branch of your private portfolio repository, since the test's plan deletes it, and the test's data on your phone, only after the result is filed".
4. **B does not say when clean-up can happen under it** (presumably now), which is B's main advantage.

**Checked and true:**
- Bullets 17–28 match their sources (EXP-007 runner/result/Method 7; SURFACES.md:46 and 71; check_scope; SPEC_REF_RE; S-001 header; status/P-001.toml and P-004.toml; WORD_EFFECT; PROJECT.md:611; the registration-commits record; L-0023).
- R3 and reversible match precedent.
- No private content.

# Self-implication flags (D-050)

- **First file, B1:** this traces to EXP-007's Method 6 (snapshots in Caches only), which I passed at round 3 (reviews/EXP-007/critic.md). My round 1 on this card also missed it.
- **First file, B2, and second file, B1:** my round-1 finding 6 named only the result file's scope-check cost and missed the registration commits. Both findings implicate my own earlier check.

**Triage:** every finding routes to the Chief of Staff's question drafting.
- **Root cause, first file:** the storage diagnosis (finding 5) was carried through for the kept copy but not for the send path (5(d)).
- **Root cause, both files:** the scope-check consequence was worked out in one card and not carried across to the other.

No owner escalation is needed: the criteria are not wrong.

Files read:
- /home/user/Service-Desk/questions/P-004-widget-next-step.md
- /home/user/Service-Desk/questions/P-004-result-spec.md
- /home/user/Service-Desk/experiments/EXP-007-widget-refresh.md
- /home/user/Service-Desk/reviews/EXP-007/_reviewer-result.md
- /home/user/Service-Desk/governance/checks/v3_checks.py
- /home/user/Service-Desk/governance/SURFACES.md
