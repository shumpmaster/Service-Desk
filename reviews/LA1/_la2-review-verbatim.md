Verdict: PASS

I reviewed a35ae91 (`047f9ab..build/builder/la2`, six commits, 5 files, +8/−7) against specs/S-001.md: LA2's row (:4027), Setup N10 "At launch" (:18532-18540), AC28 as changed (:14120-14166, "LA2 is merged and its preview deploy approved" at :14156), J7's `push` (:15426-15428), and the notes that LA2 is reviewed but not merged (:4065, :4173), merged at L3 (:4246-4252), and round 3's carried N5 and N7 (:4369, :4371). Nothing refutes it. All checks ran in a scratchpad clone; /home/user/sd-la2 was not touched.

**Evidence, each refutation tried (grade A unless noted)**
- **Scope.** A key-by-key comparison of src/config/projects.json at 047f9ab and at LA2's tip finds exactly one difference: `$.push.deskUrl` changed from `https://service-desk-preview.pages.dev` to `https://needs-you.pages.dev` (projects.json:6). No other path changes outside the five files.
- **Generated copies.** `node src/tools/build.mjs` passes. `--write` regenerated 40 files and `git status` stayed clean. src/lib/config.js and src/public/lib/config.js are byte-identical (`cmp`). Both are true generated copies.
- **Locked cases.** All match the row word for word:
  - tests/desk/j7-config.test.mjs:98 (row's :97): `deskUrl: 'https://needs-you.pages.dev'` with the message "the needs-you address from launch (Setup N10)".
  - Its test name at :90 ends "…and the needs-you address".
  - `// ac-test: S-001/AC28` is at :91. In-test marks have precedent: j6-j8-function.test.mjs:93 and page-app.test.mjs:56.
  - tests/desk/notify-j17-push.test.mjs:101 reads "the tap opens needs-you from launch"; :109 is rewritten.
  - j7-config.test.mjs:49, :55 and :65 (AC15's `service-desk-preview` toml pin) are unchanged.
  - Nothing was dropped: 1542 `test(` calls before and after, and 144 asserts in the two files before and after.
- **Other pins.** None needs changing. Every other `service-desk-preview` hit in tests passes a literal in rather than reading CONFIG:
  - notify-ac74:165-168, notify-ac75:255/261, j7-config:127, j6-j8:132/139, helpers.mjs:123, fixtures.
  - The only readers of `deskUrl` are src/notify/sender.mjs (:142, :214-306, :349), secrets.mjs:13-21 and configcheck.js:60-70.
  - The page reads only `vapidPublicKey` (sandbox.js:543), so nothing on any screen changes.
- **Suite.** On the simulated merge: `npm --prefix src ci && run build && test` gives 1558/1558 pass, 0 fail.
- **Governance.**
  - `surface_guard.py diff --range 047f9ab..build/builder/la2 --branch build/builder/la2`: OK, 6 commits.
  - `check_all.sh . origin/main` with the owner's `--no-ff` merge of LA2 onto origin/main's tip 0f7df82: every check passes. Note the sd-la2 clone's own `main` ref is stale (da4a342), so I pointed origin/main at 0f7df82 by hand.
  - See N3 for a merge simulation that fails.
- **Commits.** All are authored `builder <builder@agents.invalid>` and carry the `Agent-Session:` and `Spec: S-001` trailers.
- **The tap and the service worker.** I ran the real sw.js with a faked `self`, and the real `openUrl`/`homeUrl` with the committed deskUrl:
  - **sw.js on the preview's origin:** an item tap `https://needs-you.pages.dev/?open=…` is stored and opened as `https://service-desk-preview.pages.dev/` (sw.js:22-30, :44, :88). That is safe, but the item link is lost.
  - **sw.js on needs-you's origin:** the full `?open=` address is kept and opened.
  - **Before L3** nothing changes.
  - **From the L3 merge,** main's sender sends needs-you addresses at once: desk-notify runs on push to main and checks out the default branch (.github/workflows/desk-notify.yml:27-28, :73-75).

**Blocking findings:** none.

**Non-blocking findings (risks for the gate's case, section 5, :4196)**
- **N1 — the L3 to L9b gap.** The phone keeps the preview's subscription until L9b.
  - On the service-worker path, every tap from L3 to L9b opens the preview's Home, not the item (shown by the probe above).
  - On the Declarative path nothing on the phone checks the origin (spec :12700). From L3 to L6, taps go to `needs-you.pages.dev`, which still serves Operations-Hub's old page. Whether iOS opens another origin's address at all is grade C. Which path the owner's phone uses is not on file: there is no EXP-006 result in docs/handover/experiments/.
  - If the sitting stops after L3 with LA2 left merged (carried N5, :4369), this lasts until LA2 is reverted.
  - The spec already counts this as "not covered before go-live" (:4129). The case and LA1's launch and rollback sections should state it this concretely.
- **N2 — carried N7 is still open.** LA2 is based on 047f9ab, which is seven orchestrator, Chief of Staff and definer commits ahead of origin/main. They touch specs/S-001.md, reviews/S-001/* and decisions/questions/*. Merged on top of main now, LA2's merge would carry 11 files, not 5. LA1 isn't merged yet: build/builder/la1 is still at 047f9ab. Before O10 and L3, LA2 must be brought up to date with main and desk-build must pass on that head. That makes a new head, so this verdict is bound to a35ae91. LA1's planned mark at j7-config.test.mjs:37 shifts the row's line numbers but doesn't conflict.
- **N3 — a merge simulation that fails.** I also merged LA2 `--no-ff` as `orchestrator` onto 047f9ab. That fails `record_checks merges` (record_checks.py:511-541) on:
  - 047f9ab's own commits 3a48215, 34dcca8, 7966bdc and 047f9ab, which are orchestrator commits outside status/**, dispatch-log/** and queue/**;
  - the orchestrator merge commit itself.
  None of this is LA2's own work. LA2 must land by the owner's merge at L3, as :4246 says, and not by an orchestrator merge commit on main. The orchestrator line at 047f9ab needs its own route to main.
- **N4 — reviews still to come.** src/config/projects.json is R3 (governance/risk-paths.toml:21, :36), so the owner's verdict is required (O10). src/public/lib/config.js falls under `src/public/**`, so the Design reviewer's verdict is also required (risk-paths.toml:48-49; spec :4045-4046). Neither is recorded yet: there is no LA2 directory under reviews/.

**Open questions**
- No pull request exists yet. Its body must name each rewritten case (the row says "each named"), carry `Milestone: M3C`, and have a Tasks section to check. I can't verify any of this until it is opened.
- D-056 (the Reviewer runs on a different model from the Builder) can't be checked from the record. The Builder's `Agent-Session:` trailer is session_017seyaGqUxAff6E8dKWHDCR, the same id the walk-through gives for the Chief of Staff's session (reviews/S-001/_owner-walkthrough.md:5), so the trailer shows nothing about the Builder's model.

The tap probe script is at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/swprobe.mjs.
