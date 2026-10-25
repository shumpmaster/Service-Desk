# M3E stage G8d: the Reviewer's round 3 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8d at 102b051 (round-3 commits 8446e28 to 102b051, on 657694e) (G8d's work over 3058cc0).

---

Verdict: PASS

No blocking findings. The work is the six commits in 657694e..102b051 (8446e28, 16e1389, 3b582a3, 374a1cd, d262a10, 102b051). I ran everything in a scratch worktree at 102b051. I've removed that worktree and my probe files; /home/user/sd-g8d is clean.

**Checks**
- **Surface guard and build:** `surface_guard.py diff --range 657694e..102b051 --branch build/builder/g8d` is OK (6 commits). Each commit is by builder <builder@agents.invalid> with the trailers `Agent-Session: session_017seyaGqUxAff6E8dKWHDCR` and `Spec: S-001`. `node tools/build.mjs` passes ("36 page modules in step").
- **Targeted tests:** 677/677 pass across the 47 files that reach board.js, sandbox.js or glance-fixtures (ac91-g8d alone is 32/32).
- **Full suite in one process:** I also ran `node --test ../tests/desk/` once, as the suite runs: 1317/1317, exit 0.

**Every round-3 test is locked**
- **Old sandbox.js, new tests:** with 657694e's src/public/sandbox.js put back, 6 of the 8 round-3 cases fail:
  - every project shown, none read and drawn;
  - the case with a last read's cards;
  - the cases kept beside it ("Not read yet" with a read pending, which used to say "Nothing here");
  - state 5 alone shown;
  - signed out;
  - gone once read and drawn again.

  The other two pass, which is right: the pure-function case tests board.js, and the "kept" case locks words that were already correct.
- **Two mutations in board.js:**
  - Deleting the `if (succeeded && cantShow) return { state: 5, … cantShowLast …}` line fails 4 cases (the pure case, state 5, signed out, gone again).
  - Counting a pending read of a can't-draw project as pending fails the pure case, so the Builder's choice is locked.

**The one rewritten locked case (16e1389) is forced and not weakened**
- **Forced:** 657694e's ac91-g8d.test.mjs run on the round-3 source fails exactly one case: round 2's "a project the desk can't draw whose read fails keeps its can't-read words" (case 17). It fails at `assert.doesNotMatch(board, /Can't show/)`, because the board now holds "Kicked back · can't show when last read".
- **Nothing else removed:** across the range, that is the only assertion line taken out of the test file; the rest of the removed lines are the two import lines.
- **Not weakened:** the replacement asserts no "Can't show Alpha" anywhere on the board, no `.v2-ql` line starting "Can't show ", no `ql:show:` key, and a `ql:cant:Alpha` line, and it keeps the line above the lanes. The new state-5 case pins the lane to exactly "Can't show when last read". This is the rewrite G8d's row names.

**d262a10 and 102b051 remove no checked-for state (where each moved)**
- **G8D_OPENS's "none can be drawn" and "signed out alone" screens:** both are still asserted, in the every-project case (ac91-g8d.test.mjs:946-947 loop) and the signed-out case (:1052).
- **The "screens draw their words" case:** its checks now run in the cases that open those screens through `openR3` (:944, :946, :1013). The cases also assert that G8D_OPENS holds exactly the two round-3 names.
- **The separate "every project unreadable" page:** now asserted on the "Can't read or show" case's reference page (:941-943).
- **State 5's look:** measured without a reference page, as 11px, weight 400, not mono, --ink2, plus `.v2-empty.unknown`, and the strip as 11px, 500, --ink2. The exact font-family match is replaced by "not mono".
- **The cards screen:** opened by its own case (:971), not walked.
- **State 2 for a can't-draw project:** the spec's words ("Can't read", "Kicked back · can't read", no "Can't show") are asserted in round 2's locked case, first step (:630-647).
- **Two DOM checks went with the dropped case (non-blocking):** for the BAD_PR project in state 2, "Not read in this opening" and no lane count. They are now covered only in two parts: the pure case fixes state 2 and `unknown` (:925), and the N3 case (:752) asserts both in the DOM on the same path without BAD_PR. The spec doesn't ask for them here.

