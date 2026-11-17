  /* The owner's answer 14 (round 4): "Option B but you need to get rid of that gap of space between the title and pills. Honestly we
     can maybe shrink the title and update status and just convert it into a sleek header that stays with the pills and branch chart".
     A layer over pills.js (PILLS = 'B') inside v15's script. HDR = '1' | '2' | '3'; the whole header floats with the pills and the map.
     1: one slim bar: back, the title in 17 with the status under it in 12, the bell and More; the pills right under it.
     2: no separate title: back, the pills (the one you are in is the title), the bell; the status in one small line under them.
     3: the large title at the top, tight to the pills; as you scroll it shrinks into the slim bar of 1. */
  function hdrInto() {
    var band = document.getElementById('v13band'), top = document.querySelector('#view header.top'), row = band && band.querySelector('.pl-row');
    if (!band || !top || !row) return;
    var back = top.querySelector('#back'), cap = top.querySelector('.capsule'), h1 = top.querySelector('h1'), live = top.querySelector('.asof');
    var bar = document.createElement('div'); bar.className = 'hd-bar hd-' + HDR;
    var tx = document.createElement('div'); tx.className = 'hd-tx';
    if (HDR === '2') {
      bar.appendChild(back); bar.appendChild(row); bar.appendChild(cap);
      var st = document.createElement('div'); st.className = 'hd-st'; st.appendChild(live);
      band.insertBefore(st, band.firstChild); band.insertBefore(bar, band.firstChild);
      h1.classList.add('hd-sr');   // the title stays for screen readers only
      bar.appendChild(h1);
    } else {
      tx.appendChild(h1); tx.appendChild(live);
      bar.appendChild(back); bar.appendChild(tx); bar.appendChild(cap);
      band.insertBefore(bar, row);
    }
    top.remove();
    band.classList.add('hd-band', 'hd-b' + HDR);
    if (HDR === '3') hdrSync();
  }
  function hdrSync() {
    var band = document.getElementById('v13band'); if (!band || !band.classList.contains('hd-b3')) return;
    var y = window.scrollY, on = band.classList.contains('slim');
    if (!on && y > 60) band.classList.add('slim'); else if (on && y < 20) band.classList.remove('slim');
  }
  window.addEventListener('scroll', hdrSync, { passive: true });
  var _renderProjectHd = renderProject;
  renderProject = function () { var r = _renderProjectHd.apply(this, arguments); hdrInto(); return r; };
