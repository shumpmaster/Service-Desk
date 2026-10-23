// ac-test: S-001/AC84 — the Timeline as built, cleaned up as frame 7b draws it (desk mockup v2; stage 3): one
// feed, newest at the top, opened at Now, under a compact pinned header with the project's name, the Overview |
// Timeline switch and one short line saying the phase; pinned phase bands; a thin rail in the phase's colour;
// one status icon in a circle per milestone; sprints folded; and Technical, Context and Why as small grey words.
// From the fixtures AC59's and AC60's tests use: J11's (Service-Desk at 3117150, real), J12's (built from REST
// answers, NOT as GitHub sent it) and AC61's (NOT real records); a made-up v2.5 project where named.
// ac-test: S-001/AC68 (changed by AC84: the phase line on the Team screen)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SRC, CONFIG } from './helpers.mjs';
import { loadSandbox, byClass, findAll, El0, j11Files, treePaths } from './sandbox-helpers.mjs';
import { v25, fullRepo } from './sandbox-fixtures.mjs';
import { models, openSD, keyed, sdRepo, ac61Answer, SD3, openFolds } from './tv2-fixtures.mjs';
import { feedView } from '../../src/lib/feed.js';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { pageSentence, firstPart, phaseLine } from '../../src/lib/projectpage.js';

