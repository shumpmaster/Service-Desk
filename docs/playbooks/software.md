# Software playbook (v3)

*Built by S-010 AC8. First the v3 changes to the software build loop (rulebook draft §7); then
v2.5.1 sections §3, §8, §9, §10 and §14, each copied whole and without change from
OPERATING_MODEL.md v2.5.1. Section cross-references inside the carried text point to that
document.*

## The v3 changes

Where the carried text below conflicts with these changes, these changes win.

**The software playbook** is v2.5.1's build loop, carried forward with these changes:
- Freeze gate (D-043); separate plan and build round counters and the critique digest (D-044).
- Checks run in the agent's session before handback; CI remains final; nothing installed on the
  owner's computer (D-045).
- Join sheets and real-on-real join tests; replacing a spec retires everything linked to it; no
  Build dispatch before the freeze gate; the Integrator role is retired (D-046).
- Visible locked checks plus a hidden holdout set per project, readable only by CI, fingerprinted
  in the repo (D-054).
- Scope comes from each spec's listed areas; sprint scope globs are removed (D-048).
- Risk classes R0–R3 stay as a rule experiment on the first real product (D-048).
- Autonomy level A1 changes from "a human sees the diff before it lands" to **"the owner sees the
  effect before it lands"**: a decision card with a before-and-after, sample or plain scenario of what
  changes for a user; the code itself is covered by the Reviewer and CI (D-065).
- Untrusted text is read only by the Input reader (D-064).

---

# Carried forward from v2.5.1

## 3. Tiers, risk classes, autonomy

Governance scales with the **cost of a mistake**, not the size of the project. Two dials do this: the project's **tier**, and each change's **risk class**.

### Project tiers

| Tier | Profile | Governance |
| --- | --- | --- |
| **T0 Throwaway** (hours) | Owner + one agent, sandboxed | Git from minute one, no secrets in repo, no production credentials. A 10-line `AGENTS.md` is optional. Gate: "it runs for me." |
| **T1 Durable** (weeks+; one owner, 1–2 agents) | The default | The full spine: charter, mission, scope, ledger + digest, specs, locked acceptance tests, builder/judge split, core CI checks (§9) |
| **T2 Product** (real users, deploys, data) | Several agents, a shared environment | T1 + branch protection, CODEOWNERS on governance and tests, merge queue, a worktree per builder task, holdout acceptance suite, mutation checks on R2+, feature flags, canary + auto-rollback, job heartbeats, incident entries |
| **T3 High-stakes** (regulated, money, safety, public claims, multiple teams) | Accountable humans per module | T2 + two-person rule for R3, signed commits, build provenance, agents cannot touch the CI that gates them, independent verification of public claims, a compliance mapping reviewed by counsel |

**Promotion triggers (any one promotes):**

| To | Trigger |
| --- | --- |
| T0 → T1 | Code will live more than a week; a later session will need earlier decisions; any data you'd mind losing |
| T1 → T2 | Any external user; deploys to a shared environment; anyone else's personal data; 3+ concurrent agents; a second human committer; a release that hurt someone |
| T2 → T3 | Regulated domain; money movement; safety impact; public quantitative claims; more than one team; a contractual audit |

Demotion only by a ledger entry naming the trigger that no longer holds.

### Risk class per change (computed from the paths it touches)

| Class | Scope | Examples |
| --- | --- | --- |
| R0 | Docs, spikes | README, research notes |
| R1 | Ordinary source with tests | A new function behind existing tests |
| R2 | User-facing behavior, config, compatible schema changes | UI text, feature flags, a new column |
| R3 | Irreversible or gate-bearing | auth, payments, migrations, infra, CI config, dependency manifests, governance files, locked acceptance tests |

The path → class map lives in `governance/risk-paths.toml`, is CODEOWNERS-protected, and **a CI lint computes each PR's class**. Agents do not choose it. A path's class is the highest class any rule gives it. A change's class is the highest class among the paths it touches. A path no rule matches takes the class named by `unmatched` (default R1). TOML is used because Python 3.11+ reads it with the standard library (`tomllib`), so the checks stay dependency-free.

### Required reviews (same file)

