'use strict';
// Дэлгэцүүд (нүүр, түвшин, жолоодлого, шалгалт), удирдлага, од, хадгалалт.

(() => {
  const $ = id => document.getElementById(id);
  const SAVE_KEY = 'zam-tavi-v1';
  const OPEN_ALL = true;   // тест хувилбар: бүх түвшин нээлттэй
  const save = { stars: {}, sound: true, music: true };
  try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) {}
  if (Array.isArray(save.stars)) { const o = {}; save.stars.forEach((s, i) => { if (s) o['d' + i] = s; }); save.stars = o; }   // хуучин хадгалалт
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} };
  soundOn = save.sound; SFX.setEnabled(save.sound);

  // ---------- бүх түвшин/шалгалтын нэгдсэн жагсаалт ----------
  const SECTIONS = [
    { id: 'drive', title: '🚗 Жолоодлого', sub: 'Өөрөө жолоодож, дүрмийг мөрд' },
    { id: 'decide', title: '🧠 Дүрмийн шалгалт', sub: 'Дүрмийн заалтаас шийдвэр гаргах асуулт' },
    { id: 'signs', title: '🛑 Тэмдэг', sub: 'Замын тэмдгийг таних' },
    { id: 'learn', title: '🧠 Тэмдэг цээжлэх', sub: '2 тоглоом + цомог, бүх тэмдэг бүгдэд нь' },
    { id: 'build', title: '🛠 Замын инженер', sub: 'Тэмдгийг замын зураг дээр өөрөө байрлуул' },
  ];
  const items = () => [
    ...LEVELS.map((lv, i) => ({ kind: 'drive', idx: i, id: 'd' + i, name: lv.name, rule: lv.rule, section: 'drive' })),
    ...QUIZZES.map(q => ({ kind: 'quiz', quiz: q, id: q.id, name: q.name, rule: q.rule, section: q.section })),
    { kind: 'quiz', make: true, id: 'q-signs', name: 'Тэмдэг таних', rule: '1-р хавсралт', section: 'signs' },
    ...[['barih', '🧺 Тэмдэг барих', '3 сагс'], ['anguuchin', '🚗 Тэмдэг ангуучин', 'Замд, шууд үйлдэл'], ['cumg', '📖 Тэмдгийн цомог', 'Ахиц']].map(([game, name, rule]) => ({ kind: 'learn', game, id: 'l-' + game, name, rule, section: 'learn' })),
    ...(typeof SCENES !== 'undefined' ? SCENES : []).map(sc => ({ kind: 'build', scene: sc, id: 'b-' + sc.id, name: sc.name, rule: sc.rule, section: 'build' })),
  ];
  const starsOf = id => save.stars[id] || 0;
  const starItems = () => items().filter(it => it.kind !== 'learn' && it.kind !== 'endless');
  const totalStars = () => starItems().reduce((a, it) => a + starsOf(it.id), 0);
  const maxStars = () => starItems().length * 3;
  const setStars = (id, s) => { if (s > starsOf(id)) { save.stars[id] = s; persist(); } };

  let screen = 'home', runFails = 0, failTimer = 0, primary = null, quizState = null;

  // ---------- дэлгэц сэлгэх (Android-ын Буцах товч history-оор ажиллана) ----------
  function showScreen(name, push) {
    for (const s of document.querySelectorAll('.screen')) s.classList.toggle('on', s.id === name);
    screen = name; visible = name === 'game';
    SFX.musicDuck(name === 'game' ? .45 : 1);
    if (save.music && save.sound && (name === 'game' || name === 'builder')) SFX.music(true, 'music2'); else if (save.music && save.sound) SFX.music(true, 'music1');
    if (name !== 'game') { SFX.driveOff(); endless = null; }
    if (name !== 'builder') Builder.stop();
    if (name !== 'learn') Learn.stop();
    if (push) history.pushState({ s: name }, '');
    if (name === 'home') renderHome();
    if (name === 'map') renderMap();
    if (name === 'game') resize();
  }
  history.replaceState({ s: 'home' }, '');
  window.addEventListener('popstate', e => {
    const s = (e.state && e.state.s) || 'home';
    clearTimeout(failTimer); closeDialog();
    if (mode === 'play') mode = 'ready';
    quizState = null;
    showScreen(s, false);
  });
  const goBack = () => history.back();

  // ---------- нүүр ----------
  function renderHome() {
    $('homeStars').textContent = `⭐ ${totalStars()} / ${maxStars()}`;
    $('btnSound').textContent = save.sound ? '🔊 Дуу' : '🔇 Дуу';
    $('btnMusic').textContent = save.music ? '🎵 Хөгжим' : '🎵 Хөгжим унтарсан';
  }
  $('btnPlay').onclick = () => { sound('tick'); showScreen('map', true); };
  $('btnSound').onclick = () => { save.sound = soundOn = !save.sound; SFX.setEnabled(save.sound); persist(); renderHome(); sound('tick'); };
  $('btnMusic').onclick = () => { save.music = !save.music; persist(); SFX.music(save.music && save.sound); renderHome(); sound('tick'); };
  // хөтөч дууг анхны товшилт, товчлуураар л зөвшөөрдөг
  const wake = () => { if (!SFX.unlock()) return; if (save.music && save.sound && !wake.m) { wake.m = true; SFX.music(true); } };
  ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, wake));
  $('btnSigns').onclick = () => { location.href = 'signs.html'; };
  $('btnTests').onclick = () => { location.href = 'tests.html#chapters'; };

  // ---------- түвшнүүд ----------
  function renderMap() {
    $('mapStars').textContent = `⭐ ${totalStars()} / ${maxStars()}`;
    const grid = $('grid'); grid.innerHTML = '';
    let n = 0;
    for (const sec of SECTIONS) {
      const list = items().filter(it => it.section === sec.id);
      if (!list.length) continue;
      const h = document.createElement('div'); h.className = 'sec';
      h.innerHTML = `<b>${sec.title}</b><span>${sec.sub}</span>`; grid.appendChild(h);
      const row = document.createElement('div'); row.className = 'secgrid'; grid.appendChild(row);
      for (const it of list) {
        n++; const s = starsOf(it.id);
        const b = document.createElement('button'); b.className = 'lv' + (it.kind === 'quiz' ? ' quiz' : '');
        b.innerHTML = `<span class="st">${[1, 2, 3].map(k => k <= s ? '<b>★</b>' : '★').join('')}</span>` +
          `<div class="n">${it.kind === 'drive' ? 'Түвшин ' + (it.idx + 1) : it.kind === 'build' ? 'Даалгавар' : it.kind === 'endless' ? '♾ Дадлага' : it.kind === 'learn' ? 'Тоглоом' : 'Шалгалт'}</div><div class="t">${it.name}</div><span class="r">Дүрэм ${it.rule}</span>`;
        b.onclick = () => open(it);
        row.appendChild(b);
      }
    }
  }
  $('mapBack').onclick = goBack;
  function open(it) {
    if (it.kind === 'drive') { runFails = 0; showScreen('game', true); openLevel(it.idx); }
    else if (it.kind === 'endless') { runFails = 0; showScreen('game', true); beginEndless(); }
    else if (it.kind === 'learn') startLearn(it.game);
    else if (it.kind === 'build') startBuild(it);
    else startQuiz(it);
  }
  const learnApi = { back: () => goBack(), sound };
  function startLearn(game) { showScreen('learn', true); Learn.start(game, learnApi); }
  $('lBack').onclick = () => goBack();
  function startBuild(it) {
    showScreen('builder', true);
    Builder.start(it.scene, { dialog: openDialog, close: closeDialog, back: goBack, sound, stars: n => setStars(it.id, n) });
  }
  $('bBack').onclick = goBack;

  // ---------- харилцах цонх ----------
  function openDialog({ cls = '', title, rule, html, buttons }) {
    const d = $('dlg');
    d.innerHTML = `<div class="card ${cls}"><h3>${title}</h3>${rule ? `<span class="rule">Дүрэм ${rule}</span>` : ''}${html}<div class="btns"></div></div>`;
    const row = d.querySelector('.btns');
    buttons.forEach((bt, i) => {
      const b = document.createElement('button'); b.textContent = bt.label; if (bt.ghost) b.className = 'ghost';
      b.onclick = bt.fn; row.appendChild(b); if (i === 0) primary = bt.fn;
    });
    d.hidden = false;
    d.querySelectorAll('canvas.sigcv').forEach(cv => {   // түвшний тэмдгүүдийг зурна
      const c = cv.getContext('2d'); c.fillStyle = '#e9edf2'; c.fillRect(0, 0, cv.width, cv.height);
      SG.drawSign(c, cv.dataset.code, cv.width / 2, cv.height / 2, cv.width - 14);
    });
  }
  function closeDialog() { $('dlg').hidden = true; primary = null; }
  const signName = code => { const base = SIGNS.find(s => s.code === code.split('@')[0]); return base ? (code.includes('@') ? base.name + ' (' + code.split('@')[1] + ')' : base.name) : code; };
  const signRow = codes => !codes || !codes.length ? '' :
    '<div class="sigrow">' + codes.map(c => `<div class="sg"><canvas class="sigcv" width="80" height="80" data-code="${c}"></canvas><div><b>${c.split('@')[0]}</b><br>${signName(c)}</div></div>`).join('') + '</div>';

  // ---------- жолоодлогын түвшин ----------
  function openLevel(i) {
    clearTimeout(failTimer);
    loadLevel(i);
    const lv = LEVELS[i];
    $('hSpeed').style.display = '';
    openDialog({
      title: `Түвшин ${i + 1} · ${lv.name}`, rule: lv.rule,
      html: `<p>${lv.hint}</p>${lv.signs && lv.signs.length ? '<p class="tips">Энэ түвшний тэмдэг:</p>' + signRow(lv.signs) : ''}<p class="tips">◀ ▶ эргэх · ▲ хурдлах · ▼ тоормослох/ухрах</p>`,
      buttons: [{ label: 'Эхлэх', fn: startPlay }, { label: '🎛 Товч засах', ghost: true, fn: () => startCtlEdit(() => openLevel(i)) }, { label: 'Түвшнүүд', ghost: true, fn: goBack }],
    });
  }
  function startPlay() { closeDialog(); mode = 'play'; sound('tick'); }
  const retry = () => { if (endless) return beginEndless(); openLevel(li); startPlay(); };

  // ---------- «Үргэлжилсэн зам»: дүрмийн нөхцөлүүд санамсаргүй дарааллаар дараалан гарна, дэлгэц машиныг дагаж гүйлгэгдэнэ ----------
  const ENDLESS_N = 8;
  let endless = null, bannerTimer = 0;
  function showBanner(html) {
    const b = $('segBanner'); b.innerHTML = html; b.classList.add('on'); clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => b.classList.remove('on'), 3800);
  }
  function enterSegment(first) {
    const idx = endless.order[endless.k], v = first ? 0 : Math.min(P.v, 90);   // шинэ хэсэгт орохдоо хурдаа 45 км/ц хүртэл хасна
    loadLevel(idx); P.v = v; mode = 'play';
    const lv = LEVELS[idx];
    showBanner(`<span>${endless.k + 1} / ${ENDLESS_N}</span> <b>${lv.name}</b> <i>Дүрэм ${lv.rule}</i>`);
  }
  function beginEndless() {
    clearTimeout(failTimer); closeDialog(); $('hSpeed').style.display = '';
    const pool = LEVELS.map((_, i) => i).filter(i => !LEVELS[i].host);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    endless = { order: pool.slice(0, ENDLESS_N), k: 0, t0: 0 };
    enterSegment(true); sound('tick');
  }
  window.__endless = () => endless;   // шалгалтын тусламж
  function endlessNext() {
    endless.k++; sound('star');
    if (endless.k >= ENDLESS_N) {
      mode = 'win'; save.best = save.best || {}; save.best.endless = Math.max(save.best.endless || 0, ENDLESS_N); persist();
      setTimeout(() => openDialog({ cls: 'good', title: '🏁 Бүх хэсгийг давлаа!',
        html: `<div class="big-stars"><span class="on">★</span><span class="on">★</span><span class="on">★</span></div><p>${ENDLESS_N} өөр дүрмийн нөхцөлийг алдаагүй давлаа. Мундаг жолооч байна!</p>`,
        buttons: [{ label: 'Дахин', fn: beginEndless }, { label: 'Түвшнүүд', ghost: true, fn: goBack }] }), 450);
      return;
    }
    startTransition(() => enterSegment(false));
  }

  onFail = text => {
    runFails++;
    if (endless) text = `<b>Давсан хэсэг: ${endless.k} / ${ENDLESS_N}</b> · ${LEVELS[li].name}<br>` + text;
    clearTimeout(failTimer);
    failTimer = setTimeout(() => openDialog({
      cls: 'bad', title: '✖ Алдлаа', html: `<p>${text}</p>`,
      buttons: [{ label: 'Дахин оролдох', fn: retry }, { label: 'Түвшнүүд', ghost: true, fn: goBack }],
    }), 850);
  };

  onWin = () => {
    if (endless) return endlessNext();
    const lv = LEVELS[li], t = clock, id = 'd' + li;
    const earned = [true, runFails === 0, t <= lv.par];
    const stars = earned.filter(Boolean).length;
    setStars(id, stars); for (let k = 0; k < stars; k++) setTimeout(() => sound('star'), 700 + k * 200);
    const nextIdx = li + 1 < LEVELS.length ? li + 1 : -1;
    const next = nextIdx >= 0 ? () => { runFails = 0; openLevel(nextIdx); } : goBack;
    setTimeout(() => openDialog({
      cls: 'good', title: '✅ Түвшин давлаа!',
      html: `<div class="big-stars">${earned.map(e => `<span class="${e ? 'on' : ''}">★</span>`).join('')}</div>` +
        `<ul class="crit"><li class="ok">Түвшин давсан</li>` +
        `<li class="${earned[1] ? 'ok' : 'no'}">Эхний оролдлогоор (алдаагүй)</li>` +
        `<li class="${earned[2] ? 'ok' : 'no'}">Хугацаа ${t.toFixed(1)} сек (зорилт ≤ ${lv.par} сек)</li></ul>` +
        `<p>${lv.win}</p>`,
      buttons: [{ label: nextIdx >= 0 ? 'Дараагийн түвшин' : 'Түвшнүүд', fn: next },
                { label: 'Дахин', ghost: true, fn: () => { runFails = 0; openLevel(li); } },
                ...(nextIdx >= 0 ? [{ label: 'Түвшнүүд', ghost: true, fn: goBack }] : [])],
    }), 450);
  };

  // ---------- түр зогсоох ----------
  function pause() {
    if (mode !== 'play') return;
    mode = 'paused';
    const lv = LEVELS[li];
    openDialog({
      title: '⏸ Түр зогсолт', rule: lv.rule, html: `<p>${lv.hint}</p>${signRow(lv.signs)}`,
      buttons: [{ label: 'Үргэлжлүүлэх', fn: () => { closeDialog(); mode = 'play'; } },
                { label: '🎛 Товч засах', ghost: true, fn: () => startCtlEdit(() => { mode = 'play'; pause(); }) },
                { label: 'Дахин эхлэх', ghost: true, fn: () => { runFails = 0; if (endless) beginEndless(); else openLevel(li); } },
                { label: 'Түвшнүүд', ghost: true, fn: goBack }],
    });
  }

  // ---------- товчнуудын байрлал, хэмжээг өөрчлөх (утсанд): чирж зөөнө, +/− хэмжээ, хадгалагдана ----------
  const CTL = [['#stick', 'Жолоо'], ['.pedal.gas', 'Хурдлах'], ['.pedal.brake', 'Тоормос'], ['#sigL', 'Зүүн дохио'], ['#sigR', 'Баруун дохио'], ['#hCruise', 'Хурд баригч']];
  const CTL_KEY = 'zam-ctl-v1';
  let ctlSave = {}; try { ctlSave = JSON.parse(localStorage.getItem(CTL_KEY) || '{}') || {}; } catch (e) { ctlSave = {}; }
  const ctlEls = () => CTL.map(([sel, name]) => ({ sel, name, el: document.querySelector(sel) })).filter(c => c.el);
  function ctlApply() {
    for (const c of ctlEls()) {
      const v = ctlSave[c.sel] || { x: 0, y: 0, s: 1 };
      c.el.classList.add('cx'); c.el.style.setProperty('--tx', v.x + 'px'); c.el.style.setProperty('--ty', v.y + 'px'); c.el.style.setProperty('--ts', v.s);
    }
  }
  const ctlPersist = () => { try { localStorage.setItem(CTL_KEY, JSON.stringify(ctlSave)); } catch (e) {} };
  let ctlSel = null, ctlDrag = null, ctlDone = null;
  function ctlMark() { for (const c of ctlEls()) c.el.classList.toggle('csel', c.sel === ctlSel); $('ctlName').textContent = ctlSel ? (CTL.find(c => c[0] === ctlSel) || [])[1] : 'Товчийг чирж зөөнө'; }
  function startCtlEdit(done) {
    closeDialog(); ctlDone = done; ctlSel = null; ctlApply(); document.body.classList.add('editctl'); $('ctlbar').hidden = false; ctlMark();
  }
  function endCtlEdit() { document.body.classList.remove('editctl'); $('ctlbar').hidden = true; ctlSel = null; ctlMark(); ctlPersist(); const d = ctlDone; ctlDone = null; if (d) d(); }
  const ctlCur = () => (ctlSave[ctlSel] = ctlSave[ctlSel] || { x: 0, y: 0, s: 1 });
  function ctlSize(d) { if (!ctlSel) return; const v = ctlCur(); v.s = Math.max(.6, Math.min(1.9, Math.round((v.s + d) * 10) / 10)); ctlApply(); }
  document.addEventListener('pointerdown', e => {
    if (!document.body.classList.contains('editctl')) return;
    if (e.target.closest('#ctlbar')) return;
    const hit = ctlEls().find(c => c.el.contains(e.target));
    e.preventDefault(); e.stopPropagation();
    if (!hit) { ctlSel = null; ctlMark(); return; }
    ctlSel = hit.sel; ctlMark(); const v = ctlCur(); ctlDrag = { id: e.pointerId, px: e.clientX, py: e.clientY, x: v.x, y: v.y };
  }, true);
  document.addEventListener('pointermove', e => {
    if (!ctlDrag || e.pointerId !== ctlDrag.id || !ctlSel) return;
    const v = ctlCur(); v.x = Math.round(ctlDrag.x + e.clientX - ctlDrag.px); v.y = Math.round(ctlDrag.y + e.clientY - ctlDrag.py);
    v.x = Math.max(-window.innerWidth, Math.min(window.innerWidth, v.x)); v.y = Math.max(-window.innerHeight, Math.min(window.innerHeight, v.y)); ctlApply();
  }, true);
  ['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, e => { if (ctlDrag && e.pointerId === ctlDrag.id) ctlDrag = null; }, true));
  $('ctlPlus').onclick = () => ctlSize(.1); $('ctlMinus').onclick = () => ctlSize(-.1);
  $('ctlReset').onclick = () => { ctlSave = {}; ctlApply(); ctlPersist(); };
  $('ctlDone').onclick = endCtlEdit;
  ctlApply();
  $('hPause').onclick = pause;
  $('sigL').onpointerdown = e => { e.preventDefault(); toggleSignal(-1); };
  $('sigR').onpointerdown = e => { e.preventDefault(); toggleSignal(1); };
  $('hCruise').onclick = () => { cruise = !cruise; };
  $('hBack').onclick = goBack;
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  onTick = () => {
    $('hTime').textContent = clock.toFixed(1);
    const lv = LEVELS[li], lim = lv.limitNow ? lv.limitNow() : null, k = Math.round(kmh());
    const sp = $('hSpeed');
    sp.textContent = lim ? `${k} / ${lim} км/ц` : `${k} км/ц`;
    sp.classList.toggle('over', !!lim && kmh() > lim + 3);
    sp.classList.toggle('lim', !!lim);
    $('sigL').classList.toggle('on', signal < 0 && Math.floor(performance.now() / 350) % 2 === 0); $('sigR').classList.toggle('on', signal > 0 && Math.floor(performance.now() / 350) % 2 === 0);
    const cb = $('hCruise'); cb.hidden = !lv.limit; cb.classList.toggle('on', !!cruise); cb.textContent = cruise ? '🔒 Хурд баригч: АСААЛТТАЙ' : '🔓 Хурд баригч';
  };

  // ---------- шалгалт (асуулт, хариулт) ----------
  function startQuiz(it) {
    const quiz = it.make ? makeSignQuiz(10) : it.quiz;
    quizState = { item: it, quiz, qi: 0, correct: 0, answered: false };
    showScreen('quiz', true);
    renderQuestion();
  }
  function renderQuestion() {
    const s = quizState, qz = s.quiz, q = qz.questions[s.qi];
    $('qTitle').textContent = qz.name;
    $('qProg').textContent = `Асуулт ${s.qi + 1}/${qz.questions.length} · ✔ ${s.correct}`;
    $('qBar').style.width = (s.qi / qz.questions.length * 100) + '%';
    const sc = $('qSign');
    if (q.sign) { sc.style.display = ''; const c = sc.getContext('2d'); c.fillStyle = '#e9edf2'; c.fillRect(0, 0, sc.width, sc.height); SG.drawSign(c, q.sign, sc.width / 2, sc.height / 2, sc.width - 20); }
    else sc.style.display = 'none';
    $('qText').textContent = q.q;
    const box = $('qOpts'); box.innerHTML = '';
    q.opts.forEach((o, i) => {
      const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = `<i>${i + 1}</i><span>${o}</span>`;
      b.onclick = () => answer(i); box.appendChild(b);
    });
    $('qFb').innerHTML = ''; $('qNext').hidden = true; s.answered = false;
  }
  function answer(i) {
    const s = quizState; if (!s || s.answered) return;
    const q = s.quiz.questions[s.qi]; s.answered = true;
    const ok = i === q.a; if (ok) { s.correct++; sound('star'); } else sound('thud');
    [...$('qOpts').children].forEach((b, k) => { b.disabled = true; if (k === q.a) b.classList.add('right'); else if (k === i) b.classList.add('wrong'); });
    $('qFb').innerHTML = `<b class="${ok ? 'good' : 'bad'}">${ok ? '✅ Зөв!' : '✖ Буруу.'}</b> ${q.why}`;
    $('qProg').textContent = `Асуулт ${s.qi + 1}/${s.quiz.questions.length} · ✔ ${s.correct}`;
    const last = s.qi === s.quiz.questions.length - 1;
    $('qNext').textContent = last ? 'Дүн харах' : 'Дараах →'; $('qNext').hidden = false;
  }
  function nextQuestion() {
    const s = quizState; if (!s || !s.answered) return;
    if (s.qi < s.quiz.questions.length - 1) { s.qi++; renderQuestion(); return; }
    finishQuiz();
  }
  function finishQuiz() {
    const s = quizState, n = s.quiz.questions.length, pct = s.correct / n;
    const stars = pct >= 1 ? 3 : pct >= .8 ? 2 : pct >= .6 ? 1 : 0;
    setStars(s.item.id, stars);
    const pass = stars > 0;
    openDialog({
      cls: pass ? 'good' : 'bad', title: pass ? '✅ Шалгалт өгөв!' : '✖ Дахин оролд',
      html: `<div class="big-stars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>` +
        `<p style="text-align:center;font-size:20px"><b>${s.correct} / ${n}</b> зөв (${Math.round(pct * 100)}%)</p>` +
        `<p class="tips" style="text-align:center">★ 60%+ · ★★ 80%+ · ★★★ бүгд зөв</p>`,
      buttons: [{ label: 'Дахин', fn: () => { closeDialog(); startQuizAgain(); } }, { label: 'Түвшнүүд', ghost: true, fn: () => { closeDialog(); goBack(); } }],
    });
  }
  function startQuizAgain() { const it = quizState.item; quizState = { item: it, quiz: it.make ? makeSignQuiz(10) : it.quiz, qi: 0, correct: 0, answered: false }; renderQuestion(); }
  $('qNext').onclick = nextQuestion;
  $('qBack').onclick = goBack;

  // ---------- удирдлага ----------
  (() => {   // бөөрөнхий thumbstick: хуруугаа зүүн/баруун тийш чирж жолоо мушгина
    const st = $('stick'), kn = $('knob'); let id = null;
    const set = (cx, cy, e) => {
      const r = st.getBoundingClientRect(), R = r.width / 2, mx = r.left + R, my = r.top + R;
      let dx = e.clientX - mx, dy = e.clientY - my; const d = Math.hypot(dx, dy), lim = R * .6;
      if (d > lim) { dx *= lim / d; dy *= lim / d; }
      kn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      const v = dx / lim; touch.steer = Math.abs(v) < .12 ? 0 : Math.max(-1, Math.min(1, (Math.abs(v) - .12) / .88 * Math.sign(v)));
    };
    const end = () => { id = null; touch.steer = 0; kn.style.transform = ''; st.classList.remove('down'); };
    st.addEventListener('pointerdown', e => { e.preventDefault(); id = e.pointerId; st.setPointerCapture(id); st.classList.add('down'); set(0, 0, e); });
    st.addEventListener('pointermove', e => { if (e.pointerId === id) set(0, 0, e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => st.addEventListener(ev, e => { if (e.pointerId === id || ev === 'lostpointercapture') end(); }));
    st.addEventListener('contextmenu', e => e.preventDefault());
  })();
  document.querySelectorAll('.pedal').forEach(el => {
    const k = el.dataset.k;
    const on = e => { e.preventDefault(); touch[k] = true; el.classList.add('down'); try { el.setPointerCapture(e.pointerId); } catch (x) {} };
    const off = () => { touch[k] = false; el.classList.remove('down'); };
    el.addEventListener('pointerdown', on);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => el.addEventListener(ev, off));
    el.addEventListener('contextmenu', e => e.preventDefault());
  });
  window.addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(k)) e.preventDefault();
    keys[k] = true;
    if (screen === 'quiz' && $('dlg').hidden) {
      if (/^[1-4]$/.test(k)) { const b = $('qOpts').children[+k - 1]; if (b) b.click(); return; }
      if (k === 'Enter') { nextQuestion(); return; }
    }
    if (k === 'h' && screen === 'game') SFX.play('horn');
    if (screen === 'game' && !e.repeat && (k === 'q' || k === ',')) toggleSignal(-1);
    if (screen === 'game' && !e.repeat && (k === 'e' || k === '.')) toggleSignal(1);
    if (k === 'Enter' && primary) primary();
    else if (k === 'r' && screen === 'game') retry();
    else if (k === 'Escape' && screen === 'game') pause();
  });
  window.addEventListener('keyup', e => { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; for (const k in touch) touch[k] = false; });

  // ---------- хэмжээ ----------
  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const portrait = vh > vw;
    const availH = portrait ? vh - 200 : vh;           // босоо байвал доорх удирдлагад зай үлдээнэ
    const s = Math.min(vw / W, availH / H);
    const cw = Math.floor(W * s), ch = Math.floor(H * s);
    const stage = $('stage');
    stage.style.width = cw + 'px'; stage.style.height = ch + 'px';
    stage.style.alignSelf = portrait ? 'flex-start' : 'center';
    stage.style.marginTop = portrait ? '56px' : '0';
    engineResize(cw, ch);
  }
  window.addEventListener('resize', resize);

  engineInit($('cv'));
  resize();
  renderHome();

  // шалгах горим: index.html#lv5 (түвшин), #lv5go (шууд эхлэх), #quiz-duty / #quiz-speed / #quiz-signs, #map
  const boot = () => {
    const jump = location.hash.match(/#lv(\d+)(go)?/);
    if (jump) { const i = clamp(+jump[1] - 1, 0, LEVELS.length - 1); showScreen('game', true); openLevel(i); if (jump[2]) startPlay(); }
    const qj = location.hash.match(/#quiz-(duty|speed|signs)/);
    if (qj) { const it = items().find(x => x.id === 'q-' + qj[1]); if (it) startQuiz(it); }
    const lj = location.hash.match(/#l-([a-z:]+)/);
    if (lj) startLearn(lj[1]);
    const bj = location.hash.match(/#b(\d+)/);
    if (bj) { const it = items().filter(x => x.kind === 'build')[+bj[1] - 1]; if (it) { startBuild(it); if (/#b\d+(full|run)/.test(location.hash)) Builder.demo(/run/.test(location.hash)); } }
    if (/#endless/.test(location.hash)) { showScreen('game', true); beginEndless(); }
    const mj = location.hash.match(/#map/);
    if (mj) showScreen('map', true);
  };
  if (location.hash) SG.loadSvgs().then(boot); else SG.loadSvgs();   // албан ёсны тэмдгийн SVG-г эхлээд ачаална
})();