const NOW16 = Date.parse('2026-10-16T18:00:00Z');
const RAW = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
const CSS = RAW.replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel) => {
  const m = new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`).exec(CSS);
  assert.ok(m, `a rule for ${sel}`);
  return m[1];
};
const rowsOf = (b) => [...(b.plannedRows || []), ...b.rows];
const open = async (hash = '#/p/Service-Desk/timeline', opts = {}) => {
  const app = await openSD(hash, opts);
  await openFolds(app, 'v2-fold');
  return app;
};
const flat = (s) => String(s).replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------------------
// What stays: every word AC59 to AC61 show, inside its folds

test('AC84 ("what stays"): every word AC59 to AC61 show is still on the Timeline, inside its folds — the ends, each band\'s name and dates, each milestone\'s name, code, state, "Done when" and why, each sprint\'s date, code, marks, title, Technical, Context and Why, its tasks line, "Not tied to a milestone", the gathered lines, the Now line and the icons\' words', async () => {
  // The page's tree holds every path J11's fixture's tree.txt lists (research memos are named from the tree only,
  // their text never read), as the model's snapshot does: placeholder text for the files the fixture doesn't copy.
  const files = j11Files();
  const treeOnly = Object.fromEntries(treePaths().filter((p) => !(p in files)).map((p) => [p, '(placeholder: only the path is read)\n']));
  for (const repoOpts of [{ extra: treeOnly }, { ac61: true, answer: ac61Answer(), extra: treeOnly }]) {
    const app = await open('#/p/Service-Desk/timeline', { repoOpts });
    try {
      const m = models({ ...(repoOpts.ac61 ? { ac61: true, answer: ac61Answer() } : {}), now: app.now });
      const feed = feedView(m.ctx, { pulls: [] }, app.now, 'America/Chicago');
      const text = flat(app.view.textContent);
      const want = [];
      let crosses = 0;
      for (const g of [feed.top, feed.bottom]) want.push(g.label, g.text, g.source.words, g.finish);
      for (const b of feed.blocks) {
        want.push(b.band.name, b.band.label);
        if (b.nowLine) want.push(b.nowLine.words, b.nowLine.sub);
        if (b.began) want.push(b.began.head, b.began.words, b.began.quote);
        for (const x of rowsOf(b)) {
          if (x.kind === 'gather') {
            want.push(x.words, ...x.items.flatMap((i) => [i.name, i.code, i.words]));
            continue;
          }
          want.push(x.name, x.words, x.doneWhen, x.sentence, x.code, x.why && x.why.text, x.why && x.why.source, x.namedFold);
          for (const s of [...(x.sprints || []), ...(x.named || [])]) {
            want.push(s.code, s.title, s.missing, s.none, s.tasks && s.tasks.line, s.tasks && s.tasks.none);
            if (s.date) want.push(`${s.date} · ${s.code}`);
            // ✕ is no Plex character: drawn as an icon, its word kept beside it (AC81, specs/S-001.md:6563-6565; AC84 "every word stays").
            for (const mk of s.marks || []) {
              want.push(mk.mark === '✕' ? mk.word : `${mk.mark ? `${mk.mark} ` : ''}${mk.word}`, mk.why);
              if (mk.mark === '✕') crosses += 1;
            }
            for (const t of s.technical || []) want.push(t.text);
            for (const c of s.context || []) want.push(c.fact, c.exception ? null : (c.source || 'source not recorded'));
            for (const w of s.why || []) want.push(w);
          }
        }
      }
      for (const n of feed.notes) want.push(n);
      for (const [, w] of feed.iconsKey) want.push(w);
      const missing = want.filter((w) => w != null && w !== '' && !text.includes(flat(w)));
      assert.deepEqual(missing, [], `${repoOpts.ac61 ? 'AC61\'s fixture' : 'J11\'s fixture'}: every word drawn`);
      const icons = byClass(app.view, 'v2-stats').flatMap((st) => findAll(st, (e) => e.tag === 'svg' && /\bvi-bad\b/.test(e.attrs.class || '')));
      assert.equal(icons.length, crosses, 'each ✕ mark an icon beside its word');
      if (!repoOpts.ac61) assert.ok(crosses >= 1, `J11's fixture holds a failed check (#40): ${crosses}`);
      assert.ok(!text.includes('✕'), '✕ never as text');
      assert.ok(want.filter(Boolean).length > 200, `${want.filter(Boolean).length} words and lines checked`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// What changes (frame 7b)

test('AC84: the header — one compact bar, pinned at the top: the back control, the project\'s name (600 15 px) and the Overview | Timeline switch, Timeline current; the phase line under it, pinned with it', async () => {
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    const head = keyed(app, 'tl-head');
    const bar = byClass(head, 'v2-thead')[0];
    assert.deepEqual(bar.children.map((c) => c.className.split(' ')[0]), ['v2-round', 'v2-tn', 'v2-seg'], 'back, name, switch');
    assert.equal(byClass(bar, 'v2-tn')[0].textContent, 'Service-Desk');
    assert.equal(keyed(app, 'nav-back').attrs['aria-label'], 'Back');
    assert.deepEqual(findAll(byClass(bar, 'v2-seg')[0], (e) => e.tag === 'a').map((a) => [a.textContent, a.attrs['aria-current'] || null]), [['Overview', null], ['Timeline', 'page']]);
    assert.equal(head.children[1], byClass(head, 'v2-phl')[0], 'the phase line under it, in the same pinned bar');
    assert.match(rule('.v2-tlhead'), /position: sticky; top: 0; z-index: 3; background: var\(--bg\);/);
    assert.match(rule('.v2-tn'), /font: 600 15px\/1\.3 var\(--font\);/, 'desk-v2.html:279');
    assert.match(rule('.v2-thead'), /grid-template-columns: 44px minmax\(0, 1fr\) auto;/);
  } finally {
    app.restore();
  }
});

test('AC84: the bands — "<Phase> · run <k>" in 600 12 px with a small square in its phase\'s colour, its dates or state in Plex Mono at the right ("8 Oct – now", "planned"), pinned under the header, a hairline under it and no box', async () => {
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    const bands = byClass(app.view, 'v2-tph');
    assert.deepEqual(bands.map((b) => [byClass(b, 'v2-tpn')[0].textContent, byClass(b, 'v2-tpd')[0].textContent]), [
      ['Launch', 'planned'], ['Build · run 2', 'planned'], ['Design · run 2', '8 Oct – now'],
      ['Build · run 1', '7–8 Oct · gone back over'], ['Design · run 1', '5–8 Oct · gone back over'], ['Discovery', '30 Sep – 5 Oct · finished']]);
    for (const b of bands) assert.equal(byClass(b, 'v2-dot').length, 1, 'its small square');
    assert.deepEqual(byClass(app.view, 'v2-tblk').map((b) => b.className.split(' ')[1]), ['ph-launch', 'ph-build', 'ph-des', 'ph-build', 'ph-des', 'ph-disc'], 'each in its phase\'s colour');
    assert.match(rule('.v2-tph'), /position: sticky; top: 96px; z-index: 1;/);
    for (let n = 64; n <= 208; n += 8) assert.match(CSS, new RegExp(`\\.v2-timeline\\.tlh-${n} \\.v2-tph \\{ top: ${n}px; \\}`), `under a ${n} px header`);
    assert.match(rule('.v2-tph'), /border-bottom: 1px solid var\(--line\);/);
    assert.doesNotMatch(rule('.v2-tph'), /border: |border-radius|box-shadow/);
    assert.match(rule('.v2-tpd'), /font: var\(--t-mono\);/);
  } finally {
    app.restore();
  }
  // The page names the header's height to the next 8 px, by a class (no inline style, AC41).
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  El0.prototype.getBoundingClientRect = function rect() {
    if (` ${this.className} `.includes(' v2-tlhead ')) return { top: 0, bottom: 101, height: 101, left: 0, right: 360, width: 360 };
    return { top: 0, bottom: 0, height: 0, left: 0, right: 0, width: 0 };
  };
  try {
    const app = await openSD('#/p/Service-Desk/timeline');
    try {
      assert.ok(byClass(app.view, 'tlh-104').length === 1 && byClass(app.view, 'v2-timeline')[0].className.includes('tlh-104'), 'a 101 px header: the bands at 104 px');
    } finally {
      app.restore();
    }
  } finally {
    if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved);
    else delete El0.prototype.getBoundingClientRect;
  }
});

