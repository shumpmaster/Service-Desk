Verdict: FAIL

Plan review round 2 of specs/S-001.md at c8a6b95 (build/definer/s001-trial-view-2), diffed against orch/trial-view-2. All 13 round-1 findings are fixed. Two new blocking problems came in with the fixes and the owner's answers: one is a case the spec's own AC60 test exercises, the other is the owner's gold-ring answer, which the Status screen doesn't carry in words. Nothing was edited.

**Checks:** `GOV_BRANCH=build/definer/s001-trial-view-2 bash governance/checks/check_all.sh . orch/trial-view-2` exits 0, all 24 checks PASS ("OK: all governance checks passed.").

**Round-1 findings, re-checked:**
- **B1 (note 9) fixed.** AC57's "Still and plain" (:2453-2459) and AC60 (:2701-2706) rule out loops, slide-ins and version badges. The mockups' pulse is named as a known difference (:341-344; the phase-branches.html:77 reference is right). AC57's test checks the CSS for `animation`, `transition` and `infinite`, plus a fake-clock check. The only infinite animation in the code, `.sb-glow`, is on Team only (sandbox.js:1215), outside these screens.
- **B2 (titles) fixed.** AC60 (:2757-2762) shows the PR's own title as written. AC64 (:2998-3003) allows a recorded title that starts with a code, and its test checks #40.
- **B3 (J12 fixture) fixed.** The fixture is built from REST answers and marked NOT as GitHub sent it; the error answers are marked made up (:4106-4119). Setup CS13 records a real answer later, and the facts command now uses REST (:4534).
- **N1 to N10 fixed:**
  - N1: S-032's draft forms are taken on (:2827-2873).
  - N2: the shared rule now names the open-list bodies and J12 (:1140).
  - N3: the differences from the mockup are listed (:339-357), with AC62's exceptions. Line references :56, :72, :198, :200, :201 and :229 are correct.
  - N4: `<k>` means the column (:1404-1407), the tick sentence is removed, and AC58's words are exact.
  - N5: AC57 now has ordered mark rules.
  - N6: AC59 defines a run's times; J12 covers errors, head-change reads and its own storage.
  - N7: CS13 step 2. N8: the tasks-link sentence is reworded.
  - N9: note 1's answer 3 is in the later-readings list; line values are cited (1.25 px at 70%, :581 and :587; tie line :87-88; both correct).
  - N10: AC63 names both boxes (:297, :494).

**The owner's answers, as carried:**
- The title answer, readings 1, 3, 4 and 6, and the "values pending the swatch page" status are carried exactly.
- The gold ring is carried on the Timeline but not on Status (B2 below).
- The colour values have problems (N1 below).

**B1. A pull request tied to a milestone only by its `Milestone:` line gives that milestone contradictory words, and AC60's own test needs this case.**
- Where: AC60 :2711-2718 and test :2806. AC57 rules :2419-2440. AC59 :2621-2639. AC50's now-run rule. AC61(b) :2845-2846.
- AC60 makes such a PR a sprint of the milestone it names. But every milestone state comes from the model's timeline, which S-032 leaves unchanged and which only counts the plan's `· sprints:` list.
- Take a PR whose body says `Milestone: MD3`. On the Timeline, MD3 shows "1 sprint feeds this" above "planned", or under the gold "next to reach" ring. On Status it reads "No work filed yet". The same holds for a milestone in a run still to come.
- The AC60 test ("a pull request placed by its `Milestone:` line (a project milestone…)") has no defined answer for that milestone's state, icon, "Work filed" words, or delivery-order date. It is also unstated whether AC50's now-run rule counts such a PR as work filed.
- Fix: say whether a `Milestone:`-line sprint counts as work filed for AC57's rules, AC59's icons and order, and AC50's now run. Or keep it apart, for example "named by its pull request, not yet in the plan", with the milestone's own state left as the plan gives it. Add the expected state to the AC60 and AC57 tests.

