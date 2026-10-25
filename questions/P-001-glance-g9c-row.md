# Ruling needed: When two "Still reading" lines fit side by side on Waiting, should each still get its own row?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: G9c's design review (round 1, Q1). Waiting's quiet lines wrap side by side when they are short, as the mockup draws them. Every other quiet line starts with an icon, which marks where it begins, but the grey "Still reading" line has none, so two can sit on one row with only a small gap: "Still reading Alpha…  Still reading the portfolio…". You chose one line per project (decisions/questions/P-001-glance-g9c-several.md, A); side by side they can read as one run-on sentence. Left unruled, it is built as is.
OPTIONS:
  A. Each on its own row — every "Still reading" line starts a new row; a small style change in G9c.
  B. As built — they wrap side by side like the other quiet lines.
RECOMMENDATION: A — it keeps "one line per project" true to the eye, at the cost of a line or two of height while reads are on their way.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: Waiting's quiet lines while first reads are on their way
DEFAULT: B   TIMEOUT: 168

## Context
- The question (source: G9c's design review, round 1, Q1, to be filed verbatim as reviews/M3E/_stage-g9c-design-r1-verbatim.md with G9c's pull request)
- Your answer on several lines (source: decisions/questions/P-001-glance-g9c-several.md)
- The layout rule (source: src/public/sandbox.css, `.v2-quiet`)
