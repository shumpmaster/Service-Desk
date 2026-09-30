# Sources of truth — which file owns each class of fact

Exactly one file owns each class of fact. Everything else is generated from it (and checked
with `--check`) or links to it. When the same fact turns up in two hand-edited places, pick an
owner, generate the other, and add a check.

| Class of fact | Owning file | Derived copies (generated, never hand-edited) |
| --- | --- | --- |
| Who may write which path; agent class and authority | `governance/SURFACES.md` | The "Surface" section of each charter in `.claude/agents/`; CODEOWNERS (T2+) |
| Rulings, kills, readings, predeclarations | `docs/LEDGER.md` | `docs/DIGEST.md`, `digest/*.md` |
| Path → risk class, required reviews, domain checks | `governance/risk-paths.toml` | The required-review status in CI |
| Recorded review verdicts | `reviews/<PR>/<reviewer-id>.md` | — |
| Human committers; exempt commits | `governance/SURFACES.md` (`humans`, `exempt` blocks) | — |
| What the project is for | `docs/MISSION.md` | — |
| What is in or out of scope | `docs/SCOPE.md` | Sprint `scope:` globs must sit inside PRODUCT or MAINTAIN-ONLY |
| How work is done here | `AGENTS.md` | Pointer files (`CLAUDE.md`, …) only point to it |
| Commands to build, test, check | `AGENTS.md` §8 | CI calls the same script, so local and CI can't drift |
| Which data may go to which AI vendor (T2+) | `governance/DATA-CLASSES.md` | — |
| Which checks run warn-only | `governance/enforcement.toml` | The WARN lines in CI output |
| Operating-model version this project runs | `governance/OPERATING_MODEL_VERSION` | — |
| <domain fact, e.g. prices, feature flags, config constants> | <one file> | <generated views> |
