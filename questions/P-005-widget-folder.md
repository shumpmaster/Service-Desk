# Ruling needed: which folder the phone widget's copy of the desk's code lives in

Milestone: M7

WHY: The timeline spec says the widget's copy of the desk's card-making code must be updated in the same pull request as any change to that code (its AC37 and J10), so the spec must name the copy's folder. The widget plan says only "its own folder under src/, outside src/public/", and nothing has been built there yet, so no record gives a path. The plan reviewer cannot pass a spec that writes an unnamed folder into its scope. Naming it now also fixes the widget build's folder in advance, so the two projects cannot pick different ones.
OPTIONS:
  A. src/widget/ — one folder for the widget's copy and its guide, beside the desk's other folders under src/ (config, functions, lib, notify, public, tools) and outside src/public/, as the widget plan requires. Both the timeline spec and the widget build use it.
  B. Leave the folder to the widget build. The timeline spec says its copy rule applies only once the widget project has created its folder, and names it then. This will most likely fail the next plan review on the same finding, because the spec cannot lock a scope it cannot name.
RECOMMENDATION: A. It is the plainest name, it fits the plan's rule, and it settles both projects at once.
RISK CLASS: R0 (specs/**)   REVERSIBILITY: reversible (computed from R0)   BLAST RADIUS: the timeline spec's areas touched, AC37 and J10; the widget build's folder when it starts
DEFAULT: A   TIMEOUT: none — put to the owner in session; it waits until answered

## Context
- The third plan review of S-011: "The widget copy's folder is unnamed … AC37 and J10 name `src/<folder>/**`, which cannot be written into a locked scope or check until the path is known" (source: reviews/S-011/plan.md on item/P-005, finding 2)
- Triage: the path "needs a reading of `src/` or P-004's records, which no pack holds … It goes to the Chief of Staff" (source: triage/P-005.md on item/P-005)
- The widget plan places the copy "in its own folder under src/, outside src/public/" and its guide "beside the copy outside src/public/" (source: docs/PROJECT.md:593, :595)
- The Chief of Staff's reading of src/ on main at eded159e: its folders are config, functions, lib, notify, public and tools, and no file or folder names a widget or Scriptable (source: `git ls-tree origin/main src/`, this session)
