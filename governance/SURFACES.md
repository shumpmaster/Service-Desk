# Surface map — who writes what (v3)

*v3 project template (S-010). The roster is the confirmed v3 team (D-040, D-070); lanes follow the
role cards (docs are in the operating-model repo, docs/proposals/v3/ROLE-CARDS.md).*

The one file that owns agent ownership. Every tracked path has exactly one writer.
Checked on every PR by `governance/checks/surface_guard.py check`, and every commit by
`surface_guard.py diff --range` (author ↔ branch ↔ surface).

Semantics: one glob per line; a leading `!` excludes; later lines win. Classes: `builder`,
`reviewer`, `reader`, `researcher`. The last three are reviewer-class: no globs, no write tools,
and readers and researchers hold no shell; they never commit, and the Orchestrator script records
their returns verbatim. `orchestrator` is reserved for the Orchestrator script (D-041, D-042): it
writes status files, the dispatch log and the records it copies verbatim, and it merges only when
every required check and review has passed (D-067). `chief-of-staff` is the owner's
conversational session (D-053); it has no agent file here. `library/**` exists in the portfolio
repo, where the Source checker files checked facts (D-064).

```roster
# id               class       status     authority
definer            builder     installed  autonomous
check-author       builder     installed  proposes
builder            builder     installed  autonomous
source-checker     builder     installed  autonomous
chief-of-staff     builder     installed  proposes
input-reader       reader      installed  autonomous
researcher         researcher  installed  autonomous
critic             reviewer    installed  autonomous
reviewer           reviewer    installed  autonomous
```

```surface:orchestrator
README.md
CLAUDE.md
.gitignore
.claude/**
docs/**
!docs/PROJECT.md
!docs/handover/**
digest/**
reviews/**
triage/**
research/**
status/**
dispatch-log/**
queue/**
governance/HOLDOUTS.md
```

```surface:definer
specs/**
experiments/**
```

```surface:check-author
tests/acceptance/**
checks/**
```

```surface:builder
src/**
tests/**
!tests/acceptance/**
docs/handover/**
```

```surface:source-checker
library/**
```

```surface:chief-of-staff
AGENTS.md
docs/PROJECT.md
intake/**
decisions/**
questions/**
governance/**
!governance/HOLDOUTS.md
.github/**
```

```surface:input-reader
# read-only — no write surface (same for researcher, critic, reviewer)
```

```surface:researcher
```

```surface:critic
```

```surface:reviewer
```

Human committers: one `Name <email>` per line. Their commits may touch any path; the guard
reports them as notes. Add the owner before the first commit.

```humans
shumpmaster <furchken@gmail.com>
```

Commits the range guard skips (`<full sha> <ledger id>`), e.g. a founding import made before
agent identities existed. Each needs its own ledger entry; adding one is R3.

```exempt
c1c9a56491d34565b931a6a8f6f41fab2caa855e L-0002
```
