'use strict';
// Тэмдэг цээжлэх 4 тоглоом + цомог: Тэмдэг барих (3 сагс), Тэмдэг ангуучин.
// Бүх тоглоом SIGNS-ийн бүх тэмдгийг (Deck.all) ашиглана; ахиц нь тэмдэг бүрээр нэгтгэгдэнэ (localStorage 'zam-learn-v1').

const Learn = (() => {
  const $ = id => document.getElementById(id);
  const KEY = 'zam-learn-v1';
  let S = { signs: {}, best: {} }, api = null, raf = 0, cleanup = null, current = null;
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

  // ---------- ахиц ----------
  const mastery = c => (S.signs[c] && S.signs[c].m) || 0;
  const stars = c => { const m = mastery(c); return m >= .88 ? 3 : m >= .6 ? 2 : m >= .25 ? 1 : 0; };
  function record(code, ok, game) {
    const e = S.signs[code] || (S.signs[code] = { m: 0, n: 0, w: 0, g: {} });
    e.n++; if (!ok) e.w++; e.m = ok ? e.m + (1 - e.m) * .34 : e.m * .55; e.g[game] = (e.g[game] || 0) + (ok ? 1 : 0); persist();
  }
  const totals = () => { const all = Deck.all(); return { n: all.length, got: all.filter(s => stars(s.code) > 0).length, gold: all.filter(s => stars(s.code) === 3).length }; };
  // тэмдгүүдийг сул ахицтай нь түрүүлж санамсаргүй сонгоно
  function pick(n, filter, avoidNames = new Set()) {
    let pool = Deck.all().filter(s => !filter || filter(s));
    const seen = new Set(), out = [];
    const items = pool.map(s => ({ s, w: .3 + 2.4 * (1 - mastery(s.code)) + (S.signs[s.code] ? 0 : .8) }));
    while (out.length < n && items.length) {
      const sum = items.reduce((a, x) => a + x.w, 0); let r = Math.random() * sum, k = 0; for (; k < items.length - 1; k++) { r -= items[k].w; if (r <= 0) break; }
      const it = items.splice(k, 1)[0]; if (seen.has(it.s.name) || avoidNames.has(it.s.name)) continue; seen.add(it.s.name); out.push(it.s);
    }
    return out;
  }
  const names = list => new Set(list.map(s => s.name));
  const drawTo = (cv, code, bg = '#e9edf2') => { const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height); c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height); SG.drawSign(c, code, cv.width / 2, cv.height / 2, cv.width - 14); };
  const signCanvas = (code, size = 96, cls = '') => { const cv = document.createElement('canvas'); cv.width = cv.height = size * 2; cv.style.width = cv.style.height = size + 'px'; if (cls) cv.className = cls; drawTo(cv, code); return cv; };
  function signCanvasT(code, size) { const cv = document.createElement('canvas'); cv.width = cv.height = size * 2; SG.drawSign(cv.getContext('2d'), code, size, size, size * 2 - 8); return cv; }   // тунгалаг дэвсгэртэй
  function roundedRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // Нэмэлт тэмдэг (7.x) ганцаараа үйлдэл шаардахгүй: дүрмийн 7.x заалтад заасан үндсэн тэмдэгтэй хамт харуулна
  const MAIN_FOR = [[/^7\.1\.б/, '3.5'], [/^7\.1\./, '1.21'], [/^7\.2\.а/, '2.20'], [/^7\.2\./, '2.27'], [/^7\.3\./, '2.5'], [/^7\.4\./, '2.2'], [/^7\.5\./, '2.27'], [/^7\.6\./, '5.17'], [/^7\.7/, '5.17'], [/^7\.8/, '5.17'], [/^7\.9/, '5.17'], [/^7\.10/, '2.27'], [/^7\.11/, '5.17'], [/^7\.12/, '2.4'], [/^7\.13/, '3.4'], [/^7\.14/, '5.14'], [/^7\.15/, '5.17'], [/^7\.16/, '5.19.а'], [/^7\.17/, '1.12']];
  const mainFor = code => { for (const [re, m] of MAIN_FOR) if (re.test(code)) return Deck.byCode(m) ? m : null; return null; };
  function compCanvas(code, main, size, bg) { const cv = document.createElement('canvas'); cv.width = cv.height = size * 2; const c = cv.getContext('2d'); if (bg) { c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height); } const S2 = size * 2;
    if (!main) { SG.drawSign(c, code, size, size, S2 - 14); return cv; }
    SG.drawSign(c, main, size, S2 * .27, S2 * .48); SG.drawSign(c, code, size, S2 * .76, S2 * .52); return cv; }
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  function body(html) { const b = $('lbody'); b.innerHTML = html; return b; }
  function stop() { cancelAnimationFrame(raf); raf = 0; if (cleanup) { cleanup(); cleanup = null; } current = null; }
  function setTitle(t, chip) { $('lTitle').textContent = t; $('lChip').textContent = chip || ''; }

  // ---------- нийтлэг: дүн, алдсан тэмдгүүд ----------
  function resultScreen({ title, line, missed, again, big }) {
    const tot = totals();
    const b = body(`<div class="lres"><div class="lbig">${big || ''}</div><h3>${esc(title)}</h3><p class="lsum">${line}</p>
      <div class="lprog">Цомог: <b>${tot.got} / ${tot.n}</b> нээгдсэн · ★★★ ${tot.gold}</div>
      ${missed.length ? '<div class="lmiss"><div class="small">❌ Алдсан тэмдгүүд — давтаарай</div>' + missed.map(m => `<div class="miss" data-c="${esc(m.code)}"><div class="sg"></div><div><b>${esc(m.code.split('@')[0])} «${esc(Deck.byCode(m.code).name)}»</b><br><span class="small">${esc(m.extra || Deck.meaning(m.code))}</span></div></div>`).join('') + '</div>' : '<p class="small">Бүгдийг зөв хийлээ! 🎉</p>'}
      <div class="lbtns"><button id="lAgain" class="big">🔁 Дахин</button><button id="lMenu" class="ghost">Цэс</button></div></div>`);
    b.querySelectorAll('.miss').forEach(el => el.querySelector('.sg').appendChild(signCanvas(el.dataset.c, 46)));
    $('lAgain').onclick = again; $('lMenu').onclick = () => api.back();
    api.sound(missed.length ? 'thud' : 'win');
  }

  // =============== 1. ТЭМДЭГ БАРИХ (3 сагс) ===============
  const SETS = [
    { id: 'a', name: 'Хориглох · Анхааруулах · Мэдээлэх', groups: [2, 1, 5] },
    { id: 'b', name: 'Заах · Дарааллын · Нэмэлт', groups: [4, 3, 7] },
    { id: 'c', name: 'Үйлчилгээний · Хориглох · Заах', groups: [6, 2, 4] },
    { id: 'd', name: 'Анхааруулах · Дарааллын · Мэдээлэх', groups: [1, 3, 5] },
  ];
  const BCOL = { 1: ['#8a6a14', '⚠'], 2: ['#7a2420', '🔴'], 3: ['#6a4a8a', '◆'], 4: ['#1a4d8a', '🔵'], 5: ['#1a5a8a', 'ℹ'], 6: ['#1d6a4a', '🏪'], 7: ['#555d6d', '➕'] };
  function menuBarih() {
    setTitle('🧺 Тэмдэг барих', '');
    const b = body(`<div class="lmenu"><p class="small">Дээрээс тэмдэг бууна. Сагсаа (хуруугаар/сумаар) зөөж, <b>зөв ангилалын</b> сагсанд бариарай. Багцаа сонго:</p>
      ${SETS.map(s => `<button class="lset" data-i="${s.id}"><b>${s.name}</b><span class="small">${s.groups.map(g => Deck.GROUP[g]).join(' · ')}</span></button>`).join('')}
      <button class="lset" data-i="x"><b>🎲 Санамсаргүй 3 ангилал</b><span class="small">Таны сул тэмдгүүдээс түрүүлнэ</span></button></div>`);
    b.querySelectorAll('.lset').forEach(el => el.onclick = () => startBarih(el.dataset.i));
  }
  function startBarih(setId) {
    stop();
    const set = setId === 'x' ? { groups: shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 3) } : SETS.find(s => s.id === setId);
    const groups = set.groups, W = 360, H = 560, LANE_Y = 470;
    body(`<div class="lgame"><div class="lhud"><span id="lHearts" class="hearts">❤❤❤</span><b id="lScore">0</b><span id="lCombo" class="chip">×1</span></div><canvas id="lcv" width="${W * 2}" height="${H * 2}" style="width:${W}px;height:${H}px"></canvas></div>`);
    const cv = $('lcv'), g = cv.getContext('2d'); g.scale(2, 2);
    const total = 24, queue = pick(total, s => groups.includes(s.group)); const missed = [];
    let falling = [], lane = 1, lives = 3, score = 0, combo = 1, spawned = 0, done = 0, t = 0, nextSpawn = .6, pops = [], over = false;
    const imgCache = {};
    const sgImg = code => imgCache[code] || (imgCache[code] = signCanvas(code, 56));
    const setLane = x => { lane = Math.max(0, Math.min(2, Math.floor(x / (W / 3)))); };
    const pointer = e => { const r = cv.getBoundingClientRect(); setLane((e.clientX - r.left) / r.width * W); e.preventDefault(); };
    cv.addEventListener('pointerdown', pointer); cv.addEventListener('pointermove', pointer);
    const key = e => { if (e.key === 'ArrowLeft' || e.key === 'a') lane = Math.max(0, lane - 1); else if (e.key === 'ArrowRight' || e.key === 'd') lane = Math.min(2, lane + 1); else if (/^[1-3]$/.test(e.key)) lane = +e.key - 1; };
    window.addEventListener('keydown', key); cleanup = () => window.removeEventListener('keydown', key);
    const finish = () => { over = true; const ok = done - missed.length; resultScreen({ title: lives > 0 ? '🏁 Тоглолт дууслаа' : '💔 Амь дууслаа', big: '🧺', line: `Оноо <b>${score}</b> · зөв <b>${ok} / ${done}</b>`, missed, again: () => startBarih(setId) }); S.best.barih = Math.max(S.best.barih || 0, score); persist(); };
    function judge(f) {
      done++; const ok = Deck.byCode(f.code).group === groups[lane];
      record(f.code, ok, 'barih');
      if (ok) { combo = Math.min(5, combo + 1); score += 10 * combo; pops.push({ x: f.x, y: LANE_Y - 10, t: 0, txt: '+' + 10 * combo, c: '#4cd964' }); api.sound('star'); }
      else { lives--; combo = 1; missed.push({ code: f.code, extra: `Зөв сагс: ${Deck.GROUP[Deck.byCode(f.code).group]}. ${Deck.meaning(f.code)}` }); pops.push({ x: f.x, y: LANE_Y - 10, t: 0, txt: '✖', c: '#ff5a4d' }); api.sound('thud'); }
      $('lHearts').textContent = '❤'.repeat(Math.max(0, lives)) + '♡'.repeat(3 - Math.max(0, lives)); $('lScore').textContent = score; $('lCombo').textContent = '×' + combo;
      if (lives <= 0 || done >= total) setTimeout(() => { if (current === 'barih') finish(); }, 450);
    }
    current = 'barih'; let last = performance.now();
    const loop = now => {
      if (current !== 'barih') return; raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - last) / 1000); last = now; if (over) return; t += dt;
      const speed = 44;   // нэг хэвийн, удаан хурд (px/сек)
      if (spawned < total && lives > 0) { nextSpawn -= dt; if (nextSpawn <= 0) { const s = queue[spawned++]; falling.push({ code: s.code, x: 40 + Math.random() * (W - 80), y: -30, ph: Math.random() * 6 }); nextSpawn = 2.4; } }
      for (const f of falling) { f.y += speed * dt; f.x += Math.sin(t * 2 + f.ph) * 10 * dt; }
      for (const f of falling) if (!f.done && f.y >= LANE_Y) { f.done = true; judge(f); }
      falling = falling.filter(f => f.y < LANE_Y + 8); pops.forEach(p => p.t += dt); pops = pops.filter(p => p.t < .8);
      // зураг
      g.clearRect(0, 0, W, H); const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#233654'); bg.addColorStop(1, '#18263c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 1; i < 3; i++) g.fillRect(i * W / 3 - 1, 0, 2, LANE_Y);
      for (const f of falling) { g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 12; g.drawImage(sgImg(f.code), f.x - 32, f.y - 32, 64, 64); g.restore(); }
      groups.forEach((gr, i) => { const x = i * W / 3 + 6, w = W / 3 - 12, on = lane === i; g.save(); if (on) { g.translate(0, -8); g.shadowColor = 'rgba(255,210,63,.55)'; g.shadowBlur = 16; } g.fillStyle = BCOL[gr][0]; g.beginPath(); g.moveTo(x, LANE_Y + 4); g.lineTo(x + w, LANE_Y + 4); g.lineTo(x + w - 10, LANE_Y + 74); g.quadraticCurveTo(x + w / 2, LANE_Y + 84, x + 10, LANE_Y + 74); g.closePath(); g.fill(); g.lineWidth = on ? 4 : 2; g.strokeStyle = on ? '#ffd23f' : 'rgba(255,255,255,.3)'; g.stroke(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '22px system-ui'; g.fillText(BCOL[gr][1], x + w / 2, LANE_Y + 34); g.font = 'bold 12px system-ui'; g.fillText(Deck.GROUP[gr], x + w / 2, LANE_Y + 56); g.restore(); });
      pops.forEach(p => { g.globalAlpha = 1 - p.t / .8; g.fillStyle = p.c; g.font = 'bold 20px system-ui'; g.textAlign = 'center'; g.fillText(p.txt, p.x, p.y - p.t * 40); }); g.globalAlpha = 1;
    };
    Learn.dbgB = () => ({ falling: falling.map(f => ({ code: f.code, y: f.y })), groups, lane, lives, score, done, spawned });
    raf = requestAnimationFrame(loop);
    setTitle('🧺 Тэмдэг барих', groups.map(x => Deck.GROUP[x]).join(' · '));
  }

  // =============== 4. ТЭМДЭГ АНГУУЧИН (замд) ===============
  function startAnguuchin() {
    stop();
    const W = 360, H = Math.max(420, Math.min(600, window.innerHeight - 270)), N = 12, list = pick(N, null), CAR_Y = H - 96, T0 = 9.5;
    const V = (CAR_Y - 20) / T0;
    let lives = 3, score = 0, answeredN = 0, spawned = 0, nextSpawn = .4, flash = 0, roadY = 0, carMode = 'go', finished = false, doneT = 0;
    const missed = [], stream = []; let act = null, tAct = 0;
    setTitle('🚗 Тэмдэг ангуучин', '');
    const b = body(`<div class="lgame"><div class="lhud"><span id="lHearts" class="hearts">❤❤❤</span><b id="lScore">0</b><span class="chip" id="lT">⏱</span></div>
      <canvas id="acv" width="${W * 2}" height="${H * 2}" style="width:${W}px;height:${H}px;border-radius:14px"></canvas><div class="bar"><i id="abar" style="width:100%"></i></div><div class="small" id="aq" style="text-align:center"></div><div class="acts" id="aacts"></div><div id="afb" class="qfb"></div></div>`);
    const cv = $('acv'), g = cv.getContext('2d'); g.scale(2, 2);
    current = 'anguuchin'; let last = performance.now();
    const hearts = () => { $('lHearts').textContent = '❤'.repeat(Math.max(0, lives)) + '♡'.repeat(3 - Math.max(0, lives)); };
    function activate(item) {
      act = item; tAct = 0; const holder = $('aacts');
      if (!item) { holder.innerHTML = ''; $('aq').textContent = spawned < N ? 'Дараагийн тэмдэг ойртож байна…' : ''; $('lT').textContent = '⏱'; return; }
      const s = item.s, nm = new Set([s.name]), opts = [s];
      for (const x of shuffle(Deck.all().filter(y => y.group === s.group))) { if (opts.length >= 4) break; if (!nm.has(x.name)) { nm.add(x.name); opts.push(x); } }
      while (opts.length < 4) { const x = pick(1, null, nm)[0]; if (!x) break; nm.add(x.name); opts.push(x); }
      holder.innerHTML = shuffle(opts).map(o => `<button class="act" data-n="${esc(o.name)}">${esc(o.name)}</button>`).join('');
      $('aq').textContent = item.main ? 'Нэмэлт (доорх) тэмдгийн зөв нэрийг сонго' : 'Хажуугаар өнгөрч буй тэмдгийн зөв нэрийг сонго';
      holder.querySelectorAll('.act').forEach(el => { el.onclick = () => answer(el.dataset.n, el); });
    }
    const nextActive = () => stream.find(x => !x.done);
    function mark(item, ok) { item.done = true; item.ok = ok; item.k = 3.2; answeredN++; }
    function answer(name, el) {
      if (!act) return; const item = act, s = item.s, ok = name === s.name; record(s.code, ok, 'anguuchin'); mark(item, ok);
      document.querySelectorAll('#aacts .act').forEach(x => { x.disabled = true; if (x.dataset.n === s.name) x.classList.add('right'); else if (x === el) x.classList.add('wrong'); });
      if (ok) { score += Math.round(60 + 40 * (1 - item.y / CAR_Y)); api.sound('star'); } else { lives--; flash = 1; missed.push({ code: s.code, extra: `Зөв нэр: «${s.name}». ${Deck.meaning(s.code)}` }); api.sound('crash'); }
      $('lScore').textContent = score; hearts();
      $('afb').innerHTML = `<b class="${ok ? 'good' : 'bad'}">${ok ? '✅ Зөв!' : '✖ Буруу.'}</b> <b>${esc(s.code.split('@')[0])} «${esc(s.name)}»</b>${item.main ? ' (нэмэлт тэмдэг; ' + esc(item.main) + ' «' + esc(Deck.byCode(item.main).name) + '» тэмдэгтэй хамт)' : ''} — ${esc(Deck.meaning(s.code))}`;
      const cur = act; act = null;
      setTimeout(() => { if (current === 'anguuchin' && !act && cur && lives > 0) activate(nextActive() || null); }, ok ? 450 : 1300);
    }
    function missIt(item) {
      const s = item.s; record(s.code, false, 'anguuchin'); mark(item, false); lives--; flash = 1; api.sound('crash'); hearts();
      missed.push({ code: s.code, extra: `Хугацаа дууслаа. Зөв нэр: «${s.name}». ${Deck.meaning(s.code)}` });
      document.querySelectorAll('#aacts .act').forEach(x => { x.disabled = true; if (x.dataset.n === s.name) x.classList.add('right'); });
      $('afb').innerHTML = `<b class="bad">⏱ Өнгөрчихлөө.</b> <b>${esc(s.code.split('@')[0])} «${esc(s.name)}»</b> — ${esc(Deck.meaning(s.code))}`;
      const was = act === item; if (was) act = null;
      setTimeout(() => { if (current === 'anguuchin' && !act && lives > 0) activate(nextActive() || null); }, 1200);
    }
    const finish = () => { finished = true; S.best.anguuchin = Math.max(S.best.anguuchin || 0, score); persist(); resultScreen({ title: lives > 0 ? '🏁 Зам дуусав' : '💥 Амь дууслаа', big: '🚗', line: `Оноо <b>${score}</b> · зөв <b>${answeredN - missed.length} / ${answeredN}</b>`, missed, again: startAnguuchin }); };
    Learn.dbg = () => ({ phase: act ? 'approach' : 'idle', qi: answeredN, t: tAct, T: T0, lives, score, cur: act && act.s.code, main: act && act.main, n: stream.length });
    const loop = now => {
      if (current !== 'anguuchin') return; raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - last) / 1000); last = now; if (finished) return;
      const live = lives > 0;
      if (live && spawned < N) { nextSpawn -= dt; const lastY = stream.length ? stream[stream.length - 1].y : 1e9; if (nextSpawn <= 0 && (!stream.length || lastY > H + 60)) { const s = list[spawned]; const m = mainFor(s.code); stream.push({ s, main: m, y: -50, side: 1, k: 1, small: compCanvas(s.code, m, 64, null), done: false, ok: null }); spawned++; nextSpawn = .5; if (!act) activate(nextActive()); } }
      for (const it of stream) it.y += V * (it.k || 1) * dt;
      if (act) { tAct += dt; const left = Math.max(0, (CAR_Y - act.y) / V); $('abar').style.width = (left / T0 * 100) + '%'; $('lT').textContent = '⏱ ' + left.toFixed(1); if (act.y >= CAR_Y) missIt(act); }
      for (const it of stream) if (!it.done && it !== act && it.y >= CAR_Y) { record(it.s.code, false, 'anguuchin'); mark(it, false); lives--; flash = 1; api.sound('crash'); hearts(); missed.push({ code: it.s.code, extra: `Өнгөрчихлөө. Зөв нэр: «${it.s.name}». ${Deck.meaning(it.s.code)}` }); }
      carMode = flash > .5 ? 'crash' : 'go'; flash = Math.max(0, flash - dt * 1.6);
      roadY = (roadY + V * dt) % 80;
      const ending = (lives <= 0 && !act) || (spawned >= N && stream.every(x => x.done) && !act);
      if (ending) { doneT += dt; if (doneT > 1.4) return finish(); } else doneT = 0;
      // зураг
      g.clearRect(0, 0, W, H); g.fillStyle = '#3d7a37'; g.fillRect(0, 0, W, H); g.fillStyle = '#c9b79a'; g.fillRect(W / 2 - 112, 0, 224, H); g.fillStyle = '#4a4d54'; g.fillRect(W / 2 - 100, 0, 200, H);
      g.fillStyle = '#f1f1f1'; g.fillRect(W / 2 - 96, 0, 3, H); g.fillRect(W / 2 + 93, 0, 3, H); for (let y = -80 + roadY; y < H; y += 80) g.fillRect(W / 2 - 2, y, 4, 40);
      for (const it of stream) { if (it.y > H + 60) continue; const sx = W / 2 + it.side * 146, sz = 74;
        g.fillStyle = '#7d8590'; g.fillRect(sx - 2, it.y, 4, sz * .75);
        if (it === act) { g.fillStyle = 'rgba(255,210,63,.28)'; g.beginPath(); g.arc(sx, it.y, sz * .62, 0, 7); g.fill(); }
        if (it.done) { g.globalAlpha = .55; } g.drawImage(it.small, sx - sz / 2, it.y - sz / 2, sz, sz); g.globalAlpha = 1;
        if (it.done) { g.font = '22px system-ui'; g.textAlign = 'center'; g.fillText(it.ok ? '✅' : '❌', sx, it.y - sz / 2 - 4); } }
      g.save(); g.translate(W / 2 + 46, CAR_Y); if (carMode === 'crash') g.rotate(.25); drawCarTo(g); g.restore();
      if (flash > 0) { g.fillStyle = `rgba(255,70,50,${flash * .3})`; g.fillRect(0, 0, W, H); }
    };
    function drawCarTo(c) {
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-15, -30, 36, 70); c.fillStyle = '#2f6fe0'; c.beginPath(); if (c.roundRect) c.roundRect(-18, -34, 36, 68, 9); else c.rect(-18, -34, 36, 68); c.fill(); c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.stroke();
      c.fillStyle = '#243447'; c.fillRect(-13, -22, 26, 14); c.fillRect(-13, 12, 26, 12); c.fillStyle = '#fff6b0'; c.fillRect(-15, -34, 6, 4); c.fillRect(9, -34, 6, 4); c.fillStyle = '#a02020'; c.fillRect(-15, 31, 6, 3); c.fillRect(9, 31, 6, 3);
    }
    activate(null); raf = requestAnimationFrame(loop);
  }

  // =============== ЦОМОГ ===============
  function startCollection() {
    stop(); setTitle('📖 Тэмдгийн цомог', ''); let grp = 0;
    const draw = () => {
      const tot = totals(), all = Deck.all().filter(s => !grp || s.group === grp);
      const b = body(`<div class="lcol"><div class="lprog" style="text-align:center">Нээгдсэн <b>${tot.got} / ${tot.n}</b> · ★★★ эзэмшсэн <b>${tot.gold}</b></div><div class="bar"><i style="width:${tot.got / tot.n * 100}%"></i></div>
        <div class="pills">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<button class="${grp === i ? 'on' : ''}" data-g="${i}">${i ? i + '. ' + Deck.GROUP[i] : 'Бүгд'}</button>`).join('')}</div>
        <div class="cgrid">${all.map(s => `<div class="ccard ${stars(s.code) === 0 ? 'lock' : ''} ${stars(s.code) === 3 ? 'gold' : ''}" data-c="${esc(s.code)}"><span class="cs"></span><div class="cc">${esc(s.code)}</div><div class="st">${stars(s.code) ? '★'.repeat(stars(s.code)) + '☆'.repeat(3 - stars(s.code)) : '?'}</div></div>`).join('')}</div><div id="cdet" class="cdet"></div></div>`);
      b.querySelectorAll('.pills button').forEach(el => el.onclick = () => { grp = +el.dataset.g; draw(); });
      b.querySelectorAll('.ccard').forEach(el => { el.querySelector('.cs').appendChild(signCanvas(el.dataset.c, 64)); el.onclick = () => { const c = el.dataset.c, s = Deck.byCode(c), e = S.signs[c]; $('cdet').innerHTML = `<b>${esc(c.split('@')[0])} «${esc(s.name)}»</b> <span class="small">· ${Deck.GROUP[s.group]} тэмдэг</span><br>${esc(Deck.meaning(c))}<br><span class="small">${e ? `Хариулт: ${e.n} · алдсан ${e.w}` : 'Хараахан тоглоогүй'}</span>`; }; });
    };
    draw();
  }

  // ---------- нийтлэг цэс ----------
  const GAMES = { barih: menuBarih, anguuchin: startAnguuchin, cumg: startCollection };
  function start(game, a) { api = a; stop(); const [g, arg] = game.split(':'); if (g === 'barih' && arg) return startBarih(arg); (GAMES[g] || startCollection)(); }
  return { start, stop, totals, mastery, stars, record, _t: { mainFor, compCanvas, S: () => S, pick, record, stars, mastery } };
})();