test('AC84: the rail — a thin line in the phase\'s colour down the band\'s left edge, solid through what has happened, dashed through what is planned; the Now line the only heavy rule on the screen, "NOW · <date>" in Plex Mono with "ahead above · done below"', async () => {
  assert.match(rule('.v2-tseg::before'), /width: 1\.5px; background: var\(--phc\);/);
  assert.match(rule('.v2-tseg.plan::before'), /repeating-linear-gradient/);
  const app = await openSD('#/p/Service-Desk/timeline', {});
  try {
    const plan = byClass(app.view, 'v2-tseg').filter((x) => x.className.split(' ').includes('plan')).map((x) => x.attrs['data-k']);
    assert.deepEqual(plan, ['seg:Launch-i1', 'seg:Build-i2', 'seg:Design-i2:plan']);
    const now = keyed(app, 'nowline');
    assert.equal(byClass(now, 'v2-nowt')[0].textContent, 'Now · 14 Oct', 'its words: today, in ownerTimeZone');
    assert.equal(byClass(now, 'v2-nows')[0].textContent, 'ahead above · done below');
  } finally {
    app.restore();
  }
  assert.match(rule('.v2-nowt'), /text-transform: uppercase;/, 'NOW, in capitals, as drawn');
  assert.match(rule('.v2-nowl'), /font: 500 11px\/1\.4 var\(--mono\); color: var\(--ink\);/, 'Plex Mono 500 11 px (desk-v2.html:297)');
  assert.match(rule('.v2-nowl::before'), /height: 2px; background: var\(--ink\);/);
  assert.match(rule('.v2-nowl::after'), /border-top: 1px solid var\(--ink\);/);
  // The only heavy rule: no other rule on the Timeline draws a line in --ink or wider than its hairlines.
  const tl = [...CSS.matchAll(/\n(\.v2-(?:timeline|tlhead|thead|tph|tblk|tseg|ms|msi|sp|sps|sph|bl|goal|feed|gather|fkeys|nowl)[^{]*)\{([^}]*)\}/g)];
  assert.ok(tl.length > 15, `${tl.length} Timeline rules`);
  for (const [, sel, body] of tl) {
    if (/^\.v2-nowl::(before|after)/.test(sel.trim())) continue;
    assert.doesNotMatch(body, /border[^;]*var\(--ink\)|background: var\(--ink\)/, `${sel.trim()}: no line in --ink`);
    for (const w of body.matchAll(/border(?:-top|-bottom)?: (\d+(?:\.\d+)?)px/g)) assert.ok(Number(w[1]) <= 1, `${sel.trim()}: a ${w[1]} px rule`);
  }
});

test('AC84: each milestone — its status icon in a plain circle on the rail (the gold ring for next to reach), its name as a row title, then in Plex Mono "<id> · <its state words> · <its rough finish>", then "Done when" and "Why" with the label in weight 500, then "<n> sprints ▸"; a missing why "Why not recorded yet · for the agents to add" in the agents\' grey, said once under the band where two or more share it (AC90)', async () => {
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    const m2b = keyed(app, 'mile:Build-i1:M2B');
    // Rewritten for AC90 (specs/S-001.md:8023-8025; AC59's note, :5246-5249; AC84's, :7518): Build run 1's three milestones
    // have no why yet, so it is said once under the band, in the agents' grey, and M2B shows no why line until it has one.
    assert.deepEqual(m2b.children.map((c) => (c.className || c.tag).split(' ')[0]), ['v2-msi', 'v2-mstt', 'v2-msm', 'v2-msd', 'v2-fold']);
    assert.equal(byClass(m2b, 'v2-mstt')[0].textContent, 'Agent usage shown on the desk');
    assert.equal(byClass(m2b, 'v2-msm')[0].textContent, 'M2B · work filed · gone back over');
    const [dw] = byClass(m2b, 'v2-msd');
    assert.equal(findAll(dw, (e) => e.tag === 'b')[0].textContent, 'Done when');
    const once = keyed(app, 'whyonce:Build-i1');
    assert.equal(once.textContent, 'Why not recorded yet for 3 of 3 milestones · for the agents to add');
    assert.match(once.className, /\bgap\b/);
    assert.equal(findAll(once, (e) => e.tag === 'b')[0].textContent, 'Why');
    // A milestone alone in its run with no why keeps its own line (Launch's M3C).
    const m3c = findAll(app.view, (e) => e.attrs && e.attrs['data-ms'] === 'M3C')[0];
    const why = byClass(m3c, 'v2-msd').at(-1);
    assert.equal(why.textContent, 'Why not recorded yet · for the agents to add');
    assert.match(why.className, /\bgap\b/);
    assert.equal(byClass(m2b, 'v2-fold')[0].textContent, '2 sprints');
    const md2 = keyed(app, 'mile:Design-i2:MD2');
    assert.match(findAll(md2, (e) => e.tag === 'svg')[0].attrs.class, /\bst-next\b/, 'MD2: the gold ring');
    assert.match(rule('.v2-msm'), /font: var\(--t-mono\);/);
    assert.match(rule('.v2-mstt'), /font: var\(--t-row\);/);
    assert.match(rule('.v2-msd b'), /font-weight: 500;/);
    assert.match(rule('.v2-msi'), /position: absolute; left: -26px;/, 'on the rail');
  } finally {
    app.restore();
  }
  // AC24's rough finish, where it gives one (Work ahead's estimates, made up: NOT a real record, wa-fixtures).
  const { waSetup, WORKED } = await import('./wa-fixtures.mjs');
  const setup = waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } });
  const wa = await loadSandbox({ ...setup, hash: '#/p/Service-Desk/timeline', now: Date.parse('2026-10-19T21:00:00Z') });
  try {
    await wa.advance(1000);
    await wa.advance(61_000);
    const msm = (code) => byClass(findAll(wa.view, (e) => e.attrs && e.attrs['data-ms'] === code)[0], 'v2-msm')[0].textContent;
    assert.match(msm('MD3'), /^MD3 · next to reach · \d+ Oct – \d+ Oct$/, 'MD3 with its rough finish');
    assert.equal(msm('MD1'), 'MD1 · work filed · once you accept it');
  } finally {
    wa.restore();
  }
});