`risk-paths.toml` also says which review verdicts a change needs, by risk class and by domain path. CI reads it, computes the requirements for each PR from the paths it touches, and fails the PR until every required verdict is present and PASS (§9). `owner` is the one reviewer ID that is a person, not an agent.

```toml
unmatched = "R1"                    # class for a path no rule matches

[classes]                           # path globs (surface-map syntax) per class
R3 = ["governance/**", "AGENTS.md", ".github/**", "tests/acceptance/**", "**/migrations/**"]
R2 = ["src/ui/**", "config/**"]
R1 = ["src/**", "tests/**"]
R0 = ["docs/**", "specs/**", "questions/**", "reviews/**", "README.md"]

[reviews]                           # required verdicts, by the change's computed class
R0 = []
R1 = ["reviewer"]
R2 = ["reviewer"]                   # + cross-vendor reviewer if §11 experiment 1 pays
R3 = ["reviewer", "owner"]

# Domains add to (never replace) the defaults.
[paths."src/auth/**"]
risk = "R3"
reviews = ["security-reviewer"]

[paths."src/crypto/**"]
risk = "R3"
reviews = ["security-reviewer"]
checks = ["protocol-verifier", "test-vectors"]
```

**A domain is configuration, not a new framework:** a context pack in `governance/domains/<domain>/`, a reviewer-class agent on the roster, a `[paths."<glob>"]` table here with its `reviews`, any domain-specific CI checks under `checks`, and a human in CODEOWNERS for its paths at T2+.

### Autonomy levels

| Level | Agent may | Used for |
| --- | --- | --- |
| A0 | Read and run in a sandbox, no write tools | Processing untrusted input (web pages, issues, outside comments, tool outputs) |
| A1 | Branch + PR; **a human sees the diff before it lands**, then the orchestrator merges | Changes whose effect a person should see first |
| A2 | Merge when every required gate passes | Reversible, low-blast-radius changes |
| A3 | Deploy behind a flag with automatic rollback | Reversible production changes |
| A4 | Nothing without explicit, logged owner approval | Irreversible actions: data deletion or migration, credentials and permissions, spending, public claims, legal text, new dependencies at T2+ |

**Per-agent authority (from the surface map, §8).** Each agent also carries an authority that answers a different question: may its work land without a decision?

| Authority | Meaning | Maps to |
| --- | --- | --- |
| `autonomous` | Dispatch it and take the result; the surface is the only gate | Up to A2 |
| `proposes` | It does the work; the orchestrator shows the owner the diff before landing | A1 |
| `escalates` | Don't dispatch it unasked; doing the work *is* the decision | A4 |

Most agents should be `autonomous`. If everything is gated, the gate stops meaning anything. Reserve `proposes` and `escalates` for surfaces whose blast radius escapes the surface: build and release paths, dependency manifests, shared code other agents compile against.

**Effective autonomy for a change is the stricter of the agent's authority and the ceiling below.** An `autonomous` agent touching an R3 path still needs owner approval.

**Ceilings by tier and class:**

| | R0 | R1 | R2 | R3 |
| --- | --- | --- | --- | --- |
| T1 | A2 | A2 | A1 | A4 |
| T2 | A2 | A2 | A3 | A4 |
| T3 | A2 | A1 | A1 (A3 with a pre-approved change class) | A4 + second human |

---

## 8. Write surfaces and parallel work

**Order of operations:** inventory the real tree → propose the roster → write the surface map → wire the guard → write charters last. Don't write charters early; the order is the method.

### The surface map (`governance/SURFACES.md`)

One markdown file with two kinds of fenced block. It reads as documentation and parses as config. There is only one of it, because two files that could disagree is the failure being prevented.

````markdown
```roster
# id              class      status     authority
api-builder       builder    installed  autonomous
web-builder       builder    installed  autonomous
infra-builder     builder    installed  escalates
test-author       builder    installed  proposes
reviewer          reviewer   installed  autonomous
security-reviewer reviewer   installed  autonomous
reader            reader     installed  autonomous
researcher        researcher installed  autonomous
```

```humans
# Name <email>: people whose commits may touch any path
Owner Name <owner@example.com>
```

```surface:orchestrator
docs/**
specs/**
questions/**
reviews/**
governance/**
```

