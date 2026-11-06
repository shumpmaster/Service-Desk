# The widget test's data-route question — the Critic's round 1, verbatim

Read: questions/P-004-test-data-route.md at 276f672 (orch/p004-discovery). Round 1 of at most 3
(D-044). Recorded by the orchestrator, session session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-04.

---

Verdict: FAIL

Round 1 of 3 (D-044). I read the card cold and checked it against the template, the two earlier cards, EXP-007 Draft 3 (Methods 3, 6–8, in /home/user/sd-wt-definer), the Critic's round 2, the Reviewer's check at b2b1711, docs/PROJECT.md (lines 165–166, 615–658) and AGENTS.md §3–5.

Context facts: each one is true per its source. The public/private split is taken as you gave it. One small citation slip is finding 9.

1. **Blocking: the card never says that option A goes outside "Phone only".** The WHY says "Your ruling keeps that data on the phone only". Then option A sends the records off the phone, into the portfolio repository. The recommendation's reasoning only covers the desk's rule ("keeps your records on GitHub, in a private place"). It never says that A asks the owner to allow a one-off exception to the earlier ruling, or why the ruling might be read as covering only what the widget keeps. That exception is the real thing being ruled on, and the owner should see it named.

2. **Blocking: the exposure in A is understated.** "a phone backup that runs during that minute may copy the file" and "the only exposure is a minute on the phone's own storage" leave out three things:
   - (a) A backup copy is not on the phone. It sits in Apple's iCloud, outside the desk's rule (only GitHub and Cloudflare), until that backup is replaced. So the exposure lasts days, not a minute.
   - (b) "and then delete it from the phone": as far as I know, the iOS Files app moves deleted files to "Recently Deleted" for about 30 days. Unless the owner empties it, the file stays on the phone and inside the backup's reach. Please verify this.
   - (c) "for a minute" is not believable for saving a file, then uploading it on github.com in a phone browser and committing it to a new branch.

   "My confidence is high" does not survive these points.

3. **Blocking: the WHY's claim of "no way" cuts off options without saying so.** "There is no way back from the phone that touches neither the phone's own storage … nor some place on GitHub" is a confusing double negative. A reader takes it to mean the backed-up storage cannot be avoided. Two ways are not offered:
   - The test widget could upload its copy straight to the private repository through GitHub, using a separate key that can write only to portfolio. That never touches Files. Its costs: a write-capable key, a code change, and the Reviewer's check again.
   - Within A, the owner could switch iCloud Backup off while the file is on the phone.

   Either the card offers these or it says why they are ruled out.

4. **Non-blocking:** "Your records stay on GitHub" is not quite true. The Reviewer downloads the file into its own working session to run the judge, just as it already does with the four repository copies (Method 8). Say so plainly.

5. **Non-blocking:** A does not say where the log (the second file, Method 7) goes. It also does not say whether a new branch in portfolio could start portfolio's workflows or show on the desk, given that the desk reads portfolio. The BLAST RADIUS line, "nothing the desk does or shows", needs that confirmed. The card also leaves out that up to about 20 MB of the records stays in the phone's Caches folder after the test, because nothing clears it (Reviewer finding 4). It would help the owner to know that.

6. **Non-blocking:** option B, "Nothing with your records leaves the widget": the log still leaves the phone (counts, repository names, scrambled stand-ins for titles and headlines). B should also say plainly that choosing it changes the plan's pass mark, which the owner set.

7. **Non-blocking, jargon:** "the test can't be frozen", "its registration" (in BLAST RADIUS) and "R0" are not plain English. Say "locked before it runs" and "the test's written plan".

8. **Non-blocking, risk and default:** R0 follows from the paths the change touches (experiments/**, and A changes no widget code). But "reversible" fits only the ruling itself. What A does cannot be fully undone: a backup copy, and commits that can still be fetched by their sha after the branch is deleted (Method 7). Say so. "DEFAULT: none" with "TIMEOUT: none" departs from the template ("DEFAULT: <letter>") and from §5 (reversible questions take the recommendation at timeout). The reason given is sound, but name it as a departure. The extra "Asked in session:" line is not in the template.

9. **Non-blocking, citation:** the first Context line says the Caches folder is "which the phone's backup skips", but that is stated in Method 3, not in Methods 6 and 7, which the line cites.

None of these findings implicates an earlier check of mine (D-050).

Files read:
- /home/user/Service-Desk/questions/P-004-test-data-route.md
- /home/user/Service-Desk/questions/_TEMPLATE.md
- /home/user/Service-Desk/decisions/questions/P-004-widget-why-and-data.md
- /home/user/Service-Desk/decisions/questions/P-001-home-screen-widget.md
- /home/user/sd-wt-definer/experiments/EXP-007-widget-refresh.md
- /home/user/Service-Desk/reviews/EXP-007/_critic-r2-verbatim.md
- /home/user/Service-Desk/reviews/EXP-007/_reviewer-widget-b2b1711.md
- /home/user/Service-Desk/docs/PROJECT.md
- /home/user/Service-Desk/AGENTS.md
- /home/user/Service-Desk/governance/risk-paths.toml
