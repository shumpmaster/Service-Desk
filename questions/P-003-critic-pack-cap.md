# Ruling needed: May the Critic's reading pack leave out the desk's design pictures, so the Critic can run again?

Milestone: Discovery-8 (A brief ready to rule on: the card fix's readiness check cannot run until this is fixed)
Asked in session: session_01QBwHGL14SMPK1652qVZprr

WHY: The Critic cannot be started on anything in this project any more. When the pipeline sent the card fix to the Critic for its readiness check, it refused to start the session, because the bundle of files it hands the Critic was over its 20 MB limit: about 90 MB, almost all of it screenshots and mock-up pictures from the desk's design work. So nothing reached the Critic, the card fix is stuck before its Design gate, and the pipeline will raise a failure card on it shortly; trying again hits the same limit. The gate Critic, which writes its own view beside every gate case, has the same problem (about 97 MB), so no Design, Build or Launch gate in this project can reach you either until it is fixed.

The fix is a change to the rule that lists what each reviewing role may read, a rule only you can approve. It changes what the Critic is shown, not what it judges.
OPTIONS:
  A. Narrow what the Critic and the gate Critic may read from the design folder to its written records (every Markdown file in it, which includes the design audits, the join-up reviews and your design requests) and the agreed screens folder; leave out the build screenshots, the mock-ups and the reference pictures.
     What happens: two lines of the rule change, for the Critic and for the gate Critic only. Measured on today's files, the Critic's bundle falls from about 90 MB to about 2.1 MB, and the gate Critic's from about 97 MB to about 8.9 MB, both under the 20 MB limit, and no file left in either is over the 1 MB per-file limit. The design reviewer, who judges the pictures, keeps the whole folder; the user representative's reading is unchanged. I then answer the failure card `resubmit` (I will put my notes for it on the main branch first and tell you the word), and the card fix's readiness check runs.
     Gain: the Critic and every gate work again with the smallest change, and the Critic keeps every written design record it is ever asked to check against.
     Cost: the Critic no longer sees the design pictures; when a check needs one, the design reviewer's verdict, which cites them, is what it reads. Rules out: nothing. Reversible: yes, the two lines can be put back.
  B. Raise the limits instead: the total limit to about 128 MB and the per-file limit above the two largest screenshots.
     What happens: the rule on limits changes; nothing is left out.
     Gain: the Critic sees everything, pictures included.
     Cost: the design folder keeps growing with every round of design work, so the limit would need raising again; each session carries about 90 MB it almost never reads. Rules out: nothing. Reversible: yes.
  C. Move the old build screenshots and mock-ups out of the design folder into an archive folder no pack reads.
     What happens: about 79 MB of pictures move; the rule stays as it is.
     Gain: no rule change.
     Cost: it moves records the design reviews cite, so those citations would need checking; and the folder fills up again with the next round of design work. Rules out: nothing. Reversible: yes.
RECOMMENDATION: A — it is the smallest change that makes the Critic and the gates work again, it keeps every written record the Critic checks against, and it does not need repeating as the design folder grows. Confidence: high on the sizes, which I measured with the pipeline's own file matcher; medium-high that the Critic never needs the pictures, since its checks are of written records. It would change if you want the Critic to look at screenshots itself (then B).
RISK CLASS: R3   REVERSIBILITY: reversible, but a rule change, so it never defaults   BLAST RADIUS: what the Critic and the gate Critic are shown in this project; every later readiness check, plan review and gate in it
DEFAULT: none (a change to the rules is the owner's ruling)   TIMEOUT: none

## What follows if you choose A
- The two lines change in this project's rule file, in a pull request for you to merge, as every rule change is.
- The operating model's own project template has the same two lines, so a new project would hit the same limit once its design folder grows. I record that as a lesson for the model and propose the same change there separately; nothing in another project changes with this ruling.

## Context
- The pipeline's run that sent the card fix to the Critic refused to start it: "ERROR: plan entry 0 (P-003 critic): the pack is over RUNNER.toml's caps: the folder is over the total cap of 20971520 bytes; recorded as an error outcome", and its session job was skipped (source: the orchestrator workflow's run 676 on 2026-11-04, its prepare job's log; dispatch-log/2026-11.jsonl, the P-003 dispatch line at 2026-11-04T16:38:43Z; status/P-003.toml)
- The Critic's pack may read `docs/design/**`, added for Design's join-up review, and so may the gate Critic's (source: governance/PACKS.toml, the critic and critic-gate roles)
- The limits are 20,971,520 bytes for a whole pack and 1,048,576 bytes for one file (source: governance/RUNNER.toml, [limits])
- The design folder holds about 89 MB: build screenshots about 57.5 MB, mock-ups about 21.7 MB, reference pictures and notes about 8.9 MB, the agreed screens about 0.74 MB, and its Markdown and HTML records about 1.4 MB; two build screenshots are over 1 MB each (source: docs/design/, measured on main at 0b226e55)
- With the pipeline's own pattern matcher (governance/checks/session_runner.py), the Critic's pack measures about 90.0 MB today and about 2.05 MB with option A; the gate Critic's for the card fix about 96.9 MB today and about 8.92 MB with option A; neither holds a file over 1 MB with option A (source: measured in this session on main at 0b226e55)
- The design reviewer's pack also reads the whole design folder, and the user representative's reads only the agreed screens (source: governance/PACKS.toml, the design-reviewer and user-rep roles)
- Before the card fix, the Critic was last sent a session here on 2026-10-06 (source: dispatch-log/2026-10.jsonl, the last critic dispatch line)
- A change under governance/ is risk class R3, which needs the owner's approval (source: governance/risk-paths.toml)