```surface:api-builder
src/api/**
!src/api/**/migrations/**
```

```surface:infra-builder
infra/**
src/api/**/migrations/**
```

```surface:test-author
tests/acceptance/**
```

```surface:reviewer
# read-only — no write surface (same for security-reviewer, reader, researcher)
```
````

- **Roster classes:** `builder`, `reviewer`, `reader` or `researcher`. The last three are reviewer-class: no surface globs and no write tools. Readers and researchers also hold no shell (§9).
- **Humans:** the `humans` block lists human identities as `Name <email>`. Their commits may touch any path, and the guard reports them as notes, not failures. A person is not an agent, so humans need no roster row or surface.
- **Semantics:** one glob per line; a leading `!` excludes; later lines win over earlier ones. **Every tracked path is owned by exactly one agent, or by the orchestrator through its own `surface:orchestrator` block** (docs, specs, ledger, governance, review records). Governance files stay R3, so the orchestrator's edits to them still need owner approval. No path is unowned, and none is claimed twice.
- **An agent whose surface can't be written as globs isn't an agent.** Fold it into another one.
- **Size the roster as the smallest set with no shared files.** Add an agent only when its surface already exists. The map comes first, the agent second.
- **A new agent** adds its roster row, its surface block and its charter in the same change.
- **Retiring an agent** removes its roster row, surface block and charter in one change. That change reassigns every path to exactly one remaining owner (CI-checked: an unowned path fails), lands or deletes its open `build/<id>/…` branches first, and carries a ledger ruling. **An id is never reused**, so its past commits stay attributable. To park an agent without retiring it, set `status: planned`.

### The guard

A small dependency-free script, `governance/checks/surface_guard.py`, with three modes:

- **`check`**: proves the map is coherent. Every tracked file (`git ls-files`) has exactly one owner, no glob overlaps another agent's, and every roster row has a surface block. Runs in CI on every PR.
- **`diff <agent>`**: proves the working tree's changes (staged, unstaged, untracked) stay inside that agent's surface. Builders run it before committing, and the orchestrator runs it before accepting a hand-back.
- **`diff --range <base>..<head>`**: proves every commit in a range was made by a known identity, inside that identity's surface. CI runs it on every push and PR. Each commit authored by an agent must touch only that agent's surface. The orchestrator's commits must touch only `surface:orchestrator`. Reviewer-class agents never commit. On a `build/<id>/…` branch, every commit must be authored by `<id>` (or a listed human). Merge commits are skipped, so land builder branches with merge commits. Human commits are reported as notes. Agent commits must carry an `Agent-Session:` trailer. The range walk also runs the test-author independence check (§9).
- **Exempt commits** (an `exempt` block of `<full sha> <ledger id>` lines) are skipped with a note. Use this only for commits that predate the identity rules, such as a repository's founding import. Each one needs its own ledger entry, and since the block lives in governance/, adding one is R3.

*Tip: stage new files before running the check locally. A guard that reads `git ls-files` can't see an unstaged file, so it passes locally and fails in CI.*

### Identities and branches

- **Branches:** builders work on `build/<agent-id>/<task>`; the orchestrator on `orch/<task>`. Reviewer-class agents have no branch.
- **One identity per agent.** Each agent, the orchestrator included, commits as `<agent-id> <<agent-id>@agents.invalid>` (e.g. `api-builder <api-builder@agents.invalid>`), with an `Agent-Session: <session id>` trailer. A builder commit that implements a spec also carries `Spec: <spec id>`, which the test-author independence check reads. **Model names never go in commits** (§2).
  - *T1:* the harness sets the identity per agent. This is **honor-based**: the same harness that sets it could fake it. §9 marks the authorship checks "partial" at T1.
  - *T2+:* each builder gets its own credential (a bot account or token) that can push only to `build/<its-id>/*`, enforced by branch rules on the host. Identity is then enforced, not trusted.
  - *If your harness can't give builders an identity at all:* the orchestrator commits the builder's work on the builder's branch with the builder as author, and records the builder's session ID in the commit trailer or ledger. Treat authorship as unverified.
