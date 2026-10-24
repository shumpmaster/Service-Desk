Verdict: PASS

The line checked:

- The desk's important things readable at a glance (M3E) · done when the owner's 24 October glance answers, the pieces of work within each sprint apart, show on the desk's preview, each with its tests: what needs the owner, a stopped project and a project the desk can't read stand out on Home; kicked-back cards sit in a strip above two equal lanes on Waiting; gates carry short titles; finished and failed marks are green and red; a small arrow marks where each project is now; every milestone and sprint is counted, the standard checklist set apart; and a page's most important things sit in a soft box · phase: Build · why: the owner knows where everything is on the desk but can't pick out what matters at a glance, and wants it to stand out first


The line, quoted whole as it stands at /home/user/Service-Desk/docs/PROJECT.md:115 (working tree, uncommitted):

"- The desk's important things readable at a glance (M3E) · done when the owner's 24 October glance answers, the pieces of work within each sprint apart, show on the desk's preview, each with its tests: what needs the owner, a stopped project and a project the desk can't read stand out on Home; kicked-back cards sit in a strip above two equal lanes on Waiting; gates carry short titles; finished and failed marks are green and red; a small arrow marks where each project is now; every milestone and sprint is counted, the standard checklist set apart; and a page's most important things sit in a soft box · phase: Build · why: the owner knows where everything is on the desk but can't pick out what matters at a glance, and wants it to stand out first"

Findings:
- **Achievement, not a task:** the name ("readable at a glance") and the "done when" ("show on the desk's preview", "stand out", "sit", "carry", "are green and red", "is counted") all describe a state that has been reached. Nothing in it is something someone does. The name is in plain words.
- **No codes or ids:** the only id is in the (M3E) slot. "Home" and "Waiting" are screen names, and "24 October" is a date. The line has no stage, spec or criterion codes (no G1, S-034 or AC).
- **Covers G1 to G9, truthfully** (checked against the stage table, /home/user/Service-Desk/specs/S-001.md:2582-2593, and the rulings at :2426-2486):
  - G1 is "what needs the owner, a stopped project and a project the desk can't read stand out on Home".
  - G2 is "kicked-back cards sit in a strip above two equal lanes on Waiting".
  - G3 is "gates carry short titles".
  - G5 is "every milestone and sprint is counted". G6 is "the standard checklist set apart".
  - G7 is "finished and failed marks are green and red". G8 is "a small arrow marks where each project is now". G9 is "a page's most important things sit in a soft box".
  - G4, and the smaller parts of G1, G2 and G5, are not named. These are the project page's calm line, the ran-again lines merged into one, the Timeline opening on the next milestone, the Reload button, one date form, "At work" in dark ink, "Since you last looked" cut to two lines, Done shaded, "new" on cards, and the CI line. They are covered by the line's main clause, "the owner's 24 October glance answers … show". Each comes from the owner's round-1 "I like all of your proposals", a round-1 ruling (for example P-001-glance-ran-again.md, AC91 (j)) or the owner's "only if simple" go-ahead. As with stage 8 in the M3D check, that is a broad reading, but a fair one (see note 1).
  - Nothing listed is untrue of its stage. G10 is excluded by "the pieces of work within each sprint apart", which matches the ruling's split (G1 to G9 for M3E).
- **Phase and placement:** Build is right. This is build work needed before the Build gate. It sits after M3D (:114) and before M3C (:116, Launch), as option B says ("for G1 to G9, after M3D and before M3C"). M3E appears in no other line of PROJECT.md. M3F appears nowhere in PROJECT.md, which is correct, since it is filed later as its own item.
- **The why:** plain words, with no " · " inside.
- **Word for word:** the name matches the owner's approved option B in /home/user/Service-Desk/decisions/questions/P-001-glance-plan-milestones.md:9 ("The desk's important things readable at a glance"). The record's first line reads "Ruling: B". The whole line matches specs/S-001.md:15984-15991 (question 1 B) exactly; I checked this with a single exact-match search on PROJECT.md, which found 1 match.
- **No gendered pronouns:** there are none; the line uses "the owner".
- **The sources line (:105):** it adds "for M3E, the owner's approval decisions/questions/P-001-glance-plan-milestones.md (B) and the Critic's check decisions/questions/P-001-glance-plan-milestones-critic.md". The approval path is right and names the option. The M3D sources are now cited too, which closes note 2b of the M3D check. The Critic's check file does not exist yet (see note 2).

Non-blocking notes:
1. **G4 has no named item in the list after the colon.** A reader who takes that list as complete could think M3E is reached without the project page and Timeline opening on what matters, the Reload button, the merged ran-again lines and the single date form. The main clause rules that reading out, so I don't count it as untrue. If the line is reworded later, adding "a project's page and Timeline open on what matters, and a failed load offers Reload" would make the list complete. A rewording needs the Critic's check.
2. **The sources line cites a file that does not exist yet:** decisions/questions/P-001-glance-plan-milestones-critic.md. This check has to be recorded under that exact name in the same pull request as the line, or the citation points at nothing.
3. **Places outside this line that still need updating once M3E is committed:**
   - The spec's "The milestones each serves" (S-001.md:2599-2613) still describes M3E as only proposed.
   - Question 1 is still listed as open under "Open: after the glance audit" (:15977).
   - The spec's `milestones:` header does not yet name M3E.
   - From now on, G1 to G9's pull requests should carry `Milestone: M3E` rather than the `none (…)` wording.
   - The question file questions/P-001-glance-plan-milestones.md is still in the working tree. Tidying it away is the Chief of Staff's job (AGENTS.md §5).
4. **Self-implication (D-050): yes.** I passed this same wording in plan review round 3 (reviews/S-001-after-glance/_plan-critic-r3-verbatim.md, item 5) without checking it stage by stage. Note 1 is a gap that check left open. Whoever runs Triage should weigh that.

Files read:
- /home/user/Service-Desk/docs/PROJECT.md (:105, :114-116)
- /home/user/Service-Desk/decisions/questions/P-001-glance-plan-milestones.md
- /home/user/Service-Desk/questions/P-001-glance-plan-milestones.md
- /home/user/Service-Desk/specs/S-001.md (:2382-2649, :15973-16009)
- /home/user/Service-Desk/reviews/S-001-after-glance/_plan-critic-r3-verbatim.md
- /home/user/Service-Desk/decisions/questions/P-001-m3d-line-critic-2.md (for the form)
