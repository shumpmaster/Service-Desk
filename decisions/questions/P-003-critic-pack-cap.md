Ruling: B — raise the pipeline's total limit to about 128 MB, so the Critic's and the gate Critic's packs fit with the whole design folder

Question: questions/P-003-critic-pack-cap.md
Milestone: Discovery-8

Question, as put: May the Critic's reading pack leave out the desk's design pictures, so the Critic can run again?
Options, as put:
  A. Narrow what the Critic and the gate Critic may read from the design folder to its Markdown files and the agreed screens folder.
  B. Raise the total limit instead, to about 128 MB.
  C. Move the old build screenshots and mock-ups out of the design folder into an archive folder no bundle reads.

How it was answered: the question was filed in PR #285 after the Critic's three cold readings (reviews/P-003-critic-pack-cap/critic.md, PASS at round 3), and put to the owner in the Chief of Staff's session (session_01QBwHGL14SMPK1652qVZprr) on 2026-11-04 by the session's question tool, once it was on the main branch, with the options worded for the chat as "A: leave out pictures (Recommended)", "B: raise the limit" and "C: archive old pictures"; the owner chose "B: raise the limit", which maps to option B. Recorded by the Chief of Staff, word for word, as AGENTS.md §5 has a ruling asked in a session recorded.

## The owner's words, verbatim
"B: raise the limit"

## How it is carried out
- governance/RUNNER.toml's total limit, `change_set_bytes`, goes from 20,971,520 to 134,217,728 bytes (128 MiB), in a pull request for the owner to merge (risk class R3). The per-file limit, `file_bytes`, stays at 1,048,576 bytes, as the question's option B put it: files over 1 MB stay out of every bundle.
- The same limit also guards every bundle the pipeline hands on and every set of changes a builder returns, so it is loosened there too, as the question said.
- When the pipeline's second try on the card fix is refused before that change lands, the failure card it raises is the owner's; the Chief of Staff puts its notes on the main branch first and recommends `retry`, to be answered after the change is merged.
- The operating model's own template has the same limit; the Chief of Staff records the lesson for the model.
