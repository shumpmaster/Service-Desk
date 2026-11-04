# Ruling needed: May the Critic's reading pack leave out the desk's design pictures, so the Critic can run again?

Milestone: Discovery-8 (A brief ready to rule on: the card fix's readiness check cannot run until this is fixed)
Asked in session: session_01QBwHGL14SMPK1652qVZprr

WHY: The Critic can no longer run its readiness checks, plan reviews or its view beside a gate case in this project; only its tracing of failures (Triage) still runs. When the pipeline sent the card fix (the change that makes a decision card show my recommendation) to the Critic for its readiness check, it refused to start the session, because the bundle of files it hands the Critic was over its 20 MB limit: about 88 MB, almost all of it screenshots and mock-up pictures from the desk's design work. So nothing reached the Critic, and the card fix is stuck before its Design gate. The pipeline tries once more on its own, which hits the same limit; after that second refusal it raises a failure card for you. The gate Critic's bundle is over too (about 95 MB), so no Design, Build or Launch gate in this project can reach you until it is fixed. Nothing here is permanent.

The fix is a change to the rule that lists what each reviewing role may read, a rule only you can approve. It changes what the Critic is shown, not what it judges.
OPTIONS:
  A. Narrow what the Critic and the gate Critic may read from the design folder to its Markdown files (the design audits, the join-up reviews, your design requests and the folders' notes) and the agreed screens folder; leave out the build screenshots, the mock-ups (pictures and HTML pages alike) and the reference pictures.
     What happens: two lines of the rule change, for the Critic and the gate Critic only. Measured on today's files, the Critic's bundle falls from about 88 MB to about 2.1 MB, and the gate Critic's from about 95 MB to about 8.9 MB, both under the 20 MB limit. The design reviewer, who judges the pictures, keeps the whole folder; the user representative's reading is unchanged. If the change lands before the pipeline's own second try, the card fix's readiness check simply runs and nothing more is asked of you. If the second try is refused first, the pipeline raises a failure card for you, with the words `retry` and `drop`; I would put my notes for it on the main branch first and recommend `retry`.
     Gain: the Critic and the gates work again with the smallest change, and the Critic keeps every written design record it is ever asked to check against.
     Cost: the Critic no longer sees the design pictures or the HTML mock-ups. When a check turns on one, it reads the design reviewer's written audits, which cite them, and the gate Critic also its verdicts on each pull request. The gate Critic's bundle has about 11 MB to spare; it grows with the project's reviews and research, so it will need looking at again in time, but not with each round of design work. Rules out: nothing. Reversible: yes, the two lines can be put back.
  B. Raise the total limit instead, to about 128 MB.
     What happens: the rule on limits changes; nothing is left out of the folder rule.
     Gain: the Critic sees every design picture under 1 MB (larger files are already left out of any bundle).
     Cost: the same limit also guards every bundle the pipeline hands on and every set of changes a builder returns, so raising it loosens that safety limit everywhere, not only for the Critic; and the design folder keeps growing, so it would need raising again. Rules out: nothing. Reversible: yes.
  C. Move the old build screenshots and mock-ups out of the design folder into an archive folder no bundle reads.
     What happens: about 79 MB of files move; the rule stays as it is.
     Gain: no rule change.
     Cost: the design audits cite those screenshots, so their citations would need rewriting; and the folder fills up again with the next round of design work. Rules out: nothing. Reversible: yes.
  Not offered, and why: a separate limit for bundles only needs a change to the pipeline's tools, which come from the operating model, and so takes longer than either A or B; giving the design folder only to the one task that needs pictures needs the same kind of tools change, since a role's reading list is the same for all its tasks.
RECOMMENDATION: A — it is the smallest change that makes the Critic and the gates work again, it keeps every written record the Critic checks against, and it does not need repeating with each round of design work. Confidence: high on the sizes, which anyone can measure again with the pipeline's own file matcher; medium-high that the Critic does not need the pictures, since its checks are of written records. It would change if you want the Critic to look at screenshots itself (then B).
RISK CLASS: R3   REVERSIBILITY: R3, gate-bearing (owner approval, A4), so it never defaults   BLAST RADIUS: what the Critic and the gate Critic are shown in this project; every later readiness check, plan review and gate view in it
DEFAULT: none (a change to the rules is the owner's ruling)   TIMEOUT: none

## What follows if you choose A
- The two lines change in this project's rule file, in a pull request for you to merge, as every rule change is.
- The operating model's own project template has the same two lines, so a new project would hit the same limit once its design folder grows. I record that as a lesson for the model and propose the same change there separately; nothing in another project changes with this ruling.

## Context
- The run that sent the card fix to the Critic refused to start the session: its log reads "ERROR: plan entry 0 (P-003 critic): the pack is over RUNNER.toml's caps: the folder is over the total cap of 20971520 bytes; recorded as an error outcome", and its session job was skipped (source: reviews/P-003-critic-pack-cap/_run-676-prepare-log.md)
- The dispatch log and the card fix's status file show the dispatch at 16:38:43 on 4 November and no outcome yet (source: dispatch-log/2026-11.jsonl, the P-003 dispatch line; status/P-003.toml)
- The Critic's pack may read `docs/design/**`, added for Design's join-up review, and so may the gate Critic's; Triage's does not (source: governance/PACKS.toml, the critic, critic-gate and critic-triage roles)
- An error ends the try and puts the item back in line; two in a row raise a failure card the owner answers, with `retry` or `drop` for a project with no specification yet (source: governance/checks/orchestrator.py, apply_outcome; governance/ROUTING.toml, [gates.failure])
- The limits are 20,971,520 bytes for a whole bundle and 1,048,576 bytes for one file; a file over the per-file limit is left out of a bundle (source: governance/RUNNER.toml, [limits]; governance/checks/session_runner.py, the pack builder)
- The design folder holds about 89 MB: build screenshots about 57.5 MB, mock-ups about 21.7 MB, reference pictures and notes about 8.9 MB, the agreed screens about 0.74 MB; two build screenshots are over 1 MB each (source: docs/design/, measured on main at 0b226e55)
- With the pipeline's own pattern matcher, the Critic's bundle measures about 87.7 MB today and about 2.1 MB with option A, and the gate Critic's for the card fix about 94.6 MB today and about 8.9 MB with option A (source: reviews/P-003-critic-pack-cap/measure.py, run from the repository root)
- The design reviewer's pack also reads the whole design folder, and the user representative's reads only the agreed screens from it (source: governance/PACKS.toml, the design-reviewer and user-rep roles)
- The design audits cite the build screenshots (source: docs/design/audit-2026-10-24-round-2.md)
- A change under governance/ is risk class R3, which needs the owner's approval (source: governance/risk-paths.toml)
