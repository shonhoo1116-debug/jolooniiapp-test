'use strict';
// «Замын инженер»: тэмдгийг замын зураг дээр өөрөө байрлуулж, машин тэдгээрийн дагуу явдгийг шалгана.
// Зураг, машины дүрслэл нь engine.js-ийн drawBase/drawCar/postSign-ийг ашиглана (түр ctx-ийг сольж).

// ---------- даалгаврууд ----------
const SCENES = [
  {
    id: 'x1', name: 'Уулзвар: гол зам ба туслах зам', rule: '1-р хавсралт · 3',
    hint: 'Босоо зам нь <b>гол зам</b>, хөндлөн зам нь <b>туслах зам</b>. Дөрвөн талаас нэг дор машин ирнэ. Тэмдгээ сонгоод замын хажуугийн цэгүүдэд тавь, дараа нь «Явуул» дар.',
    palette: ['3.1', '3.2', '3.4', '3.5', '2.1', '2.2', '2.27', '5.19.а'],
    // approach: S (урдаас, хойд зүг рүү), N, W, E; main: гол замын хөдөлгөөн эсэх
    approaches: { S: { main: true }, N: { main: true }, W: { main: false }, E: { main: false } },
  },
  {
    id: 'x2', name: 'Зогсолттой уулзвар', rule: '1-р хавсралт · 3.1, 3.5',
    hint: 'Туслах замаас гарахдаа жолооч <b>заавал бүрэн зогсох</b> ёстой уулзвар. Гол замд <b>3.1</b>, туслах замд <b>3.5 «Зогсохгүй явах хориотой»</b> тавь.',
    palette: ['3.1', '3.2', '3.4', '3.5', '2.1', '2.27'],
    approaches: { S: { main: true }, N: { main: true }, W: { main: false }, E: { main: false } },
    grade: (pl, cars) => [[cars.filter(c => c.k === 'W' || c.k === 'E').every(c => c.waited), 'Туслах замын машин бүрэн зогсоод гарлаа'], [['S', 'N'].every(k => pl[k] === '3.1') && ['W', 'E'].every(k => pl[k] === '3.5'), 'Бүрэн, зөв тэмдэглэгээ: гол замд 3.1, туслах замд 3.5 (хоёр талд нь)']],
  },
  {
    id: 'x3', name: 'Тэнцүү замын уулзвар', rule: 'Дүрмийн 15.8',
    hint: 'Гурван тэнцүү зам огтлолцоно, тэмдэг байхгүй. Ийм уулзварт <b>баруун гараас ирж буй машинд зам тавьдаг</b> (15.8). Тэмдэг тавилгүй <b>«Явуул»</b> дарж шалга.',
    palette: ['3.1', '3.4', '3.5', '2.27'], allowEmpty: true,
    approaches: { S: { main: false }, W: { main: false }, E: { main: false } },
    grade: (pl, cars) => [[cars.some(c => c.waited), 'Баруун гар талын машинд зам тавьж өгсөн машин байна'], [!Object.keys(pl).length, 'Нэмэлт тэмдэггүйгээр, баруун гарын дүрмээр шийдлээ (15.8)']],
  },
  {
    id: 'x4', name: 'Засварын зам', rule: '1-р хавсралт · 2.1 · 3.1, 3.4',
    hint: 'Зүүн зам засварт орж байна: <b>2.1 «Нэвтрэхийг хориглосон»</b> тавиад хаа. Бусад гурван замд гол/туслах замын тэмдгээ тавь.',
    palette: ['3.1', '3.4', '3.5', '2.1', '2.2', '2.27'], closed: ['E'],
    approaches: { S: { main: true }, N: { main: true }, W: { main: false }, E: { main: false } },
    grade: (pl, cars) => [[['2.1', '2.2'].includes(pl.E), 'Засварын замыг хориглох тэмдгээр хаалаа'], [['S', 'N'].every(k => pl[k] === '3.1') && pl.W === '3.4', 'Гол замд 3.1, баруун туслах замд 3.4 тавилаа']],
  },
  {
    id: 'x5', name: 'Хамгийн цөөн тэмдэг', rule: '1-р хавсралт · 3.4 · дүрмийн 15.9',
    hint: 'Гол зам (босоо) ба нэг туслах зам (баруун) уулзана. Мөргөлдөөнгүй, <b>хамгийн цөөн тэмдгээр</b> шийд — яг аль нэг тэмдэг л хангалттай.',
    palette: ['3.1', '3.2', '3.4', '3.5', '2.27'],
    approaches: { S: { main: true }, N: { main: true }, W: { main: false } },
    grade: (pl, cars) => [[!cars.some(c => scene_main(c) && c.waited), 'Гол замын машин зогссонгүй'], [Object.keys(pl).length === 1 && (pl.W === '3.4' || pl.W === '3.5'), 'Ганцхан тэмдэг: туслах замд 3.4 (эсвэл 3.5)']],
  },
];
const scene_main = c => c.k === 'S' || c.k === 'N';