- **Merge without squashing.** A squash merge rewrites authorship to the merger and erases the evidence. Use merge commits or rebase-merge, and turn squash off in branch settings.
- **Review verdicts.** At T1, the orchestrator records each reviewer's verdict verbatim in `reviews/<PR>/<reviewer-id>.md` (honor-based). When a PR is replaced by a new one, its review records move to the new PR's number, with a ledger entry saying so (L-0051 (5)). At T2+, reviewers post their verdict as a PR review under their own identity; their only write access is to PR reviews, never to the repository.

### Parallel work

- **One active builder per surface at a time,** enforced by CI: a builder may have at most one open PR or unmerged `build/<id>/…` branch. Surfaces are disjoint by construction, so builders on different surfaces can run in parallel without collisions. Reviewers can always run in parallel.
- **Coarse surfaces limit parallelism.** Owning all of `src/api/**` means one API builder at a time. That's fine at T1. When experiment 4 shows a surface is the bottleneck at T2, split it along a real seam (e.g. `src/api/orders/**` vs `src/api/search/**`) with its own roster row.
- **A task spanning two surfaces** is split into one brief per owner and landed together by the orchestrator.
- **Extra agents contribute analysis, review and research,** not concurrent writes to the same surface.
- **The orchestrator runs the combined full suite** before landing parallel changes.
- **Cap parallelism by measurement,** not a fixed number (§11 experiment 4).
- **Shared code:** never remove a shared export because it looks unused, since consumers aren't visible from inside the shared code. Deprecate, announce, then remove.
- **Project-specific test-isolation rules** (e.g. "the suite must run serially because fixtures share files") stay in the charter with their reason until the isolation bug is fixed.

---

## 9. Enforcement: what to mechanize, by tier

**CI is the wall of record.** Agent-side hooks and permission rules are useful early warnings, but they run in the agent's own environment and can fail open (a timed-out or crashed hook may not block). Server-side branch protection and required checks don't depend on the agent.

