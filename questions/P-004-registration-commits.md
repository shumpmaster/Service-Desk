# Ruling needed: How should the widget test's plan get past the desk's scope check?

Milestone: none (the widget's milestone, M5, is still only a proposal in its plan, so nothing here serves a milestone yet)
Asked in session: session_01QBwHGNFKViyibzxHx5qTtm

WHY: The pull request that holds the widget test's written plan and your data-route answer (#300) can't merge cleanly, because one of the desk's checks fails on it. The check reads a label on each commit that names which spec the work belongs to. The nine commits that wrote the test's plan are labelled with the widget project, P-004, but the check accepts only a spec that has its own file, and P-004 has none yet. The label was my instruction, so the slip is mine. Those commits are already on GitHub, and this environment can't rewrite them, so the fault can't simply be corrected. Until you rule, #300 stays open with this check red, and your answer on the test data can't be formally recorded, since that record waits for #300. Your widget test on the phone doesn't depend on any of this. Nothing the desk does or shows changes whichever you choose.
OPTIONS:
  A. "Exempt the nine commits (Recommended)" — "The nine commits are added to the desk's list of commits its checks skip, with one entry in the decision log saying why, as was done for the desk's founding commit. The change goes into #300, the Reviewer checks it, and your merging #300 is your approval. The checks then pass, and the other checks still ran on those commits and passed. Costs nothing more; the exemption covers only those nine and can be removed later."
  B. "Merge with the check red" — "You merge #300 as it is, with the one check failing. No list or log change. The red mark stays in #300's history, and nobody can tell from the checks alone that it was looked at and allowed."
  C. "Change the check" — "The check is changed so a plan-writer's commit may name a project like P-004 when it touches only the plan-writer's own files. Fixes this for every later project too, but it is a change to the desk's own tools: its own written plan, the Critic's check, and a review, a few days of work. #300 waits until it's done."
RECOMMENDATION: A, because it is the desk's own way of letting a known, checked commit past one rule, it is limited to these nine commits, and it is quick. My confidence is high. It would change if you expect this to happen again soon; then C, and A in the meantime, is better.
RISK CLASS: R3   REVERSIBILITY: reversible   BLAST RADIUS: only which commits the desk's checks skip; nothing the desk does or shows
DEFAULT: none   TIMEOUT: none (a departure from the usual default: changing the list of commits the checks skip needs your approval, so it is not taken by default)

## The nine commits
57c024b, 3dd65a5, e11b6f4, ddc67fb, 7fdeedc, 514675d, 389dd68, 4184785, ad2709e: each changes only experiments/EXP-007-widget-refresh.md, written by the plan-writer (the Definer).

## Context
- The governance check on #300 fails on its scope step only; every other step passes (source: GitHub Actions job 127059212294 on #300, 2026-11-05)
- The scope check accepts a commit's spec label only when it names an S-numbered spec with a file in specs/ (source: governance/checks/govlib.py line 822; governance/checks/v3_checks.py line 1548)
- The nine commits carry the label `Spec: P-004`, as the session's briefs told the plan-writer (source: docs/handoff/2026-11-04-chief-of-staff-widget.md, "Open: the scope check fails on #300")
- Each of the nine passed the surface check, which confirms the plan-writer touched only its own files (source: `surface_guard.py diff --range origin/main..build/definer/p004-widget-exp`, 2026-11-05, "OK: 9 commit(s) … checked")
- The desk's list of commits its checks skip is the exempt block of governance/SURFACES.md, each with a decision-log entry, and adding one needs your approval (source: governance/SURFACES.md, the exempt block's note; docs/LEDGER.md, L-0002)
- The pull request description check is also red, by design, until the task "the scope check passes" is done (source: #300's Tasks section; AGENTS.md section 4, model S-034)