**B2. On Status, the owner's "gold ring means next to reach, everywhere" has a shape but no words, and Status's key names the ring "now".**
- Where: AC57 :2399-2400 (key), :2419-2421 (project-milestone words), :2425-2428 (rule 2), :2383-2384.
- The owner's answer, and its option text "so each icon means one thing", require the ring to mean "next to reach".
- On Status, MD2 gets the gold ring, but its words are only "No work filed yet". The only key above the boxes labels the gold ring "now". So the Status screen tells the owner MD2 is "now", while the Timeline (:2627) says "next to reach". The meaning sits in the shape alone, against AC42's words rule.
- Fix: give rule 2's milestone the words "next to reach" on Status (for example "No work filed yet · next to reach"). Make the key name the gold ring on a milestone as "next to reach" (and say what the now run's dot means). Add both to AC57's test.

**N1. The re-picked colours may not meet "every colour means one thing", and the swatch page's own claim about them is wrong.**
- Where: AC48 :1204-1227; docs/design/mockups/colour-swatches.html:78.
- I computed CIEDE2000 distances (sRGB, D65; the script is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/de.py). The two closest pairs:
  - **Context steel blue** (#35628a; dark #81b0dc) against the agent and link blue (#1d5bd6; #6ea0ff, also `--focus` in dark): 8.3 light, 6.2 dark. That is closer than the old Context amber against the blocker amber (8.7), which the owner asked to fix. It is also blue label text sitting next to blue links.
  - **Design magenta** (#9d2f7e) against **Why lilac** (#8a4f9e): 10.2. The two appear together on every Design band's sprints.
- The page says "The nearest pairs are Build's olive beside the passed green" (16.1 by CIEDE2000). The owner is being asked to confirm on that basis. By the simpler ΔE76 measure the blues are 51 apart, so the measures disagree. That is another reason to state the rule.
- Technical uses `--muted`, which is also the colour of softened text and of the quieter earlier runs.
- Fix: re-pick Context away from blue, or tell the owner about it on the swatch page. Correct the "nearest pairs" sentence. Add a testable distinctness rule (a stated metric and minimum distance between any two colours that carry a meaning) to AC48's test.

**N2. The "18 untied pull requests" count is out of date.**
- Where: :335, :353, :4935.
- Since 680797b (before the owner answered), docs/PROJECT.md:110 has MD2 listing `sprints: PR #72, PR #74, PR #75, PR #77`. On the default branch, then, 14 PRs sit under "Not tied" in Design run 2, not 18. The owner's question carried the old number.
- Fix: say "14 on the default branch since 680797b (18 at 3117150)", and tell the owner.

**N3. On the Timeline, it is unclear what the standard milestones of a run still to come show.**
- Where: AC59 :2592-2595 and :2607-2609, against AC57 rule 3.
- Rule 3 replaces "not recorded" with "Still to come", so AC59's "shown state is not 'not recorded'" could give Build i2's five standard milestones "planned" rows, or gather them. The mockup shows neither. Pick one, and add it to the test.

**N4. CS13 names the Chief of Staff, which cannot do the step.**
- Where: CS13 step 1, :4411-4419.
- If the Chief of Staff works in an agent session, it cannot reach GitHub's GraphQL either. Name the owner, or say where the Chief of Staff would run it.

**N5. Three edge cases are left open.**
- J12 :4058-4066: a PR outside the newest 100, read as open in the cold read and merged later, keeps its old state. After the first load there is no later cold read, so it never reaches the Timeline. Name this gap, or add a periodic full read.
- AC50 :1398-1407: a phase holding the now run that also has a later run fits both "Now" and "Run k still to come".
- AC57 :2383-2384: "the now run is the one holding the next milestone to reach" is false under AC50's second branch, when every milestone has work filed.

**N6. One difference from S-032 is not listed.**
- Where: AC61 :2870-2873.
- S-032's J2 reads a merged PR with no `Milestone:` line as not tied, even when the plan lists it. AC60 ties it through the plan. Add this to "Where the desk differs from S-032".

**Open questions:** whether to tell the owner about the Context blue before they confirm the swatch page (N1), and the corrected untied count (N2).

Files: /home/user/sd-def2/specs/S-001.md, /home/user/sd-def2/decisions/questions/P-001-trial-view-notes-2.md, /home/user/sd-def2/docs/design/mockups/colour-swatches.html, /home/user/sd-def2/docs/design/mockups/status-and-timeline.html, /home/user/sd-def2/docs/PROJECT.md. Check output: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/checks2.txt
