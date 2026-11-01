Ruling: A — an exception: fix the desk's tests directly so they no longer depend on the live project list, then add Model-Lab.

Asked: 2026-11-01, in the Chief of Staff's session session_01QBwHGJH9m3A4Ray7WpHzBo, by the session's question tool, from questions/P-001-add-project-tests.md (PR #261).

## The owner's words, verbatim
The owner chose: "Exception: fix tests (Recommended)".

## Note on carrying it out
Option A named "the agent that writes tests" (the check author). The desk's tests under tests/desk/ are in the Builder's lane (governance/SURFACES.md), and the check author's lane is tests/acceptance/ only, so a check-author commit there would be refused. The test change is therefore made by a separate Builder session, on a different model from the session that made the settings change, and reviewed by the Reviewer and the Design reviewer as usual. The Chief of Staff told the owner so in the same session.
