Verdict: FAIL

**For the owner:** Draft 3 fixes all four problems I found last round, and the dates now add up. I re-ran every date in the example myself and each matches. But two of the fixes created new problems, so it still fails.
- **The opening summary tells you something untrue.** It says each new rough estimate "shows nowhere on the Timeline". Until the automatic job merges estimates, every one you merge will show on the Timeline, in the list of work not tied to a milestone.
- **A new settings rule would break the desk's build.** It forbids the planning setting on your older operating-model project, but that project's entry has to carry it, set to "off".

Both are one-line wording fixes. Nothing has been built and nothing here is irreversible.

**Round 1 findings, rechecked** (line numbers are in specs/S-001.md on b99cdb3)

1. **Fixed.**
   - A "no work left" estimate now holds until the milestone is reached, whatever its date (:5793–5794, :5758, :7604).
   - An estimate dated after today gives a day count of 0 (:5799).
   - The worked example is rewritten with its estimates timed 2026-10-18T17:00Z (:5819–5829).
   - The time-zone test is timed 03:00Z (:5928–5931).
   - CS21 no longer needs a new "no work left" line every day.
   - I re-ran the arithmetic in America/Chicago. On 18 Oct: MD3 21–23 Oct, M3A 25–30 Oct, M3B 27 Oct – 3 Nov, M3C and the card 29 Oct – 6 Nov. On 20 Oct with no new estimate: MD3 23–25 Oct, card 31 Oct – 8 Nov.
   - With MD3 under way: 20 Oct still 21–23 Oct; 23 Oct shows "23 Oct"; 24 Oct reads "not available: MD3 is past its estimate", while MD1 and MD2 keep "once you accept it".
   - At 03:30Z today is 17 Oct and MD3 shows 20–22 Oct; at 05:30Z today is 18 Oct and MD3 shows 21–23 Oct. Every figure matches the spec.
2. **Fixed.** J14 now says an estimate is the milestone's own days of work, never the days counting the milestones before it (:7572–7577). AC24 step 2 agrees (:5791–5799).
3. **Fixed.** The word ban covers only the desk's own fixed words, as whole words, and record text such as M3B's name is never checked (:5830–5835). The test matches (:5951–5953).
4. **Fixed.** The private project is used only in poom/'s placeholder form (:5914–5915). Areas touched (:8641–8643) and Facts relied on agree.
5. **Partly fixed.** The mark now follows AC57, an empty ring for a milestone in a run still to come (:5741–5749). The words don't; see new note C.
6. **Fixed.** AC44's last line (:2136–2138), the brief's "Then" line (:10392–10393) and the notifications aside are now all listed under "Changed in place".
7. **Partly fixed.** Estimate pull requests now carry `Milestone: none (a rough estimate)` (:7661–7663, CS20, CS21). But what it says this achieves is wrong; see new finding A.
8. **Fixed.** The sender's change is pinned to land before the job's fifth kind or with it (:7653–7660). Rule 2's base is the merge base (:7646–7648).
9. **Fixed.** MD3 reverses the plain-`/` test case (:5697–5699).
10. **Fixed.** The J11 record set is named as `j11-77bfeae/` with its trace oracle (:5907–5913).
11. **Fixed.** The tests now cover the dropped fold (:5946), the note clipped to two lines, the moved row's gold edge and "moved" text, local storage failing, the 1 Nov daylight-saving change (:5814–5815, :5926), the last day of a range showing today's date (:5816–5817), and 10 minutes of clock skew (:7608–7609).
12. **Fixed.** The mockup's "once you accept it", "days of work" and "From the estimates below…" are adopted, and every remaining difference from the mockup is listed (:1245–1271).

**New findings**

A. **Blocking: the claim that estimate pull requests stay off the Timeline is false.**
   - Where: J14 at :7661–7663 says `Milestone: none (a rough estimate)` keeps each estimate "off the Timeline's work, before the sync and after it". The owner paragraph at :1153 says each estimate "shows nowhere on the Timeline".
   - What AC60 actually does (:4048–4051 and :4080–4087): a merged pull request whose description says `Milestone: none (<reason>)` is placed in a phase run under "Not tied to a milestone", as a sprint reading "no milestone: a rough estimate". It is counted in that line's "<n> sprints".
   - The only exclusion is for the job's own merges (:4052–4063).
   - So until the sync, every estimate the owner merges shows on the Timeline. The Builder must either contradict AC60 or contradict J14. And the owner's paragraph is wrong.
   - Fix: say they show under "Not tied to a milestone" until the sync, in J14 and in the owner paragraph. Or add a named exception to AC60.

B. **Blocking: J7's new rule fails the real config.**
   - Where: :6785–6787 says "`planning` on a v2.5 entry … the build fails". Choice 23 (:1313) says "`planning` … only on a v3 entry". The J7 test (:6813) adds "`planning` on a v2.5 entry … failing it".
   - J7's own example (:6758) and src/config/projects.json give Personal-Org-Operating-Model, a v2.5 entry, `"planning": false`.
   - src/lib/configcheck.js:81–83 requires `planning` to be true or false on every entry.
   - Read as written, the real config fails the build. Fix: make it "`planning: true` on a v2.5 entry".

C. **Note: the words for a milestone with work filed in a run still to come don't match Status.**
   - Where: AC24 (:5747) and its test (:5922–5923) say "Work filed · still to come" with the empty ring, "as Status shows it".
   - Status shows that case as "Work filed: <its sprints>" with the empty ring (src/lib/feed.js:109; AC57's words at :3646–3653). The Timeline shows it as "planned".
   - Fix: decide whether Work ahead's row reads "Work filed: PR #N" or the new words, and drop "as Status shows it" if they differ.

D. **Note: "counts 0 days" can be misread.**
   - Where: choice 23 (:1311) says "an estimate dated after today counts 0 days", and the test (:5932) says "counting 0 days".
   - Step 2 (:5799) means the days since the estimate count as 0, not that the estimate itself counts 0 days. Use step 2's wording in both places.

E. **Note: the "only dates change" test can still fail on new words.** The test at :5953–5954 checks two renders a day apart. A not-yet-started estimate crossing its 7th day picks up "may be out of date", so the fixture should keep every estimate under 7 days old, or say so.

**Checks run:** `governance/checks/check_all.sh . origin/main` passes everything except `record_checks merges`. That is the same failure as round 1: it flags the branch's own Orchestrator commits, and a similar orch/ pull request (#120) passed governance in CI. It is not a finding against the spec. I re-ran the arithmetic with /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/we.py.

Files: /home/user/sd-orch-m3a/specs/S-001.md, /home/user/sd-orch-m3a/src/config/projects.json, /home/user/sd-orch-m3a/src/lib/configcheck.js, /home/user/sd-orch-m3a/src/lib/feed.js
