I've written a draft of spec S-001 and four experiment pre-registrations. It still has to go through the Critic's plan review, the freeze gate and your scenario card. Nothing is committed: this folder isn't a git repository, so I couldn't commit to `build/definer/P-001`.

## 1. What I changed
- **`specs/S-001.md` (new, status draft).** It covers the first version: reading the repositories, the screens, answering by prefilled link, security, the V1/V2 measurement and launch.
  - **19 success criteria**, each written as a scenario and traced to a value target (`[trace: V<n> → AC<m>]`).
  - **8 join sheets** (J1–J8), one per connection between pieces, each with its exact form, awkward cases and a `join-test:` tag.
  - **Areas the build may change**, the facts relied on with file:line evidence, risks, the stop rule and rollback, and four questions for you.
  - **Details the brief left to Define, now fixed:**
    - At most 30 GitHub requests per call.
    - The page polls every 60 seconds while open.
    - The desk only shows "Quiet" after every project has been read successfully in the last 3 minutes.
    - Answer links fall back to a copy button above 6,000 characters.
    - Planning choices are recorded at `docs/planning/<YYYY-MM-DD>T<HHMM>Z.md` in Service-Desk.
    - Weekly measurement figures go to `docs/metrics/<YYYY>-W<ww>.md`.
    - The list of connected repositories lives in `config/projects.json`, capped at 5.
    - Build runs with at most two builder or reviewer agents at once (tier T1).
- **Agent usage and context (D3.6) is split out** into a proposed follow-up spec, S-002. Its input format depends on D7.1 (the model change) and on O6, which don't exist yet. Launch (AC17) waits for both S-001 and S-002.
- **Four pre-registrations in `experiments/`:**
  - **EXP-001 (O3):** CPU and wall time on a separate preview Pages project, with pass/fail rules fixed in advance.
  - **EXP-002 (O5):** you check in the Cloudflare dashboard whether `needs-you` is Direct Upload or Git-connected.
  - **EXP-003 (O6):** which usage fields a `stream-json` session reports.
  - **EXP-004:** for each repository, whether the default branch takes your web commits, whether the content prefill works, and how long a link can be.

## 2. Why
Your agent file sets the definer's duties at Define, and the project is approved for Build (`decisions/P-001/dor-4.md`: "Decision: build"). `failure-5.md` says only "retry" and gives no reason. The earlier round files (dor-fail-1/2, stop-3) were about the brief, not a spec. So there were no specific findings to answer. I wrote the spec so it can freeze without depending on anything that is still open.

## 3. What I verified
- I read PROJECT.md Parts 1–2, all five feedback files, the spec template, and the library entries cited in the spec.
- I cross-checked the card-to-answer naming rule against real files in this folder (`decisions/P-001/*`) and the `queue/Q-003-failure-1.md` example in PROJECT.md:507.
- Search for `[trace: |join-test: ` in the spec: 27 matches (19 criteria plus 8 join sheets).
- Search for `^- AC\d+ \[trace: V[1-4] → AC\d+`: 19 matches, so every criterion traces to V1–V4.
- No tests were run; writing checks is outside my role.

## 4. What is undone
- Nothing is committed, and there is no `Agent-Session` trailer.
- `experiments/_REGISTRATION.md` isn't in this folder, so the registrations use my own structure and may need reshaping to the real template.
- Some inputs are inferred rather than quoted from the model's documents: the file paths for status, sprint and dispatch logs, where owner questions live, and the card naming rule. They are config entries, but should be confirmed.
- The content-prefill parameter name `value` is an assumption until EXP-004 confirms it.
- S-002 isn't written; it waits on D7.1's frozen format and EXP-003.
- I didn't add join sheets for D7 because they belong to the model's own spec.

## 5. What is needed outside my lane
- **You, by hand:**
  - Create the `service-desk-preview` Pages project with Access on it.
  - Set the read token and the Access settings.
  - Run EXP-002 (about 5 minutes) and EXP-004 (about 15 minutes).
  - Archive Operations-Hub at launch.
- **Chief of Staff:** file those cards, run or arrange EXP-003, and do the 7-day side-by-side comparison with the old page (AC7).
- **Builder:** run EXP-001 on the preview.
- **Check author:** write the J1–J8 join tests after freeze.
- **Reviewer:** the D5.2 security review.
- **Model's definer:** the D7.1 spec.
- **Service-Desk Orchestrator:** D7.2.

## 6. Open questions
1. Is Service-Desk `docs/planning/` the right home for planning choices? I kept them outside `decisions/` so the Orchestrator can't mistake one for a card answer.
2. §6 has no value target for "projects wait less" or "less time per decision". Do you want a V5 before freeze? Until then, AC9–AC14 trace to V4.
3. Is 7 clean days of comparison on the preview the right bar for "at least as correct as Operations-Hub"?
4. Should launch wait for S-002 (usage and context)? I've assumed yes, following your 2026-10-04 ruling.
5. For the Critic: are the cap of 30 requests, the 3-minute freshness window for "Quiet" and the 6,000-character cap acceptable? They are my own estimates, each with a measurement or fallback.
