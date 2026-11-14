Verdict: FAIL

I checked S-011 against the plan, both experiment registrations, `stop-4.md`, `docs/PROJECT.md` and the last review. Revision 3 fixes the earlier findings on the alert route's window, the widget folder, AC25 and AC40's proxy rule. Four things still block freezing the spec as it stands.

**Blocking**

1. **The registrations still name S-010, and the spec's account of them is out of date.**
   - `experiments/P-005-E1.md:3` and `experiments/P-005-E2.md:3` both say `spec: specs/S-010.md`.
   - `specs/S-011.md` lines 29, 126, 179 and 201 say the registrations are not in this pack and cannot be re-pointed. Both files are in this pack.
   - `experiments/P-005-E1.md:13` says "S-010 AC40 uses the same rule".
   - `experiments/P-005-E1.md:28` still says the proxy is decided "from who made the ending record". That conflicts with AC40's `Proxy:` line rule, which J11 says replaces it.
   - Revision 3 sets re-pointing as a condition of freeze (open question 3). It has not been done, so M6's acceptance (AC46) and AC40's baseline still rest on a registration that names a superseded spec.
   - Fix: re-point both files to S-011 and align E1:28 with AC40. Then drop the "not in the pack" statements.

2. **The widget copy's folder is unnamed.**
   - Areas touched (line 149) and open question 4 say the path under `src/` must be confirmed before freeze.
   - `docs/PROJECT.md:593` and `:631` place the folder only as "its own folder under src/, outside src/public/".
   - AC37 and J10 name `src/<folder>/**`, which cannot be written into a locked scope or check until the path is known.
   - The wording on approval at `docs/PROJECT.md:631` does support "no approval beyond the pull request's".

3. **AC17 has no figure and cannot be locked.**
   - Line 61 is itself marked "not yet checkable" until the owner sets the phone widths (open question 1).
   - The `docs/design/builds/` screenshots do use 360 and 414, but that is a proposal until the owner sets it.
   - A spec carrying an uncheckable criterion cannot be frozen.

4. **J5 cannot detect a step that leaves the list and comes back between runs.**
   - AC23 and J5 (line 120) say a step that leaves the waiting list and returns is sent again.
   - The notified set holds (`id`, `changed_at`) pairs from the last earlier run that read the project. A step that leaves and returns between two runs with an unchanged `changed_at` is still in that set, so it is not sent again.
   - The J5 test only works because its sample logs include a run that saw the step absent.
   - Fix: say the return is detected only if a run saw the step gone. Otherwise change J4 so a return moves `changed_at`.

**Sound**

- The header `milestones: M6, M7, M8` matches `docs/projects/P-005.md:72–74`, and each of those lines has a why.
- The six owner answers in `decisions/P-005/stop-4.md:7–12` are recorded faithfully in AC3, AC8, AC14, AC15, AC26 and J9.
- AC23 no longer promises a time, and AC40 now takes its "now" as an input.

**Open questions**

- Does the owner accept the narrowed reading of M8 ("each single thing that needs them reaches their phone", plan line 74) (open question 2)? It must be answered before freeze.
- What is the widget copy's folder path?
- Who re-points E1 and E2? A definer session now has both files in its pack.