| Check | How (tool-agnostic sketch) | From tier |
| --- | --- | --- |
| Append-only ledger | Base `LEDGER.md` must be a byte prefix of head | T1 |
| Unique ledger IDs | Parse headings; fail on a duplicate ID | T1 |
| Digest is current | Regenerate `DIGEST.md` and the packs; fail on any diff or an over-budget pack | T1 |
| One open sprint per workstream | Count `status: open` in `sprints/`, grouped by `workstream:`; fail if any count ≠ 1 | T1 |
| Spec predates run | `spec_check.py predates`: a ledger entry with `spec: S-nnn` must be added in a later commit than the one where that spec became `frozen` (strict ancestor); `spec_blob:`, when written, must match the frozen spec | T1 |
| Frozen specs immutable | `spec_check.py frozen`: a change to a frozen spec fails, except its status moving to `superseded` with a ledger entry naming it in `amends:`; amendments are ledger entries, not edits | T1 |
| Locked acceptance tests | `tests/acceptance/**` is the test-author's surface, so the surface check rejects any other builder touching it; changes after lock are R3 | T1 (CODEOWNERS at T2) |
| Test-weakening flags | `review_check.py pr`: deleted test files, added skip/only markers, fewer assertions, broadened catches (patterns in `risk-paths.toml [tests]`) add the owner's verdict to the required reviews. Text heuristics, not semantics | T1 |
| Surface map coherent | `surface_guard.py check`: every tracked path has exactly one owner, no overlaps, every roster row has a surface | T1 |
| Changes stay in the builder's surface | `surface_guard.py diff --range`: every commit is authored by a known agent or a listed human; each agent commit touches only its author's surface; every commit on `build/<id>/…` is authored by `<id>` | T1 partial (harness-set identity); T2 enforced (per-builder credentials + branch rules) |
| Reviewers hold no write tools | `governance_checks.py reviewers`: every reviewer-class agent (`reviewer`, `reader`, `researcher`) has an explicit tool list with no edit/write tool; readers and researchers also hold no `Bash` | T1 |
| Required reviews present | `review_check.py pr`: from `risk-paths.toml`, compute the verdicts each PR needs (risk defaults + domain paths); fail until each `reviews/<PR>/<reviewer-id>.md` is present with `Verdict: PASS`. Listed domain checks are reported (at T1 they aren't verified) | T1 partial (orchestrator-recorded verdicts); T2 enforced (reviewer-posted PR reviews) |
| Test-author independence | Part of `surface_guard.py diff --range`: the `Agent-Session:` on test-author commits for a spec (`Spec:` trailer) differs from every other builder's on the same spec | T1 partial |
| Generated files match their source | Each generator runs with `--check` in CI: `digest.py check`; `surface_guard.py charters --check` for the charters' surface sections; CODEOWNERS at T2 | T1 |
| Orchestrator stays out of code | Every commit authored by the orchestrator touches only `surface:orchestrator`; builder paths reach main only through builder-authored commits | T1 partial; T2 enforced |
| Scope | `governance_checks.py scope`: changed paths ⊆ the open sprint's `scope:` globs, unless a ledger entry in the PR carries `extends_scope:`; bookkeeping paths (ledger, digest, sprints, questions, reviews) are always in scope | T1 |
| Risk class computed | `review_check.py pr` maps changed paths → R0–R3 via `risk-paths.toml` and prints the class | T1 |
| Question format | Files in `questions/` contain every required field | T1 |
| Secrets | Pre-commit + server-side secret scanning; short-lived, least-scope agent tokens | T0 |
| New dependencies | T1 (offline): `review_check.py pr` flags any changed manifest for the owner's verdict and fails unpinned additions (`requirements*.txt`, `package.json`). T2: package exists, minimum age and usage, not a near-name of a popular package, licence allowed (needs registry access; not yet mechanized) | T1 / T2 |
| Break-glass closed on time | An open `break_glass` incident older than 3 working days without its retroactive verdict and postmortem blocks later PRs | T1 (not yet mechanized; applied by hand) |
| Branch protection + merge queue | Required checks, no direct pushes to main, squash merges disabled | T2 |
| One active builder per surface | `governance_checks.py builders`: fail if a builder has more than one unmerged `build/<id>/…` branch (open PRs need the host's API, so they aren't checked) | T2 |
| CODEOWNERS | On `AGENTS.md`, `governance/` (including `SURFACES.md`), `tests/acceptance/`, CI config, `risk-paths.toml` | T2 |
| Holdout acceptance | Suite in a separate repo or CI-only stage; agents have no read access; pass/fail counts only | T2 |
| Mutation check | On changed lines for R2+; fail if the mutation score drops | T2 |
| CODEOWNERS generated from the surface map | Owners per surface, generated, never hand-edited | T2 |
| Job liveness | Each scheduled job emits a heartbeat; alert if it's missing for 2× its period | T2 |
| Rollback | Tested rollback step required; auto-rollback on SLO breach during canary | T2 |
| Incident → ledger | An `incident` label requires a linked postmortem entry within 5 working days | T2 |
| CI self-protection | Agent tokens cannot modify the workflow files that gate them | T3 |
| Signed commits + build provenance | Signed commits; provenance attestations on builds | T3 |

**Warn-only mode (adoption).** Any check above can be set to warn in `governance/enforcement.toml`, each citing a ledger entry. It still runs and prints `WARN:` findings, but doesn't fail. This is for switching the checks on in an existing project and tuning false alarms before enforcing. Parse errors, the surface map's structure, the append-only ledger, the owner's required verdict, the risk-path configuration and the enforcement file's own lint can never be warned.

**Judgment only (no check possible):** taste, product fit, whether a design is truly distinct (partly mechanized via §5), and whether a reviewer genuinely read the diff.

---

## 10. Security baseline for agents

- **Sandbox** agents in containers or VMs with default-deny network egress plus an allowlist (package registry, docs), and no host mounts beyond the worktree. From T0.
- **Untrusted text is data, never instructions.** Web pages, issues, outside PR comments, dependency docs and tool/MCP outputs are processed by an A0 agent with no write tools, which returns structured data only. This doesn't stop all manipulation, so the blast radius stays limited by autonomy levels.
- **Tool and MCP trust:** allowlist servers pinned by version; no auto-install; review tool descriptions on update; patch advisories promptly.
- **Hallucinated packages are a real attack surface:** hence the new-dependency check.
- **Data sent to AI vendors (T2+).** `governance/DATA-CLASSES.md` maps each data class (public, internal code, secrets, personal, regulated) to the vendors allowed for it and the retention terms required (e.g. no training, retention ≤ 30 days). Secrets go to no vendor. An agent handling a class its vendor isn't allowed must stop and ask. A cross-vendor reviewer (§11 experiment 1) is a data decision as well as a quality one. At T3, counsel reviews the table.
- **A spending ceiling.** Every project records a monthly AI-spend ceiling and an 80% alert as a ledger ruling, and sets both in each vendor's console (hard limits where offered). At 80%, new dispatches pause, and reversible work continues only on the owner's word. At 100%, all agents stop until the owner rules. The weekly metrics report spend against the ceiling. *Why: per-task budgets don't add up to a cap when agents run in parallel.*
- **No agent holds credentials that make a change irreversible.** Production writes, billing and permission changes stay with humans or a narrowly scoped release role behind A4.

---

## 14. Anti-patterns, known limits, evidence

### Anti-patterns

| Trap | Looks like | Caught by |
| --- | --- | --- |
| Scope drift | The project becomes a different project three times | SCOPE buckets, scope-path CI check, one open sprint |
| Moving goalposts | "It missed by a little; lower the bar" | Frozen specs, spec-predates-run check |
| Rename-and-retry | The same idea under a new name | The "same design" test, lineage + Distinctness |
| Self-grading | The agent writes, reviews and praises its own code | Role split, locked tests, deterministic checks first |
| Topic-split agents | Two agents both edit the same file; one silently reverts the other | Surface map + guard: one writer per path |
| Reviewer that fixes | Review findings shrink to what the reviewer can patch | Reviewers hold no write tools, permanently |
| Duplicate facts | The same number lives in two files and drifts | Source-of-truth registry; generate the copies |
| Vague subagent reports | "Done, tests pass" with no output | The six-part return contract |
| Orchestrator codes under a builder's name | The planner quietly writes code and labels it as a builder's | Per-builder identities + branch rules (enforced at T2+); no squash merges |
| Tests that share the builder's blind spots | Tests and code written by the same session agree on the same mistake | Test-author in its own session, different model family where available |
| Test gaming | Tests edited, skipped or special-cased to pass | Locked paths, weakening flags, holdouts, mutation checks, refute-mandate reviewer |
| A gain that's really a side effect | An "edge" that is mostly something else | Independent audits told to refute; decompose every gain |
| Silent downgrade | A cheaper model quietly makes permanent calls | Model disclosed every session |
| Summary drift | Progress notes and the ledger disagree | The ledger wins; summaries cite IDs and never restate math |
| Owner bottleneck | Work stalls on unanswered questions | Autonomy levels, batching, defaults for reversible questions |
| Jargon on screen | Users see internal codes | The user-facing bar |
| Silent job death | Scheduled jobs quietly stop | Heartbeats + absence alerts |
| Chat as memory | "As we discussed" three sessions ago | Principle 1 |

### Known limits (read before trusting the machinery)

- **Governance has a cost.** At T1 the owner may spend more time on specs than on building, and people misjudge their own speed. Watch lead time, and demote rules that don't pay.
- **Walls don't stop all gaming.** An agent blocked from tests can still special-case inputs in the implementation. Holdouts and reviewers reduce this; nothing eliminates it.
- **Cross-vendor review is insurance, not proof.** Frontier models increasingly share blind spots. Measure it (experiment 1) before paying for it.
- **Locked tests lock in their errors.** The "report the contradiction" path costs owner attention.
- **Defaults erode control** if you never review them. Hence expiries on defaulted rulings, and tracking the default rate.
- **Hooks give false confidence** if you stop at them. CI is the wall.
- **Test-weakening and dependency flags are heuristics.** They route suspicious PRs to the owner; a determined agent can weaken a test without tripping them.
- **Merge commits aren't checked.** The range guard skips them, so a conflict resolution could carry changes outside the merger's surface. Keep merges mechanical and let the full suite and the reviewer see the merged result.
- **At T1, authorship is honor-based.** Builder identities and recorded review verdicts are set by the same harness the orchestrator runs in. The checks catch mistakes, not a determined orchestrator. Per-builder credentials at T2 close this.
- **Digests lose nuance.** Every row carries its ledger ID; read the full entry before relying on it.
- **The owner can game it too:** re-tiering down, relabelling paths, writing a Distinctness prompt that always passes. Tier and risk-map changes are ledger entries; at T3 they need a second human.
- **Metrics become targets.** Always pair a throughput metric with a stability metric.
- **Compliance mapping can become theatre.** Legal applicability is counsel's call, not this document's.

### Evidence notes

The practices here draw on:
- preregistration practice (predeclared criteria, holdouts);
- SRE practice (flags, canaries, rollback, heartbeats);
- the DORA research program (throughput paired with stability);
- published work showing that coding agents modify or special-case tests when they can, that LLM judges favor outputs resembling their own, and that LLMs recommend non-existent packages;
- vendor guidance on context management and multi-agent systems.

The tier cut points, budgets and metric ranges are **starting points, not validated values**. Test them with §11. Before citing any specific statistic from the V2 draft (benchmark percentages, regulation numbers and dates), check it at the source: several were published in 2026 and some were not independently confirmed when this version was assembled.

---

*v2.5.1 (L-0052): the facts rule (L-0039) also covers known limits. A known limit that rests on unverified platform behaviour needs the same evidence or spike as a fact.*

*v2.5 changes from v2.4 (findings from the Operations-Hub pilot, through the new gate): the generalisation gate for model changes (§11); reviewer briefs carry the project's tier, and above-tier findings are non-blocking except secrets (§12, rule experiment); specs list the facts they rely on, with evidence (§12, rule experiment; its lint isn't mechanized yet); briefs, reports and every review are committed verbatim (§6). Rulings L-0037 to L-0042.*

