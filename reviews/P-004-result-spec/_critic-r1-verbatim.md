# The result-filing question — the Critic's round 1, verbatim

Read: questions/P-004-result-spec.md at 96556c4 (claude/new-session-afl9uw). Round 1 of at most 3
(D-044). The Critic read this file and questions/P-004-widget-next-step.md in one reading; its
opening lines, its part on this file and its self-implication flag for this file are copied here
verbatim, and its part on the other file is in reviews/P-004-widget-next-step/_critic-r1-verbatim.md.
Recorded by the orchestrator, session session_01QBwHGJ3UVJ6HY4SS92w7UW, 2026-11-06.

---

Both files fail. Each has one blocking problem: in the first, option A states a ruling the owner never made; in the second, option A is not possible under the desk's checks as it describes itself. Nothing was changed. This was round 1 of 3 (D-044).

# questions/P-004-result-spec.md — Verdict: FAIL

1. **Blocking: option A cannot pass the desk's milestone checks while M5 is only a proposal.**
   - The checks require any P-004 spec to name a milestone already in section 3:
     - a draft spec with no `milestones:` header fails (governance/checks/v3_checks.py:2238-2242);
     - a draft spec naming an id that is not in section 3 fails trace (v3_checks.py:1991-1998);
     - a freeze on a build/ branch runs with `--milestones` and needs that header (v3_checks.py:1862; orchestrator_git.py:2550-2552);
     - D-043's plan review needs each named milestone to be in section 3.
   - M5 is only a proposal. It enters section 3 only when the owner approves it at P-004's Design gate (docs/PROJECT.md:611). The card's own Milestone line says this.
   - So A needs either the owner's Design-gate approval first, or a spec that names a milestone that isn't P-004's. "About a day; nothing for you to do" is not true.
   - Routes to: question drafting; the root cause is the research behind Context bullet 20.

2. **Blocking: option A skips steps that need the owner.**
   - In the desk's own process:
     - a spec id is allocated only when the owner passes the Design gate (orchestrator.py WORD_EFFECT: ("dor","build"));
     - freezing comes after the owner approves the criteria at the Build gate ("plan-pass: … the acceptance criteria need the owner's approval"; ("criteria","approve")/("criteria","proceed") → definer-freeze).
   - P-004 sits at stage 2 with gate "dor-fail" (status/P-004.toml).
   - A as worded ("the Critic checks it, and it is frozen") either goes around both gates or hides two owner approvals.
   - Routes to: question drafting.

3. **Option A's spec would be the desk's first frozen spec, which brings checks the card ignores.**
   - S-001 is still `status: draft` (specs/S-001.md:3), so no spec is frozen yet.
   - A frozen P-004 spec turns on the full definition-of-ready check of docs/PROJECT.md Part 1 for the first time (v3_checks.py:1625-1676).
   - It also needs every criterion to trace to one of V1–V5 (v3_checks.py:1679-1711). These are the desk's targets; a "file the result" spec has nothing to trace to without stretching.
   - Context bullet 19's "the desk's first version, which is P-001's" cites the spec header, but the header doesn't say P-001. status/P-001.toml does. The bullet also leaves out that S-001 is a draft.
   - Routes to: question drafting.

4. **Context bullet 20 is incomplete and misleading.**
   - Where: line 20, "Freezing a spec needs the Critic's plan review recorded as PASS".
   - The module note says that, but freezing also needs the `milestones:` header (with `--milestones`), the owner's criteria approval in the process, and the trace and ready conditions above. Read alone, the bullet makes A look cheap.
   - Routes to: question drafting.

5. **The cost of waiting leaves out the live keys.**
   - Where: WHY, line 6.
   - It says only that "the test data stays on its portfolio branch". The registration also holds cleanup until after filing: deleting the phone data and both keys (EXP-007:140-144).
   - The send key can also write to portfolio's main branch, which the desk reads (EXP-007:127-128). It stays live until it is deleted or expires, about 7 days from 2026-11-06.
   - The owner should be told this, and whether the keys may be deleted now (none of the options needs them, unless the first question's A or D reuses them).
   - Routes to: question drafting.

6. **The WHY is ambiguous about what the earlier slip was.**
   - Where: line 6, "Naming the project instead fails the check, and so does naming nothing: that is the slip that needed your exemption".
   - "that" attaches to "naming nothing", but the nine commits named the project (`Spec: P-004`), as bullet 21 says. A phone reader will take it the wrong way.
   - Routes to: question drafting.

7. **Option B's wording overlaps with an earlier case that was different.**
   - "as was done for the nine" does not stand on its own once read through the question tool.
   - "second exemption for the same cause" blurs a difference: the nine were an accident that could not be undone (already pushed, and force-push is denied), while this commit would be made non-compliant on purpose and then exempted. B should say so.
   - Routes to: question drafting.

8. **Non-blocking: option C's cost may be understated.**
   - governance/checks comes from the operating model through model syncs (docs/LEDGER.md L-0023, "Model v3.7.2 adopted"). A change made only in the desk may be overwritten at the next sync; the lasting fix is a model change.
   - Possible fix: say that in C. Also check whether this applies to the passed P-004-registration-commits card's C.
   - Routes to: question drafting.

9. **Non-blocking: the DEFAULT reason talks about B, not the recommendation.**
   - Where: line 13.
   - A default would adopt A, the recommendation, not B. The real reason no default fits is findings 1–2: A itself needs the owner. R3 and reversible fit precedent (decisions/questions/P-004-registration-commits.md).
   - The recommendation and its "what would change it" need revisiting once A's true cost is stated; B may no longer be only the "today" choice.

**Checked and true:** Context bullets 16, 17, 18, 21 and 22 say what their sources say; 22 only paraphrases handoff item 4's "can delete … once the result is filed", and the registration's Method 7 backs the stricter wording. No private content.

# Self-implication flags (D-050)

- **Second question, finding 8:** if it holds, it also implicates the Critic's PASS on questions/P-004-registration-commits.md option C (reviews/P-004-registration-commits/critic.md).

**Triage routing:** every finding goes back to the Chief of Staff's question drafting.
- Second question, root cause: the spec route was researched from the freeze check's module note alone, without the milestone checks, the trace and ready checks, or the orchestrator's gate steps.

No owner escalation is needed: the criteria themselves are not wrong.
