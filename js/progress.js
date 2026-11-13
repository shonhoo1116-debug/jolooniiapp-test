'use strict';
/* «Миний ахиц»: ЗӨВХӨН шалгалтын үр дүн, түүх, статистик. Бүлгийн тестийн ахиц энд бүртгэгдэхгүй.
   Өгөгдөл: localStorage 'zam-exam-hist-v1' = { v:1, items:[{ id, cat, ts, n, right, wrong, skipped, pct, used, pass, fail, min, qs:[бүлэг|№], ans:[сонголт|null] }] }.
   Шалгалтын логик, тэнцэх босго, дүнгийн дэлгэцийг өөрчлөхгүй: examResult() зөвхөн PROG.save()-ийг НЭГ удаа дууддаг. */
const PROG = (() => {
  const KEY = 'zam-exam-hist-v1', TAB = 'zam-prog-tab';
  let qmap = null, idmap = null;
  const maps = () => {
    if (qmap) return; qmap = new Map(); idmap = new Map();
    TEST_CHAPTERS.forEach(c => c.questions.forEach(q => { const id = c.id + '|' + q.n; qmap.set(q, id); idmap.set(id, q); }));
  };
  const read = () => {
    let raw = null;
    try { raw = localStorage.getItem(KEY); if (!raw) return { v: 1, items: [] }; const d = JSON.parse(raw); if (d && Array.isArray(d.items)) return d; throw new Error('bad'); }
    catch (e) { try { if (raw) localStorage.setItem(KEY + '.bad', raw); } catch (_) {} return { v: 1, items: [], corrupt: true }; }
  };
  const toast = msg => {
    const t = document.createElement('div'); t.className = 'pg-toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 6000);
  };
  /* Шалгалт бүрийг НЭГ удаа хадгална (EX.saved хамгаалалт examResult-д). */
  const save = (EX, r) => {
    try {
      maps(); const d = read(), n = EX.qs.length;
      if (d.corrupt) delete d.corrupt;
      d.items.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), cat: EX.cat, ts: Date.now(), n,
        right: r.right, skipped: r.skipped, wrong: n - r.right - r.skipped, pct: Math.round(r.right / n * 100),
        used: EX.used, pass: !!r.pass, fail: EX.cf.fail, min: EX.cf.min,
        qs: EX.qs.map(q => qmap.get(q) || null), ans: EX.qs.map((q, i) => EX.ans[i] === undefined ? null : EX.ans[i])
      });
      localStorage.setItem(KEY, JSON.stringify(d));
      if (read().items.length !== d.items.length) throw new Error('verify');
    } catch (e) { toast('Шалгалтын дүнг төхөөрөмжид хадгалж чадсангүй (санах ой дүүрсэн байж болно).'); }
  };
  const pad = n => String(n).padStart(2, '0');
  const fdate = ts => { const t = new Date(ts); return t.getFullYear() + '.' + pad(t.getMonth() + 1) + '.' + pad(t.getDate()) + ' ' + pad(t.getHours()) + ':' + pad(t.getMinutes()); };
  const chart = items => {
    const a = items.slice(-20), W = 300, H = 120, L = 26, R = 8, T = 10, B = 18, iw = W - L - R, ih = H - T - B;
    const X = i => L + (a.length === 1 ? iw / 2 : i * iw / (a.length - 1)), Y = p => T + ih * (1 - p / 100);
    const last = a[a.length - 1], th = Math.round((last.n - last.fail + 1) / last.n * 100);
    const pts = a.map((x, i) => X(i).toFixed(1) + ',' + Y(x.pct).toFixed(1)).join(' ');
    return `<svg class="pg-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Шалгалтын оноо">
      ${[0, 50, 100].map(v => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="g"/><text x="${L - 4}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`).join('')}
      <line x1="${L}" x2="${W - R}" y1="${Y(th)}" y2="${Y(th)}" class="th"/>
      ${a.length > 1 ? `<polyline points="${pts}" class="ln"/>` : ''}
      ${a.map((x, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(x.pct).toFixed(1)}" r="3.6" class="${x.pass ? 'ok' : 'no'}"/>`).join('')}
    </svg><div class="pg-legend"><span><i class="ok"></i>тэнцсэн</span><span><i class="no"></i>тэнцээгүй</span><span><i class="th"></i>тэнцэх босго ${th}%</span></div>`;
  };
  const draw = cat => {
    const d = read(), all = d.items.filter(x => x.cat === cat).sort((p, q) => p.ts - q.ts), tot = all.length, ok = all.filter(x => x.pass).length, rate = tot ? Math.round(ok / tot * 100) : 0;
    const n = (CATS.find(c => c.id === cat) || {}).exam, cf = examCfg(cat);
    app.innerHTML = `<div class="phone gl cr"><div class="top"><a class="back" href="#chapters" title="Нүүр">←</a><h1>Миний ахиц</h1></div>
      <div class="body" style="padding:6px 0 28px">
      <div class="pg-tabs"><button data-cat="B" class="${cat === 'B' ? 'on' : ''}">B ангилал</button><button data-cat="C" class="${cat === 'C' ? 'on' : ''}">C, D, E ангилал</button></div>
      ${d.corrupt ? '<div class="pg-card pg-warn">Хадгалсан түүхийг уншиж чадсангүй. Эх өгөгдлийг нөөцөлсөн.</div>' : ''}
      ${tot ? `<div class="pg-card pg-sum"><div class="pg-ring" style="--p:${rate}"><b>${rate}%</b><small>тэнцсэн</small></div>
        <div class="pg-stats"><div><b>${tot}</b><small>Нийт шалгалт</small></div><div><b class="g">${ok}</b><small>Тэнцсэн</small></div><div><b class="r">${tot - ok}</b><small>Тэнцээгүй</small></div></div></div>
        <div class="pg-card"><h2>Оноо${all.length > 20 ? ' · сүүлийн 20' : ''}</h2>${chart(all)}</div>
        <div class="sec" style="margin:14px 18px 8px">Шалгалтын түүх · ${cf.n} асуулт</div>
        ${all.slice().reverse().map(x => `<a class="pg-row ${x.pass ? 'p' : 'f'}" href="#phist=${x.id}"><div class="pg-main"><b>${x.right}/${x.n} · ${x.pct}%</b><small>${fdate(x.ts)}</small>
          <div class="pg-chips"><span class="c-ok">✓ ${x.right}</span><span class="c-bad">✗ ${x.wrong}</span><span class="c-skip">– ${x.skipped}</span><span>⏱ ${mmss(x.used)}</span></div></div>
          <em class="pg-badge">${x.pass ? 'ТЭНЦСЭН' : 'ТЭНЦЭЭГҮЙ'}</em></a>`).join('')}`
      : `<div class="pg-card pg-empty"><div class="pg-ic">📊</div><b>Одоогоор шалгалтын түүх алга</b><p>${cat === 'B' ? 'B ангилалын' : 'C, D, E ангилалын'} шалгалт өгөхөд үр дүн энд автоматаар хадгалагдана.</p></div>`}
      </div></div>`;
    app.onclick = e => { const b = e.target.closest('.pg-tabs button'); if (!b) return; try { localStorage.setItem(TAB, b.dataset.cat); } catch (_) {} draw(b.dataset.cat); };
  };
  const page = () => { let c = 'B'; try { c = localStorage.getItem(TAB) === 'C' ? 'C' : 'B'; } catch (_) {} draw(c); };
  /* Өмнөх шалгалтын хариуг одоо байгаа «Хариуг харах» дэлгэцээр (examTrack('review')) харуулна. */
  const review = () => {
    maps(); const id = decodeURIComponent((/^#phist=(.+)$/.exec(location.hash) || [])[1] || ''), it = read().items.find(x => x.id === id);
    if (!it) { location.hash = '#progress'; return; }
    const qs = [], ans = [];
    it.qs.forEach((qid, i) => { const q = qid && idmap.get(qid); if (q) { ans[qs.length] = it.ans[i] === null ? undefined : it.ans[i]; qs.push(q); } });
    if (!qs.length) { toast('Энэ шалгалтын асуултууд олдсонгүй.'); location.hash = '#progress'; return; }
    EX = { cat: it.cat, cf: Object.assign({}, examCfg(it.cat), { n: it.n, fail: it.fail }), qs, ans, end: 0, done: true, timer: 0, used: it.used, saved: true };
    examTrack('review');
    const b = document.querySelector('.phone .back'); if (b) b.setAttribute('href', '#progress');
  };
  return { save, page, review };
})();
