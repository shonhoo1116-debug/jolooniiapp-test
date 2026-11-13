'use strict';
/* «Офлайнд татах» — зөвхөн iPhone/вэб (https, service worker-тэй) хувилбарт. Android апп-д огт нөлөөлөхгүй.
   Нүүр хуудасны «Миний ахиц» мөрийн доор шинэ мөр нэмж, бүх асуултын зургийг (offline-list.json) нэг дор татаж service worker-ийн зургийн кэшэд хадгална. */
(function () {
  if (!('serviceWorker' in navigator) || !window.caches || location.protocol !== 'https:' || location.hostname === 'localhost') return;
  var IMG = 'jolooniiapp-img', LIST_URL = 'offline-list.json', CONC = 4;
  var list = null, busy = false, st = { done: 0, total: 0, state: 'idle' };   // state: idle | busy | ready | partial | wait

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#3b4fb8" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5"/><path d="M12 11v8m0 0l-3-3m3 3l3-3"/></svg>';

  function abs(u) { return new URL(u, location.href).href; }
  function loadList() {
    if (list) return Promise.resolve(list);
    return fetch(LIST_URL).then(function (r) { return r.json(); }).then(function (l) { list = l; st.total = l.length; return l; });
  }
  function missing() {
    return Promise.all([loadList(), caches.open(IMG).then(function (c) { return c.keys(); })]).then(function (r) {
      var have = {}; r[1].forEach(function (q) { have[q.url] = 1; });
      return r[0].filter(function (u) { return !have[abs(u)]; });
    });
  }
  function label() {
    if (st.state === 'busy') return 'Татаж байна ' + Math.round(st.done / st.total * 100) + '%';
    if (st.state === 'ready') return 'Офлайн бэлэн ✓';
    if (st.state === 'partial') return 'Дутуу (' + (st.total - st.done) + ') — дахин дар';
    if (st.state === 'wait') return 'Апп-аа хаагаад дахин нээ';
    return 'Офлайнд татах';
  }
  function sub() {
    if (st.state === 'busy') return 'Апп-аа нээлттэй байлга';
    if (st.state === 'ready') return 'Бүх зураг интернетгүй ажиллана';
    if (st.state === 'idle') return '~100MB · Wi-Fi дээр';
    return '';
  }
  function paint() {
    var row = document.getElementById('offrow'); if (!row) return;
    row.querySelector('span').innerHTML = label() + (sub() ? ' <small style="opacity:.6;font-weight:500">' + sub() + '</small>' : '');
  }
  function inject() {
    var rows = document.querySelector('.h8-rows');
    if (!rows || document.getElementById('offrow')) return;
    var a = document.createElement('a');
    a.className = 'h8-row'; a.id = 'offrow'; a.href = '#';
    a.innerHTML = '<i>' + ICON + '</i><span></span><em>›</em>';
    a.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); start(); });
    rows.appendChild(a); paint();
    refresh();
  }
  function refresh() {
    if (busy) return;
    missing().then(function (m) {
      st.done = st.total - m.length;
      if (!m.length) st.state = 'ready'; else if (st.state !== 'partial' && st.state !== 'wait') st.state = 'idle';
      paint();
    }).catch(function () {});
  }
  function start() {
    if (busy) return;
    if (st.state === 'ready') return;
    if (!navigator.serviceWorker.controller) { st.state = 'wait'; paint(); return; }   // SW хараахан хяналтад аваагүй: зураг кэшлэгдэхгүй
    if (st.state === 'idle' && !confirm('Бүх асуултын зургийг (~100MB) татна. Wi-Fi дээр байна уу?')) return;
    busy = true; st.state = 'busy'; paint();
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    missing().then(function (m) {
      var i = 0, tot = st.total; st.done = tot - m.length; paint();
      function worker() {
        if (i >= m.length) return Promise.resolve();
        var u = m[i++];
        return fetch(u, { headers: { 'x-prefetch': '1' } }).then(function (r) { if (r.ok) { st.done++; if (st.done % 5 === 0) paint(); } }).catch(function () {}).then(worker);
      }
      var ws = []; for (var k = 0; k < CONC; k++) ws.push(worker());
      return Promise.all(ws);
    }).then(function () { return missing(); }).then(function (m) {
      busy = false; st.done = st.total - m.length; st.state = m.length ? 'partial' : 'ready'; paint();
    }).catch(function () { busy = false; st.state = 'partial'; paint(); });
  }
  new MutationObserver(inject).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', inject);
})();
