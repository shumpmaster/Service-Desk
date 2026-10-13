# Requests for new work (S-012)

The Chief of Staff starts a work item with `<item>.toml`: `kind = "project" | "research"`, plus
`question` (research). An evidence request is refused: a graduated product owns its own review
(S-023, S-024). Item ids: `P-nnn`, `Q-nnn`.

A research request may hold `milestone = "<id>"`: a project milestone's id from docs/PROJECT.md
section 3 (`M<id>`), or a standard milestone's (`Discovery-1` to `Discovery-8`, `Design-1` to
`Design-6`, `Build-1` to `Build-5`, `Launch-1` to `Launch-5`). It is required once the project is
approved (a project status file holds a `spec`), and optional before; a project request never holds
one (S-023).

A project request for later work on a graduated product may hold `enters`: `"Build"` for a defect's
fix on a frozen plan, or `"Design"` for a fix on a plan never frozen. Either needs `ruling`, the path
of the owner's ruling record under decisions/questions/, whose first line starts `Ruling: `; for
`"Build"` it also holds the `Fixes: <frozen spec> <criteria>` line. A `ruling` without `enters` is
refused. It may also hold `earlier = "<P-id>"`, the earlier product's item, a plain reference for the
reader that no tool reads (S-023).

A refused request is final: fix the problem and file a new request with a new id.
