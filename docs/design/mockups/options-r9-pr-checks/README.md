# Options: the pull request’s checks (round 9, answer 3)

The owner, on the pull-request sheet of the Needs-you tab’s option A: “I like the earlier option you recommended. For this one, can you find a way to incorporate the actual checks instead of just “checks passed”” (round 9, answer 3, a comment on the pull-request sheet)

Built over mockup v47 (`../timeline-v47-craft.html`) and the Needs-you tab’s options (`../options-r9-needs/`, whose `ny.css` and `ny.js` are copied into `source/`). `source/build.py` writes `phone.html` (v47 with `ny.css` + `pc.css` and `ny.js` + `pc.js`; the option set by the phone's hash, `.light` or `.dark` fixing the theme); `source/page.py` writes `index.html` and this file with the round 8 options pages' stylesheet.

| Phone | Hash | What it shows |
|---|---|---|
| v47 | `A.light.kinds.sheet=pr.pc=now` | the sheet today: “Its checks passed”, “The AI reviewer passed it”, “What it changes” |
| A (recommended) | `…pc=A.run` (light, dark, 360 wide) | Automatic checks and AI reviews, every one named; running, yours or failed sort to the top; tap for the run on GitHub or the review record |
| B | `…pc=B`, `…pc=B.unfold` | two summary rows that unfold into A’s rows; the rules row unfolds into its 47 rules in eight groups |
| C | `…pc=C` | the checks as a story in time: pushed, each check and review, Ready for you |

Hash words added here: `pc=now|A|B|C` picks the sheet; `run` puts the form check in a second run (its body edited at 11:24 am); `unfold` opens B’s folds.

The checks behind it: .github/workflows/governance.yml (jobs governance and owner-signal), desk-build.yml (build), pr-body.yml (pr-body); `python3 governance/checks/govlib.py list-checks` (47 rules, translated into plain words in `source/pc.js`); governance/risk-paths.toml (reviewer for R1 and above, design-reviewer for src/public/**, the owner for R3); reviews/40/reviewer.md for a record's shape. scrub-proof.yml runs weekly and by hand, never on a pull request, so it is not drawn. A change to the rules (R3) needs the owner's verdict, reviews/<PR>/owner.md, recorded after the merge: the governance check counts it as its one rule not passed, drawn as Yours.

Examples, marked so: the pull request (#212), its commits, times, durations, run number and review words. In v47 the pull-request sheet says three lines: “Its checks passed” (the three automatic checks), “The AI reviewer passed it” and “What it changes”. No check is named, nothing says how long it took or where to read it, and nothing could show one running or failing.
