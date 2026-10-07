// A small, safe markdown renderer for cards and owner questions (spec S-001, AC11, AC12).
// Record text is data from the repositories, never markup: everything is HTML-escaped first, and
// only http(s) links become anchors. Consecutive text lines keep their line breaks, so a
// question's labelled lines stay one per line. Long words wrap (the page's CSS), so nothing
// needs sideways scrolling on a phone.

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function inline(text) {
  const out = [];
  const re = /(`[^`]+`)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    out.push(escapeHtml(text.slice(last, m.index)));
    if (m[1]) out.push(`<code>${escapeHtml(m[1].slice(1, -1))}</code>`);
    else if (m[2]) {
      const href = m[3];
      if (/^https?:\/\//i.test(href)) {
        out.push(`<a href="${escapeHtml(href)}" rel="noopener noreferrer" target="_blank">${escapeHtml(m[2])}</a>`);
      } else {
        out.push(`${escapeHtml(m[2])} (${escapeHtml(href)})`);
      }
    } else if (m[4]) out.push(`<strong>${escapeHtml(m[4])}</strong>`);
    last = re.lastIndex;
  }
  out.push(escapeHtml(text.slice(last)));
  return out.join('');
}

export function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const html = [];
  let para = [];
  let list = null; // { tag, items: [] }
  const flushPara = () => {
    if (para.length) html.push(`<p>${para.map(inline).join('<br>')}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) html.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^```/.test(l)) {
      flushPara();
      flushList();
      const body = [];
      for (i++; i < lines.length && !/^```/.test(lines[i]); i++) body.push(lines[i]);
      html.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }
    const h = /^(#{1,6}) (.*)$/.exec(l);
    if (h) {
      flushPara();
      flushList();
      const level = Math.min(h[1].length + 1, 6);
      html.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }
    const ul = /^\s{0,3}[-*] (.*)$/.exec(l);
    const ol = /^\s{0,3}[0-9]+\. (.*)$/.exec(l);
    if (ul || ol) {
      flushPara();
      const tag = ul ? 'ul' : 'ol';
      if (!list || list.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      list.items.push((ul || ol)[1]);
      continue;
    }
    if (l.trim() === '') {
      flushPara();
      flushList();
      continue;
    }
    if (list && /^\s{2,}\S/.test(l)) {
      list.items[list.items.length - 1] += ` ${l.trim()}`;
      continue;
    }
    flushList();
    para.push(l.trim());
  }
  flushPara();
  flushList();
  return html.join('\n');
}
