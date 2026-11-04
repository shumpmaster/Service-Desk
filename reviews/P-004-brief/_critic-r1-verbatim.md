# Critic, round 1, verbatim — docs/PROJECT.md "Later work: the home-screen widget (P-004)" and intake/requests/P-004.toml (2026-11-04)

**Verdict: FAIL** (4 blocking findings, 7 non-blocking)

The plan does follow the ruling's route. The M5 line has the right form, the ruling's fallback is there, and these citations are true and say what is claimed: src/lib/access.js:1-4, src/lib/model.js:1-3, src/notify/collect.mjs:1-6 (line 6 imports `buildModel`), and src/config/projects.json (three projects plus the portfolio). The request file agrees with the plan and has no `enters`. What fails it is three things the ruling or Part 1 needs that the plan leaves out or gets wrong, and a why that gives no reason. The worst is the measurement plan for the main unknown.

## Blocking

1. **Discovery, first bullet: "a throwaway Scriptable script on the owner's phone, run cold and then warm, that makes the reads the desk makes for one project…"**
   - **What is wrong:** this does not measure what the ruling asks, which is whether *a Scriptable widget* can make the reads and run the read model "within its time and memory". There are two gaps:
     - A script run inside the Scriptable app works under the app's limits. A widget refresh works under the much tighter home-screen widget limits. A pass in the app proves nothing about the widget. The test must run as a widget refresh.
     - It measures one project. But each refresh covers three projects plus the portfolio. The ruling's "a few dozen after" is per project (S-001:14620-14621: 23 for a steady poll, 30 at most), and the question's Critic had already said the figures "per project" must be multiplied by three. A one-project pass could hide a full-refresh failure.
   - The bullet also leaves out the steady-refresh figure and gives no pass mark: what time, memory and request count counts as "can work".
   - **Stage:** Discovery planning (stage 2, Shape): the plan for the main unknown.

2. **"What it covers", third bullet, and the Done-when section, against the ruling's "rebuilt after each desk change that affects the cards".**
   - **What is wrong:** the plan says nothing about keeping the packed copy in step with the desk. It doesn't say who rebuilds it, what triggers a rebuild, or how the new file reaches the phone (the owner reinstalling it by hand?).
   - The success test ("the widget's summary matches the desk's for the same records") holds only at build time. After the next desk change, the widget can quietly drift from the desk, which is the very thing option A was chosen to avoid.
   - This is part of the ruling's scope, so leaving it out does less than the ruling says. It also hides a recurring cost to the owner's time.
   - **Stage:** brief drafting (scope against the ruling).

3. **"Owners and limits": "As Part 1 sections 4 and 5 … No new spend or service; Scriptable is free."**
   - **What is wrong:** Part 1 §5's data boundary says the desk may send its projects' content "only to GitHub and Cloudflare". This plan puts a GitHub key and record content in a third-party app (Scriptable), and keeps a cache of what it read "on the phone".
   - The plan doesn't say where that cache and the key live. Scriptable can store files in iCloud as well as on the phone itself, and an iCloud copy would send the content to a new outside service. The key could sit in the phone's keychain or in a file.
   - So "as Part 1 section 5" and "no new service" are not shown to be true. The plan should state the boundary: the key in the keychain, the cache on the phone only, nothing synced. Or it should ask the owner to widen §5.
   - **Stage:** brief drafting (limits / data boundaries, definition of ready (5)).

4. **M5's why: "the owner chose the desk's own summary on the home screen, made by the widget running the desk's code".**
   - **What is wrong:** the first half repeats the milestone's name as a choice. The second half is a how (the route), not a reason. Neither says, in plain words, why the project needs it.
   - The precedent M4's why names the problem being solved; M3A's names what the owner wants to do and to know. The records hold no reason from the owner (the handoff file says only that the owner "asked whether the desk could become an iPhone widget"). So either use a reason the owner has given, or ask for one. Don't invent one.
   - **Stage:** milestone drafting (the why, model S-032).

## Non-blocking

5. **"What it does not cover": "No change to … any page the live desk serves", against Done-when's "and by the design reviewer if it writes into the page's served files".**
   - The two contradict each other.
   - The page's modules in src/lib/ are served as byte-identical copies in src/public/lib/ (governance/risk-paths.toml:43-49). If Discovery's second bullet finds a module that "assumes a browser" and it is changed, the served page changes too.
   - Say which way it goes, or say that such a finding comes back to the owner.
   - **Stage:** brief drafting.

6. **"Owners and limits": "under src/ (outside the sender's files)".**
   - src/ also holds files outside the sender's folder whose changes need the owner's approval: src/config/projects.json, src/lib/jobcand.js, ledgergrant.js and j22.js (risk-paths.toml:21-24).
   - Done-when names owner review only "if it changes the package file". Say "outside the files whose changes need your approval", or list them.
   - **Stage:** brief drafting.

7. **Discovery: "hundreds of GitHub requests per project on a first read (specs/S-001.md, J1, lines 14609-14621; lines 4954-4955)".**
   - True only after doing the sum: at most 25 per blob call (:14611) times at most 16 blob calls a cycle (:4954-4955), roughly 400.
   - The cited lines describe the server's limit per call. They never say "hundreds". Say how the figure is worked out, as the question card did.
   - **Stage:** brief drafting (citation).

8. **"Its milestone, proposed": "goes into section 3, after M4's line".**
   - M4 is not in section 3 yet. It is still a proposal awaiting P-003's Design gate, and section 3 ends at M3C (PROJECT.md:117).
   - Say "after M4's line, or after M3C's if M4 is not yet in".
   - **Stage:** brief drafting.

9. **Plain English (AGENTS.md §4).**
   - Jargon a non-technical owner meets unexplained:
     - "read model", including in M5's done-when, which the owner sees;
     - "packs";
     - "build step";
     - "run cold and then warm";
     - "modules";
     - "assume a browser".
   - M5's done-when also leans on how it is made ("worked out by a copy of the desk's own read model that the desk's repository builds and tests") where it should say what is achieved.
   - The Why section's first paragraph carries three file paths. The precedent did the same, so this is not blocking.
   - **Stage:** brief drafting (plainness).

10. **The owner's time is not stated.**
    - The owner runs the measurement, makes the key, installs the widget, and (by finding 2) reinstalls it after each rebuild.
    - Part 1 §6 counts the owner's time as a cost. Give a rough figure.
    - **Stage:** brief drafting (value and cost).

11. **Smaller points.**
    - "with when it last read" goes slightly past the ruling's scope. It is sensible, and the owner approves it with the plan.
    - "A widget cannot load the desk" cites nothing. It is very likely true.
    - The italic header's reliance on the owner's earlier acceptance "for small additions" assumes P-004 is small. That is not yet known; Discovery's sizing decides it.
    - **Stage:** brief drafting.

**Checked and sound:**
- **M5's form:** name, (M5), done when, phase: Build, ` · for: P-004`, then ` · why:` last. There is no " · " inside a part, and M5 is unused elsewhere in the project document.
- **M5's name:** an achievement, with no codes.
- **M5's done-when:** testable on the phone and by the matching test.
- **Re-entry:** a short Discovery for an addition matches OPERATING_MODEL §3 "Graduation and re-entry".
- **Fallback:** "comes back to the owner, with B or C" matches the ruling.
- **Exclusions:** sign-in, server and notification sender unchanged, which matches the ruling.
- **The key:** the owner holds it and no agent does, which matches Part 1 §4.

Self-implication flag (D-050): none.
