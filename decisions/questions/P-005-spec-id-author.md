Ruling: the owner writes the one-line correction to status/P-005.toml (`spec = "S-009"` becomes `spec = "S-010"`) themselves, in GitHub's web editor on a new branch, and opens and merges its pull request; no exemption is added to the surface guard
Proxy: done at the owner's request (the owner answered in the session by the question tool, verbatim: "You edit it (Recommended)"; the answer is the owner's own, and this line marks only that the Chief of Staff recorded it)

Question: none filed. Asked in session_01QBwHGNJuJKMoanUDTkkWdq while every pull request's governance check was still red from the doubled spec id, so no question file could have been merged by asks-merge first; this record says so rather than file a question after its answer.
Milestone: none (it carries out step 1 of decisions/questions/P-005-spec-id-fix.md, which unblocks both P-003's card fix and P-005's Design work)

Question, as put: You ruled that the timeline's spec number moves from S-009 to S-010 as a one-line change you approve. That line sits in a file only the Orchestrator may write, so a commit from me (Chief of Staff) fails the surface guard. Your own commits may touch any file. Who should write the line?
Options, as put:
  A. "You edit it (Recommended)": you change one line in GitHub's web editor on a new branch and open the pull request; I give you the exact line and the pull request text to paste; nothing else in the rules changes.
  B. "I write it, exempted": I commit it and, in the same pull request, add that commit to the guard's exempt list with a ledger entry; you approve and merge it as an R3 change; more moving parts; the exempt list grows by one.
  C. "Wait for Orchestrator": nothing changes by hand; the numbering waits for the operating model's tools fix; the desk stays stopped for days.

## The owner's words, verbatim
"You edit it (Recommended)"

## The facts behind it
- governance/SURFACES.md gives status/** to the `orchestrator` surface only; the `chief-of-staff` surface does not hold it, and the humans block lets the owner's commits touch any path.
- A trial commit by chief-of-staff making the one-line change, never pushed, failed `surface_guard.py diff --range`: "status/P-005.toml: outside the surface of 'chief-of-staff' (owned by orchestrator)".
- With that line changed, `v3_checks.py trace` passes ("OK: every criterion of a frozen spec traces to a value target"); on main it fails on specs/S-009.md naming P-003's milestone M4 under P-005.
- No file named S-010 exists under specs/ on main or on any remote branch (searched 2026-11-13).

## How it is carried out
- The owner edits status/P-005.toml on a new branch, changing only `spec = "S-009"` to `spec = "S-010"`, opens the pull request with the body the Chief of Staff gave in the session, and merges it once its checks pass.
- The owner then turns the Orchestrator workflow back on (Actions → orchestrator → Enable workflow); the next run dispatches P-005's Definer on S-010.
- Step 2 of decisions/questions/P-005-spec-id-fix.md (the numbering rule, LL-053) is unchanged by this ruling.
