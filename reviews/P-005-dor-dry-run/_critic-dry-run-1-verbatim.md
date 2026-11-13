# P-005: a dry run of the definition-of-ready check on draft 6, the Critic's return verbatim

*Run by the Chief of Staff on 2026-11-13 at about 04:25 UTC (session session_01QBwHGJaKPAWHLvefBrVkKb), before any resubmission: a fresh read-only Critic session on the same model family as the real check, given only the pack the session runner builds for P-005's real check (`session_runner.py pack`, the plan entry P-005 critic ready-dispatch stage 2, on a tree of main at 0ae6c8d with draft 6 of the plan, with dummy MODEL_* variables; 87 MB), told to read its charter and brief there, nothing outside the pack, and to read with Read rather than Grep. Line numbers are of the pack's copy, before the two fallback lines added after it (its observation 1). Not a pipeline verdict.*

Verdict: PASS

I checked docs/projects/P-005.md (Part 1, sections 1 to 9, and the Intent) against governance/standards/definition-of-ready.md and the owner rulings it cites. I found no blocking defect. I did not open every cited memo or library entry; I spot-checked as listed under Claims.

**Milestones (section 3, lines 70-76)**
- Each of M6 to M10 is in the milestone form (name, M-id, "done when", "phase:", "why:"), carries no ` · for:`, and names no codes or ids.
- Each reads as an achievement, not a task.
  - M6 (line 72, "The records can carry the timeline"): "done when every kind of event... is known to have a record..." It is phase Design and is needed for the Design gate.
  - M7 to M10 (lines 73-76): each is a state of the finished desk, phase Build.
- Each "why:" says in plain words why the project needs the milestone, and none contains a stray " · ". Examples are M8's "things sit longer than they should" and M10's "not to sit beside them".
- The standard lines run Discovery-1 to Discovery-8 and Design-1 to Design-6 (lines 82-95). Each is `taken on` with a why, and none is skipped. This meets S-032.
- Line 78 defers Launch and Build standard lines to before the Build gate, as the form allows.

**Section 9 (line 220)**
- It reads "The owner is the user." and nothing in the brief contradicts it. The brief is about the owner's own desk, and no other user is named (section 4 says "No outside party is needed").

**Claims (spot-checked against the records)**
- The owner's eleven answers are quoted accurately in sections 1 and 2 and in the Intent (decisions/questions/P-005-groundwork-shortlist.md, lines 9-19). This covers answer 3's "mostly a function of my business", answer 9's second row and answer 11's "take them all in".
- The four rulings are recorded verbatim and match the plan's text:
  - decisions/questions/P-005-route.md (own Discovery and plan)
  - decisions/questions/P-005-acting.md (finish on GitHub, no key that writes, T1)
  - decisions/questions/P-005-reading.md (keep the read key)
  - decisions/questions/P-005-lasting-copies.md (copies as repo files, none at Cloudflare)
- decisions/questions/P-005-experiments.md is the owner's recorded acceptance for leaving E1 and E2 open into Design. Section 7 (lines 157-160) names the test and the fallback for each, as the definition of ready requires. Its line 19 says so explicitly.
- All six research memos Q-022 to Q-027 exist, each with a source check. The library entries I opened (F-oncall-ceiling-01, F-alarm-rate-01 and the others) exist. The two I read (F-oncall-ceiling-01 line 4, F-alarm-rate-01) say what section 7 (lines 151 and 171) claims, including the "2 per 12-hour on-call shift" figure.
- Section 1 (line 48) and the "Out" list keep P-003 and P-004 out. Section 8 (line 208) reconciles the stop rule's access clause with the acting ruling.
- Section 6 states V7 to V9 with a measure, a target and a date, and it states the misses, the owner-time cost and the stop rule. Line 126 marks the targets as drafts "never set by proxy". Line 190 lists what goes to the owner at the Design gate.
- The plan marks records outside the pack as "outside the check's files" (for example docs/PROJECT.md, shumpmaster/portfolio ideas/basis/TIMELINE-BASIS.md and specs/S-001.md AC79). It says they are context the owner has seen, not evidence I can weigh. I treated those claims as unverified context and did not rely on them.

**Non-blocking observations (not failures)**
1. Section 7, lines 183 and 186 (iPhone Time Sensitive alert; the outside check that catches a stopped feed) and line 180 (alert route) stay open into Design.
   - The Time Sensitive item has a test and a fallback. The alert route has a recorded owner direction (P-005-reading.md, line 20) but no stated fallback.
   - The stopped-feed check says "designed in Design" with no fallback beyond the owner being asked.
   - Only E1 and E2 have an owner ruling that accepts them as open, in P-005-experiments.md. If the owner reads the definition of ready's "open into Define only when ... test ... fallback ... ruling" strictly for these items, the plan may need a fallback line for each. I read them as design choices backed by research (Q-025's P-feed-deadman-01, Q-027's C1 to C3), not unknowns, so I did not fail the plan for them.
2. Line 163: the plan rests on single GitHub pages in places (the retention change's start). It flags this and puts it to the owner, so there is no defect.
3. The Intent (line 232) says "to be confirmed". That is allowed for a living Part 2.

**Open questions**
- Does the owner want the alert route and stopped-feed check treated as unknowns that need their own acceptance ruling and fallback (observation 1)? If so, the Chief of Staff should add that before the Design gate.
- Is the 90-day-retention fact (F-gh-retention-02) acceptable to the owner as single-page evidence? The plan already puts this to the owner at line 190.
