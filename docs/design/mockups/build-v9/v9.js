  /* the waiting bell switches to its filled form (Craft ref 11) */
  function header(crumb) {
    var f = state.feed, inProj = state.view === 'proj' && state.proj, title = inProj ? proj(state.proj).name : 'Timeline';
    var age = { live: 'read 1 min ago', late: 'read 6 min ago', stopped: 'last read 13 min ago' }[f];
    var word = { live: 'Live', late: 'Late', stopped: 'Stopped' }[f];
    var waiting = NEEDS.length;
    var h = '<header class="top"><div class="topbar">' + (inProj ? '<button type="button" class="circ" id="back" aria-label="All projects">' + UI.back + '</button>' : '<span></span>') +
      '<div class="capsule"><button type="button" class="cbtn' + (waiting ? ' has-dot' : '') + '" data-jump-needs aria-label="Needs you: ' + waiting + '">' + (waiting ? UI.bellOn + '<span class="bdot"></span>' : UI.bell) + '</button>' +
      '<button type="button" class="cbtn" data-menu aria-label="More">' + UI.more + '</button></div></div>' +
      '<h1>' + esc(title) + '</h1>' +
      '<div class="asof"><span class="live ' + (f === 'live' ? '' : f) + '"><i></i>' + word + '</span><span>· as of <b>17:25 UTC</b></span><span>· ' + age + '</span></div></header>';
    if (f === 'late') h += '<div class="banner"><b>Late: the last read was 6 minutes ago.</b> <span>The desk reads every 2 minutes, so this is from 15:14 and may have changed.</span></div>';
    if (f === 'stopped') h += '<div class="banner"><b>Stopped since 15:07 UTC.</b> <span>The outside check has not heard from the desk for 13 minutes. Nothing here is new, and waiting items may already be done.</span></div>';
    if (!inProj) h += '<label class="search">' + UI.search + '<input type="search" id="q" placeholder="Search projects and what needs you" value="' + esc(state.query) + '" autocomplete="off"></label>';
    return h;
  }

  /* the collapsible heading of ref 12: the menu dots right after the word, the fold chevron at the right edge */
  function needsBlock(filter) {
    var list = NEEDS.map(function (n, i) { return [n, i]; }).filter(function (x) { return !filter || x[0].p === filter; });
    if (!list.length) return '';
    var c = state.needsCollapsed;
    return '<section class="needs" aria-label="Needs you"><div class="needs-head"><span class="hleft"><h2>Needs you</h2>' +
      '<button type="button" class="hbtn" data-menu aria-label="More">' + UI.dots + '</button></span><span class="hright">' +
      '<button type="button" class="hbtn' + (c ? ' collapsed' : '') + '" data-collapse-needs aria-expanded="' + !c + '" aria-label="' + (c ? 'Show' : 'Hide') + ' what needs you, ' + list.length + '">' + UI.down + '</button></span></div>' +
      (c ? '' : list.map(function (x) { return needRow(x[0], x[1]); }).join('')) + '</section>';
  }

  /* project cards in the pinned-card style of ref 12: a page thumbnail, a medium title, a grey caption */
  function projCard(p) {
    var n = NEEDS.filter(function (x) { return x.p === p.id; }).length;
    var plan = PLANS[p.id], cur = plan ? plan.filter(function (b) { return b.st === 'current'; })[0] : null;
    return '<button type="button" class="pcard" data-proj="' + p.id + '" data-text="' + esc((p.name + ' ' + p.what).toLowerCase()) + '" aria-label="Open ' + esc(p.name) + '">' +
      '<span class="p-head"><span class="p-thumb" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="p-hx">' +
      '<span class="p-top"><span class="p-name">' + esc(p.name) + '</span>' + (n ? '<span class="p-badge" aria-label="' + n + ' waiting on you">' + n + '</span>' : '') + '</span>' +
      '<span class="p-sub">' + (cur ? esc(cur.name) + ' · ' : '') + esc(p.repo.split(' · ')[0]) + '</span></span></span>' +
      '<span class="p-what">' + esc(p.what) + '</span>' +
    '</button>';
  }

  /* the tab bar: the selected tab shows its filled icon */
  function tabbar(where) {
    var t = document.getElementById('tabbar');
    if (!t) { t = document.createElement('nav'); t.id = 'tabbar'; t.className = 'tabbar'; t.setAttribute('aria-label', 'Tabs'); document.body.appendChild(t); }
    var hasPlan = where === 'proj' && PLANS[state.proj];
    function tab(key, label, off, on, cur, dis) {
      return '<button type="button" class="tab" data-tab="' + key + '" aria-label="' + label + '" aria-current="' + cur + '"' + (dis ? ' disabled' : '') + '>' +
        '<span class="ti off">' + off + '</span><span class="ti on">' + on + '</span></button>';
    }
    t.innerHTML = tab('desk', 'Desk', UI.home, UI.homeOn, where === 'desk', false) +
      tab('plan', 'Plan', UI.plan, UI.planOn, where === 'proj', where !== 'proj') +
      tab('needs', 'Needs you', UI.tray, UI.trayOn, false, false);
    var r = document.getElementById('roundbtn');
    if (!r) { r = document.createElement('button'); r.type = 'button'; r.id = 'roundbtn'; r.className = 'roundbtn'; r.setAttribute('aria-label', 'Jump to Now'); document.body.appendChild(r); }
    r.innerHTML = UI.now;
    r.disabled = !hasPlan;
  }
