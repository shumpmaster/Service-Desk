# Ruling needed: Should the card fix have hidden tests, or go to its Build gate with the two checklist lines that need them marked as skipped?

Milestone: Build-1, Build-3

WHY: Before the card fix is built, its checklist for the Build phase goes to you with its Build gate. Two of its lines, as the operating model defines them, include hidden tests: tests written by the Check author that the Builder never sees, kept outside the repository and run only by the automated checks, so the work cannot be shaped to pass them. The desk has no hidden tests registered, and nothing in its automated checks can run them today. So either a set is made for the fix, or both lines go to the gate as skipped, with that reason. Skipping them drops only the hidden tests: the Check author still locks the visible tests before any work exists, and the Reviewer and the design reviewer still try to break the work before it is accepted. The Build gate's case cannot be finished until this is settled, so leaving it unruled holds the fix at its gate. If you do not answer within 72 hours, I write option A in, as for any reversible question; you can change it later.
OPTIONS:
  A. Skip both lines, with the reason — the two lines (tests written before the work; independently reviewed and passing) go to the Build gate as skipped, each saying no hidden test set is registered for the desk and what still happens instead: the locked visible tests, and the two reviews. You rule them with the gate, as you ruled the same lines for the desk itself.
     Cost: no test the Builder cannot see; a fix shaped to its visible tests is caught only by the reviews. Rules out: nothing; a set can be added later, and taking a line back on after the gate needs only the Critic's check. Reversible: yes.
  B. Register a hidden set for the fix first — the Check author also writes hidden tests; they are stored outside the repository, readable only by the automated checks, and their fingerprint is recorded with a ledger entry; a new step in the automated checks runs them; both lines go to the gate as taken on.
     Cost: a change to the desk's automated checks and governance files, which are in the highest risk class and need your approval, and a place to store the tests outside the repository, none of which exists today; the plan says this fix leaves the pipeline unchanged, so that work comes first, and the Build gate waits for it. Rules out: nothing. Reversible: yes.
  C. Keep both lines as taken on, each saying the hidden tests are left out — the same work as A, recorded as taken on with that note.
     Cost: at a glance the checklist reads as if the model's hidden tests were met; you chose skipped, with reasons, over this for the desk's own Build lines. Rules out: nothing. Reversible: yes.
RECOMMENDATION: A — a fix this small does not justify building the hidden-test machinery first, the locked tests and both reviews still happen, and it records the gap the way you chose for the desk itself. Confidence: high; it would change if you want the desk to have hidden tests from now on (then B, as its own piece of work).
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the card fix's two Build checklist lines and its Build gate only; the desk's code, its other projects and the operating model are unchanged
CHECKED: read cold by the Critic before it goes to the owner; reviews/P-003-hidden-tests/critic.md
DEFAULT: A   TIMEOUT: 72 hours

## Context
- The operating model's standard Build milestones define "Tests written before the work" as locked checks plus hidden holdouts by the check author, and "Independently reviewed and passing" as holding against the hidden tests too (source: Personal-Org-Operating-Model OPERATING_MODEL.md §4, "Standard milestones", Build-1 and Build-3)
- Hidden sets are stored outside the repository, readable only by the automated checks, with only their fingerprints in the desk's register, which lists none (source: governance/HOLDOUTS.md)
- No workflow in the desk's automated checks runs a hidden set; the session runner only keeps holdout paths out of the agents' reading packs (source: .github/workflows/; governance/checks/session_runner.py)
- The automated checks and governance files are in the highest risk class, which needs the owner's approval (source: governance/risk-paths.toml, R3)
- The card fix leaves the Orchestrator and the operating model unchanged (source: docs/projects/P-003.md, section 1, Out)
- Build's checklist lines are written before the Build gate and ruled with it; after the gate, taking on more work needs only the Critic's check (source: docs/projects/P-003.md, section 3, the note under its heading)
- The launch-lines question showed Build-1 and Build-3 as taken on and said this must be settled before the Build gate (source: questions/P-003-launch-lines.md as filed in commit f0e0df8, the note under its checklist lines; decisions/questions/P-003-launch-lines.md)
- For the desk itself, the owner ruled its first three Build lines skipped with reasons, one of them for having no hidden tests (source: decisions/questions/P-001-launch-standard-lines.md)
- The fix's plan passed the Critic's plan review, and the Build gate waits on the Chief of Staff's case (source: reviews/S-005/plan.md on item/P-003; status/P-003.toml)
