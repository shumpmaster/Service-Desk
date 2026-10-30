# Ruling needed: How routine settings changes are made after Service-Desk graduates

Milestone: M3C
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: The operating notes and the handover package your Builder writes next say how to add a project, move a project from v2.5 to v3, change the notification key, and take the tap's address back in a rollback. Each changes the desk's settings file in a small pull request; adding a project also adds its repository to the read token, and a rollback also moves your phone's subscription back. Needed before your Builder starts on them. Your model can be read two ways here. A graduated product "owns its own running", and the plan makes adding a project a running job; on that reading these are running, not new work. But each is a code change committed against a plan that never froze, and the exception that lets the Builder do that (L-0003) ends when the desk launches; anything else that comes back to a graduated product is filed as new work. Separately, after graduation a defect fix to the desk goes through a short Design of its own, not straight to Build, since its plan never froze. Option A extends an exception to your model, which only you can grant, so a timeout cannot give A: left unruled, the notes give option B.
OPTIONS:
  A. As running it — a new ledger entry, decided by you, keeps L-0003's exception past launch for these four settings jobs only. The handover package names them as running the desk: the Builder's pull request, reviewed by the Reviewer and the Design reviewer (the settings file is copied into the page), with your verdict; about 5 minutes of your time and about an hour of agents' work each (an estimate). The Orchestrator records the ledger entry on your ruling. Anything else is new work.
  B. As new work each time — each is filed as a new project item: a fix through a short Design, an addition through a small Discovery, each with its own gate rulings; about 1 to 2 days of agents' work and 15 to 30 minutes of yours each (an estimate). The operating notes then break their promise that each job takes under 10 minutes (AC27), and taking the tap's address back in a rollback during an incident waits days, not minutes; and after a key leak, your phone's notifications stay switched off for those days, until the new key's change is through.
RECOMMENDATION: A — it keeps the under-10-minutes upkeep and a fast rollback and key change, for a file the build already checks (its form and the limit of 5 projects), with the same reviews as today; the exception it extends is narrow and named.
RISK CLASS: R3   REVERSIBILITY: costly   BLAST RADIUS: how the desk's settings change after graduation, the operating notes, and how fast a rollback is
DEFAULT: B (a timeout cannot grant an exception)   TIMEOUT: 168

## Context
- A graduated product owns its own running; other work comes back as new work; a fix to a product whose plan never froze goes through a short Design, an addition through a small Discovery (source: Personal-Org-Operating-Model OPERATING_MODEL.md §3, "Graduation and re-entry")
- Adding a project, moving one to v3 and rollback as operating notes, each under 10 minutes (source: specs/S-001.md, AC26 and AC27)
- Changing the notification key after a leak, which changes the settings file's public key (source: docs/handover/desk-operations.md, "If the notification keys may have leaked"; src/config/projects.json, push.vapidPublicKey)
- The build exception ends at launch (source: docs/LEDGER.md, L-0003: "until P-001 launches (S-001 AC28) or is stopped")
- Ledger entries are recorded by the Orchestrator (source: docs/LEDGER.md, its history)
- The settings file is copied into the page, which the Design reviewer reviews (source: governance/risk-paths.toml, [paths."src/public/**"]; src/public/lib/config.js)
- The settings file is checked by the build (source: src/lib/configcheck.js)