test('AC84 (P-001-timeline-labels.md, A): each sprint, opened — its date and code in Plex Mono, its marks at the right as words with a check, its title in row type, then Technical, Context and Why as three rows, each label a small grey word in --ink2 with a grey left edge in --line2, never a colour of its own nor boxed nor in capitals, in either theme; then "Tasks in this sprint ↗"', async () => {
  const app = await open();
  try {
    const sp = findAll(keyed(app, 'tasks:Build-i1:M2B'), (e) => e.attrs && e.attrs['data-sprint'] === 'PR #44')[0];
    assert.equal(byClass(byClass(sp, 'v2-sph')[0], 'v2-mono')[0].textContent, '8 Oct · PR #44');
    assert.match(byClass(sp, 'v2-stats')[0].textContent, /^✓ merged/, 'its marks at the right, as words with a check');
    assert.equal(byClass(sp, 'v2-spt')[0].tag, 'h4');
    assert.deepEqual(byClass(sp, 'v2-bl').map((x) => byClass(x, 'v2-bn')[0].textContent), ['Technical', 'Context', 'Why']);
    const link = findAll(sp, (e) => e.tag === 'a' && e.textContent === 'Tasks in this sprint ↗')[0];
    assert.equal(link.attrs.href, 'https://github.com/shumpmaster/Service-Desk/pull/44/commits');
  } finally {
    app.restore();
  }
  assert.match(rule('.v2-bn'), /^ font: var\(--t-label\); color: var\(--ink2\); padding-top: 1px; $/, 'the label: --t-label in --ink2, nothing else');
  assert.match(rule('.v2-bl'), /border-left: 2px solid var\(--line2\);/);
  assert.match(rule('.v2-spt'), /font: var\(--t-row\);/);
  assert.match(rule('.v2-sph'), /grid-template-columns: minmax\(0, 1fr\) auto;/, 'marks at the right');
  // No other rule, in either theme, gives the labels or their rows a colour of their own.
  for (const m of CSS.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const sel = m[1].trim();
    if (!/\.v2-bn\b|\.v2-bl\.(tech|ctx|why)\b|\.v2-bl\b/.test(sel)) continue;
    for (const c of m[2].matchAll(/(?:^|;)\s*(color|border[\w-]*|background[\w-]*):\s*([^;]+)/g)) {
      assert.match(c[2], /var\(--(ink2|line2)\)/, `${sel}: ${c[1]}: ${c[2]}`);
    }
  }
  assert.doesNotMatch(CSS, /--b-(tech|ctx|why)\b/, 'AC48\'s Technical slate, Context dusty rose and Why muted violet, gone');
  assert.doesNotMatch(rule('.v2-bn'), /text-transform|border|background/);
});

test('AC84: a long Context cut at three lines with "<n> more ▸" opening the rest (AC60\'s text, unchanged); a short one whole', async () => {
  const app = await openSD('#/p/Service-Desk/timeline', { repoOpts: { ac61: true, answer: ac61Answer() } });
  try {
    await app.tap(keyed(app, 'fold:sprints:Design-i2:untied'));
    const sp = findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'PR #906')[0];
    const ctx = byClass(sp, 'v2-bl')[1];
    const bt = byClass(ctx, 'v2-bt')[0];
    assert.match(bt.className, /\bcut\b/, 'cut');
    assert.match(bt.textContent, /A fact whose source is not named · source not recorded · A fact with one · docs\/PROJECT\.md/, 'its words all there, under the cut');
    const more = byClass(ctx, 'v2-inmore')[0];
    assert.equal(more.textContent, '1 more');
    assert.equal(more.attrs['aria-expanded'], 'false');
    await app.tap(more);
    const ctx2 = byClass(findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'PR #906')[0], 'v2-bl')[1];
    assert.doesNotMatch(byClass(ctx2, 'v2-bt')[0].className, /\bcut\b/, 'opened: the rest');
    assert.equal(byClass(ctx2, 'v2-inmore')[0].attrs['aria-expanded'], 'true');
    const tech = byClass(byClass(findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'PR #906')[0], 'v2-bl')[0], 'v2-bt')[0];
    assert.doesNotMatch(tech.className, /\bcut\b/, 'Technical, short: whole');
  } finally {
    app.restore();
  }
  assert.match(rule('.v2-bt.cut'), /max-height: calc\(3 \* 1\.4em\); overflow: hidden; overflow: clip;/, 'three of its lines');
  assert.doesNotMatch(CSS, /line-clamp|text-overflow:\s*ellipsis/, 'never an ellipsis or a line clamp (AC54)');
});

