# Ruling needed: When should Work ahead be built?

Milestone: M3A
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: The plan says this last group of work starts once the trial view has become the desk, which waits on its own milestone, the chosen design running on the real back end, not reached yet. You asked for Work ahead next. Building it now lets you try it sooner; waiting keeps it out of the trial view. Left unruled, the build waits.
OPTIONS:
  A. Now, in the trial view — It is built behind the trial view's link, as every new screen since 14 Oct, and you try it on the preview first. It becomes part of the desk when you accept the chosen design, and you accept Work ahead as its own milestone.
  B. Once the trial view has become the desk — As planned. It is built straight into the desk after you accept the chosen design, so it waits for that.
RECOMMENDATION: A — you asked for it next, and it reaches you sooner, the way every recent screen has.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: when Work ahead is built and tried; the views you accepted do not change
DEFAULT: A   TIMEOUT: 48

## Context
- The last group of work starts once the design milestones are accepted, and uses the chosen design (source: specs/S-001.md, M3's header)
- The chosen design running on the real back end has no work filed yet and is the next milestone to reach (source: docs/PROJECT.md section 3 at 77bfeae)
- The owner ruled to plan Work ahead around milestones next, mockup first (source: decisions/questions/P-001-next-work.md)
- Every screen added since 14 Oct was built in the trial view first (source: specs/S-001.md, AC43 and AC48 to AC72)
