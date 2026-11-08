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
user-rep           reviewer    installed  autonomous
design-reviewer    reviewer    installed  autonomous
```

```surface:orchestrator
README.md
CLAUDE.md
.gitignore
.claude/**
docs/**
!docs/gates/**/*-case.md
!docs/gates/**/*-case-*.svg
!docs/gates/**/*-proposal.md
!docs/users/PROFILE.md
!docs/PROJECT.md
!docs/projects/**
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
docs/projects/**
intake/**
decisions/**
questions/**
sessions/chief-of-staff/**
governance/**
!governance/HOLDOUTS.md
.github/**
docs/gates/**/*-case.md
docs/gates/**/*-case-*.svg
docs/gates/**/*-proposal.md
docs/users/PROFILE.md
```

```surface:input-reader
# read-only — no write surface (same for researcher, critic, reviewer, user-rep, design-reviewer)
```

```surface:researcher
```

```surface:critic
```

```surface:reviewer
```

```surface:user-rep
```

```surface:design-reviewer
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
57c024b8a9f2717008243d37b77d51a0e955e605 L-0024
3dd65a5ad0845f974fcf554530272e44d208e481 L-0025
e11b6f4321d25702347097502ad7214146a5f01c L-0026
ddc67fb8602b7ef7af5955edfda5a6d2505db4d0 L-0027
7fdeedcbbaecf80e5b9189e979b6292e9d000fbd L-0028
514675db43d90a44ce0a05a141ed07769100e601 L-0029
389dd68d5a76d7949a5476a0184dbaaa5e286ad9 L-0030
4184785b67ebfa6e4b05d840b5c9d50f262cde66 L-0031
ad2709e20faddd72483acc0a21ce2aeaacecb73c L-0032
c7086cde9e20d626e204ab7ca89c24b6897f02b5 L-0033
712c951f164f5b5344106acb9f2ec237afb94436 L-0034
cd98e5f08cdfce990360dd0b3cc5958ccb3bc6ca L-0035
9328cfc05dcd76898f9869693386c52f99dc0521 L-0036
```