test('AC84 (the rulebook\'s conflict 7, settled): "Not tied to a milestone" stays, with the grey diamond (the agents\' grey, --ink2)', async () => {
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    const u = keyed(app, 'mile:Design-i2:untied');
    assert.equal(byClass(u, 'v2-mstt')[0].textContent, 'Not tied to a milestone');
    assert.match(findAll(u, (e) => e.tag === 'svg')[0].attrs.class, /\bst-flag\b/);
    assert.match(byClass(u, 'v2-msm')[0].textContent, /^\d+ sprints? · (\d+ )?for the agents to file$/);
  } finally {
    app.restore();
  }
  assert.match(rule('.v2-s .agents'), /fill: var\(--ink2\);/);
  assert.match(readFileSync(`${SRC}/public/sandbox.js`, 'utf8'), /if \(def\.agents\) el\('path', \{ d: 'M8 2\.5l5\.5 5\.5L8 13\.5 2\.5 8z', class: 'agents' \}\);/, 'the diamond, as desk-v2.html draws it');
});

// ---------------------------------------------------------------------------
// The phase line, the same on the Team screen

test('AC84 (P-001-timeline-marker.md, A): the phase line\'s words for a second run, a first run, no next milestone and a v2.5 project, each the first part of AC83\'s sentence for the same records, character for character the same on the Team screen, with no boxed marker there', async () => {
  const m = models();
  const forms = {
    second: m.ctx,
    first: (() => { const k = new Map(m.ctx.cols.k); for (const r of m.ctx.cols.runs) k.set(r, 1); return { ...m.ctx, cols: { ...m.ctx.cols, k } }; })(),
    noNext: { ...m.ctx, next: null },
  };
  assert.equal(phaseLine(forms.second, { snap: m.snap }).words, 'Design, second time through · Next: The desk\'s look and screens chosen');
  assert.equal(phaseLine(forms.first, { snap: m.snap }).words, 'Design, first time through · Next: The desk\'s look and screens chosen');
  assert.equal(phaseLine(forms.noNext, { snap: m.snap }).words, 'Design, second time through · Next: not recorded');
  for (const ctx of Object.values(forms)) {
    const s = pageSentence(ctx, { snap: m.snap });
    assert.equal(phaseLine(ctx, { snap: m.snap }).words, s.replace('. Next: ', ' · Next: ').replace(/\.$/, ''), 'the first part, as AC84 defines it');
    assert.equal(phaseLine(ctx, { snap: m.snap }).words, firstPart(s, 'v3'));
  }
  // On the screens: Service-Desk (second run) and a v2.5 project (made-up name, poom/'s sprint), Timeline and Team.
  const app = await openSD('#/p/Service-Desk/timeline', { more: { Delta: { project: v25('Delta'), repo: fullRepo('Delta') } } });
  try {
    for (const [name, want] of [['Service-Desk', 'Design, second time through · Next: The desk\'s look and screens chosen'], ['Delta', null]]) {
      await app.go(`#/p/${name}`);
      const sentence = byClass(app.view, 'v2-lead')[0].textContent;
      const expected = want || sentence.split(/(?<=\.) /)[0];
      if (!want) assert.match(expected, /^(Sprint \S+ is open\.|No open sprint\.)$/, 'v2.5: the sentence\'s first sentence');
      const got = [];
      for (const s of ['timeline', 'team']) {
        await app.go(`#/p/${name}/${s}`);
        got.push(byClass(byClass(app.view, 'v2-phl')[0], 'v2-phlw')[0].textContent);
        assert.equal(byClass(app.view, 'sb-pmark').length, 0, `${name} ${s}: no boxed marker`);
      }
      assert.deepEqual(got, [expected, expected], `${name}: the same words on the Timeline and the Team screen`);
    }
  } finally {
    app.restore();
  }
});