*v2.4 changes from v2.3 (after an external review, docs/research/001): the six T1 checks that existed only as prose are built (spec predates run, frozen specs immutable, test-weakening flags, scope, dependency pinning, generated charter sections), plus a warn-only mode for adopting the checks in an existing project, and one line rule for governance files (spec S-003). Added: break-glass (§4), model-change requalification (§2), vendor data classes and a spend ceiling (§10), a backup human at T2 (§7), retiring an agent (§8), and the feedback loop (§4). Rulings L-0017 to L-0027.*

*v2.3 changes from v2.2: the orchestrator is now the sole **merger**, not committer; builders commit to `build/<id>/…` under their own identity, CI checks author ↔ surface ↔ paths, and squash merges are off (authorship checks are marked partial at T1 and enforced at T2+); removed the contradiction about coders opening PRs; A1 now always means a human sees the diff before landing; added required reviews and domain checks to the risk-path map (now `risk-paths.toml`), with a matching CI check; added domain reviewer, input reader and researcher as reviewer-class roles, with charters; made the test-author independent of the builder it tests and made it write bug-fix reproducing tests; restored one-active-builder-per-surface as a CI check; added guidance on splitting coarse surfaces; the lifecycle now loops from Record back to Spec, with Research on demand. Owner rulings folded in at adoption: required reviews live in `governance/risk-paths.toml` (read with `tomllib`, Python 3.11+); roster classes are builder | reviewer | reader | researcher; a `humans` block lists human committers; agent commit identity is `<id> <<id>@agents.invalid>` plus an `Agent-Session:` trailer, and model names never go in commits. Source for v2.2's surface mechanisms: `agent-hierarchy` in the headcount repository, https://github.com/cbrock84/headcount @ 98d1c17.*

*v2.2 changes from v2.1: added principles 11–12; the surface map with its roster, surfaces and authority column, and the two-mode guard (§8, replacing module leases); structurally read-only reviewer agents with a reviewer charter template; the source-of-truth registry (§6); the six-part return contract in the builder charter and brief; the matching CI checks, checklist items and anti-patterns. Source: the `agent-hierarchy` skill in the open-source headcount repository.*

*v2.1 changes from the V2 draft: restored V1's mission, scope buckets, research phase, sealed final exam, improvement register, checkpoints and user-facing bar; removed stale-able status fields from ledger entries; replaced the global digest cap with scoped packs; made reversibility and risk class CI-computed; moved owner approval from test code to plain-language criteria; made model-in-commit optional by harness; made cross-vendor review conditional on measurement; raised experiment 1's sample size; fixed experiment 6's blinding.*