**everyProjectUnread's order and the view.unread fix are right**
- **Order:** board.js:107-113 follows AC91 (f)'s rule step for step. Any project with `read==='ok'` and no drawError gives null. Else, if every read fails, 'cant'. Else, if any read neither fails nor is a can't-draw, 'pending'. Else 'cant-read-or-show'. With no project shown it gives 'pending', as before.
- **Identity:** sandbox.js:2020 maps each `shown` entry from its own `b.box` (`readState(b)`, `b.box.drawError`). That box's drawError is set before `boardOf` runs (sandbox.js:4729-4735, including when `buildProject` throws). It is the same box `readOf` and `cantShown` use, so `undrawn` and `cantShown` agree, and null happens exactly when some project is `ok`. The quiet-line keys are unchanged (`ql:show:` / `ql:cant:`).
- **Alone shown:** `cantShow: Boolean(drawError)` (:2029) and 'cant-show-last' (:2030) are only read as truthy (laneNode, strip). The small-line branch needs `!one`, so the new value reaches nothing else.

**The Builder's choice (a pending read of a can't-draw project counts as can't be drawn)**
It matches the spec's text. AC91 (f) defines "can't be drawn" as "its box's `drawError`, its read not failing", and "pending" as "the desk drawing what it holds", which is not true when the desk can't draw. It also agrees with the alone-shown words settled in N2 ("Can't show" in states 1 and 4). The one tension is the C note: "a read still pending may yet give a drawn board". If the Definer meant that note to cover this case too, it would say "Not read yet" instead. I'm not raising it as a finding.

**No 0 anywhere in these states**
- **The cases:** they assert no "Nothing here", "none", ": 0" or bare "0" leaf on the board (`assertNoQuiet`).
- **My own DOM probe:** I covered nine states, including signed out with every project shown, the cards case and the pending case, which the cases check only in part. No 0 count, no "none", no "Nothing here". The only "0" drawn is the age under the title, "checked 0 s ago", which is a time, not a count.

**Copies, fixtures, captures**
- **Copies:** src/lib/board.js and src/public/lib/board.js are byte-identical.
- **Made-up fixtures:** `noneDrawnState`, `cantShowLastState`, the two G8D_OPENS round-3 entries, the drawn-state-5 and reads-working-again variants, and the six new capture entries are each labelled NOT real (tests/desk/fixtures/README.md, the end section; glance-fixtures.mjs doc comments; the glance-shots.mjs comment).
- **No CSS:** no CSS or declaration was added, so there is no G8D_ONCE.
- **Captures:** glance-shots.mjs has the 6 `g8d-` entries, at 360×740 and 414×896, light and dark. I couldn't render them here (no Chromium or Playwright), so the PNGs are owed to the Design reviewer in the pull request.

**The one-process suite's heap: effectively no margin (non-blocking, carry as a risk)**
- **What I measured:** the heap limit here is 2096 MB. At exit the suite retained 1981 MB after a forced GC, with a sampled peak of 2007 MB. That is about 90–115 MB of nominal headroom.
- **What is really left:** the Builder's run aborted at test 1316 of 1317 before 102b051, and 102b051 only removed 4 page opens (about 5 MB at about 1.25 MB a page). So the real margin before V8 gives up (ineffective mark-compacts near the limit) is a few page opens.
- **What it means:** the next stage that adds a handful of sandbox page opens will abort `npm test` again. Cutting cases won't scale. The fix is a toolchain decision for the Definer or orchestrator: run the files as separate processes (`node --test` given the file list, as I did), or raise `--max-old-space-size`.
- **Run time:** the full run took about 22 minutes, with other sessions' suites running on the machine at the same time.

**Open questions**
- Q1 (for the Definer, optional): should a pending read of a project the desk can't draw say "Not read yet", per the C note, instead of "Can't read or show"? As built, it follows the definition.