test('AC84: the phase line\'s tap scrolls the Timeline to Now (C); on the Team screen it opens the Timeline at Now; and the Timeline opens at Now — opening asks the Now line to come to rest just under the pinned header and band (a recorded call), a refresh restores the saved scroll with no such call', async () => {
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  El0.prototype.getBoundingClientRect = function rect() {
    if (this.attrs && this.attrs['data-k'] === 'nowline') return { top: 2200, bottom: 2228, height: 28, left: 0, right: 360, width: 360 };
    if (` ${this.className} `.includes(' v2-tlhead ')) return { top: 0, bottom: 90, height: 90, left: 0, right: 360, width: 360 };
    if (` ${this.className} `.includes(' sb-pband ')) return { top: 90, bottom: 126, height: 36, left: 0, right: 360, width: 360 };
    return { top: 0, bottom: 0, height: 0, left: 0, right: 0, width: 0 };
  };
  try {
    const app = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() }, hash: '#/p/Service-Desk/team', now: NOW16 });
    try {
      await app.advance(1000);
      app.scrolls.length = 0;
      const pl = byClass(app.view, 'v2-phl')[0];
      pl.dispatch('keydown', { key: 'Enter', preventDefault() {} });
      await app.flush();
      assert.equal(app.loc.hash, '#/p/Service-Desk/timeline', 'from the Team screen: the Timeline');
      assert.deepEqual(app.scrolls, [[0, 2200 - 90 - 36 - 8]], 'at Now: just under the pinned header and band');
      app.scrolls.length = 0;
      window.scrollY = 3000;
      await app.advance(61_000);
      app.module.refresh();
      await app.flush();
      await app.tick();
      assert.deepEqual(app.scrolls, [], 'a refresh keeps the owner\'s scroll: no call');
      byClass(app.view, 'v2-phl')[0].dispatch('keydown', { key: ' ', preventDefault() {} });
      await app.flush();
      assert.equal(app.scrolls.length, 1, 'on the Timeline, a tap on the line scrolls back to Now');
      assert.equal(app.loc.hash, '#/p/Service-Desk/timeline', 'without leaving it');
    } finally {
      app.restore();
    }
  } finally {
    if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved);
    else delete El0.prototype.getBoundingClientRect;
  }
});

