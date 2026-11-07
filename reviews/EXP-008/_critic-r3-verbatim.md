# EXP-008 registration — the Critic's round 3, verbatim

Read: experiments/EXP-008-widget-refresh-documents.md at 9328cfc (build/definer/p004-exp008, Draft 3,
the frozen version), with the test widget at 92caf00 (build/builder/p004-exp008-widget). Recorded by
the orchestrator, session session_01QBwHGJ3CcwMQ1i8bkydhLN, 2026-11-07.

---

Verdict: PASS

**Critic, round 3 of 3 (D-044).** I read /home/user/sd-wt-definer/experiments/EXP-008-widget-refresh-documents.md (Draft 3) cold. I checked it against:
- experiments/_REGISTRATION.md;
- the pass mark, which matches docs/PROJECT.md:623 word for word (I checked it with an exact-string grep);
- ruling A of P-004-widget-next-step, option A in full, plus the other rulings;
- my rounds 1 and 2, and the Reviewer's PASS at 92caf00;
- the widget code: entry.js:240-348 and 396-453, phone.js in full, judge.mjs:238-255.

I ran nothing.

Nothing I found is blocking. The draft has no fail the words don't support, and no new defect that makes a pass likely to be wrong. Findings 1 and 2 are gaps where a pass could be wrong in rare cases. Neither is disclosed, and they make lines 551 and 618 overclaim. Since this draft freezes as it stands, the "Carry" lines below say where each point must go. **The orchestrator's judging brief must ask the Reviewer to state these facts.** Method 10 limits the result to what the verdict says, and Method 9 ("any deviation from this file", "the run's facts") gives the verdict room to state them.

**Self-implication flag (D-050).**
- Findings 1, 2, 4 and 5 touch my own earlier checks:
  - finding 1: I accepted the narrowed rule (ii) in round 2;
  - finding 2: I missed the problem in round 2;
  - finding 4: the wording comes from the fix I proposed in round 2;
  - finding 5: round 2 described coverage as "after the last merge", which it isn't.
- Triage should note this.

**Round 2 findings: all answered**
- 1, `send-start`: answered by the cut at the last `send-start` (Sample 555-559, Method 8 263-266, Method 9 327-334, Measure 516-520), and the two false claims are gone. I checked it against the code: log files sort by start-time id (phone.js:182), so the cut drops exactly the refreshes that started after the send. A refresh R that started before the send keeps its later lines, which Exclusions handle.
- 2, F6: answered (205-208, 217-221, 665-668, 737-740). One wording point remains; see finding 4.
- 3, N1 and N3: answered (729-748). The fifth kind of owner report is at Method 11, line 451.
- 4, N0: answered (646-651, 634-635).
- 5, merges: answered (703-712, with the check that the list is shorter than its limit at 701-702).
- 6, a second send and a failed confirmation: answered (305-311).
- 7, Pass (b): answered (681-683).
- 8, the two edges: answered (596-599, 723-724).
- The Reviewer's findings 1, 5a-c and 9 are all answered (367-370, 335-344, 406-412, 183-187, 155-156, 209-212).

**Findings**

1. **Non-blocking. Exclusions (ii) can hide a real kill, and the draft does not say so.** (Lines 587-591; claims at 618 and 838.)
   - A refresh R that started 8 s before `send-start` and logged marks 1 and 3 is excluded. It may have been killed at 6 s, before mark 10 was due. That is EXP-007's pattern of kills within seconds.
   - The gaps between marks grow to 60 s, so the hidden window grows with R's age.
   - So (ii) can turn a fail (F2) into an exclusion, and so into a possible pass.
   - The "Choices" bullets cover (i) and (iii) but not (ii). Line 618 ("adds no condition that could make a run pass that the words would not") is therefore not quite true.
   - The chance is small: one rare kill has to fall in the 120 s before the send, inside a gap between marks.
   - **Carry into the result:** for each (ii) exclusion, the Reviewer states:
     - R's start;
     - its last mark;
     - the time from that mark to `send-start`;
     - that a kill in that time cannot be ruled out;
     - whether the pass depends on that exclusion.
   - **Carry into the Design gate** as a risk if the pass depends on one.
   - Route: Definer (for any later registration).

2. **Non-blocking. "Every refresh is logged" (Sample, line 551) overstates the log, and N0b does not cover every lost file (Method 7, lines 244-247).**
   - **Before `start`.** The `start` line is written only after `readKept` reads and parses the roughly 1 MB kept copy, and after `snapshotSeen` (entry.js:269-274). A widget refresh killed before that leaves no line at all. That is exactly the memory risk under test.
   - **An emptied file.** If Scriptable's write is not atomic, a kill can leave a log file of 0 bytes. `allLogText` skips empty files (phone.js:184), so no line fails to parse, N0b does not fire, and that refresh's `start` is gone without trace. That is a possible false pass, so "What follows is N0b" is not true for this case.
   - **Partly detectable.** Each refresh writes its snapshot list right after its `start` (entry.js:281). A list r-<id>.json in test-data.json with no `start` of that id in run.jsonl shows that a refresh was lost, unless a `snapshot-dropped` line or the after-send cut accounts for it.
   - **Carry into the result:** the Reviewer states that count as a fact, and states the limit in the verdict.
   - **Carry into the Design gate:** as a risk if the count is not zero.
   - Route: Definer; Builder if the widget ever logs a line before it reads the kept copy.

