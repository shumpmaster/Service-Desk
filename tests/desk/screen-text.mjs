// Every sandbox screen's text, for AC62's "every word kept" (spec S-001, AC62, trial-view notes 2,
// note 5): the screens are drawn by the page itself (src/public/sandbox.js) under the fake DOM, from
// one fixed set of fixtures, and each screen's text is read as the run of text nodes it holds, in
// order, leaving out the parts the caller says are rebuilt.
//
// The snapshot in tests/desk/fixtures/ac62-text-2c1acb6.json was made with this file at commit
// 2c1acb6 (src/ there is as the trial-view notes 2 build started from), by
// `node tests/desk/tools/ac62-snapshot.mjs`, with the parts AC57 to AC60 and AC65 to AC68 rebuild
// left out as they were drawn then (OLD_REBUILT below). AC62's test draws the same routes from the
// same fixtures today and leaves out the parts as they are drawn now.
import { CONFIG, fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, j11Files, El0, SD3 } from './sandbox-helpers.mjs';
import { NOW, fullRepo, v25 } from './sandbox-fixtures.mjs';

/** The fixtures: Service-Desk at 3117150 (J11's), a project with one item of each queue group (AC52's), and a v2.5 project. */
export function textSetup() {
  const projects = [SD3, { ...fullRepoProject('Alpha') }, v25('Delta')];
  const repos = {
    'Service-Desk': repo(j11Files()),
    Alpha: fullRepo('Alpha'),
    Delta: repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md') }),
  };
  return { config: { ...CONFIG, projects }, repos };
}
function fullRepoProject(name) {
  return { name, repo: `shumpmaster/${name}`, defaultBranch: 'main', model: 'v3', planning: false,
    webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' };
}

const cls = (el) => ` ${el.className || ''} `;
const has = (el, c) => cls(el).includes(` ${c} `);

/** The text nodes under `el`, trimmed and non-empty, in order; `skip(el)` leaves out an element and all it holds. */
export function textRuns(el, skip) {
  const out = [];
  const walk = (n) => {
    if (n instanceof El0) {
      if (skip(n)) return;
      if (n.text != null) {
        const t = String(n.text).replace(/\s+/g, ' ').trim();
        if (t) out.push(t);
        return;
      }
      for (const c of n.children) walk(c);
      return;
    }
    const t = String(n.textContent || '').replace(/\s+/g, ' ').trim();
    if (t) out.push(t);
  };
  for (const c of el.children) walk(c);
  return out;
}

/** The kind of screen a route shows (as the sandbox's parseRoute has it). */
export function routeKind(route) {
  const parts = route.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  if (parts[0] !== 'p') return 'home';
  if (!parts[2] || parts[2] === 'info') return 'status'; // `info` is the Status screen with its sheet open
  return parts[2];
}

/**
 * The parts AC57 to AC60 and AC65 to AC68 rebuild, as the sandbox drew them at 2c1acb6: Home's
 * phase checklist; the Status screen's phase list and its heading, and "More detail"'s Pipeline
 * link; the whole Timeline but its marker, header and bottom bar; the Queue's rows, "Done today"'s
 * rows and the group icons; the Team screen's cards and the owner's tile.
 */
export function OLD_REBUILT(route) {
  const kind = routeKind(route);
  return (el) => {
    if (has(el, 'sb-ck')) return true;
    if (kind === 'status' && (has(el, 'sb-phases') || (has(el, 'sb-h2') && /^The four phases, in order/.test(el.textContent)))) return true;
    if (el.attrs && el.attrs['data-k'] === 'more:pipeline') return true;
    if (kind === 'timeline') {
      const screen = el.parent && has(el.parent, 'sb-screen');
      if (screen && !has(el, 'sb-marker') && !has(el, 'sb-hdr') && !has(el, 'sb-dock')) return true;
      if (has(el, 'sb-sub')) return true;
    }
    if (kind === 'queue' && (has(el, 'sb-qrow') || has(el, 'sb-shape') || has(el, 'sb-done-r'))) return true;
    if (kind === 'team' && route.split('/').length === 4 && (has(el, 'sb-tiles') || has(el, 'sb-you'))) return true;
    return false;
  };
}

/**
 * The same parts as the sandbox draws them now (trial-view notes 2): Home's phase rows (AC65);
 * the phase marker (AC68); the Status screen's phase boxes, their key and heading (AC57, AC58), and
 * "More detail"'s Record notes line (AC68); the whole Timeline but its header and bottom bar
 * (AC59, AC60); the Queue's rows, "Done today"'s rows and the group marks (AC66, AC69, AC72); the
 * Team screen's cards, its key and the owner's tile (AC67).
 */
export function NEW_REBUILT(route) {
  const kind = routeKind(route);
  return (el) => {
    if (has(el, 'sb-tph') || has(el, 'sb-pmark')) return true;
    // From stage 1a (AC81, "Until stage 3"): the bar Home · Waiting · Plan at every screen's foot, and
    // the project screens' top row Status · Timeline · Team · Waiting, in place of their bottom bar.
    if (has(el, 'v2-bar') || has(el, 'v2-row')) return true;
    if (kind === 'status' && (has(el, 'sb-pboxes') || has(el, 'sb-pbox') || has(el, 'sb-skey') || (el.attrs && el.attrs['data-k'] === 'phases-h'))) return true;
    if (el.attrs && (el.attrs['data-k'] === 'more:pipeline' || el.attrs['data-k'] === 'more:notes')) return true;
    // From 2026-10-18 (notifications): the parts AC75, AC77 and AC78 add, new words rather than changed
    // ones: the "Notifications" control (Home's top line and More detail), "GitHub Actions this month",
    // and the Queue's "Asked in your session".
    if (has(el, 'sb-notify') || has(el, 'sb-notify-line') || has(el, 'sb-actions-usage') || has(el, 'sb-asking')) return true;
    // From 2026-10-18 (Work ahead, AC24): Home's one new control, "Work ahead", new words too; nothing
    // else on Home changes (AC24, "The way in"), and every other word is still compared.
    if (kind === 'home' && has(el, 'sb-wa-link')) return true;
    if (kind === 'timeline') {
      const screen = el.parent && has(el.parent, 'sb-screen');
      if (screen && !has(el, 'sb-marker') && !has(el, 'sb-hdr') && !has(el, 'sb-dock')) return true;
      if (has(el, 'sb-sub')) return true;
    }
    if (kind === 'queue' && (has(el, 'sb-qrow') || has(el, 'sb-shape') || has(el, 'sb-done-r') || has(el, 'sb-gmark') || has(el, 'sb-needs'))) return true;
    if (kind === 'team' && route.split('/').length === 4 && (has(el, 'sb-tiles') || has(el, 'sb-you') || has(el, 'sb-tkey'))) return true;
    // From 2026-10-17 (model 3.5.0's records): AC49 as changed in place gives a v3 project's Chief of Staff
    // page its status, groups and running log from its session lines (J13), so those parts are rebuilt
    // too; its header, marker and bottom bar, and a v2.5 project's page, stay word for word.
    if (kind === 'team' && V3_NAMES.includes(routeParts(route)[1]) && routeParts(route)[3] === 'chief-of-staff'
      && (has(el, 'sb-sub') || has(el, 'sb-resp') || has(el, 'sb-branch') || has(el, 'sb-logw'))) return true;
    return false;
  };
}
const V3_NAMES = ['Service-Desk', 'Alpha'];
const routeParts = (route) => route.replace(/^#\/?/, '').split('/').map(decodeURIComponent);

/** The routes drawn: Home, then for each project every screen, its sheets, its members' pages and the "More detail" views. */
export async function discoverRoutes(app) {
  const out = ['#/'];
  const links = (re) => {
    const seen = [];
    const walk = (n) => {
      for (const c of n.children || []) {
        if (c instanceof El0 && c.tag === 'a' && re.test(c.attrs.href || '') && !seen.includes(c.attrs.href)) seen.push(c.attrs.href);
        walk(c);
      }
    };
    walk(app.view);
    return seen;
  };
  for (const p of ['Service-Desk', 'Alpha', 'Delta']) {
    const base = `#/p/${encodeURIComponent(p)}`;
    out.push(base, `${base}/info`, `${base}/timeline`, `${base}/team`, `${base}/queue`, `${base}/asked`, `${base}/agents`);
    if (p === 'Delta') out.push(`${base}/pipeline`);
    await app.go(`${base}/team`);
    for (const h of links(new RegExp(`^${base.replace(/[/#]/g, '\\$&')}/team/[^/]+$`))) out.push(h);
    await app.go(`${base}/queue`);
    for (const h of links(new RegExp(`^${base.replace(/[/#]/g, '\\$&')}/queue/.+$`))) out.push(h);
  }
  return out;
}

/** Open the fixtures in the sandbox at NOW (as every sandbox test does) and read each route's screen text. */
export async function screenTexts(routes, rebuilt) {
  const app = await loadSandbox({ ...textSetup(), hash: '#/', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000); // a second cycle: every optional read in
    const list = routes || await discoverRoutes(app);
    const out = {};
    for (const r of list) {
      await app.go('#/');
      await app.go(r);
      out[r] = textRuns(app.view, rebuilt(r));
    }
    return out;
  } finally {
    app.restore();
  }
}
