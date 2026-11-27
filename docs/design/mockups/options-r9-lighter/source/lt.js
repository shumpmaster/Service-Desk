  /* ================= round 9, answer 1: lighter background options over v46. The phone's hash: #<option>[.light|.dark][.home|.wd]; options: now A B C D. ================= */
  var LT = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.').filter(function (x) { return x !== 'light' && x !== 'dark'; });
    var o = { opt: h[0] || 'now', st: h.slice(1) };
    if (o.opt !== 'now') document.documentElement.classList.add('lt-' + o.opt);
    return o;
  })();
  if (LT.st.indexOf('home') < 0) setTimeout(function () { if (!v13on()) openProject(LT.st.indexOf('wd') >= 0 ? 'wd' : 'tl'); }, 300);