3. **N0b (`log-unreadable`): acceptable as disclosed. It is not a defect, and it needs no ruling, though it is broader than its reason.**
   - **What the code does.** The code bears out the reason given: each file is rewritten whole at every line (phone.js:155-160). A cut leaves a prefix of the file.
   - **Where the reason holds.** The `start` (or `install`) is lost only if the cut falls inside the file's first line. Otherwise the `start` survives, and the refresh can be seen as unfinished: F2 if it was a counted later refresh.
   - **What that means for the rule.** The blanket rule is wider than its reason needs. The case most likely to trigger it is a first refresh killed in the widget, which can never be counted. EXP-007 had 25 such kills within seconds. If Scriptable's write is atomic, N0b never fires from a kill.
   - **Disproportionate, but sound.** It can never make a pass easier. A not-judged takes the same route as a fail under ruling A ("a fail or another not-judged result comes back to you"). It is coherent with the "no hand check" rule. Its real cost is a wasted run, and that cost is disclosed at 641-645.
   - **Carry into the result:**
     - for each line that does not parse, whether its file's first line still parses;
     - for each, its time against the first `end` with `error: null`;
     - the run's facts from the lines that do parse (these are facts, not a rule applied by hand), so the owner can weigh a re-run.

4. **Non-blocking. The wording of F6's "tried" can be read two ways.**
   - Line 205 makes "one that reached its `end` with an error and is not excluded" a tried read. Line 207 says "One the owner left or locked the phone during ... was not tried". An errored read the owner reports leaving fits both.
   - The natural reading applies line 207 to reads with no `end`, since its last clause ("says nothing about") fits only those.
   - Also, an error shown on screen is "a result" (Method 6, line 218), so the owner is not told to retry. One uninterrupted `unexpected error` fires F6. That can be defended (it is a code fault, likely to repeat), and it follows my own round-2 fix.
   - **Carry into the result:** beside any F6 or N2, the owner's report on that read and the reading the Reviewer applied.

5. **Non-blocking. Busy-stretch coverage is overstated at line 718.**
   - A counted refresh that starts between the stretch's first and last merge "covers" it (line 717), but it read only part of the stretch. So "That refresh read what the stretch changed" is not always true.
   - This is not a loosening. Any rule for coverage is stricter than the words' "a day ... that includes" a stretch, and (b) needs nothing beyond the 24 hours that is already required.
   - Timing a local merge by its committer time is disclosed (722). But this desk's own mechanics batch local merges before pushing, so line 838's "None makes a pass easier" is not shown for that choice.
   - `--base main` and `origin/main` assume that main is each project's default branch.
   - **Carry into the result:**
     - the covering refresh's start against each merge time;
     - for local merges, the push time where GitHub shows it;
     - confirmation that main is the default branch.

6. **F2(i), N11 and the unverified `Timer`: they hold, and need no ruling.**
   - **F2(i).** A counted widget refresh still unended more than 120 s after it started is past the last mark and past any widget's budget. Counting it as unfinished is supported by "finishes ... every time", and it is disclosed (596-599).
   - **N11 and (iii).** With no `Timer` evidence, an unfinished refresh near the send can only turn a pass or a fail into a not-judged.
   - **A late timer.** A mark that fires late is still in the log if it is written before the log is built, since (ii) asks that it be logged, not logged before the send. The risk of a false F2 from a late timer is negligible.

7. **Non-blocking, accuracy only; nothing to carry.**
   - Line 184 says a refresh "read something". The code saves when the map is not empty, which includes starting from an incomplete copy (entry.js:311).
   - Line 248's "four other lines" leaves out `snapshot-dropped` lines.
   - No rule depends on either.

**Is any reading a new rule needing the owner's ruling?** No. Every disclosed choice either makes a pass harder, or turns a pass or a fail into a not-judged, which ruling A sends to the owner with the same two fallbacks:
- the cut at the last `send-start`;
- F6 narrowed to a read really tried, and N2;
- N0b and N0;
- F2(i), (iii) and N11;
- the 24 hours;
- three merges in 60 minutes;
- merge commits counted;
- a stretch counted as happening if any of its merges falls in the span.

The only places where a pass could be wrong are findings 1 and 2. Those are gaps in what can be observed, not readings of the words. They are carried into the result, and into the Design gate if they matter.

**D-047:** this is a new test, not a re-run (lines 74-85); ruling A's own words are cited.

File checked: /home/user/sd-wt-definer/experiments/EXP-008-widget-refresh-documents.md
