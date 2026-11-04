# The question on the Critic's reading pack, the Critic's cold read, round 1 — verbatim

*Dispatched by the Chief of Staff's session (session_01QBwHGL14SMPK1652qVZprr) on 2026-11-04, read-only, against questions/P-003-critic-pack-cap.md at 2fd0deda's parent draft (commit on cos/p003-pack-cap-question). Returned FAIL. Recorded unchanged below. Its run: 62,852 tokens, 22 tool uses, about 3 minutes.*

---

Verdict: FAIL

The question's structure is sound. The WHY leads with what failed, A/B/C are distinct, and A is a reasonable recommendation. It fails on four points: two claims are untrue, one cited record does not support what is claimed, and the REVERSIBILITY line contradicts AGENTS.md §5. All four can be fixed by rewording; the recommendation itself need not change.

**Blocking findings**

1. **WHY, line 6: "The Critic cannot be started on anything in this project any more."** This is untrue. Triage is a Critic duty, and the critic-triage pack (PACKS.toml lines 80–88) has no `docs/design/**`. Triage sessions ran fine on 2026-11-03 and 2026-11-04 (dispatch-log/2026-11.jsonl lines 70–112, the last at 01:18–01:24Z on the 4th). An owner would read this as failure handling being stuck too.
   - Fix: "The Critic can no longer run its readiness checks, plan reviews or gate views in this project…"

2. **Context bullet 1, line 31: the cited records do not say what is claimed.**
   - status/P-003.toml shows `state = "dispatched"`, `last_verdict = "none"`, `sessions = 1`.
   - The dispatch-log line at 16:38:43Z (line 114) is only a dispatch. No outcome line follows it.
   - Neither record shows a refusal or "recorded as an error outcome". Only the workflow log (which I cannot open) says so.
   - Fix: say what each record shows. For example: "the run's prepare log says…; the dispatch log and status show the dispatch at 16:38:43Z and no outcome yet." Or cite only the workflow log for the refusal.

3. **REVERSIBILITY, line 23: "reversible, but a rule change, so it never defaults."**
   - The template says REVERSIBILITY is computed from the risk class. risk-paths.toml defines R3 as "irreversible or gate-bearing: owner approval (A4)".
   - AGENTS.md §5 says reversible questions adopt the recommendation at timeout. So calling this question "reversible" while saying it never defaults contradicts §5, and "a rule change" is not the rule's basis.
   - Fix: e.g. "REVERSIBILITY: R3, gate-bearing (owner approval, A4), so it never defaults". Keep "the two lines can be put back" in option A, where it is a fact about the change.
   - DEFAULT: none and TIMEOUT: none are right, and so is RISK CLASS R3: both PACKS.toml and RUNNER.toml are under governance/**.

4. **Option A's cost, line 13: "the design reviewer's verdict, which cites them, is what it reads."**
   - This holds for the gate Critic, whose pack may read `reviews/**`.
   - It does not hold for the Critic doing readiness checks and plan reviews. Its pack (PACKS.toml lines 35–44) has no `reviews/**`, and the design reviewer's per-PR verdicts are in reviews/<n>/design-reviewer.md (42 of them).
   - What that Critic would keep is the design reviewer's audits in docs/design/ (e.g. audit-2026-10-24.md is signed "By the Design reviewer").
   - Fix: "the design reviewer's written audits, which cite them (and, for the gate Critic, its verdicts on each pull request)".

**Non-blocking notes**

- **Option B understates its cost.** `file_bytes` and `change_set_bytes` are not limits on packs only. orchestrator_git.py also applies them to every hand-over tar, every untar and builders' change sets (lines 736–747, 840–845, 1158–1171), and session_runner.py applies `change_set_bytes` to change sets (lines 1433–1435). Raising them to about 128 MB loosens a safety limit everywhere. Say so: it is the main cost of B and the owner should see it.
- **Possible missing options.**
  - A separate limit for packs only.
  - Adding `docs/design/**` only for the task that needs it, the Design join-up review. PACKS.toml line 2 says may_read is "added when the task needs it", and a readiness check does not need the design folder.
  - Neither clearly beats A, but naming them and why they were not chosen would make the options more complete.
- **"It does not need repeating as the design folder grows" is overstated for the gate Critic.** Under A its pack is about 8.9 MB of 20 MB, mostly reviews/, research/ and similar, which also grow. Say "for some time", or name the headroom.
- **"Measured in this session" (Context bullet 5, line 35) is not a record the owner can open.** Save the measurement, or cite the command and commit so it can be re-run.
- **Per-file limit.** session_runner.py line 829 already leaves files over 1 MB out of a pack, so the per-file limit did not cause the refusal. B's raise of it only matters for letting the Critic see the two large screenshots. B could say that.
- **Option A also drops HTML files.** It leaves out the HTML mock-ups (e.g. board.html, desk-v2.html) and references/trial-view/…html, which line 34 counts among the "Markdown and HTML records". Line 10's "every Markdown file" is accurate, but saying the HTML mock-ups go too would avoid surprise.
- **Wording an owner may not follow.**
  - "the card fix" is project shorthand; name the project in words once.
  - "I then answer the failure card `resubmit` (I will put my notes for it on the main branch first and tell you the word)" leaves it unclear whether the owner has to do anything.
- **The plain-English opening does not say whether anything is irreversible** (§4). One clause would do: "nothing here is permanent".
- **Context bullet 7 (last Critic session on 2026-10-06) is accurate,** but the card never says why it matters. Presumably the folder grew since then; say so or drop the bullet.

**What I could verify**

- Context bullet 2: PACKS.toml critic `docs/design/**`, commented "Design's join-up review (S-024 AC7)", and critic-gate `docs/design/**` in may_read. Confirmed.
- Context bullet 3: RUNNER.toml [limits] `file_bytes = 1048576`, `change_set_bytes = 20971520`. Confirmed. The key is named "change set", but orchestrator_git.py `put_tar`/`make_tar` applies it to packs, and its error text matches the quoted "the folder is over the total cap of … bytes" and "over RUNNER.toml's caps".
- Context bullet 6: design-reviewer may_read includes `docs/design/**`. user-rep may read only `docs/design/screens/**` from that folder, and has `docs/design/references/**` in must_not_see. Confirmed.
- Context bullet 7: the last `"role":"critic"` dispatch before P-003 was 2026-10-06T16:40:19Z (2026-10.jsonl line 187). Confirmed. There were later critic-triage dispatches.
- Context bullet 8: `governance/**` is R3, and R3 needs owner approval. Confirmed.
- P-003 dispatch at 2026-11-04T16:38:43Z: present. Its outcome and the refusal are not in the records (finding 2).
- Discovery-8 is the standard milestone "A brief ready to rule on". Confirmed.
- The docs/design/ folder layout fits the card's categories: builds/ PNGs, mockups/ HTML and READMEs, references/ notes and pictures, screens/ six HTML files, and the audits in Markdown. The audits cite builds/ PNGs (e.g. audit-2026-10-24-round-2.md, 21 matches), which supports option C's cost.
- Arithmetic: 57.5 + 21.7 ≈ 79 MB moved in C, consistent.

**What I could not verify**

- The workflow run 676 log quote: I cannot open it.
- Every size: the folder's 89 MB and its breakdown, the "two screenshots over 1 MB", the 90.0 / 2.05 MB and 96.9 / 8.92 MB pack sizes, and commit 0b226e55. I have no shell to measure. The numbers are roughly consistent with each other: the non-design part of each pack implies about 0.3 MB of Markdown in docs/design.
- The prediction that "the pipeline will raise a failure card on it shortly".