const Builder = (() => {
  const W = 900, H = 640, V = 130;
  // approach бүрийн геометр: эхлэл цэг, чиг, зогсох шугам (line), уулзварт орох (entry) ба гарах (exit) байрлал, тэмдгийн цэг
  const GEO = {
    S: { name: 'Өмнөд', start: [490, 600], dir: [0, -1], a: -Math.PI / 2, slot: [548, 470], line: 455 },
    N: { name: 'Хойд', start: [410, 40], dir: [0, 1], a: Math.PI / 2, slot: [352, 170], line: 185 },
    W: { name: 'Баруун', start: [170, 360], dir: [1, 0], a: 0, slot: [305, 428], line: 315 },
    E: { name: 'Зүүн', start: [730, 280], dir: [-1, 0], a: Math.PI, slot: [595, 212], line: 585 },
  };
  for (const g of Object.values(GEO)) {
    const [dx, dy] = g.dir;
    g.lineP = g.line * (dx + dy);                     // чиглэлийн дагуух (projected) байрлал
    g.entryP = g.lineP + 55; g.exitP = g.entryP + 160;   // машины төв зогсох шугамд, урд нь уулзвараас 20px зайтай
    g.right = [-dy, dx];                              // баруун гар тийш (дэлгэцийн координатад)
  }
  const BLOCK = ['2.1', '2.2'];
  const COLORS = { S: '#e6b422', N: '#7a4bd6', W: '#2aa198', E: '#d8402f' };
  const rankOf = code => code === '3.1' ? 2 : (code === '3.4' || code === '3.5') ? 0 : 1;
  const proj = (c, g) => c.x * g.dir[0] + c.y * g.dir[1];

  let cv, ctx0, scene, api, placed, sel, cars, sim, raf = 0, active = false, last = 0, t = 0, firstTry = true;
  const $ = id => document.getElementById(id);

  function start(sc, a) {
    scene = sc; api = a; placed = {}; sel = null; sim = null; firstTry = true;
    cv = $('bcv'); ctx0 = cv.getContext('2d');
    $('bTitle').textContent = sc.name;
    $('bHint').innerHTML = sc.hint;
    buildPalette(); resetCars(); resize(); updateInfo();
    active = true; cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop);
  }
  function stop() { active = false; cancelAnimationFrame(raf); }

  function resetCars() {
    cars = Object.keys(scene.approaches).map(k => { const g = GEO[k];
      return { k, x: g.start[0], y: g.start[1], a: g.a, v: V, state: 'approach', color: COLORS[k], wait: 0, waited: false, stopT: 0, done: false }; });
  }

  // ---------- палитр ----------
  function buildPalette() {
    const box = $('bPal'); box.innerHTML = '';
    scene.palette.forEach(code => {
      const b = document.createElement('button'); b.className = 'ptile'; b.dataset.code = code;
      const c = document.createElement('canvas'); c.width = c.height = 96;
      const g = c.getContext('2d'); g.fillStyle = '#e9edf2'; g.fillRect(0, 0, 96, 96); SG.drawSign(g, code, 48, 48, 84);
      b.appendChild(c); b.insertAdjacentHTML('beforeend', `<span>${code}</span>`);
      b.onclick = () => { if (sim) return; sel = sel === code ? null : code; updateInfo(); };
      box.appendChild(b);
    });
  }
  function updateInfo() {
    document.querySelectorAll('#bPal .ptile').forEach(b => b.classList.toggle('sel', b.dataset.code === sel));
    const el = $('bInfo');
    if (!sel) { el.innerHTML = Object.keys(placed).length ? 'Тэмдэг дээр дарвал авна. Бэлэн бол <b>Явуул</b> дар.' : 'Эхлээд доороос тэмдгээ сонго, дараа нь замын хажуугийн <b>+</b> цэг дээр дар.'; return; }
    const base = SIGNS.find(s => s.code === sel), inf = (typeof SIGN_INFO !== 'undefined' && SIGN_INFO[sel]) || {};
    el.innerHTML = `<b>${sel} «${base ? base.name : ''}»</b>${inf.d ? ' — ' + inf.d.charAt(0).toUpperCase() + inf.d.slice(1) : ''}`;
  }

  // ---------- дүрмийн логик ----------
  const signOf = k => placed[k] || null;
  const blocked = c => BLOCK.includes(signOf(c.k));
  const rank = c => rankOf(signOf(c.k));
  const entryTime = (d) => { const g = GEO[d.k], p = proj(d, g); return (g.entryP - p) / V; };
  const inBox = d => { const g = GEO[d.k], p = proj(d, g); return p > g.entryP - 6 && p < g.exitP + 40; };
  const passed = d => proj(d, GEO[d.k]) >= GEO[d.k].exitP + 40;
  // c нь d-д зам тавьж өгөх ёстой юу?
  function mustYield(c, d) {
    if (d === c || d.done || passed(d) || blocked(d)) return false;
    const gc = GEO[c.k], gd = GEO[d.k];
    if (gc.dir[0] * gd.dir[0] + gc.dir[1] * gd.dir[1] !== 0) return false;      // эсрэг/ижил чиг: давхцахгүй
    const relevant = inBox(d) || entryTime(d) < 3.2;
    if (!relevant) return false;
    if (inBox(d)) return rank(c) < 2;                                           // уулзварт орчихсон машиныг гол замын ч гэсэн хүлээнэ (2-оос бусад нь)
    const rc = rank(c), rd = rank(d);
    if (rd > rc) return true;
    if (rd < rc) return false;
    return gd.dir[0] === gc.right[0] * -1 && gd.dir[1] === gc.right[1] * -1;    // тэнцүү бол баруун гар талын машин давуутай
  }
  function simStep(dt) {
    t += dt;
    for (const c of cars) {
      if (c.done) continue;
      const g = GEO[c.k], p = proj(c, g), rem = g.lineP - p;   // зогсох шугам хүртэл
      let vt = V;
      if (rem > -2) {                                          // шугамаас өмнө
        const bk = Math.sqrt(2 * 260 * Math.max(0, rem));      // тоормослох хурд
        let hold = blocked(c);
        if (!hold && rank(c) < 2) hold = cars.some(d => mustYield(c, d));
        const needStop = signOf(c.k) === '3.5' && c.stopT < 1.0;
        if (hold || needStop) vt = Math.min(V, bk);
        if (rem < 8 && c.v < 6) { c.waited = true; if (!hold) c.stopT += dt; c.wait += dt; } else c.wait = 0;
        if (rem < 8 && c.v < 6 && !hold && needStop) { /* 3.5: бүрэн зогсолт тоологдож байна */ }
        if (!hold && !needStop) { /* чөлөөтэй */ }
      }
      const acc = vt > c.v ? 220 : 520;
      c.v += Math.sign(vt - c.v) * Math.min(Math.abs(vt - c.v), acc * dt);
      c.x += g.dir[0] * c.v * dt; c.y += g.dir[1] * c.v * dt;
      if (c.x < -140 || c.x > W + 140 || c.y < -140 || c.y > H + 140) c.done = true;
    }
    // мөргөлдөөн
    for (let i = 0; i < cars.length; i++) for (let j = i + 1; j < cars.length; j++) {
      const a = cars[i], b = cars[j]; if (a.done || b.done) continue;
      if (carsHit(a, b)) { endSim('crash', [a, b]); return; }
    }
    // түгжрэл: бүгд зогсож, 3.5 цаг үгүй
    const live = cars.filter(c => !c.done && !blocked(c));
    if (live.length && live.every(c => c.v < 6 && c.wait > 3.5)) { endSim('lock'); return; }
    if (cars.every(c => c.done || blocked(c))) endSim('ok');
  }

  function endSim(kind, who) {
    sim.over = kind; sim.who = who; api.sound(kind === 'ok' ? 'win' : 'crash');
    const label = k => GEO[k].name;
    const lines = Object.keys(scene.approaches).map(k => `<li>${label(k)} (${scene.approaches[k].main ? 'гол зам' : 'туслах зам'}): ${signOf(k) ? signOf(k) + ' «' + (SIGNS.find(s => s.code === signOf(k)) || {}).name + '»' : 'тэмдэггүй'}</li>`).join('');
    const closed = scene.closed || [];
    const blockedK = Object.keys(scene.approaches).filter(k => BLOCK.includes(signOf(k)) && !closed.includes(k));
    const openK = closed.filter(k => !BLOCK.includes(signOf(k)));
    if (kind === 'crash') {
      const names = who.map(c => label(c.k)).join(' ба ');
      setTimeout(() => api.dialog({ cls: 'bad', title: '💥 Мөргөлдлөө', rule: scene.rule,
        html: `<p><b>${names}</b> зүгийн машин уулзварт мөргөлдлөө.</p><p>Аль нь ч зам тавьж өгөх тэмдэггүй, эсвэл хоёулаа давуу эрхтэй гэж тэмдэглэгдсэн байна. Туслах замд <b>3.4 «Зам тавьж өгнө»</b> (эсвэл 3.5), гол замд <b>3.1 «Гол зам»</b> тавьбал хэн нь зам тавихыг тодорхой болгоно (дүрмийн 15.9; 1-р хавсралтын 3.1, 3.4, 3.5).</p><ul class="crit">${lines}</ul>`,
        buttons: [{ label: 'Дахин оролдох', fn: reset }, { label: 'Буцах', ghost: true, fn: api.back }] }), 700);
    } else if (kind === 'lock') {
      setTimeout(() => api.dialog({ cls: 'bad', title: '🚧 Түгжрэл', rule: scene.rule,
        html: `<p>Бүх машин бие биенээ хүлээгээд зогсчихлоо. Тэмдэггүй уулзварт <b>баруун гар талын машин</b> давуутай (баруун гараас ирж байгаа машинд зам тавьна, дүрмийн 15.8), гэтэл дөрвөн талаас нэг дор ирвэл хэн ч явж чадахгүй.</p><p>Туслах замд <b>3.4</b>, гол замд <b>3.1</b> тавьж, хэн давуутайг тодорхойл.</p><ul class="crit">${lines}</ul>`,
        buttons: [{ label: 'Дахин оролдох', fn: reset }, { label: 'Буцах', ghost: true, fn: api.back }] }), 500);
    } else if (blockedK.length) {
      setTimeout(() => api.dialog({ cls: 'bad', title: '⛔ Зам хаагдлаа', rule: scene.rule,
        html: `<p><b>${blockedK.map(label).join(', ')}</b> зүгт хориглох тэмдэг тавьсан тул тэр замаас машин орж чадсангүй. Энэ даалгаварт бүх зүгээс машин нэвтрэх ёстой.</p><ul class="crit">${lines}</ul>`,
        buttons: [{ label: 'Дахин оролдох', fn: reset }, { label: 'Буцах', ghost: true, fn: api.back }] }), 500);
    } else if (openK.length) {
      setTimeout(() => api.dialog({ cls: 'bad', title: '🚧 Зам хаагдаагүй', rule: scene.rule,
        html: `<p><b>${openK.map(label).join(', ')}</b> зам засварт орсон тул машин оруулж болохгүй. <b>2.1 «Нэвтрэхийг хориглосон»</b> тэмдэг тавьж хаа.</p><ul class="crit">${lines}</ul>`,
        buttons: [{ label: 'Дахин оролдох', fn: reset }, { label: 'Буцах', ghost: true, fn: api.back }] }), 500);
    } else if (scene.grade) {
      const gr = scene.grade(placed, cars), earned = [true].concat(gr.map(x => x[0])).slice(0, 3);
      api.stars(earned.filter(Boolean).length);
      setTimeout(() => api.dialog({ cls: 'good', title: '✅ Уулзвар зөв ажиллаж байна!', rule: scene.rule,
        html: `<div class="big-stars">${earned.map(e => `<span class="${e ? 'on' : ''}">★</span>`).join('')}</div><ul class="crit"><li class="ok">Мөргөлдөөнгүй нэвтэрлээ</li>${gr.map(x => `<li class="${x[0] ? 'ok' : 'no'}">${x[1]}</li>`).join('')}</ul><ul class="crit">${lines}</ul>`,
        buttons: [{ label: 'Дахин', fn: reset }, { label: 'Түвшнүүд', ghost: true, fn: api.back }] }), 600);
    } else {
      const mainWaited = cars.some(c => scene.approaches[c.k].main && c.waited);
      const full = ['S', 'N'].every(k => signOf(k) === '3.1') && ['W', 'E'].every(k => signOf(k) === '3.4');
      const earned = [true, !mainWaited, full];
      const stars = earned.filter(Boolean).length;
      api.stars(stars);
      setTimeout(() => api.dialog({ cls: 'good', title: '✅ Уулзвар зөв ажиллаж байна!', rule: scene.rule,
        html: `<div class="big-stars">${earned.map(e => `<span class="${e ? 'on' : ''}">★</span>`).join('')}</div><ul class="crit"><li class="ok">Мөргөлдөөнгүй нэвтэрлээ</li><li class="${earned[1] ? 'ok' : 'no'}">Гол замын машин зогссонгүй</li><li class="${earned[2] ? 'ok' : 'no'}">Бүрэн, зөв тэмдэглэгээ: гол замд 3.1, туслах замд 3.4 (хоёр талд нь)</li></ul><ul class="crit">${lines}</ul><p class="tips">Гол замын тэмдэг 3.1 нь давуу эрхийг тодорхой болгоно; туслах замын 3.4 «Зам тавьж өгнө» нь хөндлөн замаар явж буй машинд зам тавьж өгөхийг шаардана.</p>`,
        buttons: [{ label: 'Дахин', fn: reset }, { label: 'Түвшнүүд', ghost: true, fn: api.back }] }), 600);
    }
  }
  function reset() { api.close(); sim = null; t = 0; resetCars(); $('bGo').textContent = '▶ Явуул'; $('bGo').disabled = false; $('bClear').disabled = false; updateInfo(); }
  function go() {
    if (sim) return;
    if (!Object.keys(placed).length && !scene.allowEmpty) { $('bInfo').innerHTML = '<b>Эхлээд тэмдэг тавь.</b> Доороос тэмдэг сонгоод замын хажуугийн + цэг дээр дар.'; return; }
    sim = { over: null }; t = 0; resetCars(); sel = null; updateInfo();
    $('bGo').disabled = true; $('bClear').disabled = true;
  }
  function clearAll() { if (sim) return; placed = {}; sel = null; updateInfo(); }

  // ---------- дүрслэл ----------
  function draw() {
    const old = ctx; ctx = ctx0;
    const sc = cv.width / W; ctx.setTransform(sc, 0, 0, sc, 0, 0);
    drawBase(true);
    // 1.11-ийн оронд: зогсох шугамуудыг хөнгөн тэмдэглэнэ
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(450, 410); ctx.lineTo(530, 410); ctx.moveTo(370, 230); ctx.lineTo(450, 230); ctx.moveTo(360, 320); ctx.lineTo(360, 400); ctx.moveTo(540, 240); ctx.lineTo(540, 320); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = 'bold 17px system-ui'; ctx.textAlign = 'left';
    if (!scene.allowEmpty) [['↕ ГОЛ ЗАМ', 40, 40, '#ffd23f'], ['↔ ТУСЛАХ ЗАМ', 40, 612, '#9fd0ff']].forEach(([t, x, y, col]) => { const w = ctx.measureText(t).width + 20; ctx.fillStyle = 'rgba(10,16,26,.7)'; roundRect(x - 10, y - 21, w, 32, 8); ctx.fill(); ctx.fillStyle = col; ctx.fillText(t, x, y); });
    // тэмдгийн цэгүүд
    for (const k of Object.keys(scene.approaches)) {
      const [x, y] = GEO[k].slot, code = placed[k];
      if (code) postSign(code, x, y, 54);
      else { ctx.strokeStyle = sel ? '#ffd23f' : 'rgba(255,255,255,.6)'; ctx.lineWidth = 3; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.arc(x, y, 30, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = sel ? '#ffd23f' : 'rgba(255,255,255,.8)'; ctx.font = 'bold 34px system-ui'; ctx.textAlign = 'center'; ctx.fillText('+', x, y + 12); }
    }
    for (const c of cars) if (!c.done) drawCar(c.x, c.y, c.a, c.color);
    if (sim && sim.over === 'crash') { const [a, b] = sim.who; ctx.font = '64px system-ui'; ctx.textAlign = 'center'; ctx.fillText('💥', (a.x + b.x) / 2, (a.y + b.y) / 2 + 22); }
    ctx = old;
  }
  function loop(now) {
    if (!active) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (sim && !sim.over) simStep(dt);
    draw();
  }

  // ---------- товшилт ----------
  function pointer(e) {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
    if (sim) return;
    for (const k of Object.keys(scene.approaches)) {
      const [sx, sy] = GEO[k].slot;
      if (Math.hypot(x - sx, y - sy) < 46) {
        if (sel) { placed[k] = sel; api.sound('tick'); }
        else if (placed[k]) { delete placed[k]; api.sound('tick'); }
        updateInfo(); return;
      }
    }
  }
  function resize() {
    if (!cv) return;
    const wrap = $('bWrap'), vw = wrap.clientWidth, vh = wrap.clientHeight;
    const s = Math.min(vw / W, vh / H), cw = Math.max(200, Math.floor(W * s)), ch = Math.floor(H * s);
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5); cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  }
  window.addEventListener('resize', () => { if (active) resize(); });
  document.addEventListener('DOMContentLoaded', () => {
    $('bcv').addEventListener('pointerdown', pointer);
    $('bGo').onclick = go; $('bClear').onclick = clearAll;
  });
  // автомат шалгалт (дэлгэцгүй): placement -> үр дүн
  function test(pl, idx) {
    scene = SCENES[idx || 0]; api = { sound() {}, dialog() {}, close() {}, back() {}, stars() {} };
    placed = Object.assign({}, pl); sim = { over: null }; t = 0; resetCars();
    for (let i = 0; i < 3000 && !sim.over; i++) simStep(.02);
    const r = { over: sim.over, waited: cars.filter(c => c.waited).map(c => c.k).join('') };
    sim = null; return r;
  }
  // шалгах: index.html#b1full (тэмдэг тавьсан), #b1run (тавиад явуулсан)
  function demo(run) { placed = { S: '3.1', N: '3.1', W: '3.4', E: '3.4' }; updateInfo(); if (run) go(); }
  return { start, stop, resize, test, demo };
})();