test('AC84 + AC81: the Timeline\'s type is the tokens\' or desk-v2.html\'s pairs (600 12 px the band, 600 15 px the header\'s name, 500 11 px Plex Mono the Now line); the folds and the status icons\' words are --t-label and in the key, folded at the foot', async () => {
  for (const sel of ['.v2-mstt', '.v2-spt']) assert.match(rule(sel), /font: var\(--t-row\);/, sel);
  for (const sel of ['.v2-msd', '.v2-bt', '.v2-phl']) assert.match(rule(sel), /font: var\(--t-small\);/, sel);
  assert.match(rule('.v2-fold'), /font: var\(--t-label\);/);
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    const key = keyed(app, 'feed-keys');
    assert.equal(key, byClass(app.view, 'v2-timeline')[0].children.at(-1), 'at the foot');
    const f = byClass(key, 'v2-fold')[0];
    assert.equal(f.attrs['aria-expanded'], 'false', 'folded (frame 7b draws no key)');
    await app.tap(f);
    assert.match(keyed(app, 'feed-keys').textContent, /reached.*next to reach.*for the agents to file/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Stage 3, review round 1 (the Design reviewer's 1 to 4)

test('AC84 (specs/S-001.md:6917-6922; the Design reviewer\'s 4, stage 3 round 1): "<n> more ▸" only when something is hidden — the page measures each cut Context and Why, and a text that fits whole has no control; one cut counts the parts not wholly shown', async () => {
  const app = await openSD('#/p/Service-Desk/timeline', { repoOpts: { ac61: true, answer: ac61Answer() } });
  try {
    await app.tap(keyed(app, 'fold:sprints:Design-i2:untied'));
    const cut = () => findAll(app.view, (e) => e.attrs && e.attrs['data-bt'] != null);
    const sp = () => findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'PR #906')[0];
    assert.ok(cut().length >= 2, 'each Context and Why, cut at three lines, measured');
    assert.ok(byClass(app.view, 'v2-inmore').length >= 1, 'before it has measured: judged by length');
    // The fake DOM can't lay out text: every cut text fits whole (34 px in a 34 px box) but PR #906's Context,
    // whose two facts end at 30 and 80 px in a 50 px box: one of them not wholly shown.
    for (const el of cut()) {
      el.clientHeight = 34;
      el.scrollHeight = 34;
    }
    const ctx = byClass(byClass(sp(), 'v2-bl')[1], 'v2-bt')[0];
    ctx.clientHeight = 50;
    ctx.scrollHeight = 120;
    ctx.getBoundingClientRect = () => ({ top: 0, bottom: 50, height: 50, left: 0, right: 260, width: 260 });
    const facts = ctx.children.filter((c) => c.tag);
    assert.equal(facts.length, 2, 'AC61\'s two facts');
    // Rewritten at stage 6a of "After MD3" (AC89 (k), specs/S-001.md:7942-7943): "<n> more" counts the parts not shown at
    // all, so the second fact starts below the box's foot (a part cut at the third line counts as shown).
    facts.forEach((f, i) => { f.getBoundingClientRect = () => ({ top: [0, 52][i], bottom: [30, 80][i], height: 17, left: 0, right: 260, width: 260 }); });
    await app.resize(360);
    await app.flush();
    const mores = byClass(app.view, 'v2-inmore');
    assert.deepEqual(mores.map((m) => m.attrs['data-more']), [`${ctx.attrs['data-bt']}`], 'only the one cut text has a control');
    assert.equal(mores[0].textContent, '1 more', 'the fact not shown at all');
    // The second fact moved up into the box (a wider screen): both shown whole, the control goes.
    facts[1].getBoundingClientRect = () => ({ top: 0, bottom: 48, height: 17, left: 0, right: 260, width: 260 });
    ctx.scrollHeight = 50;
    await app.resize(414);
    await app.flush();
    assert.equal(byClass(app.view, 'v2-inmore').length, 0, 'nothing hidden: no control');
    const why = byClass(byClass(sp(), 'v2-bl')[2], 'v2-inmore');
    assert.equal(why.length, 0, 'Why fits whole: no "1 more"');
  } finally {
    app.restore();
  }
});

test('AC84 (specs/S-001.md:6879-6880, :6903-6906; the Design reviewer\'s 3, stage 3 round 1): the pinned header is exactly as tall as the bands\' offset — the class that places the bands also sets the header\'s height, and the page measures the header at its own height, so it can shrink again', async () => {
  for (let n = 64; n <= 208; n += 8) assert.match(CSS, new RegExp(`\\.v2-timeline\\.tlh-${n} \\.v2-tlhead \\{ min-height: ${n}px; \\}`), `a ${n} px header`);
  assert.match(rule('.v2-tlhead'), /align-content: start;/);
  assert.match(RAW, /html\.sb \*, html\.sb \*::before, html\.sb \*::after \{ box-sizing: border-box; \}/, 'its border inside its height');
  // The header's own height: 101 px, then 70; with a tlh class it is that class's height (its min-height).
  let natural = 101;
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  El0.prototype.getBoundingClientRect = function rect() {
    if (` ${this.className} `.includes(' v2-tlhead ')) {
      const scr = byClass(this.ownerDocument ? this.ownerDocument : this, 'v2-timeline')[0];
      const cls = (scr && scr.className) || '';
      const m = /\btlh-(\d+)\b/.exec(cls);
      const h = Math.max(natural, m ? Number(m[1]) : 0);
      return { top: 0, bottom: h, height: h, left: 0, right: 360, width: 360 };
    }
    return { top: 0, bottom: 0, height: 0, left: 0, right: 0, width: 0 };
  };
  try {
    const app = await openSD('#/p/Service-Desk/timeline');
    try {
      const scr = () => byClass(app.view, 'v2-timeline')[0];
      // Point the stub at the screen: the header's height follows the class on the Timeline.
      const head = byClass(app.view, 'v2-tlhead')[0];
      head.ownerDocument = app.view;
      await app.resize(360);
      assert.match(scr().className, /\btlh-104\b/, '101 px: the bands at 104 px, the header 104 px');
      await app.resize(360);
      assert.match(scr().className, /\btlh-104\b/, 'measured again: still 104, never creeping up');
      natural = 70;
      await app.resize(414);
      assert.match(scr().className, /\btlh-72\b/, 'a shorter header (a wider screen): 72 px, measured at its own height');
      assert.equal((scr().className.match(/\btlh-\d+\b/g) || []).length, 1, 'one class at a time');
    } finally {
      app.restore();
    }
  } finally {
    if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved);
    else delete El0.prototype.getBoundingClientRect;
  }
});

test('AC84 (specs/S-001.md:6917-6922; the Design reviewer\'s 1 and 2, stage 3 round 1): a sprint\'s title sits under its date row with no h4 margins; its marks one even line in one size, a mark with a reason as its neighbours', () => {
  assert.match(rule('.v2-spt'), /margin: 0;/, 'no browser margins above or below the title');
  assert.match(rule('.v2-stats'), /display: flex;/);
  assert.match(CSS, /\n\.v2-stats \{ align-items: center; \}/, 'one even line: each mark centred in it');
  const m = rule('.v2-timeline .v2-stats .sb-mkw, .v2-timeline .v2-stats .sb-mkw > summary');
  assert.match(m, /font: 400 11px\/1\.35 var\(--font\); color: var\(--ink2\);/, 'one size for every mark, a <details> one too');
  // It outweighs the Timeline's rule for a reason's summary (12 px), which comes before it.
  const small = CSS.indexOf('\n.v2-timeline .sb-why, .v2-timeline .sb-why > summary');
  assert.ok(small > 0 && CSS.indexOf('\n.v2-timeline .v2-stats .sb-mkw, ') > small, 'after it, and heavier (three classes)');
  assert.match(rule('.v2-timeline .v2-stats span.sb-mkw, .v2-timeline .v2-stats .sb-mkw > summary'), /display: inline-flex; align-items: center; gap: 2px;/);
  // Its own class, not the board card's .v2-mk (--ink): drawn in currentColor, its word's --ink2 (AC81, specs/S-001.md:6514-6516; the Reviewer's N-a, round 2).
  assert.match(rule('.v2-stats .v2-smk'), /^ width: 10px; height: 10px; color: inherit; $/, 'the ✕ icon at the marks\' size, in its word\'s colour');
  assert.match(rule('.v2-k'), /stroke: currentColor;/);
});

test('AC81 + AC84 (after MD3, stage 8; (b) item 37, stage 3 review round 3, R1): the ✕ icon\'s colour as drawn — through the cascade, at 360 and 414 px, light, the phone\'s dark and forced dark, the icon\'s stroke is its own colour and that colour is its word\'s, --ink2', async () => {
  // specs/S-001.md:6512-6516 (AC81: a mark keeps its word, in the marks' colour) and the rule test above, which reads only
  // the rule's text: a later, heavier rule giving the icon --ink passed it (the Reviewer's mutation Na3).
  const rules = (() => {
    const a = parseCss(readFileSync(`${SRC}/public/style.css`, 'utf8'), 'style.css');
    return [...a, ...parseCss(RAW, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }))];
  })();
  const name = (v) => (/^⟦([^|⟧]*)\|[^⟧]*⟧$/.exec(String(v)) || [])[1] || null;
  const app = await open();
  try {
    const root = document.documentElement;
    for (const [way, env, attr] of [['light', { scheme: 'light' }, null], ["the phone's dark", { scheme: 'dark' }, null], ['forced dark', { scheme: 'light' }, 'dark']]) {
      for (const width of [360, 414]) {
        const attrs = { ...(root.attrs || {}) };
        if (attr) attrs['data-theme'] = attr; else delete attrs['data-theme'];
        const tree = cascade(treeOf(app.view, { className: root.className, attrs }), rules, { ...env, width, reducedMotion: false });
        const icons = nodes(tree).filter((n) => n.tag === 'svg' && n.cls.has('v2-smk'));
        assert.ok(icons.length >= 1, `${way} ${width}: a ✕ on the Timeline (J11's #40)`);
        for (const icon of icons) {
          const word = nodes(tree).find((n) => n.kids.includes(icon));
          assert.equal(icon.declared.get('stroke'), 'currentColor', 'drawn in its own colour');
          for (const part of icon.kids.filter((k) => k.cls.has('fill'))) assert.equal(part.declared.get('fill'), 'currentColor');
          assert.equal(icon.style.get('color'), word.style.get('color'), `${way} ${width}: the icon in its word's colour`);
          assert.equal(name(icon.style.get('color')), '--ink2', `${way} ${width}: --ink2, as the marks`);
        }
      }
    }
  } finally {
    app.restore();
  }
});

