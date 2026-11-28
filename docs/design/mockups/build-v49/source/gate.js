  /* ================= v49: a gate open for your ruling, and a reader for any record. The owner's round 9, answer 5
     (decisions/questions/P-005-design-round-9.md): "I approve all of your recommendations": option A of each on options-r9-gate/
     (gr.js there), as a layer: the open gate a sheet (the ask; the case's opening with Read the whole case; what the Critic says; the user
     representative, not needed as the owner is the user; each choice with what follows; Kill marked "Can't be undone"; records as rows);
     its row "Yours · open" on the list and row 1 on home with its four choices; the reader one plain page for any record, opened from every
     sheet's Records rows, with Open on GitHub at its foot and back to where it came from. No hash switching: option A only.
     The open gate is the timeline's real Design gate drawn as it stood on 13 Nov, after case 2 and before you said proceed: every word on it
     is from that case, the Chief of Staff's notes on it (decisions/P-005/dor-3-notes.md) and the project document; its open state, its
     place on home and its waiting time are an example and say so. The readers hold real records, trimmed. ================= */
  var GR = { open: true };
  document.documentElement.classList.add('gr-open');
  var GRI = {
    back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5L5.5 8 10 12.5"/></svg>',
    doc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 1.8h5.2L12.5 5v9.2H4z"/><path d="M9 1.8V5.2h3.4M6.2 8h4M6.2 10.6h4"/></svg>',
    critic: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="7" r="4.3"/><path d="M10.2 10.2l3.6 3.6"/></svg>',
    user: KNI.you
  };
  var GR_EX = ' <i class="pw-ex">example</i>';

  /* ---------- the records the reader holds: real text, trimmed; codes after the words, in grey ---------- */
  var GRR = {
    case: { kind: 'Gate case', title: 'The case for the Design gate, written a second time', path: 'docs/gates/P-005/design-gate-2-case.md', by: 'the Chief of Staff · 13 Nov',
      open: 'The timeline shows the agents’ work, and your needs, in one view. Its brief passed its readiness check after one fail, resubmitted under your standing proxy. Proceeding starts Design. Two Discovery steps still read not reached, though their records exist; you are asked to proceed with them as they read.',
      openCite: 'docs/projects/P-005.md:73, :74, :95 · reviews/P-005/_critic-dor.md · decisions/P-005/dor-fail-1.md',
      secs: [
        { h: 'The recommendation', p: ['Proceed: Design needs no new spend, and each unknown has a test or comes back to you.'], cite: 'docs/projects/P-005.md:119, :158, :159, :180, :186' },
        { h: 'Where the timeline stands', chain: 1, alt: 'The six phases run Discovery, Design, Build, Launch, Operate and Review, the last two the product’s own after launch. Discovery’s brief has passed, and this ruling is the gate between Discovery and Design.' },
        { h: 'The vision', p: ['Today things “sit longer than they should”, mostly from your busyness.', 'Today you learn what waits by coming into a session and reading what is asked. With the timeline every event shows on one view, what needs you first and in its context, finished with one tap on GitHub’s own page.'], cite: 'docs/projects/P-005.md:56, :74' },
        { h: 'What this phase taught us', p: ['Today’s read key cannot read check marks on your two private repositories.', 'No source read sets a daily alert limit.'], cite: 'docs/projects/P-005.md:121, :151, :181, :187' },
        { h: 'The plan for the next phase', p: ['Design writes scenarios, maps joins, measures today’s waits, tests the records and ends with a reviewed plan.', 'The event record comes first; the timeline needs it; what needs you and the related work each need the timeline; replacing the core screens needs all of them.'], cite: 'docs/projects/P-005.md:72, :90 to :95 · M6 to M10' },
        { h: 'The risks', li: ['Halving waits may be out of reach.', 'Until you approve a copying job, results past 90 days are lost, and the timeline cannot reach back through the work’s whole life. Its research has passed; the job comes to you separately.', 'A stopped view may look quiet; Design adds its check.'], cite: 'docs/projects/P-005.md:56, :128, :182, :186 · research/Q-028.md' },
        { h: 'Cost and limits', p: ['$0 a month new, read-only. Your time: a prefilled commit a week, two key permissions once, and the gates. Usage: not recorded.'], cite: 'docs/projects/P-005.md:112, :119, :121, :139 · T1' },
        { h: 'When work stops', p: ['Work stops if a step waiting on you lacks a record of its time and who; acting needs spend or keys you have not approved; today’s waits number under 10 in 30 days or their middle value is under an hour; alert research conflicts with your answer; the build outgrows a ceiling Design sets; or a third review fails.'], cite: 'docs/projects/P-005.md:141 · kill criteria' },
        { h: 'What you are agreeing to', p: ['Records proven, one timeline, your needs first, related work in, the timeline as the desk; fourteen standard steps. Draft targets: waits halved, none unseen, none wrong.'], cite: 'docs/projects/P-005.md:72 to :76, :82, :95, :126 to :130 · M6 to M10' },
        { h: 'The phase record', p: ['Discovery ran once: two readiness runs; the first failed and was answered resubmit, the second passed. Case 1 was read by the gate Critic, which recommended holding it; you held it, and this case answers each finding.', 'Reached: Success defined; Scope, limits and owners agreed; A brief ready to rule on. Not reached, though their records exist: The expert’s questions answered; What already exists is known. Not recorded: three more.'], cite: 'appendix · decisions/P-005/dor-2.md · Discovery-1 to Discovery-8' }
      ] },
    dor3: { kind: 'The Chief of Staff’s notes', title: 'Notes on case 2: proceed, and the Critic’s points left', path: 'decisions/P-005/dor-3-notes.md', by: 'the Chief of Staff · 13 Nov',
      open: 'Recommendation: proceed. The gate Critic recommends proceed: you have the ask, the plan, the risks including the copying job, the costs and the stop rule, and none of the faults left is a reason to hold again. This is your ruling: a gate is never answered by proxy, and proceeding at this gate ends that proxy in practice.',
      openCite: 'reviews/P-005/_design-gate-2-critic.md, on item/P-005 · docs/LEDGER.md L-0049',
      secs: [
        { h: 'One correction you should know first', p: ['Case 2’s appendix says the Chief of Staff had reported a timeline fault to the operating model’s owner. That was not yet true when the case was written. The case is not edited, since its Critic has read it; the report is made now.'], cite: 'docs/handoff/2026-11-13-chief-of-staff-p005-8.md' },
        { h: 'The Critic’s points left, and what each means for the ruling', li: ['Length: the Critic counts about 600 words; the automatic check, which leaves out citations and pictures, finds no fault. Not a reason to hold.', 'Two lines cite no record. True; see the correction above.', 'One extra citation. No effect on the ruling.', 'A log oddity left out. It does not change why a Discovery step reads not reached.', 'The two Discovery steps: “met in substance but unrecorded”. Agreed.', 'M7’s wording still reads “through the whole life of the work”. You have since approved the copying job, so you may approve it as written or ask for older results to show as no longer kept.'], cite: 'v3_checks gates · research/Q-028-source-check.md · decisions/questions/P-005-copying-job.md' },
        { h: 'Not a fault of the case', p: ['The case’s milestone block no longer matches what the check reads today, because records were added after it was filed. It matched when case 2 merged with its checks green.'], cite: '#420' }
      ] },
    user: { kind: 'The project’s document · the target user', title: 'Who the timeline is for', path: 'docs/projects/P-005.md', by: 'section 9 · the target user',
      open: 'The owner is the user.',
      secs: [
        { h: 'What this means at a gate', p: ['A user representative plays the project’s target user at each gate and says whether that user would take the work up: approve or reject, with reasons. It is a simulation, not real users, and its verdict decides nothing: you may proceed over a reject with a one-line reason.', 'Where you are the project’s own user, the brief says so, and the gate shows the step as not needed. That is the timeline’s case.'], cite: 'OPERATING_MODEL.md §4, The user representative (S-025) · docs/LEDGER.md L-0008' }
      ] },
    stop5: { kind: 'Stop card · the Chief of Staff’s notes', title: 'The plan for the records work failed its third check: what next?', path: 'decisions/P-005/stop-5-notes.md', by: 'the Chief of Staff · 14 Nov',
      open: 'Recommendation: criteria-wrong. A new spec replaces the current one, goes back to the spec writer, and the plan rounds reset; it is not a strike. This is your ruling: a stop card is never answered by proxy.',
      openCite: 'S-011 · once questions/P-005-widget-folder.md is ruled',
      secs: [
        { h: 'Why the work stopped', li: ['Three plan reviews of the spec failed.', 'The main cause is the spec writer’s reading pack: it never held the two experiment files the plan reviewer kept asking it to re-point, so every round failed on a fix the writer could not make.', 'The third round ran before your answers and the pack fix reached the main branch.'], cite: 'reviews/S-011/plan.md · triage/P-005.md · status/P-005.toml · dispatch-log/2026-11.jsonl' },
        { h: 'Why criteria-wrong, and not the other words', li: ['criteria-wrong: the main fault was the pack’s, not the writer’s; rounds reset, not a strike.', 're-specify: the same new spec, counted as a strike.', 'confirm: one focused check, offered once; it would spend that check on a known failure.', 're-scope or drop: closes the timeline work; nothing in Triage argues for it.'] },
        { h: 'What should land first', p: ['Your answer on the widget copy’s folder. Without it, the next review would fail on it again.'], cite: 'questions/P-005-widget-folder.md · L-0055' }
      ] },
    memo: { kind: 'Research memo · revision 3', title: 'How a job inside a repository can keep lasting copies of its run and check results', path: 'research/Q-028-memo.md', by: 'the Researcher · 13 Nov',
      note: 'The memo has no plain paragraph of its own; its Summary is shown first.',
      open: 'One job can copy all three kinds of result. A job using the repository’s own key can read its workflow runs, check runs and commit statuses, and write the copies there. No single trigger sees all three; a scheduled sweep does.',
      openCite: 'actions: read, checks: read, statuses: read, contents: write · opinion, built on B facts',
      secs: [
        { h: 'No other key is needed', p: ['Unless the copies go to a place protected by a ruleset. The desk’s read-only key cannot call the checks part of GitHub, but the copier does not use it.'], cite: 'F-gh-fgpat-limits-01' },
        { h: 'Where the copies go', p: ['The default branch is the worst place. The two practical choices are a dedicated branch, which the desk reads with one call per file, or a place hidden from the branch list, which takes at least two calls and is less documented.'] },
        { h: 'Cost', li: ['Public repositories: $0 on standard runners (graded A).', 'Private repositories: each job is rounded up to a whole minute (A). The $12 included a month is shared with every other private job on the account, so $0 depends mostly on how often the copier runs.'], cite: 'F-gh-actions-price-01 · F-gh-actions-included-01' },
        { h: 'What cannot be recovered', p: ['Results already past their keeping time cannot be recovered (A). Catching up works only for gaps shorter than the repository’s retention setting.'] }
      ] },
    widths: { kind: 'Your ruling', title: 'The timeline fits phones 360 and 414 points wide, with no sideways scroll', path: 'decisions/questions/P-005-s011-widths.md', by: 'you · 14 Nov, 8:47 am',
      open: 'You chose “360 and 414 (Recommended)”. The timeline fits phones 360 and 414 points wide with no sideways scrolling.',
      openCite: 'Ruling: A · S-011 AC17 · M7',
      secs: [
        { h: 'The question, as put', p: ['“Timeline spec S-011: which phone widths must the timeline fit with no sideways scrolling?” Options: “360 and 414 (Recommended)”; “375 and 430”.'] },
        { h: 'How it was answered', p: ['Put to you in the Chief of Staff’s session, after the question file reached the main branch. You chose the option by the session’s question tool.'], cite: 'session_01QBwHGL7cLBqyQ4o1BxNuyh · #446' },
        { h: 'How it is carried out', li: ['The spec names 360 and 414 as yours, not the spec writer’s proposal, and its open question 1 is closed.', 'Reversible: a later spec may change the widths.'], cite: 'L-0055 · R0' }
      ] },
    ho: { kind: 'Handover · part 11', title: 'The spec-number fix built and taken, the stop card answered, the first mockup', path: 'docs/handoff/2026-11-14-chief-of-staff-p005-11.md', by: 'the Chief of Staff · 14 Nov, 6:05 am',
      open: 'Nothing failed. The spec-number fix is built in the operating model, and the desk now runs it, so a new spec can no longer get a number another spec holds. The timeline’s spec failed three plan reviews and reached its stop card. The main cause was the plan reviewer’s pack, which never held the experiment files the spec cites, so you approved a fix to that pack too. You answered the card with a new spec, which resets the rounds and is not a strike, and you answered the old spec’s six open questions so the new one need not ask again.',
      openCite: 'What this means for the owner · session_01QBwHGKbJwQiq23S3G2JJet',
      secs: [
        { h: 'Done', li: ['The spec-number fix, in the operating model: drafted, reviewed twice, approved by you, built tests first, merged as 3.7.3.', 'Stop card 4: the third plan review failed; Triage traced it to the reviewer’s pack. You answered “criteria-wrong”, “Fix the pack” and “Take 3.7.3 now”, and the old spec’s six questions.', 'The first timeline mockup, from the desk’s real records of 13 and 14 November, up for your comments.'], cite: 'Personal-Org-Operating-Model #58 · #443 · #444 · L-0052, L-0053' },
        { h: 'Who does what from here', li: ['This session: the timeline’s design mockups only. It touches no spec, status, decision, governance or pipeline file.', 'A new session: everything else, below.'] },
        { h: 'Next, in order', li: ['Check the answers are merged and the loop has picked them up: expect a new spec with its rounds reset.', 'Watch the new spec’s plan reviews: up to three rounds, by the stop rule.', 'Design’s other inputs only a Chief of Staff session can supply: the two experiments, and a reading of the desk’s code.'], cite: 'dispatch-log/2026-11.jsonl · status/P-005.toml · decisions/questions/P-005-experiments.md' },
        { h: 'Faults seen', li: ['The plan reviewer’s pack carried no experiment files and no earlier review. Fixed in the desk; the template is still to fix.', 'The Reviewer’s standing instructions point to a checklist file the desk does not hold.'], cite: 'LL-054 · reviews/444/reviewer.md' }
      ] },
    l0008: { kind: 'The ledger', title: 'The model’s version 3.3 adopted: six phases, three gates, the user representative (not needed here), plain English first', path: 'docs/LEDGER.md L-0008', by: 'your ruling · 13 Oct',
      open: 'Adopted from the operating model: its tools, forms and agent cards, the user representative’s among them, never dispatched here. The project document gains a section saying the owner is the user.',
      openCite: 'c8d31c4 · decisions/questions/P-001-v33-sync.md · reversible',
      secs: [] },
    gates: { kind: 'The operating model', title: 'Phase gates', path: 'OPERATING_MODEL.md §4', by: 'S-024',
      open: 'You rule three gates: the Design gate, at the end of Discovery; the Build gate, at the end of Design, where the criteria are approved and then frozen; and one Launch gate, where proceeding is the go-live and the graduation together. Nothing goes past a gate until you rule proceed there.',
      secs: [
        { h: 'The case', p: ['At each gate the Chief of Staff writes the case for going on, in one gate document: the ask, the vision, what the phase taught, the plan for the next phase, the risks, cost and limits, when work stops, what you are agreeing to, and the phase record in an appendix. About 350 words before the appendix. The Critic adds its own view beside it and checks that every claim cites a record.'] },
        { h: 'Your choices', li: ['proceed', 'hold: the case is updated and read again', 'recycle: back into an earlier phase as its next iteration, with a reason', 'kill: the project closes'] }
      ] }
  };
  /* which file each reader opens; anything else opens a short reader that says the mockup holds only its name */
  var GRP = [[/design-gate-2-case\.md$/, 'case'], [/dor-3-notes\.md$/, 'dor3'], [/stop-5-notes\.md$/, 'stop5'], [/Q-028-memo\.md$/, 'memo'], [/P-005-s011-widths\.md$/, 'widths'],
    [/2026-11-14-chief-of-staff-p005-11\.md$/, 'ho'], [/LEDGER\.md L-0008$/, 'l0008'], [/^OPERATING_MODEL\.md( §4)?$/, 'gates'], [/^docs\/projects\/P-005\.md$/, 'user']];
  function grKey(path) { for (var i = 0; i < GRP.length; i++) if (GRP[i][0].test(path)) return GRP[i][1]; return ''; }
  function grKindOf(path) {
    var K = [[/^decisions\/questions\//, 'Your answer'], [/^decisions\/P-\d+\/(stop|dor)[\w-]*-notes/, 'The Chief of Staff’s notes'], [/^decisions\//, 'A ruling'], [/^docs\/gates\//, 'Gate case'],
      [/^research\//, 'Research'], [/^docs\/handoff\//, 'Handover'], [/^status\//, 'Where the work stands'], [/^reviews\//, 'A review'], [/^\.github\/workflows\//, 'A check’s workflow'],
      [/^OPERATING_MODEL/, 'The operating model'], [/LEDGER/, 'The ledger'], [/^docs\/projects\//, 'The project’s document'], [/^sessions\//, 'A session’s record'], [/^dispatch-log\//, 'The pipeline’s log'],
      [/^queue\//, 'A card'], [/^library\//, 'A library fact'], [/^intake\//, 'A request'], [/^governance\//, 'The rules'], [/^docs\/design\//, 'A design note']];
    for (var i = 0; i < K.length; i++) if (K[i][0].test(path)) return K[i][1]; return 'A record';
  }

  /* ---------- the reader's body: kind, plain title, the opening first and larger, then the rest ---------- */
  function grChain() {
    var ph = [['Discovery', 'ok'], ['Design gate · this ruling', 'wait'], ['Design', ''], ['Build', ''], ['Launch', ''], ['Operate', ''], ['Review', '']];
    return '<div class="gr-chain" role="img" aria-label="The six phases, with this ruling between Discovery and Design">' + ph.map(function (p) { return '<span class="' + p[1] + '">' + esc(p[0]) + '</span>'; }).join('<i aria-hidden="true">›</i>') + '</div>';
  }
  function grBody(k, path) {
    var r = GRR[k];
    if (!r) { var kind = grKindOf(path);
      return '<div class="gr-kd">' + GRI.doc + esc(kind) + '</div><h1 class="gr-h">' + esc(path.split('/').pop().replace(/\.(md|toml|jsonl|yml|py|sh|json)$/, '').replace(/[-_]/g, ' ')) + '</h1>' +
        '<p class="gr-code pw-code">' + esc(path) + '</p><p class="gr-open">The mockup holds only this record’s name. In the desk its text opens here: its opening paragraph first, larger, then the rest in sections.' + GR_EX + '</p>'; }
    var h = '<div class="gr-kd">' + GRI.doc + esc(r.kind) + '</div><h1 class="gr-h">' + esc(r.title) + '</h1><p class="gr-code pw-code">' + esc(r.path) + ' · ' + esc(r.by) + '</p>' +
      (r.note ? '<p class="gr-note">' + esc(r.note) + '</p>' : '') + '<p class="gr-open">' + esc(r.open) + '</p>' + (r.openCite ? '<p class="gr-cite pw-code">' + esc(r.openCite) + '</p>' : '');
    r.secs.forEach(function (s) {
      h += '<h2 class="gr-sh">' + esc(s.h) + '</h2>' + (s.chain ? grChain() + '<p class="gr-alt">' + esc(s.alt) + '</p>' : '') +
        (s.p || []).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') +
        (s.li ? '<ul class="gr-ul">' + s.li.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        (s.cite ? '<p class="gr-cite pw-code">' + esc(s.cite) + '</p>' : '');
    });
    return h;
  }
  function grFoot() { return '<div class="gr-foot"><button type="button" class="gr-main" data-grsay="In the desk this opens the file on GitHub, at the version you are reading.">Open on GitHub</button><div class="gr-ans" aria-live="polite"></div></div>'; }

  /* ---------- reader A: a plain page pushed from the right, over whatever opened it; ‹ back returns there ---------- */
  var grStack = [];
  function grTop() { return grStack[grStack.length - 1]; }
  function grBackLabel(from) {
    if (!from) return 'Back';
    var al = from.getAttribute('aria-label') || '', hd = (from.querySelector('h1, h2') || {}).textContent || '';   /* a sheet labelled by a key (v48's ask sheets: q, pr) is named by its title */
    var lb = from.getAttribute('data-grlabel') || (/\s/.test(al) ? al : '') || hd || 'Back';
    lb = lb.replace(/\s+/g, ' ').trim(); return lb.length > 30 ? lb.slice(0, 28).replace(/[\s,·:]+\S*$/, '') + '…' : lb;
  }
  function grOpenPage(inner, label, cls, backTo) {
    var pg = document.createElement('div'); pg.className = 'gr-page ' + (cls || ''); pg.setAttribute('role', 'dialog'); pg.setAttribute('aria-modal', 'true'); pg.setAttribute('aria-label', label);
    pg.innerHTML = '<div class="gr-bar"><button type="button" class="gr-back" data-grback="1">' + GRI.back + '<span>' + esc(backTo) + '</span></button></div><div class="gr-scroll">' + inner + '</div>';
    document.body.appendChild(pg); grStack.push(pg);
    pg.addEventListener('click', grPageClick);
    requestAnimationFrame(function () { requestAnimationFrame(function () { pg.classList.add('on'); pg.tabIndex = -1; pg.focus({ preventScroll: true }); }); });
    return pg;
  }
  function grClosePage() {
    var pg = grStack.pop(); if (!pg) return false; pg.classList.remove('on');
    setTimeout(function () { pg.remove(); }, REDUCED ? 0 : 300); return true;
  }
  function grPageClick(e) {
    var t = e.target;
    if (t.closest('[data-grback]')) { e.stopPropagation(); grClosePage(); return; }
    var s = t.closest('[data-grsay]'); if (s) { var box = s.closest('.gr-foot, .gr-pin, .gr-sheetans') ? s.closest('.gr-foot, .gr-pin, .gr-sheetans').querySelector('.gr-ans') : null;
      if (box) box.innerHTML = '<div class="done">' + esc(s.dataset.grsay) + ' The mockup sends nothing.</div>'; return; }
    var p = t.closest('[data-grchoice]'); if (p) { grChoose(p); return; }
  }
  function grRead(k, path, from) {
    var label = from ? grBackLabel(from) : 'Back';
    return grOpenPage('<article class="gr-read">' + grBody(k, path) + grFoot() + '</article>', (GRR[k] || {}).title || path, 'gr-reader', label);
  }

  /* ---------- every Records line opens the reader: one row per record, its plain name first, its file after in grey ---------- */
  var GR_PATH = /(?:\.github\/workflows\/|(?:[\w-]+\/)+)?[\w.-]+\.(?:md|toml|jsonl|yml|py|sh|json)(?: L-\d{4})?(?: §\d+)?/g;
  function grLinkify(p) {
    if (p.dataset.gr) return; p.dataset.gr = '1';
    var lines = p.innerHTML.split(/<br\s*\/?>|;\s+(?=[\w.]+\/|PR )/i), rows = [], rest = [], dir = '';
    lines.forEach(function (ln) {
      var tmp = document.createElement('span'); tmp.innerHTML = ln; var tx = tmp.textContent.trim(); if (!tx) return;
      var found = [], m; GR_PATH.lastIndex = 0;
      while ((m = GR_PATH.exec(tx))) found.push({ s: m[0], i: m.index, e: m.index + m[0].length });
      if (!found.length || /^An example|^No record/.test(tx)) { rest.push(tx); return; }
      found.forEach(function (f, j) {
        var path = f.s; if (path.indexOf('/') < 0 && !/^OPERATING_MODEL|^AGENTS/.test(path) && dir) path = dir + path; else if (path.indexOf('/') >= 0) dir = path.slice(0, path.lastIndexOf('/') + 1);
        var after = tx.slice(f.e, j + 1 < found.length ? found[j + 1].i : tx.length).replace(/^[\s,]+|[\s,;.]+$/g, ''), note = after.length < 90 ? (/^\(.*\)$/.test(after) ? after.slice(1, -1) : after.replace(/^,\s*/, '')) : '';
        note = note.replace(/[\s:]+$/, '');   /* v49: a note split by a second path keeps no stray bracket or colon */
        if (/^\(/.test(note) && note.indexOf(')') < 0) note = note.slice(1); if (/\)$/.test(note) && note.indexOf('(') < 0) note = note.slice(0, -1); note = note.trim();
        if (/^OPERATING_MODEL/.test(path) && /§\s?4/.test(tx)) path = 'OPERATING_MODEL.md §4';
        var k = grKey(path), title = k ? GRR[k].title : grKindOf(path);
        rows.push('<li><button type="button" class="gr-rrow" data-grpath="' + esc(path) + '"><span class="gr-ri">' + GRI.doc + '</span><span class="gr-rt"><b>' + esc(title) + '</b>' +
          '<small class="pw-code">' + esc(path) + (note ? ' · ' + esc(note) : '') + '</small></span>' + KNI.chev + '</button></li>');
      });
    });
    var h = (rows.length ? '<ul class="gr-recs">' + rows.join('') + '</ul>' : '') + (rest.length ? '<p class="rec-l gr-rest">' + rest.map(esc).join('<br>') + '</p>' : '');
    var d = document.createElement('div'); d.className = 'gr-recwrap'; d.innerHTML = h; p.replaceWith(d);
  }
  function grLinkAll() { [].forEach.call(document.querySelectorAll('.kn-sheet p.rec-l:not([data-gr]):not(.gr-rest)'), grLinkify); }
  window.addEventListener('click', function (e) {
    var r = e.target.closest && e.target.closest('[data-grpath], [data-grread]'); if (!r) return;
    e.preventDefault(); e.stopPropagation();
    var path = r.dataset.grpath || '', k = r.dataset.grread || grKey(path); if (!path && k) path = GRR[k].path;
    var from = r.closest('.kn-sheet, .gr-page'); grRead(k, path, from);
  }, true);

  /* ---------- the gate, open for your ruling (the timeline's Design gate, as it stood on 13 Nov before you said proceed) ---------- */
  var GR_ASK = 'Should the timeline work go on from Discovery into Design? Proceeding starts Design: scenarios written, joins mapped, today’s waits measured and the records tested, ending with a reviewed plan, at no new cost. The case and the Critic both recommend proceed.';
  var GR_CH = [
    { k: 'proceed', b: 'Proceed', f: 'Design starts on the plan above. No new spend; each unknown has a test or comes back to you.', rec: 1 },
    { k: 'hold', b: 'Hold', f: 'Nothing moves. The case is written again, the Critic reads it again, and it comes back to you.' },
    { k: 'recycle', b: 'Recycle', f: 'The work goes back into Discovery as its next round, with your reason; its steps run again.' },
    { k: 'kill', b: 'Kill', f: 'The timeline work closes and leaves the desk.', irr: 1 }
  ];
  function grSay(c) { return 'In the desk this opens GitHub’s page with “' + c.k + '” filled in; one tap there records it in your words.'; }
  function grIrr() { return '<span class="gr-irr">Can’t be undone</span>'; }
  function grOpt(c, short) {
    return '<button type="button" class="opt' + (c.rec ? ' rec' : '') + (c.irr ? ' gr-kill' : '') + '" data-nysay="' + esc(grSay(c)) + '"><b>' + esc(c.b) + '</b>' + (c.irr ? grIrr() + '<span class="gr-f">' : '') +
      esc(short && c.s ? c.s : c.f) + (c.irr ? '</span>' : '') + '<span class="pw-key">' + esc(c.k) + '</span></button>';
  }
  function grHead(sub) {
    return '<div class="kd">' + ICONS.gate + 'Gate · open for your ruling</div><h2>May the timeline work go into Design?</h2>' +
      '<p class="pw-code pw-sub">Design gate · case 2 · The timeline · drawn open as it stood 13 Nov, before you said proceed' + GR_EX + '</p>' +
      '<div class="row">' + knSt('wait', 'Waiting on you') + knYou('Yours') + (sub || '') + '</div>';
  }
  var GR_CRITIC = 'You have the ask, the plan, the risks including the copying job, the costs and the stop rule; none of the faults left is a reason to hold again.';
  var GR_RECS = ['docs/gates/P-005/design-gate-2-case.md (the case)', 'decisions/P-005/dor-3-notes.md (the Chief of Staff’s notes, with the Critic’s points)', 'docs/projects/P-005.md (section 9: the owner is the user)', 'OPERATING_MODEL.md §4, Phase gates (S-024)'];
  function grGateA() {
    return grHead() + '<p class="gr-ask">' + esc(GR_ASK) + '</p>' +
      '<h3>The case opens</h3><div class="gr-case"><p class="gr-fade">' + esc(GRR.case.open) + '</p><button type="button" class="gr-link" data-grread="case">Read the whole case' + KNI.chev + '</button></div>' +
      '<h3>What the Critic says</h3><div class="gr-ev"><div class="gr-evtop">' + GRI.critic + '<b>The gate Critic</b>' + knSt('ok', 'Recommends proceed') + '</div><p>' + esc(GR_CRITIC) + '</p>' +
        '<button type="button" class="gr-link" data-grread="dor3">Its six points left' + KNI.chev + '</button></div>' +
      '<h3>What the user representative says</h3><div class="gr-ev"><div class="gr-evtop">' + GRI.user + '<b>The user representative</b>' + knSt('idle', 'Not needed') + '</div><p>You are the timeline’s own user, so no simulated user is asked. Where one runs, its verdict shows here: approve or reject, with a line why.</p></div>' +
      '<h3>Your ruling</h3><div class="opts">' + GR_CH.map(function (c) { return grOpt(c); }).join('') + '</div><div class="kn-ans"></div>' +
      '<p class="ex">A gate is never answered for you by proxy. A tap only fills in your answer; you save it on GitHub.</p>' + knRec(GR_RECS);
  }
  function grGate() {
    var sh = nySheetOpen(grGateA(), 'Design gate'); sh.classList.add('gr-gsheet'); sh.setAttribute('data-grlabel', 'Design gate');
    grLinkAll(); return sh;
  }

  /* ---------- the gate open on the list, the map and home ---------- */
  if (GR.open && typeof KG_TL !== 'undefined') {
    var gOld = KG_TL['Design gate'];
    KG_TL['Design gate'] = { st: 'wait', stw: 'Yours · open', you: false, next: true, l3: 'The case and the Critic say proceed · waiting since 13 Nov', body: gOld.body };
    KG['Design gate'] = KG_TL['Design gate'];
    var _knOpenGR = knOpen;
    knOpen = function (id) { if (id === 'g:Design gate' && (!state.proj || state.proj === 'tl')) { grGate(); return; } return _knOpenGR.apply(this, arguments); };
  }
  function grRows() {
    if (!GR.open) return;
    [].forEach.call(document.querySelectorAll('#v13list .ph-gate[data-knopen="g:Design gate"]:not(.gr-row)'), function (el) {
      if (state.proj && state.proj !== 'tl') return; el.classList.add('gr-row'); var ic = el.querySelector('.kn-gico'); if (ic) { ic.classList.remove('ok'); ic.classList.add('gr-wait'); }
      el.classList.remove('ok');
    });
    var m = document.querySelector('#v13band .kn-mgate.ok[data-kngate="Design gate"]'); if (m && (!state.proj || state.proj === 'tl')) m.classList.remove('ok');
  }
  /* home: the gate as row 1, an example (no gate is open today); its four choices as buttons too (P-001-gate-buttons.md, A) */
  function grHome() {
    var list = document.querySelector('#view > .pr-wrap .pr-list'); if (!list) return; if (list.querySelector('.gr-prrow')) { grHomeCount(list); return; }
    var rows = list.querySelectorAll('.pr-row[data-prk] .pr-n'); [].forEach.call(rows, function (n) { if (!n.dataset.gr) { n.dataset.gr = '1'; n.textContent = String(+n.textContent + 1); } });
    var d = document.createElement('div'); d.className = 'pr-row gr-prrow';
    d.innerHTML = '<span class="pr-n">1</span><div style="flex:1;min-width:0"><button type="button" class="pr-b" data-gra="sheet" aria-label="1. May the timeline work go into Design?"><span class="pr-top"><span class="pr-chip">The timeline</span></span>' +
      '<span class="ev41"><b>A gate is open for your ruling</b> <span class="pw-code">Design gate · case 2</span></span><span class="pr-q">May the timeline work go into Design?</span>' +
      '<span class="pr-why"><b>Holds up the Design phase</b> · <span>the case and the Critic say proceed</span> · <span>waiting 1 h 12 min</span>' + GR_EX + '</span></button>' +
      '<span class="gr-hch" role="group" aria-label="Your ruling">' + GR_CH.map(function (c) { return '<button type="button" class="gr-hb' + (c.rec ? ' rec' : '') + '" data-grhome="' + c.k + '">' + esc(c.b) + '</button>'; }).join('') + '</span>' +
      '<span class="gr-hans" aria-live="polite"></span>' +
      '<span class="pr-acts"><button type="button" class="pr-ans" data-gra="sheet">Read the case and rule</button><button type="button" class="pr-goto" data-gra="go">Show on timeline</button></span></div>';
    list.insertBefore(d, list.firstChild);
    grHomeCount(list);
    if (typeof NY !== 'undefined' && !NY.open && typeof nyCache === 'function') { nyCache(); nyTabs(); }   /* the Needs-you tab counts and lists home's rows, the gate among them */
  }
  /* home's counts from its rows as they stand (the gate's row among them): the list's heading and the sentence "N things need you" */
  function grHomeCount(list) {
    var n = list.querySelectorAll(':scope > .pr-row').length;
    var cnt = list.previousElementSibling && list.previousElementSibling.querySelector('small'); if (cnt && cnt.textContent !== String(n)) cnt.textContent = String(n);
    var sum = document.querySelector('#view .sg-sum b'); if (sum) { var t = sum.textContent.replace(/^\d+/, String(n)); if (t !== sum.textContent) sum.textContent = t; }
  }
  /* the project's own count, wherever it shows (its chip, the project pill and its menu, home's project row): what waits in it, the gate too */
  function grProjCount() {
    var n = NEEDS.filter(function (x) { return x.p === 'tl'; }).length + 1;
    [].forEach.call(document.querySelectorAll('.chips .chip[data-goto="tl"], .tp-menu [data-goto="tl"] .sub, .sg-row[data-sgp="tl"] .l1'), function (el) {
      var c = el.querySelector('.n, .sg-badge'); if (c && c.textContent !== String(n)) c.textContent = String(n); });
    if (state.proj === 'tl') { var pc = document.querySelector('.tp-pill.pj .n'); if (pc && pc.textContent !== String(n)) pc.textContent = String(n); }
  }
  window.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.gr-prrow'); if (!t) return;
    var hb = e.target.closest('[data-grhome]'), a = e.target.closest('[data-gra]'); if (!hb && !a) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (hb) { var c = GR_CH.filter(function (x) { return x.k === hb.dataset.grhome; })[0];
      t.querySelector('.gr-hans').innerHTML = '<span class="done">' + (c.irr ? 'Kill can’t be undone. ' : '') + esc(grSay(c)) + ' The mockup sends nothing.</span>'; return; }
    if (a.dataset.gra === 'go') { if (typeof NY !== 'undefined' && NY.open) nyClose(); grGoList(); return; }
    grGate();
  }, true);
  function grGoList() {
    var g = document.querySelector('.sg-row[data-sgp="tl"]'); if (g) g.click();
    setTimeout(grScrollGate, REDUCED ? 600 : 1300);
  }
  function grScrollGate() {
    var el = document.querySelector('#v13list .ph-gate[data-knopen="g:Design gate"]'); if (!el) return;
    var band = document.getElementById('v13band'), top = band ? band.getBoundingClientRect().bottom : 0;   /* below the map card, which stays at the top */
    var r = el.getBoundingClientRect(); window.scrollTo(0, Math.max(0, window.scrollY + r.top - top - 96));
    setTimeout(function () { var b2 = band ? band.getBoundingClientRect().bottom : 0, r2 = el.getBoundingClientRect(); if (r2.top < b2 + 8) window.scrollTo(0, window.scrollY + r2.top - b2 - 96); }, 400);
  }

  /* the handover the at-work session started from, on its sheet's Records (the last Chief of Staff handover before it) */
  function grPp() {
    var k = document.querySelector('.pp-sheet [data-ppk="work"]'), p = k && k.closest('.pp-sheet').querySelector('p.rec-l'); if (!p || p.dataset.grho) return; p.dataset.grho = '1'; var ps = p.closest('.pp-sheet'); if (ps) ps.setAttribute('data-grlabel', 'At work now');
    p.insertAdjacentHTML('beforeend', '<br>docs/handoff/2026-11-14-chief-of-staff-p005-11.md (the last handover before it, part 11)');
  }

  function grApply() { grRows(); grHome(); grProjCount(); grPp(); grLinkAll(); }
  var grObs = new MutationObserver(function () { if (!grObs.raf) grObs.raf = requestAnimationFrame(function () { grObs.raf = 0; try { grApply(); } catch (err) { console.error(err); } }); });
  grObs.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (grStack.length) { e.stopImmediatePropagation(); grClosePage(); }
  }, true);
  window.__gr = { gate: grGate, read: grRead, close: grClosePage, kn: function (id) { return knOpen(id); }, GR: GR };
