  /* Options for the owner's comment on v19 (round 5, answer 8), on a planned event and its NeedsList: "I’m not sure how, but this
     hierarchy needs to be slightly more defined. And every icon should be able to collapse/exoand". A layer over v20 inside its
     script. HIER = '1' | '2' | '3', the same folding in each:
     - tapping an event's icon folds or opens what sits under it (what it needs, what it unlocks, why); folded, one quiet line says what is there;
     - tapping a requirement's icon opens what that requirement needs in turn, one level deeper; tapping its words still goes to it.
     1: what sits under an event is held in a soft inset panel, set in under the event's words.
     2: a tree: one line runs down from the event's icon, with an elbow into each row; rows under an event are a size smaller.
     3: each level steps in under the words of the one above, with a faint band behind it. */
  document.documentElement.classList.add('hk-' + HIER);
  function hkOpen(k) { return !state.open[fk('hk:' + k)]; }
  function hnOpen(k) { return !!state.open[fk('hn:' + k)]; }
  /* the needs list, with nested levels: path is the chain of keys down to this list */
  function cmH(deps, un, miss, path, depth) {
    var met = deps.length - miss.length;
    var rows = deps.map(function (d) {
      var h = mRow(d), k = d[2], sub = k && k !== 'act' && DEP[k] && DEP[k].length ? k : null;
      if (!sub) return h;
      var pk = path + '>' + k, open = hnOpen(pk);
      h = h.replace('<span class="v13ico nd-sm">', '<span class="v13ico nd-sm hk-tw' + (open ? ' on' : '') + '" data-hn="' + esc(pk) + '" role="button" tabindex="0" aria-expanded="' + open + '" aria-label="' + (open ? 'Fold' : 'Open') + ' what this needs">');
      if (!open || depth > 3) return h;
      var dd = DEP[k], mm = unmet(k);
      return h.replace(/<\/li>$/, '') + '<div class="hk-sub">' + cmH(dd, [], mm, pk, depth + 1) + '</div></li>';
    }).join('');
    return '<div class="ndm' + (depth ? ' hk-nest' : '') + '"><div class="nd1-hd">' + (depth ? 'It needs' : 'Needs first') + ' <span>' + met + ' of ' + deps.length + ' done</span></div><ol class="ndm-l">' + rows + '</ol>' +
      (un.length ? '<div class="nd1-hd">Then unlocks</div><ol class="ndm-l">' + un.map(function (kk) { return mRow(null, kk); }).join('') + '</ol>' : '') + '</div>';
  }
  var _evRow13H = evRow13;
  evRow13 = function (b, i, g, e) {
    var sp = PLANS[state.proj][b].items[i].sprints[g], x = sp.events[e], k = sp.name + '|' + x.title, deps = DEP[k] || [], un = UNL[k] || [], miss = unmet(k);
    var h = _evRow13H(b, i, g, e);
    /* rebuild what sits under the event: the nested needs list, then why */
    var j = h.search(/<div class="ndm"|<div class="wy-story"/), row = j < 0 ? h : h.slice(0, j), rest = j < 0 ? '' : h.slice(j);
    var ws = /<div class="wy-story">[\s\S]*$/.exec(rest), kids = (miss.length ? cmH(deps, un, miss, k, 0) : '') + (ws ? ws[0] : '');
    if (!kids) return row;
    var open = hkOpen(k), sum = [];
    if (miss.length) sum.push('Needs ' + deps.length + ' first, ' + (deps.length - miss.length) + ' done');
    if (un.length) sum.push('unlocks ' + un.length);
    if (ws) sum.push('why it happened');
    row = row.replace('<div class="v13ev nd-ev"', '<div class="v13ev nd-ev hk-has' + (open ? ' hk-open' : '') + '"')
             .replace('<span class="v13ico', '<span data-hk="' + esc(k) + '" role="button" tabindex="0" aria-expanded="' + open + '" aria-label="' + (open ? 'Fold' : 'Open') + ' what sits under ' + esc(x.title) + '" class="v13ico hk-tw');
    return '<div class="hk-ev">' + row + (open ? '<div class="hk-kids">' + kids + '</div>' : '<button type="button" class="hk-sum" data-hk="' + esc(k) + '">' + esc(sum.join(' · ')) + V12I.caret + '</button>') + '</div>';
  };
  window.addEventListener('click', function (e) {   /* on window, so it runs before the row's go-to */
    if (!v13on()) return;
    var t = e.target.closest('[data-hk], [data-hn]'); if (!t) return;
    e.stopImmediatePropagation(); e.preventDefault();
    var isEv = t.hasAttribute('data-hk'), k = isEv ? t.dataset.hk : t.dataset.hn, key = fk((isEv ? 'hk:' : 'hn:') + k);
    state.open[key] = !state.open[key];
    var sel = '[' + (isEv ? 'data-hk' : 'data-hn') + '="' + k.replace(/"/g, '\\"') + '"]';
    var fresh = relist(sel);
    var box = fresh && (isEv ? fresh.closest('.hk-ev') && fresh.closest('.hk-ev').querySelector('.hk-kids') : fresh.closest('li') && fresh.closest('li').querySelector('.hk-sub'));
    if (box && !REDUCED) anim(box, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 240 });
  }, true);
  document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-hk], [data-hn]')) { e.preventDefault(); e.target.click(); } });