test('AC81 + AC84 (specs/S-001.md:6512-6517, "each keeps its word or its accessible name"; the Reviewer\'s NB1 and N-b, stage 3 round 2): a failed check reads "failed checks" to assistive technology, its icon hidden, never only "checks" as a passed one\'s "✓ checks" would; each mark keeps its own word', async () => {
  // The accessible text: every text node not inside an aria-hidden part, as a screen reader reads it.
  const said = (el) => {
    if (!el.tag) return el.textContent;
    if (el.attrs && el.attrs['aria-hidden'] === 'true') return '';
    return el.children.map(said).join('');
  };
  const app = await open();
  try {
    const marks = (id) => {
      const sp = findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === id)[0];
      return byClass(byClass(sp, 'v2-sph')[0], 'v2-stats')[0].children.filter((c) => c.tag).map((m) => flat(said(m.tag === 'details' ? m.children.find((c) => c.tag === 'summary') : m)));
    };
    assert.deepEqual(marks('PR #40'), ['✓ merged', '✓ review', 'failed checks'], 'J11\'s #40: its checks failed (AC60\'s "✕ checks")');
    assert.deepEqual(marks('PR #44'), ['✓ merged', '✓ review', '✓ checks'], '#44: passed');
    assert.notEqual(marks('PR #40')[2], marks('PR #44')[2], 'a failed check never reads as a passed one');
    const sp40 = findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'PR #40')[0];
    const icon = findAll(sp40, (e) => e.tag === 'svg' && /\bvi-bad\b/.test(e.attrs.class || ''))[0];
    assert.equal(icon.attrs['aria-hidden'], 'true', 'the icon itself hidden from assistive technology');
    assert.deepEqual(icon.attrs.class.split(' '), ['v2-k', 'v2-smk', 'vi-bad'], 'the marks row\'s own class, never the board card\'s .v2-mk (--ink; the Reviewer\'s N-a)');
    assert.equal(byClass(sp40, 'sb-vh').map((x) => x.textContent).join(''), 'failed ', 'its name in visually hidden text');
  } finally {
    app.restore();
  }
  assert.match(RAW, /\n\.sb-vh \{ position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect\(0 0 0 0\); white-space: nowrap; \}/, 'hidden from sight, read aloud');
});
