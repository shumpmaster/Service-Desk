# The widget's next-step question — the Critic's round 1, verbatim

Read: questions/P-004-widget-next-step.md at 96556c4 (claude/new-session-afl9uw). Round 1 of at most
3 (D-044). The Critic read this file and questions/P-004-result-spec.md in one reading; its opening
lines, its part on this file and its self-implication flag for this file are copied here verbatim,
and its part on the other file is in reviews/P-004-result-spec/_critic-r1-verbatim.md. Recorded by
the orchestrator, session session_01QBwHGJ3UVJ6HY4SS92w7UW, 2026-11-06.

---

Both files fail. Each has one blocking problem: in the first, option A states a ruling the owner never made; in the second, option A is not possible under the desk's checks as it describes itself. Nothing was changed. This was round 1 of 3 (D-044).

# questions/P-004-widget-next-step.md — Verdict: FAIL

1. **Blocking: option A wrongly says the "Phone only" ruling forbids the phone's backup.**
   - Where: line 8, "Documents is copied by your phone's iCloud backup, which your Phone only rule doesn't allow".
   - Why it matters: the ruling's "Not ruled" section says whether the phone's own iCloud backup is covered was not asked (decisions/questions/P-004-widget-why-and-data.md:20-21). The card's own Context bullet (line 29) says the same, and docs/PROJECT.md:603 keeps the point open for the Design gate. So the option misstates a ruling, contradicts its own Context, and effectively decides the unruled point inside the option text.
   - Fix to look for: switching backup off should be offered as a way to stay clear of an unruled point for this test only. Alternatively, put the backup point to the owner on its own.
   - Routes to: question drafting (Chief of Staff).

2. **Blocking: B, C and D misstate what the test's rules say happens next.**
   - Where: WHY (line 6), Context bullet line 26, B and C ("The widget route counts as failed"), D ("as its rules say after a not-judged result").
   - Why it matters: the Reviewer found that no Fail rule fires as written, and that the Not-judged rule also needs a counted later refresh, which never ran. The frozen registration therefore "does not cleanly decide" the case, and the Reviewer chose the nearest outcome. The Reviewer also put an open question to the owner: rerun, or treat it like the glue.js clause, which goes straight to the owner (reviews/EXP-007/_reviewer-result.md, finding 4; Deciding threshold, experiments/EXP-007-widget-refresh.md:258-263).
     - The card hides that gap, which is the real reason the owner is asked now instead of the test simply being rerun.
     - B and C should say the owner would be treating the route as failed even though the test did not fail it. D's "as its rules say" overclaims.
   - Routes to: question drafting.

3. **Option A does not say what happens if backup turns itself back on mid-test.**
   - Where: line 8.
   - Why it matters: if the switch "can turn itself back on", the kept copy (about 1.1 MB of project records) may already be in an Apple backup by the time it is checked at the end. The option gives no consequence and no remedy for that case.
   - Routes to: question drafting.

4. **Option A states a secondhand claim as fact.**
   - Where: line 8, "That also removes Scriptable's scripts from your backups".
   - Why it matters: the only source is a vendor's guide about its own app (TomTom, bullet line 31), and it says "backed-up data", not scripts. Where Scriptable's scripts are kept (local or iCloud Drive) is not established. It should be worded as a report.
   - Routes to: question drafting.

5. **Option A's main fact about Documents has no source.**
   - Where: line 8, "Documents is copied by your phone's iCloud backup"; no Context bullet supports it.
   - The source is the registration: Measure (line 188-189) and Method 3 (line 86-87).
   - The option also implies Documents is the only folder the widget can see. Finding 5 shows only that Documents is shared and Caches appears not to be; no other folder was tried.
   - Routes to: question drafting.

6. **Option A's costs and failure path are understated.**
   - "the test is written down again and checked": EXP-007 is frozen, so this is a new registration. D-047 needs it checked as a new experiment, not a re-run. EXP-007 needed three Critic rounds and several Reviewer checks of the widget.
   - Not stated:
     - how long that takes before the owner's day starts;
     - that EXP-007's result stays "not judged";
     - what a second "not judged" under A leads to;
     - that the new result needs the same scope-check answer as the second question.
   - The test widget lives only on a local, never-pushed branch, and no copy of it is in this environment. If it cannot be reached, A and D also carry a rebuild cost that neither option mentions.
   - Routes to: question drafting.

7. **Two figures in the options don't match their sources.**
   - Option A: "stopped after 2 to 4 seconds". Finding 6 gives start-to-start gaps as an upper bound, and only 19 of them were 2.1–4.1 s. The card's own bullet says "most within 2 to 4 seconds"; "after" claims more than that.
   - Option D: "about 25 minutes". The registration gives a repeat as "one more day and about 10 minutes more" (EXP-007:29-30). 25 minutes may be more realistic, but the card should say why it differs.
   - Routes to: question drafting.

8. **Non-blocking: risk class, default and timeout.**
   - R0, reversible, DEFAULT none and TIMEOUT none are defensible, and there is precedent. The stated reason is fine.
   - AGENTS.md §5 says reversible questions default to the recommendation, so the departure is acceptable only because of the reason given.
   - B commits P-004 to a later change to the notification sender (src/notify/**, R3). The option discloses this.

**Checked and true:**
- Context bullets 22, 23, 24, 25, 27, 28, 29, 30, 32 and 33 say what their sources say.
- Bullet 31 is properly worded as secondhand reports.
- The sizing facts match findings 2 and 9.
- No private project content: only repository names and request counts appear, and those are already in public records.

# Self-implication flags (D-050)

- **First question, finding 2:** it traces to a gap in EXP-007's Deciding threshold, which has no rule for "no counted later refresh at all". The Critic passed that registration at round 3 (reviews/EXP-007/critic.md). This finding implicates the Critic's own earlier check.

**Triage routing:** every finding goes back to the Chief of Staff's question drafting.
- First question, root cause: the Reviewer's finding 4 and the "Not ruled" record were summarised rather than carried through.

No owner escalation is needed: the criteria themselves are not wrong.
