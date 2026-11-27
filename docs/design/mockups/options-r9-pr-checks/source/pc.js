  /* ================= round 9, answer 3: the pull-request sheet shows its actual checks (options over the Needs-you tab's option A, ny.js).
     The owner's words: "can you find a way to incorporate the actual checks instead of just “checks passed”".
     Hash tokens, joined by dots after ny.js's own (e.g. A.light.kinds.sheet=pr.pc=A.run):
       pc=now | A | B | C   the sheet as v47 draws it (now), every check named (A), two summary rows that unfold (B), the checks as a story in time (C);
       run                  A: the pull request's form check is running again (its body was edited at 11:24 am), so a running row sorts to the top;
       unfold               B: both summaries and the rules row open.
     Names are the real ones: the pull-request workflows governance.yml (jobs governance and owner-signal), desk-build.yml (build) and pr-body.yml
     (asks-merge.yml waits on the same three); the 47 rules of `govlib.py list-checks`; the reviews of governance/risk-paths.toml, recorded in
     reviews/<PR>/<reviewer>.md. scrub-proof.yml runs on a schedule and by hand, never on a pull request, so it is not drawn. The pull request,
     its number, times, durations and review words are an example and say so. ================= */
  var PC = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.'), o = { opt: 'now', run: false, open: {} };
    h.forEach(function (t) { if (/^pc=/.test(t)) o.opt = t.slice(3); else if (t === 'run') o.run = true; else if (t === 'unfold') o.open = { auto: 1, rev: 1, gov: 1, g3: 1 }; });
    if (['now', 'A', 'B', 'C'].indexOf(o.opt) < 0) o.opt = 'now';
    return o;
  })();
  var PCI = {
    ok: NYI.ok, run: NYI.wait,
    you: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="5.4" r="2.6"/><path d="M3 13.6c.6-2.7 2.6-4.2 5-4.2s4.4 1.5 5 4.2"/></svg>',
    push: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3.5M4.2 7.2L8 3.4l3.8 3.8"/></svg>',
    back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5L5.5 8 10 12.5"/></svg>'
  };
  var PC_PR = '212';   /* an example number */
  /* the 47 rules, in the groups `govlib.py list-checks` gives them, in plain words */
  var PC_RULES = [
    { g: 'Who changed what', r: [
      ['surface_guard.map', 'The map of who owns which part is in order'], ['surface_guard.ownership', 'Every file has exactly one owner'],
      ['surface_guard.diff', 'The change stays inside the parts it may touch'], ['surface_guard.range.authorship', 'Each change made by the agent that owns that part; no reviewer changed anything'],
      ['surface_guard.range.trailers', 'Each change names its session and its spec'], ['surface_guard.range.paths', 'Each commit inside its author’s part'],
      ['surface_guard.range.branch', 'The builder worked on a branch of its own'], ['surface_guard.range.independence', 'The tests were not written by the code’s builder'],
      ['surface_guard.range.spec', 'No change follows a spec that was replaced'], ['surface_guard.charters', 'Each agent’s written part is up to date'] ] },
    { g: 'The ledger', r: [
      ['ledger_check.entries', 'The ledger’s entries are in their form'], ['ledger_check.append_only', 'The ledger was only added to, never edited'],
      ['digest.check', 'The digest and the reading packs are current and within size'] ] },
    { g: 'The project’s records', r: [
      ['governance_checks.sprints', 'The sprint files are in order'], ['governance_checks.questions', 'Every question to you is in its form'],
      ['governance_checks.reviewers', 'The reviewers hold reading tools only'], ['governance_checks.builders', 'Each builder has its own file and part'],
      ['governance_checks.handover', 'The handover is in its form'], ['governance_checks.scope', 'The change stays inside the agreed scope'] ] },
    { g: 'Reviews', r: [
      ['review_check.owner', 'Your own say, as this changes the rules: your merge gives it', 'you'],
      ['review_check.config', 'The list of which reviews each path needs is valid'], ['review_check.lint', 'Every review record is in its form, from a known reviewer'],
      ['review_check.verdicts', 'Every required AI review recorded as PASS'], ['review_check.pinning', 'Every added dependency is pinned to one version'] ] },
    { g: 'Specs', r: [
      ['spec_check.status', 'Each spec’s status is one the rules know'], ['spec_check.frozen', 'No frozen spec was edited'],
      ['spec_check.predates', 'The spec was frozen before the work it governs'], ['spec_check.facts', 'A spec being frozen lists its facts and limits, with evidence'] ] },
    { g: 'The rule switches', r: [['enforcement.lint', 'The file that can make a rule warn only is valid']] },
    { g: 'The plan', r: [
      ['v3_checks.scope', 'Each change inside its spec’s areas'], ['v3_checks.ready', 'Each plan’s first part is complete once its spec froze'],
      ['v3_checks.trace', 'Every criterion traces back to something you want'], ['v3_checks.freeze', 'A passing plan review came before the freeze'],
      ['v3_checks.joins', 'Every join between parts has a marked test'], ['v3_checks.holdouts', 'Changes to the held-back tests carry a ledger entry'],
      ['v3_checks.milestones', 'No milestone erased; your licence and the critic’s check recorded'], ['v3_checks.milestone_tags', 'New requests and drafts name their milestones'],
      ['v3_checks.gates', 'Each gate’s case is in its form and cited'], ['v3_checks.sessions', 'Each session’s lines are in their form, only added to'] ] },
    { g: 'The orchestrator’s records', r: [
      ['record-decisions', 'Your answers came from you, or from a proxy with your words'], ['record-merges', 'Each merge checked against its own files'],
      ['record-routing', 'The dispatch log’s chain holds'], ['record-build-cap', 'Builds counted against the cap (reports only)'],
      ['record-grants', 'Grants counted (reports only, until their form is set)'], ['gate-packs', 'Every reading pack within its role’s reads'],
      ['gate-handback', 'A passing check run came before any review'], ['gate-freeze', 'No build started before its spec froze'] ] }
  ];
  var PC_NRULES = PC_RULES.reduce(function (n, g) { return n + g.r.length; }, 0);
  /* the automatic checks: GitHub's runs on the pull request's last change (example times and durations) */
  function pcRuns() {
    var R = [
      { id: 'gov', name: 'The rules', code: 'governance / governance', st: 'you', word: 'Yours', dur: '4 min 31 s', at: '9:07 am',
        line: (PC_NRULES - 1) + ' of ' + PC_NRULES + ' rules passed. The last asks for your own say, as this changes the rules; your merge gives it.',
        does: 'Runs the desk’s tests, then the ' + PC_NRULES + ' rules of the operating model against every change since the pull request’s base.',
        steps: [['Check out', '3 s'], ['Tests', 'npm ci, build, test · 3 min 52 s'], ['Governance checks', PC_NRULES + ' rules · 36 s', 'you'], ['Record owner signal inputs', '1 s']],
        rec: '.github/workflows/governance.yml, job governance; governance/checks/check_all.sh' },
      { id: 'build', name: 'The build and tests', code: 'desk-build / build', st: 'ok', word: 'Passed', dur: '3 min 48 s', at: '9:06 am',
        line: 'The desk builds, and every test passes.',
        does: 'Checks the desk’s settings and its alert workflows, then installs, builds and runs every test. It holds no secret.',
        steps: [['Config check', '2 s'], ['Notification workflows check', '1 s'], ['Notification workflows check, its test', '2 s'], ['Build and test', 'npm ci, build, test · 3 min 39 s']],
        rec: '.github/workflows/desk-build.yml, job build' },
      { id: 'form', name: 'The pull request’s form', code: 'pr-body / pr-body', st: 'ok', word: 'Passed', dur: '9 s', at: '9:02 am',
        line: 'It opens with “What this means for you”, in plain words.',
        does: 'Reads the pull request’s description: it must open with “What this means for you” and a plain paragraph. A red mark here does not stop a merge.',
        steps: [['Check out', '2 s'], ['PR body leads with what it means', '4 s']],
        rec: '.github/workflows/pr-body.yml, job pr-body' },
      { id: 'sig', name: 'The signal to the desk', code: 'governance / owner-signal', st: 'ok', word: 'Passed', dur: '14 s', at: '9:07 am',
        line: 'It told the desk this needs you, and that no question is open.',
        does: 'Posts two marks on the change for the desk to read: whether your verdict is needed, and whether a question is open.',
        steps: [['Check out', '2 s'], ['Post owner signal', 'owner-verdict: Owner verdict needed · R3; owner-questions: No open questions · 3 s']],
        rec: '.github/workflows/governance.yml, job owner-signal' }
    ];
    if (PC.run) { var f = R[2]; f.st = 'run'; f.word = 'Running'; f.dur = '12 s so far'; f.line = 'Checking again: its description was edited at 11:24 am.'; f.steps = [['Check out', '2 s'], ['PR body leads with what it means', 'running', 'run']]; }
    var ord = { bad: 0, run: 1, you: 2, ok: 3 };
    return R.map(function (r, i) { r.i = i; return r; }).sort(function (a, b) { return ord[a.st] - ord[b.st] || a.i - b.i; });
  }
  var PC_REVS = [
    { id: 'reviewer', name: 'The reviewer', code: 'reviews/' + PC_PR + '/reviewer.md', at: '9:48 am', verdict: 'PASS',
      line: 'Ran the tests and the rules; each change was made by the agent that owns that part.',
      who: 'reviewer (read-only, fresh context)', against: 'PR #' + PC_PR + ' at 3f9c2ad (base 8e1d04b), against spec S-039, criteria AC1 to AC6',
      ran: ['The operating model’s tests: all pass', 'check_all.sh against the base: every rule passes but your own say', 'surface_guard over the range: three commits, each by its part’s builder, each naming its session and spec', 'The handover flag’s form against five hand-made session files: the two bad ones are refused'],
      notes: ['N1: the flag’s reason has no length limit; a follow-up may cap it.'], why: 'required for R1 and above (governance/risk-paths.toml)' },
    { id: 'design-reviewer', name: 'The design reviewer', code: 'reviews/' + PC_PR + '/design-reviewer.md', at: '10:14 am', verdict: 'PASS',
      line: 'Read the session names as the desk shows them, at 360 and 414 wide: plain and readable.',
      who: 'design-reviewer (read-only, fresh context)', against: 'PR #' + PC_PR + ' at 3f9c2ad, the pages the desk serves',
      ran: ['The desk’s sheets at 360 and 414 wide, light and dark: no sideways scroll', 'Every word measured at 4.5:1 or better', 'The names read as plain words, with the code after them in grey'],
      notes: [], why: 'required for the pages the desk serves, src/public/** (governance/risk-paths.toml)' }
  ];
  function pcSt(st, word) { return '<span class="ny-st ' + (st === 'run' || st === 'you' ? 'wait' : st) + '">' + esc(word) + '</span>'; }
  function pcMark(st) { return '<span class="pc-m ' + st + '">' + (PCI[st] || PCI.ok) + '</span>'; }
  function pcRunRow(r, fold) {
    return '<li class="pc-li"><button type="button" class="pc-r" ' + (fold ? 'data-pcfold="gov" aria-expanded="' + (PC.open.gov ? 'true' : 'false') + '"' : 'data-pcrun="' + r.id + '"') + '>' + pcMark(r.st) +
      '<span class="pc-bd"><span class="pc-top"><span class="pc-n">' + esc(r.name) + '</span>' + pcSt(r.st, r.word) + '</span>' +
      '<span class="pc-l">' + esc(r.line) + '</span><span class="pc-meta">' + esc(r.dur) + ' · <span class="pw-code">' + esc(r.code) + '</span></span></span>' + NYI.chev + '</button>' +
      (fold ? pcRulesBox() : '') + '</li>';
  }
  function pcRevRow(v) {
    return '<li class="pc-li"><button type="button" class="pc-r" data-pcrev="' + v.id + '">' + pcMark('ok') +
      '<span class="pc-bd"><span class="pc-top"><span class="pc-n">' + esc(v.name) + '</span>' + pcSt('ok', v.verdict) + '</span>' +
      '<span class="pc-l">' + esc(v.line) + '</span><span class="pc-meta">' + esc(v.at) + ' · <span class="pw-code">' + esc(v.code) + '</span></span></span>' + NYI.chev + '</button></li>';
  }
  var PC_YOURS = '<p class="pc-note">It changes the rules, so it needs your own say as well: merging is that say. <span class="pw-code">R3 · governance/risk-paths.toml</span></p>';
  function pcSumLine(runs) {
    var ok = runs.filter(function (r) { return r.st === 'ok'; }).length, run = runs.filter(function (r) { return r.st === 'run'; }).length;
    return ok + ' of ' + runs.length + ' passed' + (run ? ', ' + run + ' running' : '') + ', 1 is yours';
  }
  /* A: every check named, in two short groups */
  function pcA() {
    var runs = pcRuns();
    return '<h3>Automatic checks <span class="pc-c">' + esc(pcSumLine(runs)) + '</span></h3><ul class="ck pc-list">' + runs.map(function (r) { return pcRunRow(r); }).join('') + '</ul>' +
      '<h3>AI reviews <span class="pc-c">2 of 2 passed</span></h3><ul class="ck pc-list">' + PC_REVS.map(pcRevRow).join('') + '</ul>' + PC_YOURS;
  }
  /* B: two summary rows, each unfolding into A's rows; the rules row unfolding again into its groups */
  function pcRulesBox() {
    return '<div class="pc-rules"' + (PC.open.gov ? '' : ' hidden') + '>' + PC_RULES.map(function (g, gi) {
      var n = g.r.length, you = g.r.filter(function (r) { return r[2] === 'you'; }).length, k = 'g' + gi;
      return '<div class="pc-g"><button type="button" class="pc-gh" data-pcfold="' + k + '" aria-expanded="' + (PC.open[k] ? 'true' : 'false') + '">' + pcMark(you ? 'you' : 'ok') +
        '<span class="pc-gn">' + esc(g.g) + '<span class="pc-gc">' + esc((n - you) + ' of ' + n + ' passed' + (you ? ', 1 is yours' : '')) + '</span></span>' + NYI.chev + '</button>' +
        '<ul class="pc-rl"' + (PC.open[k] ? '' : ' hidden') + '>' + g.r.map(function (r) {
          return '<li>' + pcMark(r[2] || 'ok') + '<span><span class="pc-rt">' + esc(r[1]) + (r[2] ? ' <b class="pc-yw">Yours</b>' : '') + '</span><span class="pw-code">' + esc(r[0]) + '</span></span></li>'; }).join('') + '</ul></div>';
    }).join('') + '<button type="button" class="pc-link" data-pcrun="gov">The run on GitHub' + NYI.chev + '</button></div>';
  }
  function pcB() {
    var runs = pcRuns();
    function sum(k, st, t, sub, inner) {
      return '<li class="pc-li"><button type="button" class="pc-r pc-s" data-pcfold="' + k + '" aria-expanded="' + (PC.open[k] ? 'true' : 'false') + '">' + pcMark(st) +
        '<span class="pc-bd"><span class="pc-n">' + esc(t) + '</span><span class="pc-l">' + esc(sub) + '</span></span>' + NYI.chev + '</button>' +
        '<ul class="ck pc-list pc-in"' + (PC.open[k] ? '' : ' hidden') + '>' + inner + '</ul></li>';
    }
    return '<h3>What it is</h3><ul class="ck pc-list">' +
      sum('auto', 'you', pcSumLine(runs).replace(' passed', ' automatic checks passed'), 'The rules, the build and tests, the form, the signal to the desk',
        runs.map(function (r) { return pcRunRow(r, r.id === 'gov'); }).join('')) +
      sum('rev', 'ok', '2 of 2 AI reviews passed', 'The reviewer and the design reviewer', PC_REVS.map(pcRevRow).join('')) +
      '<li><span class="m"></span><span>What it changes<small>each session writes a plain name and, when it must, a handover flag</small></span></li></ul>' + PC_YOURS;
  }
  /* C: the checks as a short story, in time order (Chicago time, 14 Nov) */
  function pcC() {
    var runs = {}; pcRuns().forEach(function (r) { runs[r.id] = r; });
    var S = [
      ['9:02 am', 'push', 'Pushed: its last change', 'three commits, each by its part’s builder', '3f9c2ad', 'data-pccommits="1"'],
      ['9:02 am', 'ok', 'The pull request’s form passed', '', '9 s · ' + runs.form.code, 'data-pcrun="form"'],
      ['9:06 am', 'ok', 'The build and tests passed', '', '3 min 48 s · ' + runs.build.code, 'data-pcrun="build"'],
      ['9:07 am', 'you', 'The rules: ' + (PC_NRULES - 1) + ' of ' + PC_NRULES + ' passed, the last is yours', '', '4 min 31 s · ' + runs.gov.code, 'data-pcrun="gov"'],
      ['9:07 am', 'ok', 'The desk was told it needs you', '', '14 s · ' + runs.sig.code, 'data-pcrun="sig"'],
      ['9:48 am', 'ok', 'The reviewer: PASS', PC_REVS[0].line, PC_REVS[0].code, 'data-pcrev="reviewer"'],
      ['10:14 am', 'ok', 'The design reviewer: PASS', PC_REVS[1].line, PC_REVS[1].code, 'data-pcrev="design-reviewer"'],
      ['10:20 am', 'now', 'Ready for you', 'waiting 1 h 5 min; your merge is the last say', '', '']
    ];
    return '<h3>What it is <span class="pc-c">in time order, today</span></h3><ol class="pc-story">' + S.map(function (s) {
      var tag = s[5] ? 'button' : 'div';
      return '<li><' + tag + (s[5] ? ' type="button" ' + s[5] : '') + ' class="pc-sr' + (s[1] === 'now' ? ' now' : '') + '"><span class="pc-tm">' + esc(s[0]) + '</span>' +
        (s[1] === 'now' ? '<span class="pc-m now"><i></i></span>' : pcMark(s[1])) +
        '<span class="pc-bd"><span class="pc-n">' + esc(s[2]) + '</span>' + (s[3] ? '<span class="pc-l">' + esc(s[3]) + '</span>' : '') + (s[4] ? '<span class="pw-code">' + esc(s[4]) + '</span>' : '') + '</span>' +
        (s[5] ? NYI.chev : '') + '</' + tag + '></li>'; }).join('') + '</ol>' +
      '<h3>What it changes</h3><ul class="ck"><li><span class="m"></span><span>Each session writes a plain name and, when it must, a handover flag</span></li></ul>';
  }
  /* the sheet itself: today's, with the checks in its "What it is" place */
  var pcOldPr = NY_SHEETS.pr;
  function pcPr() {
    if (PC.opt === 'now') return pcOldPr();
    var body = PC.opt === 'B' ? pcB() : PC.opt === 'C' ? pcC() : pcA() + '<h3>What it changes</h3><ul class="ck"><li><span class="m"></span><span>Each session writes a plain name and, when it must, a handover flag</span></li></ul>';
    return '<div class="kd">' + ICONS.pr + 'Pull request</div><p class="pw-what">A pull request is a set of changes waiting to be merged into a project.</p>' +
      '<h2>Merge the session names and the handover flag into the operating model?</h2><p class="pw-code pw-sub">Pull request #' + PC_PR + ' · operating model' + NY_EX + '</p>' +
      '<div class="row">' + knSt('wait', 'Waiting on you') + knYou('Yours') + '</div>' + body +
      '<h3>Your answer</h3><div class="opts">' +
        nyOpt('Merge', 'Opens the pull request on GitHub at its merge button; one tap there merges it, and the session names reach the desk.', 'merge', 'In the desk this opens the pull request at its merge button.') +
        nyOpt('Not yet', 'It stays open and stays here. The AI team is told you held it; nothing changes.', 'hold', 'In the desk this tells the AI team you held it.') + '</div><div class="kn-ans"></div>' +
      knRec(['An example: no pull request carries it; the checks’ names are the real ones', '.github/workflows/governance.yml, desk-build.yml, pr-body.yml', 'governance/checks/govlib.py list-checks (' + PC_NRULES + ' rules)', 'governance/risk-paths.toml (which reviews a path needs)', 'docs/design/requests/2026-11-27-session-names-and-handover.md (what it would hold)']);
  }
  NY_SHEETS.pr = pcPr;
  /* the readers: the run on GitHub, a review's record, the commits; each with Back to the pull request */
  var PC_BACK = '<button type="button" class="pc-back" data-pcback="1">' + PCI.back + 'The pull request</button>';
  function pcReadRun(id) {
    var r = pcRuns().filter(function (x) { return x.id === id; })[0]; if (!r) return;
    nySheetOpen(PC_BACK + '<div class="kd">' + ICONS.pr + 'The run on GitHub</div><h2>' + esc(r.name) + '</h2><p class="pw-code pw-sub">' + esc(r.code) + ' · run 4182 · ' + esc(r.at) + NY_EX + '</p>' +
      '<div class="row">' + pcSt(r.st, r.word) + '<span class="pc-meta">' + esc(r.dur) + '</span></div><h3>What it does</h3><p>' + esc(r.does) + '</p>' +
      '<h3>Its steps</h3><ul class="ck">' + r.steps.map(function (s) { return '<li>' + pcMark(s[2] || 'ok') + '<span>' + esc(s[0]) + '<small>' + esc(s[1]) + '</small></span></li>'; }).join('') + '</ul>' +
      (id === 'gov' ? '<h3>The one rule not passed</h3><ul class="ck"><li>' + pcMark('you') + '<span>' + esc(PC_RULES[3].r[0][1]) + '<small class="pw-code">review_check.owner · missing: reviews/' + PC_PR + '/owner.md</small></span></li></ul>' : '') +
      '<div class="ny-acts"><button type="button" class="ny-main" data-nysay="In the desk this opens the run’s page on GitHub, with every line of its log.">Open on GitHub</button></div><div class="kn-ans"></div>' +
      knRec([r.rec]), 'The run on GitHub');
  }
  function pcReadRev(id) {
    var v = PC_REVS.filter(function (x) { return x.id === id; })[0]; if (!v) return;
    nySheetOpen(PC_BACK + '<div class="kd">' + ICONS.decision + 'AI review · its record</div><h2>' + esc(v.name) + ': ' + esc(v.verdict) + '</h2><p class="pw-code pw-sub">' + esc(v.code) + ' · ' + esc(v.at) + NY_EX + '</p>' +
      '<div class="row">' + pcSt('ok', 'Verdict: ' + v.verdict) + '</div><div class="q pc-q">' + esc(v.line) + '</div>' +
      '<h3>Who and what</h3><p>' + esc(v.who) + '. Reviewed ' + esc(v.against) + '. Needed because it is ' + esc(v.why) + '.</p>' +
      '<h3>What it ran</h3><ul class="ck">' + v.ran.map(function (s) { return '<li>' + pcMark('ok') + '<span>' + esc(s) + '</span></li>'; }).join('') + '</ul>' +
      (v.notes.length ? '<h3>Notes, not blocking</h3><ul class="ck">' + v.notes.map(function (s) { return '<li><span class="m"></span><span>' + esc(s) + '</span></li>'; }).join('') + '</ul>' : '') +
      knRec([v.code + ' (its shape: reviews/40/reviewer.md)']), v.name);
  }
  function pcReadCommits() {
    var C = [['Add the session name to each session file', 'tools-builder', 'build/tools-builder/session-names'], ['Add the handover flag and its reason', 'tools-builder', 'build/tools-builder/session-names'], ['The tests for both', 'test-builder', 'build/test-builder/session-names']];
    nySheetOpen(PC_BACK + '<div class="kd">' + PCI.push + 'Its changes</div><h2>Three commits</h2><p class="pw-code pw-sub">3f9c2ad · 9:02 am' + NY_EX + '</p>' +
      '<p>Each made by the agent that owns that part, each naming its session and its spec.</p><ul class="ck">' + C.map(function (c) { return '<li>' + pcMark('ok') + '<span>' + esc(c[0]) + '<small>by ' + esc(c[1]) + ' · <span class="pw-code">' + esc(c[2]) + '</span></small></span></li>'; }).join('') + '</ul>' +
      knRec(['surface_guard.range.authorship, surface_guard.range.trailers']), 'Its changes');
  }
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest || !t.closest('.ny-sheet')) return;
    var f = t.closest('[data-pcfold]');
    if (f) { var k = f.dataset.pcfold, on = f.getAttribute('aria-expanded') !== 'true'; PC.open[k] = on ? 1 : 0; f.setAttribute('aria-expanded', String(on));
      var box = f.nextElementSibling; if (box) box.hidden = !on; e.preventDefault(); return; }
    var r = t.closest('[data-pcrun]'); if (r) { pcReadRun(r.dataset.pcrun); return; }
    var v = t.closest('[data-pcrev]'); if (v) { pcReadRev(v.dataset.pcrev); return; }
    if (t.closest('[data-pccommits]')) { pcReadCommits(); return; }
    if (t.closest('[data-pcback]')) { nySheet('pr'); return; }
  });
