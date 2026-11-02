Verdict: PASS

The Critic's check of research/Q-020.md for gaps and neutral phrasing, on a different model from its writer, verbatim: round 1 (FAIL), round 2 (PASS; non-blocking finding 3 applied; 1 and 2 need no change). Each Critic session checked two or three questions in one return; each round below is the part of the return about this question, with any opening lines that cover all of them. Recorded by the orchestrator. Session session_01QBwHGLTq16QWmY6X4bJYoG, 2026-11-02.

## Round 1
**Verdict: FAIL** (one blocking finding, easy to fix)

**Blocking**

1. **Two bullets lean toward the owner's answers and presuppose a design.**
   - Bullet 1 says "what helps one reader keep track of many changes and of how they fit together over time". The words "how they fit together over time" are the owner's answers 2 and 4 (dots connected, steps in a whole). Shortlist item 5 and memo area P do not carry them. The phrase builds in the idea that a connected account helps.
   - Suggested bullet 1: "what helps one reader keep track of many changes (seen one at a time, grouped, in relation to each other, or only as exceptions), and what has been found to mislead, ...".
   - Bullet 3 asks only about "a summary marked as unchecked or machine-written". That is owner answer 7's chosen design, the "not checked" label. The memo's G3/G4 asked more openly. Reword to the open form: "what is known about how readers treat a summary according to what it says about its origin or checking (no mark, machine-written, unchecked, checked by someone else), and whether any such mark changes how much they rely on it or how closely they check".
   - The "What each answer would change" ending "leaves the choice to a cheap trial" presupposes a trial. Say: "leaves the choice open or to a cheap trial".

**Non-blocking**

2. **Gap: the question never asks what checks are known to work.**
   - "What each answer would change" says error rates "set what checking is needed before one is shown".
   - Yet no bullet asks what checks have been found to reduce or catch errors (a second reader, comparison with the source, quoting the source, sampling). Without that, the rates answer half the decision.
   - Suggested bullet: "what has been found to reduce or catch such errors, at what cost, and whether an author checking its own summary differs from an independent check".

3. **Gap: author-written summaries.** The options list "written by the author", and Q-016's design traps include a flattering account by the same agent. Add a bullet on whether summaries or status reports written by the party who did the work have been found to differ in accuracy or optimism. The practitioner literature on status-report optimism and self-reporting bias covers this.

4. **Gap: alert overload.** "Alerts only" is a listed option but no bullet asks about alert fatigue or notification volume. "Skipped" and "missed" partly cover it. Name it in bullet 1, since the memo found volume swinging between 21 and 121 pull requests a week.

5. **Depth and size.**
   - Six bullets, each a separate literature (briefings, machine-summary errors, trust marks, staleness, phone reading, setting fit), at depth 3 is a lot for one return. Shortlist item 5 joined them, but consider splitting it into two questions. One would be briefing and change-reporting practice; the other, machine-summary error and reliance.
   - Because the Researcher has only WebSearch and WebFetch, say that paywalled studies count only if their abstracts or open versions can be read. Also say that vendor claims are to be graded as vendor claims.

6. **Neutral elements that are good.**
   - "Nothing in this question assumes that any of these works, or that summaries help at all" is right.
   - "Leaving things as they are" is in the list.
   - "Whether outside evidence supports building one at all" keeps the question open.
   - The setting line ("one owner overseeing several projects built mostly by AI agents") is a fair context for grading closeness and leaks no answer.

7. **Topics.** The tags `briefing, summaries, change-reporting, mobile, machine-summaries` still cannot be checked against a library topics list. As in Q-016, confirm them.

### Milestone tag for Q-020

- Discovery-4 ("a plain problem statement, checked against how others have solved it") fits the question's first half. This is the "how others do it" check, taken from briefings, change logs and status reports. It is the closer fit for the groundwork's area P.
- Discovery-5 ("research to the depth needed, every source checked") fits the machine-summary error half. It fits better if the question is read as outside prior art on solutions rather than as a check on the problem statement.
- I would keep Discovery-4 and say that Discovery-5 is also served by the same source check.
- Under OPERATING_MODEL line 118, Discovery research before the Design gate needs no `milestone` tag. Its standard milestones are "shown from its records". So the tag is informative only, and the draft should not rely on it.
- Q-019 is Discovery-5. It is "what already exists", and it reads the desk's own code and records.

## Round 2
## Q-020

**Verdict: PASS**

**Round-1 findings**
- **Closed, blocking 1.** "How they fit together over time" is removed. Bullet 1 now reads "seen one at a time, grouped, in relation to each other, or only as exceptions". The label-specific bullet moved to Q-021 in open form. The "cheap trial" wording is now "leaves the choice open or to a cheap trial", which is acceptable.
- **Closed, 3, 4 and 5.** The author-written-reports bullet, the alert-fatigue bullet and the split are in. The paywall and vendor-claim lines are added. The checking-methods gap is handled in Q-021.

**Blocking:** none. The question is neutral. Line 9 says "Nothing in this question assumes that any of these works". "Leaving things as they are" is an option. The decision line asks "whether outside evidence supports building anything beyond what exists".

**Non-blocking**
1. **The Discovery-4 tag fits.** The question is outside evidence on how others do it. Under OPERATING_MODEL line 118, Discovery research before the Design gate needs no `milestone` tag, so the tag is informational.
2. **Topics.** The tags `briefing, change-reporting, status-reports, notifications, mobile` cannot be checked against a library list.
3. **Possible additional bullet.** Evidence on keeping people in oversight of autonomous or automated agents (supervisory control and its known failures) is not asked directly. The "closeness of setting" grading may pull it in. A one-line example in bullet 1 would make it certain, for example "oversight of automated systems".
